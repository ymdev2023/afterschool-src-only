// class2.js에서 사용하는 스프라이트 프레임 관리
// class1Assets.js와 유사한 구조로 작성

export const CLASS2_SPRITES = {
    // NPC 스프라이트 (class1-assets 기준)
    NPC: {
        // 기존 학생들
        student80: 2100,
        student81: 2101,
        student82: 2102,
        student83: 2103,
        // 새로 추가된 학생들
        student91: 2104,
        student92: 2105,
        student93: 2106,
        student94: 2107,
    },
    
    // 오브젝트 스프라이트 (class1-assets의 anim 사용)
    OBJECTS: {
        // letter 오브젝트들은 class1-assets의 anim을 사용하므로 프레임 번호 불필요
        // 필요시 특별한 스프라이트 프레임 추가 가능
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 2100,        // 기본 NPC 스프라이트
        object: 1800,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getClass2Sprite(type, name) {
    switch (type) {
        case 'npc':
            return CLASS2_SPRITES.NPC[name] || CLASS2_SPRITES.DEFAULT.npc;
        case 'object':
            return CLASS2_SPRITES.OBJECTS[name] || CLASS2_SPRITES.DEFAULT.object;
        default:
            return CLASS2_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return CLASS2_SPRITES.NPC[npcName] || CLASS2_SPRITES.DEFAULT.npc;
}

// Student의 sprite config를 가져오는 함수 (frame 또는 anim)
export function getStudentSpriteConfig(studentName) {
    const frameNumber = CLASS2_SPRITES.NPC[studentName];
    
    if (frameNumber) {
        // 특정 프레임을 사용하는 경우
        return { frame: frameNumber };
    } else {
        // 기본 애니메이션을 사용하는 경우
        return { anim: studentName };
    }
}

// Class2에서 사용하는 스프라이트 이름을 가져오는 함수
export function getClass2SpriteName() {
    return "class1-assets"; // class1과 같은 에셋 사용
}

// 오브젝트 스프라이트를 가져오는 함수
export function getObjectSprite(objectName) {
    return CLASS2_SPRITES.OBJECTS[objectName] || CLASS2_SPRITES.DEFAULT.object;
}
