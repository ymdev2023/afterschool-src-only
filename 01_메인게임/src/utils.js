import { playerState } from "./state/stateManagers.js";
import { healthBar } from "./uiComponents/healthbar.js";
import { gameState } from "./state/stateManagers.js";

// 전역 오디오 관리 객체
export const audioManager = {
    currentBGM: null,
    currentBGMElement: null,
    fadeTimeouts: [],
    isWindowVisible: true,
    wasPlayingBeforeHide: false,
    volumeBeforeHide: 1.0,
    
    // BGM 재생 (Kaboom.js 사운드 사용)
    playBGM(soundName, volume = 1.0) {
        console.log(`🎵 BGM 재생 시도: ${soundName}, 볼륨: ${volume}`);
        
        return new Promise((resolve, reject) => {
            // 기존 BGM 정리
            this.stopBGM();
            
            try {
                // Kaboom.js의 k 인스턴스 가져오기
                const k = window.k;
                if (!k) {
                    console.error("❌ Kaboom.js 인스턴스를 찾을 수 없습니다");
                    reject(new Error("Kaboom.js 인스턴스를 찾을 수 없습니다"));
                    return;
                }
                
                // Kaboom.js로 BGM 재생
                const audio = k.play(soundName, {
                    loop: true,
                    volume: volume
                });
                
                this.currentBGM = soundName;
                this.currentBGMElement = audio;
                console.log(`🎵 BGM 재생 성공: ${soundName}`);
                
                resolve(audio);
            } catch (error) {
                console.error(`❌ BGM 재생 실패: ${soundName}`, error);
                reject(error);
            }
        });
    },
    
    /**
     * 즉시 BGM 전환 함수 (기존 BGM을 즉시 정지하고 새 BGM 재생)
     * ✅ 이 함수는 타일맵 씬에서 사용! (audioManager 통합 관리)
     * 
     * 사용해야 하는 씬:
     * - second.js, health.js, class1.js, front.js, garage.js, restaurant.js, restroom.js 등
     * - 모든 타일맵 기반 게임플레이 씬
     * 
     * 장점:
     * - 창 포커스 변경 시 자동 음소거/복원
     * - 통합된 오디오 상태 관리
     * - BGM 중복 재생 방지
     */
    switchBGM(soundName, volume = 1.0) {
        console.log(`🔄 BGM 즉시 전환: ${this.currentBGM} → ${soundName}`);
        console.log(`🎵 BGM 상태 체크:`, {
            currentBGM: this.currentBGM,
            targetBGM: soundName,
            isCurrentlyPlaying: this.isBGMPlaying(),
            willSkip: this.currentBGM === soundName && this.isBGMPlaying()
        });
        
        // 현재 재생 중인 BGM과 동일하면 전환하지 않음
        if (this.currentBGM === soundName && this.isBGMPlaying()) {
            console.log(`🎵 이미 ${soundName}이 재생 중이므로 전환하지 않음`);
            return Promise.resolve(this.currentBGMElement);
        }
        
        // 기존 BGM 즉시 정지
        console.log(`🛑 기존 BGM 정지 중: ${this.currentBGM}`);
        this.stopBGM();
        
        // 음소거 상태 확인
        if (window.gameState && window.gameState.getIsMuted()) {
            console.log(`🔇 음소거 상태이므로 BGM 재생하지 않음: ${soundName}`);
            this.currentBGM = soundName; // 현재 BGM 이름은 저장 (음소거 해제 시 사용)
            return Promise.resolve(null);
        }
        
        try {
            const k = window.k;
            if (!k) {
                console.error("❌ Kaboom.js 인스턴스를 찾을 수 없습니다");
                return Promise.reject(new Error("Kaboom.js 인스턴스를 찾을 수 없습니다"));
            }
            
            // 새 BGM 즉시 재생
            console.log(`🎵 새 BGM 재생 시작: ${soundName} (볼륨: ${volume})`);
            const audio = k.play(soundName, {
                loop: true,
                volume: volume
            });
            
            this.currentBGM = soundName;
            this.currentBGMElement = audio;
            console.log(`✅ BGM 전환 완료: ${soundName} (볼륨: ${volume})`);
            
            return Promise.resolve(audio);
        } catch (error) {
            console.error(`❌ BGM 전환 실패: ${soundName}`, error);
            return Promise.reject(error);
        }
    },
    
    // BGM 정지
    stopBGM() {
        console.log(`🛑 BGM 정지 시작: currentBGM=${this.currentBGM}, currentBGMElement=${!!this.currentBGMElement}`);
        
        if (this.currentBGMElement) {
            // Kaboom.js 오디오 객체인 경우 stop() 메서드 사용
            if (this.currentBGMElement.stop) {
                this.currentBGMElement.stop();
                console.log(`🛑 Kaboom.js 오디오 정지: ${this.currentBGM}`);
            } else {
                // HTML5 Audio 객체인 경우 기존 방식 사용
                this.currentBGMElement.pause();
                this.currentBGMElement.currentTime = 0;
                console.log(`🛑 HTML5 오디오 정지: ${this.currentBGM}`);
            }
            this.currentBGMElement = null;
            console.log(`✅ currentBGMElement 정리 완료`);
        }
        
        // 🚨 초강력 BGM 정지 - 모든 가능한 방법으로 BGM 정지
        try {
            const k = window.k;
            if (k) {
                console.log(`🛑 Kaboom.js 초강력 오디오 정지 시작`);
                
                // 1. 알려진 BGM 트랙들을 개별적으로 정지
                const bgmTracks = [
                    "health-bgm", "second-bgm", "class1-bgm", "first-bgm", 
                    "front-bgm", "garage-bgm", "restaurant-bgm", "restroom-bgm", 
                    "title-bgm", "prologue-bgm", "intro-bgm"
                ];
                
                bgmTracks.forEach(trackName => {
                    try {
                        // Kaboom.js의 stop 함수로 각 트랙 정지
                        if (k.stop) {
                            k.stop(trackName);
                            console.log(`🛑 개별 정지: ${trackName}`);
                        }
                    } catch (e) {
                        // 해당 트랙이 재생 중이 아니면 에러가 날 수 있음 (무시)
                    }
                });
                
                // 2. Kaboom.js의 모든 활성 오디오 정지
                if (k.getAll) {
                    try {
                        const allObjects = k.getAll();
                        console.log(`🔍 Kaboom.js 총 오브젝트 수: ${allObjects.length}`);
                        
                        // 오디오 관련 오브젝트 필터링 및 정지
                        const audioObjects = allObjects.filter(obj => 
                            obj.stop || obj.pause || obj.volume !== undefined || 
                            obj.play || obj.destroy || obj.remove
                        );
                        
                        console.log(`🔍 오디오 관련 오브젝트 수: ${audioObjects.length}`);
                        
                        audioObjects.forEach((audioObj, index) => {
                            try {
                                if (audioObj.stop) {
                                    audioObj.stop();
                                    console.log(`🛑 오디오 객체 ${index} 정지됨 (stop)`);
                                } else if (audioObj.pause) {
                                    audioObj.pause();
                                    console.log(`🛑 오디오 객체 ${index} 정지됨 (pause)`);
                                } else if (audioObj.destroy) {
                                    audioObj.destroy();
                                    console.log(`🛑 오디오 객체 ${index} 파괴됨 (destroy)`);
                                }
                            } catch (e) {
                                console.log(`⚠️ 오디오 객체 ${index} 정지 중 오류 (무시됨):`, e.message);
                            }
                        });
                    } catch (error) {
                        console.log(`⚠️ getAll() 사용 중 오류:`, error.message);
                    }
                }
                
                // 3. 전역 오디오 컨텍스트 정지 시도 (Web Audio API)
                if (window.AudioContext || window.webkitAudioContext) {
                    try {
                        // 가능한 모든 오디오 컨텍스트를 찾아서 정지
                        if (k.audio && k.audio.ctx) {
                            k.audio.ctx.suspend();
                            console.log(`🛑 Kaboom.js 오디오 컨텍스트 일시중단`);
                            setTimeout(() => {
                                if (k.audio && k.audio.ctx) {
                                    k.audio.ctx.resume();
                                    console.log(`🔊 Kaboom.js 오디오 컨텍스트 재개`);
                                }
                            }, 50);
                        }
                    } catch (error) {
                        console.log(`⚠️ 오디오 컨텍스트 조작 중 오류:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ 초강력 BGM 정지 중 오류 (무시됨):`, error);
        }
        
        // 상태 초기화
        this.currentBGM = null;
        console.log(`✅ BGM 정지 완료 - 모든 상태 초기화`);
        
        // 진행 중인 페이드 타임아웃 정리
        this.fadeTimeouts.forEach(timeout => clearTimeout(timeout));
        this.fadeTimeouts = [];
    },
    
    // 음소거 해제 시 현재 BGM 재시작
    resumeCurrentBGM(volume = 1.0) {
        if (!this.currentBGM) {
            console.log("🔇 재시작할 BGM이 없습니다");
            return Promise.resolve(null);
        }
        
        // 음소거 상태 확인
        if (window.gameState && window.gameState.getIsMuted()) {
            console.log("🔇 아직 음소거 상태이므로 BGM 재시작하지 않음");
            return Promise.resolve(null);
        }
        
        console.log(`🔊 현재 BGM 재시작: ${this.currentBGM}`);
        
        try {
            const k = window.k;
            if (!k) {
                console.error("❌ Kaboom.js 인스턴스를 찾을 수 없습니다");
                return Promise.reject(new Error("Kaboom.js 인스턴스를 찾을 수 없습니다"));
            }
            
            // 기존 BGM 정지 (있다면)
            this.stopBGM();
            
            // 새 BGM 재생
            const audio = k.play(this.currentBGM, {
                loop: true,
                volume: volume
            });
            
            this.currentBGMElement = audio;
            console.log(`🎵 BGM 재시작 완료: ${this.currentBGM} (볼륨: ${volume})`);
            
            return Promise.resolve(audio);
        } catch (error) {
            console.error(`❌ BGM 재시작 실패: ${error.message}`);
            return Promise.reject(error);
        }
    },
    
    // BGM 볼륨 조절
    setBGMVolume(volume) {
        if (this.currentBGMElement) {
            const beforeVolume = this.currentBGMElement.volume || 0;
            const clampedVolume = Math.max(0, Math.min(1, volume));
            
            // Kaboom.js 오디오 객체인 경우
            if (this.currentBGMElement.volume !== undefined) {
                this.currentBGMElement.volume = clampedVolume;
                console.log(`🔊 BGM 볼륨 조절: ${beforeVolume.toFixed(2)} → ${clampedVolume.toFixed(2)} (${Math.round(clampedVolume * 100)}%)`);
                return true;
            } else {
                console.warn(`⚠️ BGM 엘리먼트의 볼륨 속성을 찾을 수 없음`);
                return false;
            }
        } else {
            console.warn(`⚠️ BGM 엘리먼트가 없어서 볼륨 조절 실패`);
            return false;
        }
    },
    
    // BGM Ducking (효과음 재생 시 배경음 줄이기)
    duckBGM(duckVolume = 0.3, duration = 500) {
        if (!this.currentBGMElement) return Promise.resolve();
        
        this.originalVolume = this.currentBGMElement.volume || 1.0;
        console.log(`🔇 BGM Ducking 시작: ${this.originalVolume.toFixed(2)} → ${duckVolume.toFixed(2)}`);
        
        return this.fadeBGMVolume(duckVolume, duration);
    },
    
    // BGM Ducking 해제 (원래 볼륨으로 복구)
    unduckBGM(duration = 500) {
        if (!this.currentBGMElement || this.originalVolume === undefined) return Promise.resolve();
        
        console.log(`🔊 BGM Ducking 해제: ${this.currentBGMElement.volume.toFixed(2)} → ${this.originalVolume.toFixed(2)}`);
        const targetVolume = this.originalVolume;
        
        return this.fadeBGMVolume(targetVolume, duration).then(() => {
            this.originalVolume = undefined; // 리셋
        });
    },
    
    // BGM 볼륨 페이드
    fadeBGMVolume(targetVolume, duration = 1000) {
        return new Promise((resolve) => {
            if (!this.currentBGMElement) {
                resolve();
                return;
            }
            
            const startVolume = this.currentBGMElement.volume;
            const volumeDiff = targetVolume - startVolume;
            const startTime = Date.now();
            
            console.log(`🎛️ BGM 볼륨 페이드: ${startVolume} → ${targetVolume} (${duration}ms)`);
            
            const fadeStep = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentVolume = startVolume + (volumeDiff * progress);
                this.setBGMVolume(currentVolume);
                
                if (progress < 1) {
                    const timeout = setTimeout(fadeStep, 16); // ~60fps
                    this.fadeTimeouts.push(timeout);
                } else {
                    console.log(`✅ BGM 볼륨 페이드 완료: ${targetVolume}`);
                    resolve();
                }
            };
            
            fadeStep();
        });
    },
    
    // 현재 BGM 정보
    getCurrentBGM() {
        return this.currentBGM;
    },
    
    // BGM이 재생 중인지 확인
    isBGMPlaying() {
        return this.currentBGMElement && (
            this.currentBGMElement.paused === false || // HTML5 Audio
            (this.currentBGMElement.paused === undefined && this.currentBGMElement.volume !== undefined) // Kaboom.js Audio
        );
    },

    // 윈도우 포커스 잃을 때 BGM 일시정지/음소거
    handleWindowHide() {
        console.log("🔇 윈도우가 숨겨졌습니다. BGM 음소거");
        this.isWindowVisible = false;
        
        if (this.isBGMPlaying()) {
            this.wasPlayingBeforeHide = true;
            this.volumeBeforeHide = this.currentBGMElement.volume || 1.0;
            this.setBGMVolume(0);
        } else {
            this.wasPlayingBeforeHide = false;
        }
    },

    // 윈도우 포커스 돌아올 때 BGM 복구
    handleWindowShow() {
        console.log("🔊 윈도우가 다시 보입니다. BGM 볼륨 복구");
        this.isWindowVisible = true;
        
        if (this.wasPlayingBeforeHide && this.currentBGMElement) {
            this.setBGMVolume(this.volumeBeforeHide);
        }
        
        this.wasPlayingBeforeHide = false;
    },

    // 윈도우 visibility 이벤트 리스너 설정
    setupVisibilityListeners() {
        // Page Visibility API 사용
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleWindowHide();
            } else {
                this.handleWindowShow();
            }
        });

        // 브라우저 포커스 이벤트 (백업)
        window.addEventListener('blur', () => {
            if (this.isWindowVisible) {
                this.handleWindowHide();
            }
        });

        window.addEventListener('focus', () => {
            if (!this.isWindowVisible) {
                this.handleWindowShow();
            }
        });

        // beforeunload 이벤트 (페이지 떠날 때)
        window.addEventListener('beforeunload', () => {
            this.handleWindowHide();
        });

        console.log("👁️ 윈도우 visibility 이벤트 리스너 설정 완료");
    }
};

