import { gameState } from "../state/stateManagers.js";
import { duckBgm, restoreBgm } from "../utils.js";
import { createDialogUI } from "../systems/uiComponents.js";

// 추가된 부분: 타이핑 효과음을 위한 변수들
let lastTalkSfxTime = 0;
const BASE_TALK_SFX_INTERVAL = 65; // 기본 65ms 간격으로 효과음 재생

// 새로운 UI 시스템과 호환성을 위한 Dialog UI 인스턴스
let dialogUIInstance = null;

function getDialogUIInstance(k) {
    if (!dialogUIInstance) {
        dialogUIInstance = createDialogUI(k);
    }
    return dialogUIInstance;
}

// 대화 시스템 초기화 함수 추가
export function resetDialogSystem() {
    // 기존 인스턴스 정리
    if (dialogUIInstance) {
        try {
            dialogUIInstance.cleanup();
        } catch (e) {
            console.warn("dialogUIInstance 정리 중 오류:", e);
        }
    }
    
    dialogUIInstance = null;
    lastTalkSfxTime = 0;
    
    // 추가 전역 변수 정리
    if (typeof window !== 'undefined') {
        window.dialogUIInstance = null;
        window.currentDialog = null;
        window.isDialogActive = false;
        window.dialogQueue = [];
        window.dialogState = null;
        window.activeDialogBox = null;
        window.prologueDialogActive = false;
    }
    
    // DOM 요소 정리
    const dialogSelectors = [
        '[data-dialog]',
        '.dialog-container',
        '.dialog-box',
        '.dialog-text',
        '.dialog-ui',
        '.ui-dialog-box',
        '.ui-dialog-text',
        '.ui-name-tab',
        '.ui-choice-container'
    ];
    
    dialogSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        } catch (e) {
            console.warn(`선택자 ${selector} 정리 중 오류:`, e);
        }
    });
    
    // console.log("🧹 Dialog system reset completed");
}

// 추가된 부분: 학생별 음성 특성 정의
const STUDENT_VOICE_PROFILES = {
    // 한국어 이름과 영어 이름 모두 지원
    정다정: {
        pitchMultiplier: 1.2,
        speedMultiplier: 1.3,
        volumeMultiplier: 1.1,
    }, // 밝고 활발
    "Jung Dajeong": {
        pitchMultiplier: 1.2,
        speedMultiplier: 1.3,
        volumeMultiplier: 1.1,
    },
    student1: {
        pitchMultiplier: 1.2,
        speedMultiplier: 1.3,
        volumeMultiplier: 1.1,
    },

    오새롬: {
        pitchMultiplier: 1.0,
        speedMultiplier: 1.0,
        volumeMultiplier: 1.0,
    }, // 친근하고 수다스러운
    "Oh Saerom": {
        pitchMultiplier: 1.0,
        speedMultiplier: 1.0,
        volumeMultiplier: 1.0,
    },
    student2: {
        pitchMultiplier: 1.0,
        speedMultiplier: 1.0,
        volumeMultiplier: 1.0,
    },

    박수진: {
        pitchMultiplier: 0.8,
        speedMultiplier: 0.7,
        volumeMultiplier: 0.9,
    }, // 까칠하고 짜증
    "Park Sujin": {
        pitchMultiplier: 0.8,
        speedMultiplier: 0.7,
        volumeMultiplier: 0.9,
    },
    student3: {
        pitchMultiplier: 0.8,
        speedMultiplier: 0.7,
        volumeMultiplier: 0.9,
    },

    고혜성: {
        pitchMultiplier: 0.7,
        speedMultiplier: 0.6,
        volumeMultiplier: 0.8,
    }, // 철학적이고 진지
    "Go Hyeseong": {
        pitchMultiplier: 0.7,
        speedMultiplier: 0.6,
        volumeMultiplier: 0.8,
    },
    student4: {
        pitchMultiplier: 0.7,
        speedMultiplier: 0.6,
        volumeMultiplier: 0.8,
    },

    천사라: {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.8,
        volumeMultiplier: 0.7,
    }, // 조용하고 차분
    "Cheon Sara": {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.8,
        volumeMultiplier: 0.7,
    },
    student5: {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.8,
        volumeMultiplier: 0.7,
    },

    나소정: {
        pitchMultiplier: 1.3,
        speedMultiplier: 1.4,
        volumeMultiplier: 1.2,
    }, // 말 많고 봉사정신
    "Na Sojeong": {
        pitchMultiplier: 1.3,
        speedMultiplier: 1.4,
        volumeMultiplier: 1.2,
    },
    student6: {
        pitchMultiplier: 1.3,
        speedMultiplier: 1.4,
        volumeMultiplier: 1.2,
    },

    권소미: {
        pitchMultiplier: 1.4,
        speedMultiplier: 1.5,
        volumeMultiplier: 1.3,
    }, // 활발하고 운동 좋아함
    "Kwon Somi": {
        pitchMultiplier: 1.4,
        speedMultiplier: 1.5,
        volumeMultiplier: 1.3,
    },
    student7: {
        pitchMultiplier: 1.4,
        speedMultiplier: 1.5,
        volumeMultiplier: 1.3,
    },

    김은수: {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.9,
        volumeMultiplier: 0.8,
    }, // 걱정 많고 조용
    "Lee Jimin": {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.9,
        volumeMultiplier: 0.8,
    },
    student8: {
        pitchMultiplier: 0.9,
        speedMultiplier: 0.9,
        volumeMultiplier: 0.8,
    },

    // 기타 캐릭터들 - 수정된 부분: 남성 목소리로 조정
    학년부장쌤: {
        pitchMultiplier: 0.4,
        speedMultiplier: 0.6,
        volumeMultiplier: 1.1,
    }, // 남성 어른 목소리 (더 낮고 느리게)
    "Grade Director": {
        pitchMultiplier: 0.4,
        speedMultiplier: 0.6,
        volumeMultiplier: 1.1,
    },
    director: {
        pitchMultiplier: 0.4,
        speedMultiplier: 0.6,
        volumeMultiplier: 1.1,
    },

    교감선생님: {
        pitchMultiplier: 0.45,
        speedMultiplier: 0.65,
        volumeMultiplier: 1.0,
    }, // 남성 어른 목소리 (약간 높은 톤)
    "Vice Principal": {
        pitchMultiplier: 0.45,
        speedMultiplier: 0.65,
        volumeMultiplier: 1.0,
    },
    facil: {
        pitchMultiplier: 0.45,
        speedMultiplier: 0.65,
        volumeMultiplier: 1.0,
    },

    "새로운 캐릭터": {
        pitchMultiplier: 1.1,
        speedMultiplier: 1.2,
        volumeMultiplier: 1.1,
    }, // 귀여운 새 캐릭터
};

