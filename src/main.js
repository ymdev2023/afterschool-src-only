import k from "./kaboomContext.js";
// import mainMenu from "./scenes/temp/mainMenu.temp/index.js"; // 사용하지 않음
import title from "./scenes/title.js";
import front from "./scenes/front.js";
import schoolfront from "./scenes/schoolfront.js";
import first from "./scenes/first.js";
import restroom from "./scenes/restroom.js";
import restaurant from "./scenes/restaurant.js";
import second from "./scenes/second.js";
import second2 from "./scenes/second2.js";
import schoolsecond from "./scenes/schoolsecond.js";
import garage from "./scenes/garage.js"; // 추가된 부분: garage 씬 import
import health from "./scenes/health.js"; // 추가된 부분: health 씬 import
import class1 from "./scenes/class1.js"; // 추가된 부분: class1 씬 import
import class2 from "./scenes/class2.js"; // 추가된 부분: class2 씬 import
import intro from "./scenes/intro.js";
// import prologue from "./scenes/prologue.js"; // 주석 처리: prologue_short 사용
import prologueShort from "./scenes/prologue_short.js";
// import house from "./scenes/temp/house.js"; // 수정된 부분: 사용하지 않으므로 주석 처리
// import dungeon from "./scenes/temp/dungeon.js"; // 수정된 부분: 사용하지 않으므로 주석 처리
import credits from "./scenes/credits.js";
import { tutorial } from "./scenes/tutorial.js";
import { AutoSaveManager } from "./systems/autoSaveManager.js";
import { gameState } from "./state/stateManagers.js";
import { gamepadManager } from "./systems/gamepadManager.js";
import { audioManager } from "./utils.js";

k.loadFont("galmuri", "assets/fonts/galmuri.ttf"); // 수정된 부분: fonts 폴더로 이동
k.loadFont("gameboy", "assets/fonts/gb.ttf"); // 수정된 부분: fonts 폴더로 이동
k.loadFont("bitbit", "assets/fonts/bitbit.ttf"); // 수정된 부분: fonts 폴더로 이동
k.loadFont("stardust", "assets/fonts/stardust.ttf"); // 수정된 부분: fonts 폴더로 이동
k.loadFont("neodgm", "assets/fonts/neodgm.ttf"); // 수정된 부분: fonts 폴더로 이동
k.loadSound("title-bgm", "assets/sounds/title-bgm.mp3"); // 타이틀 씬 BGM
k.loadSound("tutorial-bgm", "assets/sounds/tutorial-bgm.mp3"); // 튜토리얼 씬 BGM
k.loadSound("front-bgm", "assets/sounds/front-bgm.mp3"); // front 씬 BGM
k.loadSound("first-bgm", "assets/sounds/first-bgm.mp3"); // first 씬 BGM
k.loadSound("second-bgm", "assets/sounds/second-bgm.mp3"); // second 씬 BGM
k.loadSound("garage-bgm", "assets/sounds/garage-bgm.mp3"); // garage 씬 BGM
k.loadSound("health-bgm", "assets/sounds/health-bgm.mp3"); // health 씬 BGM (second BGM과 동일하게 설정 가능)
k.loadSound("restroom-bgm", "assets/sounds/restroom-bgm.mp3"); // restroom 씬 BGM
k.loadSound("restaurant-bgm", "assets/sounds/restaurant-bgm.mp3"); // restaurant 씬 BGM
k.loadSound("class1-bgm", "assets/sounds/class1-bgm.mp3"); // class1 씬 BGM (파일명은 class1-bgm.mp3 사용)
k.loadSound("class2-bgm", "assets/sounds/class2-bgm.mp3"); // class2 씬 BGM
k.loadSound("confirm-beep-sfx", "assets/sounds/confirmbeep-sfx.wav");
k.loadSound("boop-sfx", "assets/sounds/boop-sfx.wav");
k.loadSound("coin-sfx", "assets/sounds/coin-sfx.mp3");
k.loadSound("bubble-sfx", "assets/sounds/bubble-sfx.mp3");
k.loadSound("ghost-sfx", "assets/sounds/ghost-sfx.wav"); // 추가된 부분
k.loadSound("talk-sfx", "assets/sounds/talk-sfx.mp3"); // 추가된 부분: 타이핑 효과음
k.loadSound("text-sfx", "assets/sounds/text-sfx.wav"); // 추가된 부분: 텍스트 효과음
k.loadSound("kick-sfx", "assets/sounds/kick-sfx.mp3"); // 추가된 부분: 킥 효과음
k.loadSound("cat-sfx", "assets/sounds/cat-sfx.mp3"); // 추가된 부분: 고양이 효과음
k.loadSound("tutorial-sfx", "assets/sounds/tutorial-sfx.mp3"); // 추가된 부분: 튜토리얼 시작 효과음
k.loadSound("door-open-sfx", "assets/sounds/door-open-sfx.mp3"); // 문 열림 효과음
k.loadSound("door-close-sfx", "assets/sounds/door-close-sfx.mp3"); // 문 닫힘 효과음
k.loadSound("gee-sfx", "assets/sounds/gee-sfx.mp3"); // mp3 플레이어 효과음 (소녀시대 - Gee)
k.loadSound("drink-sfx", "assets/sounds/drink-sfx.mp3"); // 자판기 음료 효과음
k.loadSound("cute-sfx", "assets/sounds/cute-sfx.mp3"); // 카메라/귀요미 효과음

