import { healthBar } from "../uiComponents/healthbar.js";
import {
    generatePlayerComponents,
    generateFrontPlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import { gameState } from "../state/stateManagers.js";
import { globalState } from "../state/stateManagers.js";
import { audioManager } from "../utils.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import { FRONT_SPRITES, getNPCSprite, getObjectSprite } from "../scene-assets/frontAssets.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
} from "../utils.js";


import dialogues from "../content/Dialogue.js";
import objectDialogues from "../content/objectDialogue.js";
import { frontDialogues, frontObjectDialogues } from "../content/dialogue/frontDialogue.js";
import { initializeQuests, completeQuest, getQuestSaveData, addQuest4OnLetter3Read } from "../content/questData.js";
import { QuestUIManager } from "../uiComponents/questUIManager.js";
import { AutoSaveManager } from "../systems/autoSaveManager.js";
import NotificationManager from "../systems/notificationManager.js";
import { dialog, choiceDialog } from "../uiComponents/dialog.js";
import { showInteractiveDialog, setupSpaceInteraction, setupInteractionWithDialogs, showMultipleDialogs } from "../uiComponents/interactiveDialog.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import { UI_POSITIONS, UI_SIZES } from "../uiComponents/uiConstants.js";

import {
    setupMainMenuShortcut,
    initializeQuestBubbles,
    updateQuestBubbles,
    SPEECH_BUBBLE_STATES,
} from "../utils.js";

// 전역 퀘스트 항목들 (front.js 전체에서 접근 가능)
let questItems = [];

