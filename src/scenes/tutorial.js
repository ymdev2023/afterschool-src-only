import { gameState } from "../state/stateManagers.js";
import { colorizeBackground, audioManager, playSfxWithDucking, fadeInBGM, playSfx } from "../utils.js";
import { createTutorialDialog } from "./tutorialDialog.js";

export function tutorial(k) {
  console.log("🎓 Tutorial 씬 시작");
  
  // 기존 이벤트 리스너 모두 정리 (다른 씬에서 남아있을 수 있는 것들)
  console.log("🧹 기존 이벤트 리스너 정리 중...");
  
  // 모든 keydown 이벤트를 정리하는 방법
  document.removeEventListener('keydown', window.previousKeyHandler);
  
  colorizeBackground(k, 0, 0, 0);
  audioManager.stopBGM();
  
  // 튜토리얼 시작 효과음 먼저 재생 (7초 길이)
  console.log("🎵 튜토리얼 시작 효과음 재생");
  k.play("tutorial-sfx", { volume: 0.7 });
  
  // 효과음 재생 후 7.5초 뒤에 BGM 페이드인 시작 (1초간 페이드인)
  k.wait(7.5, () => {
    console.log("🎵 BGM 페이드인 시작 (1초간)");
    // ✅ 비타일맵 씬(tutorial)에서는 fadeInBGM 사용 가능 (페이드 효과 필요)
    fadeInBGM(k, "tutorial-bgm", 0.5, 0.005); // 1초 페이드인: 0.5/1000ms = 0.005
  });

  k.setGravity(0);

  // 문서 배경도 검은색으로 설정
  document.body.style.backgroundColor = 'black';
  
  // JavaScript로 페이드 인 효과
  const fadeInOverlay = document.createElement('div');
  fadeInOverlay.style.position = 'fixed';
  fadeInOverlay.style.top = '0';
  fadeInOverlay.style.left = '0';
  fadeInOverlay.style.width = '100vw';
  fadeInOverlay.style.height = '100vh';
  fadeInOverlay.style.backgroundColor = 'black';
  fadeInOverlay.style.opacity = '1';
  fadeInOverlay.style.zIndex = '10000';
  fadeInOverlay.style.pointerEvents = 'none';
  fadeInOverlay.style.transition = 'opacity 2s ease-out';
  document.body.appendChild(fadeInOverlay);
  
  console.log("🌅 Tutorial 페이드 인 시작");
  
  // 페이드 인 시작
  setTimeout(() => {
    fadeInOverlay.style.opacity = '0';
    console.log("🌅 Tutorial 페이드 진행: 시작");
  }, 50);
  
  // 페이드 인 완료 후 오버레이 제거
  setTimeout(() => {
    console.log("✨ Tutorial Fade In 완료");
    if (fadeInOverlay && fadeInOverlay.parentNode) {
      document.body.removeChild(fadeInOverlay);
    }
  }, 2100);

  // 패턴 배경 추가
  const patterns = [];
  const patternSize = 1280;
  
  console.log("화면 크기:", k.width(), "x", k.height());
  
  const screenWidth = k.width();
  const screenHeight = k.height();
  const extraPadding = patternSize;
  
  console.log("실제 렌더링 영역:", screenWidth, "x", screenHeight);
  
  // 원본 크기로 패턴 배치
  for (let x = -extraPadding; x <= screenWidth + extraPadding; x += patternSize) {
    for (let y = -extraPadding; y <= screenHeight + extraPadding; y += patternSize) {
      const pattern = k.add([
        k.sprite("pattern_lightgreen"),
        k.pos(x, y),
        k.z(0), // z-index를 더 낮게 설정 (1 → 0)
        k.fixed(),
      ]);
      patterns.push(pattern);
    }
  }
  
  console.log("패턴 생성 완료, 총 패턴 수:", patterns.length);

  // 패턴 애니메이션 (좌하향으로 흐름) - 자연스러운 래핑
  const patternSpeed = 30;
  k.onUpdate(() => {
    patterns.forEach(pattern => {
      pattern.pos.x -= patternSpeed * k.dt(); // 왼쪽으로 이동
      pattern.pos.y += patternSpeed * k.dt(); // 아래로 이동
      
      // 자연스러운 래핑 - 패턴이 화면 밖으로 나가면 반대편에서 다시 등장
      if (pattern.pos.x <= -patternSize) {
        pattern.pos.x += patternSize * Math.ceil((screenWidth + extraPadding * 2) / patternSize);
      }
      if (pattern.pos.y >= screenHeight + patternSize) {
        pattern.pos.y -= patternSize * Math.ceil((screenHeight + extraPadding * 2) / patternSize);
      }
    });
  });

  // 상단 가운데에 TUTORIAL 텍스트
  const titleText = k.add([
    k.text("TUTORIAL", { 
      size: 38,
      font: "gameboy"
    }),
    k.anchor("center"),
    k.pos(k.center().x, 120),
    k.color(105, 215, 23),
    k.z(10),
    k.fixed(),
  ]);

  // 가운데 텍스트 - 첫 번째 줄 (fade in/out 효과)
  const centerText1 = k.add([
    k.text("본 격 적 인  게 임 에  앞 서", { 
      size: 20,
      font: "galmuri"
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y - 20),
    k.color(111, 111, 111),
    k.opacity(0),
    k.z(10),
    k.fixed(),
  ]);

  // 가운데 텍스트 - 두 번째 줄 (fade in/out 효과)
  const centerText2 = k.add([
    k.text("튜 토 리 얼 을  시 작 하 겠 습 니 다 .", { 
      size: 26,
      font: "galmuri"
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 20),
    k.color(111, 111, 111),
    k.opacity(0),
    k.z(10),
    k.fixed(),
  ]);

  // 플레이어 캐릭터 변수
  let player = null;
  let npc = null;
  let isNearNPC = false;
  let exclamationMark = null;
  let tutorialText = null;

  // 상태 관리 변수
  let tutorialStep = 0;
  let hasPlayerMoved = false;
  
  // 이동 방향 추적 변수
  let movementTracking = {
    left: false,
    right: false,
    up: false,
    down: false,
    startTime: null,
    indicators: {},
    directionTimes: {
      left: 0,
      right: 0,
      up: 0,
      down: 0
    },
    requiredTime: 500
  };

  // 1단계: 초기 텍스트 fade in/out
  k.wait(2.5, () => {
    console.log("🎓 튜토리얼 초기 텍스트 fade in 시작");
    
    // bubble-sfx 재생
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    // 두 줄 텍스트 함께 Fade in
    k.tween(centerText1.opacity, 1, 1, (val) => {
      centerText1.opacity = val;
    });
    k.tween(centerText2.opacity, 1, 1, (val) => {
      centerText2.opacity = val;
    }).then(() => {
      console.log("🎓 초기 텍스트 표시 완료, 1초 대기");
      
      k.wait(1, () => {
        // 두 줄 텍스트 함께 Fade out
        k.tween(centerText1.opacity, 0, 1, (val) => {
          centerText1.opacity = val;
        });
        k.tween(centerText2.opacity, 0, 1, (val) => {
          centerText2.opacity = val;
        }).then(() => {
          console.log("🎓 초기 텍스트 fade out 완료, 캐릭터 튜토리얼 시작");
          startCharacterTutorial();
        });
      });
    });
  });

  function startCharacterTutorial() {
    tutorialStep = 1;
    
    // 게임패드 상태 초기 확인
    console.log("🎮 게임패드 초기 상태 확인:");
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        console.log(`🎮 게임패드 ${i}: ${gamepads[i].id}`);
        console.log(`🎮 버튼 개수: ${gamepads[i].buttons.length}, 축 개수: ${gamepads[i].axes.length}`);
      }
    }
    
    // 가운데 텍스트 숨기기
    centerText1.opacity = 0;
    centerText2.opacity = 0;
    
    // 플레이어 캐릭터 생성 (화면 정가운데)
    player = k.add([
      k.sprite("front-assets", { anim: "player-idle-down" }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y),
      k.scale(0.1),
      k.area({ width: 30, height: 86 }),
      k.body(),
      k.opacity(0),
      k.z(20),
      "player"
    ]);
    
    // 튜토리얼 텍스트 생성
    tutorialText = k.add([
      k.text("화살표 키 또는 게임패드 방향키를 눌러 상하좌우로 움직여보세요.", { 
        size: 20,
        font: "galmuri",
        width: k.width() - 100,
        align: "center"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 120),
      k.color(50, 200, 50),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    // 방향 인디케이터 생성
    createMovementIndicators();
    
    console.log("🎓 플레이어 캐릭터 생성 완료:", player.pos);
    
    // 플레이어 ease-in 효과
    k.tween(player.scale, k.vec2(3.6, 3.6), 1.2, (val) => {
      player.scale = val;
    }, k.easings.easeOutBack);
    
    k.tween(player.opacity, 1, 1.2, (val) => {
      player.opacity = val;
    });
    
    // bubble-sfx 재생 (플레이어 등장)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    // 텍스트는 플레이어가 등장한 후에 표시
    k.wait(0.8, () => {
      // bubble-sfx 재생 (텍스트 등장)
      playSfx(k, "bubble-sfx", { volume: 0.7 });
      
      k.tween(tutorialText.opacity, 1, 0.8, (val) => {
        tutorialText.opacity = val;
      });
      
      k.wait(0.2, () => {
        showMovementIndicators();
      });
    });
    
    console.log("🎓 캐릭터 이동 튜토리얼 시작");
  }

  // 방향 인디케이터 생성 함수
  function createMovementIndicators() {
    const baseY = k.height() - 160;
    const centerX = k.center().x;
    const spacing = 60;
    
    const directions = [
      { key: 'left', pos: { x: centerX - spacing * 1.5, y: baseY }, symbol: '←' },
      { key: 'right', pos: { x: centerX - spacing * 0.5, y: baseY }, symbol: '→' },
      { key: 'up', pos: { x: centerX + spacing * 0.5, y: baseY }, symbol: '↑' },
      { key: 'down', pos: { x: centerX + spacing * 1.5, y: baseY }, symbol: '↓' }
    ];
    
    directions.forEach(dir => {
      const bgCircle = k.add([
        k.circle(16),
        k.pos(dir.pos.x, dir.pos.y),
        k.anchor("center"),
        k.color(60, 60, 60),
        k.opacity(0),
        k.z(15),
        k.fixed(),
        "movementIndicator"
      ]);
      
      const completeCircle = k.add([
        k.circle(16),
        k.pos(dir.pos.x, dir.pos.y),
        k.anchor("center"),
        k.color(50, 200, 50),
        k.opacity(0),
        k.z(16),
        k.fixed(),
        "movementIndicator"
      ]);
      
      const dirText = k.add([
        k.text(dir.symbol, {
          size: 20,
          font: "galmuri"
        }),
        k.pos(dir.pos.x, dir.pos.y),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.opacity(0),
        k.z(17),
        k.fixed(),
        "movementIndicator"
      ]);
      
      movementTracking.indicators[dir.key] = {
        background: bgCircle,
        complete: completeCircle,
        text: dirText,
        completed: false
      };
    });
  }
  
  // 인디케이터 표시 함수
  function showMovementIndicators() {
    Object.values(movementTracking.indicators).forEach(indicator => {
      k.tween(indicator.background.opacity, 0.7, 0.5, (val) => {
        indicator.background.opacity = val;
      });
      k.tween(indicator.text.opacity, 1, 0.5, (val) => {
        indicator.text.opacity = val;
      });
    });
  }
  
  // 방향 완료 표시 함수
  function markDirectionComplete(direction) {
    if (movementTracking.indicators[direction] && !movementTracking.indicators[direction].completed) {
      movementTracking.indicators[direction].completed = true;
      movementTracking[direction] = true;
      
      const indicator = movementTracking.indicators[direction];
      
      k.tween(indicator.complete.opacity, 0.9, 0.5, (val) => {
        indicator.complete.opacity = val;
      });
      
      k.tween(indicator.text.color.r, 0, 0.5, (val) => {
        indicator.text.color.r = val;
        indicator.text.color.g = val;
        indicator.text.color.b = val;
      });
      
      console.log(`✅ 방향 완료: ${direction} (0.5초 이상 유지)`);
      
      checkMovementCompletion();
    }
  }
  
  // 각 방향별 누른 시간 업데이트
  function updateDirectionTime(direction, deltaTime) {
    if (!movementTracking.indicators[direction].completed) {
      movementTracking.directionTimes[direction] += deltaTime;
      
      if (movementTracking.directionTimes[direction] >= movementTracking.requiredTime) {
        markDirectionComplete(direction);
      }
    }
  }
  
  // 이동 완료 확인 함수
  function checkMovementCompletion() {
    const allDirectionsComplete = movementTracking.left && 
                                movementTracking.right && 
                                movementTracking.up && 
                                movementTracking.down;
    
    if (allDirectionsComplete) {
      console.log("🎉 모든 방향 이동 완료! 다음 단계로 진행");
      
      k.destroyAll("movementIndicator");
      
      k.wait(0.3, () => {
        showWellDoneMessage();
      });
    }
  }

  // "잘했습니다!" 메시지 표시
  function showWellDoneMessage() {
    tutorialStep = 2;
    
    k.destroyAll("movementIndicator");
    
    // 플레이어 애니메이션 완전히 정지 및 상태 초기화
    if (player) {
      // 즉시 모든 이동 정지
      player.vel = k.vec2(0, 0);
      
      // 애니메이션을 idle-down으로 강제 설정
      player.play("player-idle-down");
      currentAnimDirection = "down";
      isCurrentlyMoving = false;
      
      // 키 상태 완전 초기화
      keyStates = {
        left: false,
        right: false,
        up: false,
        down: false
      };
      
      // 이동 추적 변수 완전 초기화
      movementTracking = {
        left: false,
        right: false,
        up: false,
        down: false,
        startTime: null,
        indicators: {},
        directionTimes: {
          left: 0,
          right: 0,
          up: 0,
          down: 0
        },
        requiredTime: 500
      };
      
      console.log("🎮 플레이어 상태 완전 초기화 완료");
    }
    
    // bubble-sfx 재생 (잘했습니다 메시지)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    // 기존 텍스트 페이드 아웃
    k.tween(tutorialText.opacity, 0, 1, (val) => {
      tutorialText.opacity = val;
    }).then(() => {
      const wellDoneText = k.add([
        k.text("잘했습니다!", { 
          size: 28,
          font: "galmuri",
          align: "center"
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.height() - 120),
        k.color(50, 200, 50),
        k.opacity(0),
        k.z(10),
        k.fixed(),
      ]);
      
      k.tween(wellDoneText.opacity, 1, 0.6, (val) => {
        wellDoneText.opacity = val;
      }).then(() => {
        k.wait(1.2, () => {
          k.tween(wellDoneText.opacity, 0, 0.6, (val) => {
            wellDoneText.opacity = val;
          }).then(() => {
            showNPCAndDialogueTutorial();
          });
        });
      });
    });
  }

  // NPC 등장 및 대화 튜토리얼
  function showNPCAndDialogueTutorial() {
    tutorialStep = 3;
    
    // letter1 오브젝트 생성
    npc = k.add([
      k.sprite("front-assets", { frame: 5378 }),
      k.anchor("center"),
      k.pos(player.pos.x - 210, player.pos.y), // 160에서 210으로 변경 (50 더 멀리)
      k.scale(3.6),
      k.area({ width: 10, height: 25 }),
      k.body({ isStatic: true }),
      k.opacity(0),
      k.z(20),
      "npc",
      "letter"
    ]);
    
    // bubble-sfx 재생 (NPC 등장)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    k.tween(npc.opacity, 1, 1, (val) => {
      npc.opacity = val;
    }).then(() => {
      showDialogueTutorialText();
    });
  }

  // 대화 튜토리얼 텍스트 표시
  function showDialogueTutorialText() {
    tutorialStep = 4;
    
    const dialogueText = k.add([
      k.text("쪽지를 보면 스페이스 또는 A 버튼을 눌러 상호작용 해보세요!", { 
        size: 20,
        font: "galmuri",
        width: k.width() - 100,
        align: "center"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 120),
      k.color(50, 200, 50),
      k.opacity(0),
      k.z(10),
      k.fixed(),
      "tutorialText"
    ]);
    
    const subText = k.add([
      k.text("다른 사물과도 물론 가능하답니다!", { 
        size: 16,
        font: "galmuri",
        width: k.width() - 100,
        align: "center"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 90),
      k.color(120, 120, 120),
      k.opacity(0),
      k.z(10),
      k.fixed(),
      "tutorialText"
    ]);
    
    // bubble-sfx 재생 (대화 텍스트 등장)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    k.tween(dialogueText.opacity, 1, 1, (val) => {
      dialogueText.opacity = val;
    });
    
    k.tween(subText.opacity, 1, 1.2, (val) => {
      subText.opacity = val;
    });
  }

  // 플레이어 이동 처리
  const MOVE_SPEED = 120;
  const CENTER_X = k.center().x;
  const CENTER_Y = k.center().y;
  const MOVE_RADIUS = 100;
  
  let currentAnimDirection = "down";
  let isCurrentlyMoving = false;

  // 키 상태 추적
  let keyStates = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  // 브라우저 키 이벤트 핸들러
  let documentKeyHandler = (e) => {
    if (tutorialStep !== 1 && tutorialStep !== 4 && tutorialStep !== 7) {
      return;
    }
    
    switch(e.code) {
      case 'ArrowLeft':
        keyStates.left = (e.type === 'keydown');
        break;
      case 'ArrowRight':
        keyStates.right = (e.type === 'keydown');
        break;
      case 'ArrowUp':
        keyStates.up = (e.type === 'keydown');
        break;
      case 'ArrowDown':
        keyStates.down = (e.type === 'keydown');
        break;
      case 'Space':
        if (e.type === 'keydown') {
          e.preventDefault(); // 다른 이벤트 차단
          console.log(`🔍 스페이스바 눌림! tutorialStep: ${tutorialStep}, isNearNPC: ${isNearNPC}`);
          console.log(`🔍 현재 상태: player=${!!player}, npc=${!!npc}`);
          
          if (tutorialStep === 4 && isNearNPC) {
            console.log("✅ Letter 상호작용 조건 만족!");
            handleLetterInteraction();
          } else if (tutorialStep === 7 && isNearNPC) {
            console.log("✅ Friend 상호작용 조건 만족!");
            handleFriendInteraction();
          } else {
            console.log(`❌ 상호작용 조건 불만족: tutorialStep=${tutorialStep}, isNearNPC=${isNearNPC}`);
          }
        }
        break;
    }
  };

  document.addEventListener('keydown', documentKeyHandler, true); // capture 단계에서 처리
  document.addEventListener('keyup', documentKeyHandler, true);
  
  // 게임패드 이벤트 처리 (프롤로그와 동일)
  // A 버튼 (east) - 스페이스바와 동일한 기능
  k.onGamepadButtonPress("east", () => {
    console.log(`🎮 게임패드 A 버튼: tutorialStep=${tutorialStep}, isNearNPC=${isNearNPC}`);
    
    if (tutorialStep === 4 && isNearNPC) {
      console.log("✅ 게임패드로 Letter 상호작용!");
      handleLetterInteraction();
    } else if (tutorialStep === 7 && isNearNPC) {
      console.log("✅ 게임패드로 Friend 상호작용!");
      handleFriendInteraction();
    }
  });

  // B 버튼 (south) - 추가 기능 (필요시 사용)
  k.onGamepadButtonPress("south", () => {
    console.log(`🎮 게임패드 B 버튼: tutorialStep=${tutorialStep}`);
    // 현재는 특별한 기능 없음, 필요시 추가
  });
  
  // 전역에 핸들러 저장 (나중에 정리하기 위해)
  // window.previousKeyHandler = documentKeyHandler; // 제거: 이전 핸들러 덮어쓰기 방지

  // Letter 상호작용 핸들러
  function handleLetterInteraction() {
    console.log("🏆 Letter 상호작용 완료!");
    tutorialStep = 5;
    
    // 플레이어 상태 초기화
    if (player) {
      player.vel = k.vec2(0, 0);
      player.play("player-idle-down");
      currentAnimDirection = "down";
      isCurrentlyMoving = false;
      
      keyStates = {
        left: false,
        right: false,
        up: false,
        down: false
      };
    }
    
    k.destroyAll("tutorialText");
    
    // bubble-sfx 재생 (상호작용 완료)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    const letterComplete = k.add([
      k.text("잘했습니다!", {
        font: "galmuri",
        size: 28,
        align: "center"
      }),
      k.color(50, 200, 50),
      k.pos(k.center().x, k.height() - 120),
      k.anchor("center"),
      k.opacity(0),
      k.z(10),
      k.fixed(),
      "tutorialText"
    ]);
    
    k.tween(letterComplete.opacity, 1, 0.6, (val) => {
      letterComplete.opacity = val;
    }).then(() => {
      k.wait(1.2, () => {
        k.tween(letterComplete.opacity, 0, 0.6, (val) => {
          letterComplete.opacity = val;
        }).then(() => {
          showFriendTutorial();
        });
      });
    });
  }

  // Friend 튜토리얼
  function showFriendTutorial() {
    tutorialStep = 6;
    
    // NPC 교체 (friend로)
    if (npc) {
      npc.destroy();
    }
    
    npc = k.add([
      k.sprite("front-assets", { anim: "student1" }),
      k.anchor("center"),
      k.pos(player.pos.x + 250, player.pos.y), // 200에서 250으로 변경 (50 더 멀리)
      k.scale(3.6),
      k.area({ width: 10, height: 86 }),
      k.body({ isStatic: true }),
      k.opacity(0),
      k.z(20),
      "npc",
      "friend"
    ]);
    
    // bubble-sfx 재생 (Friend 등장)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    k.tween(npc.opacity, 1, 1, (val) => {
      npc.opacity = val;
    }).then(() => {
      showFriendTutorialText();
    });
  }

  // Friend 튜토리얼 텍스트
  function showFriendTutorialText() {
    tutorialStep = 7;
    
    const friendText = k.add([
      k.text("학생들과도 스페이스 또는 A 버튼을 눌러 대화할 수 있습니다!", { 
        size: 20,
        font: "galmuri",
        width: k.width() - 100,
        align: "center"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.height() - 120),
      k.color(50, 200, 50),
      k.opacity(0),
      k.z(10),
      k.fixed(),
      "tutorialText"
    ]);
    
    // bubble-sfx 재생 (Friend 텍스트 등장)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    k.tween(friendText.opacity, 1, 1, (val) => {
      friendText.opacity = val;
    });
  }

  // Friend 상호작용 핸들러
  function handleFriendInteraction() {
    console.log("🏆 Friend 상호작용 완료!");
    
    // 플레이어 상태 즉시 초기화
    if (player) {
      player.vel = k.vec2(0, 0);
      player.play("player-idle-down");
      currentAnimDirection = "down";
      isCurrentlyMoving = false;
      
      keyStates = {
        left: false,
        right: false,
        up: false,
        down: false
      };
    }
    
    // 기존 말풍선이 있다면 먼저 제거
    if (exclamationMark) {
      exclamationMark.destroy();
      exclamationMark = null;
    }
    
    // 말풍선 생성 및 애니메이션 효과
    if (npc && tutorialStep === 7) {
      exclamationMark = k.add([
        k.sprite("front-assets", { frame: 5776 }),
        k.pos(npc.pos.x, npc.pos.y - 60),
        k.anchor("center"),
        k.scale(2),
        k.z(1000),
        "bubble-indicator"
      ]);
      
      console.log("💬 말풍선 생성 완료");
      
      // 말풍선 커지면서 흔들리는 애니메이션
      if (exclamationMark && exclamationMark.exists()) {
        k.tween(exclamationMark.scale, k.vec2(2.5, 2.5), 0.3, (val) => {
          if (exclamationMark && exclamationMark.exists()) {
            exclamationMark.scale = val;
          }
        }, k.easings.easeOutBack);
        
        // 흔들리기 효과 (좌우로 살짝)
        const originalX = exclamationMark.pos.x;
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
          if (exclamationMark && exclamationMark.exists() && shakeCount < 6) {
            const shakeAmount = 3;
            exclamationMark.pos.x = originalX + (shakeCount % 2 === 0 ? shakeAmount : -shakeAmount);
            shakeCount++;
          } else {
            clearInterval(shakeInterval);
            if (exclamationMark && exclamationMark.exists()) {
              exclamationMark.pos.x = originalX;
            }
          }
        }, 100);
        
        // 1초 후 말풍선 제거하고 대화 시작
        k.wait(1, () => {
          console.log("💬 말풍선 제거 시도");
          if (exclamationMark && exclamationMark.exists()) {
            exclamationMark.destroy();
            exclamationMark = null;
            console.log("💬 말풍선 제거 완료");
          }
          startTutorialDialog();
        });
      }
    }
  }

  // 튜토리얼 대화 시스템
  function startTutorialDialog() {
    console.log("🎭 튜토리얼 대화 시작");
    tutorialStep = 8; // 대화 중 상태로 변경
    
    // 기존 대화창이 있으면 제거
    k.destroyAll("tutorialDialog");
    
    // 튜토리얼 대화 내용 (모든 대화를 하나의 배열로)
    const dialogData = [
      { character: "???", text: "..." },
      { character: "???", text: "......" },
      { character: "???", text: "...깜짝이야!!!" },
      { character: "???", text: "뭐야 넌! 처음보는 얼굴인데." },
      { character: "???", text: "왜 날 방해하는거야?" }
    ];
    
    let currentDialogIndex = 0;
    let isDialogActive = true;
    let dialogBox = null;
    let dialogText = null;
    let nameText = null;
    let helpText = null;
    let helpTextVisible = false;
    let helpTextTimer = null;
    let hasShownInitialHelp = false;
    
    // 실제 게임 스타일 대화창 생성 (dialog.js와 동일)
    function createDialogBox() {
      console.log("🎭 대화창 생성 시작");
      
      // 대화창 배경 (dialog.js와 정확히 동일한 스타일)
      dialogBox = k.add([
        k.rect(800, 200),
        k.pos(k.center().x - 400, k.height() - 220), // 20px 위로 이동 (200 → 220)
        k.fixed(),
        k.color(240, 240, 240), // 연한 회색 배경
        k.outline(4, k.rgb(128, 128, 128)), // 회색 테두리
        k.z(1000),
        "tutorialDialog"
      ]);
      
      // 이름 탭 (dialog.js 스타일로 동적 크기 계산)
      let nameTabWidth = 140; // 기본 크기
      
      // 현재 화자 이름이 있으면 텍스트 폭에 따라 탭 크기 계산 (dialog.js와 동일)
      if (dialogData[currentDialogIndex] && dialogData[currentDialogIndex].character) {
        const textWidth = k.formatText({
          text: dialogData[currentDialogIndex].character,
          font: "galmuri",
          size: 18,
        }).width;
        nameTabWidth = textWidth + 50; // 좌우 패딩 25px씩
      }
      
      const nameTab = k.add([
        k.rect(nameTabWidth, 45), // 동적 폭, dialog.js와 동일한 높이
        k.pos(k.center().x - 380, k.height() - 242), // 20px 위로 이동 (222 → 242)
        k.fixed(),
        k.color(220, 220, 240), // 약간 다른 색상으로 구분
        k.z(1002),
        "tutorialDialog"
      ]);
      
      // 이름 텍스트 (dialog.js와 동일하게 중앙 정렬)
      // ⚠️ 절대 수정 금지: 이 설정은 front.js의 dialog.js와 일치시키기 위한 것임
      nameText = nameTab.add([
        k.text("???", {
          size: 18,
          font: "galmuri"
        }),
        k.color(50, 50, 150), // 진한 파란색
        k.pos(nameTabWidth / 2, 22.5), // 탭 중앙에 배치 (dialog.js 스타일)
        k.anchor("center"), // 중앙 정렬로 변경 (front.js의 dialog.js와 일치)
        k.fixed(),
        "tutorialDialog"
      ]);
      
      // 대화 텍스트
      dialogText = dialogBox.add([
        k.text("", {
          size: 26, // 24 → 26 (10% 추가 증가)
          font: "galmuri",
          width: 700,
          lineSpacing: 15
        }),
        k.color(0, 0, 0),
        k.pos(40, 40),
        k.fixed(),
        "tutorialDialog"
      ]);
      
      console.log("🎭 대화창 생성 완료");
      showCurrentDialog();
    }
    
    let currentTypingTimeout = null;
    let isTyping = false;
    
    // 현재 대화 표시
    function showCurrentDialog() {
      console.log("🎭 현재 대화 표시:", currentDialogIndex);
      hideHelpText();
      
      if (currentDialogIndex < dialogData.length) {
        const dialog = dialogData[currentDialogIndex];
        console.log("🎭 대화:", dialog);
        
        // 이름 설정
        nameText.text = dialog.character;
        
        // 텍스트 초기화
        dialogText.text = "";
        isTyping = true;
        
        // 타이핑 효과 시작
        let currentCharIndex = 0;
        const fullText = dialog.text;
        const typingSpeed = 80; // 80ms per character
        
        const typeNextChar = () => {
          if (currentCharIndex < fullText.length && isTyping) {
            dialogText.text = fullText.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            
            // talk-sfx 재생 (매 글자마다)
            if (currentCharIndex % 2 === 0) { // 2글자마다 소리 재생
              playSfx(k, "talk-sfx", { volume: 0.3 });
            }
            
            currentTypingTimeout = setTimeout(typeNextChar, typingSpeed);
          } else {
            // 타이핑 완료
            isTyping = false;
            dialogText.text = fullText;
            
            // 타이핑 완료 후 도움말 표시
            if (!hasShownInitialHelp && currentDialogIndex === 0) {
              helpTextTimer = setTimeout(() => {
                if (currentDialogIndex === 0 && !hasShownInitialHelp) {
                  showHelpText("스페이스 키 또는 A 버튼을 누르세요");
                  hasShownInitialHelp = true;
                }
              }, 2000);
            }
          }
        };
        
        typeNextChar();
      }
    }
    
    // 타이핑 스킵 함수
    function skipTyping() {
      if (isTyping && currentDialogIndex < dialogData.length) {
        isTyping = false;
        if (currentTypingTimeout) {
          clearTimeout(currentTypingTimeout);
          currentTypingTimeout = null;
        }
        dialogText.text = dialogData[currentDialogIndex].text;
      }
    }
    
    // 도움말 텍스트 표시
    function showHelpText(text) {
      console.log("🎭 도움말 텍스트 표시:", text);
      
      if (helpText) {
        helpText.destroy();
        helpText = null;
      }
      
      helpText = k.add([
        k.text(text, {
          size: 14,
          font: "galmuri"
        }),
        k.pos(k.center().x, k.height() - 260), // 20px 위로 이동 (240 → 260)
        k.anchor("center"),
        k.color(128, 128, 128),
        k.opacity(0),
        k.z(1020),
        k.fixed(),
        "tutorialDialog"
      ]);
      
      helpTextVisible = true;
      
      const blinkTween = () => {
        if (helpTextVisible && helpText && helpText.exists()) {
          k.tween(helpText.opacity, 1, 0.8, (val) => {
            if (helpText && helpText.exists()) {
              helpText.opacity = val;
            }
          }).then(() => {
            if (helpTextVisible && helpText && helpText.exists()) {
              k.tween(helpText.opacity, 0.3, 0.8, (val) => {
                if (helpText && helpText.exists()) {
                  helpText.opacity = val;
                }
              }).then(() => {
                if (helpTextVisible) {
                  blinkTween();
                }
              });
            }
          });
        }
      };
      blinkTween();
    }
    
    // 도움말 텍스트 숨기기
    function hideHelpText() {
      helpTextVisible = false;
      if (helpText) {
        helpText.destroy();
        helpText = null;
      }
      if (helpTextTimer) {
        clearTimeout(helpTextTimer);
        helpTextTimer = null;
      }
    }
    
    // 키 입력 처리 - 한 번만 등록
    const dialogKeyHandler = (e) => {
      if (!isDialogActive || tutorialStep !== 8) return;
      
      if (e.type === 'keydown' && e.code === 'Space') {
        e.preventDefault();
        hideHelpText();
        
        // 타이핑 중인 경우 스킵
        if (isTyping) {
          skipTyping();
          return;
        }
        
        currentDialogIndex++;
        
        if (currentDialogIndex >= dialogData.length) {
          endDialog();
        } else {
          showCurrentDialog();
        }
      }
    };
    
    // 게임패드 이벤트 처리 (대화 중)
    const dialogGamepadHandler = () => {
      if (!isDialogActive || tutorialStep !== 8) return;
      
      hideHelpText();
      
      // 타이핑 중인 경우 스킵
      if (isTyping) {
        skipTyping();
        return;
      }
      
      currentDialogIndex++;
      
      if (currentDialogIndex >= dialogData.length) {
        endDialog();
      } else {
        showCurrentDialog();
      }
    };
    
    // A 버튼 (east) - 대사 진행
    k.onGamepadButtonPress("east", dialogGamepadHandler);
    
    // B 버튼 (south) - 타이핑 스킵 또는 대사 진행
    k.onGamepadButtonPress("south", () => {
      if (!isDialogActive || tutorialStep !== 8) return;
      
      hideHelpText();
      
      // 타이핑 중이면 즉시 완료
      if (isTyping) {
        skipTyping();
      } else {
        // 타이핑이 끝났으면 다음 대사로
        currentDialogIndex++;
        
        if (currentDialogIndex >= dialogData.length) {
          endDialog();
        } else {
          showCurrentDialog();
        }
      }
    });
    
    // 대화 종료
    function endDialog() {
      console.log("🎭 대화 종료");
      isDialogActive = false;
      isTyping = false;
      hideHelpText();
      
      // 타이핑 타이머 정리
      if (currentTypingTimeout) {
        clearTimeout(currentTypingTimeout);
        currentTypingTimeout = null;
      }
      
      // 이벤트 핸들러 제거
      document.removeEventListener('keydown', dialogKeyHandler);
      
      // 게임패드 이벤트 핸들러 제거 (k.onGamepadButtonPress는 씬이 종료될 때 자동으로 정리됨)
      
      const allDialogElements = k.get("tutorialDialog");
      allDialogElements.forEach(element => {
        if (element.opacity !== undefined) {
          k.tween(element.opacity, 0, 1, (val) => {
            element.opacity = val;
          });
        }
      });
      
      k.wait(1, () => {
        k.destroyAll("tutorialDialog");
        showFinalWellDoneMessage();
      });
    }
    
    // 이벤트 핸들러 등록 (한 번만)
    document.addEventListener('keydown', dialogKeyHandler);
    
    createDialogBox();
  }

  // 최종 "잘했습니다" 메시지
  function showFinalWellDoneMessage() {
    tutorialStep = 9;
    
    // 모든 튜토리얼 관련 오브젝트 정리
    k.destroyAll("tutorialText");
    k.destroyAll("tutorialDialog");
    k.destroyAll("bubble-indicator"); // 말풍선 제거 추가
    
    // 플레이어와 NPC 제거
    if (player) {
      player.destroy();
      player = null;
    }
    if (npc) {
      npc.destroy();
      npc = null;
    }
    
    // 말풍선 명시적 제거
    if (exclamationMark && exclamationMark.exists()) {
      exclamationMark.destroy();
      exclamationMark = null;
      console.log("💬 최종 정리 시 말풍선 제거 완료");
    }
    
    // bubble-sfx 재생 (상호작용 완료)
    playSfx(k, "bubble-sfx", { volume: 0.7 });
    
    const finalWellDone = k.add([
      k.text("잘했습니다!", {
        font: "galmuri",
        size: 28,
        align: "center"
      }),
      k.color(50, 200, 50),
      k.pos(k.center().x, k.height() - 140), // 보조텍스트 공간 확보를 위해 20px 위로
      k.anchor("center"),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    const subText = k.add([
      k.text("모든 학생들이 대화를 즐기진 않아요...", {
        font: "galmuri",
        size: 16,
        align: "center"
      }),
      k.color(120, 120, 120),
      k.pos(k.center().x, k.height() - 110), // 메인 텍스트 아래에 위치
      k.anchor("center"),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    k.tween(finalWellDone.opacity, 1, 0.6, (val) => {
      finalWellDone.opacity = val;
    });
    
    k.tween(subText.opacity, 1, 0.8, (val) => {
      subText.opacity = val;
    }).then(() => {
      k.wait(1.5, () => {
        k.tween(finalWellDone.opacity, 0, 0.6, (val) => {
          finalWellDone.opacity = val;
        });
        k.tween(subText.opacity, 0, 0.6, (val) => {
          subText.opacity = val;
        }).then(() => {
          showTutorialCompleteMessage();
        });
      });
    });
  }
  
  // 튜토리얼 완료 메시지
  function showTutorialCompleteMessage() {
    tutorialStep = 10;
    
    // 첫 번째 메시지: "튜토리얼이 끝났습니다."
    const completeText1 = k.add([
      k.text("튜 토 리 얼 이  끝 났 습 니 다 .", { 
        size: 20,
        font: "galmuri"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y - 20),
      k.color(111, 111, 111),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    // 두 번째 메시지: 빈 줄
    const completeText2 = k.add([
      k.text("", { 
        size: 26,
        font: "galmuri"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y + 20),
      k.color(111, 111, 111),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    // 첫 번째 메시지 표시
    k.tween(completeText1.opacity, 1, 0.6, (val) => {
      completeText1.opacity = val;
    }).then(() => {
      k.wait(1.5, () => {
        // 첫 번째 메시지 사라짐
        k.tween(completeText1.opacity, 0, 0.6, (val) => {
          completeText1.opacity = val;
        }).then(() => {
          showSecondCompleteMessage();
        });
      });
    });
  }
  
  // 두 번째 완료 메시지
  function showSecondCompleteMessage() {
    const enjoyText = k.add([
      k.text("즐 거 운  학 교 생 활  되 세 요 !", { 
        size: 26,
        font: "galmuri"
      }),
      k.anchor("center"),
      k.pos(k.center().x, k.center().y),
      k.color(111, 111, 111),
      k.opacity(0),
      k.z(10),
      k.fixed(),
    ]);
    
    k.tween(enjoyText.opacity, 1, 0.6, (val) => {
      enjoyText.opacity = val;
    }).then(() => {
      k.wait(1.5, () => {
        k.tween(enjoyText.opacity, 0, 0.6, (val) => {
          enjoyText.opacity = val;
        }).then(() => {
          startFinalFadeOut();
        });
      });
    });
  }
  
  // 최종 페이드아웃 및 씬 전환
  function startFinalFadeOut() {
    console.log("🎬 최종 페이드아웃 시작");
    
    // BGM 페이드아웃
    const currentBgm = gameState.getBgmHandle();
    if (currentBgm) {
      console.log("🎵 BGM 페이드아웃 시작");
      k.tween(currentBgm.volume, 0, 2, (val) => {
        currentBgm.volume = val;
      }).then(() => {
        currentBgm.stop();
        console.log("🎵 BGM 정지");
      });
    }
    
    // 화면 페이드아웃
    const fadeOutOverlay = document.createElement('div');
    fadeOutOverlay.style.position = 'fixed';
    fadeOutOverlay.style.top = '0';
    fadeOutOverlay.style.left = '0';
    fadeOutOverlay.style.width = '100vw';
    fadeOutOverlay.style.height = '100vh';
    fadeOutOverlay.style.backgroundColor = 'black';
    fadeOutOverlay.style.opacity = '0';
    fadeOutOverlay.style.zIndex = '10000';
    fadeOutOverlay.style.pointerEvents = 'none';
    fadeOutOverlay.style.transition = 'opacity 2s ease-in-out';
    document.body.appendChild(fadeOutOverlay);
    
    console.log("🎬 화면 페이드아웃 시작");
    setTimeout(() => {
      fadeOutOverlay.style.opacity = '1';
    }, 50);
    
    // 2초 후 front 씬으로 이동
    setTimeout(() => {
      console.log("🎬 front 씬으로 이동 시도");
      
      try {
        // 배경색을 검은색으로 유지
        document.body.style.backgroundColor = 'black';
        
        // 기존 오버레이 정리
        if (fadeOutOverlay && fadeOutOverlay.parentNode) {
          document.body.removeChild(fadeOutOverlay);
        }
        if (fadeInOverlay && fadeInOverlay.parentNode) {
          document.body.removeChild(fadeInOverlay);
        }
        
        gameState.setPreviousScene("tutorial");
        k.go("front");
        console.log("✅ front 씬으로 이동 성공");
        
      } catch (error) {
        console.error("❌ front 씬으로 이동 실패:", error);
        // 오버레이 정리
        if (fadeOutOverlay && fadeOutOverlay.parentNode) {
          document.body.removeChild(fadeOutOverlay);
        }
        // 대체 씬으로 이동
        try {
          k.go("main");
          console.log("✅ main 씬으로 대체 이동");
        } catch (fallbackError) {
          console.error("❌ 대체 씬으로 이동도 실패:", fallbackError);
        }
      }
    }, 2100);
  }

  // 메인 업데이트 루프
  k.onUpdate(() => {
    if (!player || (tutorialStep !== 1 && tutorialStep !== 4 && tutorialStep !== 7) || tutorialStep >= 8) {
      return;
    }
    
    let moveX = 0;
    let moveY = 0;
    let isMoving = false;
    let direction = null;
    
    // 게임패드 연결 상태 확인 (한 번만 로그)
    if (tutorialStep === 1 && !window.gamepadConnectedLogged) {
      const gamepads = navigator.getGamepads();
      const connectedGamepads = Array.from(gamepads).filter(gp => gp !== null);
      console.log(`🎮 연결된 게임패드: ${connectedGamepads.length}개`);
      if (connectedGamepads.length > 0) {
        console.log(`🎮 첫 번째 게임패드: ${connectedGamepads[0].id}`);
      }
      window.gamepadConnectedLogged = true;
    }
    
    // 키보드 + 게임패드 입력 처리 (다양한 게임패드 방향키 이름 지원)
    const gamepadLeft = k.isGamepadButtonDown("left") || k.isGamepadButtonDown("dpad-left") || k.isGamepadButtonDown("14");
    const gamepadRight = k.isGamepadButtonDown("right") || k.isGamepadButtonDown("dpad-right") || k.isGamepadButtonDown("15");
    const gamepadUp = k.isGamepadButtonDown("up") || k.isGamepadButtonDown("dpad-up") || k.isGamepadButtonDown("12");
    const gamepadDown = k.isGamepadButtonDown("down") || k.isGamepadButtonDown("dpad-down") || k.isGamepadButtonDown("13");
    
    // 조이스틱 입력 처리 추가
    const gamepads = navigator.getGamepads();
    let joystickLeft = false, joystickRight = false, joystickUp = false, joystickDown = false;
    
    if (gamepads[0]) {
      const deadzone = 0.3; // 데드존 설정
      const leftStickX = gamepads[0].axes[0] || 0; // 왼쪽 스틱 X축
      const leftStickY = gamepads[0].axes[1] || 0; // 왼쪽 스틱 Y축
      
      if (leftStickX < -deadzone) joystickLeft = true;
      if (leftStickX > deadzone) joystickRight = true;
      if (leftStickY < -deadzone) joystickUp = true;
      if (leftStickY > deadzone) joystickDown = true;
    }
    
    const leftPressed = k.isKeyDown("left") || keyStates.left || gamepadLeft || joystickLeft;
    const rightPressed = k.isKeyDown("right") || keyStates.right || gamepadRight || joystickRight;
    const upPressed = k.isKeyDown("up") || keyStates.up || gamepadUp || joystickUp;
    const downPressed = k.isKeyDown("down") || keyStates.down || gamepadDown || joystickDown;
    
    // 게임패드 입력 디버그 (더 상세한 로그)
    if (tutorialStep === 1) {
      // 키보드와 게임패드 상태 모두 로그
      if (gamepadLeft || gamepadRight || gamepadUp || gamepadDown || keyStates.left || keyStates.right || keyStates.up || keyStates.down) {
        console.log(`🎮 입력 상태 - 게임패드 L:${gamepadLeft} R:${gamepadRight} U:${gamepadUp} D:${gamepadDown} | 키보드 L:${keyStates.left} R:${keyStates.right} U:${keyStates.up} D:${keyStates.down}`);
      }
    }
    
    if (leftPressed) {
      moveX = -MOVE_SPEED * k.dt();
      isMoving = true;
      direction = "left";
    }
    if (rightPressed) {
      moveX = MOVE_SPEED * k.dt();
      isMoving = true;
      direction = "right";
    }
    if (upPressed) {
      moveY = -MOVE_SPEED * k.dt();
      isMoving = true;
      direction = "up";
    }
    if (downPressed) {
      moveY = MOVE_SPEED * k.dt();
      isMoving = true;
      direction = "down";
    }
    
    // 애니메이션 처리
    if (isMoving && direction) {
      if (!isCurrentlyMoving || currentAnimDirection !== direction) {
        player.play(`player-${direction}`);
        currentAnimDirection = direction;
      }
      isCurrentlyMoving = true;
    } else {
      if (isCurrentlyMoving) {
        player.play(`player-idle-${currentAnimDirection}`);
        isCurrentlyMoving = false;
      }
    }
    
    // 이동 처리
    if (isMoving) {
      if (tutorialStep === 1) {
        const deltaTime = k.dt() * 1000;
        
        // 키보드와 게임패드 모든 입력을 방향 추적에 반영
        if (leftPressed) {
          updateDirectionTime("left", deltaTime);
        }
        if (rightPressed) {
          updateDirectionTime("right", deltaTime);
        }
        if (upPressed) {
          updateDirectionTime("up", deltaTime);
        }
        if (downPressed) {
          updateDirectionTime("down", deltaTime);
        }
        
        if (!hasPlayerMoved) {
          hasPlayerMoved = true;
          console.log("🎮 첫 이동 감지!");
        }
      }
      
      const newX = player.pos.x + moveX;
      const newY = player.pos.y + moveY;
      
      if (tutorialStep === 1) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(newX - CENTER_X, 2) + Math.pow(newY - CENTER_Y, 2)
        );
        
        if (distanceFromCenter <= MOVE_RADIUS) {
          player.pos.x = newX;
          player.pos.y = newY;
        }
      } else if (tutorialStep === 4 || tutorialStep === 7) {
        player.pos.x = newX;
        player.pos.y = newY;
      }
    }
    
    // NPC 근접 감지
    if ((tutorialStep === 4 || tutorialStep === 7) && player && npc) {
      const distance = Math.sqrt(
        Math.pow(player.pos.x - npc.pos.x, 2) + 
        Math.pow(player.pos.y - npc.pos.y, 2)
      );
      
      const INTERACTION_DISTANCE = 120;
      const wasNearNPC = isNearNPC;
      
      if (distance <= INTERACTION_DISTANCE) {
        isNearNPC = true;
        if (!wasNearNPC) {
          console.log(`🎯 NPC 근접! 거리: ${distance.toFixed(1)}, tutorialStep: ${tutorialStep}`);
        }
      } else {
        isNearNPC = false;
        if (wasNearNPC) {
          console.log(`🚶 NPC에서 멀어짐! 거리: ${distance.toFixed(1)}`);
        }
      }
    }
  });

  // 씬 정리
  k.onSceneLeave(() => {
    console.log("🧹 Tutorial 씬 정리 시작");
    
    // 모든 오브젝트 정리
    k.destroyAll("bubble-indicator"); // 말풍선 태그로 정리
    
    // 말풍선 명시적 정리
    if (exclamationMark && exclamationMark.exists()) {
      exclamationMark.destroy();
      exclamationMark = null;
      console.log("💬 씬 정리 시 말풍선 제거 완료");
    }
    
    // 키보드 이벤트 리스너 정리
    if (documentKeyHandler) {
      document.removeEventListener('keydown', documentKeyHandler, true);
      document.removeEventListener('keyup', documentKeyHandler, true);
      console.log("✅ Tutorial 키보드 이벤트 리스너 정리 완료");
    }
    
    // 전역 핸들러 정리
    if (window.previousKeyHandler) {
      document.removeEventListener('keydown', window.previousKeyHandler, true);
      document.removeEventListener('keyup', window.previousKeyHandler, true);
      window.previousKeyHandler = null;
      console.log("✅ 전역 키보드 이벤트 리스너 정리 완료");
    }
    
    console.log("✅ Tutorial 씬 정리 완료");
  });

  // Exit on escape
  k.onKeyPress("escape", () => {
    k.go("main");
  });
}
