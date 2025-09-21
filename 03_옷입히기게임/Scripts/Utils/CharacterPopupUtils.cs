using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 캐릭터 팝업 관련 유틸리티 클래스
/// MainSceneManager에서 팝업 관련 기능들을 분리
/// </summary>
public static class CharacterPopupUtils
{
    #region Legacy Popup System

    /// <summary>
    /// 팝업창의 모든 캐릭터 스프라이트를 현재 선택된 캐릭터로 업데이트합니다
    /// </summary>
    public static void UpdatePopupCharacterSprites(CharacterData currentCharacterData,
        Image popupCharacterImage, Image popupTopImage, Image popupBottomImage,
        Image popupSocksImage, Image popupShoesImage)
    {
        if (currentCharacterData == null)
        {
            Debug.LogWarning("❌ 현재 캐릭터 데이터가 없어 팝업 스프라이트를 업데이트할 수 없습니다.");
            return;
        }

        Debug.Log($"🎭 팝업 캐릭터 스프라이트 업데이트 시작: {currentCharacterData.characterName}");

        // 각 부위별 스프라이트 로드 및 적용
        UpdatePopupCharacterImage(currentCharacterData, popupCharacterImage);
        UpdatePopupClothingImages(currentCharacterData, popupTopImage, popupBottomImage, popupSocksImage, popupShoesImage);

        Debug.Log("✅ 팝업 캐릭터 스프라이트 업데이트 완료");
    }

    /// <summary>
    /// 특정 캐릭터로 팝업 스프라이트를 업데이트합니다
    /// </summary>
    public static void UpdatePopupCharacterSprites(string characterName,
        Image popupCharacterImage, Image popupTopImage, Image popupBottomImage,
        Image popupSocksImage, Image popupShoesImage)
    {
        CharacterData characterData = FindCharacterDataByName(characterName);
        if (characterData == null)
        {
            Debug.LogWarning($"❌ 캐릭터 데이터를 찾을 수 없습니다: {characterName}");
            return;
        }

        Debug.Log($"🎭 팝업 캐릭터 스프라이트 업데이트: {characterName}");

        // 팝업 스프라이트 업데이트
        UpdatePopupCharacterImage(characterData, popupCharacterImage);
        UpdatePopupClothingImages(characterData, popupTopImage, popupBottomImage, popupSocksImage, popupShoesImage);

        Debug.Log($"✅ 팝업 캐릭터 스프라이트 업데이트 완료: {characterName}");
    }

    /// <summary>
    /// 팝업창의 메인 캐릭터 이미지를 업데이트합니다 (cha_l)
    /// </summary>
    private static void UpdatePopupCharacterImage(CharacterData characterData, Image popupCharacterImage)
    {
        if (popupCharacterImage == null || characterData == null) return;

        Sprite characterSprite = CharacterDisplayUtils.LoadLargeCharacterSprite(characterData);
        if (characterSprite == null)
        {
            characterSprite = CharacterDisplayUtils.LoadCharacterSprite(characterData);
        }

        if (characterSprite != null)
        {
            UIUtils.SetImageSprite(popupCharacterImage, characterSprite);
            Debug.Log($"✅ 팝업 캐릭터 이미지 적용: {characterSprite.name}");
        }
        else
        {
            Debug.LogWarning($"❌ {characterData.characterName}의 캐릭터 스프라이트를 찾을 수 없습니다.");
        }
    }

