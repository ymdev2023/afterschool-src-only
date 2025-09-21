// health.json에 있는 오브젝트들에 대응하는 대화 내용
// 실제 맵에 있는 오브젝트들: door_to_second, sofa, beds, computer_desk, drawer

const npcNames = {
    korean: {
 
    },
    english: {
  
    },
};

const objectNames = {
    korean: {
        door_to_second: "2층으로 가는 문",
        sofa: "박혜인",
        bed1: "이채원", 
        bed2: "양호실 침대",
        bed3: "곽소희",
        bed4: "양호실 침대",
        computer_desk: "컴퓨터 책상",
        drawer: "서랍장",
               student30: "문동은",
        nurse: "양호선생님",
        teacher: "보건교사",
    },
    english: {
        door_to_second: "Door to 2F",
        sofa: "Park Hyein",
        bed1: "Lee Chaewon",
        bed2: "Bed2",
        bed3: "Kwak Sohee",
        bed4: "Bed4",
        computer_desk: "Computer Desk", 
        drawer: "Drawer",
              student30: "Moon Dongeun",
        nurse: "Nurse Teacher",
        teacher: "Health Teacher",
    },
};

const korean = {

};

const english = {

};

const objectDialogues = {
    korean: {

    student30: [
        "(보건교사와 말하고 있다.)",
        "과산화수소수... 주실 수 있을까요?",
        "블라우스에 뭐가 묻어서요...",
        "주시면 제가 할게요...",
    ],

    teacher: [
        "(옆 친구를 보고 있다.)",
        "과산화수소수 달라고?",
        "...어쩌다 이랬어...?",
        "조심해서 사용하렴.",
    ],
      
        sofa: [
            "양호선생님을 기다리고 있어.",
            "머리가 조금 아픈데 괜찮을 거야.",
            "아까 체육시간에 살짝 넘어졌거든...",
            "걱정하지마! 금방 나을거야!",
        ],
        bed1: [
            "...쉿...!",
            "수업 듣기 싫어서 숨어있으니까 조용히해.",
        ],
        bed2: [
            "(지금은 비어있다.)",
        ],
        bed3: [
            "아...급식 너무 급하게 먹었나봐...",
            "ㅈㄴ배아파...",
        ],
        bed4: [
            "(지금은 비어있다.)",
        ],
        computer_desk: [
            "(양호선생님이 사용하시는 책상인듯 하다.)",
        ],
        drawer: [
            "(서랍장입니다.)",
            "(의료용품들이 보관되어 있다.)",
            "(체온계, 붕대 등이 들어있을 것 같다.)",
            "(함부로 열어보면 안 될 것 같다.)",
        ],
    },
    english: {
     
    student30: [
        "(Talking to the health teacher.)",
        "Could you give me some hydrogen peroxide?",
        "Something got on my blouse...",
        "I can do it myself if you give it to me...",
    ],
  
    teacher: [
        "(Looking at the student next to her.)",
        "You want hydrogen peroxide?",
        "...How did this happen...?",
        "Please use it carefully.",
    ],
        sofa: [
            "I'm waiting for the nurse.",
            "My head hurts a little bit but I'll be fine.",
            "I fell down a bit during PE class earlier...",
            "Don't worry! I'll get better soon!",
        ],
        bed1: [
            "...Shh...!",
            "I'm hiding because I don't want to attend class, so be quiet.",
        ],
        bed2: [
            "Nurse's office bed",
            "(It's empty now.)",
        ],
        bed3: [
            "Ah... I think I ate lunch too quickly...",
            "My stomach hurts so freaking much...",
        ],
        bed4: [
            "Nurse's office bed",
            "(It's empty now.)",
        ],
        computer_desk: [
            "Computer Desk",
            "(This seems to be the desk used by the nurse.)",
        ],
        drawer: [
            "(This is a drawer.)",
            "(Medical supplies are stored here.)",
            "(It probably contains thermometers, bandages, etc.)",
        ],
    },
};

// default export 
const healthDialogue = {
    npcNames,
    objectNames,
    korean,
    english,
    objectDialogues
};

export default healthDialogue;