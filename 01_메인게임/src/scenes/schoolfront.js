import { createUIManager } from "../systems/uiManager.js";
import {
    generatePlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../utils.js"; // 타일맵 씬에서는 audioManager만 사용

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
} from "../utils.js";

import noteDialogues from "../content/temp/noteDialogue.js";
import objectDialogues from "../content/objectDialogue.js";
import dialogues from "../content/Dialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { resetDialogSystem } from "../uiComponents/dialog.js";
import { resetDialogUISystem } from "../systems/uiComponents.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import { globalState } from "../state/stateManagers.js";
import {
    toggleLocale,
    toggleMute,
    setupMainMenuShortcut,
    initializeQuestBubbles,
    updateQuestBubbles,
    SPEECH_BUBBLE_STATES, // 추가된 부분: 말풍선 상태 import
} from "../utils.js";

// 수정된 부분: 충돌 시 포물선 킥 함수
function kickBallOnCollision(k, ball, player) {
    const currentTime = Date.now();
    const KICK_COOLDOWN = 1000; // 1초 쿨다운 (충돌 시에는 조금 더 길게)

    // 쿨다운 체크
    if (currentTime - ball.lastKickTime < KICK_COOLDOWN) {
        return;
    }

    ball.lastKickTime = currentTime;

    // 플레이어와 공의 위치 차이로 킥 방향 계산
    const kickDirection = ball.pos.sub(player.pos).unit(); // 플레이어에서 공 방향
    const kickDistance = 100; // 수정된 부분: 포물선으로 날아갈 거리 (200→180, 10% 감소)
    const kickHeight = 20; // 포물선의 높이

    // 목표 위치 계산 (플레이어에서 멀어지는 방향)
    const targetPos = ball.pos.add(kickDirection.scale(kickDistance));

    // 킥 효과음 재생
    k.play("boop-sfx");
    k.play("kick-sfx");

    // 수정된 부분: 1.5초 후에 기쁨의 말풍선 표시
    k.wait(0.7, () => {
        showJoyBubble(k, player);
    });

    // 포물선 애니메이션 (수정된 부분: 포물선 궤적으로 공이 날아감)
    const startPos = ball.pos.clone();
    const duration = 0.8; // 애니메이션 지속 시간
    let animTime = 0;

    ball.isMoving = true; // 애니메이션 중에는 공이 움직이는 상태

    // 물리 바디 비활성화 (애니메이션 동안은 물리 엔진 사용 안함)
    if (ball.body) {
        ball.body.vel = k.vec2(0, 0);
    }

    const animateParabola = () => {
        animTime += k.dt();
        const progress = Math.min(animTime / duration, 1); // 0~1 사이 진행률

        if (progress >= 1) {
            // 애니메이션 완료
            ball.pos = targetPos;
            ball.isMoving = false;

            // 물리 바디 다시 활성화
            if (ball.body) {
                ball.body.vel = k.vec2(0, 0);
            }

            // 퀘스트 완료 트리거 (전역 함수 호출)
            if (window.completeQuestByTarget) {
                window.completeQuestByTarget("object", "ball");
                console.log("🎯 공 차기 퀘스트 완료 트리거됨");
            }

            console.log("🎾 공이 포물선을 그리며 날아갔습니다!");
            return;
        }

        // 포물선 계산 (베지어 곡선 형태)
        const x = k.lerp(startPos.x, targetPos.x, progress);
        const baseY = k.lerp(startPos.y, targetPos.y, progress);
        const parabolaOffset = kickHeight * Math.sin(progress * Math.PI); // 포물선 높이
        const y = baseY - parabolaOffset; // 위쪽으로 포물선

        ball.pos = k.vec2(x, y);

        // 다음 프레임에서 계속 애니메이션
        k.wait(0, animateParabola);
    };

    // 애니메이션 시작
    animateParabola();

    // console.log("🦵 플레이어가 공에 충돌하여 포물선 킥!");
}

