// 카메라 관리 모듈
// 카메라 이동, 줌, 경계 체크 등을 관리

/**
 * 카메라 매니저 클래스
 */
export class CameraManager {
    constructor(k) {
        this.k = k;
        this.boundaries = {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0
        };
        this.isInitialized = false;
    }

    /**
     * 카메라 경계 설정
     */
    setBoundaries(minX, maxX, minY, maxY) {
        this.boundaries = { minX, maxX, minY, maxY };
        this.isInitialized = true;
        console.log("📷 카메라 경계 설정:", this.boundaries);
    }

    /**
     * 경계가 있는 카메라 업데이트
     */
    updateCameraWithBoundaries(player) {
        if (!this.isInitialized || !player) return;

        const k = this.k;
        const currentCamPos = k.camPos();
        const playerPos = player.worldPos();
        
        // 카메라 목표 위치 계산
        let targetX = playerPos.x;
        let targetY = playerPos.y;
        
        // 경계 적용
        if (targetX < this.boundaries.minX) targetX = this.boundaries.minX;
        if (targetX > this.boundaries.maxX) targetX = this.boundaries.maxX;
        if (targetY < this.boundaries.minY) targetY = this.boundaries.minY;
        if (targetY > this.boundaries.maxY) targetY = this.boundaries.maxY;
        
        // 부드러운 카메라 이동
        const lerpFactor = 0.1;
        const newX = currentCamPos.x + (targetX - currentCamPos.x) * lerpFactor;
        const newY = currentCamPos.y + (targetY - currentCamPos.y) * lerpFactor;
        
        k.camPos(newX, newY);
    }

    /**
     * 카메라 줌 설정
     */
    setZoom(zoomLevel) {
        this.k.camScale(zoomLevel);
        console.log("📷 카메라 줌 설정:", zoomLevel);
    }

    /**
     * 플레이어를 따라가는 카메라 설정
     */
    followPlayer(player) {
        if (!player) return;
        
        const k = this.k;
        k.camScale(1.5);
        
        if (this.isInitialized) {
            this.updateCameraWithBoundaries(player);
        } else {
            k.camPos(player.worldPos());
        }
    }

    /**
     * 카메라를 특정 위치로 이동
     */
    moveTo(x, y) {
        this.k.camPos(x, y);
    }

    /**
     * 현재 카메라 위치 반환
     */
    getPosition() {
        return this.k.camPos();
    }

    /**
     * 현재 카메라 줌 레벨 반환
     */
    getZoom() {
        return this.k.camScale();
    }
}
