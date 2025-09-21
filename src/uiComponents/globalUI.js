// 전역 UI 시스템 - front.js의 완전한 UI를 모든 씬에서 사용 가능하게 모듈화
import { createPanelWithHeader, UI_THEMES } from "./nineSlicePanel.js";
import { gameDataManager } from "../systems/gameDataManager.js";
import { initializeQuests, completeQuest, getQuestSaveData, addQuest4OnLetter3Read } from "../content/questData.js";
import NotificationManager from "../systems/notificationManager.js";
import { SAFE_AREA, UI_POSITIONS, UI_SIZES } from "./uiConstants.js";

/**
 * 전역 UI 매니저 클래스
 * front.js의 모든 UI 기능을 포함하여 다른 씬에서도 동일하게 사용 가능
 */
export class GlobalUIManager {
    constructor(k, gameState, globalState) {
        this.k = k;
        this.gameState = gameState;
        this.globalState = globalState;
        
        // globalState 유효성 검사
        if (!this.globalState) {
            console.error("❌ GlobalUIManager: globalState가 전달되지 않았습니다!");
            throw new Error("GlobalUIManager requires globalState");
        }
        
        if (typeof this.globalState.getMood !== 'function' || typeof this.globalState.getHealth !== 'function') {
            console.error("❌ GlobalUIManager: globalState에 필요한 메서드가 없습니다!");
            console.error("사용 가능한 메서드:", Object.getOwnPropertyNames(this.globalState));
            throw new Error("GlobalUIManager requires valid globalState with getMood() and getHealth() methods");
        }
        
        // UI 상태 관리
        this.questState = {
            hasNewQuests: true,
            isPopupOpen: false,
        };
        
        this.settingsState = {
            isPopupOpen: false,
        };
        
        this.loadGameState = {
            isPopupOpen: false,
        };
        
        // UI 요소들
        this.questIcon = null;
        this.settingsIcon = null;
        this.questPopup = null;
        this.settingsPopup = null;
        this.loadGamePopup = null;
        
        // 알림 매니저 (전역 관리)
        this.notificationManager = new NotificationManager(k);
        
        // 상태바 UI 요소들 (전역 관리)
        this.statusBarContainer = null;
        this.heartIcon = null;
        this.hpIcon = null;
        this.heartBar = null;
        this.hpBar = null;
        
        // 퀘스트 데이터 (front.js와 동일)
        this.questItems = [];
        this.initializeQuestData();
        
        // 정리 함수들을 저장할 배열
        this.cleanupFunctions = [];
    }
    
    /**
     * 상태바 UI 시스템 초기화
     */
    initializeStatusBar() {
        console.log("🎮 전역 상태바 UI 시스템 초기화 시작");
        
        // 상태바 컨테이너 생성
        this.statusBarContainer = this.k.add([
            this.k.pos(UI_POSITIONS.STATUS_BAR.X, UI_POSITIONS.STATUS_BAR.Y),
            this.k.fixed(), // 카메라 이동에 영향받지 않음
            this.k.z(UI_SIZES.Z_INDEX.STATUS_BAR),
            "statusBar"
        ]);

        console.log("📊 전역 statusBarContainer 생성 완료");

        // Heart 아이콘 (첫 번째 줄 왼쪽)
        this.heartIcon = this.statusBarContainer.add([
            this.k.sprite("ui-icon", { frame: 0 }), // 첫 번째 아이콘 (heart)
            this.k.pos(0, 0),
            this.k.scale(2),
            this.k.z(1),
            "heartIcon"
        ]);

        // HP 아이콘 (두 번째 줄 왼쪽)
        this.hpIcon = this.statusBarContainer.add([
            this.k.sprite("ui-icon", { frame: 1 }), // 두 번째 아이콘 (hp)
            this.k.pos(0, 32), // heart 아이콘 아래
            this.k.scale(2),
            this.k.z(1),
            "hpIcon"
        ]);

        // Heart Bar (첫 번째 줄 오른쪽)
        this.heartBar = this.statusBarContainer.add([
            this.k.sprite("ui-heart-bar", { frame: 0 }), // 기본 프레임
            this.k.pos(40, 0), // heart 아이콘 오른쪽
            this.k.scale(2),
            this.k.z(1),
            "heartBar"
        ]);

        // HP Bar (두 번째 줄 오른쪽)
        this.hpBar = this.statusBarContainer.add([
            this.k.sprite("ui-hp-bar", { frame: 0 }), // 기본 프레임
            this.k.pos(40, 32), // hp 아이콘 오른쪽
            this.k.scale(2),
            this.k.z(1),
            "hpBar"
        ]);

        console.log("✅ 전역 상태바 UI 시스템 초기화 완료");

        // 초기 상태바 업데이트
        this.updateStatusBars();
        
        // 매 프레임마다 상태바 업데이트
        this.k.onUpdate(() => {
            this.updateStatusBars();
        });
    }
    
