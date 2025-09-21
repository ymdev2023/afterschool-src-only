/**
 * 전역 시스템 통합 매니저 - 모든 씬에서 공통으로 사용하는 시스템들을 한번에 관리
 * front.js, garage.js, restroom.js 등 모든 씬에서 동일하게 사용
 */
import { setupGlobalUI } from "./globalUI.js";
import { setupGlobalDialogue } from "./globalDialogueManager.js";
import { setupInventorySystem } from "./inventorySystem.js";
import { setupGlobalCamera } from "../systems/globalCameraManager.js";
import { gameState } from "../state/stateManagers.js";
import { audioManager, toggleMute } from "../utils.js";

export class GlobalSystemManager {
    constructor(k, gameState, globalState, entities, sceneName, sceneDialogues = null, mapBounds = null) {
        this.k = k;
        this.gameState = gameState;
        this.globalState = globalState;
        this.entities = entities;
        this.sceneName = sceneName;
        this.sceneDialogues = sceneDialogues; // 씬별 대화 데이터
        this.mapBounds = mapBounds; // 씬별 맵 경계
        
        // 기존 전역 매니저가 있다면 정리
        if (window.globalSystemManager && window.globalSystemManager !== this) {
            console.log(`🧹 기존 ${window.globalSystemManager.sceneName} 매니저 정리 후 ${sceneName} 매니저 설정`);
            window.globalSystemManager.cleanup();
        }
        
        // 전역 참조 설정
        window.globalSystemManager = this;
        
        // 전역 시스템 인스턴스들
        this.globalUI = null;
        this.globalDialogue = null;
        this.globalInventory = null;
        this.globalCamera = null;
        
        // 전역 함수들
        this.globalFunctions = {};
    }

    /**
     * 모든 전역 시스템 초기화
     */
    initialize() {
        console.log(`🚀 ${this.sceneName} 씬 전역 시스템 초기화 시작`);
        
        // 1. 전역 UI 시스템 초기화
        this.globalUI = setupGlobalUI(this.k, this.gameState, this.globalState);
        
        // 2. 전역 대화 시스템 초기화 (씬별 대화 데이터 포함)
        this.globalDialogue = setupGlobalDialogue(this.k, this.gameState, this.sceneDialogues);
        
        // 3. 전역 인벤토리 시스템 초기화
        this.globalInventory = setupInventorySystem(this.k, this.gameState, this.globalState);
        
        // 4. 전역 카메라 시스템 초기화
        this.globalCamera = setupGlobalCamera(this.k, this.entities, this.mapBounds);
        this.globalCamera.initialize();
        
        // 5. 전역 자동저장 함수 설정
        this.setupAutoSave();
        
        // 6. 전역 퀘스트 함수들 설정
        this.setupQuestFunctions();
        
        // 7. 전역 상태 변화 알림 함수 설정
        this.setupStatusChangeFunctions();

        // 8. 전역 키보드 컨트롤 설정
        this.setupGlobalKeyboardControls();

        // 9. 전역 충돌 이벤트 설정
        this.setupCollisions();
        
        console.log(`✅ ${this.sceneName} 씬 전역 시스템 초기화 완료`);
    }

    /**
     * 전역 자동저장 함수 설정
     */
    setupAutoSave() {
        // 자동저장 함수 설정
        this.globalFunctions.performAutoSave = () => {
            if (window.autoSaveManager) {
                console.log(`💾 ${this.sceneName} 씬 자동저장 실행`);
                window.autoSaveManager.saveNow(this.entities, this.sceneName);
            } else {
                console.warn(`⚠️ ${this.sceneName} 씬: window.autoSaveManager가 없습니다`);
            }
        };
        
        // 즉시 자동저장 함수 (필요시 수동 호출)
        this.globalFunctions.saveNow = () => {
            if (window.autoSaveManager) {
                console.log(`💾 ${this.sceneName} 씬 즉시 자동저장 실행`);
                window.autoSaveManager.saveNow(this.entities, this.sceneName);
            } else {
                console.warn(`⚠️ ${this.sceneName} 씬: window.autoSaveManager가 없습니다`);
            }
        };
        
        // 주기적 자동저장 설정 (30초마다)
        this.setupPeriodicAutoSave();
        
        // 전역으로 노출
        window.performAutoSave = this.globalFunctions.performAutoSave;
        window.saveNow = this.globalFunctions.saveNow;
        
        console.log(`✅ ${this.sceneName} 씬 자동저장 시스템 설정 완료`);
    }

