// first.json에 있는 오브젝트들에 대응하는 대화 내용
// Dialogue.js와 ObjectDialogue.js에서 해당 내용을 그대로 복사

const npcNames = {
    korean: {
        student13: "최서연",
        student14: "박하영",
        student15: "천사라",
        student16: "나소정",
        student17: "김은수",
        student18: "조아영",
        student19: "변지민",
        student20: "윤채린",
        student21: "서예린",
    },
    english: {
        student13: "Choi Seoyeon",
        student14: "Park Hayoung",
        student15: "Cheon Sara",
        student16: "Na Sojeong",
        student17: "Kim Eunsu",
        student18: "Jo Ayoung",
        student19: "Byeon Jimin",
        student20: "Yoon Chaerin",
        student21: "Seo Yerin",
    },
};

const objectNames = {
    korean: {
        letter4: "편지4",
        bulletin1: "게시판",
        door_store: "매점문",
        door_mae: "매점 입구",
        door_wc1: "1층 화장실 문",
        door_admin: "교무실 문",
        door_creative: "창의반 문",
        door_food: "급식실 문",
        stair_to_second: "2층 계단",
        exit_to_front: "정문 출구",
        main_entrance: "정문",
        window: "창문",
        cam: "캠코더",
        elevator1: "1층 엘리베이터",
        plant1: "화분",
        plant2: "화분",
        plant3: "화분",
        shelf1: "책장1",
        shelf2: "1층 로비 선반",
        shelf: "장식장",
        locker: "우편함",
        clock: "시계",
        trophy1: "책 모양 동상",
        trophy2: "트로피", 
        trophy3: "발전하는 학교상",
        box1: "매점 근처 상자",
        box2: "매점 근처 상자",
        fire_fighter: "소화기",
        wheelchair: "휠체어",
        tv: "TV",
        fishtank: "어항",
    },
    english: {
        letter4: "Letter 4",
        bulletin1: "Bulletin Board",
        door_store: "Store Door",
        door_mae: "Store Entrance",
        door_wc1: "1F Restroom Door",
        door_admin: "Teachers' Office Door",
        door_creative: "Creative Room Door",
        door_food: "Cafeteria Door",
        stair_to_second: "Stairs to 2F",
        exit_to_front: "Exit to Front",
        main_entrance: "Main Entrance",
        window: "Window",
        cam: "Camcorder",
        elevator1: "1F Elevator",
        plant1: "Potted Plant",
        plant2: "Potted Plant",
        plant3: "Potted Plant",
        shelf1: "Bookshelf 1",
        shelf2: "1F Lobby Shelf",
        shelf: "Display Cabinet",
        locker: "Mailbox",
        clock: "Clock",
        trophy1: "Book-shaped Sculpture",
        trophy2: "Trophy",
        trophy3: "Advancing School Award",
        box1: "Box near Store",
        box2: "Box near Store",
        fire_fighter: "Fire Extinguisher",
        wheelchair: "Wheelchair",
        tv: "TV",
        fishtank: "Fish Tank",
    },
};

const korean = {
   student13: [
       "학년부장쌤 왜 안와ㅡㅡ",
        "혹시 어디계신지 봤음?",
        "벌점땜에 진짜 짱나ㅡㅡ",
    ],   
        student14: [
        "혹시 그거..",
        "그거 있어…?",
        "아..아니야..",
    ],
   student15: [
        "돈갑내기 없대 오늘."
    ],
    student16: [
        "학교에 점자블록을 설치하는거에 어떻게 생각해?", "난 정말 뜻깊은 일이라고 생각해!!",
        "몇몇 개념없는 애들은 비오면 미끄럽다고 뭐라하는데...--^",
        "우리 모두가 다 불의의 사고로 하루아침에 장애인이 될수도 있는거구...",
        "은하여고에 언젠가 시각장애를 가진 친구가 다닐수도 있는거잖아?!",
        "약자를 생각하는건 당연한일이야. 안그래?!",
        "...",
        ".........",
        "...미안...! 초면에 말이 너무 많았지!!",
        "난 나소정이라고 해! 너 동아리 들었어?",
        "우리 동아리에 들어올래?! 봉사부야.",
        "온지 얼마 안됐으니, 며칠 동안 잘 생각해봐!",
    ],
    
    student17: [
        "혹시 짤짤이 있슴?",
        "백원만..ㅎ"
    ],
    student18: [
        "새치기 하지마라진짜",
    ],
    student19: [
        "너도 오늘 지각했냐?",
        "나 오늘까지 벌점 5점임 ㅠㅠ",
    ],
    student20: [
        "이 트로피 좀봐…",
        "나도 언젠간 저런 상을 받을거다?",
    ],
      student21: [
        "외출증 받아야하는데",
        "혹시 나 지금 아파보여?",
        "오늘 남친이랑 투투란 말임 ㅠ 조퇴해야함 ㅠ",
    ],

};

