using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// 의상 시스템 관련 통합 유틸리티 클래스
/// ClothingItem, ClothingSlot, ClothingSystem, LargeCharacterClothing 관련 기능을 포함
/// </summary>
public static class ClothingUtils
{
    #region ClothingItem Utils

    /// <summary>
    /// 스프라이트 이름에서 아이템 타입을 추출합니다
    /// </summary>
    public static string GetItemTypeFromSpriteName(string spriteName)
    {
        if (string.IsNullOrEmpty(spriteName)) return "unknown";

        string name = spriteName.ToLower();

        if (name.Contains("top")) return "top";
        if (name.Contains("bottom")) return "bottom";
        if (name.Contains("shoes")) return "shoes";
        if (name.Contains("socks")) return "socks";

        return "unknown";
    }

    /// <summary>
    /// 스프라이트 이름에서 캐릭터 번호를 추출합니다
    /// </summary>
    public static string GetCharacterNumberFromSpriteName(string spriteName)
    {
        if (string.IsNullOrEmpty(spriteName)) return "unknown";

        string name = spriteName.ToLower();

        // cha_ 패턴 확인
        if (name.Contains("cha_"))
        {
            int chaIndex = name.IndexOf("cha_");
            if (chaIndex != -1 && chaIndex + 4 < name.Length)
            {
                string afterCha = name.Substring(chaIndex + 4);
                // 다음 언더스코어까지의 문자열을 찾기
                int underscoreIndex = afterCha.IndexOf('_');
                if (underscoreIndex > 0)
                {
                    return afterCha.Substring(0, underscoreIndex);
                }
                else if (afterCha.Length > 0)
                {
                    // 언더스코어가 없으면 첫 번째 숫자 문자열 추출
                    for (int i = 0; i < afterCha.Length; i++)
                    {
                        if (!char.IsDigit(afterCha[i]))
                        {
                            return afterCha.Substring(0, i);
                        }
                    }
                    return afterCha;
                }
            }
        }

        return "unknown";
    }

    /// <summary>
    /// 아이템 타입에 따른 정렬 순서를 반환합니다
    /// </summary>
    public static int GetSortingOrderForItemType(string itemType)
    {
        switch (itemType.ToLower())
        {
            case "socks": return 100;
            case "bottom": return 200;
            case "top": return 300;
            case "shoes": return 400;
            default: return 0;
        }
    }

    /// <summary>
    /// 특정 캐릭터의 의상 아이템들만 필터링합니다
    /// </summary>
    public static DragAndDropItem[] FilterItemsByCharacter(DragAndDropItem[] items, string characterNumber)
    {
        if (items == null || string.IsNullOrEmpty(characterNumber)) return new DragAndDropItem[0];

        return items.Where(item =>
        {
            if (item == null) return false;
            string itemCharNumber = item.GetCharacterNumber();
            return itemCharNumber == characterNumber;
        }).ToArray();
    }

    /// <summary>
    /// 특정 타입의 의상 아이템들만 필터링합니다
    /// </summary>
    public static DragAndDropItem[] FilterItemsByType(DragAndDropItem[] items, string itemType)
    {
        if (items == null || string.IsNullOrEmpty(itemType)) return new DragAndDropItem[0];

        return items.Where(item =>
        {
            if (item == null) return false;
            string itemItemType = item.GetItemType();
            return itemItemType.ToLower() == itemType.ToLower();
        }).ToArray();
    }

    /// <summary>
    /// 의상 아이템의 호환성을 확인합니다 (같은 캐릭터인지)
    /// </summary>
    public static bool AreItemsCompatible(DragAndDropItem item1, DragAndDropItem item2)
    {
        if (item1 == null || item2 == null) return false;

        string char1 = item1.GetCharacterNumber();
        string char2 = item2.GetCharacterNumber();

        return char1 == char2 && char1 != "unknown";
    }

    /// <summary>
    /// 슬롯과 아이템의 호환성을 확인합니다
    /// </summary>
    public static bool IsSlotCompatibleWithItem(ClothingSlot slot, DragAndDropItem item)
    {
        if (slot == null || item == null) return false;

        string slotType = slot.GetSlotType();
        string itemType = item.GetItemType();

        return slotType.ToLower() == itemType.ToLower();
    }

    /// <summary>
    /// 아이템이 유효한 의상 아이템인지 확인합니다
    /// </summary>
    public static bool IsValidClothingItem(DragAndDropItem item)
    {
        if (item == null) return false;

        string itemType = item.GetItemType();
        string charNumber = item.GetCharacterNumber();

        bool hasValidType = itemType == "top" || itemType == "bottom" ||
                           itemType == "shoes" || itemType == "socks";
        bool hasValidCharacter = charNumber != "unknown";

        return hasValidType && hasValidCharacter;
    }

