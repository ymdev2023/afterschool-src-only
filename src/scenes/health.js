import { QuestUIManager } from "../uiComponents/questUIManager.js";
import { createUIManager } from "../systems/uiManager.js";
import { gameState, globalState } from "../state/stateManagers.js";
import NotificationManager from "../systems/notificationManager.js";
import { AutoSaveManager } from "../systems/autoSaveManager.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import { healthBar } from "../uiComponents/healthbar.js";
import { 
    generateFirstPlayerComponents,
    setPlayerControls,
    watchPlayerHealth
} from "../entities/player.js";
import { audioManager } from "../utils.js";

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
import healthDialogue from "../content/dialogue/healthDialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { initializeQuestBubbles, updateQuestBubbles } from "../utils.js";
import { UI_POSITIONS, UI_SIZES } from "../uiComponents/uiConstants.js";
import { addQuestSafely } from "../content/questData.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import { getNPCSprite, getHealthSpriteName, getObjectSprite } from "../scene-assets/healthAssets.js";

export default async function health(k) {
    // 실제 이전 씬 상태 가져오기
    const previousScene = gameState.getPreviousScene();
    console.log(`🔄 Health 씬 진입 - 이전 씬: ${previousScene}`);
    console.log(`🔍 Health 씬 진입 초기 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
    
    // ⚠️ 고정 설정 - 수정 금지! ⚠️
    // 맵 전환 시 현재 상태 유지 (저장 데이터 복원 제거)
    const currentPlayerName = globalState.getPlayerName();
    if (!currentPlayerName || currentPlayerName === "undefined") {
        // 플레이어 이름만 설정하고 상태는 현재 값 유지
        const saveList = gameDataManager.getSaveList();
        const latestSave = saveList.length > 0 ? saveList[0] : null;
        if (latestSave) {
            globalState.setPlayerName(latestSave.playerName || "익명");
            console.log(`🔍 Health 씬 플레이어 이름 설정 - 이름: ${globalState.getPlayerName()}, 현재 상태 유지`);
        } else {
            globalState.setPlayerName("익명");
            // 기본값은 게임 시작 시에만 설정
            if (globalState.getMood() === undefined) globalState.setMood(9);
            if (globalState.getHealth() === undefined) globalState.setHealth(9);
            console.log(`🔍 Health 씬 기본값 설정 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
        }
    } else {
        // 기존 플레이어는 현재 globalState 값을 그대로 유지 (맵 전환 시 상태 보존)
        console.log(`🔍 Health 씬 기존 플레이어 상태 유지 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
    }

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 🚀 BGM 즉시 전환 (health 씬 진입)
    console.log("🎵 Health BGM으로 즉시 전환");
    console.log(`🎵 현재 BGM 상태:`, {
        currentBGM: audioManager.currentBGM,
        isPlaying: audioManager.isBGMPlaying(),
        previousScene: gameState.getPreviousScene()
    });
    
    // 강제로 모든 BGM 정지 후 새 BGM 재생
    console.log("🛑 강제 BGM 정지 후 health-bgm 재생");
    audioManager.stopBGM(); // 명시적으로 기존 BGM 정지
    await k.wait(0.1); // 짧은 대기 시간
    audioManager.switchBGM("health-bgm", 0.8);

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);

    // 맵 데이터 가져오기
    console.log("🗺️ health.json 로딩 시작");
    console.log("🔍 healthDialogue 구조 확인:");
    console.log("  - healthDialogue:", healthDialogue);
    console.log("  - healthDialogue.korean:", healthDialogue.korean);
    console.log("  - healthDialogue.english:", healthDialogue.english);
    console.log("  - healthDialogue.npcNames:", healthDialogue.npcNames);
    console.log("  - healthDialogue.objectNames:", healthDialogue.objectNames);
    console.log("  - healthDialogue.objectDialogues:", healthDialogue.objectDialogues);
    
    const mapData = await fetchMapData("./assets/images/health.json");
    const map = k.add([k.pos(0, 0)]);
    
    // 엔티티 저장소
    const entities = {
        player: null,
        npcs: [],
        objects: [],
        students: []
    };
    
    // 전역 시스템 매니저 설정 (health 다이얼로그 사용)
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "health", healthDialogue);
    
    const layers = mapData.layers;
    console.log("🗺️ 레이어 정보:", layers.map(l => ({ name: l.name, type: l.type, objects: l.objects?.length || 'N/A' })));
    
    // 스폰 포인트 처리 먼저
    for (const layer of layers) {
        if (layer.name === "spawnpoint" || layer.name === "spawnpoints") {
            console.log("📍 스폰포인트 레이어 처리");
            if (layer.objects && layer.objects.length > 0) {
                console.log("📋 스폰포인트 객체들:", layer.objects.map(obj => ({ name: obj.name, x: obj.x, y: obj.y })));
                
                // 플레이어 스폰포인트 우선순위 처리 (previousScene 기반)
                const playerSpawns = layer.objects.filter(obj => obj.name && obj.name.includes("player"));
                console.log("🎯 플레이어 스폰포인트들:", playerSpawns);
                console.log("📍 현재 previousScene:", previousScene);
                
                // previousScene에 따른 스폰포인트 우선순위 결정
                let selectedSpawn = null;
                
                // health 씬은 항상 player 스폰포인트를 사용 (기본 진입점)
                const defaultSpawn = layer.objects.find(obj => obj.name === "player");
                console.log("🔍 player 스폰 찾기:", defaultSpawn ? `발견 (${defaultSpawn.x}, ${defaultSpawn.y})` : "없음");
                console.log("🔍 모든 스폰포인트:", layer.objects.map(obj => obj.name));
                
                selectedSpawn = defaultSpawn;
                console.log("🚪 health 진입 - player 스폰 사용");
                
                if (selectedSpawn && !entities.player) {
                    console.log(`🎯 선택된 스폰포인트: ${selectedSpawn.name} at (${selectedSpawn.x}, ${selectedSpawn.y})`);
                    
                    // 스폰 포인트 미세 조정
                    let adjustedX = selectedSpawn.x;
                    let adjustedY = selectedSpawn.y;
                    
                    // player 스폰의 경우 기본 위치 사용 (health 씬의 기본 진입점)
                    if (selectedSpawn.name === "player") {
                        adjustedX = selectedSpawn.x;
                        adjustedY = selectedSpawn.y;
                        console.log(`🎯 player 스폰 사용: (${adjustedX}, ${adjustedY})`);
                    }
                    
                    try {
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(adjustedX, adjustedY))
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
                            generateFirstPlayerComponents(k, k.vec2(adjustedX, adjustedY))
                        );
                        console.log(`🔄 백업 스폰 사용: ${fallbackSpawn.name}`);
                    }
                }
                
                // 다른 스폰포인트 처리
                for (const object of layer.objects) {
                    console.log(`🎯 스폰포인트 처리 중: ${object.name} at (${object.x}, ${object.y})`);
                    
                    if (object.name === "student23") {
                        // student23 NPC 생성
                        entities.student23 = map.add([
                            k.sprite(getHealthSpriteName(), { frame: getNPCSprite("student23") }), // health-assets 스프라이트 사용
                            k.pos(object.x, object.y - 10), // NPC는 스폰포인트 10px 위에 생성 (20픽셀 내림)
                            k.area(),
                            k.body({ isStatic: true }),
                            k.z(1),
                            "npc",
                            "student23",
                            { objectType: "student23" }
                        ]);
                        
                        console.log(`✅ student23 NPC 생성 완료: (${object.x}, ${object.y - 10})`);
                        
                        // student23 대화 시스템 추가
                        entities.student23.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = (locale === "korean" ? healthDialogue.korean : healthDialogue.english)?.student23 || [
                                "어... 머리가 너무 아파요 ㅠㅠ",
                                "Ugh... my head hurts so much ㅠㅠ"
                            ];
                            const speakerName = healthDialogue.npcNames[locale]?.student23 || "student23";                            gameState.setInteractableObject(entities.student23, "npc", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        entities.student23.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 오브젝트를 entities에 추가하여 추적
                        entities.students.push(entities.student23);
                    }
                    
                    if (object.name === "student30") {
                        // student30 NPC 생성
                        entities.student30 = map.add([
                            k.sprite(getHealthSpriteName(), { frame: getNPCSprite("student30") }), // health-assets 스프라이트 사용
                            k.pos(object.x, object.y - 10), // NPC는 스폰포인트 10px 위에 생성 (20픽셀 내림)
                            k.area(),
                            k.body({ isStatic: true }),
                            k.z(1),
                            "npc",
                            "student30",
                            { objectType: "student30" }
                        ]);
                        
                        console.log(`✅ student30 NPC 생성 완료: (${object.x}, ${object.y - 10})`);
                        
                        // student30을 일반 object로 처리
                        entities.student30.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = (locale === "korean" ? healthDialogue.korean : healthDialogue.english)?.student30 || ["대화 데이터 없음"];
                            const speakerName = healthDialogue.npcNames[locale]?.student30 || "문동은";
                            
                            gameState.setInteractableObject(entities.student30, "object", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        entities.student30.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 오브젝트를 entities에 추가하여 추적
                        entities.students.push(entities.student30);
                    }
                    
                    if (object.name === "teacher") {
                        // teacher NPC 생성
                        console.log("🎯 Teacher NPC 생성 시작:", object);
                        entities.teacher = map.add([
                            k.sprite(getHealthSpriteName(), { frame: getNPCSprite("teacher") }), // health-assets 스프라이트 사용
                            k.pos(object.x, object.y - 10), // NPC는 스폰포인트 10px 위에 생성 (20픽셀 내림)
                            k.area(),
                            k.body({ isStatic: true }),
                            k.z(1),
                            "npc",
                            "teacher",
                            { objectType: "teacher" }
                        ]);
                        
                        console.log(`✅ teacher NPC 생성 완료: (${object.x}, ${object.y - 10})`);
                        console.log("🔍 Teacher entity:", entities.teacher);
                        
                        // teacher를 일반 object로 처리
                        entities.teacher.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = (locale === "korean" ? healthDialogue.korean : healthDialogue.english)?.teacher || ["대화 데이터 없음"];
                            const speakerName = healthDialogue.npcNames[locale]?.teacher || "보건교사";
                            
                            gameState.setInteractableObject(entities.teacher, "object", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        entities.teacher.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 오브젝트를 entities에 추가하여 추적
                        entities.npcs.push(entities.teacher);
                    }
                }
            }
        }
    }

    // 경계선 그리기 (상호작용 오브젝트는 제외)
    try {
        const boundariesLayer = layers.find(layer => layer.name === "boundaries");
        if (boundariesLayer) {
            // 상호작용 오브젝트들은 따로 처리하므로 drawBoundaries에서 제외
            const excludeNames = ["door_to_second", "sofa", "bed1", "bed2", "bed3", "bed4", "computer_desk", "drawer", "student23", "student30", "teacher"];
            drawBoundaries(k, map, boundariesLayer, excludeNames);
        } else {
            console.warn("⚠️ boundaries 레이어를 찾을 수 없음");
        }
    } catch (error) {
        console.warn("⚠️ 경계선 그리기 실패:", error);
    }

    // 타일 레이어 렌더링
    for (const layer of layers) {
        // 스폰포인트와 경계선 레이어는 건너뛰기
        if (layer.name === "spawnpoint" || layer.name === "spawnpoints" || layer.name === "boundaries") {
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🎨 Health Layer ${layer.name} info:`, {
                name: layer.name,
                type: layer.type,
                opacity: layer.opacity,
                visible: layer.visible,
                chunks: layer.chunks.length
            });
            for (const chunk of layer.chunks) {
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

                        // health.json은 health-assets 스프라이트를 사용
                        const tileEntity = map.add([
                            k.sprite("health-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                        ]);
                        
                        tilesAdded++;
                    }
                }
                console.log(`✅ Health Layer ${layer.name} chunk: ${tilesAdded} tiles added`);
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

                // Use health-assets sprite (health.json과 호환)
                map.add([
                    k.sprite("health-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                ]);
                tilesAdded++;
            }
            console.log(`✅ Health Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 상호작용 오브젝트 레이어 처리
    for (const layer of layers) {
        if ((layer.name === "object" || layer.name === "boundaries") && layer.objects) {
            console.log(`🎯 ${layer.name} 레이어 처리`);
            console.log(`🔍 오브젝트 수: ${layer.objects.length}`);
            
            // 레이어의 모든 오브젝트 이름 목록 출력
            const objectNames = layer.objects.map(obj => obj.name);
            console.log(`📋 레이어 내 오브젝트들: [${objectNames.join(', ')}]`);
            
            for (const object of layer.objects) {
                const objectType = object.name;
                console.log(`🎯 오브젝트 처리 중: ${objectType} at (${object.x}, ${object.y})`);
                
                // sofa와 drawer 특별 디버깅
                if (objectType === "sofa" || objectType === "drawer") {
                    console.log(`🔍 ${objectType} 특별 디버깅:`);
                    console.log(`  - 위치: (${object.x}, ${object.y})`);
                    console.log(`  - 크기: ${object.width} x ${object.height}`);
                    console.log(`  - 대화 내용 확인중...`);
                }
                
                // door_second 또는 door_to_second 처리 - second.js로 돌아가기
                if (objectType === "door_second" || objectType === "door_to_second") {
                    const doorEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 20), // 문 콜라이더도 위로 올려서 충돌하기 쉽게
                        k.opacity(0),
                        "door_second",
                        "interactive-object",
                        { objectType: "door_second" },
                    ]);

                    doorEntity.onCollide("player", () => {
                        console.log("🚪 door_to_second 충돌 - second로 이동");
                        k.play("door-open-sfx", { volume: 0.5 });
                        
                        gameState.setPreviousScene("health");
                        k.go("second");
                    });
                    continue;
                }

                // 일반 상호작용 오브젝트 처리 (컴퓨터 책상, 서랍장, 침대, 소파 등)
                console.log(`📦 일반 오브젝트 처리: ${objectType}`);
                
                // sofa와 drawer는 특별한 위치 조정 필요 (콜라이더가 아래에 있음)
                let yOffset = -10; // 기본값: 10px 위로
                if (objectType === "sofa" || objectType === "drawer") {
                    yOffset = -10; // sofa와 drawer도 일반 오브젝트와 동일하게 조정
                    console.log(`🔧 ${objectType} 특별 위치 조정: y-offset = ${yOffset}`);
                }
                
                const objectEntity = map.add([
                    k.rect(object.width, object.height),
                    k.area(),
                    k.body({ isStatic: true }),
                    k.pos(object.x, object.y + yOffset), // 동적 y-offset 적용
                    k.opacity(0),
                    objectType,
                    "interactive-object",
                    { objectType },
                ]);

                console.log(`✅ ${objectType} 엔티티 생성 완료 at (${object.x}, ${object.y + yOffset})`);

                // 상호작용 시스템
                objectEntity.onCollide("player", (player) => {
                    const locale = gameState.getLocale();
                    
                    console.log(`🎮 ${objectType} 상호작용 트리거됨 (${locale})`);
                    console.log(`🔍 상호작용 객체 정보:`, {
                        objectType: objectType,
                        objectName: object.name,
                        tags: objectEntity.tags ? [...objectEntity.tags] : [],
                        hasWallTag: objectEntity.hasTag ? objectEntity.hasTag("wall") : false,
                        hasNonInteractiveTag: objectEntity.hasTag ? objectEntity.hasTag("non-interactive") : false
                    });
                    
                    // 벽 콜라이더나 이름없는 객체는 상호작용 제외
                    if (!object.name || object.name === "" || 
                        (objectEntity.hasTag && objectEntity.hasTag("wall")) ||
                        (objectEntity.hasTag && objectEntity.hasTag("non-interactive"))) {
                        console.log(`🚫 벽 콜라이더 또는 이름없는 객체이므로 상호작용 제외`);
                        return;
                    }
                    
                    let content, speakerName;
                    
                    // sofa는 박혜인 학생이므로 objectDialogues에서 가져옴
                    if (objectType === "sofa") {
                        content = healthDialogue.objectDialogues[locale]?.sofa || [
                            "다이얼로그가 없습니다: sofa"
                        ];
                        speakerName = healthDialogue.objectNames[locale]?.sofa || "sofa";
                        console.log(`💬 sofa(박혜인) 특별 처리:`, { content, speakerName });
                    }
                    // drawer는 objectDialogues에서 가져옴
                    else if (objectType === "drawer") {
                        content = healthDialogue.objectDialogues[locale]?.drawer || [
                            "다이얼로그가 없습니다: drawer"
                        ];
                        speakerName = healthDialogue.objectNames[locale]?.drawer || "drawer";
                        console.log(`💬 drawer 특별 처리:`, { content, speakerName });
                    }
                    // 일반 오브젝트의 경우 objectDialogues에서 가져옴
                    else {
                        content = healthDialogue.objectDialogues[locale]?.[objectType] || [
                            `다이얼로그가 없습니다: ${objectType}`
                        ];
                        speakerName = healthDialogue.objectNames[locale]?.[objectType] || objectType;
                    }

                    console.log(`💬 ${objectType} 최종 대화 설정:`, { content, speakerName });

                    gameState.setInteractableObject(
                        objectEntity,
                        "object",
                        {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        }
                    );
                });

                objectEntity.onCollideEnd("player", (player) => {
                    gameState.clearInteractableObject();
                });

                // 오브젝트를 entities에 추가하여 추적
                entities.objects.push(objectEntity);
            }
        }
    }

    // 플레이어가 없으면 기본 위치에 생성
    if (!entities.player) {
        console.log("⚠️ 스폰포인트가 없음 - 기본 위치에 플레이어 생성");
        entities.player = map.add(
            generateFirstPlayerComponents(k, k.vec2(100, 100))
        );
    }

    // 플레이어 컨트롤 설정
    setPlayerControls(k, entities.player);
    watchPlayerHealth(k, entities.player);

    // 카메라 설정 (다른 맵과 동일하게)
    k.camScale(2); // second.js와 동일하게 2로 설정

    // 초기 카메라 위치 설정 (플레이어보다 약간 위로)
    if (entities.player) {
        const initialCamPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50); // Y축을 50px 위로
        k.camPos(initialCamPos);
    }

    // 카메라가 플레이어를 부드럽게 따라가도록 설정
    const CAMERA_SMOOTH_FACTOR = 0.1;
    let targetCameraPos = k.camPos();
    
    entities.player.onUpdate(() => {
        // 플레이어 위치를 기준으로 목표 카메라 위치 계산
        const targetPlayerPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50);
        
        const currentCamPos = k.camPos();
        const screenHalfWidth = k.width() / (2 * k.camScale().x);
        const screenHalfHeight = k.height() / (2 * k.camScale().y);
        
        // 플레이어가 화면 중앙에서 벗어날 때만 카메라 이동
        const playerScreenPos = targetPlayerPos.sub(currentCamPos);
        
        if (Math.abs(playerScreenPos.x) > screenHalfWidth * 0.3) {
            targetCameraPos.x = targetPlayerPos.x;
        }
        if (Math.abs(playerScreenPos.y) > screenHalfHeight * 0.3) {
            targetCameraPos.y = targetPlayerPos.y;
        }
        
        // 부드러운 카메라 이동
        const distance = targetCameraPos.dist(currentCamPos);
        if (distance > 1) {
            const newCamPos = currentCamPos.lerp(targetCameraPos, CAMERA_SMOOTH_FACTOR);
            k.camPos(newCamPos);
        }
    });

    // UI 매니저들 초기화
    const questUIManager = new QuestUIManager(k, gameState);
    
    // 전역 시스템 초기화
    globalSystemManager.initialize();
    
    const globalUI = globalSystemManager.globalUI;
    
    // updateStatusBars를 전역에서 접근 가능하도록 설정
    if (globalUI && globalUI.updateStatusBars) {
        window.updateStatusBars = globalUI.updateStatusBars.bind(globalUI);
    } else {
        console.warn("⚠️ globalUI 또는 updateStatusBars가 초기화되지 않음");
    }

    // 게임 상태 관리
    setupMainMenuShortcut(k);

    // AutoSave 시스템 확인 (main.js에서 설정된 전역 autoSaveManager 사용)
    if (!window.autoSaveManager) {
        console.warn("⚠️ 경고: window.autoSaveManager가 설정되지 않았습니다. 자동저장이 동작하지 않을 수 있습니다.");
    } else {
        console.log("✅ 자동저장 매니저 확인됨:", window.autoSaveManager);
    }

    console.log("🏥 Health 씬 초기화 완료");

    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 health 씬 종료 - 정리 시작");
        
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
        
        console.log("✅ health 씬 정리 완료");
    });
}
