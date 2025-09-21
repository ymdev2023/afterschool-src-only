// commonUI.js - 모든 타일맵 씬에서 공통으로 사용되는 UI 시스템

import { createPanelWithHeader, createCloseButton, createModernButton, UI_THEMES } from "./nineSlicePanel.js";
import { gameState } from "../state/stateManagers.js";

// 자동 저장 알림 변수
let autoSaveNotification = null;

// 퀘스트 완료 메시지 표시 함수
function showQuestCompletedMessage(k, questTitle) {
    const messageWidth = 800;
    const messageBg = k.add([
        k.rect(messageWidth, 70),
        k.pos(k.width() / 2, 80),
        k.anchor("center"),
        k.color(120, 200, 120),
        k.outline(1, k.rgb(80, 160, 80)),
        k.z(200),
        k.fixed(),
        "quest-completion-message",
    ]);
    
    const messageText = k.add([
        k.text(`퀘스트 완료: "${questTitle}"`, {
            size: 18,
            font: "galmuri",
            align: "center",
            width: messageWidth * 0.9
        }),
        k.pos(k.width() / 2, 80),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(201),
        k.fixed(),
        "quest-completion-message",
    ]);
    
    k.play("coin-sfx", { volume: 0.6 });
    
    // 3초 후 메시지 제거
    k.wait(3, () => {
        if (messageBg.exists()) messageBg.destroy();
        if (messageText.exists()) messageText.destroy();
    });
}



// 자동 저장 알림 표시 함수
function showAutoSaveNotification(k) {
    // 기존 알림이 있다면 제거
    if (autoSaveNotification) {
        k.destroy(autoSaveNotification);
    }
    
    // 새 알림 생성
    autoSaveNotification = k.add([
        k.text("저장되었습니다.", { 
            size: 14,
            font: "galmuri" 
        }),
        k.pos(20, 20), // 설정 아이콘과 비슷한 간격으로 왼쪽 상단에 배치
        k.color(138, 43, 226), // 보라색으로 변경
        k.z(10000), // 최상위 레이어
        k.fixed(),
        k.opacity(1)
    ]);
    
    // 3초 후 페이드 아웃
    k.wait(2, () => {
        if (autoSaveNotification) {
            k.tween(autoSaveNotification.opacity, 0, 1, (val) => {
                if (autoSaveNotification) {
                    autoSaveNotification.opacity = val;
                }
            }).then(() => {
                if (autoSaveNotification) {
                    k.destroy(autoSaveNotification);
                    autoSaveNotification = null;
                }
            });
        }
    });
}

