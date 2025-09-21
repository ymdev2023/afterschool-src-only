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
import second2Dialogues, { second2ObjectNames } from "../content/dialogue/second2Dialogue.js";
import { getStudentSpriteConfig } from "../scene-assets/second2Assets.js";
import { dialog } from "../uiComponents/dialog.js";
import { initializeQuestBubbles, updateQuestBubbles } from "../utils.js";

export default async function second2(k) {
    console.log("🏫 second2 scene 시작");

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Second2 BGM으로 즉시 전환");
    audioManager.switchBGM("second-bgm", 0.3);

    const previousScene = gameState.getPreviousScene();
    console.log(`🔄 이전 씬: ${previousScene}`);

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/second2.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
    };
    const layers = mapData.layers;
    
    // 🔑 매뉴얼에 따른 전역 시스템 매니저 초기화
    const sceneDialogues = {
        objectDialogues: second2Dialogues.objectDialogues,
        objectNames: second2Dialogues.objectNames,
        npcDialogues: second2Dialogues,
        names: second2Dialogues.npcNames
    };
    
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "second2", sceneDialogues);
    
    // 전역 시스템 초기화
    globalSystemManager.initialize();
    
    console.log("📊 전역 시스템 매니저 초기화 완료");

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoints") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                // 플레이어 스폰포인트 우선순위 처리 (previousScene 기반)
                const playerSpawns = layer.objects.filter(obj => obj.name && obj.name.includes("player"));
                console.log("🎯 플레이어 스폰포인트들:", playerSpawns.map(s => s.name));

                const previousScene = gameState.getPreviousScene();
                
                // previousScene에 따른 스폰포인트 우선순위 결정
                let selectedSpawn = null;
                
                if (previousScene === "second") {
                    // second에서 온 경우 player_second 스폰포인트 사용
                    selectedSpawn = layer.objects.find(obj => obj.name === "player_second") || 
                                  layer.objects.find(obj => obj.name === "player");
                    console.log("🏫 second에서 진입 - player_second 스폰 사용");
                } else {
                    // 기본 경우
                    selectedSpawn = layer.objects.find(obj => obj.name === "player");
                    console.log("🎮 기본 진입 - player 스폰 사용");
                }

                if (selectedSpawn) {
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
                        console.log(`✅ 백업 스폰 사용: ${fallbackSpawn.name}`);
                    }
                }
                
                // 다른 오브젝트 처리
                for (const object of layer.objects) {
                    // second2에서는 student가 boundaries 레이어에 있으므로 spawnpoint에서는 처리하지 않음
                    if (object.name.startsWith("student")) {
                        console.log(`� Student ${object.name}는 boundaries 레이어에서 처리됩니다.`);
                        continue;
                    }

                    // Letter 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letterId =
                            object.properties?.find((p) => p.name === "letterId")
                                ?.value || letterType;

                        const letter = map.add(
                            generateNoteComponents(k, k.vec2(object.x, object.y), letterId)
                        );

                        entities.letters.push(letter);

                        // Letter 상호작용 시스템
                        letter.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = noteDialogues[locale]?.[letterId] || [
                                `This is ${letterId}`,
                                `이것은 ${letterId}입니다`,
                            ];

                            const speakerName = noteDialogues.names[locale]?.[letterId] || letterId;

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
            console.log("🚧 Boundaries 오브젝트 목록:", layer.objects.map(obj => obj.name));
            
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                console.log(`🔍 처리 중인 오브젝트: ${object.name}`);
                
                if (
                    [
                        "door_to_second",
                        "door_wc3",
                        "elevator",
                        "door_to_top",
                        "door_art",
                        "waste_bin",
                        "boxes",
                        "student70",
                        "student71",
                        "student72",
                        "student73",
                        "student74",
                        "student75",
                        "student76",
                        "student77",
                        "student78",
                        "student79",
                        "student80",
                        "cam",
                        "student_desk1",
                        "student_desk2",
                        "desk_set",
                        "art_tools",
                        "art_bookcase",
                        "desks",
                        // 필요한 다른 오브젝트들 추가
                    ].includes(object.name)
                ) {
                    console.log(`✅ 처리 목록에 포함됨: ${object.name}`);
                    const objectType = object.name;

                    // door_to_second는 특별히 처리 - second로 이동
                    if (objectType === "door_to_second") {
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(`🚪 ${objectType} 충돌 - second로 이동`);
                            k.play("door-open-sfx");
                            k.wait(0.2, () => {
                                k.play("door-close-sfx");
                            });
                            gameState.setPreviousScene("second2");
                            k.go("second");
                        });
                        continue;
                    }

                    // student 오브젝트 특별 처리
                    if (objectType.startsWith("student") || objectType === "cam" || objectType.includes("desk")) {
                        console.log(`🎓 Student/Object ${objectType} boundaries 오브젝트 생성 중...`);
                        
                        const studentEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더를 위로 10px 올림
                            k.opacity(0),
                            objectType,
                            "student",
                            "interactive-object",
                            { objectType, studentType: objectType },
                        ]);

                        // Student 상호작용 시스템
                        studentEntity.onCollide("player", (player) => {
                            console.log(`🎯 Student ${objectType} 충돌 감지`);
                            
                            // cam 오브젝트인 경우 cute-sfx.mp3 재생
                            if (objectType === "cam") {
                                console.log("📹 cam 오브젝트와 상호작용 - cute-sfx.mp3 재생");
                                k.play("cute-sfx");
                            }
                            
                            const locale = gameState.getLocale();
                            console.log(`🗣️ 현재 로케일: ${locale}`);
                            
                            // objectDialogues 구조 사용
                            const content = second2Dialogues.objectDialogues[locale]?.[objectType] || [
                                `Hello! I'm ${objectType}!`,
                                `안녕하세요! 저는 ${objectType}입니다!`,
                            ];
                            console.log(`💬 대화 내용:`, content);

                            const speakerName = second2ObjectNames[locale]?.[objectType] || objectType;
                            console.log(`👤 스피커 이름: ${speakerName}`);

                            gameState.setInteractableObject(studentEntity, "student", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        studentEntity.onCollideEnd("player", (player) => {
                            console.log(`👋 Student ${objectType} 충돌 종료`);
                            gameState.clearInteractableObject();
                        });
                        
                        if (objectType.startsWith("student")) {
                            entities.students.push(studentEntity);
                        }
                        console.log(`✅ Student/Object ${objectType} boundaries 오브젝트 생성 완료`);
                        continue;
                    }

                    // 일반 상호작용 오브젝트 처리
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // 콜라이더를 위로 10px 올림
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        { objectType },
                    ]);

                    // 🔑 매뉴얼에 따른 상호작용 시스템 (onCollide 사용)
                    objectEntity.onCollide("player", (player) => {
                        const locale = gameState.getLocale();
                        const dialogueData = second2Dialogues.objectDialogues[locale]?.[objectType];
                        
                        if (dialogueData) {
                            console.log(`🎯 ${objectType} 상호작용 설정 (onCollide)`);
                            gameState.setInteractableObject(
                                objectEntity,
                                "object",  // 🔑 핵심: 고정값 사용
                                {
                                    content: dialogueData,
                                    speakerName: second2Dialogues.objectNames[locale]?.[objectType] || objectType,
                                    speakerImage: null,
                                }
                            );
                        }
                    });

                    // 🔑 핵심: 상호작용 해제 (대화 반복 방지)
                    objectEntity.onCollideEnd("player", (player) => {
                        console.log(`🎯 ${objectType} 오브젝트에서 벗어남 - 상호작용 해제`);
                        gameState.clearInteractableObject();
                    });

                    // entities에 추가
                    if (!entities.objects) entities.objects = [];
                    entities.objects.push(objectEntity);
                } else {
                    // 처리 목록에 없는 오브젝트는 일반 경계선으로 처리
                    console.log(`❌ 처리 목록에 없음: ${object.name} - 일반 경계선으로 처리`);
                    
                    // 일반 경계선 처리
                    const tag = object.name !== "" ? object.name : object.type || "wall";
                    
                    console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                    
                    const collider = map.add([
                        k.rect(object.width, object.height),
                        k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                        k.area(),
                        k.body({ isStatic: true }),
                        k.opacity(0),
                        tag,
                    ]);
                }
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
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

                        // second2.json은 second2-assets 스프라이트를 사용
                        const tileEntity = map.add([
                            k.sprite("second2-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                        ]);
                        
                        if (tilesAdded < 5) {
                            console.log(`🎨 Second2 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
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

                let zIndex = 0;
                if (layer.name === "upmost") {
                    zIndex = 3;
                } else if (layer.name === "cha") {
                    zIndex = 1;
                }

                // Use second2-assets sprite
                map.add([
                    k.sprite("second2-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                ]);
                tilesAdded++;
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 플레이어가 스폰되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log("⚠️ 플레이어 스폰 포인트를 찾을 수 없어 기본 위치에 생성합니다.");
        entities.player = map.add(
            generateFirstPlayerComponents(k, k.vec2(200, 200))
        );
    }

    setPlayerControls(k, entities.player);

    k.camScale(2);
    
    // 맵 크기 계산
    const mapBounds = {
        minX: -32 * 24,
        minY: -16 * 24,
        maxX: (16 + 16) * 24,
        maxY: (16 + 16) * 24,
    };

    console.log("🗺️ Second2 맵 경계:", mapBounds);

    // 카메라 초기 위치 설정
    if (entities.player && entities.player.exists()) {
        const initialCamPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50);
        k.camPos(initialCamPos);
    }

    // 경계 기반 카메라 추적 시스템
    const CAMERA_EDGE_BUFFER = 120;
    const CAMERA_SMOOTH_FACTOR = 0.1;
    const CAMERA_MIN_DISTANCE = 8;
    let targetCameraPos = k.camPos();
    let lastPlayerPos = entities.player ? entities.player.pos.clone() : k.vec2(0, 0);

    function updateCameraWithBoundaries() {
        if (!entities.player || !entities.player.exists()) return;

        const playerPos = entities.player.pos;
        const currentCamPos = k.camPos();
        const screenHalfWidth = k.width() / (2 * k.camScale().x);
        const screenHalfHeight = k.height() / (2 * k.camScale().y);
        
        if (playerPos.dist(lastPlayerPos) < 1) return;
        
        const CAMERA_Y_OFFSET = -30;
        const targetPlayerPos = k.vec2(playerPos.x, playerPos.y + CAMERA_Y_OFFSET);
        
        const playerScreenPos = targetPlayerPos.sub(currentCamPos);
        
        let newTargetX = targetCameraPos.x;
        let newTargetY = targetCameraPos.y;
        let shouldUpdate = false;
        
        // X축 경계 확인
        if (playerScreenPos.x > screenHalfWidth - CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x - (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.x < -screenHalfWidth + CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x + (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        // Y축 경계 확인
        if (playerScreenPos.y > screenHalfHeight - CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y - (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.y < -screenHalfHeight + CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y + (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        if (shouldUpdate) {
            newTargetX = Math.max(mapBounds.minX + screenHalfWidth, 
                                 Math.min(mapBounds.maxX - screenHalfWidth, newTargetX));
            newTargetY = Math.max(mapBounds.minY + screenHalfHeight, 
                                 Math.min(mapBounds.maxY - screenHalfHeight, newTargetY));
            
            targetCameraPos = k.vec2(newTargetX, newTargetY);
        }
        
        const distance = targetCameraPos.dist(currentCamPos);
        if (distance > CAMERA_MIN_DISTANCE) {
            const newCamPos = currentCamPos.lerp(targetCameraPos, CAMERA_SMOOTH_FACTOR);
            k.camPos(newCamPos);
        }
        
        lastPlayerPos = playerPos.clone();
    }

    // 매 프레임마다 카메라 업데이트
    k.onUpdate(updateCameraWithBoundaries);

    // 퀘스트 말풍선 시스템 초기화
    if (entities.students.length > 0) {
        initializeQuestBubbles(k, entities.students, map);
    }

    watchPlayerHealth(k);

    // 게임패드 컨트롤 (기존 L/R 버튼을 다른 기능으로 사용하는 씬이므로 유지)
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 언어 변경");
        // toggleLocale는 utils에서 제거되었으므로 주석 처리
        // toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 음소거 토글");
        // 전역 시스템 매니저를 통해 음소거 처리
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.toggleMute();
        }
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 언어 변경");
        // toggleLocale는 utils에서 제거되었으므로 주석 처리
        // toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 음소거 토글");
        // 전역 시스템 매니저를 통해 음소거 처리
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.toggleMute();
        }
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);
}
