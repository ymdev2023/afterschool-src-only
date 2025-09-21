// second2Dialogue.js - second2.json의 모든 엔티티 대화 내용
// firstDialogue.js와 restaurantDialogue.js 형식을 참고하여 작성

const second2ObjectNames = {
    korean: {
        // 상호작용 오브젝트들
        waste_bin: "쓰레기통",
        door_wc3: "화장실",
        elevator: "엘리베이터", 
        door_to_top: "위층 계단",
        door_art: "미술실",
        boxes: "박스들",
        // Students
        student70: "진달래",
        student71: "반도희", 
        student72: "김가온",
        student73: "반율",
        student74: "지은성",
        student75: "고은찬",
        student76: "한유주",
        student77: "윤해담",
        student78: "미란다",
        student79: "호지차",
        student80: "한구슬",
        cam: "카메라",
        student_desk1: "이단하",
        student_desk2: "민다롱",
        desk_set: "책걸상",
        art_tools: "미술용품",
        art_bookcase: "책장",
        desks: "책상",
    },
    english: {
        // 상호작용 오브젝트들
        waste_bin: "Waste Bin",
        door_wc3: "Restroom",
        elevator: "Elevator",
        door_to_top: "Upstairs",
        door_art: "Art Room", 
        boxes: "Boxes",
        // Students (English names)
        student70: "Jindallae",
        student71: "Bando Hee",
        student72: "Kim Gaon",
        student73: "Ban Yul",
        student74: "Ji Eunseong",
        student75: "Go Eunchan",
        student76: "Han Yuju",
        student77: "Yoon Haedam",
        student78: "Miranda",
        student79: "Hojitea",
        student80: "Han Guseul",
        cam: "Camera",
        student_desk1: "Lee Danha", 
        student_desk2: "Min Darong",
        desk_set: "Desk Set",
        art_tools: "Art Supplies",
        art_bookcase: "Bookcase",
        desks: "Desks",
    },
};

const second2Dialogues = {
    korean: {
        // 상호작용 오브젝트들의 대화
        waste_bin: [
            "깔끔하게 관리되고 있는 쓰레기통이다.",
            "분리수거가 잘 되어 있어 보인다.",
            "학생들이 정말 깨끗하게 사용하고 있구나."
        ],
        door_wc3: [
            "3층 화장실로 향하는 문이다.",
            "지금은 사용할 수 없을 것 같다.",
            "다른 화장실을 이용해야겠다."
        ],
        elevator: [
            "학교 건물의 엘리베이터다.",
            "휠체어나 거동이 불편한 분들을 위한 것 같다.",
            "지금은 학생이 사용할 수 없을 것 같다."
        ],
        door_to_top: [
            "위층으로 올라가는 계단 입구다.",
            "3층과 4층으로 이어지는 것 같다.",
            "지금은 2층만 둘러봐야겠다."
        ],
        door_art: [
            "미술실로 향하는 문이다.",
            "안에서 그림 그리는 소리가 들린다.",
            "방과후 미술 수업이 진행 중인 것 같다."
        ],
        boxes: [
            "여러 가지 물건들이 담긴 박스들이다.",
            "학교 행사나 활동에 필요한 물품들인 것 같다.",
            "깔끔하게 정리되어 있다."
        ],
        // Students
        student70: ["이번 미술 수행평가 당선작이래~"],
        student71: ["내꺼도 있어?"],
        student72: ["아씨 옥상 잠긴 것 같음;;;;"],
        student73: ["완조니 망했네,,"],
        student74: ["옥상잠김??!/!?", "(옥상에 볼일이 있는 것 같다.)"],
        student75: ["일 더하기 일은~"],
        student76: ["(흥얼흥얼) 귀요미~"],
        student77: ["아니 친구들아... 미쓰에이 어떠삼?"],
        student78: ["이 더하기 이도 귀요미~"],
        student79: ["삼 더하기 삼도 귀요미~"],
        student80: ["귀귀 귀요미~", "귀귀 귀요미~"],
        cam: ["(UCC 찍는 듯하다)"],
        student_desk1: ["시끄러워-_-^"],
        student_desk2: ["그러니까"],
        desk_set: ["(미사용 책상인듯하다)"],
        art_tools: [
            "각종 미술용품들이다.",
            "붓, 물감, 크레파스 등이 정리되어 있다.",
            "학생들이 미술 수업에 사용하는 것 같다."
        ],
        art_bookcase: [
            "미술과 관련된 책들이다.",
            "미술사, 기법서, 작품집 등이 있다.",
            "창작 활동에 도움이 될 것 같다."
        ],
        desks: [
            "사용하지 않는 책상들이다.",
            "깔끔하게 정리되어 있다.",
            "필요할 때 꺼내 쓰는 것 같다."
        ],
    },
    english: {
        // 상호작용 오브젝트들의 대화
        waste_bin: [
            "This is a well-maintained waste bin.",
            "Recycling seems to be done properly.",
            "Students are really keeping it clean."
        ],
        door_wc3: [
            "This is the door to the 3rd floor restroom.",
            "It seems unavailable right now.",
            "I should use another restroom."
        ],
        elevator: [
            "This is the school building's elevator.",
            "It seems to be for wheelchairs or people with mobility issues.",
            "Students probably can't use it right now."
        ],
        door_to_top: [
            "This is the entrance to the stairs going upstairs.",
            "It seems to lead to the 3rd and 4th floors.",
            "I should just look around the 2nd floor for now."
        ],
        door_art: [
            "This is the door to the art room.",
            "I can hear drawing sounds from inside.",
            "There seems to be an after-school art class going on."
        ],
        boxes: [
            "These are boxes containing various items.",
            "They seem to be supplies needed for school events or activities.",
            "They're neatly organized."
        ],
        // Students (English translations)
        student70: ["I heard this is the winning piece for this art performance assessment~"],
        student71: ["Is mine there too?"],
        student72: ["Damn, the rooftop seems to be locked;;;;"],
        student73: ["Wanjo is screwed,,"],
        student74: ["The rooftop is locked??!/!?", "(Seems to have business on the rooftop.)"],
        student75: ["One plus one is~"],
        student76: ["(Humming) Cutie~"],
        student77: ["Hey guys... how about Miss A?"],
        student78: ["Cute cute cutie~"],
        student79: ["Cute cute cutie~"],
        student80: ["Cute cute cutie~"],
        cam: ["(Seems to be filming a UCC)"],
        student_desk1: ["It's noisy-_-^"],
        student_desk2: ["Exactly"],
        desk_set: ["(Seems to be an unused desk)"],
        art_tools: [
            "Various art supplies.",
            "Brushes, paints, crayons, etc. are organized here.",
            "Students seem to use these for art classes."
        ],
        art_bookcase: [
            "Books related to art.",
            "There are art history books, technique guides, art collections, etc.",
            "They would be helpful for creative activities."
        ],
        desks: [
            "Unused desks.",
            "They are neatly organized.",
            "They seem to be taken out when needed."
        ],
    }
};