export function playAnimIfNotPlaying(gameObj, animName) {
    if (gameObj.curAnim() !== animName) {
        gameObj.play(animName);
    }
}

export function areAnyOfTheseKeysDown(k, keys) {
    for (const key of keys) {
        if (k.isKeyDown(key)) return true;
    }

    return false;
}

export function colorizeBackground(k, r, g, b) {
    k.add([
        k.rect(k.canvas.width, k.canvas.height),
        k.color(r, g, b),
        k.fixed(),
    ]);
}

export function drawTiles(k, map, layer, tileheight, tilewidth) {
    let nbOfDrawnTiles = 0;
    const tilePos = k.vec2(0, 0);
    for (const tile of layer.data) {
        if (nbOfDrawnTiles % layer.width === 0) {
            tilePos.x = 0;
            tilePos.y += tileheight;
        } else {
            tilePos.x += tilewidth;
        }

        nbOfDrawnTiles++;

        if (tile === 0) continue;

        map.add([
            k.sprite("assets", { frame: tile - 1 }),
            k.pos(tilePos),
            k.offscreen(),
        ]);
    }
}

export function drawBoundaries(k, map, layer, excludeNames = []) {
    let colliderCount = 0;
    let boundaries = []; // boundaries 배열 초기화
    
    // layer나 layer.objects가 없는 경우 처리
    if (!layer || !layer.objects) {
        console.warn("⚠️ drawBoundaries: layer 또는 layer.objects가 정의되지 않음", layer);
        return boundaries; // 빈 배열 반환
    }
    
    for (const object of layer.objects) {
        // 이미 처리된 객체들은 제외
        if (excludeNames.includes(object.name)) {
            continue;
        }

        // 태그는 항상 "wall"로 고정 (대화 시스템에서 감지되지 않도록)
        const tag = "wall";

        // 특정 오브젝트들(NPC, 상호작용 오브젝트)은 다른 오프셋 적용
        // 주의: sofa와 drawer는 health.js에서 별도 처리되므로 여기서 제외
        const interactiveObjects = ["teacher", "student23", "student30", "bed1", "bed2", "bed3", "bed4"];
        const yOffset = interactiveObjects.includes(object.name) ? -4 : 0; // 벽 콜라이더 오프셋을 0으로 수정
        
        console.log(`🧱 벽 콜라이더 생성: ${object.name || 'unnamed'} at (${object.x}, ${object.y}) -> (${object.x}, ${object.y + yOffset}) [offset: ${yOffset}]`);

        // 충돌체 직접 생성 (상호작용 불가능하도록 설정)
        const collider = map.add([
            k.rect(object.width, object.height),
            k.pos(object.x, object.y + yOffset),
            k.area(),
            k.body({ isStatic: true }),
            k.opacity(0),
            "wall", // 벽 태그
            "non-interactive", // 상호작용 제외 태그
        ]);

        boundaries.push(collider);
        colliderCount++;
    }
    
    return boundaries;
}

