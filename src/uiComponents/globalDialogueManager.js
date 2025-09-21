/**
 * 전역 대화 관리자 - 모든 씬에서 공통으로 사용하는 대화 시스템
 * front.js의 대화 로직을 기반으로 함
 */
import { dialog, choiceDialog } from "./dialog.js";
import { gameState } from "../state/stateManagers.js";

export class GlobalDialogueManager {
    constructor(k, gameState, sceneDialogues = null) {
        this.k = k;
        this.gameState = gameState;
        this.currentDialogue = null;
        this.sceneDialogues = sceneDialogues; // 씬별 대화 데이터
        this.isDialogueInProgress = false; // 🔑 대화 진행 상태 추적
    }

    /**
     * 대화가 현재 진행 중인지 확인
     * @returns {boolean} 대화 진행 중 여부
     */
    isDialogueActive() {
        return this.isDialogueInProgress;
    }

    /**
     * 객체와의 상호작용 설정 (front.js와 동일한 방식)
     * @param {Object} entity - 상호작용할 엔티티
     * @param {string} type - 상호작용 타입 ('object', 'npc', 'letter', 'student')
     * @param {Object} dialogueData - 대화 데이터
     */
    setInteractableObject(entity, type, dialogueData) {
        // 기존 상호작용 객체 정리
        this.clearInteractableObject();
        
        // 새로운 상호작용 객체 설정
        this.currentDialogue = {
            entity: entity,
            type: type,
            data: dialogueData
        };

        // 상호작용 가능 상태로 설정 (기존 객체에 태그만 추가)
        entity.add([
            "interactable" // 단순 태그만 추가
        ]);

        // console.log(`🎯 상호작용 객체 설정: ${type} - ${dialogueData.speakerName}`);
    }

    /**
     * 상호작용 객체 정리
     */
    clearInteractableObject() {
        if (this.currentDialogue && this.currentDialogue.entity) {
            const entity = this.currentDialogue.entity;
            // interaction-zone 태그를 가진 객체들을 직접 찾기
            const allObjects = this.k.get("interaction-zone");
            if (allObjects && allObjects.length > 0) {
                allObjects.forEach(zone => {
                    if (zone.parent === entity) {
                        zone.destroy();
                    }
                });
            }
        }
        this.currentDialogue = null;
    }