// 전역 변수로 현재 말하는 캐릭터 저장
let currentSpeaker = null;
let currentVoiceProfile = {
    pitchMultiplier: 1.0,
    speedMultiplier: 1.0,
    volumeMultiplier: 1.0,
};

// 추가된 부분: Animalese 시스템 - 문자별 효과음 재생 함수
function playAnimalese(k, character) {
    const now = Date.now();

    // 캐릭터별 음성 간격 조정 - 수정된 부분
    const talkSfxInterval =
        BASE_TALK_SFX_INTERVAL / currentVoiceProfile.speedMultiplier; // 속도 배율 적용

    // 너무 자주 재생되지 않도록 간격 조절
    if (now - lastTalkSfxTime < talkSfxInterval) {
        return;
    }
    lastTalkSfxTime = now;

    // 문자에 따른 오디오 파일 결정
    let soundKey = getAnimaleseSoundKey(character);
    if (!soundKey) return; // 재생할 사운드가 없으면 리턴

    // 캐릭터별 음성 특성 적용 - 수정된 부분
    // console.log(
    //     `[DEBUG] 현재 스피커: ${currentSpeaker}, 음성 프로필:`,
    //     currentVoiceProfile
    // );

    // 문자별 피치 조정 - 수정된 부분: 캐릭터별 특성 적용
    let basePitch = 3.0 * currentVoiceProfile.pitchMultiplier; // 캐릭터별 피치 배율 적용

    // 받침이 있는 한글 글자는 더 부드러운 피치
    const isKoreanSoftForPitch = soundKey.includes("_soft");
    if (isKoreanSoftForPitch) {
        basePitch = basePitch * 0.93; // 받침 있는 글자는 조금 낮은 피치
    }

    // 고음 문자들(i, e)은 더 낮은 피치 사용
    if (
        ["i", "e"].includes(
            soundKey.replace("animalese-", "").replace("_soft", "")
        )
    ) {
        basePitch = basePitch * (isKoreanSoftForPitch ? 0.77 : 0.83); // 받침 있으면 더 낮게
    }
    // 저음 문자들(u, o)은 조금 높은 피치 사용
    else if (
        ["u", "o", "a"].includes(
            soundKey.replace("animalese-", "").replace("_soft", "")
        )
    ) {
        basePitch = basePitch * (isKoreanSoftForPitch ? 1.0 : 1.07); // 받침 있으면 더 낮게
    }
    // digraph들(ch, sh, th, etc)은 중간 피치 사용
    else if (
        ["ch", "sh", "th", "wh", "ph"].includes(
            soundKey.replace("animalese-", "").replace("_soft", "")
        )
    ) {
        basePitch = basePitch * (isKoreanSoftForPitch ? 0.83 : 0.9); // 받침 있으면 더 낮게
    }

    const pitch = basePitch + Math.random() * 0.25; // 수정된 부분: 랜덤 범위 더 감소 (0.3 → 0.25)

    // 문자별 볼륨 조정 - 수정된 부분: 캐릭터별 특성 적용
    let baseVolume = 0.22 * currentVoiceProfile.volumeMultiplier; // 캐릭터별 볼륨 배율 적용

    // 받침이 있는 한글 글자는 더 부드럽게
    const isKoreanSoft = soundKey.includes("_soft");
    if (isKoreanSoft) {
        baseVolume = baseVolume * 0.73; // 받침 있는 글자는 더 부드럽게
        soundKey = soundKey.replace("_soft", ""); // _soft 제거
    }

    // 고음 문자들은 볼륨을 낮춰서 찍찍대는 소리 방지
    if (["i", "e"].includes(soundKey.replace("animalese-", ""))) {
        baseVolume = baseVolume * (isKoreanSoft ? 0.64 : 0.82); // 받침 있으면 더 낮게
    }
    // 자음들은 볼륨을 약간 높임
    else if (
        ["b", "p", "t", "d", "k", "g"].includes(
            soundKey.replace("animalese-", "")
        )
    ) {
        baseVolume = baseVolume * (isKoreanSoft ? 0.91 : 1.18); // 받침 있으면 더 낮게
    }
    // digraph들은 부드러운 볼륨 사용
    else if (
        ["ch", "sh", "th", "wh", "ph"].includes(
            soundKey.replace("animalese-", "")
        )
    ) {
        baseVolume = baseVolume * (isKoreanSoft ? 0.73 : 0.91); // 받침 있으면 더 낮게
    }

    const volume = baseVolume + Math.random() * 0.08; // 수정된 부분: 랜덤 범위 크게 감소 (0.15 → 0.08)

    // 문자별 Animalese 효과음 재생
    k.play(soundKey, {
        volume: volume,
        speed: pitch, // Kaboom.js에서 speed가 피치 역할
    });
}