const english = {
    student13: [
        "Why isn't the homeroom teacher coming ㅡㅡ",
        "Did you see where they went?",
        "I'm really annoyed because of penalty points ㅡㅡ",
    ],   
    student14: [
        "Um, that thing..",
        "You know... that thing...?",
        "Ah.. never mind..",
    ],
    student15: [
        "No lunch money today."
    ],
    student16: [
        "What do you think about installing braille blocks at school?",
        "I think it's a really meaningful project!!",
        "Some thoughtless kids complain it's slippery when it rains...--^",
        "Any of us could become disabled overnight due to an accident...",
        "There might be a visually impaired friend attending Eunha Girls' High someday?!",
        "Thinking of the vulnerable is natural. Don't you think so?!",
        "...",
        ".........",
        "...Sorry...! I talked too much for a first meeting!!",
        "I'm Na Sojeong! Did you join any clubs?",
        "Want to join our club?! It's the volunteer club.",
        "Since you're new, think about it for a few days!",
    ],
    
    student17: [
        "Do you have any change?",
        "Just 100 won..ㅎ"
    ],
    student18: [
        "Don't cut in line, seriously",
    ],
    student19: [
        "Were you late today too?",
        "I have 5 penalty points as of today ㅠㅠ",
    ],
    student20: [
        "Look at this trophy...",
        "Will I ever receive an award like that?",
    ],
    student21: [
        "I need to get a pass to go out",
        "Do I look sick right now?",
        "I have a date with my boyfriend today ㅠ Need to leave early ㅠ",
    ],
};

