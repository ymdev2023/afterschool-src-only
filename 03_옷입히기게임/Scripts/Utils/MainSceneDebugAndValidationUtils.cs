using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Linq;

/// <summary>
/// 메인 씬에서 디버그 및 검증 기능을 처리하는 통합 유틸리티 클래스
/// 의상 검증, 시스템 디버그, 로깅 기능을 포함
/// </summary>
public static class MainSceneDebugAndValidationUtils
{
    #region Validation Utils

    /// <summary>
    /// 현재 착용한 의상이 캐릭터 데이터의 정답과 일치하는지 확인합니다
    /// </summary>
    /// <param name="characterData">검증할 캐릭터 데이터</param>
    /// <param name="clothingSlots">현재 의상 슬롯들</param>
    /// <returns>모든 의상이 정답과 일치하면 true</returns>
    public static bool ValidateCurrentClothing(CharacterData characterData, ClothingSlot[] clothingSlots)
    {
        if (characterData == null || clothingSlots == null)
        {
            Debug.LogWarning("❌ 검증할 데이터가 없습니다!");
            return false;
        }

        Debug.Log($"🔍 의상 정답 검증 시작: {characterData.characterName}");

        // 각 의상 타입별로 검증
        bool topCorrect = ValidateClothingType(characterData, clothingSlots, "top");
        bool bottomCorrect = ValidateClothingType(characterData, clothingSlots, "bottom");
        bool shoesCorrect = ValidateClothingType(characterData, clothingSlots, "shoes");
        bool socksCorrect = ValidateClothingType(characterData, clothingSlots, "socks");

        bool allCorrect = topCorrect && bottomCorrect && shoesCorrect && socksCorrect;

        if (allCorrect)
        {
            Debug.Log("🎉 모든 의상이 정답입니다!");
        }
        else
        {
            Debug.Log($"❌ 의상 검증 결과 - Top: {topCorrect}, Bottom: {bottomCorrect}, Shoes: {shoesCorrect}, Socks: {socksCorrect}");
        }

        return allCorrect;
    }

    /// <summary>
    /// 특정 타입의 의상이 정답과 일치하는지 확인합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingSlots">의상 슬롯들</param>
    /// <param name="clothingType">확인할 의상 타입 (top, bottom, shoes, socks)</param>
    /// <returns>해당 타입이 정답과 일치하면 true</returns>
    private static bool ValidateClothingType(CharacterData characterData, ClothingSlot[] clothingSlots, string clothingType)
    {
        // 캐릭터 데이터에서 정답 스프라이트들 가져오기
        Sprite[] correctSprites = GetCorrectSpritesForType(characterData, clothingType);

        // 현재 착용한 아이템들 가져오기
        DragAndDropItem[] currentItems = GetCurrentItemsForType(clothingSlots, clothingType);

        // 정답 스프라이트가 없으면 아무것도 착용하지 않아야 정답
        if (correctSprites == null || correctSprites.Length == 0)
        {
            bool isEmpty = (currentItems == null || currentItems.Length == 0);
            Debug.Log($"   {clothingType}: 정답 없음 - 현재 착용: {(isEmpty ? "없음" : "있음")} → {(isEmpty ? "✅" : "❌")}");
            return isEmpty;
        }

        // 현재 착용한 아이템이 없으면 오답
        if (currentItems == null || currentItems.Length == 0)
        {
            Debug.Log($"   {clothingType}: 정답 있음 - 현재 착용: 없음 → ❌");
            return false;
        }

        // 각 정답 스프라이트와 비교
        foreach (Sprite correctSprite in correctSprites)
        {
            if (correctSprite == null) continue;

            bool found = false;
            foreach (DragAndDropItem currentItem in currentItems)
            {
                if (currentItem != null && IsItemMatchingSprite(currentItem, correctSprite))
                {
                    found = true;
                    Debug.Log($"   {clothingType}: {correctSprite.name} 매칭됨 ✅");
                    break;
                }
            }

            if (!found)
            {
                Debug.Log($"   {clothingType}: {correctSprite.name} 매칭되지 않음 ❌");
                return false;
            }
        }

        return true;
    }

