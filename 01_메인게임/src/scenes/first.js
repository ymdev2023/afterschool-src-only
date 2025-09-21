import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import { gameState, globalState } from "../state/stateManagers.js";
import { audioManager } from "../utils.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
} from "../utils.js";

import noteDialogues from "../content/temp/noteDialogue.js";
import objectDialogues from "../content/objectDialogue.js";
import firstDialogues from "../content/dialogue/firstDialogue.js";
import { getStudentSpriteConfig } from "../scene-assets/firstAssets.js";
import { dialog, choiceDialog } from "../uiComponents/dialog.js";
import { initializeQuestBubbles, updateQuestBubbles } from "../utils.js";

// 퀘스트 UI 시스템
function setupQuestUI(k, gameState) {
    // 퀘스트 상태 관리
    const questState = {
        hasNewQuests: true, // 새로운 퀘스트가 있는지 여부
        isPopupOpen: false,
    };

    // 퀘스트 아이콘 (화면 우측 상단)
    const questIcon = k.add([
        k.sprite("first-assets", {
            frame: questState.hasNewQuests ? 51 : 50, // 열린편지 : 닫힌편지 (안전한 인덱스)
        }),
        k.pos(k.width() - 60, 20), // 화면 우측 상단
        k.scale(2),
        k.z(100),
        k.area(),
        k.fixed(), // 카메라 이동에 고정
        "quest-icon",
    ]);

    // 퀘스트 팝업 배경
    let questPopup = null;
    let questPopupContent = null;
    let closeButton = null;

    // 퀘스트 아이콘 클릭 이벤트
    questIcon.onClick(() => {
        if (questState.isPopupOpen) {
            closeQuestPopup();
        } else {
            openQuestPopup();
        }
    });

    // 퀘스트 팝업 열기
    function openQuestPopup() {
        if (questState.isPopupOpen) return;

        questState.isPopupOpen = true;

        // 팝업 배경
        questPopup = k.add([
            k.rect(k.width() * 0.8, k.height() * 0.7),
            k.pos(k.width() * 0.1, k.height() * 0.15),
            k.color(20, 20, 40),
            k.outline(4, k.Color.WHITE),
            k.z(150),
            k.fixed(),
            "quest-popup",
            "quest-popup-element", // 태그 추가
        ]);

        // 팝업 제목
        const title = k.add([
            k.text("오늘의 할일", {
                size: 32,
                font: "galmuri",
            }),
            k.pos(k.width() * 0.15, k.height() * 0.2),
            k.color(255, 255, 255),
            k.z(151),
            k.fixed(),
            "quest-popup-element", // 태그 추가
        ]);

        // 토글 가능한 퀘스트 항목들
        const questItems = [
            {
                title: "• 1층 탐험하기",
                details: ["  - 교실들 둘러보기", "  - 2층으로 가는 계단 찾기"],
                expanded: false
            },
            {
                title: "• 학생들과 대화하기", 
                details: ["  - 1층 학생들과 인사", "  - 메인 입구 확인하기"],
                expanded: false
            }
        ];

        let questContentText = "";
        questItems.forEach(item => {
            questContentText += item.title + "\n";
            if (item.expanded) {
                item.details.forEach(detail => {
                    questContentText += detail + "\n";
                });
            }
        });

        // 팝업 내용 (토글 가능)
        questPopupContent = k.add([
            k.text(questContentText, {
                size: 20,
                font: "galmuri",
                width: k.width() * 0.7,
            }),
            k.pos(k.width() * 0.15, k.height() * 0.3),
            k.color(200, 200, 200),
            k.z(151),
            k.fixed(),
            "quest-popup-element", // 태그 추가
        ]);

        // 퀘스트 항목 클릭 이벤트 (토글 기능)
        let clickables = [];
        questItems.forEach((item, index) => {
            const yPos = k.height() * 0.3 + (index * 60); // 각 항목의 Y 위치
            const clickArea = k.add([
                k.rect(k.width() * 0.7, 30),
                k.pos(k.width() * 0.15, yPos),
                k.area(),
                k.opacity(0), // 투명한 클릭 영역
                k.z(152),
                k.fixed(),
                "quest-item-clickable",
                "quest-popup-element",
                { itemIndex: index }
            ]);

            clickArea.onClick(() => {
                // 토글 상태 변경
                questItems[index].expanded = !questItems[index].expanded;
                
                // 텍스트 업데이트
                let updatedText = "";
                questItems.forEach(item => {
                    updatedText += item.title + "\n";
                    if (item.expanded) {
                        item.details.forEach(detail => {
                            updatedText += detail + "\n";
                        });
                    }
                });
                
                // 기존 텍스트 제거하고 새로운 텍스트 생성
                if (questPopupContent && questPopupContent.exists()) {
                    questPopupContent.destroy();
                }
                
                questPopupContent = k.add([
                    k.text(updatedText, {
                        size: 20,
                        font: "galmuri",
                        width: k.width() * 0.7,
                    }),
                    k.pos(k.width() * 0.15, k.height() * 0.3),
                    k.color(200, 200, 200),
                    k.z(151),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            });

            clickables.push(clickArea);
        });

        // 닫기 버튼 (새로운 컴포넌트 사용)
        const closeButtonComponent = createCloseButton(k, {
            x: k.width() * 0.8 + 40, // 중앙 정렬을 위해 조정
            y: k.height() * 0.75 + 20,
            size: 40,
            colors: {
                bg: [120, 140, 180],
                bgHover: [140, 160, 200],
                border: [100, 120, 160],
                text: [255, 255, 255]
            },
            zIndex: 153,
            tag: "quest-popup-element",
            fixed: true,
            onClick: () => {
                closeQuestPopup();
            }
        });
        
        closeButton = closeButtonComponent.clickArea; // 호환성을 위해 유지

        // 퀘스트를 확인했으므로 아이콘을 닫힌편지로 변경
        if (questState.hasNewQuests) {
            questState.hasNewQuests = false;
            questIcon.frame = 50; // 닫힌편지
        }
    }

    // 퀘스트 팝업 닫기
    function closeQuestPopup() {
        if (!questState.isPopupOpen) return;

        questState.isPopupOpen = false;

        // 퀘스트 팝업 관련 모든 요소 제거
        k.get("quest-popup-element").forEach(obj => {
            if (obj.exists()) {
                obj.destroy();
            }
        });
        
        // 추가 안전장치: 각 변수들 직접 제거
        if (questPopup && questPopup.exists()) {
            questPopup.destroy();
            questPopup = null;
        }
        
        if (questPopupContent && questPopupContent.exists()) {
            questPopupContent.destroy();
            questPopupContent = null;
        }
        
        if (closeButton && closeButton.exists()) {
            closeButton.destroy();
            closeButton = null;
        }
    }

    // ESC 키로 팝업 닫기
    k.onKeyPress("escape", () => {
        if (questState.isPopupOpen) {
            closeQuestPopup();
        }
    });

    // 화면 크기 변경 시 아이콘 위치 업데이트
    k.onResize(() => {
        questIcon.pos = k.vec2(k.width() - 60, 20);
    });

    // 새로운 퀘스트 추가 함수 (나중에 사용할 수 있도록)
    return {
        addNewQuest: () => {
            questState.hasNewQuests = true;
            questIcon.frame = 51; // 열린편지
        },
        markQuestsAsRead: () => {
            questState.hasNewQuests = false;
            questIcon.frame = 50; // 닫힌편지
        }
    };
}

export default async function first(k) {
    console.log("🏫 first scene 시작");
    console.log(`🔍 First 씬 진입 시 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 First BGM으로 즉시 전환");
    audioManager.switchBGM("first-bgm", 1.0);

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/first.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
        npcs: [],
        boundaries: [],
        notes: [],
        objects: [], // door_mae 등의 특별한 오브젝트들
    };
    
    const layers = mapData.layers;

    // 모든 레이어 처리
    for (const layer of layers) {
        console.log(`🗺️ 처리 중인 레이어: ${layer.name}, 타입: ${layer.type}, 오브젝트 수: ${layer.objects?.length || 0}`);
        
        // 모든 레이어에서 문 관련 오브젝트 찾기
        if (layer.objects && layer.objects.length > 0) {
            layer.objects.forEach(obj => {
                // 모든 오브젝트 이름 출력
                if (obj.name) {
                    console.log(`🔍 오브젝트: ${obj.name} (레이어: ${layer.name})`);
                }
                
                // door_restroom 특별 체크
                if (obj.name === "door_restroom") {
                    console.log(`🎯 FOUND door_restroom in layer: ${layer.name}!`);
                }
                
                if (obj.name && (obj.name.includes('door') || obj.name.includes('wc') || obj.name.includes('restroom') || obj.name.includes('toilet'))) {
                    console.log(`🚪 문 관련 오브젝트 발견: ${obj.name} (레이어: ${layer.name})`);
                }
            });
        }
        
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                // 플레이어 스폰포인트 우선순위 처리 (previousScene 기반)
                const playerSpawns = layer.objects.filter(obj => obj.name && obj.name.includes("player"));
                console.log("🎯 플레이어 스폰포인트들:", playerSpawns.map(s => s.name));
                console.log("📍 현재 previousScene:", previousScene);
                
                // previousScene에 따른 스폰포인트 우선순위 결정
                let selectedSpawn = null;
                
                if (previousScene === "intro") {
                    // intro에서 온 경우 기본 player 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player");
                    console.log("🎬 인트로에서 진입 - player 스폰 사용");
                } else if (previousScene === "front") {
                    // front에서 온 경우 player_front_return 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_front_return") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("🚪 정문에서 진입 - player_front_return 스폰 사용");
                } else if (previousScene === "second") {
                    // second에서 온 경우 player_second 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_second") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("⬇️ 2층에서 진입 - player_second 스폰 사용");
                } else if (previousScene === "restroom") {
                    // restroom에서 온 경우 player_restroom 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_restroom") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("🚻 화장실에서 진입 - player_restroom 스폰 사용");
                } else if (previousScene === "restaurant") {
                    // restaurant에서 온 경우 player_food 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_food") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("🍽️ 급식실에서 진입 - player_food 스폰 사용");
                } else if (previousScene === "garage") {
                    // garage에서 온 경우 player_garage 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_garage") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("🚗 차고에서 진입 - player_garage 스폰 사용");
                } else {
                    // 기본 경우 (previousScene이 없거나 다른 경우)
                    selectedSpawn = layer.objects.find(obj => obj.name === "player");
                    console.log("🎮 기본 진입 - player 스폰 사용");
                }
                
                if (selectedSpawn && !entities.player) {
                    console.log(`🎯 선택된 스폰포인트: ${selectedSpawn.name} at (${selectedSpawn.x}, ${selectedSpawn.y})`);
                    
                    entities.player = map.add(
                        generateFirstPlayerComponents(k, k.vec2(selectedSpawn.x, selectedSpawn.y))
                    );
                    console.log(`✅ 플레이어 생성 성공: ${selectedSpawn.name} (${selectedSpawn.x}, ${selectedSpawn.y})`);
                } else if (!entities.player) {
                    console.warn("⚠️ 적절한 스폰포인트를 찾을 수 없음 - 기본 위치 사용");

                    const fallbackSpawn = layer.objects.find(obj => obj.name && obj.name.includes("player"));
                    if (fallbackSpawn) {
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(fallbackSpawn.x, fallbackSpawn.y))
                        );
                        console.log(`🔄 백업 스폰 사용: ${fallbackSpawn.name}`);
                    }
                }
                
                // 다른 오브젝트 처리
                for (const object of layer.objects) {
                    // Student NPC 처리
                    if (object.name.startsWith("student")) {
                        const studentType = object.name;
                        
                        // firstAssets.js에서 sprite config 가져오기
                        const spriteConfig = getStudentSpriteConfig(studentType);
                        
                        const student = map.add([
                            k.sprite("first-assets", spriteConfig),
                            k.area({
                                shape: new k.Rect(k.vec2(0, -10), 16, 24), // 콜라이더 Y 오프셋을 -10으로 조정
                            }),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 10px 위로 조정 (기존 +10에서 0으로)
                            k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                            "student",
                            { studentType },
                        ]);

                        entities.students.push(student);

                        // 학생을 전역 대화 시스템에 등록
                        const locale = gameState.getLocale();
                        const content = firstDialogues.korean[studentType] || [
                            `Hello! I'm ${studentType}!`,
                            `안녕하세요! 저는 ${studentType}입니다!`,
                        ];

                        const speakerName =
                            firstDialogues.npcNames[locale]?.[studentType] ||
                            studentType;

                        // 전역 대화 시스템에 등록 (globalSystemManager 초기화 후 처리)
                        entities.objects.push({ 
                            entity: student, 
                            type: "student", 
                            objectType: studentType,  // studentType을 objectType으로 사용
                            dialogueData: {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            }
                        });
                        continue;
                    }

                    // Letter 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letterId =
                            object.properties?.find((p) => p.name === "letterId")
                                ?.value || letterType;

                        const letter = map.add([
                            k.sprite("first-assets", {
                                anim: letterType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 35), // 콜라이더 Y 위치를 35px 위로 조정 (20px 더 위로)
                            k.z(1),
                            "letter",
                            { letterId, letterType },
                        ]);

                        entities.letters.push(letter);

                        // Letter 상호작용 시스템
                        letter.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = firstDialogues.objectDialogues[locale]?.[
                                letterType
                            ] || [
                                `This is ${letterType}`,
                                `이것은 ${letterType}입니다`,
                            ];

                            const speakerName =
                                firstDialogues.objectNames[locale]?.[letterType] ||
                                letterType;

                            gameState.setInteractableObject(letter, "letter", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        letter.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });
                        continue;
                    }


                }
            }
            continue;
        }

        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                // 🔍 디버깅: 모든 오브젝트 이름 출력
                console.log("🔍 발견된 오브젝트:", object.name);
                
                // door_restroom 특별 체크
                if (object.name === "door_restroom") {
                    console.log("🎯 door_restroom 발견! 위치:", object.x, object.y, "크기:", object.width, object.height);
                }
                
                if (
                    [
                        "locker",
                        "elevator1",
                        "plant1",
                        "plant2",
                        "plant3",
                        "shelf1",
                        "shelf2",
                        "bulletin1",
                        "door_store",
                        "door_wc1",
                        "door_restroom",
                        "door_food",
                        "stair_to_second",
                        "exit_to_front",
                        "main_entrance",
                        "window",
                        "cam",
                        "clock",
                        "trophy1",
                        "trophy2", 
                        "trophy3",
                        "box1",
                        "box2",
                        "fire_fighter",
                        "wheelchair",
                        "tv",
                        "door_admin",
                        "door_creative",
                        "shelf",
                        "fishtank",
                        "door_mae",
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

                    // door_wc1과 door_restroom은 특별히 처리 - restroom으로 이동
                    if (objectType === "door_wc1" || objectType === "door_restroom") {
                        console.log(`🚪 화장실 문 오브젝트 생성: ${objectType}`);
                        const doorWcEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y), // 원래 위치 사용
                            k.opacity(0), // 완전히 투명하게 처리
                            objectType,
                            "interactive-object",
                            { objectType: objectType },
                        ]);

                        doorWcEntity.onCollide("player", () => {
                            console.log(
                                `🚪 ${objectType} 충돌 감지! - restroom으로 이동`
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("first");
                            k.go("restroom");
                        });
                        
                        console.log(`✅ 화장실 문 엔티티 생성 완료: ${objectType} at (${object.x}, ${object.y})`);
                        continue;
                    }

                    // door_food는 특별히 처리 - restaurant로 이동
                    if (objectType === "door_food") {
                        const doorFoodEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 20px 위로 조정
                            k.opacity(0),
                            "door_food",
                            "interactive-object",
                            { objectType: "door_food" },
                        ]);

                        doorFoodEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_food 충돌 - restaurant로 이동"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("first");
                            k.go("restaurant");
                        });
                        continue;
                    }

                    // stair_to_second는 특별히 처리 - second로 이동
                    if (objectType === "stair_to_second") {
                        const stairToSecondEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 20px 위로 조정
                            k.opacity(0),
                            "stair_to_second",
                            "interactive-object",
                            { objectType: "stair_to_second" },
                        ]);

                        stairToSecondEntity.onCollide("player", () => {
                            console.log(
                                "🚪 stair_to_second 충돌 - second로 이동"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("first");
                            k.go("second");
                        });
                        continue;
                    }

                    // exit_to_front는 특별히 처리 - front로 이동
                    if (objectType === "exit_to_front") {
                        const exitToFrontEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 20px 위로 조정
                            k.opacity(0),
                            "exit_to_front",
                            "interactive-object",
                            { objectType: "exit_to_front" },
                        ]);

                        exitToFrontEntity.onCollide("player", () => {
                            console.log(
                                "🚪 exit_to_front 충돌 - front로 이동"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("first");
                            k.go("front");
                        });
                        continue;
                    }

                    // main_entrance 처리 - front로 이동
                    if (objectType === "main_entrance") {
                        const mainEntranceEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 20px 위로 조정
                            k.opacity(0),
                            "main_entrance",
                            "interactive-object",
                            { objectType: "main_entrance" },
                        ]);

                        mainEntranceEntity.onCollide("player", () => {
                            console.log(
                                "🚪 main_entrance 충돌 - front로 이동"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("first");
                            k.go("front");
                        });
                        continue;
                    }

                    // director와 facil의 특별한 처리 (boundaries 레이어에서) - 맵에 스폰포인트 없어서 주석 처리
                    // if (objectType === "director" || objectType === "facil") {
                    //     const adjustedWidth = Math.round(object.width * 1.05); // 너비 5% 증가
                    //     const adjustedY = object.y - 40; // 수정된 부분: y좌표 40만큼 위로 이동 (10px 더 위로)
                        
                    //     const npcEntity = map.add([
                    //         k.rect(adjustedWidth, object.height),
                    //         k.area(),
                    //         k.body({ isStatic: true }),
                    //         k.pos(object.x, adjustedY),
                    //         k.opacity(0),
                    //         objectType,
                    //         "interactive-object",
                    //         { objectType },
                    //     ]);

                    //     // NPC 상호작용 시스템
                    //     npcEntity.onCollideUpdate("player", (player) => {
                    //         const locale = gameState.getLocale();
                    //         const content = firstDialogues.korean[objectType] || [
                    //             `Hello! I'm ${objectType}!`,
                    //             `안녕하세요! 저는 ${objectType}입니다!`,
                    //         ];

                    //         const speakerName =
                    //             firstDialogues.npcNames[locale]?.[objectType] ||
                    //             objectType;

                    //         gameState.setInteractableObject(
                    //             npcEntity,
                    //             "npc",
                    //             {
                    //                 content: content,
                    //                 speakerName: speakerName,
                    //                 speakerImage: null,
                    //             }
                    //         );
                    //     });

                    //     // 충돌에서 벗어날 때 상호작용 객체 초기화
                    //     npcEntity.onCollideEnd("player", (player) => {
                    //         gameState.clearInteractableObject();
                    //     });
                    //     continue;
                    // }

                    // 일반 상호작용 오브젝트 처리
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 20px 위로 조정 (기존 +10에서 -10으로)
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        "object",  // globalSystemManager가 찾을 수 있도록 object 태그 추가
                        { objectType },
                    ]);

                    // 전역 오브젝트 시스템에 등록 (globalSystemManager 초기화 후 처리)
                    const dialogueData = firstDialogues.objectDialogues?.korean?.[objectType];
                    entities.objects.push({ 
                        entity: objectEntity, 
                        type: "object", 
                        objectType: objectType,
                        dialogueData: dialogueData ? {
                            content: dialogueData,
                            speakerName: firstDialogues.objectNames?.korean?.[objectType] || objectType,
                            speakerImage: null,
                        } : null
                    });
                }

                // 일반 경계선 처리 (이름이 없는 벽들)
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 20px 위로 조정 (기존 +10에서 -10으로)
                    k.area(),
                    k.body({ isStatic: true }),
                    k.opacity(0),
                    tag,
                ]);
            }
            continue;
        }

        if (layer.name === "note") {
            console.log("📝 Note 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    const noteId = object.name.replace("note", "");
                    const note = map.add(
                        generateNoteComponents(k, k.vec2(object.x, object.y - 50), noteId) // ⚠️ 고정 설정 - 수정 금지! 노트는 스폰포인트 50px 위에 생성 (20px 더 위로)
                    );

                    note.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content =
                            noteDialogues[locale]?.[noteId] ||
                            noteDialogues["english"]?.[noteId] || [
                                "This is a note",
                                "이것은 쪽지입니다",
                            ];

                        gameState.setInteractableObject(note, "note", {
                            content: content,
                            speakerName: null,
                            speakerImage: null,
                        });
                    });

                    note.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                }
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            console.log(`🎨 Layer ${layer.name} info:`, {
                name: layer.name,
                type: layer.type,
                opacity: layer.opacity,
                visible: layer.visible,
                chunks: layer.chunks.length
            });
            for (const chunk of layer.chunks) {
                console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
                let tileIndex = 0;
                let tilesAdded = 0;
                for (let y = 0; y < chunk.height; y++) {
                    for (let x = 0; x < chunk.width; x++) {
                        const tile = chunk.data[tileIndex];
                        tileIndex++;

                        if (tile === 0) continue;

                        // chunk의 절대 위치 계산
                        const tileX = (chunk.x + x) * mapData.tilewidth;
                        const tileY = (chunk.y + y) * mapData.tileheight;

                        // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                        const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                        // first.json은 rpg_spritesheet_first.png를 사용하므로 first-assets 스프라이트 사용
                        const tileEntity = map.add([
                            k.sprite("first-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                            // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                        ]);
                        
                        // 첫 번째 chunk의 첫 몇 개 타일 위치 디버그
                        if (tilesAdded < 5) {
                            console.log(`🎨 First 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
                        }
                        tilesAdded++;
                    }
                }
                console.log(`✅ Layer ${layer.name} chunk: ${tilesAdded} tiles added`);
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

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 높이 (z=1), 다른 타일은 기본 (z=0)
                let zIndex = 0;
                if (layer.name === "upmost") {
                    zIndex = 3;
                } else if (layer.name === "cha") {
                    zIndex = 1;
                }

                // Use first-assets sprite (first.json과 호환)
                map.add([
                    k.sprite("first-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                    // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                ]);
                tilesAdded++;
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 플레이어가 스폰되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log(
            "⚠️ 플레이어 스폰 포인트를 찾을 수 없어 기본 위치에 생성합니다."
        );
        entities.player = map.add(
            generateFirstPlayerComponents(k, k.vec2(400, 400)) // 맵 중앙 근처에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    k.camScale(2); // front.js와 동일하게 2로 설정
    
    // 맵 크기 계산 (first.json의 실제 chunks를 기반으로)
    const mapBounds = {
        minX: -32 * 16 * 24, // 가장 왼쪽 chunk x (-32) * chunk width (16) * tilewidth (24)
        minY: -16 * 16 * 24, // 가장 위쪽 chunk y (-16) * chunk height (16) * tileheight (24)  
        maxX: 17 * 16 * 24, // 가장 오른쪽 chunk 다음 위치 (17) * chunk width (16) * tilewidth (24)
        maxY: 1 * 16 * 24, // 가장 아래쪽 chunk 다음 위치 (1) * chunk height (16) * tileheight (24)
    };

    console.log("🗺️ First 맵 경계:", mapBounds);

    // 전역 시스템 매니저 초기화 (맵 경계 정보 포함)
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "first", firstDialogues, mapBounds);
    
    // 전역 시스템 초기화 (전역 카메라 시스템 포함)
    globalSystemManager.initialize();

    // 저장된 오브젝트들의 대화 시스템 설정
    entities.objects.forEach(item => {
        if (item.entity && item.dialogueData) {
            globalSystemManager.globalDialogue.setupPlayerCollision(item.entity, item.objectType, item.dialogueData);
            console.log(`🎯 ${item.objectType} 대화 시스템 설정 완료`);
        } else if (item.entity && !item.dialogueData) {
            console.log(`⚠️ ${item.objectType}에 대화 데이터가 없습니다.`);
        }
    });

    // 플레이어와 카메라 초기화 지연 (모든 엔티티 생성 후)
    k.wait(0.1, () => {
        if (entities.player && entities.player.exists()) {
            console.log("🎥 카메라 초기 위치 설정:", entities.player.pos);
            k.camPos(entities.player.pos);
            
            // 전역 카메라 시스템에도 알림
            if (globalSystemManager.globalCamera) {
                globalSystemManager.globalCamera.jumpToPlayer();
                console.log("🎥 전역 카메라 시스템 플레이어 위치 동기화 완료");
            }
        } else {
            console.warn("⚠️ 플레이어가 아직 생성되지 않았습니다.");
        }
    });

    console.log("✅ UI 바 시스템 초기화 완료");

    // 퀘스트 말풍선 시스템 초기화
    initializeQuestBubbles(k, entities.students, map);

    watchPlayerHealth(k);

        // 게임패드 컨트롤 (L/R 숄더 버튼)
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 설정창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 퀘스트창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            if (globalSystemManager.globalUI.questState.isPopupOpen) {
                globalSystemManager.globalUI.closeQuestPopup();
            } else {
                globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    // 키보드 컨트롤 - 설정창 (L키)
    k.onKeyPress("l", () => {
        console.log("⌨️ L키 눌림 - 설정창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㅣ", () => {
        console.log("⌨️ ㅣ키 눌림 - 설정창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    // 키보드 컨트롤 - 퀘스트창 (R키)
    k.onKeyPress("r", () => {
        console.log("⌨️ R키 눌림 - 퀘스트창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            if (globalSystemManager.globalUI.questState.isPopupOpen) {
                globalSystemManager.globalUI.closeQuestPopup();
            } else {
                globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㄱ", () => {
        console.log("⌨️ ㄱ키 눌림 - 퀘스트창 열기");
        if (globalSystemManager && globalSystemManager.globalUI) {
            if (globalSystemManager.globalUI.questState.isPopupOpen) {
                globalSystemManager.globalUI.closeQuestPopup();
            } else {
                globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 설정창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 퀘스트창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);
    
    // 퀘스트 UI 추가
    setupQuestUI(k, gameState);
    
    // 씬 정리
    k.onSceneLeave(() => {
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
    });
}
