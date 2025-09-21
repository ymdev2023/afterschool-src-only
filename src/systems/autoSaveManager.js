// 자동 저장 관리 모듈
// 자동 저장 로직과 알림 표시를 관리

import { gameDataManager } from "./gameDataManager.js";
import { UI_POSITIONS, UI_SIZES } from "../uiComponents/uiConstants.js";
import { getQuestSaveData } from "../content/questData.js";
import { playerState, globalState } from "../state/stateManagers.js";

/**
 * 자동 저장 매니저 클래스
 */
export class AutoSaveManager {
    constructor(k, gameState) {
        this.k = k;
        this.gameState = gameState;
        this.gameDataManager = gameDataManager; // gameDataManager 인스턴스 추가
        this.autoSaveNotification = null;
        this.lastSaveTime = 0;
        this.lastNotificationTime = 0; // 마지막 알림 시간 추가
        this.saveInterval = 30000; // 30초마다 자동 저장
    }

    /**
     * 자동 저장 수행
     */
    performAutoSave(entities, currentScene = "front") {
        try {
            // 여러 방법으로 플레이어 이름 확인 (globalState 우선)
            console.log(`🔍 자동저장 - globalState.getPlayerName(): "${globalState.getPlayerName()}"`);
            console.log(`🔍 자동저장 - this.gameState.playerName: "${this.gameState.playerName}"`);
            
            let playerName = globalState.getPlayerName() || 
                           this.gameState.playerName;
            
            // gameState에 없으면 localStorage에서 직접 확인
            if (!playerName || playerName.trim() === "" || playerName === "플레이어") {
                const existingSaves = this.gameDataManager.getAllSaves();
                if (existingSaves && existingSaves.length > 0) {
                    // 가장 최근 저장 파일에서 플레이어 이름 가져오기
                    const latestSave = existingSaves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                    playerName = latestSave.playerName;
                }
            }
            
            console.log(`🔍 자동저장 체크 - 플레이어 이름: "${playerName}"`);
            
            if (!playerName || playerName.trim() === "" || playerName === "플레이어") {
                // console.log("⏰ 자동저장 건너뜀: 유효한 플레이어 이름 없음");
                return false;
            }
            
            // 현재 플레이어 위치 가져오기
            const currentPosition = entities.player ? {
                x: Math.round(entities.player.pos.x),
                y: Math.round(entities.player.pos.y)
            } : { x: 0, y: 0 };
            
            // 현재 저장 슬롯이 있는지 확인
            let currentSaveSlot = gameDataManager.getCurrentSaveSlot();
            
            if (!currentSaveSlot) {
                // 플레이어 이름으로 기존 저장 데이터 찾기
                const existingSaves = gameDataManager.getSaveList();
                const playerSave = existingSaves.find(save => save.playerName === playerName);
                
                if (playerSave) {
                    currentSaveSlot = playerSave.id;
                    gameDataManager.setCurrentSaveSlot(currentSaveSlot);
                    console.log("🔄 기존 저장 슬롯 연결:", currentSaveSlot);
                } else {
                    // 새로운 저장 데이터 생성
                    const newSaveData = gameDataManager.createSaveData(playerName);
                    currentSaveSlot = newSaveData.id;
                    console.log("✨ 새로운 저장 슬롯 생성:", currentSaveSlot);
                }
            }
            
            // 실시간 게임 상태 업데이트
            const questSaveData = window.questItems ? getQuestSaveData(window.questItems) : null;
            const updateResult = gameDataManager.updateCurrentSave(
                globalState, // gameState 대신 globalState 사용 (mood, health 메서드가 있음)
                questSaveData ? { questItems: questSaveData } : null,
                currentPosition,
                currentScene,
                globalState // 전역 상태도 전달
            );
            
            if (updateResult) {
                console.log("💾 자동저장 완료:", {
                    playerName: playerName,
                    position: currentPosition,
                    time: new Date().toLocaleTimeString('ko-KR')
                });
                
                // NotificationManager를 사용한 자동저장 알림 표시 (중복 방지)
                const currentTime = Date.now();
                if (currentTime - this.lastNotificationTime > 25000) { // 25초 이상 간격일 때만 알림
                    console.log("🔍 자동저장 알림 표시 시도 - notificationManager:", !!window.notificationManager);
                    if (window.notificationManager) {
                        try {
                            window.notificationManager.addNotification({
                                type: 'system',
                                message: "자동저장되었습니다",
                                statusType: 'system',
                                changeType: 'neutral'
                            });
                            this.lastNotificationTime = currentTime; // 알림 시간 업데이트
                            console.log("✅ 전역 알림 매니저로 자동저장 알림 표시 완료");
                        } catch (error) {
                            console.warn("⚠️ 전역 알림 매니저 호출 실패, fallback 사용:", error);
                            this.showAutoSaveNotification();
                        }
                    } else {
                        console.log("⚠️ 전역 알림 매니저 없음, fallback 사용");
                        this.showAutoSaveNotification();
                    }
                } else {
                    console.log("🔇 자동저장 알림 스킵 (중복 방지)");
                }
                
                this.lastSaveTime = Date.now();
                return true;
            } else {
                console.warn("⚠️ 자동저장 실패");
                return false;
            }
            
        } catch (error) {
            console.error("❌ 자동저장 중 오류:", error);
            return false;
        }
    }

