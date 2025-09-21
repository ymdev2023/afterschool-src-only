// frontDialogue.js - front.json의 모든 엔티티 대화 내용
// objectDialogue.js와 Dialogue.js 형식을 참고하여 작성

const frontNpcNames = {
    korean: {
        // Spawnpoint 엔티티들 (학생들)
        student1: "정다정",
        student2: "오새롬", 
        student3: "박수진",
        student4: "고혜성",
        student5: "김민지",
        student6: "이하늘",
        student7: "권소미",
        student8: "김윤명",
        student9: "박은서",
        student10: "이나영",
        student11: "김보영",
        student12: "한지우",
        student13: "강예지", // 추가된 부분
        // 운동장 학생들 (student_w 시리즈)
        student_w1: "박태준",
        student_w2: "김민우", 
        student_w3: "이서현",
        student_w4: "최다은",
        student_w5: "윤지호",
        student_w6: "정현수",
        student_w7: "한예린",
        student_w8: "송민석",
        student_w9: "김수아",
        cat1: "학교 고양이",
        cat2: "운동장 고양이",
        // Boundaries 엔티티들 (교직원)
        director: "학년부장쌤",
        facil: "교감선생님",
    },
    english: {
        // Spawnpoint 엔티티들 (학생들)
        student1: "Jung Dajeong",
        student2: "Oh Saerom",
        student3: "Park Sujin", 
        student4: "Go Hyeseong",
        student5: "Kim Minji",
        student6: "Lee Haneul",
        student7: "Kwon Somi",
        student8: "Kim Yunmyeong",
        student9: "Park Eunseo",
        student10: "Lee Nayoung",
        student11: "Kim Boyoung",
        student12: "Han Jiwoo",
        student13: "Kang Yeji", // 추가된 부분
        // 운동장 학생들 (student_w 시리즈)
        student_w1: "Park Taejun",
        student_w2: "Kim Minwoo",
        student_w3: "Lee Seohyun",
        student_w4: "Choi Daeun",
        student_w5: "Yoon Jiho",
        student_w6: "Jeong Hyunsu",
        student_w7: "Han Yerin",
        student_w8: "Song Minseok",
        student_w9: "Kim Sua",
        cat1: "School Cat",
        cat2: "Playground Cat",
        // Boundaries 엔티티들 (교직원)
        director: "Grade Director",
        facil: "Vice Principal",
    },
};

const frontObjectNames = {
    korean: {
        // Spawnpoint 오브젝트들
        letter1: "편지1",
        letter2: "편지2", 
        letter3: "편지3",
        ball: "피구공",
        nca: "NCA 전단지",
        game: "게임기", // 추가
        ants: "개미", // 추가
        tamagotchi: "다마고치", // 추가
        timecapsule: "오래된 상자", // 추가
        // Boundaries 오브젝트들
        car1: "자동차1",
        car2: "자동차2",
        car3: "자동차3", 
        car4: "자동차4",
        pot: "화분",
        sink: "식수대",
        goal_post1: "골대1",
        goal_post2: "골대2",
        badminton: "배드민턴 라켓",
        main_entrance: "정문",
        front_gate: "앞문",
        line_machine: "라인 페인터",
        door_garage: "차고 문",
    },
    english: {
        // Spawnpoint 오브젝트들
        letter1: "Letter 1",
        letter2: "Letter 2",
        letter3: "Letter 3", 
        ball: "Dodgeball",
        nca: "NCA Flyer",
        game: "Game Machine", // 추가
        ants: "Ants", // 추가
        tamagotchi: "Tamagotchi", // 추가
        timecapsule: "Old Box", // 추가
        // Boundaries 오브젝트들
        car1: "Car 1",
        car2: "Car 2",
        car3: "Car 3",
        car4: "Car 4",
        pot: "Flower Pot",
        sink: "Water Fountain",
        goal_post1: "Goal Post 1",
        goal_post2: "Goal Post 2",
        badminton: "Badminton Racket",
        main_entrance: "Main Entrance",
        front_gate: "Front Gate", 
        line_machine: "Line Painter",
        door_garage: "Garage Door",
    },
};

