// second.json에 있는 오브젝트들에 대응하는 대화 내용

const npcNames = {
    korean: {
        // 2층에 있는 학생들
        student40: "서혜림",
        student41: "오윤아",
        student42: "신세희",
        student43: "이연주",
        student44: "강민주",
        student45: "최아림",
        student46: "오상은",
        student47: "백진희",
        student48: "신세경",
        student_wheel: "장선아",
        student84: "김민지",
        student85: "최서라",
        student86: "이민아",
        student87: "이정은",
        student88: "최성혜",
        student89: "이승주",
        student90: "방수정",
    },
    english: {
        // Students on 2nd floor
        student40: "Seo Hye-rim",
        student41: "Oh Yoon-ah",
        student42: "Shin Se-hee",
        student43: "Lee Yeon-ju",
        student44: "Kang Min-ju",
        student45: "Choi Ah-rim",
        student46: "Oh Sang-eun",
        student47: "Baek Jin-hee",
        student48: "Shin Se-kyung",
        student_wheel: "Jang Sun-ah",
        student84: "Kim Min-ji",
        student85: "Choi Seo-ra",
        student86: "Lee Min-ah",
        student87: "Lee Jung-eun",
        student88: "Choi Sung-hye",
        student89: "Lee Seung-ju",
        student90: "Bang Su-jung",
    },
};

const objectNames = {
    korean: {
        desk_spare1: "키다리 책상",
        desk_spare2: "여분 책상2", 
        shelf: "책장",
        wheelchair: "휠체어",
        elevator2: "2층 엘리베이터",
        mirror: "거울",
        plant3: "화분",
        bookcase: "책장",
        bin: "쓰레기통",
        vendingmachine: "자판기",
        door_wc2: "2층 화장실 문",
        exit_to_next: "3층 계단",
        cleaning_case: "청소도구함",
        door_class1: "1반 교실 문",
        door_class1_back: "1반 교실 뒷문",
        door_class2: "2반 교실 문", 
        door_class2_back: "2반 교실 뒷문",
        shoecase: "신발장",
        books: "도서",
        desk_sci: "과학실 실험대",
        shelf_sci: "과학실 책장",
        door_sci: "과학실 문",
        stair_to_first: "1층 계단",
        door_health: "보건실 문",
        locker: "사물함",
        bunsin: "분신사바종이",
    },
    english: {
        desk_spare1: "Spare Desk 1",
        desk_spare2: "Spare Desk 2",
        shelf: "Bookshelf", 
        wheelchair: "Wheelchair",
        elevator2: "2F Elevator",
        mirror: "Mirror",
        plant3: "Plant",
        bookcase: "Bookcase",
        bin: "Trash Bin",
        vendingmachine: "Vending Machine",
        door_wc2: "2F Restroom Door",
        exit_to_next: "Stairs to 3F",
        cleaning_case: "Cleaning Supply Cabinet",
        door_class1: "Class 1 Door",
        door_class1_back: "Class 1 Back Door",
        door_class2: "Class 2 Door",
        door_class2_back: "Class 2 Back Door", 
        shoecase: "Shoe Cabinet",
        books: "Books",
        desk_sci: "Science Lab Table",
        shelf_sci: "Science Lab Shelf",
        door_sci: "Science Lab Door",
        stair_to_first: "Stairs to 1F",
        door_health: "Health Room Door",
        locker: "Locker",
        bunsin: "Bunsin-saba Paper",
    },
};

