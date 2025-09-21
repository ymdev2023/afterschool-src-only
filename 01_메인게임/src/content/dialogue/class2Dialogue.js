// class2Dialogue.js - class2.json의 모든 엔티티 대화 내용

const class2ObjectNames = {
    korean: {
        // 상호작용 오브젝트들
        door_from_second: "교실 앞문",
        door_from_second_back: "교실 뒷문",
        // 새로 추가된 오브젝트들
        cleaning_cabinet: "청소도구함",
        training_clothes: "체육복",
        mop: "마포걸레",
        cleaning_tool1: "쓰레받기",
        cleaning_tool2: "빗자루",
    },
    english: {
        // 상호작용 오브젝트들
        door_from_second: "Classroom Front Door",
        door_from_second_back: "Classroom Back Door",
        // 새로 추가된 오브젝트들
        cleaning_cabinet: "Cleaning Cabinet",
        training_clothes: "Training Clothes", 
        mop: "Mop",
        cleaning_tool1: "Dustpan",
        cleaning_tool2: "Broom",
    },
};

// NPC 이름들
const class2NpcNames = {
    korean: {
        student80: "김진이",
        student81: "김슬기", 
        student82: "백예린",
        student83: "설승아",
        student91: "성수현",
        student92: "김서현",
        student93: "한승우",
        student94: "이서연",
        // 추가 학생들 (boundaries 레이어)
        student84: "김민지",
        student85: "최서라",
        student86: "이민아",
        student87: "이정은",
        student88: "최성혜",
        student89: "이승주",
        student90: "방수정",
    },
    english: {
        student80: "Kim Jin-i",
        student81: "Kim Seul-gi",
        student82: "Baek Ye-rin", 
        student83: "Seol Seung-ah",
        student91: "Seong Su-hyeon",
        student92: "Kim Seo-hyeon",
        student93: "Han Seung-woo",
        student94: "Lee Seo-yeon",
        // 추가 학생들 (boundaries 레이어)
        student84: "Kim Min-ji",
        student85: "Choi Seo-ra",
        student86: "Lee Min-ah",
        student87: "Lee Jeong-eun",
        student88: "Choi Seong-hye",
        student89: "Lee Seung-ju",
        student90: "Bang Su-jeong",
    },
};

const class2Dialogues = {
    korean: {
        // NPC 대화들
        student80: [
            "야 칠판에 낙서하지마 ㅡㅡ",
            "... 다라디리 다라뚜~"
        ],
        student81: [
            "외톨이야~외톨이야~"
        ],
        student82: [
            "야 쟤네 뭐하냐?"
        ],
        student83: [
            "분신사바 하나바..."
        ],
        student91: [
            "난 귀신을 믿고 있어.",
            "언제 한번 본적도 있다니깐?"
        ],
        student92: [
            "으으....",
            "팔이 멋대로 움직이는거같아."
        ],
        student93: [
            "저딴걸 누가 믿는다고 ㅡㅡ"
        ],
        student94: [
            "하암 심심하니까 여기 있긴 한데...",
            "이따 저녁에 뭐먹징?!"
        ],
        
        // 추가 학생들 (boundaries 레이어)
        student84: [
            "...이게 진짜 된다고?"
        ],
        student85: [
            "움직인다...움직인다..."
        ],
        student86: [
            "분신사바...분신사바......"
        ],
        student87: [
            "무서워......"
        ],
        student88: [
            "저런걸 누가 믿어 ㅡㅡ"
        ],
        student89: [
            "조용히좀 해봐..."
        ],
        student90: [
            "유치하네 진짜."
        ],
        
        // 상호작용 오브젝트들의 대화
        door_from_second: [
            "교실을 나가시겠습니까?",
            "복도로 이동합니다."
        ],
        door_from_second_back: [
            "뒷문으로 나가시겠습니까?",
            "복도 뒤쪽으로 이동합니다."
        ],
        
        // 새로 추가된 오브젝트 대화들
        cleaning_cabinet: [
            "(청소도구를 모으는 보관함이다.)"
        ],
        training_clothes: [
            "(체육복이 여기 왜 떨어져있지...?)"
        ],
        mop: [
            "(마포걸레다.)"
        ],
        cleaning_tool1: [
            "(쓰레받기다.)"
        ],
        cleaning_tool2: [
            "(빗자루이다.)"
        ],
    },
    english: {
        // NPC 대화들
        student80: [
            "Hey, don't draw on the blackboard ㅡㅡ",
            "... Da-ra-di-ri da-ra-du~"
        ],
        student81: [
            "Loner~Loner~"
        ],
        student82: [
            "Hey, what are they doing?"
        ],
        student83: [
            "Bun-shin-sa-ba ha-na-ba..."
        ],
        student91: [
            "I believe in ghosts.",
            "I've seen one before, you know?"
        ],
        student92: [
            "Ugh....",
            "It feels like my arm is moving on its own."
        ],
        student93: [
            "Who would believe that nonsense ㅡㅡ"
        ],
        student94: [
            "Yawn~ I'm just here because I'm bored...",
            "What should we eat for dinner later?!"
        ],
        
        // 추가 학생들 (boundaries 레이어)
        student84: [
            "...Does this really work?"
        ],
        student85: [
            "It's moving...it's moving..."
        ],
        student86: [
            "Bunshin-saba...bunshin-saba......"
        ],
        student87: [
            "Scary......"
        ],
        student88: [
            "Who would believe such nonsense ㅡㅡ"
        ],
        student89: [
            "Please be quiet..."
        ],
        student90: [
            "So childish, really."
        ],
        
        // 상호작용 오브젝트들의 대화
        door_from_second: [
            "Do you want to leave the classroom?",
            "Moving to the hallway."
        ],
        door_from_second_back: [
            "Do you want to exit through the back door?",
            "Moving to the back of the hallway."
        ],
        
        // 새로 추가된 오브젝트 대화들
        cleaning_cabinet: [
            "(A cabinet for storing cleaning tools.)"
        ],
        training_clothes: [
            "(Why are training clothes lying here...?)"
        ],
        mop: [
            "(It's a mop.)"
        ],
        cleaning_tool1: [
            "(It's a dustpan.)"
        ],
        cleaning_tool2: [
            "(It's a broom.)"
        ],
    }
};

