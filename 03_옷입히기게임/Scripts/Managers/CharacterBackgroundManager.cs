using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// 캐릭터별 배경색을 관리하는 매니저 클래스
/// 캐릭터가 변경될 때 해당 캐릭터의 상징색으로 배경을 변경합니다.
/// </summary>
public class CharacterBackgroundManager : MonoBehaviour
{
    [Header("Background Components")]
    [Tooltip("색상을 변경할 BackgroundScrollerUI 컴포넌트")]
    public BackgroundScrollerUI backgroundScroller;

    [Header("Settings")]
    [Tooltip("자동으로 BackgroundScrollerUI를 찾을지 여부")]
    public bool autoFindBackgroundScroller = true;

    [Tooltip("디버그 로그 출력 여부")]
    public bool enableDebugLogging = true;

    private void Start()
    {
        // MainScene에서만 작동하도록 체크
        if (!SceneTypeDetector.IsMainScene())
        {
            if (enableDebugLogging)
            {
                Debug.Log($"🚫 현재 씬({SceneTypeDetector.GetCurrentSceneName()})은 MainScene이 아니므로 CharacterBackgroundManager가 비활성화됩니다.");
            }
            gameObject.SetActive(false);
            return;
        }

        if (enableDebugLogging)
        {
            Debug.Log($"✅ MainScene에서 CharacterBackgroundManager 활성화됨");
        }

        // BackgroundScrollerUI 자동 검색
        if (autoFindBackgroundScroller && backgroundScroller == null)
        {
            backgroundScroller = FindFirstObjectByType<BackgroundScrollerUI>();
            
            if (backgroundScroller != null && enableDebugLogging)
            {
                Debug.Log($"🔍 BackgroundScrollerUI 자동 검색 성공: {backgroundScroller.gameObject.name}");
            }
        }

        // 현재 선택된 캐릭터로 배경색 초기화
        InitializeBackgroundWithCurrentCharacter();
    }

