import { createUIManager } from "../systems/uiManager.js";
import {
    generatePlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import {
    generateGhostComponents,
    setGhostAI,
    onGhostDestroyed,
} from "../entities/ghost.js"; // 추가된 부분
import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../utils.js"; // 타일맵 씬에서는 audioManager만 사용

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
import { dialog, choiceDialog } from "../uiComponents/dialog.js";
import {
    toggleLocale,
    toggleMute,
    initializeQuestBubbles,
    updateQuestBubbles,
} from "../utils.js";

export default async function schoolsecond(k) {
    console.log("🏫 schoolsecond scene 시작");

    // 🚀 BGM 즉시 전환 (타일맵 씬에서는 audioManager.switchBGM 사용)
    audioManager.switchBGM("rpg-second-bgm", 1.0);

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/schoolsecond.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
        mushrooms: [], // 추가된 부분: mushrooms 배열
        ghost: null, // 추가된 부분
        newcha: null, // 추가된 부분: newcha 캐릭터
    };

    // 수정된 부분: door_wc2와 ghost 생성 상태 추적
    let doorWc2Position = null; // 수정된 부분: door_wc2 위치 정보 (ghost 거리 계산 기준점)
    let ghostSpawnPosition = null; // 수정된 부분: ghost 스폰포인트 (현재 사용하지 않음, door_wc2 기준 사용)
    let hasGhostSpawned = false;
    let isGhostFadingOut = false; // 추가된 부분: fadeOut 중복 방지
    let ghostTileLayer = null; // 추가된 부분: ghost 타일 레이어 참조 저장
    let hasGhostTileLayerShown = false; // 추가된 부분: ghost 타일 레이어 표시 상태
    let isGhostTileLayerFading = false; // 추가된 부분: ghost 타일 레이어 fade 상태
    let hasGhostDialogShown = false; // 추가된 부분: 유령 다이얼로그 표시 완료 상태 (한번만 발생)
    // 수정된 부분: door_wc2 교감 관련 변수 제거 (더 이상 사용하지 않음)
    const layers = mapData.layers;
    for (const layer of layers) {
        if (layer.name === "boundaries") {
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                if (
                    [
                        "elevator2",
                        "bulletin2",
                        "door_wc2",
                        "books",
                        "door_gyo",
                        "door_classroom",
                        "bookshelf",
                        "shelf3",
                        "shelf4",
                        "stair_to_third",
                        "exit_to_third",
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

                    // exit_to_third는 특별히 처리 - first의 from_second 위치로 이동
                    if (objectType === "exit_to_third") {
                        const exitEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y + 16),
                            k.opacity(0),
                            "exit_to_third",
                            "scene-transition",
                            {
                                targetScene: "first",
                                targetSpawn: "from_second",
                            },
                        ]);

                        exitEntity.onCollide("player", (player) => {
                            console.log(
                                "🚪 exit_to_third 충돌 - first로 이동!"
                            );
                            // 수정된 부분: 2층에서 1층으로 이동 시 효과음 추가
                            k.play("boop-sfx");
                            gameState.setPreviousScene("schoolsecond");
                            gameState.setTargetSpawn("from_second");
                            k.go("first");
                        });
                        continue;
                    }

                    // Tiled 좌표계에 맞춰 위치 조정 (다른 충돌 박스들과 일관성 유지)
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y + 16), // 일반 충돌 박스와 같은 오프셋 적용
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        { objectType },
                    ]);

                    // 수정된 부분: 플레이어와의 충돌 감지 (상호작용 시스템)
                    if (objectType === "door_gyo") {
                        // door_gyo는 특별 처리 - Unity 게임 연결 기능 유지
                        objectEntity.onCollide("player", async (player) => {
                            k.play("bubble-sfx");

                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.[
                                objectType
                            ] || [
                                `This is ${objectType}`,
                                `이것은 ${objectType}입니다`,
                            ];
                            const font =
                                locale === "korean" ? "galmuri" : "gameboy";

                            const speakerName =
                                objectDialogues.names[locale]?.[objectType] ||
                                objectType;

                            await new Promise((resolve) => {
                                globalSystemManager.globalDialogue.showDialogue({
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                }, resolve);
                            });

                            // 교무실 문 특별 처리 - Unity 게임 연결
                            const choice = await choiceDialog(
                                k,
                                k.vec2(250, 250),
                                [
                                    "한번쯤 교무실 선생님이 되어 학생들의 용모단정을 위해 힘쓰고 싶지 않았나요? ^^*",
                                    "그런 분들을 위한 본격! 교무실 시뮬레이터 게임 <교무실로 와!>도 준비되어있습니다.",
                                    "한번 플레이해보시겠어요?",
                                ],
                                ["아니오", "예"],
                                { font }
                            );

                            if (choice === 1) {
                                k.play("confirm-beep-sfx");
                                window.open(
                                    "https://play.unity.com/en/games/4a7111dc-fa36-4f8b-98c9-3a29e0c2006a/kimchi-run-by-ym",
                                    "_blank"
                                );
                            } else {
                                k.play("boop-sfx");
                            }
                        });
                    } else if (objectType === "stair_to_third") {
                        // 추가된 부분: stair_to_third는 자동 다이얼로그 처리
                        objectEntity.onCollide("player", async (player) => {
                            k.play("bubble-sfx");

                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.[
                                objectType
                            ] || [
                                `This is ${objectType}`,
                                `이것은 ${objectType}입니다`,
                            ];
                            const font =
                                locale === "korean" ? "galmuri" : "gameboy";

                            const speakerName =
                                objectDialogues.names[locale]?.[objectType] ||
                                objectType;

                            await new Promise((resolve) => {
                                globalSystemManager.globalDialogue.showDialogue({
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                }, resolve);
                            });
                        });
                    } else {
                        // 나머지 객체들은 상호작용 시스템 사용
                        objectEntity.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.[
                                objectType
                            ] || [
                                `This is ${objectType}`,
                                `이것은 ${objectType}입니다`,
                            ];

                            const speakerName =
                                objectDialogues.names[locale]?.[objectType] ||
                                objectType;

                            gameState.setInteractableObject(
                                objectEntity,
                                "object",
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                    // 수정된 부분: door_wc2 교감 관련 콜백 제거 (더 이상 사용하지 않음)
                                }
                            );
                        });

                        objectEntity.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 수정된 부분: door_wc2의 위치 정보 저장 (다시 추가)
                        if (objectType === "door_wc2") {
                            doorWc2Position = {
                                x: object.x + object.width / 2,
                                y: object.y + object.height / 2 + 16,
                            };
                            console.log(
                                `🚪 door_wc2 위치 저장: x=${doorWc2Position.x}, y=${doorWc2Position.y}`
                            );
                        }
                    }
                }
            }

            const processedObjects = [
                "elevator2",
                "bulletin2",
                "door_wc2",
                "books",
                "door_gyo",
                "door_classroom",
                "bookshelf",
                "shelf3",
                "shelf4",
                "stair_to_third",
                "exit_to_third",
            ];

            drawBoundaries(k, map, layer, processedObjects);
            continue;
        }

        if (layer.name === "spawnpoint") {
            for (const entity of layer.objects) {
                // 플레이어 스폰 포인트 처리
                if (entity.name === "player") {
                    const targetSpawn = gameState.getTargetSpawn();
                    if (!targetSpawn || targetSpawn === "player") {
                        entities.player = map.add(
                            generatePlayerComponents(
                                k,
                                k.vec2(entity.x, entity.y)
                            )
                        );
                        console.log(
                            `🎮 플레이어가 기본 위치에 스폰되었습니다: x=${entity.x}, y=${entity.y}`
                        );
                    }
                    continue;
                }

                if (entity.name.startsWith("student")) {
                    // student1, student2, student3, student4 처리
                    const studentType = entity.name; // student1, student2, etc.

                    const student = map.add([
                        k.sprite("main-assets", {
                            anim: studentType, // main.js에 정의된 애니메이션 사용
                        }),
                        k.area({
                            shape: new k.Rect(k.vec2(0), 24, 24), // 24x24 픽셀 충돌 영역
                        }),
                        k.body({ isStatic: true }),
                        k.pos(entity.x, entity.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "student",
                        { studentType },
                    ]);

                    entities.students.push(student);

                    // 추가된 부분: student1에만 말풍선 추가 (임시로 제거 - 에러 해결 후 다시 추가 예정)
                    // if (studentType === "student1") {
                    //     const bubble = map.add([
                    //         k.sprite("main-assets", { frame: 874 }),
                    //         k.pos(student.pos.x, student.pos.y - 50),
                    //         k.anchor("bottom"),
                    //         k.scale(0.8),
                    //         k.z(20),
                    //         k.opacity(1.0),
                    //         "speech-bubble",
                    //     ]);

                    //     let time = 0;
                    //     bubble.onUpdate(() => {
                    //         time += k.dt();
                    //         bubble.pos.x = student.pos.x;
                    //         bubble.pos.y = student.pos.y - 50 + Math.sin(time * 3) * 3;
                    //     });

                    //     student.speechBubble = bubble;
                    // }

                    // 수정된 부분: 학생 상호작용 시스템
                    student.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = npcDialogues[locale]?.[studentType] || [
                            `Hello! I'm ${studentType}!`,
                            `안녕하세요! 저는 ${studentType}입니다!`,
                        ];

                        const speakerName =
                            npcDialogues.names[locale]?.[studentType] ||
                            studentType;

                        gameState.setInteractableObject(student, "student", {
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

                if (entity.name.startsWith("letter")) {
                    // letter1, letter2 처리
                    const letterType = entity.name;
                    const letterId =
                        entity.properties?.find((p) => p.name === "letterId")
                            ?.value || letterType;

                    const letter = map.add([
                        k.sprite("main-assets", {
                            anim: letterType, // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(entity.x, entity.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "letter",
                        { letterId, letterType },
                    ]);

                    entities.letters.push(letter);

                    // 수정된 부분: letter 상호작용 시스템
                    letter.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = objectDialogues[locale]?.[
                            letterType
                        ] || [
                            `This is ${letterType}`,
                            `이것은 ${letterType}입니다`,
                        ];

                        const speakerName =
                            objectDialogues.names[locale]?.[letterType] ||
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

                // facil 처리
                if (entity.name === "facil") {
                    const facil = map.add([
                        k.sprite("main-assets", {
                            anim: "facil", // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(entity.x, entity.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "facil",
                        { npcType: "facil" },
                    ]);

                    // 수정된 부분: facil 상호작용 시스템
                    facil.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = npcDialogues[locale]?.["facil"] || [
                            "Hello! I'm the vice principal.",
                            "안녕하세요! 저는 교감입니다.",
                        ];

                        const speakerName =
                            npcDialogues.names[locale]?.["facil"] ||
                            "Vice Principal";

                        gameState.setInteractableObject(facil, "npc", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    facil.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    continue;
                }

                // 추가된 부분: mushroom 처리
                if (entity.name === "mushroom") {
                    console.log(
                        "[DEBUG] mushroom 스폰 처리 시작:",
                        entity.x,
                        entity.y
                    );

                    // 추가된 부분: 이미 버섯을 먹었다면 생성하지 않음
                    if (gameState.getHasEatenMushroom()) {
                        console.log(
                            "[DEBUG] ✅ 이미 버섯을 먹어서 mushroom을 생성하지 않습니다."
                        );
                        continue;
                    }

                    const mushroom = map.add([
                        k.sprite("main-assets", {
                            anim: "mushroom", // 수정된 부분: main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(entity.x, entity.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        k.scale(1), // 수정된 부분: scale 추가 (사라지는 애니메이션용)
                        "mushroom",
                    ]);

                    // mushroom 충돌 시 다이얼로그 후 사라지는 시스템 (수정된 부분)
                    mushroom.onCollide("player", async (player) => {
                        console.log(
                            "[DEBUG] mushroom에 충돌! 사라지는 애니메이션 시작"
                        );

                        // 수정된 부분: 먼저 scale을 0으로 줄이는 애니메이션과 효과음 재생
                        k.play("coin-sfx"); // 수정된 부분: boop-sfx → coin-sfx로 변경

                        // scale 애니메이션 먼저 실행
                        await new Promise((resolve) => {
                            k.tween(
                                1,
                                0,
                                0.5, // 0.5초에 걸쳐 사라짐
                                (val) => {
                                    if (mushroom && mushroom.exists()) {
                                        mushroom.scale = k.vec2(val, val);
                                    }
                                },
                                k.easings.easeInQuad
                            ).then(() => {
                                console.log(
                                    "[DEBUG] mushroom scale 애니메이션 완료"
                                );
                                resolve();
                            });
                        });

                        // 수정된 부분: scale 애니메이션 완료 후 다이얼로그 표시
                        console.log("[DEBUG] 다이얼로그 시작");

                        // 다이얼로그 내용
                        const mushroomDialogue = [
                            "어...? 뭐야 왜이러지...?!",
                            "...아트 리드 나영(이)가 열일하고 있나봐...!",
                            "...뭔가 성장통이 느껴지는데...!!!!",
                            ".....!!!!!!!",
                        ];

                        // 다이얼로그 표시 (다른 오브젝트들과 동일한 스타일)
                        const locale = gameState.getLocale();
                        const font =
                            locale === "korean" ? "galmuri" : "gameboy";

                        await new Promise((resolve) => {
                            globalSystemManager.globalDialogue.showDialogue({
                                content: mushroomDialogue,
                                speakerName: null,
                                speakerImage: null,
                            }, resolve);
                        });

                        console.log(
                            "[DEBUG] 다이얼로그 완료! mushroom 완전히 제거"
                        );

                        // 다이얼로그 완료 후 mushroom 완전히 제거
                        if (mushroom && mushroom.exists()) {
                            mushroom.destroy();
                        }
                        // entities.mushrooms 배열에서도 제거
                        const index = entities.mushrooms.indexOf(mushroom);
                        if (index > -1) {
                            entities.mushrooms.splice(index, 1);
                        }

                        // 수정된 부분: 버섯을 먹었다는 상태 저장
                        gameState.setHasEatenMushroom(true);
                        console.log(
                            "[DEBUG] 버섯 섭취 완료! newcha 캐릭터가 2층에 나타날 수 있습니다."
                        );

                        // 추가된 부분: 버섯을 먹은 후 newcha 타일 레이어를 즉시 보이게 하기
                        if (
                            entities.newchaTileLayer &&
                            entities.newchaTileLayer.exists()
                        ) {
                            entities.newchaTileLayer.children.forEach(
                                (child) => {
                                    if (child.opacity !== undefined) {
                                        child.opacity = 1;
                                    }
                                }
                            );
                            console.log(
                                "[DEBUG] ✅ newcha 타일 레이어가 즉시 나타났습니다!"
                            );
                        } else {
                            console.log(
                                "[DEBUG] ⚠️ newcha 타일 레이어를 찾을 수 없습니다."
                            );
                        }

                        // 수정된 부분: 플레이어 tall 상태는 제거됨
                    });

                    entities.mushrooms.push(mushroom); // 추가된 부분: mushrooms 배열에 추가
                    continue;
                }

                // ghost 처리 추가된 부분 (현재 사용하지 않음 - door_wc2 기준 사용)
                if (entity.name === "ghost") {
                    ghostSpawnPosition = { x: entity.x, y: entity.y };
                    console.log(
                        `👻 Ghost 스폰포인트 발견: x=${entity.x}, y=${entity.y} (참고용, 실제로는 door_wc2 기준 사용)`
                    );
                }

                // 기존 note 처리는 유지 (호환성을 위해)
                if (entity.name === "note") {
                    const noteIdProp = entity.properties?.find(
                        (p) => p.name === "noteId"
                    )?.value;

                    const note = map.add(
                        generateNoteComponents(
                            k,
                            k.vec2(entity.x, entity.y),
                            noteIdProp
                        )
                    );

                    // 수정된 부분: note 상호작용 시스템
                    note.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = noteDialogues[locale][note.noteId];

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

        // Handle regular tile layers with main-assets sprite
        if (layer.data) {
            // 수정된 부분: ghost 레이어는 별도로 처리 (초기에는 숨김)
            if (layer.name === "ghost") {
                console.log("👻 Ghost 타일 레이어 처리 중... (초기에는 숨김)");
                ghostTileLayer = map.add([k.pos(0, 0)]); // 수정된 부분: 개별 타일에서 opacity 처리하므로 여기서는 제거

                let nbOfDrawnTiles = 0;
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

                    // Tiled 플립 플래그 제거 (큰 값들은 플립된 타일임)
                    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
                    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
                    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

                    let actualTileId = tile;
                    // 플립 플래그들을 제거하여 실제 타일 ID만 추출
                    actualTileId &= ~(
                        FLIPPED_HORIZONTALLY_FLAG |
                        FLIPPED_VERTICALLY_FLAG |
                        FLIPPED_DIAGONALLY_FLAG
                    );

                    // 타일 ID가 유효한 범위인지 확인 (0~3750)
                    if (actualTileId <= 0 || actualTileId > 3750) {
                        console.warn(
                            `⚠️ 유효하지 않은 타일 ID: ${tile} (실제: ${actualTileId})`
                        );
                        continue;
                    }

                    try {
                        // 수정된 부분: ghost 레이어의 타일들을 개별적으로 숨김 처리
                        ghostTileLayer.add([
                            k.sprite("main-assets", {
                                frame: actualTileId - 1,
                            }),
                            k.pos(tilePos),
                            k.z(2), // 일반 타일보다 위에, upmost보다 아래에
                            k.opacity(0), // 수정된 부분: 각 타일을 개별적으로 숨김
                            k.offscreen(),
                        ]);
                    } catch (error) {
                        console.warn(
                            `⚠️ Ghost 타일 렌더링 실패: ${actualTileId}`,
                            error
                        );
                    }
                }
                console.log(
                    `👻 Ghost 타일 레이어 생성 완료 (${nbOfDrawnTiles}개 타일) - 초기에는 숨김 상태`
                );
                continue; // ghost 레이어는 여기서 처리 완료하고 넘어감
            }

            // 추가된 부분: newcha 레이어는 별도로 처리 (버섯 섭취 전에는 숨김)
            if (layer.name === "newcha") {
                console.log("🍄 Newcha 타일 레이어 처리 중... (초기에는 숨김)");

                // 추가된 부분: 이미 newcha 다이얼로그를 봤다면 생성하지 않음
                if (gameState.getHasNewchaDialogShown()) {
                    console.log(
                        "[DEBUG] ✅ 이미 newcha 다이얼로그를 봐서 newcha 타일 레이어를 생성하지 않습니다."
                    );
                    continue;
                }

                entities.newchaTileLayer = map.add([k.pos(0, 0)]);

                let nbOfDrawnTiles = 0;
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

                    // Tiled 플립 플래그 제거
                    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
                    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
                    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

                    let actualTileId = tile;
                    actualTileId &= ~(
                        FLIPPED_HORIZONTALLY_FLAG |
                        FLIPPED_VERTICALLY_FLAG |
                        FLIPPED_DIAGONALLY_FLAG
                    );

                    // 타일 ID가 유효한 범위인지 확인
                    if (actualTileId <= 0 || actualTileId > 3750) {
                        console.warn(
                            `⚠️ 유효하지 않은 newcha 타일 ID: ${tile} (실제: ${actualTileId})`
                        );
                        continue;
                    }

                    try {
                        // newcha 레이어의 타일들을 개별적으로 처리
                        const newchaTile = entities.newchaTileLayer.add([
                            k.sprite("main-assets", {
                                frame: actualTileId - 1,
                            }),
                            k.pos(tilePos),
                            k.z(2), // 일반 타일보다 위에
                            k.opacity(gameState.getHasEatenMushroom() ? 1 : 0), // 버섯 섭취 상태에 따라
                            k.area(),
                            k.offscreen(),
                            "newcha-tile",
                        ]);

                        // newcha 타일과 상호작용 설정
                        newchaTile.onCollide("player", async (player) => {
                            // 버섯을 먹었고 아직 대화하지 않았을 때만
                            if (
                                gameState.getHasEatenMushroom() &&
                                !gameState.getHasNewchaDialogShown()
                            ) {
                                // 로컬 상태는 제거하고 전역 상태만 사용

                                k.play("bubble-sfx");

                                const locale = gameState.getLocale();
                                const font =
                                    locale === "korean" ? "galmuri" : "gameboy";

                                await new Promise((resolve) => {
                                    globalSystemManager.globalDialogue.showDialogue({
                                        content: [
                                            "안녕! 버섯을 먹었구나! 이제 내가 보이니?",
                                            "나는 <AFTERSCHOOL!!!>의 새로운 주인공 캐릭터야!",
                                            "왕 커지니까 왕 귀엽지?",
                                            "조금더 <AFTERSCHOOL!!!>만의 개성을 반영했어!!",

                                            "아트 리드가 갈갈 갈려서 조금 빨리 나타나게 됐지 모야><",
                                            "이제 다음엔 내가 주인공이 될거야!",
                                            "곧 내 친구들도 보여줄게! 기대해줘><",
                                            "또 만나자!!! 난 이제 간다!!",
                                        ],
                                        speakerName: "새로운 캐릭터",
                                        speakerImage: null,
                                    }, resolve);
                                });

                                // 다이얼로그 완료 후 newcha 타일 레이어 사라지게 하기
                                console.log(
                                    "[DEBUG] newcha 다이얼로그 완료! newcha 타일 레이어를 사라지게 합니다."
                                );

                                // fadeOut 효과
                                k.tween(
                                    1,
                                    0,
                                    2.0, // 2초에 걸쳐 천천히 사라짐
                                    (val) => {
                                        if (
                                            entities.newchaTileLayer &&
                                            entities.newchaTileLayer.exists()
                                        ) {
                                            entities.newchaTileLayer.children.forEach(
                                                (child) => {
                                                    if (
                                                        child.opacity !==
                                                        undefined
                                                    ) {
                                                        child.opacity = val;
                                                    }
                                                }
                                            );
                                        }
                                    },
                                    k.easings.easeInQuad
                                ).then(() => {
                                    console.log(
                                        "[DEBUG] newcha 타일 레이어 fadeOut 완료"
                                    );
                                    // 추가된 부분: 전역 상태에 newcha 다이얼로그 완료 저장
                                    gameState.setHasNewchaDialogShown(true);
                                    console.log(
                                        "[DEBUG] ✅ newcha 다이얼로그 완료 상태를 전역 상태에 저장했습니다."
                                    );
                                });
                            }
                        });
                    } catch (error) {
                        console.warn(
                            `⚠️ Newcha 타일 렌더링 실패: ${actualTileId}`,
                            error
                        );
                    }
                }
                console.log(
                    `🍄 Newcha 타일 레이어 생성 완료 (${nbOfDrawnTiles}개 타일)`
                );
                continue; // newcha 레이어는 여기서 처리 완료하고 넘어감
            }

            // 수정된 부분: JSON에서 visible이 false인 레이어는 건너뛰기 (ghost 제외)
            if (layer.visible === false) {
                console.log(
                    `👻 ${layer.name} 레이어는 visible: false이므로 건너뜁니다.`
                );
                continue;
            }

            // 기존 타일 레이어 처리 (ghost 제외)
            let nbOfDrawnTiles = 0;
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

                // Tiled 플립 플래그 제거 (큰 값들은 플립된 타일임)
                const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
                const FLIPPED_VERTICALLY_FLAG = 0x40000000;
                const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

                let actualTileId = tile;
                // 플립 플래그들을 제거하여 실제 타일 ID만 추출
                actualTileId &= ~(
                    FLIPPED_HORIZONTALLY_FLAG |
                    FLIPPED_VERTICALLY_FLAG |
                    FLIPPED_DIAGONALLY_FLAG
                );

                // 타일 ID가 유효한 범위인지 확인 (0~3750)
                if (actualTileId <= 0 || actualTileId > 3750) {
                    console.warn(
                        `⚠️ 유효하지 않은 타일 ID: ${tile} (실제: ${actualTileId})`
                    );
                    continue;
                }

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), 다른 타일은 기본 (z=0)
                const zIndex = layer.name === "upmost" ? 3 : 0;

                try {
                    // Use main-assets sprite instead of assets
                    map.add([
                        k.sprite("main-assets", { frame: actualTileId - 1 }),
                        k.pos(tilePos),
                        k.z(zIndex),
                        k.offscreen(),
                    ]);
                } catch (error) {
                    console.warn(`⚠️ 타일 렌더링 실패: ${actualTileId}`, error);
                }
            }
            continue;
        }
    }

    // 플레이어가 스폰되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log(
            "⚠️ 플레이어 스폰 포인트를 찾을 수 없어 기본 위치에 생성합니다."
        );
        entities.player = map.add(
            generatePlayerComponents(k, k.vec2(400, 400)) // 맵 중앙 근처에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    // 추가된 부분: door_wc2 근처에서 ghost 생성 로직
    // 주의: JSON 파일의 ghost spawnpoint가 불안정하므로 door_wc2 기준으로 생성
    function spawnGhostNearDoor() {
        if (hasGhostSpawned || !doorWc2Position) {
            // 수정된 부분: doorWc2Position 사용
            return;
        }

        // 기존 ghost가 있다면 제거 (수정된 부분)
        if (entities.ghost && entities.ghost.exists()) {
            entities.ghost.destroy();
        }

        // 항상 ghost 생성, 스프라이트만 랜덤 선택 (수정된 부분)
        // ghost1(frame 529) 또는 ghost2(frame 530) 중 랜덤 선택
        const ghostFrame = Math.random() < 0.5 ? 529 : 530;
        const ghostType = ghostFrame === 529 ? "ghost1" : "ghost2";
        console.log(`👻 ${ghostType} 생성 (frame: ${ghostFrame})`);

        // 수정된 부분: door_wc2 근처에 ghost 생성 (약간 오른쪽에 배치)
        const ghostPos = k.vec2(
            doorWc2Position.x + 32, // door_wc2에서 오른쪽으로 32px
            doorWc2Position.y
        );

        // 수정된 부분: 처음부터 올바른 frame으로 유령 생성
        entities.ghost = map.add([
            k.sprite("main-assets", { frame: ghostFrame }), // 수정된 부분: 처음부터 올바른 frame 사용
            k.area(), // 수정된 부분: 오프셋 제거 - 정확한 위치 표시를 위해
            k.body(),
            k.pos(ghostPos),
            k.health(9),
            k.opacity(0), // 수정된 부분: 초기 투명도 0으로 설정
            k.z(1), // 수정된 부분: 다른 엔티티들과 같은 z-index
            "ghost",
        ]);

        // 수정된 부분: AI 제거 - ghost는 정적으로 서 있음

        // fadeIn 효과
        k.tween(
            0,
            1,
            1.5, // 1.5초에 걸쳐 서서히 나타남
            (val) => {
                if (entities.ghost && entities.ghost.exists()) {
                    entities.ghost.opacity = val;
                }
            },
            k.easings.easeOutQuad
        );

        hasGhostSpawned = true;
    }

    // 수정된 부분: door_wc2 기준으로 거리 체크 및 ghost 레이어 관리
    // 주의: ghost spawnpoint가 JSON에서 누락되는 경우가 있어서 door_wc2를 기준으로 사용
    k.onUpdate(() => {
        if (!entities.player || !doorWc2Position) return; // 수정된 부분: doorWc2Position 사용

        const distance = entities.player.pos.dist(
            k.vec2(doorWc2Position.x, doorWc2Position.y) // 수정된 부분: door_wc2 위치 사용
        );

        // 추가된 부분: 디버깅을 위한 거리 출력 (5초마다 한 번씩) - 주석처리
        // if (
        //     Math.floor(k.time()) % 5 === 0 &&
        //     Math.floor(k.time() * 10) % 10 === 0
        // ) {
        //     console.log(
        //         `[DEBUG] 플레이어 위치: (${Math.floor(
        //             entities.player.pos.x
        //         )}, ${Math.floor(entities.player.pos.y)})`
        //     );
        //     console.log(
        //         `[DEBUG] door_wc2 위치: (${doorWc2Position.x}, ${doorWc2Position.y})`
        //     );
        //     console.log(`[DEBUG] 거리: ${Math.floor(distance)}px`);
        // }

        // 수정된 부분: 40px 이내로 가까이 오면 나타나면서 효과음 재생 (한번만 발생)
        if (
            distance <= 40 &&
            !hasGhostTileLayerShown &&
            !isGhostTileLayerFading &&
            !hasGhostDialogShown
        ) {
            // console.log(
            //     `👻 플레이어가 door_wc2 80px 이내에 접근! 거리: ${Math.floor(
            //         distance
            //     )}px`
            // );

            hasGhostTileLayerShown = true;
            isGhostTileLayerFading = true;

            // ghost-sfx 효과음 재생
            k.play("ghost-sfx");
            // console.log("👻 Ghost 타일 레이어 fadeIn 시작");

            // 수정된 부분: fade in과 동시에 플레이어 점프하면서 튕겨져나가기
            if (entities.player) {
                const currentPos = entities.player.pos;
                const jumpDistance = 20;
                const jumpHeight = 15;

                // 유령으로부터 반대 방향으로 튕겨져나가는 방향 계산
                const directionX = currentPos.x > doorWc2Position.x ? 1 : -1;
                const targetX = currentPos.x + jumpDistance * directionX;
                const targetY = currentPos.y + 10; // 살짝 아래로도 이동

                // 점프 효과 (위로 올라갔다가 내려오는 포물선)
                const jumpTween1 = k.tween(
                    currentPos.y,
                    currentPos.y - jumpHeight,
                    0.2,
                    (val) => {
                        if (entities.player && entities.player.exists()) {
                            entities.player.pos.y = val;
                        }
                    },
                    k.easings.easeOutQuad
                );

                // 동시에 좌우로 이동
                const moveTween = k.tween(
                    currentPos.x,
                    targetX,
                    0.4,
                    (val) => {
                        if (entities.player && entities.player.exists()) {
                            entities.player.pos.x = val;
                        }
                    },
                    k.easings.easeOutQuad
                );

                // 점프 후 착지
                jumpTween1.then(() => {
                    k.tween(
                        entities.player.pos.y,
                        targetY,
                        0.2,
                        (val) => {
                            if (entities.player && entities.player.exists()) {
                                entities.player.pos.y = val;
                            }
                        },
                        k.easings.easeInQuad
                    ).then(async () => {
                        // 수정된 부분: 점프 완료 후 다이얼로그 표시
                        if (entities.player) {
                            // 추가된 부분: 화면 흔들림 효과 시작
                            const originalCamPos = k.camPos().clone();
                            let shakeTime = 0;
                            const shakeDuration = 1.5; // 1.5초 동안 흔들림
                            const shakeIntensity = 3; // 흔들림 강도

                            // 화면 흔들림 효과를 위한 업데이트 함수
                            const shakeUpdate = () => {
                                if (shakeTime < shakeDuration) {
                                    shakeTime += k.dt();
                                    const shakeX =
                                        (Math.random() - 0.5) * shakeIntensity;
                                    const shakeY =
                                        (Math.random() - 0.5) * shakeIntensity;
                                    k.camPos(
                                        originalCamPos.add(
                                            k.vec2(shakeX, shakeY)
                                        )
                                    );
                                } else {
                                    k.camPos(originalCamPos); // 원래 위치로 복원
                                    return true; // 흔들림 완료
                                }
                                return false;
                            };

                            // 흔들림 효과 시작
                            const shakeInterval = setInterval(() => {
                                if (shakeUpdate()) {
                                    clearInterval(shakeInterval);
                                }
                            }, 16); // 약 60fps

                            const locale = gameState.getLocale();
                            const font =
                                locale === "korean" ? "galmuri" : "gameboy";

                            await new Promise((resolve) => {
                                globalSystemManager.globalDialogue.showDialogue({
                                    content: ["....꺅!!!!!!"],
                                    speakerName: null,
                                    speakerImage: null,
                                }, resolve);
                            });

                            // 추가된 부분: 잠시 후 추가 다이얼로그 표시
                            await k.wait(1.5); // 1.5초 대기

                            await new Promise((resolve) => {
                                globalSystemManager.globalDialogue.showDialogue({
                                    content: ["...방금 내가 본게 뭐지...?"],
                                    speakerName: null,
                                    speakerImage: null,
                                }, resolve);
                            });

                            // 수정된 부분: 다이얼로그 완료 후 유령 완전 제거
                            hasGhostDialogShown = true;

                            // 유령 타일 레이어 완전 제거
                            if (ghostTileLayer && ghostTileLayer.exists()) {
                                ghostTileLayer.destroy();
                                ghostTileLayer = null;
                            }

                            // 유령 엔티티 완전 제거
                            if (entities.ghost && entities.ghost.exists()) {
                                entities.ghost.destroy();
                                entities.ghost = null;
                            }

                            console.log(
                                "👻 유령 이벤트 완료 - 유령이 영구적으로 사라짐"
                            );
                        }
                    });
                });

                console.log(`👻 플레이어 점프해서 튕겨져나가기 시작`);
            }

            // ghost 타일 레이어 fadeIn
            k.tween(
                0,
                1,
                2.0, // 2초에 걸쳐 서서히 나타남
                (val) => {
                    if (ghostTileLayer && ghostTileLayer.exists()) {
                        ghostTileLayer.children.forEach((tile) => {
                            if (tile.exists()) {
                                tile.opacity = val;
                            }
                        });
                    }
                },
                k.easings.easeOutQuad
            ).then(() => {
                isGhostTileLayerFading = false;
            });
        }

        // 수정된 부분: 40px 이상 멀어지면 없어지게 (다이얼로그 완료 전에만)
        if (
            distance > 40 &&
            hasGhostTileLayerShown &&
            ghostTileLayer &&
            ghostTileLayer.exists() &&
            !isGhostTileLayerFading &&
            !hasGhostDialogShown
        ) {
            isGhostTileLayerFading = true;
            // console.log(
            //     `👻 Ghost 타일 레이어 fadeOut 시작 (거리: ${Math.floor(
            //         distance
            //     )}px)`
            // );

            // ghost 타일 레이어 fadeOut
            k.tween(
                1,
                0,
                2.0, // 2초에 걸쳐 천천히 사라짐
                (val) => {
                    if (ghostTileLayer && ghostTileLayer.exists()) {
                        ghostTileLayer.children.forEach((tile) => {
                            if (tile.exists()) {
                                tile.opacity = val;
                            }
                        });
                    }
                },
                k.easings.easeInQuad
            ).then(() => {
                hasGhostTileLayerShown = false; // 다시 나타날 수 있도록 설정
                isGhostTileLayerFading = false; // fadeOut 플래그 리셋
                // console.log("👻 Ghost 타일 레이어 fadeOut 완료");
            });
        }

        // 수정된 부분: ghost entity 생성 로직 (40px 이내에서 생성, 한번만)
        if (distance <= 40 && !hasGhostSpawned && !hasGhostDialogShown) {
            // console.log(
            //     `[DEBUG] 플레이어가 door_wc2 80px 반경에 접근! 거리: ${Math.floor(
            //         distance
            //     )}px`
            // );
            spawnGhostNearDoor();
        }

        // 수정된 부분: ghost entity fadeOut 처리 (40px 이상 멀어지면, 다이얼로그 완료 전에만)
        if (
            distance > 40 &&
            hasGhostSpawned &&
            entities.ghost &&
            entities.ghost.exists() &&
            !isGhostFadingOut && // 이미 fadeOut 중이 아닐 때만 실행
            !hasGhostDialogShown
        ) {
            isGhostFadingOut = true; // fadeOut 시작 플래그 설정
            // console.log("👻 Ghost entity fadeOut 시작");

            // fadeOut 효과
            k.tween(
                entities.ghost.opacity,
                0,
                1.5, // 1.5초에 걸쳐 천천히 사라짐
                (val) => {
                    if (entities.ghost && entities.ghost.exists()) {
                        entities.ghost.opacity = val;
                    }
                },
                k.easings.easeInQuad
            ).then(() => {
                // fadeOut 완료 후 ghost 제거
                // console.log("👻 Ghost entity fadeOut 완료, 제거");
                if (entities.ghost && entities.ghost.exists()) {
                    entities.ghost.destroy();
                }
                entities.ghost = null;
                hasGhostSpawned = false; // 다시 생성 가능하도록 설정
                isGhostFadingOut = false; // fadeOut 플래그 리셋
            });
        }
    });

    k.camScale(3);
    k.camPos(entities.player.worldPos());
    k.onUpdate(async () => {
        if (entities.player.pos.dist(k.camPos()) > 3) {
            await k.tween(
                k.camPos(),
                entities.player.worldPos(),
                0.15,
                (newPos) => k.camPos(newPos),
                k.easings.linear
            );
        }
    });

    // Student나 letter는 정적이므로 별도 AI 처리 불필요
    // 필요시 여기에 student들의 애니메이션이나 상호작용 로직 추가 가능

    // 추가된 부분: 퀘스트 말풍선 시스템 초기화
    initializeQuestBubbles(k, entities.students, map);

    // 수정된 부분: newcha 타일 레이어 시스템 초기화 (전역 상태 사용)
    console.log("[DEBUG] newcha 타일 레이어 시스템 초기화 완료");

    if (entities.newchaTileLayer) {
        console.log("[DEBUG] newcha 타일 레이어 발견!");
        console.log(
            "[DEBUG] 버섯 섭취 상태 확인:",
            gameState.getHasEatenMushroom()
        );

        if (gameState.getHasEatenMushroom()) {
            console.log(
                "[DEBUG] ✅ 버섯을 먹었으므로 newcha 타일 레이어를 보이게 설정!"
            );
        } else {
            console.log(
                "[DEBUG] ❌ 버섯을 먹지 않았으므로 newcha 타일 레이어를 숨김 처리!"
            );
        }
    } else {
        console.log("[DEBUG] ⚠️ newcha 타일 레이어를 찾을 수 없습니다!");
        console.log(
            "[DEBUG] 💡 Tiled 에디터에서 newcha 레이어를 추가해야 합니다."
        );
    }

    const uiManager = createUIManager(k);
    uiManager.initialize(k);
    
    // 인벤토리 시스템 초기화 (씬에서 명시적으로 생성)
    if (k.inventoryManager) {
        console.log("📦 씬에서 인벤토리 생성 중...");
        k.inventoryManager.create();
    }
    
    watchPlayerHealth(k);

    let isLocaleLocked = { value: false };
    let isMuteLocked = { value: false };

    // 키보드 단축키
    k.onKeyPress("l", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    // 수정된 부분: 한글 자판 'ㅣ' (l키)도 언어 변경
    k.onKeyPress("ㅣ", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onKeyPress("m", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    // 수정된 부분: 한글 자판 'ㅡ' (m키)도 음소거 토글
    k.onKeyPress("ㅡ", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    // 게임패드 컨트롤 (L/R 숄더 버튼)
    k.onGamepadButtonPress("lshoulder", () => {
        // L버튼
        console.log("🎮 L버튼 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rshoulder", () => {
        // R버튼
        console.log("🎮 R버튼 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    // 게임패드 트리거 버튼도 추가 (선택사항)
    k.onGamepadButtonPress("ltrigger", () => {
        // L2 트리거
        console.log("🎮 L2 트리거 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rtrigger", () => {
        // R2 트리거
        console.log("🎮 R2 트리거 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);
}