    /**
     * 대화창 표시 (선택지 지원 포함)
     * @param {Object} dialogueData - 대화 데이터
     * @param {Function} onComplete - 대화 완료 콜백
     */
    async showDialogue(dialogueData, onComplete = null) {
        if (!dialogueData || !dialogueData.content) {
            console.warn("⚠️ 대화 데이터가 없습니다.");
            return;
        }

        // 🔑 대화 시작 - 상태 업데이트
        this.isDialogueInProgress = true;
        console.log("🎯 대화 시작 - isDialogueInProgress = true");

        const content = dialogueData.content;
        const speakerName = dialogueData.speakerName || "Unknown";
        const speakerImage = dialogueData.speakerImage || null;
        const onChoiceAction = dialogueData.onChoiceAction || null; // 선택지 액션 핸들러 추가

        console.log("🎯 showDialogue 호출:", {
            contentLength: content.length,
            content: content,
            hasChoiceAction: !!onChoiceAction
        });

        // 선택지가 포함된 대화인지 확인
        let choiceItem = null;
        let dialogueContent = [];

        // content 배열에서 선택지 객체 찾기
        for (let i = 0; i < content.length; i++) {
            if (typeof content[i] === 'object' && content[i].type === 'choice') {
                choiceItem = content[i];
                dialogueContent = content.slice(0, i); // 선택지 이전까지의 대화
                console.log("🎯 선택지 발견:", choiceItem);
                break;
            } else {
                dialogueContent.push(content[i]);
            }
        }

        // 일반 대화 표시 (선택지가 있으면 선택지에서 질문까지 포함해서 처리)
        if (dialogueContent.length > 0 && !choiceItem) {
            const locale = this.gameState.getLocale();
            const font = locale === 'korean' ? 'galmuri' : 'gameboy';
            
            await new Promise((resolve) => {
                // 화면 중앙 하단에 대화창 표시 (tutorial.js와 일관성 유지)
                const centerPos = this.k.vec2(this.k.center().x - 400, this.k.height() - 220);
                dialog(
                    this.k,
                    centerPos,
                    dialogueContent,
                    {
                        font: font,
                        speakerName: speakerName,
                        speakerImage: speakerImage,
                        onComplete: resolve
                    }
                );
            });
        }

        // 선택지가 있으면 선택 대화 표시
        if (choiceItem) {
            console.log("🎯 선택지 표시 시작:", choiceItem);
            
            const locale = this.gameState.getLocale();
            const font = locale === 'korean' ? 'galmuri' : 'gameboy';
            const choices = choiceItem.choices.map(choice => choice.text);
            
            // 선택지가 있으면 이전 대화 + 질문을 모두 포함해서 처리
            const fullQuestions = [...dialogueContent, choiceItem.question || choiceItem.prompt];
            
            // 화면 중앙 하단에 선택지 대화창 표시 (tutorial.js와 일관성 유지)
            const centerPos = this.k.vec2(this.k.center().x - 400, this.k.height() - 220);
            const selectedChoice = await choiceDialog(
                this.k,
                centerPos,
                fullQuestions,
                choices,
                { 
                    font: font,
                    speakerName: speakerName,
                    speakerImage: speakerImage
                }
            );

            console.log("🎯 선택된 choice:", selectedChoice, "choices:", choices);
            console.log("🎯 선택된 choice 타입:", typeof selectedChoice, "null 여부:", selectedChoice === null);
            console.log("🎯 choiceItem.choices:", choiceItem.choices);
            console.log("🎯 choiceItem.choices[selectedChoice]:", choiceItem.choices[selectedChoice]);

            // 선택에 따른 액션 처리
            if (selectedChoice !== null && choiceItem.choices[selectedChoice]) {
                const choice = choiceItem.choices[selectedChoice];
                console.log("🔥 [CRITICAL] 선택된 choice 객체:", choice);
                
                // URL 필드가 있으면 링크 열기
                if (choice.url) {
                    this.k.play("confirm-beep-sfx");
                    console.log("🔗 링크 열기:", choice.url);
                    
                    // 응답 메시지가 있으면 표시
                    if (choice.response) {
                        const centerPos = this.k.vec2(this.k.center().x - 400, this.k.height() - 220);
                        await new Promise((resolve) => {
                            dialog(
                                this.k,
                                centerPos,
                                [choice.response],
                                {
                                    font: font,
                                    speakerName: speakerName,
                                    speakerImage: speakerImage,
                                    onComplete: resolve
                                }
                            );
                        });
                    }
                    
                    window.open(choice.url, "_blank");
                } else if (choice.response) {
                    // 응답 메시지만 있는 경우
                    this.k.play("boop-sfx");
                    console.log("💬 응답 메시지:", choice.response);
                    
                    const centerPos = this.k.vec2(this.k.center().x - 400, this.k.height() - 220);
                    await new Promise((resolve) => {
                        dialog(
                            this.k,
                            centerPos,
                            [choice.response],
                            {
                                font: font,
                                speakerName: speakerName,
                                speakerImage: speakerImage,
                                onComplete: resolve
                            }
                        );
                    });
                }
                
                // 기존 액션 시스템 (하위 호환성)
                const selectedAction = choice.action;
                if (selectedAction) {
                    console.log("🎯 선택된 액션:", selectedAction);

                    if (selectedAction === "play_game") {
                        this.k.play("confirm-beep-sfx");
                        console.log("🎮 게임 플레이 선택 - 외부 링크 열기");
                        window.open(
                            "https://play.unity.com/en/games/4a7111dc-fa36-4f8b-98c9-3a29e0c2006a/kimchi-run-by-ym",
                            "_blank"
                        );
                    } else if (selectedAction === "start_pixel_game") {
                        this.k.play("confirm-beep-sfx");
                        console.log("🎮 픽셀 게임 플레이 선택");
                        // onComplete 콜백으로 액션 데이터 전달
                        if (onComplete) {
                            onComplete({ action: "start_pixel_game" });
                        }
                    } else if (selectedAction === "open_link") {
                        this.k.play("confirm-beep-sfx");
                        const url = choice.url || "https://www.naver.com";
                        console.log("🔗 링크 열기:", url);
                        window.open(url, "_blank");
                    } else if (selectedAction === "cancel_game" || selectedAction === "cancel") {
                        this.k.play("boop-sfx");
                        console.log("🎮 게임 플레이 취소");
                    }
                }
                
                // 🔥 새로운 onChoiceAction 시스템 (자판기 등)
                if (onChoiceAction) {
                    // action이 있는 경우에만 호출하거나, action이 없어도 onChoiceAction이 있으면 호출
                    const actionToPass = selectedAction || choice.action;
                    
                    console.log("🔥 [CRITICAL] onChoiceAction 호출 중:", {
                        action: actionToPass,
                        selectedAction: selectedAction,
                        choiceAction: choice.action,
                        choice: choice,
                        hasCallback: !!onChoiceAction
                    });
                    
                    try {
                        onChoiceAction({
                            action: actionToPass,
                            choice: choice,
                            consequence: choice.consequence
                        });
                        console.log("🔥 [CRITICAL] onChoiceAction 호출 완료");
                    } catch (error) {
                        console.error("🔥 [CRITICAL] onChoiceAction 호출 중 오류:", error);
                    }
                }
            }
        }

        // 🔑 대화 완료 - 상태 업데이트
        this.isDialogueInProgress = false;
        console.log("🎯 대화 완료 - isDialogueInProgress = false");

        // 완료 콜백 실행
        console.log(`🔥 [CRITICAL] onComplete 콜백 확인:`, {
            hasCallback: !!onComplete,
            callbackType: typeof onComplete
        });
        
        if (onComplete) {
            console.log(`🔥 [CRITICAL] onComplete 콜백 실행 중...`);
            try {
                onComplete();
                console.log(`🔥 [CRITICAL] onComplete 콜백 실행 완료!`);
            } catch (error) {
                console.error(`🔥 [CRITICAL] onComplete 콜백 실행 중 오류:`, error);
            }
        } else {
            console.log(`🔥 [CRITICAL] onComplete 콜백이 없어서 실행되지 않음`);
        }
    }