    /// <summary>
    /// 현재 선택된 캐릭터의 색상으로 배경을 초기화합니다
    /// </summary>
    private void InitializeBackgroundWithCurrentCharacter()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            int currentCharacterNumber = ClothingSpriteManager.Instance.currentCharacterNumber;
            ChangeBackgroundForCharacter(currentCharacterNumber);
        }
    }

    /// <summary>
    /// 지정된 캐릭터 번호에 해당하는 색상으로 배경을 변경합니다
    /// </summary>
    /// <param name="characterNumber">캐릭터 번호 (1, 2, 3, ...)</param>
    public void ChangeBackgroundForCharacter(int characterNumber)
    {
        if (enableDebugLogging)
        {
            Debug.Log($"🌈 ChangeBackgroundForCharacter({characterNumber}) 시작");
        }

        if (backgroundScroller == null)
        {
            Debug.LogWarning("⚠️ BackgroundScrollerUI가 설정되지 않았습니다!");
            
            // BackgroundScrollerUI 다시 찾기 시도
            backgroundScroller = FindFirstObjectByType<BackgroundScrollerUI>();
            if (backgroundScroller != null)
            {
                Debug.Log($"🔍 BackgroundScrollerUI 재검색 성공: {backgroundScroller.gameObject.name}");
            }
            else
            {
                Debug.LogError("❌ BackgroundScrollerUI를 찾을 수 없습니다! 배경색 변경 불가!");
                return;
            }
        }

        // CharacterData 찾기
        CharacterData characterData = GetCharacterDataByNumber(characterNumber);
        if (characterData != null)
        {
            if (enableDebugLogging)
            {
                Debug.Log($"📊 캐릭터 데이터 발견: {characterData.characterName}, 상징색: {characterData.characterColor}");
            }

            // 캐릭터 상징색으로 배경 변경
            backgroundScroller.SetCharacterColor(characterData.characterColor);
            
            if (enableDebugLogging)
            {
                Debug.Log($"🎨 캐릭터 {characterNumber}번({characterData.characterName})의 상징색으로 배경 변경 호출: {characterData.characterColor}");
            }
            
            // 변경 후 검증
            StartCoroutine(VerifyBackgroundChange(characterData.characterColor));
        }
        else
        {
            Debug.LogWarning($"⚠️ 캐릭터 {characterNumber}번의 CharacterData를 찾을 수 없습니다!");
            
            // 모든 CharacterData 출력해서 디버깅
            if (enableDebugLogging)
            {
                CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
                Debug.Log($"🔍 사용 가능한 CharacterData들 ({allCharacters.Length}개):");
                for (int i = 0; i < allCharacters.Length; i++)
                {
                    if (allCharacters[i] != null)
                    {
                        Debug.Log($"   [{i}] {allCharacters[i].name} - {allCharacters[i].characterName}");
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// 배경색 변경이 실제로 적용되었는지 확인합니다
    /// </summary>
    private System.Collections.IEnumerator VerifyBackgroundChange(Color expectedColor)
    {
        yield return new WaitForEndOfFrame(); // 프레임 끝까지 대기
        
        if (backgroundScroller != null && enableDebugLogging)
        {
            Debug.Log($"🔍 배경색 변경 검증 - 예상 색상: {expectedColor}");
            
            // BackgroundScrollerUI의 RawImage 직접 확인
            RawImage rawImage = backgroundScroller.GetComponent<RawImage>();
            if (rawImage != null)
            {
                Debug.Log($"🔍 실제 RawImage 색상: {rawImage.color}");
                bool isColorMatch = Mathf.Approximately(expectedColor.r, rawImage.color.r) && 
                                   Mathf.Approximately(expectedColor.g, rawImage.color.g) && 
                                   Mathf.Approximately(expectedColor.b, rawImage.color.b);
                Debug.Log($"🔍 색상 매치 여부: {isColorMatch}");
            }
            else
            {
                Debug.LogWarning("🔍 BackgroundScrollerUI에서 RawImage를 찾을 수 없습니다!");
            }
        }
    }

    /// <summary>
    /// 캐릭터 번호로 CharacterData를 찾습니다
    /// </summary>
    /// <param name="characterNumber">캐릭터 번호</param>
    /// <returns>해당하는 CharacterData 또는 null</returns>
    private CharacterData GetCharacterDataByNumber(int characterNumber)
    {
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
        
        // 먼저 파일명으로 찾기 (Cha_1, Cha_2, Cha_3 등)
        foreach (CharacterData charData in allCharacters)
        {
            if (charData != null && charData.name == $"Cha_{characterNumber}")
            {
                return charData;
            }
        }

        // 파일명으로 찾지 못했으면 배열 인덱스로 찾기 (characterNumber - 1)
        int arrayIndex = characterNumber - 1;
        if (arrayIndex >= 0 && arrayIndex < allCharacters.Length && allCharacters[arrayIndex] != null)
        {
            return allCharacters[arrayIndex];
        }

        return null;
    }

    /// <summary>
    /// 배경색을 기본색으로 복원합니다
    /// </summary>
    public void ResetBackgroundToDefault()
    {
        if (backgroundScroller != null)
        {
            backgroundScroller.ResetToDefaultColor();
            
            if (enableDebugLogging)
            {
                Debug.Log("🔄 배경색이 기본색으로 복원되었습니다.");
            }
        }
    }

    /// <summary>
    /// ClothingSpriteManager의 캐릭터 변경 이벤트를 받아서 배경색을 변경합니다
    /// </summary>
    public void OnCharacterChanged(int newCharacterNumber)
    {
        if (enableDebugLogging)
        {
            Debug.Log($"🎨🎨🎨 CharacterBackgroundManager.OnCharacterChanged({newCharacterNumber}) 호출됨!");
        }
        
        ChangeBackgroundForCharacter(newCharacterNumber);
        
        if (enableDebugLogging)
        {
            Debug.Log($"🎨🎨🎨 CharacterBackgroundManager.OnCharacterChanged({newCharacterNumber}) 완료!");
        }
    }

    /// <summary>
    /// 수동으로 특정 색상으로 배경을 설정합니다
    /// </summary>
    /// <param name="color">설정할 색상</param>
    public void SetBackgroundColor(Color color)
    {
        if (backgroundScroller != null)
        {
            backgroundScroller.SetPatternColor(color);
            
            if (enableDebugLogging)
            {
                Debug.Log($"🎨 배경색을 수동으로 설정: {color}");
            }
        }
    }

    /// <summary>
    /// 현재 배경 색상을 반환합니다
    /// </summary>
    /// <returns>현재 배경 색상</returns>
    public Color GetCurrentBackgroundColor()
    {
        if (backgroundScroller != null)
        {
            return backgroundScroller.GetCurrentPatternColor();
        }
        
        return Color.white;
    }

    /// <summary>
    /// 컨텍스트 메뉴: 현재 캐릭터 색상으로 배경 업데이트
    /// </summary>
    [ContextMenu("Update Background with Current Character")]
    public void UpdateBackgroundWithCurrentCharacter()
    {
        InitializeBackgroundWithCurrentCharacter();
    }

    /// <summary>
    /// 컨텍스트 메뉴: 배경색을 기본색으로 복원
    /// </summary>
    [ContextMenu("Reset Background to Default")]
    public void ResetBackground()
    {
        ResetBackgroundToDefault();
    }
}