    /// <summary>
    /// 아이템들을 타입별로 그룹화합니다
    /// </summary>
    public static Dictionary<string, List<DragAndDropItem>> GroupItemsByType(DragAndDropItem[] items)
    {
        Dictionary<string, List<DragAndDropItem>> groups = new Dictionary<string, List<DragAndDropItem>>();

        if (items == null) return groups;

        foreach (DragAndDropItem item in items)
        {
            if (item == null) continue;

            string itemType = item.GetItemType();
            if (!groups.ContainsKey(itemType))
            {
                groups[itemType] = new List<DragAndDropItem>();
            }
            groups[itemType].Add(item);
        }

        return groups;
    }

    /// <summary>
    /// 아이템들을 캐릭터별로 그룹화합니다
    /// </summary>
    public static Dictionary<string, List<DragAndDropItem>> GroupItemsByCharacter(DragAndDropItem[] items)
    {
        Dictionary<string, List<DragAndDropItem>> groups = new Dictionary<string, List<DragAndDropItem>>();

        if (items == null) return groups;

        foreach (DragAndDropItem item in items)
        {
            if (item == null) continue;

            string charNumber = item.GetCharacterNumber();
            if (!groups.ContainsKey(charNumber))
            {
                groups[charNumber] = new List<DragAndDropItem>();
            }
            groups[charNumber].Add(item);
        }

        return groups;
    }

    /// <summary>
    /// 특정 캐릭터와 타입에 해당하는 아이템을 찾습니다
    /// </summary>
    public static DragAndDropItem FindItemByCharacterAndType(DragAndDropItem[] items, string characterNumber, string itemType)
    {
        if (items == null || string.IsNullOrEmpty(characterNumber) || string.IsNullOrEmpty(itemType))
            return null;

        return items.FirstOrDefault(item =>
        {
            if (item == null) return false;
            return item.GetCharacterNumber() == characterNumber &&
                   item.GetItemType().ToLower() == itemType.ToLower();
        });
    }

    /// <summary>
    /// 아이템의 상세 정보를 문자열로 반환합니다
    /// </summary>
    public static string GetItemInfo(DragAndDropItem item)
    {
        if (item == null) return "null item";

        string itemType = item.GetItemType();
        string charNumber = item.GetCharacterNumber();
        string spriteName = item.GetComponent<Image>()?.sprite?.name ?? "no sprite";

        return $"{item.name} (Type: {itemType}, Character: {charNumber}, Sprite: {spriteName})";
    }

    /// <summary>
    /// 모든 아이템의 상세 정보를 로그로 출력합니다
    /// </summary>
    public static void LogAllItemsInfo(DragAndDropItem[] items)
    {
        if (items == null || items.Length == 0)
        {
            Debug.Log("❌ 아이템이 없습니다.");
            return;
        }

        Debug.Log($"📋 총 {items.Length}개의 아이템 정보:");
        for (int i = 0; i < items.Length; i++)
        {
            Debug.Log($"   {i + 1}. {GetItemInfo(items[i])}");
        }
    }

    /// <summary>
    /// 아이템들을 정렬 순서대로 정렬합니다
    /// </summary>
    public static DragAndDropItem[] SortItemsBySortingOrder(DragAndDropItem[] items)
    {
        if (items == null) return new DragAndDropItem[0];

        return items.OrderBy(item =>
        {
            if (item == null) return int.MaxValue;
            return GetSortingOrderForItemType(item.GetItemType());
        }).ToArray();
    }

    #endregion

    #region ClothingSystem Utils

    /// <summary>
    /// 모든 ClothingSlot 컴포넌트를 찾아 반환합니다
    /// </summary>
    public static ClothingSlot[] FindAllClothingSlots()
    {
#pragma warning disable CS0618
        ClothingSlot[] foundSlots = Object.FindObjectsOfType<ClothingSlot>();
#pragma warning restore CS0618

        Debug.Log($"✅ {foundSlots.Length}개의 ClothingSlot 발견");

        foreach (ClothingSlot slot in foundSlots)
        {
            Debug.Log($"   - {slot.name}: {slot.GetSlotType()} 타입");
        }

        return foundSlots;
    }

    /// <summary>
    /// 모든 DragAndDropItem 컴포넌트를 찾아 반환합니다
    /// </summary>
    public static DragAndDropItem[] FindAllDragAndDropItems()
    {
#pragma warning disable CS0618
        DragAndDropItem[] foundItems = Object.FindObjectsOfType<DragAndDropItem>();
#pragma warning restore CS0618

        Debug.Log($"🔍 전체 씬에서 {foundItems.Length}개의 DragAndDropItem 발견");
        return foundItems;
    }