// 오브젝트 대화 내용
const objectDialogues = {
    korean: {
        student40: ["아 오늘 앞머리 좀 떡진거 같은데...", "빗 있냐?"],
        student41: ["아씨...자판기가 또 동전 먹었어..."],
        student42: ["과학은 참 흥미로워...", "나중에 화학과를 가서 연구원이 될거야."],
        student43: ["(사물함을 정리하고 있다.)"],
        student44: ["난 쓸모없어...", "쪽지시험을 망쳤어...난 쓰레기야..."],
        student45: ["해리포터 재밌어서 계속 읽다가 좀 쉬는중이야...", "다음 권은 누가 가져간걸까...", "얼른 갖다놨으면 좋겠어."],
        student46: ["교실 들어가기 싫어어......"],
        student47: ["내가 이렇게 렇게 만만하니~"],
        student48: ["하!"],
        student_wheel: ["...말 걸지마."],
        student84: ["...이게 진짜 된다고?"],
        student85: ["움직인다...움직인다..."],
        student86: ["분신사바...분신사바......"],
        student87: ["무서워......"],
        student88: ["저런걸 누가 믿어 ㅡㅡ"],
        student89: ["조용히좀 해봐..."],
        student90: ["유치하네 진짜."],
        desk_spare1: [
            "(복도에 놓인 키다리 책상이다.)","(너무 졸린 학생들은 여기서 공부한다.)"
        ],
        desk_spare2: [
            "(샤이니 응원봉이 있네...?)",
            "(예쁘다....)"
        ],
        shelf: [
            "각종 교재와 참고서가 정리되어 있다.",
            "학생들이 자주 찾는 책들이 모여있다.",
            "체계적으로 분류되어 있어 찾기 쉽다."
        ],
        wheelchair: [
            "거동이 불편한 학우들을 위해 구비되어 있다."
        ],
        elevator2: [
            "(2층으로 연결되는 엘리베이터다.)",
            "(학생은 이용하지 못하고 교직원만 이용할 수 있는 것 같다.)",
            "(...치사해)",
            
        ],
        mirror: [
      "(큰 복도 거울이다.)",
      "(가끔 학생들이 외모를 체크한다.)",
    
        ],
        plant3: [
            "2층 복도를 장식하는 화분이다.",
        ],
        bookcase: [
            "(주로 공부에 도움되는 책들이 꽂혀 있다.)",
            "(...인터넷 소설은 없겠지...?)",
        ],
        bin: [
            "(복도 쓰레기통이다.)",
        ],
        vendingmachine: [
            "(다양한 음료와 간식을 판매하는 자판기다.)",
            "음료를 뽑아 마실까?",
            {
                type: "choice",
                prompt: "어떻게 하시겠습니까?",
                choices: [
                    {
                        text: "아니오",
                        action: "cancel",
                        consequence: "(자판기를 그냥 지나쳤다.)"
                    },
                    {
                        text: "예",
                        action: "drink_vending",
                        consequence: "(시원한 음료를 마셨다! 갈증이 해소되고 기분이 좋아진다.)"
                    }
                ]
            }
        ],
        door_wc2: [
            "(...엥? 여고에 웬 남자화장실?!)",
            "(남자 교직원을 위한 화장실인것 같다.)",
        ],
        cleaning_case: [
            "(청소도구를 모아놓은 보관함이다.)",
        ],
 
        shoecase: [
            "(학생들의 신발을 보관하는 신발장이다.)",
        ],
        books: [
            "(해리포터 책들이 어지럽게 흩어져있다.)"
        ],
        desk_sci: [
            "(여러 플라스크들이 진열된 과학실 앞 책상이다.)"
        ],
        shelf_sci: [
            "(과학실 앞 선반이다.)",
            "(해골이 약간 섬뜩해보인다.)",
        ],
        door_sci: [
            "과학실 입구다.",
            "흥미로운 과학 실험이 이루어지는 곳이다.",
            "안전 수칙이 명확히 표시되어 있다."
        ],
        locker: [
            "(사물함이다.)"
        ],
        bunsin: [
            "(무언가가 그려져있다.)"
        ],
      
    },
    english: {
        student40: ["Ugh, my bangs look a bit greasy today...", "Do you have a comb?"],
        student41: ["Damn... the vending machine ate my coins again..."],
        student42: ["Science is really interesting...", "I'm going to major in chemistry and become a researcher."],
        student43: ["(Organizing the locker.)"],
        student44: ["I'm useless...", "I failed the quiz... I'm trash..."],
        student45: ["I was reading Harry Potter and taking a break...", "Who took the next volume?", "I wish they'd return it soon."],
        student46: ["I don't want to go into the classroom......"],
        student47: ["Am I really that easy to mess with~"],
        student48: ["Ha!"],
        student_wheel: ["...Don't talk to me."],
        student84: ["...Does this really work?"],
        student85: ["It's moving...it's moving..."],
        student86: ["Bunsin-saba...bunsin-saba......"],
        student87: ["I'm scared......"],
        student88: ["Who would believe that ㅡㅡ"],
        student89: ["Be quiet for a moment..."],
        student90: ["That's really childish."],
        desk_spare1: [
            "This is a spare desk kept in reserve.",
            "It will be arranged according to the number of students in the new semester.",
            "It's kept neat and tidy."
        ],
        desk_spare2: [
            "(There's a SHINee light stick here...?)",
            "(It's pretty....)"
        ],
        shelf: [
            "Various textbooks and reference books are organized here.",
            "Books frequently sought by students are gathered here.",
            "They are systematically categorized and easy to find."
        ],
        wheelchair: [
            "This is a wheelchair for students with mobility difficulties.",
            "It's prepared to be used anytime.",
            "It's a thoughtful facility."
        ],
        elevator2: [
            "This is an elevator connected to the 2nd floor.",
            "It's useful when you have a wheelchair or heavy luggage.",
            "It's safely managed."
        ],
        mirror: [
            "A large mirror is hung on the wall.",
            "Students can keep their appearance neat.",
            "It's cleanly wiped and clearly visible."
        ],
        plant3: [
            "This is a plant decorating the 2nd floor corridor.",
            "The green leaves look fresh.",
            "It seems to help purify the air too."
        ],
        bookcase: [
            "This is a bookcase with various books.",
            "From novels to professional books, there's variety.",
            "It supports students' reading activities."
        ],
        bin: [
            "This is a trash bin for waste separation.",
            "It's managed cleanly.",
            "You can feel the environmental consciousness."
        ],
        vendingmachine: [
            "This vending machine sells various drinks and snacks.",
            "Would you like to buy a drink?",
            {
                type: "choice",
                prompt: "What would you like to do?",
                choices: [
                    {
                        text: "No",
                        action: "cancel",
                        consequence: "(I just passed by the vending machine.)"
                    },
                    {
                        text: "Yes",
                        action: "drink_vending",
                        consequence: "(I drank a refreshing beverage! My thirst is quenched and I feel better.)"
                    }
                ]
            }
        ],
        door_wc2: [
            "This is the entrance to the 2nd floor restroom.",
            "Male and female sections are clearly marked.",
            "It seems to be cleanly managed."
        ],
        exit_to_next: [
            "These are the stairs going up to the 3rd floor.",
            "It connects to the floor with special rooms.",
            "The music room, art room, etc. are on the 3rd floor."
        ],
        cleaning_case: [
            "(This is a storage cabinet where cleaning supplies are kept.)",
        ],
        door_class1: [
            "This is the entrance to 2nd Grade Class 1.",
            "You can hear the sound of diligent studying.",
            "It's cleanly managed."
        ],
        door_class1_back: [
            "This is the back door of 2nd Grade Class 1.",
            "It's used for cleaning tools or meal distribution.",
            "It's a practical entrance."
        ],
        door_class2: [
            "This is the entrance to 2nd Grade Class 2.",
            "You can hear the lively voices of students.",
            "You can feel a bright atmosphere."
        ],
        door_class2_back: [
            "This is the back door of 2nd Grade Class 2.",
            "It's useful during emergencies or cleaning.",
            "It's an additional entrance for safety."
        ],
        shoecase: [
            "This is a shoe cabinet for storing students' shoes.",
            "Numbers are assigned for systematic management.",
            "It's neatly organized."
        ],
        books: [
            "These are various educational books.",
            "From textbooks to reference books are available.",
            "They are good materials helpful for learning."
        ],
        desk_sci: [
            "This is an experimental table for science experiments.",
            "Various experimental equipment are organized here.",
            "It's designed to conduct experiments safely."
        ],
        shelf_sci: [
            "This is a bookshelf dedicated to the science lab.",
            "Science-related books and materials are organized here.",
            "These are reference materials needed for experiments and learning."
        ],
        door_sci: [
            "This is the entrance to the science lab.",
            "It's a place where interesting science experiments take place.",
            "Safety rules are clearly displayed."
        ],
        stair_to_first: [
            "These are the stairs going down to the 1st floor.",
            "It connects to the floor with the lobby and various facilities.",
            "Safety railings are well installed."
        ],
        door_health: [
            "This is the entrance to the health room.",
            "It's a place to visit when sick or injured.",
            "You can feel the warm care in this space."
        ],
        locker: [
            "(It's a locker.)"
        ],
        bunsin: [
            "(Something is drawn on it.)"
        ],
    },
};

export default {
    npcNames,
    objectNames,
    objectDialogues,
};