    /**
     * 상태바 업데이트 함수
     */
    updateStatusBars() {
        if (!this.statusBarContainer || !this.statusBarContainer.exists()) {
            return;
        }

        // globalState 유효성 재검사
        if (!this.globalState || typeof this.globalState.getMood !== 'function') {
            console.warn("⚠️ updateStatusBars: globalState가 유효하지 않습니다. 기본값 사용.");
            return;
        }

        const currentMood = this.globalState.getMood(); // globalState 사용
        const currentHealth = this.globalState.getHealth(); // globalState 사용
        
        // Heart Bar 업데이트 (기분) - 0~9 범위에 맞게 수정
        if (this.heartBar && this.heartBar.exists()) {
            const moodFrame = Math.max(0, Math.min(8, 8 - Math.floor(currentMood * 8 / 9)));
            this.heartBar.frame = moodFrame;
        }
        
        // HP Bar 업데이트 (체력) - 0~9 범위에 맞게 수정  
        if (this.hpBar && this.hpBar.exists()) {
            const healthFrame = Math.max(0, Math.min(8, 8 - Math.floor(currentHealth * 8 / 9)));
            this.hpBar.frame = healthFrame;
        }
    }
    
    /**
     * 퀘스트 데이터 초기화 (front.js와 동일)
     */
    initializeQuestData() {
        const playerName = this.gameState.playerName;
        let savedQuestData = null;
        
        if (playerName && playerName.trim() !== "" && playerName !== "플레이어") {
            const existingSaves = gameDataManager.getSaveList();
            const playerSave = existingSaves.find(save => save.playerName === playerName);
            
            if (playerSave && playerSave.questState && playerSave.questState.questItems) {
                savedQuestData = playerSave.questState.questItems;
                console.log("🎯 저장된 퀘스트 데이터 발견:", savedQuestData);
            }
        }
        
        // questData.js의 initializeQuests 함수 사용
        this.questItems = initializeQuests(savedQuestData);
        
        // 전역 접근을 위해 window 객체에도 할당
        window.questItems = this.questItems;
    }
    
    /**
     * UI 초기화 - 아이콘들과 이벤트 핸들러 설정
     */
    initialize() {
        this.initializeStatusBar(); // 상태바 먼저 초기화
        this.createQuestIcon();
        this.createSettingsIcon();
        this.setupEventHandlers();
        this.updateQuestIcon();
        
        // 전역 접근을 위해 window 객체에 할당
        window.notificationManager = this.notificationManager;
        
        console.log("🎮 전역 UI 시스템 초기화 완료");
    }
    
    /**
     * 퀘스트 아이콘 생성 (front.js와 동일)
     */
    createQuestIcon() {
        this.questIcon = this.k.add([
            this.k.sprite("front-assets", {
                frame: 5771, // 기본 열린편지로 시작
            }),
            this.k.pos(this.k.width() - 120 - SAFE_AREA.RIGHT, UI_POSITIONS.ICONS.QUEST.Y), // 전역 상수 사용
            this.k.scale(UI_SIZES.ICON_SCALE),
            this.k.z(UI_SIZES.Z_INDEX.ICONS),
            this.k.area(),
            this.k.fixed(),
            "global-quest-icon",
        ]);
        
        // 호버 효과
        this.questIcon.onHover(() => {
            this.questIcon.scale = this.k.vec2(2.2, 2.2);
        });

        this.questIcon.onHoverEnd(() => {
            this.questIcon.scale = this.k.vec2(2, 2);
        });
        
        // 클릭 이벤트
        this.questIcon.onClick(() => {
            console.log("[DEBUG] 전역 퀘스트 아이콘 클릭됨 - 현재 팝업 상태:", this.questState.isPopupOpen);
            if (!this.gameState.getIsMuted()) this.k.play("boop-sfx", { volume: 0.6 });
            
            if (this.questState.isPopupOpen) {
                console.log("[DEBUG] 퀘스트 팝업 닫기 호출");
                this.closeQuestPopup();
            } else {
                console.log("[DEBUG] 퀘스트 팝업 열기 호출");
                this.openQuestPopup();
            }
        });
    }
    
    /**
     * 설정 아이콘 생성 (front.js와 동일)
     */
    createSettingsIcon() {
        this.settingsIcon = this.k.add([
            this.k.sprite("front-assets", {
                frame: 5772, // 설정 아이콘
            }),
            this.k.pos(this.k.width() - 60 - SAFE_AREA.RIGHT, UI_POSITIONS.ICONS.SETTINGS.Y), // 전역 상수 사용
            this.k.scale(UI_SIZES.ICON_SCALE),
            this.k.z(UI_SIZES.Z_INDEX.ICONS),
            this.k.area(),
            this.k.fixed(),
            "global-settings-icon",
        ]);
        
        // 호버 효과
        this.settingsIcon.onHover(() => {
            this.settingsIcon.scale = this.k.vec2(2.2, 2.2);
        });

        this.settingsIcon.onHoverEnd(() => {
            this.settingsIcon.scale = this.k.vec2(2, 2);
        });
        
        // 클릭 이벤트
        this.settingsIcon.onClick(() => {
            console.log("[DEBUG] 전역 설정 아이콘 클릭됨");
            if (!this.gameState.getIsMuted()) this.k.play("boop-sfx", { volume: 0.6 });
            
            if (this.settingsState.isPopupOpen) {
                this.closeSettingsPopup();
            } else {
                this.openSettingsPopup();
            }
        });
    }
    