const objectDialogues = {
    korean: {
        letter4: [
            "(매점에 신상이 들어왔대!!!)",
            "(브이콘이랑 나나콘 저번에 떨어져서 속상했는데...)",
        ],
        bulletin1: [
            "(오... 곧 체육대회가 다가오나봐.)",
            "(여긴 공부 잘하는 학교인가보네...)",
        ],
        
        door_mae: [
            "평범한 매점문이 아닌 듯 하다...",
            "뒤에 비치된 아이패드로 플레이 할 수 있나봐!",
            "이거 끝나고 하러갈까?! 빙고판도 채울겸!"
        ],
        /* 기존 URL 로직 주석처리됨
        door_mae: [
            "평범한 매점문이 아닌 듯 하다...",
            "[매점타이쿤]",
            "",
            "달콤! 새콤! 매콤!",
            "짜릿한 재미가 기다립니다!!",
            "은하여고 매점 주인이 되어 귀엽고 까다로운 손님들을 상대해보세요!",
            "",
            {
                type: "choice",
                question: "지금 바로 플레이하시겠습니까?",
                choices: [
                    {
                        text: "예",
                        response: "좋은 선택입니다! 지금 바로 매점으로 고고씽!!!",
                        url: "https://play.unity.com/en/games/4cfd4e0b-efa3-4334-ba19-a5d450a835a3/mzgo"
                    },
                    {
                        text: "아니오",
                        response: "에궁...아쉽지만 다음 기회에 신기록에 도전해보세요!"
                    }
                ]
            }
        ],
        */
       
       
   

        elevator1: [
            "(1층 엘리베이터이다.)",
            "(위로 올라갈 수 있으나, 학생은 사용할 수 없다.)",
            "(...불공평해.)",
        ],
        plant1: [
            "(화분이다.)","(이걸로 공기가 정화가 될까...?)"
        ],
        plant2: [
            "(또 다른 화분이다.)",
            "(푸른 잎이 무성하다.)",
        ],
        plant3: [
            "(그냥 화분이다.)",
        ],
  
        locker: [
            "(우편함이다.)",
            "(편지와 소포를 받을 수 있다.)",
            "(각 학생마다 번호가 있다.)",
            "(정기적으로 확인해야 한다.)",
            "(중요한 편지가 올 수 있다.)",
        ],
        clock: [
            "(괘종시계다.)",
            "(은하여자고등학교 창립 50주년 기념이라고 적혀있다.)",
        ],
        trophy1: [
            "(책처럼 생긴 조형물 같다.)",
        ],
        trophy2: [
            "(발전하는 학교상이라고 적혀 있다.)",
        
        ],
        trophy3: [
            "(각종 트로피와 상장이 진열되어 있다.)",
            "(시내 큰 대회에서 우승한 상장이 정말 많다.)",
            "(창의반에서 인재가 많이 배출된다더니 그 반에서 받은걸까?)",
        ],
        shelf: [
            "(장식장 같다.)",
        ],
        box1: [
            "(여긴 뭐가 들어있을까?!)",
        ],
        box2: [
            "(매점 근처에 상자가 많네!)","(오늘은 어떤 신상이 들어왔으려나?!)",
        ],
        fire_fighter: [
            "(비상 시에 불을 끌 수 있는 소화기다.)",
            "(자나 깨나 불조심!)"
        ],
        wheelchair: [
            "(몸이 불편한 학우를 위한 휠체어이다.)"
        ],
        tv: [
            "(교내 홍보영상이나 학교 방송이 나올 것 같은 TV다.)",
            "(지금은 꺼져있다.)",
        ],
        fishtank: [
            "(어항이다.)",
            "(물고기들 상태가 좋은 걸 보니 관리가 잘 되는 것 같다.)",
        ],
        door_admin: [
            "(교무실 문이다.)",
            "(학생들이 간혹 혼나는 소리가 들린다.)",
            "(...지금은 들어가지 말아야겠다.)"
        ],
        door_creative: [
            "(성적이 우수한 3학년 학생들이 공부하는 곳이다.)",
            "(무척 조용한 것 같다.)",
        ],
       
    },
    english: {
        letter4: [
            "(New items arrived at the store!!!)",
            "(I was sad when V-con and Nana-con ran out last time...)",
        ],
        bulletin1: [
            "(Oh... looks like the sports festival is coming soon.)",
            "(This seems like a school that's good at studying...)",
        ],
        
        door_mae: [
            "This doesn't seem like an ordinary store door...",
            "[Store Tycoon]",
            "",
            "Sweet! Sour! Spicy!",
            "Thrilling fun awaits!!",
            "Become the owner of Eunha Girls' High School store and serve cute and picky customers!",
            "",
            {
                type: "choice",
                question: "Would you like to play right now?",
                choices: [
                    {
                        text: "Yes",
                        response: "Great choice! Let's go to the store right now!!!",
                        url: "https://play.unity.com/en/games/4cfd4e0b-efa3-4334-ba19-a5d450a835a3/mzgo"
                    },
                    {
                        text: "No",
                        response: "That's a shame, but try to set a new record next time!"
                    }
                ]
            }
        ],

        elevator1: [
            "(This is the 1st floor elevator.)",
            "(You can go up, but students can't use it.)",
            "(...That's unfair.)",
        ],
        plant1: [
            "(It's a potted plant.)",
            "(I wonder if this actually purifies the air...?)"
        ],
        plant2: [
            "(Another potted plant.)",
            "(The green leaves are lush.)",
        ],
        plant3: [
            "(Just a potted plant.)",
        ],
  
        locker: [
            "(It's a mailbox.)",
            "(You can receive letters and packages.)",
            "(Each student has a number.)",
            "(You need to check it regularly.)",
            "(Important letters might come.)",
        ],
        clock: [
            "(It's a wall clock.)",
            "(It says it's commemorating the 50th anniversary of Eunha Girls' High School.)",
        ],
        trophy1: [
            "(It looks like a book-shaped sculpture.)",
        ],
        trophy2: [
            "(It says 'Advancing School Award'.)",
        ],
        trophy3: [
            "(Various trophies and certificates are displayed.)",
            "(There are so many awards from winning big city competitions.)",
            "(I heard many talented people come from the creative class, maybe they got these?)",
        ],
        shelf: [
            "(It looks like a display cabinet.)",
        ],
        box1: [
            "(I wonder what's in here?!)",
        ],
        box2: [
            "(There are many boxes near the store!)",
            "(I wonder what new items came in today?!)",
        ],
        fire_fighter: [
            "(It's a fire extinguisher that can put out fires in emergencies.)",
            "(Fire safety day and night!)"
        ],
        wheelchair: [
            "(It's a wheelchair for students with physical disabilities.)"
        ],
        tv: [
            "(It's a TV that would show school promotional videos or broadcasts.)",
            "(It's turned off right now.)",
        ],
        fishtank: [
            "(It's a fish tank.)",
            "(The fish look healthy, so it seems well-maintained.)",
        ],
        door_admin: [
            "(It's the teachers' office door.)",
            "(You can sometimes hear students getting scolded.)",
            "(...I shouldn't go in right now.)"
        ],
        door_creative: [
            "(It's where excellent 3rd-year students study.)",
            "(It seems very quiet.)",
        ],
    },
};

const firstDialogues = {
    korean: korean,
    english: english,
    names: npcNames,
};

const firstObjectDialogues = {
    korean: objectDialogues?.korean || {},
    english: objectDialogues?.english || {},
    names: objectNames,
};

export { npcNames, objectNames, korean, english, objectDialogues, firstDialogues, firstObjectDialogues };

// default export 추가
const firstDialogue = {
    npcNames,
    objectNames,
    korean,
    english,
    objectDialogues
};

export default firstDialogue;
