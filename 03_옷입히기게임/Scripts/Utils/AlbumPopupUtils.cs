using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// 앨범 팝업 관련 유틸리티 클래스
/// AlbumPopupManager를 지원하는 헬퍼 메서드들을 제공합니다
/// </summary>
public static class AlbumPopupUtils
{
    #region Character Data Helpers

    /// <summary>
    /// 캐릭터 이름에 넘버링을 추가합니다 (캐릭터 인덱스 우선 사용)
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="fallbackIndex">캐릭터 인덱스가 없을 때 사용할 인덱스 (0부터 시작)</param>
    /// <returns>넘버링이 추가된 이름</returns>
    public static string AddNumberingToCharacterName(CharacterData characterData, int fallbackIndex = 0)
    {
        if (characterData == null)
            return $"No.{fallbackIndex + 1} Unknown";

        // 캐릭터 데이터에 인덱스가 설정되어 있으면 사용
        if (characterData.characterIndex > 0)
        {
            return $"No.{characterData.characterIndex} {characterData.characterName}";
        }

        // 인덱스가 없으면 fallback 인덱스 사용
        return $"No.{fallbackIndex + 1} {characterData.characterName}";
    }

    /// <summary>
    /// 캐릭터 이름에 넘버링을 추가합니다 (레거시 - 배열 인덱스 기준)
    /// </summary>
    /// <param name="characterName">원본 캐릭터 이름</param>
    /// <param name="index">캐릭터 인덱스 (0부터 시작)</param>
    /// <returns>넘버링이 추가된 이름</returns>
    public static string AddNumberingToCharacterName(string characterName, int index)
    {
        if (string.IsNullOrEmpty(characterName))
            return $"No.{index + 1} Unknown";

        return $"No.{index + 1} {characterName}";
    }

    /// <summary>
    /// 캐릭터 설명이 비어있을 때 기본 텍스트를 반환합니다
    /// </summary>
    /// <param name="description">원본 설명</param>
    /// <returns>설명 또는 기본 텍스트</returns>
    public static string GetSafeDescription(string description)
    {
        if (string.IsNullOrEmpty(description))
            return "아직 정보가 없습니다.";

        return description;
    }

    /// <summary>
    /// 캐릭터 인덱스가 유효한 범위인지 확인합니다
    /// </summary>
    /// <param name="index">확인할 인덱스</param>
    /// <param name="charactersCount">전체 캐릭터 수</param>
    /// <returns>유효하면 true</returns>
    public static bool IsValidCharacterIndex(int index, int charactersCount)
    {
        return index >= 0 && index < charactersCount;
    }

    /// <summary>
    /// 캐릭터 배열에서 특정 이름의 캐릭터 인덱스를 찾습니다
    /// </summary>
    /// <param name="characters">캐릭터 배열</param>
    /// <param name="characterName">찾을 캐릭터 이름</param>
    /// <returns>찾은 인덱스, 없으면 -1</returns>
    public static int FindCharacterIndex(CharacterData[] characters, string characterName)
    {
        if (characters == null || string.IsNullOrEmpty(characterName))
            return -1;

        for (int i = 0; i < characters.Length; i++)
        {
            if (characters[i] != null && characters[i].characterName == characterName)
            {
                return i;
            }
        }

        return -1;
    }

    /// <summary>
    /// 캐릭터 배열에서 특정 인덱스 번호의 캐릭터를 찾습니다
    /// </summary>
    /// <param name="characters">캐릭터 배열</param>
    /// <param name="characterIndex">찾을 캐릭터 인덱스 (1부터 시작)</param>
    /// <returns>찾은 캐릭터 데이터, 없으면 null</returns>
    public static CharacterData FindCharacterByIndex(CharacterData[] characters, int characterIndex)
    {
        if (characters == null || characterIndex < 1)
            return null;

        for (int i = 0; i < characters.Length; i++)
        {
            if (characters[i] != null && characters[i].characterIndex == characterIndex)
            {
                return characters[i];
            }
        }

        return null;
    }

