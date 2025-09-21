import { gameState, playerState } from "../state/stateManagers.js";
import { areAnyOfTheseKeysDown, playAnimIfNotPlaying, audioManager } from "../utils.js"; // 수정된 부분: audioManager 추가
// 추가된 부분: globalState import
import globalStateManager from "../state/globalState.js";
const globalState = globalStateManager().getInstance();
// 추가된 부분: 상호작용을 위한 dialog import
import { dialog } from "../uiComponents/dialog.js";

/*
 * 타일맵 씬 이동속도 설정:
 * - 기본 속도: 100 (키보드 화살표 키)
 * - 조이스틱: 95 (기본 100의 0.95배)
  * - 키보드: 100 (기본 속도)
 * - 게임패드 아날로그 스틱: 100 (기본 속도)
 * - 게임패드 D패드: 135 (기본 100의 1.35배)
 */

// 수정된 부분: idle 애니메이션 주석처리
// function playIdleAnimationIfTimeout(player) {
//     if (!player || !player.exists()) return;
//     if (gameState.getFreezePlayer()) return;
//
//     const currentTime = Date.now();
//     const IDLE_TIMEOUT = 10000; // 10초
//
//     if (currentTime - player.lastMoveTime >= IDLE_TIMEOUT) {
//         if (player.direction === "left" || player.direction === "right") {
//             playAnimIfNotPlaying(player, "player-idle-side");
//         } else {
//             playAnimIfNotPlaying(player, `player-idle-${player.direction}`);
//         }
//     }
// }