    /**
     * 주기적 자동저장 설정
     */
    setupPeriodicAutoSave() {
        // 30초마다 자동저장
        this.autoSaveInterval = setInterval(() => {
            if (window.autoSaveManager) {
                console.log(`⏰ ${this.sceneName} 씬 주기적 자동저장 실행`);
                window.autoSaveManager.saveNow(this.entities, this.sceneName);
            }
        }, 30000); // 30초
        
        console.log(`⏰ ${this.sceneName} 씬 주기적 자동저장 설정 완료 (30초 간격)`);
    }

    /**
     * 전역 퀘스트 함수들 설정
     */
    setupQuestFunctions() {
        // 퀘스트 완료 알림
        this.globalFunctions.showQuestCompletionMessage = (questTitle) => {
            if (window.notificationManager) {
                window.notificationManager.addNotification({
                    type: 'quest-completion',
                    message: `퀘스트 완료: ${questTitle}`,
                    questTitle: questTitle
                });
            }
        };
        

        
        // 전역으로 노출
        window.showQuestCompletionMessage = this.globalFunctions.showQuestCompletionMessage;
    }

    /**
     * 전역 키보드 컨트롤 설정
     */
    setupGlobalKeyboardControls() {
        console.log(`⌨️ ${this.sceneName} 씬 전역 키보드 컨트롤 설정 시작`);
        
        // 음소거 상태 추적
        let isMuteLocked = { value: false };
        
        // M키 - 음소거 토글 (한글/영문 모두 지원)
        this.k.onKeyPress("m", () => {
            console.log("🔇 M키로 음소거 토글");
            toggleMute(this.k, this.gameState, isMuteLocked);
        });
        
        this.k.onKeyPress("ㅡ", () => {
            console.log("🔇 ㅡ키로 음소거 토글");
            toggleMute(this.k, this.gameState, isMuteLocked);
        });
        
        // L키 - 설정창 열기 (한글/영문 모두 지원)
        this.k.onKeyPress("l", () => {
            console.log("🔧 L키로 설정창 열기");
            if (this.globalUI) {
                this.globalUI.openSettingsPopup();
            } else {
                console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
            }
        });

        this.k.onKeyPress("ㅣ", () => {
            console.log("🔧 ㅣ키로 설정창 열기");
            if (this.globalUI) {
                this.globalUI.openSettingsPopup();
            } else {
                console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
            }
        });

        // R키 - 퀘스트창 열기 (한글/영문 모두 지원)
        this.k.onKeyPress("r", () => {
            console.log("📋 R키로 퀘스트창 열기");
            if (this.globalUI) {
                if (this.globalUI.questState && this.globalUI.questState.isPopupOpen) {
                    this.globalUI.closeQuestPopup();
                } else {
                    this.globalUI.openQuestPopup();
                }
            } else {
                console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
            }
        });

        this.k.onKeyPress("ㄱ", () => {
            console.log("📋 ㄱ키로 퀘스트창 열기");
            if (this.globalUI) {
                if (this.globalUI.questState && this.globalUI.questState.isPopupOpen) {
                    this.globalUI.closeQuestPopup();
                } else {
                    this.globalUI.openQuestPopup();
                }
            } else {
                console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
            }
        });

        // I키 - 인벤토리 열기 (한글/영문 모두 지원)
        this.k.onKeyPress("i", () => {
            console.log("🎒 I키로 인벤토리 열기");
            if (this.globalInventory) {
                this.globalInventory.toggle();
            } else {
                console.warn("⚠️ 인벤토리 시스템이 아직 초기화되지 않음");
            }
        });

        this.k.onKeyPress("ㅑ", () => {
            console.log("🎒 ㅑ키로 인벤토리 열기");
            if (this.globalInventory) {
                this.globalInventory.toggle();
            } else {
                console.warn("⚠️ 인벤토리 시스템이 아직 초기화되지 않음");
            }
        });

        // 스페이스 키 - 상호작용
        this.k.onKeyPress("space", () => {
            console.log("🎯 스페이스 키로 상호작용");
            this.handleInteraction();
        });
        
        console.log(`✅ ${this.sceneName} 씬 전역 키보드 컨트롤 설정 완료`);
    }

