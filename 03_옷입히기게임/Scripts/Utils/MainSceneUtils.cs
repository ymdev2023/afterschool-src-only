using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 메인 씬에서 핵심 기능들을 처리하는 통합 유틸리티 클래스
/// 캐릭터, 의상, 드래그앤드롭, 팝업 기능을 포함
/// </summary>
public static class MainSceneUtils
{
    #region Character Utils

    /// <summary>
    /// 선택된 캐릭터를 불러와서 반환합니다
    /// </summary>
    public static CharacterData LoadSelectedCharacter()
    {
        Debug.Log("🔄 캐릭터 로드 시작...");
        CharacterData characterData = CharacterDisplayUtils.LoadSelectedCharacterData();

        if (characterData != null)
        {
            Debug.Log($"✅ 캐릭터 데이터 로드 성공: {characterData.characterName}");
        }
        else
        {
            Debug.LogWarning("❌ 캐릭터 데이터 로드 실패");
        }

        return characterData;
    }

    /// <summary>
    /// 폴백 캐릭터를 불러와서 반환합니다
    /// </summary>
    public static CharacterData LoadFallbackCharacter()
    {
        Debug.LogWarning("⚠️ 선택된 캐릭터가 없어 기본 캐릭터를 적용합니다");

        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        if (allCharacters != null && allCharacters.Length > 0)
        {
            return allCharacters[0];
        }

        Debug.LogError("❌ 사용 가능한 캐릭터가 없습니다!");
        return null;
    }

    /// <summary>
    /// 캐릭터 스프라이트들을 로드합니다
    /// </summary>
    public static (Sprite largeSprite, Sprite characterSprite) LoadCharacterSprites(CharacterData characterData)
    {
        if (characterData == null)
            return (null, null);

        Sprite largeSprite = CharacterDisplayUtils.LoadLargeCharacterSprite(characterData);
        Sprite characterSprite = CharacterDisplayUtils.LoadCharacterSprite(characterData);

        Debug.Log($"🎭 캐릭터 스프라이트 로드: {characterData.characterName}");
        Debug.Log($"   - Large Sprite: {(largeSprite != null ? largeSprite.name : "없음")}");
        Debug.Log($"   - Character Sprite: {(characterSprite != null ? characterSprite.name : "없음")}");

        return (largeSprite, characterSprite);
    }

    /// <summary>
    /// 캐릭터 스프라이트를 UI 이미지에 적용합니다
    /// </summary>
    public static void ApplyCharacterSpritesToUI(
        CharacterData characterData,
        Sprite largeSprite,
        Sprite characterSprite,
        Image largeCharacterImage,
        Image characterImage,
        bool preferLargeSprite = true)
    {
        if (characterData == null) return;

        Debug.Log($"🎭 캐릭터 스프라이트 UI 적용: {characterData.characterName}");

        // Large Character Image 적용
        ApplyLargeCharacterSprite(largeCharacterImage, largeSprite, characterSprite, preferLargeSprite);

        // Character Image 적용  
        ApplyCharacterSprite(characterImage, characterSprite, largeSprite);
    }

    /// <summary>
    /// Large Character Image에 스프라이트를 적용합니다
    /// </summary>
    private static void ApplyLargeCharacterSprite(Image largeCharacterImage, Sprite largeSprite, Sprite characterSprite, bool preferLargeSprite)
    {
        if (largeCharacterImage == null) return;

        if (largeSprite != null)
        {
            UIUtils.SetImageSprite(largeCharacterImage, largeSprite);
            Debug.Log($"✅ cha_l에 Large Sprite 적용: {largeSprite.name}");
        }
        else if (characterSprite != null && preferLargeSprite)
        {
            UIUtils.SetImageSprite(largeCharacterImage, characterSprite);
            Debug.Log($"✅ cha_l에 Character Sprite 대체 적용: {characterSprite.name}");
        }
        else
        {
            UIUtils.SetImageSprite(largeCharacterImage, null);
            Debug.Log("❌ cha_l 비활성화 (스프라이트 없음)");
        }
    }

