import { questManager } from "./questSystem.js";
import { gameState } from "../state/stateManagers.js";

/**
 * 퀘스트 UI 관련 유틸리티들
 */

// 말풍선 감정 상태 상수 정의
export const SPEECH_BUBBLE_STATES = {
    QUEST: 0, // 퀘스트 있는 상태
    VERY_HAPPY: 1, // 매우 만족한 상태
    NEUTRAL: 2, // 그냥 그런 상태
    SAD: 3, // 슬픈상태
    ANGRY: 4, // 화남
    UPSET: 5, // 언짢음
    HAPPY: 6, // 만족한 상태
    EMPTY: 7, // 빈 말풍선
};

/**
 * 퀘스트 말풍선 생성
 * @param {*} k - Kaboom 인스턴스
 * @param {*} student - 학생 객체
 * @param {*} map - 맵 객체
 * @returns {Object} 말풍선 객체
 */
export function addQuestBubble(k, student, map) {
    const questBubble = map.add([
        k.sprite("quest-exclamation", {
            frame: SPEECH_BUBBLE_STATES.QUEST,
        }),
        k.pos(student.pos.x - 8, student.pos.y - 12),
        k.anchor("center"),
        k.scale(1.0),
        k.z(20),
        k.opacity(1.0),
        "quest-bubble",
        { studentId: student.studentType },
    ]);

    let time = 0;
    let bounceDirection = 1;
    let pulseScale = 1.0;
    const minScale = 0.9;
    const maxScale = 1.1;
    const bounceSpeed = 3.0;
    const pulseSpeed = 0.015;

    questBubble.onUpdate(() => {
        time += k.dt();

        // 바운스 애니메이션 (위아래로 움직임)
        const bounceOffset = Math.sin(time * bounceSpeed) * 0.1;
        questBubble.pos.x = student.pos.x + 8;
        questBubble.pos.y = student.pos.y - 7 + bounceOffset;

        // 펄스 애니메이션 (크기 변화)
        pulseScale += bounceDirection * pulseSpeed;
        if (pulseScale >= maxScale) {
            pulseScale = maxScale;
            bounceDirection = -1;
        } else if (pulseScale <= minScale) {
            pulseScale = minScale;
            bounceDirection = 1;
        }
        questBubble.scale = pulseScale;
    });

    // student 객체에 말풍선 참조 저장
    student.questBubble = questBubble;

    return questBubble;
}

/**
 * 다른 감정 상태 말풍선을 생성하는 헬퍼 함수
 * @param {*} k - Kaboom 인스턴스
 * @param {*} student - 학생 객체
 * @param {*} map - 맵 객체
 * @param {number} emotionState - 감정 상태
 * @returns {Object} 말풍선 객체
 */
export function addEmotionBubble(k, student, map, emotionState) {
    const emotionBubble = map.add([
        k.sprite("quest-exclamation", {
            frame: emotionState,
        }),
        k.pos(student.pos.x + 8, student.pos.y - 7),
        k.anchor("center"),
        k.scale(1.0),
        k.z(20),
        k.opacity(1.0),
        "emotion-bubble",
        { studentId: student.studentType },
    ]);

    let time = 0;
    let bounceDirection = 1;
    let pulseScale = 1.0;
    const minScale = 0.9;
    const maxScale = 1.1;
    const bounceSpeed = 3.0;
    const pulseSpeed = 0.015;

    emotionBubble.onUpdate(() => {
        time += k.dt();

        // 바운스 애니메이션
        const bounceOffset = Math.sin(time * bounceSpeed) * 0.1;
        emotionBubble.pos.x = student.pos.x + 8;
        emotionBubble.pos.y = student.pos.y - 7 + bounceOffset;

        // 펄스 애니메이션
        pulseScale += bounceDirection * pulseSpeed;
        if (pulseScale >= maxScale) {
            pulseScale = maxScale;
            bounceDirection = -1;
        } else if (pulseScale <= minScale) {
            pulseScale = minScale;
            bounceDirection = 1;
        }
        emotionBubble.scale = pulseScale;
    });

    student.emotionBubble = emotionBubble;

    return emotionBubble;
}

