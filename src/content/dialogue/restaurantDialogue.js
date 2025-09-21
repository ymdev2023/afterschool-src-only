// restaurantDialogue.js - restaurant.json의 모든 엔티티 대화 내용
// garageDialogue.js와 frontDialogue.js 형식을 참고하여 작성

const restaurantObjectNames = {
    korean: {
        // Spawnpoint 엔티티들 (학생들)
        student23: "김승혜",
        student24: "박승희",
        student25: "김혜정",
        student26: "오승희",
        student27: "최사랑",
        // 편지/쪽지
        letter_food: "쪽지",
        // Boundaries 엔티티들
        food_counter: "급식지도사",
    },
    english: {
        // Spawnpoint 엔티티들 (학생들)
        student23: "Kim Seunghye",
        student24: "Park Seunghee",
        student25: "Kim Hyejeong",
        student26: "Oh Seunghee",
        student27: "Choi Sarang",
        // 편지/쪽지
        letter_food: "Note",
        // Boundaries 엔티티들
        food_counter: "Cafeteria Staff",
    },
};

const restaurantDialogues = {
    korean: {
        // Spawnpoint 엔티티들 (학생들)
        student23: [
            "오늘 급식 진짜 맛있었지 모야 >< !!",
            "김치, 시금치, 감자베이컨 샐러드,",
            "생선가스, 그리고 어묵국까지...!",
            "완전 내스타일이야!!!!!",
            "내일은 급식 뭐나올까?!",
            "설렌다!!!!! 이맛에 학교다니지!!!",
        ],
        student24: [
            "...우물우물...",
            "밥먹는데 말시키지마...",
        ],
        student25: [
            "...시험범위 생각중이니까 말 걸지마.",
        ],
        student26: [
            "친구 기다리느라 아직 안먹고 있어.",
            "의리를 지켜야지!!!",
        ],
        student27: [
            "얼른 먹고 애들이랑 놀아야지!!!",
        ],
        // 편지/쪽지
        letter_food: [
            "(야 유하은 열라 재수없지 않냐?)",
            "(맨날 구령대 쪽에 있던데...)",
            "(말 걸어도 대꾸도 제대로 안하고...)",
            "(몰라 그냥 음침해)",
            "(...)",
            "(유하은이 누구지?)",
        ],
        // Boundaries 엔티티들
        food_counter: [
            "맛있게 먹어 학생!!!!",
            "반찬 더 필요하면 말하고!!",
        ],
    },
    english: {
        // Spawnpoint 엔티티들 (학생들)
        student23: [
            "Today's lunch was really delicious >< !!",
            "Kimchi, spinach, potato bacon salad,",
            "fish cutlet, and fish cake soup...!",
            "It's totally my style!!!!!",
            "What will tomorrow's lunch be?!",
            "I'm so excited!!!!! This is why I come to school!!!",
        ],
        student24: [
            "...munch munch...",
            "Don't talk to me while I'm eating...",
        ],
        student25: [
            "...I'm thinking, so don't talk to me.",
        ],
        student26: [
            "I'm waiting for my friend, so I haven't eaten yet.",
            "I have to keep my loyalty!!!",
        ],
        student27: [
            "I need to eat quickly and play with my friends!!!",
        ],
        // 편지/쪽지
        letter_food: [
            "(Hey, isn't Yoo Ha-eun really annoying?)",
            "(She's always near the assembly area...)",
            "(Even when you talk to her, she doesn't respond properly...)",
            "(I don't know, she's just gloomy)",
            "(...)",
            "(Who is Yoo Ha-eun?)",
        ],
        // Boundaries 엔티티들
        food_counter: [
            "Enjoy your meal, student!!!!",
            "Let me know if you need more side dishes!!",
        ],
    },
};

// Export
export const restaurantObjectDialogues = restaurantDialogues;
export { restaurantObjectNames, restaurantDialogues };
