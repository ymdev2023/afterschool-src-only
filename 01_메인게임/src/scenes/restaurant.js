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

import {
    colorizeBackground,
    fetchMapData,
    drawBoundaries,
    onAttacked,
    onCollideWithPlayer,
    setupMainMenuShortcut,
    initializeQuestBubbles,
    updateQuestBubbles,
} from "../utils.js";

import { restaurantObjectNames, restaurantDialogues } from "../content/dialogue/restaurantDialogue.js";
import { dialog } from "../uiComponents/dialog.js";
import { setupGlobalSystemManager } from "../uiComponents/globalSystemManager.js";

// 퀘스트 UI 시스템
function setupQuestUI(k, gameState) {
    // 퀘스트 상태 관리
    const questState = {
        hasNewQuests: true, // 새로운 퀘스트가 있는지 여부
        isPopupOpen: false,
    };

    // 퀘스트 아이콘 (화면 우측 상단)
    const questIcon = k.add([
        k.sprite("restaurant-assets", {
            frame: questState.hasNewQuests ? 51 : 50, // 열린편지 : 닫힌편지 (restaurant-assets 사용)
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
                title: "• 급식실 탐험하기",
                details: ["  - 음식 코너 둘러보기", "  - 출입구 찾기"],
                expanded: false
            },
            {
                title: "• 급식실 직원과 대화하기", 
                details: ["  - 조리사님께 인사하기", "  - 급식 메뉴 알아보기"],
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

        // 닫기 버튼
        closeButton = k.add([
            k.rect(80, 40),
            k.pos(k.width() * 0.8, k.height() * 0.75),
            k.color(60, 60, 80),
            k.outline(2, k.Color.WHITE),
            k.area(),
            k.z(151),
            k.fixed(),
            "close-button",
            "quest-popup-element", // 태그 추가
        ]);

        const closeButtonText = k.add([
            k.text("Close", {
                size: 16,
                font: "galmuri",
            }),
            k.pos(k.width() * 0.82, k.height() * 0.76),
            k.color(255, 255, 255),
            k.z(152),
            k.fixed(),
            "quest-popup-element", // 태그 추가
        ]);

        // 닫기 버튼 클릭 이벤트
        closeButton.onClick(() => {
            closeQuestPopup();
        });

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

export default async function restaurant(k) {
    console.log("🍽️ restaurant scene 시작");

    // 🚀 BGM 즉시 전환 (새로운 switchBGM 사용)
    console.log("🎵 Restaurant BGM으로 즉시 전환");
    audioManager.switchBGM("restaurant-bgm", 0.8); // restaurant 전용 BGM 사용

    const previousScene = gameState.getPreviousScene();

    // 언어를 한국어로 설정
    gameState.setLocale("korean");

    // 배경을 검은색으로 설정
    colorizeBackground(k, 0, 0, 0);
    const mapData = await fetchMapData("./assets/images/restaurant.json");
    const map = k.add([k.pos(0, 0)]);

    const entities = {
        player: null,
        students: [],
        letters: [],
    };
    const layers = mapData.layers;

    // 모든 레이어 처리
    for (const layer of layers) {
        if (layer.name === "spawnpoint") {
            console.log("🎯 Spawnpoint 레이어 발견:", layer);
            if (layer.objects && layer.objects.length > 0) {
                for (const object of layer.objects) {
                    if (object.name === "player") {
                        console.log("🎮 플레이어 스폰포인트 발견:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }

                    // first에서 온 경우 (일반 스폰포인트 사용)
                    if (
                        object.name === "player" &&
                        previousScene === "first"
                    ) {
                        console.log("🚪 1층에서 온 플레이어 스폰포인트 사용:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }

                    // first에서 온 경우 (급식실 전용 스폰포인트)
                    if (
                        object.name === "from_first" &&
                        previousScene === "first"
                    ) {
                        console.log("🚪 1층에서 온 플레이어 스폰포인트 사용:", object);
                        entities.player = map.add(
                            generateFirstPlayerComponents(k, k.vec2(object.x, object.y))
                        );
                        continue;
                    }



                    // Letter 오브젝트 처리
                    if (object.name.startsWith("letter")) {
                        const letterType = object.name;
                        const letterId =
                            object.properties?.find((p) => p.name === "letterId")
                                ?.value || letterType;

                        // letter_food의 경우 특정 frame 사용
                        let spriteConfig;
                        if (letterType === "letter_food") {
                            spriteConfig = { frame: 2314 };
                        } else {
                            // 다른 letter 타입의 경우 기본 frame 사용
                            spriteConfig = { frame: 0 };
                        }

                        const letter = map.add([
                            k.sprite("restaurant-assets", spriteConfig),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 25), // 스폰 Y 위치를 25px 위로 조정
                            k.z(1),
                            "letter",
                            { letterId, letterType },
                        ]);

                        entities.letters.push(letter);

                        // letter_food의 경우 상호작용 추가
                        if (letterType === "letter_food") {
                            letter.onCollideUpdate("player", (player) => {
                                const locale = gameState.getLocale();
                                const content = restaurantDialogues[locale]?.letter_food || [
                                    "(Hey, isn't Yoo Ha-eun really annoying?)",
                                    "(She's always near the assembly area...)",
                                    "(Even when you talk to her, she doesn't respond properly...)",
                                    "(I don't know, she's just gloomy)",
                                    "(...)",
                                    "(Who is Yoo Ha-eun?)",
                                ];

                                const speakerName = restaurantObjectNames[locale]?.letter_food || "Note";

                                gameState.setInteractableObject(letter, "letter", {
                                    content: content,
                                    speakerName: speakerName,
                                    speakerImage: null,
                                });
                            });

                            letter.onCollideEnd("player", () => {
                                gameState.clearInteractableObject();
                            });

                            console.log(`✅ letter_food - 쪽지 생성 및 상호작용 시스템 추가 완료 (sprite frame: ${spriteConfig.frame})`);
                        }
                        
                        continue;
                    }

                    // NPC (cook, staff)는 상호작용 없음 (restaurantDialogue.js에서 처리하지 않음)
                }
            }
            continue;
        }

        if (layer.name === "boundaries") {
            console.log("🚧 Boundaries 레이어 발견:", layer);
            // boundaries 레이어에서 특별한 오브젝트들 처리
            for (const object of layer.objects) {
                // student 객체들은 투명한 콜라이더만 생성 (스프라이트 없음)
                if (object.name.startsWith("student")) {
                    console.log(`👻 ${object.name} - 투명 콜라이더만 생성 (스프라이트 없음)`);
                    
                    // 투명한 콜라이더만 생성
                    const studentCollider = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 15),
                        k.opacity(0), // 완전 투명
                        object.name,
                        "student-boundary",
                    ]);
                    
                    // restaurantDialogue에 정의된 student만 상호작용 추가
                    if (["student23", "student24", "student25", "student26", "student27"].includes(object.name)) {
                        studentCollider.onCollideUpdate("player", (player) => {
                            const locale = gameState.getLocale();
                            const content = restaurantDialogues[locale]?.[object.name] || [
                                `Hello! I'm ${object.name}!`,
                                `안녕하세요! 저는 ${object.name}입니다!`,
                            ];

                            const speakerName = restaurantObjectNames[locale]?.[object.name] || object.name;

                            gameState.setInteractableObject(studentCollider, "student", {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            });
                        });

                        studentCollider.onCollideEnd("player", () => {
                            gameState.clearInteractableObject();
                        });
                        
                        console.log(`✅ ${object.name} - 대화 시스템 추가 완료`);
                    }
                    
                    continue;
                }

                // food_counter 처리
                if (object.name === "food_counter") {
                    console.log(`🍽️ ${object.name} - 투명 콜라이더만 생성 (스프라이트 없음)`);
                    
                    // 투명한 콜라이더만 생성
                    const foodCounterCollider = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 15),
                        k.opacity(0), // 완전 투명
                        object.name,
                        "food-counter-boundary",
                    ]);
                    
                    // food_counter 상호작용 추가
                    foodCounterCollider.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        const content = restaurantDialogues[locale]?.food_counter || [
                            "Enjoy your meal, student!!!!",
                            "Let me know if you need more side dishes!!",
                        ];

                        const speakerName = restaurantObjectNames[locale]?.food_counter || "Cafeteria Staff";

                        gameState.setInteractableObject(foodCounterCollider, "npc", {
                            content: content,
                            speakerName: speakerName,
                            speakerImage: null,
                        });
                    });

                    foodCounterCollider.onCollideEnd("player", () => {
                        gameState.clearInteractableObject();
                    });
                    
                    console.log(`✅ ${object.name} - 대화 시스템 추가 완료`);
                    continue;
                }

                // 실제 JSON에 있는 객체만 처리
                if (object.name === "door_to_first") {
                    const objectType = object.name;

                    // door_to_first는 특별히 처리 - first로 이동
                    if (objectType === "door_to_first") {
                        const doorToFirstEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 15), // 콜라이더 Y 위치를 15px 위로 조정
                            k.opacity(0),
                            "door_to_first",
                            "interactive-object",
                            { objectType: "door_to_first" },
                        ]);

                        doorToFirstEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_to_first 충돌 - first로 이동, player_restaurant_return 위치로"
                            );
                            k.play("door-open-sfx"); // 문 열리는 효과음
                            k.wait(0.2, () => {
                                k.play("door-close-sfx"); // 문 닫히는 효과음
                            });
                            gameState.setPreviousScene("restaurant");
                            k.go("first");
                        });
                        continue;
                    }

                    // door_food는 특별히 처리 - first로 이동
                    if (objectType === "door_food") {
                        const doorFoodEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 15), // 콜라이더 Y 위치를 15px 위로 조정
                            k.opacity(0),
                            "door_food",
                            "interactive-object",
                            { objectType: "door_food" },
                        ]);

                        doorFoodEntity.onCollide("player", () => {
                            console.log(
                                "🚪 door_food 충돌 - first로 이동"
                            );
                            k.play("door-open-sfx"); // 문 열리는 효과음
                            k.wait(0.2, () => {
                                k.play("door-close-sfx"); // 문 닫히는 효과음
                            });
                            gameState.setPreviousScene("restaurant");
                            k.go("first");
                        });
                        continue;
                    }

                    // exit_to_first는 특별히 처리 - first로 이동
                    if (objectType === "exit_to_first") {
                        const exitToFirstEntity = map.add([
                            k.rect(object.width, object.height),
                            k.area(),
                            k.body({ isStatic: true }),
                            k.pos(object.x, object.y - 15), // 콜라이더 Y 위치를 15px 위로 조정
                            k.opacity(0),
                            "exit_to_first",
                            "interactive-object",
                            { objectType: "exit_to_first" },
                        ]);

                        exitToFirstEntity.onCollide("player", () => {
                            console.log(
                                "🚪 exit_to_first 충돌 - first로 이동"
                            );
                            k.play("door-open-sfx"); // 문 열리는 효과음
                            k.wait(0.2, () => {
                                k.play("door-close-sfx"); // 문 닫히는 효과음
                            });
                            gameState.setPreviousScene("restaurant");
                            k.go("first");
                        });
                        continue;
                    }

                    // 일반 상호작용 오브젝트 처리 (급식실 관련 오브젝트들)
                    const objectEntity = map.add([
                        k.rect(object.width, object.height),
                        k.area(),
                        k.body({ isStatic: true }),
                        k.pos(object.x, object.y - 15), // 콜라이더 Y 위치를 15px 위로 조정
                        k.opacity(0),
                        objectType,
                        "interactive-object",
                        { objectType },
                    ]);

                    // 상호작용 시스템
                    objectEntity.onCollideUpdate("player", (player) => {
                        const locale = gameState.getLocale();
                        let content;
                        let speakerName;

                        // 급식실 관련 오브젝트별 메시지 설정
                        if (objectType.startsWith("food_counter")) {
                            content = locale === "korean" ? 
                                ["급식 배식대입니다.", "맛있는 급식이 준비되어 있습니다."] :
                                ["This is a food counter.", "Delicious meals are prepared here."];
                            speakerName = locale === "korean" ? "급식 배식대" : "Food Counter";
                        } else if (objectType.startsWith("table")) {
                            content = locale === "korean" ? 
                                ["급식실 테이블입니다.", "여기서 식사를 할 수 있습니다."] :
                                ["This is a dining table.", "You can eat here."];
                            speakerName = locale === "korean" ? "식탁" : "Dining Table";
                        } else if (objectType === "kitchen_door") {
                            content = locale === "korean" ? 
                                ["주방 문입니다.", "주방으로 들어갈 수 있습니다."] :
                                ["This is the kitchen door.", "You can enter the kitchen."];
                            speakerName = locale === "korean" ? "주방 문" : "Kitchen Door";
                        } else {
                            content = objectDialogues[locale]?.[objectType] || [
                                `This is ${objectType}`,
                                `이것은 ${objectType}입니다`,
                            ];
                            speakerName = objectDialogues.names[locale]?.[objectType] || objectType;
                        }

                        gameState.setInteractableObject(
                            objectEntity,
                            "object",
                            {
                                content: content,
                                speakerName: speakerName,
                                speakerImage: null,
                            }
                        );
                    });

                    objectEntity.onCollideEnd("player", (player) => {
                        gameState.clearInteractableObject();
                    });
                }

                // 일반 경계선 처리 (이름이 없는 벽들)
                const tag = object.name !== "" ? object.name : object.type || "wall";
                
                console.log(`🧱 일반 경계선 생성: ${tag} at (${object.x}, ${object.y}) size: ${object.width}x${object.height}`);
                
                const collider = map.add([
                    k.rect(object.width, object.height),
                    k.pos(object.x, object.y - 15), // 콜라이더 Y 위치를 15px 위로 조정
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
                        generateNoteComponents(k, k.vec2(object.x, object.y - 15), noteId) // 노트 Y 위치를 15px 위로 조정
                    );

                    // Note는 상호작용 없음 (restaurantDialogue.js에서 처리하지 않음)
                }
            }
            continue;
        }

        // Handle regular tile layers with chunks system (infinite maps)
        if (layer.chunks) {
            console.log(`🧩 Processing chunks for layer: ${layer.name}`, layer.chunks.length);
            console.log(`🎨 Layer ${layer.name} info:`, {
                name: layer.name,
                type: layer.type,
                opacity: layer.opacity,
                visible: layer.visible,
                chunks: layer.chunks.length
            });
            for (const chunk of layer.chunks) {
                console.log(`📦 Processing chunk at (${chunk.x}, ${chunk.y}) size: ${chunk.width}x${chunk.height}`);
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

                        // restaurant.json은 restaurant-assets 스프라이트를 사용
                        const tileEntity = map.add([
                            k.sprite("restaurant-assets", { frame: tile - 1 }),
                            k.pos(tileX, tileY),
                            k.z(zIndex),
                            // k.offscreen(), // 제거하여 모든 타일이 보이도록 함
                        ]);
                        
                        // 첫 번째 chunk의 첫 몇 개 타일 위치 디버그
                        if (tilesAdded < 5) {
                            console.log(`🎨 Restaurant 타일 렌더링: tile=${tile}, frame=${tile-1}, pos=(${tileX}, ${tileY}), layer=${layer.name}`);
                        }
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
                let zIndex = 0;
                if (layer.name === "upmost") {
                    zIndex = 3;
                } else if (layer.name === "cha") {
                    zIndex = 1;
                }

                // Use restaurant-assets sprite (restaurant.json과 호환)
                map.add([
                    k.sprite("restaurant-assets", { frame: tile - 1 }),
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
            generateFirstPlayerComponents(k, k.vec2(200, 200)) // 급식실 맵 중앙 근처에 스폰
        );
    }

    setPlayerControls(k, entities.player);

    k.camScale(2); // first.js와 동일하게 2로 설정
    
    // 맵 크기 계산 (restaurant.json의 실제 chunks를 기반으로)
    const mapBounds = {
        minX: -32 * 24, // restaurant.json의 가장 왼쪽 chunk x * tilewidth (-32)
        minY: -16 * 24, // restaurant.json의 가장 위쪽 chunk y * tileheight (-16)  
        maxX: (16 + 16) * 24, // 맵 너비를 고려한 최대 X (chunk가 16까지 있다고 가정)
        maxY: (16 + 16) * 24, // 맵 높이를 고려한 최대 Y
    };

    console.log("🗺️ Restaurant 맵 경계:", mapBounds);

    // 카메라 초기 위치 설정 (Y축을 좀 더 위로)
    if (entities.player && entities.player.exists()) {
        const initialCamPos = k.vec2(entities.player.pos.x, entities.player.pos.y - 50); // Y축을 50px 위로
        k.camPos(initialCamPos);
    }

    // 경계 기반 카메라 추적 시스템 (first.js와 동일한 부드러운 시스템)
    const CAMERA_EDGE_BUFFER = 120; // 화면 가장자리 120px 반경 (first.js와 동일)
    const CAMERA_SMOOTH_FACTOR = 0.1; // 카메라 부드러움 정도 (0.1 = 10%씩 이동)
    const CAMERA_MIN_DISTANCE = 8; // 최소 이동 거리 (픽셀)
    let targetCameraPos = k.camPos();
    let lastPlayerPos = entities.player ? entities.player.pos.clone() : k.vec2(0, 0);

    function updateCameraWithBoundaries() {
        if (!entities.player || !entities.player.exists()) return;

        const playerPos = entities.player.pos;
        const currentCamPos = k.camPos();
        const screenHalfWidth = k.width() / (2 * k.camScale().x);
        const screenHalfHeight = k.height() / (2 * k.camScale().y);
        
        // 플레이어가 실제로 이동했을 때만 카메라 업데이트 계산
        if (playerPos.dist(lastPlayerPos) < 1) return; // 1픽셀 이하 이동은 무시
        
        // 카메라를 플레이어보다 조금 위쪽에 유지
        const CAMERA_Y_OFFSET = -30; // 카메라를 30px 위로 유지
        const targetPlayerPos = k.vec2(playerPos.x, playerPos.y + CAMERA_Y_OFFSET);
        
        // 플레이어가 화면 가장자리 근처에 있는지 확인
        const playerScreenPos = targetPlayerPos.sub(currentCamPos);
        
        let newTargetX = targetCameraPos.x;
        let newTargetY = targetCameraPos.y;
        let shouldUpdate = false;
        
        // X축 경계 확인 - 데드존을 더 크게 설정
        if (playerScreenPos.x > screenHalfWidth - CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x - (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.x < -screenHalfWidth + CAMERA_EDGE_BUFFER) {
            newTargetX = targetPlayerPos.x + (screenHalfWidth - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        // Y축 경계 확인 - 데드존을 더 크게 설정
        if (playerScreenPos.y > screenHalfHeight - CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y - (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        } else if (playerScreenPos.y < -screenHalfHeight + CAMERA_EDGE_BUFFER) {
            newTargetY = targetPlayerPos.y + (screenHalfHeight - CAMERA_EDGE_BUFFER);
            shouldUpdate = true;
        }
        
        // 타겟 위치 업데이트
        if (shouldUpdate) {
            // 맵 경계 내에서 카메라 제한
            newTargetX = Math.max(mapBounds.minX + screenHalfWidth, 
                                 Math.min(mapBounds.maxX - screenHalfWidth, newTargetX));
            newTargetY = Math.max(mapBounds.minY + screenHalfHeight, 
                                 Math.min(mapBounds.maxY - screenHalfHeight, newTargetY));
            
            targetCameraPos = k.vec2(newTargetX, newTargetY);
        }
        
        // 부드러운 카메라 이동
        const distance = targetCameraPos.dist(currentCamPos);
        if (distance > CAMERA_MIN_DISTANCE) {
            const newCamPos = currentCamPos.lerp(targetCameraPos, CAMERA_SMOOTH_FACTOR);
            k.camPos(newCamPos);
        }
        
        lastPlayerPos = playerPos.clone();
    }

    // 매 프레임마다 카메라 업데이트
    k.onUpdate(updateCameraWithBoundaries);

    // 퀘스트 말풍선 시스템 초기화 (학생이 있다면)
    if (entities.students.length > 0) {
        initializeQuestBubbles(k, entities.students, map);
    }

    watchPlayerHealth(k);

    // 게임패드 컨트롤 (L/R 숄더 버튼) - 기존 시스템과의 호환성을 위해 유지
    k.onGamepadButtonPress("lshoulder", () => {
        console.log("🎮 L버튼 눌림 - 언어 변경");
        // toggleLocale는 utils에서 제거되었으므로 주석 처리
        // toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rshoulder", () => {
        console.log("🎮 R버튼 눌림 - 음소거 토글");
        // 전역 시스템 매니저를 통해 음소거 처리
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.toggleMute();
        }
    });

    k.onGamepadButtonPress("ltrigger", () => {
        console.log("🎮 L2 트리거 눌림 - 언어 변경");
        // toggleLocale는 utils에서 제거되었으므로 주석 처리
        // toggleLocale(k, gameState, isLocaleLocked);
    });

    k.onGamepadButtonPress("rtrigger", () => {
        console.log("🎮 R2 트리거 눌림 - 음소거 토글");
        // 전역 시스템 매니저를 통해 음소거 처리
        if (window.globalSystemManager && window.globalSystemManager.globalUI) {
            window.globalSystemManager.globalUI.toggleMute();
        }
    });

    // 1번 키로 메인 메뉴 이동
    setupMainMenuShortcut(k, gameState);
    
    // 전역 시스템 매니저 초기화 (인벤토리, 퀘스트 등)
    console.log("🌐 전역 시스템 매니저 초기화 시작");
    if (!window.globalSystemManager) {
        window.globalSystemManager = setupGlobalSystemManager(k, gameState, globalState, entities, "restaurant");
        window.globalSystemManager.initialize();
        console.log("✅ 전역 시스템 매니저 초기화 완료");
    } else {
        console.log("✅ 전역 시스템 매니저 이미 존재");
    }
    

    
    // 퀘스트 UI 추가
    setupQuestUI(k, gameState);
}
