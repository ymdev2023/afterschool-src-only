// garage.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const GARAGE_SPRITES = {
    // NPC 스프라이트
    NPC: {
        student22: 2497,  // student22 NPC 스프라이트
    },
    
    // 오브젝트 스프라이트
    OBJECTS: {
        mp3: 2252,        // mp3 오브젝트 스프라이트 (garage-assets에서 사용)
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getGarageSprite(type, name) {
    switch (type) {
        case 'npc':
            return GARAGE_SPRITES.NPC[name] || GARAGE_SPRITES.DEFAULT.npc;
        case 'object':
            return GARAGE_SPRITES.OBJECTS[name] || GARAGE_SPRITES.DEFAULT.object;
        default:
            return GARAGE_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return GARAGE_SPRITES.NPC[npcName] || GARAGE_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return GARAGE_SPRITES.OBJECTS[objectName] || GARAGE_SPRITES.DEFAULT.object;
}

// garage 전용 스프라이트 이름을 가져오는 함수
export function getGarageSpriteName() {
    return "garage-assets";
}
