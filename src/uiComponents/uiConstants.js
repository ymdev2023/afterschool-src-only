// 전역 UI 상수 관리
// 모든 씬에서 일관된 UI 위치와 크기를 보장

// Safe Area 패딩 상수 (설정 아이콘 위치 기준)
export const SAFE_AREA = {
    TOP: 20,     // 상단 패딩
    RIGHT: 20,   // 우측 패딩  
    BOTTOM: 20,  // 하단 패딩
    LEFT: 20     // 좌측 패딩
};

// UI 요소 위치 상수
export const UI_POSITIONS = {
    // 알림메시지 위치 (가장 상단)
    NOTIFICATION: {
        Y: 50,  // 편지 아이콘과 같은 높이
        X: 'center' // 화면 중앙
    },
    
    // 상태바 위치 (알림메시지와 같은 높이)
    STATUS_BAR: {
        Y: 50,  // 알림메시지와 동일
        X: 40   // LEFT + 20 (Safe Area 적용)
    },
    
    // 아이콘 위치 (알림메시지와 같은 높이)
    ICONS: {
        QUEST: {
            Y: 50,  // 알림메시지와 동일
            X: 'right-120' // 화면 우측에서 120px + Safe Area
        },
        SETTINGS: {
            Y: 50,  // 알림메시지와 동일
            X: 'right-60'  // 화면 우측에서 60px + Safe Area
        }
    },
    
    // 팝업 위치 (알림메시지 아래 30px 간격)
    POPUPS: {
        Y: 80,  // 알림메시지(Y: 50) + 30px
        X: 'center', // 화면 중앙
        WIDTH: 0.8,  // 화면 너비의 80% (퀘스트 창은 이 값 사용)
        HEIGHT: 0.7  // 화면 높이의 70%
    },
    
    // 퀘스트 창 전용 크기
    QUEST_POPUP: {
        Y: 'center',  // 화면 중앙 (세로)
        X: 'center', // 화면 중앙 (가로)
        WIDTH: 0.64,  // 화면 너비의 64% (기존 80%에서 80%로 줄임: 0.8 * 0.8 = 0.64)
        HEIGHT: 0.7  // 화면 높이의 70%
    }
};

    // UI 크기 상수
export const UI_SIZES = {
    ICON_SCALE: 2.0,
    STATUS_BAR_SCALE: 2.0,
    Z_INDEX: {
        STATUS_BAR: 1000,
        ICONS: 1100,
        POPUPS: 150,
        NOTIFICATIONS: 250
    }
};

// 알림메시지 간격 설정 (밀리초)
export const NOTIFICATION_INTERVAL = 3000; // 3초 간격 (겹침 방지)
