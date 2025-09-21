// second.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const SECOND_SPRITES = {
    // NPC 스프라이트 (second-assets 기준)
    NPC: {
        // 특정 frame을 사용하는 student들
        student22: 1975,  // student22 NPC 스프라이트
        student23: 1905,  // student23 NPC 스프라이트  
        student24: 1969,  // student24 NPC 스프라이트
        student25: 1973,  // student25 NPC 스프라이트
        student26: 1977,  // student26 NPC 스프라이트
        student27: 1981,  // student27 NPC 스프라이트
        student28: 1985,  // student28 NPC 스프라이트
        student29: 1989,  // student29 NPC 스프라이트
        student30: 1993,  // student30 NPC 스프라이트
        student47: 1997,  // student47 NPC 스프라이트 (백진희)
        student48: 2001,  // student48 NPC 스프라이트 (신세경)
        // 다른 student들은 anim 사용
    },
    
    // 오브젝트 스프라이트 (second-assets의 anim 사용)
    OBJECTS: {
        // letter 오브젝트들은 second-assets의 anim을 사용하므로 프레임 번호 불필요
        // 필요시 특별한 스프라이트 프레임 추가 가능
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getSecondSprite(type, name) {
    switch (type) {
        case 'npc':
            return SECOND_SPRITES.NPC[name] || SECOND_SPRITES.DEFAULT.npc;
        case 'object':
            return SECOND_SPRITES.OBJECTS[name] || SECOND_SPRITES.DEFAULT.object;
        default:
            return SECOND_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return SECOND_SPRITES.NPC[npcName] || SECOND_SPRITES.DEFAULT.npc;
}

// Student의 sprite config를 가져오는 함수 (frame 또는 anim)
export function getStudentSpriteConfig(studentType) {
    const frameNumber = SECOND_SPRITES.NPC[studentType];
    if (frameNumber) {
        return { frame: frameNumber };
    } else {
        return { anim: studentType };
    }
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return SECOND_SPRITES.OBJECTS[objectName] || SECOND_SPRITES.DEFAULT.object;
}

// second-assets의 anim을 사용하는지 확인하는 함수
export function usesSecondAssetsAnim(objectType) {
    // student와 letter 오브젝트들은 second-assets의 anim을 사용
    return objectType.startsWith('student') || objectType.startsWith('letter');
}

// 2층 특화 오브젝트들의 스프라이트 프레임 정의
export const SECOND_OBJECT_SPRITES = {
    desk_spare1: 1200,
    desk_spare2: 1204,
    shelf: 1208,
    wheelchair: 1212,
    elevator2: 1216,
    mirror: 1220,
    plant3: 1224,
    bookcase: 1228,
    bin: 1232,
    vendingmachine: 1236,
    sofa: 1240,
    shoecase: 1244,
    books: 1248,
    desk_sci: 1252,
    shelf_sci: 1256,
};

// 2층 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getSecondObjectSprite(objectName) {
    return SECOND_OBJECT_SPRITES[objectName] || SECOND_SPRITES.DEFAULT.object;
}