// Spawnpoint 엔티티들의 대화 내용 (학생들과 NPC들)
const frontSpawnpointDialogues = {
    korean: {
        // 학생들
        student1: [
            "그거 알오? 조금 있으면 체육대회야!>_<",
            "다들 준비하느라고 지금 정신이 없더라궁...!",
            "반 대항이라나 뭐라나...",
            "우리반 티셔츠도 귀여운 나처럼 귀여웠으면 좋겠당!!!!",
            "아 근데 너 그렇게 돌아다니면 다리 아프지 않앙?!",
            "스페이스 바나 B버튼을 누르면 너도 자리에 앉을 수 있엉!",
            "저~기 고혜성처럼 흙바닥에 앉지말고 나처럼 계단에 앉으면 됑><!!",
        ],
        student2: [
            
            "(옆 친구와 대화하고 있다.)",
            "어제 급식 진짜 맛있었어!",
            "매점이랑 급식 없었다면 진작 자퇴했을거야-_-... 안 그래?",
            "그건 그렇고, 오늘 급식 뭔지 알아?",
            "(...)",
            "...깜짝이야! 너 언제부터 와있었어?",
            {
                type: "choice",
                question: "너 급식 메뉴 뭔지 알아?",
                choices: [
                    {
                        text: "웅",
                        response: "그래서 급식메뉴가 뭔데?"
                    },
                    {
                        text: "아니",
                        response: "급식메뉴 모르면 가. (친하지도 않으면서...)"
                    }
                ]
            }
        ],
        student3: [
            "(옆 친구와 대화하고 있다.)",
            "아니 담임 진짜 짜증나지 않냐?",
            "뭔 체육대회를 준비하래... 지금 시험기간인데...",
            "...응? 뭐야 너-_- 언제부터 와있었어?",
            "(기분 나쁘게 엿듣고 ㅈㄹ이야...)",     
         
        ],
        student4: [
            "개미 한 마리는 지구상에서 가장 나약하고 미미한 동물일지 몰라도...",
            "집단을 이룬 개미는 가장 창의적인 동물 중 하나야.",
            "터널도 파고, 농사도 짓고, 육아도 하고, 심지어 전쟁도 해.",
            "인간 사회랑 비슷하지 않니? 후후...",
            "더 알고 싶다면 '은하여고 생로병사의 비밀'동아리에 들어오면 돼!",
            "...너가 자격이 된다고 생각하면 말이지.",
           
        ],
        student5: [
            "친구야 너 알 얼마나 남았어?",
            "...",
            "알 몰라 알? 알 충전해야 남자친구한테 문자를 보내는데...",
            "빌려줄 수 있오?!?!",
            "다음에 충전되면 갚을겡 ^^ 투투라서 그래 오늘이!",
            "(플레이어를 쳐다본다.)",
            "아... 없어? 그럼 나 체육복 바지좀 빌려줄 수 있을까?!",
            "(플레이어를 쳐다본다.)",
            "빌려달라는 거지 달라 그랬냐?",
            "진짜 치사하다...",       
        ],
        student6: [
            "야 학년부장 진짜 짜증나지 않냐?",
            "...",
            "뭐? 오늘 전학왔다고?",
            "그럼 넌 모르겠네..."
        ],
        student7: [
            "*꿀꺽꿀꺽* 아~ 시원해!",
            "방금 체육시간 끝나서 목이 너무 말랐어!",
            "*꿀꺽* 아 완전 차갑고 맛있어!",
            "운동이 최고야! 너도 운동 좋아해?",
            "*꿀꺽꿀꺽* 나는 농구랑 배구를 제일 좋아해!",
            "운동 후에 마시는 찬물만큼 좋은 게 없어! *꿀꺽*",
            "오늘 체육시간에 릴레이 경기했는데 우리 팀이 1등했어!",
            "*꿀꺽* 땀 흘리고 나서 마시는 물이 꿀맛이야~",
        ],
        student8: [
            "뭔가 재밌는 일 없을까?",
            "우린 항상 재밌는 일을 계획하고 있어!!",
            "우리가 누구냐고? 우리 셋이랑 저어기 고양이랑 노는 애 이렇게 넷이야!!",
            "다음엔 뭘 또 해볼까?!",
            "너도 같이할래!?"
        ],
        student9: [
            "우린 은하여고 대표 축구팀이야!!"
            ,"응? 우리 동아리 이름이 뭐냐고?",
            "공동체라고 해!!!!!! 너도 들어올래?!",
            "저기 노란옷 입은 애랑, 왼쪽에 고양이랑 노는애랑..."
            ,"위에 교복입고 있는 애랑 같은 팀이야!!!",
            "너도 들어올래?!",

        ],
        student10: [
            "너 축구 좋아해?", 
            "옆에 공 한번 차볼래?",
            "축구공은 아니지만~~~~",
            "기분이 좋아진다구~~~!!!!!!",
            
                    ],
        student11: [
            "...",
            "고양이는 사랑이야~~~~",
            "...아... 난 축구를 사실 좋아하지 않아...",
            "근데 같이 하자길래 하긴 했어.",
            "그보다 너 화장품에 관심 있어?",
            "이번에 NARS 신상이 나왔는데 말이야...",
            "너 나스 알아?",
           
        ],
        student12: [
            "성적이 인생의 전부일까...?",
            "다들 성적 때문에 울고 웃고 화내는데...",
            "어른들이 일단 좋은 대학을 가라는데...",
            "대학 가면 정답을 알 수 있을까...?",
        ],
        student13: [ // 추가된 부분: 강예지
            "(...)",
            "(...꺼져.)",
        ],
        // 운동장 학생들 (student_w 시리즈) - 스포츠 테마
        student_w1: [
            "헛 둘 헛둘!",
        ],
        student_w2: [
            "아 개 힘들어..."
        ],
        student_w3: [
            "한나...둘..."
        ],
        student_w4: [
            "한나 둘...",
        ],
        student_w5: [
            "파이팅!"
        ],
        student_w6: [
            "할수 있다!",
        ],
        student_w7: [
            "헛둘..."
        ],
        student_w8: [
            "셋넷..."
        ],
        student_w9: [
            "헥헥..."
        ],
        cat1: [
            "야옹~", 
            "(늘어지게 기지개를 켠다)",
         "(일광욕을 하고 있다)"
        ],
        cat2: [
            "먀~",
        ],
        // NPC들 (boundaries에서 spawnpoint로 이동된 것들)
        director: [
            "안녕하세요, 김태원이라고 합니다.",
            "운동장에서 학생들이 건전하게 활동하는 모습을 보니 뿌듯하네요.",
            "체력도 중요하지만 무엇보다 안전이 최우선입니다.",
            "항상 조심하고, 다치지 않도록 주의하세요!",
        ],
        facil: [
            "안녕하세요! 교감 이성민입니다.",
            "운동장에서 보니 더욱 활기차 보이네요!",
            "저도 학생 때는 여기서 축구를 자주 했답니다.",
            "건강한 학교생활 하시길 바라요!",
        ],
    },
    english: {
        // 학생들
        student1: [
            "Oh really! I'm so excited thinking about having the sports festival on this playground!",
            "I really hope our class gets first place this time!",
            "Especially in the relay! I'm confident in running!",
            "What event are you going to participate in?",
            "Let's practice hard together!",
        ],
        student2: [
            "Wow... I didn't know the view from outside school could be this nice!",
            "I'm usually just in the classroom so I didn't realize...",
            "Sometimes it's nice to come outside and get some fresh air like this!",
            "I was feeling stuffy during class but I feel better now.",
        ],
        student3: [
            "The seniors told me to meet them here during lunch.",
            "But they're not here yet... I hope I'm not late?",
            "Waiting on this bench isn't too bad though.",
            "Are you waiting for someone too?",
        ],
        student4: [
            "On this ground... countless students must have played and run around.",
            "Their memories and stories are buried in this soil.",
            "I'll leave this place someday too...",
            "But I want to cherish this moment.",
            "Time flows but memories are eternal.",
        ],
        student5: [
            "The confession scene finally happened in today's webtoon!",
            "I've been sitting here reading and it's so interesting!",
            "It was a scene where the main character confesses on the playground...",
            "It looks similar to our school playground!",
            "Romance is definitely best on playgrounds! So atmospheric~",
        ],
        student6: [
            "My math homework is so difficult that my head hurts...",
            "I came outside to rest but I can't stop thinking about it.",
            "I don't know how to solve this problem.",
            "Are you good at math by any chance? I need help...",
        ],
        student7: [
            "Just finished PE class and I'm resting here!",
            "Soccer was really fun! Our team won!",
            "Getting fresh air like this after exercise feels so cool!",
            "Do you like sports too? Want to play soccer together?",
        ],
        student8: [
            "I'm having a meeting here about planning the school festival!",
            "This time we're really trying to do something innovative!",
            "We're also planning events to be held on the playground!",
            "Will you help us prepare for the festival? It'll be fun!",
        ],
        student9: [
            "I comforted a crying friend here earlier.",
            "Sometimes talking in quiet places like this makes your heart feel better.",
            "Everyone lives with their own worries.",
            "I think it's important to help each other.",
        ],
        student10: [
            "I was practicing singing here with friends!",
            "We're planning to perform in next week's talent show!",
            "Singing on the playground has good acoustics!",
            "Do you like singing too? Want to sing together?",
        ],
        student11: [
            "I brought my robot kit to assemble here.",
            "Testing outdoors helps me check if it works better.",
            "Programming here helps me concentrate more too.",
            "It's quiet and spacious, good for working.",
        ],
        student12: [
            "Are grades everything in life...?",
            "Everyone cries, laughs, and gets angry because of grades...",
            "Adults say to just go to a good university...",
            "Will I find the answers when I get to university...?",
        ],
        student13: [ // 추가된 부분: Kang Yeji
            "(...)",
            "(...go away.)",
        ],
        // 운동장 학생들 (student_w 시리즈) - 스포츠 테마
        student_w1: [
            "One two! One two!",
            "Exercise is the best!",
            "Let's run hard today too!",
        ],
        student_w2: [
            "Ah, I'm tired...",
            "Let me rest for a bit",
            "Need some water...",
        ],
        student_w3: [
            "Stretching is important!",
            "Injury prevention comes first",
            "Let's warm up our bodies",
        ],
        student_w4: [
            "How about today's game?",
            "Our team will win!",
            "Fighting!",
        ],
        student_w5: [
            "Follow the rules!",
            "Fair play is important",
            "Sportsmanship!",
        ],
        student_w6: [
            "Warm-up complete!",
            "Shall we start now?",
            "My body is warmed up!",
        ],
        student_w7: [
            "Goal!",
            "That was a great shot!",
            "I'll do better next time!",
        ],
        student_w8: [
            "Teamwork is important!",
            "Can't do it alone",
            "Let's go together!",
        ],
        student_w9: [
            "Final sprint!",
            "Don't give up!",
            "Until the end!",
        ],
        cat1: [
            "Meow~ *stretches under the sunlight*",
            "This is the perfect spot for sunbathing.",
            "It's fun watching students pass by.",
            "Purr purr... Taking a nap here is the best~",
        ],
        cat2: [
            "Meow... *looks at the playground*",
            "I want to run around in this wide space but I'm too tired.",
            "Sometimes when a ball rolls over, I play by tapping it with my paws.",
            "Humans are always busy... aren't they envious of cats?",
        ],
        // NPCs
        director: [
            "Hello, I'm Kim Taewon.",
            "It's rewarding to see students doing healthy activities on the playground.",
            "Physical fitness is important, but safety comes first.",
            "Always be careful and don't get hurt!",
        ],
        facil: [
            "Hello! I'm Vice Principal Lee Seongmin.",
            "You look even more energetic seeing you on the playground!",
            "I used to play soccer here often when I was a student.",
            "I hope you have a healthy school life!",
        ],
    },
};

