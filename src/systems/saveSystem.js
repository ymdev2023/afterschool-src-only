import { gameState, globalState } from "../state/stateManagers.js";

/**
 * 게임 저장/로드 시스템
 * 플레이어 데이터를 JSON 파일로 관리하고 로그를 남깁니다.
 */

// 저장 데이터 구조
class SaveData {
    constructor() {
        this.playerName = "";
        this.createdAt = new Date().toISOString();
        this.lastUpdated = new Date().toISOString();
        this.currentScene = "";
        this.playerStats = {
            level: 1,
            experience: 0,
            health: 100
        };
        this.gameProgress = {
            completedQuests: [],
            visitedScenes: [],
            achievements: []
        };
        this.settings = {
            locale: "korean",
            volume: 1.0,
            isMuted: false
        };
    }
}

/**
 * 현재 게임 상태를 저장 데이터로 변환
 */
function createSaveData() {
    const saveData = new SaveData();
    
    // gameState에서 데이터 수집
    saveData.playerName = gameState.playerName || "";
    saveData.currentScene = gameState.getCurrentScene() || "prologue";
    saveData.settings.locale = gameState.getLocale() || "korean";
    saveData.settings.isMuted = gameState.getIsMuted() || false;
    
    // 추가 데이터가 있다면 여기서 수집
    if (gameState.playerStats) {
        saveData.playerStats = { ...saveData.playerStats, ...gameState.playerStats };
    }
    
    if (gameState.gameProgress) {
        saveData.gameProgress = { ...saveData.gameProgress, ...gameState.gameProgress };
    }
    
    return saveData;
}

/**
 * 저장 데이터를 gameState에 로드
 */
function loadSaveData(saveData) {
    if (!saveData) return false;
    
    try {
        // 기본 데이터 로드
        if (saveData.playerName) {
            gameState.playerName = saveData.playerName;
            globalState.setPlayerName(saveData.playerName);
        }
        
        if (saveData.settings) {
            if (saveData.settings.locale) {
                gameState.setLocale(saveData.settings.locale);
            }
            if (saveData.settings.isMuted !== undefined) {
                gameState.setIsMuted(saveData.settings.isMuted);
            }
        }
        
        // 추가 데이터 로드
        if (saveData.playerStats) {
            gameState.playerStats = saveData.playerStats;
        }
        
        if (saveData.gameProgress) {
            gameState.gameProgress = saveData.gameProgress;
        }
        
        console.log("✅ 저장 데이터 로드 완료:", saveData.playerName, saveData.createdAt);
        return true;
    } catch (error) {
        console.error("❌ 저장 데이터 로드 실패:", error);
        return false;
    }
}

/**
 * 브라우저 localStorage에 저장
 */
function saveToLocalStorage(saveData) {
    try {
        const saveKey = `afterschool_rpg_save_${Date.now()}`;
        const saveDataWithTimestamp = {
            ...saveData,
            lastUpdated: new Date().toISOString(),
            saveKey: saveKey
        };
        
        localStorage.setItem(saveKey, JSON.stringify(saveDataWithTimestamp));
        localStorage.setItem('afterschool_rpg_latest_save', saveKey);
        
        console.log("💾 localStorage 저장 완료:", saveKey);
        return saveKey;
    } catch (error) {
        console.error("❌ localStorage 저장 실패:", error);
        return null;
    }
}

/**
 * 브라우저 localStorage에서 로드
 */
function loadFromLocalStorage() {
    try {
        const latestSaveKey = localStorage.getItem('afterschool_rpg_latest_save');
        if (!latestSaveKey) {
            console.log("📂 저장된 데이터가 없습니다.");
            return null;
        }
        
        const saveDataString = localStorage.getItem(latestSaveKey);
        if (!saveDataString) {
            console.log("📂 저장 데이터를 찾을 수 없습니다.");
            return null;
        }
        
        const saveData = JSON.parse(saveDataString);
        console.log("📂 localStorage 로드 완료:", saveData.playerName, saveData.createdAt);
        return saveData;
    } catch (error) {
        console.error("❌ localStorage 로드 실패:", error);
        return null;
    }
}

/**
 * 모든 저장 데이터 목록 가져오기
 */
function getAllSaveData() {
    const saves = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('afterschool_rpg_save_')) {
                const saveDataString = localStorage.getItem(key);
                if (saveDataString) {
                    const saveData = JSON.parse(saveDataString);
                    saves.push(saveData);
                }
            }
        }
        
        // 최신 순으로 정렬
        saves.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        console.log("📂 전체 저장 데이터 목록:", saves.length, "개");
        return saves;
    } catch (error) {
        console.error("❌ 저장 데이터 목록 가져오기 실패:", error);
        return [];
    }
}

