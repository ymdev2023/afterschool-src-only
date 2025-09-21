// scenes/intro.js
import { gameState } from "../state/stateManagers.js";
import { colorizeBackground } from "../utils.js";

export default function intro(k) {
    // 검은색 배경
    colorizeBackground(k, 0, 0, 0);
    
    // 문서 배경도 검은색으로 설정
    document.body.style.backgroundColor = 'black';

    // 패턴 배경 추가 (1280x1280 원본 이미지 사용)
    const patterns = [];
    const patternSize = 1280; // 원본 이미지 크기
    
    console.log("화면 크기:", k.width(), "x", k.height());
    
    // 원본 크기 패턴으로 타일링
    const screenWidth = k.width();
    const screenHeight = k.height();
    const extraPadding = patternSize; // 여분 패딩
    
    console.log("실제 렌더링 영역:", screenWidth, "x", screenHeight);
    
    // 원본 크기로 패턴 배치 (스케일링 및 색상 필터링 없음)
    for (let x = -extraPadding; x <= screenWidth + extraPadding; x += patternSize) {
        for (let y = -extraPadding; y <= screenHeight + extraPadding; y += patternSize) {
            const pattern = k.add([
                k.sprite("pattern"),
                k.pos(x, y),
                k.z(0), // z-index 0
                k.fixed(), // 카메라 움직임에 고정
            ]);
            patterns.push(pattern);
        }
    }
    
    console.log("패턴 생성 완료, 총 패턴 수:", patterns.length);

    // Press Any Key 텍스트 추가 (GameBoy 폰트) - 화면 중앙
    let pressAnyKeyText = k.add([
        k.text("PRESS ANY KEY", {
            size: 32, // 글씨 크기 2배로 증가 (16 -> 32)
            font: "gameboy" // GameBoy 폰트 (올바른 이름 사용)
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y), // 화면 중앙으로 이동
        k.color(248,111,152), // 핑크색으로 변경  
        k.opacity(0),
        k.z(15), // 가장 위에 표시
    ]);

    // Press Any Key 효과 - 바로 표시하고 깜빡임
    let pressKeyVisible = false;
    let fadeInComplete = true; // 바로 true로 설정
    let triggered = false;
    
    // 바로 표시
    pressAnyKeyText.opacity = 1;
    
    // 깜빡임 시작 - 트리거되지 않은 동안 계속
    const blinkLoop = k.loop(0.8, () => {
        if (fadeInComplete && !triggered) {
            pressAnyKeyText.opacity = pressAnyKeyText.opacity > 0 ? 0 : 1;
        } else {
            blinkLoop.cancel();
            pressAnyKeyText.opacity = 0; // 트리거되면 숨김
        }
    });

    // 패턴 애니메이션 (좌하향으로 흐름) - 자연스러운 래핑
    const patternSpeed = 30; // 속도 조정
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

    // 씬 전환 함수
    function transitionToTitle() {
        console.log("🔄 Title 씬으로 전환 시작");
        
        triggered = true;
        pressAnyKeyText.opacity = 0; // Press Any Key 텍스트 숨김
        
        // 화면을 검은색으로 페이드 아웃
        const fadeOut = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(0, 0, 0),
            k.opacity(0),
            k.z(999),
            k.fixed(),
        ]);
        
        // 페이드 아웃 애니메이션
        k.tween(fadeOut.opacity, 1, 1.0, (val) => {
            fadeOut.opacity = val;
        }).then(() => {
            k.go("title");
        });
    }

    // 브라우저 레벨 키 이벤트 처리 (한글 IME 호환성을 위해)
    const documentKeyHandler = (e) => {
        console.log(`브라우저 키 이벤트: ${e.code}, triggered: ${triggered}, fadeInComplete: ${fadeInComplete}`);
        
        // Press Any Key 상태에서 아무 키나 누르면 title로 이동
        if (!triggered && fadeInComplete) {
            e.preventDefault();
            console.log("Press Any Key에서 title 씬으로 이동");
            transitionToTitle();
            return;
        }
    };
    document.addEventListener('keydown', documentKeyHandler);

    // 마우스 클릭으로도 진행 가능하도록 추가
    k.onClick(() => {
        console.log(`마우스 클릭: triggered: ${triggered}, fadeInComplete: ${fadeInComplete}`);
        
        // Press Any Key 상태에서 클릭하면 title로 이동
        if (!triggered && fadeInComplete) {
            console.log("Press Any Key에서 title 씬으로 이동 (마우스 클릭)");
            transitionToTitle();
            return;
        }
    });

    // 키보드 입력 처리 (레거시 지원)
    k.onKeyPress(() => {
        if (triggered) return;
        console.log("⌨️ 키보드 입력으로 title 씬으로 전환");
        transitionToTitle();
    });

    // 게임패드 ABXY 버튼 입력 처리
    k.onGamepadButtonPress("east", () => {
        // A버튼
        console.log("🅰️ Intro - A버튼 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("south", () => {
        // B버튼
        console.log("🅱️ Intro - B버튼 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("west", () => {
        // X버튼
        console.log("❌ Intro - X버튼 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("north", () => {
        // Y버튼
        console.log("🔺 Intro - Y버튼 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    // 게임패드 D패드도 추가
    k.onGamepadButtonPress("dpad-up", () => {
        console.log("🕹️ Intro - D패드 위쪽 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("dpad-down", () => {
        console.log("🕹️ Intro - D패드 아래쪽 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("dpad-left", () => {
        console.log("🕹️ Intro - D패드 왼쪽 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    k.onGamepadButtonPress("dpad-right", () => {
        console.log("🕹️ Intro - D패드 오른쪽 눌림");
        if (triggered) return;
        transitionToTitle();
    });

    // 씬을 떠날 때 배경 정리
    k.onSceneLeave(() => {
        console.log("🔄 Intro 씬 종료 - 배경 정리");
        document.body.style.backgroundColor = '';
        // 브라우저 키 이벤트 리스너 제거
        document.removeEventListener('keydown', documentKeyHandler);
    });
}