/**
 * 퀘스트 말풍선 제거
 * @param {*} k - Kaboom 인스턴스
 * @param {*} student - 학생 객체
 */
export function removeQuestBubble(k, student) {
    if (student.questBubble && student.questBubble.exists()) {
        student.questBubble.destroy();
        student.questBubble = null;
    }
}

/**
 * 퀘스트 말풍선 상태 업데이트
 * @param {*} k - Kaboom 인스턴스
 * @param {*} students - 학생 배열
 * @param {*} map - 맵 객체
 */
export function updateQuestBubbles(k, students, map) {
    students.forEach((student) => {
        if (!student.exists()) return;

        const questData = gameState.getStudentQuest(student.studentType);
        const shouldShowBubble = questData.hasQuest && !questData.isCompleted;

        if (shouldShowBubble && !student.questBubble) {
            // 퀘스트가 있는데 말풍선이 없으면 생성
            addQuestBubble(k, student, map);
        } else if (!shouldShowBubble && student.questBubble) {
            // 퀘스트가 없는데 말풍선이 있으면 제거
            removeQuestBubble(k, student);
        }
    });
}

/**
 * 퀘스트 말풍선 시스템 초기화
 * @param {*} k - Kaboom 인스턴스
 * @param {*} students - 학생 배열
 * @param {*} map - 맵 객체
 */
export function initializeQuestBubbles(k, students, map) {
    // 모든 학생에 대해 초기 퀘스트 말풍선 상태 설정
    updateQuestBubbles(k, students, map);
}

/**
 * 퀘스트 완료 시 축하 말풍선 표시
 * @param {*} k - Kaboom 인스턴스
 * @param {*} student - 학생 객체
 * @param {*} map - 맵 객체
 */
export function showQuestCompletionBubble(k, student, map) {
    // 기존 퀘스트 말풍선 제거
    removeQuestBubble(k, student);
    
    // 행복한 감정 말풍선 표시
    addEmotionBubble(k, student, map, SPEECH_BUBBLE_STATES.VERY_HAPPY);
    
    // 3초 후 자동으로 제거
    k.wait(3, () => {
        if (student.emotionBubble && student.emotionBubble.exists()) {
            student.emotionBubble.destroy();
            student.emotionBubble = null;
        }
    });
}

/**
 * 퀘스트 진행률 표시 UI (간단한 텍스트 형태)
 * @param {*} k - Kaboom 인스턴스
 * @param {string} studentId - 학생 ID
 * @returns {string} 진행률 텍스트
 */
export function getQuestProgressText(studentId) {
    const questStatus = questManager.getStudentQuestStatus(studentId);
    if (!questStatus) return "";

    const progress = questManager.getQuestProgress(questStatus.questId);
    const percentage = Math.round(progress * 100);
    
    const locale = gameState.getLocale();
    const title = questStatus.definition.title[locale] || questStatus.definition.title.korean;
    
    return `${title}: ${percentage}%`;
}

/**
 * 퀘스트 목표 텍스트 반환
 * @param {string} studentId - 학생 ID
 * @returns {Array} 목표 텍스트 배열
 */
export function getQuestObjectivesText(studentId) {
    const questStatus = questManager.getStudentQuestStatus(studentId);
    if (!questStatus) return [];

    const locale = gameState.getLocale();
    
    return questStatus.objectives.map(obj => {
        const title = obj.title[locale] || obj.title.korean;
        const status = obj.completed ? "✅" : "⏳";
        const progress = obj.target > 1 ? ` (${obj.progress}/${obj.target})` : "";
        
        return `${status} ${title}${progress}`;
    });
}