export async function fetchMapData(mapPath) {
    return await (await fetch(mapPath)).json();
}

export function generateColliderBoxComponents(k, width, height, pos, tag) {
    return [
        k.rect(width, height),
        k.pos(pos.x, pos.y), // 오프셋 제거
        k.area(),
        k.body({ isStatic: true }),
        k.opacity(0),
        // k.offscreen() 제거 - 충돌체는 화면 밖에서도 유지되어야 함
        tag || "wall", // 태그가 없으면 기본값 "wall"
    ];
}

export async function blinkEffect(k, entity) {
    await k.tween(
        entity.opacity,
        0,
        0.1,
        (val) => (entity.opacity = val),
        k.easings.linear
    );
    await k.tween(
        entity.opacity,
        1,
        0.1,
        (val) => (entity.opacity = val),
        k.easings.linear
    );
}

export function onAttacked(k, entity) {
    entity.onCollide("swordHitBox", async () => {
        if (entity.isAttacking) return;

        if (entity.hp() <= 0) {
            k.destroy(entity);
        }

        await blinkEffect(k, entity);
        entity.hurt(1);
    });
}

export function onCollideWithPlayer(k, entity) {
    entity.onCollide("player", async (player) => {
        if (player.isAttacking) return;
        playerState.setHealth(playerState.getHealth() - entity.attackPower);
        k.destroyAll("healthContainer");
        healthBar(k, player);
        await blinkEffect(k, player);
    });
}

