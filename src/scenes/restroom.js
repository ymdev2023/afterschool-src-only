import { healthBar } from "../uiComponents/healthbar.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import { gameState, globalState } from "../state/stateManagers.js";
import { fadeInBGM, audioManager } from "../utils.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
} from "../utils.js";

import { dialog } from "../uiComponents/dialog.js";
import { toggleLocale, toggleMute, initializeQuestBubbles, updateQuestBubbles } from "../utils.js";
import { restroomDialogue } from "../content/dialogue/restroomDialogue.js";

// 전역 시스템 매니저를 사용하므로 로컬 UI 시스템은 제거됨

export default async function restroom(k) {
    console.log("🚻 restroom scene 시작");

    // 🚀 즉시 BGM 전환 (새로운 switchBGM 사용)
    console.log("🎵 Restroom BGM으로 즉시 전환");
    audioManager.switchBGM("restroom-bgm", 0.8);

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 알림 매니저는 전역 UI에서 관리됨

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/restroom.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
    };
    const layers = mapData.layers;

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        console.log("🎮 플레이어 스폰포인트 발견:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }

                    // first에서 온 경우 (일반 스폰포인트)
                    if (
                        object.name === "player" &&
                        previousScene === "first"
                    ) {
                        console.log("🚪 1층에서 온 플레이어 스폰포인트 사용:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }

                    // first에서 온 경우 (화장실 전용 스폰포인트)
                    if (
                        object.name === "from_first" &&
                        previousScene === "first"
                    ) {
                        console.log("🚪 1층에서 온 플레이어 스폰포인트 사용:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }

                    // restroom에서는 student가 boundaries 레이어에 있으므로 spawnpoint에서는 처리하지 않음
                    // student 처리는 boundaries 레이어에서 수행됨
                    if (object.name.startsWith("student")) {
                        console.log(`🎓 Student ${object.name}는 boundaries 레이어에서 처리됩니다.`);
                        continue;
                    }

                    // Letter 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letterId =
                            object.properties?.find((p) => p.name === "letterId")
                                ?.value || letterType;

                        const letter = map.add([
                            k.sprite("restroom-assets", {
                                anim: letterType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "letter",
                            { letterId, letterType },
                        ]);

                        entities.letters.push(letter);

                        // Letter 상호작용 시스템
                        letter.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const dialogueData = restroomDialogue[letterType]?.[locale];
                            const content = dialogueData ? [dialogueData.content] : [
                                `This is ${letterType}`,
                                `이것은 ${letterType}입니다`,
                            ];

                            const speakerName = dialogueData ? dialogueData.speakerName : letterType;

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

                    // NPC 처리 (director, facil 등 - 화장실에는 없을 수도 있음)
                    if (object.name === "director" || object.name === "facil") {
                        const npcType = object.name;
                        const npc = map.add([
                            k.sprite("restroom-assets", {
                                anim: npcType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            npcType,
                            { npcType },
                        ]);

                        // NPC 상호작용 시스템
                        npc.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const dialogueData = restroomDialogue[npcType]?.[locale];
                            const content = dialogueData ? [dialogueData.content] : [
                                `Hello! I'm ${npcType}!`,
                                `안녕하세요! 저는 ${npcType}입니다!`,
                            ];

                            const speakerName = dialogueData ? dialogueData.speakerName : npcType;

                            gameState.setInteractableObject(npc, "npc", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        npc.onCollideEnd("player", (player) => {
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
                if (
                    [
                        "restroom_door",
                        "door1",
                        "door2",
                        "door3",
                        "door4",
                        "door_wc1",
                        "sink1",
                        "sink2",
                        "sink3",
                        "mop",
                        "mop1",
                        "mop2",
                        "exit_to_first",
                        "door_to_first",
                        "student41",
                        "student42",
                        "student43",
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

                    // restroom_door는 특별히 처리 - first로 이동
                    if (objectType === "restroom_door") {
                        const restroomDoorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10),
                            k.opacity(0),
                            "restroom_door",
                            "interactive-object",
                            { objectType: "restroom_door" },
                        ]);

                        restroomDoorEntity.onCollide("player", () => {
                            console.log(
                                "🚪 restroom_door 충돌 - first로 이동"
                            );
                            try {
                                k.play("door-open-sfx", { volume: 0.5 });
                            } catch (error) {
                                console.warn("door-open-sfx 재생 실패:", error);
                                k.play("boop-sfx"); // 백업 사운드
                            }
                            gameState.setPreviousScene("restroom");
                            gameState.setTargetSpawn("player_restroom");
                            k.go("first");
                        });
                        continue;
                    }

                    // exit_to_first와 door_to_first는 특별히 처리 - first로 이동
                    if (objectType === "exit_to_first" || objectType === "door_to_first") {
                        const exitToFirstEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10),
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType: objectType },
                        ]);

                        exitToFirstEntity.onCollide("player", () => {
                            console.log(
                                `🚪 ${objectType} 충돌 - first로 이동`
                            );
                            try {
                                k.play("door-open-sfx", { volume: 0.5 });
                            } catch (error) {
                                console.warn("door-open-sfx 재생 실패:", error);
                                k.play("boop-sfx"); // 백업 사운드
                            }
                            gameState.setPreviousScene("restroom");
                            gameState.setTargetSpawn("player_restroom");
                            k.go("first");
                        });
                        continue;
                    }

                    // door_wc1은 특별히 처리 - 대화 후 first로 이동
                    if (objectType === "door_wc1") {
                        const doorWc1Entity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10),
                            k.opacity(0),
                            "door_wc1",
                            "interactive-object",
                            { objectType: "door_wc1" },
                        ]);

                        doorWc1Entity.onCollide("player", () => {
                            console.log("🚪 door_wc1에서 first로 이동");
                            try {
                                k.play("door-close-sfx", { volume: 0.5 });
                            } catch (error) {
                                console.warn("door-close-sfx 재생 실패:", error);
                                k.play("boop-sfx"); // 백업 사운드
                            }
                            gameState.setPreviousScene("restroom");
                            gameState.setTargetSpawn("player_restroom");
                            k.go("first");
                        });
                        
                        continue;
                    }

                    // student 오브젝트 특별 처리
                    if (objectType.startsWith("student")) {
                        console.log(`🎓 Student ${objectType} boundaries 오브젝트 생성 중...`);
                        
                        const studentEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10),
                            k.opacity(0),
                            objectType,
                            "student",
                            "interactive-object",
                            { objectType, studentType: objectType },
                        ]);

                        // Student 상호작용 시스템
                        studentEntity.onCollide("player", (player) => {
                            console.log(`🎯 Student ${objectType} 충돌 감지`);
                            
                            const locale = gameState.getLocale();
                            const dialogueData = restroomDialogue[objectType]?.[locale];
                            console.log(`🗣️ 대화 데이터:`, dialogueData);
                            
                            const content = dialogueData ? dialogueData.content : [
                                `Hello! I'm ${objectType}!`,
                                `안녕하세요! 저는 ${objectType}입니다!`,
                            ];

                            const speakerName = dialogueData ? dialogueData.speakerName : objectType;
                            
                            console.log(`💬 대화 설정: ${speakerName} - ${content[0]}`);

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
                        
                        entities.students.push(studentEntity);
                        console.log(`✅ Student ${objectType} boundaries 오브젝트 생성 완료`);
                        continue;
                    }

                    // 일반 상호작용 오브젝트 처리 (화장실 칸, 세면대, 걸레 등) - door_wc1은 위에서 특별 처리됨
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10),
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        { objectType },
                    ]);

                    // 상호작용 시스템 (onCollide로 변경하여 안정성 확보)
                    objectEntity.onCollide("player", (player) => {
                        console.log(`🚽 DEBUG: ${objectType}과 충돌 감지!`);
                        
                        const locale = gameState.getLocale();
                        console.log(`🚽 DEBUG: 현재 로케일: ${locale}`);
                        
                        console.log(`🚽 DEBUG: restroomDialogue 전체:`, restroomDialogue);
                        console.log(`🚽 DEBUG: restroomDialogue[${objectType}]:`, restroomDialogue[objectType]);
                        
                        const dialogueData = restroomDialogue[objectType]?.[locale];
                        console.log(`🚽 DEBUG: dialogueData:`, dialogueData);

                        if (dialogueData) {
                            console.log(`🚽 DEBUG: 상호작용 데이터 설정 중...`);
                            const content = dialogueData.content; // 이미 배열이므로 그대로 사용
                            const speakerName = dialogueData.speakerName;

                            // door4 (박선영)의 경우 대화 완료 후 퀘스트 추가
                            const onInteractionComplete = objectType === "door4" ? () => {
                                console.log("🧻 박선영과 대화 완료 - 휴지 퀘스트 추가");
                                
                                if (window.questItems) {
                                    // 이미 해당 퀘스트가 있는지 확인
                                    const hasToiletPaperQuest = window.questItems.some(quest => 
                                        quest.title && quest.title.includes("정말 급한 볼일")
                                    );
                                    
                                    if (!hasToiletPaperQuest) {
                                        const toiletPaperQuest = {
                                            title: "정말 급한 볼일 : 휴지 갖다주기",
                                            details: ["박선영이 휴지가 필요하다고 한다", "어디서 휴지를 구할 수 있을까?", "휴지를 찾아서 박선영에게 갖다주자"],
                                            expanded: false,
                                            completed: false,
                                            targetObject: "door4"
                                        };
                                        window.questItems.push(toiletPaperQuest);
                                        
                                        // 퀘스트 추가 알림 (메시지로 표시)
                                        if (window.notificationManager) {
                                            window.notificationManager.addNotification({
                                                type: 'quest-added',
                                                message: "정말 급한 볼일 : 휴지 갖다주기"
                                            });
                                        }
                                        console.log("🆕 휴지 퀘스트 추가됨");
                                    }
                                }
                            } : null;

                            gameState.setInteractableObject(
                                objectEntity,
                                "object",
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                    onInteractionComplete: onInteractionComplete
                                }
                            );
                            console.log(`🚽 DEBUG: gameState에 상호작용 객체 설정 완료`);
                        } else {
                            console.error(`🚽 DEBUG: dialogueData가 없습니다! objectType: ${objectType}, locale: ${locale}`);
                        }
                    });

                    // 플레이어가 오브젝트에서 벗어나면 상호작용 상태 클리어
                    objectEntity.onCollideEnd("player", (player) => {
                        console.log(`🚽 DEBUG: ${objectType}에서 벗어남 - 상호작용 상태 클리어`);
                        gameState.clearInteractableObject();
                    });
                    continue;
                }

                // 일반 경계선 처리 (이름이 없는 벽들)
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x, object.y - 10),
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
                    const noteId =
                        object.properties?.find((p) => p.name === "noteId")
                            ?.value || object.name;

                    const note = map.add(
                        generateNoteComponents(k, k.vec2(object.x, object.y), noteId)
                    );

                    note.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const dialogueData = restroomDialogue[noteId]?.[locale] || restroomDialogue[noteId]?.["english"];
                        const content = dialogueData ? [dialogueData.content] : [
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

                        // restroom.json은 restroom-assets 스프라이트를 사용 (같은 스프라이트시트)
                        const tileEntity = map.add([
                            k.sprite("restroom-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                            // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                        ]);
                        
                        // 첫 번째 chunk의 첫 몇 개 타일 위치 디버그
                        if (tilesAdded < 5) {
                            console.log(`🎨 Restroom 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
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

                // Use restroom-assets sprite (restroom.json과 호환)
                map.add([
                    k.sprite("restroom-assets", { frame: tile - 1 }),
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
            generateFirstPlayerComponents(k, k.vec2(200, 200)) // 화장실 맵 중앙 근처에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    // ==============================
    // 전역 시스템 통합 매니저 초기화 (front.js와 동일)
    // ==============================
    
    // restroomDialogue를 전역 시스템에 전달
    const sceneDialogues = {
        objectDialogues: restroomDialogue,
        npcDialogues: restroomDialogue,
        names: {} // restroom에는 별도 이름 매핑이 없으므로 빈 객체
    };
    
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "restroom", sceneDialogues);
    globalSystemManager.initialize();

    console.log("✅ 전역 시스템 초기화 완료");

    k.camScale(2); // first.js와 동일하게 2로 설정
    
    // 맵 크기 계산 (restroom.json의 실제 chunks를 기반으로)
    const mapBounds = {
        minX: -16 * 24, // restroom.json의 가장 왼쪽 chunk x * tilewidth (-16)
        minY: 0 * 24, // restroom.json의 가장 위쪽 chunk y * tileheight (0)  
        maxX: (16 + 16) * 24, // 맵 너비를 고려한 최대 X (chunk가 16까지 있다고 가정)
        maxY: (16 + 16) * 24, // 맵 높이를 고려한 최대 Y
    };

    console.log("🗺️ Restroom 맵 경계:", mapBounds);

    // 카메라 초기 위치 설정 (Y축을 좀 더 위로)
    if (entities.player && entities.player.exists()) {
        const initialCamPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50); // Y축을 50px 위로
        k.camPos(initialCamPos);
    }

    // 경계 기반 카메라 추적 시스템 (first.js와 동일한 부드러운 시스템)
    const CAMERA_EDGE_BUFFER = 120; // 화면 가장자리 120px 반경 (first.js와 동일)
    const CAMERA_SMOOTH_FACTOR = 0.1; // 카메라 부드러움 정도 (0.1 = 10%씩 이동)
    const CAMERA_MIN_DISTANCE = 8; // 최소 이동 거리 (픽셀)
    let targetCameraPos = k.camPos();
    let lastPlayerPos = entities.player ? entities.player.pos.clone() : k.vec2(0, 0);

    function updateCameraWithBoundaries() {
        if (!entities.player || !entities.player.exists()) return;

        const playerPos = entities.player.pos;
        const currentCamPos = k.camPos();
        const screenHalfWidth = k.width() / (2 * k.camScale().x);
        const screenHalfHeight = k.height() / (2 * k.camScale().y);
        
        // 플레이어가 실제로 이동했을 때만 카메라 업데이트 계산
        if (playerPos.dist(lastPlayerPos) < 1) return; // 1픽셀 이하 이동은 무시
        
        // 카메라를 플레이어보다 조금 위쪽에 유지
        const CAMERA_Y_OFFSET = -30; // 카메라를 30px 위로 유지
        const targetPlayerPos = k.vec2(playerPos.x, playerPos.y + CAMERA_Y_OFFSET);
        
        // 플레이어가 화면 가장자리 근처에 있는지 확인
        const playerScreenPos = targetPlayerPos.sub(currentCamPos);
        
        let newTargetX = targetCameraPos.x;
        let newTargetY = targetCameraPos.y;
        let shouldUpdate = false;
        
        // X축 경계 확인 - 데드존을 더 크게 설정
        if (playerScreenPos.x > screenHalfWidth - CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x - (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.x < -screenHalfWidth + CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x + (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        // Y축 경계 확인 - 데드존을 더 크게 설정
        if (playerScreenPos.y > screenHalfHeight - CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y - (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.y < -screenHalfHeight + CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y + (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        // 타겟 위치 업데이트
        if (shouldUpdate) {
            // 맵 경계 내에서 카메라 제한
            newTargetX = Math.max(mapBounds.minX + screenHalfWidth, 
                                 Math.min(mapBounds.maxX - screenHalfWidth, newTargetX));
            newTargetY = Math.max(mapBounds.minY + screenHalfHeight, 
                                 Math.min(mapBounds.maxY - screenHalfHeight, newTargetY));
            
            targetCameraPos = k.vec2(newTargetX, newTargetY);
        }
        
        // 부드러운 카메라 이동
        const distance = targetCameraPos.dist(currentCamPos);
        if (distance > CAMERA_MIN_DISTANCE) {
            const newCamPos = currentCamPos.lerp(targetCameraPos, CAMERA_SMOOTH_FACTOR);
            k.camPos(newCamPos);
        }
        
        lastPlayerPos = playerPos.clone();
    }

    // 매 프레임마다 카메라 업데이트
    k.onUpdate(updateCameraWithBoundaries);

    // 퀘스트 말풍선 시스템 초기화 (학생이 있다면)
    if (entities.students.length > 0) {
        initializeQuestBubbles(k, entities.students, map);
    }

    watchPlayerHealth(k);

    let isLocaleLocked = { value: false };
    let isMuteLocked = { value: false };

    // 키보드 단축키
    k.onKeyPress("l", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onKeyPress("ㅣ", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onKeyPress("m", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    k.onKeyPress("ㅡ", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    // 게임패드 컨트롤 (L/R 숄더 버튼)
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);

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

    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 Restroom 씬 정리 시작");
        
        // 전역 시스템 통합 정리
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
        
        console.log("✅ Restroom 씬 정리 완료");
    });

    console.log("✅ Restroom 씬 초기화 완료");
}