// 타이틀 화면 에셋 로드 (작은 이미지들만)
k.loadSprite("title_bg", "assets/images/title_img.png");
// 패턴 배경 스프라이트 로드
k.loadSprite("pattern", "assets/images/pattern.png");
k.loadSprite("pattern_purple", "assets/images/pattern_purple.png");
k.loadSprite("pattern_lightgreen", "assets/images/pattern_lightgreen.png");
k.loadSprite("pattern_pink", "assets/images/pattern_pink.png");
k.loadSprite("pattern_skyblue", "assets/images/pattern_skyblue.png");
// title.js에서 순수 JavaScript Canvas로 처리하므로 큰 이미지들은 제거
// k.loadSprite("title_layer1", "assets/images/titles/title_01_bg.png"); // 2563x1280 - 제거
// k.loadSprite("title_layer2", "assets/images/titles/title_02_star.png"); // 제거  
// k.loadSprite("title_layer3", "assets/images/titles/title_03_mini.png"); // 제거
// k.loadSprite("title_layer4", "assets/images/titles/title_04_large.png"); // 제거
// k.loadSprite("title_layer5", "assets/images/titles/title_05_characters.png"); // 제거
// k.loadSprite("title_button_normal", "assets/images/titles/title_button_notpressed.png"); // 제거
// k.loadSprite("title_button_pressed", "assets/images/titles/title_button_pressed.png"); // 제거

// 추가된 부분: Animalese 문자별 오디오 파일들 로드
const animalese_letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
];

animalese_letters.forEach((letter) => {
    k.loadSound(`animalese-${letter}`, `assets/sounds/animalese/${letter}.wav`);
});

// Animalese digraphs 로드
const animalese_digraphs = ["ch", "sh", "ph", "th", "wh"];
animalese_digraphs.forEach((digraph) => {
    k.loadSound(
        `animalese-${digraph}`,
        `assets/sounds/animalese/${digraph}.wav`
    );
});

// Animalese 특수문자용 오디오
k.loadSound("animalese-bebebese", "assets/sounds/animalese/bebebese_slow.wav");

// 추가된 부분: 말풍선 스프라이트 로드 (임시로 제거 - 404 에러 방지)
// k.loadSprite("speech-bubble", "assets/speech_bubble_animation-11x11.png");

