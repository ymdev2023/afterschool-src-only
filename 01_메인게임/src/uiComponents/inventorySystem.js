/**
 * 플레이어 인벤토리 시스템
 * 화면 오른쪽 하단에 소지품을 표시하는 UI
 */

export class InventorySystem {
    constructor(k, gameState, globalState) {
        this.k = k;
        this.gameState = gameState;
        this.globalState = globalState;
        
        // 인벤토리 상태 - 전역 상태에서 가져오기
        this.items = []; // 로컬 캐시, 실제 데이터는 globalState에 저장
        this.inventoryContainer = null;
        this.isVisible = false;
        
        // UI 설정
        this.INVENTORY_SIZE = 3; // 3개 슬롯
        this.SLOT_SIZE = 48; // 슬롯 크기
        this.PADDING = 8;
        this.SAFE_AREA_MARGIN = 20;
        
        this.initialize();
    }
    
    initialize() {
        // UI를 먼저 생성
        this.createInventoryUI();
        // 그 다음 전역 상태에서 인벤토리 데이터 로드
        this.loadFromGlobalState();
        console.log("📦 인벤토리 시스템 초기화 완료");
    }
    
    /**
     * 전역 상태에서 인벤토리 데이터 로드
     */
    loadFromGlobalState() {
        console.log("🔄 전역 상태에서 인벤토리 로드 시작");
        const globalInventory = this.globalState.getGlobalInventory();
        console.log("📦 전역 인벤토리 데이터:", globalInventory);
        
        // 기존 아이템들 정리
        this.items = [];
        if (this.slots && Array.isArray(this.slots)) {
            this.slots.forEach(slot => {
                if (slot.sprite) {
                    slot.sprite.destroy();
                    slot.sprite = null;
                }
                slot.item = null;
            });
        }
        
        // 새로운 아이템들 로드
        this.items = [...globalInventory];
        console.log("📦 로컬 아이템 배열 업데이트:", this.items);
        
        // UI가 초기화되지 않았다면 먼저 생성
        if (!this.slots || !this.inventoryContainer) {
            console.log("🔧 인벤토리 UI 재생성 필요");
            this.createInventoryUI();
        }
        
        // UI 업데이트 (slots가 있을 때만)
        if (this.slots && Array.isArray(this.slots)) {
            this.items.forEach((item, index) => {
                if (index < this.slots.length) {
                    const slot = this.slots[index];
                    slot.item = item;
                    
                    console.log(`🎨 슬롯 ${index}에 아이템 배치: ${item.name}, 스프라이트: ${item.sprite}, 프레임: ${item.frame}`);
                    
                    // 스프라이트 생성 (inventoryContainer가 있을 때만)
                    if (item.sprite && item.frame !== undefined && this.inventoryContainer) {
                        const slotPos = slot.container.pos;
                        const spriteX = slotPos.x + (this.SLOT_SIZE / 2);
                        const spriteY = slotPos.y + (this.SLOT_SIZE / 2);
                        
                        console.log(`🖼️ 스프라이트 생성 위치: (${spriteX}, ${spriteY})`);
                        
                        try {
                            slot.sprite = this.k.add([
                                this.k.sprite(item.sprite, { frame: item.frame }),
                                this.k.pos(spriteX, spriteY),
                                this.k.anchor("center"),
                                this.k.scale(1.5),
                                this.k.fixed(),
                                this.k.z(1002),
                                `inventory-item-${item.id}`
                            ]);
                            console.log(`✅ 스프라이트 생성 성공: ${item.id}`);
                        } catch (error) {
                            console.error(`❌ 스프라이트 생성 실패: ${item.id}`, error);
                        }
                    } else {
                        console.warn(`⚠️ 스프라이트 정보 부족: sprite=${item.sprite}, frame=${item.frame}, container=${!!this.inventoryContainer}`);
                    }
                }
            });
            console.log("✅ 인벤토리 UI 업데이트 완료");
        } else {
            console.warn("⚠️ 인벤토리 슬롯이 초기화되지 않음");
        }
        
        // 아이템이 있으면 인벤토리 표시
        if (this.items.length > 0) {
            this.show();
        }
        
        console.log(`📦 전역 상태에서 인벤토리 로드: ${this.items.length}개 아이템`);
    }
    
