import globalStateManager from "../state/globalState.js";

class InventoryManager {
    constructor(k) {
        this.k = k;
        this.gameState = globalStateManager().getInstance();
        this.isVisible = true;
        this.selectedSlot = 0;
        this.maxSlots = 10;
        this.slotSize = 40; // 슬롯 크기
        this.items = [];
        this.inventoryUI = null;
        
        // 초기 아이템 설정 (테스트용)
        this.initializeItems();
    }

    initializeItems() {
        // 테스트용 초기 아이템들 (색상으로 구분)
        this.items = [
            { id: 'sword', name: '검', color: [255, 100, 100], count: 1 },
            { id: 'shield', name: '방패', color: [100, 100, 255], count: 1 },
            { id: 'potion', name: '포션', color: [100, 255, 100], count: 5 },
            { id: 'key', name: '열쇠', color: [255, 255, 100], count: 2 },
            null, // 빈 슬롯
            null,
            null,
            null,
            null,
            null
        ];
    }

    createInventoryUI() {
        console.log("📦 인벤토리 UI 생성 시작");
        if (this.inventoryUI) {
            this.inventoryUI.destroy();
        }

        this.inventoryUI = this.k.add([
            this.k.pos(0, 0),
            this.k.fixed(),
            this.k.opacity(0.7), // 전체 인벤토리 UI 70% 투명도
            "inventory-ui"
        ]);

        console.log("📦 인벤토리 UI 컨테이너 생성 완료");

        // 인벤토리 배경 - 연한 그레이 계열
        const bgWidth = (this.maxSlots * this.slotSize) + 20;
        const bgHeight = this.slotSize + 20;
        
        const inventoryBg = this.inventoryUI.add([
            this.k.rect(bgWidth, bgHeight),
            this.k.pos(this.k.width() / 2, 50),
            this.k.anchor("center"),
            this.k.color(200, 200, 200), // 연한 그레이
            this.k.outline(2, this.k.rgb(150, 150, 150)),
            this.k.opacity(0.7), // 배경 투명도 70%
            this.k.z(200)
        ]);

        // 인벤토리 바 - 조금 더 진한 그레이
        const barWidth = this.maxSlots * this.slotSize;
        const inventoryBar = this.inventoryUI.add([
            this.k.rect(barWidth, this.slotSize),
            this.k.pos(this.k.width() / 2, 50),
            this.k.anchor("center"),
            this.k.color(180, 180, 180), // 진한 그레이
            this.k.outline(1, this.k.rgb(130, 130, 130)),
            this.k.opacity(0.7), // 바 투명도 70%
            this.k.z(201)
        ]);

        // 슬롯들 생성
        const startX = (this.k.width() / 2) - (barWidth / 2) + (this.slotSize / 2);
        
        for (let i = 0; i < this.maxSlots; i++) {
            const slotX = startX + (i * this.slotSize);
            const slotY = 50;

            // 슬롯 배경
            const slot = this.inventoryUI.add([
                this.k.rect(this.slotSize - 2, this.slotSize - 2),
                this.k.pos(slotX, slotY),
                this.k.anchor("center"),
                this.k.color(160, 160, 160), // 슬롯도 연한 그레이
                this.k.outline(1, this.k.rgb(130, 130, 130)),
                this.k.opacity(0.5), // 슬롯 투명도 50%로 더 투명하게
                this.k.z(202),
                `slot-${i}`
            ]);

            // 아이템이 있으면 표시
            if (this.items[i]) {
                const item = this.items[i];
                
                // 아이템 아이콘 (색상 사각형) - 위치를 중앙으로 조정
                const itemIcon = this.inventoryUI.add([
                    this.k.rect(this.slotSize - 8, this.slotSize - 8),
                    this.k.pos(slotX, slotY), // 위치를 중앙으로 조정 (기존 slotY - 3에서 slotY로)
                    this.k.anchor("center"),
                    this.k.color(item.color[0], item.color[1], item.color[2]),
                    this.k.outline(1, this.k.rgb(255, 255, 255)),
                    this.k.opacity(0.9), // 아이템 아이콘은 조금 더 진하게 90%
                    this.k.z(203),
                    `item-${i}`
                ]);
            }
        }

        // 선택된 슬롯 표시
        this.updateSelectedSlot();
        console.log("📦 인벤토리 UI 생성 완료");
    }

