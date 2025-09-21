// 퀘스트 UI 관리 모듈
// 퀘스트 아이콘, 팝업, 알림 등 퀘스트 관련 모든 UI를 관리

import { createPanelWithHeader, createCloseButton, UI_THEMES } from "./nineSlicePanel.js";

/**
 * 퀘스트 UI 매니저 클래스
 */
export class QuestUIManager {
    constructor(k, gameState) {
        this.k = k;
        this.gameState = gameState;
        this.questIcon = null;
        this.questPopup = null;
        this.isQuestPopupOpen = false;
    }

    /**
     * 퀘스트 아이콘 설정
     */
    setupQuestIcon() {
        console.log("🎯 퀘스트 아이콘 설정 시작");
        
        // 퀘스트 아이콘 생성 (받은편지함 모양)
        this.questIcon = this.k.add([
            this.k.sprite("front-assets", { frame: 51 }), // 열린편지 아이콘으로 변경 (올바른 프레임)
            this.k.pos(this.k.width() - 120, 20), // 위치 조정 (설정 아이콘 공간 확보)
            this.k.scale(2),
            this.k.area(),
            this.k.z(100),
            this.k.fixed(),
            "quest-icon",
        ]);

        this.questIcon.onClick(this.openQuestPopup.bind(this));
        
        console.log("✅ 퀘스트 아이콘 설정 완료");
        
        // 전역 함수로 노출
        window.updateQuestIcon = this.updateQuestIcon.bind(this);
        
        return this.questIcon;
    }

    /**
     * 퀘스트 아이콘 상태 업데이트
     */
    updateQuestIcon() {
        if (!this.questIcon || !window.questItems) return;

        const totalQuests = window.questItems.length;
        const completedQuests = window.questItems.filter(quest => quest.completed).length;

        console.log(`🎯 퀘스트 상태: ${completedQuests}/${totalQuests} 완료`);

        if (completedQuests === totalQuests && totalQuests > 0) {
            this.questIcon.frame = 50; // 닫힌편지 (모든 퀘스트 완료)
        } else {
            this.questIcon.frame = 51; // 열린편지 (미완료 퀘스트 있음)
        }
    }

