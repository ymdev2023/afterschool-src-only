export default function globalStateManager() {
    let instance = null;

    function createInstance() {
        let previousScene = null;
        let currentScene = null;
        let freezePlayer = false;
        let locale = "english";
        let fontSize = 30;
        let isGhostDefeated = false;
        let isSonSaved = false;
        let targetSpawn = null;
        // 추가된 부분: 상호작용 객체 추적
        let interactableObject = null;
        let interactableType = null;
        let interactableData = null;
        // 추가된 부분: 전역 음소거 상태
        let isMuted = false;
        let bgmHandle = null;
        // 추가된 부분: BGM 볼륨 관리
        let bgmVolume = 1.0;
        let isMainMenuBGMPlaying = false;
        // 추가된 부분: 플레이어 tall 모드 상태
        let isPlayerTall = false;
        // 추가된 부분: 버섯을 먹었는지 상태
        let hasEatenMushroom = false;
        // 추가된 부분: newcha 다이얼로그를 봤는지 상태
        let hasNewchaDialogShown = false;
        // 추가된 부분: Day 시스템 관리
        let currentDay = 1;
        let dayStartTime = Date.now();
        let dayDurationMS = 5 * 60 * 1000; // 5분
        // 추가된 부분: 기분/체력 상태 관리
        let mood = 9; // 기분 (0~9, 9가 최고) - 초기값 100%
        let health = 9; // 체력 (0~9, 9가 최고) - 초기값 100%
        // 추가된 부분: 플레이어 이름
        let playerName = "";
        // 추가된 부분: 전역 인벤토리 상태 관리
        let globalInventory = [];
        // 추가된 부분: 전역 퀘스트 상태 관리
        let globalQuests = [];
        // 추가된 부분: 퀘스트 상태 관리
        let studentQuests = {
            student1: {
                hasQuest: true,
                questType: "체육대회",
                isCompleted: false,
            },
            student2: { hasQuest: false, questType: null, isCompleted: false },
            student3: { hasQuest: false, questType: null, isCompleted: false },
            student4: {
                hasQuest: true,
                questType: "동아리",
                isCompleted: false,
            },
            student5: { hasQuest: false, questType: null, isCompleted: false },
            student6: {
                hasQuest: true,
                questType: "봉사활동",
                isCompleted: false,
            },
            student7: { hasQuest: false, questType: null, isCompleted: false },
            student8: { hasQuest: false, questType: null, isCompleted: false },
        };

        return {
            setPreviousScene(sceneName) {
                previousScene = sceneName;
            },
            getPreviousScene: () => previousScene,
            setCurrentScene(sceneName) {
                currentScene = sceneName;
            },
            getCurrentScene: () => currentScene,
            setFreezePlayer(value) {
                freezePlayer = value;
            },
            getFreezePlayer: () => freezePlayer,
            setLocale(language) {
                locale = language;
            },
            getLocale: () => locale,
            setFontSize(size) {
                fontSize = size;
            },
            getFontSize: () => fontSize,
            setIsGhostDefeated(value) {
                isGhostDefeated = value;
            },
            getIsGhostDefeated: () => isGhostDefeated,
            setIsSonSaved(value) {
                isSonSaved = value;
            },
            getIsSonSaved: () => isSonSaved,
            setTargetSpawn(spawn) {
                targetSpawn = spawn;
            },
            getTargetSpawn: () => targetSpawn,
            // 추가된 부분: 상호작용 객체 관리 메서드들
            setInteractableObject(object, type, data) {
                interactableObject = object;
                interactableType = type;
                interactableData = data;
            },
            getInteractableObject() {
                if (interactableObject) {
                    return {
                        entity: interactableObject,
                        type: interactableType,
                        data: interactableData
                    };
                }
                return null;
            },
            getInteractableType: () => interactableType,
            getInteractableData: () => interactableData,
            clearInteractableObject() {
                interactableObject = null;
                interactableType = null;
                interactableData = null;
            },
            // 추가된 부분: 전역 음소거 관리 메서드들
            setIsMuted(value) {
                isMuted = value;
            },
            getIsMuted: () => isMuted,
            setBgmHandle(handle) {
                bgmHandle = handle;
            },
            getBgmHandle: () => bgmHandle,
            // 추가된 부분: BGM 볼륨 관리 메서드들
            setBgmVolume(volume) {
                bgmVolume = volume;
            },
            getBgmVolume: () => bgmVolume,
            setIsMainMenuBGMPlaying(playing) {
                isMainMenuBGMPlaying = playing;
            },
            getIsMainMenuBGMPlaying: () => isMainMenuBGMPlaying,
            // 추가된 부분: 플레이어 tall 모드 관리 메서드들
            setIsPlayerTall(value) {
                isPlayerTall = value;
            },
            getIsPlayerTall: () => isPlayerTall,
            // 추가된 부분: 버섯 섭취 상태 관리 메서드들
            setHasEatenMushroom(value) {
                hasEatenMushroom = value;
            },
            getHasEatenMushroom: () => hasEatenMushroom,
            // 추가된 부분: newcha 다이얼로그 상태 관리 메서드들
            setHasNewchaDialogShown(value) {
                hasNewchaDialogShown = value;
            },
            getHasNewchaDialogShown: () => hasNewchaDialogShown,
            // 추가된 부분: Day 시스템 관리 메서드들
            getCurrentDay: () => currentDay,
            advanceDay() {
                currentDay++;
                dayStartTime = Date.now();
                return currentDay;
            },
            setCurrentDay(day) {
                currentDay = day;
                dayStartTime = Date.now();
            },
            getDayStartTime: () => dayStartTime,
            getDayDurationMS: () => dayDurationMS,
            setDayDurationMS(duration) {
                dayDurationMS = duration;
            },
            getDayProgress() {
                const elapsed = Date.now() - dayStartTime;
                const progress = Math.min(elapsed / dayDurationMS, 1);
                return progress;
            },
            isNewDay() {
                const elapsed = Date.now() - dayStartTime;
                return elapsed >= dayDurationMS;
            },
            // 추가된 부분: 퀘스트 상태 관리 메서드들
            getStudentQuest(studentId) {
                return (
                    studentQuests[studentId] || {
                        hasQuest: false,
                        questType: null,
                        isCompleted: false,
                    }
                );
            },
            setStudentQuest(studentId, hasQuest, questType = null) {
                if (!studentQuests[studentId]) {
                    studentQuests[studentId] = {
                        hasQuest: false,
                        questType: null,
                        isCompleted: false,
                    };
                }
                studentQuests[studentId].hasQuest = hasQuest;
                studentQuests[studentId].questType = questType;
            },
            completeStudentQuest(studentId) {
                if (studentQuests[studentId]) {
                    studentQuests[studentId].isCompleted = true;
                    studentQuests[studentId].hasQuest = false;
                }
            },
            // 퀘스트가 있는 모든 학생들의 목록을 반환
            getStudentsWithQuests() {
                return Object.keys(studentQuests).filter(
                    (studentId) =>
                        studentQuests[studentId].hasQuest &&
                        !studentQuests[studentId].isCompleted
                );
            },
            // 추가된 부분: 기분/체력 관리 메서드들
            getMood: () => mood,
            setMood(value) {
                mood = Math.max(0, Math.min(9, value)); // 0~9 범위로 제한
            },
            changeMood(delta) {
                mood = Math.max(0, Math.min(9, mood + delta));
            },
            getHealth: () => health,
            setHealth(value) {
                health = Math.max(0, Math.min(9, value)); // 0~9 범위로 제한
            },
            changeHealth(delta) {
                health = Math.max(0, Math.min(9, health + delta));
            },
            // 추가된 부분: 플레이어 이름 관리 메서드들
            getPlayerName: () => playerName,
            setPlayerName(name) {
                playerName = name || "";
            },
            // 전역 인벤토리 관리 메서드들
            getGlobalInventory() {
                return [...globalInventory];
            },
            addToGlobalInventory(item) {
                const existingIndex = globalInventory.findIndex(invItem => invItem.id === item.id);
                if (existingIndex === -1) {
                    globalInventory.push(item);
                    console.log(`📦 전역 인벤토리에 아이템 추가: ${item.name}`);
                    return true;
                } else {
                    console.log(`📦 아이템 이미 존재: ${item.name}`);
                    return false;
                }
            },
            removeFromGlobalInventory(itemId) {
                const index = globalInventory.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    const removedItem = globalInventory.splice(index, 1)[0];
                    console.log(`📦 전역 인벤토리에서 아이템 제거: ${removedItem.name}`);
                    return true;
                }
                return false;
            },
            hasItemInGlobalInventory(itemId) {
                return globalInventory.some(item => item.id === itemId);
            },
            clearGlobalInventory() {
                globalInventory = [];
                console.log("📦 전역 인벤토리 초기화");
            },
            // 전역 퀘스트 관리 메서드들
            getGlobalQuests() {
                return [...globalQuests];
            },
            addToGlobalQuests(quest) {
                const existingIndex = globalQuests.findIndex(q => q.id === quest.id);
                if (existingIndex === -1) {
                    globalQuests.push(quest);
                    console.log(`📋 전역 퀘스트 추가: ${quest.title}`);
                    return true;
                } else {
                    // 기존 퀘스트 업데이트
                    globalQuests[existingIndex] = { ...globalQuests[existingIndex], ...quest };
                    console.log(`📋 전역 퀘스트 업데이트: ${quest.title}`);
                    return true;
                }
            },
            removeFromGlobalQuests(questId) {
                const index = globalQuests.findIndex(quest => quest.id === questId);
                if (index !== -1) {
                    const removedQuest = globalQuests.splice(index, 1)[0];
                    console.log(`📋 전역 퀘스트 제거: ${removedQuest.title}`);
                    return true;
                }
                return false;
            },
            updateGlobalQuestProgress(questId, progress) {
                const questIndex = globalQuests.findIndex(quest => quest.id === questId);
                if (questIndex !== -1) {
                    globalQuests[questIndex] = { ...globalQuests[questIndex], ...progress };
                    console.log(`📋 전역 퀘스트 진행도 업데이트: ${globalQuests[questIndex].title}`);
                    return true;
                }
                return false;
            },
            clearGlobalQuests() {
                globalQuests = [];
                console.log("📋 전역 퀘스트 초기화");
            },
        };
    }

    return {
        getInstance() {
            if (!instance) {
                instance = createInstance();
            }

            return instance;
        },
    };
}