    /// <summary>
    /// Character Image에 스프라이트를 적용합니다
    /// </summary>
    private static void ApplyCharacterSprite(Image characterImage, Sprite characterSprite, Sprite largeSprite)
    {
        if (characterImage == null) return;

        if (characterSprite != null)
        {
            UIUtils.SetImageSprite(characterImage, characterSprite);
            Debug.Log($"✅ cha_m에 Character Sprite 적용: {characterSprite.name}");
        }
        else if (largeSprite != null)
        {
            UIUtils.SetImageSprite(characterImage, largeSprite);
            Debug.Log($"✅ cha_m에 Large Sprite 대체 적용: {largeSprite.name}");
        }
        else
        {
            UIUtils.SetImageSprite(characterImage, null);
            Debug.Log("❌ cha_m 비활성화 (스프라이트 없음)");
        }
    }

    /// <summary>
    /// 디버그 텍스트를 업데이트합니다
    /// </summary>
    public static void UpdateDebugText(Text debugText, CharacterData characterData)
    {
        if (debugText != null && characterData != null)
        {
            UIUtils.SetText(debugText, characterData.characterName);
        }
    }

    /// <summary>
    /// 캐릭터 이름으로 캐릭터 데이터를 찾습니다
    /// </summary>
    public static CharacterData FindCharacterByName(string characterName)
    {
        if (string.IsNullOrEmpty(characterName)) return null;

        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        return System.Array.Find(allCharacters, c => c.characterName == characterName);
    }

    /// <summary>
    /// GameObject가 항상 활성화되도록 보장합니다
    /// </summary>
    public static void EnsureGameObjectActive(GameObject gameObject)
    {
        CharacterDisplayUtils.EnsureGameObjectActive(gameObject);
    }

    #endregion

    #region Clothing Utils

    /// <summary>
    /// 옷입히기 시스템을 초기화합니다
    /// </summary>
    public static ClothingSlot[] InitializeClothingSystem(Transform[] clothingItemsParents)
    {
        Debug.Log("=== 옷입히기 시스템 초기화 시작 ===");

        // ClothingSlot 초기화
        ClothingSlot[] clothingSlots = InitializeClothingSlots();

        // DragAndDropItem 초기화
        InitializeDragAndDropItems(clothingItemsParents);

        Debug.Log("=== 옷입히기 시스템 초기화 완료 ===");
        return clothingSlots;
    }

    /// <summary>
    /// ClothingSlot 컴포넌트들을 초기화합니다
    /// </summary>
    public static ClothingSlot[] InitializeClothingSlots()
    {
        ClothingSlot[] clothingSlots = ClothingUtils.FindAllClothingSlots();

        if (clothingSlots == null || clothingSlots.Length == 0)
        {
            Debug.LogWarning("❌ ClothingSlot 컴포넌트를 찾을 수 없습니다.");
            Debug.LogWarning("💡 해결 방법:");
            Debug.LogWarning("   1. cha_l 하위의 top, bottom, shoes, socks 오브젝트에 ClothingSlot 컴포넌트를 추가하세요");
            Debug.LogWarning("   2. 각 슬롯의 slotType을 'top', 'bottom', 'shoes', 'socks'로 설정하세요");
        }

        return clothingSlots;
    }

    /// <summary>
    /// DragAndDropItem 컴포넌트들을 초기화합니다
    /// </summary>
    public static void InitializeDragAndDropItems(Transform[] clothingItemsParents)
    {
        DragAndDropItem[] allDragItems = ClothingUtils.FindAllDragAndDropItems();

        // clothingItemsParents에서 자동으로 DragAndDropItem 추가
        ClothingUtils.AutoAddDragAndDropItems(clothingItemsParents);
    }

