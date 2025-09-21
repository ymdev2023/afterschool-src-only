import { QuestUIManager } from "../uiComponents/questUIManager.js";
import { gameState, globalState } from "../state/stateManagers.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    generateGaragePlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { fadeInBGM, audioManager } from "../utils.js";
import { loadGameData } from "../systems/saveSystem.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
} from "../utils.js";

import objectDialogues from "../content/objectDialogue.js";
import dialogues from "../content/Dialogue.js";
import { garageObjectDialogues, garageObjectNames, garageDialogues } from "../content/garageDialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { toggleLocale, toggleMute, initializeQuestBubbles, updateQuestBubbles } from "../utils.js";

export default async function garage(k) {
    console.log("🚗 Garage 씬 시작");

    // 세이브 데이터 자동 로드 (바로 씬에 진입한 경우)
    const currentPlayerName = globalState.getPlayerName();
    if (!currentPlayerName || currentPlayerName === "undefined") {
        console.log("🔄 플레이어 데이터가 없습니다. 최신 세이브 데이터를 로드합니다...");
        const saveData = loadGameData();
        if (saveData) {
            console.log("✅ 세이브 데이터 로드 완료:", saveData.playerName);
            // globalState 업데이트
            if (saveData.globalState) {
                globalState.setPlayerName(saveData.globalState.playerName || saveData.playerName);
                globalState.setMood(saveData.globalState.mood || 5);
                globalState.setHealth(saveData.globalState.health || 5);
                globalState.setEnergy(saveData.globalState.energy || 5);
                console.log(`📊 상태 복원 - 이름: ${globalState.getPlayerName()}, 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
            }
        } else {
            console.log("⚠️ 세이브 데이터가 없습니다. 기본값으로 초기화합니다.");
            globalState.setPlayerName("테스트 플레이어");
            globalState.setMood(5);
            globalState.setHealth(5);
            globalState.setEnergy(5);
        }
    } else {
        console.log("✅ 기존 플레이어 데이터 사용:", currentPlayerName);
    }

    // BGM 재생 (JavaScript 오디오 사용)
    console.log("🎵 Garage BGM 재생 시작");
    if (!audioManager.isBGMPlaying() || audioManager.getCurrentBGM() !== "garage-bgm") {
        audioManager.playBGM("garage-bgm", 1.0).then(() => {
            console.log("🎵 Garage BGM 재생 완료");
        }).catch((error) => {
            console.error("🎵 Garage BGM 재생 실패:", error);
        });
    } else {
        console.log("🎵 Garage BGM 이미 재생 중");
    }

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);

    // 맵 로드 (garage.json 사용, restroom.js 스타일)
    console.log("🗺️ Garage 맵 데이터 로딩 중...");
    const mapData = await fetchMapData("./assets/images/garage.json");
    const map = k.add([k.pos(0, 0)]); // restroom.js와 동일한 방식

    console.log("🎮 Garage 맵 로드 완료");

    // 엔티티 관리 객체 (restroom.js 스타일)
    const entities = {
        player: null,
        objects: [],
    };
    
    const layers = mapData.layers;

    // 모든 레이어 처리 (restroom.js 스타일)
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        console.log("🎮 플레이어 스폰포인트 발견:", object);
                        entities.player = map.add(
                            generateGaragePlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }
                }
            }
        }
        
        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    // 출입구 태그 확인
                    if (object.name === "frontExit") {
                        console.log("🚪 Front 출입구 생성:", object);
                        map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10), // 10픽셀 위로 이동
                            k.area(),
                            k.body({ isStatic: true }),
                            k.opacity(0),
                            "frontExit",
                        ]);
                    } else {
                        // 일반 경계선
                        console.log("🧱 일반 경계선 생성:", object);
                        map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10), // 10픽셀 위로 이동
                            k.area(),
                            k.body({ isStatic: true }),
                            k.opacity(0),
                            "boundary",
                        ]);
                    }
                }
            }
        }
        
        // 타일 레이어 처리 (restroom.js 스타일)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            // Infinite 맵의 chunks 처리
            for (const chunk of layer.chunks) {
                console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
                let tileIndex = 0;
                let tilesAdded = 0;
                
                for (let row = 0; row < chunk.height; row++) {
                    for (let col = 0; col < chunk.width; col++) {
                        const tile = chunk.data[tileIndex];
                        tileIndex++;

                        if (tile === 0) continue;

                        const tileX = (chunk.x + col) * mapData.tilewidth;
                        const tileY = (chunk.y + row) * mapData.tileheight;

                        // upmost 레이어는 캐릭터보다 위에 배치 (z=3), 다른 타일은 기본 (z=0)
                        let zIndex = 0;
                        if (layer.name === "upmost") {
                            zIndex = 3;
                        }

                        map.add([
                            k.sprite("garage-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                        ]);
                        tilesAdded++;
                    }
                }
                console.log(`✅ Chunk processed: ${tilesAdded} tiles added`);
            }
            continue;
        }

        // Handle regular tile layers (non-infinite maps)
        if (layer.data) {
            console.log(`🎨 Processing regular tile layer: ${layer.name}, tiles: ${layer.data.length}`);
            let nbOfDrawnTiles = 0;
            let tilesAdded = 0;
            const tilePos = k.vec2(0, 0);
            for (const tile of layer.data) {
                if (nbOfDrawnTiles % layer.width === 0) {
                    tilePos.x = 0;
                    tilePos.y += mapData.tileheight;
                } else {
                    tilePos.x += mapData.tilewidth;
                }

                nbOfDrawnTiles++;

                if (tile === 0) continue;

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), 다른 타일은 기본 (z=0)
                let zIndex = 0;
                if (layer.name === "upmost") {
                    zIndex = 3;
                }

                map.add([
                    k.sprite("garage-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                ]);
                tilesAdded++;
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 플레이어가 스폰포인트에서 생성되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log("🧑‍🎓 기본 플레이어 생성 (스폰포인트 없음)");
        entities.player = map.add(generateGaragePlayerComponents(k, k.vec2(352, 140)));
    }

    // 플레이어 설정
    const player = entities.player;
    setPlayerControls(k, player);
    player.direction = "down";
    console.log("🧑‍🎓 플레이어 설정 완료, 위치:", player.pos);
    
    // 체력 모니터링
    watchPlayerHealth(k, player);

    // 카메라 스케일 설정 (front.js와 동일)
    k.camScale(2);
    
    // 플레이어 위치로 카메라 이동
    k.camPos(player.pos);

    // UI 바 시스템 초기화 (front.js와 동일한 스타일)
    console.log("🎮 UI 바 시스템 초기화 시작");
    
    // 상태바 컨테이너 생성 (화면 왼쪽 상단)
    const statusBarContainer = k.add([
        k.pos(20, 50), // 화면 왼쪽 상단
        k.fixed(), // 카메라 이동에 영향받지 않음
        k.z(1000), // 최상위 레이어
        "statusBar"
    ]);

    console.log("📊 statusBarContainer 생성 완료");

    // Heart 아이콘 (첫 번째 줄 왼쪽)
    const heartIcon = statusBarContainer.add([
        k.sprite("ui-icon", { frame: 0 }), // 첫 번째 아이콘 (heart)
        k.pos(0, 0),
        k.scale(2.0), // 스케일 2배
        "heartIcon"
    ]);

    // Heart 바 (첫 번째 줄 오른쪽)
    const moodBar = statusBarContainer.add([
        k.sprite("ui-heart-bar", { frame: 8 - Math.floor(globalState.getMood() * 8 / 9) }), // 9등분으로 계산 조정
        k.pos(40, 0), // 아이콘 옆에 40px 간격
        k.scale(2.0), // 스케일 2배
        "moodBar"
    ]);

    // HP 아이콘 (두 번째 줄 왼쪽)
    const hpIcon = statusBarContainer.add([
        k.sprite("ui-icon", { frame: 1 }), // 두 번째 아이콘 (hp)
        k.pos(0, 35), // 첫 번째 줄 아래 35px
        k.scale(2.0), // 스케일 2배
        "hpIcon"
    ]);

    // HP 바 (두 번째 줄 오른쪽)
    const healthBar = statusBarContainer.add([
        k.sprite("ui-hp-bar", { frame: 8 - Math.floor(globalState.getHealth() * 8 / 9) }), // 9등분으로 계산 조정
        k.pos(40, 35), // 아이콘 옆에 40px 간격, 첫 번째 줄 아래 35px
        k.scale(2.0), // 스케일 2배
        "healthBar"
    ]);

    console.log("😊 Heart 바 시스템 생성 완료");
    console.log("❤️ HP 바 시스템 생성 완료");

    // 상태바 업데이트 함수
    function updateStatusBars() {
        // console.log("🔄 상태바 업데이트 시작");
        
        // 현재 상태 값 가져오기
        const currentMood = globalState.getMood();
        const currentHealth = globalState.getHealth();
        
        // console.log(`📊 현재 상태 - 기분: ${currentMood}/9, 체력: ${currentHealth}/9`);
        
        // statusBarContainer가 존재하는지 확인
        if (!statusBarContainer || statusBarContainer.exists === false) {
            console.warn("⚠️ statusBarContainer가 존재하지 않음");
            return;
        }
        
        // 기분 바 업데이트 - 직접 참조 사용
        if (moodBar && moodBar.exists !== false) {
            const newMoodFrame = Math.max(0, Math.min(8, 8 - Math.floor(currentMood * 8 / 9)));
            moodBar.frame = newMoodFrame;
            // console.log(`🌟 기분 바 업데이트: 프레임 ${newMoodFrame} (값: ${currentMood})`);
        } else {
            console.warn("⚠️ 기분 바 스프라이트를 찾을 수 없습니다.");
        }
        
        // 체력 바 업데이트 - 직접 참조 사용
        if (healthBar && healthBar.exists !== false) {
            const newHealthFrame = Math.max(0, Math.min(8, 8 - Math.floor(currentHealth * 8 / 9)));
            healthBar.frame = newHealthFrame;
            // console.log(`❤️ 체력 바 업데이트: 프레임 ${newHealthFrame} (값: ${currentHealth})`);
        } else {
            console.warn("⚠️ 체력 바 스프라이트를 찾을 수 없습니다.");
        }
        
        // console.log("✅ 상태바 업데이트 완료");
    }

    // 전역에서 접근 가능하도록 설정
    window.updateStatusBars = updateStatusBars;

    // 초기 상태바 업데이트 (세이브 데이터 로드 후)
    updateStatusBars();

    // 2초마다 상태바 업데이트
    k.loop(2, () => {
        updateStatusBars();
    });

    console.log("✅ Garage UI 바 시스템 초기화 완료");

    // 퀘스트 상태 관리
    const questState = {
        hasNewQuests: true, // 초기값은 true로 설정
        isPopupOpen: false,
    };

    // 퀘스트 아이콘 (화면 우측 상단, front.js와 동일)
    const questIcon = k.add([
        k.sprite("main-assets", {
            frame: 5771, // 기본 열린편지로 시작
        }),
        k.pos(k.width() - 120, 30), // front.js와 동일한 위치
        k.scale(2),
        k.z(1100), // z-index를 높여서 페이드 효과보다 위에
        k.area(),
        k.fixed(), // 카메라 이동에 고정
        "quest-icon",
    ]);

    // 설정 아이콘 (퀘스트 아이콘 오른쪽에, front.js와 동일)
    const settingsIcon = k.add([
        k.sprite("main-assets", {
            frame: 5772, // 설정 아이콘
        }),
        k.pos(k.width() - 60, 30), // front.js와 동일한 위치
        k.scale(2),
        k.z(1100), // z-index를 높여서 페이드 효과보다 위에
        k.area(),
        k.fixed(),
        "settings-icon",
    ]);

    // 퀘스트 아이콘 호버 효과
    questIcon.onHover(() => {
        questIcon.scale = k.vec2(2.2, 2.2);
    });

    questIcon.onHoverEnd(() => {
        questIcon.scale = k.vec2(2, 2);
    });

    // 설정 아이콘 호버 효과
    settingsIcon.onHover(() => {
        settingsIcon.scale = k.vec2(2.2, 2.2);
    });

    settingsIcon.onHoverEnd(() => {
        settingsIcon.scale = k.vec2(2, 2);
    });

    // 퀘스트 팝업 변수들
    let questPopup = null;
    let settingsPopup = null;
    const settingsState = { isPopupOpen: false };

    // 퀘스트 팝업 열기 함수 (front.js와 동일)
    function openQuestPopup() {
        console.log("[DEBUG] openQuestPopup 함수 시작 - 현재 상태:", questState.isPopupOpen);
        if (questState.isPopupOpen) {
            console.log("[DEBUG] 이미 퀘스트 팝업이 열려있음, 함수 종료");
            return;
        }

        console.log("[DEBUG] 퀘스트 팝업 상태를 true로 변경");
        questState.isPopupOpen = true;

        // 퀘스트 창 개선된 디자인 적용
        const panelWidth = k.width() * 0.8;
        const panelHeight = k.height() * 0.7;
        const panelX = k.width() * 0.1;
        const panelY = k.height() * 0.15;
        
        // 파스텔 블루 테마로 패널 생성 - 헤더 높이 절반으로
        const panel = createPanelWithHeader(k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30, // 기본 60에서 30으로 절반
            colors: UI_THEMES.PASTEL_BLUE,
            zIndex: 150,
            tag: "quest-popup",
            fixed: true
        });

        questPopup = panel.mainBg; // 호환성을 위해 유지

        // 팝업 제목 (헤더 영역에 배치) - 크기 증가
        const title = k.add([
            k.text("오늘의 할일", {
                size: 20, // 16에서 20으로 증가
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2), // 여백 조정
            k.color(80, 80, 80), // 파스텔 테마에 맞는 진한 회색
            k.anchor("left"),
            k.z(152),
            k.fixed(),
            "quest-popup-element",
        ]);

        // X 버튼 생성 (퀘스트 팝업용) - 수동으로 그룹화하여 확실한 삭제 보장
        const questCloseButtonBg = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.color(120, 140, 180),
            k.z(161),
            k.fixed(),
            "quest-popup-element",
        ]);

        const questCloseButtonText = k.add([
            k.text("✕", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + panel.headerArea.width - 16, panel.headerArea.y + 17),
            k.color(255, 255, 255),
            k.anchor("center"),
            k.z(162),
            k.fixed(),
            "quest-popup-element",
        ]);

        const questCloseButtonArea = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.area(),
            k.opacity(0),
            k.z(163),
            k.fixed(),
            "quest-popup-element",
        ]);

        // X 버튼 이벤트 핸들러
        questCloseButtonArea.onHover(() => {
            questCloseButtonBg.color = k.rgb(140, 160, 200);
        });

        questCloseButtonArea.onHoverEnd(() => {
            questCloseButtonBg.color = k.rgb(120, 140, 180);
        });

        questCloseButtonArea.onClick(() => {
            console.log("[DEBUG] 퀘스트 X 버튼 클릭됨");
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.4 });
            }
            closeQuestPopup();
        });

        // 퀘스트 항목들을 체크박스 형태로 렌더링
        const questItemElements = [];
        const currentQuestItems = window.questItems || [
            { title: "친구들과 대화하기", completed: false },
            { title: "학교 시설 둘러보기", completed: false },
            { title: "쉬는 시간 즐기기", completed: false }
        ];
        
        currentQuestItems.forEach((item, index) => {
            const yPos = panel.contentArea.y + 30 + (index * 50); // 첫 번째 퀘스트와 제목 간격 +30px 추가
            
            // 체크박스
            const checkbox = k.add([
                k.rect(16, 16),
                k.pos(panel.contentArea.x, yPos),
                k.color(item.completed ? [126, 155, 204] : [200, 200, 200]), // 완료시 파스텔 블루
                k.outline(2, k.rgb(80, 80, 80)),
                k.z(152),
                k.fixed(),
                "quest-popup-element",
            ]);
            
            // 체크 표시 (완료된 경우)
            if (item.completed) {
                const checkMark = k.add([
                    k.text("✓", {
                        size: 14, // 12에서 14로 증가
                        font: "galmuri",
                    }),
                    k.pos(panel.contentArea.x + 8, yPos + 8),
                    k.color(255, 255, 255),
                    k.anchor("center"),
                    k.z(153),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            }
            
            // 퀘스트 제목 (완료시 취소선)
            const questTitle = k.add([
                k.text(item.title, {
                    size: 18, // 16에서 18로 증가
                    font: "galmuri",
                }),
                k.pos(panel.contentArea.x + 24, yPos + 8),
                k.color(item.completed ? [150, 150, 150] : [80, 80, 80]), // 완료시 회색
                k.anchor("left"),
                k.z(152),
                k.fixed(),
                "quest-popup-element",
            ]);
            
            // 완료된 퀘스트에 취소선 추가
            if (item.completed) {
                const strikethrough = k.add([
                    k.rect(questTitle.width, 2),
                    k.pos(panel.contentArea.x + 24, yPos + 8 + 9), // 텍스트 중앙에
                    k.color(150, 150, 150),
                    k.z(153),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            }
            
            questItemElements.push({ checkbox, questTitle, item, index });
        });

        // 체크박스 클릭 이벤트 (완료 상태 토글)
        questItemElements.forEach((element, index) => {
            const yPos = panel.contentArea.y + 30 + (index * 50); // 간격 조정과 동일하게
            
            // 체크박스 클릭 영역
            const checkboxClickArea = k.add([
                k.rect(20, 20),
                k.pos(panel.contentArea.x - 2, yPos - 2),
                k.area(),
                k.opacity(0),
                k.z(154),
                k.fixed(),
                "quest-checkbox-clickable",
                "quest-popup-element",
            ]);
            
            // 체크박스 클릭 (완료 상태 토글)
            checkboxClickArea.onClick(() => {
                console.log(`[DEBUG] 퀘스트 체크박스 클릭: ${element.item.title}`);
                if (!gameState.getIsMuted()) {
                    k.play("boop-sfx", { volume: 0.4 });
                }
                // 퀘스트 완료 상태 토글
                element.item.completed = !element.item.completed;
                
                // 체크박스 색상 업데이트
                element.checkbox.color = element.item.completed ? k.rgb(126, 155, 204) : k.rgb(200, 200, 200);
                
                // 퀘스트 제목 색상 업데이트
                element.questTitle.color = element.item.completed ? k.rgb(150, 150, 150) : k.rgb(80, 80, 80);
                
                // 체크 표시와 취소선 업데이트를 위해 팝업을 새로고침
                closeQuestPopup();
                setTimeout(() => openQuestPopup(), 100);
            });
        });
    }

    // 퀘스트 팝업 닫기 함수 (front.js와 동일)
    function closeQuestPopup() {
        console.log("[DEBUG] closeQuestPopup 함수 시작 - 현재 상태:", questState.isPopupOpen);
        if (!questState.isPopupOpen) {
            console.log("[DEBUG] 퀘스트 팝업이 이미 닫혀있음, 함수 종료");
            return;
        }

        console.log("[DEBUG] 퀘스트 팝업 상태를 false로 변경");
        questState.isPopupOpen = false;

        // 태그된 요소들을 안전하게 삭제
        try {
            const questElements = k.get("quest-popup-element");
            console.log(`[DEBUG] 삭제할 퀘스트 요소 개수: ${questElements.length}`);
            questElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            
            const questClickables = k.get("quest-checkbox-clickable");
            console.log(`[DEBUG] 삭제할 클릭 가능한 요소 개수: ${questClickables.length}`);
            questClickables.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        } catch (error) {
            console.error("[ERROR] 퀘스트 팝업 삭제 중 오류:", error);
        }

        questPopup = null;
        console.log("[DEBUG] 퀘스트 팝업 닫기 완료");
    }

    // 설정 팝업 열기 함수 (front.js와 동일)
    function openSettingsPopup() {
        try {
            // 사운드 효과
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.6 });
            }
        } catch (error) {
            console.warn("[DEBUG] 사운드 재생 실패:", error);
        }

        settingsState.isPopupOpen = true;

        const panelWidth = k.width() * 0.7;
        const panelHeight = k.height() * 0.6;
        const panelX = (k.width() - panelWidth) / 2;
        const panelY = (k.height() - panelHeight) / 2;

        // 설정 패널 생성
        const panel = createPanelWithHeader(k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30,
            colors: UI_THEMES.PASTEL_PURPLE,
            zIndex: 160,
            tag: "settings-popup",
            fixed: true
        });

        settingsPopup = panel.mainBg;

        // 설정 제목
        const title = k.add([
            k.text("게임 설정", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        // X 버튼 생성
        const settingsCloseButtonBg = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.color(75, 0, 130),
            k.z(171),
            k.fixed(),
            "settings-popup-element",
        ]);

        const settingsCloseButtonText = k.add([
            k.text("✕", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + panel.headerArea.width - 16, panel.headerArea.y + 17),
            k.color(255, 255, 255),
            k.anchor("center"),
            k.z(172),
            k.fixed(),
            "settings-popup-element",
        ]);

        const settingsCloseButtonArea = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.area(),
            k.opacity(0),
            k.z(173),
            k.fixed(),
            "settings-popup-element",
        ]);

        // X 버튼 이벤트 핸들러
        settingsCloseButtonArea.onHover(() => {
            settingsCloseButtonBg.color = k.rgb(95, 20, 150);
        });

        settingsCloseButtonArea.onHoverEnd(() => {
            settingsCloseButtonBg.color = k.rgb(75, 0, 130);
        });

        settingsCloseButtonArea.onClick(() => {
            console.log("[DEBUG] 설정 X 버튼 클릭됨");
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.4 });
            }
            closeSettingsPopup();
        });

        // 설정 항목들
        const settingY = panel.contentArea.y + 20;
        const itemSpacing = 50;

        // 음소거 설정
        const muteLabel = k.add([
            k.text("음소거", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + 20, settingY),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const muteToggle = k.add([
            k.rect(60, 30),
            k.pos(panel.contentArea.x + panel.contentArea.width - 80, settingY - 5),
            k.color(gameState.getIsMuted() ? [200, 100, 100] : [100, 200, 100]),
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const muteText = k.add([
            k.text(gameState.getIsMuted() ? "OFF" : "ON", {
                size: 14,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 50, settingY + 10),
            k.color(255, 255, 255),
            k.anchor("center"),
            k.z(163),
            k.fixed(),
            "settings-popup-element",
        ]);

        muteToggle.onClick(() => {
            const newMuted = !gameState.getIsMuted();
            gameState.setIsMuted(newMuted);
            
            // 실제 오디오 볼륨 조절
            if (newMuted) {
                k.volume(0); // 음소거
            } else {
                k.volume(gameState.getBgmVolume() || 1.0); // 이전 볼륨으로 복원
            }
            
            muteToggle.color = newMuted ? k.rgb(200, 100, 100) : k.rgb(100, 200, 100);
            muteText.text = newMuted ? "OFF" : "ON";
            
            // 음소거가 아닐 때만 효과음 재생
            if (!newMuted) {
                k.play("boop-sfx", { volume: 0.3 });
            }
            
            console.log(`[DEBUG] 음소거 상태 변경: ${newMuted ? "ON" : "OFF"}`);
        });

        // 언어 설정
        const langLabel = k.add([
            k.text("언어", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + 20, settingY + itemSpacing),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const langToggle = k.add([
            k.rect(80, 30),
            k.pos(panel.contentArea.x + panel.contentArea.width - 100, settingY + itemSpacing - 5),
            k.color(175, 126, 204), // 파스텔 퍼플
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const langText = k.add([
            k.text(gameState.getLocale() === "korean" ? "한국어" : "English", {
                size: 14,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 60, settingY + itemSpacing + 10),
            k.color(255, 255, 255),
            k.anchor("center"),
            k.z(163),
            k.fixed(),
            "settings-popup-element",
        ]);

        langToggle.onClick(() => {
            const currentLocale = gameState.getLocale();
            const newLocale = currentLocale === "korean" ? "english" : "korean";
            
            console.log(`[DEBUG] 언어 변경: ${currentLocale} -> ${newLocale}`);
            gameState.setLocale(newLocale);
            langText.text = newLocale === "korean" ? "한국어" : "English";
            
            // 언어 변경 시 설정창의 텍스트들도 업데이트
            title.text = newLocale === "korean" ? "게임 설정" : "Game Settings";
            muteLabel.text = newLocale === "korean" ? "음소거" : "Mute";
            langLabel.text = newLocale === "korean" ? "언어" : "Language";
            volumeLabel.text = newLocale === "korean" ? "볼륨" : "Volume";
            mainMenuText.text = newLocale === "korean" ? "메인화면으로" : "Main Menu";
            creditText.text = newLocale === "korean" ? "크레딧" : "Credits";
            
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.3 });
            }
        });

        // 볼륨 조절 설정
        const volumeLabel = k.add([
            k.text("볼륨", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + 20, settingY + itemSpacing * 2),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        // 볼륨 슬라이더 배경
        const volumeSliderBg = k.add([
            k.rect(120, 12),
            k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 + 4),
            k.color(200, 200, 200),
            k.outline(2, k.rgb(120, 120, 120)),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        // 볼륨 슬라이더 바
        const currentVolume = gameState.getBgmVolume() || 1.0;
        const volumeSliderBar = k.add([
            k.rect(120 * currentVolume, 12),
            k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 + 4),
            k.color(175, 126, 204),
            k.z(163),
            k.fixed(),
            "settings-popup-element",
        ]);

        // 볼륨 텍스트
        const volumeText = k.add([
            k.text(`${Math.round(currentVolume * 100)}%`, {
                size: 14,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 80, settingY + itemSpacing * 2 + 10),
            k.color(80, 80, 80),
            k.anchor("center"),
            k.z(164),
            k.fixed(),
            "settings-popup-element",
        ]);

        // 볼륨 조절 클릭 영역
        const volumeClickArea = k.add([
            k.rect(120, 24),
            k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 - 6),
            k.area(),
            k.opacity(0),
            k.z(164),
            k.fixed(),
            "settings-popup-element",
        ]);

        volumeClickArea.onClick(() => {
            const mouseX = k.mousePos().x;
            const clickX = mouseX - volumeClickArea.pos.x;
            const newVolume = Math.max(0, Math.min(1, clickX / 120));
            
            gameState.setBgmVolume(newVolume);
            if (!gameState.getIsMuted()) {
                k.volume(newVolume);
            }
            
            volumeSliderBar.width = 120 * newVolume;
            volumeText.text = `${Math.round(newVolume * 100)}%`;
            
            console.log(`[DEBUG] 볼륨 변경: ${Math.round(newVolume * 100)}%`);
            
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: newVolume * 0.3 });
            }
        });

        // 메인화면으로 나가기 버튼
        const mainMenuButton = k.add([
            k.rect(120, 35),
            k.pos(panel.contentArea.x + panel.contentArea.width - 250, panel.contentArea.y + panel.contentArea.height - 60),
            k.color(255, 180, 180),
            k.outline(2, k.rgb(220, 120, 120)),
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const mainMenuText = k.add([
            k.text("메인화면으로", {
                size: 16,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 190, panel.contentArea.y + panel.contentArea.height - 42),
            k.color(120, 60, 60),
            k.anchor("center"),
            k.z(163),
            k.fixed(),
            "settings-popup-element",
        ]);

        mainMenuButton.onClick(() => {
            console.log("[DEBUG] 메인화면으로 이동");
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.5 });
            }
            closeSettingsPopup();
            k.go("title");
        });

        mainMenuButton.onHover(() => {
            mainMenuButton.color = k.rgb(255, 200, 200);
        });

        mainMenuButton.onHoverEnd(() => {
            mainMenuButton.color = k.rgb(255, 180, 180);
        });

        // 크레딧 버튼
        const creditButton = k.add([
            k.rect(120, 35),
            k.pos(panel.contentArea.x + panel.contentArea.width - 120, panel.contentArea.y + panel.contentArea.height - 60),
            k.color(180, 255, 180),
            k.outline(2, k.rgb(120, 220, 120)),
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const creditText = k.add([
            k.text("크레딧", {
                size: 16,
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 60, panel.contentArea.y + panel.contentArea.height - 42),
            k.color(60, 120, 60),
            k.anchor("center"),
            k.z(163),
            k.fixed(),
            "settings-popup-element",
        ]);

        creditButton.onClick(() => {
            console.log("[DEBUG] 크레딧으로 이동");
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.5 });
            }
            gameState.setPreviousScene("garage");
            closeSettingsPopup();
            k.go("credits");
        });

        creditButton.onHover(() => {
            creditButton.color = k.rgb(200, 255, 200);
        });

        creditButton.onHoverEnd(() => {
            creditButton.color = k.rgb(180, 255, 180);
        });
    }

    // 설정 팝업 닫기 함수 (front.js와 동일)
    function closeSettingsPopup() {
        if (!settingsState.isPopupOpen) return;

        console.log("[DEBUG] 설정 팝업 닫기 시작");
        settingsState.isPopupOpen = false;

        try {
            // 모든 설정 팝업 요소 제거
            k.destroyAll("settings-popup");
            k.destroyAll("settings-popup-element");
            
            settingsPopup = null;
            
            console.log("[DEBUG] 설정 팝업 요소 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 설정 팝업 정리 중 오류:", error);
        }
    }    // 설정 팝업 닫기 함수
    function closeSettingsPopup() {
        if (!settingsPopup) return;

        console.log("⚙️ 설정 팝업 닫기");
        k.get("settings-popup").forEach(obj => obj.destroy());
        settingsPopup = null;
    }

    // 퀘스트 UI 클릭 이벤트 - front.js와 동일
    questIcon.onClick(() => {
        console.log("📋 퀘스트 아이콘 클릭됨");
        if (!gameState.getIsMuted()) {
            k.play("boop-sfx", { volume: 0.6 });
        }
        openQuestPopup();
    });

    // 설정 UI 클릭 이벤트 - front.js와 동일
    settingsIcon.onClick(() => {
        console.log("⚙️ 설정 아이콘 클릭됨");
        if (!gameState.getIsMuted()) {
            k.play("boop-sfx", { volume: 0.6 });
        }
        openSettingsPopup();
    // 설정 UI 클릭 이벤트 - front.js와 동일
    settingsIcon.onClick(() => {
        console.log("⚙️ 설정 아이콘 클릭됨");
        if (!gameState.getIsMuted()) {
            k.play("boop-sfx", { volume: 0.6 });
        }
        openSettingsPopup();
    });

    // ESC 키로 팝업 닫기
    k.onKeyPress("escape", () => {
        if (settingsState.isPopupOpen) {
            closeSettingsPopup();
        }
        if (questState.isPopupOpen) {
            closeQuestPopup();
        }
    });

    // 다른 대화 요소들
    const localeKey = gameState.getLocale() ?? "korean";
    const currentDialogues = dialogues[localeKey] ?? dialogues.korean;

    // 객체 태그들
    const objTags = ["oven", "sink", "window", "drawer", "floor"];

    objTags.forEach((tag) => {
        k.get(tag).forEach((obj) => {
            obj.onCollide("player", () => {
                player.isInDialog = true;
                
                const content = objectDialogues[localeKey]?.[tag] || [
                    { text: `This is ${tag}.`, speaker: "Object" }
                ];

                dialog.displayDialog(
                    k,
                    content,
                    tag.charAt(0).toUpperCase() + tag.slice(1),
                    () => {
                        player.isInDialog = false;
                    }
                );
            });

            obj.onCollideEnd("player", () => {
                player.isInDialog = false;
            });
        });
    });

    // 출입구 설정
    k.onCollide("player", "frontExit", (player, exit) => {
        console.log("🚪 출입구 충돌 감지:", exit.tags);
        console.log("🏠 front.js로 이동");
        k.go("front", "garage"); // previousScene 정보 전달
    });

    // garage.json에서 문 오브젝트 찾기
    if (mapData.layers) {
        mapData.layers.forEach((layer) => {
            if (layer.objects) {
                layer.objects.forEach((obj) => {
                    if (obj.name === "front") {
                        console.log("🚪 front 출입구 발견:", obj);
                        
                        const garageDoorEntity = map.add([
                            k.area({
                                shape: new k.Rect(k.vec2(0), obj.width, obj.height),
                            }),
                            k.pos(obj.x, obj.y),
                            k.body({ isStatic: true }),
                            "frontExit",
                        ]);
                        
                        console.log("✅ front 출입구 엔티티 생성 완료");
                    }
                });
            }
        });
    }

    // 유틸리티 단축키 설정
    setupMainMenuShortcut(k);

    // shell 오브젝트 추가 - 우하단 구석에 상호작용 가능한 shell 스프라이트
    console.log("🐚 Shell 오브젝트 생성 중...");
    const shell = map.add([
        k.sprite("garage-assets", { 
            frame: 1118 // shell 프레임 (가정)
        }),
        k.area({
            shape: new k.Rect(k.vec2(0), 32, 32), // 32x32 상호작용 영역
        }),
        k.pos(360, 180), // 우하단 구석 위치 (맵에 맞게 조정)
        k.scale(1.5), // 크기 1.5배
        k.z(50), // z-index 50으로 설정하여 플레이어보다 뒤에
        "shell",
    ]);
    
    console.log("✅ Shell 오브젝트 생성 완료, 위치:", shell.pos);

    // shell과 플레이어 상호작용
    shell.onCollide("player", (player) => {
        console.log("🐚 Shell과 플레이어 충돌");
        gameState.setInteractableObject("shell");
        player.isInDialog = true;

        // garageDialogue.js에서 shell 대화 내용 가져오기
        const locale = gameState.getLocale();
        const content = garageDialogues[locale]?.shell || [
            { text: "This is a mysterious shell...", speaker: "Shell" },
        ];
        const speakerName = garageObjectNames[locale]?.shell || "Shell";

        dialog.displayDialog(
            k,
            content,
            speakerName,
            () => {
                player.isInDialog = false;
                gameState.clearInteractableObject();
            }
        );
    });

    shell.onCollideEnd("player", (player) => {
        gameState.clearInteractableObject();
    });

    // student22 NPC 추가
    console.log("👩‍🎓 Student22 NPC 생성 중...");
    const student22 = map.add([
        k.sprite("player", { frame: 0 }), // 기본 학생 스프라이트 사용
        k.area({
            shape: new k.Rect(k.vec2(0), 32, 32),
        }),
        k.pos(150, 120), // 차고 내부 적절한 위치
        k.scale(1.5),
        k.z(10),
        "student22",
    ]);

    console.log("✅ Student22 NPC 생성 완료, 위치:", student22.pos);

    // student22와 플레이어 상호작용
    student22.onCollide("player", (player) => {
        console.log("👩‍🎓 Student22와 플레이어 충돌");
        gameState.setInteractableObject("student22");
        player.isInDialog = true;

        // garageDialogue.js에서 student22 대화 내용 가져오기
        const locale = gameState.getLocale();
        const content = garageDialogues[locale]?.student22 || [
            { text: "Hi there!", speaker: "Student22" },
        ];
        const speakerName = garageObjectNames[locale]?.student22 || "Student";

        // 배열을 올바른 형식으로 변환
        const dialogContent = content.map(text => ({ text, speaker: speakerName }));

        dialog.displayDialog(
            k,
            dialogContent,
            speakerName,
            () => {
                player.isInDialog = false;
                gameState.clearInteractableObject();
            }
        );
    });

    student22.onCollideEnd("player", (player) => {
        gameState.clearInteractableObject();
    });

    // UI 매니저 추가 (설정 창 등을 위해)
    createUIManager(k, gameState);

    // ==============================
    // 상태 변화 알림 시스템 (front.js와 동일)
    // ==============================
    window.showStatusChangeMessage = (message, statusType, changeType) => {
        console.log("📋 상태 변화 알림 요청:", message, `(${statusType}, ${changeType})`);
        
        if (window.notificationManager) {
            window.notificationManager.addNotification({
                type: 'status',
                message: message,
                statusType: statusType,
                changeType: changeType
            });
        }
    };

    // 메인 메뉴 단축키 설정
    setupMainMenuShortcut(k);

    console.log("✅ Garage 씬 로드 완료");
}