// 추가된 부분: 플레이어 위에 기쁨의 말풍선을 띄우는 함수
function showJoyBubble(k, player) {
    // 기존 말풍선이 있다면 제거
    if (player.joyBubble && player.joyBubble.exists()) {
        player.joyBubble.destroy();
    }

    // 수정된 부분: 말풍선 위치 오프셋 상수로 정의
    const BUBBLE_OFFSET_X = 3;
    const BUBBLE_OFFSET_Y = -15;

    // 기쁨의 말풍선 생성 (수정된 부분: 일관된 오프셋 사용)
    const joyBubble = k.add([
        k.sprite("tiny-speech-indicators", {
            frame: SPEECH_BUBBLE_STATES.VERY_HAPPY, // 수정된 부분: 8개로 나눈 중 2번째(VERY_HAPPY) 프레임
        }),
        k.pos(player.pos.x + BUBBLE_OFFSET_X, player.pos.y + BUBBLE_OFFSET_Y), // 수정된 부분: 상수 사용
        k.scale(0.84), // 수정된 부분: 크기 20% 증가 (0.7 * 1.2 = 0.84)
        k.z(20), // 가장 위에 표시
        k.opacity(1.0),
        "joy-bubble",
    ]);

    // 말풍선 애니메이션 (위아래로 살짝 움직임) - 수정된 부분: sin 시작점 조정
    let time = 0;

    joyBubble.onUpdate(() => {
        time += k.dt();

        // 수정된 부분: 정확히 같은 오프셋으로 플레이어 추적
        if (player.exists()) {
            joyBubble.pos.x = player.pos.x + BUBBLE_OFFSET_X; // 일관된 X 오프셋
            // 수정된 부분: 처음에는 기준 위치, 그 다음부터 애니메이션
            if (time < 0.1) {
                joyBubble.pos.y = player.pos.y + BUBBLE_OFFSET_Y; // 처음 0.1초는 기준 위치 유지
            } else {
                joyBubble.pos.y =
                    player.pos.y +
                    BUBBLE_OFFSET_Y +
                    Math.sin((time - 0.1) * 4) * 3; // 0.1초 후부터 애니메이션
            }
        }
    });

    // 플레이어에 말풍선 참조 저장
    player.joyBubble = joyBubble;

    // 2초 후 말풍선 제거
    k.wait(2, () => {
        if (joyBubble.exists()) {
            // 페이드 아웃 효과
            k.tween(
                joyBubble.opacity,
                0,
                0.5,
                (val) => {
                    joyBubble.opacity = val;
                },
                k.easings.easeOutQuad
            ).then(() => {
                if (joyBubble.exists()) {
                    joyBubble.destroy();
                }
            });
        }
    });
}

