// front.js에서 사용하는 스프라이트 프레임 관리
// 각 NPC와 오브젝트별로 적절한 스프라이트 프레임을 정의

export const FRONT_SPRITES = {
    // NPC 스프라이트 (spawnpoints 레이어의 학생들)
    NPC: {
        student1: 3781,   
        student2: 3703,   
        student3: 3705,   
        student4: 3780,   
        student5: 2204,   
        student6: 2600,  
        student7: 3150,  
        student8: 3622,   
        student9: 3624,   // main.js에서 가져옴 (박은서 ENFJ)
        student10: 3625,  // main.js에서 가져옴 (이나영 ESFP)
        student11: 3623,  // main.js에서 가져옴 (김보영 ISTP)
        student12: 2517,  // main.js에서 가져옴 (한지우)
        student13: 3385,  // main.js에서 가져옴 (강예지) - 이게 정답!
        student_nintendo: 3706,
        // 기타 NPC들
        teacher1: 5771,   // 교사
        principal: 5772,  // 교장
    },
    
    // 오브젝트 스프라이트
    OBJECTS: {
        ball: 5296,       // 피구공
        cat1: 3784,       // 고양이 1
        cat2: 3783,       // 고양이 2
        nca: 5386,        // NCA 전단지
        game: 5387,       // 게임기
        letter1: 5300,    // 편지들 (필요시 수정)
        letter2: 5301,
        letter3: 5302,
        ants: 5390,
        tamagotchi: 5387, // 다마고치
        timecapsule: 5392, // 타임캡슐
    },
    
    // 기본 스프라이트
    DEFAULT: {
        npc: 5771,        // 기본 NPC 스프라이트
        object: 5771,     // 기본 오브젝트 스프라이트
    }
};

// 스프라이트 프레임을 가져오는 헬퍼 함수
export function getFrontSprite(type, name) {
    switch (type) {
        case 'npc':
            return FRONT_SPRITES.NPC[name] || FRONT_SPRITES.DEFAULT.npc;
        case 'object':
            return FRONT_SPRITES.OBJECTS[name] || FRONT_SPRITES.DEFAULT.object;
        default:
            return FRONT_SPRITES.DEFAULT.npc;
    }
}

// 특정 NPC의 스프라이트 프레임을 가져오는 함수
export function getNPCSprite(npcName) {
    return FRONT_SPRITES.NPC[npcName] || FRONT_SPRITES.DEFAULT.npc;
}

// 특정 오브젝트의 스프라이트 프레임을 가져오는 함수
export function getObjectSprite(objectName) {
    return FRONT_SPRITES.OBJECTS[objectName] || FRONT_SPRITES.DEFAULT.object;
}