    /**
     * 스페이스키 상호작용 처리
     * @returns {boolean} 상호작용이 처리되었는지 여부
     */
    handleInteraction() {
        // 🔑 핵심: 대화가 이미 진행 중이면 상호작용 차단
        if (this.globalDialogue && this.globalDialogue.isDialogueActive()) {
            console.log("🚫 대화 진행 중이므로 새로운 상호작용 차단");
            return false;
        }

        const interactableObject = this.gameState.getInteractableObject();
        console.log("🎯 상호작용 시도:", interactableObject);
        
        if (interactableObject && interactableObject.entity) {
            console.log(`🎯 상호작용 실행: ${interactableObject.type} - ${interactableObject.data.speakerName}`);
            console.log("🎯 대화 내용:", interactableObject.data.content);
            
            // 전역 대화 시스템으로 대화 표시
            if (this.globalDialogue) {
                console.log(`🔥 [CRITICAL] showDialogue 호출 - onInteractionComplete:`, {
                    hasCallback: !!interactableObject.data.onInteractionComplete,
                    callbackType: typeof interactableObject.data.onInteractionComplete
                });
                
                // onInteractionComplete 콜백을 두 번째 파라미터로 전달
                this.globalDialogue.showDialogue(
                    interactableObject.data, 
                    interactableObject.data.onInteractionComplete
                );
                return true; // 상호작용 처리됨
            } else {
                console.warn("⚠️ 전역 대화 시스템이 초기화되지 않음");
                return false;
            }
        } else {
            console.log("🎯 상호작용할 객체가 없습니다.");
            return false; // 상호작용 처리되지 않음
        }
    }

    /**
     * 전역 충돌 이벤트 설정
     */
    setupCollisions() {
        if (this.sceneName === 'restroom' || this.sceneName === 'second') {
            console.log(`🎯 ${this.sceneName} 씬에서는 직접 대화 처리하므로 전역 충돌 설정을 건너뜁니다.`);
            return;
        }

        console.log(`💥 ${this.sceneName} 씬 전역 충돌 설정 시작`);

        this.k.get("student", { recursive: true }).forEach((student) => {
            // 학생의 구체적인 타입 확인 (student13, student1 등)
            const studentType = student.studentType || "student";
            console.log(`🎓 학생 충돌 설정: ${studentType}`, student);
            
            this.globalDialogue.setupPlayerCollision(student, studentType, {
                // ... dialogue data
            });
        });

        this.k.get("npc", { recursive: true }).forEach((npc) => {
            this.globalDialogue.setupPlayerCollision(npc, "npc", {
                // ... dialogue data
            });
        });

        // object 태그를 가진 엔티티 중에서 특별한 처리가 필요한 것들은 제외
        this.k.get("object", { recursive: true }).forEach((object) => {
            // non-interactive 태그를 가진 객체는 제외 (벽 콜라이더 등)
            if (object.hasTag && object.hasTag("non-interactive")) {
                console.log(`🚫 non-interactive 객체는 전역 대화 설정에서 제외`);
                return;
            }
            
            // wall 태그를 가진 객체는 제외 (벽 콜라이더)
            if (object.hasTag && object.hasTag("wall")) {
                console.log(`🧱 wall 객체는 전역 대화 설정에서 제외`);
                return;
            }
            
            // interactive-object 태그를 가진 객체는 제외 (이미 씬에서 상호작용 설정됨)
            if (object.hasTag && object.hasTag("interactive-object")) {
                console.log(`🎯 interactive-object는 이미 씬에서 설정됨 - 전역 대화 설정에서 제외`);
                return;
            }
            
            // 이름이 없는 객체는 제외
            if (!object.objectType && !object.name) {
                console.log(`🚫 이름없는 객체는 전역 대화 설정에서 제외`);
                return;
            }
            
            // ball 오브젝트는 킥 기능이 있으므로 제외
            if (object.objectType === "ball") {
                console.log(`⚽ ball 오브젝트는 킥 기능이 있으므로 전역 대화 설정에서 제외`);
                return;
            }
            
            // 기타 일반 오브젝트는 전역 대화 적용 (game 포함)
            this.globalDialogue.setupPlayerCollision(object, "object", {
                // ... dialogue data
            });
        });
    }

