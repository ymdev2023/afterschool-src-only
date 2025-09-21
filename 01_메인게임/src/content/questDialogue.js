import { questManager } from "../systems/questSystem.js";
import { gameState } from "../state/stateManagers.js";
import { QUEST_DEFINITIONS } from "../systems/questDefinitions.js";

/**
 * 퀘스트 상태에 따른 학생 대화 내용 관리
 */

// 기본 학생 이름 정의
const STUDENT_NAMES = {
    korean: {
        student1: "정다정",
        student2: "오새롬", 
        student3: "박수진",
        student4: "고혜성",
        student5: "천사라",
        student6: "나소정",
        student7: "권소미",
        student8: "김은수",
    },
    english: {
        student1: "Jung Dajeong",
        student2: "Oh Saerom",
        student3: "Park Sujin", 
        student4: "Go Hyeseong",
        student5: "Cheon Sara",
        student6: "Na Sojeong",
        student7: "Kwon Somi",
        student8: "Lee Jimin",
    },
};

/**
 * 퀘스트 관련 대화 내용
 */
export const QUEST_DIALOGUES = {
    // 체육대회 퀘스트 (student1)
    sports_festival: {
        quest_start: {
            korean: [
                "안녕! 체육대회가 곧 다가온다는 거 알고 있어?",
                "나는 정말 기대가 되는데... 하지만 준비할 게 너무 많아.",
                "혹시 체육대회 준비를 도와줄 수 있어?",
                "체육 용품들도 찾아야 하고, 선생님과도 상의해야 하거든.",
                "도와주면 정말 고마울 것 같아!"
            ],
            english: [
                "Hi! Do you know the sports festival is coming soon?",
                "I'm really excited about it... but there's so much to prepare.",
                "Could you help me prepare for the sports festival?",
                "We need to find sports equipment and talk to the teacher.",
                "I'd really appreciate your help!"
            ]
        },
        quest_in_progress: {
            korean: [
                "체육대회 준비 잘 진행되고 있어?",
                "아직 해야 할 일이 많이 남아있는 것 같은데...",
                "화이팅! 우리 함께 열심히 해보자!"
            ],
            english: [
                "How's the sports festival preparation going?",
                "It seems like there's still a lot to do...",
                "Fighting! Let's work hard together!"
            ]
        },
        quest_completed: {
            korean: [
                "와! 덕분에 체육대회 준비를 완벽하게 마쳤어!",
                "정말 고마워! 이제 체육대회가 더욱 기대돼!",
                "너 같은 친구가 있어서 정말 다행이야!",
                "체육대회 당일에 우리 반이 좋은 성과를 낼 수 있을 것 같아!"
            ],
            english: [
                "Wow! Thanks to you, we've perfectly prepared for the sports festival!",
                "Thank you so much! Now I'm even more excited for the sports festival!",
                "I'm so glad to have a friend like you!",
                "I think our class will do great on the day of the sports festival!"
            ]
        }
    },

    // 동아리 퀘스트 (student4)
    club_activity: {
        quest_start: {
            korean: [
                "안녕! 동아리 활동에 관심이 있어?",
                "요즘 새로운 동아리 부원들을 모집하고 있거든.",
                "우리 동아리에서 재미있는 프로젝트를 진행 중이야.",
                "혹시 동아리 활동을 도와줄 수 있을까?",
                "함께 하면 더 의미 있는 활동이 될 것 같아."
            ],
            english: [
                "Hi! Are you interested in club activities?",
                "We're recruiting new club members these days.",
                "Our club is working on an interesting project.",
                "Could you help with club activities?",
                "I think it would be more meaningful if we do it together."
            ]
        },
        quest_in_progress: {
            korean: [
                "동아리 활동 어떻게 생각해?",
                "처음에는 어색할 수 있지만 금방 적응할 거야.",
                "우리 동아리 사람들 모두 친절하니까 걱정 마!"
            ],
            english: [
                "What do you think about club activities?",
                "It might be awkward at first, but you'll adapt quickly.",
                "Don't worry, everyone in our club is friendly!"
            ]
        },
        quest_completed: {
            korean: [
                "정말 대단해! 동아리 활동을 완벽하게 해냈어!",
                "덕분에 우리 동아리가 더욱 활발해졌어.",
                "이제 진짜 동아리 멤버가 된 것 같아!",
                "앞으로도 함께 재미있는 활동을 해보자!"
            ],
            english: [
                "Amazing! You've perfectly completed the club activities!",
                "Thanks to you, our club has become more active.",
                "Now you feel like a real club member!",
                "Let's continue doing fun activities together!"
            ]
        }
    }
};

