import { playerState } from "../state/stateManagers.js";
import { createUIManager } from "../systems/uiManager.js";

/**
 * 호환성을 위한 기존 healthBar 함수
 * 새로운 UI 시스템으로 리디렉션됩니다.
 */
export function healthBar(k) {
    const uiManager = createUIManager(k);
    
    if (!uiManager.initialized) {
        uiManager.initialize();
    }
    
    return uiManager.uiElements.get('healthbar');
}

/**
 * 체력 바 업데이트를 위한 유틸리티 함수
 */
export function updateHealthBar(k) {
    const uiManager = createUIManager(k);
    uiManager.updateHealthBar();
}

/**
 * 체력 변경 감지 및 자동 업데이트
 */
export function watchPlayerHealth(k) {
    let lastHealth = playerState.getHealth();
    
    k.onUpdate(() => {
        const currentHealth = playerState.getHealth();
        if (currentHealth !== lastHealth) {
            updateHealthBar(k);
            lastHealth = currentHealth;
        }
    });
}
