// restaurant.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const RESTAURANT_SPRITES = {
    // NPC 스프라이트
    NPC: {
        // student들은 restaurant.js에서 직접 frame 지정하므로 여기서 정의하지 않음
    },
    
    // 오브젝트 스프라이트
    OBJECTS: {
        // restaurant 관련 오브젝트들이 있으면 여기에 추가
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getRestaurantSprite(type, name) {
    switch (type) {
        case 'npc':
            return RESTAURANT_SPRITES.NPC[name] || RESTAURANT_SPRITES.DEFAULT.npc;
        case 'object':
            return RESTAURANT_SPRITES.OBJECTS[name] || RESTAURANT_SPRITES.DEFAULT.object;
        default:
            return RESTAURANT_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return RESTAURANT_SPRITES.NPC[npcName] || RESTAURANT_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return RESTAURANT_SPRITES.OBJECTS[objectName] || RESTAURANT_SPRITES.DEFAULT.object;
}

// restaurant 전용 스프라이트 이름을 가져오는 함수
export function getRestaurantSpriteName() {
    return "restaurant-assets";
}