// 공통 UI 시스템 설정 함수
export function setupCommonUI(k, gameState) {
    // 퀘스트 상태 관리
    const questState = {
        hasNewQuests: true,
        isPopupOpen: false,
    };

    // 설정 상태 관리
    const settingsState = {
        isPopupOpen: false,
    };

    // 퀘스트 아이콘 (화면 우측 상단)
    const questIcon = k.add([
        k.sprite("front-assets", {
            frame: 5771, // 기본 열린편지로 시작
        }),
        k.pos(k.width() - 120, 20),
        k.scale(2),
        k.z(1100),
        k.area(),
        k.fixed(),
        "quest-icon",
    ]);
    
    // 설정 아이콘 (퀘스트 아이콘 오른쪽에)
    const settingsIcon = k.add([
        k.sprite("front-assets", {
            frame: 5772, // 설정 아이콘
        }),
        k.pos(k.width() - 60, 20),
        k.scale(2),
        k.z(1100),
        k.area(),
        k.fixed(),
        "settings-icon",
    ]);

    // 퀘스트 팝업 관련 변수
    let questPopup = null;
    let questCloseButton = null;
    let settingsPopup = null;
    let settingsCloseButton = null;

    // 퀘스트 아이콘 상태 업데이트 함수
    function updateQuestIcon() {
        const currentQuestItems = window.questItems || [];
        const hasIncompleteQuests = currentQuestItems && currentQuestItems.some(item => !item.completed);
        
        if (hasIncompleteQuests) {
            questIcon.frame = 5771; // 열린편지
            questState.hasNewQuests = true;
        } else {
            questIcon.frame = 5770; // 닫힌편지
            questState.hasNewQuests = false;
        }
    }

    // 퀘스트 팝업 열기
    function openQuestPopup() {
        if (questState.isPopupOpen) return;

        questState.isPopupOpen = true;

        const panelWidth = k.width() * 0.8;
        const panelHeight = k.height() * 0.7;
        const panelX = k.width() * 0.1;
        const panelY = k.height() * 0.15;
        
        // 파스텔 블루 테마로 패널 생성
        const panel = createPanelWithHeader(k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30,
            colors: UI_THEMES.PASTEL_BLUE,
            zIndex: 150,
            tag: "quest-popup",
            fixed: true
        });

        questPopup = panel.mainBg;

        // 팝업 제목
        const title = k.add([
            k.text("오늘의 할일", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2),
            k.color(80, 80, 80),
            k.anchor("left"),
            k.z(152),
            k.fixed(),
            "quest-popup-element",
        ]);

        // X 버튼 생성
        questCloseButton = createCloseButton(k, {
            x: panel.headerArea.x + panel.headerArea.width - 30,
            y: panel.headerArea.y + 3,
            size: 24,
            colors: {
                bg: [120, 140, 180],
                bgHover: [140, 160, 200],
                border: [100, 120, 160],
                text: [255, 255, 255]
            },
            zIndex: 162,
            tag: "quest-popup-element",
            fixed: true,
            onClick: closeQuestPopup
        });

        // 퀘스트 항목들 렌더링
        const questItemElements = [];
        const currentQuestItems = window.questItems || [];
        
        currentQuestItems.forEach((item, index) => {
            const yPos = panel.contentArea.y + 30 + (index * 50);
            
            // 체크박스
            const checkbox = k.add([
                k.rect(16, 16),
                k.pos(panel.contentArea.x, yPos),
                k.color(item.completed ? [126, 155, 204] : [200, 200, 200]),
                k.outline(2, k.rgb(80, 80, 80)),
                k.z(152),
                k.fixed(),
                "quest-popup-element",
            ]);
            
            // 체크 표시
            if (item.completed) {
                const checkMark = k.add([
                    k.text("✓", {
                        size: 14,
                        font: "galmuri",
                    }),
                    k.pos(panel.contentArea.x + 8, yPos + 8),
                    k.color(255, 255, 255),
                    k.anchor("center"),
                    k.z(153),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            }
            
            // 퀘스트 제목
            const questTitle = k.add([
                k.text(item.title, {
                    size: 18,
                    font: "galmuri",
                }),
                k.pos(panel.contentArea.x + 24, yPos + 8),
                k.color(item.completed ? [150, 150, 150] : [80, 80, 80]),
                k.anchor("left"),
                k.z(152),
                k.fixed(),
                "quest-popup-element",
            ]);
            
            // 취소선 (완료된 퀘스트)
            if (item.completed) {
                const strikethrough = k.add([
                    k.rect(questTitle.width, 2),
                    k.pos(panel.contentArea.x + 24, yPos + 8 + 9),
                    k.color(150, 150, 150),
                    k.z(153),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            }
            
            questItemElements.push({ checkbox, questTitle, item, index });
        });

        updateQuestIcon();
    }

    // 퀘스트 팝업 닫기
    function closeQuestPopup() {
        if (!questState.isPopupOpen) return;

        questState.isPopupOpen = false;

        try {
            if (questCloseButton && questCloseButton.destroy) {
                questCloseButton.destroy();
            }
            if (questCloseButton && questCloseButton.elements) {
                questCloseButton.elements.forEach(element => {
                    if (element.exists && element.exists()) {
                        element.destroy();
                    }
                });
            }
            questCloseButton = null;
            
            const questElements = k.get("quest-popup-element");
            questElements.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
        
            k.destroyAll("quest-checkbox-clickable");
            k.destroyAll("quest-title-clickable");
            k.destroyAll("quest-popup");
        } catch (error) {
            console.error("[ERROR] 퀘스트 팝업 정리 중 오류:", error);
        }

        questPopup = null;
    }

    // 설정 팝업 열기
    function openSettingsPopup() {
        if (settingsState.isPopupOpen) return;

        settingsState.isPopupOpen = true;

        const panelWidth = k.width() * 0.6;
        const panelHeight = k.height() * 0.6;
        const panelX = k.width() * 0.2;
        const panelY = k.height() * 0.2;

        const panel = createPanelWithHeader(k, {
            x: panelX,
            y: panelY,
            width: panelWidth,
            height: panelHeight,
            headerHeight: 30,
            colors: UI_THEMES.DARK_PURPLE,
            zIndex: 160,
            tag: "settings-popup",
            fixed: true
        });

        settingsPopup = panel.mainBg;

        // 설정 제목
        const title = k.add([
            k.text("게임 설정", {
                size: 20,
                font: "galmuri",
            }),
            k.pos(panel.headerArea.x + 8, panel.headerArea.y + panel.headerArea.height / 2),
            k.color(255, 255, 255),
            k.anchor("left"),
            k.z(162),
            k.fixed(),
            "settings-popup-element",
        ]);

        // X 버튼 (짙은 보라색 테마)
        settingsCloseButton = createCloseButton(k, {
            x: panel.headerArea.x + panel.headerArea.width - 30,
            y: panel.headerArea.y + 3,
            size: 24,
            colors: {
                bg: [75, 45, 95],
                bgHover: [95, 65, 115],
                border: [55, 25, 75],
                text: [255, 255, 255]
            },
            zIndex: 172,
            tag: "settings-popup-element",
            fixed: true,
            onClick: closeSettingsPopup
        });

        // 언어 설정 버튼
        const langButton = createModernButton(k, {
            x: panel.contentArea.x + 20,
            y: panel.contentArea.y + 30,
            width: 150,
            height: 40,
            text: gameState.getLocale() === "korean" ? "언어: 한국어" : "Language: English",
            colors: UI_THEMES.DARK_PURPLE.button,
            zIndex: 162,
            tag: "settings-popup-element",
            fixed: true,
            onClick: () => {
                k.play("confirm-beep-sfx", { volume: 0.4 });
                // toggleLocale 함수 호출 (utils.js에서 import 필요)
            }
        });

        // 메인 메뉴 버튼
        const mainMenuButton = createModernButton(k, {
            x: panel.contentArea.x + panel.contentArea.width - 170,
            y: panel.contentArea.y + panel.contentArea.height - 90,
            width: 150,
            height: 40,
            text: "메인 메뉴로",
            colors: UI_THEMES.DARK_PURPLE.button,
            zIndex: 162,
            tag: "settings-popup-element",
            fixed: true,
            onClick: () => {
                k.play("confirm-beep-sfx", { volume: 0.4 });
                k.go("title");
            }
        });

        // 크레딧 버튼
        const creditsButton = createModernButton(k, {
            x: panel.contentArea.x + panel.contentArea.width - 170,
            y: panel.contentArea.y + panel.contentArea.height - 40,
            width: 150,
            height: 40,
            text: "크레딧",
            colors: UI_THEMES.DARK_PURPLE.button,
            zIndex: 162,
            tag: "settings-popup-element",
            fixed: true,
            onClick: () => {
                k.play("confirm-beep-sfx", { volume: 0.4 });
                k.go("credits");
            }
        });
    }

    // 설정 팝업 닫기
    function closeSettingsPopup() {
        if (!settingsState.isPopupOpen) return;

        settingsState.isPopupOpen = false;

        try {
            if (settingsCloseButton && settingsCloseButton.destroy) {
                settingsCloseButton.destroy();
            }
            if (settingsCloseButton && settingsCloseButton.elements) {
                settingsCloseButton.elements.forEach(element => {
                    if (element.exists && element.exists()) {
                        element.destroy();
                    }
                });
            }
            settingsCloseButton = null;

            const settingsElements = k.get("settings-popup-element");
            settingsElements.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });

            k.destroyAll("settings-popup");
        } catch (error) {
            console.error("[ERROR] 설정 팝업 정리 중 오류:", error);
        }

        settingsPopup = null;
    }

    // 이벤트 리스너 설정
    questIcon.onClick(() => {
        if (questState.isPopupOpen) {
            closeQuestPopup();
        } else {
            openQuestPopup();
        }
    });

    questIcon.onHover(() => {
        questIcon.scale = k.vec2(2.2, 2.2);
    });

    questIcon.onHoverEnd(() => {
        questIcon.scale = k.vec2(2, 2);
    });

    settingsIcon.onClick(() => {
        if (settingsState.isPopupOpen) {
            closeSettingsPopup();
        } else {
            openSettingsPopup();
        }
    });

    settingsIcon.onHover(() => {
        settingsIcon.scale = k.vec2(2.2, 2.2);
    });

    settingsIcon.onHoverEnd(() => {
        settingsIcon.scale = k.vec2(2, 2);
    });

    // 화면 크기 변경 시 아이콘 위치 업데이트
    k.onResize(() => {
        questIcon.pos = k.vec2(k.width() - 120, 20);
        settingsIcon.pos = k.vec2(k.width() - 60, 20);
    });

    // 반환 객체
    return {
        questIcon,
        settingsIcon,
        updateQuestIcon,
        showQuestCompletedMessage: (questTitle) => showQuestCompletedMessage(k, questTitle),
        showAutoSaveNotification: () => showAutoSaveNotification(k),
        closeQuestPopup,
        closeSettingsPopup
    };
}