// objectDialogues 구조 추가 (매뉴얼에 따라)
const objectDialogues = {
    korean: {
        door_from_second: class2Dialogues.korean.door_from_second,
        door_from_second_back: class2Dialogues.korean.door_from_second_back,
        cleaning_cabinet: class2Dialogues.korean.cleaning_cabinet,
        training_clothes: class2Dialogues.korean.training_clothes,
        mop: class2Dialogues.korean.mop,
        cleaning_tool1: class2Dialogues.korean.cleaning_tool1,
        cleaning_tool2: class2Dialogues.korean.cleaning_tool2,
    },
    english: {
        door_from_second: class2Dialogues.english.door_from_second,
        door_from_second_back: class2Dialogues.english.door_from_second_back,
        cleaning_cabinet: class2Dialogues.english.cleaning_cabinet,
        training_clothes: class2Dialogues.english.training_clothes,
        mop: class2Dialogues.english.mop,
        cleaning_tool1: class2Dialogues.english.cleaning_tool1,
        cleaning_tool2: class2Dialogues.english.cleaning_tool2,
    }
};

// NPC dialogues 구조 추가
const npcDialogues = {
    korean: {
        student80: class2Dialogues.korean.student80,
        student81: class2Dialogues.korean.student81,
        student82: class2Dialogues.korean.student82,
        student83: class2Dialogues.korean.student83,
        student91: class2Dialogues.korean.student91,
        student92: class2Dialogues.korean.student92,
        student93: class2Dialogues.korean.student93,
        student94: class2Dialogues.korean.student94,
        // boundaries 레이어 학생들 추가
        student84: class2Dialogues.korean.student84,
        student85: class2Dialogues.korean.student85,
        student86: class2Dialogues.korean.student86,
        student87: class2Dialogues.korean.student87,
        student88: class2Dialogues.korean.student88,
        student89: class2Dialogues.korean.student89,
        student90: class2Dialogues.korean.student90,
    },
    english: {
        student80: class2Dialogues.english.student80,
        student81: class2Dialogues.english.student81,
        student82: class2Dialogues.english.student82,
        student83: class2Dialogues.english.student83,
        student91: class2Dialogues.english.student91,
        student92: class2Dialogues.english.student92,
        student93: class2Dialogues.english.student93,
        student94: class2Dialogues.english.student94,
        // boundaries 레이어 학생들 추가
        student84: class2Dialogues.english.student84,
        student85: class2Dialogues.english.student85,
        student86: class2Dialogues.english.student86,
        student87: class2Dialogues.english.student87,
        student88: class2Dialogues.english.student88,
        student89: class2Dialogues.english.student89,
        student90: class2Dialogues.english.student90,
    }
};

// Export
export const class2ObjectDialogues = objectDialogues;
export const class2NpcDialogues = npcDialogues;
export { class2ObjectNames, class2NpcNames, class2Dialogues };

// 매뉴얼 형식에 맞는 기본 export
export default {
    objectNames: class2ObjectNames,
    npcNames: class2NpcNames,
    objectDialogues: objectDialogues,
    npcDialogues: npcDialogues,
    korean: class2Dialogues.korean,
    english: class2Dialogues.english,
};
