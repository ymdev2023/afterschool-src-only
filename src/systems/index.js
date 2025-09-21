/**
 * 게임 시스템 통합 인덱스
 * 
 * 이 파일을 통해 모든 게임 시스템의 주요 기능을 가져올 수 있습니다.
 */

// 퀘스트 시스템
export { QuestManager, questManager } from './questSystem.js';
export { 
    QUEST_DEFINITIONS, 
    initializeQuests, 
    QuestObjectiveCheckers, 
    checkQuestObjective,
    STUDENT_QUEST_MAPPING,
    getStudentQuest 
} from './questDefinitions.js';
export { 
    SPEECH_BUBBLE_STATES,
    addQuestBubble,
    addEmotionBubble,
    removeQuestBubble,
    updateQuestBubbles,
    initializeQuestBubbles,
    showQuestCompletionBubble,
    getQuestProgressText,
    getQuestObjectivesText 
} from './questUI.js';

// UI 시스템
export { UIManager, createUIManager, getUIManager } from './uiManager.js';
export { DialogUI, createDialogUI, getDialogUI } from './uiComponents.js';

// 퀘스트 대화 시스템
export { 
    QUEST_DIALOGUES,
    getQuestDialogue,
    getQuestObjectiveDialogue,
    getStudentName,
    getQuestCompletionMessage 
} from '../content/questDialogue.js';

/**
 * 시스템 빠른 시작 가이드:
 * 
 * 1. UI 시스템 사용:
 *    - const uiManager = createUIManager(k);
 *    - uiManager.initialize();
 *    - uiManager.createNotification("메시지");
 * 
 * 2. 다이얼로그 UI 사용:
 *    - const dialogUI = createDialogUI(k);
 *    - dialogUI.createDialogBox(pos, width, height);
 *    - dialogUI.createToast("메시지");
 * 
 * 3. 퀘스트 시스템 사용:
 *    - questManager.startQuest(questId, studentId);
 *    - checkQuestObjective(action, targetId);
 *    - updateQuestBubbles(k, students, map);
 * 
 * 4. 새로운 UI 컴포넌트 추가:
 *    - uiComponents.js에 새로운 클래스 메서드 추가
 *    - uiManager.js에 관리 로직 추가
 */
