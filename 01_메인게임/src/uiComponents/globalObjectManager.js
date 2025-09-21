/**
 * 전역 객체 관리자 - 모든 씬에서 공통으로 사용하는 객체 처리 시스템
 * front.js의 객체 처리 로직을 기반으로 함
 */
import { gameState } from "../state/stateManagers.js";

export class GlobalObjectManager {
    constructor(k, map, entities) {
        this.k = k;
        this.map = map;
        this.entities = entities;
        this.objectHandlers = new Map();
        this.setupDefaultHandlers();
    }

    /**
     * 기본 객체 핸들러 설정
     */
    setupDefaultHandlers() {
        // 출입구 객체들
        this.objectHandlers.set("entrance", this.handleEntrance.bind(this));
        this.objectHandlers.set("door_to_front", this.handleEntrance.bind(this));
        this.objectHandlers.set("main_entrance", this.handleMainEntrance.bind(this));
        this.objectHandlers.set("front_gate", this.handleFrontGate.bind(this));

        // 특수 객체들
        this.objectHandlers.set("ball", this.handleBall.bind(this));
        this.objectHandlers.set("cat1", this.handleCat.bind(this));
        this.objectHandlers.set("cat2", this.handleCat.bind(this));

        // 상호작용 가능한 일반 객체들 (garage.js용)
        this.objectHandlers.set("bench", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("tools", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("board", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("shelf", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("bowl", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("fire", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("plates", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("pingpong", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("workout", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("swimming", this.handleInteractiveObject.bind(this));
        this.objectHandlers.set("balls", this.handleInteractiveObject.bind(this));
    }

    /**
     * 객체 처리 (front.js와 동일한 방식)
     * @param {Object} object - Tiled 객체
     * @param {Object} layer - Tiled 레이어
     * @param {Object} dialogueData - 대화 데이터
     */
    processObject(object, layer, dialogueData = null) {
        const objectType = object.name;
        
        if (!objectType || objectType.trim() === "") {
            // 이름이 없는 객체는 벽으로 처리
            return this.handleWall(object, layer);
        }

        // 특별한 핸들러가 있는지 확인
        if (this.objectHandlers.has(objectType)) {
            return this.objectHandlers.get(objectType)(object, layer, dialogueData);
        }

        // 기본적으로 상호작용 가능한 객체로 처리
        return this.handleInteractiveObject(object, layer, dialogueData);
    }

    /**
     * 출입구 처리
     */
    handleEntrance(object, layer) {
        console.log(`🚪 출입구 콜라이더 생성: ${object.name} at (${object.x}, ${object.y - 10})`);
        
        const entranceEntity = this.map.add([
            this.k.rect(object.width, object.height),
            this.k.pos(object.x, object.y - 10), // Y 위치를 10px 위로 조정
            this.k.area(),
            this.k.body({ isStatic: true }),
            this.k.color(0, 255, 0),
            this.k.opacity(0),
            "entrance",
        ]);

        return entranceEntity;
    }

    /**
     * 메인 입구 처리 (front.js의 main_entrance)
     */
    handleMainEntrance(object, layer) {
        console.log("🚪 메인 입구 감지됨!");
        
        const entranceEntity = this.map.add([
            this.k.rect(object.width, object.height),
            this.k.area(),
            this.k.body({ isStatic: true }),
            this.k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12),
            this.k.opacity(0),
            "main_entrance",
            "interactive-object",
            { objectType: "main_entrance" },
        ]);

        entranceEntity.onCollideUpdate("player", (player) => {
            this.k.play("boop-sfx");
            gameState.setPreviousScene("front");
            this.k.go("first");
        });

        return entranceEntity;
    }

    /**
     * 정문 처리 (front.js의 front_gate)
     */
    handleFrontGate(object, layer) {
        console.log("🚪 정문 감지됨!");
        
        const gateEntity = this.map.add([
            this.k.rect(object.width, object.height),
            this.k.area(),
            this.k.body({ isStatic: true }),
            this.k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12),
            this.k.opacity(0),
            "front_gate",
            "interactive-object",
            { objectType: "front_gate" },
        ]);

        gateEntity.onCollideUpdate("player", (player) => {
            const locale = gameState.getLocale();
            const content = [
                "This is the school's front gate. You can leave the school from here.",
                "학교 정문입니다. 여기서 학교를 나갈 수 있습니다.",
            ];

            gameState.setInteractableObject(
                gateEntity,
                "object",
                {
                    content: content,
                    speakerName: "Front Gate",
                    speakerImage: null,
                }
            );
        });

        gateEntity.onCollideEnd("player", () => {
            gameState.clearInteractableObject();
        });

        return gateEntity;
    }

    /**
     * 피구공 처리 (front.js의 ball)
     */
    handleBall(object, layer) {
        console.log("⚽ 피구공 감지됨!");
        
        const ball = this.map.add([
            this.k.sprite("front-assets", { frame: 5296 }),
            this.k.area({
                shape: new this.k.Rect(this.k.vec2(0), 24, 24),
            }),
            this.k.body({
                isStatic: true,
                mass: 1,
                restitution: 0.6,
            }),
            this.k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12),
            this.k.z(1),
            "ball",
            "kickable",
            {
                objectType: "ball",
                lastKickTime: 0,
                isMoving: false,
            },
        ]);

        // 킥 기능은 front.js에서만 사용하므로 여기서는 기본 상호작용만
        ball.onCollideUpdate("player", (player) => {
            // 기본 상호작용 처리
        });

        return ball;
    }

    /**
     * 고양이 처리 (front.js의 cat1, cat2)
     */
    handleCat(object, layer) {
        console.log(`🐱 ${object.name} 감지됨!`);
        
        const cat = this.map.add([
            this.k.sprite("front-assets", {
                frame: object.name === "cat1" ? 3784 : 3783,
            }),
            this.k.area(),
            this.k.body({ isStatic: true }),
            this.k.pos(object.x + (layer.offsetx || 0), object.y + (layer.offsety || 0) - 12),
            this.k.z(1),
            object.name,
            "interactive-object",
            { objectType: object.name },
        ]);

        cat.onCollideUpdate("player", (player) => {
            const locale = gameState.getLocale();
            const content = [
                "Meow~",
                "야옹~",
            ];

            const speakerName = object.name === "cat1" ? "Cat" : "Another Cat";

            gameState.setInteractableObject(
                cat,
                "npc",
                {
                    content: content,
                    speakerName: speakerName,
                    speakerImage: null,
                }
            );
        });

        cat.onCollideEnd("player", () => {
            gameState.clearInteractableObject();
        });

        return cat;
    }

    /**
     * 상호작용 가능한 일반 객체 처리 (garage.js용)
     */
    handleInteractiveObject(object, layer, dialogueData = null) {
        console.log(`🎯 상호작용 객체 생성: ${object.name} at (${object.x}, ${object.y}) - 크기: ${object.width}x${object.height}`);
        
        const interactionObject = this.map.add([
            this.k.rect(object.width, object.height),
            this.k.pos(object.x, object.y),
            this.k.area(),
            this.k.body({ isStatic: true }), // ⚠️ 고정 설정 - 수정 금지! ⚠️
            this.k.color(255, 255, 0),
            this.k.opacity(0),
            `interactive-${object.name}`,
        ]);

        // 대화 데이터가 있으면 상호작용 설정
        if (dialogueData) {
            this.setupObjectInteraction(interactionObject, object.name, dialogueData);
        }

        this.entities.objects.push(interactionObject);
        return interactionObject;
    }

    /**
     * 벽 처리 (이름이 없는 객체들)
     */
    handleWall(object, layer) {
        console.log(`🧱 벽 콜라이더 생성: ${object.name || 'unnamed'} at (${object.x}, ${object.y - 10})`);
        
        const wallEntity = this.map.add([
            this.k.rect(object.width, object.height),
            this.k.pos(object.x, object.y - 10), // Y 위치를 10px 위로 조정
            this.k.area(),
            this.k.body({ isStatic: true }),
            this.k.color(255, 0, 0),
            this.k.opacity(0),
            "boundary",
        ]);

        return wallEntity;
    }

    /**
     * 객체 상호작용 설정
     */
    setupObjectInteraction(entity, objectName, dialogueData) {
        entity.onCollideUpdate("player", () => {
            if (this.k.isKeyPressed("space") || this.k.isKeyPressed("enter")) {
                console.log(`🗣️ ${objectName}과 상호작용 시작`);
                
                // gameState를 통한 상호작용 설정
                if (gameState.setInteractableObject) {
                    gameState.setInteractableObject(entity, "object", {
                        content: dialogueData.content || [`${objectName}을 조사했습니다.`],
                        speakerName: dialogueData.speakerName || objectName,
                        speakerImage: dialogueData.speakerImage || null
                    });
                }
            }
        });

        entity.onCollideEnd("player", () => {
            if (gameState.clearInteractableObject) {
                gameState.clearInteractableObject();
            }
        });
    }

    /**
     * 커스텀 객체 핸들러 추가
     */
    addObjectHandler(objectType, handler) {
        this.objectHandlers.set(objectType, handler);
    }

    /**
     * 정리
     */
    cleanup() {
        this.objectHandlers.clear();
    }
}

/**
 * 전역 객체 관리자 인스턴스 생성 함수
 * @param {Object} k - Kaboom 인스턴스
 * @param {Object} map - 맵 객체
 * @param {Object} entities - 엔티티 저장소
 * @returns {GlobalObjectManager} 전역 객체 관리자 인스턴스
 */
export function setupGlobalObjectManager(k, map, entities) {
    return new GlobalObjectManager(k, map, entities);
}