    /**
     * 이벤트 핸들러 설정
     */
    setupEventHandlers() {
        // ESC 키로 팝업 닫기
        const escapeHandler = () => {
            if (this.settingsState.isPopupOpen) {
                this.closeSettingsPopup();
            }
            if (this.questState.isPopupOpen) {
                this.closeQuestPopup();
            }
        };

        this.k.onKeyPress("escape", escapeHandler);
        this.cleanupFunctions.push(() => {
            // ESC 핸들러는 kaboom에서 자동으로 정리됨
        });

        // 화면 크기 변경 시 아이콘 위치 업데이트 (전역 상수 사용)
        const resizeHandler = () => {
            if (this.questIcon && this.questIcon.exists()) {
                this.questIcon.pos = this.k.vec2(this.k.width() - 120 - SAFE_AREA.RIGHT, UI_POSITIONS.ICONS.QUEST.Y);
            }
            if (this.settingsIcon && this.settingsIcon.exists()) {
                this.settingsIcon.pos = this.k.vec2(this.k.width() - 60 - SAFE_AREA.RIGHT, UI_POSITIONS.ICONS.SETTINGS.Y);
            }
        };

        this.k.onResize(resizeHandler);
        this.cleanupFunctions.push(() => {
            // Resize 핸들러는 kaboom에서 자동으로 정리됨
        });
    }
    
    /**
     * 퀘스트 아이콘 상태 업데이트 (front.js와 동일)
     */
    updateQuestIcon() {
        // 퀘스트 항목들 중에 미완료된 것이 있는지 확인
        const currentQuestItems = window.questItems || this.questItems;
        const hasIncompleteQuests = currentQuestItems && currentQuestItems.some(item => !item.completed);
        
        if (hasIncompleteQuests) {
            this.questIcon.frame = 5771; // 열린편지 (미완료 퀘스트 있음)
            this.questState.hasNewQuests = true;
        } else {
            this.questIcon.frame = 5770; // 닫힌편지 (모든 퀘스트 완료)
            this.questState.hasNewQuests = false;
        }
    }
    
    /**
     * 퀘스트 팝업 열기 (front.js와 완전 동일)
     */
    openQuestPopup() {
        console.log("[DEBUG] 전역 퀘스트 팝업 열기 시작 - 현재 상태:", this.questState.isPopupOpen);
        if (this.questState.isPopupOpen) {
            console.log("[DEBUG] 이미 퀘스트 팝업이 열려있음, 함수 종료");
            return;
        }

        console.log("[DEBUG] 퀘스트 팝업 상태를 true로 변경");
        this.questState.isPopupOpen = true;

        // 퀘스트 창 개선된 디자인 적용 (퀘스트 전용 상수 사용)
        const panelWidth = this.k.width() * UI_POSITIONS.QUEST_POPUP.WIDTH;
        const panelHeight = this.k.height() * UI_POSITIONS.QUEST_POPUP.HEIGHT;
        const panelX = (this.k.width() - panelWidth) / 2; // 화면 중앙 (가로)
        const panelY = (this.k.height() - panelHeight) / 2; // 화면 중앙 (세로)
        
        // 파스텔 블루 테마로 패널 생성
        const panel = createPanelWithHeader(this.k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30,
            colors: UI_THEMES.PASTEL_BLUE,
            zIndex: 150,
            tag: "global-quest-popup",
            fixed: true
        });

        this.questPopup = panel.mainBg;

        // 팝업 제목
        const title = this.k.add([
            this.k.text("오늘의 할일", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2),
            this.k.color(80, 80, 80),
            this.k.anchor("left"),
            this.k.z(152),
            this.k.fixed(),
            "global-quest-popup-element",
        ]);

