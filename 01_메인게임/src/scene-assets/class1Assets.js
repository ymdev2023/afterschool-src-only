/**
 * Class1 씬의 스프라이트 에셋 정의
 * class1.json과 rpg_spritesheet_class1.png에 대응
 */

export const CLASS1_SPRITES = {
    NPC: {
        // 교실에 있을 학생들과 선생님 스프라이트 프레임 인덱스 (class1 스프라이트시트 범위: 2839~5676)
        teacher: 2939, // 선생님 (2839 + 100)
        student1: 3039, // 학생1 (2839 + 200)
        student2: 3139, // 학생2 (2839 + 300)
        student3: 3239, // 학생3 (2839 + 400)
    },
    OBJECTS: {
        // 교실 내 상호작용 가능한 오브젝트들 (class1 스프라이트시트 범위)
        blackboard: 2939, // 칠판
        desk1: 3039, // 책상1
        desk2: 3089, // 책상2
        bookshelf: 3139, // 책장
        projector: 3189, // 프로젝터
        toiletpaper: 2261, // 화장지 (첫 번째 스프라이트시트에 있음)
        tvset: 3289, // TV세트
        fire_extinguisher: 3339, // 소화기
        broomstick: 3389, // 빗자루
        mop: 3439, // 마포대걸레
        sofa: 3489, // 소파
        mirror: 3539, // 거울
        teacher_desk: 3589, // 교탁
    },
    DEFAULT: {
        npc: 2939, // 기본 NPC 스프라이트 (class1 범위)
        object: 2939, // 기본 오브젝트 스프라이트 (class1 범위)
    }
};

/**
 * 오브젝트 타입과 이름으로 스프라이트 프레임 가져오기
 * @param {string} type - 'NPC' 또는 'OBJECTS'
 * @param {string} name - 스프라이트 이름
 * @returns {number} 스프라이트 프레임 인덱스
 */
export function getClass1Sprite(type, name) {
    if (!CLASS1_SPRITES[type]) {
        console.warn(`⚠️ 알 수 없는 스프라이트 타입: ${type}`);
        return CLASS1_SPRITES.DEFAULT.object;
    }
    
    const sprite = CLASS1_SPRITES[type][name];
    if (sprite === undefined) {
        console.warn(`⚠️ 알 수 없는 스프라이트: ${type}.${name}`);
        return CLASS1_SPRITES.DEFAULT[type.toLowerCase().replace('s', '')] || CLASS1_SPRITES.DEFAULT.object;
    }
    
    return sprite;
}

/**
 * NPC 스프라이트 프레임 가져오기
 * @param {string} npcName - NPC 이름
 * @returns {number} 스프라이트 프레임 인덱스
 */
export function getNPCSprite(npcName) {
    return getClass1Sprite('NPC', npcName);
}

/**
 * 오브젝트 스프라이트 프레임 가져오기
 * @param {string} objectName - 오브젝트 이름
 * @returns {number} 스프라이트 프레임 인덱스
 */
export function getObjectSprite(objectName) {
    return getClass1Sprite('OBJECTS', objectName);
}

/**
 * Class1 씬의 스프라이트 이름 반환
 * @returns {string} 스프라이트 이름
 */
export function getClass1SpriteName() {
    return "class1-assets";
}