    /**
     * 전역 상태에 인벤토리 데이터 저장
     */
    saveToGlobalState() {
        // 현재 인벤토리 상태를 전역 상태에 저장
        this.globalState.clearGlobalInventory();
        this.items.forEach(item => {
            this.globalState.addToGlobalInventory(item);
        });
    }
    
    createInventoryUI() {
        const screenWidth = this.k.width();
        const screenHeight = this.k.height();
        
        // 인벤토리 컨테이너 위치 (오른쪽 하단)
        const containerWidth = (this.SLOT_SIZE * this.INVENTORY_SIZE) + (this.PADDING * (this.INVENTORY_SIZE + 1));
        const containerHeight = this.SLOT_SIZE + (this.PADDING * 2);
        
        const posX = screenWidth - containerWidth - this.SAFE_AREA_MARGIN;
        const posY = screenHeight - containerHeight - this.SAFE_AREA_MARGIN;
        
        // 인벤토리 배경 (투명한 핑크색)
        this.inventoryContainer = this.k.add([
            this.k.rect(containerWidth, containerHeight),
            this.k.pos(posX, posY),
            this.k.color(255, 192, 203), // 핑크색 (RGB: 255, 192, 203)
            this.k.opacity(0.7), // 약간의 투명도
            this.k.outline(2, this.k.rgb(255, 255, 255)),
            this.k.fixed(),
            this.k.z(1000),
            "inventory-container"
        ]);
        
        // 슬롯들 생성
        this.slots = [];
        for (let i = 0; i < this.INVENTORY_SIZE; i++) {
            const slotX = posX + this.PADDING + (i * (this.SLOT_SIZE + this.PADDING));
            const slotY = posY + this.PADDING;
            
            const slot = this.k.add([
                this.k.rect(this.SLOT_SIZE, this.SLOT_SIZE),
                this.k.pos(slotX, slotY),
                this.k.color(255, 240, 245), // 연한 핑크색 (RGB: 255, 240, 245)
                this.k.opacity(0.9), // 약간의 투명도
                this.k.outline(1, this.k.rgb(200, 150, 180)), // 진한 핑크색 테두리
                this.k.fixed(),
                this.k.z(1001),
                `inventory-slot-${i}`
            ]);
            
            this.slots.push({
                container: slot,
                item: null,
                sprite: null
            });
        }
        
        // 초기에는 숨김
        this.hide();
    }
    
    addItem(itemData) {
        console.log("📦 인벤토리에 아이템 추가:", itemData);
        
        // 전역 상태에서 중복 확인
        if (this.globalState.hasItemInGlobalInventory(itemData.id)) {
            console.warn(`⚠️ 아이템이 이미 존재: ${itemData.name}`);
            return false;
        }
        
        // 빈 슬롯 찾기
        const emptySlotIndex = this.slots.findIndex(slot => slot.item === null);
        if (emptySlotIndex === -1) {
            console.warn("⚠️ 인벤토리가 가득참!");
            return false;
        }
        
        // 아이템을 전역 상태와 로컬 모두에 추가
        this.globalState.addToGlobalInventory(itemData);
        this.items.push(itemData);
        const slot = this.slots[emptySlotIndex];
        slot.item = itemData;
        
        // 스프라이트 생성 (실물 크기)
        if (itemData.sprite && itemData.frame !== undefined) {
            const slotPos = slot.container.pos;
            // 슬롯 중앙에 배치하기 위한 위치 계산
            const centerX = slotPos.x + (this.SLOT_SIZE / 2);
            const centerY = slotPos.y + (this.SLOT_SIZE / 2);
            
            slot.sprite = this.k.add([
                this.k.sprite(itemData.sprite, { frame: itemData.frame }),
                this.k.pos(centerX, centerY), // 슬롯 중앙에 배치
                this.k.anchor("center"), // 중앙 기준으로 앵커 설정
                this.k.scale(1.5), // 더 큰 크기 (1.5 스케일)
                this.k.fixed(),
                this.k.z(1002),
                `inventory-item-${emptySlotIndex}`
            ]);
        }
        
        // 인벤토리 표시
        this.show();
        
        console.log(`✅ 아이템 "${itemData.name}" 슬롯 ${emptySlotIndex}에 추가됨`);
        return true;
    }
    
    removeItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const slotIndex = this.slots.findIndex(slot => slot.item && slot.item.id === itemId);
        if (slotIndex !== -1) {
            const slot = this.slots[slotIndex];
            
            // 스프라이트 제거
            if (slot.sprite) {
                slot.sprite.destroy();
                slot.sprite = null;
            }
            
            // 슬롯 정리
            slot.item = null;
        }
        
        // 전역 상태와 로컬 모두에서 제거
        this.globalState.removeFromGlobalInventory(itemId);
        this.items.splice(itemIndex, 1);
        
        // 아이템이 없으면 인벤토리 숨김
        if (this.items.length === 0) {
            this.hide();
        }
        
        console.log(`✅ 아이템 "${itemId}" 제거됨`);
        return true;
    }
    
    show() {
        if (this.isVisible) return;
        
        console.log("📦 인벤토리 표시 시작");
        console.log("📦 인벤토리 컨테이너:", !!this.inventoryContainer);
        console.log("📦 슬롯 개수:", this.slots ? this.slots.length : 0);
        console.log("📦 아이템 개수:", this.items.length);
        
        if (this.inventoryContainer) {
            this.inventoryContainer.opacity = 0.7; // 핑크색 배경 투명도
        }
        
        this.slots.forEach((slot, index) => {
            slot.container.opacity = 0.9; // 슬롯 투명도
            if (slot.sprite) {
                slot.sprite.opacity = 1; // 스프라이트는 완전 불투명
                console.log(`📦 슬롯 ${index} 스프라이트 표시: ${slot.item?.name}`);
            } else {
                console.log(`📦 슬롯 ${index}: 빈 슬롯`);
            }
        });

        this.isVisible = true;
        console.log("📦 인벤토리 표시 완료");
    }    hide() {
        if (!this.isVisible) return;
        
        this.inventoryContainer.opacity = 0;
        this.slots.forEach(slot => {
            slot.container.opacity = 0;
            if (slot.sprite) {
                slot.sprite.opacity = 0;
            }
        });
        
        this.isVisible = false;
        console.log("📦 인벤토리 숨김");
    }
    
    toggle() {
        console.log("📦 인벤토리 토글 - 현재 상태:", this.isVisible ? "표시중" : "숨김");
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }
    
    getItems() {
        return [...this.items];
    }
    
    cleanup() {
        if (this.inventoryContainer) {
            this.inventoryContainer.destroy();
        }
        
        this.slots.forEach(slot => {
            if (slot.container) slot.container.destroy();
            if (slot.sprite) slot.sprite.destroy();
        });
        
        this.slots = [];
        this.items = [];
        
        console.log("📦 인벤토리 시스템 정리 완료");
    }
}

/**
 * 전역 인벤토리 시스템 생성 함수
 */
export function setupInventorySystem(k, gameState, globalState) {
    // 기존 인벤토리 시스템이 있으면 재사용
    if (window.inventorySystem) {
        console.log("📦 기존 인벤토리 시스템 재사용");
        // UI만 새로 생성 (씬 전환 시 UI가 사라질 수 있음)
        window.inventorySystem.cleanup();
        window.inventorySystem.loadFromGlobalState();
        window.inventorySystem.createInventoryUI();
        return window.inventorySystem;
    }
    
    const inventory = new InventorySystem(k, gameState, globalState);
    
    // 전역 접근을 위해 window 객체에 할당
    window.inventorySystem = inventory;
    
    return inventory;
}
