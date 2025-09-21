import { questManager } from "./questSystem.js";

/**
 * 기본 퀘스트 정의들
 */
export const QUEST_DEFINITIONS = {
    // 체육대회 퀘스트
    SPORTS_FESTIVAL: {
        id: 'sports_festival',
        title: {
            korean: '[Q01] 체육대회 준비',
            english: '[Q01] Sports Festival Preparation'
        },
        description: {
            korean: '다가오는 체육대회를 위해 준비를 도와주세요.',
            english: 'Help prepare for the upcoming sports festival.'
        },
        type: '체육대회',
        objectives: [
            {
                id: 'find_equipment',
                title: {
                    korean: '체육 용품 찾기',
                    english: 'Find Sports Equipment'
                },
                description: {
                    korean: '체육대회에 필요한 용품들을 찾아주세요.',
                    english: 'Find the equipment needed for the sports festival.'
                },
                type: 'collect',
                target: 3,
                progress: 0,
                completed: false
            },
            {
                id: 'talk_to_teacher',
                title: {
                    korean: '체육 선생님과 대화',
                    english: 'Talk to PE Teacher'
                },
                description: {
                    korean: '체육 선생님과 대회 일정에 대해 상의하세요.',
                    english: 'Discuss the competition schedule with the PE teacher.'
                },
                type: 'talk',
                target: 1,
                progress: 0,
                completed: false
            }
        ],
        rewards: [
            {
                type: 'experience',
                amount: 100
            },
            {
                type: 'item',
                id: 'sports_medal',
                amount: 1
            }
        ],
        prereqs: [],
        isRepeatable: false
    },

    // 동아리 퀘스트
    CLUB_ACTIVITY: {
        id: 'club_activity',
        title: {
            korean: '[Q02] 동아리 활동',
            english: '[Q02] Club Activity'
        },
        description: {
            korean: '동아리 활동에 참여하고 새로운 친구들을 만나보세요.',
            english: 'Participate in club activities and meet new friends.'
        },
        type: '동아리',
        objectives: [
            {
                id: 'join_club',
                title: {
                    korean: '동아리 가입',
                    english: 'Join Club'
                },
                description: {
                    korean: '관심 있는 동아리에 가입하세요.',
                    english: 'Join a club you are interested in.'
                },
                type: 'interact',
                target: 1,
                progress: 0,
                completed: false
            },
            {
                id: 'attend_meeting',
                title: {
                    korean: '동아리 모임 참석',
                    english: 'Attend Club Meeting'
                },
                description: {
                    korean: '동아리 정기 모임에 참석하세요.',
                    english: 'Attend the regular club meeting.'
                },
                type: 'attend',
                target: 1,
                progress: 0,
                completed: false
            },
            {
                id: 'help_project',
                title: {
                    korean: '동아리 프로젝트 도움',
                    english: 'Help Club Project'
                },
                description: {
                    korean: '동아리 프로젝트를 도와주세요.',
                    english: 'Help with the club project.'
                },
                type: 'help',
                target: 1,
                progress: 0,
                completed: false
            }
        ],
        rewards: [
            {
                type: 'experience',
                amount: 150
            },
            {
                type: 'item',
                id: 'club_badge',
                amount: 1
            }
        ],
        prereqs: [],
        isRepeatable: false
    }
};

/**
 * 퀘스트 시스템 초기화
 */
export function initializeQuests() {
    console.log('🎯 퀘스트 시스템 초기화 중...');
    
    // 모든 퀘스트 정의 등록
    Object.values(QUEST_DEFINITIONS).forEach(questDef => {
        questManager.registerQuest(questDef.id, questDef);
    });

    // 기본 퀘스트들 자동 시작 (전제조건 확인)
    questManager.startQuest('sports_festival', 'student1');
    questManager.startQuest('club_activity', 'student4');

    console.log('✅ 퀘스트 시스템 초기화 완료');
}

/**
 * 퀘스트 타입별 목표 달성 체크 함수들
 */
export const QuestObjectiveCheckers = {
    // 아이템 수집 체크
    collect: (questId, objectiveId, itemId) => {
        return questManager.updateProgress(questId, objectiveId, 1);
    },

    // 대화 체크
    talk: (questId, objectiveId, npcId) => {
        return questManager.updateProgress(questId, objectiveId, 1);
    },

    // 상호작용 체크
    interact: (questId, objectiveId, targetId) => {
        return questManager.updateProgress(questId, objectiveId, 1);
    },

    // 참석 체크
    attend: (questId, objectiveId, eventId) => {
        return questManager.updateProgress(questId, objectiveId, 1);
    },

    // 도움 체크
    help: (questId, objectiveId, taskId) => {
        return questManager.updateProgress(questId, objectiveId, 1);
    }
};

/**
 * 퀘스트 완료 체크 및 자동 진행 함수
 */
export function checkQuestObjective(action, targetId, additionalData = {}) {
    const activeQuests = questManager.getActiveQuests();
    
    activeQuests.forEach(quest => {
        quest.objectives.forEach(objective => {
            if (!objective.completed && objective.type === action) {
                const checker = QuestObjectiveCheckers[action];
                if (checker) {
                    const result = checker(quest.questId, objective.id, targetId, additionalData);
                    if (result) {
                        console.log(`📋 퀘스트 목표 달성: ${quest.questId} - ${objective.id}`);
                    }
                }
            }
        });
    });
}

/**
 * 학생 ID로 퀘스트 ID 매핑
 */
export const STUDENT_QUEST_MAPPING = {
    student1: 'sports_festival',
    student4: 'club_activity'
};

/**
 * 학생의 현재 퀘스트 정보 반환
 */
export function getStudentQuest(studentId) {
    const questId = STUDENT_QUEST_MAPPING[studentId];
    if (!questId) return null;
    
    return questManager.getStudentQuestStatus(studentId);
}
