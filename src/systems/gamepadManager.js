import k from "../kaboomContext.js";
import { gameState } from "../state/stateManagers.js";

/**
 * 전역 게임패드 매니저 클래스
 * 모든 씬에서 공통으로 사용할 수 있는 컨트롤러 입력 처리
 */
class GamepadManager {
    constructor() {
        this.isInitialized = false;
        this.handlers = [];
    }

    /**
     * 게임패드 매니저 초기화
     */
    initialize() {
        if (this.isInitialized) return;

        console.log("🎮 게임패드 매니저 초기화");
        
        // 게임패드 연결/해제 이벤트 리스너
        window.addEventListener("gamepadconnected", (e) => {
            console.log(`🎮 게임패드 연결됨: ${e.gamepad.id} (인덱스: ${e.gamepad.index})`);
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log(`🎮 게임패드 연결 해제됨: ${e.gamepad.id} (인덱스: ${e.gamepad.index})`);
        });

        this.setupGlobalGamepadMappings();
        this.isInitialized = true;
    }

    /**
     * 전역 게임패드 매핑 설정
     */
    setupGlobalGamepadMappings() {
        console.log("🎮 전역 게임패드 매핑 설정");

        // ESC 키 역할 (메뉴 토글) - Start 버튼
        k.onGamepadButtonPress("start", () => {
            console.log("🎮 Start 버튼 눌림 - ESC 키 역할");
            // ESC 키 핸들러 직접 호출
            if (k.events?.keyPress?.escape) {
                k.events.keyPress.escape.forEach(handler => {
                    try { handler(); } catch (e) { console.error(e); }
                });
            }
        });

        // M 키 역할 (음소거) - Select 버튼
        k.onGamepadButtonPress("select", () => {
            console.log("🎮 Select 버튼 눌림 - M 키 역할");
            // M 키 핸들러 직접 호출
            if (k.events?.keyPress?.m) {
                k.events.keyPress.m.forEach(handler => {
                    try { handler(); } catch (e) { console.error(e); }
                });
            }
        });

        // Y 버튼은 개별 씬에서 처리하므로 전역 매핑 제거
    }

    /**
     * 커스텀 버튼 핸들러 등록
     */
    addButtonHandler(buttonName, callback) {
        const handler = k.onGamepadButtonPress(buttonName, callback);
        this.handlers.push(handler);
        return handler;
    }

    /**
     * 핸들러 제거
     */
    removeHandler(handler) {
        const index = this.handlers.indexOf(handler);
        if (index > -1) {
            this.handlers.splice(index, 1);
            handler.cancel?.();
        }
    }

    /**
     * 모든 핸들러 정리
     */
    cleanup() {
        this.handlers.forEach(handler => {
            handler.cancel?.();
        });
        this.handlers = [];
    }

    /**
     * 게임패드 연결 상태 확인
     */
    isGamepadConnected() {
        const gamepads = navigator.getGamepads();
        return Array.from(gamepads).some(gamepad => gamepad && gamepad.connected);
    }

    /**
     * 연결된 게임패드 정보 반환
     */
    getConnectedGamepads() {
        const gamepads = navigator.getGamepads();
        return Array.from(gamepads).filter(gamepad => gamepad && gamepad.connected);
    }
}

// 싱글톤 인스턴스 생성
const gamepadManager = new GamepadManager();

export { gamepadManager };