    /// <summary>
    /// 모든 의상을 제거합니다
    /// </summary>
    public static void ClearAllClothing(ClothingSlot[] clothingSlots)
    {
        if (clothingSlots != null)
        {
            foreach (ClothingSlot slot in clothingSlots)
            {
                if (slot != null)
                {
                    slot.ClearSlot();
                }
            }
        }
        Debug.Log("모든 의상이 제거되었습니다.");
    }

    /// <summary>
    /// 특정 타입의 의상을 제거합니다
    /// </summary>
    public static void RemoveClothingByType(ClothingSlot[] clothingSlots, string clothingType)
    {
        if (clothingSlots != null)
        {
            foreach (ClothingSlot slot in clothingSlots)
            {
                if (slot != null && slot.GetSlotType().ToLower() == clothingType.ToLower())
                {
                    slot.ClearSlot();
                }
            }
        }
        Debug.Log($"{clothingType} 의상이 제거되었습니다.");
    }

    /// <summary>
    /// 모든 의상 아이템을 원래 위치로 되돌립니다
    /// </summary>
    public static void ResetAllClothingItems(Transform[] clothingItemsParents)
    {
        ClothingUtils.ResetAllClothingItems(clothingItemsParents);
    }

    /// <summary>
    /// 특정 타입의 의상 아이템 표시 토글
    /// </summary>
    public static void ToggleClothingItemsByType(Transform[] clothingItemsParents, string itemType, bool show)
    {
        DragAndDropItem[] items = ClothingUtils.GetItemsByType(itemType, clothingItemsParents);
        foreach (DragAndDropItem item in items)
        {
            if (item != null)
            {
                UIUtils.SetActiveMultiple(show, item.gameObject);
            }
        }
    }

    /// <summary>
    /// 같은 타입의 의상을 다른 슬롯에서 제거합니다 (중복 착용 방지)
    /// </summary>
    public static void RemoveSameTypeClothingFromOtherSlots(ClothingSlot[] clothingSlots, string itemType, ClothingSlot excludeSlot)
    {
        if (clothingSlots == null || string.IsNullOrEmpty(itemType)) return;

        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot == null || slot == excludeSlot) continue;

