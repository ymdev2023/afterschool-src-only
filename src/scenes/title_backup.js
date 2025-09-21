import { gameState } from "../state/stateManagers.js";
import { fadeInBGM, colorizeBackground, audioManager } from "../utils.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import { createPanelWithHeader, createCloseButton, UI_THEMES } from "../uiComponents/nineSlicePanel.js";

export default function title(k) {
    // 상호작용 및 게임 시작 제어 변수
    let canInteract = false;
    let gameStartTriggered = false;
    
    // 배경을 검은색으로 초기화 (뒷배경은 검은색)
    colorizeBackground(k, 0, 0, 0);

    // 씬 시작 시 검은색에서 페이드 인
    const fadeIn = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(1),
        k.z(100),
        k.fixed(),
    ]);
    
    // 페이드 인 애니메이션
    k.tween(fadeIn.opacity, 0, 1.5, (val) => {
        fadeIn.opacity = val;
    }).then(() => {
        console.log('🎬 Title 페이드인 완료 - 오버레이 제거');
        k.destroy(fadeIn);
    });

    // BGM 체크 및 시작
    console.log("🎵 BGM 상태 확인:", audioManager.getCurrentBGM(), audioManager.isBGMPlaying());
    
    if (!audioManager.isBGMPlaying() || audioManager.getCurrentBGM() !== "title-bgm") {
        console.log("🎵 새로운 BGM 재생 시작");
        const bgmResult = audioManager.playBGM("title-bgm", 1.0);
        if (bgmResult) {
            console.log("🎵 BGM 재생 완료");
        } else {
            console.error("🎵 BGM 재생 실패");
        }
        gameState.isMainMenuBGMPlaying = true;
    } else {
        console.log("🎵 BGM 이미 재생 중");
    }

    // 문서 배경도 검은색으로 설정 (뒷배경은 검은색)
    document.body.style.backgroundColor = 'black';

    // Title 화면 구성 (Kaboom.js 사용)
    const titleImg = k.add([
        k.sprite("title_01_bg"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.scale(0.8),
        k.z(1),
    ]);

    // Press to Start 버튼
    const startButton = k.add([
        k.sprite("title_button_notpressed"),
        k.pos(k.width() / 2, k.height() / 2 + 200),
        k.anchor("center"),
        k.scale(0.8),
        k.z(2),
        k.area(),
        "startButton",
    ]);

    // 마우스 호버 효과
    startButton.onHover(() => {
        startButton.use(k.sprite("title_button_pressed"));
    });

    startButton.onHoverEnd(() => {
        startButton.use(k.sprite("title_button_notpressed"));
    });

    // 클릭 시 프롤로그로 이동
    startButton.onClick(() => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        
        // 페이드 아웃 효과
        const fadeOut = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(0, 0, 0),
            k.opacity(0),
            k.z(100),
            k.fixed(),
        ]);

        k.tween(fadeOut.opacity, 1, 1, (val) => {
            fadeOut.opacity = val;
        }).then(() => {
            k.go("prologue");
        });
    });

    // Enter 키나 스페이스바로도 시작 가능
    k.onKeyPress("enter", () => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        k.go("prologue");
    });

    k.onKeyPress("space", () => {
        if (!canInteract || gameStartTriggered) return;
        gameStartTriggered = true;
        canInteract = false;
        k.go("prologue");
    });

    // 페이드인 완료 후 상호작용 가능
    setTimeout(() => {
        canInteract = true;
    }, 1500);

    // 씬 정리 함수
    k.onDestroy(() => {
        console.log("✅ Title 씬 종료");
    });
}