// 추가된 부분: 한글 자음/모음을 영어 알파벳에 매핑하는 테이블
const KOREAN_TO_ENGLISH_MAP = {
    // 초성 (자음) 매핑
    ㄱ: "g",
    ㄲ: "k",
    ㄴ: "n",
    ㄷ: "d",
    ㄸ: "t",
    ㄹ: "r",
    ㅁ: "m",
    ㅂ: "b",
    ㅃ: "p",
    ㅅ: "s",
    ㅆ: "s",
    ㅇ: "",
    ㅈ: "j",
    ㅉ: "j",
    ㅊ: "ch",
    ㅋ: "k",
    ㅌ: "t",
    ㅍ: "p",
    ㅎ: "h",

    // 중성 (모음) 매핑 - 수정된 부분: 여성 캐릭터를 위한 부드러운 소리
    ㅏ: "a",
    ㅐ: "e",
    ㅑ: "a",
    ㅒ: "e",
    ㅓ: "e",
    ㅔ: "e",
    ㅕ: "e",
    ㅖ: "e",
    ㅗ: "o",
    ㅘ: "a",
    ㅙ: "e",
    ㅚ: "e",
    ㅛ: "o",
    ㅜ: "u",
    ㅝ: "u",
    ㅞ: "e",
    ㅟ: "i",
    ㅠ: "u",
    ㅡ: "u",
    ㅢ: "i",
    ㅣ: "i",

    // 종성 (받침) 매핑
    ㄱ_: "k",
    ㄲ_: "k",
    ㄳ_: "k",
    ㄴ_: "n",
    ㄵ_: "n",
    ㄶ_: "n",
    ㄷ_: "t",
    ㄹ_: "l",
    ㄺ_: "l",
    ㄻ_: "l",
    ㄼ_: "l",
    ㄽ_: "l",
    ㄾ_: "l",
    ㄿ_: "l",
    ㅀ_: "l",
    ㅁ_: "m",
    ㅂ_: "p",
    ㅄ_: "p",
    ㅅ_: "t",
    ㅆ_: "t",
    ㅇ_: "ng",
    ㅈ_: "t",
    ㅊ_: "t",
    ㅋ_: "k",
    ㅌ_: "t",
    ㅍ_: "p",
    ㅎ_: "t",
};

// 추가된 부분: 한글 자모 분해 함수
function decomposeKorean(char) {
    const code = char.charCodeAt(0);

    // 한글 완성형 범위 확인 (가-힣)
    if (code < 0xac00 || code > 0xd7a3) {
        return [];
    }

    const base = code - 0xac00;

    // 초성, 중성, 종성 인덱스 계산
    const choIndex = Math.floor(base / (21 * 28));
    const jungIndex = Math.floor((base % (21 * 28)) / 28);
    const jongIndex = base % 28;

    // 자모 배열
    const choSeong = [
        "ㄱ",
        "ㄲ",
        "ㄴ",
        "ㄷ",
        "ㄸ",
        "ㄹ",
        "ㅁ",
        "ㅂ",
        "ㅃ",
        "ㅅ",
        "ㅆ",
        "ㅇ",
        "ㅈ",
        "ㅉ",
        "ㅊ",
        "ㅋ",
        "ㅌ",
        "ㅍ",
        "ㅎ",
    ];
    const jungSeong = [
        "ㅏ",
        "ㅐ",
        "ㅑ",
        "ㅒ",
        "ㅓ",
        "ㅔ",
        "ㅕ",
        "ㅖ",
        "ㅗ",
        "ㅘ",
        "ㅙ",
        "ㅚ",
        "ㅛ",
        "ㅜ",
        "ㅝ",
        "ㅞ",
        "ㅟ",
        "ㅠ",
        "ㅡ",
        "ㅢ",
        "ㅣ",
    ];
    const jongSeong = [
        "",
        "ㄱ",
        "ㄲ",
        "ㄳ",
        "ㄴ",
        "ㄵ",
        "ㄶ",
        "ㄷ",
        "ㄹ",
        "ㄺ",
        "ㄻ",
        "ㄼ",
        "ㄽ",
        "ㄾ",
        "ㄿ",
        "ㅀ",
        "ㅁ",
        "ㅂ",
        "ㅄ",
        "ㅅ",
        "ㅆ",
        "ㅇ",
        "ㅈ",
        "ㅊ",
        "ㅋ",
        "ㅌ",
        "ㅍ",
        "ㅎ",
    ];

    const result = [];

    // 초성 추가
    if (choIndex < choSeong.length) {
        result.push(choSeong[choIndex]);
    }

    // 중성 추가
    if (jungIndex < jungSeong.length) {
        result.push(jungSeong[jungIndex]);
    }

    // 종성 추가 (있는 경우에만)
    if (jongIndex > 0 && jongIndex < jongSeong.length) {
        result.push(jongSeong[jongIndex] + "_"); // 종성 구분을 위해 '_' 추가
    }

    return result;
}

