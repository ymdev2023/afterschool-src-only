import { createUIManager } from "../systems/uiManager.js";
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
import { createCloseButton } from "../uiComponents/nineSlicePanel.js";

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
} from "../utils.js";

import noteDialogues from "../content/temp/noteDialogue.js";
import objectDialogues from "../content/objectDialogue.js";
import dialogues from "../content/Dialogue.js";
import secondDialogues from "../content/dialogue/secondDialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { toggleLocale, toggleMute, initializeQuestBubbles, updateQuestBubbles } from "../utils.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";
import { getStudentSpriteConfig } from "../scene-assets/secondAssets.js";

// 퀘스트 UI 시스템
function setupQuestUI(k, gameState) {
    // 퀘스트 상태 관리
    const questState = {
        hasNewQuests: true, // 새로운 퀘스트가 있는지 여부
        isPopupOpen: false,
    };

    // 퀘스트 아이콘 (화면 우측 상단)
    const questIcon = k.add([
        k.sprite("second-assets", {
            frame: questState.hasNewQuests ? 51 : 50, // 열린편지 : 닫힌편지 (second-assets 사용)
        }),
        k.pos(k.width() - 60, 20), // 화면 우측 상단
        k.scale(2),
        k.z(100),
        k.area(),
        k.fixed(), // 카메라 이동에 고정
        "quest-icon",
    ]);

    // 퀘스트 팝업 배경
    let questPopup = null;
    let questPopupContent = null;
    let closeButton = null;

    // 퀘스트 아이콘 클릭 이벤트
    questIcon.onClick(() => {
        if (questState.isPopupOpen) {
            closeQuestPopup();
        } else {
            openQuestPopup();
        }
    });

    // 퀘스트 팝업 열기
    function openQuestPopup() {
        if (questState.isPopupOpen) return;

        questState.isPopupOpen = true;

        // 팝업 배경
        questPopup = k.add([
            k.rect(k.width() * 0.8, k.height() * 0.7),
            k.pos(k.width() * 0.1, k.height() * 0.15),
            k.color(20, 20, 40),
            k.outline(4, k.Color.WHITE),
            k.z(150),
            k.fixed(),
            "quest-popup",
            "quest-popup-element", // 태그 추가
        ]);

        // 팝업 제목
        const title = k.add([
            k.text("오늘의 할일", {
                size: 32,
                font: "galmuri",
            }),
            k.pos(k.width() * 0.15, k.height() * 0.2),
            k.color(255, 255, 255),
            k.z(151),
            k.fixed(),
            "quest-popup-element", // 태그 추가
        ]);

        // 토글 가능한 퀘스트 항목들
        const questItems = [
            {
                title: "• 2층 탐험하기",
                details: ["  - 교실들 방문하기", "  - 1층으로 가는 계단 찾기"],
                expanded: false
            },
            {
                title: "• 선생님과 학생들 만나기", 
                details: ["  - 선생님들께 인사드리기", "  - 2층 학생들과 대화하기"],
                expanded: false
            }
        ];

        let questContentText = "";
        questItems.forEach(item => {
            questContentText += item.title + "\n";
            if (item.expanded) {
                item.details.forEach(detail => {
                    questContentText += detail + "\n";
                });
            }
        });

        // 팝업 내용 (토글 가능)
        questPopupContent = k.add([
            k.text(questContentText, {
                size: 20,
                font: "galmuri",
                width: k.width() * 0.7,
            }),
            k.pos(k.width() * 0.15, k.height() * 0.3),
            k.color(200, 200, 200),
            k.z(151),
            k.fixed(),
            "quest-popup-element", // 태그 추가
        ]);

        // 퀘스트 항목 클릭 이벤트 (토글 기능)
        let clickables = [];
        questItems.forEach((item, index) => {
            const yPos = k.height() * 0.3 + (index * 60); // 각 항목의 Y 위치
            const clickArea = k.add([
                k.rect(k.width() * 0.7, 30),
                k.pos(k.width() * 0.15, yPos),
                k.area(),
                k.opacity(0), // 투명한 클릭 영역
                k.z(152),
                k.fixed(),
                "quest-item-clickable",
                "quest-popup-element",
                { itemIndex: index }
            ]);

            clickArea.onClick(() => {
                // 토글 상태 변경
                questItems[index].expanded = !questItems[index].expanded;
                
                // 텍스트 업데이트
                let updatedText = "";
                questItems.forEach(item => {
                    updatedText += item.title + "\n";
                    if (item.expanded) {
                        item.details.forEach(detail => {
                            updatedText += detail + "\n";
                        });
                    }
                });
                
                // 기존 텍스트 제거하고 새로운 텍스트 생성
                if (questPopupContent && questPopupContent.exists()) {
                    questPopupContent.destroy();
                }
                
                questPopupContent = k.add([
                    k.text(updatedText, {
                        size: 20,
                        font: "galmuri",
                        width: k.width() * 0.7,
                    }),
                    k.pos(k.width() * 0.15, k.height() * 0.3),
                    k.color(200, 200, 200),
                    k.z(151),
                    k.fixed(),
                    "quest-popup-element",
                ]);
            });

            clickables.push(clickArea);
        });

        // 닫기 버튼 (새로운 컴포넌트 사용)
        const closeButtonComponent = createCloseButton(k, {
            x: k.width() * 0.8 + 40, // 중앙 정렬을 위해 조정
            y: k.height() * 0.75 + 20,
            size: 40,
            colors: {
                bg: [120, 140, 180],
                bgHover: [140, 160, 200],
                border: [100, 120, 160],
                text: [255, 255, 255]
            },
            zIndex: 153,
            tag: "quest-popup-element",
            fixed: true,
            onClick: () => {
                closeQuestPopup();
            }
        });
        
        closeButton = closeButtonComponent.clickArea; // 호환성을 위해 유지

        // 퀘스트를 확인했으므로 아이콘을 닫힌편지로 변경
        if (questState.hasNewQuests) {
            questState.hasNewQuests = false;
            questIcon.frame = 50; // 닫힌편지
        }
    }

    // 퀘스트 팝업 닫기
    function closeQuestPopup() {
        if (!questState.isPopupOpen) return;

        questState.isPopupOpen = false;

        // 퀘스트 팝업 관련 모든 요소 제거
        k.get("quest-popup-element").forEach(obj => {
            if (obj.exists()) {
                obj.destroy();
            }
        });
        
        // 추가 안전장치: 각 변수들 직접 제거
        if (questPopup && questPopup.exists()) {
            questPopup.destroy();
            questPopup = null;
        }
        
        if (questPopupContent && questPopupContent.exists()) {
            questPopupContent.destroy();
            questPopupContent = null;
        }
        
        if (closeButton && closeButton.exists()) {
            closeButton.destroy();
            closeButton = null;
        }
    }

    // ESC 키로 팝업 닫기
    k.onKeyPress("escape", () => {
        if (questState.isPopupOpen) {
            closeQuestPopup();
        }
    });

    // 화면 크기 변경 시 아이콘 위치 업데이트
    k.onResize(() => {
        questIcon.pos = k.vec2(k.width() - 60, 20);
    });

    // 새로운 퀘스트 추가 함수 (나중에 사용할 수 있도록)
    return {
        addNewQuest: () => {
            questState.hasNewQuests = true;
            questIcon.frame = 51; // 열린편지
        },
        markQuestsAsRead: () => {
            questState.hasNewQuests = false;
            questIcon.frame = 50; // 닫힌편지
        }
    };
}

