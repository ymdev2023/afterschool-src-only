/**
 * UI 컴포넌트 통합 관리 시스템
 * 다이얼로그, 메뉴, 버튼 등 모든 UI 컴포넌트를 관리합니다.
 */

import { gameState } from "../state/stateManagers.js";
import { createUIManager } from "../systems/uiManager.js";

/**
 * 다이얼로그 UI 관리
 */
export class DialogUI {
    constructor(k) {
        this.k = k;
        this.activeDialogs = new Map();
        this.uiManager = createUIManager(k);
    }

    /**
     * 기본 다이얼로그 박스 생성
     */
    createDialogBox(pos, width = 800, height = 200) {
        const dialogBox = this.k.add([
            this.k.rect(width, height),
            this.k.pos(pos),
            this.k.fixed(),
            this.k.color(240, 240, 240),
            this.k.outline(4, this.k.rgb(128, 128, 128)),
            this.k.z(50),
            "ui-dialog-box"
        ]);

        return dialogBox;
    }

    /**
     * 다이얼로그 텍스트 컨테이너 생성
     */
    createTextContainer(parent, text, options = {}) {
        const font = options.font || "gameboy";
        const size = options.size || gameState.getFontSize();
        const color = options.color || [0, 0, 0];
        const pos = options.pos || [30, 30];
        const width = options.width || 740;

        const textContainer = parent.add([
            this.k.text(text, {
                font: font,
                width: width,
                lineSpacing: 15,
                size: size,
            }),
            this.k.color(...color),
            this.k.pos(...pos),
            this.k.fixed(),
            "ui-dialog-text"
        ]);

        return textContainer;
    }

    /**
     * 화자 이름 탭 생성
     */
    createNameTab(dialogBox, name, options = {}) {
        const font = options.font || "gameboy";
        const size = options.size || gameState.getFontSize();
        const tabWidth = options.width || 200;
        const tabHeight = options.height || 40;

        const nameTab = this.k.add([
            this.k.rect(tabWidth, tabHeight),
            this.k.pos(dialogBox.pos.x + 30, dialogBox.pos.y - 30),
            this.k.fixed(),
            this.k.color(200, 200, 200),
            this.k.outline(2, this.k.rgb(128, 128, 128)),
            this.k.z(55),
            "ui-name-tab"
        ]);

        nameTab.add([
            this.k.text(name, {
                font: font,
                size: size,
            }),
            this.k.color(0, 0, 0),
            this.k.pos(10, 10),
            this.k.fixed(),
            "ui-name-text"
        ]);

        return nameTab;
    }

    /**
     * 선택지 컨테이너 생성
     */
    createChoiceContainer(parent, choices, options = {}) {
        const font = options.font || "gameboy";
        const size = options.size || gameState.getFontSize();
        const startY = options.startY || 140;

        const choiceContainer = parent.add([
            this.k.pos(50, startY),
            this.k.fixed(),
            this.k.opacity(0),
            "ui-choice-container"
        ]);

        const choiceTexts = choices.map((choice, index) => {
            return choiceContainer.add([
                this.k.text(`  ${choice}`, {
                    font: font,
                    size: size,
                }),
                this.k.color(100, 50, 100),
                this.k.pos(0, index * 40),
                this.k.fixed(),
                "ui-choice-text"
            ]);
        });

        return { container: choiceContainer, texts: choiceTexts };
    }

    /**
     * 확인 대화상자 생성
     */
    createConfirmDialog(message, options = {}) {
        const width = options.width || 400;
        const height = options.height || 150;
        const pos = options.pos || [this.k.center().x - width/2, this.k.center().y - height/2];

        const confirmBox = this.k.add([
            this.k.rect(width, height),
            this.k.pos(...pos),
            this.k.fixed(),
            this.k.color(240, 240, 240),
            this.k.outline(4, this.k.rgb(128, 128, 128)),
            this.k.z(100),
            "ui-confirm-box"
        ]);

        // 메시지 텍스트
        confirmBox.add([
            this.k.text(message, {
                font: "gameboy",
                size: 18,
            }),
            this.k.color(0, 0, 0),
            this.k.pos(20, 20),
            this.k.fixed(),
            "ui-confirm-text"
        ]);

        // 버튼 힌트
        const locale = gameState.getLocale();
        const buttonHint = locale === 'korean' ? 
            "ENTER: 확인    ESC: 취소" : 
            "ENTER: Confirm    ESC: Cancel";

        confirmBox.add([
            this.k.text(buttonHint, {
                font: "gameboy",
                size: 12,
            }),
            this.k.color(100, 100, 100),
            this.k.pos(20, height - 40),
            this.k.fixed(),
            "ui-confirm-hint"
        ]);

        return confirmBox;
    }

    /**
     * 진행률 바 생성
     */
    createProgressBar(pos, width = 200, height = 20, progress = 0) {
        const progressBar = this.k.add([
            this.k.rect(width, height),
            this.k.pos(...pos),
            this.k.fixed(),
            this.k.color(100, 100, 100),
            this.k.outline(2, this.k.rgb(50, 50, 50)),
            this.k.z(60),
            "ui-progress-bar"
        ]);

        const progressFill = progressBar.add([
            this.k.rect(width * progress, height - 4),
            this.k.pos(2, 2),
            this.k.fixed(),
            this.k.color(0, 200, 0),
            "ui-progress-fill"
        ]);

        // 진행률 업데이트 함수
        progressBar.updateProgress = (newProgress) => {
            if (progressFill.exists()) {
                progressFill.width = width * Math.max(0, Math.min(1, newProgress));
            }
        };

        return progressBar;
    }