// 추가된 부분: 문자에 따른 Animalese 사운드 키 반환 함수
function getAnimaleseSoundKey(character) {
    const char = character.toLowerCase();

    // 영어 소문자 a-z
    if (char.match(/[a-z]/)) {
        return `animalese-${char}`;
    }

    // 숫자나 특수문자는 bebebese 사용
    if (char.match(/[0-9!@#$%^&*(),.?":{}|<>]/)) {
        return "animalese-bebebese";
    }

    // 한글 처리 - 수정된 부분: 자모 분해 후 매핑
    if (char.match(/[가-힣]/)) {
        const decomposed = decomposeKorean(char);
        if (decomposed.length > 0) {
            // 수정된 부분: 여성 캐릭터를 위해 모음을 우선적으로 사용
            let targetJamo = null;
            let mappedChar = null;

            // 1순위: 중성(모음) 사용 (더 부드러운 소리)
            if (decomposed.length > 1) {
                targetJamo = decomposed[1]; // 중성(모음) 먼저 시도
                mappedChar = KOREAN_TO_ENGLISH_MAP[targetJamo];
            }

            // 2순위: 모음이 없거나 매핑되지 않으면 초성 사용
            if ((!mappedChar || mappedChar === "") && decomposed.length > 0) {
                targetJamo = decomposed[0]; // 초성 사용
                mappedChar = KOREAN_TO_ENGLISH_MAP[targetJamo];
            }

            // 받침이 있는 글자는 볼륨을 조금 더 부드럽게
            if (decomposed.length > 2) {
                // 이 정보는 나중에 볼륨 조정에서 사용됨
                mappedChar = mappedChar + "_soft"; // 받침 있음 표시
            }

            // console.log(
            //     `[DEBUG] 한글 매핑: '${char}' -> [${decomposed.join(
            //         ", "
            //     )}] -> '${targetJamo}' -> '${mappedChar}'`
            // );

            if (mappedChar && mappedChar !== "") {
                // digraph 처리 (ch, sh, th, wh, ph)
                if (["ch", "sh", "th", "wh", "ph"].includes(mappedChar)) {
                    return `animalese-${mappedChar}`;
                }
                // 단일 문자
                else if (mappedChar.length === 1) {
                    return `animalese-${mappedChar}`;
                }
                // ya, yo, yu 등 복합 모음은 첫 글자만 사용
                else {
                    return `animalese-${mappedChar[0]}`;
                }
            }
        }

        // 매핑되지 않는 한글은 기본 한국어 효과음 사용
        return "talk-sfx";
    }

    // 공백이나 기타 문자는 재생하지 않음
    return null;
}

// 수정된 부분: 기존 함수명 변경 (하위 호환성 유지)
function playTalkSfx(k, character = null) {
    if (character) {
        // 새로운 Animalese 시스템 사용
        playAnimalese(k, character);
    } else {
        // 기존 방식 (하위 호환성) - 수정된 부분: talk-sfx 사용하고 간격 수정
        const now = Date.now();
        const talkSfxInterval =
            BASE_TALK_SFX_INTERVAL / currentVoiceProfile.speedMultiplier; // 캐릭터별 속도 적용
        if (now - lastTalkSfxTime < talkSfxInterval) {
            return;
        }
        lastTalkSfxTime = now;

        // 수정된 부분: 더 나은 talk-sfx 파라미터 설정
        const pitch = 0.8 + Math.random() * 0.4; // 피치 범위 조정 (0.8-1.2)
        const volume = 0.3 + Math.random() * 0.2; // 볼륨 범위 조정 (0.3-0.5)

        k.play("talk-sfx", {
            volume: volume * currentVoiceProfile.volumeMultiplier, // 캐릭터별 볼륨 적용
            speed: pitch * currentVoiceProfile.pitchMultiplier, // 캐릭터별 피치 적용
        });
    }
}

// 타이핑 스킵 플래그 (전역 변수)
let isTypingSkipRequested = false;

async function displayLine(textContainer, line, k) {
    // 수정된 부분: k 파라미터 추가
    // 빈 문자열이나 null/undefined 체크
    if (!line || typeof line !== "string") {
        console.warn("displayLine: 유효하지 않은 라인:", line);
        return;
    }

    // 타이핑 스킵 플래그 초기화
    isTypingSkipRequested = false;
    if (window.dialogState) window.dialogState.isTypingSkipRequested = false;

    // 캐릭터별 타이핑 속도 적용 - 수정된 부분
    const baseTypingDelay = 15; // 기본 타이핑 간격 (ms)
    const typingDelay = baseTypingDelay / currentVoiceProfile.speedMultiplier; // 속도 배율 적용

    console.log(
        `[DEBUG] 타이핑 속도 - 기본: ${baseTypingDelay}ms, 조정된: ${typingDelay}ms (배율: ${currentVoiceProfile.speedMultiplier})`
    );

    // 수정된 부분: 괄호 안 텍스트 추적 변수
    let insideParentheses = false;
    let isDisplaying = true; // 출력 중 플래그 추가

    // 타이핑 스킵이 요청되면 즉시 전체 텍스트 표시
    if (isTypingSkipRequested || (window.dialogState && window.dialogState.isTypingSkipRequested)) {
        textContainer.text = line;
        // 스킵 플래그 초기화
        isTypingSkipRequested = false;
        if (window.dialogState) window.dialogState.isTypingSkipRequested = false;
        return;
    }

    for (const char of line) {
        // 타이핑 스킵이 요청되면 남은 텍스트 즉시 표시하고 종료
        if (isTypingSkipRequested || (window.dialogState && window.dialogState.isTypingSkipRequested)) {
            textContainer.text = line;
            // 스킵 플래그 초기화
            isTypingSkipRequested = false;
            if (window.dialogState) window.dialogState.isTypingSkipRequested = false;
            break;
        }

        // 렌더링할 수 없는 문자 체크
        if (!char || char.length === 0) continue;

        // 수정된 부분: 괄호 상태 업데이트
        if (char === "(") {
            insideParentheses = true;
        } else if (char === ")") {
            insideParentheses = false;
        }

        await new Promise(
            (resolve) =>
                setTimeout(() => {
                    try {
                        // 타이핑 스킵이 요청되면 즉시 resolve
                        if (isTypingSkipRequested || (window.dialogState && window.dialogState.isTypingSkipRequested)) {
                            // 스킵 플래그 초기화
                            isTypingSkipRequested = false;
                            if (window.dialogState) window.dialogState.isTypingSkipRequested = false;
                            resolve();
                            return;
                        }

                        // 수정된 부분: 괄호 안에서는 text-sfx, 밖에서는 Animalese 사용
                        if (k && /[a-zA-Z0-9가-힣]/.test(char)) {
                            if (insideParentheses) {
                                // 괄호 안에서는 기존 text-sfx 사용
                                playTalkSfx(k); // 문자 없이 호출하면 기존 방식 사용
                            } else {
                                // 괄호 밖에서는 Animalese 사용
                                playTalkSfx(k, char);
                            }
                        }

                        textContainer.text += char;
                    } catch (error) {
                        console.error(
                            "텍스트 렌더링 에러:",
                            error,
                            "char:",
                            char
                        );
                    }
                    resolve();
                }, typingDelay) // 수정된 부분: 캐릭터별 타이핑 속도 적용
        );
    }
    
    // 출력 완료 플래그 정리
    isDisplaying = false;
}

export async function dialog(k, pos, content, options = {}) {
    // content 유효성 검사
    if (!content || !Array.isArray(content) || content.length === 0) {
        console.error("dialog: 유효하지 않은 content:", content);
        return;
    }

    // content 배열의 각 요소가 문자열인지 확인하고 필터링
    const validContent = content.filter(
        (item) =>
            item !== null &&
            item !== undefined &&
            typeof item === "string" &&
            item.trim().length > 0
    );

    // choice 객체가 있는지 확인 (문자열 대화 다음에 처리)
    let choiceObject = null;
    for (let i = 0; i < content.length; i++) {
        const item = content[i];
        if (item && typeof item === "object" && item.type === "choice") {
            choiceObject = item;
            break;
        }
    }

    if (validContent.length === 0) {
        console.error("dialog: 유효한 content가 없습니다:", content);
        return;
    }

    const font = options.font || "gameboy"; // 기본값은 gameboy
    const speakerName = options.speakerName || null;
    const speakerImage = options.speakerImage || null;

    // 수정된 부분: 현재 말하는 캐릭터 설정
    currentSpeaker = speakerName;
    currentVoiceProfile = STUDENT_VOICE_PROFILES[currentSpeaker] || {
        pitchMultiplier: 1.0,
        speedMultiplier: 1.0,
        volumeMultiplier: 1.0,
    };
    console.log(
        `[DEBUG] 대화 시작 - 현재 스피커: ${currentSpeaker}, 음성 프로필:`,
        currentVoiceProfile
    );

    // 수정된 부분: Promise로 감싸서 모든 대화가 끝날 때까지 기다림
    return new Promise(async (resolve) => {
        gameState.setFreezePlayer(true);

        // 수정된 부분: 다이얼로그 시작 시 BGM 덕킹 적용
        duckBgm(k);

        // 수정된 부분: 대화 시작 시 플레이어를 정적인 프레임으로 변경
        const player = k.get("player")[0];
        let originalFrame = null;
        if (player && player.exists()) {
            // 현재 프레임 저장
            originalFrame = player.frame;

            // 플레이어 움직임 즉시 정지
            if (player.body) {
                player.body.vel = k.vec2(0, 0);
            }

            // 수정된 부분: 걷는 애니메이션을 정지하고 idle 애니메이션으로 변경
            // 방향에 따라 적절한 idle 애니메이션으로 변경
            if (player.direction === "left") {
                player.play("player-idle-left");
            } else if (player.direction === "right") {
                player.play("player-idle-right");
            } else if (player.direction === "up") {
                player.play("player-idle-up");
            } else {
                player.play("player-idle-down");
            }
        }

        // 메인 다이얼로그 박스 (원래 크기로 복원)
        const dialogBox = k.add([
            k.rect(800, 200),
            k.pos(pos),
            k.fixed(),
            k.color(240, 240, 240), // 연한 회색 배경
            k.outline(4, k.rgb(128, 128, 128)), // 회색 테두리 (RGB 값으로 명시)
        ]);

        // 파일철 인덱스 마커 스타일 이름 탭 (다이얼로그 박스 위에 별도로)
        let nameTab = null;
        if (speakerName) {
            // 폰트 크기에 따른 더 정확한 탭 크기 계산
            const fontSize = gameState.getFontSize();
            const textWidth = k.formatText({
                text: speakerName,
                font: font,
                size: fontSize,
            }).width;
            const nameWidth = textWidth + 50; // 좌우 패딩 25px씩 (기존 30 → 50)

            nameTab = k.add([
                k.rect(nameWidth, 45), // 높이 증가: 35 → 45 (위아래 패딩 증가)
                k.pos(pos.x + 20, pos.y - 22), // 다이얼로그 박스 왼쪽 정렬
                k.fixed(),
                k.color(220, 220, 240), // 약간 다른 색상으로 구분
                // k.outline 제거 - 외곽선 없음
            ]);

            // 탭 안의 이름 텍스트 (탭 내부에서 왼쪽 정렬)
            nameTab.add([
                k.text(speakerName, {
                    font: font,
                    size: fontSize,
                }),
                k.color(50, 50, 150), // 진한 파란색
                k.pos(35, 22.5), // 패딩 증가: 25 → 35
                k.anchor("left"), // 앵커를 왼쪽으로 설정
                k.fixed(),
            ]);
        }

        // 이미지 표시 (있는 경우) - 다이얼로그 박스 내부
        let imageContainer = null;
        if (speakerImage) {
            try {
                imageContainer = dialogBox.add([
                    k.sprite(speakerImage),
                    k.pos(40, 40), // 패딩 더 증가: 30 → 40
                    k.scale(0.5), // 이미지 크기 조정
                    k.fixed(),
                ]);
            } catch (error) {
                console.log(`이미지 로드 실패: ${speakerImage}`);
            }
        }

        // 텍스트 위치 (이미지가 있으면 오른쪽으로 이동, 이름 탭과는 무관)
        const textXPos = speakerImage ? 160 : 40; // 패딩 더 증가: 30 → 40, 이미지있을때 140 → 160

        const textContainer = dialogBox.add([
            k.text("", {
                font: font,
                width: 700 - (speakerImage ? 140 : 0), // 전체 텍스트 영역 조정: 720 → 700, 이미지있을때 축소량 120 → 140
                lineSpacing: 15,
                size: gameState.getFontSize(),
            }),
            k.color(0, 0, 0),
            k.pos(textXPos, 40), // 패딩 더 증가: 30 → 40
            k.fixed(),
        ]);

        let index = 0;

        await displayLine(textContainer, validContent[index], k); // 수정된 부분: k 파라미터 추가
        let lineFinishedDisplayed = true;
        let isInputProcessing = false; // 입력 처리 중 플래그 추가

        // 전역 대화 상태 정보 설정 (front.js에서 접근 가능)
        window.dialogState = {
            lineFinishedDisplayed: lineFinishedDisplayed,
            isTypingSkipRequested: false
        };

        // 다이얼로그 종료 함수 - 수정된 부분
        const closeDialog = async () => {
            k.destroy(dialogBox);
            if (nameTab) k.destroy(nameTab); // 이름 탭도 함께 제거
            dialogKey.cancel();
            dialogGamepadA.cancel();
            dialogGamepadB.cancel();
            dialogKeyB.cancel(); // B키 핸들러도 정리

            // 수정된 부분: 다이얼로그 종료 시 BGM 덕킹 해제
            restoreBgm(k);

            // choice 객체가 있으면 choiceDialog 호출
            if (choiceObject) {
                console.log("🎯 대화 종료 후 Choice 객체 처리:", choiceObject);
                const choiceResult = await choiceDialog(k, pos, choiceObject.question, choiceObject.choices, options);
                gameState.setFreezePlayer(false);
                resolve(choiceResult);
            } else {
                gameState.setFreezePlayer(false);
                // 수정된 부분: 스프라이트 변환은 각 씬에서 직접 처리하므로 여기서는 바로 완료
                console.log("[DEBUG] 스프라이트 변환은 씬에서 직접 처리됨");
                resolve();
            }
        };

        // 키보드 입력
        const dialogKey = k.onKeyPress("space", async () => {
            if (!lineFinishedDisplayed || isInputProcessing) return;
            isInputProcessing = true;

            try {
                index++;
                if (!validContent[index]) {
                    closeDialog();
                    return;
                }

                textContainer.text = "";
                lineFinishedDisplayed = false;
                if (window.dialogState) window.dialogState.lineFinishedDisplayed = false;
                await displayLine(textContainer, validContent[index], k); // 수정된 부분: k 파라미터 추가
                lineFinishedDisplayed = true;
                if (window.dialogState) window.dialogState.lineFinishedDisplayed = true;
            } finally {
                isInputProcessing = false;
            }
        });

        // 게임패드 A버튼 (확인/다음) - 수정된 부분: south → east
        const dialogGamepadA = k.onGamepadButtonPress("east", async () => {
            console.log("🅰️ 대화 - A버튼 눌림 (확인/다음)");
            if (!lineFinishedDisplayed || isInputProcessing) return;
            isInputProcessing = true;

            try {
                index++;
                if (!validContent[index]) {
                    closeDialog();
                    return;
                }

                textContainer.text = "";
                lineFinishedDisplayed = false;
                if (window.dialogState) window.dialogState.lineFinishedDisplayed = false;
                await displayLine(textContainer, validContent[index], k); // 수정된 부분: k 파라미터 추가
                lineFinishedDisplayed = true;
                if (window.dialogState) window.dialogState.lineFinishedDisplayed = true;
            } finally {
                isInputProcessing = false;
            }
        });

        // 게임패드 B버튼 (텍스트 스킵 전용) - 수정된 부분: 취소 기능 제거
        const dialogGamepadB = k.onGamepadButtonPress("south", async () => {
            console.log("🅱️ 대화 - B버튼 눌림 (텍스트 스킵)");

            if (!lineFinishedDisplayed) {
                // 텍스트가 아직 출력 중이면 타이핑 스킵 요청
                isTypingSkipRequested = true;
                if (window.dialogState) window.dialogState.isTypingSkipRequested = true;
                // 잠시 대기 후 상태 업데이트
                setTimeout(() => {
                    lineFinishedDisplayed = true;
                    if (window.dialogState) window.dialogState.lineFinishedDisplayed = true;
                }, 50);
                return;
            }

            // B버튼은 이제 대화 취소 기능 없음 - 텍스트 스킵 전용
            console.log("🅱️ B버튼: 텍스트 출력 완료 상태에서는 동작하지 않음");
        });

        // 키보드 B키 (텍스트 스킵 전용) - 수정된 부분: 취소 기능 제거
        const dialogKeyB = k.onKeyPress("b", async () => {
            console.log("⌨️ 대화 - B키 눌림 (텍스트 스킵)");

            if (!lineFinishedDisplayed) {
                // 텍스트가 아직 출력 중이면 타이핑 스킵 요청
                isTypingSkipRequested = true;
                if (window.dialogState) window.dialogState.isTypingSkipRequested = true;
                // 잠시 대기 후 상태 업데이트
                setTimeout(() => {
                    lineFinishedDisplayed = true;
                    if (window.dialogState) window.dialogState.lineFinishedDisplayed = true;
                }, 50);
                return;
            }

            // B키는 이제 대화 취소 기능 없음 - 텍스트 스킵 전용
            console.log("⌨️ B키: 텍스트 출력 완료 상태에서는 동작하지 않음");
        });
    }); // Promise 닫기
}

// 선택 다이얼로그 함수 추가
export async function choiceDialog(k, pos, question, choices, options = {}) {
    return new Promise(async (resolve) => {
        gameState.setFreezePlayer(true);

        // 수정된 부분: 선택 다이얼로그 시작 시 BGM 덕킹 적용
        duckBgm(k);

        const font = options.font || "gameboy";
        const speakerName = options.speakerName || null;
        let selectedIndex = 0; // 수정된 부분: 기본 선택을 "아니오"로 변경

        // 질문이 문자열이면 배열로 변환, 배열이면 그대로 사용
        const questionLines = Array.isArray(question) ? question : [question];
        let currentQuestionIndex = 0;

        // 메인 다이얼로그 박스 - 수정된 부분: 크기 조정
        const dialogBox = k.add([
            k.rect(800, 200), // 수정된 부분: 220 → 200으로 일반 대화창과 동일하게
            k.pos(k.width() / 2, k.height() / 2), // 화면 중앙에 배치
            k.anchor("center"),
            k.fixed(),
            k.color(240, 240, 240),
            k.outline(4, k.rgb(128, 128, 128)),
            k.z(100),
        ]);

        // 발화자 이름 탭 추가 (dialog.js와 동일한 스타일)
        let nameTab = null;
        if (speakerName) {
            const fontSize = gameState.getFontSize();
            const tabWidth = Math.max(140, speakerName.length * fontSize * 0.6 + 90);
            const tabHeight = Math.max(45, fontSize + 25);

            nameTab = k.add([
                k.rect(tabWidth, tabHeight),
                k.pos(k.width() / 2 - 380, k.height() / 2 - 120), // 화면 중앙 기준으로 조정
                k.fixed(),
                k.color(220, 220, 240),
                k.outline(2, k.rgb(128, 128, 128)),
                k.z(101),
            ]);

            // 탭 안의 이름 텍스트 (중앙 정렬)
            nameTab.add([
                k.text(speakerName, {
                    font: font,
                    size: fontSize,
                }),
                k.color(50, 50, 150), // 진한 파란색
                k.pos(tabWidth / 2, 22.5), // 탭 중앙으로 위치 조정
                k.anchor("center"), // 중앙 정렬로 변경
                k.fixed(),
            ]);
        }

        // 질문 텍스트 - 수정된 부분: 텍스트 영역 확장
        const questionText = dialogBox.add([
            k.text("", {
                font: font,
                width: 740, // 수정된 부분: 540 → 740
                lineSpacing: 15,
                size: gameState.getFontSize(),
            }),
            k.color(0, 0, 0),
            k.pos(0, -40), // 10픽셀 더 아래로 내림 (-50 → -40)
            k.anchor("center"),
            k.fixed(),
        ]);

        // 선택지 컨테이너 - 처음에는 숨김
        const choiceContainer = dialogBox.add([
            k.pos(0, 30), // 중앙 기준으로 아래쪽에 배치
            k.anchor("center"),
            k.fixed(),
            k.opacity(0), // 처음에는 항상 숨김
        ]);

        // 수정된 부분: 첫 번째 질문 텍스트를 한글자씩 출력
        let isQuestionTyping = true; // 질문 타이핑 상태 추적
        await displayLine(questionText, questionLines[currentQuestionIndex], k);
        isQuestionTyping = false; // 타이핑 완료
        let questionFinished = currentQuestionIndex >= questionLines.length - 1;

        // 선택지 텍스트들 - 수정된 부분: 변수만 선언, 나중에 생성
        let choiceTexts = [];

        // 선택지 생성 함수 // 추가된 부분
        const createChoices = () => {
            if (choiceTexts.length === 0) {
                // 추가된 부분: 중복 생성 방지
                // 추가된 부분
                choiceTexts = choices.map((choice, index) => {
                    // 추가된 부분
                    return choiceContainer.add([
                        // 추가된 부분
                        k.text(
                            `${index === selectedIndex ? "▶ " : "  "}${typeof choice === 'string' ? choice : choice.text}`,
                            {
                                // 추가된 부분
                                font: font, // 추가된 부분
                                size: gameState.getFontSize(), // 추가된 부분
                            }
                        ), // 추가된 부분
                        k.color(
                            index === selectedIndex ? 50 : 100,
                            50,
                            index === selectedIndex ? 150 : 100
                        ), // 추가된 부분
                        k.pos(0, index * 40), // 추가된 부분
                        k.fixed(), // 추가된 부분
                    ]); // 추가된 부분
                }); // 추가된 부분
            } // 추가된 부분
        }; // 추가된 부분

        // 수정된 부분: 마지막 질문이면 바로 선택지 표시
        if (questionFinished) {
            createChoices(); // 추가된 부분
            choiceContainer.opacity = 1;
        }

        // 선택지 업데이트 함수
        const updateChoices = () => {
            if (choiceTexts.length > 0) {
                // 추가된 부분: 선택지가 생성된 경우에만 업데이트
                choiceTexts.forEach((text, index) => {
                    text.text = `${index === selectedIndex ? "▶ " : "  "}${
                        typeof choices[index] === 'string' ? choices[index] : choices[index].text
                    }`;
                    text.color = k.rgb(
                        index === selectedIndex ? 50 : 100,
                        50,
                        index === selectedIndex ? 150 : 100
                    );
                });
            }
        };

        // 다이얼로그 종료 함수
        const closeDialog = async (result) => {
            k.destroy(dialogBox);
            if (nameTab) k.destroy(nameTab); // nameTab도 함께 제거
            upKey.cancel();
            downKey.cancel();
            spaceKey.cancel();
            gamepadUpKey.cancel();
            gamepadDownKey.cancel();
            gamepadSelectKey.cancel();
            gamepadCancelKey.cancel(); // 수정된 부분: 새로 추가된 B버튼 이벤트 정리
            gameState.setFreezePlayer(false);

            // 수정된 부분: 선택 다이얼로그 종료 시 BGM 덕킹 해제
            restoreBgm(k);

            // 선택지 action 실행
            if (result && result.action && typeof result.action === 'function') {
                console.log("🎯 선택지 action 실행:", result.text);
                try {
                    await result.action();
                } catch (error) {
                    console.error("❌ 선택지 action 실행 중 오류:", error);
                }
            }

            // URL이 있으면 새 창에서 열기
            if (result && result.url) {
                console.log("🌐 URL 열기:", result.url);
                try {
                    window.open(result.url, "_blank");
                } catch (error) {
                    console.error("❌ URL 열기 실패:", error);
                }
            }

            resolve(result);
        };

        // 질문 진행 함수
        const nextQuestion = async () => {
            if (!questionFinished) {
                currentQuestionIndex++;
                if (currentQuestionIndex < questionLines.length) {
                    questionText.text = "";
                    isQuestionTyping = true; // 타이핑 시작
                    await displayLine(
                        questionText,
                        questionLines[currentQuestionIndex],
                        k
                    );
                    isQuestionTyping = false; // 타이핑 완료

                    // 수정된 부분: 마지막 질문이 타이핑 완료되면 바로 선택지 표시
                    if (currentQuestionIndex >= questionLines.length - 1) {
                        questionFinished = true;
                        createChoices(); // 추가된 부분: 선택지 생성
                        choiceContainer.opacity = 1;
                    }
                }
            }
        };

        // 키보드 입력 - 위/아래 (질문이 끝났을 때만)
        const upKey = k.onKeyPress("up", () => {
            if (!questionFinished || isQuestionTyping) return; // 타이핑 중이면 무시
            k.play("boop-sfx");
            selectedIndex =
                (selectedIndex - 1 + choices.length) % choices.length;
            updateChoices();
        });

        const downKey = k.onKeyPress("down", () => {
            if (!questionFinished || isQuestionTyping) return; // 타이핑 중이면 무시
            k.play("boop-sfx");
            selectedIndex = (selectedIndex + 1) % choices.length;
            updateChoices();
        });

        // 키보드 입력 - 스페이스 (질문 진행 또는 선택)
        const spaceKey = k.onKeyPress("space", async () => {
            if (isQuestionTyping) return; // 타이핑 중이면 무시
            if (!questionFinished) {
                await nextQuestion();
            } else {
                k.play("confirm-beep-sfx");
                await closeDialog(selectedIndex); // 🔥 수정: 인덱스 반환
            }
        });

        // 게임패드 입력
        const gamepadUpKey = k.onGamepadButtonPress("dpad-up", () => {
            if (!questionFinished || isQuestionTyping) return; // 타이핑 중이면 무시
            k.play("boop-sfx");
            selectedIndex =
                (selectedIndex - 1 + choices.length) % choices.length;
            updateChoices();
        });

        const gamepadDownKey = k.onGamepadButtonPress("dpad-down", () => {
            if (!questionFinished || isQuestionTyping) return; // 타이핑 중이면 무시
            k.play("boop-sfx");
            selectedIndex = (selectedIndex + 1) % choices.length;
            updateChoices();
        });

        // 수정된 부분: A버튼(east) - 확인/선택
        const gamepadSelectKey = k.onGamepadButtonPress("east", async () => {
            if (isQuestionTyping) return; // 타이핑 중이면 무시
            if (!questionFinished) {
                await nextQuestion();
            } else {
                k.play("confirm-beep-sfx");
                await closeDialog(selectedIndex); // 🔥 수정: 인덱스 반환
            }
        });

        // 수정된 부분: B버튼(south) - 취소 (선택 다이얼로그에서는 null 반환)
        const gamepadCancelKey = k.onGamepadButtonPress("south", async () => {
            if (isQuestionTyping) return; // 타이핑 중이면 무시
            
            // preventBCancel 옵션 확인
            if (options.preventBCancel) {
                console.log("🚫 choiceDialog B버튼 취소가 비활성화됨");
                return;
            }
            
            k.play("confirm-beep-sfx");
            await closeDialog(null); // null로 취소를 나타냄
        });
    });
}
