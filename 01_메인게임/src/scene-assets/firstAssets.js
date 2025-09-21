// first.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const FIRST_SPRITES = {
    // NPC 스프라이트
    NPC: {
        // 특정 frame을 사용하는 student들
        student14: 1975,  // student14 NPC 스프라이트
        student18: 1905,  // student18 NPC 스프라이트  
        student19: 1969,  // student19 NPC 스프라이트
        student20: 1973,  // student20 NPC 스프라이트
        // 다른 student들은 anim 사용
    },
    
    // 오브젝트 스프라이트 (first-assets의 anim 사용)
    OBJECTS: {
        // letter 오브젝트들은 first-assets의 anim을 사용하므로 프레임 번호 불필요
        // 필요시 특별한 스프라이트 프레임 추가 가능
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getFirstSprite(type, name) {
    switch (type) {
        case 'npc':
            return FIRST_SPRITES.NPC[name] || FIRST_SPRITES.DEFAULT.npc;
        case 'object':
            return FIRST_SPRITES.OBJECTS[name] || FIRST_SPRITES.DEFAULT.object;
        default:
            return FIRST_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return FIRST_SPRITES.NPC[npcName] || FIRST_SPRITES.DEFAULT.npc;
}

// Student의 sprite config를 가져오는 함수 (frame 또는 anim)
export function getStudentSpriteConfig(studentType) {
    const frameNumber = FIRST_SPRITES.NPC[studentType];
    if (frameNumber) {
        return { frame: frameNumber };
    } else {
        return { anim: studentType };
    }
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return FIRST_SPRITES.OBJECTS[objectName] || FIRST_SPRITES.DEFAULT.object;
}

// first-assets의 anim을 사용하는지 확인하는 함수
export function usesFirstAssetsAnim(objectType) {
    // student와 letter 오브젝트들은 first-assets의 anim을 사용
    return objectType.startsWith('student') || objectType.startsWith('letter');
}