    /// <summary>
    /// 팝업창의 의상 이미지들을 업데이트합니다 (top, bottom, socks, shoes)
    /// CharacterData의 Large Character Clothing Sprites를 우선 사용합니다
    /// </summary>
    private static void UpdatePopupClothingImages(CharacterData characterData,
        Image popupTopImage, Image popupBottomImage, Image popupSocksImage, Image popupShoesImage)
    {
        if (characterData == null) return;

        string characterName = characterData.characterName.ToLower();

        // Top 스프라이트 로드 (CharacterData의 largeTop1Sprite 우선 사용)
        if (popupTopImage != null)
        {
            Sprite topSprite = characterData.largeTop1Sprite;
            if (topSprite == null)
            {
                // CharacterData에 없으면 기존 방식으로 로드
                topSprite = LoadClothingSprite(characterName, "top");
            }
            UIUtils.SetImageSprite(popupTopImage, topSprite);
            if (topSprite != null)
                Debug.Log($"✅ 팝업 상의 스프라이트 적용: {topSprite.name}");
        }

        // Bottom 스프라이트 로드 (CharacterData의 largeBottom1Sprite 우선 사용)
        if (popupBottomImage != null)
        {
            Sprite bottomSprite = characterData.largeBottom1Sprite;
            if (bottomSprite == null)
            {
                // CharacterData에 없으면 기존 방식으로 로드
                bottomSprite = LoadClothingSprite(characterName, "bottom");
            }
            UIUtils.SetImageSprite(popupBottomImage, bottomSprite);
            if (bottomSprite != null)
                Debug.Log($"✅ 팝업 하의 스프라이트 적용: {bottomSprite.name}");
        }

        // Socks 스프라이트 로드 (CharacterData의 largeSocksSprite 우선 사용 - 이제 선택사항)
        if (popupSocksImage != null)
        {
            Sprite socksSprite = characterData.largeSocksSprite;
            if (socksSprite == null)
            {
                // CharacterData에 없으면 기존 방식으로 로드
                socksSprite = LoadClothingSprite(characterName, "socks");
            }
            UIUtils.SetImageSprite(popupSocksImage, socksSprite);
            if (socksSprite != null)
                Debug.Log($"✅ 팝업 양말 스프라이트 적용: {socksSprite.name}");
        }

        // Shoes 스프라이트 로드 (CharacterData의 largeShoesSprite 우선 사용)
        if (popupShoesImage != null)
        {
            Sprite shoesSprite = characterData.largeShoesSprite;
            if (shoesSprite == null)
            {
                // CharacterData에 없으면 기존 방식으로 로드
                shoesSprite = LoadClothingSprite(characterName, "shoes");
            }
            UIUtils.SetImageSprite(popupShoesImage, shoesSprite);
            if (shoesSprite != null)
                Debug.Log($"✅ 팝업 신발 스프라이트 적용: {shoesSprite.name}");
        }
    }

    /// <summary>
    /// 특정 캐릭터의 의상 스프라이트를 로드합니다
    /// </summary>
    private static Sprite LoadClothingSprite(string characterName, string clothingType)
    {
        // 스프라이트 경로 생성 (예: "cha1_top", "cha2_bottom" 등)
        string spriteName = $"{characterName}_{clothingType}";

        // Resources 폴더에서 스프라이트 로드
        Sprite sprite = Resources.Load<Sprite>($"Sprites/Characters/{spriteName}");

        if (sprite == null)
        {
            // 대체 경로 시도
            sprite = Resources.Load<Sprite>($"Characters/{spriteName}");
        }

        if (sprite == null)
        {
            // 또 다른 대체 경로 시도
            sprite = Resources.Load<Sprite>(spriteName);
        }

        if (sprite == null)
        {
            Debug.LogWarning($"❌ {spriteName} 스프라이트를 찾을 수 없습니다.");
        }

        return sprite;
    }

    #endregion

    #region New Popup System

    /// <summary>
    /// 새로운 팝업 시스템으로 현재 캐릭터를 표시합니다
    /// </summary>
    public static void ShowCharacterPopup(CharacterPopupManager popupManager, CharacterData currentCharacterData)
    {
        if (popupManager != null && currentCharacterData != null)
        {
            popupManager.ShowPopupWithCharacter(currentCharacterData);
            Debug.Log($"🎭 새로운 팝업 시스템으로 캐릭터 표시: {currentCharacterData.characterName}");
        }
        else
        {
            if (popupManager == null)
                Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
            if (currentCharacterData == null)
                Debug.LogWarning("❌ 현재 캐릭터 데이터가 없습니다!");
        }
    }

    /// <summary>
    /// 새로운 팝업 시스템으로 특정 캐릭터를 표시합니다
    /// </summary>
    public static void ShowCharacterPopup(CharacterPopupManager popupManager, string characterName)
    {
        if (popupManager != null)
        {
            popupManager.ShowPopupWithCharacterName(characterName);
            Debug.Log($"🎭 새로운 팝업 시스템으로 캐릭터 표시: {characterName}");
        }
        else
        {
            Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 캐릭터 팝업을 숨깁니다
    /// </summary>
    public static void HideCharacterPopup(CharacterPopupManager popupManager)
    {
        if (popupManager != null)
        {
            popupManager.HidePopup();
            Debug.Log("🎭 캐릭터 팝업 숨김");
        }
        else
        {
            Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 캐릭터 팝업을 토글합니다
    /// </summary>
    public static void ToggleCharacterPopup(CharacterPopupManager popupManager)
    {
        if (popupManager != null)
        {
            popupManager.TogglePopup();
        }
        else
        {
            Debug.LogWarning("❌ CharacterPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 팝업 시스템이 사용 가능한지 확인합니다
    /// </summary>
    public static bool IsPopupSystemAvailable(CharacterPopupManager popupManager)
    {
        return popupManager != null;
    }

    #endregion

    #region Helper Methods

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
