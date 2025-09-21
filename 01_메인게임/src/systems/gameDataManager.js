// 게임 저장 데이터 관리 시스템
export class GameDataManager {
    constructor() {
        this.storageKey = "afterschoolrpg_saves";
        this.currentSaveSlot = null;
    }

    // 새로운 저장 데이터 생성
    createSaveData(playerName) {
        const now = new Date();
        const saveId = `${playerName}_${now.getTime()}`;
        
        const saveData = {
            id: saveId,
            playerName: playerName,
            createdAt: now.toISOString(),
            lastPlayedAt: now.toISOString(),
            
            // 게임 진행 상태
            gameState: {
                currentScene: "prologue",
                playerPosition: { x: 0, y: 0 },
                locale: "korean", // 언어 설정
                isMuted: false,
                bgmVolume: 1.0,
                mood: 9, // 기분 상태 (0~9)
                health: 9 // 체력 상태 (0~9)
            },
            
            // 퀘스트 상태
            questState: {
                questItems: [
                    {
                        title: "골대 근처 계단에 앉은 친구에게 말걸기",
                        details: ["운동장 골대 근처에서 계단에 앉아있는 학생 찾기", "그 학생과 대화해보기"],
                        expanded: false,
                        completed: false,
                        targetNpc: "student1"
                    },
                    {
                        title: "운동장에서 개미 관찰하는 친구 찾고 말걸기",
                        details: ["운동장을 둘러보며 개미를 관찰하는 학생 찾기", "그 학생과 대화해보기"],
                        expanded: false,
                        completed: false
                    }
                ],
                hasNewQuests: true
            },
            
            // 대화 및 이벤트 진행 상태
            progressState: {
                completedDialogues: [],
                visitedScenes: ["prologue"],
                unlockedAreas: [],
                interactedNPCs: []
            },
            
            // 플레이 시간 통계
            playTime: {
                totalSeconds: 0,
                sessionStart: now.getTime()
            }
        };
        
        console.log(`[DEBUG] 새로운 저장 데이터 생성: ${saveId}`);
        this.currentSaveSlot = saveId;
        this.saveToBrowser(saveData);
        return saveData;
    }
    
    // 브라우저 로컬스토리지에 저장
    saveToBrowser(saveData) {
        try {
            const allSaves = this.getAllSaves();
            allSaves[saveData.id] = saveData;
            
            localStorage.setItem(this.storageKey, JSON.stringify(allSaves));
            console.log(`[DEBUG] 저장 완료: ${saveData.id}`);
            return true;
        } catch (error) {
            console.error("[ERROR] 저장 실패:", error);
            return false;
        }
    }
    
