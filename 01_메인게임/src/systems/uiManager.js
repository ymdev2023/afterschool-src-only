/**
 * UI 시스템 관리자
 * 모든 UI 요소들을 중앙에서 관리하는 시스템
 */

import { playerState } from "../state/stateManagers.js";
import { gameState } from "../state/stateManagers.js";

export class UIManager {
    constructor(k) {
        this.k = k;
        this.uiElements = new Map();
        this.isVisible = true;
        this.initialized = false;
        this.currentMoodIndex = 0; // 기분 상태를 고정하기 위한 인덱스
    }

    /**
     * UI 시스템 초기화
     */
    initialize(k) {
        // k 인스턴스 업데이트
        if (k) {
            this.k = k;
        }
        
        // 이미 초기화된 경우 기존 UI 정리 후 재생성
        if (this.initialized) {
            this.cleanup();
        }
        
        console.log("🎨 UI 시스템 초기화 중...");
        
        // 기본 UI 요소들 생성
        this.createMoodSystem();
        this.createRightPanel();
        
        this.initialized = true;
        console.log("✅ UI 시스템 초기화 완료");
    }

    /**
     * 기분 시스템 UI 생성 (왼쪽 상단)
     */
    createMoodSystem() {
        const moodContainer = this.k.add([
            this.k.pos(40, 40),
            this.k.fixed(),
            "ui-mood-system"
        ]);

        this.uiElements.set('mood-system', moodContainer);
        this.updateMoodSystem();
        
        return moodContainer;
    }