    /// <summary>
    /// 캐릭터 배열에서 특정 파일명의 캐릭터를 찾습니다
    /// </summary>
    /// <param name="characters">캐릭터 배열</param>
    /// <param name="fileName">찾을 파일명 (예: "Cha_1")</param>
    /// <returns>찾은 캐릭터 데이터, 없으면 null</returns>
    public static CharacterData FindCharacterByFileName(CharacterData[] characters, string fileName)
    {
        if (characters == null || string.IsNullOrEmpty(fileName))
            return null;

        for (int i = 0; i < characters.Length; i++)
        {
            if (characters[i] != null && characters[i].name.Equals(fileName, System.StringComparison.OrdinalIgnoreCase))
            {
                return characters[i];
            }
        }

        return null;
    }

    /// <summary>
    /// 캐릭터의 표시용 이름을 가져옵니다 (인덱스 포함)
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <returns>표시용 이름</returns>
    public static string GetCharacterDisplayName(CharacterData characterData)
    {
        if (characterData == null)
            return "Unknown Character";

        if (characterData.characterIndex > 0)
            return $"No.{characterData.characterIndex} {characterData.characterName}";
        else
            return characterData.characterName;
    }

    #endregion

    #region UI Update Helpers

    /// <summary>
    /// TextMeshPro 컴포넌트에 안전하게 텍스트를 설정합니다
    /// </summary>
    /// <param name="textComponent">텍스트 컴포넌트</param>
    /// <param name="text">설정할 텍스트</param>
    public static void SetTextSafe(TextMeshProUGUI textComponent, string text)
    {
        if (textComponent != null)
        {
            textComponent.text = text ?? "";
        }
    }

    /// <summary>
    /// Image 컴포넌트에 안전하게 스프라이트를 설정합니다
    /// </summary>
    /// <param name="imageComponent">이미지 컴포넌트</param>
    /// <param name="sprite">설정할 스프라이트</param>
    /// <param name="hideIfNull">스프라이트가 null일 때 투명하게 할지 여부</param>
    public static void SetImageSpriteSafe(Image imageComponent, Sprite sprite, bool hideIfNull = true)
    {
        if (imageComponent != null)
        {
            imageComponent.sprite = sprite;

            if (hideIfNull && sprite == null)
            {
                imageComponent.color = Color.clear;
            }
            else
            {
                imageComponent.color = Color.white;
            }
        }
    }

    /// <summary>
    /// CanvasGroup 컴포넌트에 알파값을 설정합니다
    /// </summary>
    /// <param name="canvasGroup">캔버스 그룹</param>
    /// <param name="alpha">알파값 (0-1)</param>
    public static void SetCanvasGroupAlpha(CanvasGroup canvasGroup, float alpha)
    {
        if (canvasGroup != null)
        {
            canvasGroup.alpha = Mathf.Clamp01(alpha);
        }
    }

    /// <summary>
    /// Transform의 스케일을 설정합니다
    /// </summary>
    /// <param name="transform">트랜스폼</param>
    /// <param name="scale">스케일값</param>
    public static void SetTransformScale(Transform transform, float scale)
    {
        if (transform != null)
        {
            transform.localScale = Vector3.one * scale;
        }
    }

    #endregion

    #region Animation Helpers

    /// <summary>
    /// Ease Out Cubic 커브를 계산합니다
    /// </summary>
    /// <param name="t">시간 (0-1)</param>
    /// <returns>변환된 값</returns>
    public static float EaseOutCubic(float t)
    {
        return 1f - Mathf.Pow(1f - t, 3f);
    }

    /// <summary>
    /// Ease In Cubic 커브를 계산합니다
    /// </summary>
    /// <param name="t">시간 (0-1)</param>
    /// <returns>변환된 값</returns>
    public static float EaseInCubic(float t)
    {
        return Mathf.Pow(t, 3f);
    }