    /// <summary>
    /// 캐릭터 데이터에서 특정 타입의 정답 스프라이트들을 가져옵니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>정답 스프라이트 배열</returns>
    private static Sprite[] GetCorrectSpritesForType(CharacterData characterData, string clothingType)
    {
        switch (clothingType.ToLower())
        {
            case "top":
                return new Sprite[] {
                    characterData.largeTop1Sprite,
                    characterData.largeTop2Sprite,
                    characterData.largeTop3Sprite
                }.Where(s => s != null).ToArray();

            case "bottom":
                return new Sprite[] {
                    characterData.largeBottom1Sprite,
                    characterData.largeBottom2Sprite
                }.Where(s => s != null).ToArray();

            case "shoes":
                return characterData.largeShoesSprite != null
                    ? new Sprite[] { characterData.largeShoesSprite }
                    : new Sprite[0];

            case "socks":
                return characterData.largeSocksSprite != null
                    ? new Sprite[] { characterData.largeSocksSprite }
                    : new Sprite[0];

            default:
                return new Sprite[0];
        }
    }

    /// <summary>
    /// 현재 착용한 특정 타입의 아이템들을 가져옵니다
    /// </summary>
    /// <param name="clothingSlots">의상 슬롯들</param>
    /// <param name="clothingType">의상 타입</param>
    /// <returns>현재 착용한 아이템 배열</returns>
    private static DragAndDropItem[] GetCurrentItemsForType(ClothingSlot[] clothingSlots, string clothingType)
    {
        if (clothingSlots == null) return new DragAndDropItem[0];

        var items = new System.Collections.Generic.List<DragAndDropItem>();

        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot != null && slot.GetSlotType().ToLower() == clothingType.ToLower())
            {
                DragAndDropItem currentItem = slot.GetCurrentItem();
                if (currentItem != null)
                {
                    items.Add(currentItem);
                }
            }
        }

        return items.ToArray();
    }

    /// <summary>
    /// 아이템이 특정 스프라이트와 일치하는지 확인합니다
    /// </summary>
    /// <param name="item">확인할 아이템</param>
    /// <param name="targetSprite">비교할 스프라이트</param>
    /// <returns>일치하면 true</returns>
    private static bool IsItemMatchingSprite(DragAndDropItem item, Sprite targetSprite)
    {
        if (item == null || targetSprite == null) return false;

        // 아이템의 이미지 컴포넌트에서 스프라이트 가져오기
        Image itemImage = item.GetComponent<Image>();
        if (itemImage != null && itemImage.sprite != null)
        {
            // 스프라이트 이름으로 비교 (더 안정적)
            string itemSpriteName = itemImage.sprite.name;
            string targetSpriteName = targetSprite.name;

            // 이름에서 (Clone) 등의 접미사 제거
            itemSpriteName = itemSpriteName.Replace("(Clone)", "").Trim();
            targetSpriteName = targetSpriteName.Replace("(Clone)", "").Trim();

            bool isMatch = itemSpriteName.Equals(targetSpriteName, System.StringComparison.OrdinalIgnoreCase);

            if (isMatch)
            {
                Debug.Log($"      매칭: {itemSpriteName} = {targetSpriteName}");
            }

            return isMatch;
        }

        return false;
    }

    /// <summary>
    /// 정답 메시지를 UI 텍스트에 표시합니다 (Unity Text)
    /// </summary>
    /// <param name="messageText">메시지를 표시할 Text 컴포넌트</param>
    /// <param name="isCorrect">정답 여부</param>
    /// <param name="characterName">캐릭터 이름 (선택사항)</param>
    public static void ShowValidationMessage(Text messageText, bool isCorrect, string characterName = "")
    {
        if (messageText == null) return;

        if (isCorrect)
        {
            string message = string.IsNullOrEmpty(characterName)
                ? "🎉 정답!"
                : $"🎉 정답! {characterName}의 의상을 완벽하게 착용했습니다!";

            UIUtils.SetText(messageText, message);

            // 텍스트 색상을 초록색으로 변경
            if (messageText != null)
            {
                messageText.color = Color.green;
            }

            Debug.Log($"✅ {message}");
        }
        else
        {
            string message = "❌ 아직 완성되지 않았습니다. 다시 시도해보세요!";
            UIUtils.SetText(messageText, message);

            // 텍스트 색상을 빨간색으로 변경
            if (messageText != null)
            {
                messageText.color = Color.red;
            }

            Debug.Log($"❌ {message}");
        }
    }

    /// <summary>
    /// 정답 메시지를 UI 텍스트에 표시합니다 (TextMeshPro)
    /// </summary>
    /// <param name="messageText">메시지를 표시할 TextMeshProUGUI 컴포넌트</param>
    /// <param name="isCorrect">정답 여부</param>
    /// <param name="characterName">캐릭터 이름 (선택사항)</param>
    public static void ShowValidationMessage(TextMeshProUGUI messageText, bool isCorrect, string characterName = "")
    {
        if (messageText == null) return;

        if (isCorrect)
        {
            string message = "내 취향을 어떻게 알았지?!?! +_+";
            messageText.text = message;
            messageText.color = new Color32(202, 39, 121, 255);
            Debug.Log($"✅ {message}");
        }
        else
        {
            string message = "서랍에 양말도 있어! 잘 찾아봐~";
            messageText.text = message;
            messageText.color = Color.red;
            Debug.Log($"❌ {message}");
        }
    }

    /// <summary>
    /// 스프라이트 이름을 활용한 상세 검증 메시지를 생성합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingSlots">의상 슬롯들</param>
    /// <param name="messageText">메시지를 표시할 TextMeshProUGUI 컴포넌트</param>
    /// <param name="isCorrect">정답 여부</param>
    public static void ShowDetailedValidationMessage(CharacterData characterData, ClothingSlot[] clothingSlots, TextMeshProUGUI messageText, bool isCorrect)
    {
        if (messageText == null) return;

        if (isCorrect)
        {
            // 정답인 경우
            string message = "내 취향을 어떻게 알았지?!?! +_+";
            messageText.text = message;
            messageText.color = Color.green;
            Debug.Log($"✅ {message}");
        }
        else
        {
            // 오답인 경우 - 구체적인 힌트 제공
            string hintMessage = GenerateValidationHintMessage(characterData, clothingSlots);
            messageText.text = hintMessage;
            messageText.color = Color.red;
            Debug.Log($"❌ {hintMessage}");
        }
    }

    /// <summary>
    /// 검증 실패 시 구체적인 힌트 메시지를 생성합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingSlots">의상 슬롯들</param>
    /// <returns>힌트 메시지</returns>
    private static string GenerateValidationHintMessage(CharacterData characterData, ClothingSlot[] clothingSlots)
    {
        if (characterData == null || clothingSlots == null)
            return "서랍에 양말도 있어! 잘 찾아봐~";

        System.Collections.Generic.List<string> hints = new System.Collections.Generic.List<string>();

        // 각 의상 타입별로 검사하여 힌트 생성
        CheckAndAddHint(characterData, clothingSlots, "shoes", hints);
        CheckAndAddHint(characterData, clothingSlots, "socks", hints);
        CheckAndAddHint(characterData, clothingSlots, "top", hints);
        CheckAndAddHint(characterData, clothingSlots, "bottom", hints);

        // 힌트가 있으면 첫 번째 힌트 반환, 없으면 기본 메시지
        if (hints.Count > 0)
        {
            return hints[0];
        }

        return "서랍에 양말도 있어! 잘 찾아봐~";
    }

    /// <summary>
    /// 특정 의상 타입에 대한 힌트를 생성하고 리스트에 추가합니다
    /// </summary>
    private static void CheckAndAddHint(CharacterData characterData, ClothingSlot[] clothingSlots, string clothingType, System.Collections.Generic.List<string> hints)
    {
        // 정답 스프라이트들과 현재 착용 아이템들 가져오기
        Sprite[] correctSprites = GetCorrectSpritesForType(characterData, clothingType);
        DragAndDropItem[] currentItems = GetCurrentItemsForType(clothingSlots, clothingType);

        // 착용해야 할 아이템이 있는데 착용하지 않은 경우
        if (correctSprites.Length > 0)
        {
            foreach (Sprite correctSprite in correctSprites)
            {
                if (correctSprite == null) continue;

                bool isWearing = false;
                if (currentItems != null)
                {
                    foreach (DragAndDropItem currentItem in currentItems)
                    {
                        if (IsItemMatchingSprite(currentItem, correctSprite))
                        {
                            isWearing = true;
                            break;
                        }
                    }
                }

                if (!isWearing)
                {
                    // 캐릭터 데이터에서 스프라이트 이름 가져오기
                    string spriteName = GetSpriteNameFromCharacterData(characterData, clothingType, correctSprite);
                    if (!string.IsNullOrEmpty(spriteName))
                    {
                        hints.Add($"\"{spriteName}\"를 착용해야 할 것 같은데~?");
                    }
                    else
                    {
                        hints.Add($"{GetClothingTypeKoreanName(clothingType)}을(를) 착용해야 할 것 같은데~?");
                    }
                }
            }
        }

        // 착용하면 안 되는 아이템을 착용한 경우 (잘못된 아이템 착용)
        if (currentItems != null)
        {
            foreach (DragAndDropItem currentItem in currentItems)
            {
                if (currentItem == null) continue;

                bool shouldWear = false;
                if (correctSprites.Length > 0)
                {
                    foreach (Sprite correctSprite in correctSprites)
                    {
                        if (IsItemMatchingSprite(currentItem, correctSprite))
                        {
                            shouldWear = true;
                            break;
                        }
                    }
                }

                if (!shouldWear)
                {
                    // 잘못 착용한 아이템의 이름을 가져오기
                    Image itemImage = currentItem.GetComponent<Image>();
                    if (itemImage?.sprite != null)
                    {
                        string wrongItemName = GetDisplayNameForSprite(itemImage.sprite.name);
                        hints.Add($"\"{wrongItemName}\"은 필요없을 것 같아~");
                    }
                }
            }
        }
    }

    /// <summary>
    /// 캐릭터 데이터에서 특정 스프라이트의 설정된 이름을 가져옵니다
    /// </summary>
    private static string GetSpriteNameFromCharacterData(CharacterData characterData, string clothingType, Sprite sprite)
    {
        if (characterData == null || sprite == null) return "";

        // 스프라이트와 매칭되는 설정된 이름 찾기
        switch (clothingType.ToLower())
        {
            case "top":
                if (sprite == characterData.largeTop1Sprite) return characterData.largeTop1SpriteName;
                if (sprite == characterData.largeTop2Sprite) return characterData.largeTop2SpriteName;
                if (sprite == characterData.largeTop3Sprite) return characterData.largeTop3SpriteName;
                break;
            case "bottom":
                if (sprite == characterData.largeBottom1Sprite) return characterData.largeBottom1SpriteName;
                if (sprite == characterData.largeBottom2Sprite) return characterData.largeBottom2SpriteName;
                break;
            case "shoes":
                if (sprite == characterData.largeShoesSprite) return characterData.largeShoesSpriteName;
                break;
            case "socks":
                if (sprite == characterData.largeSocksSprite) return characterData.largeSocksSpriteName;
                break;
        }

        return "";
    }

    /// <summary>
    /// 스프라이트 이름을 표시용 이름으로 변환합니다
    /// </summary>
    private static string GetDisplayNameForSprite(string spriteName)
    {
        if (string.IsNullOrEmpty(spriteName)) return "아이템";

        // (Clone) 등 제거
        string cleanName = spriteName.Replace("(Clone)", "").Trim();

        // 기본적으로 그대로 반환, 필요시 매핑 추가
        return cleanName;
    }

    /// <summary>
    /// 의상 타입의 한국어 이름을 반환합니다
    /// </summary>
    private static string GetClothingTypeKoreanName(string clothingType)
    {
        switch (clothingType.ToLower())
        {
            case "top": return "상의";
            case "bottom": return "하의";
            case "shoes": return "신발";
            case "socks": return "양말";
            default: return "의상";
        }
    }

    /// <summary>
    /// 메시지를 일정 시간 후에 자동으로 지웁니다 (Unity Text)
    /// </summary>
    /// <param name="messageText">메시지 텍스트</param>
    /// <param name="delay">지연 시간 (초)</param>
    public static void ClearMessageAfterDelay(Text messageText, float delay = 3f)
    {
        if (messageText == null) return;

        // 코루틴을 사용하여 지연 후 메시지 클리어
        var coroutine = ClearMessageCoroutine(messageText, delay);

        // MonoBehaviour가 필요한 경우를 위한 대안
        // MainSceneManager에서 StartCoroutine을 호출하도록 함
    }

    /// <summary>
    /// 메시지를 일정 시간 후에 자동으로 지웁니다 (TextMeshPro)
    /// </summary>
    /// <param name="messageText">메시지 텍스트</param>
    /// <param name="delay">지연 시간 (초)</param>
    public static void ClearMessageAfterDelay(TextMeshProUGUI messageText, float delay = 3f)
    {
        if (messageText == null) return;

        // 코루틴을 사용하여 지연 후 메시지 클리어
        var coroutine = ClearMessageCoroutine(messageText, delay);

        // MonoBehaviour가 필요한 경우를 위한 대안
        // MainSceneManager에서 StartCoroutine을 호출하도록 함
    }

    /// <summary>
    /// 메시지 클리어 코루틴 (Unity Text - MainSceneManager에서 StartCoroutine으로 실행)
    /// </summary>
    public static System.Collections.IEnumerator ClearMessageCoroutine(Text messageText, float delay)
    {
        yield return new UnityEngine.WaitForSeconds(delay);

        if (messageText != null)
        {
            UIUtils.SetText(messageText, "");
            messageText.color = Color.white; // 원래 색상으로 복원
        }
    }

    /// <summary>
    /// 메시지 클리어 코루틴 (TextMeshPro - MainSceneManager에서 StartCoroutine으로 실행)
    /// </summary>
    public static System.Collections.IEnumerator ClearMessageCoroutine(TextMeshProUGUI messageText, float delay)
    {
        yield return new UnityEngine.WaitForSeconds(delay);

        if (messageText != null)
        {
            messageText.text = "";
            messageText.color = Color.white; // 원래 색상으로 복원
        }
    }

    /// <summary>
    /// 현재 착용 상태를 상세히 로그로 출력합니다 (디버그용)
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="clothingSlots">의상 슬롯들</param>
    public static void LogDetailedValidationStatus(CharacterData characterData, ClothingSlot[] clothingSlots)
    {
        if (characterData == null || clothingSlots == null) return;

        Debug.Log($"🔍 === {characterData.characterName} 의상 상세 검증 ===");

        string[] clothingTypes = { "top", "bottom", "shoes", "socks" };

        foreach (string type in clothingTypes)
        {
            Debug.Log($"\n📋 {type.ToUpper()} 검증:");

            // 정답 데이터
            Sprite[] correctSprites = GetCorrectSpritesForType(characterData, type);
            Debug.Log($"   정답 개수: {correctSprites.Length}");
            foreach (Sprite sprite in correctSprites)
            {
                if (sprite != null)
                    Debug.Log($"   - 정답: {sprite.name}");
            }

            // 현재 착용 데이터
            DragAndDropItem[] currentItems = GetCurrentItemsForType(clothingSlots, type);
            Debug.Log($"   착용 개수: {currentItems.Length}");
            foreach (DragAndDropItem item in currentItems)
            {
                if (item != null)
                {
                    Image img = item.GetComponent<Image>();
                    string spriteName = img?.sprite?.name ?? "Unknown";
                    Debug.Log($"   - 착용: {spriteName}");
                }
            }

            // 검증 결과
            bool isCorrect = ValidateClothingType(characterData, clothingSlots, type);
            Debug.Log($"   결과: {(isCorrect ? "✅ 정답" : "❌ 오답")}");
        }

        Debug.Log("================================");
    }

    #endregion

    #region Debug Utils

    /// <summary>
    /// 현재 착용 중인 모든 의상 아이템 정보를 로그로 출력합니다
    /// </summary>
    public static void LogCurrentClothingStatus(ClothingSlot[] clothingSlots)
    {
        if (clothingSlots == null || clothingSlots.Length == 0)
        {
            Debug.LogWarning("❌ clothingSlots가 설정되지 않았습니다!");
            return;
        }

        Debug.Log("👕 === 현재 착용 중인 의상 아이템 ===");
        bool hasAnyItem = false;

        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot != null)
            {
                DragAndDropItem currentItem = slot.GetCurrentItem();
                if (currentItem != null)
                {
                    Debug.Log($"   📍 {slot.GetSlotType()} 슬롯: {ClothingUtils.GetItemInfo(currentItem)}");
                    hasAnyItem = true;
                }
                else
                {
                    Debug.Log($"   📍 {slot.GetSlotType()} 슬롯: 비어있음");
                }
            }
        }

        if (!hasAnyItem)
        {
            Debug.Log("   📍 착용 중인 의상 아이템이 없습니다.");
        }
        Debug.Log("=================================");
    }

    /// <summary>
    /// 의상 부모 오브젝트들의 정보를 로그로 출력합니다
    /// </summary>
    public static void LogClothingParentsInfo(Transform[] clothingItemsParents)
    {
        if (clothingItemsParents == null || clothingItemsParents.Length == 0)
        {
            Debug.LogWarning("❌ clothingItemsParents가 설정되지 않았습니다!");
            return;
        }

        Debug.Log($"📋 {clothingItemsParents.Length}개의 부모 오브젝트 정보:");
        for (int i = 0; i < clothingItemsParents.Length; i++)
        {
            if (clothingItemsParents[i] != null)
            {
                DragAndDropItem[] items = clothingItemsParents[i].GetComponentsInChildren<DragAndDropItem>();
                Debug.Log($"   {i + 1}. {clothingItemsParents[i].name}: {items.Length}개 아이템");

                foreach (DragAndDropItem item in items)
                {
                    Debug.Log($"      - {ClothingUtils.GetItemInfo(item)}");
                }
            }
            else
            {
                Debug.LogWarning($"   {i + 1}. null 오브젝트");
            }
        }
    }

    /// <summary>
    /// 현재 캐릭터의 의상 설정 상태를 로그로 출력합니다
    /// </summary>
    public static void LogCurrentCharacterClothingStatus(CharacterData characterData)
    {
        if (characterData == null)
        {
            Debug.Log("현재 선택된 캐릭터가 없습니다.");
            return;
        }

        Debug.Log($"캐릭터 '{characterData.characterName}'의 Large Character 의상 상태:");
        Debug.Log($"- Top1: {(characterData.largeTop1Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Top2: {(characterData.largeTop2Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Top3: {(characterData.largeTop3Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Bottom1: {(characterData.largeBottom1Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Bottom2: {(characterData.largeBottom2Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Socks: {(characterData.largeSocksSprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Shoes: {(characterData.largeShoesSprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Acc1: {(characterData.largeAcc1Sprite != null ? "설정됨" : "없음")}");
        Debug.Log($"- Acc2: {(characterData.largeAcc2Sprite != null ? "설정됨" : "없음")}");
    }

    /// <summary>
    /// 시스템 재초기화 로그와 함께 의상 시스템을 재시작합니다
    /// </summary>
    public static ClothingSlot[] ForceReinitializeClothingSystem(Transform[] clothingItemsParents)
    {
        Debug.Log("🔄 의상 시스템 강제 재초기화...");
        return MainSceneUtils.InitializeClothingSystem(clothingItemsParents);
    }

    /// <summary>
    /// 시스템 상태 전반을 체크하고 로그를 출력합니다
    /// </summary>
    public static void LogSystemStatus(
        CharacterData currentCharacterData,
        ClothingSlot[] clothingSlots,
        Transform[] clothingItemsParents,
        CharacterPopupManager popupManager)
    {
        Debug.Log("🔍 === 시스템 상태 체크 ===");

        // 캐릭터 상태
        if (currentCharacterData != null)
        {
            Debug.Log($"✅ 현재 캐릭터: {currentCharacterData.characterName}");
        }
        else
        {
            Debug.LogWarning("❌ 현재 캐릭터: 없음");
        }

        // 의상 슬롯 상태
        if (clothingSlots != null && clothingSlots.Length > 0)
        {
            Debug.Log($"✅ 의상 슬롯: {clothingSlots.Length}개");
        }
        else
        {
            Debug.LogWarning("❌ 의상 슬롯: 없음");
        }

        // 의상 아이템 부모들 상태
        if (clothingItemsParents != null && clothingItemsParents.Length > 0)
        {
            Debug.Log($"✅ 의상 아이템 부모들: {clothingItemsParents.Length}개");
        }
        else
        {
            Debug.LogWarning("❌ 의상 아이템 부모들: 없음");
        }

        // 팝업 매니저 상태
        if (popupManager != null)
        {
            Debug.Log($"✅ 팝업 매니저: 설정됨 (활성화: {popupManager.IsPopupActive()})");
        }
        else
        {
            Debug.LogWarning("❌ 팝업 매니저: 없음");
        }

        Debug.Log("========================");
    }

    #endregion
}
