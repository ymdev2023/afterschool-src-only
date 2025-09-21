import { choiceDialog, dialog } from "./dialog.js";

/**
 * 인터랙티브 대화를 표시하고 사용자의 선택에 따라 콜백을 실행합니다
 * @param {Object} k - Kaboom 컨텍스트
 * @param {Object} options - 대화 옵션
 * @param {Object} options.position - 대화 표시 위치
 * @param {string} options.question - 질문 텍스트
 * @param {Array} options.choices - 선택지 배열 (예: ["아니오", "예"])
 * @param {Function} options.onYes - "예" 선택 시 실행할 콜백
 * @param {Function} options.onNo - "아니오" 선택 시 실행할 콜백
 * @param {string} options.font - 폰트 (기본: "galmuri")
 * @param {string} options.rejectMessage - 거절 시 표시할 메시지
 * @param {string} options.speakerName - 화자 이름
 */
export async function showInteractiveDialog(k, options = {}) {
    const {
        position = k.vec2(k.center().x - 400, k.height() - 220),
        question = "상호작용하시겠습니까?",
        choices = ["아니오", "예"],
        onYes = null,
        onNo = null,
        font = "galmuri",
        rejectMessage = "아쉽네요.",
        speakerName = ""
    } = options;

    console.log("🎯 인터랙티브 대화 시작");
    
    try {
        // 선택지 표시 (choiceDialog가 내부적으로 플레이어를 freeze함)
        const choice = await choiceDialog(
            k,
            k.vec2(position.x, position.y),
            [question],
            choices,
            { font }
        );

        console.log("🎯 선택된 choice:", choice);

        if (choice === 1 || choice === "1" || choice === "예") { // "예" 선택
            console.log("🎯 예 선택");
            k.play("confirm-beep-sfx");
            
            if (onYes) {
                await onYes();
            }
        } else { // "아니오" 선택
            console.log("🎯 아니오 선택");
            k.play("boop-sfx");
            
            if (onNo) {
                await onNo();
            } else if (rejectMessage) {
                // 기본 거절 메시지 표시
                await dialog(k, k.vec2(k.center().x - 400, k.height() - 220), [rejectMessage], {
                    font,
                    speakerName,
                    speakerImage: null,
                });
            }
        }
    } catch (error) {
        console.error("❌ 인터랙티브 대화 중 오류:", error);
    }
}

/**
 * 스페이스 키 입력으로 트리거되는 인터랙티브 객체를 생성합니다
 * @param {Object} k - Kaboom 컨텍스트
 * @param {Object} entity - 게임 엔티티
 * @param {Object} dialogOptions - showInteractiveDialog에 전달할 옵션
 */
export function setupSpaceInteraction(k, entity, dialogOptions) {
    let isPlayerNear = false;

    // 플레이어가 가까이 왔을 때
    entity.onCollideUpdate("player", () => {
        if (!isPlayerNear) {
            isPlayerNear = true;
            console.log("💬 상호작용 가능 상태 활성화");
        }
    });

    // 플레이어가 멀어졌을 때
    entity.onCollideEnd("player", () => {
        if (isPlayerNear) {
            isPlayerNear = false;
            console.log("💬 상호작용 상태 비활성화");
        }
    });

    // 스페이스 키 입력 처리
    k.onKeyPress("space", async () => {
        if (isPlayerNear) {
            console.log("🎮 스페이스 키로 상호작용 시작");
            
            // customInteraction이 있으면 그것을 실행, 없으면 기본 인터랙티브 대화 실행
            if (dialogOptions.customInteraction) {
                await dialogOptions.customInteraction();
            } else {
                await showInteractiveDialog(k, dialogOptions);
            }
        }
    });
}

/**
 * 다중 대화 시퀀스를 표시합니다
 * @param {Object} k - Kaboom 컨텍스트
 * @param {Array} dialogSequence - 대화 시퀀스 배열
 * @param {Object} options - 대화 옵션
 */
export async function showMultipleDialogs(k, dialogSequence = [], options = {}) {
    const {
        font = "galmuri",
        speakerName = "",
        position = k.vec2(k.center().x - 400, k.height() - 220)
    } = options;

    console.log("🎭 다중 대화 시퀀스 시작");
    
    try {
        for (let i = 0; i < dialogSequence.length; i++) {
            const dialogText = dialogSequence[i];
            console.log(`🎭 대화 ${i + 1}/${dialogSequence.length}: ${dialogText.slice(0, 20)}...`);
            
            await dialog(k, position, [dialogText], {
                font,
                speakerName,
                speakerImage: null,
            });
            
            // 각 대화 사이에 짧은 간격
            await k.wait(0.3);
        }
        
        console.log("🎭 다중 대화 시퀀스 완료");
    } catch (error) {
        console.error("❌ 다중 대화 중 오류:", error);
    }
}

/**
 * 상호작용 후 다중 대화를 실행하는 통합 함수
 * @param {Object} k - Kaboom 컨텍스트
 * @param {Object} entity - 게임 엔티티
 * @param {Object} options - 옵션
 * @param {string} options.question - 초기 질문
 * @param {Array} options.yesDialogs - "예" 선택 시 표시할 대화들
 * @param {Array} options.noDialogs - "아니오" 선택 시 표시할 대화들
 * @param {Function} options.onComplete - 모든 대화 완료 후 실행할 콜백
 */
export function setupInteractionWithDialogs(k, entity, options = {}) {
    const {
        question = "상호작용하시겠습니까?",
        yesDialogs = ["네, 좋습니다!"],
        noDialogs = ["아쉽네요."],
        onComplete = null,
        font = "galmuri",
        speakerName = ""
    } = options;

    setupSpaceInteraction(k, entity, {
        question,
        choices: ["아니오", "예"],
        font,
        speakerName,
        onYes: async () => {
            if (yesDialogs.length > 0) {
                await showMultipleDialogs(k, yesDialogs, { font, speakerName });
            }
            if (onComplete) {
                await onComplete();
            }
        },
        onNo: async () => {
            if (noDialogs.length > 0) {
                await showMultipleDialogs(k, noDialogs, { font, speakerName });
            }
        }
    });
}
