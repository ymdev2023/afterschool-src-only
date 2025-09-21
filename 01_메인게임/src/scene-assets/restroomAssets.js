// restroom.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const RESTROOM_SPRITES = {
    // NPC 스프라이트
    NPC: {
        // restroom.js에서 사용하는 NPC 스프라이트들
        // 필요시 특별한 스프라이트 프레임 추가 가능
    },
    
    // 오브젝트 스프라이트
    OBJECTS: {
        // restroom.js에서 사용하는 오브젝트 스프라이트들
        // 필요시 특별한 스프라이트 프레임 추가 가능
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getRestroomSprite(type, name) {
    switch (type) {
        case 'npc':
            return RESTROOM_SPRITES.NPC[name] || RESTROOM_SPRITES.DEFAULT.npc;
        case 'object':
            return RESTROOM_SPRITES.OBJECTS[name] || RESTROOM_SPRITES.DEFAULT.object;
        default:
            return RESTROOM_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return RESTROOM_SPRITES.NPC[npcName] || RESTROOM_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return RESTROOM_SPRITES.OBJECTS[objectName] || RESTROOM_SPRITES.DEFAULT.object;
}
