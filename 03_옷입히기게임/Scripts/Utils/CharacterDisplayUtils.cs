using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 캐릭터 표시 관련 유틸리티 클래스
/// </summary>
public static class CharacterDisplayUtils
{
    /// <summary>
    /// 캐릭터 스프라이트를 UI 이미지에 적용합니다
    /// </summary>
    public static void ApplyCharacterSprite(Image targetImage, Sprite sprite, bool setActive = true)
    {
        if (targetImage != null && sprite != null)
        {
            targetImage.sprite = sprite;
            targetImage.SetNativeSize(); // native size 적용
            targetImage.gameObject.SetActive(setActive);
            Debug.Log($"{targetImage.name}에 {sprite.name} 스프라이트 적용");
        }
        else if (targetImage != null)
        {
            targetImage.gameObject.SetActive(false);
            Debug.Log($"{targetImage.name} 비활성화 (스프라이트 없음)");
        }
    }

    /// <summary>
    /// 캐릭터 데이터에서 적절한 스프라이트를 선택합니다
    /// </summary>
    public static Sprite SelectBestSprite(CharacterData characterData, bool preferLarge = true)
    {
        if (characterData == null) return null;

        if (preferLarge && characterData.largeCharacterSprite != null)
        {
            return characterData.largeCharacterSprite;
        }
        else if (characterData.characterSprite != null)
        {
            return characterData.characterSprite;
        }
        else if (characterData.largeCharacterSprite != null)
        {
            return characterData.largeCharacterSprite;
        }

        return null;
    }

    /// <summary>
    /// GameObject가 항상 활성화 상태를 유지하도록 보장합니다
    /// </summary>
    public static void EnsureGameObjectActive(GameObject target, string objectName = "Object")
    {
        if (target != null && !target.activeInHierarchy)
        {
            target.SetActive(true);
            Debug.Log($"🔧 {objectName}를 다시 활성화했습니다!");
        }
    }

    /// <summary>
    /// 선택된 캐릭터 데이터를 로드합니다 (SelectSceneManager에서)
    /// </summary>
    public static CharacterData LoadSelectedCharacterData()
    {
        // 1단계: SelectSceneManager의 static 메서드로 선택된 캐릭터 가져오기
        try
        {
            CharacterData selectedData = SelectSceneManager.GetSelectedCharacterData();
            if (selectedData != null)
            {
                Debug.Log($"✅ SelectScene Static에서 선택된 캐릭터 로드: {selectedData.characterName}");
                return selectedData;
            }
        }
        catch (System.Exception e)
        {
            Debug.LogWarning($"SelectSceneManager Static 접근 실패: {e.Message}");
        }

        // 2단계: PlayerPrefs에서 선택된 캐릭터 이름으로 찾기
        string selectedCharacterName = PlayerPrefs.GetString("SelectedCharacterName", "");
        if (!string.IsNullOrEmpty(selectedCharacterName))
        {
            Debug.Log($"🔍 PlayerPrefs에서 선택된 캐릭터 이름 발견: {selectedCharacterName}");

            CharacterData[] allCharacters = LoadAllCharacterData();
            if (allCharacters != null)
            {
                foreach (CharacterData character in allCharacters)
                {
                    if (character != null && character.characterName == selectedCharacterName)
                    {
                        Debug.Log($"✅ PlayerPrefs에서 선택된 캐릭터 로드: {character.characterName}");
                        return character;
                    }
                }
                Debug.LogWarning($"⚠️ PlayerPrefs의 캐릭터 이름 '{selectedCharacterName}'에 해당하는 캐릭터를 찾을 수 없음");
            }
        }
        else
        {
            Debug.LogWarning("⚠️ PlayerPrefs에도 선택된 캐릭터가 없습니다.");
        }

        // 3단계: 선택된 캐릭터가 없으므로 null을 반환하여 MainSceneManager의 fallback 로직이 작동하도록 함
        Debug.LogWarning("❌ 선택된 캐릭터를 찾을 수 없습니다. MainSceneManager의 fallback 로직을 사용합니다.");
        return null;
    }

    /// <summary>
    /// 캐릭터 데이터에서 Large 스프라이트를 로드합니다
    /// </summary>
    public static Sprite LoadLargeCharacterSprite(CharacterData characterData)
    {
        if (characterData != null && characterData.largeCharacterSprite != null)
        {
            return characterData.largeCharacterSprite;
        }
        return null;
    }

    /// <summary>
    /// 캐릭터 데이터에서 일반 스프라이트를 로드합니다
    /// </summary>
    public static Sprite LoadCharacterSprite(CharacterData characterData)
    {
        if (characterData != null && characterData.characterSprite != null)
        {
            return characterData.characterSprite;
        }
        return null;
    }

    /// <summary>
    /// 모든 캐릭터 데이터를 로드합니다
    /// </summary>
    public static CharacterData[] LoadAllCharacterData()
    {
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
        Debug.Log($"전체 {allCharacters.Length}개의 캐릭터 데이터 로드됨");
        return allCharacters;
    }

    /// <summary>
    /// Resources에서 기본 캐릭터 데이터를 로드합니다
    /// </summary>
    public static CharacterData LoadDefaultCharacterData()
    {
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");

        if (allCharacters.Length > 0)
        {
            Debug.Log($"기본 캐릭터 로드: {allCharacters[0].characterName}");
            return allCharacters[0];
        }

        Debug.LogWarning("기본 캐릭터 데이터를 찾을 수 없습니다!");
        return null;
    }

    /// <summary>
    /// Resources에서 기본 스프라이트를 로드합니다
    /// </summary>
    public static Sprite LoadDefaultSprite()
    {
        Sprite[] allSprites = Resources.LoadAll<Sprite>("Sprites");

        if (allSprites.Length > 0)
        {
            Debug.Log($"기본 스프라이트 로드: {allSprites[0].name}");
            return allSprites[0];
        }

        Debug.LogWarning("기본 스프라이트를 찾을 수 없습니다!");
        return null;
    }

    /// <summary>
    /// 선택된 캐릭터 데이터를 모두 지웁니다 (fallback 시스템 테스트용)
    /// </summary>
    public static void ClearSelectedCharacterData()
    {
        // SelectSceneManager의 static 변수 지우기
        try
        {
            var field = typeof(SelectSceneManager).GetField("selectedCharacterData",
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            if (field != null)
            {
                field.SetValue(null, null);
                Debug.Log("🗑️ SelectSceneManager.selectedCharacterData 지웠습니다");
            }
        }
        catch (System.Exception e)
        {
            Debug.LogWarning($"SelectSceneManager static 변수 지우기 실패: {e.Message}");
        }

        // PlayerPrefs 지우기
        if (PlayerPrefs.HasKey("SelectedCharacterName"))
        {
            PlayerPrefs.DeleteKey("SelectedCharacterName");
            Debug.Log("🗑️ PlayerPrefs.SelectedCharacterName 지웠습니다");
        }

        if (PlayerPrefs.HasKey("SelectedCharacterSpriteName"))
        {
            PlayerPrefs.DeleteKey("SelectedCharacterSpriteName");
            Debug.Log("🗑️ PlayerPrefs.SelectedCharacterSpriteName 지웠습니다");
        }

        PlayerPrefs.Save();
        Debug.Log("✅ 선택된 캐릭터 데이터를 모두 지웠습니다. 이제 fallback 시스템이 작동합니다!");
    }
}