// objectDialogues 구조 추가 (매뉴얼에 따라)
const objectDialogues = {
    korean: {
        waste_bin: second2Dialogues.korean.waste_bin,
        door_wc3: second2Dialogues.korean.door_wc3,
        elevator: second2Dialogues.korean.elevator,
        door_to_top: second2Dialogues.korean.door_to_top,
        door_art: second2Dialogues.korean.door_art,
        boxes: second2Dialogues.korean.boxes,
        // Students 추가
        student70: second2Dialogues.korean.student70,
        student71: second2Dialogues.korean.student71,
        student72: second2Dialogues.korean.student72,
        student73: second2Dialogues.korean.student73,
        student74: second2Dialogues.korean.student74,
        student75: second2Dialogues.korean.student75,
        student76: second2Dialogues.korean.student76,
        student77: second2Dialogues.korean.student77,
        student78: second2Dialogues.korean.student78,
        student79: second2Dialogues.korean.student79,
        student80: second2Dialogues.korean.student80,
        cam: second2Dialogues.korean.cam,
        student_desk1: second2Dialogues.korean.student_desk1,
        student_desk2: second2Dialogues.korean.student_desk2,
        desk_set: second2Dialogues.korean.desk_set,
        art_tools: second2Dialogues.korean.art_tools,
        art_bookcase: second2Dialogues.korean.art_bookcase,
        desks: second2Dialogues.korean.desks,
    },
    english: {
        waste_bin: second2Dialogues.english.waste_bin,
        door_wc3: second2Dialogues.english.door_wc3,
        elevator: second2Dialogues.english.elevator,
        door_to_top: second2Dialogues.english.door_to_top,
        door_art: second2Dialogues.english.door_art,
        boxes: second2Dialogues.english.boxes,
        // Students 추가
        student70: second2Dialogues.english.student70,
        student71: second2Dialogues.english.student71,
        student72: second2Dialogues.english.student72,
        student73: second2Dialogues.english.student73,
        student74: second2Dialogues.english.student74,
        student75: second2Dialogues.english.student75,
        student76: second2Dialogues.english.student76,
        student77: second2Dialogues.english.student77,
        student78: second2Dialogues.english.student78,
        student79: second2Dialogues.english.student79,
        student80: second2Dialogues.english.student80,
        cam: second2Dialogues.english.cam,
        student_desk1: second2Dialogues.english.student_desk1,
        student_desk2: second2Dialogues.english.student_desk2,
        desk_set: second2Dialogues.english.desk_set,
        art_tools: second2Dialogues.english.art_tools,
        art_bookcase: second2Dialogues.english.art_bookcase,
        desks: second2Dialogues.english.desks,
    }
};

// Export
export const second2ObjectDialogues = objectDialogues;
export { second2ObjectNames, second2Dialogues };

// 매뉴얼 형식에 맞는 기본 export
export default {
    objectNames: second2ObjectNames,
    objectDialogues: objectDialogues,
    korean: second2Dialogues.korean,
    english: second2Dialogues.english,
    npcNames: {}, // 현재 NPC 없음
};