// 추가된 부분: 충돌 시 포물선 킥 함수
function kickBallOnCollision(k, ball, player) {
    const currentTime = Date.now();
    const KICK_COOLDOWN = 1000; // 1초 쿨다운

    // 쿨다운 체크
    if (currentTime - ball.lastKickTime < KICK_COOLDOWN) {
        return;
    }

    ball.lastKickTime = currentTime;

    // 플레이어와 공의 위치 차이로 킥 방향 계산
    const kickDirection = ball.pos.sub(player.pos).unit();
    const kickDistance = 100;
    const kickHeight = 20;

    // 목표 위치 계산
    const targetPos = ball.pos.add(kickDirection.scale(kickDistance));

    // 킥 효과음 재생
    k.play("boop-sfx");
    k.play("kick-sfx");

    // 기쁨의 말풍선 표시
    k.wait(0.7, () => {
        showJoyBubble(k, player);
    });

    // 포물선 애니메이션
    const startPos = ball.pos.clone();
    const duration = 0.8;
    let animTime = 0;

    ball.isMoving = true;

    if (ball.body) {
        ball.body.vel = k.vec2(0, 0);
    }

    const animateParabola = () => {
        animTime += k.dt();
        const progress = Math.min(animTime / duration, 1);

        if (progress >= 1) {
            ball.pos = targetPos;
            ball.isMoving = false;

            if (ball.body) {
                ball.body.vel = k.vec2(0, 0);
            }

            console.log("🎾 공이 포물선을 그리며 날아갔습니다!");
            return;
        }

        const x = k.lerp(startPos.x, targetPos.x, progress);
        const baseY = k.lerp(startPos.y, targetPos.y, progress);
        const parabolaOffset = kickHeight * Math.sin(progress * Math.PI);
        const y = baseY - parabolaOffset;

        ball.pos = k.vec2(x, y);

        k.wait(0, animateParabola);
    };

    animateParabola();

    console.log("🦵 플레이어가 공에 충돌하여 포물선 킥!");
    
    // 공을 찰 때마다 기분 +1, 체력 -1 (최대/최소값 제한)
    globalState.changeMood(1); // 기분 증가 (최대 9)
    globalState.changeHealth(-1); // 체력 감소 (최소 0)
    
    console.log(`⚽ 공차기 후 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
    
    // 상태 변화 즉시 UI 업데이트 (여러 번 호출로 확실히)
    if (window.updateStatusBars) {
        window.updateStatusBars();
    }
    
    // 0.1초 후에도 한 번 더 업데이트 (확실한 반영을 위해)
    k.wait(0.1, () => {
        if (window.updateStatusBars) {
            window.updateStatusBars();
        }
        // console.log("🔄 공차기 후 추가 상태바 업데이트 완료");
    });
    
    // 상태 변화 알림 표시 (초기화 확인 후) - 간격을 늘려서 순차적으로 표시
    k.wait(1.0, () => {
        if (window.showStatusChangeMessage && window.notificationManager) {
            console.log("📢 기분 증가 알림 표시 시도");
            window.showStatusChangeMessage("공차기로 기분이 좋아졌습니다!", "mood", "increase");
        } else {
            console.warn("⚠️ 알림 시스템이 아직 초기화되지 않음");
        }
    });
    
    k.wait(4.0, () => { // 3초 더 늘려서 충분한 간격 확보
        if (window.showStatusChangeMessage && window.notificationManager) {
            console.log("📢 체력 감소 알림 표시 시도");
            window.showStatusChangeMessage("체력이 소모되었습니다", "health", "decrease");
        } else {
            console.warn("⚠️ 알림 시스템이 아직 초기화되지 않음");
        }
    });
    
    // 공 차기 퀘스트 완료 처리
    console.log(`[DEBUG] 공 차기 퀘스트 완료 처리 시도 - completeQuestByTarget: ${!!window.completeQuestByTarget}`);
    if (window.completeQuestByTarget) {
        console.log(`[DEBUG] 공 차기 퀘스트 완료 호출: object, ball`);
        window.completeQuestByTarget("object", "ball");
    } else {
        console.error(`❌ completeQuestByTarget 함수가 전역에 등록되지 않음`);
    }
}

// 추가된 부분: 플레이어 위에 기쁨의 말풍선을 띄우는 함수
function showJoyBubble(k, player) {
    if (player.joyBubble && player.joyBubble.exists()) {
        player.joyBubble.destroy();
    }

    const BUBBLE_OFFSET_X = 5; 
    const BUBBLE_OFFSET_Y = -14;

    const joyBubble = k.add([
        k.sprite("tiny-speech-indicators", {
            frame: SPEECH_BUBBLE_STATES.VERY_HAPPY,
        }),
        k.pos(player.pos.x + BUBBLE_OFFSET_X, player.pos.y + BUBBLE_OFFSET_Y),
        k.scale(1.176), // 1.68의 70%: 1.68 * 0.7 = 1.176
        k.z(20),
        k.opacity(1.0),
        "joy-bubble",
    ]);

    let time = 0;

    joyBubble.onUpdate(() => {
        time += k.dt();

        if (player.exists()) {
            joyBubble.pos.x = player.pos.x + BUBBLE_OFFSET_X;
            if (time < 0.1) {
                joyBubble.pos.y = player.pos.y + BUBBLE_OFFSET_Y;
            } else {
                joyBubble.pos.y =
                    player.pos.y +
                    BUBBLE_OFFSET_Y +
                    Math.sin((time - 0.1) * 4) * 3;
            }
        }
    });

    player.joyBubble = joyBubble;

    k.wait(2, () => {
        if (joyBubble.exists()) {
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

// 추가된 부분: 플레이어 위에 화남의 말풍선을 띄우는 함수
function showAngryBubble(k, player) {
    if (player.angryBubble && player.angryBubble.exists()) {
        player.angryBubble.destroy();
    }

    const BUBBLE_OFFSET_X = 5; 
    const BUBBLE_OFFSET_Y = -14;

    const angryBubble = k.add([
        k.sprite("tiny-speech-indicators", {
            frame: SPEECH_BUBBLE_STATES.ANGRY, // 화남 프레임 사용
        }),
        k.pos(player.pos.x + BUBBLE_OFFSET_X, player.pos.y + BUBBLE_OFFSET_Y),
        k.scale(1.176), // joyBubble과 동일한 크기
        k.z(20),
        k.opacity(1.0),
        "angry-bubble",
    ]);

    let time = 0;

    angryBubble.onUpdate(() => {
        time += k.dt();

        if (player.exists()) {
            angryBubble.pos.x = player.pos.x + BUBBLE_OFFSET_X;
            if (time < 0.1) {
                angryBubble.pos.y = player.pos.y + BUBBLE_OFFSET_Y;
            } else {
                angryBubble.pos.y =
                    player.pos.y +
                    BUBBLE_OFFSET_Y +
                    Math.sin((time - 0.1) * 4) * 3;
            }
        }
    });

    player.angryBubble = angryBubble;

    k.wait(2, () => {
        if (angryBubble.exists()) {
            k.tween(
                angryBubble.opacity,
                0,
                0.5,
                (val) => {
                    angryBubble.opacity = val;
                },
                k.easings.easeOutQuad
            ).then(() => {
                if (angryBubble.exists()) {
                    angryBubble.destroy();
                }
            });
        }
    });
}

// 퀘스트 완료 메시지 표시 함수 - 알림창 매니저 사용
function showQuestCompletionMessage(questTitle) {
    console.log(`🏆 퀘스트 완료 알림 요청: ${questTitle}`);
    
    if (window.notificationManager) {
        window.notificationManager.addNotification({
            type: 'quest-completion',
            message: questTitle
        });
    } else {
        console.warn("⚠️ 알림창 매니저가 아직 초기화되지 않음");
    }
}

// 상태 변화 알림 함수 (기분/체력 증감) - 알림창 매니저 사용
function showStatusChangeMessage(message, type, changeType) {
    console.log(`📋 상태 변화 알림 요청: ${message} (${type}, ${changeType})`);
    
    if (window.notificationManager) {
        window.notificationManager.addNotification({
            type: 'status',
            message: message,
            statusType: type,
            changeType: changeType
        });
    } else {
        console.warn("⚠️ 알림창 매니저가 아직 초기화되지 않음");
    }
}

export default async function front(k, previousScene = null) {
    console.log("🏠 Front 씬 시작, 이전 씬:", previousScene);
    
    // 다마고치 상호작용 전역 변수
    let nearbyTamagotchis = [];
    let nearbyNCAs = []; // NCA 오브젝트 배열 추가
    let nearbyNintendoStudents = []; // Nintendo 학생 배열 추가
    let tamagotchiSpaceKeyRegistered = false;
    let isTamagotchiInteracting = false; // 추가: 다마고치 상호작용 중 플래그
    let isNCAInteracting = false; // NCA 상호작용 중 플래그 추가
    let isNintendoStudentInteracting = false; // Nintendo 학생 상호작용 중 플래그 추가
    
    // 퀘스트 데이터 초기화 - 전역 상태에서 먼저 로드 시도
    let savedQuestData = null;
    const globalQuests = globalState.getGlobalQuests();
    
    // 전역 상태에 퀘스트가 있으면 우선 사용
    if (globalQuests && globalQuests.length > 0) {
        console.log("🔄 전역 상태에서 퀘스트 데이터 복원:", globalQuests.length, "개");
        questItems = [...globalQuests];
    } else {
        // 전역 상태에 없으면 저장 데이터에서 로드
        const playerName = gameState.playerName;
        
        if (playerName && playerName.trim() !== "" && playerName !== "플레이어") {
            const existingSaves = gameDataManager.getSaveList();
            const playerSave = existingSaves.find(save => save.playerName === playerName);
            
            if (playerSave && playerSave.questState && playerSave.questState.questItems) {
                savedQuestData = playerSave.questState.questItems;
                console.log("🎯 저장된 퀘스트 데이터 발견:", savedQuestData);
            }
        }
        
        // questData.js의 initializeQuests 함수 사용
        questItems = initializeQuests(savedQuestData, globalState);
        
        // 초기화된 퀘스트를 전역 상태에 저장
        questItems.forEach(quest => {
            const questWithId = { ...quest, id: quest.targetNpc || quest.targetObject || quest.title };
            globalState.addToGlobalQuests(questWithId);
        });
    }
    
    // UI 매니저들 초기화
    const questUIManager = new QuestUIManager(k, gameState);
    
    // 전역 접근을 위해 window 객체에도 할당
    window.questItems = questItems;
    // NotificationManager는 이제 전역 UI에서 관리됩니다
    
    // 키보드 이벤트 초기화 (이전 씬의 이벤트 리스너 충돌 방지)
    console.log("🔧 키보드 이벤트 초기화 시작");
    
    // window.previousKeyHandler가 있다면 제거
    if (window.previousKeyHandler) {
        document.removeEventListener('keydown', window.previousKeyHandler, true);
        document.removeEventListener('keyup', window.previousKeyHandler, true);
        window.previousKeyHandler = null;
        console.log("✅ 이전 키보드 핸들러 제거 완료");
    }
    
    console.log("🔧 키보드 이벤트 초기화 완료");

    // 이전 씬 확인하여 페이드 인 설정 (함수 파라미터 우선, 없으면 gameState에서 가져오기)
    const actualPreviousScene = previousScene || gameState.getPreviousScene();
    console.log(`[DEBUG] Front 씬 시작 - 이전 씬: ${actualPreviousScene}`);

    // 배경색을 즉시 검은색으로 설정 (깜빡임 방지)
    document.body.style.backgroundColor = 'black';

    // 페이드 인 효과 추가
    const fadeIn = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(1),
        k.z(1001),
        k.fixed(),
    ]);
    
    // Tutorial에서 오는 경우 약간의 지연 후 페이드 인 시작
    const fadeInDuration = (previousScene === "tutorial") ? 1.0 : 1.8;
    const fadeInDelay = (previousScene === "tutorial") ? 0.3 : 0;
    
    k.wait(fadeInDelay, () => {
        // 페이드 인 애니메이션
        k.tween(fadeIn.opacity, 0, fadeInDuration, (val) => {
        fadeIn.opacity = val;
    }).then(() => {
        fadeIn.destroy();
        });
        console.log(`[DEBUG] Front 페이드인 시작 - 지연: ${fadeInDelay}s, 지속: ${fadeInDuration}s`);
    });
    
    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Front BGM으로 즉시 전환");
    audioManager.switchBGM("front-bgm", 1.0);

    console.log("🔍 Front 씬 진입 - 이전 씬:", actualPreviousScene); // 디버깅용 로그 추가

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경색 제거 - 맵 텍스처가 배경 역할을 함
    // colorizeBackground(k, 173, 216, 230); // 연한 파란색 배경 (하늘색) - 제거
    
    const entities = {
        player: null,
        cars: [],
        objects: [],
    };
    
    // 퀘스트 시스템 초기화 및 전역 접근 변수
    let questSystem = null;
    
    let map;
    
    try {
        const mapData = await fetchMapData("./assets/images/front.json");
        console.log("🗺️ Front 맵 데이터 로드 완료:", mapData);
        map = k.add([k.pos(0, 0)]);

        const layers = mapData.layers;
        console.log("🗺️ 레이어 정보:", layers.map(l => ({ name: l.name, type: l.type, objects: l.objects?.length || 'N/A' })));
        
    for (const layer of layers) {
        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            console.log("🚧 Layer offset:", layer.offsetx, layer.offsety);
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                console.log(`🎯 발견된 boundary 오브젝트: ${object.name} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                // 운동부 학생들 (student_w1~w9) 처리
                if (object.name && object.name.startsWith("student_w")) {
                    const studentType = object.name;
                    console.log(`🏃 운동부 학생 발견: ${studentType} at (${object.x}, ${object.y})`);
                    
                    // 투명한 콜라이더만 생성 (스프라이트는 spawnpoints에서 생성하지 않으므로)
                    const student = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0)),
                        k.opacity(0), // 투명하게 설정
                        studentType,
                        "interactive-object",
                        "student", // 학생 태그 추가
                        { objectType: studentType, studentType: studentType },
                    ]);

                    // 대화 시스템 연결
                    student.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = frontDialogues[locale]?.[studentType] || [
                            `안녕! 나는 ${studentType}야!`,
                            "운동하러 왔구나!",
                            "함께 운동하자!"
                        ];

                        const speakerName = frontDialogues.names[locale]?.[studentType] || studentType;

                        gameState.setInteractableObject(student, "student", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    student.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                    
                    console.log(`✅ 운동부 학생 ${studentType} 상호작용 시스템 설정 완료`);
                    continue;
                }
                
                if (
                    [
                        "car1",
                        "car2", // car2 추가
                        "car3", 
                        "car4",
                        "pot", // pot1, pot2를 pot으로 통합
                        "guryeong",
                        "sink",
                        "goal_post1",
                        "goal_post2",
                        "line_machine",
                        "badminton",
                        "main_entrance",
                        "front_gate", // front_gate 추가
                        "ball", // ball 추가
                        "cat1", // cat1 추가
                        "cat2", // cat2 추가
                        "nca", // nca 추가
                        "game", // game 추가
                        "ants", // ants 추가
                        "badminton", // badminton 추가
                        "director", // director 추가
                        "facil", // facil 추가
                        "tamagotchi", // tamagotchi 추가
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

                    // director와 facil의 특별한 처리 (y좌표 조정, 너비 5% 증가)
                    if (objectType === "director" || objectType === "facil") {
                        const adjustedWidth = Math.round(object.width * 1.05); // 너비 5% 증가
                        const adjustedY = object.y + (layer.offsety || 0) - 12; // Y 좌표를 기본 위치로 조정 (10만큼 내림)
                        
                        const npcEntity = map.add([
                            k.rect(adjustedWidth, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x + (layer.offsetx || 0), adjustedY),
                            k.opacity(0), // 투명하게 설정
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        npcEntity.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = frontDialogues[locale]?.[objectType] || [
                                `Hello! I'm ${objectType}.`,
                                `안녕하세요! 저는 ${objectType}입니다.`,
                            ];

                            const speakerName =
                                frontDialogues.names[locale]?.[objectType] ||
                                objectType;

                            gameState.setInteractableObject(
                                npcEntity,
                                "npc",
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                }
                            );
                        });

                        npcEntity.onCollideEnd("player", () => {
                            gameState.clearInteractableObject();
                        });

                        entities.objects.push(npcEntity);
                        continue;
                    }

                    // Tiled 좌표계에 맞춰 위치 조정 (24x24 타일 크기 고려, offsety 적용)
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12), // Y 위치를 12픽셀 위로 조정
                        k.opacity(0), // 투명하게 설정
                        objectType,
                        "interactive-object",
                        { objectType },
                    ]);

                    // main_entrance의 경우 first로 이동
                    objectEntity.onCollideUpdate("player", (player) => {
                        if (objectType === "main_entrance") {
                            // console.log("🚪 메인 입구 감지됨!");
                            console.log(`🔍 맵 전환 전 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
                            k.play("boop-sfx");
                            gameState.setPreviousScene("front");
                            k.go("first");
                            return;
                        }

                        if (objectType === "front_gate") {
                            // console.log("🚪 정문 감지됨!");
                            const locale = gameState.getLocale();
                            const content = frontObjectDialogues[locale]?.["front_gate"] || [
                                "This is the school's front gate. You can leave the school from here.",
                                "학교 정문입니다. 여기서 학교를 나갈 수 있습니다.",
                            ];

                            const speakerName =
                                objectDialogues.names[locale]?.["front_gate"] ||
                                "Front Gate";

                            gameState.setInteractableObject(
                                objectEntity,
                                "object",
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                }
                            );
                            return;
                        }

                        // ball (피구공) 처리 - 물리적으로 차일 수 있는 오브젝트
                        if (objectType === "ball") {
                            // console.log("⚽ 피구공 감지됨!");
                            
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 ball 엔티티 생성
                            const ball = map.add([
                                k.sprite("front-assets", {
                                    frame: 5296, // main.js에 정의된 ball 스프라이트 인덱스
                                }),
                                k.area({
                                    shape: new k.Rect(k.vec2(0), 24, 24),
                                }),
                                k.body({
                                    isStatic: true,
                                    mass: 1,
                                    restitution: 0.6,
                                }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12), // Y 위치를 12픽셀 위로 조정
                                k.z(1),
                                "ball",
                                "kickable",
                                {
                                    objectType: "ball",
                                    lastKickTime: 0,
                                    isMoving: false,
                                },
                            ]);

                            ball.onCollideUpdate("player", (player) => {
                                if (!ball.isMoving) {
                                    kickBallOnCollision(k, ball, player);
                                }
                            });
                            
                            console.log("⚽ 피구공 스프라이트 생성됨 at:", ball.pos);
                            return;
                        }

                        // cat1, cat2 처리
                        if (objectType === "cat1" || objectType === "cat2") {
                            // console.log(`🐱 ${objectType} 감지됨!`);
                            
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 cat 엔티티 생성
                            const cat = map.add([
                                k.sprite("front-assets", {
                                    frame: objectType === "cat1" ? 3784 : 3783, // main.js에 정의된 cat 스프라이트 인덱스
                                }),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12), // Y 위치를 12픽셀 위로 조정
                                k.z(1),
                                objectType,
                                "interactive-object",
                                { objectType, npcType: "cat" }, // 수정된 부분: npcType 추가
                            ]);

                            // 근접 감지 기능 제거

                            // 대화 상호작용 설정
                            cat.onCollideUpdate("player", (player) => {
                                const locale = gameState.getLocale();
                                const content = frontDialogues[locale]?.[objectType] || [
                                    "야옹~",
                                    "(늘어지게 기지개를 켠다)",
                                    "(일광욕을 하고 있다)"
                                ];

                                const speakerName =
                                    frontDialogues.names[locale]?.[objectType] ||
                                    (objectType === "cat1" ? "학교 고양이" : "운동장 고양이");

                                // 수정된 부분: 중복 효과음 재생 제거 - player.js에서 처리됨

                                gameState.setInteractableObject(
                                    cat,
                                    "npc",
                                    {
                                        content: content,
                                        speakerName: speakerName,
                                        speakerImage: null,
                                        onInteractionComplete: () => {
                                            // 대화 완료 시 기분 증가
                                            if (cat.hasSoundPlayed) {
                                                console.log(`[DEBUG] ${objectType} 대화 완료 - 기분 좋아짐`);
                                                
                                                // 기분 게이지 1만큼 증가
                                                try {
                                                    globalState.changeMood(1);
                                                    console.log(`🐱 ${objectType}와 대화해서 기분이 좋아졌습니다! (+1)`);
                                                    console.log(`[DEBUG] 현재 기분 상태: ${globalState.getMood()}/9`);
                                                    
                                                    // 알림 표시
                                                    if (window.notificationManager) {
                                                        window.notificationManager.addNotification({
                                                            type: 'status',
                                                            message: "고양이와 대화해서 기분이 좋아졌다!",
                                                            statusType: 'mood',
                                                            changeType: 'increase'
                                                        });
                                                    }
                                                } catch (error) {
                                                    console.error(`❌ ${objectType} 기분 변화 실패:`, error);
                                                }
                                                
                                                // 쿨다운 설정
                                                cat.hasSoundPlayed = false;
                                                setTimeout(() => {
                                                    cat.hasSoundPlayed = false;
                                                }, 5000);
                                            }
                                        }
                                    }
                                );
                            });

                            cat.onCollideEnd("player", () => {
                                gameState.clearInteractableObject();
                            });


                            
                            console.log(`🐱 ${objectType} 스프라이트 생성됨 at:`, cat.pos);
                            return;
                        }

                        // nca 처리
                        if (objectType === "nca") {
                            // console.log("📄 NCA 전단지 감지됨!");
                            
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 nca 엔티티 생성
                            const nca = map.add([
                                k.sprite("front-assets", {
                                    frame: 5386, // main.js에 정의된 nca 스프라이트 번호 사용
                                }),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12), // Y 위치를 12픽셀 위로 조정
                                k.z(1),
                                objectType,
                                "interactive-object",
                                { objectType },
                            ]);

                            nca.onCollideUpdate("player", (player) => {
                                const locale = gameState.getLocale();
                                const content = objectDialogues[locale]?.[objectType] || [
                                    "NCA recruitment flyer.",
                                    "NCA 모집 전단지입니다.",
                                ];

                                const speakerName =
                                    objectDialogues.names[locale]?.[objectType] ||
                                    "NCA Flyer";

                                gameState.setInteractableObject(
                                    nca,
                                    "object",
                                    {
                                        content: content,
                                        speakerName: speakerName,
                                        speakerImage: null,
                                    }
                                );
                            });

                            nca.onCollideEnd("player", () => {
                                gameState.clearInteractableObject();
                            });
                            
                            console.log("📄 NCA 스프라이트 생성됨 at:", nca.pos);
                            return;
                        }

                        // ants (개미) 처리
                        if (objectType === "ants") {
                            // console.log("🐜 개미 감지됨!");
                            
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 ants 엔티티 생성
                            const ants = map.add([
                                k.sprite("front-assets", {
                                    frame: getObjectSprite("ants"), // frontAssets에서 가져오기
                                }),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0)), // Y 위치 조정 없음
                                k.z(1),
                                objectType,
                                "interactive-object",
                                { objectType },
                            ]);

                            // 개미 상호작용 설정
                            ants.onCollideUpdate("player", (player) => {
                                const locale = gameState.getLocale();
                                const content = frontDialogues[locale]?.["ants"] || [
                                    "작은 개미들이 열심히 일하고 있다.",
                                    "개미들을 보며 근면한 마음이 든다."
                                ];

                                const speakerName = frontDialogues.names[locale]?.["ants"] || "개미들";

                                gameState.setInteractableObject(
                                    ants,
                                    "object",
                                    {
                                        content: content,
                                        speakerName: speakerName,
                                        speakerImage: null,
                                    }
                                );
                            });

                            ants.onCollideEnd("player", () => {
                                gameState.clearInteractableObject();
                            });
                            
                            // console.log("🐜 개미 스프라이트 생성됨 at:", ants.pos);
                            return;
                        }

                        // game (게임기) 처리
                        if (objectType === "game") {
                            // console.log("🎮 게임기 감지됨!");
                            
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 game 엔티티 생성
                            const game = map.add([
                                k.sprite("front-assets", {
                                    frame: getObjectSprite("game"), // frontAssets에서 가져오기
                                }),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0)), // Y 위치 조정 제거
                                k.z(1),
                                objectType,
                                "interactive-object",
                                { objectType },
                            ]);

                            // door_gyo 패턴을 정확히 따라한 게임기 상호작용
                            game.onCollide("player", async (player) => {
                                k.play("bubble-sfx");

                                const locale = gameState.getLocale();
                                const content = frontDialogues[locale]?.["game"] || [
                                    "재미있는 게임이 있어요!",
                                    "한번 플레이해보시겠어요?"
                                ];
                                const font = locale === "korean" ? "galmuri" : "gameboy";

                                const speakerName = frontDialogues.names[locale]?.["game"] || "게임기";

                                await new Promise((resolve) => {
                                    globalSystemManager.globalDialogue.showDialogue({
                                        content: content,
                                        speakerName: speakerName,
                                        speakerImage: null,
                                    }, resolve);
                                });

                                // 교무실 문 특별 처리와 동일한 패턴
                                const choice = await choiceDialog(
                                    k,
                                    k.vec2(k.center().x - 400, k.height() - 220),
                                    [
                                        "재미있는 웹게임이 준비되어 있습니다.",
                                        "한번 플레이해보시겠어요?",
                                    ],
                                    ["아니오", "예"],
                                    { font }
                                );

                                if (choice === 1) {
                                    k.play("confirm-beep-sfx");
                                    window.open(
                                        "https://www.naver.com",
                                        "_blank"
                                    );
                                } else {
                                    k.play("boop-sfx");
                                }
                            });
                            
                            // console.log("🎮 게임기 스프라이트 생성됨 at:", game.pos);
                            return;
                        }

                        // tamagotchi (다마고치) 처리 - 바로 네이버로 이동
                        if (objectType === "tamagotchi") {
                            // 기존 objectEntity 제거
                            objectEntity.destroy();
                            
                            // 새로운 tamagotchi 엔티티 생성
                            const tamagotchi = map.add([
                                k.sprite("front-assets", {
                                    frame: getObjectSprite("tamagotchi") || getObjectSprite("game"), // 스프라이트가 없으면 game 스프라이트 사용
                                }),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0)),
                                k.z(1),
                                "custom-tamagotchi", // 다른 태그 사용
                                // "interactive-object" 태그 제거 - globalDialogueManager가 처리하지 않도록
                                { objectType: "tamagotchi", customHandler: true },
                            ]);

                            // 다마고치 상호작용 설정
                            const locale = gameState.getLocale();
                            
                            // 다마고치를 전역 배열에 추가
                            const tamagotchiData = {
                                entity: tamagotchi,
                                isPlayerNear: false
                            };
                            nearbyTamagotchis.push(tamagotchiData);
                            
                            // 플레이어가 가까이 왔을 때
                            tamagotchi.onCollideUpdate("player", () => {
                                if (!tamagotchiData.isPlayerNear) {
                                    tamagotchiData.isPlayerNear = true;
                                    console.log("💬 다마고치 상호작용 가능 상태 활성화");
                                }
                            });

                            // 플레이어가 멀어졌을 때
                            tamagotchi.onCollideEnd("player", () => {
                                if (tamagotchiData.isPlayerNear) {
                                    tamagotchiData.isPlayerNear = false;
                                    console.log("💬 다마고치 상호작용 상태 비활성화");
                                }
                            });
                            
                            return;
                        }

                        // 상호작용 가능한 객체로 설정
                        const locale = gameState.getLocale();
                        const content = frontObjectDialogues[locale]?.[
                            objectType
                        ] || [
                            `This is ${objectType}`,
                            `이것은 ${objectType}입니다`,
                        ];

                        const speakerName =
                            frontObjectDialogues.names[locale]?.[objectType] ||
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

                    objectEntity.onCollideEnd("player", (player) => {
                        if (objectType !== "main_entrance" && objectType !== "front_gate") {
                            gameState.clearInteractableObject();
                        }
                    });

                    if (objectType.startsWith("car")) {
                        entities.cars.push(objectEntity);
                    } else {
                        entities.objects.push(objectEntity);
                    }
                }
            }

            // drawBoundaries 대신 front.json에 맞는 커스텀 boundary 처리
            for (const object of layer.objects) {
                // 이미 처리한 특별한 오브젝트들은 제외
                if ([
                    "car1", "car2", "car3", "car4", 
                    "pot", "guryeong", "sink",
                    "goal_post1", "goal_post2", "line_machine", 
                    "badminton", "main_entrance", "front_gate",
                    "ball", "cat1", "cat2", "nca", "badminton",
                    "director", "facil"
                ].includes(object.name) || (object.name && object.name.startsWith("student_w"))) {
                    continue;
                }

                // 일반 경계선 처리 (이름이 없는 벽들)
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0)), // front.json에 맞는 offset 적용
                    k.area(),
                    k.body({ isStatic: true }),
                    k.opacity(0), // 투명하게 설정
                    tag,
                ]);
            }
            continue;
        }

        if (layer.name === "spawnpoints") {
            console.log("🎯 Spawnpoints 레이어 발견:", layer);
            // spawnpoints 레이어가 있지만 objects가 있는지 확인
            if (layer.objects && layer.objects.length > 0) {
                console.log("📍 스폰포인트 오브젝트들:", layer.objects);
                
                // 플레이어 스폰포인트를 우선순위 순서대로 처리
                const spawnPoints = layer.objects.filter(obj => 
                    obj.name === "player_garage" || 
                    obj.name === "player2" || 
                    obj.name === "player_first" || 
                    obj.name === "player"
                );
                
                // 우선순위 순서대로 정렬
                const sortedSpawnPoints = spawnPoints.sort((a, b) => {
                    const priority = {
                        "player_garage": 1,  // garage에서 온 경우 (최고 우선순위)
                        "player2": 2,        // schoolfront에서 온 경우
                        "player_first": 3,   // first에서 온 경우
                        "player": 4          // 기본 (마지막 우선순위)
                    };
                    return (priority[a.name] || 999) - (priority[b.name] || 999);
                });
                
                for (const object of sortedSpawnPoints) {
                    if (!entities.player) {
                        // garage에서 돌아온 경우 - player_garage 위치 사용 (우선순위 최고)
                        if (
                            object.name === "player_garage" &&
                            (previousScene === "garage" || gameState.getPreviousScene() === "garage")
                        ) {
                            console.log("🚗 garage에서 돌아온 플레이어 스폰포인트 사용:", object);
                            entities.player = map.add(
                                generateFrontPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            break; // 첫 번째 우선순위 스폰포인트 사용 후 종료
                        }
                        
                        // schoolfront에서 돌아온 경우 - player2 위치 사용
                        if (
                            object.name === "player2" &&
                            (previousScene === "schoolfront" || gameState.getPreviousScene() === "schoolfront")
                        ) {
                            console.log("🚪 학교에서 돌아온 플레이어 스폰포인트 사용:", object);
                            entities.player = map.add(
                                generateFrontPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            break;
                        }

                        // first에서 돌아온 경우 - player_first 위치 사용
                        if (
                            object.name === "player_first" &&
                            (previousScene === "first" || gameState.getPreviousScene() === "first")
                        ) {
                            console.log("🚪 1층에서 돌아온 플레이어 스폰포인트 사용:", object);
                            entities.player = map.add(
                                generateFrontPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            break;
                        }

                        // 기본 플레이어 스폰포인트 (마지막 우선순위)
                        if (object.name === "player") {
                            console.log("🎮 기본 플레이어 스폰포인트 발견:", object);
                            entities.player = map.add(
                                generateFrontPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            break;
                        }
                    }
                }
                
                // 다른 오브젝트들 처리 (cat1, cat2, ball, nca 등)
                for (const object of layer.objects) {
                    // cat1, cat2 처리 (spawnpoints 레이어에서)
                    if (object.name === "cat1" || object.name === "cat2") {
                        console.log(`🐱 ${object.name} 감지됨! (spawnpoints 레이어)`);
                        
                        const objectType = object.name;
                        const spriteFrame = getObjectSprite(objectType);
                        console.log(`🐱 고양이 스프라이트: ${objectType} -> 프레임 ${spriteFrame}`);
                        
                        const cat = map.add([
                            k.sprite("front-assets", {
                                frame: spriteFrame,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            objectType,
                            "interactive-object",
                            { objectType, npcType: "cat" }, // 수정된 부분: npcType 추가
                        ]);

                        // 근접 감지 기능 제거

                        // 대화 상호작용 설정
                        cat.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = frontDialogues[locale]?.[objectType] || [
                                "야옹~",
                                "(늘어지게 기지개를 켠다)",
                                "(일광욕을 하고 있다)"
                            ];

                            const speakerName =
                                frontDialogues.names[locale]?.[objectType] ||
                                (objectType === "cat1" ? "학교 고양이" : "운동장 고양이");

                            // 수정된 부분: 중복 효과음 재생 제거 - player.js에서 처리됨

                            gameState.setInteractableObject(
                                cat,
                                "npc",
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                    onInteractionComplete: () => {
                                        // 대화 완료 시 기분 증가
                                        if (cat.hasSoundPlayed) {
                                            console.log(`[DEBUG] ${objectType} 대화 완료 - 기분 좋아짐`);
                                            
                                            // 기분 게이지 1만큼 증가
                                            try {
                                                globalState.changeMood(1);
                                                console.log(`🐱 ${objectType}와 대화해서 기분이 좋아졌습니다! (+1)`);
                                                console.log(`[DEBUG] 현재 기분 상태: ${globalState.getMood()}/9`);
                                                
                                                // 알림 표시
                                                if (window.notificationManager) {
                                                    window.notificationManager.addNotification({
                                                        type: 'status',
                                                        message: "고양이와 대화해서 기분이 좋아졌다!",
                                                        statusType: 'mood',
                                                        changeType: 'increase'
                                                    });
                                                }
                                            } catch (error) {
                                                console.error(`❌ ${objectType} 기분 변화 실패:`, error);
                                            }
                                            
                                            // 쿨다운 설정
                                            cat.hasSoundPlayed = false;
                                            setTimeout(() => {
                                                cat.hasSoundPlayed = false;
                                            }, 5000);
                                        }
                                    }
                                }
                            );
                        });

                        cat.onCollideEnd("player", () => {
                            gameState.clearInteractableObject();
                        });
                        
                        console.log(`🐱 ${objectType} 스프라이트 생성됨 at:`, cat.pos);
                        continue;
                    }

                    // ball 처리 (spawnpoints 레이어에서)
                    if (object.name === "ball") {
                        console.log("⚽ 피구공 감지됨! (spawnpoints 레이어)");
                        
                        const spriteFrame = getObjectSprite("ball");
                        console.log(`⚽ 피구공 스프라이트: ball -> 프레임 ${spriteFrame}`);
                        
                        const ball = map.add([
                            k.sprite("front-assets", {
                                frame: spriteFrame,
                            }),
                            k.area({
                                shape: new k.Rect(k.vec2(0), 24, 24),
                            }),
                            k.body({
                                isStatic: true,
                                mass: 1,
                                restitution: 0.6,
                            }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "ball",
                            "kickable",
                            {
                                objectType: "ball",
                                lastKickTime: 0,
                                isMoving: false,
                            },
                        ]);

                        ball.onCollideUpdate("player", (player) => {
                            if (!ball.isMoving) {
                                kickBallOnCollision(k, ball, player);
                            }
                        });
                        
                        console.log("⚽ 피구공 스프라이트 생성됨 at:", ball.pos);
                        continue;
                    }

                    // nca 처리 (spawnpoints 레이어에서)
                    if (object.name === "nca") {
                        console.log("📄 NCA 전단지 감지됨! (spawnpoints 레이어)");
                        
                        const spriteFrame = getObjectSprite("nca");
                        console.log(`📄 NCA 스프라이트: nca -> 프레임 ${spriteFrame}`);
                        
                        const nca = map.add([
                            k.sprite("front-assets", {
                                frame: spriteFrame,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "custom-nca", // 태그 변경
                            // "interactive-object" 태그 제거 - globalDialogueManager가 처리하지 않도록
                            { objectType: "nca", customHandler: true },
                        ]);

                        // NCA 상호작용 설정
                        const locale = gameState.getLocale();
                        
                        // NCA를 전역 배열에 추가
                        const ncaData = {
                            entity: nca,
                            isPlayerNear: false
                        };
                        nearbyNCAs.push(ncaData);
                        
                        // 플레이어가 가까이 왔을 때
                        nca.onCollideUpdate("player", () => {
                            if (!ncaData.isPlayerNear) {
                                ncaData.isPlayerNear = true;
                                console.log("💬 NCA 상호작용 가능 상태 활성화");
                            }
                        });

                        // 플레이어가 멀어졌을 때
                        nca.onCollideEnd("player", () => {
                            if (ncaData.isPlayerNear) {
                                ncaData.isPlayerNear = false;
                                console.log("💬 NCA 상호작용 상태 비활성화");
                            }
                        });
                        
                        console.log("📄 NCA 전단지 스프라이트 생성됨 at:", nca.pos);
                        continue;
                    }

                    // ants 처리 (spawnpoints 레이어에서)
                    if (object.name === "ants") {
                        console.log("🐜 개미 감지됨! (spawnpoints 레이어)");
                        
                        const spriteFrame = getObjectSprite("ants");
                        console.log(`🐜 개미 스프라이트: ants -> 프레임 ${spriteFrame}`);
                        
                        const ants = map.add([
                            k.sprite("front-assets", {
                                frame: spriteFrame,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "ants",
                            "interactive-object",
                            { objectType: "ants" },
                        ]);

                        // 특별한 처리 제거 - globalDialogue에서 처리하도록 함
                        
                        console.log("🐜 개미 스프라이트 생성됨 at:", ants.pos);
                        continue;
                    }

                    // game 처리 (spawnpoints 레이어에서)
                    if (object.name === "game") {
                        console.log("🎮 게임기 감지됨! (spawnpoints 레이어)");
                        
                        const game = map.add([
                            k.sprite("front-assets", {
                                frame: getObjectSprite("game"), // frontAssets에서 가져오기
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "game",
                            "interactive-object", // 상호작용 태그 추가
                            { objectType: "game" },
                        ]);

                        // 특별한 처리 제거 - globalDialogue에서 처리하도록 함
                        
                        console.log("🎮 게임기 스프라이트 생성됨 at:", game.pos);
                        continue;
                    }

                    // tamagotchi 처리 (spawnpoints 레이어에서)
                    if (object.name === "tamagotchi") {
                        const tamagotchi = map.add([
                            k.sprite("front-assets", {
                                frame: getObjectSprite("tamagotchi"), // frontAssets에서 가져오기
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "custom-tamagotchi", // 다른 태그 사용
                            // "interactive-object" 태그 제거 - globalDialogueManager가 처리하지 않도록
                            { objectType: "tamagotchi", customHandler: true },
                        ]);

                        // 다마고치 상호작용 설정
                        const locale = gameState.getLocale();
                        
                        // 다마고치를 전역 배열에 추가
                        const tamagotchiData = {
                            entity: tamagotchi,
                            isPlayerNear: false
                        };
                        nearbyTamagotchis.push(tamagotchiData);
                        
                        // 플레이어가 가까이 왔을 때
                        tamagotchi.onCollideUpdate("player", () => {
                            if (!tamagotchiData.isPlayerNear) {
                                tamagotchiData.isPlayerNear = true;
                                console.log("💬 다마고치 상호작용 가능 상태 활성화");
                            }
                        });

                        // 플레이어가 멀어졌을 때
                        tamagotchi.onCollideEnd("player", () => {
                            if (tamagotchiData.isPlayerNear) {
                                tamagotchiData.isPlayerNear = false;
                                console.log("💬 다마고치 상호작용 상태 비활성화");
                            }
                        });
                        
                        continue;
                    }

                    // 편지 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letter = map.add([
                            k.sprite("front-assets", {
                                anim: letterType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "letter",
                            { letterType },
                        ]);

                        letter.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = frontObjectDialogues[locale]?.[
                                letterType
                            ] || [
                                `This is ${letterType}`,
                                `이것은 ${letterType}입니다`,
                            ];

                            const speakerName =
                                frontObjectDialogues.names[locale]?.[letterType] ||
                                letterType;

                            gameState.setInteractableObject(letter, "letter", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                                onDialogStart: () => {
                                    // 대화 시작 후 10초 후에 처리
                                    console.log(`[DEBUG] ${letterType} 대화 시작 - 10초 후 처리 예약`);
                                    k.wait(10, () => {
                                        console.log(`[DEBUG] ${letterType} 대화 10초 경과`);
                                        
                                        // letter3 대화 시작 10초 후 퀘스트 4 추가
                                        if (letterType === "letter3") {
                                            const currentQuestItems = window.questItems || questItems;
                                            const newQuestAdded = addQuest4OnLetter3Read(currentQuestItems, globalState);
                                            
                                            if (newQuestAdded) {
                                                // 퀘스트 아이콘 업데이트
                                                const questIcon = k.get("quest-icon")[0];
                                                if (questIcon) {
                                                    questIcon.frame = 51; // 새 퀘스트가 있을 때의 프레임
                                                }
                                                
                                                // 새 퀘스트 추가 알림 표시
                                                const newQuest = currentQuestItems[currentQuestItems.length - 1];
                                                console.log("🆕 letter3 읽기 후 새 퀘스트 추가됨:", newQuest.title);
                                                
                                                console.log("📜 letter3 읽기 10초 후 - 퀘스트 4 추가됨");
                                            }
                                        }
                                    });
                                }
                            });
                        });

                        letter.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });
                        continue;
                    }

                    // gid가 있는 스프라이트 객체들 처리 (Tiled에서 직접 배치된 스프라이트)
                    if (object.gid) {
                        console.log(`🖼️ 스프라이트 객체 발견: ${object.name}, gid: ${object.gid} at (${object.x}, ${object.y})`);
                        
                        // frontAssets에서 스프라이트 프레임 가져오기
                        let spriteFrame;
                        if (object.name && object.name.startsWith("student")) {
                            // student_w1, student_w2 등 새로운 학생들은 스프라이트 생성하지 않음 (대화만 연결)
                            if (object.name.startsWith("student_w")) {
                                console.log(`👥 새로운 학생 (대화만): ${object.name} - 스프라이트 생성 건너뜀`);
                                continue; // 스프라이트 생성하지 않고 다음 객체로
                            }
                            spriteFrame = getNPCSprite(object.name);
                            console.log(`👥 학생 스프라이트: ${object.name} -> 프레임 ${spriteFrame}`);
                        } else {
                            spriteFrame = getObjectSprite(object.name) || (object.gid - 1);
                            console.log(`📦 객체 스프라이트: ${object.name} -> 프레임 ${spriteFrame}`);
                        }
                        
                        const spriteEntity = map.add([
                            k.sprite("front-assets", { frame: spriteFrame }),
                            k.area({
                                shape: new k.Rect(k.vec2(0, -10), 16, 24), // Y 오프셋으로 콜라이더 조정
                            }),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - object.height), // Tiled는 객체 하단 기준, Kaboom은 상단 기준이므로 높이만큼 빼기
                            k.z(1),
                            object.name || "sprite",
                            { 
                                objectType: object.name,
                                gid: object.gid,
                                spriteFrame: spriteFrame
                            },
                        ]);

                        // 학생인 경우 퀘스트 완료 기능 추가
                        if (object.name && object.name.startsWith("student")) {
                            const studentType = object.name;
                            
                            // 퀘스트 완료를 위한 onInteractionComplete 콜백 설정
                            if (studentType === "student1") {
                                spriteEntity.onInteractionComplete = () => {
                                    console.log(`[DEBUG] ${studentType} 대화 완료 - 퀘스트 완료 체크`);
                                    if (window.completeQuestByTarget) {
                                        console.log(`[DEBUG] ${studentType} 퀘스트 완료 호출: npc, ${studentType}`);
                                        window.completeQuestByTarget("npc", studentType);
                                    } else {
                                        console.error(`❌ ${studentType}: completeQuestByTarget 함수가 전역에 등록되지 않음`);
                                    }
                                };
                            } else if (studentType === "student3") {
                                // 박수진과 대화 시 기분 -1
                                spriteEntity.onInteractionComplete = () => {
                                    console.log(`[DEBUG] ${studentType}(박수진) 대화 완료 - 기분 감소`);
                                    globalState.changeMood(-1);
                                    console.log(`😞 박수진과의 대화로 기분이 감소했습니다. 현재 기분: ${globalState.getMood()}`);
                                    
                                    // 기분 감소 알림 표시
                                    if (window.showStatusChangeMessage) {
                                        window.showStatusChangeMessage("박수진과의 대화로 기분이 나빠졌습니다", "mood", "decrease");
                                    }
                                    
                                    // 상태바 업데이트
                                    if (window.updateStatusBars) {
                                        window.updateStatusBars();
                                    }
                                };
                            } else if (studentType === "student4") {
                                spriteEntity.onInteractionComplete = () => {
                                    console.log(`[DEBUG] ${studentType}(고혜성) 대화 완료 - 퀘스트3 완료 체크`);
                                    if (window.completeQuestByTarget) {
                                        console.log(`[DEBUG] ${studentType} 퀘스트 완료 호출: npc, ${studentType}`);
                                        window.completeQuestByTarget("npc", studentType);
                                    } else {
                                        console.error(`❌ ${studentType}: completeQuestByTarget 함수가 전역에 등록되지 않음`);
                                    }
                                };
                            }
                        }

                        console.log(`🖼️ 스프라이트 객체 생성됨: ${object.name}, 프레임: ${spriteFrame}`);
                        continue;
                    }

                    // Student NPC 처리
                    if (object.name.startsWith("student")) {
                        const studentType = object.name;
                        
                        // student_nintendo 특별 처리
                        if (studentType === "student_nintendo") {
                            console.log(`🎮 Nintendo 학생 감지됨! (spawnpoints 레이어)`);
                            
                            const spriteFrame = getNPCSprite(studentType);
                            console.log(`🎮 Nintendo 학생 스프라이트: ${studentType} -> 프레임 ${spriteFrame}`);
                            
                            const nintendoStudent = map.add([
                                k.sprite("front-assets", {
                                    frame: spriteFrame,
                                }),
                                k.area({
                                    shape: new k.Rect(k.vec2(0, -10), 16, 24),
                                }),
                                k.body({ isStatic: true }),
                                k.pos(object.x, object.y),
                                k.z(1),
                                "custom-nintendo-student", // 커스텀 태그
                                { studentType: "student_nintendo", customHandler: true },
                            ]);

                            // Nintendo 학생 상호작용 설정
                            const locale = gameState.getLocale();
                            
                            // Nintendo 학생을 전역 배열에 추가
                            const nintendoStudentData = {
                                entity: nintendoStudent,
                                isPlayerNear: false
                            };
                            nearbyNintendoStudents.push(nintendoStudentData);
                            
                            // 플레이어가 가까이 왔을 때
                            nintendoStudent.onCollideUpdate("player", () => {
                                if (!nintendoStudentData.isPlayerNear) {
                                    nintendoStudentData.isPlayerNear = true;
                                    console.log("💬 Nintendo 학생 상호작용 가능 상태 활성화");
                                }
                            });

                            // 플레이어가 멀어졌을 때
                            nintendoStudent.onCollideEnd("player", () => {
                                if (nintendoStudentData.isPlayerNear) {
                                    nintendoStudentData.isPlayerNear = false;
                                    console.log("💬 Nintendo 학생 상호작용 상태 비활성화");
                                }
                            });

                            console.log("🎮 Nintendo 학생 스프라이트 생성됨 at:", nintendoStudent.pos);
                            continue;
                        }
                        
                        // frontAssets에서 스프라이트 프레임 가져오기
                        const spriteFrame = getNPCSprite(studentType);
                        console.log(`👥 spawnpoints 학생 스프라이트: ${studentType} -> 프레임 ${spriteFrame}`);
                        
                        // 강예지 생성 특별 로그
                        if (studentType === "student13") {
                            console.log(`🔥 [CRITICAL] 강예지(student13) 스프라이트 생성 중! 프레임: ${spriteFrame}`);
                        }
                        
                        const student = map.add([
                            k.sprite("front-assets", {
                                frame: spriteFrame,
                            }),
                            k.area({
                                shape: new k.Rect(k.vec2(0, -10), 16, 24), // Y 오프셋 -8로 콜라이더를 위로 이동
                            }),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "student",
                            { studentType },
                        ]);

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
                        } else if (studentType === "student3") {
                            // 박수진과 대화 시 기분 -1
                            student.onInteractionComplete = () => {
                                console.log(`[DEBUG] ${studentType}(박수진) 대화 완료 - 기분 감소`);
                                globalState.changeMood(-1);
                                console.log(`😞 박수진과의 대화로 기분이 감소했습니다. 현재 기분: ${globalState.getMood()}`);
                                
                                // 기분 감소 알림 표시
                                if (window.showStatusChangeMessage) {
                                    window.showStatusChangeMessage("박수진과의 대화로 기분이 나빠졌습니다", "mood", "decrease");
                                }
                                
                                // 상태바 업데이트
                                if (window.updateStatusBars) {
                                    window.updateStatusBars();
                                }
                            };
                        } else if (studentType === "student4") {
                            student.onInteractionComplete = () => {
                                console.log(`[DEBUG] ${studentType}(고혜성) 대화 완료 - 퀘스트3 완료 체크`);
                                if (window.completeQuestByTarget) {
                                    console.log(`[DEBUG] ${studentType} 퀘스트 완료 호출: npc, ${studentType}`);
                                    window.completeQuestByTarget("npc", studentType);
                                } else {
                                    console.error(`❌ ${studentType}: completeQuestByTarget 함수가 전역에 등록되지 않음`);
                                }
                            };
                        } else if (studentType === "student13") {
                            // 강예지와 대화 시 기분 -2 (더 큰 감소)
                            student.onInteractionComplete = () => {
                                console.log(`🔥 [CRITICAL] ${studentType}(강예지) onInteractionComplete 실행됨!`);
                                console.log(`🔥 [CRITICAL] globalState 객체:`, globalState);
                                console.log(`🔥 [CRITICAL] 대화 전 기분: ${globalState.getMood()}`);
                                
                                globalState.changeMood(-2);
                                
                                console.log(`🔥 [CRITICAL] 대화 후 기분: ${globalState.getMood()}`);
                                console.log(`😤 강예지와의 대화로 기분이 크게 나빠졌습니다. 현재 기분: ${globalState.getMood()}`);
                                
                                // 기분 감소 알림 표시
                                console.log(`🔥 [CRITICAL] showStatusChangeMessage 함수 존재:`, !!window.showStatusChangeMessage);
                                if (window.showStatusChangeMessage) {
                                    console.log(`🔥 [CRITICAL] showStatusChangeMessage 호출 중...`);
                                    window.showStatusChangeMessage("강예지와의 대화로 기분이 크게 나빠졌습니다", "mood", "decrease");
                                } else {
                                    console.error(`❌ [CRITICAL] showStatusChangeMessage 함수가 전역에 없음`);
                                }
                                
                                // 상태바 업데이트
                                console.log(`🔥 [CRITICAL] updateStatusBars 함수 존재:`, !!window.updateStatusBars);
                                if (window.updateStatusBars) {
                                    console.log(`🔥 [CRITICAL] updateStatusBars 호출 중...`);
                                    window.updateStatusBars();
                                } else {
                                    console.error(`❌ [CRITICAL] updateStatusBars 함수가 전역에 없음`);
                                }
                                
                                // 수동으로 기분 변화 알림 (백업)
                                if (!window.showStatusChangeMessage) {
                                    alert(`강예지와의 대화로 기분이 나빠졌습니다! 현재 기분: ${globalState.getMood()}`);
                                }
                            };
                            console.log(`🔥 [CRITICAL] ${studentType}(강예지) onInteractionComplete 콜백 등록 완료`);
                        }

                        // 강예지(student13)에 대해서는 직접 상호작용 처리 추가 (globalDialogueManager 우회)
                        if (studentType === "student13") {
                            student.onCollideUpdate("player", (player) => {
                                console.log(`🔥 [DIRECT] 강예지와 직접 상호작용 설정`);
                                
                                // 직접 대화 데이터 설정
                                const kangYejiDialogue = {
                                    content: ["(...)", "(...꺼져.)"],
                                    speakerName: "강예지",
                                    speakerImage: null,
                                    onInteractionComplete: () => {
                                        console.log(`🔥 [DIRECT] 강예지 직접 onInteractionComplete 실행!`);
                                        console.log(`🔥 [DIRECT] 대화 전 기분: ${globalState.getMood()}`);
                                        
                                        globalState.changeMood(-2);
                                        
                                        console.log(`🔥 [DIRECT] 대화 후 기분: ${globalState.getMood()}`);
                                        console.log(`😤 강예지와의 대화로 기분이 크게 나빠졌습니다. 현재 기분: ${globalState.getMood()}`);
                                        
                                        // 기분 감소 알림 표시
                                        if (window.showStatusChangeMessage) {
                                            window.showStatusChangeMessage("강예지와의 대화로 기분이 크게 나빠졌습니다", "mood", "decrease");
                                        } else {
                                            alert(`강예지와의 대화로 기분이 나빠졌습니다! 현재 기분: ${globalState.getMood()}`);
                                        }
                                        
                                        // 상태바 업데이트
                                        if (window.updateStatusBars) {
                                            window.updateStatusBars();
                                        }
                                    }
                                };
                                
                                gameState.setInteractableObject(student, "npc", kangYejiDialogue);
                                console.log(`🔥 [DIRECT] 강예지 직접 상호작용 객체 설정 완료`);
                            });
                        }

                        // 기존 collision 핸들러는 제거 - 전역 시스템에서 처리
                        continue;
                    }

                    // timecapsule 처리 (spawnpoints 레이어에서)
                    if (object.name === "timecapsule") {
                        console.log("📦 타임캡슐 감지됨! (spawnpoints 레이어)");
                        
                        const timecapsule = map.add([
                            k.sprite("front-assets", {
                                frame: getObjectSprite("timecapsule"), // frontAssets에서 가져오기
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "interactive-object",
                            { objectType: "timecapsule" },
                        ]);

                        console.log("📦 타임캡슐 스프라이트 생성됨 at:", timecapsule.pos);
                        continue;
                    }
                }
            } else {
                console.log("⚠️ Spawnpoints 레이어는 있지만 오브젝트가 없음");
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            // Infinite 맵의 chunks 처리
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

                        // front.json은 rpg_spritesheet_front.png를 사용하므로 front-assets 스프라이트 사용
                        map.add([
                            k.sprite("front-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                            // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                        ]);
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

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                // front.json은 rpg_spritesheet_front.png를 사용하므로 front-assets 스프라이트 사용
                map.add([
                    k.sprite("front-assets", { frame: tile - 1 }),
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

    // 모든 레이어 처리 후 플레이어가 생성되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log("🎮 플레이어가 생성되지 않음, 기본 위치에 생성");
        entities.player = map.add(
            generateFrontPlayerComponents(k, k.vec2(0, 0))
        );
    } else {
        console.log("🎮 플레이어 생성 완료:", entities.player.pos);
        
        // 첫 번째 저장 데이터 생성 (플레이어가 front 씬에 진입했을 때)
        try {
            const playerName = gameState.playerName || "플레이어";
            const existingSaves = gameDataManager.getSaveList();
            
            // 이미 front 씬 저장 데이터가 있는지 확인
            const hasFrontSave = existingSaves.some(save => 
                save.gameState && save.gameState.currentScene === "front"
            );
            
            if (!hasFrontSave && playerName !== "플레이어") {
                // 초기 저장 데이터 생성
                const initialSaveData = gameDataManager.createSaveData(playerName);
                initialSaveData.gameState.currentScene = "front";
                initialSaveData.gameState.playerPosition = {
                    x: entities.player.pos.x,
                    y: entities.player.pos.y
                };
                initialSaveData.progressState.visitedScenes = ["prologue", "front"];
                
                // 저장
                gameDataManager.saveToBrowser(initialSaveData);
                console.log("💾 초기 저장 데이터 생성 완료:", initialSaveData.id);
            }
            
            // 추가: 테스트용 더미 데이터 생성 (플레이어 스폰포인트 기준)
            createFrontTestDummyData();
            
        } catch (error) {
            console.error("❌ 저장 데이터 생성 중 오류:", error);
        }
    }

    // 테스트용 더미 데이터 생성 함수 (front.js 스폰포인트 기준)
    function createFrontTestDummyData() {
        try {
            const existingSaves = gameDataManager.getSaveList();
            const testSaveExists = existingSaves.some(save => save.playerName === "테스트2");
            
            if (!testSaveExists && entities.player) {
                console.log("🎯 front.js 테스트용 더미 데이터 생성");
                
                const currentPos = entities.player.pos;
                const dummyData = gameDataManager.createSaveData("테스트2");
                dummyData.gameState = {
                    currentScene: "front",
                    playerPosition: {
                        x: currentPos.x,
                        y: currentPos.y
                    },
                    playerDirection: "down",
                    health: 100,
                    inventory: [],
                    questsCompleted: [],
                    questsInProgress: [],
                    flags: {},
                    tutorialCompleted: true,
                    prologueCompleted: true,
                    introCompleted: true
                };
                
                // 현재 시각으로 타임스탬프 업데이트
                dummyData.timestamp = new Date().toISOString();
                dummyData.lastPlayed = new Date().toISOString();
                
                gameDataManager.saveToBrowser(dummyData); // saveData → saveToBrowser 수정
                console.log("✅ front.js 테스트용 더미 데이터 생성 완료:", dummyData);
            }
        } catch (error) {
            console.error("❌ front.js 더미 데이터 생성 실패:", error);
        }
    }

    // [DEBUG] 플레이어 엔티티 수 확인
    const playerEntities = k.get("player");
    console.log(`[DEBUG] 현재 플레이어 엔티티 수: ${playerEntities.length}`);
    if (playerEntities.length > 1) {
        console.error(`⚠️ 플레이어가 중복 생성되었습니다! ${playerEntities.length}개 발견`);
        // 첫 번째 플레이어만 남기고 나머지 제거
        for (let i = 1; i < playerEntities.length; i++) {
            console.log(`[DEBUG] 중복 플레이어 ${i} 제거 중...`);
            playerEntities[i].destroy();
        }
    }

    // 플레이어 컨트롤을 즉시 활성화 (카메라 애니메이션과 독립적으로)
    if (entities.player && entities.player.exists()) {
        console.log("🎮 플레이어 컨트롤 즉시 활성화");
        setPlayerControls(k, entities.player);
        
        // 앉기 상태 초기화
        entities.player.isSitting = false;
        console.log("🪑 플레이어 앉기 상태 초기화");
    }

    // 플레이어 존재 확인 후 이벤트 리스너 설정
    if (entities.player && entities.player.exists()) {
        // front 씬에서는 main_entrance를 통해 first로 이동
        entities.player.onCollide("main_entrance", () => {
            gameState.setPreviousScene("front");
            k.go("first");
        });
        
        // garage로 이동하는 문 추가
        entities.player.onCollide("door_garage", () => {
            console.log("🚗 Garage 문에 충돌 - garage 씬으로 이동");
            console.log(`🔍 Garage 이동 전 상태 - 기분: ${globalState.getMood()}, 체력: ${globalState.getHealth()}`);
            k.play("boop-sfx"); // 문 열리는 효과음 (boop-sfx 사용)
            gameState.setPreviousScene("front");
            k.go("garage");
        });
    }

    // 맵 크기 계산 및 카메라 매니저 설정
    const mapBounds = {
        minX: -48 * 24, // 가장 왼쪽 chunk x * tilewidth
        minY: -48 * 24, // 가장 위쪽 chunk y * tileheight  
        maxX: (30 + 16) * 24, // 맵 너비를 고려한 최대 X
        maxY: (20 + 16) * 24, // 맵 높이를 고려한 최대 Y
    };

    console.log("🗺️ 맵 경계:", mapBounds);

    // ==============================
    // 전역 시스템 통합 매니저 초기화 (카메라 애니메이션 전에 먼저 초기화)
    // ==============================
    // frontDialogue 데이터를 globalSystemManager에 전달
    const frontDialogueData = {
        npcDialogues: frontDialogues,
        objectDialogues: frontObjectDialogues,
        npcNames: frontDialogues.names || {},
        objectNames: frontObjectDialogues.names || {}
    };
    
    console.log("🗣️ Front 대화 데이터 확인:", {
        npcDialogues: !!frontDialogues,
        objectDialogues: !!frontObjectDialogues,
        npcNames: !!frontDialogues.names,
        objectNames: !!frontObjectDialogues.names
    });
    
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "front", frontDialogueData, mapBounds);
    
    // 전역 시스템 초기화
    globalSystemManager.initialize();
    
    const globalUI = globalSystemManager.globalUI;
    
    // updateStatusBars를 전역에서 접근 가능하도록 설정
    if (globalUI && globalUI.updateStatusBars) {
        window.updateStatusBars = globalUI.updateStatusBars.bind(globalUI);
    } else {
        console.warn("⚠️ globalUI 또는 updateStatusBars가 초기화되지 않음");
    }

    // 카메라 애니메이션 중인지 플래그
    let isCameraAnimating = false;

    // 이전 씬이 tutorial일 때만 특별한 카메라 애니메이션 실행
    console.log("🔍 카메라 애니메이션 조건 확인 - actualPreviousScene:", actualPreviousScene, "=== 'tutorial':", actualPreviousScene === "tutorial");
    if (actualPreviousScene === "tutorial") {
        console.log("🎬 Tutorial에서 진입 - 카메라 수직 이동 애니메이션 시작");
        k.camScale(2); // 일반 스케일로 시작
        isCameraAnimating = true; // 카메라 애니메이션 시작

        // 플레이어 위치에서 시작
        if (entities.player && entities.player.exists()) {
            const playerPos = entities.player.pos;
            k.camPos(playerPos);
            
            // 카메라 애니메이션 중에는 플레이어 컨트롤 일시적으로 비활성화
            gameState.setFreezePlayer(true);
            
            // 맵 상단 위치 계산 (500픽셀 위로)
            const mapTopY = playerPos.y - 600; // 플레이어 위치에서 600픽셀 위로
            const topPosition = k.vec2(playerPos.x, mapTopY);
            
            console.log("📹 카메라가 위로 이동합니다:", playerPos, "→", topPosition);
            
            // 전역 카메라 시스템을 사용한 애니메이션
            if (globalSystemManager.globalCamera) {
                globalSystemManager.globalCamera.setCameraAnimating(true);
                
                // 1단계: 위로 천천히 올라가기 (5초로 증가)
                globalSystemManager.globalCamera.animateTo(topPosition, 5.0, "easeInOutQuad").then(() => {
                    console.log("📹 카메라가 위에 도달, 2초 대기 후 다시 내려갑니다");
                    
                    // 2단계: 2초 대기 후 플레이어 위치로 다시 내려오기 (4초로 증가)
                    k.wait(2, () => {
                        // 카메라가 내려오는 동시에 대화창 표시 (6초 지연)
                        k.wait(6, () => {
                            console.log("🎮 카메라 내려오는 중 - 플레이어 대화 시작");
                            
                            // 플레이어 이름 우선순위: 입력받은 이름 → 로그 저장된 이름 → 기본값 "플레이어"
                            let playerName = gameState.playerName;
                            if (!playerName || playerName.trim() === "") {
                                console.log("🔍 플레이어 이름이 없어 자동 로드 시도");
                                playerName = "플레이어"; // 최종 기본값
                            }
                            console.log("🎭 플레이어 대화 화자:", playerName);
                            
                            // 플레이어 대화 내용 (prologue에서 이어지는 내용)
                            const playerDialogue = [
                                "세계로 뻗어나가는 은하인...?",
                                "꿈인 건가? 내가 왜 학교에 와 있는 거지..? 내가 학생이라니...",
                                "이게 현실이라면 큰일이야. 빨리 돌아가야 해.",
                                "일단 정보를 얻자. 어디부터 둘러봐야 할까? ",
                                "우측 상단에 있는 편지 아이콘을 클릭해 보자!",
                            ];
                            
                            // 포커스 문제 방지: 대화 시작 전 캔버스 포커스 확인
                            const canvas = document.querySelector('canvas');
                            if (canvas) {
                                canvas.focus();
                            }
                            
                            // 대화창 표시 (NPC 대화창과 동일한 스타일)
                            globalSystemManager.globalDialogue.showDialogue({
                                content: playerDialogue,
                                speakerName: playerName, // 플레이어 이름을 화자로 표시
                                speakerImage: null, // 플레이어 이미지는 없음
                                preventBCancel: true, // B키/B버튼으로 취소 방지
                            }, () => {
                                // 대화 완료 후 - 카메라 애니메이션은 계속 진행
                                console.log("🎮 플레이어 대화 완료 - 카메라 애니메이션 계속 진행");
                                
                                // 포커스 문제 해결: 캔버스에 포커스 재설정
                                setTimeout(() => {
                                    const canvas = document.querySelector('canvas');
                                    if (canvas) {
                                        canvas.focus();
                                        console.log("🔧 캔버스 포커스 재설정 완료");
                                    }
                                }, 100);
                            });
                        });
                        
                        // 전역 카메라 시스템을 사용한 애니메이션
                        if (globalSystemManager.globalCamera) {
                            globalSystemManager.globalCamera.animateTo(playerPos, 4.0, "easeInOutQuad").then(() => {
                                console.log("🎮 카메라 애니메이션 완료");
                                isCameraAnimating = false; // 카메라 애니메이션 완전히 완료
                                globalSystemManager.globalCamera.setCameraAnimating(false);
                                gameState.setFreezePlayer(false); // 플레이어 컨트롤 재활성화
                                
                                // 카메라 추적 시스템 재활성화 확인
                                console.log("🎥 카메라 추적 시스템 최종 재활성화:", {
                                    isCameraAnimating: isCameraAnimating,
                                    playerExists: entities.player && entities.player.exists(),
                                    playerPos: entities.player ? entities.player.pos : "없음"
                                });
                            });
                        } else {
                            // 백업 - 기존 방식 사용
                            k.tween(k.camPos(), playerPos, 4.0, (val) => {
                                k.camPos(val);
                            }, k.easings.easeInOutQuad).then(() => {
                                console.log("🎮 카메라 애니메이션 완료 (백업 방식)");
                                isCameraAnimating = false;
                                gameState.setFreezePlayer(false);
                                
                                if (entities.player && entities.player.exists()) {
                                    k.camPos(entities.player.pos);
                                    console.log("🎯 카메라 위치 강제 설정:", entities.player.pos);
                                }
                            });
                        }
                    });
                });
            } else {
                // 백업 - 기존 방식 사용
                k.tween(k.camPos(), topPosition, 5.0, (val) => {
                    k.camPos(val);
                }, k.easings.easeInOutQuad).then(() => {
                    console.log("📹 카메라가 위에 도달, 2초 대기 후 다시 내려갑니다 (백업 방식)");
                    
                    k.wait(2, () => {
                        k.wait(6, () => {
                            console.log("🎮 카메라 내려오는 중 - 플레이어 대화 시작 (백업 방식)");
                            
                            let playerName = gameState.playerName;
                            if (!playerName || playerName.trim() === "") {
                                playerName = "플레이어";
                            }
                            
                            const playerDialogue = [
                                "세계로 뻗어나가는 은하인...?",
                                "꿈인 건가? 내가 왜 학교에 와 있는 거지..? 내가 학생이라니...",
                                "이게 현실이라면 큰일이야. 빨리 돌아가야 해.",
                                "일단 정보를 얻자. 어디부터 둘러봐야 할까?",
                                "우측 상단에 있는 편지 아이콘을 클릭해 보자!",
                            ];
                            
                            globalSystemManager.globalDialogue.showDialogue({
                                content: playerDialogue,
                                speakerName: playerName,
                                speakerImage: null,
                                preventBCancel: true, // B키/B버튼으로 취소 방지
                            }, () => {
                                console.log("🎮 플레이어 대화 완료 (백업 방식)");
                            });
                        });
                        
                        k.tween(k.camPos(), playerPos, 4.0, (val) => {
                            k.camPos(val);
                        }, k.easings.easeInOutQuad).then(() => {
                            console.log("🎮 카메라 애니메이션 완료 (백업 방식)");
                            isCameraAnimating = false;
                            gameState.setFreezePlayer(false);
                            
                            if (entities.player && entities.player.exists()) {
                                k.camPos(entities.player.pos);
                                console.log("🎯 카메라 위치 강제 설정:", entities.player.pos);
                            }
                        });
                    });
                });
            }
        }
    } else {
        console.log("🎬 다른 씬에서 진입 - 일반 카메라 스케일 적용");
        // 다른 씬에서 올 때는 바로 일반 스케일(2배) 적용
        k.camScale(2);
        
        // 플레이어 위치로 카메라 이동
        if (entities.player && entities.player.exists()) {
            k.camPos(entities.player.pos);
        }
    }

    // 카메라 애니메이션 상태를 전역 카메라 매니저에 전달
    if (globalSystemManager.globalCamera) {
        globalSystemManager.globalCamera.setCameraAnimating(isCameraAnimating);
    }

    // UI 바는 이미 다른 곳에서 구현됨 (statusBarContainer 참조)

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
        if (window.questUIManager) {
            if (window.questUIManager.isQuestPopupOpen) {
                window.questUIManager.closeQuestPopup();
            } else {
                window.questUIManager.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 매니저가 아직 초기화되지 않음");
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
        if (window.questUIManager) {
            if (window.questUIManager.isQuestPopupOpen) {
                window.questUIManager.closeQuestPopup();
            } else {
                window.questUIManager.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 매니저가 아직 초기화되지 않음");
        }
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);

    // 상호작용 키 (스페이스, 엔터) 감지로 퀘스트 완료 체크
    k.onKeyPress("space", () => {
        const interactableData = gameState.getInteractableData();
        if (interactableData && interactableData.onDialogStart) {
            interactableData.onDialogStart();
        }
    });
    
    k.onKeyPress("enter", () => {
        const interactableData = gameState.getInteractableData();
        if (interactableData && interactableData.onDialogStart) {
            interactableData.onDialogStart();
        }
    });

    // 테스트용: 상태바 값 조절 단축키
    k.onKeyPress("1", () => {
        globalState.changeMood(-1); // 기분 감소
        console.log(`기분: ${globalState.getMood()}`);
        if (window.updateStatusBars) window.updateStatusBars(); // 즉시 UI 업데이트
    });
    
    k.onKeyPress("2", () => {
        globalState.changeMood(1); // 기분 증가
        console.log(`기분: ${globalState.getMood()}`);
        if (window.updateStatusBars) window.updateStatusBars(); // 즉시 UI 업데이트
    });
    
    k.onKeyPress("3", () => {
        globalState.changeHealth(-1); // 체력 감소
        console.log(`체력: ${globalState.getHealth()}`);
        if (window.updateStatusBars) window.updateStatusBars(); // 즉시 UI 업데이트
    });
    
    k.onKeyPress("4", () => {
        globalState.changeHealth(1); // 체력 증가
        console.log(`체력: ${globalState.getHealth()}`);
        if (window.updateStatusBars) window.updateStatusBars(); // 즉시 UI 업데이트
    });

    // B 키로 앉기 동작
    k.onKeyPress("b", () => {
        if (entities.player && entities.player.exists()) {
            console.log("🪑 B키 - 앉기/일어서기 토글");
            
            // 현재 앉은 상태인지 확인
            if (entities.player.isSitting) {
                // 일어서기
                console.log("👤 플레이어 일어섬");
                entities.player.isSitting = false;
                entities.player.isAttacking = false; // 이동 제한 해제
                
                // 방향에 따라 적절한 idle 애니메이션
                if (entities.player.direction === "left") {
                    entities.player.play("player-idle-left");
                } else if (entities.player.direction === "right") {
                    entities.player.play("player-idle-right");
                } else if (entities.player.direction === "up") {
                    entities.player.play("player-idle-up");
                } else {
                    entities.player.play("player-idle-down");
                }
            } else {
                // 앉기 - 기존 performSit 함수 활용
                console.log("🪑 플레이어 앉음");
                
                entities.player.isAttacking = true; // 앉는 동안 이동 제한
                entities.player.isSitting = true;

                // 앉기 애니메이션 실행
                if (entities.player.direction === "left") {
                    entities.player.play("player-sit-left");
                } else if (entities.player.direction === "right") {
                    entities.player.play("player-sit-right");
                } else if (entities.player.direction === "up") {
                    entities.player.play("player-sit-up");
                } else {
                    entities.player.play("player-sit-down");
                }

                entities.player.stop(); // 움직임 정지
            }
        }
    });

    // 인벤토리 시스템 로드 (전역 상태에서)
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
        console.log("⚠️ 인벤토리 시스템이 아직 초기화되지 않음 - 나중에 로드됨");
    }
    
    // 기존 오브젝트들의 collision 핸들러를 globalDialogue로 교체
    console.log("🔄 오브젝트 collision 핸들러를 globalDialogue로 교체 중...");
    
    let objectCount = 0;
    let interactiveObjectCount = 0;
    let studentCount = 0;
    
    // "object" 태그를 가진 모든 엔티티에 대해 globalDialogue 적용
    k.get("object", { recursive: true }).forEach((obj) => {
        if (obj.objectType) {
            objectCount++;
            globalSystemManager.globalDialogue.setupPlayerCollision(obj, obj.objectType, {});
        }
    });
    
    // "interactive-object" 태그를 가진 모든 엔티티에 대해서도 적용
    k.get("interactive-object", { recursive: true }).forEach((obj) => {
        if (obj.objectType) {
            interactiveObjectCount++;
            globalSystemManager.globalDialogue.setupPlayerCollision(obj, obj.objectType, {});
        }
    });
    
    // "student" 태그를 가진 모든 엔티티에 대해서도 적용 (studentType 속성 사용)
    k.get("student", { recursive: true }).forEach((student) => {
        if (student.studentType) {
            studentCount++;
            globalSystemManager.globalDialogue.setupPlayerCollision(student, student.studentType, {});
        }
    });
    
    console.log(`✅ Collision 핸들러 교체 완료 - Objects: ${objectCount}, Interactive: ${interactiveObjectCount}, Students: ${studentCount}`);
    
    // 기존 코드 호환성을 위한 더미 변수들
    const questState = { isPopupOpen: false, hasNewQuests: true };
    const settingsState = { isPopupOpen: false };
    const questIcon = globalUI.questIcon;
    const settingsIcon = globalUI.settingsIcon;
    let questPopup = null;
    let settingsPopup = null;
    
    // 기존 함수들을 전역 UI로 위임
    function updateQuestIcon() {
        if (globalUI && globalUI.updateQuestIcon) {
            globalUI.updateQuestIcon();
        }
    }
    
    function openQuestPopup() {
        if (globalUI && globalUI.openQuestPopup) {
            globalUI.openQuestPopup();
        }
    }
    
    function closeQuestPopup() {
        if (globalUI && globalUI.closeQuestPopup) {
            globalUI.closeQuestPopup();
        }
    }
    
    function openSettingsPopup() {
        if (globalUI && globalUI.openSettingsPopup) {
            globalUI.openSettingsPopup();
        }
    }
    
    function closeSettingsPopup() {
        if (globalUI && globalUI.closeSettingsPopup) {
            globalUI.closeSettingsPopup();
        }
    }
    
    // 전역 함수로 노출
    window.updateQuestIcon = updateQuestIcon;

    // 퀘스트 아이콘 클릭 이벤트는 이제 전역 UI에서 처리됩니다
    // questIcon.onClick(() => { ... });

    // 퀘스트 아이콘 호버 효과는 이제 전역 UI에서 처리됩니다
    // questIcon.onHover(() => { ... });
    
    // 설정 아이콘은 이제 전역 UI에서 생성됩니다
    // const settingsIcon = k.add([...]);
    
    // 설정 상태는 이미 위에서 정의됨
    // const settingsState = { isPopupOpen: false };
    // let settingsPopup = null;
    let settingsCloseButtonElements = []; // X버튼 요소들을 저장할 배열
    
    // 설정 아이콘 클릭 이벤트는 이제 전역 UI에서 처리됩니다
    // settingsIcon.onClick(() => { ... });

    // 설정 아이콘 호버 효과는 이제 전역 UI에서 처리됩니다
    // settingsIcon.onHover(() => { ... });

    // 퀘스트 팝업 열기 (기존 함수 - 이제 전역 UI 사용)
    function openQuestPopup_OLD() {
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
            closeQuestPopup_OLD();
        });

        // 퀘스트 항목들을 체크박스 형태로 렌더링
        const questItemElements = [];
        const currentQuestItems = window.questItems || questItems;
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
                console.log(`[DEBUG] 퀘스트 ${index} 완료 상태 토글`);
                const currentQuestItems = window.questItems || questItems;
                currentQuestItems[index].completed = !currentQuestItems[index].completed;
                try {
                    k.play("confirm-beep-sfx", { volume: 0.4 });
                } catch (error) {
                    console.warn("사운드 재생 실패:", error);
                }
                
                // 체크박스 색상 즉시 업데이트
                element.checkbox.color = currentQuestItems[index].completed ? 
                    k.rgb(126, 155, 204) : k.rgb(200, 200, 200);
                    
                // 퀘스트 아이콘 상태 업데이트
                updateQuestIcon();
            });
        });
        
        // 퀘스트 아이콘 상태 업데이트 (퀘스트 유무에 따라)
        updateQuestIcon();
    }

    // 퀘스트 팝업 닫기 (기존 함수 - 이제 전역 UI 사용)
    function closeQuestPopup_OLD() {
        if (!questState.isPopupOpen) return;

        console.log("[DEBUG] 퀘스트 팝업 닫기 시작");
        questState.isPopupOpen = false;

        // 퀘스트 팝업 관련 모든 요소 제거
        try {
            // 태그별로 모든 요소 제거
            k.destroyAll("quest-popup");
            k.destroyAll("quest-popup-element");
            k.destroyAll("quest-checkbox-clickable");
            k.destroyAll("quest-title-clickable");
            k.destroyAll("quest-checkmark");
            k.destroyAll("quest-strikethrough");
            
            console.log("[DEBUG] 퀘스트 팝업 요소 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 퀘스트 팝업 정리 중 오류:", error);
        }
        
        // 변수들 null로 설정
        questPopup = null;
        questPopupContent = null;
    }

    // 설정 팝업 열기 함수 (기존 함수 - 이제 전역 UI 사용)
    function openSettingsPopup_OLD() {
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

        // X 버튼 생성 - 수동으로 그룹화하여 확실한 삭제 보장
        settingsCloseButtonElements = []; // 초기화
        
        const closeButtonBg = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.color(75, 0, 130),
            k.z(171),
            k.fixed(),
            "settings-popup-element",
        ]);
        settingsCloseButtonElements.push(closeButtonBg);

        const closeButtonText = k.add([
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
        settingsCloseButtonElements.push(closeButtonText);

        const closeButtonArea = k.add([
            k.rect(28, 28),
            k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            k.area(),
            k.opacity(0),
            k.z(173),
            k.fixed(),
            "settings-popup-element",
        ]);
        settingsCloseButtonElements.push(closeButtonArea);

        // X 버튼 이벤트 핸들러
        closeButtonArea.onHover(() => {
            closeButtonBg.color = k.rgb(95, 20, 150);
        });

        closeButtonArea.onHoverEnd(() => {
            closeButtonBg.color = k.rgb(75, 0, 130);
        });

        closeButtonArea.onClick(() => {
            console.log("[DEBUG] 설정 X 버튼 클릭됨");
            if (!gameState.getIsMuted()) {
                k.play("boop-sfx", { volume: 0.4 });
            }
            closeSettingsPopup_OLD();
        });

        // 설정 항목들
        const settingY = panel.contentArea.y + 20;
        const itemSpacing = 50; // 간격을 줄여 더 많은 항목 배치

        // 음소거 설정
        const muteLabel = k.add([
            k.text("음소거", {
                size: 20, // 18에서 20으로 증가
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
                size: 20, // 18에서 20으로 증가
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
                size: 20, // 18에서 20으로 증가
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

        // 메인화면으로 나가기 버튼 (우측 하단에 배치)
        const mainMenuButton = k.add([
            k.rect(120, 35),
            k.pos(panel.contentArea.x + panel.contentArea.width - 250, panel.contentArea.y + panel.contentArea.height - 60), // 우측 하단에 배치 (20px 패딩)
            k.color(255, 180, 180),
            k.outline(2, k.rgb(220, 120, 120)),
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const mainMenuText = k.add([
            k.text("메인화면으로", {
                size: 16, // 크기 조정
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 190, panel.contentArea.y + panel.contentArea.height - 42), // 버튼 중앙에 배치
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
            closeSettingsPopup_OLD();
            k.go("title");
        });

        mainMenuButton.onHover(() => {
            mainMenuButton.color = k.rgb(255, 200, 200);
        });

        mainMenuButton.onHoverEnd(() => {
            mainMenuButton.color = k.rgb(255, 180, 180);
        });

        // 크레딧 버튼 (우측 하단에 배치)
        const creditButton = k.add([
            k.rect(120, 35),
            k.pos(panel.contentArea.x + panel.contentArea.width - 120, panel.contentArea.y + panel.contentArea.height - 60), // 메인메뉴 버튼 옆에 배치
            k.color(180, 255, 180),
            k.outline(2, k.rgb(120, 220, 120)),
            k.area(),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        const creditText = k.add([
            k.text("크레딧", {
                size: 16, // 크기 조정
                font: "galmuri",
            }),
            k.pos(panel.contentArea.x + panel.contentArea.width - 60, panel.contentArea.y + panel.contentArea.height - 42), // 버튼 중앙에 배치
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
            gameState.setPreviousScene("front"); // 이전 씬을 front로 설정
            closeSettingsPopup_OLD();
            k.go("credits");
        });

        creditButton.onHover(() => {
            creditButton.color = k.rgb(200, 255, 200);
        });

        creditButton.onHoverEnd(() => {
            creditButton.color = k.rgb(180, 255, 180);
        });
    }

    // 설정 팝업 닫기 함수 (기존 함수 - 이제 전역 UI 사용)
    function closeSettingsPopup_OLD() {
        if (!settingsState.isPopupOpen) return;

        console.log("[DEBUG] 설정 팝업 닫기 시작");
        settingsState.isPopupOpen = false;

        try {
            // X버튼 요소들 먼저 명시적으로 제거
            settingsCloseButtonElements.forEach(element => {
                if (element && element.exists && element.exists()) {
                    element.destroy();
                }
            });
            settingsCloseButtonElements = [];
            
            // 모든 설정 팝업 요소 제거
            k.destroyAll("settings-popup");
            k.destroyAll("settings-popup-element");
            
            settingsPopup = null;
            
            console.log("[DEBUG] 설정 팝업 요소 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 설정 팝업 정리 중 오류:", error);
        }
    }

    // 아이콘 위치 업데이트는 이제 전역 UI에서 처리됩니다
    // k.onResize(() => { ... }); // 제거됨

    // ESC 키로 팝업 닫기
    k.onKeyPress("escape", () => {
        if (settingsState.isPopupOpen) {
            closeSettingsPopup_OLD();
        }
        // questUIManager의 팝업도 닫기
        if (questUIManager.isQuestPopupOpen) {
            questUIManager.closeQuestPopup();
        }
    });
    
    // ==============================
    // 실시간 자동 저장 시스템 시작
    // ==============================
    autoSaveManager.startPeriodicAutoSave(entities, "front");

    // 전역 함수로 노출 (새로운 매니저들 사용)
    // window.performAutoSave는 globalSystemManager에서 이미 등록되므로 중복 제거
    // window.showQuestCompletionMessage는 globalSystemManager에서 이미 등록되므로 중복 제거
    // showQuestAddedMessage는 questUIManager에 없으므로 제거
    
    // 씬 종료 시 마지막 저장
    k.onSceneLeave(() => {
        console.log("🧹 Front 씬 정리 시작");
        
        // 마지막 자동 저장 수행
        console.log("💾 씬 종료 전 마지막 저장 수행");
        autoSaveManager.saveNow(entities, "front");
        
        // 전역 UI 정리
        if (globalUI && globalUI.cleanup) {
            globalUI.cleanup();
        }
        
        // window.previousKeyHandler가 있다면 제거
        if (window.previousKeyHandler) {
            document.removeEventListener('keydown', window.previousKeyHandler, true);
            document.removeEventListener('keyup', window.previousKeyHandler, true);
            window.previousKeyHandler = null;
            console.log("✅ Front 씬 키보드 이벤트 리스너 정리 완료");
        }
        
        console.log("✅ Front 씬 정리 완료");
    });
    
    } catch (error) {
        console.error("❌ Front 씬 로드 중 오류:", error);
        // 오류 발생 시 기본 설정으로 진행
        if (!map) {
            map = k.add([k.pos(0, 0)]);
        }
        // 플레이어는 이미 위에서 생성되었으므로 중복 생성 제거
        k.camScale(2); // 원래 스케일로 복구
        if (entities.player && entities.player.worldPos) {
            k.camPos(entities.player.worldPos());
        }
    }

    // ==============================
    // 상태바 UI 시스템은 이미 globalSystemManager에서 관리되고 있습니다
    // ==============================
    console.log("🎮 상태바 UI는 globalSystemManager에서 관리됩니다");
    
    // updateStatusBars는 이미 window에 설정되어 있습니다 (1952라인에서)
    
    // 2초마다 상태바 업데이트 (자동저장과 동일한 주기)
    k.loop(2, () => {
        if (window.updateStatusBars) {
            window.updateStatusBars();
        }
    });

    console.log("✅ UI 바 시스템 초기화 완료");

    // 퀘스트 완료 처리 함수들
    function completeQuestByTarget(targetType, targetId) {
        console.log(`[DEBUG] completeQuestByTarget 호출됨 - 타입: ${targetType}, 대상: ${targetId}`);
        
        const currentQuestItems = window.questItems || questItems;
        console.log(`[DEBUG] 현재 퀘스트 목록:`, currentQuestItems);
        
        // questData.js의 completeQuest 함수 사용 (전역 상태 포함)
        const result = completeQuest(currentQuestItems, targetType, targetId, globalState);
        
        if (result.questCompleted) {
            const completedQuest = currentQuestItems[result.completedQuestIndex];
            console.log(`🎯 퀘스트 완료 감지: ${completedQuest.title}`);
            
            // 전역 상태에 퀘스트 완료 상태 업데이트
            const questId = completedQuest.targetNpc || completedQuest.targetObject || completedQuest.title;
            globalState.updateGlobalQuestProgress(questId, { completed: true });
            
            // 알림 시스템 상태 확인
            console.log(`[DEBUG] 알림 시스템 상태 확인:`, {
                notificationManager: !!window.notificationManager,
                showQuestCompletionMessage: !!window.showQuestCompletionMessage,
                globalSystemManagerExists: typeof window.globalSystemManager !== 'undefined'
            });
            
            // 전역 함수로 퀘스트 완료 메시지 표시
            if (window.showQuestCompletionMessage) {
                console.log(`📢 퀘스트 완료 알림창 표시 시도: ${completedQuest.title}`);
                window.showQuestCompletionMessage(completedQuest.title);
            } else if (window.notificationManager) {
                // 직접 notificationManager 사용
                console.log(`📢 직접 notificationManager 사용하여 알림 표시: ${completedQuest.title}`);
                window.notificationManager.addNotification({
                    type: 'quest-completion',
                    message: `퀘스트 완료: ${completedQuest.title}`,
                    questTitle: completedQuest.title
                });
            } else {
                console.error(`❌ 알림 시스템을 사용할 수 없음 - 함수와 매니저 모두 없음`);
            }
            
            if (result.newQuestAdded) {
                console.log("🆕 새 퀘스트가 추가되었습니다!");
                // 새 퀘스트 추가 알림 표시
                const newQuest = currentQuestItems[currentQuestItems.length - 1]; // 가장 최근에 추가된 퀘스트
                console.log("🆕 새 퀘스트 추가됨:", newQuest.title);
                
                // 새 퀘스트를 전역 상태에도 추가
                const newQuestWithId = { ...newQuest, id: newQuest.targetNpc || newQuest.targetObject || newQuest.title };
                globalState.addToGlobalQuests(newQuestWithId);
                
                // 퀘스트 추가 알림 표시
                if (window.notificationManager) {
                    console.log(`📢 새 퀘스트 추가 알림 표시: ${newQuest.title}`);
                    window.notificationManager.addNotification({
                        type: 'quest-added',
                        message: `새 퀘스트 추가: ${newQuest.title}`,
                        questTitle: newQuest.title
                    });
                } else {
                    console.error(`❌ 새 퀘스트 알림 실패 - notificationManager 없음`);
                }
            }
            
            // 퀘스트 아이콘 상태 업데이트 (전역 함수 사용)
            if (window.updateQuestIcon) {
                window.updateQuestIcon();
            }
            
            // 자동 저장 (전역 함수 사용) - 전역 상태도 포함하여 저장
            if (window.performAutoSave) {
                // 전역 상태를 포함하여 저장
                const currentPlayerName = globalState.getPlayerName();
                if (currentPlayerName && currentPlayerName !== "undefined") {
                    gameDataManager.updateCurrentSave(gameState, { questItems: currentQuestItems }, null, "front", globalState);
                }
                window.performAutoSave();
            }
            
            console.log(`✅ 퀘스트 완료: ${completedQuest.title} (${targetType}: ${targetId})`);
        }
    }

    // 글로벌 이벤트 핸들러
    window.completeQuestByTarget = completeQuestByTarget;
    window.showStatusChangeMessage = showStatusChangeMessage;
    // window.showQuestCompletionMessage는 globalSystemManager에서 이미 등록되므로 중복 제거
    
    // 다마고치/NCA/Nintendo 학생 전역 스페이스 키 이벤트 등록 (한번만)
    let isInteracting = false;
    
    // 공통 상호작용 함수
    const handleCustomInteraction = async () => {
        // 근처에 있는 다마고치 찾기
        const nearbyTamagotchi = nearbyTamagotchis.find(t => t.isPlayerNear);
        // 근처에 있는 NCA 찾기
        const nearbyNCA = nearbyNCAs.find(n => n.isPlayerNear);
        // 근처에 있는 Nintendo 학생 찾기
        const nearbyNintendoStudent = nearbyNintendoStudents.find(s => s.isPlayerNear);
        
        if ((nearbyTamagotchi || nearbyNCA || nearbyNintendoStudent) && !isInteracting) {
            isInteracting = true;
            
            if (nearbyTamagotchi) {
                // 다마고치 상호작용
                isTamagotchiInteracting = true;
                window.isTamagotchiInteracting = true;
                console.log("🎮 다마고치 상호작용 시작");
                
                try {
                    const locale = gameState.getLocale();
                    const choice = await choiceDialog(
                        k,
                        k.vec2(k.center().x - 400, k.height() - 220),
                        [
                            "다마고치이다",
                            "은하여고 얼짱만들기 게임을 플레이하시겠습니까?"
                        ],
                        ["아니오", "예"],
                        { 
                            font: locale === "korean" ? "galmuri" : "gameboy",
                            preventBCancel: true // B키/B버튼으로 취소 방지
                        }
                    );
                    
                    if (choice === 1 || choice === "1" || choice === "예") {
                        k.play("confirm-beep-sfx");
                        console.log("🌐 네이버 페이지를 새창으로 열기 시도...");
                        window.open("https://www.naver.com", "_blank");
                    } else {
                        k.play("boop-sfx");
                    }
                } catch (error) {
                    console.error("❌ 다마고치 상호작용 중 오류:", error);
                } finally {
                    isTamagotchiInteracting = false;
                    window.isTamagotchiInteracting = false;
                    isInteracting = false;
                }
            } else if (nearbyNCA) {
                // NCA 상호작용
                isNCAInteracting = true;
                window.isNCAInteracting = true;
                console.log("🎮 NCA 상호작용 시작");
                
                try {
                    const locale = gameState.getLocale();
                    // NCA 설명 대화 (URL 로직 주석처리됨)
                    await new Promise((resolve) => {
                        globalSystemManager.globalDialogue.showDialogue({
                            content: [
                                "(...NCA? 뉴콘텐츠아카데미?)",
                                "(그거 설마 신기술 콘텐츠 분야를 선도하는 융합인재를 양성하는 곳이야?)",
                                "(...)",
                                "(...멋진데...?!?)"
                            ],
                            speakerName: null,
                            speakerImage: null,
                        }, resolve);
                    });
                    
                    k.play("confirm-beep-sfx");
                    
                    // 퀘스트 완료 체크
                    if (window.completeQuestByTarget) {
                        console.log(`[DEBUG] NCA 전단지 퀘스트 완료 호출: object, nca`);
                        window.completeQuestByTarget("object", "nca");
                    }
                    
                    /* 기존 URL 로직 주석처리
                    const choice = await choiceDialog(
                        k,
                        k.vec2(k.center().x - 400, k.height() - 220),
                        [
                            "(...NCA? 뉴콘텐츠아카데미?)",
                            "(그거 설마 신기술 콘텐츠 분야를 선도하는 융합인재를 양성하는 곳이야?)",
                            "(...)",
                            "(...멋진데...?!?)",
                            "홈페이지를 방문해볼래?"
                        ],
                        ["아니", "응"],
                        { 
                            font: locale === "korean" ? "galmuri" : "gameboy",
                            preventBCancel: true // B키/B버튼으로 취소 방지
                        }
                    );
                    
                    if (choice === 1 || choice === "1" || choice === "응") {
                        k.play("confirm-beep-sfx");
                        console.log("🌐 NCA 홈페이지를 새창으로 열기 시도...");
                        window.open("https://www.ncakocca.kr/", "_blank");
                        
                        // 퀘스트 완료 체크
                        if (window.completeQuestByTarget) {
                            console.log(`[DEBUG] NCA 전단지 퀘스트 완료 호출: object, nca`);
                            window.completeQuestByTarget("object", "nca");
                        }
                    } else {
                        k.play("boop-sfx");
                    }
                    */
                } catch (error) {
                    console.error("❌ NCA 상호작용 중 오류:", error);
                } finally {
                    isNCAInteracting = false;
                    window.isNCAInteracting = false;
                    isInteracting = false;
                }
            } else if (nearbyNintendoStudent) {
                // Nintendo 학생 상호작용
                isNintendoStudentInteracting = true;
                window.isNintendoStudentInteracting = true;
                console.log("🎮 Nintendo 학생 상호작용 시작");
                
                try {
                    const locale = gameState.getLocale();
                    // 아이패드 게임 대화로 변경 (URL 로직 주석처리됨)
                    await new Promise((resolve) => {
                        globalSystemManager.globalDialogue.showDialogue({
                            content: [
                                "...깜짝이야!!",
                                "오... 못보던 얼굴이네.",
                                "너도 게임 좋아해? 이거 새로나온 은하여고 게임인데...",
                                "뒤에 비치된 아이패드로 플레이해볼 수 있나봐.",
                                "너도 해볼래? 빙고판도 채울겸!!!!"
                            ],
                            speakerName: "게임하는 친구",
                            speakerImage: null,
                        }, resolve);
                    });
                    
                    k.play("confirm-beep-sfx");
                    
                    /* 기존 URL 로직 주석처리
                    const choice = await choiceDialog(
                        k,
                        k.vec2(k.center().x - 400, k.height() - 220),
                        [
                            "(친구가 새로 나온 닌텐도 DS를 플레이하고 있다)",
                            "(나도 해보고 싶다...)",
                            "...깜짝이야!!",
                            "오... 못보던 얼굴이네.",
                            "너도 게임 좋아해? 이거 새로나온 게임인데...",
                            "제목은 <은하여고 얼짱만들기>야!", 
                            "애들 취향에 맞는 옷을 입혀서 은하여고에 등교시켜주는 게임임!",
                            "함 해보실?",
                        ],
                        ["아니", "웅"],
                        { 
                            font: locale === "korean" ? "galmuri" : "gameboy",
                            speakerName: "게임하는 친구",
                            preventBCancel: true // B키/B버튼으로 취소 방지
                        }
                    );
                    
                    if (choice === 1 || choice === "1" || choice === "웅") {
                        k.play("confirm-beep-sfx");
                        console.log("🌐 은하여고 얼짱만들기 게임을 새창으로 열기 시도...");
                        window.open("https://play.unity.com/en/games/6f79875e-337c-4cbd-b0b6-f7ce3269166b/firstbuild", "_blank");
                    } else {
                        k.play("boop-sfx");
                    }
                    */
                } catch (error) {
                    console.error("❌ Nintendo 학생 상호작용 중 오류:", error);
                } finally {
                    isNintendoStudentInteracting = false;
                    window.isNintendoStudentInteracting = false;
                    isInteracting = false;
                }
            }
            
            // 이벤트 전파 막기
            return true; // 상호작용이 발생했음을 알림
        }
        
        return false; // 상호작용이 발생하지 않았음을 알림
    };
    
    // 스페이스 키 핸들러 등록
    const spaceHandler = k.onKeyPress("space", async () => {
        await handleCustomInteraction();
    });
    
    // 게임패드 A버튼 핸들러 등록
    const gamepadAHandler = k.onGamepadButtonPress("east", async () => {
        await handleCustomInteraction();
    });
}
