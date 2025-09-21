import { gameState } from "../state/stateManagers.js";

/**
 * 퀘스트 시스템 핵심 관리자
 */
export class QuestManager {
    constructor() {
        this.questDefinitions = new Map();
        this.questProgress = new Map();
        this.questEvents = new Map();
    }

    /**
     * 퀘스트 정의 등록
     * @param {string} questId - 퀘스트 ID
     * @param {Object} questData - 퀘스트 데이터
     */
    registerQuest(questId, questData) {
        this.questDefinitions.set(questId, {
            id: questId,
            title: questData.title,
            description: questData.description,
            type: questData.type,
            objectives: questData.objectives || [],
            rewards: questData.rewards || [],
            prereqs: questData.prereqs || [],
            isRepeatable: questData.isRepeatable || false,
            ...questData
        });
    }

    /**
     * 퀘스트 시작
     * @param {string} questId - 퀘스트 ID
     * @param {string} studentId - 학생 ID
     */
    startQuest(questId, studentId) {
        const questDef = this.questDefinitions.get(questId);
        if (!questDef) {
            console.error(`퀘스트 정의를 찾을 수 없습니다: ${questId}`);
            return false;
        }

        // 전제 조건 확인
        if (!this.checkPrerequisites(questId)) {
            console.log(`퀘스트 전제 조건이 충족되지 않았습니다: ${questId}`);
            return false;
        }

        // 퀘스트 진행 상태 초기화
        const progressData = {
            questId,
            studentId,
            status: 'active',
            startTime: Date.now(),
            objectives: questDef.objectives.map(obj => ({
                ...obj,
                completed: false,
                progress: 0
            }))
        };

        this.questProgress.set(questId, progressData);
        
        // 글로벌 상태 업데이트
        gameState.setStudentQuest(studentId, true, questDef.type);

        // 5초 후 새로운 퀘스트 알림 표시
        if (typeof window !== 'undefined' && window.notificationManager) {
            setTimeout(() => {
                const locale = gameState.getLocale ? gameState.getLocale() : 'korean';
                const title = questDef.title[locale] || questDef.title.korean || questDef.title;
                console.log(`[DEBUG] 새 퀘스트 추가 알림 표시: ${title}`);
                window.notificationManager.addNotification({
                    type: 'quest-added',
                    message: title,
                    questTitle: title
                });
            }, 3000); // 3초 지연 (원래 8초에서 단축)
        }

        console.log(`퀘스트 시작: ${questDef.title || questDef.type} (${studentId})`);
        return true;
    }

    /**
     * 퀘스트 진행 상황 업데이트
     * @param {string} questId - 퀘스트 ID
     * @param {string} objectiveId - 목표 ID
     * @param {number} progress - 진행도
     */
    updateProgress(questId, objectiveId, progress = 1) {
        const questProgress = this.questProgress.get(questId);
        if (!questProgress) return false;

        const objective = questProgress.objectives.find(obj => obj.id === objectiveId);
        if (!objective) return false;

        objective.progress = Math.min(objective.progress + progress, objective.target);
        objective.completed = objective.progress >= objective.target;

        // 퀘스트 완료 확인
        if (this.isQuestCompleted(questId)) {
            this.completeQuest(questId);
        }

        return true;
    }

    /**
     * 퀘스트 완료 처리
     * @param {string} questId - 퀘스트 ID
     */
    completeQuest(questId) {
        const questProgress = this.questProgress.get(questId);
        if (!questProgress) return false;

        questProgress.status = 'completed';
        questProgress.completedTime = Date.now();

        // 글로벌 상태 업데이트
        gameState.completeStudentQuest(questProgress.studentId);

        // 보상 지급
        this.giveRewards(questId);

        // 완료된 퀘스트의 전제조건으로 대기 중인 퀘스트들 확인 및 시작
        this.checkAndStartDependentQuests(questId);

        // 퀘스트 완료 알림 표시
        if (typeof window !== 'undefined' && window.showQuestCompletionMessage) {
            const locale = gameState.getLocale ? gameState.getLocale() : 'korean';
            const questDef = this.questDefinitions.get(questId);
            const title = questDef.title[locale] || questDef.title.korean || questDef.title;
            window.showQuestCompletionMessage(title);
        }

        console.log(`퀘스트 완료: ${questId}`);
        return true;
    }

