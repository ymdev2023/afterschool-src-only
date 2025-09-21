// health.js에서 사용하는 스프라이트 프레임 관리
// garage.js를 참고해서 작성

export const HEALTH_SPRITES = {
    // NPC 스프라이트 (health 맵의 tilecount: 2838, 사용가능 범위: 0~2837)
    NPC: {
        student23: 100,   // student23 NPC 스프라이트 (임시 - 적절한 학생 스프라이트)
        student30: 100,   // student30 NPC 스프라이트 (임시 - 적절한 학생 스프라이트)
        nurse: 200,       // 양호선생님 NPC 스프라이트 (임시 - 적절한 어른 스프라이트)
        teacher: 200,     // 보건교사 NPC 스프라이트 (임시 - 적절한 어른 스프라이트)
    },
    
    // 오브젝트 스프라이트 (health 맵에서 실제 사용하지 않음)
    OBJECTS: {
        // health 맵에서는 오브젝트가 투명한 콜라이더로만 사용됨
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 100,         // 기본 NPC 스프라이트 (범위 내 값)
        object: 100,      // 기본 오브젝트 스프라이트 (범위 내 값)
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getHealthSprite(type, name) {
    switch (type) {
        case 'npc':
            return HEALTH_SPRITES.NPC[name] || HEALTH_SPRITES.DEFAULT.npc;
        case 'object':
            return HEALTH_SPRITES.OBJECTS[name] || HEALTH_SPRITES.DEFAULT.object;
        default:
            return HEALTH_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return HEALTH_SPRITES.NPC[npcName] || HEALTH_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return HEALTH_SPRITES.OBJECTS[objectName] || HEALTH_SPRITES.DEFAULT.object;
}

// health 전용 스프라이트 이름을 가져오는 함수
export function getHealthSpriteName() {
    return "health-assets";
}