    /**
     * 퀘스트 팝업 열기
     */
    openQuestPopup() {
        if (this.isQuestPopupOpen) return;

        console.log("📋 퀘스트 팝업 열기");
        this.isQuestPopupOpen = true;

        // 배경 오버레이
        const overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.pos(0, 0),
            this.k.color(0, 0, 0),
            this.k.opacity(0.7),
            this.k.z(150),
            this.k.fixed(),
            "quest-popup",
        ]);

        // 메인 패널
        const mainPanel = createPanelWithHeader(
            this.k,
            { width: 600, height: 500 },
            { x: this.k.width() / 2, y: this.k.height() / 2 },
            "퀘스트",
            UI_THEMES.QUEST,
            "quest-popup"
        );

        // 닫기 버튼
        const closeBtn = createCloseButton(
            this.k,
            { x: this.k.width() / 2 + 270, y: this.k.height() / 2 - 220 },
            this.closeQuestPopup.bind(this),
            "quest-popup"
        );

        this.refreshQuestPopupUI();
    }

    /**
     * 퀘스트 팝업 닫기
     */
    closeQuestPopup() {
        if (!this.isQuestPopupOpen) return;

        console.log("📋 퀘스트 팝업 닫기");
        this.isQuestPopupOpen = false;
        this.k.destroyAll("quest-popup");
    }

    /**
     * 퀘스트 팝업 UI 새로고침
     */
    refreshQuestPopupUI() {
        if (!this.isQuestPopupOpen) return;

        // 기존 퀘스트 항목들 제거
        this.k.destroyAll("quest-item");

        const questItems = window.questItems || [];
        const startY = this.k.height() / 2 - 180;
        let currentY = startY;

        questItems.forEach((quest, index) => {
            this.createQuestItem(quest, index, currentY);
            currentY += quest.expanded ? 120 + (quest.details.length * 25) : 60;
        });
    }

    /**
     * 개별 퀘스트 항목 생성
     */
    createQuestItem(quest, index, yPos) {
        const k = this.k;
        const panelWidth = 550;
        const contentX = k.width() / 2 - panelWidth / 2 + 20;

        // 퀘스트 상태 아이콘
        const statusIcon = k.add([
            k.sprite("front-assets", { 
                frame: quest.completed ? 50 : 51  // 올바른 프레임 사용
            }),
            k.pos(contentX, yPos),
            k.scale(1.5),
            k.z(152),
            k.fixed(),
            "quest-item",
        ]);

        // 퀘스트 제목
        const titleText = k.add([
            k.text(quest.title, {
                size: 18,
                font: "galmuri",
                width: panelWidth - 100,
            }),
            k.pos(contentX + 40, yPos - 5),
            k.color(quest.completed ? k.rgb(150, 150, 150) : k.rgb(255, 255, 255)),
            k.z(152),
            k.fixed(),
            "quest-item",
        ]);

        // 확장/축소 버튼
        const toggleBtn = k.add([
            k.text(quest.expanded ? "▼" : "▶", {
                size: 16,
                font: "galmuri",
            }),
            k.pos(contentX + panelWidth - 50, yPos),
            k.color(200, 200, 200),
            k.area(),
            k.z(152),
            k.fixed(),
            "quest-item",
        ]);

        toggleBtn.onClick(() => {
            quest.expanded = !quest.expanded;
            this.refreshQuestPopupUI();
        });

        // 세부 내용 (확장된 경우)
        if (quest.expanded && quest.details) {
            quest.details.forEach((detail, detailIndex) => {
                k.add([
                    k.text(`• ${detail}`, {
                        size: 14,
                        font: "galmuri",
                        width: panelWidth - 100,
                    }),
                    k.pos(contentX + 60, yPos + 30 + (detailIndex * 25)),
                    k.color(180, 180, 180),
                    k.z(152),
                    k.fixed(),
                    "quest-item",
                ]);
            });
        }
    }

    /**
     * 퀘스트 완료 메시지 표시
     */
    showQuestCompletionMessage(questTitle) {
        const k = this.k;
        const messageWidth = 800;
        
        // 퀘스트 아이콘 상태 업데이트 (퀘스트 완료 후)
        this.updateQuestIcon();
        
        const messageBg = k.add([
            k.rect(messageWidth, 70),
            k.pos(k.width() / 2, 80),
            k.anchor("center"),
            k.color(180, 150, 210),
            k.outline(1, k.rgb(80, 160, 80)),
            k.z(200),
            k.fixed(),
            "quest-completion-message",
        ]);

        const messageText = k.add([
            k.text(`"${questTitle}"\n을 완료했습니다!`, {
                size: 20,
                font: "galmuri",
                align: "center",
            }),
            k.pos(k.width() / 2, 80),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(201),
            k.fixed(),
            "quest-completion-message",
        ]);

        // 효과음 재생
        k.play("coin-sfx", { volume: 0.6 });

        // 3초 후 메시지 제거
        k.wait(3, () => {
            k.destroyAll("quest-completion-message");
        });
    }



    /**
     * 퀘스트 추가 메시지 표시 (기존 방식 - 백업용)
     */
    showQuestAddedMessageLegacy(questTitle) {
        const k = this.k;
        const messageWidth = 600;

        const messageBg = k.add([
            k.rect(messageWidth, 80),
            k.pos(k.width() / 2, 150),
            k.anchor("center"),
            k.color(100, 180, 255),
            k.outline(2, k.rgb(50, 120, 200)),
            k.z(200),
            k.fixed(),
            "quest-added-message",
        ]);

        const messageText = k.add([
            k.text(`새로운 퀘스트!\n"${questTitle}"`, {
                size: 18,
                font: "galmuri",
                align: "center",
            }),
            k.pos(k.width() / 2, 150),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(201),
            k.fixed(),
            "quest-added-message",
        ]);

        // 효과음 재생
        k.play("confirm-beep-sfx", { volume: 0.4 });

        // 4초 후 메시지 제거
        k.wait(4, () => {
            k.destroyAll("quest-added-message");
        });
    }

    /**
     * 정리 함수
     */
    cleanup() {
        this.k.destroyAll("quest-popup");
        this.k.destroyAll("quest-completion-message");
        this.k.destroyAll("quest-added-message");
        this.isQuestPopupOpen = false;
    }
}