// 추가된 부분: 퀘스트 느낌표 스프라이트 로드
k.loadSprite("quest-exclamation", "assets/tiny_speech_indicators-11x11.png", {
    sliceX: 8, // 수정된 부분: 가로로 8개 프레임
    sliceY: 1, // 수정된 부분: 세로로 1줄
    // 각 프레임별 감정 상태 매핑:
    // 0: 퀘스트 있는 상태
    // 1: 매우 만족한 상태
    // 2: 그냥 그런 상태
    // 3: 슬픈상태
    // 4: 화남
    // 5: 언짢음
    // 6: 만족한 상태
    // 7: 빈 말풍선
});

// 튜토리얼용 느낌표 스프라이트 (단일 이미지)
k.loadSprite("exclamation", "assets/exclamation-7x8.png");
k.loadSprite(
    "speech-bubble-animation",
    "assets/speech_bubble_animation-11x11.png"
);
k.loadSprite(
    "tiny-speech-indicators",
    "assets/tiny_speech_indicators-11x11.png",
    {
        sliceX: 8, // 수정된 부분: 8개 프레임으로 나누기
        sliceY: 1, // 1줄
    }
);

// 튜토리얼용 추가 스프라이트들
k.loadSprite("tile", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "tile": 1, // 벽 타일
    },
});

// 기본 assets 스프라이트 (레거시 호환성을 위해)
k.loadSprite("assets", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
});

// UI 상태바 스프라이트 로드 (기분/체력)
k.loadSprite("ui-heart-bar", "assets/images/ui_heart_bar.png", {
    sliceX: 1,  // 가로 1등분
    sliceY: 9, // 세로 9등분으로 변경 (10 → 9) - 아래 픽셀 문제 해결
});

k.loadSprite("ui-hp-bar", "assets/images/ui_hp_bar.png", {
    sliceX: 1,  // 가로 1등분
    sliceY: 9, // 세로 9등분으로 변경 (10 → 9) - 아래 픽셀 문제 해결
});

k.loadSprite("ui-icon", "assets/images/ui_icon.png", {
    sliceX: 1,  // 가로 1등분
    sliceY: 2,  // 세로 2등분 (0=heart, 1=hp)
});

k.loadSprite("player", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "player": 1300, // 플레이어 스프라이트
    },
});
k.loadSprite("friend", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "friend": 1301, // 친구 스프라이트
    },
});