    /**
     * 토스트 메시지 생성
     */
    createToast(message, duration = 2) {
        const toast = this.k.add([
            this.k.rect(300, 60),
            this.k.pos(this.k.center().x, this.k.height() - 100),
            this.k.anchor("center"),
            this.k.color(0, 0, 0),
            this.k.opacity(0.8),
            this.k.z(150),
            this.k.fixed(),
            "ui-toast"
        ]);

        toast.add([
            this.k.text(message, {
                font: "gameboy",
                size: 14,
            }),
            this.k.pos(0, 0),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            "ui-toast-text"
        ]);

        // 애니메이션
        toast.pos.y = this.k.height() + 50;
        this.k.tween(this.k.height() + 50, this.k.height() - 100, 0.3, (val) => {
            toast.pos.y = val;
        });

        this.k.wait(duration, () => {
            if (toast.exists()) {
                this.k.tween(this.k.height() - 100, this.k.height() + 50, 0.3, (val) => {
                    toast.pos.y = val;
                }).then(() => {
                    if (toast.exists()) {
                        toast.destroy();
                    }
                });
            }
        });

        return toast;
    }

    /**
     * 버튼 생성
     */
    createButton(text, pos, onClick, options = {}) {
        const width = options.width || 150;
        const height = options.height || 40;
        const font = options.font || "gameboy";
        const size = options.size || 16;

        const button = this.k.add([
            this.k.rect(width, height),
            this.k.pos(...pos),
            this.k.fixed(),
            this.k.color(200, 200, 200),
            this.k.outline(2, this.k.rgb(100, 100, 100)),
            this.k.z(60),
            this.k.area(),
            "ui-button"
        ]);

        button.add([
            this.k.text(text, {
                font: font,
                size: size,
            }),
            this.k.color(0, 0, 0),
            this.k.pos(width/2, height/2),
            this.k.anchor("center"),
            this.k.fixed(),
            "ui-button-text"
        ]);

        // 호버 효과
        button.onHover(() => {
            button.color = this.k.rgb(220, 220, 220);
        });

        button.onHoverEnd(() => {
            button.color = this.k.rgb(200, 200, 200);
        });

        // 클릭 이벤트
        button.onClick(onClick);

        return button;
    }

    /**
     * 모든 다이얼로그 UI 정리
     */
    cleanup() {
        this.activeDialogs.forEach((dialog, id) => {
            if (dialog.exists()) {
                dialog.destroy();
            }
        });
        this.activeDialogs.clear();
        
        // Kaboom 오브젝트 강제 정리
        try {
            const dialogObjects = this.k.get("ui-dialog-box");
            dialogObjects.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
            
            const textObjects = this.k.get("ui-dialog-text");
            textObjects.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
            
            const nameObjects = this.k.get("ui-name-tab");
            nameObjects.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
            
            const choiceObjects = this.k.get("ui-choice-container");
            choiceObjects.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
            
            const toastObjects = this.k.get("ui-toast");
            toastObjects.forEach(obj => {
                if (obj.exists()) {
                    obj.destroy();
                }
            });
        } catch (e) {
            console.warn("Kaboom 오브젝트 정리 중 오류:", e);
        }
    }
}

// 싱글톤 인스턴스
let dialogUIInstance = null;

export function createDialogUI(k) {
    if (!dialogUIInstance) {
        dialogUIInstance = new DialogUI(k);
    }
    return dialogUIInstance;
}

export function getDialogUI() {
    return dialogUIInstance;
}

// 대화 시스템 초기화 함수 추가
export function resetDialogUISystem() {
    if (dialogUIInstance) {
        dialogUIInstance.cleanup();
        dialogUIInstance = null;
    }
    
    // 추가 정리: 모든 대화 관련 전역 변수 정리
    if (typeof window !== 'undefined') {
        window.dialogUIInstance = null;
        window.currentDialog = null;
        window.dialogState = null;
        window.isDialogActive = false;
        window.dialogQueue = [];
        window.activeDialogBox = null;
        window.prologueDialogActive = false;
    }
    
    // 모든 대화 관련 DOM 요소 강제 제거
    const allDialogSelectors = [
        '[data-dialog]',
        '.dialog-container',
        '.dialog-box',
        '.dialog-text',
        '.dialog-ui',
        '.dialog-background',
        '.dialog-overlay',
        '.ui-dialog-box',
        '.ui-dialog-text',
        '.ui-name-tab',
        '.ui-name-text',
        '.ui-choice-container',
        '.ui-choice-text',
        '.ui-confirm-box',
        '.ui-toast',
        '[id*="dialog"]',
        '[class*="dialog"]',
        '[data-dialog-type]',
        '[data-dialog-id]'
    ];
    
    allDialogSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        } catch (e) {
            console.warn(`선택자 ${selector} 정리 중 오류:`, e);
        }
    });
    
    // 로컬 스토리지 정리
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('dialogState');
            localStorage.removeItem('currentDialog');
            localStorage.removeItem('dialogHistory');
            localStorage.removeItem('prologueState');
        }
    } catch (e) {
        console.warn('로컬 스토리지 정리 중 오류:', e);
    }
    
    // console.log("🧹 Dialog UI system reset completed");
}
