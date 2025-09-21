import { QuestUIManager } from "../uiComponents/questUIManager.js";
import { gameState, globalState } from "../state/stateManagers.js";
import NotificationManager from "../systems/notificationManager.js";
import { AutoSaveManager } from "../systems/autoSaveManager.js";
import { loadGameData } from "../systems/saveSystem.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    generateGaragePlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { fadeInBGM, audioManager } from "../utils.js";

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
import { garageObjectDialogues, garageObjectNames, garageDialogues } from "../content/dialogue/garageDialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { initializeQuestBubbles, updateQuestBubbles } from "../utils.js";
import { UI_POSITIONS, UI_SIZES } from "../uiComponents/uiConstants.js";
import { addQuestSafely } from "../content/questData.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import { getNPCSprite, getGarageSpriteName, getObjectSprite } from "../scene-assets/garageAssets.js";


export default async function garage(k) {
    // garage 씬은 front 씬에서만 접근 가능하므로 previousScene을 front로 고정
    const previousScene = "front";
    console.log("🎯 garage 씬 previousScene 고정: front");
    console.log(`🔍 Garage 씬 진입 초기 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
    
    // ⚠️ 고정 설정 - 수정 금지! ⚠️
    // 맵 전환 시 현재 상태 유지 (저장 데이터 복원 제거)
    const currentPlayerName = globalState.getPlayerName();
    if (!currentPlayerName || currentPlayerName === "undefined") {
        // 플레이어 이름만 설정하고 상태는 현재 값 유지
        const saveList = gameDataManager.getSaveList();
        const latestSave = saveList.length > 0 ? saveList[0] : null;
        if (latestSave) {
            globalState.setPlayerName(latestSave.playerName || "익명");
            console.log(`🔍 Garage 씬 플레이어 이름 설정 - 이름: ${globalState.getPlayerName()}, 현재 상태 유지`);
        } else {
            globalState.setPlayerName("익명");
            // 기본값은 게임 시작 시에만 설정
            if (globalState.getMood() === undefined) globalState.setMood(9);
            if (globalState.getHealth() === undefined) globalState.setHealth(9);
            console.log(`🔍 Garage 씬 기본값 설정 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
        }
    } else {
        // 기존 플레이어는 현재 globalState 값을 그대로 유지 (맵 전환 시 상태 보존)
        console.log(`🔍 Garage 씬 기존 플레이어 상태 유지 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
    }

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Garage BGM으로 즉시 전환");
    audioManager.switchBGM("garage-bgm", 1.0);

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);

    // 맵 데이터 가져오기
    // console.log("🗺️ garage.json 로딩 시작");
    const mapData = await fetchMapData("./assets/images/garage.json");
    const map = k.add([k.pos(0, 0)]);
    
    // 엔티티 저장소
    const entities = {
        player: null,
        npcs: [],
        objects: []
    };
    
    const layers = mapData.layers;
    // console.log("🗺️ 레이어 정보:", layers.map(l => ({ name: l.name, type: l.type, objects: l.objects?.length || 'N/A' })));
    
    // 스폰 포인트 처리 먼저
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            // console.log("📍 스폰포인트 레이어 처리");
            if (layer.objects && layer.objects.length > 0) {
                // console.log("📋 스폰포인트 객체들:", layer.objects.map(obj => ({ name: obj.name, x: obj.x, y: obj.y })));
                
                // 플레이어 스폰포인트 우선순위 처리 (previousScene 기반)
                const playerSpawns = layer.objects.filter(obj => obj.name && obj.name.includes("player"));
                // console.log("🎯 플레이어 스폰포인트들:", playerSpawns);
                // console.log("📍 현재 previousScene:", previousScene);
                
                // previousScene에 따른 스폰포인트 우선순위 결정
                let selectedSpawn = null;
                
                if (previousScene === "front") {
                    // front에서 온 경우 player_front 스폰포인트 우선 사용
                    const frontSpawn = layer.objects.find(obj => obj.name === "player_front");
                    const defaultSpawn = layer.objects.find(obj => obj.name === "player");
                    
                    console.log("🔍 front 진입 - player_front 스폰 찾기:", frontSpawn ? `발견 (${frontSpawn.x}, ${frontSpawn.y})` : "없음");
                    console.log("🔍 front 진입 - player 스폰 찾기:", defaultSpawn ? `발견 (${defaultSpawn.x}, ${defaultSpawn.y})` : "없음");
                    console.log("🔍 모든 스폰포인트:", layer.objects.map(obj => obj.name));
                    
                    selectedSpawn = frontSpawn || defaultSpawn;
                    console.log("🚪 front에서 진입 - 선택된 스폰:", selectedSpawn ? selectedSpawn.name : "없음");
                } else if (previousScene === "first") {
                    // first에서 온 경우 (아직 player_first는 없으므로 기본 player 사용)
                    const firstSpawn = layer.objects.find(obj => obj.name === "player_first");
                    const defaultSpawn = layer.objects.find(obj => obj.name === "player");
                    
                    // console.log("🔍 first 진입 - player_first 스폰 찾기:", firstSpawn ? `발견 (${firstSpawn.x}, ${firstSpawn.y})` : "없음");
                    // console.log("🔍 first 진입 - player 스폰 찾기:", defaultSpawn ? `발견 (${defaultSpawn.x}, ${defaultSpawn.y})` : "없음");
                    
                    selectedSpawn = firstSpawn || defaultSpawn;
                    // console.log("🏫 first에서 진입 - player_first 또는 기본 player 스폰 사용");
                } else {
                    // 기본 경우 (previousScene이 없거나 다른 경우)
                    const defaultSpawn = layer.objects.find(obj => obj.name === "player");
                    // console.log("🔍 기본 진입 - player 스폰 찾기:", defaultSpawn ? `발견 (${defaultSpawn.x}, ${defaultSpawn.y})` : "없음");
                    
                    selectedSpawn = defaultSpawn;
                    // console.log("🎮 기본 진입 - player 스폰 사용");
                }
                
                if (selectedSpawn && !entities.player) {
                    console.log(`🎯 선택된 스폰포인트: ${selectedSpawn.name} at (${selectedSpawn.x}, ${selectedSpawn.y})`);
                    
                    // 스폰 포인트 미세 조정
                    let adjustedX = selectedSpawn.x;
                    let adjustedY = selectedSpawn.y;
                    
                    // player_front 스폰의 경우 plates 오른쪽으로 조정
                    if (selectedSpawn.name === "player_front") {
                        // plates 위치: x=-84.5, y=22.5, width=16.3
                        // plates 오른쪽에 위치하도록 조정
                        adjustedX = -0; // plates 오른쪽 근처
                        adjustedY = 0;  // 좀 더 아래로0
                        console.log(`🎯 player_front 스폰을 plates 오른쪽으로 조정: (${adjustedX}, ${adjustedY})`);
                    }
                    // player 스폰의 경우도 약간 조정
                    else if (selectedSpawn.name === "player") {
                        adjustedX = selectedSpawn.x + 3; // 약간 오른쪽으로
                        adjustedY = selectedSpawn.y - 10; // 약간 위로
                    }
                    
                    try {
                        entities.player = map.add(
                            generateGaragePlayerComponents(k, k.vec2(adjustedX, adjustedY))
                        );
                        console.log(`✅ 플레이어 생성 성공: ${selectedSpawn.name} 원본(${selectedSpawn.x}, ${selectedSpawn.y}) → 조정(${adjustedX}, ${adjustedY})`);
                        console.log(`✅ entities.player 존재 여부:`, !!entities.player);
                        if (entities.player) {
                            console.log(`✅ 플레이어 실제 위치:`, entities.player.pos);
                        }
                    } catch (error) {
                        console.error(`❌ 플레이어 생성 실패:`, error);
                    }
                } else if (!entities.player) {
                    console.warn("⚠️ 적절한 스폰포인트를 찾을 수 없음 - 기본 위치 사용");
                    // 백업: 아무 player 스폰포인트나 사용
                    const fallbackSpawn = layer.objects.find(obj => obj.name && obj.name.includes("player"));
                    if (fallbackSpawn) {
                        // 백업 스폰도 약간 조정
                        let adjustedX = fallbackSpawn.x + 3;
                        let adjustedY = fallbackSpawn.y - 3;
                        
                        entities.player = map.add(
                            generateGaragePlayerComponents(k, k.vec2(adjustedX, adjustedY))
                        );
                        // console.log(`🔄 백업 스폰 사용: ${fallbackSpawn.name}`);
                    }
                }
                
                // 다른 스폰포인트 처리
                for (const object of layer.objects) {
                    // console.log(`🎯 스폰포인트 처리 중: ${object.name} at (${object.x}, ${object.y})`);
                    if (object.name === "student22") {
                        // Tiled와의 간극을 줄이기 위해 스폰포인트를 왼쪽으로 10픽셀 이동
                        const adjustedX = object.x - 10;
                        // console.log(`👨‍🎓 student22 스폰포인트 사용: (${object.x}, ${object.y}) → 조정된 위치: (${adjustedX}, ${object.y - 10})`);
                        
                        // student22 NPC 생성
                        entities.student22 = map.add([
                            k.sprite(getGarageSpriteName(), { frame: getNPCSprite("student22") }), // garage-assets 스프라이트 사용
                            k.pos(adjustedX, object.y - 10), // ⚠️ Tiled 간극 보정: -10픽셀 왼쪽 이동, NPC는 스폰포인트 10px 위에 생성
                            k.area(),
                            k.body({ isStatic: true }),
                            k.z(1),
                            "npc",
                            "student22",
                            { objectType: "student22" } // globalSystemManager가 인식할 수 있도록 objectType 속성 추가
                        ]);
                        
                        // student22 상호작용 완료 시 퀘스트 추가
                        entities.student22.onInteractionComplete = () => {
                            console.log("👨‍🎓 student22(유하은)과 상호작용 완료 - 퀘스트 추가");
                            
                            // 전역 상태와 window.questItems 모두에서 중복 체크
                            const hasStudentQuest = (window.questItems && window.questItems.some(quest => quest.targetNpc === "student22")) ||
                                globalState.getGlobalQuests().some(quest => quest.targetNpc === "student22");
                            
                            if (!hasStudentQuest) {
                                const studentQuest = {
                                    id: `quest_student22_${Date.now()}`,
                                    title: "[Q06] 사연이 있어 보이는 친구",
                                    details: ["창고에서 혼자 있는 학생과 대화하기", "그 학생의 이야기를 들어보기", "왜 혼자 있는지 알아보기"],
                                    expanded: false,
                                    completed: false,
                                    targetNpc: "student22"
                                };
                                
                                // 안전한 퀘스트 추가 함수 사용 (중복 체크 포함)
                                const currentQuestItems = window.questItems || [];
                                const added = addQuestSafely(currentQuestItems, studentQuest, globalState);
                                
                                if (added) {
                                    // 퀘스트 추가 알림
                                    if (window.notificationManager) {
                                        window.notificationManager.addNotification({
                                            type: 'quest-added',
                                            message: "새 퀘스트: 사연이 있어 보이는 친구"
                                        });
                                    }
                                    
                                    console.log("🆕 새 퀘스트 추가: 사연이 있어 보이는 친구");
                                } else {
                                    console.log("🔄 퀘스트 Q06 이미 존재하므로 추가하지 않음");
                                }
                            }
                        };
                        
                        // console.log(`✅ student22 NPC 생성 완료: (${adjustedX}, ${object.y - 10})`);
                    } else if (object.name === "mp3") {
                        // mp3가 이미 수집되었는지 확인
                        if (globalState.hasItemInGlobalInventory("mp3")) {
                            console.log("🎵 mp3가 이미 수집됨 - 스프라이트 생성 안함");
                            continue; // mp3 오브젝트 생성하지 않음
                        }
                        
                        // Tiled와의 간극을 줄이기 위해 스폰포인트를 왼쪽으로 10픽셀 이동
                        const adjustedX = object.x - 10;
                        // console.log(`🎵 mp3 스폰포인트 사용: (${object.x}, ${object.y}) → 조정된 위치: (${adjustedX}, ${object.y - 10})`);
                        
                        // mp3 오브젝트 생성
                        entities.mp3 = map.add([
                            k.sprite(getGarageSpriteName(), { frame: getObjectSprite("mp3") }), // garage-assets 스프라이트 사용
                            k.pos(adjustedX, object.y - 10), // ⚠️ Tiled 간극 보정: -10픽셀 왼쪽 이동, 오브젝트는 스폰포인트 10px 위에 생성
                            k.area(),
                            k.body({ isStatic: true }),
                            k.z(1),
                            "object",
                            "mp3",
                            { objectType: "mp3" } // globalSystemManager가 인식할 수 있도록 objectType 속성 추가
                        ]);
                        
                        // mp3 상호작용은 globalSystemManager에서 관리됨
                        // 대화 시작 시 Gee 효과음 재생을 위한 onDialogStart 콜백 설정
                        entities.mp3.onDialogStart = () => {
                            // console.log("🎵 mp3 대화 시작 - Gee 효과음 재생 시작");
                            
                            // Gee 효과음 재생 (자동 fade in/out 효과)
                            try {
                                // audioManager를 통해 현재 BGM 접근
                                const currentBGM = audioManager.currentBGMElement;
                                let originalBGMVolume = null;
                                
                                if (currentBGM && typeof currentBGM.volume !== 'undefined') {
                                    originalBGMVolume = currentBGM.volume || 0.5;
                                    // console.log("🎵 현재 BGM 볼륨:", originalBGMVolume);
                                    
                                    // BGM ducking (10%로 감소)
                                    if (typeof originalBGMVolume === 'number' && originalBGMVolume > 0) {
                                        k.tween(
                                            originalBGMVolume,
                                            0.1,
                                            0.5,
                                            (val) => {
                                                if (currentBGM && typeof currentBGM.volume !== 'undefined') {
                                                    currentBGM.volume = val;
                                                }
                                            },
                                            k.easings.easeOutQuad
                                        );
                                    }
                                }
                                
                                // Gee 효과음을 fade in으로 시작
                                const geeSound = k.play("gee-sfx", { volume: 0 });
                                
                                // fade in (0.5초)
                                k.tween(
                                    0,
                                    0.6,
                                    0.5,
                                    (val) => {
                                        if (geeSound && typeof geeSound.volume !== 'undefined') {
                                            geeSound.volume = val;
                                        }
                                    },
                                    k.easings.easeInQuad
                                );
                                
                                // console.log("🎵 소녀시대 - Gee 효과음 fade in 시작");
                                
                                // 효과음 시작 7초 후에 fade out 시작
                                const fadeOutStartTime = 7; // 7초 후에 fade out 시작
                                
                                k.wait(fadeOutStartTime, () => {
                                    if (geeSound && typeof geeSound.volume !== 'undefined') {
                                        // console.log("🎵 Gee 효과음 자동 fade out 시작");
                                        const currentVolume = geeSound.volume;
                                        
                                        // fade out (2초)
                                        k.tween(
                                            currentVolume,
                                            0,
                                            2.0,
                                            (val) => {
                                                if (geeSound && typeof geeSound.volume !== 'undefined') {
                                                    geeSound.volume = val;
                                                }
                                            },
                                            k.easings.easeOutQuad
                                        );
                                    }
                                });
                                
                                // 효과음이 완전히 끝나면 BGM 복원
                                geeSound.onEnd(() => {
                                    // console.log("🎵 Gee 효과음 완료 - BGM 복원");
                                    if (currentBGM && typeof currentBGM.volume !== 'undefined' && typeof originalBGMVolume === 'number') {
                                        k.tween(
                                            currentBGM.volume || 0.1,
                                            originalBGMVolume,
                                            0.5,
                                            (val) => {
                                                if (currentBGM && typeof currentBGM.volume !== 'undefined') {
                                                    currentBGM.volume = val;
                                                }
                                            },
                                            k.easings.easeInQuad
                                        );
                                    }
                                });
                                
                            } catch (error) {
                                console.warn("🎵 gee-sfx 재생 실패:", error);
                                // 실패 시 단순 재생
                                try {
                                    k.play("gee-sfx", { volume: 0.6 });
                                    console.log("🎵 Gee 효과음 단순 재생으로 대체");
                                } catch (fallbackError) {
                                    console.error("🎵 Gee 효과음 완전 실패:", fallbackError);
                                }
                            }
                        };
                        
                        // 퀘스트 처리는 대화 완료 후에
                        entities.mp3.onInteractionComplete = () => {
                            console.log("🎵 mp3 상호작용 완료 - 퀘스트 처리 시작");
                            
                            if (window.questItems) {
                                // 전역 상태와 window.questItems 모두에서 퀘스트 5 중복 체크
                                // mp3 퀘스트 추가 (안전한 함수 사용)
                                const quest5 = {
                                    id: `quest_mp3_${Date.now()}`,
                                    title: "[Q05] mp3의 주인... 소녀시대 팬일지도?",
                                    details: ["창고에서 mp3 플레이어 찾기", "mp3와 상호작용해보기", "소녀시대-gee가 흘러나오는 것을 확인하기"],
                                    expanded: false,
                                    completed: false,
                                    targetObject: "mp3"
                                };
                                
                                // 안전한 퀘스트 추가 함수 사용 (중복 체크 포함)
                                const currentQuestItems = window.questItems || [];
                                const added = addQuestSafely(currentQuestItems, quest5, globalState);
                                
                                if (added) {
                                    // 퀘스트 추가 알림 (메시지로 표시)
                                    console.log("🔔 notificationManager 상태:", !!window.notificationManager);
                                    if (window.notificationManager) {
                                        console.log("🔔 퀘스트 추가 알림 시도:", "[Q05] mp3의 주인... 소녀시대 팬일지도?");
                                        window.notificationManager.addNotification({
                                            type: 'quest-added',
                                            message: "[Q05] mp3의 주인... 소녀시대 팬일지도?"
                                        });
                                        console.log("✅ 퀘스트 추가 알림 요청 완료");
                                    } else {
                                        console.warn("⚠️ notificationManager가 초기화되지 않음!");
                                    }
                                    console.log("🆕 mp3 퀘스트 추가됨");
                                } else {
                                    console.log("🔄 퀘스트 Q05 이미 존재하므로 추가하지 않음");
                                }
                                
                                // 퀘스트 완료 처리는 별도의 조건에서 수행
                                // (현재는 단순히 mp3와 상호작용하는 것만으로는 완료되지 않음)
                                
                                // mp3를 전역 인벤토리에 추가
                                if (!globalState.hasItemInGlobalInventory("mp3")) {
                                    const mp3Item = {
                                        id: "mp3",
                                        name: "mp3 플레이어",
                                        sprite: getGarageSpriteName(),
                                        frame: getObjectSprite("mp3")
                                    };
                                    
                                    // 전역 상태에 아이템 추가
                                    const added = globalState.addToGlobalInventory(mp3Item);
                                    if (added) {
                                        console.log("📦 mp3가 전역 인벤토리에 추가됨");
                                        
                                        // 아이템 획득 알림 표시
                                        if (window.notificationManager) {
                                            window.notificationManager.addNotification({
                                                type: 'item-acquired',
                                                message: "mp3 플레이어를 획득했습니다!"
                                            });
                                        }
                                        
                                        // 현재 인벤토리 시스템이 있다면 UI 업데이트
                                        console.log("🔄 인벤토리 시스템 업데이트 시도:", !!window.inventorySystem);
                                        if (window.inventorySystem) {
                                            console.log("📦 전역 상태에서 인벤토리 다시 로드");
                                            window.inventorySystem.loadFromGlobalState();
                                            console.log("👁️ 인벤토리 UI 표시");
                                            window.inventorySystem.show();
                                            console.log("✅ 인벤토리 업데이트 완료");
                                        } else if (globalSystemManager && globalSystemManager.globalInventory) {
                                            // 백업: globalSystemManager 인벤토리도 사용
                                            console.log("🔄 globalSystemManager 인벤토리에 추가");
                                            globalSystemManager.globalInventory.addItem(mp3Item);
                                        } else {
                                            console.warn("⚠️ 인벤토리 시스템을 찾을 수 없음!");
                                        }
                                        
                                        // mp3 스프라이트 제거 (0.5초 후)
                                        k.wait(0.5, () => {
                                            if (entities.mp3 && entities.mp3.exists()) {
                                                console.log("🎵 mp3 스프라이트 제거");
                                                entities.mp3.destroy();
                                                entities.mp3 = null;
                                            }
                                        });
                                    }
                                } else {
                                    console.log("📦 mp3가 이미 전역 인벤토리에 존재함");
                                }
                            }
                        };
                        
                        // mp3 collision 핸들러 활성화
                        entities.mp3.onCollideUpdate("player", (player) => {
                            const currentLocale = gameState.getLocale() || "korean";
                            const objectName = garageObjectNames[currentLocale]?.["mp3"] || "mp3";
                            
                            gameState.setInteractableObject(
                                entities.mp3,
                                "object",
                                {
                                    content: garageDialogues[currentLocale]?.["mp3"] || [`${objectName}을 조사했습니다.`],
                                    speakerName: objectName,
                                    speakerImage: null,
                                    onInteractionComplete: entities.mp3.onInteractionComplete
                                }
                            );
                        });
                        
                        entities.mp3.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });
                        
                        console.log(`🎵 mp3 오브젝트 생성: (${object.x}, ${object.y - 10})`);
                    }
                }
            }
        }
    }
    
    // 플레이어 생성 확인
    if (entities.player) {
        // console.log(`✅ 플레이어 최종 확인 - 위치: (${entities.player.pos.x}, ${entities.player.pos.y})`);
    } else {
        console.error("❌ 플레이어가 생성되지 않음!");
    }

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "boundaries") {
            // console.log(`🗺️ Boundaries 레이어 처리: ${layer.objects?.length || 0}개 객체`);
            if (layer.objects && layer.objects.length > 0) {
                // console.log(`📋 Boundaries 객체 목록:`, layer.objects.map(obj => ({
                //     name: obj.name || 'unnamed',
                //     type: obj.type || 'none',
                //     x: obj.x,
                //     y: obj.y,
                //     width: obj.height,
                //     height: obj.height
                // })));
                for (const object of layer.objects) {
                    if (object.name === "entrance") {
                        // ⚠️ 고정 설정 - 수정 금지! ⚠️
                        // 콜라이더 Y 위치를 10px 아래로 조정 (다른 맵에서도 동일하게 적용)
                        console.log(`🚪 출입구 콜라이더 생성: ${object.name} at (${object.x}, ${object.y - 10})`);
                        map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.color(0, 255, 0),
                            k.opacity(0),
                            "entrance",
                        ]);
                    } else if (object.name === "door_to_front") {
                        // ⚠️ 고정 설정 - 수정 금지! ⚠️
                        // door_to_front는 별도로 처리하여 front.js에서 player_garage 스폰포인트 사용
                        // console.log(`🚪 door_to_front 콜라이더 생성: ${object.name} at (${object.x}, ${object.y - 10})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.color(0, 255, 0),
                            k.opacity(0),
                            "door_to_front", // 별도 태그 사용
                        ]);

                        // door_to_front와의 충돌 처리
                        doorEntity.onCollide("player", () => {
                            console.log("🚪 door_to_front 감지됨 - front.js로 이동");
                            // door 사운드 재생
                            try {
                                k.play("door-open-sfx", { volume: 0.5 });
                            } catch (error) {
                                console.warn("door-open-sfx 재생 실패:", error);
                            }
                            // garage에서 front로 이동 시 player_garage 스폰포인트 사용
                            gameState.setPreviousScene("garage");
                            k.go("front");
                        });
                            } else if (object.name && object.name.trim() !== "") {
            // ⚠️ 고정 설정 - 수정 금지! ⚠️
            // 상호작용 가능한 객체 처리 (bench, tools, board, shelf, pingpong 등)
            // 콜라이더 Y 위치를 10px 위로 조정하여 다른 콜라이더들과 일치
            // console.log(`🎯 상호작용 객체 생성: ${object.name} at (${object.x}, ${object.y - 10}) - 크기: ${object.width}x${object.height}`);
                        
                        const interactionObject = map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10), // ⚠️ 고정 설정 - 수정 금지! Y 위치를 10px 위로 조정
                            k.area(),
                            k.body({ isStatic: true }), // ⚠️ 고정 설정 - 수정 금지! ⚠️
                            k.color(255, 255, 0),
                            k.opacity(0), // 투명하게 설정
                            `interactive-${object.name}`,
                            "interactive-object", // globalSystemManager가 인식할 수 있도록 태그 추가
                            { objectType: object.name }, // objectType 속성 추가
                        ]);

                        // 상호작용은 globalSystemManager에서 처리됨



                        entities.objects.push(interactionObject);
                    } else {
                        // ⚠️ 고정 설정 - 수정 금지! ⚠️
                        // 이름이 없는 객체들도 벽으로 처리 (콜라이더 Y 위치를 10px 위로 조정)
                        // console.log(`🧱 벽 콜라이더 생성: ${object.name || 'unnamed'} at (${object.x}, ${object.y - 10})`);
                        map.add([
                            k.rect(object.width, object.height),
                            k.pos(object.x, object.y - 10),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.color(255, 0, 0),
                            k.opacity(0),
                            "boundary",
                        ]);
                    }
                }
            }
            continue;
        }
        
        // Handle regular tile layers with chunks system (infinite maps) - front.js 스타일
        if (layer.chunks) {
            // console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            for (const chunk of layer.chunks) {
                // console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
                let tileIndex = 0;
                let tilesAdded = 0;
                for (let y = 0; y < chunk.height; y++) {
                    for (let x = 0; x < chunk.width; x++) {
                        const tile = chunk.data[tileIndex];
                        tileIndex++;

                        if (tile === 0) continue;

                        // chunk의 절대 위치 계산 (픽셀 퍼펙트를 위해 Math.floor 사용)
                        const tileX = Math.floor((chunk.x + x) * mapData.tilewidth);
                        const tileY = Math.floor((chunk.y + y) * mapData.tileheight);

                        // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                        const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                        // ⚠️ 고정 설정 - 수정 금지! ⚠️
                        // garage.json은 반드시 garage-assets 스프라이트를 사용해야 함
                        // 다른 스프라이트로 변경하면 맵이 깨짐
                        try {
                            map.add([
                                k.sprite("garage-assets", { frame: tile - 1, filter: "nearest" }), // 픽셀 아트용 필터링
                                k.pos(tileX, tileY),
                                k.z(zIndex),
                            ]);
                            tilesAdded++;
                        } catch (error) {
                            console.warn(`⚠️ 타일 ${tile} 렌더링 실패 at (${tileX}, ${tileY}):`, error);
                        }
                    }
                }
                                    // console.log(`✅ Layer ${layer.name} chunk: ${tilesAdded} tiles added`);
            }
            continue;
        }

        // Handle regular tile layers (non-infinite maps) - front.js 스타일
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

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                // ⚠️ 고정 설정 - 수정 금지! ⚠️
                // garage.json은 반드시 garage-assets 스프라이트를 사용해야 함
                // 다른 스프라이트로 변경하면 맵이 깨짐
                try {
                    map.add([
                        k.sprite("garage-assets", { frame: tile - 1, filter: "nearest" }), // 픽셀 아트용 필터링
                        k.pos(Math.floor(tilePos.x), Math.floor(tilePos.y)), // 픽셀 퍼펙트를 위해 Math.floor 사용
                        k.z(zIndex),
                    ]);
                    tilesAdded++;
                } catch (error) {
                    console.warn(`⚠️ 타일 ${tile} 렌더링 실패 at (${tilePos.x}, ${tilePos.y}):`, error);
                }
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

        // 플레이어가 생성되지 않은 경우 기본 위치에 생성
        if (!entities.player) {
            console.error("❌ 플레이어가 생성되지 않았습니다! 기본 위치에 생성합니다.");
            entities.player = map.add([
                ...generateFirstPlayerComponents(k),
                k.pos(400, 300),
            ]);
        }

    // 플레이어 컨트롤 및 카메라 설정
    if (entities.player) {
        setPlayerControls(k, entities.player);
        watchPlayerHealth(k, entities.player, () => k.go("front"));
        // console.log("✅ 플레이어 컨트롤 설정 완료");
    }

    // 카메라 배율 설정 (front.js와 동일)
    k.camScale(2);

    // 맵 크기 계산 (garage.json 기반으로 추정)
    const mapBounds = {
        minX: -24 * 24, // 추정 맵 경계
        minY: -24 * 24,
        maxX: 30 * 24,
        maxY: 20 * 24,
    };

    console.log("🗺️ Garage 맵 경계:", mapBounds);

    // 카메라 스케일 설정 (front.js와 동일)
    k.camScale(2);
    
    // 카메라 초기 위치 설정 (front.js와 동일)
    if (entities.player && entities.player.exists()) {
        k.camPos(entities.player.pos);
    }

    // front.js와 동일한 카메라 추적 시스템
    const CAMERA_EDGE_BUFFER = 120;
    const CAMERA_JUMP_FACTOR = 0.2;
    const CAMERA_MIN_DISTANCE = 8;
    
    // 카메라 추적 상태 변수들 (front.js와 동일)
    let targetCameraPos = entities.player ? entities.player.pos.clone() : k.vec2(0, 0);
    let lastPlayerPos = entities.player ? entities.player.pos.clone() : k.vec2(0, 0);

    function updateCameraWithBoundaries() {
        if (!entities.player || !entities.player.exists()) {
            return;
        }

        const playerPos = entities.player.pos;
        const currentCamPos = k.camPos();
        const screenHalfWidth = k.width() / (2 * k.camScale().x);
        const screenHalfHeight = k.height() / (2 * k.camScale().y);
        
        // 플레이어가 실제로 이동했을 때만 카메라 업데이트 계산
        if (playerPos.dist(lastPlayerPos) < 1) return;
        
        // 플레이어가 화면 가장자리 근처에 있는지 확인
        const playerScreenPos = playerPos.sub(currentCamPos);
        
        let newTargetX = currentCamPos.x;
        let newTargetY = currentCamPos.y;
        let shouldJump = false;
        
        // X축 데드존 확인
        if (playerScreenPos.x > screenHalfWidth - CAMERA_EDGE_BUFFER) {
            newTargetX = playerPos.x - (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldJump = true;
        } else if (playerScreenPos.x < -screenHalfWidth + CAMERA_EDGE_BUFFER) {
            newTargetX = playerPos.x + (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldJump = true;
        }
        
        // Y축 데드존 확인
        if (playerScreenPos.y > screenHalfHeight - CAMERA_EDGE_BUFFER) {
            newTargetY = playerPos.y - (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldJump = true;
        } else if (playerScreenPos.y < -screenHalfHeight + CAMERA_EDGE_BUFFER) {
            newTargetY = playerPos.y + (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldJump = true;
        }
        
        // 데드존 벗어나면 즉시 대폭 이동
        if (shouldJump) {
            // 맵 경계 내에서 카메라 제한
            newTargetX = Math.max(mapBounds.minX + screenHalfWidth, 
                                 Math.min(mapBounds.maxX - screenHalfWidth, newTargetX));
            newTargetY = Math.max(mapBounds.minY + screenHalfHeight, 
                                 Math.min(mapBounds.maxY - screenHalfHeight, newTargetY));
            
            const newCamPos = k.vec2(newTargetX, newTargetY);
            const distance = newCamPos.dist(currentCamPos);
            
            if (distance > CAMERA_MIN_DISTANCE) {
                const jumpCamPos = currentCamPos.lerp(newCamPos, CAMERA_JUMP_FACTOR);
                k.camPos(jumpCamPos);
            }
        }
        
        lastPlayerPos = playerPos.clone();
    }

    // 매 프레임마다 카메라 업데이트
    k.onUpdate(() => {
        updateCameraWithBoundaries();
    });



    console.log("✅ UI 바 시스템 초기화 완료");

    // UI 매니저들 초기화 (front.js와 동일)
    const questUIManager = new QuestUIManager(k, gameState);
    // 자동저장은 전역에서 관리되므로 로컬 인스턴스 제거
    
    // NotificationManager는 이제 전역 UI에서 관리됩니다

    // ==============================
    // 전역 시스템 통합 매니저 초기화 (front.js와 완전 동일)
    // ==============================
    
    // 자동저장 매니저 상태 확인
    if (!window.autoSaveManager) {
        console.warn("⚠️ 경고: window.autoSaveManager가 설정되지 않았습니다. 자동저장이 동작하지 않을 수 있습니다.");
    } else {
        console.log("✅ 자동저장 매니저 확인됨:", window.autoSaveManager);
    }
    
    // 수정된 부분: garage 대화 데이터를 올바르게 분리 - 수정 금지!
    // ⚠️ 중요: 이 설정을 임의로 변경하지 마세요! ⚠️
    // garageDialogues는 NPC와 오브젝트 모두를 포함하고 있으므로 올바른 소스를 사용해야 합니다.
    const sceneDialogues = {
        objectDialogues: garageDialogues,  // 오브젝트 대화 (mp3, bench 등)
        npcDialogues: garageDialogues,     // NPC 대화 (student22 등) - garageDialogue.js에서 관리
        npcNames: garageObjectNames,       // NPC 이름도 garageObjectNames에서 관리
        objectNames: garageObjectNames     // 오브젝트 이름
    };
    
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "garage", sceneDialogues);
    
    // 전역 시스템 초기화 (UI, 대화, 인벤토리, 카메라 시스템 포함)
    globalSystemManager.initialize();
    
    // 전역 시스템 매니저 상태 확인
    console.log("🔍 전역 시스템 매니저 상태:", globalSystemManager.getStatus());
    
    // 기존 오브젝트들의 collision 핸들러를 globalDialogue로 교체
    console.log("🔄 기존 오브젝트 collision 핸들러를 globalDialogue로 교체 중...");
    
    // "object" 태그를 가진 모든 엔티티에 대해 globalDialogue 적용
    k.get("object", { recursive: true }).forEach((obj) => {
        if (obj.objectType) {
            console.log(`🔄 ${obj.objectType} collision 핸들러 교체`);
            globalSystemManager.globalDialogue.setupPlayerCollision(obj, obj.objectType, {});
        }
    });
    
    // "interactive-object" 태그를 가진 모든 엔티티에 대해서도 적용
    k.get("interactive-object", { recursive: true }).forEach((obj) => {
        if (obj.objectType) {
            console.log(`🔄 ${obj.objectType} (interactive-object) collision 핸들러 교체`);
            globalSystemManager.globalDialogue.setupPlayerCollision(obj, obj.objectType, {});
        }
    });
    
    // "npc" 태그를 가진 모든 엔티티에 대해서도 적용 (garage NPC들)
    k.get("npc", { recursive: true }).forEach((npc) => {
        if (npc.objectType) {
            console.log(`🔄 ${npc.objectType} (npc) collision 핸들러 교체`);
            globalSystemManager.globalDialogue.setupPlayerCollision(npc, npc.objectType, {});
        }
    });
    
    // "student" 태그를 가진 모든 엔티티에 대해서도 적용 (front.js 호환성)
    k.get("student", { recursive: true }).forEach((npc) => {
        if (npc.studentType) {
            console.log(`🔄 ${npc.studentType} (student) collision 핸들러 교체`);
            globalSystemManager.globalDialogue.setupPlayerCollision(npc, npc.studentType, {});
        }
    });
    
    // 저장된 데이터를 UI에 반영 (front.js와 동일한 방식)
    console.log("📊 저장된 데이터를 UI에 반영 시작");
    
    // 1. 퀘스트 데이터 로드 - front.js와 동일한 방식 (전역 상태 우선)
    let savedQuestData = null;
    const globalQuests = globalState.getGlobalQuests();
    
    // 전역 상태에 퀘스트가 있으면 우선 사용
    if (globalQuests && globalQuests.length > 0) {
        console.log("🔄 전역 상태에서 퀘스트 데이터 복원:", globalQuests.length, "개");
        window.questItems = [...globalQuests];
    } else {
        // 전역 상태에 없으면 저장 데이터에서 로드
        const playerName = globalState.getPlayerName();
        
        if (playerName && playerName.trim() !== "" && playerName !== "플레이어") {
            const existingSaves = gameDataManager.getSaveList();
            const playerSave = existingSaves.find(save => save.playerName === playerName);
            
            if (playerSave && playerSave.questState && playerSave.questState.questItems) {
                savedQuestData = playerSave.questState.questItems;
                console.log("🎯 저장된 퀘스트 데이터 발견:", savedQuestData);
                window.questItems = savedQuestData;
                
                // 로드된 퀘스트를 전역 상태에 저장
                savedQuestData.forEach(quest => {
                    const questWithId = { ...quest, id: quest.targetNpc || quest.targetObject || quest.title };
                    globalState.addToGlobalQuests(questWithId);
                });
            }
        }
    }
    
    // 2. 인벤토리 시스템 로드 (전역 상태에서)
    if (window.inventorySystem) {
        console.log("🔄 인벤토리 시스템 전역 상태에서 로드");
        window.inventorySystem.loadFromGlobalState();
        
        // 아이템이 있으면 인벤토리 표시
        const globalInventory = globalState.getGlobalInventory();
        if (globalInventory && globalInventory.length > 0) {
            window.inventorySystem.show();
            console.log(`📦 인벤토리 표시 (${globalInventory.length}개 아이템)`);
        }
    } else {
        console.log("⚠️ 인벤토리 시스템이 아직 초기화되지 않음");
    }

    // 3. 상태바 즉시 업데이트 (저장된 기분/체력 반영)
    updateStatusBars();
    
    // 4. 퀘스트 아이콘 상태 업데이트
    if (globalSystemManager.globalUI && globalSystemManager.globalUI.updateQuestIcon) {
        globalSystemManager.globalUI.updateQuestIcon();
    }
    
    // 5. 추가 상태바 업데이트 (확실한 반영을 위해)
    k.wait(0.1, () => {
        updateStatusBars();
        console.log("🔄 추가 상태바 업데이트 완료");
    });
    
    console.log("✅ 저장된 데이터 UI 반영 완료");

    // 출입구 충돌 처리는 boundaries 레이어에서 door_to_front로 처리됨
    console.log("✅ 출입구 충돌 처리 설정 완료 (door_to_front로 처리)");

    // ==============================
    // 자동 저장은 전역 시스템 매니저에서 관리됨 (front.js와 동일)
    // ==============================
    // console.log("💾 자동저장 시스템 초기화 완료");
    window.showQuestCompletionMessage = questUIManager.showQuestCompletionMessage.bind(questUIManager);
    
    // 상태 변화 알림 함수
    window.showStatusChangeMessage = (message, type, changeType) => {
        console.log(`📋 상태 변화 알림 요청: ${message} (${type}, ${changeType})`);
        
        if (window.notificationManager) {
            window.notificationManager.addNotification({
                type: 'status',
                message: message,
                statusType: type,
                changeType: changeType
            });
        }
    };



    // 게임패드 컨트롤
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 설정창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 퀘스트창 열기");
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

    // 메인 메뉴 단축키
    setupMainMenuShortcut(k);

    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 Garage 씬 정리 시작");
        
        // 전역 시스템 통합 정리 (자동저장, 인벤토리 포함)
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
        
        console.log("✅ Garage 씬 정리 완료");
    });

    console.log("✅ Garage 씬 로드 완료");
}