    /**
     * 간단한 대화 표시 (garage.js용)
     * @param {string} dialogueKey - 대화 키
     * @param {Object} dialogueData - 대화 데이터 객체
     * @param {string} locale - 언어 설정
     */
    showSimpleDialogue(dialogueKey, dialogueData, locale = null) {
        // locale이 제공되지 않으면 현재 게임 로케일 사용
        const currentLocale = locale || this.gameState.getLocale();
        
        if (dialogueData && dialogueData[currentLocale] && dialogueData[currentLocale][dialogueKey]) {
            const content = dialogueData[currentLocale][dialogueKey];
            const speakerName = dialogueKey;
            
            this.showDialogue({
                content: content,
                speakerName: speakerName,
                speakerImage: null,
                onInteractionComplete: entity.onInteractionComplete || null // 엔티티에 설정된 콜백 사용
            });
        } else {
            console.warn(`⚠️ ${dialogueKey}에 대한 대화 데이터가 없습니다.`);
        }
    }

    /**
     * 플레이어와의 충돌 처리 설정 (front.js와 동일한 방식)
     * @param {Object} entity - 상호작용할 엔티티
     * @param {string} objectType - 객체 타입
     * @param {Object} dialogueData - 대화 데이터
     */
    setupPlayerCollision(entity, objectType, dialogueData) {
        // 🔥 이미 onInteractionComplete가 설정되어 있으면 보존
        const existingCallback = entity.onInteractionComplete;
        
        entity.onCollideUpdate("player", (player) => {
            // console.log(`🗣️ ${objectType}과 상호작용 시작`);
            
            // 전달받은 dialogueData 우선 사용
            if (dialogueData && dialogueData.content) {
                console.log(`🎯 전달받은 대화 데이터 사용: ${objectType}`, dialogueData);
                // 기존 콜백이 있으면 보존
                if (existingCallback && !dialogueData.onInteractionComplete) {
                    dialogueData.onInteractionComplete = existingCallback;
                    console.log(`🔥 [CRITICAL] ${objectType} 기존 onInteractionComplete 보존됨`);
                }
                this.gameState.setInteractableObject(entity, "npc", dialogueData); // NPC는 항상 "npc" 타입으로 설정
                return;
            }
            
            // 씬별 대화 데이터 확인 (fallback)
            const locale = this.gameState.getLocale();
            let content = [`${objectType}을 조사했습니다.`];
            let speakerName = objectType;
            let speakerImage = null;

            // 씬별 대화 데이터가 있는 경우 우선 사용
            if (this.sceneDialogues) {
                // console.log(`🔍 대화 데이터 검색: ${objectType}, 로케일: ${locale}`);
                // console.log(`🔍 sceneDialogues 구조:`, {
                //     hasNpcDialogues: !!this.sceneDialogues.npcDialogues,
                //     hasObjectDialogues: !!this.sceneDialogues.objectDialogues,
                //     hasLocale: !!this.sceneDialogues.objectDialogues?.[locale],
                //     hasObjectType: !!this.sceneDialogues.objectDialogues?.[locale]?.[objectType],
                //     objectDialoguesKeys: this.sceneDialogues.objectDialogues ? Object.keys(this.sceneDialogues.objectDialogues) : [],
                //     localeKeys: this.sceneDialogues.objectDialogues?.[locale] ? Object.keys(this.sceneDialogues.objectDialogues[locale]).slice(0, 10) : [],
                //     npcDialoguesKeys: this.sceneDialogues.npcDialogues ? Object.keys(this.sceneDialogues.npcDialogues) : [],
                //     npcLocaleKeys: this.sceneDialogues.npcDialogues?.[locale] ? Object.keys(this.sceneDialogues.npcDialogues[locale]).slice(0, 10) : []
                // });
                
                // NPC 대화 확인 (frontDialogues 구조)
                if (this.sceneDialogues.npcDialogues && this.sceneDialogues.npcDialogues[locale] && this.sceneDialogues.npcDialogues[locale][objectType]) {
                    const npcData = this.sceneDialogues.npcDialogues[locale][objectType];
                    content = Array.isArray(npcData) ? npcData : [npcData];
                    speakerName = this.sceneDialogues.npcNames?.[locale]?.[objectType] || speakerName;
                    console.log(`✅ Front NPC 대화 발견: ${objectType}`, { speakerName });
                }
                // firstDialogues 구조 확인 (korean/english 직접 접근)
                else if (this.sceneDialogues[locale] && this.sceneDialogues[locale][objectType]) {
                    const dialogueData = this.sceneDialogues[locale][objectType];
                    content = Array.isArray(dialogueData) ? dialogueData : [dialogueData];
                    speakerName = this.sceneDialogues.npcNames?.[locale]?.[objectType] || this.sceneDialogues.names?.[locale]?.[objectType] || speakerName;
                    console.log(`✅ First NPC 대화 발견: ${objectType}`, { speakerName, content: content.slice(0, 2) });
                }
                // 오브젝트 대화 확인 (firstObjectDialogues 구조)
                else if (this.sceneDialogues.objectDialogues && this.sceneDialogues.objectDialogues[locale] && this.sceneDialogues.objectDialogues[locale][objectType]) {
                    const objectData = this.sceneDialogues.objectDialogues[locale][objectType];
                    content = Array.isArray(objectData) ? objectData : [objectData];
                    speakerName = this.sceneDialogues.objectNames?.[locale]?.[objectType] || speakerName;
                    console.log(`✅ 오브젝트 대화 발견: ${objectType}`, { speakerName });
                }
                else {
                    console.log(`⚠️ 대화 데이터 없음: ${objectType}`);
                    console.log(`🔍 디버깅 정보:`, {
                        objectType: objectType,
                        hasSceneDialogues: !!this.sceneDialogues,
                        hasObjectDialogues: !!this.sceneDialogues?.objectDialogues,
                        hasLocale: !!this.sceneDialogues?.objectDialogues?.[locale],
                        availableObjects: this.sceneDialogues?.objectDialogues?.[locale] ? Object.keys(this.sceneDialogues.objectDialogues[locale]) : []
                    });
                }
            }

            // front.js와 동일한 방식으로 gameState를 통한 상호작용 설정
            if (this.gameState.setInteractableObject) {
                // 선택지 대화인지 확인
                const hasChoice = content.some(item => typeof item === 'object' && item.type === 'choice');
                
                // 🔥 엔티티의 onInteractionComplete 콜백 확인 및 로깅
                console.log(`🔥 [CRITICAL] ${objectType} onInteractionComplete 확인:`, {
                    hasCallback: !!entity.onInteractionComplete,
                    callbackType: typeof entity.onInteractionComplete,
                    entityProps: Object.keys(entity)
                });

                const dialogueConfig = {
                    content: content,
                    speakerName: speakerName,
                    speakerImage: speakerImage,
                    onDialogStart: entity.onDialogStart || null, // 대화 시작 콜백 추가
                    onInteractionComplete: existingCallback || entity.onInteractionComplete || null // 기존 콜백 우선 사용
                };
                
                // 🔥 onInteractionComplete 콜백 로깅
                if (dialogueConfig.onInteractionComplete) {
                    console.log(`🔥 [CRITICAL] ${objectType} onInteractionComplete 콜백 발견 및 등록! (기존 콜백: ${!!existingCallback})`);
                } else {
                    console.log(`🔥 [CRITICAL] ${objectType} onInteractionComplete 콜백 없음`);
                }

                // 선택지가 있는 경우 customDialogHandler 추가
                if (hasChoice) {
                    dialogueConfig.customDialogHandler = (dialogData) => {
                        // console.log("🎯 customDialogHandler 실행 - 선택지 대화 처리");
                        this.showDialogue({
                            content: content,
                            speakerName: speakerName,
                            speakerImage: speakerImage
                        }, entity.onInteractionComplete);
                        return true; // 커스텀 처리 완료
                    };
                }

                this.gameState.setInteractableObject(entity, "object", dialogueConfig);
            }
        });

        entity.onCollideEnd("player", () => {
            // front.js와 동일한 방식으로 gameState를 통한 정리
            if (this.gameState.clearInteractableObject) {
                this.gameState.clearInteractableObject();
            }
        });
    }

    /**
     * 정리
     */
    cleanup() {
        this.clearInteractableObject();
    }
}

/**
 * 전역 대화 관리자 인스턴스 생성 함수
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} gameState - 게임 상태
 * @param {Object} sceneDialogues - 씬별 대화 데이터 (선택사항)
 * @returns {GlobalDialogueManager} 전역 대화 관리자 인스턴스
 */
export function setupGlobalDialogue(k, gameState, sceneDialogues = null) {
    return new GlobalDialogueManager(k, gameState, sceneDialogues);
}