        // X 버튼 생성
        const questCloseButtonBg = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.color(120, 140, 180),
            this.k.z(161),
            this.k.fixed(),
            "global-quest-popup-element",
        ]);

        const questCloseButtonText = this.k.add([
            this.k.text("✕", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 16, panel.headerArea.y + 17),
            this.k.color(255, 255, 255),
            this.k.anchor("center"),
            this.k.z(162),
            this.k.fixed(),
            "global-quest-popup-element",
        ]);

        const questCloseButtonArea = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.area(),
            this.k.opacity(0),
            this.k.z(163),
            this.k.fixed(),
            "global-quest-popup-element",
        ]);

        // X 버튼 이벤트 핸들러
        questCloseButtonArea.onHover(() => {
            questCloseButtonBg.color = this.k.rgb(140, 160, 200);
        });

        questCloseButtonArea.onHoverEnd(() => {
            questCloseButtonBg.color = this.k.rgb(120, 140, 180);
        });

        questCloseButtonArea.onClick(() => {
            console.log("[DEBUG] 전역 퀘스트 X 버튼 클릭됨");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.4 });
            }
            this.closeQuestPopup();
        });

        // 퀘스트 항목들을 체크박스 형태로 렌더링 (front.js와 동일)
        const questItemElements = [];
        const currentQuestItems = window.questItems || this.questItems;
        currentQuestItems.forEach((item, index) => {
            const yPos = panel.contentArea.y + 30 + (index * 50);
            
            // 체크박스
            const checkbox = this.k.add([
                this.k.rect(16, 16),
                this.k.pos(panel.contentArea.x, yPos),
                this.k.color(item.completed ? [126, 155, 204] : [200, 200, 200]),
                this.k.outline(2, this.k.rgb(80, 80, 80)),
                this.k.z(152),
                this.k.fixed(),
                "global-quest-popup-element",
            ]);
            
            // 체크 표시 (완료된 경우)
            if (item.completed) {
                const checkMark = this.k.add([
                    this.k.text("✓", {
                        size: 14,
                        font: "galmuri",
                    }),
                    this.k.pos(panel.contentArea.x + 8, yPos + 8),
                    this.k.color(255, 255, 255),
                    this.k.anchor("center"),
                    this.k.z(153),
                    this.k.fixed(),
                    "global-quest-popup-element",
                ]);
            }
            
            // 퀘스트 제목 (완료시 취소선)
            const questTitle = this.k.add([
                this.k.text(item.title, {
                    size: 18,
                    font: "galmuri",
                }),
                this.k.pos(panel.contentArea.x + 24, yPos + 8),
                this.k.color(item.completed ? [150, 150, 150] : [80, 80, 80]),
                this.k.anchor("left"),
                this.k.z(152),
                this.k.fixed(),
                "global-quest-popup-element",
            ]);
            
            // 완료된 퀘스트에 취소선 추가
            if (item.completed) {
                const strikethrough = this.k.add([
                    this.k.rect(questTitle.width, 2),
                    this.k.pos(panel.contentArea.x + 24, yPos + 8 + 9),
                    this.k.color(150, 150, 150),
                    this.k.z(153),
                    this.k.fixed(),
                    "global-quest-popup-element",
                ]);
            }
            
            questItemElements.push({ checkbox, questTitle, item, index });
        });

        // 체크박스 클릭 이벤트 (완료 상태 토글) - front.js와 동일
        questItemElements.forEach((element, index) => {
            const yPos = panel.contentArea.y + 30 + (index * 50);
            
            const checkboxClickArea = this.k.add([
                this.k.rect(20, 20),
                this.k.pos(panel.contentArea.x - 2, yPos - 2),
                this.k.area(),
                this.k.opacity(0),
                this.k.z(154),
                this.k.fixed(),
                "global-quest-checkbox-clickable",
                "global-quest-popup-element",
            ]);
            
            checkboxClickArea.onClick(() => {
                console.log(`[DEBUG] 전역 퀘스트 ${index} 완료 상태 토글`);
                const currentQuestItems = window.questItems || this.questItems;
                currentQuestItems[index].completed = !currentQuestItems[index].completed;
                
                try {
                    this.k.play("confirm-beep-sfx", { volume: 0.4 });
                } catch (error) {
                    console.warn("사운드 재생 실패:", error);
                }
                
                // 체크박스 색상 즉시 업데이트
                element.checkbox.color = currentQuestItems[index].completed ? 
                    this.k.rgb(126, 155, 204) : this.k.rgb(200, 200, 200);
                    
                // 퀘스트 아이콘 상태 업데이트
                this.updateQuestIcon();
            });
        });
        
        // 퀘스트 아이콘 상태 업데이트
        this.updateQuestIcon();
    }
    
    /**
     * 퀘스트 팝업 닫기 (front.js와 동일)
     */
    closeQuestPopup() {
        if (!this.questState.isPopupOpen) return;

        console.log("[DEBUG] 전역 퀘스트 팝업 닫기 시작");
        this.questState.isPopupOpen = false;

        try {
            // 태그별로 모든 요소 제거
            this.k.destroyAll("global-quest-popup");
            this.k.destroyAll("global-quest-popup-element");
            this.k.destroyAll("global-quest-checkbox-clickable");
            this.k.destroyAll("global-quest-title-clickable");
            this.k.destroyAll("global-quest-checkmark");
            this.k.destroyAll("global-quest-strikethrough");
            
            console.log("[DEBUG] 전역 퀘스트 팝업 요소 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 전역 퀘스트 팝업 정리 중 오류:", error);
        }
        
        // 변수들 null로 설정
        this.questPopup = null;
    }
    
    /**
     * 설정 팝업 열기 (front.js와 완전 동일)
     */
    openSettingsPopup() {
        if (this.settingsState.isPopupOpen) return;

        try {
            // 사운드 효과
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.6 });
            }
        } catch (error) {
            console.warn("[DEBUG] 사운드 재생 실패:", error);
        }

        this.settingsState.isPopupOpen = true;

        const panelWidth = this.k.width() * 0.7;
        const panelHeight = this.k.height() * 0.6;
        const panelX = (this.k.width() - panelWidth) / 2;
        const panelY = (this.k.height() - panelHeight) / 2;

        // 설정 패널 생성
        const panel = createPanelWithHeader(this.k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30,
            colors: UI_THEMES.PASTEL_PURPLE,
            zIndex: 160,
            tag: "global-settings-popup",
            fixed: true
        });

        this.settingsPopup = panel.mainBg;

        // 설정 제목
        const title = this.k.add([
            this.k.text("게임 설정", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2),
            this.k.color(80, 80, 80),
            this.k.anchor("left"),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // X 버튼 생성
        const closeButtonBg = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.color(75, 0, 130),
            this.k.z(171),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const closeButtonText = this.k.add([
            this.k.text("✕", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 16, panel.headerArea.y + 17),
            this.k.color(255, 255, 255),
            this.k.anchor("center"),
            this.k.z(172),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const closeButtonArea = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.area(),
            this.k.opacity(0),
            this.k.z(173),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // X 버튼 이벤트 핸들러
        closeButtonArea.onHover(() => {
            closeButtonBg.color = this.k.rgb(95, 20, 150);
        });

        closeButtonArea.onHoverEnd(() => {
            closeButtonBg.color = this.k.rgb(75, 0, 130);
        });

        closeButtonArea.onClick(() => {
            console.log("[DEBUG] 전역 설정 X 버튼 클릭됨");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.4 });
            }
            this.closeSettingsPopup();
        });

        // 설정 항목들 (front.js와 동일한 구조로 단순화)
        const settingY = panel.contentArea.y + 20;
        const itemSpacing = 50;

        // 음소거 설정
        const muteLabel = this.k.add([
            this.k.text("음소거", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + 20, settingY),
            this.k.color(80, 80, 80),
            this.k.anchor("left"),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const muteToggle = this.k.add([
            this.k.rect(60, 30),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 80, settingY - 5),
            this.k.color(this.gameState.getIsMuted() ? [200, 100, 100] : [100, 200, 100]),
            this.k.area(),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const muteText = this.k.add([
            this.k.text(this.gameState.getIsMuted() ? "OFF" : "ON", {
                size: 14,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 50, settingY + 10),
            this.k.color(255, 255, 255),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        muteToggle.onClick(() => {
            const newMuted = !this.gameState.getIsMuted();
            this.gameState.setIsMuted(newMuted);
            
            // 실제 오디오 볼륨 조절
            if (newMuted) {
                this.k.volume(0);
            } else {
                this.k.volume(this.gameState.getBgmVolume() || 1.0);
            }
            
            muteToggle.color = newMuted ? this.k.rgb(200, 100, 100) : this.k.rgb(100, 200, 100);
            muteText.text = newMuted ? "OFF" : "ON";
            
            if (!newMuted) {
                this.k.play("boop-sfx", { volume: 0.3 });
            }
            
            console.log(`[DEBUG] 음소거 상태 변경: ${newMuted ? "ON" : "OFF"}`);
        });

        // 언어 설정
        const langLabel = this.k.add([
            this.k.text("언어", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + 20, settingY + itemSpacing),
            this.k.color(80, 80, 80),
            this.k.anchor("left"),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const langToggle = this.k.add([
            this.k.rect(80, 30),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 100, settingY + itemSpacing - 5),
            this.k.color(175, 126, 204),
            this.k.area(),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const langText = this.k.add([
            this.k.text(this.gameState.getLocale() === "korean" ? "한국어" : "English", {
                size: 14,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 60, settingY + itemSpacing + 10),
            this.k.color(255, 255, 255),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        langToggle.onClick(() => {
            const currentLocale = this.gameState.getLocale();
            const newLocale = currentLocale === "korean" ? "english" : "korean";
            
            console.log(`[DEBUG] 언어 변경: ${currentLocale} -> ${newLocale}`);
            this.gameState.setLocale(newLocale);
            langText.text = newLocale === "korean" ? "한국어" : "English";
            
            // 언어 변경 시 설정창의 텍스트들도 업데이트
            title.text = newLocale === "korean" ? "게임 설정" : "Game Settings";
            muteLabel.text = newLocale === "korean" ? "음소거" : "Mute";
            langLabel.text = newLocale === "korean" ? "언어" : "Language";
            volumeLabel.text = newLocale === "korean" ? "볼륨" : "Volume";
            loadGameText.text = newLocale === "korean" ? "불러오기" : "Load Game";
            mainMenuText.text = newLocale === "korean" ? "메인화면으로" : "Main Menu";
            creditText.text = newLocale === "korean" ? "크레딧" : "Credits";
            
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.3 });
            }
        });

        // 볼륨 조절 설정 (front.js와 동일)
        const volumeLabel = this.k.add([
            this.k.text("볼륨", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + 20, settingY + itemSpacing * 2),
            this.k.color(80, 80, 80),
            this.k.anchor("left"),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 볼륨 슬라이더 배경
        const volumeSliderBg = this.k.add([
            this.k.rect(120, 12),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 + 4),
            this.k.color(200, 200, 200),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 볼륨 슬라이더 바
        const currentVolume = this.gameState.getBgmVolume() || 1.0;
        const volumeSliderBar = this.k.add([
            this.k.rect(120 * currentVolume, 12),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 + 4),
            this.k.color(175, 126, 204),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 볼륨 텍스트
        const volumeText = this.k.add([
            this.k.text(`${Math.round(currentVolume * 100)}%`, {
                size: 14,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 80, settingY + itemSpacing * 2 + 10),
            this.k.color(80, 80, 80),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 볼륨 조절 클릭 영역
        const volumeClickArea = this.k.add([
            this.k.rect(120, 24),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 140, settingY + itemSpacing * 2 - 6),
            this.k.area(),
            this.k.opacity(0),
            this.k.z(164),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        volumeClickArea.onClick(() => {
            const mouseX = this.k.mousePos().x;
            const clickX = mouseX - volumeClickArea.pos.x;
            const newVolume = Math.max(0, Math.min(1, clickX / 120));
            
            this.gameState.setBgmVolume(newVolume);
            if (!this.gameState.getIsMuted()) {
                this.k.volume(newVolume);
            }
            
            volumeSliderBar.width = 120 * newVolume;
            volumeText.text = `${Math.round(newVolume * 100)}%`;
            
            console.log(`[DEBUG] 볼륨 변경: ${Math.round(newVolume * 100)}%`);
            
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: newVolume * 0.3 });
            }
        });

        // 불러오기 버튼 (팝업 좌측 하단)
        const loadGameButton = this.k.add([
            this.k.rect(120, 35),
            this.k.pos(panel.contentArea.x + 20, panel.contentArea.y + panel.contentArea.height - 60),
            this.k.color(180, 180, 255),
            this.k.outline(2, this.k.rgb(120, 120, 220)),
            this.k.area(),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const loadGameText = this.k.add([
            this.k.text("불러오기", {
                size: 16,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + 80, panel.contentArea.y + panel.contentArea.height - 42),
            this.k.color(60, 60, 120),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 메인화면으로 나가기 버튼
        const mainMenuButton = this.k.add([
            this.k.rect(120, 35),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 250, panel.contentArea.y + panel.contentArea.height - 60),
            this.k.color(255, 180, 180),
            this.k.outline(2, this.k.rgb(220, 120, 120)),
            this.k.area(),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const mainMenuText = this.k.add([
            this.k.text("메인화면으로", {
                size: 16,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 190, panel.contentArea.y + panel.contentArea.height - 42),
            this.k.color(120, 60, 60),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        // 불러오기 버튼 이벤트
        loadGameButton.onClick(() => {
            console.log("[DEBUG] 불러오기 버튼 클릭됨");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.5 });
            }
            this.closeSettingsPopup();
            // 전역 이어하기 팝업 열기
            this.openLoadGamePopup();
        });

        loadGameButton.onHover(() => {
            loadGameButton.color = this.k.rgb(200, 200, 255);
        });

        loadGameButton.onHoverEnd(() => {
            loadGameButton.color = this.k.rgb(180, 180, 255);
        });

        mainMenuButton.onClick(() => {
            console.log("[DEBUG] 메인화면으로 이동");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.5 });
            }
            this.closeSettingsPopup();
            this.k.go("title");
        });

        mainMenuButton.onHover(() => {
            mainMenuButton.color = this.k.rgb(255, 200, 200);
        });

        mainMenuButton.onHoverEnd(() => {
            mainMenuButton.color = this.k.rgb(255, 180, 180);
        });

        // 크레딧 버튼
        const creditButton = this.k.add([
            this.k.rect(120, 35),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 120, panel.contentArea.y + panel.contentArea.height - 60),
            this.k.color(180, 255, 180),
            this.k.outline(2, this.k.rgb(120, 220, 120)),
            this.k.area(),
            this.k.z(162),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        const creditText = this.k.add([
            this.k.text("크레딧", {
                size: 16,
                font: "galmuri",
            }),
            this.k.pos(panel.contentArea.x + panel.contentArea.width - 60, panel.contentArea.y + panel.contentArea.height - 42),
            this.k.color(60, 120, 60),
            this.k.anchor("center"),
            this.k.z(163),
            this.k.fixed(),
            "global-settings-popup-element",
        ]);

        creditButton.onClick(() => {
            console.log("[DEBUG] 크레딧으로 이동");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.5 });
            }
            this.gameState.setPreviousScene("current"); // 현재 씬을 이전 씬으로 설정
            this.closeSettingsPopup();
            this.k.go("credits");
        });

        creditButton.onHover(() => {
            creditButton.color = this.k.rgb(200, 255, 200);
        });

        creditButton.onHoverEnd(() => {
            creditButton.color = this.k.rgb(180, 255, 180);
        });
    }
    
    /**
     * 설정 팝업 닫기 (front.js와 동일)
     */
    closeSettingsPopup() {
        if (!this.settingsState.isPopupOpen) return;

        console.log("[DEBUG] 전역 설정 팝업 닫기 시작");
        this.settingsState.isPopupOpen = false;

        try {
            // 모든 설정 팝업 요소 제거
            this.k.destroyAll("global-settings-popup");
            this.k.destroyAll("global-settings-popup-element");
            
            this.settingsPopup = null;
            
            console.log("[DEBUG] 전역 설정 팝업 요소 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 전역 설정 팝업 정리 중 오류:", error);
        }
    }
    
    /**
     * 이어하기 팝업 열기 (title.js 기반)
     */
    openLoadGamePopup() {
        if (this.loadGameState.isPopupOpen) return;
        
        console.log("🔍 전역 이어하기 팝업 열기");
        this.loadGameState.isPopupOpen = true;
        
        const saveList = gameDataManager.getSaveList();
        
        // 타일맵 씬에서 플레이어가 생성된 저장 데이터만 필터링
        const validScenes = ["front", "schoolfront", "first", "second", "restroom", "garage", "restaurant"];
        const validSaveList = saveList.filter(save => {
            return save.gameState && 
                   save.gameState.currentScene && 
                   validScenes.includes(save.gameState.currentScene) &&
                   save.gameState.playerPosition; // 플레이어 위치가 저장되어 있어야 함
        });
        
        console.log("🔍 저장된 게임 수:", saveList.length, "유효한 게임 수:", validSaveList.length);

        // 현재 언어 설정 가져오기
        const locale = this.gameState.getLocale();

        // 팝업 크기 (전역 상수 사용)
        const panelWidth = this.k.width() * UI_POSITIONS.POPUPS.WIDTH;
        const panelHeight = this.k.height() * UI_POSITIONS.POPUPS.HEIGHT;
        const panelX = this.k.width() * 0.1;
        const panelY = UI_POSITIONS.POPUPS.Y; // 전역 상수 사용
        
        // 파스텔 블루 테마로 패널 생성 (front.js와 완전 동일)
        const panel = createPanelWithHeader(this.k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30, // front.js와 동일
            colors: UI_THEMES.PASTEL_BLUE, // front.js와 동일한 테마
            zIndex: 150,
            tag: "global-load-popup-element",
            fixed: true
        });

        // 팝업 제목 (헤더 영역에 배치, front.js와 완전 동일)
        const title = this.k.add([
            this.k.text("게임 이어하기", {
                size: 20, // front.js와 동일한 크기
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2), // front.js와 동일한 위치
            this.k.color(80, 80, 80), // front.js와 동일한 색상 (파스텔 테마에 맞는 진한 회색)
            this.k.anchor("left"),
            this.k.z(155), // z-index를 조정
            this.k.fixed(),
            "global-load-popup-element",
        ]);

        // X 버튼 배경
        const closeButtonBg = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.color(75, 0, 130),
            this.k.z(171),
            this.k.fixed(),
            "global-load-popup-element",
        ]);

        const closeButtonText = this.k.add([
            this.k.text("✕", {
                size: 20,
                font: "galmuri",
            }),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 16, panel.headerArea.y + 17),
            this.k.color(255, 255, 255),
            this.k.anchor("center"),
            this.k.z(172),
            this.k.fixed(),
            "global-load-popup-element",
        ]);

        const closeButtonArea = this.k.add([
            this.k.rect(28, 28),
            this.k.pos(panel.headerArea.x + panel.headerArea.width - 30, panel.headerArea.y + 3),
            this.k.area(),
            this.k.opacity(0),
            this.k.z(173),
            this.k.fixed(),
            "global-load-popup-element",
        ]);

        // X 버튼 이벤트 핸들러
        closeButtonArea.onHover(() => {
            closeButtonBg.color = this.k.rgb(95, 20, 150);
        });

        closeButtonArea.onHoverEnd(() => {
            closeButtonBg.color = this.k.rgb(75, 0, 130);
        });

        closeButtonArea.onClick(() => {
            console.log("[DEBUG] 전역 이어하기 X 버튼 클릭됨");
            if (!this.gameState.getIsMuted()) {
                this.k.play("boop-sfx", { volume: 0.4 });
            }
            this.closeLoadGamePopup();
        });

        // 저장된 게임이 없는 경우
        if (validSaveList.length === 0) {
            const noSaveText = "이어할 수 있는 게임이 없습니다.\n새 게임을 시작해주세요.";
            
            this.k.add([
                this.k.text(noSaveText, { 
                    size: 18, 
                    font: "galmuri",
                    align: "center"
                }),
                this.k.pos(panel.contentArea.x + panel.contentArea.width / 2, panel.contentArea.y + panel.contentArea.height / 2),
                this.k.anchor("center"),
                this.k.color(80, 80, 80), // front.js와 동일한 색상
                this.k.z(151),
                this.k.fixed(),
                "global-load-popup-element"
            ]);
        } else {
            // 저장된 게임 목록 표시 (간단화된 버전)
            const itemHeight = 60;
            const maxVisibleItems = Math.floor((panel.contentArea.height - 80) / itemHeight);
            const displayList = validSaveList.slice(0, maxVisibleItems); // 처음 몇 개만 표시
            
            displayList.forEach((save, index) => {
                const lastPlayedDate = new Date(save.lastPlayedAt);
                const playTimeText = gameDataManager.formatPlayTime(save.playTime.totalSeconds);
                
                const dateStr = lastPlayedDate.toLocaleDateString('ko-KR');
                const timeStr = lastPlayedDate.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                const itemText = `${index + 1}. ${save.playerName} - ${dateStr} ${timeStr} (${playTimeText})`;
                const itemY = panel.contentArea.y + 25 + (index * itemHeight);
                
                // 항목 배경
                const itemBg = this.k.add([
                    this.k.rect(panel.contentArea.width - 30, 50),
                    this.k.pos(panel.contentArea.x + 10, itemY - 5),
                    this.k.color(220, 230, 250),
                    this.k.opacity(0.7),
                    this.k.z(150),
                    this.k.fixed(),
                    "global-load-popup-element"
                ]);
                
                // 텍스트
                const itemTextElement = this.k.add([
                    this.k.text(itemText, {
                        size: 16,
                        font: "galmuri",
                        width: panel.contentArea.width - 50
                    }),
                    this.k.pos(panel.contentArea.x + 20, itemY + 10),
                    this.k.color(80, 80, 80),
                    this.k.z(152),
                    this.k.fixed(),
                    "global-load-popup-element"
                ]);
                
                // 클릭 영역
                const clickArea = this.k.add([
                    this.k.rect(panel.contentArea.width - 30, 50),
                    this.k.pos(panel.contentArea.x + 10, itemY - 5),
                    this.k.area(),
                    this.k.opacity(0),
                    this.k.z(153),
                    this.k.fixed(),
                    "global-load-popup-element"
                ]);
                
                // 호버 효과
                clickArea.onHover(() => {
                    itemBg.color = this.k.rgb(200, 215, 240);
                    itemBg.opacity = 0.9;
                });
                
                clickArea.onHoverEnd(() => {
                    itemBg.color = this.k.rgb(220, 230, 250);
                    itemBg.opacity = 0.7;
                });
                
                clickArea.onClick(() => {
                    console.log(`🔍 저장 데이터 클릭: ${save.playerName}`);
                    this.k.wait(0.1, () => {
                        this.loadSaveData(save);
                    });
                });
            });
        }
        
        // ESC 키로 팝업 닫기
        this.k.onKeyPress("escape", () => {
            if (this.loadGameState.isPopupOpen) {
                this.closeLoadGamePopup();
            }
        });
    }
    
    /**
     * 이어하기 팝업 닫기
     */
    closeLoadGamePopup() {
        console.log("[DEBUG] 전역 이어하기 팝업 닫기");
        if (!this.loadGameState.isPopupOpen) return;
        
        this.loadGameState.isPopupOpen = false;
        
        try {
            // 이어하기 팝업 요소들 제거
            this.k.get("global-load-popup-element").forEach(element => {
                if (element.exists && element.exists()) {
                    element.destroy();
                }
            });
            
            console.log("[DEBUG] 전역 이어하기 팝업 요소들 제거 완료");
        } catch (error) {
            console.warn("[DEBUG] 이어하기 팝업 정리 중 오류:", error);
        }
    }
    
    /**
     * 저장 데이터 로드 및 게임 시작
     */
    loadSaveData(saveData) {
        console.log(`[DEBUG] 저장 데이터 로드 시작: ${saveData.id}`);
        
        try {
            // 저장 데이터를 게임 상태에 로드 (questItems도 함께 전달)
            const loadResult = gameDataManager.loadSaveData(saveData.id, this.gameState, this.questItems);
            
            if (loadResult) {
                console.log(`✅ 저장 데이터 로드 성공: ${saveData.playerName}`);
                
                // globalState 복원
                if (loadResult.globalState) {
                    console.log("🔄 globalState 복원 중...");
                    this.globalState.setPlayerName(loadResult.globalState.playerName || saveData.playerName);
                    this.globalState.setMood(loadResult.globalState.mood || 5);
                    this.globalState.setHealth(loadResult.globalState.health || 9);
                    console.log(`📊 globalState 복원 완료 - 이름: ${this.globalState.getPlayerName()}, 기분: ${this.globalState.getMood()}, 체력: ${this.globalState.getHealth()}`);
                }
                
                // questItems 복원
                if (loadResult.questState && loadResult.questState.questItems) {
                    console.log("📋 퀘스트 상태 복원 중...");
                    this.questItems.length = 0; // 기존 퀘스트 초기화
                    this.questItems.push(...loadResult.questState.questItems);
                    window.questItems = this.questItems;
                    console.log(`📋 퀘스트 복원 완료: ${this.questItems.length}개`);
                }
                
                // 팝업 닫기
                this.closeLoadGamePopup();
                
                // 성공 알림 표시
                if (this.notificationManager) {
                    this.notificationManager.addNotification({
                        type: 'system',
                        message: `게임 로드 완료: ${saveData.playerName}`
                    });
                }
                
                // 게임 시작 (저장된 씬으로 이동)
                const targetScene = saveData.gameState.currentScene || "front";
                
                console.log(`🎮 씬 전환: ${targetScene}`);
                
                // 플레이어 컨트롤 재설정을 위한 지연
                this.k.wait(0.1, () => {
                    this.k.go(targetScene);
                });
                
            } else {
                console.error("❌ 저장 데이터 로드 실패");
                // 실패 알림 표시
                if (this.notificationManager) {
                    this.notificationManager.addNotification({
                        type: 'system',
                        message: "저장 데이터 로드에 실패했습니다"
                    });
                }
            }
        } catch (error) {
            console.error("❌ 저장 데이터 로드 중 오류:", error);
            // 오류 알림 표시
            if (this.notificationManager) {
                this.notificationManager.addNotification({
                    type: 'system',
                    message: "저장 데이터 로드 중 오류가 발생했습니다"
                });
            }
        }
    }
    
    /**
     * 정리 함수 - 씬 종료 시 호출
     */
    cleanup() {
        try {
            // 팝업들 닫기
            this.closeQuestPopup();
            this.closeSettingsPopup();
            this.closeLoadGamePopup();
            
            // 상태바 제거
            if (this.statusBarContainer && this.statusBarContainer.exists()) {
                this.statusBarContainer.destroy();
            }
            
            // 아이콘들 제거
            if (this.questIcon && this.questIcon.exists()) {
                this.questIcon.destroy();
            }
            if (this.settingsIcon && this.settingsIcon.exists()) {
                this.settingsIcon.destroy();
            }
            
            // 정리 함수들 실행
            this.cleanupFunctions.forEach(fn => {
                try {
                    fn();
                } catch (error) {
                    console.warn("정리 함수 실행 중 오류:", error);
                }
            });
            
            console.log("[DEBUG] 전역 UI 매니저 정리 완료");
        } catch (error) {
            console.warn("[DEBUG] 전역 UI 매니저 정리 중 오류:", error);
        }
    }
}

/**
 * 간편 사용을 위한 헬퍼 함수
 * @param {Object} k - Kaboom 컨텍스트
 * @param {Object} gameState - 게임 상태
 * @param {Object} globalState - 전역 상태
 * @returns {GlobalUIManager} - 전역 UI 매니저 인스턴스
 */
export function setupGlobalUI(k, gameState, globalState) {
    const uiManager = new GlobalUIManager(k, gameState, globalState);
    uiManager.initialize();
    return uiManager;
}