// 추가된 부분: 상호작용 처리 함수
async function handleInteraction(k, player) {
    console.log(`🎮 DEBUG: handleInteraction 호출됨`);
    
    // 다마고치, NCA, Nintendo 학생, door_mae 상호작용 중이면 무시
    if (window.isTamagotchiInteracting || window.isNCAInteracting || window.isNintendoStudentInteracting || window.isDoorMaeInteracting) {
        console.log(`🎮 DEBUG: 커스텀 상호작용 중이므로 플레이어 상호작용 무시`);
        return;
    }
    
    // 전역 시스템 매니저가 있으면 전역 상호작용을 먼저 시도
    if (window.globalSystemManager && window.globalSystemManager.handleInteraction) {
        console.log(`🎮 DEBUG: 전역 시스템 매니저로 상호작용 위임`);
        const interactionHandled = window.globalSystemManager.handleInteraction();
        
        if (interactionHandled) {
            console.log(`🎮 DEBUG: 전역 상호작용 처리됨 - 앉기 실행 안함`);
            return; // 상호작용이 있었으면 앉기 실행하지 않음
        }
    }
    
    const interactableObject = gameState.getInteractableObject();
    const interactableType = gameState.getInteractableType();
    const interactableData = gameState.getInteractableData();

    console.log(`🎮 DEBUG: 상호작용 상태 확인:`);
    console.log(`🎮 DEBUG: - interactableObject:`, interactableObject);
    console.log(`🎮 DEBUG: - interactableType:`, interactableType);
    console.log(`🎮 DEBUG: - interactableData:`, interactableData);

    if (!interactableObject || !interactableType || !interactableData) {
        console.log(`🎮 DEBUG: 상호작용 가능한 객체가 없음`);
        
        // front.js나 first.js의 특별한 상호작용 중인지 확인
        if (window.isNCAInteracting || window.isNintendoStudentInteracting || window.isTamagotchiInteracting || window.isDoorMaeInteracting) {
            console.log(`🎮 DEBUG: 특별 상호작용 중이므로 앉기 실행 안함`);
            return; // 앉기 실행하지 않음
        }
        
        // first.js의 door_mae 상호작용 시도
        if (k.getSceneName && k.getSceneName() === "first") {
            console.log(`🎮 DEBUG: first.js에서 door_mae 상호작용 확인`);
            const player = k.get("player")[0];
            if (player) {
                const doorMaeObjects = k.get("door_mae");
                console.log(`🎮 DEBUG: door_mae 객체들:`, doorMaeObjects);
                
                if (doorMaeObjects.length > 0) {
                    const nearbyDoorMae = player.isColliding(doorMaeObjects[0]);
                    console.log(`🎮 DEBUG: door_mae와 충돌 여부:`, nearbyDoorMae);
                    
                    if (nearbyDoorMae) {
                        console.log(`🎮 DEBUG: door_mae 상호작용 호출!`);
                        // first.js의 handleCustomInteraction 호출
                        if (window.firstSceneHandleCustomInteraction) {
                            await window.firstSceneHandleCustomInteraction();
                            return;
                        }
                    }
                }
            }
        }
        
        console.log(`🎮 DEBUG: 앉기 실행`);
        // 상호작용 가능한 객체가 없으면 앉기 실행
        performSit(k, player);
        return;
    }

    console.log(`🎮 DEBUG: 상호작용 시작!`);

    // 대화 시작 전에 플레이어를 즉시 idle 상태로 변경
    if (player && player.exists()) {
        // 플레이어 움직임 즉시 정지
        if (player.body) {
            player.body.vel = k.vec2(0, 0);
        }

        // 방향에 따라 적절한 idle 애니메이션으로 변경
        if (player.direction === "left") {
            player.play("player-idle-left");
        } else if (player.direction === "right") {
            player.play("player-idle-right");
        } else if (player.direction === "up") {
            player.play("player-idle-up");
        } else {
            player.play("player-idle-down");
        }
    }

    // 대화 시작 전 콜백 실행 (gee-sfx 등 특별한 효과음 재생용)
    if (interactableData.onDialogStart) {
        console.log("🎵 onDialogStart 콜백 실행");
        interactableData.onDialogStart();
    }

    // 상호작용 가능한 객체가 있으면 대화 시작
    // 수정된 부분: cat과 대화할 때는 BGM ducking 후 cat-sfx 재생하고 0.7초 후에 다이얼로그 시작
    if (interactableObject.npcType === "cat") {
        // BGM ducking 후 고양이 효과음 재생
        try {
            console.log(`🔇 cat BGM ducking 시작...`);
            await audioManager.duckBGM(0.2, 300);
            console.log(`🔇 cat BGM ducking 완료`);
            
            // 고양이 효과음 재생
            k.play("cat-sfx", { volume: 1.5 });
            console.log(`🔊 cat 대화 효과음 재생 완료 (ducking 적용, 볼륨: 150%)`);
            
            // 1초 후에 다이얼로그 시작 (고양이 효과음이 충분히 재생된 후)
            await new Promise((resolve) => {
                k.wait(1.0, resolve);
            });
            
            // 효과음 재생 완료 후 BGM 복구
            setTimeout(async () => {
                console.log(`🔊 cat BGM 복구 시작...`);
                await audioManager.unduckBGM(500);
                console.log(`🔊 cat BGM 복구 완료`);
            }, 1500); // 1.5초 후 복구
            
        } catch (error) {
            console.warn(`⚠️ cat 대화 효과음/ducking 실패:`, error);
            audioManager.unduckBGM(300);
            // 실패해도 대화는 시작
            k.play("cat-sfx");
            await new Promise((resolve) => {
                k.wait(1.0, resolve);
            });
        }
    } else {
        // 다른 NPC들은 단순 재생 (dialog에서 덕킹이 적용될 예정)
        k.play("bubble-sfx");
    }

    const locale = gameState.getLocale();
    const font = locale === "korean" ? "galmuri" : "gameboy";

    // 커스텀 대화 핸들러가 있는지 확인
    if (interactableData.customDialogHandler) {
        const handled = interactableData.customDialogHandler(interactableData);
        if (handled) {
            console.log("🎯 커스텀 대화 핸들러로 처리 완료");
            return; // 커스텀 핸들러가 처리했으므로 기본 처리 건너뜀
        }
    }

    const dialogResult = await dialog(k, k.vec2(250, 500), interactableData.content, {
        font,
        speakerName: interactableData.speakerName,
        speakerImage: interactableData.speakerImage || null,
    });

    // choice 결과가 있으면 response를 표시
    if (dialogResult && dialogResult.response) {
        await dialog(k, k.vec2(250, 500), [dialogResult.response], {
            font,
            speakerName: interactableData.speakerName,
            speakerImage: interactableData.speakerImage || null,
        });
    }

    // 수정된 부분: 상호작용 완료 후 콜백 실행
    if (interactableData.onInteractionComplete) {
        interactableData.onInteractionComplete();
    }
}

