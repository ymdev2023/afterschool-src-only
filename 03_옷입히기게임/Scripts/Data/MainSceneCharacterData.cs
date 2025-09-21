using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// MainScene의 캐릭터 디스플레이 관련 데이터 관리 클래스
/// </summary>
public class MainSceneCharacterData : MonoBehaviour
{
    [Header("Character Display UI")]
    [Tooltip("Large Character Sprite를 표시할 UI Image 컴포넌트")]
    public Image largeCharacterImage;

    [Tooltip("일반 Character Sprite를 표시할 UI Image 컴포넌트")]
    public Image characterImage;

    [Header("Character Display Settings")]
    [Tooltip("시작할 때 자동으로 캐릭터를 적용할지 여부")]
    public bool applyCharacterOnStart = true;

    [Tooltip("Large Character Sprite를 우선적으로 표시할지 여부")]
    public bool preferLargeSprite = true;

    [Tooltip("선택된 캐릭터가 없을 때 사용할 기본 캐릭터 번호 (1: Cha_1, 2: Cha_2, ...)")]
    public int fallbackCharacterNumber = 1;

    [Tooltip("폴백 캐릭터 사용 여부 (비활성화하면 첫 번째 캐릭터 사용)")]
    public bool useFallbackCharacter = true;

    [Header("Debug Info")]
    [Tooltip("현재 선택된 캐릭터 정보를 표시할 Text (선택사항)")]
    public Text debugCharacterNameText;

    // 캐릭터 정보 관련 private 변수들
    private CharacterData currentCharacterData;
    private Sprite currentLargeSprite;
    private Sprite currentCharacterSprite;

    /// <summary>
    /// 현재 캐릭터 데이터를 설정합니다
    /// </summary>
    public void SetCurrentCharacterData(CharacterData characterData)
    {
        currentCharacterData = characterData;
        if (characterData != null)
        {
            currentLargeSprite = characterData.largeCharacterSprite;
            currentCharacterSprite = characterData.characterSprite;
        }
    }

    /// <summary>
    /// 현재 캐릭터 데이터를 반환합니다
    /// </summary>
    public CharacterData GetCurrentCharacterData()
    {
        return currentCharacterData;
    }

    /// <summary>
    /// 현재 Large 스프라이트를 반환합니다
    /// </summary>
    public Sprite GetCurrentLargeSprite()
    {
        return currentLargeSprite;
    }

    /// <summary>
    /// 현재 캐릭터 스프라이트를 반환합니다
    /// </summary>
    public Sprite GetCurrentCharacterSprite()
    {
        return currentCharacterSprite;
    }

    /// <summary>
    /// 캐릭터 이미지 컴포넌트들이 올바르게 설정되어 있는지 확인합니다
    /// </summary>
    public bool ValidateImageComponents()
    {
        return largeCharacterImage != null || characterImage != null;
    }
}