    updateSelectedSlot() {
        if (!this.inventoryUI) return;

        // 기존 선택 표시 제거
        this.inventoryUI.get("selected-indicator").forEach(obj => obj.destroy());

        // 새 선택 표시 추가
        const barWidth = this.maxSlots * this.slotSize;
        const startX = (this.k.width() / 2) - (barWidth / 2) + (this.slotSize / 2);
        const slotX = startX + (this.selectedSlot * this.slotSize);
        const slotY = 50;

        // 선택된 슬롯 테두리만 표시 (투명한 배경 + 테두리)
        const selectBorder = this.inventoryUI.add([
            this.k.rect(this.slotSize + 2, this.slotSize + 2),
            this.k.pos(slotX, slotY),
            this.k.anchor("center"),
            this.k.color(255, 215, 0),
            this.k.opacity(0), // 배경은 투명하게
            this.k.outline(2, this.k.rgb(255, 215, 0)),
            this.k.z(206),
            "selected-indicator"
        ]);
        
        console.log(`📦 선택된 슬롯: ${this.selectedSlot}`);
    }

    // 인벤토리 생성 (항상 표시)
    create() {
        console.log("📦 인벤토리 생성 시작");
        this.createInventoryUI();
        console.log("📦 인벤토리 생성 완료");
    }

    // 인벤토리 제거
    destroy() {
        if (this.inventoryUI) {
            this.inventoryUI.destroy();
            this.inventoryUI = null;
        }
    }

    // 슬롯 선택 이동
    selectSlot(direction) {
        if (direction === "left" && this.selectedSlot > 0) {
            this.selectedSlot--;
            this.updateSelectedSlot();
        } else if (direction === "right" && this.selectedSlot < this.maxSlots - 1) {
            this.selectedSlot++;
            this.updateSelectedSlot();
        }
    }

    // 아이템 추가
    addItem(itemId, name, color, count = 1) {
        // 기존 아이템이 있는지 확인
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] && this.items[i].id === itemId) {
                this.items[i].count += count;
                this.createInventoryUI(); // UI 업데이트
                return true;
            }
        }

        // 빈 슬롯에 새 아이템 추가
        for (let i = 0; i < this.items.length; i++) {
            if (!this.items[i]) {
                this.items[i] = { id: itemId, name, color, count };
                this.createInventoryUI(); // UI 업데이트
                return true;
            }
        }

        return false; // 인벤토리가 꽉 참
    }

    // 아이템 제거
    removeItem(itemId, count = 1) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] && this.items[i].id === itemId) {
                this.items[i].count -= count;
                if (this.items[i].count <= 0) {
                    this.items[i] = null;
                }
                this.createInventoryUI(); // UI 업데이트
                return true;
            }
        }
        return false;
    }

    // 현재 선택된 아이템 반환
    getSelectedItem() {
        return this.items[this.selectedSlot];
    }

    // 키 입력 처리
    handleInput() {
        this.k.onKeyPress("left", () => {
            this.selectSlot("left");
        });

        this.k.onKeyPress("right", () => {
            this.selectSlot("right");
        });

        // 숫자 키로 직접 슬롯 선택
        for (let i = 0; i < 10; i++) {
            const key = i === 0 ? "0" : i.toString();
            const slotIndex = i === 0 ? 9 : i - 1;
            
            this.k.onKeyPress(key, () => {
                this.selectedSlot = slotIndex;
                this.updateSelectedSlot();
            });
        }
    }

    // 초기화
    initialize() {
        this.handleInput();
        // create()는 씬에서 호출되도록 변경
        console.log("📦 인벤토리 시스템 초기화 완료 (UI는 씬에서 생성)");
    }
}

export { InventoryManager };