    /**
     * 전역 상태 변화 알림 함수 설정
     */
    setupStatusChangeFunctions() {
        this.globalFunctions.showStatusChangeMessage = (message, statusType, changeType) => {
            console.log(`📋 상태 변화 알림 요청: ${message} (${statusType}, ${changeType})`);
            
            if (window.notificationManager) {
                window.notificationManager.addNotification({
                    type: 'status',
                    message: message,
                    statusType: statusType,
                    changeType: changeType
                });
                console.log(`✅ 알림 표시 완료: ${message}`);
            } else {
                console.warn(`⚠️ notificationManager가 초기화되지 않음 - 메시지: ${message}`);
                // 초기화 대기 후 재시도
                setTimeout(() => {
                    if (window.notificationManager) {
                        window.notificationManager.addNotification({
                            type: 'status',
                            message: message,
                            statusType: statusType,
                            changeType: changeType
                        });
                        console.log(`✅ 지연 알림 표시 완료: ${message}`);
                    } else {
                        console.error(`❌ 알림 표시 실패 (재시도 후에도 실패): ${message}`);
                    }
                }, 100); // 100ms 후 재시도
            }
        };
        
        // 전역으로 노출
        window.showStatusChangeMessage = this.globalFunctions.showStatusChangeMessage;
    }

    /**
     * 씬별 특수 설정 (필요시 오버라이드)
     */
    setupSceneSpecificFeatures() {
        // 기본 구현 - 씬별로 필요시 오버라이드
        console.log(`🎯 ${this.sceneName} 씬 특수 기능 설정 (기본값)`);
    }

    /**
     * 모든 전역 시스템 정리
     */
    cleanup() {
        console.log(`🧹 ${this.sceneName} 씬 전역 시스템 정리 시작`);
        
        try {
            // 주기적 자동저장 인터벌 정리
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                console.log(`⏰ ${this.sceneName} 씬 주기적 자동저장 인터벌 정리 완료`);
            }
            
            // 마지막 자동 저장 수행
            console.log("💾 씬 종료 전 마지막 저장 수행");
            if (window.autoSaveManager) {
                window.autoSaveManager.saveNow(this.entities, this.sceneName);
            }
            
            // 전역 UI 정리
            if (this.globalUI && this.globalUI.cleanup) {
                this.globalUI.cleanup();
            }
            
            // 전역 대화 정리
            if (this.globalDialogue && this.globalDialogue.cleanup) {
                this.globalDialogue.cleanup();
            }
            
            // 전역 인벤토리 정리
            if (this.globalInventory && this.globalInventory.cleanup) {
                this.globalInventory.cleanup();
            }
            
            // 전역 함수들 정리
            Object.keys(this.globalFunctions).forEach(key => {
                if (window[key]) {
                    delete window[key];
                }
            });
            
            console.log(`✅ ${this.sceneName} 씬 전역 시스템 정리 완료`);
        } catch (error) {
            console.warn(`⚠️ ${this.sceneName} 씬 전역 시스템 정리 중 오류:`, error);
        }
    }

    /**
     * 전역 시스템 상태 확인
     */
    getStatus() {
        return {
            sceneName: this.sceneName,
            globalUI: !!this.globalUI,
            globalDialogue: !!this.globalDialogue,
            globalInventory: !!this.globalInventory,
            autoSaveFunction: !!this.globalFunctions.performAutoSave,
            questFunctions: !!this.globalFunctions.showQuestCompletionMessage,
            statusFunctions: !!this.globalFunctions.showStatusChangeMessage
        };
    }
}

/**
 * 전역 시스템 매니저 인스턴스 생성 함수
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} gameState - 게임 상태
 * @param {Object} globalState - 전역 상태
 * @param {Object} entities - 엔티티 저장소
 * @param {string} sceneName - 씬 이름
 * @param {Object} sceneDialogues - 씬별 대화 데이터 (선택사항)
 * @param {Object} mapBounds - 씬별 맵 경계 (선택사항)
 * @returns {GlobalSystemManager} 전역 시스템 매니저 인스턴스
 */
export function setupGlobalSystemManager(k, gameState, globalState, entities, sceneName, sceneDialogues = null, mapBounds = null) {
    const manager = new GlobalSystemManager(k, gameState, globalState, entities, sceneName, sceneDialogues, mapBounds);
    
    // 전역 접근을 위해 window 객체에 할당
    window.globalSystemManager = manager;
    
    return manager;
}