/**
 * 로그 기록을 위한 함수
 */
function logSaveAction(action, playerName, additionalData = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: action, // "save", "load", "create", "update"
        playerName: playerName || "Unknown",
        scene: gameState.getCurrentScene() || "Unknown",
        ...additionalData
    };
    
    console.log(`📝 [SAVE LOG] ${action.toUpperCase()}:`, logEntry);
    
    // 로그를 localStorage에도 저장 (최근 100개만 유지)
    try {
        const logs = JSON.parse(localStorage.getItem('afterschool_rpg_logs') || '[]');
        logs.unshift(logEntry);
        
        // 최근 100개만 유지
        if (logs.length > 100) {
            logs.splice(100);
        }
        
        localStorage.setItem('afterschool_rpg_logs', JSON.stringify(logs));
    } catch (error) {
        console.error("❌ 로그 저장 실패:", error);
    }
}

/**
 * 게임 데이터 저장 (메인 함수)
 */
export function saveGameData(additionalData = {}) {
    try {
        const saveData = createSaveData();
        
        // 추가 데이터 병합
        Object.assign(saveData, additionalData);
        
        // localStorage에 저장
        const saveKey = saveToLocalStorage(saveData);
        
        if (saveKey) {
            // 로그 기록
            logSaveAction("save", saveData.playerName, {
                saveKey: saveKey,
                dataSize: JSON.stringify(saveData).length
            });
            
            console.log("💾 게임 데이터 저장 완료!");
            console.log("📊 저장된 데이터:", {
                playerName: saveData.playerName,
                scene: saveData.currentScene,
                timestamp: saveData.lastUpdated
            });
            
            return saveKey;
        } else {
            throw new Error("저장 실패");
        }
    } catch (error) {
        console.error("❌ 게임 데이터 저장 실패:", error);
        return null;
    }
}

/**
 * 게임 데이터 로드 (메인 함수)
 */
export function loadGameData() {
    try {
        const saveData = loadFromLocalStorage();
        
        if (saveData) {
            const success = loadSaveData(saveData);
            
            if (success) {
                // 로그 기록
                logSaveAction("load", saveData.playerName, {
                    saveKey: saveData.saveKey,
                    originalSaveTime: saveData.createdAt
                });
                
                console.log("📂 게임 데이터 로드 완료!");
                return saveData;
            }
        }
        
        return null;
    } catch (error) {
        console.error("❌ 게임 데이터 로드 실패:", error);
        return null;
    }
}

/**
 * 새 플레이어 생성 (프롤로그용)
 */
export async function createNewPlayer(playerName, additionalData = {}) {
    try {
        // gameState와 globalState에 플레이어 이름 설정
        gameState.playerName = playerName;
        globalState.setPlayerName(playerName);
        
        // 저장 데이터 생성
        const saveData = createSaveData();
        saveData.playerName = playerName;
        Object.assign(saveData, additionalData);
        
        // localStorage에 저장
        const saveKey = saveToLocalStorage(saveData);
        
        if (saveKey) {
            // 로그 기록
            logSaveAction("create", playerName, {
                saveKey: saveKey,
                isNewPlayer: true
            });
            
            console.log("🎮 새 플레이어 생성 완료!");
            console.log("📊 플레이어 정보:", {
                name: playerName,
                created: saveData.createdAt,
                saveKey: saveKey
            });
            
            console.log("💾 localStorage에 저장 완료!");
            
            return saveKey;
        } else {
            throw new Error("새 플레이어 저장 실패");
        }
    } catch (error) {
        console.error("❌ 새 플레이어 생성 실패:", error);
        return null;
    }
}

/**
 * 로그 조회
 */
export function getSaveLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('afterschool_rpg_logs') || '[]');
        console.log("📝 저장 로그 조회:", logs.length, "개");
        return logs;
    } catch (error) {
        console.error("❌ 로그 조회 실패:", error);
        return [];
    }
}

/**
 * 저장 데이터 목록 조회
 */
export function getSaveList() {
    return getAllSaveData();
}

/**
 * 자동으로 플레이어 이름 로드 (프롤로그를 거치지 않을 때 사용)
 */
