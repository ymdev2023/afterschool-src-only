/**
 * 알림 텍스트 매니저 - 여러 알림이 동시에 뜨는 것을 방지하고 순차적으로 표시
 */
import { UI_POSITIONS, UI_SIZES, NOTIFICATION_INTERVAL } from "../uiComponents/uiConstants.js";

class NotificationManager {
    constructor(k) {
        this.k = k;
        this.queue = []; // 알림 대기열
        this.isShowing = false; // 현재 알림 표시 중인지 여부
        this.currentNotification = null; // 현재 표시 중인 알림
        
        // 알림 우선순위 정의 (높은 숫자가 높은 우선순위)
        this.priorityLevels = {
            'quest-completion': 5,    // 퀘스트 완료 (최고 우선순위)
            'quest-added': 4,         // 퀘스트 추가
            'status': 3,              // 상태 변화 (기분/체력)
            'info': 2,                // 일반 정보
            'system': 1               // 시스템 알림 (자동저장 등) - 가장 낮은 우선순위
        };
        
        // 알림 간격 설정 (전역 상수 사용)
        this.notificationInterval = NOTIFICATION_INTERVAL;
    }

    /**
     * 알림을 대기열에 추가 (우선순위 기반 정렬)
     * @param {Object} notification - 알림 정보
     */
    addNotification(notification) {
        // 중복 알림 방지 (같은 메시지가 이미 대기열에 있는지 확인)
        const isDuplicate = this.queue.some(queuedNotification => 
            queuedNotification.message === notification.message && 
            queuedNotification.type === notification.type
        );
        
        if (isDuplicate) {
            console.log(`⚠️ 중복 알림 무시: ${notification.type} - ${notification.message}`);
            return;
        }
        
        // 우선순위 설정
        const priority = this.priorityLevels[notification.type] || 1;
        const notificationWithPriority = { ...notification, priority };
        
        // 우선순위가 높은 순서대로 대기열에 삽입
        let inserted = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].priority < priority) {
                this.queue.splice(i, 0, notificationWithPriority);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            this.queue.push(notificationWithPriority);
        }
        
        console.log(`📬 알림 대기열 추가 (우선순위: ${priority}, 대기열: ${this.queue.length}개): ${notification.type} - ${notification.message}`);
        this.processQueue();
    }

    /**
     * 대기열 처리 (간격 조절 포함)
     */
    async processQueue() {
        if (this.isShowing || this.queue.length === 0) {
            return;
        }

        const notification = this.queue.shift();
        await this.showNotification(notification);
        
        // 다음 알림까지 대기 (간격 조절)
        if (this.queue.length > 0) {
            setTimeout(() => {
                this.processQueue();
            }, this.notificationInterval);
        }
    }

    /**
     * 알림 표시
     * @param {Object} notification - 알림 정보
     */
    async showNotification(notification) {
        this.isShowing = true;
        this.currentNotification = notification;

        console.log(`📢 알림 표시: ${notification.type} - ${notification.message}`);

        switch (notification.type) {
            case 'status':
            case 'system':  // 시스템 알림도 status와 동일하게 처리
                await this.showStatusText(notification);
                break;
            case 'quest-completion':
                await this.showQuestCompletionText(notification);
                break;
            case 'quest-added':
                await this.showQuestAddedText(notification);
                break;
            default:
                console.warn(`알 수 없는 알림 타입: ${notification.type}`);
                this.isShowing = false;
                this.processQueue(); // 다음 알림 처리
        }
    }

    /**
     * 상태 변화 텍스트 표시
     */
    async showStatusText(notification) {
        const message = notification.message;
        
        // 색상 설정
        const COLOR_RED = this.k.Color.fromHex("#ff6b6b");
        const COLOR_GREEN = this.k.Color.fromHex("#51cf66");
        const COLOR_BLUE = this.k.Color.fromHex("#4dabf7");
        
        let textColor;
        if (notification.statusType === 'mood') {
            textColor = notification.changeType === 'increase' ? COLOR_GREEN : COLOR_RED;
        } else if (notification.statusType === 'health') {
            textColor = notification.changeType === 'increase' ? COLOR_GREEN : COLOR_RED;
        } else {
            textColor = COLOR_BLUE;
        }

        const messageText = this.k.add([
            this.k.text(message, {
                size: 18,
                font: "galmuri",
                align: "center",
            }),
            this.k.pos(this.k.width() / 2, UI_POSITIONS.NOTIFICATION.Y), // 전역 상수 사용
            this.k.anchor("center"),
            this.k.color(textColor),
            this.k.z(250),
            this.k.fixed(),
            "notification-text",
        ]);

        // 효과음 재생 (자동저장 알림은 제외)
        try {
            if (notification.statusType !== 'system') { // 시스템 알림(자동저장)은 효과음 없음
                if (notification.changeType === 'increase') {
                    this.k.play("coin-sfx", { volume: 0.3 });
                } else {
                    this.k.play("boop-sfx", { volume: 0.3 });
                }
            }
        } catch (error) {
            console.warn("알림 효과음 재생 실패:", error);
        }

        // 2초 후 페이드아웃
        await this.k.wait(2);
        
        // 페이드 아웃 효과
        const fadeOut = this.k.tween(
            1,
            0,
            0.5,
            (val) => messageText.opacity = val,
            this.k.easings.easeOutQuad
        );

        await fadeOut;
        messageText.destroy();

        this.onNotificationComplete();
    }

    /**
     * 퀘스트 완료 텍스트 표시
     */
    async showQuestCompletionText(notification) {
        const COLOR_GREEN = this.k.Color.fromHex("#51cf66");

        const messageText = this.k.add([
            this.k.text(notification.message, {
                size: 18,
                font: "galmuri",
                align: "center",
            }),
            this.k.pos(this.k.width() / 2, UI_POSITIONS.NOTIFICATION.Y), // 전역 상수 사용
            this.k.anchor("center"),
            this.k.color(COLOR_GREEN),
            this.k.z(UI_SIZES.Z_INDEX.NOTIFICATIONS),
            this.k.fixed(),
            "notification-text",
        ]);

        // 효과음 재생
        try {
            this.k.play("coin-sfx", { volume: 0.5 });
        } catch (error) {
            console.warn("퀘스트 완료 효과음 재생 실패:", error);
        }

        // 3초 후 페이드아웃
        await this.k.wait(3);
        
        // 페이드 아웃 효과
        const fadeOut = this.k.tween(
            1,
            0,
            0.5,
            (val) => messageText.opacity = val,
            this.k.easings.easeOutQuad
        );

        await fadeOut;
        messageText.destroy();

        this.onNotificationComplete();
    }

    /**
     * 퀘스트 추가 텍스트 표시
     */
    async showQuestAddedText(notification) {
        const COLOR_BLUE = this.k.Color.fromHex("#4dabf7");

        const messageText = this.k.add([
            this.k.text(notification.message, {
                size: 18,
                font: "galmuri",
                align: "center",
            }),
            this.k.pos(this.k.width() / 2, UI_POSITIONS.NOTIFICATION.Y), // 전역 상수 사용
            this.k.anchor("center"),
            this.k.color(COLOR_BLUE),
            this.k.z(UI_SIZES.Z_INDEX.NOTIFICATIONS),
            this.k.fixed(),
            "notification-text",
        ]);

        // 효과음 재생
        try {
            this.k.play("bubble-sfx", { volume: 0.3 });
        } catch (error) {
            console.warn("퀘스트 추가 효과음 재생 실패:", error);
        }

        // 2.5초 후 페이드아웃
        await this.k.wait(2.5);
        
        // 페이드 아웃 효과
        const fadeOut = this.k.tween(
            1,
            0,
            0.5,
            (val) => messageText.opacity = val,
            this.k.easings.easeOutQuad
        );

        await fadeOut;
        messageText.destroy();

        this.onNotificationComplete();
    }

    /**
     * 알림 완료 처리
     */
    onNotificationComplete() {
        console.log(`✅ 알림 표시 완료, 대기열 남은 개수: ${this.queue.length}`);
        this.isShowing = false;
        this.currentNotification = null;
        
        // 다음 알림 처리
        this.processQueue();
    }

    /**
     * 현재 알림 제거
     */
    clearCurrent() {
        const currentTexts = this.k.get("notification-text");
        currentTexts.forEach(text => text.destroy());
        
        this.isShowing = false;
        this.currentNotification = null;
    }

    /**
     * 모든 알림 제거
     */
    clearAll() {
        this.queue = [];
        this.clearCurrent();
    }

    /**
     * 정리
     */
    cleanup() {
        this.clearAll();
    }
}

export default NotificationManager;