    /**
     * 기분 시스템 업데이트
     */
    updateMoodSystem() {
        const moodContainer = this.uiElements.get('mood-system');
        if (!moodContainer || !moodContainer.exists()) return;

        // 기존 요소들 제거
        moodContainer.children.forEach(child => {
            if (child.exists()) {
                child.destroy();
            }
        });

        const locale = gameState.getLocale();
        
        // 기분 상태 (100% 기준)
        const moodStates = [
            { number: "100", text: locale === 'korean' ? '최고' : 'Perfect', color: [100, 255, 100] },
            { number: "80", text: locale === 'korean' ? '좋음' : 'Good', color: [150, 255, 150] },
            { number: "60", text: locale === 'korean' ? '보통' : 'Normal', color: [255, 255, 100] },
            { number: "40", text: locale === 'korean' ? '나쁨' : 'Bad', color: [255, 150, 100] },
            { number: "20", text: locale === 'korean' ? '최악' : 'Terrible', color: [255, 100, 100] }
        ];

        // 현재 기분 (고정된 인덱스 사용)
        const currentMood = moodStates[this.currentMoodIndex % moodStates.length];
        
        // 기분 제목
        const moodTitle = locale === 'korean' ? '현재 기분' : 'Current Mood';
        const titleText = moodContainer.add([
            this.k.text(moodTitle, {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 18,
            }),
            this.k.pos(0, 0),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 텍스트 외곽선과 그림자 효과
        // this.addTextOutline(titleText);

        // 기분 숫자 (큰 원형 배경)
        const moodBg = moodContainer.add([
            this.k.circle(35),
            this.k.pos(40, 60),
            this.k.color(...currentMood.color),
            this.k.outline(3, this.k.rgb(255, 255, 255)),
            this.k.area(),
            this.k.fixed()
        ]);

        // 기분 숫자
        const moodNumber = moodContainer.add([
            this.k.text(currentMood.number, {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 18,
            }),
            this.k.pos(40, 60),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 기분 클릭 시 기분 변경
        moodBg.onClick(() => {
            this.changeMood();
        });

        // 호버 효과
        moodBg.onHover(() => {
            moodBg.color = this.k.rgb(
                Math.min(255, currentMood.color[0] + 30),
                Math.min(255, currentMood.color[1] + 30),
                Math.min(255, currentMood.color[2] + 30)
            );
        });

        moodBg.onHoverEnd(() => {
            moodBg.color = this.k.rgb(...currentMood.color);
        });

        // 기분 텍스트
        const moodText = moodContainer.add([
            this.k.text(currentMood.text, {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 16,
            }),
            this.k.pos(40, 105),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);
    }

    /**
     * 오른쪽 패널 생성 (퀘스트, 설정 아이콘들)
     */
    createRightPanel() {
        const rightPanel = this.k.add([
            this.k.pos(this.k.width() - 150, 40), // 인벤토리 아이콘 제거로 너비 조정
            this.k.fixed(),
            "ui-right-panel"
        ]);

        this.uiElements.set('right-panel', rightPanel);
        this.updateRightPanel();
        
        return rightPanel;
    }

    /**
     * 오른쪽 패널 업데이트
     */
    updateRightPanel() {
        const rightPanel = this.uiElements.get('right-panel');
        if (!rightPanel || !rightPanel.exists()) return;

        // 기존 요소들 제거
        rightPanel.children.forEach(child => {
            if (child.exists()) {
                child.destroy();
            }
        });

        const locale = gameState.getLocale();

        // 퀘스트 아이콘 (왼쪽)
        const questIcon = rightPanel.add([
            this.k.rect(60, 60),
            this.k.pos(0, 0),
            this.k.color(70, 130, 180),
            this.k.outline(2, this.k.rgb(100, 150, 200)),
            this.k.area(),
            this.k.fixed(),
            "quest-icon"
        ]);

        const questText = questIcon.add([
            this.k.text("Q", {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 20,
            }),
            this.k.pos(30, 30),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 퀘스트 아이콘 클릭 이벤트
        questIcon.onClick(() => {
            this.toggleQuestPanel();
        });

        // 설정 아이콘 (오른쪽으로 이동)
        const settingsIcon = rightPanel.add([
            this.k.rect(60, 60),
            this.k.pos(70, 0), // 위치 조정
            this.k.color(128, 128, 128),
            this.k.outline(2, this.k.rgb(150, 150, 150)),
            this.k.area(),
            this.k.fixed(),
            "settings-icon"
        ]);

        const settingsText = settingsIcon.add([
            this.k.text("S", {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 20,
            }),
            this.k.pos(30, 30),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 설정 아이콘 클릭 이벤트
        settingsIcon.onClick(() => {
            this.toggleSettingsPanel();
        });

        // 인벤토리 아이콘 제거 (인벤토리가 항상 표시되므로 버튼 불필요)
        // 인벤토리 아이콘 관련 코드 제거됨

        // 호버 효과 추가
        this.addHoverEffect(questIcon);
        this.addHoverEffect(settingsIcon);
    }

    /**
     * 텍스트 얇은 외곽선 효과 추가 (비활성화됨)
     */
    addTextOutline(textElement) {
        // 외곽선 효과 비활성화
        return;
    }

    /**
     * 팝업 모달 생성 도우미 함수
     */
    createPopupModal(title, content, width = 400, height = 300, position = 'center') {
        const locale = gameState.getLocale();
        
        // 배경 오버레이 (반투명 검은색)
        const overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.pos(0, 0),
            this.k.color(0, 0, 0),
            this.k.opacity(0.5),
            this.k.z(90),
            this.k.fixed(),
            "popup-overlay"
        ]);

        // 위치 계산
        let posX, posY;
        if (position === 'top-center') {
            posX = this.k.center().x - width/2;
            posY = 100; // 상단에서 100px 떨어진 위치
        } else {
            // 기본값: 가운데
            posX = this.k.center().x - width/2;
            posY = this.k.center().y - height/2;
        }

        // 팝업 창
        const popup = this.k.add([
            this.k.rect(width, height),
            this.k.pos(posX, posY),
            this.k.color(50, 50, 50),
            this.k.outline(3, this.k.rgb(120, 120, 120)),
            this.k.z(100),
            this.k.fixed(),
            "popup-window"
        ]);

        // 제목 바
        const titleBar = popup.add([
            this.k.rect(width, 40),
            this.k.pos(0, 0),
            this.k.color(80, 80, 80),
            this.k.outline(2, this.k.rgb(100, 100, 100)),
            this.k.fixed(),
            "popup-title-bar"
        ]);

        // 제목 텍스트
        const titleText = titleBar.add([
            this.k.text(title, {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 16,
            }),
            this.k.pos(15, 20),
            this.k.anchor("left"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // X 버튼
        const closeBtn = titleBar.add([
            this.k.rect(30, 30),
            this.k.pos(width - 35, 5),
            this.k.color(180, 70, 70),
            this.k.outline(2, this.k.rgb(200, 90, 90)),
            this.k.area(),
            this.k.fixed(),
            "popup-close-btn"
        ]);

        const closeBtnText = closeBtn.add([
            this.k.text("X", {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 14,
            }),
            this.k.pos(15, 15),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 내용 영역
        const contentArea = popup.add([
            this.k.pos(15, 50),
            this.k.fixed(),
            "popup-content"
        ]);

        // 호버 효과
        this.addHoverEffect(closeBtn);

        // 닫기 이벤트
        const closePopup = () => {
            if (overlay.exists()) overlay.destroy();
            if (popup.exists()) popup.destroy();
        };

        closeBtn.onClick(closePopup);
        
        // 배경 클릭으로도 닫기 (마우스 클릭 이벤트 처리)
        this.k.onClick(() => {
            // 오버레이 영역 클릭 시 닫기
            if (this.k.mousePos().x >= overlay.pos.x && 
                this.k.mousePos().x <= overlay.pos.x + overlay.width &&
                this.k.mousePos().y >= overlay.pos.y && 
                this.k.mousePos().y <= overlay.pos.y + overlay.height) {
                closePopup();
            }
        });

        return { popup, contentArea, closePopup };
    }

    /**
     * 호버 효과 추가
     */
    addHoverEffect(icon) {
        const originalColor = icon.color;
        
        icon.onHover(() => {
            icon.color = this.k.rgb(
                Math.min(255, originalColor.r + 30),
                Math.min(255, originalColor.g + 30),
                Math.min(255, originalColor.b + 30)
            );
        });

        icon.onHoverEnd(() => {
            icon.color = originalColor;
        });
    }

    /**
     * 퀘스트 패널 토글 (팝업 형태)
     */
    toggleQuestPanel() {
        const existingPanel = this.uiElements.get('quest-panel');
        if (existingPanel && existingPanel.exists()) {
            existingPanel.destroy();
            this.uiElements.delete('quest-panel');
            return;
        }

        const locale = gameState.getLocale();
        const title = locale === 'korean' ? '퀘스트 목록' : 'Quest List';
        
        const { popup, contentArea, closePopup } = this.createPopupModal(title, null, 400, 350);

        // 퀘스트 리스트 (실제 퀘스트 시스템에서 가져오기)
        const questList = locale === 'korean' ? [
            "[Q01] 체육대회 준비하기",
            "[Q02] 동아리 활동 참여",
            "[Q03] 봉사활동 완료",
            "[Q04] 숙제 마감하기"
        ] : [
            "[Q01] Prepare for Sports Day",
            "[Q02] Join Club Activities", 
            "[Q03] Complete Volunteer Work",
            "[Q04] Finish Homework"
        ];

        questList.forEach((quest, index) => {
            const questText = contentArea.add([
                this.k.text(`• ${quest}`, {
                    font: locale === 'korean' ? 'galmuri' : 'gameboy',
                    size: 14,
                }),
                this.k.pos(0, index * 25),
                this.k.color(200, 200, 200),
                this.k.fixed()
            ]);
        });

        // 진행률 표시
        const progressText = contentArea.add([
            this.k.text(locale === 'korean' ? '진행률: 2/4 완료' : 'Progress: 2/4 Complete', {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 12,
            }),
            this.k.pos(0, questList.length * 25 + 20),
            this.k.color(100, 200, 100),
            this.k.fixed()
        ]);

        this.uiElements.set('quest-panel', popup);
        this.uiElements.set('quest-panel-close', closePopup);
    }

    /**
     * 설정 패널 토글 (팝업 형태)
     */
    toggleSettingsPanel() {
        const existingPanel = this.uiElements.get('settings-panel');
        if (existingPanel && existingPanel.exists()) {
            existingPanel.destroy();
            this.uiElements.delete('settings-panel');
            return;
        }

        const locale = gameState.getLocale();
        const title = locale === 'korean' ? '설정' : 'Settings';
        
        const { popup, contentArea, closePopup } = this.createPopupModal(title, null, 350, 280);

        // 설정 옵션들
        const isMuted = gameState.getIsMuted();
        const settingOptions = locale === 'korean' ? [
            `언어: ${locale === 'korean' ? '한국어' : 'English'}`,
            `음량: ${isMuted ? '음소거' : '켜짐'}`,
            "화면 모드: 창 모드",
            "키 설정"
        ] : [
            `Language: ${locale === 'korean' ? 'Korean' : 'English'}`,
            `Volume: ${isMuted ? 'Muted' : 'On'}`,
            "Screen Mode: Windowed",
            "Key Settings"
        ];

        settingOptions.forEach((option, index) => {
            const optionText = contentArea.add([
                this.k.text(option, {
                    font: locale === 'korean' ? 'galmuri' : 'gameboy',
                    size: 14,
                }),
                this.k.pos(0, index * 25),
                this.k.color(200, 200, 200),
                this.k.fixed()
            ]);
        });

        // 추가 설정 버튼들
        const langBtn = contentArea.add([
            this.k.rect(120, 30),
            this.k.pos(0, settingOptions.length * 25 + 20),
            this.k.color(100, 100, 180),
            this.k.outline(2, this.k.rgb(120, 120, 200)),
            this.k.area(),
            this.k.fixed(),
            "lang-btn"
        ]);

        const langBtnText = langBtn.add([
            this.k.text(locale === 'korean' ? '언어 변경' : 'Change Language', {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 12,
            }),
            this.k.pos(60, 15),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);
        this.addHoverEffect(langBtn);

        langBtn.onClick(() => {
            // 실제 언어 변경 기능 구현
            const current = gameState.getLocale();
            const next = current === "korean" ? "english" : "korean";
            gameState.setLocale(next);
            
            // 즉시 설정창 새로고침
            closePopup();
            
            // 변경 알림 메시지
            const msgText = next === "korean" 
                ? "언어를 한국어로 변경했습니다!" 
                : "Language changed to English!";
            
            this.createNotification(msgText);
            
            // 설정창 다시 열기 (새 언어로)
            setTimeout(() => {
                this.toggleSettingsPanel();
            }, 100);
        });

        // 음소거 버튼 추가
        const muteBtn = contentArea.add([
            this.k.rect(120, 30),
            this.k.pos(140, settingOptions.length * 25 + 20),
            this.k.color(150, 100, 100),
            this.k.outline(2, this.k.rgb(170, 120, 120)),
            this.k.area(),
            this.k.fixed(),
            "mute-btn"
        ]);

        const currentMuteState = gameState.getIsMuted();
        const muteBtnText = muteBtn.add([
            this.k.text(
                locale === 'korean' 
                    ? (currentMuteState ? '음소거 해제' : '음소거') 
                    : (currentMuteState ? 'Unmute' : 'Mute'), 
                {
                    font: locale === 'korean' ? 'galmuri' : 'gameboy',
                    size: 12,
                }
            ),
            this.k.pos(60, 15),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);
        this.addHoverEffect(muteBtn);

        muteBtn.onClick(() => {
            // 음소거 토글
            this.toggleGlobalMute();
            
            // 설정창 새로고침
            closePopup();
            setTimeout(() => {
                this.toggleSettingsPanel();
            }, 100);
        });


        this.uiElements.set('settings-panel', popup);
        this.uiElements.set('settings-panel-close', closePopup);
    }

    /**
     * 인벤토리 패널 토글 (팝업 형태)
     */
    toggleInventoryPanel() {
        const existingPanel = this.uiElements.get('inventory-panel');
        if (existingPanel && existingPanel.exists()) {
            existingPanel.destroy();
            this.uiElements.delete('inventory-panel');
            return;
        }

        const locale = gameState.getLocale();
        const title = locale === 'korean' ? '인벤토리' : 'Inventory';
        
        const { popup, contentArea, closePopup } = this.createPopupModal(title, null, 400, 320, 'top-center');

        // 인벤토리 아이템들 (더미 데이터)
        const inventoryItems = locale === 'korean' ? [
            "교과서 x3",
            "필기구 x1",
            "체육복 x1",
            "도시락 x1",
            "물병 x1"
        ] : [
            "Textbook x3",
            "Stationery x1",
            "Gym Clothes x1",
            "Lunch Box x1",
            "Water Bottle x1"
        ];

        inventoryItems.forEach((item, index) => {
            const itemText = contentArea.add([
                this.k.text(`• ${item}`, {
                    font: locale === 'korean' ? 'galmuri' : 'gameboy',
                    size: 14,
                }),
                this.k.pos(0, index * 25),
                this.k.color(200, 200, 200),
                this.k.fixed()
            ]);
        });

        // 인벤토리 용량 표시
        const capacityText = contentArea.add([
            this.k.text(locale === 'korean' ? '용량: 5/20' : 'Capacity: 5/20', {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 12,
            }),
            this.k.pos(0, inventoryItems.length * 25 + 20),
            this.k.color(150, 150, 150),
            this.k.fixed()
        ]);

        // 아이템 정리 버튼
        const sortBtn = contentArea.add([
            this.k.rect(120, 30),
            this.k.pos(0, inventoryItems.length * 25 + 50),
            this.k.color(100, 150, 100),
            this.k.outline(2, this.k.rgb(120, 170, 120)),
            this.k.area(),
            this.k.fixed(),
            "sort-btn"
        ]);

        const sortBtnText = sortBtn.add([
            this.k.text(locale === 'korean' ? '정리하기' : 'Sort Items', {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 12,
            }),
            this.k.pos(60, 15),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);
        this.addHoverEffect(sortBtn);

        sortBtn.onClick(() => {
            this.createNotification(locale === 'korean' ? '아이템이 정리되었습니다!' : 'Items have been sorted!');
        });

        this.uiElements.set('inventory-panel', popup);
        this.uiElements.set('inventory-panel-close', closePopup);
    }

    /**
     * 현재 날짜 변경 (기분 시스템에 반영)
     */
    advanceDay() {
        // 나중에 gameState에 구현될 예정
        if (gameState.advanceDay) {
            gameState.advanceDay();
        }
        this.updateMoodSystem();
        this.createNotification("새로운 날이 시작되었습니다!");
    }

    /**
     * 기분 상태 변경
     */
    changeMood(newMoodIndex) {
        if (typeof newMoodIndex === 'number') {
            this.currentMoodIndex = newMoodIndex;
        } else {
            this.currentMoodIndex = (this.currentMoodIndex + 1) % 5; // 5개 기분 순환
        }
        
        this.updateMoodSystem();
        const locale = gameState.getLocale();
        const moodNames = [
            locale === 'korean' ? '행복' : 'Happy',
            locale === 'korean' ? '보통' : 'Normal',
            locale === 'korean' ? '우울' : 'Sad',
            locale === 'korean' ? '피곤' : 'Tired',
            locale === 'korean' ? '화남' : 'Angry'
        ];
        
        const currentMoodName = moodNames[this.currentMoodIndex % moodNames.length];
        const message = locale === 'korean' ? `기분이 ${currentMoodName}로 변경되었습니다!` : `Mood changed to ${currentMoodName}!`;
        this.createNotification(message);
    }

    /**
     * 퀘스트 진행률 UI 생성
     */
    createQuestProgressUI() {
        const questUI = this.k.add([
            this.k.pos(20, 80),
            this.k.fixed(),
            "ui-quest-progress"
        ]);

        this.uiElements.set('quest-progress', questUI);
        this.updateQuestProgressUI();
        
        return questUI;
    }

    /**
     * 퀘스트 진행률 UI 업데이트
     */
    updateQuestProgressUI() {
        const questUI = this.uiElements.get('quest-progress');
        if (!questUI || !questUI.exists()) return;

        // 기존 텍스트 제거
        questUI.children.forEach(child => {
            if (child.exists()) {
                child.destroy();
            }
        });

        // 현재 진행 중인 퀘스트들 표시
        const activeQuests = gameState.getStudentsWithQuests();
        const locale = gameState.getLocale();
        
        if (activeQuests.length > 0) {
            const titleText = locale === 'korean' ? '진행 중인 퀘스트:' : 'Active Quests:';
            
            questUI.add([
                this.k.text(titleText, {
                    font: locale === 'korean' ? 'galmuri' : 'gameboy',
                    size: 16,
                }),
                this.k.pos(0, 0),
                this.k.color(255, 255, 255),
                this.k.fixed()
            ]);

            activeQuests.forEach((studentId, index) => {
                const questData = gameState.getStudentQuest(studentId);
                const questText = `• ${questData.questType || 'Unknown Quest'}`;
                
                questUI.add([
                    this.k.text(questText, {
                        font: locale === 'korean' ? 'galmuri' : 'gameboy',
                        size: 14,
                    }),
                    this.k.pos(0, 25 + (index * 20)),
                    this.k.color(200, 200, 200),
                    this.k.fixed()
                ]);
            });
        }
    }

    /**
     * 인터렉션 힌트 UI 생성
     */
    createInteractionHint(text, position) {
        const hintId = `interaction-hint-${Date.now()}`;
        const locale = gameState.getLocale();
        
        const hint = this.k.add([
            this.k.text(text, {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 12,
            }),
            this.k.pos(position.x, position.y - 40),
            this.k.color(255, 255, 0),
            this.k.anchor("center"),
            this.k.z(100),
            hintId
        ]);

        // 3초 후 자동 제거
        this.k.wait(3, () => {
            if (hint.exists()) {
                hint.destroy();
            }
        });

        return hint;
    }

    /**
     * 알림 메시지 UI 생성
     */
    createNotification(message, duration = 3) {
        const notification = this.k.add([
            this.k.rect(600, 60), // 400에서 600으로 늘림
            this.k.pos(this.k.center().x, 120),
            this.k.anchor("center"),
            this.k.color(0, 0, 0),
            this.k.opacity(0.8),
            this.k.z(200),
            this.k.fixed(),
            "ui-notification"
        ]);

        const notificationText = notification.add([
            this.k.text(message, {
                font: gameState.getLocale() === 'korean' ? 'galmuri' : 'gameboy',
                size: 16,
                width: 580, // 알림창 너비에 맞춰 텍스트 너비 설정
                align: "center"
            }),
            this.k.pos(0, 0),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.fixed()
        ]);

        // 페이드인 애니메이션
        notification.opacity = 0;
        this.k.tween(0, 0.8, 0.3, (val) => {
            notification.opacity = val;
        });

        // 지정된 시간 후 페이드아웃
        this.k.wait(duration, () => {
            if (notification.exists()) {
                this.k.tween(0.8, 0, 0.3, (val) => {
                    notification.opacity = val;
                }).then(() => {
                    if (notification.exists()) {
                        notification.destroy();
                    }
                });
            }
        });

        return notification;
    }

    /**
     * 로딩 스피너 생성
     */
    createLoadingSpinner() {
        const locale = gameState.getLocale();
        const spinner = this.k.add([
            this.k.text("Loading...", {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 20,
            }),
            this.k.pos(this.k.center()),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.z(300),
            this.k.fixed(),
            "ui-loading"
        ]);

        // 회전 애니메이션
        let rotation = 0;
        spinner.onUpdate(() => {
            rotation += this.k.dt() * 180;
            spinner.angle = rotation;
        });

        this.uiElements.set('loading', spinner);
        return spinner;
    }

    /**
     * 모든 UI 요소 업데이트
     */
    updateAll() {
        this.updateMoodSystem();
        this.updateRightPanel();
        this.updateQuestProgressUI();
    }

    /**
     * UI 표시/숨김 토글
     */
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        
        this.uiElements.forEach((element) => {
            if (element.exists()) {
                element.opacity = this.isVisible ? 1 : 0;
            }
        });
    }

    /**
     * 특정 UI 요소 제거
     */
    removeElement(elementId) {
        const element = this.uiElements.get(elementId);
        if (element && element.exists()) {
            element.destroy();
            this.uiElements.delete(elementId);
        }
    }

    /**
     * 전역 음소거 토글
     */
    toggleGlobalMute() {
        const currentMuted = gameState.getIsMuted();
        const newMuted = !currentMuted;
        gameState.setIsMuted(newMuted);
        
        // audioManager를 통한 음소거 처리
        if (window.audioManager) {
            if (newMuted) {
                window.audioManager.stopBGM();
            } else {
                // 현재 BGM 재시작
                window.audioManager.resumeCurrentBGM();
            }
        }
        
        const locale = gameState.getLocale();
        const msgText = locale === 'korean'
            ? (newMuted ? '음소거되었습니다!' : '음소거가 해제되었습니다!')
            : (newMuted ? 'Audio muted!' : 'Audio unmuted!');
        
        this.createNotification(msgText);
    }

    /**
     * 모든 UI 요소 정리
     */
    cleanup() {
        this.uiElements.forEach((element, id) => {
            if (element.exists()) {
                element.destroy();
            }
        });
        this.uiElements.clear();
        this.initialized = false;
    }

    /**
     * 디버그 정보 표시
     */
    showDebugInfo() {
        const locale = gameState.getLocale();
        const debugInfo = this.k.add([
            this.k.text("Debug Info", {
                font: locale === 'korean' ? 'galmuri' : 'gameboy',
                size: 14,
            }),
            this.k.pos(this.k.width() - 150, 20),
            this.k.anchor("topright"),
            this.k.color(0, 255, 0),
            this.k.z(500),
            this.k.fixed(),
            "ui-debug"
        ]);

        this.uiElements.set('debug', debugInfo);
        return debugInfo;
    }
}

// 싱글톤 인스턴스를 위한 팩토리 함수
let uiManagerInstance = null;

export function createUIManager(k) {
    if (!uiManagerInstance) {
        uiManagerInstance = new UIManager(k);
    } else {
        // 기존 인스턴스가 있으면 k 인스턴스만 업데이트
        uiManagerInstance.k = k;
    }
    return uiManagerInstance;
}

export function getUIManager() {
    return uiManagerInstance;
}

// 싱글톤 인스턴스 접근을 위한 클래스 메서드
UIManager.getInstance = function() {
    return uiManagerInstance;
};

// 씬 변경 시 UIManager 인스턴스 리셋
export function resetUIManager() {
    if (uiManagerInstance) {
        uiManagerInstance.cleanup();
        uiManagerInstance = null;
    }
}