// 추가된 부분: BGM 볼륨 관리를 위한 전역 변수들
let originalBgmVolume = 0.4;
let currentBgmVolume = 0.4;
let bgmDuckingTimeouts = new Set();
let isDucked = false; // 수정된 부분: 덕킹 상태 추적

// 수정된 부분: BGM 볼륨을 20%로 확실하게 감소시키는 함수
export function duckBgm(k) {
    const bgmHandle = gameState.getBgmHandle();
    if (!bgmHandle || bgmHandle.paused) return;

    console.log("[DEBUG] BGM 덕킹 적용 - 원래 볼륨:", bgmHandle.volume);

    // 수정된 부분: 현재 볼륨을 저장하고 20%로 감소
    if (!isDucked) {
        originalBgmVolume = bgmHandle.volume; // 현재 실제 볼륨 저장
        const duckedVolume = originalBgmVolume * 0.2; // 20%로 감소
        bgmHandle.volume = duckedVolume;
        isDucked = true;

        console.log("[DEBUG] BGM 덕킹 완료 - 덕킹 후 볼륨:", duckedVolume);
    }
}

// 수정된 부분: BGM 볼륨을 정확히 원래대로 복구하는 함수
export function restoreBgm(k) {
    const bgmHandle = gameState.getBgmHandle();
    if (!bgmHandle || bgmHandle.paused) return;

    console.log("[DEBUG] BGM 덕킹 해제 - 현재 볼륨:", bgmHandle.volume);

    // 수정된 부분: 원래 볼륨으로 정확히 복구
    if (isDucked) {
        bgmHandle.volume = originalBgmVolume;
        isDucked = false;

        console.log(
            "[DEBUG] BGM 덕킹 해제 완료 - 복구된 볼륨:",
            originalBgmVolume
        );
    }
}

// 추가된 부분: SFX 재생 시 BGM 덕킹을 자동으로 처리하는 함수
export function playSfxWithDucking(k, soundKey, options = {}) {
    // BGM 볼륨 감소
    duckBgm(k);

    // SFX 재생
    const sfx = k.play(soundKey, options);

    // SFX 지속 시간 추정 (기본값: 2초)
    const estimatedDuration = options.estimatedDuration || 2.0;

    // SFX 끝날 때 BGM 볼륨 복구
    const timeoutId = setTimeout(() => {
        restoreBgm(k);
        bgmDuckingTimeouts.delete(timeoutId);
    }, estimatedDuration * 1000);

    bgmDuckingTimeouts.add(timeoutId);

    return sfx;
}

// 덕킹 없이 SFX를 재생하는 함수
export function playSfx(k, soundKey, options = {}) {
    return k.play(soundKey, options);
}