    // 모든 저장 데이터 가져오기
    getAllSaves() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) {
            console.error("[ERROR] 저장 데이터 로드 실패:", error);
            return {};
        }
    }
    
    // 특정 저장 데이터 가져오기
    getSaveData(saveId) {
        const allSaves = this.getAllSaves();
        return allSaves[saveId] || null;
    }
    
    // 저장 데이터 목록 (최신순으로 정렬)
    getSaveList() {
        const allSaves = this.getAllSaves();
        const saveList = Object.values(allSaves);
        
        // 최신 플레이 시간 순으로 정렬
        return saveList.sort((a, b) => 
            new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
        );
    }
    
    // 현재 게임 상태를 저장 데이터에 업데이트
    updateCurrentSave(gameState, questState, playerPosition = null, currentScene = null, globalState = null) {
        if (!this.currentSaveSlot) {
            console.warn("[WARNING] 현재 저장 슬롯이 없습니다.");
            return false;
        }
        
        const saveData = this.getSaveData(this.currentSaveSlot);
        if (!saveData) {
            console.error("[ERROR] 저장 데이터를 찾을 수 없습니다.");
            return false;
        }
        
        // 플레이 시간 계산
        const now = Date.now();
        const sessionTime = now - saveData.playTime.sessionStart;
        saveData.playTime.totalSeconds += Math.floor(sessionTime / 1000);
        saveData.playTime.sessionStart = now;
        
        // 게임 상태 업데이트
        saveData.lastPlayedAt = new Date().toISOString();
        
        if (currentScene) {
            saveData.gameState.currentScene = currentScene;
            if (!saveData.progressState.visitedScenes.includes(currentScene)) {
                saveData.progressState.visitedScenes.push(currentScene);
            }
        }
        
        if (playerPosition) {
            saveData.gameState.playerPosition = playerPosition;
        }
        
        if (gameState) {
            saveData.gameState.locale = gameState.getLocale();
            saveData.gameState.isMuted = gameState.getIsMuted();
            saveData.gameState.bgmVolume = gameState.getBgmVolume();
            // mood와 health 상태도 저장
            saveData.gameState.mood = gameState.getMood();
            saveData.gameState.health = gameState.getHealth();
        }
        
        if (questState) {
            saveData.questState = { ...questState };
        }
        
        // 전역 상태 저장
        if (globalState) {
            saveData.globalInventory = globalState.getGlobalInventory();
            saveData.globalQuests = globalState.getGlobalQuests();
            console.log(`[DEBUG] 전역 상태 저장 - 인벤토리: ${saveData.globalInventory.length}개, 퀘스트: ${saveData.globalQuests.length}개`);
        }
        
        return this.saveToBrowser(saveData);
    }
    
    // 저장 데이터 로드 (게임 상태에 적용)
    loadSaveData(saveId, gameState, questState, globalState = null) {
        const saveData = this.getSaveData(saveId);
        if (!saveData) {
            console.error(`[ERROR] 저장 데이터를 찾을 수 없습니다: ${saveId}`);
            return false;
        }
        
        this.currentSaveSlot = saveId;
        
        // 게임 상태 복원
        if (gameState && saveData.gameState) {
            console.log(`[DEBUG] gameState 복원 중...`);
            if (saveData.gameState.locale) gameState.setLocale(saveData.gameState.locale);
            if (saveData.gameState.isMuted !== undefined) gameState.setIsMuted(saveData.gameState.isMuted);
            if (saveData.gameState.bgmVolume !== undefined) gameState.setBgmVolume(saveData.gameState.bgmVolume);
            
            // mood와 health 상태도 복원
            if (saveData.gameState.mood !== undefined) gameState.setMood(saveData.gameState.mood);
            if (saveData.gameState.health !== undefined) gameState.setHealth(saveData.gameState.health);
            
            // playerName도 gameState에 설정
            if (saveData.playerName) {
                gameState.playerName = saveData.playerName;
            }
            
            console.log(`[DEBUG] gameState 복원 완료 - 언어: ${saveData.gameState.locale}, 음소거: ${saveData.gameState.isMuted}, 볼륨: ${saveData.gameState.bgmVolume}, 기분: ${saveData.gameState.mood}, 체력: ${saveData.gameState.health}`);
        }
        
        // 퀘스트 상태 복원 (questItems 배열인 경우)
        if (questState && saveData.questState) {
            console.log(`[DEBUG] questState 복원 중... (${saveData.questState.questItems?.length || 0}개)`);
            if (Array.isArray(questState) && saveData.questState.questItems) {
                // questState가 배열인 경우 (questItems)
                questState.length = 0;
                questState.push(...saveData.questState.questItems);
            } else {
                // questState가 객체인 경우
                Object.assign(questState, saveData.questState);
            }
        }
        
        // 전역 상태 복원
        if (globalState) {
            if (saveData.globalInventory) {
                globalState.clearGlobalInventory();
                saveData.globalInventory.forEach(item => {
                    globalState.addToGlobalInventory(item);
                });
                console.log(`[DEBUG] 전역 인벤토리 복원: ${saveData.globalInventory.length}개 아이템`);
            }
            
            if (saveData.globalQuests) {
                globalState.clearGlobalQuests();
                saveData.globalQuests.forEach(quest => {
                    globalState.addToGlobalQuests(quest);
                });
                console.log(`[DEBUG] 전역 퀘스트 복원: ${saveData.globalQuests.length}개 퀘스트`);
            }
        }
        
        console.log(`[DEBUG] 저장 데이터 로드 완료: ${saveId}`);
        return saveData;
    }
    
    // 저장 데이터 삭제
    deleteSaveData(saveId) {
        const allSaves = this.getAllSaves();
        if (allSaves[saveId]) {
            delete allSaves[saveId];
            localStorage.setItem(this.storageKey, JSON.stringify(allSaves));
            console.log(`[DEBUG] 저장 데이터 삭제: ${saveId}`);
            return true;
        }
        return false;
    }
    
    // 현재 저장 슬롯 설정
    setCurrentSaveSlot(saveId) {
        this.currentSaveSlot = saveId;
    }
    
    // 현재 저장 슬롯 가져오기
    getCurrentSaveSlot() {
        return this.currentSaveSlot;
    }
    
    // 플레이 시간을 포맷된 문자열로 반환
    formatPlayTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        } else if (minutes > 0) {
            return `${minutes}분 ${seconds}초`;
        } else {
            return `${seconds}초`;
        }
    }
    
    // 저장 데이터 정리 (오래된 데이터 삭제)
    cleanupOldSaves(maxSaves = 10) {
        const saveList = this.getSaveList();
        if (saveList.length <= maxSaves) return;
        
        const allSaves = this.getAllSaves();
        const toDelete = saveList.slice(maxSaves);
        
        toDelete.forEach(save => {
            delete allSaves[save.id];
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(allSaves));
        console.log(`[DEBUG] 오래된 저장 데이터 ${toDelete.length}개 정리 완료`);
    }
    
    // 모든 저장 데이터 삭제
    deleteAllSaves() {
        try {
            console.log("[DEBUG] 모든 저장 데이터 삭제 시작");
            
            // localStorage에서 완전히 제거
            localStorage.removeItem(this.storageKey);
            
            // 현재 저장 슬롯도 초기화
            this.currentSaveSlot = null;
            
            console.log("[DEBUG] 모든 저장 데이터 삭제 완료");
            return true;
        } catch (error) {
            console.error("[ERROR] 저장 데이터 삭제 실패:", error);
            return false;
        }
    }
}

// 전역 인스턴스
export const gameDataManager = new GameDataManager();
