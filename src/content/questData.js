// 퀘스트 데이터 관리
// 모든 퀘스트 관련 데이터와 로직을 중앙에서 관리

/**
 * 퀘스트 제목에서 번호를 추출하는 함수
 * @param {string} title - 퀘스트 제목 (예: "[Q01] 골대 근처...")
 * @returns {string|null} 추출된 퀘스트 번호 (예: "01") 또는 null
 */
export function extractQuestNumber(title) {
    const match = title.match(/\[Q(\d{2})\]/);
    return match ? match[1] : null;
}

/**
 * 퀘스트 번호를 기준으로 중복 체크하는 함수
 * @param {Array} questItems - 현재 퀘스트 배열
 * @param {Object} newQuest - 추가하려는 새 퀘스트
 * @param {Object} globalState - 전역 상태 관리자 (선택적)
 * @returns {boolean} 중복이면 true, 중복이 아니면 false
 */
export function isDuplicateQuest(questItems, newQuest, globalState = null) {
    const newQuestNumber = extractQuestNumber(newQuest.title);
    
    if (!newQuestNumber) {
        console.warn("⚠️ 퀘스트 번호를 추출할 수 없습니다:", newQuest.title);
        return false; // 번호가 없으면 중복이 아닌 것으로 간주
    }
    
    // 현재 퀘스트 배열에서 중복 체크
    const isDuplicateInLocal = questItems.some(quest => {
        const questNumber = extractQuestNumber(quest.title);
        return questNumber === newQuestNumber;
    });
    
    // 전역 상태에서도 중복 체크
    let isDuplicateInGlobal = false;
    if (globalState) {
        const globalQuests = globalState.getGlobalQuests();
        isDuplicateInGlobal = globalQuests.some(quest => {
            const questNumber = extractQuestNumber(quest.title);
            return questNumber === newQuestNumber;
        });
    }
    
    const isDuplicate = isDuplicateInLocal || isDuplicateInGlobal;
    
    if (isDuplicate) {
        console.log(`🚫 퀘스트 중복 감지: Q${newQuestNumber} - ${newQuest.title}`);
    } else {
        console.log(`✅ 퀘스트 중복 없음: Q${newQuestNumber} - ${newQuest.title}`);
    }
    
    return isDuplicate;
}

/**
 * 안전한 퀘스트 추가 함수 (중복 체크 포함)
 * @param {Array} questItems - 현재 퀘스트 배열
 * @param {Object} newQuest - 추가하려는 새 퀘스트
 * @param {Object} globalState - 전역 상태 관리자 (선택적)
 * @returns {boolean} 퀘스트가 성공적으로 추가되었는지 여부
 */
export function addQuestSafely(questItems, newQuest, globalState = null) {
    // 중복 체크
    if (isDuplicateQuest(questItems, newQuest, globalState)) {
        const questNumber = extractQuestNumber(newQuest.title);
        console.log(`🚫 퀘스트 Q${questNumber} 이미 존재하므로 추가하지 않습니다.`);
        return false;
    }
    
    // 고유 ID 생성 (기존 ID가 없는 경우)
    if (!newQuest.id) {
        const questNumber = extractQuestNumber(newQuest.title);
        newQuest.id = `quest_${questNumber}_${Date.now()}`;
    }
    
    // 퀘스트 추가
    questItems.push({...newQuest});
    
    // 전역 상태에도 추가
    if (globalState) {
        globalState.addToGlobalQuests({...newQuest});
    }
    
    const questNumber = extractQuestNumber(newQuest.title);
    console.log(`🆕 퀘스트 Q${questNumber} 성공적으로 추가: ${newQuest.title}`);
    return true;
}

// 기본 퀘스트 데이터
export const defaultQuests = [
    {
        title: "[Q01] 골대 근처 계단에 앉은 친구에게 말걸기",
        details: ["운동장 골대 근처에서 계단에 앉아있는 학생 찾기", "그 학생과 대화해보기"],
        expanded: false,
        completed: false,
        targetNpc: "student1" // 완료 조건 추가
    },
    {
        title: "[Q02] 운동장 피구공 뻥 차보기",
        details: ["운동장에 있는 피구공 찾기", "공에 다가가서 차보기"],
        expanded: false,
        completed: false,
        targetObject: "ball" // 완료 조건 추가
    }
];