// Boundaries 엔티티들의 대화 내용 (오브젝트들)
const frontBoundaryDialogues = {
    korean: {
        // 편지들 (spawnpoint에서 boundaries로 이동)
        letter1: [
            "(좌측 상단을 보면 기분과 에너지를 확인할 수 있어!)",
            "(기분이 좋아지는 방법에는 여러가지가 있어.)",
            "(그게 뭐냐면...)",
            "(...)",
            "(다음 내용은 지워져 있다.)",
        ],
        letter2: [
                "(사라얌!! 나 새롬쓰 ><)",
            "(지금 5교신데 수업 개길음 -ㅅ-)",
            "(배고파 죽겠는데 왜케 안끝나냐고!!! 오나전 짜증...)",
            "(요새도 다이어트함? 끝나고 나나분식 ㄱ?)",
            "(방금 이거 쓰면서 침고임...)",
            "(그럼 이따 가는거다?! 약속!!!!!)",
            "(-새롬쓰-)",
        ],
        letter3: [
            "(철학적 사고: 운동장에 대한 고찰)",
            "(이 넓은 공간에서 우리는 무엇을 배우는가?)",
            "(경쟁의 의미, 협력의 가치, 그리고 성장의 기쁨...)",
            "(하지만 진정한 깨달음은 학교 어딘가에 숨어있다.)",
            "(...)",
            "(이후 내용은 지워져 있다.)",
        ],
        ball: [
            "(운동장에 굴러다니는 피구공이다.)",
            "(표면이 약간 닳아있는 걸 보니 오래 사용된 것 같다.)",
            "(아직도 탄력이 좋아 보인다.)",
            "(누군가 체육시간에 사용하고 놓고 간 것 같다.)",
        ],
        nca: [
            "(...NCA? 뉴콘텐츠아카데미?)",
            "(와! 이게 그 유명한 신기술 콘텐츠 분야 학원이야!)",
            "(게임, 웹툰, 애니메이션... 모든 걸 배울 수 있다더니!)",
            "(...진짜 멋진 곳이네...?!?)",
            "(미래 크리에이터가 되고 싶다면 여기가 답인 것 같아!)",
        ],
        game: [
            "오래된 게임기가 놓여있다.",
            "화면에는 'RETRO ARCADE'라는 글씨가 깜빡이고 있다.",
        ],
        ants: [
            "(개미들이 무언가를 열심히 나르고 있다.)",
            "(여왕개미는 어디 있지?)",
        ],
        // tamagotchi: [ // 제거 - 직접 처리함
        //     "귀여운 다마고치가 있다!",
        //     "화면에 작은 애완동물이 움직이고 있다.",
        // ],
        // 자동차들
        car1: [
            "(깔끔하게 관리된 것을 보니 교감선생님 차인 것 같다.)",
        ],
        car2: [
            "(뭔가 학년부장 선생님 차인 것 같다.)",
            "(뒷자석에 카시트가 있다.)"
        ],
        car3: [
            "(세 번째 자동차다.)",
            "(후면에 학교 스티커가 붙어있다.)",
            "(아마 교무실 선생님들이 공용으로 사용하는 차량인 것 같다.)",
            "(외부 업무나 출장 때 이용하는 것 같다.)",
        ],
        car4: [
            "(네 번째 자동차가 주차되어 있다.)",
            "(이 차는 좀 더 실용적이고 경제적이어 보인다.)",
            "(젊은 선생님이 개인적으로 사용하는 차량 같다.)",
            "(연비가 좋을 것 같은 작은 차다.)",
        ],
        // 기타 시설들
        pot: [
            "(학교 정문 근처에 놓인 화분이다.)",
            "(예쁜 꽃들이 심어져 있어서 학교 입구를 장식하고 있다.)",
            "(누군가 정성스럽게 물을 주고 관리하는 것 같다.)",
            "(방문객들에게 좋은 첫인상을 주는 역할을 하고 있다.)",
        ],
        sink: [
            "(운동장 옆에 설치된 식수대다.)",
            "(체육시간이나 운동 후에 목이 마를 때 유용하다.)",
            "(차가운 물이 나와서 더위를 식히기 좋다.)",
            "(학생들이 자주 이용하는 것 같다.)",
        ],
        goal_post1: [
            "(운동장 한쪽 끝에 설치된 축구 골대다.)",
            "(체육시간과 점심시간에 많이 사용된다.)",
            "(네트가 약간 해져있지만 아직 사용 가능하다.)",
            "(많은 학생들의 추억이 담긴 곳이다.)",
        ],
        goal_post2: [
            "(운동장 반대편에 있는 또 다른 골대다.)",
            "(이쪽 골대는 상태가 더 좋아 보인다.)",
            "(최근에 보수를 한 것 같다.)",
            "(축구할 때 이 골대를 더 선호할 것 같다.)",
        ],
        badminton: [
            "(운동장에 떨어진 배드민턴 라켓이다.)",
            "(누군가 체육시간에 사용하고 놓고 간 것 같다.)",
        ],
        main_entrance: [
            "(은하여자고등학교의 정문이다.)",
            "(학교의 얼굴 역할을 하는 중요한 곳이다.)",
            "(매일 아침 많은 학생들이 이곳을 통과한다.)",
            "(수업시간에는 보안을 위해 출입이 제한된다.)",
        ],
        front_gate: [
            "(학교 앞문이다.)",
            "(정문보다는 작지만 여전히 중요한 출입구다.)",
            "(주로 교직원들이 이용하는 것 같다.)",
            "(비상시에 사용되는 보조 출입구 역할을 한다.)",
        ],
        line_machine: [
            "(운동장 라인을 그리는 페인터 기계다.)",
            "(체육대회나 운동회 준비 때 사용한다.)",
            "(분필 냄새가 나는거 같다.)",
        ],
        door_garage: [
            "(학교 차고의 문이다.)",
            "(학교 차량들과 각종 장비가 보관되어 있다.)",
            "(일반 학생들은 출입할 수 없는 곳이다.)",
            "(관리실 열쇠로만 열 수 있다.)",
        ],
        timecapsule: [
            "(...이건 뭐지...?)",
            "(무지 오래된 상자 같다.)",
            "(빛 바랜 사진들과 물건들이 있는걸 보니...)",
            "(타임캡슐 같은데...?)",
            "(이게 왜 여기 놓여있지...?)",
        ],
    },
    english: {
        // 편지들
        letter1: [
            "(Sara!! It's me, Saerom ><)",
            "(I saw you during PE class on the playground today and you looked so cool!)",
            "(You run really fast! I'm so jealous ㅠㅠ)",
            "(I almost tripped while running... so embarrassing!)",
            "(Let's practice together next time! I want to get faster too!)",
            "(-Saerom-)",
        ],
        letter2: [
            "(Read this alone)",
            "(To you who found this letter, I'll tell you a secret about the playground...)",
            "(Something appears on the playground after midnight.)",
            "(Don't ask why... just be careful.)",
            "(Especially never go behind the goal posts...!)",
        ],
        letter3: [
            "(Philosophical Thoughts: Reflections on the Playground)",
            "(What do we learn in this vast space?)",
            "(The meaning of competition, the value of cooperation, and the joy of growth...)",
            "(But true enlightenment is hidden somewhere here.)",
            "(In that space behind the goal posts...)",
            "(...)",
            "(The rest of the content has been erased.)",
        ],
        ball: [
            "(A dodgeball rolling around on the playground.)",
            "(The surface looks a bit worn, seems like it's been used for a long time.)",
            "(It still looks bouncy though.)",
            "(Someone probably used it during PE class and left it behind.)",
        ],
        nca: [
            "(...NCA? New Contents Academy?)",
            "(Wow! This is that famous new technology content academy!)",
            "(Games, webtoons, animation... you can learn everything there!)",
            "(...It really looks like an amazing place...?!?)",
            "(If you want to become a future creator, this seems like the answer!)",
        ],
        game: [
            "There's an old game machine here.",
            "The screen shows 'RETRO ARCADE' blinking.",
            "Would you like to play?",
            {
                type: "choice",
                question: "Would you like to play?",
                choices: [
                    {
                        text: "Yes",
                        action: "open_link",
                        url: "https://www.naver.com"
                    },
                    {
                        text: "No",
                        action: "cancel"
                    }
                ]
            }
        ],
        ants: [
            "(Ants are busily carrying something.)",
            "(Where is the queen ant?)",
        ],
        // tamagotchi: [ // 제거 - 직접 처리함
        //     "There's a cute Tamagotchi here!",
        //     "A small pet is moving on the screen.",
        // ],
        cat1: [
            "Meow~",
            "(Stretches lazily)",
            "(Sunbathing)"
        ],
        cat2: [
            "Mya~",
        ],
        // 자동차들
        car1: [
            "(A car parked in front of the school main gate.)",
            "(Looking at how well-maintained it is, it seems to be a teacher's car.)",
            "(Looking at the license plate, it's a Seoul vehicle.)",
            "(There's probably sports equipment in the trunk.)",
            "(Probably the PE teacher's car.)",
        ],
        car2: [
            "(The second car is parked here.)",
            "(This car looks a bit more luxurious.)",
            "(Probably belongs to the principal or vice principal.)",
            "(The windows are kept clean and well-maintained.)",
            "(Looks like a vehicle used for official school business.)",
        ],
        car3: [
            "(The third car.)",
            "(There's a school sticker on the back.)",
            "(Seems like a vehicle shared by teachers in the faculty office.)",
            "(Probably used for external business or official trips.)",
        ],
        car4: [
            "(The fourth car is parked here.)",
            "(This car looks more practical and economical.)",
            "(Seems like a young teacher's personal vehicle.)",
            "(It's a small car that probably has good fuel efficiency.)",
        ],
        // 기타 시설들
        pot: [
            "(A flower pot placed near the school main gate.)",
            "(Beautiful flowers are planted to decorate the school entrance.)",
            "(Someone seems to be carefully watering and maintaining it.)",
            "(It serves to give visitors a good first impression.)",
        ],
        sink: [
            "(A water fountain installed next to the playground.)",
            "(Useful when you're thirsty after PE class or exercise.)",
            "(Cold water comes out, good for cooling down from the heat.)",
            "(Students seem to use it frequently.)",
        ],
        goal_post1: [
            "(A soccer goal post installed at one end of the playground.)",
            "(Used a lot during PE class and lunch time.)",
            "(The net is a bit worn but still usable.)",
            "(A place filled with many students' memories.)",
        ],
        goal_post2: [
            "(Another goal post on the opposite side of the playground.)",
            "(This goal post looks in better condition.)",
            "(Seems like it was recently repaired.)",
            "(Students probably prefer this goal post when playing soccer.)",
        ],
        badminton: [
            "(A badminton racket dropped on the playground.)",
            "(Someone probably used it during PE class and left it behind.)",
            "(The racket looks to be in good condition.)",
            "(Should take it to the sports storage room.)",
        ],
        main_entrance: [
            "(The main gate of Eunha Girls' High School.)",
            "(An important place that serves as the face of the school.)",
            "(Many students pass through here every morning.)",
            "(Entry is restricted during class hours for security.)",
        ],
        front_gate: [
            "(The front gate of the school.)",
            "(Smaller than the main gate but still an important entrance.)",
            "(Mainly seems to be used by faculty and staff.)",
            "(Serves as an auxiliary entrance used in emergencies.)",
        ],
        line_machine: [
            "(A line painter machine for drawing playground lines.)",
            "(Used when preparing for sports festivals or athletic meets.)",
            "(Can draw precise lines with white paint.)",
            "(Seems to be currently stored in the warehouse.)",
        ],
        door_garage: [
            "(The door to the school garage.)",
            "(School vehicles and various equipment are stored here.)",
            "(Regular students cannot enter this place.)",
            "(Can only be opened with the maintenance office key.)",
        ],
        timecapsule: [
            "(...what is this...?)",
            "(It looks like a really old box.)",
            "(Looking at the faded photos and items inside...)",
            "(It seems like a time capsule...?)",
            "(Why is it placed here...?)",
        ],
    },
};

const frontDialogues = {
    korean: frontSpawnpointDialogues.korean,
    english: frontSpawnpointDialogues.english,
    names: frontNpcNames,
};

const frontObjectDialogues = {
    korean: frontBoundaryDialogues.korean,
    english: frontBoundaryDialogues.english,
    names: frontObjectNames,
};

export { frontDialogues, frontObjectDialogues };
export default { frontDialogues, frontObjectDialogues };

