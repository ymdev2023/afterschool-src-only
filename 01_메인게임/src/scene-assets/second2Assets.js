// second2.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const SECOND2_SPRITES = {
    // NPC 스프라이트
    NPC: {
        // second2 씬에서 사용하는 NPC들의 특정 frame들
        // 필요시 여기에 추가
    },
    
    // 오브젝트 스프라이트
    OBJECTS: {
        // second2 씬에서 사용하는 오브젝트들의 특정 frame들
        // 필요시 여기에 추가
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getSecond2Sprite(type, name) {
    switch (type) {
        case 'npc':
            return SECOND2_SPRITES.NPC[name] || SECOND2_SPRITES.DEFAULT.npc;
        case 'object':
            return SECOND2_SPRITES.OBJECTS[name] || SECOND2_SPRITES.DEFAULT.object;
        default:
            return SECOND2_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return SECOND2_SPRITES.NPC[npcName] || SECOND2_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return SECOND2_SPRITES.OBJECTS[objectName] || SECOND2_SPRITES.DEFAULT.object;
}

// second2 전용 스프라이트 이름을 가져오는 함수
export function getSecond2SpriteName() {
    return "second2-assets";
}

// Student의 sprite config를 가져오는 함수 (frame 또는 anim)
export function getStudentSpriteConfig(studentType) {
    const frameNumber = SECOND2_SPRITES.NPC[studentType];
    if (frameNumber) {
        return { frame: frameNumber };
    } else {
        return { anim: studentType };
    }
}
