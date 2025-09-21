// 튜토리얼 대화 시스템 모듈
export function createTutorialDialog(k, onComplete) {
    console.log("🎭 튜토리얼 대화 시작");
    
    const dialogData = [
        { character: "???", text: "..." },
        { character: "???", text: "......" },
        { character: "???", text: "...깜짝이야!!!" }
    ];
    
    const shiftDialogData = [
        { character: "???", text: "뭐야 넌! 처음보는 얼굴인데." },
        { character: "???", text: "왜 날 방해하는거야?" }
    ];
    
    let currentDialogIndex = 0;
    let isDialogActive = true;
    let dialogBox = null;
    let dialogText = null;
    let nameText = null;
    let nameOutlines = []; // 외곽선 텍스트들
    let helpText = null;
    let helpTextVisible = false;
    let helpTextTimer = null;
    let isShiftTutorial = false;
    
    function createDialogBox() {
        // 대화창 배경
        dialogBox = k.add([
            k.rect(k.width() - 120, 160),
            k.pos(60, k.height() - 200),
            k.color(0, 0, 0),
            k.opacity(0.8),
            k.z(2000),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 테두리
        k.add([
            k.rect(k.width() - 120, 160),
            k.pos(60, k.height() - 200),
            k.outline(3, k.rgb(255, 255, 255)),
            k.z(2001),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 이름 탭 배경
        k.add([
            k.rect(140, 44),
            k.pos(75, k.height() - 222),
            k.color(40, 40, 60), // 더 진한 배경색
            k.z(2002),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 이름 탭 외부 테두리
        k.add([
            k.rect(140, 44),
            k.pos(75, k.height() - 222),
            k.outline(3, k.rgb(200, 200, 255)), // 밝은 테두리
            k.z(2003),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 이름 탭 내부 테두리 (볼드 효과)
        k.add([
            k.rect(134, 38),
            k.pos(78, k.height() - 219),
            k.outline(1, k.rgb(160, 160, 200)), // 내부 테두리
            k.z(2003),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 이름 텍스트 외곽선 (8방향)
        const outlineOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1,  0],          [1,  0],
            [-1,  1], [0,  1], [1,  1]
        ];
        
        const nameOutlines = [];
        outlineOffsets.forEach(([dx, dy]) => {
            const outline = k.add([
                k.text("???", {
                    size: 20,
                    font: "galmuri"
                }),
                k.pos(145 + dx, k.height() - 200 + dy),
                k.anchor("center"),
                k.color(0, 0, 0), // 검은색 외곽선
                k.z(2004),
                k.fixed(),
                "tutorialDialog"
            ]);
            nameOutlines.push(outline);
        });
        
        nameText = k.add([
            k.text("???", {
                size: 20, // 크기 증가
                font: "galmuri"
            }),
            k.pos(145, k.height() - 200), // 중앙 정렬 위치 조정
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(2005), // 외곽선보다 위에
            k.fixed(),
            "tutorialDialog"
        ]);
        
        // 외곽선 텍스트들도 함께 관리하기 위해 저장
        nameOutlines = nameOutlines;
        
        dialogText = k.add([
            k.text("", {
                size: 20,
                font: "galmuri",
                width: k.width() - 180
            }),
            k.pos(90, k.height() - 170),
            k.color(255, 255, 255),
            k.z(2004),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        showCurrentDialog();
    }
    
    function showCurrentDialog() {
        hideHelpText();
        
        if (!isShiftTutorial && currentDialogIndex < dialogData.length) {
            const dialog = dialogData[currentDialogIndex];
            dialogText.text = dialog.text;
            nameText.text = dialog.character;
            // 외곽선도 업데이트
            nameOutlines.forEach(outline => {
                outline.text = dialog.character;
            });
            
            helpTextTimer = setTimeout(() => {
                showHelpText("스페이스 키를 누르세요");
            }, 1000);
            
        } else if (isShiftTutorial && currentDialogIndex < shiftDialogData.length) {
            const dialog = shiftDialogData[currentDialogIndex];
            dialogText.text = dialog.text;
            nameText.text = dialog.character;
            // 외곽선도 업데이트
            nameOutlines.forEach(outline => {
                outline.text = dialog.character;
            });
            
            if (currentDialogIndex === 0) {
                helpTextTimer = setTimeout(() => {
                    showHelpText("Shift 키를 누르면 빠르게 넘길 수 있습니다!");
                }, 100);
            }
        }
    }
    
    function showHelpText(text) {
        if (helpText) {
            helpText.destroy();
            helpText = null;
        }
        
        helpText = k.add([
            k.text(text, {
                size: 14,
                font: "galmuri"
            }),
            k.pos(k.center().x, k.height() - 240),
            k.anchor("center"),
            k.color(150, 150, 150),
            k.opacity(0),
            k.z(2005),
            k.fixed(),
            "tutorialDialog"
        ]);
        
        helpTextVisible = true;
        
        const blinkTween = () => {
            if (helpTextVisible && helpText) {
                k.tween(helpText.opacity, 1, 0.8, (val) => {
                    if (helpText) helpText.opacity = val;
                }).then(() => {
                    if (helpTextVisible && helpText) {
                        k.tween(helpText.opacity, 0.3, 0.8, (val) => {
                            if (helpText) helpText.opacity = val;
                        }).then(() => {
                            if (helpTextVisible) {
                                blinkTween();
                            }
                        });
                    }
                });
            }
        };
        blinkTween();
    }
    
    function hideHelpText() {
        helpTextVisible = false;
        if (helpText) {
            helpText.destroy();
            helpText = null;
        }
        if (helpTextTimer) {
            clearTimeout(helpTextTimer);
            helpTextTimer = null;
        }
    }
    
    const dialogKeyHandler = (e) => {
        if (!isDialogActive) return;
        
        if (e.type === 'keydown') {
            if (e.code === 'Space' && !isShiftTutorial) {
                e.preventDefault();
                hideHelpText();
                
                currentDialogIndex++;
                if (currentDialogIndex >= dialogData.length) {
                    isShiftTutorial = true;
                    currentDialogIndex = 0;
                    showCurrentDialog();
                } else {
                    showCurrentDialog();
                }
            } else if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && isShiftTutorial) {
                e.preventDefault();
                hideHelpText();
                
                currentDialogIndex++;
                if (currentDialogIndex >= shiftDialogData.length) {
                    endDialog();
                } else {
                    showCurrentDialog();
                }
            }
        }
    };
    
    function endDialog() {
        console.log("🎭 대화 종료");
        isDialogActive = false;
        hideHelpText();
        
        document.removeEventListener('keydown', dialogKeyHandler);
        document.removeEventListener('keyup', dialogKeyHandler);
        
        const allDialogElements = k.get("tutorialDialog");
        allDialogElements.forEach(element => {
            if (element.opacity !== undefined) {
                k.tween(element.opacity, 0, 1, (val) => {
                    element.opacity = val;
                });
            }
        });
        
        k.wait(1, () => {
            k.destroyAll("tutorialDialog");
            onComplete(); // 완료 콜백 호출
        });
    }
    
    // 이벤트 리스너 등록
    document.addEventListener('keydown', dialogKeyHandler);
    document.addEventListener('keyup', dialogKeyHandler);
    
    // 대화창 생성 및 시작
    createDialogBox();
    
    // 정리 함수 반환
    return {
        cleanup: () => {
            isDialogActive = false;
            hideHelpText();
            document.removeEventListener('keydown', dialogKeyHandler);
            document.removeEventListener('keyup', dialogKeyHandler);
            k.destroyAll("tutorialDialog");
        }
    };
}