/**
 * BGM 페이드인 함수
 * ⚠️ 주의: 이 함수는 비타일맵 씬(tutorial, prologue, title, intro 등)에서만 사용!
 * 타일맵 씬(second, health, class1, front, garage 등)에서는 audioManager.switchBGM() 사용 필수!
 * 
 * 사용 가능한 씬:
 * - tutorial.js (페이드 효과 필요)
 * - prologue.js (시네마틱 효과)
 * - title.js (메뉴 화면)
 * - intro.js (인트로 시퀀스)
 * - credits.js (엔딩 시퀀스)
 * 
 * 사용 금지 씬 (audioManager.switchBGM 사용):
 * - second.js, health.js, class1.js, front.js, garage.js, restaurant.js, restroom.js 등
 */
export function fadeInBGM(k, soundKey, targetVolume = 0.7, fadeSpeed = 0.002) {
    // 기존 BGM 정지
    const existingBgm = gameState.getBgmHandle();
    if (existingBgm) {
        existingBgm.stop();
    }

    // 수정된 부분: 덕킹 상태 초기화
    isDucked = false;
    originalBgmVolume = targetVolume;
    currentBgmVolume = targetVolume;

    console.log("[DEBUG] BGM 페이드인 시작 - 목표 볼륨:", targetVolume);

    // 새로운 BGM 재생 (시작은 0 볼륨)
    const music = k.play(soundKey, {
        volume: 0,
        loop: true,
    });

    // 수정된 부분: 전역 상태에 저장
    gameState.setBgmHandle(music);

    // 이미 음소거 상태라면 일시정지
    if (gameState.getIsMuted()) {
        music.paused = true;
    }

    let fadeVolume = 0;

    // 매 프레임마다 점점 볼륨 증가
    k.onUpdate(() => {
        if (fadeVolume < targetVolume) {
            fadeVolume += fadeSpeed;
            fadeVolume = Math.min(fadeVolume, targetVolume);
            music.volume = fadeVolume;
            // 수정된 부분: 덕킹 중이 아닐 때만 originalBgmVolume 업데이트
            if (!isDucked) {
                originalBgmVolume = fadeVolume;
            }
        }
    });
}
export function toggleLocale(k, gameState, isLockedRef) {
    if (isLockedRef.value) return;
    isLockedRef.value = true;

    playSfxWithDucking(k, "confirm-beep-sfx", { estimatedDuration: 0.8 });

    const current = gameState.getLocale();
    const next = current === "korean" ? "english" : "korean";
    gameState.setLocale(next);

    const msgText =
        next === "korean"
            ? "언어를 한국어로 변경합니다."
            : "Language changed to English";

    const msgFont = next === "korean" ? "galmuri" : "gameboy";

    const msg = k.add([
        k.text(msgText, {
            size: 20,
            font: msgFont,
        }),
        k.pos(k.center().x, k.height() - 40),
        k.anchor("center"),
        k.fixed(),
        { tag: "locale-notice" },
    ]);

    k.wait(1.5, () => {
        k.destroy(msg);
        isLockedRef.value = false;
    });
}

export function toggleMute(k, gameState, isLockedRef) {
    if (isLockedRef.value) return;
    isLockedRef.value = true;

    playSfxWithDucking(k, "confirm-beep-sfx", { estimatedDuration: 0.8 });

    // 수정된 부분: 전역 상태 사용
    const bgmHandle = gameState.getBgmHandle();
    if (bgmHandle) {
        bgmHandle.paused = !bgmHandle.paused;
        gameState.setIsMuted(bgmHandle.paused);
    }

    const isMuted = gameState.getIsMuted();
    const locale = gameState.getLocale();

    const msgText =
        locale === "korean"
            ? isMuted
                ? "오디오가 음소거되었습니다!"
                : "오디오 음소거가 해제되었습니다!"
            : isMuted
            ? "Audio is successfully muted!"
            : "Audio is successfully unmuted!";

    const msgFont = locale === "korean" ? "galmuri" : "gameboy";

    const msg = k.add([
        k.text(msgText, {
            size: 20,
            font: msgFont,
        }),
        k.pos(k.center().x, k.height() - 40),
        k.anchor("center"),
        k.fixed(),
        { tag: "audio-notice" },
    ]);

    k.wait(1.5, () => {
        k.destroy(msg);
        isLockedRef.value = false;
    });
}