    /**
     * 퀘스트 완료 여부 확인
     * @param {string} questId - 퀘스트 ID
     * @returns {boolean}
     */
    isQuestCompleted(questId) {
        const questProgress = this.questProgress.get(questId);
        if (!questProgress) return false;

        return questProgress.objectives.every(obj => obj.completed);
    }

    /**
     * 전제 조건 확인
     * @param {string} questId - 퀘스트 ID
     * @returns {boolean}
     */
    checkPrerequisites(questId) {
        const questDef = this.questDefinitions.get(questId);
        if (!questDef.prereqs || questDef.prereqs.length === 0) return true;

        return questDef.prereqs.every(prereq => {
            const progress = this.questProgress.get(prereq);
            return progress && progress.status === 'completed';
        });
    }

    /**
     * 보상 지급
     * @param {string} questId - 퀘스트 ID
     */
    giveRewards(questId) {
        const questDef = this.questDefinitions.get(questId);
        if (!questDef.rewards) return;

        questDef.rewards.forEach(reward => {
            console.log(`보상 지급: ${reward.type} - ${reward.amount}`);
            // 실제 보상 지급 로직 구현 필요
        });
    }

    /**
     * 활성 퀘스트 목록 반환
     * @returns {Array}
     */
    getActiveQuests() {
        return Array.from(this.questProgress.values())
            .filter(progress => progress.status === 'active');
    }

    /**
     * 완료된 퀘스트 목록 반환
     * @returns {Array}
     */
    getCompletedQuests() {
        return Array.from(this.questProgress.values())
            .filter(progress => progress.status === 'completed');
    }

    /**
     * 특정 학생의 퀘스트 상태 반환
     * @param {string} studentId - 학생 ID
     * @returns {Object|null}
     */
    getStudentQuestStatus(studentId) {
        const activeQuest = this.getActiveQuests().find(q => q.studentId === studentId);
        if (!activeQuest) return null;

        const questDef = this.questDefinitions.get(activeQuest.questId);
        return {
            ...activeQuest,
            definition: questDef
        };
    }

    /**
     * 퀘스트 진행률 계산
     * @param {string} questId - 퀘스트 ID
     * @returns {number} 0-1 사이의 진행률
     */
    getQuestProgress(questId) {
        const questProgress = this.questProgress.get(questId);
        if (!questProgress) return 0;

        const totalObjectives = questProgress.objectives.length;
        const completedObjectives = questProgress.objectives.filter(obj => obj.completed).length;
        
        return completedObjectives / totalObjectives;
    }

    /**
     * 완료된 퀘스트를 전제조건으로 하는 퀘스트들을 찾고 시작
     * @param {string} completedQuestId - 완료된 퀘스트 ID
     */
    checkAndStartDependentQuests(completedQuestId) {
        // 모든 퀘스트 정의를 확인하여 완료된 퀘스트를 전제조건으로 하는 퀘스트 찾기
        for (const [questId, questDef] of this.questDefinitions) {
            // 이미 시작된 퀘스트는 제외
            if (this.questProgress.has(questId)) continue;
            
            // 전제조건에 완료된 퀘스트가 포함되어 있는지 확인
            if (questDef.prereqs && questDef.prereqs.includes(completedQuestId)) {
                // 모든 전제조건이 만족되는지 확인
                if (this.checkPrerequisites(questId)) {
                    // 해당 퀘스트의 학생 ID 찾기 (STUDENT_QUEST_MAPPING 사용)
                    const studentId = this.findStudentForQuest(questId);
                    if (studentId) {
                        console.log(`🎯 전제조건 만족: ${questId} 퀘스트를 ${studentId}에게 시작`);
                        this.startQuest(questId, studentId);
                    }
                }
            }
        }
    }

    /**
     * 퀘스트 ID로 해당 학생 ID 찾기
     * @param {string} questId - 퀘스트 ID
     * @returns {string|null} 학생 ID
     */
    findStudentForQuest(questId) {
        // questDefinitions.js에서 STUDENT_QUEST_MAPPING을 참조
        // 이는 임시 방법이므로 나중에 더 나은 방법으로 개선 가능
        const mapping = {
            'sports_festival': 'student1',
            'club_activity': 'student4'
        };
        return mapping[questId] || null;
    }
}

// 싱글톤 인스턴스
export const questManager = new QuestManager();