    /// <summary>
    /// Ease In Out Cubic 커브를 계산합니다
    /// </summary>
    /// <param name="t">시간 (0-1)</param>
    /// <returns>변환된 값</returns>
    public static float EaseInOutCubic(float t)
    {
        return t < 0.5f
            ? 4f * t * t * t
            : 1f - Mathf.Pow(-2f * t + 2f, 3f) / 2f;
    }

    /// <summary>
    /// 부드러운 스텝 함수를 계산합니다
    /// </summary>
    /// <param name="t">시간 (0-1)</param>
    /// <returns>변환된 값</returns>
    public static float SmoothStep(float t)
    {
        return t * t * (3f - 2f * t);
    }

    #endregion

    #region Audio Helpers

    /// <summary>
    /// AudioSource에서 안전하게 사운드를 재생합니다
    /// </summary>
    /// <param name="audioSource">오디오 소스</param>
    /// <param name="audioClip">재생할 오디오 클립</param>
    /// <param name="volume">볼륨 (기본값: 1.0)</param>
    public static void PlaySoundSafe(AudioSource audioSource, AudioClip audioClip, float volume = 1.0f)
    {
        if (audioSource != null && audioClip != null)
        {
            audioSource.PlayOneShot(audioClip, volume);
        }
    }

    /// <summary>
    /// SoundManager를 통해 안전하게 사운드를 재생합니다 (SoundManager가 있는 경우)
    /// </summary>
    /// <param name="audioClip">재생할 오디오 클립</param>
    public static void PlaySoundThroughManager(AudioClip audioClip)
    {
        // SoundManager가 있으면 사용
        if (SoundManager.Instance != null && audioClip != null)
        {
            // SoundManager의 메서드를 사용해 재생
            SoundManager.Instance.PlaySFX(audioClip);
            Debug.Log($"🔊 SoundManager를 통해 사운드 재생: {audioClip.name}");
        }
        else
        {
            Debug.LogWarning($"❌ SoundManager 또는 AudioClip이 null입니다. SoundManager: {SoundManager.Instance != null}, AudioClip: {audioClip != null}");
        }
    }