export default async function second(k) {
    console.log("🏫 second scene 시작");

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Second BGM으로 즉시 전환");
    console.log(`🎵 현재 BGM 상태:`, {
        currentBGM: audioManager.currentBGM,
        isPlaying: audioManager.isBGMPlaying(),
        previousScene: gameState.getPreviousScene()
    });
    
    // 강제로 모든 BGM 정지 후 새 BGM 재생
    console.log("🛑 강제 BGM 정지 후 second-bgm 재생");
    audioManager.stopBGM(); // 명시적으로 기존 BGM 정지
    await k.wait(0.1); // 짧은 대기 시간
    audioManager.switchBGM("second-bgm", 0.3);

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/second.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
        objects: [], // globalSystemManager에 등록할 오브젝트들
    };

    const layers = mapData.layers;

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    // 기본 스폰포인트 처리
                    if (object.name === "player_second") {
                        console.log("🎮 기본 2층 플레이어 스폰포인트 발견:", object);
                        // 타겟 스폰이 설정되지 않은 경우에만 기본 위치 사용
                        if (!entities.player && !gameState.getTargetSpawn()) {
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            console.log(`✅ 플레이어 생성: player_second (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // first에서 올라온 경우 player_from_first 스폰포인트 사용
                    if (object.name === "player_from_first" && previousScene === "first") {
                        console.log("⬆️ 1층에서 올라온 경우 - player_from_first 스폰포인트 사용:", object);
                        if (!entities.player) {
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            console.log(`✅ 플레이어 생성: player_from_first (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // health에서 돌아온 경우 player_health 스폰포인트 사용
                    if (object.name === "player_health" && previousScene === "health") {
                        console.log("🏥 보건실에서 돌아온 경우 - player_health 스폰포인트 사용:", object);
                        if (!entities.player) {
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            console.log(`✅ 플레이어 생성: player_health (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // second2에서 돌아온 경우 player_from_second2 스폰포인트 사용
                    if (object.name === "player_from_second2" && previousScene === "second2") {
                        console.log("↩️ second2에서 돌아온 경우 - player_from_second2 스폰포인트 사용:", object);
                        if (!entities.player) {
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            console.log(`✅ 플레이어 생성: player_from_second2 (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // class1에서 door_from_second를 통해 돌아온 경우 player_front1 스폰포인트 사용
                    if (object.name === "player_front1") {
                        console.log("🎮 player_front1 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_front1") {
                            console.log("🎯 player_front1 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                            console.log(`✅ 플레이어 생성: player_front1 (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // class1에서 door_from_second_back을 통해 돌아온 경우 player_back1 스폰포인트 사용
                    if (object.name === "player_back1") {
                        console.log("🎮 player_back1 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_back1") {
                            console.log("🎯 player_back1 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                            console.log(`✅ 플레이어 생성: player_back1 (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // class2에서 door_from_second를 통해 돌아온 경우 player_front2 스폰포인트 사용
                    if (object.name === "player_front2") {
                        console.log("🎮 player_front2 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_front2") {
                            console.log("🎯 player_front2 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                            console.log(`✅ 플레이어 생성: player_front2 (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // class2에서 door_from_second_back을 통해 돌아온 경우 player_back2 스폰포인트 사용
                    if (object.name === "player_back2") {
                        console.log("🎮 player_back2 스폰포인트 발견:", object);
                        const targetSpawn = gameState.getTargetSpawn();
                        if (targetSpawn === "player_back2") {
                            console.log("🎯 player_back2 스폰포인트로 플레이어 생성");
                            entities.player = map.add(
                                generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                            );
                            gameState.setTargetSpawn(null); // 스폰 완료 후 리셋
                            console.log(`✅ 플레이어 생성: player_back2 (${object.x}, ${object.y})`);
                        }
                        continue;
                    }

                    // Student NPC 처리
                    if (object.name.startsWith("student")) {
                        const studentType = object.name;
                        console.log(`🎭 Student 생성: ${studentType} at (${object.x}, ${object.y})`);
                        
                        // secondAssets.js에서 sprite config 가져오기
                        const spriteConfig = getStudentSpriteConfig(studentType);
                        
                        const student = map.add([
                            k.sprite("second-assets", spriteConfig),
                            k.area({
                                shape: new k.Rect(k.vec2(0, -10), 16, 24), // Y 오프셋 -10으로 콜라이더를 위로 이동
                            }),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1), // 플레이어보다 아래, 배경보다 위에 배치
                            "student",
                            { studentType },
                        ]);

                        entities.students.push(student);
                        console.log(`✅ Student ${studentType} 생성 완료, 총 학생 수: ${entities.students.length}`);

                        // Student 상호작용 시스템
                        student.onCollideUpdate("player", (player) => {
                            console.log(`🎯 Student ${studentType}와 충돌 감지`);
                            const locale = gameState.getLocale();
                            const content = secondDialogues.objectDialogues[locale]?.[studentType] || [
                                `Hello! I'm ${studentType}!`,
                                `안녕하세요! 저는 ${studentType}입니다!`,
                            ];

                            const speakerName =
                                secondDialogues.npcNames[locale]?.[studentType] ||
                                studentType;

                            console.log(`💬 대화 설정: ${speakerName} - ${content[0]}`);

                            gameState.setInteractableObject(student, "student", {
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

                    // Letter 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letterId =
                            object.properties?.find((p) => p.name === "letterId")
                                ?.value || letterType;

                        const letter = map.add([
                            k.sprite("second-assets", {
                                anim: letterType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            "letter",
                            { letterId, letterType },
                        ]);

                        entities.letters.push(letter);

                        // Letter 상호작용 시스템
                        letter.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = objectDialogues[locale]?.[
                                letterType
                            ] || [
                                `This is ${letterType}`,
                                `이것은 ${letterType}입니다`,
                            ];

                            const speakerName =
                                objectDialogues.names[locale]?.[letterType] ||
                                letterType;

                            gameState.setInteractableObject(letter, "letter", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        letter.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 편지를 entities에 추가하여 추적
                        entities.letters.push(letter);
                        continue;
                    }

                    // Teacher NPC 처리 (2층에는 선생님이 있을 수 있음)
                    if (object.name.startsWith("teacher")) {
                        const teacherType = object.name;
                        const teacher = map.add([
                            k.sprite("second-assets", {
                                anim: teacherType,
                            }),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y),
                            k.z(1),
                            teacherType,
                            { teacherType },
                        ]);

                        // Teacher 상호작용 시스템
                        teacher.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = dialogues[locale]?.[teacherType] || [
                                `Hello! I'm ${teacherType}!`,
                                `안녕하세요! 저는 ${teacherType}입니다!`,
                            ];

                            const speakerName =
                                dialogues.names[locale]?.[teacherType] ||
                                teacherType;

                            gameState.setInteractableObject(teacher, "teacher", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        teacher.onCollideEnd("player", (player) => {
                            gameState.clearInteractableObject();
                        });

                        // 선생님을 entities에 추가하여 추적
                        entities.teachers = entities.teachers || [];
                        entities.teachers.push(teacher);
                        continue;
                    }
                }
            }
            continue;
        }

        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                console.log(`🔍 Boundaries 객체 확인: ${object.name} at (${object.x}, ${object.y})`);
                
                // Student NPC 처리 (boundaries 레이어에서)
                if (object.name.startsWith("student")) {
                    const studentType = object.name;
                    console.log(`🎭 Boundaries에서 Student 영역 생성: ${studentType} at (${object.x}, ${object.y})`);
                    
                    // 스프라이트 없이 투명한 콜라이더만 생성
                    const student = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // Y 위치를 10픽셀 위로 조정
                        k.opacity(0), // 완전히 투명
                        "student",
                        { studentType },
                    ]);

                    entities.students.push(student);
                    console.log(`✅ Boundaries Student ${studentType} 영역 생성 완료, 총 학생 수: ${entities.students.length}`);

                    // Student 상호작용 시스템
                    student.onCollideUpdate("player", (player) => {
                        console.log(`🎯 Student ${studentType}와 충돌 감지`);
                        const locale = gameState.getLocale();
                        const content = secondDialogues.objectDialogues[locale]?.[studentType] || [
                            `Hello! I'm ${studentType}!`,
                            `안녕하세요! 저는 ${studentType}입니다!`,
                        ];

                        const speakerName =
                            secondDialogues.npcNames[locale]?.[studentType] ||
                            studentType;

                        console.log(`💬 대화 설정: ${speakerName} - ${content[0]}`);

                        gameState.setInteractableObject(student, "student", {
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

                if (
                    [
                        "classroom1",
                        "classroom2",
                        "classroom3", 
                        "classroom4",
                        "teachers_office",
                        "computer_room",
                        "library",
                        "science_room",
                        "art_room",
                        "music_room",
                        "stair_to_first",
                        "door_health",
                        "window",
                        "blackboard",
                        "desk",
                        "chair",
                        "locker",
                        "bookshelf",
                        // secondDialogue.js에 정의된 오브젝트들 추가
                        "desk_spare1",
                        "desk_spare2",
                        "shelf",
                        "wheelchair",
                        "elevator2",
                        "mirror",
                        "plant3",
                        "bookcase",
                        "bin",
                        "vendingmachine",
                        "door_wc2",
                        "exit_to_next",
                        "cleaning_case",
                        "door_class1",
                        "door_class1_back",
                        "door_class2",
                        "door_class2_back",
                        "shoecase",
                        "books",
                        "desk_sci",
                        "shelf_sci",
                        "door_sci",
                    ].includes(object.name)
                ) {
                    const objectType = object.name;

                    // stair_to_first는 특별히 처리 - first로 이동
                    if (objectType === "stair_to_first") {
                        const stairToFirstEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            "stair_to_first",
                            "interactive-object",
                            { objectType: "stair_to_first" },
                        ]);

                        stairToFirstEntity.onCollide("player", () => {
                            console.log(
                                "🚪 stair_to_first 충돌 - first로 이동"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("second");
                            k.go("first");
                        });
                        continue;
                    }

                    // door_health 처리 - health.js로 이동
                    if (objectType === "door_health") {
                        console.log(`🏥 door_health 오브젝트 발견: (${object.x}, ${object.y})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(
                                "🏥 door_health 충돌 - health로 이동"
                            );
                            k.play("boop-sfx");
                            
                            gameState.setPreviousScene("second");
                            k.go("health");
                        });
                        console.log(`✅ door_health 엔티티 생성 완료`);
                        continue;
                    }

                    // door_class1 처리 - class1.js로 이동 (정면 입구)
                    if (objectType === "door_class1") {
                        console.log(`🚪 door_class1 오브젝트 발견: (${object.x}, ${object.y})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_class1 충돌 - class1로 이동 (player_front 스폰)"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("second");
                            gameState.setTargetSpawn("player_front"); // door_from_second에 대응
                            k.go("class1");
                        });
                        console.log(`✅ door_class1 엔티티 생성 완료`);
                        continue;
                    }

                    // door_class1_back 처리 - class1.js로 이동 (뒷문 입구)
                    if (objectType === "door_class1_back") {
                        console.log(`🚪 door_class1_back 오브젝트 발견: (${object.x}, ${object.y})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_class1_back 충돌 - class1로 이동 (player_back 스폰)"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("second");
                            gameState.setTargetSpawn("player_back"); // door_from_second_back에 대응
                            k.go("class1");
                        });
                        console.log(`✅ door_class1_back 엔티티 생성 완료`);
                        continue;
                    }

                    // door_class2 처리 - class2.js로 이동 (정면 입구)
                    if (objectType === "door_class2") {
                        console.log(`🚪 door_class2 오브젝트 발견: (${object.x}, ${object.y})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_class2 충돌 - class2로 이동 (player_front 스폰)"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("second");
                            gameState.setTargetSpawn("player_front"); // door_from_second에 대응
                            k.go("class2");
                        });
                        console.log(`✅ door_class2 엔티티 생성 완료`);
                        continue;
                    }

                    // door_class2_back 처리 - class2.js로 이동 (뒷문 입구)
                    if (objectType === "door_class2_back") {
                        console.log(`🚪 door_class2_back 오브젝트 발견: (${object.x}, ${object.y})`);
                        const doorEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        doorEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_class2_back 충돌 - class2로 이동 (player_back 스폰)"
                            );
                            k.play("boop-sfx");
                            gameState.setPreviousScene("second");
                            gameState.setTargetSpawn("player_back"); // door_from_second_back에 대응
                            k.go("class2");
                        });
                        console.log(`✅ door_class2_back 엔티티 생성 완료`);
                        continue;
                    }

                    // exit_to_next 처리 - second2.js로 이동
                    if (objectType === "exit_to_next") {
                        const exitEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 20), // 콜라이더 Y 위치를 20px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            { objectType },
                        ]);

                        exitEntity.onCollide("player", () => {
                            console.log(
                                "🚪 exit_to_next 충돌 - second2로 이동"
                            );
                            // 뚫려있는 곳이므로 문소리 제거
                            gameState.setPreviousScene("second");
                            k.go("second2");
                        });
                        continue;
                    }

                    // 자판기 특별 처리 - 선택지 액션 포함
                    if (objectType === "vendingmachine") {
                        console.log(`🥤 자판기 오브젝트 발견: (${object.x}, ${object.y})`);
                        const vendingEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                            k.opacity(0),
                            objectType,
                            "interactive-object",
                            "object",
                            { objectType },
                        ]);

                        // 자판기 상호작용 시스템 (선택지 액션 처리 포함)
                        vendingEntity.onCollide("player", (player) => {
                            const locale = gameState.getLocale();
                            const dialogueData = secondDialogues.objectDialogues[locale]?.[objectType];
                            
                            if (dialogueData) {
                                const content = dialogueData; // 선택지가 포함된 배열
                                const speakerName = secondDialogues.objectNames[locale]?.[objectType] || objectType;

                                console.log(`🥤 자판기 상호작용 설정 (선택지 포함)`);
                                gameState.setInteractableObject(
                                    vendingEntity,
                                    "object",
                                    {
                                        content: content,
                                        speakerName: speakerName,
                                        speakerImage: null,
                                        // 선택지 액션 핸들러
                                        onChoiceAction: (actionData) => {
                                            console.log(`🥤 자판기 선택지 액션:`, actionData);
                                            
                                            if (actionData.action === "drink_vending") {
                                                console.log("🥤 음료 마시기 액션 실행!");
                                                
                                                // drink-sfx.wav 효과음 재생
                                                if (k.getSound("drink-sfx")) {
                                                    k.play("drink-sfx");
                                                    console.log("🎵 drink-sfx 효과음 재생");
                                                } else {
                                                    console.warn("⚠️ drink-sfx 사운드를 찾을 수 없음");
                                                }
                                                
                                                // 체력 +2 증가
                                                globalState.changeHealth(2);
                                                console.log(`❤️ 체력이 2 증가했습니다. 현재 체력: ${globalState.getHealth()}`);
                                                
                                                // 체력 증가 알림 표시
                                                if (window.showStatusChangeMessage) {
                                                    window.showStatusChangeMessage("음료를 마셔서 체력이 회복되었습니다", "health", "increase");
                                                }
                                                
                                                // 상태바 업데이트
                                                if (window.updateStatusBars) {
                                                    window.updateStatusBars();
                                                }
                                            } else if (actionData.action === "cancel") {
                                                console.log("🥤 자판기 사용 취소");
                                            }
                                        }
                                    }
                                );
                            }
                        });

                        vendingEntity.onCollideEnd("player", (player) => {
                            console.log(`🥤 자판기에서 벗어남 - 상호작용 해제`);
                            gameState.clearInteractableObject();
                        });

                        // 오브젝트를 entities에 추가하여 추적
                        const objectData = { 
                            entity: vendingEntity, 
                            type: "object", 
                            objectType: objectType,
                            dialogueData: {
                                content: secondDialogues.objectDialogues?.korean?.[objectType],
                                speakerName: secondDialogues.objectNames?.korean?.[objectType] || objectType,
                                speakerImage: null,
                            }
                        };
                        entities.objects.push(objectData);
                        console.log(`✅ 자판기 엔티티 생성 완료`);
                        continue;
                    }

                    // 일반 상호작용 오브젝트 처리 (2층 관련 오브젝트들)
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        "object",  // globalSystemManager가 찾을 수 있도록 object 태그 추가
                        { objectType },
                    ]);

                    // 전역 오브젝트 시스템에 등록 (globalSystemManager 초기화 후 처리)
                    const dialogueData = secondDialogues.objectDialogues?.korean?.[objectType];
                    const objectData = { 
                        entity: objectEntity, 
                        type: "object", 
                        objectType: objectType,
                        dialogueData: dialogueData ? {
                            content: dialogueData,
                            speakerName: secondDialogues.objectNames?.korean?.[objectType] || objectType,
                            speakerImage: null,
                        } : null
                    };

                    // 상호작용 시스템 (restroom.js 스타일 수정)
                    objectEntity.onCollide("player", (player) => {
                        const locale = gameState.getLocale();
                        const dialogueData = secondDialogues.objectDialogues[locale]?.[objectType];
                        
                        if (dialogueData) {
                            const content = dialogueData; // 이미 배열이므로 그대로 사용
                            const speakerName = secondDialogues.objectNames[locale]?.[objectType] || objectType;

                            console.log(`🎯 ${objectType} 상호작용 설정 (onCollide)`);
                            gameState.setInteractableObject(
                                objectEntity,
                                "object",  // restroom.js 스타일: 고정값 사용
                                {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                }
                            );
                        }
                    });

                    objectEntity.onCollideEnd("player", (player) => {
                        console.log(`🎯 ${objectType} 오브젝트에서 벗어남 - 상호작용 해제`);
                        gameState.clearInteractableObject();
                    });

                    // 오브젝트를 entities에 추가하여 추적 (한 번만)
                    entities.objects.push(objectData);
                }

                // 일반 경계선 처리 (이름이 없는 벽들)
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x, object.y - 10), // 콜라이더 Y 위치를 10px 위로 조정
                    k.area(),
                    k.body({ isStatic: true }),
                    k.opacity(0),
                    tag,
                ]);
            }
            continue;
        }

        if (layer.name === "note") {
            console.log("📝 Note 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    const noteId =
                        object.properties?.find((p) => p.name === "noteId")
                            ?.value || object.name;

                    const note = map.add(
                        generateNoteComponents(k, k.vec2(object.x, object.y), noteId)
                    );

                    note.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content =
                            noteDialogues[locale]?.[noteId] ||
                            noteDialogues["english"]?.[noteId] || [
                                "This is a note",
                                "이것은 쪽지입니다",
                            ];

                        gameState.setInteractableObject(note, "note", {
                            content: content,
                            speakerName: null,
                            speakerImage: null,
                        });
                    });

                    note.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });

                    // 노트를 entities에 추가하여 추적
                    entities.notes = entities.notes || [];
                    entities.notes.push(note);
                }
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            // console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            console.log(`🎨 Layer ${layer.name} info:`, {
                name: layer.name,
                type: layer.type,
                opacity: layer.opacity,
                visible: layer.visible,
                chunks: layer.chunks.length
            });
            for (const chunk of layer.chunks) {
                // console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
                let tileIndex = 0;
                let tilesAdded = 0;
                for (let y = 0; y < chunk.height; y++) {
                    for (let x = 0; x < chunk.width; x++) {
                        const tile = chunk.data[tileIndex];
                        tileIndex++;

                        if (tile === 0) continue;

                        // chunk의 절대 위치 계산
                        const tileX = (chunk.x + x) * mapData.tilewidth;
                        const tileY = (chunk.y + y) * mapData.tileheight;

                        // upmost 레이어는 캐릭터보다 위에 배치 (z=3), cha 레이어는 캐릭터와 같은 레벨 (z=1), 다른 타일은 기본 (z=0)
                        const zIndex = layer.name === "upmost" ? 3 : layer.name === "cha" ? 1 : 0;

                        // second.json은 second-assets 스프라이트를 사용
                        const tileEntity = map.add([
                            k.sprite("second-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                            // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                        ]);
                        
                        // 첫 번째 chunk의 첫 몇 개 타일 위치 디버그
                        if (tilesAdded < 5) {
                            // console.log(`🎨 Second 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
                        }
                        tilesAdded++;
                    }
                }
                // console.log(`✅ Layer ${layer.name} chunk: ${tilesAdded} tiles added`);
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
                let zIndex = 0;
                if (layer.name === "upmost") {
                    zIndex = 3;
                } else if (layer.name === "cha") {
                    zIndex = 1;
                }

                // Use second-assets sprite (second.json과 호환)
                map.add([
                    k.sprite("second-assets", { frame: tile - 1 }),
                    k.pos(tilePos),
                    k.z(zIndex),
                    // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                ]);
                tilesAdded++;
            }
            console.log(`✅ Layer ${layer.name}: ${tilesAdded} tiles added out of ${layer.data.length} total`);
            continue;
        }
    }

    // 플레이어가 스폰되지 않았다면 기본 위치에 생성
    if (!entities.player) {
        console.log(
            "⚠️ 플레이어 스폰 포인트를 찾을 수 없어 기본 위치에 생성합니다."
        );
        entities.player = map.add(
            generateFirstPlayerComponents(k, k.vec2(200, 200)) // 2층 맵 중앙 근처에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    k.camScale(2); // first.js와 동일하게 2로 설정
    
    // 카메라 초기 위치 설정
    if (entities.player && entities.player.exists()) {
        k.camPos(entities.player.pos);
        console.log("🎯 Second 카메라 초기 위치 설정:", entities.player.pos);
    }

    // 간단한 카메라 따라가기 시스템
    k.onUpdate(() => {
        if (entities.player && entities.player.exists()) {
            const playerPos = entities.player.pos;
            k.camPos(playerPos);
        }
    });

    // 퀘스트 말풍선 시스템 초기화 (학생이 있다면)
    if (entities.students.length > 0) {
        initializeQuestBubbles(k, entities.students, map);
    }

    watchPlayerHealth(k);

    let isLocaleLocked = { value: false };
    let isMuteLocked = { value: false };

    // 키보드 단축키
    k.onKeyPress("l", () => {
        // L키 - 설정창 열기
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("🔧 L키로 설정창 열기");
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㅣ", () => {
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("🔧 ㅣ키로 설정창 열기");
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("r", () => {
        // R키 - 퀘스트창 열기
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("📋 R키로 퀘스트창 열기");
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㄱ", () => {
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            console.log("📋 ㄱ키로 퀘스트창 열기");
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("m", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    k.onKeyPress("ㅡ", () => {
        toggleMute(k, gameState, isMuteLocked);
    });

    // I키 - 인벤토리 열기
    k.onKeyPress("i", () => {
        console.log("🎒 I키로 인벤토리 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalInventory) {
            window.globalSystemManager.globalInventory.toggle();
        } else {
            console.warn("⚠️ 인벤토리 시스템이 아직 초기화되지 않음");
        }
    });

    k.onKeyPress("ㅑ", () => {
        console.log("🎒 ㅑ키로 인벤토리 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalInventory) {
            window.globalSystemManager.globalInventory.toggle();
        } else {
            console.warn("⚠️ 인벤토리 시스템이 아직 초기화되지 않음");
        }
    });

    // 게임패드 컨트롤 (L/R 숄더 버튼)
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 설정창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 퀘스트창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 설정창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.openSettingsPopup();
        } else {
            console.warn("⚠️ 설정창 시스템이 아직 초기화되지 않음");
        }
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 퀘스트창 열기");
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            if (window.globalSystemManager.globalUI.questState.isPopupOpen) {
                window.globalSystemManager.globalUI.closeQuestPopup();
            } else {
                window.globalSystemManager.globalUI.openQuestPopup();
            }
        } else {
            console.warn("⚠️ 퀘스트 UI 시스템이 아직 초기화되지 않음");
        }
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);
    
    // ==============================
    // 전역 시스템 통합 매니저 초기화
    // ==============================
    
    // secondDialogue를 전역 시스템에 전달 (restroom.js 스타일)
    const sceneDialogues = {
        objectDialogues: secondDialogues,  // restroom.js와 동일하게 전체 객체 전달
        npcDialogues: secondDialogues,     // NPC 대화용 (현재는 없음)
        names: {}                          // 별도 이름 매핑이 없으므로 빈 객체
    };

    const globalSystemManager = setupGlobalSystemManager(
        k, 
        gameState, 
        globalState, 
        entities, 
        "second", 
        sceneDialogues
    );
    
    // 전역 시스템 매니저 초기화
    globalSystemManager.initialize();
    
    // globalSystemManager.globalCamera 사용 (class1.js와 동일한 데드존 시스템)
    if (globalSystemManager.globalCamera) {
        globalSystemManager.globalCamera.setMapBounds(mapBounds);
        globalSystemManager.globalCamera.setCameraAnimating(false);
    }
    
    // 퀘스트 UI 추가
    setupQuestUI(k, gameState);

    // 인벤토리 시스템 로드 (전역 상태에서)
    if (globalSystemManager && globalSystemManager.globalInventory) {
        console.log("🔄 second 씬 인벤토리 시스템 전역 상태에서 로드");
        globalSystemManager.globalInventory.loadFromGlobalState();
        
        // 아이템이 있으면 인벤토리 표시
        const globalInventory = globalState.getGlobalInventory();
        if (globalInventory && globalInventory.length > 0) {
            console.log("🎒 second 씬에서 인벤토리에 아이템이 있어서 표시");
            globalSystemManager.globalInventory.show();
        }
    } else {
        console.warn("⚠️ second 씬에서 인벤토리 시스템이 초기화되지 않음");
    }

    // 씬 종료 시 정리
    k.onSceneLeave(() => {
        console.log("🧹 second 씬 종료 - 정리 시작");
        
        if (globalSystemManager && globalSystemManager.cleanup) {
            globalSystemManager.cleanup();
        }
        
        console.log("✅ second 씬 정리 완료");
    });
}