    /// <summary>
    /// 특정 부모 오브젝트들에서 DragAndDropItem을 자동으로 추가합니다
    /// </summary>
    public static void AutoAddDragAndDropItems(Transform[] parents)
    {
        if (parents == null || parents.Length == 0)
        {
            Debug.LogWarning("❌ 부모 오브젝트 배열이 설정되지 않았습니다!");
            return;
        }

        Debug.Log($"📁 {parents.Length}개의 부모 오브젝트 검사:");
        int totalAdded = 0;

        foreach (Transform parent in parents)
        {
            if (parent != null)
            {
                int addedCount = AutoAddDragAndDropItemsToParent(parent);
                totalAdded += addedCount;
            }
        }

        Debug.Log($"📊 총 {totalAdded}개의 DragAndDropItem이 자동으로 추가되었습니다.");
    }

    /// <summary>
    /// 특정 부모 오브젝트에 DragAndDropItem을 자동으로 추가합니다
    /// </summary>
    public static int AutoAddDragAndDropItemsToParent(Transform parent)
    {
        if (parent == null) return 0;

        Image[] images = parent.GetComponentsInChildren<Image>();
        int addedCount = 0;

        foreach (Image img in images)
        {
            // 이미 DragAndDropItem이 있는지 확인
            if (img.GetComponent<DragAndDropItem>() != null) continue;

            // 스프라이트가 있고, 의상 아이템으로 보이는지 확인
            if (img.sprite != null && IsClothingItemSprite(img.sprite.name))
            {
                img.gameObject.AddComponent<DragAndDropItem>();
                addedCount++;
                Debug.Log($"   🔄 런타임 자동 추가: {img.name} (스프라이트: {img.sprite.name})");
            }
        }

        if (addedCount > 0)
        {
            Debug.Log($"   ✨ {parent.name}에서 {addedCount}개 DragAndDropItem을 런타임에 추가했습니다");
        }

        return addedCount;
    }

    /// <summary>
    /// 스프라이트 이름이 의상 아이템인지 확인합니다
    /// </summary>
    public static bool IsClothingItemSprite(string spriteName)
    {
        if (string.IsNullOrEmpty(spriteName)) return false;

        string name = spriteName.ToLower();

        // 캐릭터 의상 패턴 확인
        bool hasChaPattern = name.Contains("cha_");
        bool hasValidType = name.Contains("top") || name.Contains("bottom") ||
                           name.Contains("shoes") || name.Contains("socks") ||
                           name.Contains("acc1") || name.Contains("acc2");

        return hasChaPattern && hasValidType;
    }

    /// <summary>
    /// 특정 타입의 의상 아이템들만 찾습니다
    /// </summary>
    public static DragAndDropItem[] GetItemsByType(string itemType, Transform[] parents)
    {
        List<DragAndDropItem> matchingItems = new List<DragAndDropItem>();
        Debug.Log($"🔍 ClothingUtils.GetItemsByType: '{itemType}' 타입 검색 중...");

        if (parents != null)
        {
            foreach (Transform parent in parents)
            {
                if (parent != null)
                {
                    Debug.Log($"   부모 '{parent.name}' 검사 중... (자식 수: {parent.childCount})");
                    DragAndDropItem[] items = parent.GetComponentsInChildren<DragAndDropItem>();
                    Debug.Log($"   찾은 DragAndDropItem 수: {items.Length}");
                    
                    foreach (DragAndDropItem item in items)
                    {
                        if (item != null)
                        {
                            string itemTypeFound = item.GetItemType();
                            bool isMatch = IsItemTypeMatch(itemTypeFound, itemType);
                            Debug.Log($"     아이템: {item.name} (타입: '{itemTypeFound}') - 매치: {(isMatch ? "✅" : "❌")}");
                            
                            if (isMatch)
                            {
                                matchingItems.Add(item);
                            }
                        }
                    }
                }
            }
        }

        Debug.Log($"🎯 최종 결과: '{itemType}' 타입 아이템 {matchingItems.Count}개 발견");
        return matchingItems.ToArray();
    }

