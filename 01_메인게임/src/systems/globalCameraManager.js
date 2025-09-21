/**
 * 전역 카메라 관리자 - 모든 씬에서 동일한 카메라 데드존 시스템 사용
 * front.js의 카메라 로직을 기반으로 함
 */

export class GlobalCameraManager {
    constructor(k, entities, mapBounds = null) {
        this.k = k;
        this.entities = entities;
        this.mapBounds = mapBounds || this.getDefaultMapBounds();
        
        // 카메라 설정 상수들
        this.CAMERA_EDGE_BUFFER = 120; // 화면 가장자리 120px 반경 (데드존)
        this.CAMERA_JUMP_FACTOR = 0.2; // 데드존 도달 시 즉시 이동 속도
        this.CAMERA_MIN_DISTANCE = 8; // 최소 이동 거리 (픽셀)
        
        // 카메라 상태 변수들
        this.targetCameraPos = null;
        this.lastPlayerPos = null;
        this.isCameraAnimating = false;
        this.isInitialized = false;
        
        console.log("🎥 전역 카메라 매니저 초기화됨");
    }

    /**
     * 기본 맵 경계 설정
     */
    getDefaultMapBounds() {
        return {
            minX: -48 * 24, // 기본값
            minY: -48 * 24,
            maxX: (30 + 16) * 24,
            maxY: (20 + 16) * 24,
        };
    }

    /**
     * 카메라 시스템 초기화
     */
    initialize() {
        if (!this.entities.player || !this.entities.player.exists()) {
            console.warn("⚠️ 카메라 초기화 실패: 플레이어가 없음");
            return false;
        }

        // 카메라 초기 위치 설정
        this.targetCameraPos = this.entities.player.pos.clone();
        this.lastPlayerPos = this.entities.player.pos.clone();
        this.k.camPos(this.entities.player.pos);
        
        // 카메라 업데이트 루프 시작
        this.startCameraUpdate();
        
        this.isInitialized = true;
        console.log("🎥 전역 카메라 시스템 초기화 완료");
        return true;
    }

    /**
     * 맵 경계 설정
     */
    setMapBounds(bounds) {
        this.mapBounds = bounds;
        console.log("🗺️ 카메라 맵 경계 설정:", bounds);
    }

    /**
     * 카메라 애니메이션 상태 설정
     */
    setCameraAnimating(isAnimating) {
        this.isCameraAnimating = isAnimating;
        console.log(`🎬 카메라 애니메이션 상태: ${isAnimating ? '활성' : '비활성'}`);
    }

    /**
     * 카메라 데드존 업데이트 로직
     */
    updateCameraWithBoundaries() {
        if (!this.entities.player || !this.entities.player.exists()) {
            return;
        }
        
        // 카메라 애니메이션 중일 때는 카메라 추적 시스템 비활성화
        if (this.isCameraAnimating) {
            return;
        }

        const playerPos = this.entities.player.pos;
        const currentCamPos = this.k.camPos();
        const screenHalfWidth = this.k.width() / (2 * this.k.camScale().x);
        const screenHalfHeight = this.k.height() / (2 * this.k.camScale().y);
        
        // 플레이어가 실제로 이동했을 때만 카메라 업데이트 계산
        if (playerPos.dist(this.lastPlayerPos) < 1) return; // 1픽셀 이하 이동은 무시
        
        // 플레이어가 화면 가장자리 근처에 있는지 확인
        const playerScreenPos = playerPos.sub(currentCamPos);
        
        let newTargetX = currentCamPos.x;
        let newTargetY = currentCamPos.y;
        let shouldJump = false;
        
        // X축 데드존 확인 - 데드존 벗어나면 즉시 대폭 이동
        if (playerScreenPos.x > screenHalfWidth - this.CAMERA_EDGE_BUFFER) {
            newTargetX = playerPos.x - (screenHalfWidth - this.CAMERA_EDGE_BUFFER);
            shouldJump = true;
        } else if (playerScreenPos.x < -screenHalfWidth + this.CAMERA_EDGE_BUFFER) {
            newTargetX = playerPos.x + (screenHalfWidth - this.CAMERA_EDGE_BUFFER);
            shouldJump = true;
        }
        
        // Y축 데드존 확인 - 데드존 벗어나면 즉시 대폭 이동
        if (playerScreenPos.y > screenHalfHeight - this.CAMERA_EDGE_BUFFER) {
            newTargetY = playerPos.y - (screenHalfHeight - this.CAMERA_EDGE_BUFFER);
            shouldJump = true;
        } else if (playerScreenPos.y < -screenHalfHeight + this.CAMERA_EDGE_BUFFER) {
            newTargetY = playerPos.y + (screenHalfHeight - this.CAMERA_EDGE_BUFFER);
            shouldJump = true;
        }
        
        // 데드존 벗어나면 즉시 대폭 이동
        if (shouldJump) {
            // 맵 경계 내에서 카메라 제한
            newTargetX = Math.max(this.mapBounds.minX + screenHalfWidth, 
                                 Math.min(this.mapBounds.maxX - screenHalfWidth, newTargetX));
            newTargetY = Math.max(this.mapBounds.minY + screenHalfHeight, 
                                 Math.min(this.mapBounds.maxY - screenHalfHeight, newTargetY));
            
            const newCamPos = this.k.vec2(newTargetX, newTargetY);
            const distance = newCamPos.dist(currentCamPos);
            
            if (distance > this.CAMERA_MIN_DISTANCE) {
                // 즉시 대폭 이동 (lerp 사용하여 부드럽게 하되 빠르게)
                const jumpCamPos = currentCamPos.lerp(newCamPos, this.CAMERA_JUMP_FACTOR);
                this.k.camPos(jumpCamPos);
            }
        }
        
        this.lastPlayerPos = playerPos.clone();
    }

    /**
     * 카메라 업데이트 루프 시작
     */
    startCameraUpdate() {
        this.k.onUpdate(() => {
            this.updateCameraWithBoundaries();
        });
        console.log("🎥 카메라 업데이트 루프 시작됨");
    }

    /**
     * 카메라를 플레이어 위치로 즉시 이동
     */
    jumpToPlayer() {
        if (this.entities.player && this.entities.player.exists()) {
            this.k.camPos(this.entities.player.pos);
            this.lastPlayerPos = this.entities.player.pos.clone();
            console.log("🎥 카메라를 플레이어 위치로 즉시 이동");
        }
    }

    /**
     * 특정 위치로 카메라 애니메이션
     */
    async animateTo(targetPos, duration = 2.0, easingType = "easeInOutQuad") {
        this.setCameraAnimating(true);
        
        return new Promise((resolve) => {
            this.k.tween(this.k.camPos(), targetPos, duration, (val) => {
                this.k.camPos(val);
            }, this.k.easings[easingType]).then(() => {
                this.setCameraAnimating(false);
                resolve();
            });
        });
    }

    /**
     * 카메라 시스템 정리
     */
    destroy() {
        this.isInitialized = false;
        console.log("🎥 전역 카메라 매니저 정리됨");
    }
}

/**
 * 전역 카메라 매니저 설정 함수
 */
export function setupGlobalCamera(k, entities, mapBounds = null) {
    const cameraManager = new GlobalCameraManager(k, entities, mapBounds);
    
    // 전역 접근을 위해 window 객체에 할당
    window.globalCameraManager = cameraManager;
    
    return cameraManager;
}