// front.js를 위한 front-assets 스프라이트 로드 (main-assets 통합)
k.loadSprite("front-assets", "assets/images/rpg_spritesheet_front.png", {
    sliceX: 79, // front.json의 실제 정보: 1896/24 = 79열
    sliceY: 79, // front.json의 실제 정보: 1896/24 = 79행
    anims: {
        // 새 플레이어 애니메이션 (24x24 타일 시스템용)
        "player-idle-down": 1015,
        "player-down": {
            from: 1015,
            to: 1018,
            loop: true,
            speed: 6, // 수정된 부분: 애니메이션 속도 조절 (기본값보다 느리게)
        },
        // 추가된 부분: left/right 개별 애니메이션
        "player-idle-left": 1173,
        "player-left": {
            from: 1173,
            to: 1176,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 1252,
        "player-right": {
            from: 1252,
            to: 1255,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 1094,
        "player-up": {
            from: 1094,
            to: 1097,
            loop: true,
            speed: 6, // 수정된 부분: 애니메이션 속도 조절
        },
        // sit 애니메이션
        "player-sit-up": 1020,
        "player-sit-down": 1020,
        "player-sit-left": 1099,
        "player-sit-right": 1100,

        // Student 스프라이트들
        student1: 3781,
        student2: 3703,
        student3: 3705,
        student4: 3780,
        student5: 2204,
        student6: 2205,
        student7: 3150,
        student8: 3622, // 김윤명 (ENTP)
        student9: 3624, // 박은서 (ENFJ)
        student10: 3625, // 이나영 (ESFP)
        student11: 3623, // 김보영 (ISTP)
        student12: 2517,
        student13: 2212,
        student14: 2213,
        student15: 2214,
        student16: 2215,
        student17: 2207, // 기존 student8을 student17로 이동
        student18: 2207, // 조아영 (서예)
        student19: 2208, // 변지민 (K-pop 댄스)
        student20: 2209, // 윤채린 (SNS)
        student21: 2210, // 서예린 (기타)

        // NPC들도 front-assets에 추가 (필요한 경우)
        cat1: 3784,
        cat2: 3783,
        
        // 오브젝트들
        ball: 5296, // 피구공
        sink: 5297, // 식수대
        line_machine: 5298, // 라인 페인터
        painter: 5298, // line_machine과 동일
        badminton: 5299, // 배드민턴 라켓
        
        // NCA 전단지 등 기타 오브젝트들
        nca: 5386,
  
        
        // 편지 오브젝트
        letter1: 5378,
        letter2: 5379,
        letter3: 5380,
        
        // 말풍선 감정 표현
        bubble_veryhappy: 5774,
        bubble_normal: 5775,
        bubble_sad: 5776,
        bubble_angry: 5777,
        bubble_mad: 5778,
        bubble_happy: 5779,
    },
});

// first.json을 위한 first-assets 스프라이트 로드
k.loadSprite("first-assets", "assets/images/rpg_spritesheet_first.png", {
    sliceX: 66, // first.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // first.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (first.json 전용 - 66x43 grid)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,  // 행6*66 + 열0
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,  // 행7*66 + 열0
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,  // 행4*66 + 열0
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // sit 애니메이션
        "player-sit-up": 255,    // 행4*66 + 열4
        "player-sit-down": 255,  // 행5*66 + 열4
        "player-sit-left": 321,  // 행6*66 + 열4
        "player-sit-right": 322, // 행7*66 + 열4

        // Student NPC들 (first.json 크기에 맞게 - 66x43 grid)
        student13: 1702,  // 행1*66 + 열3
        student14: 1703,  // 행1*66 + 열4
        student15: 1704,  // 행1*66 + 열5
        student16: 1705,  // 행1*66 + 열6
        student17: 1706,  // 행1*66 + 열7
        student18: 1707,  // 행1*66 + 열8
        student19: 1708,  // 행1*66 + 열9
        student20: 1709,  // 행1*66 + 열10
        student21: 1710,  // 행1*66 + 열11

        // NPC들
     
        
        // 오브젝트들 (first.json 범위 내)
        letter4: 2315,    // 안전한 인덱스
        letter5: 2316,    // 안전한 인덱스  
        letter6: 2317,    // 안전한 인덱스
        
        // 추가 오브젝트들 (first.json 전용)
     
        cam: 2252,
        
       
    },
});

// 하트 스프라이트 추가 (UI용)
k.loadSprite("full-heart", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "full-heart": 1300, // 적절한 인덱스로 조정 필요
    },
});

k.loadSprite("half-heart", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "half-heart": 1301, // 적절한 인덱스로 조정 필요
    },
});

k.loadSprite("empty-heart", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "empty-heart": 1302, // 적절한 인덱스로 조정 필요
    },
});

// 분홍색 하트 스프라이트 추가 (튜토리얼용)
k.loadSprite("pink-heart", "assets/images/rpg_0_spritesheet.png", {
    sliceX: 50,
    sliceY: 75,
    anims: {
        "pink-heart": 1300, // full-heart와 같은 인덱스 사용, 색상은 코드에서 처리
    },
});

// restroom.json을 위한 restroom-assets 스프라이트 로드
k.loadSprite("restroom-assets", "assets/images/rpg_spritesheet_restroom.png", {
    sliceX: 66, // restroom.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // restroom.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (restroom.json 전용 - first-assets와 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,  // 행6*66 + 열0
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,  // 행7*66 + 열0
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,  // 행4*66 + 열0
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // sit 애니메이션
        "player-sit-up": 255,    // 행4*66 + 열4
        "player-sit-down": 255,  // 행5*66 + 열4
        "player-sit-left": 321,  // 행6*66 + 열4
        "player-sit-right": 322, // 행7*66 + 열4
        
        // Student 애니메이션들 (restroom 전용)
        student41: 1500, // 임시 위치, 실제 스프라이트시트에서 확인 필요
        student42: 1501,
        student43: 1502,
    },
});