// 조건부 퀘스트 데이터
export const conditionalQuests = {
    quest3: {
        title: "[Q03] 운동장에서 개미 관찰하는 친구 찾고 말걸기",
        details: ["운동장을 둘러보며 개미를 관찰하는 학생 찾기", "그 학생과 대화해보기"],
        expanded: false,
        completed: false,
        targetNpc: "student4",
        requirement: "quest1_completed" // 퀘스트 1 완료 후 추가
    },
    quest4: {
        title: "[Q04] 심연의 존재: 수수께끼",
        details: ["골대 뒤편의 숨겨진 공간을 탐험하기", "그곳에 숨겨진 진실을 찾아내기"],
        expanded: false,
        completed: false,
        targetObject: "mysterious_area",
        requirement: "letter3_read" // letter3 대화 완료 후 추가
    },
    quest5: {
        title: "[Q05] mp3의 주인... 소녀시대 팬일지도?",
        details: ["창고에서 mp3 플레이어 찾기", "mp3와 상호작용해보기", "소녀시대-gee가 흘러나오는 것을 확인하기"],
        expanded: false,
        completed: false,
        targetObject: "mp3" // mp3와 상호작용하면 완료
    }
};

/**
 * 퀘스트 데이터 초기화 함수
 * @param {Object} savedQuestData - 저장된 퀘스트 데이터
 * @param {Object} globalState - 전역 상태 관리자
 * @returns {Array} 초기화된 퀘스트 배열
 */
export function initializeQuests(savedQuestData = null, globalState = null) {
    // 전역 상태에서 퀘스트 데이터 확인
    if (globalState) {
        const globalQuests = globalState.getGlobalQuests();
        if (globalQuests.length > 0) {
            console.log(`📋 전역 상태에서 퀘스트 로드: ${globalQuests.length}개`);
            return globalQuests;
        }
    }
    console.log("✨ 퀘스트 데이터 초기화 시작");
    
    // 기본 퀘스트로 시작
    let questItems = [...defaultQuests];
    
    // 저장된 퀘스트 데이터가 있다면 완료 상태 복원
    // 테스트 모드: 모든 퀘스트를 미완료 상태로 강제 설정하려면 forceReset을 true로 설정
    const forceReset = true; // 테스트용: 퀘스트 상태 리셋 (완료 후 false로 변경)
    
    if (savedQuestData && savedQuestData.length > 0 && !forceReset) {
        console.log("🔄 저장된 퀘스트 완료 상태 복원:", savedQuestData);
        
        // 퀘스트 1 완료 상태 복원
        if (savedQuestData[0] && savedQuestData[0].completed) {
            questItems[0].completed = true;
            
            // 퀘스트 1이 완료되었다면 퀘스트 3 추가
            if (!questItems.some(quest => quest.targetNpc === "student4")) {
                questItems.push({...conditionalQuests.quest3});
            }
        }
        
        // 퀘스트 2 완료 상태 복원
        if (savedQuestData.length > 1 && savedQuestData[1] && savedQuestData[1].completed) {
            questItems[1].completed = true;
        }
        
        // 퀘스트 3이 있다면 완료 상태 복원
        const savedQuest3 = savedQuestData.find(quest => quest.targetNpc === "student4");
        if (savedQuest3 && questItems.length > 2) {
            questItems[2].completed = savedQuest3.completed;
        }
        
        // letter3을 읽었다면 퀘스트 4 추가
        const savedQuest4 = savedQuestData.find(quest => quest.targetObject === "mysterious_area");
        if (savedQuest4) {
            if (!questItems.some(quest => quest.targetObject === "mysterious_area")) {
                questItems.push({...conditionalQuests.quest4});
            }
            // 퀘스트 4 완료 상태 복원
            const quest4Index = questItems.findIndex(quest => quest.targetObject === "mysterious_area");
            if (quest4Index !== -1) {
                questItems[quest4Index].completed = savedQuest4.completed;
            }
        }
    } else if (forceReset) {
        console.log("🔄 테스트 모드: 모든 퀘스트를 미완료 상태로 강제 리셋");
        // 모든 퀘스트를 미완료 상태로 설정
        questItems.forEach(quest => {
            quest.completed = false;
        });
    }
    
    console.log("✅ 퀘스트 초기화 완료:", questItems);
    
    // 전역 상태에 퀘스트 저장
    if (globalState) {
        questItems.forEach((quest, index) => {
            const questWithId = { ...quest, id: quest.id || `quest_${index}` };
            globalState.addToGlobalQuests(questWithId);
        });
        console.log("📋 퀘스트를 전역 상태에 저장");
    }
    
    return questItems;
}