    /// <summary>
    /// SoundManager를 통해 book-sfx (페이지 넘기기 사운드)를 재생합니다
    /// </summary>
    public static void PlayBookFlipSound()
    {
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayBookSFX();
            Debug.Log("🔊 book-sfx 재생 - 앨범 페이지 넘기기");
        }
        else
        {
            Debug.LogWarning("❌ SoundManager.Instance가 null입니다. book-sfx를 재생할 수 없습니다.");
        }
    }

    #endregion

    #region Navigation Helpers

    /// <summary>
    /// 순환 인덱스 계산 (다음)
    /// </summary>
    /// <param name="currentIndex">현재 인덱스</param>
    /// <param name="maxCount">최대 개수</param>
    /// <returns>다음 인덱스</returns>
    public static int GetNextIndex(int currentIndex, int maxCount)
    {
        if (maxCount <= 0) return 0;
        return (currentIndex + 1) % maxCount;
    }

    /// <summary>
    /// 순환 인덱스 계산 (이전)
    /// </summary>
    /// <param name="currentIndex">현재 인덱스</param>
    /// <param name="maxCount">최대 개수</param>
    /// <returns>이전 인덱스</returns>
    public static int GetPreviousIndex(int currentIndex, int maxCount)
    {
        if (maxCount <= 0) return 0;
        return (currentIndex - 1 + maxCount) % maxCount;
    }

    /// <summary>
    /// 인덱스를 안전한 범위로 클램프합니다
    /// </summary>
    /// <param name="index">클램프할 인덱스</param>
    /// <param name="maxCount">최대 개수</param>
    /// <returns>클램프된 인덱스</returns>
    public static int ClampIndex(int index, int maxCount)
    {
        if (maxCount <= 0) return 0;
        return Mathf.Clamp(index, 0, maxCount - 1);
    }

    #endregion

    #region Validation Helpers

    /// <summary>
    /// AlbumPopupManager가 유효하고 사용 가능한지 확인합니다
    /// </summary>
    /// <param name="albumManager">확인할 앨범 매니저</param>
    /// <returns>사용 가능하면 true</returns>
    public static bool IsAlbumManagerValid(AlbumPopupManager albumManager)
    {
        return albumManager != null;
    }

    /// <summary>
    /// 캐릭터 데이터 배열이 유효한지 확인합니다
    /// </summary>
    /// <param name="characters">확인할 캐릭터 배열</param>
    /// <returns>유효하면 true</returns>
    public static bool IsCharacterArrayValid(CharacterData[] characters)
    {
        return characters != null && characters.Length > 0;
    }

    /// <summary>
    /// UI 컴포넌트가 유효한지 확인합니다
    /// </summary>
    /// <param name="component">확인할 컴포넌트</param>
    /// <returns>유효하면 true</returns>
    public static bool IsUIComponentValid(Component component)
    {
        return component != null && component.gameObject != null;
    }

    #endregion

    #region Debug Helpers

    /// <summary>
    /// 앨범 상태를 로그로 출력합니다
    /// </summary>
    /// <param name="albumManager">앨범 매니저</param>
    /// <param name="prefix">로그 접두사</param>
    public static void LogAlbumState(AlbumPopupManager albumManager, string prefix = "")
    {
        if (albumManager == null)
        {
            Debug.LogWarning($"{prefix}AlbumPopupManager가 null입니다!");
            return;
        }

        Debug.Log($"{prefix}📚 앨범 상태:");
        Debug.Log($"{prefix}   - 열림: {albumManager.IsAlbumOpen()}");
        Debug.Log($"{prefix}   - 현재 인덱스: {albumManager.GetCurrentCharacterIndex()}");

        CharacterData currentCharacter = albumManager.GetCurrentCharacterData();
        if (currentCharacter != null)
        {
            Debug.Log($"{prefix}   - 현재 캐릭터: {currentCharacter.characterName}");
        }
    }

    /// <summary>
    /// 캐릭터 데이터 정보를 로그로 출력합니다
    /// </summary>
    /// <param name="characterData">캐릭터 데이터</param>
    /// <param name="arrayIndex">배열 인덱스</param>
    public static void LogCharacterInfo(CharacterData characterData, int arrayIndex)
    {
        if (characterData == null)
        {
            Debug.LogWarning($"캐릭터 데이터[{arrayIndex}]가 null입니다!");
            return;
        }

        Debug.Log($"👤 캐릭터[{arrayIndex}]: {characterData.characterName}");
        Debug.Log($"   - 캐릭터 인덱스: {characterData.characterIndex}");
        Debug.Log($"   - 파일명: {characterData.name}");
        Debug.Log($"   - 표시명: {GetCharacterDisplayName(characterData)}");
        Debug.Log($"   - 설명: {(string.IsNullOrEmpty(characterData.characterDescription) ? "없음" : "있음")}");
        Debug.Log($"   - 스프라이트: {(characterData.characterSprite != null ? characterData.characterSprite.name : "없음")}");
        Debug.Log($"   - 잠금: {characterData.isLocked}");
    }

    /// <summary>
    /// 모든 캐릭터의 인덱스 매핑 정보를 로그로 출력합니다
    /// </summary>
    /// <param name="characters">캐릭터 배열</param>
    public static void LogCharacterIndexMapping(CharacterData[] characters)
    {
        if (characters == null || characters.Length == 0)
        {
            Debug.LogWarning("❌ 캐릭터 데이터가 없습니다!");
            return;
        }

        Debug.Log($"📋 캐릭터 인덱스 매핑 ({characters.Length}개):");
        for (int i = 0; i < characters.Length; i++)
        {
            if (characters[i] != null)
            {
                string indexInfo = characters[i].characterIndex > 0 ? $"인덱스: {characters[i].characterIndex}" : "인덱스 없음";
                Debug.Log($"   배열[{i}] = {characters[i].characterName} ({indexInfo}, 파일: {characters[i].name})");
            }
            else
            {
                Debug.Log($"   배열[{i}] = null");
            }
        }
    }

    #endregion
}