/**
 * 학생의 퀘스트 상태에 따른 대화 내용 반환
 * @param {string} studentId - 학생 ID
 * @returns {Array} 대화 내용 배열
 */
export function getQuestDialogue(studentId) {
    const locale = gameState.getLocale();
    const questStatus = questManager.getStudentQuestStatus(studentId);
    
    // 퀘스트가 없는 학생은 기본 대화 반환
    if (!questStatus) {
        return null; // 기본 대화 시스템에서 처리
    }
    
    const questId = questStatus.questId;
    const questDialogue = QUEST_DIALOGUES[questId];
    
    if (!questDialogue) {
        console.warn(`퀘스트 대화를 찾을 수 없습니다: ${questId}`);
        return null;
    }
    
    // 퀘스트 상태에 따른 대화 선택
    let dialogueKey;
    if (questStatus.status === 'completed') {
        dialogueKey = 'quest_completed';
    } else if (questStatus.status === 'active') {
        // 진행률에 따라 대화 변경
        const progress = questManager.getQuestProgress(questId);
        if (progress === 0) {
            dialogueKey = 'quest_start';
        } else {
            dialogueKey = 'quest_in_progress';
        }
    } else {
        dialogueKey = 'quest_start';
    }
    
    return questDialogue[dialogueKey][locale] || questDialogue[dialogueKey].korean;
}

/**
 * 퀘스트 목표 설명 텍스트 반환
 * @param {string} studentId - 학생 ID
 * @returns {Array} 목표 설명 텍스트 배열
 */
export function getQuestObjectiveDialogue(studentId) {
    const locale = gameState.getLocale();
    const questStatus = questManager.getStudentQuestStatus(studentId);
    
    if (!questStatus || questStatus.status === 'completed') {
        return [];
    }
    
    const result = [];
    result.push(locale === 'korean' ? "현재 해야 할 일:" : "Current objectives:");
    
    questStatus.objectives.forEach((objective, index) => {
        const status = objective.completed ? "✅" : "⏳";
        const title = objective.title[locale] || objective.title.korean;
        const progress = objective.target > 1 ? ` (${objective.progress}/${objective.target})` : "";
        
        result.push(`${status} ${title}${progress}`);
    });
    
    return result;
}

/**
 * 학생 이름 반환
 * @param {string} studentId - 학생 ID
 * @returns {string} 학생 이름
 */
export function getStudentName(studentId) {
    const locale = gameState.getLocale();
    return STUDENT_NAMES[locale][studentId] || studentId;
}

/**
 * 퀘스트 완료 축하 메시지 반환
 * @param {string} studentId - 학생 ID
 * @returns {Array} 축하 메시지 배열
 */
export function getQuestCompletionMessage(studentId) {
    const locale = gameState.getLocale();
    const questStatus = questManager.getStudentQuestStatus(studentId);
    
    if (!questStatus || questStatus.status !== 'completed') {
        return [];
    }
    
    const questDialogue = QUEST_DIALOGUES[questStatus.questId];
    if (!questDialogue) {
        return locale === 'korean' ? 
            ["퀘스트를 완료했습니다!"] : 
            ["Quest completed!"];
    }
    
    return questDialogue.quest_completed[locale] || questDialogue.quest_completed.korean;
}