    /**
     * 자동 저장 알림 표시
     */
    showAutoSaveNotification() {
        // 기존 알림이 있다면 제거
        if (this.autoSaveNotification) {
            this.k.destroy(this.autoSaveNotification);
        }
        
        // 새 알림 생성 (전역 상수 사용)
        this.autoSaveNotification = this.k.add([
            this.k.text("저장되었습니다.", { 
                size: 16,
                font: "galmuri" 
            }),
            this.k.pos(this.k.width() / 2, UI_POSITIONS.NOTIFICATION.Y), // 전역 상수 사용
            this.k.anchor("center"),
            this.k.color(138, 43, 226),
            this.k.z(UI_SIZES.Z_INDEX.NOTIFICATIONS),
            this.k.fixed(),
            this.k.opacity(1)
        ]);
        
        // 3초 후 페이드 아웃
        this.k.wait(2, () => {
            if (this.autoSaveNotification) {
                this.k.tween(this.autoSaveNotification.opacity, 0, 1, (val) => {
                    if (this.autoSaveNotification) {
                        this.autoSaveNotification.opacity = val;
                    }
                }).then(() => {
                    if (this.autoSaveNotification) {
                        this.k.destroy(this.autoSaveNotification);
                        this.autoSaveNotification = null;
                    }
                });
            }
        });
    }

    /**
     * 자동 저장이 필요한지 확인
     */
    shouldAutoSave() {
        const currentTime = Date.now();
        return (currentTime - this.lastSaveTime) >= this.saveInterval;
    }

    /**
     * 주기적 자동 저장 시작
     */
    startPeriodicAutoSave(entities, currentScene = "front") {
        const autoSaveLoop = () => {
            if (this.shouldAutoSave()) {
                this.performAutoSave(entities, currentScene);
            }
            // 5초마다 확인
            this.k.wait(5, autoSaveLoop);
        };
        
        // 첫 번째 자동저장은 30초 후에 시작
        this.k.wait(30, autoSaveLoop);
    }

    /**
     * 즉시 저장 (수동 저장 또는 중요한 이벤트 후)
     */
    saveNow(entities, currentScene = "front") {
        return this.performAutoSave(entities, currentScene);
    }

    /**
     * 정리 함수
     */
    cleanup() {
        if (this.autoSaveNotification) {
            this.k.destroy(this.autoSaveNotification);
            this.autoSaveNotification = null;
        }
    }
}
