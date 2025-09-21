import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    generateClass2PlayerComponents,
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
import class2Dialogues, { class2ObjectNames, class2NpcNames, class2ObjectDialogues, class2NpcDialogues } from "../content/dialogue/class2Dialogue.js";
import { getStudentSpriteConfig } from "../scene-assets/class2Assets.js";
import { dialog } from "../uiComponents/dialog.js";
import { initializeQuestBubbles, updateQuestBubbles } from "../utils.js";

export default async function class2(k) {
    console.log("🏫 class2 scene 시작");

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Class2 BGM으로 즉시 전환 - DEBUGGING: class2-bgm 사용");
    audioManager.switchBGM("class2-bgm", 0.3); // class2 전용 BGM 사용 - DEFINITELY class2-bgm

    const previousScene = gameState.getPreviousScene();
    console.log(`🔄 이전 씬: ${previousScene}`);

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/class2.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
    };
    const layers = mapData.layers;
    
    // 🔑 매뉴얼에 따른 전역 시스템 매니저 초기화
    // Scene Dialogue Setup (매뉴얼 형식에 맞게)
    const sceneDialogues = {
        korean: class2Dialogues.korean,
        english: class2Dialogues.english,
        objectDialogues: class2ObjectDialogues,
        npcDialogues: class2NpcDialogues,
        objectNames: class2ObjectNames,
        npcNames: class2NpcNames
    };    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "class2", sceneDialogues);
    
    // 전역 시스템 초기화
    globalSystemManager.initialize();
    
    console.log("📊 전역 시스템 매니저 초기화 완료");

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                // 플레이어 스폰포인트 우선순위 처리 (previousScene 기반)
                const playerSpawns = layer.objects.filter(obj => obj.name && obj.name.includes("player"));
                console.log("🎯 플레이어 스폰포인트들:", playerSpawns.map(s => s.name));

                const previousScene = gameState.getPreviousScene();
                const targetSpawn = gameState.getTargetSpawn(); // 목표 스폰포인트 확인
                
                // targetSpawn이 지정된 경우 우선 사용
                let selectedSpawn = null;
                
                if (targetSpawn) {
                    selectedSpawn = layer.objects.find(obj => obj.name === targetSpawn);
                    if (selectedSpawn) {
                        console.log(`🎯 목표 스폰포인트 사용: ${targetSpawn}`);
                    } else {
                        console.warn(`⚠️ 목표 스폰포인트 '${targetSpawn}'을 찾을 수 없음`);
                    }
                }
                
                // targetSpawn이 없거나 찾을 수 없으면 previousScene 기반으로 결정
                if (!selectedSpawn) {
                    if (previousScene === "second") {
                        // second에서 온 경우 player_front 스폰포인트 사용 (door_class2에서 들어옴)
                        selectedSpawn = layer.objects.find(obj => obj.name === "player_front") || 
                                      layer.objects.find(obj => obj.name === "player");
                        console.log("🏫 second에서 진입 - player_front 스폰 사용");
                    } else {
                        // 기본 경우
                        selectedSpawn = layer.objects.find(obj => obj.name === "player");
                        console.log("🎮 기본 진입 - player 스폰 사용");
                    }
                }

                if (selectedSpawn) {
                    entities.player = map.add(
                        generateClass2PlayerComponents(k, k.vec2(selectedSpawn.x, selectedSpawn.y))
                    );
                    console.log(`✅ 플레이어 생성 성공: ${selectedSpawn.name} (${selectedSpawn.x}, ${selectedSpawn.y})`);
                    
                    // 스폰 성공시 targetSpawn 클리어
                    gameState.setTargetSpawn(null);
                } else if (!entities.player) {
                    console.warn("⚠️ 적절한 스폰포인트를 찾을 수 없음 - 기본 위치 사용");

                    const fallbackSpawn = layer.objects.find(obj => obj.name && obj.name.includes("player"));
                    if (fallbackSpawn) {
                        entities.player = map.add(
                            generateClass2PlayerComponents(k, k.vec2(fallbackSpawn.x, fallbackSpawn.y))
                        );
                        console.log(`✅ 백업 스폰 사용: ${fallbackSpawn.name}`);
                    }
                }
                
                // 다른 오브젝트 처리
                for (const object of layer.objects) {
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
                
                // Student NPC 처리 (boundaries 레이어에서)
                if (object.name && object.name.startsWith("student")) {
                    const studentType = object.name;
                    console.log(`🎭 Boundaries에서 Student 영역 생성: ${studentType} at (${object.x}, ${object.y})`);
                    console.log(`🔍 student 대화 확인: ${studentType} ->`, class2NpcDialogues.korean?.[studentType]);
                    
                    // 투명한 콜라이더만 생성
                    const student = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // Y 위치를 10픽셀 위로 조정
                        k.opacity(0), // 완전히 투명
                        studentType, // 구체적인 student 타입 사용
                        "interactive-object", // globalSystemManager 중복 방지
                        { objectType: studentType }, // objectType을 구체적인 student 타입으로 설정
                    ]);

                    entities.students.push(student);
                    console.log(`✅ Boundaries Student ${studentType} 영역 생성 완료, 총 학생 수: ${entities.students.length}`);

                    // Student 상호작용 시스템
                    student.onCollide("player", (player) => {
                        console.log(`🎯 Student ${studentType}와 충돌 감지`);
                        const locale = gameState.getLocale();
                        
                        const content = class2NpcDialogues[locale]?.[studentType] || [
                            `Hello! I'm ${studentType}!`,
                            `안녕하세요! 저는 ${studentType}입니다!`,
                        ];
                        
                        const speakerName = class2NpcNames[locale]?.[studentType] || studentType;

                        console.log(`💬 대화 설정: ${speakerName} - ${content[0]}`);

                        gameState.setInteractableObject(student, "object", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    student.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    continue;
                }
                
                if (
                    [
                        "door_from_second",
                        "door_from_second_back",
                        "cleaning_cabinet",
                        "training_clothes", 
                        "mop",
                        "cleaning_tool1",
                        "cleaning_tool2",
                    ].includes(object.name)
                ) {
                    console.log(`✅ 처리 목록에 포함됨: ${object.name}`);
                    const objectType = object.name;

                    // door_from_second는 특별히 처리 - second로 이동 (player_front2 스폰)
                    if (objectType === "door_from_second") {
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
                            console.log(`🚪 ${objectType} 충돌 - second로 이동 (player_front2 스폰)`);
                            k.play("door-open-sfx");
                            k.wait(0.2, () => {
                                k.play("door-close-sfx");
                            });
                            gameState.setPreviousScene("class2");
                            gameState.setTargetSpawn("player_front2"); // 목표 스폰포인트 설정
                            k.go("second");
                        });
                        continue;
                    }

                    // door_from_second_back은 특별히 처리 - second로 이동 (player_back2 스폰)
                    if (objectType === "door_from_second_back") {
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
                            console.log(`🚪 ${objectType} 충돌 - second로 이동 (player_back2 스폰)`);
                            k.play("door-open-sfx");
                            k.wait(0.2, () => {
                                k.play("door-close-sfx");
                            });
                            gameState.setPreviousScene("class2");
                            gameState.setTargetSpawn("player_back2"); // 목표 스폰포인트 설정
                            k.go("second");
                        });
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
                        const dialogueData = class2ObjectDialogues[locale]?.[objectType];
                        
                        if (dialogueData) {
                            console.log(`🎯 ${objectType} 상호작용 설정 (onCollide)`);
                            gameState.setInteractableObject(
                                objectEntity,
                                "object",  // 🔑 핵심: 고정값 사용
                                {
                                    content: dialogueData,
                                    speakerName: class2ObjectNames[locale]?.[objectType] || objectType,
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

                        // class2.json은 class1-assets 스프라이트를 사용 (동일한 교실 스타일)
                        const tileEntity = map.add([
                            k.sprite("class2-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                        ]);
                        
                        if (tilesAdded < 5) {
                            console.log(`🎨 Class2 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
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

                // Use class2-assets sprite
                map.add([
                    k.sprite("class2-assets", { frame: tile - 1 }),
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
        // 타일맵 중앙 부근에 플레이어 생성 (타일들이 음수 좌표에 있으므로)
        entities.player = map.add(
            generateClass2PlayerComponents(k, k.vec2(-200, -300))
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

    console.log("🗺️ Class2 맵 경계:", mapBounds);

    k.camScale(2);
    
    // 카메라 애니메이션 중인지 플래그
    let isCameraAnimating = false;

    // 카메라 애니메이션 상태를 전역 카메라 매니저에 전달
    if (globalSystemManager.globalCamera) {
        globalSystemManager.globalCamera.setCameraAnimating(isCameraAnimating);
    }

    // 기본 카메라 따라가기 시스템 (플레이어가 스폰된 후에 실행)
    const setupCameraFollow = () => {
        if (entities.player && entities.player.exists()) {
            k.camPos(entities.player.pos);
            console.log("🎯 Class2 카메라 위치 설정:", entities.player.pos);
            
            // 카메라가 플레이어를 따라가는 업데이트 루프
            k.onUpdate(() => {
                if (entities.player && entities.player.exists() && !isCameraAnimating) {
                    const playerPos = entities.player.pos;
                    const currentCamPos = k.camPos();
                    
                    // 데드존 시스템 (움직임이 충분할 때만 카메라 이동)
                    const deadzone = 20;
                    const deltaX = playerPos.x - currentCamPos.x;
                    const deltaY = playerPos.y - currentCamPos.y;
                    
                    if (Math.abs(deltaX) > deadzone || Math.abs(deltaY) > deadzone) {
                        const lerpSpeed = 0.1;
                        const newCamPos = k.vec2(
                            k.lerp(currentCamPos.x, playerPos.x, lerpSpeed),
                            k.lerp(currentCamPos.y, playerPos.y, lerpSpeed)
                        );
                        k.camPos(newCamPos);
                    }
                }
            });
        } else {
            // 플레이어가 아직 없으면 잠시 후 다시 시도
            k.wait(0.1, setupCameraFollow);
        }
    };

    // 플레이어 스폰 후 카메라 시스템 초기화
    setupCameraFollow();

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
