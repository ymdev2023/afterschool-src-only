import { healthBar } from "../uiComponents/healthbar.js";
import {
    generatePlayerComponents,
    generateFirstPlayerComponents,
    setPlayerControls,
    watchPlayerHealth,
} from "../entities/player.js";
import { generateNoteComponents } from "../entities/note.js";
import { gameState, globalState } from "../state/stateManagers.js";
import { fadeInBGM, audioManager } from "../utils.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
} from "../utils.js";

import { dialog } from "../uiComponents/dialog.js";
import { toggleLocale, toggleMute, initializeQuestBubbles, updateQuestBubbles } from "../utils.js";
import { class1Dialogue, objectDialogues, npcNames, objectNames } from "../content/dialogue/class1Dialogue.js";
import { getNPCSprite, getClass1SpriteName, getObjectSprite } from "../scene-assets/class1Assets.js";

// 학생증 제작 시스템
function setupStudentIDCardSystem(k, gameState, object, map) {
    let isCardSystemOpen = false;
    let cardSystemUI = null;
    
    // 미리 정의된 캐릭터들 (게임 내 스프라이트 기반)
    const characters = [
        { id: 1, name: "남학생1", emoji: "👦", spriteFrame: 10 },
        { id: 2, name: "여학생1", emoji: "👧", spriteFrame: 11 },
        { id: 3, name: "남학생2", emoji: "🧑", spriteFrame: 12 },
        { id: 4, name: "여학생2", emoji: "👩", spriteFrame: 13 },
        { id: 5, name: "남학생3", emoji: "🙎‍♂️", spriteFrame: 14 },
        { id: 6, name: "여학생3", emoji: "🙎‍♀️", spriteFrame: 15 }
    ];
    
    let selectedCharacterIndex = 0;
    let studentName = "";
    
    // 컴퓨터 책상 생성
    const computerDesk = map.add([
        k.rect(object.width, object.height),
        k.area(),
        k.body({ isStatic: true }),
        k.pos(object.x, object.y),
        k.opacity(0.3), // 디버그용으로 약간 보이게 설정
        k.color(255, 0, 0), // 디버그용 빨간색
        k.z(1),
        "computer_desk",
        "interactive-object",
        { objectType: "computer_desk" }
    ]);
    
    console.log("🖥️ DEBUG: computer_desk 생성됨", {
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        position: computerDesk.pos
    });
    
    // 컴퓨터 책상 상호작용
    computerDesk.onCollideUpdate("player", (player) => {
        console.log("🖥️ DEBUG: computer_desk와 충돌 감지됨");
        gameState.setInteractableObject(computerDesk, "computer", {
            content: [
                "학생증 제작 컴퓨터입니다.",
                "E키를 눌러 학생증을 만들어보세요."
            ],
            speakerName: "학생증 제작기",
            speakerImage: null
        });
        console.log("🖥️ DEBUG: 상호작용 객체 설정 완료");
    });
    
    computerDesk.onCollideEnd("player", () => {
        console.log("🖥️ DEBUG: computer_desk와 충돌 끝남");
        gameState.clearInteractableObject();
    });
    
    // E키로 학생증 제작 시스템 열기
    k.onKeyPress("e", () => {
        const interactableObject = gameState.getInteractableObject();
        if (interactableObject && interactableObject.entity === computerDesk && !isCardSystemOpen) {
            openCardMakingSystem();
        }
    });
    
    // 학생증 제작 UI 열기
    function openCardMakingSystem() {
        if (isCardSystemOpen) return;
        isCardSystemOpen = true;
        selectedCharacterIndex = 0;
        studentName = "";
        
        // UI 컨테이너 초기화
        cardSystemUI = {
            background: null,
            elements: []
        };
        
        // 배경
        cardSystemUI.background = k.add([
            k.rect(k.width() * 0.8, k.height() * 0.7),
            k.pos(k.width() * 0.1, k.height() * 0.15),
            k.color(40, 40, 60),
            k.outline(4, k.Color.WHITE),
            k.z(200),
            k.fixed(),
            "card-system-bg"
        ]);
        
        // 제목
        const title = k.add([
            k.text("학생증 제작 시스템", {
                size: 28,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.5, k.height() * 0.2),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(title);
        
        // 캐릭터 선택 섹션
        const charLabel = k.add([
            k.text("캐릭터 선택 (←→ 화살표키):", {
                size: 20,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.15, k.height() * 0.3),
            k.color(200, 200, 200),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(charLabel);
        
        // 선택된 캐릭터 표시
        const selectedCharDisplay = k.add([
            k.rect(120, 140),
            k.pos(k.width() * 0.15, k.height() * 0.35),
            k.color(80, 80, 100),
            k.outline(3, k.Color.YELLOW),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(selectedCharDisplay);
        
        // 캐릭터 이미지 (이모지로 표시)
        const charImage = k.add([
            k.text(characters[0].emoji, {
                size: 48
            }),
            k.pos(k.width() * 0.15 + 60, k.height() * 0.35 + 50),
            k.anchor("center"),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(charImage);
        cardSystemUI.charImage = charImage;
        
        // 캐릭터 이름
        const charName = k.add([
            k.text(characters[0].name, {
                size: 14,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.15 + 60, k.height() * 0.35 + 100),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(charName);
        cardSystemUI.charName = charName;
        
        // 이름 입력 섹션
        const nameLabel = k.add([
            k.text("학생 이름 입력:", {
                size: 20,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.15, k.height() * 0.55),
            k.color(200, 200, 200),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(nameLabel);
        
        // 이름 입력 박스
        const nameInput = k.add([
            k.rect(200, 35),
            k.pos(k.width() * 0.15, k.height() * 0.6),
            k.color(60, 60, 80),
            k.outline(2, k.Color.WHITE),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(nameInput);
        
        // 이름 텍스트
        const nameText = k.add([
            k.text("", {
                size: 18,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.15 + 10, k.height() * 0.6 + 8),
            k.color(255, 255, 255),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(nameText);
        cardSystemUI.nameText = nameText;
        
        // 미리보기 섹션
        const previewLabel = k.add([
            k.text("학생증 미리보기:", {
                size: 20,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.55, k.height() * 0.3),
            k.color(200, 200, 200),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(previewLabel);
        
        // 학생증 미리보기 (320x200 크기)
        const cardPreview = k.add([
            k.rect(320, 200),
            k.pos(k.width() * 0.55, k.height() * 0.35),
            k.color(240, 240, 250),
            k.outline(3, k.Color.BLACK),
            k.z(201),
            k.fixed()
        ]);
        cardSystemUI.elements.push(cardPreview);
        
        // 학교명 (고정)
        const schoolName = k.add([
            k.text("○○고등학교", {
                size: 16,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.55 + 160, k.height() * 0.35 + 30),
            k.anchor("center"),
            k.color(0, 0, 0),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(schoolName);
        
        // 미리보기 캐릭터 표시
        const previewChar = k.add([
            k.text(characters[0].emoji, {
                size: 32
            }),
            k.pos(k.width() * 0.55 + 50, k.height() * 0.35 + 100),
            k.anchor("center"),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(previewChar);
        cardSystemUI.previewChar = previewChar;
        
        // 미리보기 이름 표시
        const previewName = k.add([
            k.text("", {
                size: 18,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.55 + 200, k.height() * 0.35 + 120),
            k.anchor("center"),
            k.color(0, 0, 0),
            k.z(202),
            k.fixed()
        ]);
        cardSystemUI.elements.push(previewName);
        cardSystemUI.previewName = previewName;
        
        // 제작 버튼
        const makeButton = k.add([
            k.rect(120, 40),
            k.pos(k.width() * 0.6, k.height() * 0.7),
            k.color(100, 150, 100),
            k.outline(2, k.Color.WHITE),
            k.z(201),
            k.fixed(),
            k.area()
        ]);
        
        const makeText = k.add([
            k.text("학생증 제작", {
                size: 16,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.6 + 60, k.height() * 0.7 + 20),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(202),
            k.fixed()
        ]);
        
        makeButton.onClick(() => {
            if (studentName.trim() !== "") {
                generateStudentCard();
            } else {
                showMessage("이름을 입력해주세요!");
            }
        });
        
        cardSystemUI.elements.push(makeButton, makeText);
        
        // 닫기 버튼
        const closeButton = k.add([
            k.rect(60, 30),
            k.pos(k.width() * 0.85, k.height() * 0.17),
            k.color(150, 50, 50),
            k.outline(2, k.Color.WHITE),
            k.z(201),
            k.fixed(),
            k.area()
        ]);
        
        const closeText = k.add([
            k.text("닫기", {
                size: 14,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.85 + 30, k.height() * 0.17 + 15),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.z(202),
            k.fixed()
        ]);
        
        closeButton.onClick(() => {
            closeCardMakingSystem();
        });
        
        cardSystemUI.elements.push(closeButton, closeText);
        
        // 키보드 이벤트 등록
        setupKeyboardEvents();
        updatePreview();
    }
    
    // 키보드 이벤트 설정
    function setupKeyboardEvents() {
        // 화살표 키로 캐릭터 선택
        const leftHandler = () => {
            if (!isCardSystemOpen) return;
            selectedCharacterIndex = (selectedCharacterIndex - 1 + characters.length) % characters.length;
            updateCharacterDisplay();
            updatePreview();
        };
        
        const rightHandler = () => {
            if (!isCardSystemOpen) return;
            selectedCharacterIndex = (selectedCharacterIndex + 1) % characters.length;
            updateCharacterDisplay();
            updatePreview();
        };
        
        const charInputHandler = (char) => {
            if (!isCardSystemOpen) return;
            if (studentName.length < 10) {
                studentName += char;
                updateNameDisplay();
                updatePreview();
            }
        };
        
        const backspaceHandler = () => {
            if (!isCardSystemOpen) return;
            if (studentName.length > 0) {
                studentName = studentName.slice(0, -1);
                updateNameDisplay();
                updatePreview();
            }
        };
        
        const enterHandler = () => {
            if (!isCardSystemOpen) return;
            if (studentName.trim() !== "") {
                generateStudentCard();
            }
        };
        
        const escapeHandler = () => {
            if (isCardSystemOpen) {
                closeCardMakingSystem();
            }
        };
        
        k.onKeyPress("left", leftHandler);
        k.onKeyPress("right", rightHandler);
        k.onCharInput(charInputHandler);
        k.onKeyPress("backspace", backspaceHandler);
        k.onKeyPress("enter", enterHandler);
        k.onKeyPress("escape", escapeHandler);
        
        // UI가 닫힐 때 이벤트 제거를 위해 핸들러들을 저장
        cardSystemUI.handlers = {
            leftHandler, rightHandler, charInputHandler, 
            backspaceHandler, enterHandler, escapeHandler
        };
    }
    
    // 캐릭터 표시 업데이트
    function updateCharacterDisplay() {
        const character = characters[selectedCharacterIndex];
        cardSystemUI.charImage.text = character.emoji;
        cardSystemUI.charName.text = character.name;
    }
    
    // 이름 표시 업데이트
    function updateNameDisplay() {
        cardSystemUI.nameText.text = studentName;
    }
    
    // 미리보기 업데이트
    function updatePreview() {
        const character = characters[selectedCharacterIndex];
        cardSystemUI.previewChar.text = character.emoji;
        cardSystemUI.previewName.text = studentName;
    }
    
    // 학생증 이미지 생성 및 다운로드
    function generateStudentCard() {
        const character = characters[selectedCharacterIndex];
        
        showMessage("학생증을 생성 중입니다...");
        
        // Canvas를 사용하여 학생증 이미지 생성
        const canvas = document.createElement('canvas');
        canvas.width = 640; // 실제 프린터용 고해상도
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // 학생증 배경 (포토샵 디자인 시뮬레이션)
        const gradient = ctx.createLinearGradient(0, 0, 640, 400);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 400);
        
        // 외부 테두리
        ctx.strokeStyle = '#2c5aa0';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 600, 360);
        
        // 내부 테두리
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, 560, 320);
        
        // 학교 로고 영역 (상단)
        ctx.fillStyle = '#2c5aa0';
        ctx.fillRect(50, 50, 540, 80);
        
        // 학교명
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('○○고등학교', 320, 100);
        
        // 학생증 타이틀
        ctx.font = 'bold 24px Arial';
        ctx.fillText('학생증 | Student ID', 320, 125);
        
        // 사진 영역
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(80, 160, 140, 180);
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 3;
        ctx.strokeRect(80, 160, 140, 180);
        
        // 캐릭터 표시 (큰 이모지)
        ctx.font = '72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(character.emoji, 150, 260);
        
        // 캐릭터 타입 표시
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Arial';
        ctx.fillText(character.name, 150, 320);
        
        // 학생 정보 영역
        ctx.fillStyle = '#2c5aa0';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('성 명:', 280, 200);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(studentName, 280, 240);
        
        ctx.fillStyle = '#2c5aa0';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('학 년:', 280, 280);
        ctx.fillText('학 번:', 280, 310);
        ctx.fillText('학 과:', 280, 340);
        
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.fillText('1학년', 380, 280);
        ctx.fillText(`2024${String(character.id).padStart(3, '0')}`, 380, 310);
        ctx.fillText('일반과', 380, 340);
        
        // 발급일
        const today = new Date();
        const dateStr = `${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`발급일: ${dateStr}`, 580, 370);
        
        // 보안 요소 (간단한 체크무늬)
        ctx.fillStyle = 'rgba(44, 90, 160, 0.1)';
        for (let i = 0; i < 640; i += 20) {
            for (let j = 0; j < 400; j += 20) {
                if ((i + j) % 40 === 0) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        }
        
        // 이미지를 Blob으로 변환하여 다운로드
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // 특별한 파일명 (Python이 인식할 수 있도록)
            a.download = `STUDENT_CARD_${studentName}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage("학생증이 다운로드되었습니다!");
            console.log(`📄 학생증 생성 완료: ${studentName} (${character.name})`);
            
            // 효과음 재생
            try {
                k.play("boop-sfx");
            } catch (e) {
                console.log("효과음 재생 실패:", e);
            }
            
            // 잠시 후 시스템 닫기
            setTimeout(() => {
                closeCardMakingSystem();
            }, 2000);
        }, 'image/png', 1.0);
    }
    
    // 메시지 표시
    function showMessage(message) {
        k.add([
            k.text(message, {
                size: 20,
                font: "galmuri"
            }),
            k.pos(k.width() * 0.5, k.height() * 0.5),
            k.anchor("center"),
            k.color(255, 255, 100),
            k.z(250),
            k.fixed(),
            k.lifespan(2)
        ]);
    }
    
    // 시스템 닫기
    function closeCardMakingSystem() {
        if (!isCardSystemOpen) return;
        
        isCardSystemOpen = false;
        selectedCharacterIndex = 0;
        studentName = "";
        
        // 모든 UI 요소 제거
        if (cardSystemUI.background) {
            cardSystemUI.background.destroy();
        }
        
        cardSystemUI.elements.forEach(element => {
            if (element.exists && element.exists()) {
                element.destroy();
            }
        });
        
        cardSystemUI = null;
    }
    
    return computerDesk;
}

export default async function class1(k) {
    console.log("🏫 class1 scene 시작");

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Class1 BGM으로 즉시 전환");
    console.log(`🎵 현재 BGM 상태:`, {
        currentBGM: audioManager.currentBGM,
        isPlaying: audioManager.isBGMPlaying(),
        previousScene: gameState.getPreviousScene()
    });
    
    // 강제로 모든 BGM 정지 후 새 BGM 재생
    console.log("🛑 강제 BGM 정지 후 class1-bgm 재생");
    audioManager.stopBGM(); // 명시적으로 기존 BGM 정지
    await k.wait(0.1); // 짧은 대기 시간
    audioManager.switchBGM("class1-bgm", 0.3);

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/class1.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        npcs: [],
        objects: [],
        students: [], // boundaries 레이어의 student들
    };
    const layers = mapData.layers;

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    // 기본 플레이어 스폰포인트
                    if (object.name === "player") {
                        console.log("🎮 기본 플레이어 스폰포인트 발견:", object);
                        // 타겟 스폰이 설정되지 않은 경우에만 기본 위치 사용
                        if (!gameState.getTargetSpawn()) {
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                        }
                        continue;
                    }

                    // door_from_second에 대응하는 player_front 스폰포인트
                    if (object.name === "player_front") {
                        console.log("🎮 player_front 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_front") {
                            console.log("🎯 player_front 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                        }
                        continue;
                    }

                    // door_from_second_back에 대응하는 player_back 스폰포인트
                    if (object.name === "player_back") {
                        console.log("🎮 player_back 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_back") {
                            console.log("🎯 player_back 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                        }
                        continue;
                    }

                    // NPC 처리 (선생님, 학생들)
                    if (["teacher", "student1", "student2", "student3"].includes(object.name)) {
                        const npcType = object.name;
                        const spriteFrame = getNPCSprite(npcType);
                        console.log(`🎭 Class1 NPC 생성: ${npcType}, frame: ${spriteFrame}`);
                        
                        const npc = map.add([
                            k.sprite(getClass1SpriteName(), { frame: spriteFrame }),
                            k.area({
                                shape: new k.Rect(k.vec2(0, -10), 16, 24),
                            }),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "npc",
                            npcType,
                            { npcType },
                        ]);

                        entities.npcs.push(npc);

                        // NPC 상호작용 시스템
                        npc.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const dialogueData = class1Dialogue[npcType]?.[locale];

                            if (dialogueData) {
                                const content = dialogueData.content;
                                const speakerName = dialogueData.speakerName;

                                gameState.setInteractableObject(npc, "npc", {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                });
                            }
                        });
                        continue;
                    }

                    // toiletpaper 특별 처리 (대화로 습득)
                    if (object.name === "toiletpaper") {
                        // 이미 획득했다면 스킵
                        if (globalState.hasItemInGlobalInventory("toiletpaper")) {
                            console.log("🧻 toiletpaper 이미 획득됨, 스킵");
                            continue;
                        }

                        const toiletpaperEntity = map.add([
                            k.sprite(getClass1SpriteName(), { frame: getObjectSprite("toiletpaper") }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "toiletpaper",
                            "interactive-object", // 🔑 핵심: globalSystemManager 중복 방지
                            { objectType: "toiletpaper" },
                        ]);

                        entities.objects.push(toiletpaperEntity);

                        // toiletpaper 상호작용 시스템 (대화로 습득)
                        toiletpaperEntity.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.toiletpaper || [
                                "Oh...! I think someone was looking for toilet paper in the bathroom earlier.",
                                "I should bring it to them."
                            ];

                            const speakerName = objectNames[locale]?.toiletpaper || "휴지";

                            // garage.js 스타일: onInteractionComplete 콜백 설정
                            toiletpaperEntity.onInteractionComplete = () => {
                                console.log("🧻 toiletpaper 대화 완료 - 인벤토리 추가 시작");
                                if (!globalState.hasItemInGlobalInventory("toiletpaper")) {
                                    console.log("🧻 toiletpaper 아직 미획득, 추가 진행");
                                    const toiletpaperItem = {
                                        id: "toiletpaper",
                                        name: "휴지",
                                        sprite: getClass1SpriteName(),
                                        frame: getObjectSprite("toiletpaper")
                                    };
                                    
                                    const added = globalState.addToGlobalInventory(toiletpaperItem);
                                    if (added) {
                                        console.log("🧻 toiletpaper가 전역 인벤토리에 추가됨");
                                        
                                        // 아이템 획득 알림 표시
                                        if (window.notificationManager) {
                                            window.notificationManager.addNotification({
                                                type: 'item-acquired',
                                                message: "휴지를 획득했습니다!"
                                            });
                                        }
                                        
                                        // 인벤토리 시스템 업데이트
                                        if (window.inventorySystem) {
                                            window.inventorySystem.loadFromGlobalState();
                                            window.inventorySystem.show();
                                        } else if (globalSystemManager && globalSystemManager.globalInventory) {
                                            globalSystemManager.globalInventory.addItem(toiletpaperItem);
                                        }
                                        
                                        // toiletpaper 스프라이트 제거
                                        k.wait(0.5, () => {
                                            if (toiletpaperEntity && toiletpaperEntity.exists()) {
                                                console.log("🧻 toiletpaper 스프라이트 제거");
                                                toiletpaperEntity.destroy();
                                            }
                                        });
                                    }
                                } else {
                                    console.log("🧻 toiletpaper 이미 획득됨");
                                }
                            };

                            gameState.setInteractableObject(toiletpaperEntity, "object", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                                onInteractionComplete: toiletpaperEntity.onInteractionComplete // garage.js 스타일
                            });
                        });

                        toiletpaperEntity.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        continue;
                    }

                    // 오브젝트 처리 (칠판, 책상, 책장 등)
                    if (["blackboard", "desk1", "desk2", "bookshelf", "projector", "computer_desk", "tvset"].includes(object.name)) {
                        const objectType = object.name;
                        
                        const spriteFrame = getObjectSprite(objectType);
                        console.log(`🏫 Class1 Object 생성: ${objectType}, frame: ${spriteFrame}`);
                        
                        const obj = map.add([
                            k.sprite(getClass1SpriteName(), { frame: spriteFrame }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "object",
                            objectType,
                            { objectType },
                        ]);

                        entities.objects.push(obj);

                        // 오브젝트 상호작용 시스템
                        obj.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.[objectType] || [
                                `This is ${objectType}.`,
                                `이것은 ${objectType}입니다.`,
                            ];

                            const speakerName = objectNames[locale]?.[objectType] || objectType;

                            console.log(`🏫 ${objectType} 상호작용: ${speakerName} - ${content[0]}`);

                            gameState.setInteractableObject(obj, "object", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        obj.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });
                        continue;
                    }
                }
            }
            continue;
        }

        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            
            // Student 목록 먼저 수집
            const studentObjects = layer.objects.filter(obj => obj.name.startsWith("student"));
            console.log("🎭 발견된 Student 목록:", studentObjects.map(obj => obj.name).sort());
            
            // boundaries 레이어에서 벽들과 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                console.log(`🔍 Boundaries 객체 확인: ${object.name} at (${object.x}, ${object.y})`);
                
                // Student 처리 (boundaries 레이어에서)
                if (object.name.startsWith("student")) {
                    const studentType = object.name;
                    console.log(`🎭 Boundaries에서 Student 영역 생성: ${studentType} at (${object.x}, ${object.y})`);
                    console.log(`🔍 student 대화 확인: ${studentType} ->`, objectDialogues.korean?.[studentType]);
                    
                    // 투명한 콜라이더만 생성
                    const student = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // Y 위치를 10픽셀 위로 조정
                        k.opacity(0), // 완전히 투명
                        studentType, // 구체적인 student 타입 사용 (student50, student55 등)
                        "interactive-object", // 🔑 핵심: globalSystemManager 중복 방지
                        { objectType: studentType }, // objectType을 구체적인 student 타입으로 설정
                    ]);

                    entities.students.push(student);
                    console.log(`✅ Boundaries Student ${studentType} 영역 생성 완료, 총 학생 수: ${entities.students.length}`);

                    // Student 상호작용 시스템 (간단화)
                    student.onCollide("player", (player) => {
                        console.log(`🎯 Student ${studentType}와 충돌 감지`);
                        const locale = gameState.getLocale();
                        
                        const content = objectDialogues[locale]?.[studentType] || [
                            `Hello! I'm ${studentType}!`,
                            `안녕하세요! 저는 ${studentType}입니다!`,
                        ];
                        
                        const speakerName = npcNames[locale]?.[studentType] || studentType;

                        console.log(`💬 대화 설정: ${speakerName} - ${content[0]}`);

                        gameState.setInteractableObject(student, "object", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    student.onCollideEnd("player", (player) => {
                        console.log(`👋 Student ${studentType}와 충돌 종료`);
                        gameState.clearInteractableObject();
                    });

                    continue;
                }

                // TVset 처리
                if (object.name === "tvset") {
                    const tvEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10),
                        k.opacity(0),
                        "tvset",
                        "interactive-object", // 🔑 핵심: globalSystemManager 중복 방지
                        { objectType: "tvset" },
                    ]);

                    tvEntity.onCollide("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = objectDialogues[locale]?.tvset || [
                            "큰 TV가 설치되어 있다.",
                            "수업시간에 영상을 보여주는 용도인 것 같다.",
                        ];

                        const speakerName = objectNames[locale]?.tvset || "TV";

                        gameState.setInteractableObject(tvEntity, "object", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    tvEntity.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });

                    continue;
                }

                // 기타 오브젝트들 처리 (fire_extinguisher, broomstick, mop, sofa, mirror, teacher_desk, computer_desk, locker)
                if (["fire_extinguisher", "broomstick", "mop", "sofa", "mirror", "teacher_desk", "computer_desk", "locker"].includes(object.name)) {
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10),
                        k.opacity(0),
                        object.name,
                        "interactive-object", // 🔑 핵심: globalSystemManager 중복 방지
                        { objectType: object.name },
                    ]);

                    objectEntity.onCollide("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = objectDialogues[locale]?.[object.name] || [
                            `This is ${object.name}.`,
                            `이것은 ${object.name}입니다.`,
                        ];

                        const speakerName = objectNames[locale]?.[object.name] || object.name;

                        gameState.setInteractableObject(objectEntity, "object", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    objectEntity.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });

                    continue;
                }

                // door_from_second 처리 - second.js로 돌아가기 (정면 출구)
                if (object.name === "door_from_second") {
                    console.log(`🚪 door_from_second 오브젝트 발견: (${object.x}, ${object.y})`);
                    const doorEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                        k.opacity(0),
                        "door_from_second",
                        "interactive-object",
                        { objectType: "door_from_second" },
                    ]);

                    doorEntity.onCollide("player", () => {
                        console.log(
                            "🚪 door_from_second 충돌 - second로 이동 (player_front1 스폰)"
                        );
                        k.play("boop-sfx");
                        gameState.setPreviousScene("class1");
                        gameState.setTargetSpawn("player_front1"); // door_class1에 대응
                        k.go("second");
                    });
                    console.log(`✅ door_from_second 엔티티 생성 완료`);
                    continue;
                }

                // door_from_second_back 처리 - second.js로 돌아가기 (뒷문 출구)
                if (object.name === "door_from_second_back") {
                    console.log(`🚪 door_from_second_back 오브젝트 발견: (${object.x}, ${object.y})`);
                    const doorEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                        k.opacity(0),
                        "door_from_second_back",
                        "interactive-object",
                        { objectType: "door_from_second_back" },
                    ]);

                    doorEntity.onCollide("player", () => {
                        console.log(
                            "🚪 door_from_second_back 충돌 - second로 이동 (player_back1 스폰)"
                        );
                        k.play("boop-sfx");
                        gameState.setPreviousScene("class1");
                        gameState.setTargetSpawn("player_back1"); // door_class1_back에 대응
                        k.go("second");
                    });
                    console.log(`✅ door_from_second_back 엔티티 생성 완료`);
                    continue;
                }

                // 이름이 없는 일반 벽들 처리
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 경계선 생성: ${tag} at (${object.x}, ${object.y - 10}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x, object.y - 10), // 10픽셀 위로 조정
                    k.area(),
                    k.body({ isStatic: true }),
                    k.opacity(0),
                    tag,
                ]);
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            for (const chunk of layer.chunks) {
                let tileIndex = 0;
                let tilesAdded = 0;
                for (let y = 0; y < chunk.height; y++) {
                    for (let x = 0; x < chunk.width; x++) {
                        const tile = chunk.data[tileIndex];
                        tileIndex++;

                        if (tile === 0) continue;

                        // chunk의 절대 위치 계산 (픽셀 퍼펙트를 위해 Math.floor 사용)
                        const tileX = Math.floor((chunk.x + x) * mapData.tilewidth);
                        const tileY = Math.floor((chunk.y + y) * mapData.tileheight);

                        // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                        const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                        // class1.json은 class1-assets 스프라이트를 사용
                        map.add([
                            k.sprite(getClass1SpriteName(), { frame: tile - 1, filter: "nearest" }), // 픽셀 아트용 필터링
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                        ]);
                        tilesAdded++;
                    }
                }
                console.log(`✅ Layer ${layer.name} chunk: ${tilesAdded} tiles added`);
            }
            continue;
        }

        // Handle regular tile layers (non-infinite maps)
        if (layer.data) {
            console.log(`🎨 Processing regular tile layer: ${layer.name}, tiles: ${layer.data.length}`);
            let nbOfDrawnTiles = 0;
            let tilesAdded = 0;
            const tilePos = k.vec2(0, 0);
            for (const tile of layer.data) {
                if (nbOfDrawnTiles % layer.width === 0) {
                    tilePos.x = 0;
                    tilePos.y += mapData.tileheight;
                } else {
                    tilePos.x += mapData.tilewidth;
                }

                nbOfDrawnTiles++;

                if (tile === 0) continue;

                // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 높이 (z=1), 다른 타일은 기본 (z=0)
                const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                // Use class1-assets sprite
                map.add([
                    k.sprite(getClass1SpriteName(), { frame: tile - 1, filter: "nearest" }), // 픽셀 아트용 필터링
                    k.pos(Math.floor(tilePos.x), Math.floor(tilePos.y)), // 픽셀 퍼펙트를 위해 Math.floor 사용
                    k.z(zIndex),
                ]);
                tilesAdded++;
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 플레이어가 스폰되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log("⚠️ 플레이어 스폰 포인트를 찾을 수 없어 기본 위치에 생성합니다.");
        entities.player = map.add(
            generateFirstPlayerComponents(k, k.vec2(0, 0)) // 교실 중앙에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    // ==============================
    // 전역 시스템 통합 매니저 초기화
    // ==============================
    
    // 💬 매뉴얼에 따라 sceneDialogues 설정
    const sceneDialogues = {
        objectDialogues: objectDialogues,
        objectNames: objectNames,
        npcNames: npcNames,
    };
    
    const globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "class1", sceneDialogues);
    globalSystemManager.initialize();

    console.log("✅ 전역 시스템 초기화 완료");

    k.camScale(2); // 다른 씬들과 동일하게 2로 설정
    
    // 카메라 초기 위치 설정
    if (entities.player && entities.player.exists()) {
        const initialCamPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50);
        k.camPos(initialCamPos);
    }

    // globalSystemManager.globalCamera 사용 (front.js와 동일)
    if (globalSystemManager.globalCamera) {
        globalSystemManager.globalCamera.setCameraAnimating(false);
    }

    watchPlayerHealth(k);

    let isLocaleLocked = { value: false };
    let isMuteLocked = { value: false };

    // 키보드 단축키
    k.onKeyPress("l", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onKeyPress("ㅣ", () => {
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onKeyPress("m", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    k.onKeyPress("ㅡ", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    // 게임패드 컨트롤
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 언어 변경");
        toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 음소거 토글");
        toggleMute(k, gameState, isMuteLocked);
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);

    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 Class1 씬 정리 시작");
        
        // 전역 시스템 통합 정리
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
        
        console.log("✅ Class1 씬 정리 완료");
    });

    console.log("✅ Class1 씬 로드 완료");
}
