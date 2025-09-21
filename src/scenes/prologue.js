import { gameState, globalState } from "../state/stateManagers.js";
import { colorizeBackground, audioManager } from "../utils.js";
import { gameDataManager } from "../systems/gameDataManager.js";

export default function prologue(k) {
    console.log("🎭 Prologue 씬 시작");
    
    
    // 검은색 배경
    colorizeBackground(k, 0, 0, 0);
    
    // 문서 배경도 검은색으로 설정
    document.body.style.backgroundColor = 'black';
    
    // JavaScript로 페이드 인 효과
    const fadeInOverlay = document.createElement('div');
    fadeInOverlay.style.position = 'fixed';
    fadeInOverlay.style.top = '0';
    fadeInOverlay.style.left = '0';
    fadeInOverlay.style.width = '100vw';
    fadeInOverlay.style.height = '100vh';
    fadeInOverlay.style.backgroundColor = 'black';
    fadeInOverlay.style.opacity = '1';
    fadeInOverlay.style.zIndex = '10000';
    fadeInOverlay.style.pointerEvents = 'none';
    fadeInOverlay.style.transition = 'opacity 2s ease-out';
    document.body.appendChild(fadeInOverlay);
    
    console.log("🌅 페이드 인 시작 (JavaScript)");
    
    // 페이드 인 시작
    setTimeout(() => {
        fadeInOverlay.style.opacity = '0';
        console.log("🌅 페이드 진행: 시작");
    }, 50);
    
    // 페이드 인 완료 후 오버레이 제거
    setTimeout(() => {
        console.log("✨ Prologue Fade In 완료");
        if (fadeInOverlay && fadeInOverlay.parentNode) {
            document.body.removeChild(fadeInOverlay);
        }
    }, 2100); // 2초 + 여유 시간
    
    // 문서 배경도 검은색으로 설정
    document.body.style.backgroundColor = 'black';

    // tutorial.js처럼 검은 배경 + pattern_lightgreen 사용
    colorizeBackground(k, 0, 0, 0);
    
    // tutorial.js와 동일한 패턴 배경 추가
    const patterns = [];
    const patternSize = 1280;
    
    console.log("화면 크기:", k.width(), "x", k.height());
    
    const screenWidth = k.width();
    const screenHeight = k.height();
    const extraPadding = patternSize;
    
    console.log("실제 렌더링 영역:", screenWidth, "x", screenHeight);
    
    // tutorial.js와 동일한 패턴 배치
    for (let x = -extraPadding; x <= screenWidth + extraPadding; x += patternSize) {
        for (let y = -extraPadding; y <= screenHeight + extraPadding; y += patternSize) {
            const pattern = k.add([
                k.sprite("pattern_purple"), // pattern_purple 사용
                k.pos(x, y),
                k.z(0),
                k.fixed(),
            ]);
            patterns.push(pattern);
        }
    }
    
    console.log("패턴 생성 완료, 총 패턴 수:", patterns.length);

    // tutorial.js와 동일한 패턴 애니메이션
    const patternSpeed = 30;
    k.onUpdate(() => {
        patterns.forEach(pattern => {
            pattern.pos.x -= patternSpeed * k.dt();
            pattern.pos.y += patternSpeed * k.dt();
            
            if (pattern.pos.x <= -patternSize) {
                pattern.pos.x += patternSize * Math.ceil((screenWidth + extraPadding * 2) / patternSize);
            }
            if (pattern.pos.y >= screenHeight + patternSize) {
                pattern.pos.y -= patternSize * Math.ceil((screenHeight + extraPadding * 2) / patternSize);
            }
        });
    });

    const currentLocale = gameState.getLocale() ?? "korean";
    const currentFont = "galmuri";

    // 프롤로그 대화 내용
    const prologueLines = [
        { text: "지각!!! ", type: "dialogue", speaker: "???" },
        { text: "지각이야 빨리 들어가!!!", type: "dialogue", speaker: "???" },
        { text: "거기 학생!!! 학생 이름이 뭐라고 했지?", type: "dialogue", speaker: "???" },
        { text: "(...뭐라고 하는거야...)", type: "thought" },
        { text: "(...그리고 웬 반말...?)", type: "thought" },
        { text: "(일단 대답은 하자...)", type: "thought" },
        { text: "먼저, 성을 알려주자!", type: "question", speaker: "플레이어" },
        { text: "이름을 알려주자!", type: "question", speaker: "플레이어" },
        { text: "저는...full_name인데요...", type: "dialogue", speaker: "full_name" }, // 학생의 이름 
        { text: "(...)", type: "thought", speaker: "full_name" },
        { text: "(...뭐지...? 꿈인가...)", type: "thought", speaker: "full_name" },
         { text: "(물어보길래 대답은 했는데...)", type: "thought", speaker: "full_name" },
        { text: "(그보다 내가 학생이라고?)", type: "thought", speaker: "full_name" },
        { text: "(아닌데... 난 분명...)", type: "thought", speaker: "full_name" },
        { text: "...", type: "pause" },
        { text: "뭘 가만히 서있는거야 학생! 이미 지각이야. ", type: "dialogue", speaker: "???" }, // 학생의 이름 
        { text: "당장 안들어가?! full_name 학생!!!", type: "dialogue", speaker: "???" }, // 학생의 풀네임
        { text: "(뭐지...? 난 분명...)", type: "thought", speaker: "full_name" },
         { text: "(쇼케이스 전시장이었는데...!)", type: "thought", speaker: "full_name" },
        { text: "(일단 가보자...!)", type: "thought", speaker: "full_name" }
    ];

    let currentLineIndex = 0;
    let isTyping = false;
    let canProceed = false;
    let typingSpeed = 50; // 타이핑 속도 (ms)
    let skipTyping = false; // 타이핑 스킵 플래그
    
    // 전체 콘텐츠를 위로 이동시켜 더 중앙에 배치
    const contentOffsetY = -80; // 전체 콘텐츠를 80px 위로 이동

    // 플레이어 스프라이트 (텍스트 위쪽 중앙)
    let playerSprite = null;
    try {
        playerSprite = k.add([
            k.sprite("front-assets", { 
                frame: 1015, // main.js의 player-idle-down 프레임 사용
            }),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y - 100), // 캐릭터를 화면 가운데로 배치
            k.scale(3), // 크기 3배로 확대
            k.z(50), // 대화창보다 앞에 배치하여 확실히 보이게
        ]);
        console.log("✅ 플레이어 스프라이트 생성 완료 (프레임 1015)");
    } catch (error) {
        console.error("❌ 플레이어 스프라이트 생성 실패:", error);
        // 대체 스프라이트 생성 (단순한 사각형)
        playerSprite = k.add([
            k.rect(60, 90),
            k.anchor("center"),
            k.pos(k.center().x, k.center().y - 100),
            k.color(100, 150, 255), // 파란색 사각형
            k.z(50),
        ]);
        console.log("✅ 대체 플레이어 스프라이트 생성 완료");
    }

    // 대화창 UI 요소들 (튜토리얼 스타일)
    let dialogBox = null;
    let dialogText = null;
    let nameText = null;
    let nameOutlines = [];

    // 이름 입력용 기존 UI 요소들 (6, 7번 라인에서만 사용)
    let speakerText = k.add([
        k.text("", { 
            size: 24, // 24 → 20 (4 감소)
            font: currentFont,
            styles: {
                "bold": () => ({ color: k.rgb(165, 31, 213) })
            }
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 80 + contentOffsetY),
        k.color(165, 31, 213),
        k.z(10),
        k.opacity(0) // 기본적으로 숨김
    ]);

    let currentText = k.add([
        k.text("", { 
            size: 29,
            font: currentFont,
            width: k.width() - 100,
            align: "center"
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + contentOffsetY),
        k.color(50, 50, 50),
        k.z(10),
        k.opacity(0) // 기본적으로 숨김
    ]);

    // 프롬프트 표시 (키 입력 대기)
    let promptText = k.add([
        k.text("▼ 스페이스를 누르세요", { 
            size: 20, // 18 → 20 (10% 추가 증가)
            font: currentFont 
        }),
        k.anchor("topright"),
        k.pos(k.width() - 40, 40),
        k.color(150, 150, 150),
        k.opacity(0),
        k.z(10), // z-index 높게 설정
    ]);

    // 이름 입력 관련
    let playerLastName = ""; // 성
    let playerFirstName = ""; // 이름
    let playerName = ""; // 전체 이름
    let isInputting = false;
    let inputStep = 0; // 0: 성 입력, 1: 이름 입력
    let hiddenInput = null; // HTML input 엘리먼트
    let inputText = k.add([
        k.text("", { 
            size: 24, // 26에서 24로 2만큼 줄임
            font: currentFont 
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 40),
        k.color(50, 50, 50), // 살짝 옅은 검은색으로 변경
        k.opacity(0),
        k.z(10), // z-index 높게 설정
    ]);

    let inputPrompt = k.add([
        k.text("", { 
            size: 17, // 19에서 17로 2만큼 줄임
            font: currentFont 
        }),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y + 122), // 120에서 122로 2px 아래로
        k.color(165, 31, 213), // 보라색으로 변경
        k.opacity(0),
        k.z(10), // z-index 높게 설정
    ]);

    // 한글 호격조사 판단 함수
    function getKoreanVocative(name) {
        if (!name) return name;
        
        const lastChar = name.charAt(name.length - 1);
        const lastCharCode = lastChar.charCodeAt(0);
        
        // 한글 완성형 범위 확인 (가-힣)
        if (lastCharCode >= 0xAC00 && lastCharCode <= 0xD7A3) {
            // 받침 여부 확인 (유니코드 계산)
            const base = lastCharCode - 0xAC00;
            const jongseong = base % 28; // 받침 (종성)
            
            if (jongseong === 0) {
                // 받침이 없으면 "야"
                return name + "야";
            } else {
                // 받침이 있으면 "아"
                return name + "아";
            }
        }
        
        // 한글이 아니면 그대로 반환
        return name;
    }

    // 이름 유효성 검사 함수
    function isValidName(name) {
        // 한글(가-힣, ㄱ-ㅎ, ㅏ-ㅣ) 또는 영어(a-z, A-Z)만 허용
        const koreanEnglishRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z]+$/;
        return koreanEnglishRegex.test(name.trim());
    }

    // 최종 제출용 유효성 검사 (완성된 한글만)
    function isValidFinalName(name) {
        // 완성된 한글(가-힣) 또는 영어(a-z, A-Z)만 허용
        const finalRegex = /^[가-힣a-zA-Z]+$/;
        return finalRegex.test(name.trim());
    }

    // 대화창 생성 함수 (tutorial.js와 동일한 스타일과 위치)
    // ⚠️ 중요: 이 함수로 생성되는 모든 요소들은 fade out 시 함께 사라져야 함
    // dialogBox, dialogText, nameText 등은 반드시 fade out 로직에 포함되어야 함
    function createDialogBox() {
        console.log("🎭 대화창 생성 시작");
        // 대화창 배경 (tutorial.js와 동일한 위치와 크기)
        dialogBox = k.add([
            k.rect(800, 200), // 튜토리얼과 동일한 크기
            k.pos(k.center().x - 400, k.height() - 220), // 튜토리얼과 동일한 위치
            k.color(240, 240, 240), // dialog.js와 동일한 연한 회색 배경
            k.outline(4, k.rgb(128, 128, 128)), // dialog.js와 동일한 회색 테두리
            k.z(2000),
            k.fixed(),
            "prologueDialog"
        ]);
        console.log("✅ 대화창 배경 생성 완료");
        
        // 이름 탭 배경 (tutorial.js와 동일한 위치)
        k.add([
            k.rect(140, 45), // dialog.js와 동일한 높이
            k.pos(k.center().x - 380, k.height() - 242), // 튜토리얼과 동일한 위치
            k.color(220, 220, 240), // dialog.js와 동일한 색상
            k.z(2002),
            k.fixed(),
            "prologueDialog"
        ]);
        
        // 이름 텍스트 외곽선 (8방향) - dialog.js와 완전 동일
        const outlineOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1,  0],          [1,  0],
            [-1,  1], [0,  1], [1,  1]
        ];
        
        // nameOutlines 초기화 (호환성 유지)
        nameOutlines = [];
        
        // 이름 탭 생성 (기본 크기 사용)
        let nameTabWidth = 140; // 기본 크기
        
        const nameTab = k.add([
            k.rect(nameTabWidth, 45), // dialog.js와 동일한 높이
            k.pos(k.center().x - 380, k.height() - 242), // tutorial.js와 동일한 위치
            k.fixed(),
            k.color(220, 220, 240), // 탭 배경색
            k.outline(2, k.rgb(128, 128, 128)), // 회색 테두리
            k.z(2004),
            "prologueDialog"
        ]);
        
        // 이름 텍스트를 탭 안에 배치 (dialog.js와 동일하게 중앙 정렬)
        // ⚠️ 절대 수정 금지: 이 설정은 front.js의 dialog.js와 일치시키기 위한 것임
        nameText = nameTab.add([
            k.text("???", {
                size: 18, // tutorial.js와 동일한 크기
                font: "galmuri"
            }),
            k.color(50, 50, 150), // 진한 파란색
            k.pos(nameTabWidth / 2, 22.5), // 탭 중앙에 배치 (dialog.js 스타일)
            k.anchor("center"), // 중앙 정렬로 변경 (front.js의 dialog.js와 일치)
            k.fixed(),
            "prologueDialog"
        ]);
        
        dialogText = k.add([
            k.text("", {
                size: 26, // 23 → 26 (tutorial.js와 동일한 크기)
                font: "galmuri",
                width: 700 // tutorial.js와 동일한 width
            }),
            k.pos(k.center().x - 360, k.height() - 180), // tutorial.js와 동일한 상대 위치 (40, 40)
            k.color(0, 0, 0), // dialog.js와 동일한 검은색
            k.z(2004),
            k.fixed(),
            "prologueDialog"
        ]);
    }
    
    // 대화창 제거 함수
    function removeDialogBox() {
        k.destroyAll("prologueDialog");
        dialogBox = null;
        dialogText = null;
        nameText = null;
        nameOutlines = [];
    }

    // 타이핑 효과 함수
    function typeText(line) {
        isTyping = true;
        canProceed = false;
        
        // line 객체가 유효한지 확인
        if (!line) {
            console.error("typeText: line 객체가 정의되지 않았습니다.");
            isTyping = false;
            canProceed = true;
            return;
        }
        
        // line.type이 없는 경우 기본값 설정
        if (typeof line.type === 'undefined') {
            console.warn("typeText: line.type이 정의되지 않았습니다. 기본값 'dialog'로 설정합니다.");
            line.type = 'dialog';
        }
        
        console.log(`현재 라인 인덱스: ${currentLineIndex}, 타입: ${line.type}, 텍스트: ${line.text}`);
        
        // 이름 입력 라인(6, 7)인지 확인
        const isNameInputLine = currentLineIndex === 6 || currentLineIndex === 7;
        // question 타입인지 확인 (캐릭터 아래 텍스트)
        const isQuestionLine = line.type === "question";
        
        if (isNameInputLine) {
            // 이름 입력 라인은 우선적으로 처리 - 캐릭터 아래 작은 텍스트
            removeDialogBox(); // 대화창 제거
            
            // currentText 숨기고 별도 텍스트 사용
            currentText.opacity = 0;
            
            // 새로운 작은 텍스트 생성 (매번 새로 만들지 않고 체크)
            if (k.get("nameInputText").length > 0) {
                k.destroyAll("nameInputText");
            }
            
            const nameInputText = k.add([
                k.text("", { 
                    size: 21, // 24에서 21로 변경 (3만큼 감소) 
                    font: currentFont,
                    width: k.width() - 100,
                    align: "center"
                }),
                k.anchor("center"),
                k.pos(k.center().x, k.center().y - 20), // 캐릭터 위쪽
                k.color(80, 80, 80), // 약간 다른 색상
                k.z(10),
                k.opacity(1),
                "nameInputText"
            ]);
            
            // 이후 타이핑에서 nameInputText 사용
            currentText = nameInputText;
            
            speakerText.opacity = 0; // 화자 표시 없음
        } else if (isQuestionLine) {
            // question 타입은 캐릭터 아래 작은 텍스트
            removeDialogBox(); // 대화창 제거
            
            // currentText 숨기고 별도 텍스트 사용
            currentText.opacity = 0;
            
            // 새로운 작은 텍스트 생성
            if (k.get("questionText").length > 0) {
                k.destroyAll("questionText");
            }
            
            const questionText = k.add([
                k.text("", { 
                    size: 21, // 24에서 21로 변경 (3만큼 감소) 
                    font: currentFont,
                    width: k.width() - 100,
                    align: "center"
                }),
                k.anchor("center"),
                k.pos(k.center().x, k.center().y - 20), // 캐릭터 위쪽
                k.color(80, 80, 80), // 약간 다른 색상
                k.z(10),
                k.opacity(1),
                "questionText"
            ]);
            
            // 이후 타이핑에서 questionText 사용
            currentText = questionText;
            
            speakerText.opacity = 0; // 화자 표시 없음
        } else {
            // 일반 대화는 대화창 사용
            // 특별 텍스트들 정리
            k.destroyAll("nameInputText");
            k.destroyAll("questionText");
            
            // 원래 currentText 복원 (크기 29, 원래 위치)
            currentText.opacity = 0; // currentText 숨김 (대화창 사용)
            speakerText.opacity = 0;
            
            if (!dialogBox) {
                createDialogBox();
            }
            
            dialogText.text = "";
            
            // 화자 설정 (tutorialDialog.js와 동일한 방식)
            let displaySpeaker = "???";
            if ((line.type === "dialogue" || line.type === "thought") && line.speaker) {
                displaySpeaker = line.speaker;
                if (displaySpeaker === "full_name" && playerName) {
                    displaySpeaker = playerName;
                }
            }
            
            // 이름 텍스트와 외곽선 모두 업데이트
            nameText.text = displaySpeaker;
            nameOutlines.forEach(outline => {
                outline.text = displaySpeaker;
            });
        }

        let displayText = line.text;
        // 플레이어 이름 치환
        if (displayText.includes("first_name") || displayText.includes("full_name")) {
            // first_name아! - 이름에 호격조사 추가
            if (displayText.includes("first_name아!") && playerFirstName) {
                const nameWithVocative = getKoreanVocative(playerFirstName);
                displayText = displayText.replace(/first_name아!/g, nameWithVocative + "!");
            }
            // first_name - 이름만
            else if (displayText.includes("first_name") && playerFirstName) {
                displayText = displayText.replace(/first_name/g, playerFirstName);
            }
            // full_name - 풀네임 (성+이름)
            if (displayText.includes("full_name") && playerName) {
                displayText = displayText.replace(/full_name/g, playerName);
            }
        }

        let charIndex = 0;
        
        function addChar() {
            // 스킵이 요청되면 즉시 전체 텍스트 표시
            if (skipTyping) {
                if (isNameInputLine || isQuestionLine) {
                    currentText.text = displayText;
                } else {
                    dialogText.text = displayText;
                }
                charIndex = displayText.length;
                skipTyping = false; // 스킵 플래그 리셋
                
                // 타이핑 완료 처리
                isTyping = false;
                canProceed = true;
                
                // 프롬프트 표시 (이름 입력이 아닐 때만)
                if (!isInputting) {
                    promptText.opacity = 1;
                    // 프롬프트 깜빡임 효과
                    const blinkLoop = k.loop(0.8, () => {
                        if (!isTyping && canProceed && !isInputting) {
                            promptText.opacity = promptText.opacity > 0 ? 0 : 1;
                        } else {
                            blinkLoop.cancel();
                        }
                    });
                }
                return;
            }
            
            if (charIndex < displayText.length) {
                // 라인 타입에 따라 다른 텍스트 요소 사용
                if (isNameInputLine || isQuestionLine) {
                    currentText.text = displayText.substring(0, charIndex + 1);
                } else {
                    dialogText.text = displayText.substring(0, charIndex + 1);
                }
                charIndex++;
                
                // 타이핑 효과음 재생
                if (charIndex % 2 === 0) { // 2글자마다 효과음
                    k.play("talk-sfx");
                }
                
                k.wait(typingSpeed / 1000, addChar);
            } else {
                // 타이핑 완료
                isTyping = false;
                canProceed = true;
                
                // 프롬프트 표시 (이름 입력이 아닐 때만)
                if (!isInputting) {
                    promptText.opacity = 1;
                    // 프롬프트 깜빡임 효과
                    const blinkLoop = k.loop(0.8, () => {
                        if (!isTyping && canProceed && !isInputting) {
                            promptText.opacity = promptText.opacity > 0 ? 0 : 1;
                        } else {
                            blinkLoop.cancel();
                        }
                    });
                }
            }
        }
        
        addChar();
    }

    // 이름 입력 처리
    function startNameInput() {
        isInputting = true;
        inputText.opacity = 1;
        inputPrompt.opacity = 1;
        promptText.opacity = 0;
        
        console.log("이름 입력 시작 - isInputting을 true로 설정");
        
        // 프롬프트 텍스트를 단계에 따라 설정
        if (inputStep === 0) {
            inputPrompt.text = "성을 입력하고 ENTER를 누르세요 (한글/영어 1자 이상)";
        } else {
            inputPrompt.text = "이름을 입력하고 ENTER를 누르세요 (한글/영어 1자 이상)";
        }
        
        // HTML input 엘리먼트 생성
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'text';
        hiddenInput.maxLength = 10;
        hiddenInput.style.position = 'absolute';
        hiddenInput.style.left = '-9999px';
        hiddenInput.style.opacity = '0';
        document.body.appendChild(hiddenInput);
        
        // 한글 입력 이벤트 처리
        hiddenInput.addEventListener('input', (e) => {
            const currentInput = e.target.value;
            
            // 입력 중에는 한글 조합 문자도 허용 (실시간 검증 완화)
            if (currentInput && currentInput.length > 0) {
                // 기본 검증: 매우 명백한 잘못된 문자만 차단 (숫자, 특수문자)
                const invalidChars = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
                if (invalidChars.test(currentInput)) {
                    // 유효하지 않은 문자가 포함된 경우 마지막 문자 제거
                    const validInput = currentInput.slice(0, -1);
                    e.target.value = validInput;
                    
                    if (inputStep === 0) {
                        playerLastName = validInput;
                        inputText.text = "> " + playerLastName + "_";
                    } else {
                        playerFirstName = validInput;
                        inputText.text = "> " + playerFirstName + "_";
                    }
                    
                    // 경고 색상 표시
                    inputText.color = k.rgb(146, 69, 169); // 보라색으로 변경
                    k.wait(0.3, () => {
                        inputText.color = k.rgb(50, 50, 50); // 살짝 옅은 검은색으로 복구
                    });
                    return;
                }
            }
            
            if (inputStep === 0) {
                // 성 입력 중
                playerLastName = currentInput;
                inputText.text = "> " + playerLastName + "_";
            } else {
                // 이름 입력 중
                playerFirstName = currentInput;
                inputText.text = "> " + playerFirstName + "_";
            }
            console.log("현재 입력:", currentInput);
        });
        
        // Enter 키 처리 (HTML input에서만)
        hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // 기본 동작 방지
                e.stopPropagation(); // 이벤트 버블링 방지
                handleNameSubmit();
            }
            // 다른 키들은 브라우저 이벤트로 전파되지 않도록 차단
            e.stopPropagation();
        });
        
        // 포커스 설정
        setTimeout(() => {
            hiddenInput.focus();
        }, 100);
        
        if (inputStep === 0) {
            inputText.text = "> " + playerLastName + "_";
        } else {
            inputText.text = "> " + playerFirstName + "_";
        }
        console.log("이름 입력 시작 - 단계:", inputStep);
        
        // 깜빡이는 커서 효과
        const cursorLoop = k.loop(0.5, () => {
            if (isInputting) {
                const currentName = inputStep === 0 ? playerLastName : playerFirstName;
                const cursorVisible = inputText.text.endsWith("_");
                inputText.text = "> " + currentName + (cursorVisible ? " " : "_");
            } else {
                cursorLoop.cancel();
            }
        });
    }
    
    // 이름 제출 처리
    function handleNameSubmit() {
        if (inputStep === 0) {
            // 성 입력 처리 (1자 이상, 한글/영어만)
            if (playerLastName.trim().length >= 1 && isValidFinalName(playerLastName)) {
                // 성 입력 완료, 다음 단계 준비
                console.log("성 입력 완료:", playerLastName);
                cleanupInput();
                
                // 다음 라인 (이름 입력)으로
                k.wait(0.5, () => {
                    proceedToNext();
                });
            } else {
                // 성이 1자 미만이거나 유효하지 않을 때 경고 메시지
                if (playerLastName.trim().length < 1) {
                    console.log("성은 1자 이상 입력해야 합니다.");
                } else {
                    console.log("성은 한글 또는 영어로만 입력해야 합니다.");
                }
                inputText.color = k.rgb(165, 31, 213); // 보라색으로 변경
                k.wait(0.5, () => {
                    inputText.color = k.rgb(50, 50, 50); // 살짝 옅은 검은색으로 복구
                });
            }
        } else {
            // 이름 입력 처리 (1자 이상, 한글/영어만)
            if (playerFirstName.trim().length >= 1 && isValidFinalName(playerFirstName)) {
                // 이름 입력 완료
                playerName = playerLastName + playerFirstName; // 성+이름 합치기
                console.log("이름 입력 완료:", playerName);
                
                cleanupInput();
                
                // 이름 저장
                savePlayerData();
                
                // 다음 라인으로
                k.wait(0.5, () => {
                    proceedToNext();
                });
            } else {
                // 이름이 1자 미만이거나 유효하지 않을 때 경고 메시지
                if (playerFirstName.trim().length < 1) {
                    console.log("이름은 1자 이상 입력해야 합니다.");
                } else {
                    console.log("이름은 한글 또는 영어로만 입력해야 합니다.");
                }
                inputText.color = k.rgb(165, 31, 213); // 보라색으로 변경
                k.wait(0.5, () => {
                    inputText.color = k.rgb(50, 50, 50); // 살짝 옅은 검은색으로 복구
                });
            }
        }
    }

    // HTML input 정리 함수
    function cleanupInput() {
        isInputting = false;
        inputText.opacity = 0;
        inputPrompt.opacity = 0;
        
        console.log("입력 정리 - isInputting을 false로 설정");
        
        // HTML input 엘리먼트 제거
        if (hiddenInput) {
            document.body.removeChild(hiddenInput);
            hiddenInput = null;
        }
    }

    // 이름 저장 함수 (gameDataManager 사용)
    async function savePlayerData() {
        try {
            // gameDataManager로 새 플레이어 생성
            const newSaveData = gameDataManager.createSaveData(playerName);
            newSaveData.gameState.currentScene = "prologue";
            newSaveData.gameState.introCompleted = false;
            newSaveData.gameState.tutorialCompleted = false;
            newSaveData.gameState.prologueCompleted = true;
            
            const saveResult = gameDataManager.saveToBrowser(newSaveData);
            
            if (saveResult) {
                console.log("✅ gameDataManager 저장 완료:", {
                    playerName: playerName,
                    saveId: newSaveData.id,
                    timestamp: new Date().toISOString()
                });
            }
            
            // gameState와 globalState에 플레이어 이름 설정
            console.log(`🔍 플레이어 이름 설정: "${playerName}"`);
            gameState.playerName = playerName;
            globalState.setPlayerName(playerName);
            console.log(`✅ globalState에 저장된 이름: "${globalState.getPlayerName()}"`);
            
            console.log("🎉 플레이어 데이터 저장 완료!");
            
        } catch (error) {
            console.error("❌ 저장 중 오류:", error);
            // fallback으로 최소한 gameState와 globalState에는 저장
            console.log(`🔍 fallback - 플레이어 이름 설정: "${playerName}"`);
            gameState.playerName = playerName;
            globalState.setPlayerName(playerName);
            console.log(`✅ fallback - globalState에 저장된 이름: "${globalState.getPlayerName()}"`);
        }
    }

    // 다음 라인으로 진행
    function proceedToNext() {
        console.log(`proceedToNext 호출: canProceed: ${canProceed}, isTyping: ${isTyping}, isInputting: ${isInputting}`);
        console.log(`현재 라인 인덱스: ${currentLineIndex}, 총 라인 수: ${prologueLines.length}`);
        
        // 조건 체크: 타이핑 중이거나 진행할 수 없거나 이름 입력 중이면 리턴
        if (!canProceed || isTyping || isInputting) {
            console.log("진행 조건 불충족 - 리턴");
            return;
        }
        
        // 배열 범위를 벗어났는지 미리 확인
        if (currentLineIndex >= prologueLines.length - 1) {
            console.log("프롤로그 마지막 라인에 도달함 - 프롤로그 종료 처리 시작");
            
            // 플레이어 이름 저장
            const fullName = (playerLastName + playerFirstName).trim();
            if (fullName) {
                gameState.playerName = fullName;
                console.log(`플레이어 이름 저장: ${fullName}`);
            }
            
            // 프롤로그 종료 처리 시작
            canProceed = false; // 추가 진행 방지
            isTyping = false;
            
            // 약간의 지연 후 종료 처리 시작
            k.wait(1, () => {
                console.log("🎵 프롤로그 종료 - BGM 볼륨 페이드 아웃과 화면 페이드아웃 동시 시작");
                
                // BGM 볼륨을 0으로 서서히 감소 (1.5초 동안)
                if (audioManager.isBGMPlaying()) {
                    const currentVolume = audioManager.currentBGMElement?.volume || 0;
                    console.log(`🔊 BGM 볼륨 페이드: ${currentVolume.toFixed(2)} → 0.00`);
                    audioManager.fadeBGMVolume(0, 1500); // 1.5초 동안 0으로 페이드
                }
                
                console.log("🌙 Prologue Fade Out 시작");
                
                // 모든 대화 관련 요소들을 동시에 페이드 아웃
                const fadeOutDuration = 1.5;
                const elementsToFadeOut = [
                    dialogBox,
                    dialogText,
                    nameText,
                    ...nameOutlines,
                    ...k.get("nameInputText"),
                    ...k.get("questionText"),
                    ...k.get("dialog-element") // 모든 대화 요소 포함
                ];
                
                // 모든 대화 요소들이 페이드 아웃과 동시에 투명해져야 함
                elementsToFadeOut.forEach(element => {
                    if (element && element.exists && element.exists() && element.opacity !== undefined) {
                        k.tween(element.opacity, 0, fadeOutDuration, (val) => {
                            if (element && element.exists && element.exists() && element.opacity !== undefined) {
                                element.opacity = val;
                            }
                        });
                    }
                });
                
                // 페이드 아웃 효과 (BGM 페이드와 동시에 시작)
                const fadeOut = k.add([
                    k.rect(k.width(), k.height()),
                    k.pos(0, 0),
                    k.color(0, 0, 0),
                    k.opacity(0),
                    k.z(9999), // 대화창(z-index 2000+)보다 훨씬 높게 설정
                    k.fixed(),
                ]);
                
                // 페이드 아웃 애니메이션 (1.5초)
                k.tween(fadeOut.opacity, 1, 1.5, (val) => {
                    fadeOut.opacity = val;
                }).then(() => {
                    console.log("✨ Prologue 완료 - Tutorial 씬으로 전환");
                    // 페이드 아웃 완료 후 tutorial.js로 이동
                    k.go("tutorial");
                });
            });
            
            return;
        }
        
        // 특별한 조건: 성 입력이 필요한 라인(6번)에서는 성이 입력되지 않으면 진행 불가
        if (currentLineIndex === 6 && (!playerLastName || playerLastName.trim().length === 0)) {
            console.log("성 입력이 필요합니다 - 진행 불가");
            return;
        }
        
        // 특별한 조건: 이름 입력이 필요한 라인(7번)에서는 이름이 입력되지 않으면 진행 불가
        if (currentLineIndex === 7 && (!playerFirstName || playerFirstName.trim().length === 0)) {
            console.log("이름 입력이 필요합니다 - 진행 불가");
            return;
        }
        
        promptText.opacity = 0;
        currentLineIndex++;
        
        console.log("다음 라인으로 진행:", currentLineIndex);
        
        if (currentLineIndex < prologueLines.length) {
            // prologueLines[currentLineIndex]가 유효한지 확인
            const nextLine = prologueLines[currentLineIndex];
            if (!nextLine) {
                console.error(`prologueLines[${currentLineIndex}]가 정의되지 않았습니다.`);
                console.log("사용 가능한 라인 수:", prologueLines.length);
                console.log("prologueLines 배열:", prologueLines);
                return;
            }
            
            k.wait(0.3, () => {
                typeText(nextLine);
                
                // 특정 라인에서 이름 입력 시작
                if (currentLineIndex === 6) {
                    // "성을 입력하세요:" 라인 완료 후 성 입력
                    k.wait(1, () => {
                        if (canProceed && !isTyping) {
                            inputStep = 0;
                            startNameInput();
                        }
                    });
                } else if (currentLineIndex === 7) {
                    // "이름을 입력하세요:" 라인 완료 후 이름 입력
                    k.wait(1, () => {
                        if (canProceed && !isTyping) {
                            inputStep = 1;
                            startNameInput();
                        }
                    });
                }
            });
        } else {
            // 프롤로그 종료 - BGM 볼륨 페이드와 화면 페이드아웃 동시 진행
            k.wait(1, () => {
                console.log("🎵 프롤로그 종료 - BGM 볼륨 페이드 아웃과 화면 페이드아웃 동시 시작");
                
                // BGM 볼륨을 0으로 서서히 감소 (1.5초 동안)
                if (audioManager.isBGMPlaying()) {
                    const currentVolume = audioManager.currentBGMElement?.volume || 0;
                    console.log(`🔊 BGM 볼륨 페이드: ${currentVolume.toFixed(2)} → 0.00`);
                    audioManager.fadeBGMVolume(0, 1500); // 1.5초 동안 0으로 페이드
                }
                
                console.log("🌙 Prologue Fade Out 시작");
                
                // ⚠️ 중요: 아래 대화창 페이드 아웃 코드는 절대 수정하지 말 것!
                // 대화창과 모든 UI 요소들이 fade out과 함께 사라져야 함
                // 이 로직을 변경하면 대화창이 화면에 남아있게 됨
                
                // 모든 대화 관련 요소들을 동시에 페이드 아웃
                const fadeOutDuration = 1.5;
                const elementsToFadeOut = [
                    dialogBox,
                    dialogText,
                    nameText,
                    ...nameOutlines,
                    ...k.get("nameInputText"),
                    ...k.get("questionText"),
                    ...k.get("dialog-element") // 모든 대화 요소 포함
                ];
                
                // ⚠️ 중요: 이 forEach 루프는 절대 수정하지 말 것!
                // 모든 대화 요소들이 페이드 아웃과 동시에 투명해져야 함
                elementsToFadeOut.forEach(element => {
                    if (element && element.exists && element.exists() && element.opacity !== undefined) {
                        k.tween(element.opacity, 0, fadeOutDuration, (val) => {
                            if (element && element.exists && element.exists() && element.opacity !== undefined) {
                                element.opacity = val;
                            }
                        });
                    }
                });
                
                // 페이드 아웃 효과 (BGM 페이드와 동시에 시작)
                // ⚠️ 절대 수정 금지: z-index를 대화창보다 높게 설정하여 화면 전체를 덮도록 함
                // 이 설정은 prologue > tutorial 이동 시 대화창이 페이드아웃과 동시에 사라지게 하기 위한 것임
                const fadeOut = k.add([
                    k.rect(k.width(), k.height()),
                    k.pos(0, 0),
                    k.color(0, 0, 0),
                    k.opacity(0),
                    k.z(9999), // 대화창(z-index 2000+)보다 훨씬 높게 설정
                    k.fixed(),
                ]);
                
                // 페이드 아웃 애니메이션 (1.5초)
                k.tween(fadeOut.opacity, 1, 1.5, (val) => {
                    fadeOut.opacity = val;
                }).then(() => {
                    console.log("✨ Prologue 완료 - Tutorial 씬으로 전환");
                    // 페이드 아웃 완료 후 tutorial.js로 이동
                    k.go("tutorial");
                });
            });
        }
    }

    // 키 이벤트 리스너 제거용
    let documentKeyHandler = null;
    let lastSpaceTime = 0; // 스페이스 키 중복 방지용
    let lastGamepadATime = 0; // 게임패드 A버튼 중복 방지용
    let lastGamepadBTime = 0; // 게임패드 B버튼 중복 방지용

    // 브라우저 레벨 키 이벤트 처리 (한글 IME 호환성을 위해)
    documentKeyHandler = (e) => {
        console.log(`브라우저 키 이벤트: ${e.code}, isInputting: ${isInputting}, canProceed: ${canProceed}, isTyping: ${isTyping}`);
        
        // 타이핑 중이면 모든 키 입력 무시
        if (isTyping) {
            console.log("타이핑 중이므로 키 입력 무시");
            return;
        }
        
        // 이름 입력 중일 때는 모든 키 입력을 차단하고 Enter 키만 처리
        if (isInputting) {
            console.log("이름 입력 중 - 모든 키 입력 차단");
            e.preventDefault(); // 모든 키 입력의 기본 동작 방지
            e.stopPropagation(); // 이벤트 전파 방지
            
            if (e.code === 'Enter') {
                handleNameSubmit();
            }
            return;
        }
        
        // 일반 대화 진행 중일 때 (타이핑이 완전히 끝나고 canProceed가 true일 때만)
        if (canProceed && !isTyping) {
            // 스페이스바만 허용 (중복 방지)
            if (e.code === 'Space') {
                const currentTime = Date.now();
                const timeSinceLastSpace = currentTime - lastSpaceTime;
                
                // 500ms 이내 중복 입력 방지
                if (timeSinceLastSpace < 500) {
                    console.log(`스페이스 키 중복 방지: ${timeSinceLastSpace}ms 간격`);
                    e.preventDefault();
                    return;
                }
                
                lastSpaceTime = currentTime;
                e.preventDefault();
                console.log("스페이스 키로 다음 진행");
                proceedToNext();
            }
        } else {
            console.log("조건 불충족 - canProceed:", canProceed, "isTyping:", isTyping);
        }
    };
    document.addEventListener('keydown', documentKeyHandler);

    // 게임패드 이벤트 처리
    // A 버튼 (east) - 대사 진행
    k.onGamepadButtonPress("east", () => {
        const currentTime = Date.now();
        const timeSinceLastA = currentTime - lastGamepadATime;
        
        console.log(`게임패드 A 버튼: isInputting: ${isInputting}, canProceed: ${canProceed}, isTyping: ${isTyping}`);
        
        // 중복 방지 (500ms 이내 연속 입력 무시)
        if (timeSinceLastA < 500) {
            console.log(`게임패드 A 버튼 중복 방지: ${timeSinceLastA}ms 간격`);
            return;
        }
        
        // 타이핑 중이거나 이름 입력 중이면 무시
        if (isTyping || isInputting) {
            console.log("타이핑 중이거나 이름 입력 중이므로 A 버튼 무시");
            return;
        }
        
        if (canProceed) {
            lastGamepadATime = currentTime;
            console.log("게임패드 A 버튼으로 다음 진행");
            proceedToNext();
        }
    });

    // B 버튼 (south) - 대사 빠르게 진행 (스킵)
    k.onGamepadButtonPress("south", () => {
        const currentTime = Date.now();
        const timeSinceLastB = currentTime - lastGamepadBTime;
        
        console.log(`게임패드 B 버튼: isInputting: ${isInputting}, canProceed: ${canProceed}, isTyping: ${isTyping}`);
        
        // 중복 방지 (300ms 이내 연속 입력 무시 - B버튼은 더 짧게)
        if (timeSinceLastB < 300) {
            console.log(`게임패드 B 버튼 중복 방지: ${timeSinceLastB}ms 간격`);
            return;
        }
        
        // 이름 입력 중이면 무시
        if (isInputting) {
            console.log("이름 입력 중이므로 B 버튼 무시");
            return;
        }
        
        lastGamepadBTime = currentTime;
        
        // 타이핑 중이면 즉시 완료
        if (isTyping) {
            console.log("게임패드 B 버튼으로 타이핑 스킵");
            skipTyping = true; // 스킵 플래그 설정
        } else if (canProceed) {
            console.log("게임패드 B 버튼으로 빠른 진행");
            proceedToNext();
        }
    });

    // 마우스 클릭으로도 진행 가능하도록 추가
    k.onClick(() => {
        console.log(`마우스 클릭: isInputting: ${isInputting}, canProceed: ${canProceed}, isTyping: ${isTyping}`);
        
        // 타이핑 중이거나 이름 입력 중이면 무시
        if (isTyping || isInputting) {
            console.log("타이핑 중이거나 이름 입력 중이므로 클릭 무시");
            return;
        }
        
        if (canProceed) {
            console.log("마우스 클릭으로 다음 진행");
            proceedToNext();
        }
    });

    // 프롤로그 시작 - 2초 페이드 효과 후 첫 대화 시작
    k.wait(2.5, () => { // 페이드 효과 완료 후 0.5초 여유
        typeText(prologueLines[currentLineIndex]);
    });

    // 씬 정리
    k.onSceneLeave(() => {
        document.body.style.backgroundColor = '';
        // 대화창 정리
        removeDialogBox();
        // 특별 텍스트들 정리
        k.destroyAll("nameInputText");
        k.destroyAll("questionText");
        // HTML input 엘리먼트 정리
        cleanupInput();
        // 브라우저 키 이벤트 리스너 제거
        if (documentKeyHandler) {
            document.removeEventListener('keydown', documentKeyHandler);
        }
        // 페이드 오버레이 정리 (혹시 남아있다면)
        const fadeOverlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
        fadeOverlays.forEach(overlay => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
                console.log("🧹 페이드 오버레이 정리됨");
            }
        });
        // BGM 볼륨을 원래대로 복원 (JavaScript 오디오 사용)
        console.log("🔊 BGM 볼륨 복원 시도:", audioManager.isBGMPlaying(), audioManager.currentBGMElement?.volume);
        if (audioManager.isBGMPlaying()) {
            // 현재 볼륨에서 1.0으로 복원
            const currentVolume = audioManager.currentBGMElement.volume;
            const success = audioManager.setBGMVolume(1.0); // 100%로 복원
            console.log(`🔊 BGM 볼륨 복원 ${success ? '성공' : '실패'}: ${currentVolume} → 1.0`);
        } else {
            console.warn("⚠️ BGM이 재생되지 않아서 볼륨 복원 불가");
        }
        console.log("✅ Prologue 씬 종료");
    });
}