// 수정된 부분: idle 애니메이션 사용 안 함으로 주석처리
// function updateLastMoveTime(player) {
//     if (player && player.exists()) {
//         player.lastMoveTime = Date.now();
//     }
// }

// 수정된 부분: 플레이어의 실제 스프라이트를 확인하는 함수 추가
// function isPlayerUsingTallSprite(player) {
//     // 디버깅: 플레이어 스프라이트 정보 출력
//     console.log("[DEBUG] 플레이어 스프라이트 확인:", {
//         hasSprite: !!player.sprite,
//         hasTex: !!player.sprite?.tex,
//         texName: player.sprite?.tex?.name,
//         spriteId: player.sprite?.id,
//         spriteName: player.sprite?.name
//     });
//
//     // 여러 방법으로 확인해보기
//     const method1 = player && player.sprite && player.sprite.tex && player.sprite.tex.name === "player-tall";
//     const method2 = player && player.sprite && player.sprite.id === "player-tall";
//     const method3 = player && player.sprite && String(player.sprite).includes("player-tall");
//
//     console.log("[DEBUG] 스프라이트 확인 결과:", { method1, method2, method3 });
//
//     // 일단 method1을 사용하되, 다른 방법들도 시도
//     return method1 || method2 || method3;
// }

export function generatePlayerComponents(k, pos) {
    return [
        k.sprite("front-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 8) }),
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

// front.js용 플레이어 컴포넌트 (24x24 타일 시스템용)
export function generateFrontPlayerComponents(k, pos) {
    return [
        k.sprite("front-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 8) }),
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        k.stay(), // 플레이어가 씬 전환 시 사라지지 않도록 보호
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

// first.js용 플레이어 컴포넌트 (24x24 타일 시스템용 - first-assets 사용)
export function generateFirstPlayerComponents(k, pos) {
    return [
        k.sprite("first-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 8) }),
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

export function generateGaragePlayerComponents(k, pos) {
    return [
        k.sprite("garage-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 8) }),
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

export function generateHealthPlayerComponents(k, pos) {
    return [
        k.sprite("health-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 14), 10, 8) }),
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

export function generateClass2PlayerComponents(k, pos) {
    return [
        k.sprite("front-assets", {
            anim: "player-idle-down",
        }),
        k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 8) }), // Y축을 14에서 24로 변경 (10픽셀 아래로)
        k.body(),
        k.pos(pos),
        k.z(2), // upmost(z=3)보다 뒤에, 기본 타일(z=0)보다는 앞에 표시
        k.opacity(),
        {
            speed: 100, // 타일맵 기본 속도: 100
            attackPower: 1,
            direction: "down",
            isAttacking: false,
            isFrozen: false,
            isSitting: false,
        },
        "player",
    ];
}

export function watchPlayerHealth(k) {
    k.onUpdate(() => {
        if (playerState.getHealth() <= 0) {
            playerState.setHealth(playerState.getMaxHealth());
            k.go("schoolfront");
        }
    });
}

export function setPlayerControls(k, player) {
    console.log("🎮 setPlayerControls 호출됨 - 키보드 이벤트 초기화");
    
    // 기존 키보드 이벤트 리스너 정리 (충돌 방지)
    if (window.previousKeyHandler) {
        document.removeEventListener('keydown', window.previousKeyHandler, true);
        document.removeEventListener('keyup', window.previousKeyHandler, true);
        window.previousKeyHandler = null;
        console.log("✅ 이전 키보드 핸들러 제거 완료");
    }
    
    // 게임패드 컨트롤
    const onUpdateListener = k.onUpdate(() => {
        // 아날로그 스틱 입력 처리
        if (gameState.getFreezePlayer()) return;
        if (!player || !player.exists) return;

        const nativeGamepads = navigator.getGamepads();
        let isMovingWithGamepad = false; // 수정된 부분: 게임패드로 움직이는지 추적

        // Kaboom.js 게임패드 API를 사용한 방향키 체크 (추가 지원)
        let kaboomDpadMoveX = 0;
        let kaboomDpadMoveY = 0;
        
        // 다양한 게임패드 방향키 이름 지원 (tutorial.js와 동일)
        if (k.isGamepadButtonDown("left") || k.isGamepadButtonDown("dpad-left") || k.isGamepadButtonDown("14")) {
            kaboomDpadMoveX = -1;
        }
        if (k.isGamepadButtonDown("right") || k.isGamepadButtonDown("dpad-right") || k.isGamepadButtonDown("15")) {
            kaboomDpadMoveX = 1;
        }
        if (k.isGamepadButtonDown("up") || k.isGamepadButtonDown("dpad-up") || k.isGamepadButtonDown("12")) {
            kaboomDpadMoveY = -1;
        }
        if (k.isGamepadButtonDown("down") || k.isGamepadButtonDown("dpad-down") || k.isGamepadButtonDown("13")) {
            kaboomDpadMoveY = 1;
        }
        
        // A버튼을 눌렀는지 확인 (상호작용 버튼)
        const isAButtonPressed = k.isGamepadButtonDown("east") || k.isGamepadButtonDown("1");
        
        // Kaboom.js API로 감지된 방향키 입력이 있으면 처리
        if ((Math.abs(kaboomDpadMoveX) > 0 || Math.abs(kaboomDpadMoveY) > 0) && !isAButtonPressed) {
            isMovingWithGamepad = true;

            // D패드로 이동할 때 앉기 상태 해제
            if (player.isSitting) {
                player.isSitting = false;
                player.isAttacking = false;
            }

            const deltaSpeed = player.speed * k.dt() * 60 * 1.35; // 60fps 기준으로 정규화, 게임패드 D패드 속도: 135 (기본 100의 1.35배)
            player.move(kaboomDpadMoveX * deltaSpeed, kaboomDpadMoveY * deltaSpeed);

            // 방향 설정 및 애니메이션
            if (Math.abs(kaboomDpadMoveX) > Math.abs(kaboomDpadMoveY)) {
                if (kaboomDpadMoveX < 0) {
                    const animName = globalState.getIsPlayerTall()
                        ? "player-tall-left"
                        : "player-left";
                    playAnimIfNotPlaying(player, animName);
                    player.direction = "left";
                } else {
                    const animName = globalState.getIsPlayerTall()
                        ? "player-tall-right"
                        : "player-right";
                    playAnimIfNotPlaying(player, animName);
                    player.direction = "right";
                }
            } else {
                if (kaboomDpadMoveY < 0) {
                    const animName = globalState.getIsPlayerTall()
                        ? "player-tall-up"
                        : "player-up";
                    playAnimIfNotPlaying(player, animName);
                    player.direction = "up";
                } else {
                    const animName = globalState.getIsPlayerTall()
                        ? "player-tall-down"
                        : "player-down";
                    playAnimIfNotPlaying(player, animName);
                    player.direction = "down";
                }
            }
        }

        // 네이티브 게임패드 API 체크 (기존 로직 유지)
        for (let i = 0; i < nativeGamepads.length; i++) {
            if (nativeGamepads[i] && nativeGamepads[i].connected) {
                const gamepad = nativeGamepads[i];

                // D패드 입력 처리 (수정된 부분: onUpdate 내에서 지속적으로 체크)
                let dpadMoveX = 0;
                let dpadMoveY = 0;

                if (gamepad.buttons[14] && gamepad.buttons[14].pressed) {
                    // dpad-left
                    dpadMoveX = -1;
                }
                if (gamepad.buttons[15] && gamepad.buttons[15].pressed) {
                    // dpad-right
                    dpadMoveX = 1;
                }
                if (gamepad.buttons[12] && gamepad.buttons[12].pressed) {
                    // dpad-up
                    dpadMoveY = -1;
                }
                if (gamepad.buttons[13] && gamepad.buttons[13].pressed) {
                    // dpad-down
                    dpadMoveY = 1;
                }

                // A버튼을 누르고 있을 때는 이동 안함
                const isAButtonPressed =
                    gamepad.buttons[1] && gamepad.buttons[1].pressed; // 수정된 부분: A버튼은 east(1)

                // 수정된 부분: D패드 이동 처리 - 속도를 키보드와 같게 만들기 위해 dt() 사용
                if (
                    (Math.abs(dpadMoveX) > 0 || Math.abs(dpadMoveY) > 0) &&
                    !isAButtonPressed &&
                    !isMovingWithGamepad // Kaboom API로 이미 처리했으면 스킵
                ) {
                    isMovingWithGamepad = true;

                    // D패드로 이동할 때 앉기 상태 해제
                    if (player.isSitting) {
                        player.isSitting = false;
                        player.isAttacking = false;
                    }

                    // 수정된 부분: idle 애니메이션 사용 안 함으로 주석처리
                    // updateLastMoveTime(player);

                    // 수정된 부분: D패드(십자버튼) 속도 135%로 설정
                    const deltaSpeed = player.speed * k.dt() * 60 * 1.35; // 60fps 기준으로 정규화, 게임패드 D패드 속도: 135 (기본 100의 1.35배)
                    player.move(dpadMoveX * deltaSpeed, dpadMoveY * deltaSpeed);

                    // 방향 설정 및 애니메이션 (수정된 부분: tall 모드 상태에 따라 적절한 애니메이션 사용)
                    if (Math.abs(dpadMoveX) > Math.abs(dpadMoveY)) {
                        if (dpadMoveX < 0) {
                            const animName = globalState.getIsPlayerTall()
                                ? "player-tall-left"
                                : "player-left";
                            playAnimIfNotPlaying(player, animName);
                            player.direction = "left";
                        } else {
                            const animName = globalState.getIsPlayerTall()
                                ? "player-tall-right"
                                : "player-right";
                            playAnimIfNotPlaying(player, animName);
                            player.direction = "right";
                        }
                    } else {
                        if (dpadMoveY < 0) {
                            const animName = globalState.getIsPlayerTall()
                                ? "player-tall-up"
                                : "player-up";
                            playAnimIfNotPlaying(player, animName);
                            player.direction = "up";
                        } else {
                            const animName = globalState.getIsPlayerTall()
                                ? "player-tall-down"
                                : "player-down";
                            playAnimIfNotPlaying(player, animName);
                            player.direction = "down";
                        }
                    }
                }

                // 왼쪽 아날로그 스틱 (axes[0] = X축, axes[1] = Y축)
                const leftStickX = gamepad.axes[0] || 0;
                const leftStickY = gamepad.axes[1] || 0;

                const deadzone = 0.2; // 데드존 설정

                let moveX = 0;
                let moveY = 0;

                // 데드존 체크
                if (Math.abs(leftStickX) > deadzone) {
                    moveX = leftStickX;
                }
                if (Math.abs(leftStickY) > deadzone) {
                    moveY = leftStickY; // 수정된 부분: Y축 방향 수정
                }

                // 아날로그 스틱 이동 처리 (D패드와 동시에 사용 가능)
                if (Math.abs(moveX) > deadzone || Math.abs(moveY) > deadzone) {
                    isMovingWithGamepad = true;

                    // 스틱으로 이동할 때 앉기 상태 해제
                    if (player.isSitting) {
                        player.isSitting = false;
                        player.isAttacking = false;
                    }

                    // 수정된 부분: idle 애니메이션 사용 안 함으로 주석처리
                    // updateLastMoveTime(player);

                    // 속도 계산 (스틱 기울기에 따라 속도 조절)
                    const speedMultiplier = Math.min(
                        Math.sqrt(moveX * moveX + moveY * moveY),
                        1
                    );
                    const moveSpeed = player.speed * speedMultiplier * 0.95; // 조이스틱 속도: 95 (기본 100의 0.95배)

                    player.move(moveX * moveSpeed, moveY * moveSpeed);

                    // 방향 설정 및 애니메이션 (가장 큰 움직임 방향 우선)
                    if (Math.abs(moveX) > Math.abs(moveY)) {
                        if (moveX < 0) {
                            playAnimIfNotPlaying(player, "player-left");
                            player.direction = "left";
                        } else {
                            playAnimIfNotPlaying(player, "player-right");
                            player.direction = "right";
                        }
                    } else {
                        if (moveY < 0) {
                            playAnimIfNotPlaying(player, "player-up");
                            player.direction = "up";
                        } else {
                            playAnimIfNotPlaying(player, "player-down");
                            player.direction = "down";
                        }
                    }
                }

                // 수정된 부분: D패드를 떼었을 때 애니메이션 정지
                if (!isMovingWithGamepad && !player.isSitting) {
                    // D패드나 아날로그 스틱을 사용하지 않을 때 애니메이션 정지
                    if (
                        !areAnyOfTheseKeysDown(k, [
                            "left",
                            "right",
                            "up",
                            "down",
                        ])
                    ) {
                        player.stop();
                    }
                }

                break; // 첫 번째 연결된 게임패드만 사용
            }
        }
    });

    // 키보드 컨트롤
    k.onKeyDown((key) => {
        if (gameState.getFreezePlayer()) return;
        if (!player || !player.exists()) return;

        // 수정된 부분: 스페이스바는 상호작용용이므로 이동 처리 안함
        if (key === "space") return;

        // 이동 키를 누르면 앉기 상태 해제
        if (["left", "right", "up", "down"].includes(key) && player.isSitting) {
            player.isSitting = false;
            player.isAttacking = false;
        }

        // 수정된 부분: idle 애니메이션 사용 안 함으로 주석처리
        // if (["left", "right", "up", "down"].includes(key)) {
        //     updateLastMoveTime(player);
        // }

        if (["left"].includes(key)) {
            if (areAnyOfTheseKeysDown(k, ["up", "down"])) return;
            playAnimIfNotPlaying(player, "player-left");
            player.move(-player.speed, 0); // 타일맵 기본 속도: 100
            player.direction = "left";
            return;
        }

        if (["right"].includes(key)) {
            if (areAnyOfTheseKeysDown(k, ["up", "down"])) return;
            playAnimIfNotPlaying(player, "player-right");
            player.move(player.speed, 0); // 타일맵 기본 속도: 100
            player.direction = "right";
            return;
        }

        if (["up"].includes(key)) {
            playAnimIfNotPlaying(player, "player-up");
            player.move(0, -player.speed); // 타일맵 기본 속도: 100
            player.direction = "up";
            return;
        }

        if (["down"].includes(key)) {
            playAnimIfNotPlaying(player, "player-down");
            player.move(0, player.speed); // 타일맵 기본 속도: 100
            player.direction = "down";
            return;
        }
    });

    // 수정된 부분: 상호작용 처리 (키보드)
    k.onKeyPress(async (key) => {
        if (!["space"].includes(key)) return;
        if (gameState.getFreezePlayer()) return;
        if (!player || !player.exists()) return;
        await handleInteraction(k, player);
    });

    // 수정된 부분: A버튼(east)으로 상호작용 처리
    k.onGamepadButtonPress("east", async () => {
        if (gameState.getFreezePlayer()) return;
        if (!player || !player.exists()) return;
        await handleInteraction(k, player);
    });

    k.onGamepadButtonPress("south", () => {
        // B버튼 - 현재 기능 없음
    });

    // 수정된 부분: X버튼으로 앉기/일어나기 토글
    k.onGamepadButtonPress("north", () => {
        // X버튼 - 앉기/일어나기 토글
        if (gameState.getFreezePlayer()) return;
        if (!player || !player.exists()) return;

        if (player.isSitting) {
            // 현재 앉아있으면 일어나기
            player.isSitting = false;
            player.isAttacking = false;
            // 수정된 부분: idle 애니메이션 사용 안 함으로 주석처리
            // updateLastMoveTime(player);
        } else {
            // 현재 서있으면 앉기
            performSit(k, player);
        }
    });

    // 수정된 부분: idle 애니메이션 완전히 비활성화
    k.onKeyRelease(() => {
        if (!player || !player.exists()) return;
        if (gameState.getFreezePlayer()) return;
        player.isAttacking = false;
        if (!player.isSitting) {
            player.stop();
            // idle 애니메이션 재생 제거 - 기본 애니메이션 유지
        }
    });
}

// 앉기 로직을 별도 함수로 분리 (기존 공격을 앉기로 변경)
function performSit(k, player) {
    player.isAttacking = true; // 앉는 동안 이동 제한을 위해 유지
    player.isSitting = true; // 추가된 부분 - 앉기 상태 설정

    // 앉기 애니메이션 실행
    if (player.direction === "left") {
        playAnimIfNotPlaying(player, "player-sit-left");
    } else if (player.direction === "right") {
        playAnimIfNotPlaying(player, "player-sit-right");
    } else if (player.direction === "up") {
        playAnimIfNotPlaying(player, "player-sit-up");
    } else {
        playAnimIfNotPlaying(player, "player-sit-down");
    }

    player.stop(); // 움직임 정지

    // 수정된 부분: 자동으로 일어나는 타이머 제거
    // 이제 다른 키를 누를 때까지 앉기 상태가 유지됩니다
}
