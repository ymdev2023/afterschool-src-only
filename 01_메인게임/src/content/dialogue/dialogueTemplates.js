/**
 * 재사용 가능한 대화 템플릿 시스템
 * 자주 사용되는 대화 패턴들을 템플릿으로 관리
 */

/**
 * 웹사이트 링크 대화 템플릿
 * @param {Object} config - 설정 객체
 * @param {string} config.description - 객체 설명
 * @param {string} config.actionText - 액션 설명 텍스트
 * @param {string} config.questionText - 질문 텍스트
 * @param {string} config.url - 이동할 URL
 * @param {string} config.locale - 언어 설정 ("korean" | "english")
 * @returns {Array} 대화 배열
 */
export function createLinkDialogue(config) {
    const {
        description,
        actionText,
        questionText,
        url,
        locale = "korean"
    } = config;

    const isKorean = locale === "korean";

    return [
        description,
        actionText,
        questionText,
        {
            type: "choice",
            question: questionText,
            choices: [
                {
                    text: isKorean ? "예" : "Yes",
                    action: "open_link",
                    url: url
                },
                {
                    text: isKorean ? "아니오" : "No",
                    action: "cancel"
                }
            ]
        }
    ];
}

/**
 * 게임 플레이 대화 템플릿 (기존 play_game 액션용)
 * @param {Object} config - 설정 객체
 * @param {string} config.description - 게임 설명
 * @param {string} config.actionText - 플레이 액션 설명
 * @param {string} config.questionText - 질문 텍스트
 * @param {string} config.locale - 언어 설정
 * @returns {Array} 대화 배열
 */
export function createGameDialogue(config) {
    const {
        description,
        actionText,
        questionText,
        locale = "korean"
    } = config;

    const isKorean = locale === "korean";

    return [
        description,
        actionText,
        questionText,
        {
            type: "choice",
            question: questionText,
            choices: [
                {
                    text: isKorean ? "예" : "Yes",
                    action: "play_game"
                },
                {
                    text: isKorean ? "아니오" : "No",
                    action: "cancel"
                }
            ]
        }
    ];
}

/**
 * 커스텀 선택지 대화 템플릿
 * @param {Object} config - 설정 객체
 * @param {Array} config.dialogueLines - 대화 내용 배열
 * @param {string} config.questionText - 질문 텍스트
 * @param {Array} config.choices - 선택지 배열 [{text, action, url?, data?}, ...]
 * @returns {Array} 대화 배열
 */
export function createCustomChoiceDialogue(config) {
    const {
        dialogueLines,
        questionText,
        choices
    } = config;

    return [
        ...dialogueLines,
        {
            type: "choice",
            question: questionText,
            choices: choices
        }
    ];
}

/**
 * 템플릿 사용 예시:
 * 
 * // 웹사이트 링크 대화
 * const naverLinkDialogue = createLinkDialogue({
 *     description: "오래된 컴퓨터가 놓여있다.",
 *     actionText: "화면에는 '인터넷 익스플로러'가 깜빡이고 있다.",
 *     questionText: "네이버로 이동하시겠습니까?",
 *     url: "https://www.naver.com",
 *     locale: "korean"
 * });
 * 
 * // 게임 플레이 대화
 * const arcadeDialogue = createGameDialogue({
 *     description: "오래된 게임기가 놓여있다.",
 *     actionText: "화면에는 'RETRO ARCADE'라는 글씨가 깜빡이고 있다.",
 *     questionText: "한번 플레이해보시겠어요?",
 *     locale: "korean"
 * });
 * 
 * // 커스텀 선택지 대화
 * const customDialogue = createCustomChoiceDialogue({
 *     dialogueLines: [
 *         "신비한 상자가 놓여있다.",
 *         "뭔가 중요한 것이 들어있을 것 같다."
 *     ],
 *     questionText: "상자를 열어보시겠습니까?",
 *     choices: [
 *         { text: "조심히 열기", action: "open_carefully" },
 *         { text: "힘껏 열기", action: "open_forcefully" },
 *         { text: "그냥 두기", action: "cancel" }
 *     ]
 * });
 */

export default {
    createLinkDialogue,
    createGameDialogue,
    createCustomChoiceDialogue
};