    /// <summary>
    /// 아이템 타입이 검색 타입과 매치되는지 확인합니다 (accessory 특수 처리 포함)
    /// </summary>
    private static bool IsItemTypeMatch(string itemType, string searchType)
    {
        string itemTypeLower = itemType.ToLower();
        string searchTypeLower = searchType.ToLower();
        
        // 정확한 매치
        if (itemTypeLower == searchTypeLower)
        {
            return true;
        }
        
        // accessory 타입 특수 처리: accessory로 검색할 때 acc, acc1, acc2도 포함
        if (searchTypeLower == "accessory")
        {
            return itemTypeLower == "acc" || itemTypeLower == "acc1" || itemTypeLower == "acc2" || itemTypeLower == "accessory";
        }
        
        // acc로 검색할 때 acc1, acc2도 포함
        if (searchTypeLower == "acc")
        {
            return itemTypeLower == "acc" || itemTypeLower == "acc1" || itemTypeLower == "acc2" || itemTypeLower == "accessory";
        }
        
        return false;
    }

    /// <summary>
    /// 모든 의상 아이템들을 원래 위치로 되돌립니다
    /// </summary>
    public static void ResetAllClothingItems(Transform[] parents)
    {
        int resetCount = 0;

        if (parents != null)
        {
            foreach (Transform parent in parents)
            {
                if (parent != null)
                {
                    DragAndDropItem[] items = parent.GetComponentsInChildren<DragAndDropItem>();
                    foreach (DragAndDropItem item in items)
                    {
                        if (item != null)
                        {
                            item.ReturnToOriginalPosition();
                            resetCount++;
                        }
                    }
                }
            }
        }

        Debug.Log($"{resetCount}개의 의상 아이템이 원래 위치로 되돌아갔습니다.");
    }

    /// <summary>
    /// 아이템의 상세 정보를 로그로 출력합니다
    /// </summary>
    public static void LogItemDetails(DragAndDropItem item)
    {
        if (item == null) return;

        string itemType = item.GetItemType();
        string charNumber = item.GetCharacterNumber();

        Debug.Log($"      - {item.name}: {itemType} 타입, 캐릭터 {charNumber}");
    }

    #endregion

    #region Large Character Clothing Utils

    /// <summary>
    /// Large Character Clothing Sprites 구조체
    /// </summary>
    [System.Serializable]
    public struct LargeCharacterClothingSprites
    {
        public Sprite top1;
        public Sprite top2; 
        public Sprite top3;
        public Sprite bottom1;
        public Sprite bottom2;
        public Sprite socks;
        public Sprite shoes;
        public Sprite acc1;
        public Sprite acc2;
    }

    /// <summary>
    /// 캐릭터의 large character 의상 스프라이트들을 반환합니다
    /// </summary>
    public static LargeCharacterClothingSprites GetLargeCharacterClothing(CharacterData characterData)
    {
        if (characterData == null)
            return new LargeCharacterClothingSprites();

        return new LargeCharacterClothingSprites
        {
            top1 = characterData.largeTop1Sprite,
            top2 = characterData.largeTop2Sprite,
            top3 = characterData.largeTop3Sprite,
            bottom1 = characterData.largeBottom1Sprite,
            bottom2 = characterData.largeBottom2Sprite,
            socks = characterData.largeSocksSprite,
            shoes = characterData.largeShoesSprite,
            acc1 = characterData.largeAcc1Sprite,
            acc2 = characterData.largeAcc2Sprite
        };
    }

    /// <summary>
    /// CharacterData에서 특정 타입의 large character 의상 스프라이트를 가져옵니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>해당하는 스프라이트 또는 null</returns>
    public static Sprite GetLargeCharacterClothingSprite(CharacterData characterData, string clothingType)
    {
        if (characterData == null || string.IsNullOrEmpty(clothingType))
            return null;

        switch (clothingType.ToLower())
        {
            case "top1":
                return characterData.largeTop1Sprite;
            case "top2":
                return characterData.largeTop2Sprite;
            case "top3":
                return characterData.largeTop3Sprite;
            case "bottom1":
                return characterData.largeBottom1Sprite;
            case "bottom2":
                return characterData.largeBottom2Sprite;
            case "socks":
                return characterData.largeSocksSprite;
            case "shoes":
                return characterData.largeShoesSprite;
            case "acc1":
            case "accessory1":
                return characterData.largeAcc1Sprite;
            case "acc2":
            case "accessory2":
                return characterData.largeAcc2Sprite;
            case "acc":
            case "accessory":
                // 하위 호환성을 위해 acc1을 반환
                return characterData.largeAcc1Sprite;
            default:
                return null;
        }
    }

    /// <summary>
    /// 특정 캐릭터의 large character 의상 스프라이트를 가져옵니다
    /// </summary>
    /// <param name="characterName">캐릭터 이름</param>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>해당하는 스프라이트 또는 null</returns>
    public static Sprite GetLargeCharacterClothingSprite(string characterName, string clothingType)
    {
        CharacterData characterData = FindCharacterDataByName(characterName);
        if (characterData == null) return null;

        return GetLargeCharacterClothingSprite(characterData, clothingType);
    }