export function autoLoadPlayerName() {
    try {
        // 1. gameState에 이미 플레이어 이름이 있는지 확인
        if (gameState.playerName && gameState.playerName.trim() !== "") {
            console.log("🎮 gameState에서 플레이어 이름 발견:", gameState.playerName);
            return gameState.playerName;
        }
        
        // 2. 최신 저장 데이터에서 플레이어 이름 로드
        const latestSave = loadFromLocalStorage();
        if (latestSave && latestSave.playerName && latestSave.playerName.trim() !== "") {
            console.log("📂 최신 저장 데이터에서 플레이어 이름 로드:", latestSave.playerName);
            gameState.playerName = latestSave.playerName;
            globalState.setPlayerName(latestSave.playerName);
            
            // 로그 기록
            logSaveAction("auto_load", latestSave.playerName, {
                loadedFrom: "latest_save",
                originalSaveTime: latestSave.createdAt
            });
            
            return latestSave.playerName;
        }
        
        // 3. 모든 저장 데이터 중에서 가장 최신 것 찾기
        const allSaves = getAllSaveData();
        if (allSaves.length > 0) {
            const newestSave = allSaves[0]; // 이미 최신 순으로 정렬되어 있음
            if (newestSave.playerName && newestSave.playerName.trim() !== "") {
                console.log("📂 전체 저장 데이터에서 가장 최신 플레이어 이름 로드:", newestSave.playerName);
                gameState.playerName = newestSave.playerName;
                globalState.setPlayerName(newestSave.playerName);
                
                // 로그 기록
                logSaveAction("auto_load", newestSave.playerName, {
                    loadedFrom: "all_saves",
                    originalSaveTime: newestSave.createdAt,
                    totalSaves: allSaves.length
                });
                
                return newestSave.playerName;
            }
        }
        
        // 4. 저장된 데이터가 없으면 테스트 이름 사용
        const defaultName = "테스트";
        console.log("🎮 저장된 데이터가 없어 테스트 이름 사용:", defaultName);
        gameState.playerName = defaultName;
        globalState.setPlayerName(defaultName);
        
        // 로그 기록
        logSaveAction("auto_load", defaultName, {
            loadedFrom: "default",
            reason: "no_saved_data"
        });
        
        return defaultName;
        
    } catch (error) {
        console.error("❌ 자동 플레이어 이름 로드 실패:", error);
        const defaultName = "테스트";
        gameState.playerName = defaultName;
        globalState.setPlayerName(defaultName);
        
        // 로그 기록
        logSaveAction("auto_load", defaultName, {
            loadedFrom: "default",
            reason: "error",
            error: error.message
        });
        
        return defaultName;
    }
}

/**
 * 씬 시작 시 자동으로 게임 데이터 초기화
 */
export function initializeGameData(sceneName = "unknown") {
    try {
        console.log(`🎮 게임 데이터 초기화 시작 - 씬: ${sceneName}`);
        
        // 자동으로 플레이어 이름 로드
        const playerName = autoLoadPlayerName();
        
        // 현재 씬 정보 업데이트
        if (gameState.setCurrentScene) {
            gameState.setCurrentScene(sceneName);
        }
        
        // 방문한 씬 기록
        if (!gameState.gameProgress) {
            gameState.gameProgress = { visitedScenes: [], completedQuests: [], achievements: [] };
        }
        
        if (!gameState.gameProgress.visitedScenes.includes(sceneName)) {
            gameState.gameProgress.visitedScenes.push(sceneName);
        }
        
        // 게임 데이터 업데이트 저장 (너무 자주 저장하지 않도록 조건부)
        if (sceneName !== "prologue" && sceneName !== "tutorial") {
            saveGameData({
                currentScene: sceneName,
                lastAccessed: new Date().toISOString()
            });
        }
        
        console.log(`✅ 게임 데이터 초기화 완료 - 플레이어: ${playerName}, 씬: ${sceneName}`);
        
        return {
            playerName: playerName,
            sceneName: sceneName,
            initialized: true
        };
        
    } catch (error) {
        console.error("❌ 게임 데이터 초기화 실패:", error);
        return {
            playerName: "플레이어",
            sceneName: sceneName,
            initialized: false,
            error: error.message
        };
    }
}

/**
 * 디버그용 함수들
 */
export const debugSaveSystem = {
    // 모든 저장 데이터 출력
    showAllSaves() {
        const saves = getAllSaveData();
        console.table(saves.map(save => ({
            playerName: save.playerName,
            scene: save.currentScene,
            created: save.createdAt,
            updated: save.lastUpdated
        })));
    },
    
    // 모든 로그 출력
    showAllLogs() {
        const logs = getSaveLogs();
        console.table(logs.slice(0, 20)); // 최근 20개만
    },
    
    // 저장 데이터 초기화
    clearAllSaves() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('afterschool_rpg_')) {
                keys.push(key);
            }
        }
        
        keys.forEach(key => localStorage.removeItem(key));
        console.log("🗑️ 모든 저장 데이터 삭제 완료:", keys.length, "개");
    }
};

// 전역으로 디버그 함수 노출 (개발용)
if (typeof window !== 'undefined') {
    window.debugSaveSystem = debugSaveSystem;
}