/**
 * letter3 읽기 완료 시 퀘스트 4 추가 함수
 * @param {Array} questItems - 현재 퀘스트 배열
 * @param {Object} globalState - 전역 상태 관리자 (선택적)
 * @returns {boolean} 새 퀘스트가 추가되었는지 여부
 */
export function addQuest4OnLetter3Read(questItems, globalState = null) {
    const quest4 = {...conditionalQuests.quest4};
    
    // 안전한 퀘스트 추가 함수 사용
    const added = addQuestSafely(questItems, quest4, globalState);
    
    if (added) {
        console.log("🆕 letter3 읽기 완료로 퀘스트 4 추가됨");
    } else {
        console.log("ℹ️ 퀘스트 4는 이미 존재하므로 추가하지 않음");
    }
    
    return added;
}

/**
 * 퀘스트 완료 처리 함수
 * @param {Array} questItems - 현재 퀘스트 배열
 * @param {string} targetType - 타겟 타입 ('npc' 또는 'object')
 * @param {string} targetId - 타겟 ID
 * @param {Object} globalState - 전역 상태 관리자
 * @returns {Object} 업데이트된 퀘스트 정보
 */
export function completeQuest(questItems, targetType, targetId, globalState = null) {
    let questCompleted = false;
    let newQuestAdded = false;
    
    console.log(`🔍 completeQuest 호출 - 타입: ${targetType}, 대상: ${targetId}`);
    console.log(`🔍 현재 퀘스트 개수: ${questItems.length}`);
    
    // 해당 타겟의 퀘스트 찾기
    const targetKey = targetType === 'npc' ? 'targetNpc' : 'targetObject';
    console.log(`🔍 검색 키: ${targetKey}`);
    
    // 모든 퀘스트 상태 출력
    questItems.forEach((quest, index) => {
        console.log(`🔍 퀘스트 ${index}: ${quest.title}, ${targetKey}: ${quest[targetKey]}, 완료: ${quest.completed}`);
    });
    
    const questIndex = questItems.findIndex(quest => 
        !quest.completed && quest[targetKey] === targetId
    );
    
    console.log(`🔍 찾은 퀘스트 인덱스: ${questIndex}`);
    
    if (questIndex !== -1) {
        questItems[questIndex].completed = true;
        questCompleted = true;
        console.log(`🎯 퀘스트 완료: ${questItems[questIndex].title}`);
        
        // 전역 상태 업데이트
        if (globalState) {
            const questId = questItems[questIndex].id || `quest_${questIndex}`;
            globalState.updateGlobalQuestProgress(questId, { completed: true });
        }
        
        // 퀘스트 1 완료 시 퀘스트 3 추가 (중복 체크 강화)
        if (targetId === "student1") {
            const quest3 = {...conditionalQuests.quest3};
            const added = addQuestSafely(questItems, quest3, globalState);
            
            if (added) {
                newQuestAdded = true;
                console.log("🆕 퀘스트 1 완료로 퀘스트 3 추가됨");
            } else {
                console.log("ℹ️ 퀘스트 3은 이미 존재하므로 추가하지 않음");
            }
        }
    } else {
        console.log(`⚠️ 해당 타겟에 대한 미완료 퀘스트를 찾을 수 없음: ${targetType} - ${targetId}`);
    }
    
    return {
        questCompleted,
        newQuestAdded,
        completedQuestIndex: questIndex
    };
}

/**
 * 퀘스트 상태를 저장 가능한 형태로 변환
 * @param {Array} questItems - 현재 퀘스트 배열
 * @returns {Array} 저장용 퀘스트 데이터
 */
export function getQuestSaveData(questItems) {
    return questItems.map(quest => ({
        title: quest.title,
        completed: quest.completed,
        targetNpc: quest.targetNpc,
        targetObject: quest.targetObject
    }));
}