export function setupMainMenuShortcut(k, gameState) {
    // ESC 키는 더 이상 반응하지 않음 (제거됨)
    // k.onKeyPress("escape", () => { ... }); // 제거됨

    // M 키를 눌렀을 때 배경음악 음소거/해제 (대소문자 구분 없음)
    k.onKeyPress("m", () => {
        toggleGlobalMute(gameState);
    });
    
    k.onKeyPress("M", () => {
        toggleGlobalMute(gameState);
    });
    
    // 전역 키보드 이벤트 리스너 추가 (한/영 키 등 처리)
    if (!window.globalMuteListenerAdded) {
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'm') {
                event.preventDefault();
                toggleGlobalMute(gameState);
            }
        });
        window.globalMuteListenerAdded = true;
    }
    
    function toggleGlobalMute(gameState) {
        const currentMuted = gameState.getIsMuted();
        const newMuted = !currentMuted;
        gameState.setIsMuted(newMuted);
        
        // audioManager를 통한 음소거 처리
        if (window.audioManager) {
            if (newMuted) {
                window.audioManager.stopBGM();
                console.log("🔇 전역 음소거 활성화 (M키)");
            } else {
                console.log("🔊 전역 음소거 해제 (M키)");
                // 현재 BGM 재시작
                window.audioManager.resumeCurrentBGM();
            }
        }
        
        // 알림 메시지 표시
        const locale = gameState.getLocale();
        const msgText = locale === 'korean'
            ? (newMuted ? '음소거되었습니다! (M키)' : '음소거가 해제되었습니다! (M키)')
            : (newMuted ? 'Audio muted! (M key)' : 'Audio unmuted! (M key)');
        
        const msgFont = locale === 'korean' ? 'galmuri' : 'gameboy';
        
        const msg = k.add([
            k.text(msgText, {
                size: 16,
                font: msgFont,
            }),
            k.pos(k.center().x, k.height() - 60),
            k.anchor("center"),
            k.fixed(),
            k.z(1000),
            { tag: "mute-notice" },
        ]);

        k.wait(1.5, () => {
            if (msg.exists()) {
                k.destroy(msg);
            }
        });
    }
    
    function restartCurrentSceneBGM() {
        if (!window.audioManager) return;
        
        // 현재 씬 확인
        let currentScene = 'unknown';
        if (k.getSceneName) {
            currentScene = k.getSceneName();
        } else {
            // kaboom.js에서 현재 씬 이름을 가져오는 다른 방법
            currentScene = window.location.hash.replace('#', '') || 'front';
        }
        
        const bgmMap = {
            'title': 'title-bgm',
            'front': 'main-bgm', 
            'first': 'main-bgm',
            'second': 'main-bgm',
            'second2': 'main-bgm'
        };
        
        const bgmName = bgmMap[currentScene] || 'main-bgm';
        window.audioManager.switchBGM(bgmName);
    }

    // 수정된 부분: 1번 키를 눌렀을 때 확인 후 메인 메뉴로 돌아가기
    k.onKeyPress("1", async () => {
        playSfxWithDucking(k, "bubble-sfx", { estimatedDuration: 1.0 });

        const locale = gameState.getLocale();
        const font = locale === "korean" ? "galmuri" : "gameboy";

        // 확인 메시지 표시
        const confirmText =
            locale === "korean"
                ? "메인 메뉴로 돌아가시겠습니까?\n지금까지 했던 내용은 사라집니다.\n\n[Enter] 확인    [ESC] 취소"
                : "Return to main menu?\nAll progress will be lost.\n\n[Enter] Confirm    [ESC] Cancel";

        const confirmBox = k.add([
            k.rect(k.width() * 0.8, k.height() * 0.4),
            k.color(0, 0, 0),
            k.outline(2, k.Color.WHITE),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.fixed(),
            k.z(1000),
            "confirm-box",
        ]);

        const confirmMsg = k.add([
            k.text(confirmText, {
                size: 21,
                font: font,
                width: k.width() * 0.7,
                lineSpacing: 4,
                align: "center",
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.fixed(),
            k.z(1001),
            "confirm-text",
        ]);

        // 확인/취소 입력 대기
        const enterHandler = k.onKeyPress("enter", () => {
            playSfxWithDucking(k, "confirm-beep-sfx", {
                estimatedDuration: 0.8,
            });

            // 확인 박스 제거
            k.destroyAll("confirm-box");
            k.destroyAll("confirm-text");

            // BGM 정지
            if (gameState.bgmHandle) {
                gameState.bgmHandle.stop();
            }

            // 추가된 부분: 모든 진행상황 초기화
            gameState.setHasEatenMushroom(false);
            gameState.setHasNewchaDialogShown(false);
            gameState.setIsPlayerTall(false);
            gameState.setIsGhostDefeated(false);
            gameState.setIsSonSaved(false);
            gameState.setTargetSpawn(null);
            gameState.clearInteractableObject();
            console.log("[DEBUG] ✅ 모든 진행상황이 초기화되었습니다.");

            // 메인 메뉴로 이동
            k.go("mainMenu");

            // 이벤트 핸들러 제거
            enterHandler.cancel();
            escapeHandler.cancel();
        });

        const escapeHandler = k.onKeyPress("escape", () => {
            playSfxWithDucking(k, "bubble-sfx", { estimatedDuration: 1.0 });

            // 확인 박스만 제거
            k.destroyAll("confirm-box");
            k.destroyAll("confirm-text");

            // 이벤트 핸들러 제거
            enterHandler.cancel();
            escapeHandler.cancel();
        });
    });

    // 수정된 부분: start 버튼을 눌렀을 때도 확인 후 메인 메뉴로 돌아가기
    k.onGamepadButtonPress("start", async () => {
        playSfxWithDucking(k, "bubble-sfx", { estimatedDuration: 1.0 });

        const locale = gameState.getLocale();
        const font = locale === "korean" ? "galmuri" : "gameboy";

        // 확인 메시지 표시
        const confirmText =
            locale === "korean"
                ? "메인 메뉴로 돌아가시겠습니까?\n지금까지 했던 내용은 사라집니다.\n\n[A] 확인    [B] 취소"
                : "Return to main menu?\nAll progress will be lost.\n\n[A] Confirm    [B] Cancel";

        const confirmBox = k.add([
            k.rect(k.width() * 0.8, k.height() * 0.4),
            k.color(0, 0, 0),
            k.outline(2, k.Color.WHITE),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.fixed(),
            k.z(1000),
            "confirm-box",
        ]);

        const confirmMsg = k.add([
            k.text(confirmText, {
                size: 21,
                font: font,
                width: k.width() * 0.7,
                lineSpacing: 4,
                align: "center",
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.fixed(),
            k.z(1001),
            "confirm-text",
        ]);

        // 확인/취소 입력 대기
        const aHandler = k.onGamepadButtonPress("east", () => {
            playSfxWithDucking(k, "confirm-beep-sfx", {
                estimatedDuration: 0.8,
            });

            // 확인 박스 제거
            k.destroyAll("confirm-box");
            k.destroyAll("confirm-text");

            // BGM 정지
            if (gameState.bgmHandle) {
                gameState.bgmHandle.stop();
            }

            // 추가된 부분: 모든 진행상황 초기화
            gameState.setHasEatenMushroom(false);
            gameState.setHasNewchaDialogShown(false);
            gameState.setIsPlayerTall(false);
            gameState.setIsGhostDefeated(false);
            gameState.setIsSonSaved(false);
            gameState.setTargetSpawn(null);
            gameState.clearInteractableObject();
            console.log("[DEBUG] ✅ 모든 진행상황이 초기화되었습니다.");

            // 메인 메뉴로 이동
            k.go("title");

            // 이벤트 핸들러 제거
            aHandler.cancel();
            bHandler.cancel();
        });

        const bHandler = k.onGamepadButtonPress("south", () => {
            playSfxWithDucking(k, "bubble-sfx", { estimatedDuration: 1.0 });

            // 확인 박스만 제거
            k.destroyAll("confirm-box");
            k.destroyAll("confirm-text");

            // 이벤트 핸들러 제거
            aHandler.cancel();
            bHandler.cancel();
        });
    });
}

// 수정된 부분: 전역 A/B 버튼 처리 함수 추가
export function setupGlobalGamepadButtons(k, gameState, options = {}) {
    // A버튼(east) - 확인 기능
    k.onGamepadButtonPress("east", () => {
        if (options.onConfirm) {
            options.onConfirm();
        }
    });

    // B버튼(south) - 취소 기능
    k.onGamepadButtonPress("south", () => {
        if (options.onCancel) {
            options.onCancel();
        }
    });
}

// 추가된 부분: 퀘스트 말풍선 시스템
// 말풍선 감정 상태 상수 정의
export const SPEECH_BUBBLE_STATES = {
    QUEST: 0, // 퀘스트 있는 상태
    VERY_HAPPY: 1, // 매우 만족한 상태
    NEUTRAL: 2, // 그냥 그런 상태
    SAD: 3, // 슬픈상태
    ANGRY: 4, // 화남
    UPSET: 5, // 언짢음
    HAPPY: 6, // 만족한 상태
    EMPTY: 7, // 빈 말풍선
};

export function addQuestBubble(k, student, map) {
    const questBubble = map.add([
        k.sprite("quest-exclamation", {
            frame: SPEECH_BUBBLE_STATES.QUEST, // 수정된 부분: 상수 사용
        }),
        k.pos(student.pos.x - 8, student.pos.y - 12), // 수정된 부분: 위치 조정 (왼쪽으로 8픽셀, 아래로 8픽셀)
        k.anchor("center"),
        k.scale(1.0), // 수정된 부분: 크기 조정 0.8 → 1.0
        k.z(20),
        k.opacity(1.0),
        "quest-bubble",
        { studentId: student.studentType },
    ]);

    let time = 0;
    let bounceDirection = 1;
    let pulseScale = 1.0; // 수정된 부분: 기본 크기 조정
    const minScale = 0.9; // 수정된 부분: 최소 크기 조정
    const maxScale = 1.1; // 수정된 부분: 최대 크기 조정
    const bounceSpeed = 3.0; // 수정된 부분: 바운스 속도 증가
    const pulseSpeed = 0.015; // 수정된 부분: 펄스 속도 조정

    questBubble.onUpdate(() => {
        time += k.dt();

        // 바운스 애니메이션 (위아래로 움직임) - 수정된 부분: 폭을 10%로 줄임
        const bounceOffset = Math.sin(time * bounceSpeed) * 0.1;
        questBubble.pos.x = student.pos.x + 8; // 수정된 부분: 고정된 x 오프셋
        questBubble.pos.y = student.pos.y - 7 + bounceOffset; // 수정된 부분: 조정된 기본 위치

        // 펄스 애니메이션 (크기 변화)
        pulseScale += bounceDirection * pulseSpeed;
        if (pulseScale >= maxScale) {
            pulseScale = maxScale;
            bounceDirection = -1;
        } else if (pulseScale <= minScale) {
            pulseScale = minScale;
            bounceDirection = 1;
        }
        questBubble.scale = pulseScale;
    });

    // student 객체에 말풍선 참조 저장
    student.questBubble = questBubble;

    return questBubble;
}

// 추가된 부분: 다른 감정 상태 말풍선을 생성하는 헬퍼 함수 (나중에 사용할 수 있도록)
export function addEmotionBubble(k, student, map, emotionState) {
    const emotionBubble = map.add([
        k.sprite("quest-exclamation", {
            frame: emotionState,
        }),
        k.pos(student.pos.x - 8, student.pos.y - 12), // 수정된 부분: 위치 조정 (동일하게 적용)
        k.anchor("center"),
        k.scale(1.0),
        k.z(20),
        k.opacity(1.0),
        "emotion-bubble",
        { studentId: student.studentType },
    ]);

    let time = 0;
    let bounceDirection = 1;
    let pulseScale = 1.0;
    const minScale = 0.9;
    const maxScale = 1.1;
    const bounceSpeed = 3.0;
    const pulseSpeed = 0.015;

    emotionBubble.onUpdate(() => {
        time += k.dt();

        // 수정된 부분: 바운스 폭을 10%로 줄임
        const bounceOffset = Math.sin(time * bounceSpeed) * 0.2;
        emotionBubble.pos.x = student.pos.x - 8; // 수정된 부분: 고정된 x 오프셋
        emotionBubble.pos.y = student.pos.y - 12 + bounceOffset; // 수정된 부분: 조정된 기본 위치

        pulseScale += bounceDirection * pulseSpeed;
        if (pulseScale >= maxScale) {
            pulseScale = maxScale;
            bounceDirection = -1;
        } else if (pulseScale <= minScale) {
            pulseScale = minScale;
            bounceDirection = 1;
        }
        emotionBubble.scale = pulseScale;
    });

    student.emotionBubble = emotionBubble;

    return emotionBubble;
}

export function removeQuestBubble(k, student) {
    if (student.questBubble && student.questBubble.exists()) {
        student.questBubble.destroy();
        student.questBubble = null;
    }
}

export function updateQuestBubbles(k, students, map) {
    students.forEach((student) => {
        if (!student.exists()) return;

        const questData = gameState.getStudentQuest(student.studentType);
        const shouldShowBubble = questData.hasQuest && !questData.isCompleted;

        if (shouldShowBubble && !student.questBubble) {
            // 퀘스트가 있는데 말풍선이 없으면 생성
            addQuestBubble(k, student, map);
        } else if (!shouldShowBubble && student.questBubble) {
            // 퀘스트가 없는데 말풍선이 있으면 제거
            removeQuestBubble(k, student);
        }
    });
}

export function initializeQuestBubbles(k, students, map) {
    // 모든 학생에 대해 초기 퀘스트 말풍선 상태 설정
    updateQuestBubbles(k, students, map);
}

// 커스텀 애니메이션 함수들
export function fadeIn(k, gameObj, duration = 1000, delay = 0) {
    return new Promise((resolve) => {
        if (delay > 0) {
            setTimeout(() => startFadeIn(), delay);
        } else {
            startFadeIn();
        }

        function startFadeIn() {
            const startTime = performance.now();
            const startOpacity = gameObj.opacity || 0;
            const endOpacity = 1;

            gameObj.opacity = startOpacity;

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeInOut 효과
                const easedProgress = progress * progress * (3 - 2 * progress);
                
                gameObj.opacity = startOpacity + (endOpacity - startOpacity) * easedProgress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    gameObj.opacity = endOpacity;
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        }
    });
}

export function fadeOut(k, gameObj, duration = 1000, delay = 0) {
    return new Promise((resolve) => {
        if (delay > 0) {
            setTimeout(() => startFadeOut(), delay);
        } else {
            startFadeOut();
        }

        function startFadeOut() {
            const startTime = performance.now();
            const startOpacity = gameObj.opacity || 1;
            const endOpacity = 0;

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeInOut 효과
                const easedProgress = progress * progress * (3 - 2 * progress);
                
                gameObj.opacity = startOpacity + (endOpacity - startOpacity) * easedProgress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    gameObj.opacity = endOpacity;
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        }
    });
}

export function scaleIn(k, gameObj, duration = 1000, delay = 0, fromScale = 0.5, toScale = 1) {
    return new Promise((resolve) => {
        if (delay > 0) {
            setTimeout(() => startScaleIn(), delay);
        } else {
            startScaleIn();
        }

        function startScaleIn() {
            const startTime = performance.now();
            gameObj.scale = fromScale;

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // bounce 효과
                const bounceProgress = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                gameObj.scale = fromScale + (toScale - fromScale) * bounceProgress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    gameObj.scale = toScale;
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        }
    });
}

export function blink(k, gameObj, duration = 1000, blinkCount = 3) {
    return new Promise((resolve) => {
        const blinkDuration = duration / (blinkCount * 2);
        let currentBlink = 0;

        function doBlink() {
            if (currentBlink >= blinkCount) {
                gameObj.opacity = 1;
                resolve();
                return;
            }

            // fade out
            fadeOut(k, gameObj, blinkDuration).then(() => {
                // fade in
                fadeIn(k, gameObj, blinkDuration).then(() => {
                    currentBlink++;
                    doBlink();
                });
            });
        }

        doBlink();
    });
}

export function pulse(k, gameObj, duration = 2000, minOpacity = 0.7, maxOpacity = 1) {
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = (elapsed % duration) / duration;
        
        // 사인파를 이용한 부드러운 펄스 효과
        const opacity = minOpacity + (maxOpacity - minOpacity) * (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
        gameObj.opacity = opacity;
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

export function slideIn(k, gameObj, direction = 'bottom', duration = 1000, delay = 0, distance = 100) {
    return new Promise((resolve) => {
        if (delay > 0) {
            setTimeout(() => startSlideIn(), delay);
        } else {
            startSlideIn();
        }

        function startSlideIn() {
            const startTime = performance.now();
            const originalPos = { x: gameObj.pos.x, y: gameObj.pos.y };
            
            // 시작 위치 설정
            switch(direction) {
                case 'bottom':
                    gameObj.pos.y += distance;
                    break;
                case 'top':
                    gameObj.pos.y -= distance;
                    break;
                case 'left':
                    gameObj.pos.x -= distance;
                    break;
                case 'right':
                    gameObj.pos.x += distance;
                    break;
            }

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeOutBack 효과 (약간 튀는 느낌)
                const c1 = 1.70158;
                const c3 = c1 + 1;
                const easedProgress = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
                
                // 위치 보간
                switch(direction) {
                    case 'bottom':
                        gameObj.pos.y = originalPos.y + distance * (1 - easedProgress);
                        break;
                    case 'top':
                        gameObj.pos.y = originalPos.y - distance * (1 - easedProgress);
                        break;
                    case 'left':
                        gameObj.pos.x = originalPos.x - distance * (1 - easedProgress);
                        break;
                    case 'right':
                        gameObj.pos.x = originalPos.x + distance * (1 - easedProgress);
                        break;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    gameObj.pos.x = originalPos.x;
                    gameObj.pos.y = originalPos.y;
                    resolve();
                }
            }

            requestAnimationFrame(animate);
        }
    });
}