// restaurant.json을 위한 restaurant-assets 스프라이트 로드
k.loadSprite("restaurant-assets", "assets/images/rpg_spritesheet_restaurant.png", {
    sliceX: 66, // restaurant.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // restaurant.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (restaurant.json 전용 - first-assets와 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,  // 행6*66 + 열0
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,  // 행7*66 + 열0
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,  // 행4*66 + 열0
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // sit 애니메이션
        "player-sit-up": 255,    // 행4*66 + 열4
        "player-sit-down": 255,  // 행5*66 + 열4
        "player-sit-left": 321,  // 행6*66 + 열4
        "player-sit-right": 322, // 행7*66 + 열4
        
        // 급식실 관련 NPC들
        cook: 1702,  // 급식실 요리사
        staff: 1703, // 급식실 직원
        
        // 학생들 (급식실에서 식사하는)
        student1: 1704,
        student2: 1705,
        student3: 1706,
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});

// garage.json을 위한 garage-assets 스프라이트 로드
k.loadSprite("garage-assets", "assets/images/rpg_spritesheet_garage.png", {
    sliceX: 66, // garage.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // garage.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (garage.json 전용 - first-assets와 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,  // 행6*66 + 열0
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,  // 행7*66 + 열0
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,  // 행4*66 + 열0
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // sit 애니메이션
        "player-sit-up": 255,    // 행4*66 + 열4
        "player-sit-down": 255,  // 행5*66 + 열4
        "player-sit-left": 321,  // 행6*66 + 열4
        "player-sit-right": 322, // 행7*66 + 열4
        
        // garage 전용 NPC들
        student22: 2497,  // student22 NPC 스프라이트
        
        // garage 전용 오브젝트들
        mp3: 2252,        // mp3 오브젝트 스프라이트
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});

// health.json을 위한 health-assets 스프라이트 로드
k.loadSprite("health-assets", "assets/images/rpg_spritesheet_health.png", {
    sliceX: 66, // health.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // health.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (health.json 전용 - first-assets와 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 248,
            to: 250,
            speed: 8,
            loop: true,
        },
        "player-idle-side": 382,  // 행6*66 + 열2
        "player-side": {
            from: 380,
            to: 382,
            speed: 8,
            loop: true,
        },
        "player-idle-up": 514,  // 행8*66 + 열4
        "player-up": {
            from: 512,
            to: 514,
            speed: 8,
            loop: true,
        },
        "player-idle-left": 382,  // 행6*66 + 열2 (side와 동일)
        "player-left": {
            from: 380,
            to: 382,
            speed: 8,
            loop: true,
        },
        "player-idle-right": 382,  // 행6*66 + 열2 (side와 동일)
        "player-right": {
            from: 380,
            to: 382,
            speed: 8,
            loop: true,
        },
        
        // health 전용 NPC들
        student23: 2498,  // student23 NPC 스프라이트 (임시값)
        nurse: 2499,      // 양호선생님 NPC 스프라이트 (임시값)
        
        // health 전용 오브젝트들
        bed1: 2253,            // 침대1 오브젝트 스프라이트
        bed2: 2254,            // 침대2 오브젝트 스프라이트
        medicine_cabinet: 2255, // 약장 오브젝트 스프라이트
        scale: 2256,           // 체중계 오브젝트 스프라이트
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});