export default async function schoolfront(k) {
    // 프롤로그에서 넘어온 경우 대화 시스템 정리
    const previousScene = gameState.getPreviousScene();
    if (previousScene === "prologue") {
        // console.log("🎯 프롤로그에서 schoolfront로 이동, 대화 시스템 정리 시작");
        
        // 대화 시스템 초기화
        resetDialogSystem();
        resetDialogUISystem();
        
        // 추가 전역 변수 정리
        if (typeof window !== 'undefined') {
            window.dialogUIInstance = null;
            window.currentDialog = null;
            window.isDialogActive = false;
            window.dialogQueue = [];
            window.dialogState = null;
            window.activeDialogBox = null;
            window.prologueActive = false;
            window.prologueDialogActive = false;
            window.currentScene = 'schoolfront';
        }
        
        // DOM 요소 추가 정리
        const dialogSelectors = [
            '[data-dialog]',
            '.dialog-container',
            '.dialog-box',
            '.dialog-text',
            '.dialog-ui',
            '.ui-dialog-box',
            '.ui-dialog-text',
            '.ui-name-tab',
            '.ui-choice-container',
            '.ui-toast',
            '[id*="dialog"]',
            '[class*="dialog"]',
            '[data-prologue]'
        ];
        
        dialogSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            } catch (e) {
                console.warn(`선택자 ${selector} 정리 중 오류:`, e);
            }
        });
        
        // console.log("🎯 schoolfront 대화 시스템 정리 완료");
    }
    
    // 🚀 BGM 즉시 전환 (타일맵 씬에서는 audioManager.switchBGM 사용)
    audioManager.switchBGM("rpg-front-bgm", 1.0);

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    colorizeBackground(k, 238, 246, 169);
    const mapData = await fetchMapData("./assets/images/schoolfront.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
    };
    const layers = mapData.layers;
    for (const layer of layers) {
        if (layer.name === "boundaries") {
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                if (
                    [
                        "guryeong",
                        "front_gate",
                        "main_entrance",
                        "sink",
                        "painter",
                        // ball은 별도 처리하므로 제거
                        // nca는 spawnpoint로 이동 (수정된 부분)
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

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
                    objectEntity.onCollideUpdate("player", (player) => {
                        // main_entrance의 경우 즉시 씬 전환
                        if (objectType === "main_entrance") {
                            k.play("boop-sfx");
                            k.go("first");
                            return;
                        }

                        // 상호작용 가능한 객체로 설정
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
                            }
                        );
                    });

                    // 충돌에서 벗어날 때 상호작용 객체 초기화
                    objectEntity.onCollideEnd("player", (player) => {
                        if (objectType !== "main_entrance") {
                            gameState.clearInteractableObject();
                        }
                    });
                }
            }

            drawBoundaries(k, map, layer);
            continue;
        }

        if (layer.name === "spawnpoint") {
            for (const object of layer.objects) {
                if (
                    object.name === "player-dungeon" &&
                    previousScene === "dungeon"
                ) {
                    entities.player = map.add(
                        generatePlayerComponents(k, k.vec2(object.x, object.y))
                    );
                    continue;
                }

                // first에서 돌아온 경우 player2 지점에 스폰
                if (
                    object.name === "player2" &&
                    (previousScene === "first" ||
                        gameState.getTargetSpawn() === "player2")
                ) {
                    entities.player = map.add(
                        generatePlayerComponents(k, k.vec2(object.x, object.y))
                    );
                    gameState.setTargetSpawn(null); // 목표 스폰 리셋
                    continue;
                }

                if (
                    object.name === "player" &&
                    (!previousScene || previousScene === "house")
                ) {
                    entities.player = map.add(
                        generatePlayerComponents(k, k.vec2(object.x, object.y))
                    );
                    continue;
                }

                if (object.name.startsWith("student")) {
                    // student1, student2, student3, student4 처리
                    const studentType = object.name; // student1, student2, etc.

                    const student = map.add([
                        k.sprite("main-assets", {
                            anim: studentType, // main.js에 정의된 애니메이션 사용
                        }),
                        k.area({
                            shape: new k.Rect(k.vec2(0), 24, 24), // 24x24 픽셀 충돌 영역
                        }),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "student",
                        { studentType },
                    ]);

                    entities.students.push(student);

                    // 퀘스트 완료를 위한 onInteractionComplete 콜백 설정
                    if (studentType === "student1") {
                        student.onInteractionComplete = () => {
                            console.log(`[DEBUG] ${studentType} 대화 완료 - 퀘스트 완료 체크`);
                            if (window.completeQuestByTarget) {
                                console.log(`[DEBUG] ${studentType} 퀘스트 완료 호출: npc, ${studentType}`);
                                window.completeQuestByTarget("npc", studentType);
                            } else {
                                console.error(`❌ ${studentType}: completeQuestByTarget 함수가 전역에 등록되지 않음`);
                            }
                        };
                    }

                    // 추가된 부분: student1에만 말풍선 추가 (임시로 제거 - 에러 해결 후 다시 추가 예정)
                    // if (studentType === "student1") {
                    //     const bubble = map.add([
                    //         k.sprite("main-assets", { frame: 874 }),
                    //         k.pos(student.pos.x, student.pos.y - 50),
                    //         k.anchor("bottom"),
                    //         k.scale(0.8),
                    //         k.z(20),
                    //         k.opacity(1.0),
                    //         "speech-bubble"
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

                if (object.name.startsWith("letter")) {
                    // letter1, letter2 처리
                    const letterType = object.name;
                    const letterId =
                        object.properties?.find((p) => p.name === "letterId")
                            ?.value || letterType;

                    const letter = map.add([
                        k.sprite("main-assets", {
                            anim: letterType, // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
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

                // nca 처리 (수정된 부분: spawnpoint 레이어에서 처리)
                if (object.name === "nca") {
                    const nca = map.add([
                        k.sprite("main-assets", { frame: 1277 }), // 수정된 부분: 인덱스 1277 사용
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "nca",
                        "interactive-object",
                        { objectType: "nca" },
                    ]);

                    // 수정된 부분: nca 상호작용 시스템
                    nca.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = objectDialogues[locale]?.["nca"] || [
                            "...NCA? New Contents Academy?",
                            "...NCA? 뉴콘텐츠아카데미?",
                        ];

                        const speakerName =
                            objectDialogues.names[locale]?.["nca"] || "NCA";

                        gameState.setInteractableObject(nca, "object", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    nca.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    continue;
                }

                // director 처리
                if (object.name === "director") {
                    const director = map.add([
                        k.sprite("main-assets", {
                            anim: "director", // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "director",
                        { npcType: "director" },
                    ]);

                    // 수정된 부분: director 상호작용 시스템
                    director.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = npcDialogues[locale]?.["director"] || [
                            "Hello! I'm the director of this school.",
                            "안녕하세요! 저는 이 학교의 교장입니다.",
                        ];

                        const speakerName =
                            npcDialogues.names[locale]?.["director"] ||
                            "Director";

                        gameState.setInteractableObject(director, "npc", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    director.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    continue;
                }

                // cat 처리
                if (object.name === "cat") {
                    const cat = map.add([
                        k.sprite("main-assets", {
                            anim: "cat", // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
                        k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                        "cat",
                        { npcType: "cat" },
                    ]);

                    // 수정된 부분: cat 상호작용 시스템 (BGM ducking과 효과음 추가)
                    cat.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = objectDialogues[locale]?.["cat"] || [
                            "Meow~ Meow~",
                            "야옹~ 야옹~",
                        ];

                        const speakerName =
                            objectDialogues.names[locale]?.["cat"] || "Cat";

                        gameState.setInteractableObject(cat, "npc", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });

                        // 수정된 부분: BGM ducking 후 고양이 효과음 재생
                        (async () => {
                            try {
                                console.log(`🔇 cat BGM ducking 시작...`);
                                // BGM ducking 시작
                                await audioManager.duckBGM(0.2, 300);
                                console.log(`🔇 cat BGM ducking 완료`);
                                
                                // 고양이 효과음 재생
                                k.play("cat-sfx", { volume: 1.5 });
                                console.log(`🔊 cat 대화 효과음 재생 완료 (ducking 적용, 볼륨: 150%)`);
                                
                                // 효과음 재생 완료 후 BGM 복구
                                setTimeout(async () => {
                                    console.log(`🔊 cat BGM 복구 시작...`);
                                    await audioManager.unduckBGM(500);
                                    console.log(`🔊 cat BGM 복구 완료`);
                                }, 1500); // 1.5초 후 복구
                                
                            } catch (error) {
                                console.warn(`⚠️ cat 대화 효과음/ducking 실패:`, error);
                                audioManager.unduckBGM(300);
                            }
                        })();
                    });

                    cat.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    continue;
                }

                // facil 처리
                if (object.name === "facil") {
                    const facil = map.add([
                        k.sprite("main-assets", {
                            anim: "facil", // main.js에 정의된 애니메이션 사용
                        }),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y),
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

                // 추가된 부분: ball (피구공) 처리 - 물리적으로 차일 수 있는 오브젝트
                if (object.name === "ball") {
                    const ball = map.add([
                        k.sprite("main-assets", {
                            frame: 5296, // main.js에 정의된 ball 스프라이트 인덱스
                        }),
                        k.area({
                            shape: new k.Rect(k.vec2(0), 16, 16), // 공 크기에 맞는 충돌 영역
                        }),
                        k.body({
                            isStatic: true, // 수정된 부분: 애니메이션 기반이므로 기본적으로 정적
                            mass: 1,
                            restitution: 0.6,
                        }),
                        k.pos(object.x, object.y),
                        k.z(1), // 플레이어와 같은 z 레벨
                        "ball",
                        "kickable", // 킥 가능한 오브젝트 태그 추가
                        {
                            objectType: "ball",
                            lastKickTime: 0, // 킥 쿨다운을 위한 시간 추적
                            isMoving: false, // 애니메이션 중인지 추적
                        },
                    ]);

                    // 플레이어가 공에 충돌하면 즉시 킥 (수정된 부분: 충돌 시 자동 킥)
                    ball.onCollide("player", (player) => {
                        // 수정된 부분: 충돌 즉시 공을 킥!
                        kickBallOnCollision(k, ball, player);
                    });

                    continue;
                }

                // 기존 note 처리는 유지 (호환성을 위해)
                if (object.name === "note") {
                    const noteIdProp = object.properties?.find(
                        (p) => p.name === "noteId"
                    )?.value;

                    const note = map.add(
                        generateNoteComponents(
                            k,
                            k.vec2(object.x, object.y),
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

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), 다른 타일은 기본 (z=0)
                const zIndex = layer.name === "upmost" ? 3 : 0;

                // Use main-assets sprite instead of assets
                map.add([
                    k.sprite("main-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                    k.offscreen(),
                ]);
            }
            continue;
        }
    }

    setPlayerControls(k, entities.player);

    // 수정된 부분: player 존재 확인 후 이벤트 리스너 설정
    if (entities.player && entities.player.exists()) {
        entities.player.onCollide("door-entrance", () => k.go("house"));
        entities.player.onCollide("dungeon-door-entrance", () =>
            k.go("dungeon")
        );
    }

    k.camScale(3);

    // 수정된 부분: player 존재 확인 후 카메라 설정
    if (entities.player && entities.player.exists()) {
        k.camPos(entities.player.worldPos());
    }

    k.onUpdate(async () => {
        // 수정된 부분: player 존재 확인 후 카메라 업데이트
        if (
            entities.player &&
            entities.player.exists() &&
            entities.player.pos.dist(k.camPos()) > 3
        ) {
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

    const uiManager = createUIManager(k);
    uiManager.initialize(k);
    
    // 인벤토리 시스템 초기화 (씬에서 명시적으로 생성)
    if (k.inventoryManager) {
        console.log("📦 씬에서 인벤토리 생성 중...");
        k.inventoryManager.create();
    }
    
    // ==============================
    // 전역 시스템 통합 매니저 초기화 (student NPC 대화 퀘스트 완료를 위해 필요)
    // ==============================
    // schoolfront 대화 데이터 (Dialogue.js에서 가져온 데이터 사용)
    const schoolfrontDialogueData = {
        npcDialogues: dialogues,  // Dialogue.js에서 가져온 전체 대화 데이터
        objectDialogues: objectDialogues,
        npcNames: dialogues.names || {},
        objectNames: objectDialogues.names || {}
    };
    
    console.log("🗣️ Schoolfront 전역 시스템 매니저 초기화 시작");
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "schoolfront", schoolfrontDialogueData);
    globalSystemManager.initialize();
    const globalUI = globalSystemManager.globalUI;
    
    // 기존 student 오브젝트들의 collision 핸들러를 globalDialogue로 교체
    console.log("🔄 기존 student collision 핸들러를 globalDialogue로 교체 중...");
    
    // "student" 태그를 가진 모든 엔티티에 대해서도 적용 (studentType 속성 사용)
    k.get("student", { recursive: true }).forEach((student) => {
        if (student.studentType) {
            console.log(`🔄 ${student.studentType} (student) collision 핸들러 교체`);
            globalSystemManager.globalDialogue.setupPlayerCollision(student, student.studentType, {});
        }
    });
    
    console.log("✅ Schoolfront 전역 시스템 매니저 초기화 완료");
    
    watchPlayerHealth(k);

    let isLocaleLocked = { value: false };
    let isMuteLocked = { value: false };

    // 키보드 단축키
    k.onKeyPress("l", () => {
        // L키 - 설정창 열기
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("🔧 L키로 설정창 열기");
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    // 수정된 부분: 한글 자판 'ㅣ' (l키)도 설정창 열기
    k.onKeyPress("ㅣ", () => {
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("🔧 ㅣ키로 설정창 열기");
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("r", () => {
        // R키 - 퀘스트창 열기
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("📋 R키로 퀘스트창 열기");
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㄱ", () => {
        // R키 - 퀘스트창 열기 (한글 입력)
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("📋 ㄱ키로 퀘스트창 열기");
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
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

    // 게임패드 트리거 버튼도 추가 (선택사항)
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
}
