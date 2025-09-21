/**
 * Class1 씬의 대화 데이터
 * 교실에서의 학생들과 선생님, 교실 오브젝트들과의 상호작용 대화
 */

const locales = {
    KO: "korean",
    EN: "english",
};

export const class1Dialogue = {
    "teacher": {
        [locales.KO]: {
            speakerName: "선생님",
            content: ["안녕하세요!", "오늘 수업은 어땠나요?", "궁금한 것이 있으면 언제든 물어보세요."],
        },
        [locales.EN]: {
            speakerName: "Teacher",
            content: ["Hello there!", "How was today's class?", "Feel free to ask me anything if you have questions."],
        },
    },
    "student1": {
        [locales.KO]: {
            speakerName: "학생1",
            content: ["안녕!", "오늘 수업 정말 재미있었어.", "같이 공부할래?"],
        },
        [locales.EN]: {
            speakerName: "Student 1",
            content: ["Hi there!", "Today's class was really interesting.", "Want to study together?"],
        },
    },
    "student2": {
        [locales.KO]: {
            speakerName: "학생2",
            content: ["어... 안녕...", "나는 조용히 공부하는 걸 좋아해.", "방해하지 말아줘."],
        },
        [locales.EN]: {
            speakerName: "Student 2",
            content: ["Uh... hello...", "I prefer studying quietly.", "Please don't disturb me."],
        },
    },
    "student3": {
        [locales.KO]: {
            speakerName: "학생3",
            content: ["야호!", "학교 끝나면 뭐 할래?", "같이 놀자!"],
        },
        [locales.EN]: {
            speakerName: "Student 3",
            content: ["Hey!", "What are you going to do after school?", "Let's hang out!"],
        },
    },
    "blackboard": {
        [locales.KO]: {
            speakerName: "칠판",
            content: ["칠판에 오늘의 수업 내용이 적혀있다.", "수학 공식들이 빼곡히 써져있다."],
        },
        [locales.EN]: {
            speakerName: "Blackboard",
            content: ["Today's lesson content is written on the blackboard.", "Mathematical formulas are densely written."],
        },
    },
    "desk1": {
        [locales.KO]: {
            speakerName: "책상",
            content: ["깔끔하게 정리된 책상이다.", "교과서와 노트가 가지런히 놓여있다."],
        },
        [locales.EN]: {
            speakerName: "Desk",
            content: ["This is a neatly organized desk.", "Textbooks and notebooks are arranged orderly."],
        },
    },
    "desk2": {
        [locales.KO]: {
            speakerName: "책상",
            content: ["어수선한 책상이다.", "연필, 지우개, 메모지가 흩어져 있다."],
        },
        [locales.EN]: {
            speakerName: "Desk",
            content: ["This is a messy desk.", "Pencils, erasers, and memo papers are scattered around."],
        },
    },
    "bookshelf": {
        [locales.KO]: {
            speakerName: "책장",
            content: ["다양한 교과서들이 꽂혀있다.", "수학, 과학, 국어... 모든 과목이 있다."],
        },
        [locales.EN]: {
            speakerName: "Bookshelf",
            content: ["Various textbooks are lined up.", "Math, science, language arts... all subjects are here."],
        },
    },
    "projector": {
        [locales.KO]: {
            speakerName: "프로젝터",
            content: ["현대적인 프로젝터다.", "수업 시간에 사용하는 것 같다."],
        },
        [locales.EN]: {
            speakerName: "Projector",
            content: ["This is a modern projector.", "It seems to be used during classes."],
        },
    },
};