            DragAndDropItem currentItem = slot.GetCurrentItem();
            if (currentItem != null && currentItem.GetItemType().ToLower() == itemType.ToLower())
            {
                Debug.Log($"🔄 중복 착용 방지: {slot.GetSlotType()} 슬롯에서 {itemType} 아이템 제거");
                slot.ClearSlot();
            }
        }
    }

    /// <summary>
    /// 특정 타입의 의상 아이템이 현재 착용되어 있는지 확인합니다
    /// </summary>
    public static bool IsClothingTypeWorn(ClothingSlot[] clothingSlots, string clothingType)
    {
        if (clothingSlots == null || string.IsNullOrEmpty(clothingType)) return false;

        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot != null)
            {
                DragAndDropItem currentItem = slot.GetCurrentItem();
                if (currentItem != null && currentItem.GetItemType().ToLower() == clothingType.ToLower())
                {
                    return true;
                }
            }
        }
        return false;
    }

    /// <summary>
    /// 새로 활성화된 오브젝트들의 드래그 시스템을 초기화합니다
    /// </summary>
    public static void RefreshDragAndDropItems(Transform[] clothingItemsParents)
    {
        Debug.Log("🔄 드래그앤드롭 아이템들 새로고침...");

        // 모든 부모 오브젝트에서 DragAndDropItem 컴포넌트들을 다시 초기화
        if (clothingItemsParents != null)
        {
            foreach (Transform parent in clothingItemsParents)
            {
                if (parent != null)
                {
                    DragAndDropItem[] items = parent.GetComponentsInChildren<DragAndDropItem>(true); // 비활성화된 것도 포함
                    foreach (DragAndDropItem item in items)
                    {
                        if (item != null && item.gameObject.activeInHierarchy)
                        {
                            // 드래그 시스템 재설정
                            item.enabled = false;
                            item.enabled = true;
                        }
                    }
                }
            }
        }

        // 전체 시스템 재초기화 (새로운 아이템들을 감지하기 위해)
        ClothingUtils.AutoAddDragAndDropItems(clothingItemsParents);

        Debug.Log("✅ 드래그앤드롭 아이템들 새로고침 완료");
    }

    /// <summary>
    /// 특정 오브젝트들의 드래그 시스템을 활성화합니다
    /// </summary>
    public static void EnableDragForObjects(GameObject[] objects)
    {
        if (objects == null) return;

        foreach (GameObject obj in objects)
        {
            if (obj != null && obj.activeInHierarchy)
            {
                DragAndDropItem[] items = obj.GetComponentsInChildren<DragAndDropItem>();
                foreach (DragAndDropItem item in items)
                {
                    if (item != null)
                    {
                        // 드래그 컴포넌트 재활성화
                        item.enabled = false;
                        item.enabled = true;

                        Debug.Log($"드래그 활성화: {item.name}");
                    }
                }
            }
        }
    }

    #endregion

    #region DragDrop Utils

    /// <summary>
    /// 가장 가까운 호환 가능한 슬롯을 찾습니다
    /// </summary>
    public static ClothingSlot FindNearestCompatibleSlot(ClothingSlot[] clothingSlots, DragAndDropItem item, Vector2 screenPosition)
    {
        if (clothingSlots == null || item == null) return null;

        ClothingSlot nearestSlot = null;
        float nearestDistance = float.MaxValue;

        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot == null || !ClothingUtils.IsSlotCompatibleWithItem(slot, item)) continue;

            // 각 슬롯의 개별 스냅 범위 체크 (동적 거리 포함)
            if (slot.IsWithinSnapRange(screenPosition))
            {
                float distance = GetDistanceToSlot(slot, screenPosition);
                if (distance < nearestDistance)
                {
                    nearestDistance = distance;
                    nearestSlot = slot;
                }
            }
        }

        return nearestSlot;
    }

    /// <summary>
    /// 슬롯까지의 거리를 계산합니다
    /// </summary>
    public static float GetDistanceToSlot(ClothingSlot slot, Vector2 screenPosition)
    {
        if (slot == null) return float.MaxValue;

        RectTransform slotRect = slot.GetComponent<RectTransform>();
        if (slotRect == null) return float.MaxValue;

        Vector2 slotScreenPosition = RectTransformUtility.WorldToScreenPoint(Camera.main, slotRect.position);
        return Vector2.Distance(screenPosition, slotScreenPosition);
    }

    /// <summary>
    /// 아이템을 슬롯에 배치합니다
    /// </summary>
    public static bool PlaceItemInSlot(ClothingSlot slot, DragAndDropItem item)
    {
        if (slot == null || item == null) return false;

        string itemType = item.GetItemType();
        string slotType = slot.GetSlotType();

        Debug.Log($"🎽 {itemType} 아이템을 {slotType} 슬롯에 배치 시도...");

        // ClothingSlot의 PlaceItem 메소드를 호출 (중복 착용 방지 로직이 포함됨)
        bool success = slot.PlaceItem(item);

        if (success)
        {
            Debug.Log($"✅ {ClothingUtils.GetItemInfo(item)}을(를) {slot.GetSlotType()} 슬롯에 성공적으로 배치했습니다!");
        }
        else
        {
            Debug.LogWarning($"❌ {itemType} 아이템 배치 실패");
        }

        return success;
    }

    /// <summary>
    /// 드래그 시작 로그를 출력합니다
    /// </summary>
    public static void LogDragStart(DragAndDropItem item)
    {
        Debug.Log($"드래그 시작: {ClothingUtils.GetItemInfo(item)}");
    }

    /// <summary>
    /// 드래그 종료 처리를 합니다
    /// </summary>
    public static bool HandleDragEnd(ClothingSlot[] clothingSlots, DragAndDropItem item, Vector2 screenPosition)
    {
        ClothingSlot nearestSlot = FindNearestCompatibleSlot(clothingSlots, item, screenPosition);

        if (nearestSlot != null && ClothingUtils.IsSlotCompatibleWithItem(nearestSlot, item))
        {
            // 슬롯에 배치
            return PlaceItemInSlot(nearestSlot, item);
        }

        return false;
    }

    /// <summary>
    /// 스프라이트 이름이 의상 아이템인지 확인합니다
    /// </summary>
    public static bool IsClothingItemSprite(string spriteName)
    {
        return ClothingUtils.IsClothingItemSprite(spriteName);
    }

    #endregion

    #region Popup Utils

    /// <summary>
    /// 팝업 시스템이 사용 가능한지 확인합니다
    /// </summary>
    public static bool IsPopupSystemAvailable(CharacterPopupManager popupManager)
    {
        return popupManager != null;
    }

    /// <summary>
    /// 팝업이 현재 활성화되어 있는지 확인합니다
    /// </summary>
    public static bool IsPopupActive(CharacterPopupManager popupManager)
    {
        return popupManager != null && popupManager.IsPopupActive();
    }

    /// <summary>
    /// 통합 팝업 제어 메서드 - 팝업 표시/숨김을 관리
    /// </summary>
    /// <param name="popupManager">팝업 매니저</param>
    /// <param name="show">true면 표시, false면 숨김</param>
    /// <param name="characterData">표시할 캐릭터 데이터 (null이면 기본 캐릭터 사용)</param>
    /// <param name="currentCharacterData">현재 캐릭터 데이터 (fallback용)</param>
    public static void SetPopupState(CharacterPopupManager popupManager, bool show, CharacterData characterData = null, CharacterData currentCharacterData = null)
    {
        if (popupManager == null)
        {
            Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
            return;
        }

        if (show)
        {
            CharacterData targetCharacter = characterData ?? currentCharacterData;
            if (targetCharacter != null)
            {
                popupManager.ShowPopupWithCharacter(targetCharacter);
                Debug.Log($"🎭 MainScene에서 팝업 표시: {targetCharacter.characterName}");
            }
            else
            {
                Debug.LogWarning("❌ 표시할 캐릭터 데이터가 없습니다!");
            }
        }
        else
        {
            popupManager.HidePopup();
            Debug.Log("🎭 MainScene에서 팝업 숨김");
        }
    }

    /// <summary>
    /// 현재 캐릭터로 팝업을 강제로 새로고침합니다
    /// </summary>
    public static void ForceRefreshPopup(CharacterPopupManager popupManager, CharacterData currentCharacterData)
    {
        if (popupManager != null && currentCharacterData != null)
        {
            // 팝업이 활성화되어 있으면 새로고침
            if (popupManager.IsPopupActive())
            {
                popupManager.ShowPopupWithCharacter(currentCharacterData);
                Debug.Log("🔄 팝업 강제 새로고침 완료");
            }
        }
    }

    /// <summary>
    /// 특정 캐릭터로 팝업을 표시합니다
    /// </summary>
    public static void ShowCharacterPopup(CharacterPopupManager popupManager, string characterName)
    {
        if (popupManager == null)
        {
            Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
            return;
        }

        CharacterData characterData = FindCharacterByName(characterName);
        if (characterData != null)
        {
            SetPopupState(popupManager, true, characterData);
        }
        else
        {
            Debug.LogWarning($"❌ 캐릭터 '{characterName}'을 찾을 수 없습니다!");
        }
    }

    /// <summary>
    /// 팝업을 토글합니다
    /// </summary>
    public static void ToggleCharacterPopup(CharacterPopupManager popupManager, CharacterData currentCharacterData)
    {
        if (popupManager != null)
        {
            bool isActive = popupManager.IsPopupActive();
            SetPopupState(popupManager, !isActive, currentCharacterData);
        }
    }

    /// <summary>
    /// 팝업 초기화 시 로그를 출력합니다
    /// </summary>
    public static void LogPopupInitialization(CharacterPopupManager popupManager)
    {
        if (popupManager != null)
        {
            Debug.Log("🎭 새로운 팝업 시스템 초기화 완료");
        }
    }

    #endregion
}
