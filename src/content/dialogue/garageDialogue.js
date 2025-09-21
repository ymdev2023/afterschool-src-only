// garageDialogue.js - garage.json의 모든 엔티티 대화 내용
// objectDialogue.js와 frontDialogue.js 형식을 참고하여 작성

const garageObjectNames = {
    korean: {
        // Boundaries 오브젝트들
        bench: "작업대",
        tools: "도구상자", 
        board: "게시판",
        shelf: "선반",
        bowl: "그릇",
        fire: "소화기",
        plates: "킥판들",
        pingpong: "탁구대",
        workout: "운동기구",
        swimming: "수영도구",
        balls: "공들",
        mp3: "mp3 플레이어",
        student22: "유하은",
    },
    english: {
        // Boundaries 오브젝트들
        bench: "Workbench",
        tools: "Tool Box",
        board: "Notice Board", 
        shelf: "Shelf",
        bowl: "Bowl",
        fire: "Fire",
        plates: "Plates",
        pingpong: "Ping Pong Table",
        workout: "Exercise Equipment",
        swimming: "Swimming Pool",
        balls: "Balls",
        mp3: "MP3 Player",
        student22: "Yu Haeun",
    },
};

const garageDialogues = {
    korean: {
        // Boundaries 오브젝트들
        bench: [
            "(여러 공구들이 정리되어 있는 작업대이다.)"
        ],
        tools: [
            "(각종 수리 도구들이 들어있는 도구상자이다.)"
        ],
        board: [
            "(창고 사용 수칙이 적혀있는 게시판이다.)"
        ],
        shelf: [
            "(각종 용품들이 보관되어 있는 선반이다.)"
        ],
        bowl: [
            "(볼링공을 담는 정리함이다.)"
        ],
        fire: [
            "(비상시에 불을 끌 수 있는 소화기인 것 같다.)",
            "(자나깨나 불조심! 꺼진 불도 다시 보자!)"
        ],
        plates: [
            "(수영할 때 쓰는 킥판인것 같다.)"
        ],
        pingpong: [
            "(체육시간에 학생들이 사용하는 탁구대이다.)" 
	],
        workout: [
            "(체력 단련을 위한 운동기구이다.)"
        ],
        swimming: [
            "(각종 수영도구들과 슬리퍼가 있다.)"
        ],
        balls: [
            "(다양한 크기의 공들이다.)"
        ],
        mp3: [
            "(mp3다!)",
            "(...누가 잃어버린 것 같은데...)",
            "(소녀시대-gee가 흘러나오고 있다.)",
            "(잃어버린지 얼마 되지 않은 것 같은데...)",
            "(주인을 찾아줘야 하나?)",
        ],
        student22: [
            "...저리가."
        ],},
            english: {
        // Boundaries 오브젝트들
        bench: [
            "A workbench with various tools organized neatly."
        ],
        tools: [
            "A toolbox containing various repair tools."
        ],
        board: [
            "A notice board with storage room usage rules."
        ],
        shelf: [
            "A shelf storing various supplies."
        ],
        bowl: [
            "A bowl used for food or water."
        ],
        fire: [
            "A warm fire is burning."
        ],
        plates: [
            "Neatly arranged clean plates."
        ],
        pingpong: [
            "A ping pong table used by students during break time."
        ],
        workout: [
            "Exercise equipment for physical training."
        ],
        swimming: [
            "There's a small swimming pool. The water looks clean."
        ],
        balls: [
            "Various sports balls gathered together."
        ],
        mp3: [
            "(This is an mp3 player!)",
            "(...Someone seems to have lost it...)",
            "(Girls' Generation - Gee is playing.)",
            "(It doesn't seem to have been lost for long...)",
            "(Should I help find the owner?)",
        ],
        student22: [
            "What am I doing in the garage? It's a secret~ hehe",
            "Isn't it really quiet and nice here?",
            "Sometimes I need some alone time.",
            "I don't really like it when other people are noisy...",
            "Do you like quiet places too? Then let's stay here together!",
            "There are lots of interesting things in the garage. Curious?",
            "Sometimes hiding away isn't so bad.",
        ],
    },
};

// Export
export const garageObjectDialogues = garageDialogues;
export { garageObjectNames, garageDialogues };
