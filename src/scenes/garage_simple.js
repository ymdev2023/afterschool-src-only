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
    // 자동 세이브 데이터 로딩 (front.js와 동일)
    const currentPlayerName = globalState.getPlayerName();
    if (!currentPlayerName || currentPlayerName === "undefined") {
        console.log("🔄 플레이어 이름이 없음, 최신 세이브 데이터 로드 시도");
        const saveData = loadGameData();
        if (saveData) {
            console.log("📁 세이브 데이터 로드됨:", saveData);
            if (saveData.globalState) {
                globalState.setPlayerName(saveData.globalState.playerName || "익명");
                globalState.setMood(saveData.globalState.mood || 70);
                globalState.setHealth(saveData.globalState.health || 100);
                console.log(`📊 상태 복원 - 이름: ${globalState.getPlayerName()}, 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
            }
        } else {
            console.log("💭 세이브 데이터 없음, 기본값 사용");
            globalState.setPlayerName("익명");
            globalState.setMood(70);
            globalState.setHealth(100);
        }
    } else {
        console.log(`👤 기존 플레이어: ${currentPlayerName}`);
    }

    // BGM 처리 (front.js와 동일)
    if (!audioManager.isBGMPlaying() || audioManager.getCurrentBGM() !== "garage-bgm") {
        audioManager.playBGM("garage-bgm", 1.0).then(() => {
            console.log("🎵 Garage BGM이 성공적으로 재생되었습니다.");
        }).catch((error) => {
            console.warn("⚠️ Garage BGM 재생 실패:", error);
        });
    } else {
        console.log("🎵 Garage BGM이 이미 재생 중입니다.");
    }

    // 맵 데이터 가져오기
    console.log("🗺️ garage.json 로딩 시작");
    const mapData = await fetchMapData(k, "assets/images/garage.json");
    const layers = mapData.layers;

    // 엔티티 저장소
    const entities = {
        player: null,
        npcs: [],
        objects: []
    };

    // 스폰 포인트 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("📍 스폰포인트 레이어 처리");
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        entities.player = generateGaragePlayerComponents(k, k.vec2(object.x, object.y - 10));
                        console.log(`👤 플레이어 생성: (${object.x}, ${object.y - 10})`);
                    }
                }
            }
        }

        // 경계 처리
        if (layer.name === "boundaries") {
            console.log("🚧 경계 레이어 처리");
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    if (object.name === "entrance") {
                        k.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.color(0, 255, 0),
                            k.opacity(0),
                            "entrance",
                        ]);
                    } else {
                        k.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.color(255, 0, 0),
                            k.opacity(0),
                            "boundary",
                        ]);
                    }
                }
            }
        }

        // 타일 렌더링
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            for (const chunk of layer.chunks) {
                let tilesAdded = 0;
                console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
                
                for (let i = 0; i < chunk.data.length; i++) {
                    const tile = chunk.data[i];
                    if (tile === 0) continue;

                    const localX = i % chunk.width;
                    const localY = Math.floor(i / chunk.width);
                    const worldX = chunk.x + localX * 24;
                    const worldY = chunk.y + localY * 24;

                    if (localX >= 0 && localX < chunk.width && localY >= 0 && localY < chunk.height) {
                        try {
                            k.add([
                                k.sprite("garage-assets", { frame: tile - 1 }),
                                k.pos(worldX, worldY),
                                k.z(layer.name === "background" ? 0 : 1),
                            ]);
                            tilesAdded++;
                        } catch (error) {
                            console.warn(`⚠️ 타일 ${tile} 렌더링 실패 at (${worldX}, ${worldY}):`, error);
                        }
                    }
                }
                console.log(`✅ Chunk processed: ${tilesAdded} tiles added`);
            }
            console.log(`✅ Layer ${layer.name} 완료`);
        } else if (layer.data) {
            console.log(`🎨 Processing regular tile layer: ${layer.name}, tiles: ${layer.data.length}`);
            for (let i = 0; i < layer.data.length; i++) {
                const tile = layer.data[i];
                if (tile === 0) continue;

                const x = (i % mapData.width) * 24;
                const y = Math.floor(i / mapData.width) * 24;

                try {
                    k.add([
                        k.sprite("garage-assets", { frame: tile - 1 }),
                        k.pos(x, y),
                        k.z(layer.name === "background" ? 0 : 1),
                    ]);
                } catch (error) {
                    console.warn(`⚠️ 타일 ${tile} 렌더링 실패 at (${x}, ${y}):`, error);
                }
            }
            console.log(`✅ 일반 타일 레이어 ${layer.name} 완료`);
        }
    }

    // 플레이어 컨트롤 및 UI 설정
    setPlayerControls(k, entities.player);
    watchPlayerHealth(k, entities.player, () => k.go("front"));

    // UI 시스템 초기화 (front.js와 동일)
    const questUIManager = new QuestUIManager(k, gameState);

    // 퀘스트 아이콘
    const questIcon = k.add([
        k.sprite("main-assets", { frame: 5771 }),
        k.pos(k.width() - 120, 30),
        k.scale(2),
        k.z(1100),
        k.area(),
        k.fixed(),
        "quest-icon",
    ]);

    // 설정 아이콘
    const settingsIcon = k.add([
        k.sprite("main-assets", { frame: 5772 }),
        k.pos(k.width() - 60, 30),
        k.scale(2),
        k.z(1100),
        k.area(),
        k.fixed(),
        "settings-icon",
    ]);

    // 호버 효과
    questIcon.onHover(() => questIcon.scale = k.vec2(2.2, 2.2));
    questIcon.onHoverEnd(() => questIcon.scale = k.vec2(2, 2));
    settingsIcon.onHover(() => settingsIcon.scale = k.vec2(2.2, 2.2));
    settingsIcon.onHoverEnd(() => settingsIcon.scale = k.vec2(2, 2));

    // 클릭 이벤트
    questIcon.onClick(() => {
        console.log("📋 퀘스트 아이콘 클릭됨");
        if (!gameState.getIsMuted()) k.play("boop-sfx", { volume: 0.6 });
        questUIManager.toggleQuestPopup();
    });

    settingsIcon.onClick(() => {
        console.log("⚙️ 설정 아이콘 클릭됨");
        if (!gameState.getIsMuted()) k.play("boop-sfx", { volume: 0.6 });
        questUIManager.toggleSettingsPopup();
    });

    // ESC 키 지원
    k.onKeyPress("escape", () => {
        if (questUIManager.isSettingsPopupOpen) questUIManager.closeSettingsPopup();
        if (questUIManager.isQuestPopupOpen) questUIManager.closeQuestPopup();
    });

    // 출입구 충돌 처리
    entities.player.onCollide("entrance", () => {
        k.go("front");
    });

    // 전역 함수 노출 (front.js와 동일)
    window.showQuestCompletionMessage = questUIManager.showQuestCompletionMessage.bind(questUIManager);
    window.showQuestAddedMessage = questUIManager.showQuestAddedMessage.bind(questUIManager);

    // 메인 메뉴 단축키
    setupMainMenuShortcut(k);

    console.log("✅ Garage 씬 로드 완료");
}