// 오브젝트 대화 내용 (boundaries 레이어의 student들)
export const objectDialogues = {
    korean: {
        student_head: ["얘들아... 쉬는시간이라도 좀 조용히하자...", "...듣고 있니...?"],
        student50: ["아니... 애프터스쿨노래 말고 샤이니 틀어달라고 ㅡㅡ"],
        student55: ["디바 디바 디디디 디바!!!"],
        student53: ["아 소녀시대 노래 틀어줘!!!"],
        student54: ["와 ㅁㅊ... 춤선 미쳤다;;"],
        student55: ["디바 디바 디디디 디바!!!"],
        student56: ["아 공부하고 싶은데...", "다 틀렸네 쟤네땜에...", "아 교실 혼자 쓰냐고...!"],
        student57: ["AFTERSCHOOL-DIVA는 명곡이야!!!", "언젠가 이 노래를 추억할 날이 오겠지..."],
        student58: ["(친구에게 말하고 있다.)", "야 너 아까 쪽지시험 몇 점 맞았어?"],
        student59: ["(친구에게 말하고 있다.)", "나 다 찍어서 40점 맞음..."],
        student60: ["아 다 때려치고 알바나 하고 싶다..."],
        student61: ["(그림 그리는 중)", "...", "창작에 골몰하는 중이니까 저리 가주겠니?"],
        student62: ["사는게 되다..."],
        student63: ["하 다 때려치고 유학이나 갈까..."],
        student64: ["얌 >_< 나 오늘 옵빠랑 데이트하기로 함!", "고데기 잘됐나 봐줄래?!"],
        student65: ["(친구와 얘기하고 있다.)", "난 슈주 팬임. 님은?"],
        student66: ["(친구와 얘기하고 있다.)","님 누구 팬임?"],
        student67: ["아... 왜 이렇게 시끄럽지?", "조용히 좀 해줘..."],
        toiletpaper: ["어...! 아까 누가 화장실에서 휴지를 찾던 것 같다.", "갖다줘야겠다."],
        tvset: ["(AFTERSCHOOL-DIVA가 흘러나오고 있다.)", "(... 원래 저런 걸 틀라고 놓은 tv가 아닐텐데.)"],
        fire_extinguisher: ["(자나깨나 불조심!)"],
        broomstick: ["(교실을 청소할 때 쓰이는 싸리빗자루이다.)"],
        mop: ["(교실을 청소할 때 쓰이는 마포걸레이다.)"],
        sofa: ["(잠깐 쉴 수 있는 미니소파이다.)"],
        mirror: ["(외모를 체크할 수 있는 거울이다.)"],
        teacher_desk: ["(교사용 교과서와 종이 놓여있다.)"],
        computer_desk: ["(학생들이 컴퓨터로 AFTERSCHOOL-DIVA를 틀어놓았다.)"],
        locker: ["(책이나 물건을 넣어놓을 수 있는 사물함이다.)"],
    },
    english: {
        student_head: ["Guys... let's be quiet even during break time...", "...are you listening...?"],
        student50: ["No... play SHINee instead of After School songs ㅡㅡ"],
        student55: ["Diva Diva Di-di-di Diva!!!"],
        student53: ["Oh play Girls' Generation songs!!!"],
        student54: ["Wow crazy... those dance moves are insane;;"],
        student55: ["Diva Diva Di-di-di Diva!!!"],
        student56: ["Ah I want to study...", "It's all wrong because of them...", "Do you own this classroom alone...!"],
        student57: ["AFTERSCHOOL-DIVA is a masterpiece!!!", "Someday there will come a day to reminisce about this song..."],
        student58: ["(Talking to a friend)", "Hey, how many points did you get on the quiz earlier?"],
        student59: ["(Talking to a friend)", "I guessed everything and got 40 points..."],
        student60: ["Ah I want to quit everything and just work part-time..."],
        student61: ["(Drawing)", "...", "I'm absorbed in creating, so please go away?"],
        student62: ["Life is tough..."],
        student63: ["Sigh, should I just quit everything and go study abroad..."],
        student64: ["Yay >_< I'm going on a date with oppa today!", "Can you check if my makeup looks good?!"],
        student65: ["(Talking to a friend)", "I'm a Super Junior fan. What about you?"],
        student66: ["(Talking to a friend)", "Who are you a fan of?"],
        student67: ["Ah... why is it so noisy?", "Please be quiet..."],
        toiletpaper: ["Oh...! I think someone was looking for toilet paper in the bathroom earlier.", "I should bring it to them."],
        tvset: ["(AFTERSCHOOL-DIVA is playing.)", "(... This TV wasn't meant for playing such things.)"],
        fire_extinguisher: ["(Fire safety always!)"],
        broomstick: ["(A straw broom used for cleaning the classroom.)"],
        mop: ["(A mop used for cleaning the classroom.)"],
        sofa: ["(A mini sofa where you can rest for a while.)"],
        mirror: ["(A mirror where you can check your appearance.)"],
        teacher_desk: ["(Teacher's textbooks and papers are placed here.)"],
        computer_desk: ["(Students have AFTERSCHOOL-DIVA playing on the computer.)"],
        locker: ["(A locker where you can store books or belongings.)"],
    },
};

// NPC 이름 정의
export const npcNames = {
    korean: {
        student_head: "반장",
        student50: "권혜진",
        student53: "권유리",
        student54: "김예솔",
        student55: "최민정", 
        student56: "강예인",
        student57: "신효성",
        student58: "손민재",
        student59: "김소현",
        student60: "고아름",
        student61: "신소연",
        student62: "이보람",
        student63: "공소정",
        student64: "서혜지",
        student65: "김다은",
        student66: "한수진",
        student67: "박지민",
    },
    english: {
        student_head: "Class President",
        student50: "Kwon Hye-jin",
        student53: "Kwon Yu-ri",
        student54: "Kim Ye-sol",
        student55: "Choi Min-jung",
        student56: "Kang Ye-in",
        student57: "Shin Hyo-sung",
        student58: "Son Min-jae",
        student59: "Kim So-hyun",
        student60: "Go A-reum",
        student61: "Shin So-yeon",
        student62: "Lee Bo-ram",
        student63: "Gong So-jung",
        student64: "Seo Hye-ji",
        student65: "Kim Da-eun",
        student66: "Han Su-jin",
        student67: "Park Ji-min",
    },
};

// 오브젝트 이름 정의
export const objectNames = {
    korean: {
        toiletpaper: "휴지",
        tvset: "tv장",
        fire_extinguisher: "소화기",
        broomstick: "빗자루",
        mop: "마포대걸레",
        sofa: "소파",
        mirror: "거울",
        teacher_desk: "교탁",
        computer_desk: "컴퓨터 책상",
        locker: "사물함",
    },
    english: {
        toiletpaper: "Toilet Paper",
        tvset: "TV Set",
        fire_extinguisher: "Fire Extinguisher",
        broomstick: "Broomstick",
        mop: "Mop",
        sofa: "Sofa",
        mirror: "Mirror",
        teacher_desk: "Teacher's Desk",
        computer_desk: "Computer Desk",
        locker: "Locker",
    },
};