    /// <summary>
    /// 캐릭터가 특정 타입의 선택적 의상을 가지고 있는지 확인합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingType">의상 타입 (top2, top3, bottom2, socks, acc2)</param>
    /// <returns>해당 의상이 있으면 true</returns>
    public static bool HasOptionalClothing(CharacterData characterData, string clothingType)
    {
        if (characterData == null) return false;

        Sprite sprite = GetLargeCharacterClothingSprite(characterData, clothingType);
        return sprite != null;
    }

    /// <summary>
    /// 캐릭터의 모든 필수 의상이 설정되어 있는지 확인합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <returns>모든 필수 의상이 있으면 true</returns>
    public static bool HasAllRequiredClothing(CharacterData characterData)
    {
        if (characterData == null) return false;

        return characterData.largeTop1Sprite != null &&
               characterData.largeBottom1Sprite != null &&
               characterData.largeShoesSprite != null &&
               characterData.largeAcc1Sprite != null;
    }

    /// <summary>
    /// 의상 레이어 순서를 반환합니다
    /// </summary>
    /// <returns>레이어 순서 배열 (하위부터 상위 순)</returns>
    public static string[] GetClothingLayerOrder()
    {
        return new string[]
        {
            "bottom1",  // 가장 하위
            "top1",
            "socks",
            "shoes",
            "bottom2",
            "top2",
            "top3",
            "acc1",
            "acc2"     // 가장 상위
        };
    }

    /// <summary>
    /// 특정 레이어의 순서를 반환합니다 (낮을수록 아래 레이어)
    /// </summary>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>레이어 순서 (-1이면 찾을 수 없음)</returns>
    public static int GetClothingLayerOrder(string clothingType)
    {
        string[] layerOrder = GetClothingLayerOrder();
        for (int i = 0; i < layerOrder.Length; i++)
        {
            if (layerOrder[i].ToLower() == clothingType.ToLower())
            {
                return i;
            }
        }
        return -1;
    }

    /// <summary>
    /// 의상 타입이 필수인지 확인합니다
    /// </summary>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>필수이면 true</returns>
    public static bool IsRequiredClothing(string clothingType)
    {
        if (string.IsNullOrEmpty(clothingType)) return false;

        switch (clothingType.ToLower())
        {
            case "top1":
            case "bottom1":
            case "shoes":
            case "acc1":
                return true;
            default:
                return false;
        }
    }

    /// <summary>
    /// 의상 타입이 선택적인지 확인합니다
    /// </summary>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>선택적이면 true</returns>
    public static bool IsOptionalClothing(string clothingType)
    {
        if (string.IsNullOrEmpty(clothingType)) return false;

        switch (clothingType.ToLower())
        {
            case "top2":
            case "top3":
            case "bottom2":
            case "socks":
            case "acc2":
                return true;
            default:
                return false;
        }
    }

    /// <summary>
    /// 캐릭터의 의상 설정 상태를 로그로 출력합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    public static void LogLargeCharacterClothingStatus(CharacterData characterData)
    {
        if (characterData == null)
        {
            Debug.LogWarning("❌ 캐릭터 데이터가 없습니다!");
            return;
        }

        Debug.Log($"👕 === {characterData.characterName} Large Character 의상 상태 ===");
        Debug.Log($"   필수 의상:");
        Debug.Log($"     - Top1: {(characterData.largeTop1Sprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Bottom1: {(characterData.largeBottom1Sprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Shoes: {(characterData.largeShoesSprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Acc1: {(characterData.largeAcc1Sprite != null ? "✅" : "❌")}");

        Debug.Log($"   선택적 의상:");
        Debug.Log($"     - Top2: {(characterData.largeTop2Sprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Top3: {(characterData.largeTop3Sprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Bottom2: {(characterData.largeBottom2Sprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Socks: {(characterData.largeSocksSprite != null ? "✅" : "❌")}");
        Debug.Log($"     - Acc2: {(characterData.largeAcc2Sprite != null ? "✅" : "❌")}");
        Debug.Log("===============================");
    }

    /// <summary>
    /// 캐릭터 이름으로 CharacterData를 찾습니다
    /// </summary>
    private static CharacterData FindCharacterDataByName(string characterName)
    {
        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        if (allCharacters == null) return null;

        foreach (CharacterData character in allCharacters)
        {
            if (character != null && character.characterName.ToLower() == characterName.ToLower())
            {
                return character;
            }
        }
        return null;
    }

    #endregion
}