// class1.json을 위한 class1-assets 스프라이트 로드
k.loadSprite("class1-assets", "assets/images/rpg_spritesheet_class1.png", {
    sliceX: 66, // class1.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // class1.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (class1.json 전용 - 다른 씬들과 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 184,    // 행4*66 + 열0
        "player-up": {
            from: 184,
            to: 187,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 118,  // 행3*66 + 열0
        "player-left": {
            from: 118,
            to: 121,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 52,  // 행2*66 + 열0
        "player-right": {
            from: 52,
            to: 55,
            loop: true,
            speed: 6,
        },
        
        // 앉기 애니메이션
        "player-sit-down": 318,   // 행7*66 + 열0
        "player-sit-up": 319,     // 행7*66 + 열1
        "player-sit-left": 321,   // 행7*66 + 열3
        "player-sit-right": 322,  // 행7*66 + 열4
        
        // 교실 전용 NPC들
        teacher: 2100,      // 선생님
        student1: 2200,     // 학생1
        student2: 2300,     // 학생2
        student3: 2400,     // 학생3
        
        // 교실 전용 오브젝트들
        blackboard: 1800,   // 칠판
        desk1: 1900,        // 책상1
        desk2: 1950,        // 책상2
        bookshelf: 2000,    // 책장
        projector: 2050,    // 프로젝터
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});

// class2.json을 위한 class2-assets 스프라이트 로드
k.loadSprite("class2-assets", "assets/images/rpg_spritesheet_class2.png", {
    sliceX: 66, // class2.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // class2.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (class2.json 전용 - 다른 씬들과 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 184,    // 행4*66 + 열0
        "player-up": {
            from: 184,
            to: 187,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 118,  // 행3*66 + 열0
        "player-left": {
            from: 118,
            to: 121,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 52,  // 행2*66 + 열0
        "player-right": {
            from: 52,
            to: 55,
            loop: true,
            speed: 6,
        },
        
        // 앉기 애니메이션
        "player-sit-down": 318,   // 행7*66 + 열0
        "player-sit-up": 319,     // 행7*66 + 열1
        "player-sit-left": 321,   // 행7*66 + 열3
        "player-sit-right": 322,  // 행7*66 + 열4
        
        // class2 전용 NPC들
        student80: 2100,    // 김진이
        student81: 2101,    // 김슬기
        student82: 2102,    // 백예린
        student83: 2103,    // 설승아
        student91: 2104,    // 성수현
        student92: 2105,    // 김서현
        student93: 2106,    // 한승우
        student94: 2107,    // 이서연
        
        // class2 전용 오브젝트들
        cleaning_cabinet: 1800,  // 청소도구함
        training_clothes: 1801,  // 체육복
        mop: 1802,              // 마포걸레
        cleaning_tool1: 1803,   // 쓰레받기
        cleaning_tool2: 1804,   // 빗자루
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});

// second.json을 위한 second-assets 스프라이트 로드
k.loadSprite("second-assets", "assets/images/rpg_spritesheet_second.png", {
    sliceX: 66, // second.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // second.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (second.json 전용 - first-assets와 동일한 구조)
        "player-idle-down": 250,  // 행5*66 + 열0
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,  // 행6*66 + 열0
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,  // 행7*66 + 열0
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,  // 행4*66 + 열0
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // sit 애니메이션
        "player-sit-up": 255,    // 행4*66 + 열4
        "player-sit-down": 255,  // 행5*66 + 열4
        "player-sit-left": 321,  // 행6*66 + 열4
        "player-sit-right": 322, // 행7*66 + 열4
        
        // 2층 관련 NPC들
        teacher1: 1702,  // 선생님 1
        teacher2: 1703,  // 선생님 2
        teacher3: 1704,  // 선생님 3
        
        // 학생들 (2층에서 수업받는)
        student1: 1705,
        student2: 1706,
        student3: 1707,
        student4: 1708,
        student5: 1709,
        
        // 편지 아이콘 (퀘스트 UI용)
        letter_closed: 50,  // 닫힌 편지 (퀘스트 없음)
        letter_open: 51,    // 열린 편지 (새 퀘스트 있음)
    },
});



// // 추가된 부분: 16x32 플레이어 캐릭터 스프라이트시트 (rpg_cha.png) - 활성화
// k.loadSprite("player-tall", "assets/maps/rpg_cha.png", {
//     sliceX: 4, // 4프레임씩 (down 4개, up 4개, left 4개, right 4개)
//     sliceY: 4, // 4방향 (down, up, left, right 순)
//     anims: {
//         // Down 걷기 애니메이션 (첫 번째 줄)
//         "player-tall-idle-down": 0,
//         "player-tall-down": {
//             from: 0,
//             to: 3,
//             loop: true,
//             speed: 6,
//         },
//         // Up 걷기 애니메이션 (두 번째 줄)
//         "player-tall-idle-up": 4,
//         "player-tall-up": {
//             from: 4,
//             to: 7,
//             loop: true,
//             speed: 6,
//         },
//         // Left 걷기 애니메이션 (세 번째 줄)
//         "player-tall-idle-left": 8,
//         "player-tall-left": {
//             from: 8,
//             to: 11,
//             loop: true,
//             speed: 6,
//         },
//         // Right 걷기 애니메이션 (네 번째 줄)
//         "player-tall-idle-right": 12,
//         "player-tall-right": {
//             from: 12,
//             to: 15,
//             loop: true,
//             speed: 6,
//         },
//         // 추가된 부분: Sit 애니메이션 (idle 프레임 사용)
//         "player-tall-sit-down": 0,
//         "player-tall-sit-up": 4,
//         "player-tall-sit-left": 8,
//         "player-tall-sit-right": 12,
//     },
// });

// second2.json을 위한 second2-assets 스프라이트 로드
k.loadSprite("second2-assets", "assets/images/rpg_spritesheet_second2.png", {
    sliceX: 66, // second2.json의 실제 정보: 1584/24 = 66열
    sliceY: 43, // second2.json의 실제 정보: 1032/24 = 43행
    anims: {
        // 플레이어 애니메이션 (second2.json 전용 - second-assets와 동일한 구조)
        "player-idle-down": 250,
        "player-down": {
            from: 250,
            to: 253,
            loop: true,
            speed: 6,
        },
        "player-idle-left": 382,
        "player-left": {
            from: 382,
            to: 385,
            loop: true,
            speed: 6,
        },
        "player-idle-right": 448,
        "player-right": {
            from: 448,
            to: 451,
            loop: true,
            speed: 6,
        },
        "player-idle-up": 316,
        "player-up": {
            from: 316,
            to: 319,
            loop: true,
            speed: 6,
        },
        // 필요시 다른 애니메이션들 추가
    },
});

const scenes = {
    intro,
    prologue: prologueShort, // prologue_short를 prologue로 사용
    title,
    tutorial,
    front,
    schoolfront,
    first,
    restroom,
    restaurant,
    garage, // 추가된 부분: garage 씬
    health, // 추가된 부분: health 씬
    class1, // 추가된 부분: class1 씬
    class2, // 추가된 부분: class2 씬
    second,
    second2,
    schoolsecond,
    credits,
};
for (const sceneName in scenes) {
    k.scene(sceneName, () => scenes[sceneName](k));
}

// 전역 자동저장 시스템 초기화
const globalAutoSaveManager = new AutoSaveManager(k, gameState);
window.autoSaveManager = globalAutoSaveManager;

// 전역 게임패드 매니저 초기화
gamepadManager.initialize();
window.gamepadManager = gamepadManager;

// 전역 오디오 관리자 초기화 (윈도우 visibility 이벤트 설정)
audioManager.setupVisibilityListeners();

// 전역 자동저장 시작 (모든 씬에서 공통으로 사용)
globalAutoSaveManager.startPeriodicAutoSave({}, "global");

// 테스트를 위해 임시 플레이어 이름 설정
gameState.setPlayerName("테스트플레이어");
console.log("🎮 테스트용 플레이어 이름 설정:", gameState.getPlayerName());

k.go("intro");
