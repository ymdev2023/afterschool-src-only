using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

/// <summary>
/// 앨범 팝업을 관리하는 클래스
/// 캐릭터 정보를 책 형태로 표시하고 좌우 네비게이션을 제공합니다
/// </summary>
public class AlbumPopupManager : MonoBehaviour
{
    [Header("Album Popup References")]
    [Tooltip("앨범 팝업 전체 오브젝트")]
    public GameObject albumPopup;

    [Header("Navigation Buttons")]
    [Tooltip("팝업 닫기 X 버튼")]
    public Button xButton;

    [Tooltip("이전 캐릭터로 이동하는 왼쪽 화살표 버튼")]
    public Button leftArrowButton;

    [Tooltip("다음 캐릭터로 이동하는 오른쪽 화살표 버튼")]
    public Button rightArrowButton;

    [Header("Character Display")]
    [Tooltip("캐릭터 이름을 표시할 텍스트 (예: No.1 주인혜)")]
    public TextMeshProUGUI characterNameText;

    [Tooltip("캐릭터 이미지를 표시할 Image 컴포넌트 (cha_m)")]
    public Image characterImage;

    [Tooltip("캐릭터 설명을 표시할 텍스트")]
    public TextMeshProUGUI characterDescriptionText;

    [Header("Album Settings")]
    [Tooltip("앨범 오픈/클로즈 애니메이션 시간")]
    public float animationDuration = 0.5f;

    [Tooltip("페이지 전환 애니메이션 시간")]
    public float pageTransitionDuration = 0.3f;

    [Tooltip("자동으로 캐릭터 넘버링을 추가할지 여부 (No.1, No.2 등)")]
    public bool autoAddNumbering = true;

    [Header("Album Scale Settings")]
    [Tooltip("앨범 최종 크기 배율 (1.0 = 원본 크기, 1.5 = 1.5배 크기)")]
    [Range(0.5f, 3.0f)]
    public float finalScale = 1.2f;

    [Tooltip("앨범 시작 크기 배율 (애니메이션 시작 시)")]
    [Range(0.1f, 1.0f)]
    public float startScale = 0.3f;

    [Header("UI Layer Settings")]
    [Tooltip("앨범 팝업의 Canvas Sort Order (높을수록 앞에 표시, 다른 UI보다 높게 설정)")]
    public int albumCanvasSortOrder = 1000;

    [Tooltip("앨범이 열릴 때 자동으로 최상위로 올릴지 여부")]
    public bool bringToFrontOnOpen = true;

    [Header("Audio")]
    [Tooltip("페이지 넘기기 사운드")]
    public AudioClip pageFlipSound;

    [Tooltip("앨범 열기/닫기 사운드")]
    public AudioClip albumOpenCloseSound;

    // 내부 상태 변수들
    private CharacterData[] allCharacters;
    private int currentCharacterIndex = 0;
    private bool isAnimating = false;
    private bool isPopupOpen = false;

    // 컴포넌트 참조
    private CanvasGroup canvasGroup;
    private Canvas albumCanvas;
    private AudioSource audioSource;

    // 스케일 관리 변수들
    private Vector3 originalScale = Vector3.one;

    // Canvas 관리 변수들
    private int originalSortOrder = 0;

    #region Unity Lifecycle

    void Start()
    {
        InitializeAlbumPopup();
    }

    void Update()
    {
        // 필요시 여기에 다른 업데이트 로직 추가
    }

    #endregion

    #region Initialization

    /// <summary>
    /// 앨범 팝업을 초기화합니다
    /// </summary>
    private void InitializeAlbumPopup()
    {
        // 모든 캐릭터 데이터 로드
        CharacterData[] allCharacterData = CharacterDisplayUtils.LoadAllCharacterData();
        
        // 잠기지 않은 캐릭터들만 필터링
        if (allCharacterData != null)
        {
            System.Collections.Generic.List<CharacterData> unlockedCharacters = new System.Collections.Generic.List<CharacterData>();
            
            foreach (CharacterData character in allCharacterData)
            {
                if (character != null && !character.isLocked)
                {
                    unlockedCharacters.Add(character);
                }
            }
            
            allCharacters = unlockedCharacters.ToArray();
            Debug.Log($"📚 앨범 초기화 - 전체 캐릭터: {allCharacterData.Length}개, 잠금 해제된 캐릭터: {allCharacters.Length}개");
        }
        else
        {
            allCharacters = new CharacterData[0];
            Debug.LogWarning("❌ 캐릭터 데이터를 로드할 수 없습니다!");
        }

        // 컴포넌트 설정
        SetupComponents();

        // 버튼 이벤트 연결
        SetupButtonEvents();

        // 초기 상태 설정
        if (albumPopup != null)
        {
            albumPopup.SetActive(false);
            isPopupOpen = false;
        }

        Debug.Log($"📚 앨범 팝업 초기화 완료 - {allCharacters?.Length ?? 0}개 캐릭터 로드됨 (잠긴 캐릭터 제외)");
    }

    /// <summary>
    /// 필요한 컴포넌트들을 설정합니다
    /// </summary>
    private void SetupComponents()
    {
        // CanvasGroup 추가 (애니메이션용)
        if (albumPopup != null)
        {
            canvasGroup = albumPopup.GetComponent<CanvasGroup>();
            if (canvasGroup == null)
            {
                canvasGroup = albumPopup.AddComponent<CanvasGroup>();
            }

            // Canvas 컴포넌트 찾기 또는 추가
            albumCanvas = albumPopup.GetComponent<Canvas>();
            if (albumCanvas == null)
            {
                // 부모에서 Canvas 찾기
                albumCanvas = albumPopup.GetComponentInParent<Canvas>();
                if (albumCanvas == null)
                {
                    // Canvas가 없으면 추가
                    albumCanvas = albumPopup.AddComponent<Canvas>();
                    albumCanvas.overrideSorting = true;
                }
            }

            // Canvas Sort Order 설정
            if (albumCanvas != null)
            {
                originalSortOrder = albumCanvas.sortingOrder;
                Debug.Log($"📚 앨범 Canvas 발견 - 원본 Sort Order: {originalSortOrder}, 설정할 Sort Order: {albumCanvasSortOrder}");
            }

            // 원본 스케일 저장 (인스펙터에서 설정된 원본 크기)
            originalScale = albumPopup.transform.localScale;

            Debug.Log($"📚 앨범 원본 스케일 저장: {originalScale}, 설정된 최종 스케일: {finalScale}");
        }

        // AudioSource 추가 (사운드용)
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }

        // 초기 네비게이션 버튼 상태 설정 (모두 숨김)
        SetButtonVisible(leftArrowButton, false);
        SetButtonVisible(rightArrowButton, false);
    }

    /// <summary>
    /// 버튼 이벤트를 연결합니다
    /// </summary>
    private void SetupButtonEvents()
    {
        if (xButton != null)
        {
            xButton.onClick.RemoveAllListeners();
            xButton.onClick.AddListener(CloseAlbum);
        }

        if (leftArrowButton != null)
        {
            leftArrowButton.onClick.RemoveAllListeners();
            leftArrowButton.onClick.AddListener(ShowPreviousCharacter);
        }

        if (rightArrowButton != null)
        {
            rightArrowButton.onClick.RemoveAllListeners();
            rightArrowButton.onClick.AddListener(ShowNextCharacter);
        }
    }

    #endregion

    #region Public Album Control Methods

    /// <summary>
    /// 앨범을 열고 첫 번째 캐릭터를 표시합니다
    /// </summary>
    public void OpenAlbum()
    {
        OpenAlbumWithCharacter(0);
    }

    /// <summary>
    /// 특정 캐릭터로 앨범을 엽니다
    /// </summary>
    /// <param name="characterIndex">표시할 캐릭터 인덱스</param>
    public void OpenAlbumWithCharacter(int characterIndex)
    {
        // 중복 클릭 방지: 애니메이션 중이거나 이미 열려있으면 무시
        if (isAnimating || isPopupOpen || allCharacters == null || allCharacters.Length == 0)
            return;

        currentCharacterIndex = Mathf.Clamp(characterIndex, 0, allCharacters.Length - 1);

        if (albumPopup != null)
        {
            albumPopup.SetActive(true);

            // 앨범을 최상위로 올리기
            if (bringToFrontOnOpen)
            {
                BringAlbumToFront();
            }

            StartCoroutine(AnimateAlbumOpen());
        }
    }

    /// <summary>
    /// 특정 캐릭터 이름으로 앨범을 엽니다
    /// </summary>
    /// <param name="characterName">표시할 캐릭터 이름</param>
    public void OpenAlbumWithCharacterName(string characterName)
    {
        // 중복 클릭 방지
        if (isAnimating || isPopupOpen || allCharacters == null)
            return;

        for (int i = 0; i < allCharacters.Length; i++)
        {
            if (allCharacters[i] != null && allCharacters[i].characterName == characterName)
            {
                OpenAlbumWithCharacter(i);
                return;
            }
        }

        Debug.LogWarning($"❌ 캐릭터를 찾을 수 없습니다: {characterName}");
        OpenAlbum(); // 첫 번째 캐릭터로 대체
    }

    /// <summary>
    /// 현재 선택된 캐릭터로 앨범을 엽니다
    /// </summary>
    public void OpenAlbumWithCurrentCharacter()
    {
        // 중복 클릭 방지
        if (isAnimating || isPopupOpen)
            return;

        CharacterData currentCharacter = CharacterDisplayUtils.LoadSelectedCharacterData();
        if (currentCharacter != null)
        {
            OpenAlbumWithCharacterName(currentCharacter.characterName);
        }
        else
        {
            OpenAlbum();
        }
    }

    /// <summary>
    /// 앨범을 닫습니다
    /// </summary>
    public void CloseAlbum()
    {
        if (isAnimating || !isPopupOpen)
            return;

        StartCoroutine(AnimateAlbumClose());
    }

    /// <summary>
    /// 앨범이 열려있는지 확인합니다
    /// </summary>
    public bool IsAlbumOpen()
    {
        return isPopupOpen;
    }

    /// <summary>
    /// 앨범 상태를 토글합니다
    /// </summary>
    public void ToggleAlbum()
    {
        // 애니메이션 중일 때는 토글 무시
        if (isAnimating)
            return;

        if (IsAlbumOpen())
        {
            CloseAlbum();
        }
        else
        {
            OpenAlbumWithCurrentCharacter();
        }
    }

    #endregion

    #region Navigation Methods

    /// <summary>
    /// 이전 캐릭터를 표시합니다 (즉시 변경, 애니메이션 없음)
    /// </summary>
    public void ShowPreviousCharacter()
    {
        if (isAnimating || allCharacters == null || allCharacters.Length <= 1)
            return;

        int newIndex = currentCharacterIndex - 1;
        if (newIndex < 0)
            newIndex = allCharacters.Length - 1; // 순환

        // 애니메이션 없이 즉시 캐릭터 변경
        ChangeCharacterInstantly(newIndex);
    }

    /// <summary>
    /// 다음 캐릭터를 표시합니다 (즉시 변경, 애니메이션 없음)
    /// </summary>
    public void ShowNextCharacter()
    {
        if (isAnimating || allCharacters == null || allCharacters.Length <= 1)
            return;

        int newIndex = currentCharacterIndex + 1;
        if (newIndex >= allCharacters.Length)
            newIndex = 0; // 순환

        // 애니메이션 없이 즉시 캐릭터 변경
        ChangeCharacterInstantly(newIndex);
    }

    /// <summary>
    /// 특정 인덱스의 캐릭터를 표시합니다
    /// </summary>
    /// <param name="characterIndex">표시할 캐릭터 인덱스</param>
    public void ShowCharacterByIndex(int characterIndex)
    {
        if (isAnimating || allCharacters == null ||
            characterIndex < 0 || characterIndex >= allCharacters.Length)
            return;

        if (characterIndex == currentCharacterIndex)
            return; // 이미 표시 중

        bool isMovingLeft = characterIndex < currentCharacterIndex;
        StartCoroutine(AnimateCharacterChange(characterIndex, isMovingLeft));
    }

    /// <summary>
    /// 애니메이션 없이 즉시 캐릭터를 변경합니다
    /// </summary>
    private void ChangeCharacterInstantly(int newIndex)
    {
        if (newIndex < 0 || newIndex >= allCharacters.Length)
            return;

        currentCharacterIndex = newIndex;

        CharacterData characterData = allCharacters[currentCharacterIndex];
        UpdateCharacterDisplay(characterData, currentCharacterIndex);

        // SoundManager를 통한 페이지 플립 사운드 재생 (우선순위)
        if (SoundManager.Instance != null)
        {
            Debug.Log("🔊 AlbumPopupManager: SoundManager를 통한 BookSFX 재생 시도");
            SoundManager.Instance.PlayBookSFX();
        }
        // SoundManager가 없으면 로컬 AudioSource 사용
        else if (audioSource != null && pageFlipSound != null)
        {
            Debug.Log("🔊 AlbumPopupManager: 로컬 AudioSource를 통한 pageFlipSound 재생");
            audioSource.PlayOneShot(pageFlipSound);
        }
        else
        {
            Debug.LogWarning("⚠️ AlbumPopupManager: 사운드를 재생할 수 없습니다. SoundManager와 로컬 AudioSource 모두 사용할 수 없음");
        }
    }

    /// <summary>
    /// 현재 표시 중인 캐릭터 인덱스를 반환합니다
    /// </summary>
    public int GetCurrentCharacterIndex()
    {
        return currentCharacterIndex;
    }

    /// <summary>
    /// 현재 표시 중인 캐릭터 데이터를 반환합니다
    /// </summary>
    public CharacterData GetCurrentCharacterData()
    {
        if (allCharacters != null && currentCharacterIndex >= 0 && currentCharacterIndex < allCharacters.Length)
        {
            return allCharacters[currentCharacterIndex];
        }
        return null;
    }

    #endregion

    #region Character Display Methods

    /// <summary>
    /// 캐릭터 정보를 UI에 업데이트합니다
    /// </summary>
    /// <param name="characterData">표시할 캐릭터 데이터</param>
    /// <param name="characterIndex">캐릭터 인덱스 (넘버링용)</param>
    private void UpdateCharacterDisplay(CharacterData characterData, int characterIndex)
    {
        if (characterData == null)
        {
            Debug.LogWarning("❌ 업데이트할 캐릭터 데이터가 null입니다!");
            return;
        }

        try
        {
            // 캐릭터 이름 업데이트
            UpdateCharacterName(characterData, characterIndex);

            // 캐릭터 이미지 업데이트
            UpdateCharacterImage(characterData);

            // 캐릭터 설명 업데이트
            UpdateCharacterDescription(characterData);

            // 네비게이션 버튼 상태 업데이트
            UpdateNavigationButtons();

            Debug.Log($"📖 앨범 페이지 업데이트 완료: {characterData.characterName}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"❌ 캐릭터 디스플레이 업데이트 중 오류: {e.Message}");
        }
    }

    /// <summary>
    /// 캐릭터 이름을 업데이트합니다
    /// </summary>
    private void UpdateCharacterName(CharacterData characterData, int characterIndex)
    {
        // 강화된 null 체크
        if (characterNameText != null && !ReferenceEquals(characterNameText, null) && characterNameText.gameObject != null)
        {
            try
            {
                string displayName = characterData.characterName;

                if (autoAddNumbering)
                {
                    displayName = $"No.{characterIndex + 1} {characterData.characterName}";
                }

                characterNameText.text = displayName;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"❌ 캐릭터 이름 업데이트 중 오류: {e.Message}");
            }
        }
        else
        {
            Debug.LogWarning("❌ characterNameText 컴포넌트가 null이거나 파괴되었습니다!");
        }
    }

    /// <summary>
    /// 캐릭터 이미지를 업데이트합니다
    /// </summary>
    private void UpdateCharacterImage(CharacterData characterData)
    {
        // 더 강화된 null 체크
        if (characterImage != null && !ReferenceEquals(characterImage, null) && characterImage.gameObject != null)
        {
            try
            {
                Sprite characterSprite = CharacterDisplayUtils.LoadCharacterSprite(characterData);
                if (characterSprite != null)
                {
                    characterImage.sprite = characterSprite;
                    characterImage.color = Color.white;
                }
                else
                {
                    // 스프라이트가 없으면 투명하게
                    characterImage.color = Color.clear;
                    Debug.LogWarning($"❌ {characterData.characterName}의 캐릭터 스프라이트가 없습니다!");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"❌ 캐릭터 이미지 업데이트 중 오류: {e.Message}");
            }
        }
        else
        {
            Debug.LogWarning("❌ characterImage 컴포넌트가 null이거나 파괴되었습니다!");
        }
    }

    /// <summary>
    /// 캐릭터 설명을 업데이트합니다
    /// </summary>
    private void UpdateCharacterDescription(CharacterData characterData)
    {
        // 강화된 null 체크
        if (characterDescriptionText != null && !ReferenceEquals(characterDescriptionText, null) && characterDescriptionText.gameObject != null)
        {
            try
            {
                string description = characterData.characterDescription;

                if (string.IsNullOrEmpty(description))
                {
                    description = "아직 정보가 없습니다.";
                }

                characterDescriptionText.text = description;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"❌ 캐릭터 설명 업데이트 중 오류: {e.Message}");
            }
        }
        else
        {
            Debug.LogWarning("❌ characterDescriptionText 컴포넌트가 null이거나 파괴되었습니다!");
        }
    }

    /// <summary>
    /// 네비게이션 버튼들의 표시/숨김 상태를 업데이트합니다
    /// </summary>
    private void UpdateNavigationButtons()
    {
        if (allCharacters == null || allCharacters.Length == 0)
        {
            // 캐릭터가 없으면 모든 네비게이션 버튼 숨김
            SetButtonVisible(leftArrowButton, false);
            SetButtonVisible(rightArrowButton, false);
            return;
        }

        // 왼쪽 화살표 버튼 (이전 캐릭터)
        // 첫 번째 캐릭터가 아니면 표시
        bool showLeftArrow = currentCharacterIndex > 0;
        SetButtonVisible(leftArrowButton, showLeftArrow);

        // 오른쪽 화살표 버튼 (다음 캐릭터)
        // 마지막 캐릭터가 아니면 표시
        bool showRightArrow = currentCharacterIndex < allCharacters.Length - 1;
        SetButtonVisible(rightArrowButton, showRightArrow);

        Debug.Log($"🔄 네비게이션 버튼 업데이트 - 좌:{showLeftArrow}, 우:{showRightArrow} (현재:{currentCharacterIndex + 1}/{allCharacters.Length})");
    }

    /// <summary>
    /// 버튼의 표시/숨김 상태를 안전하게 설정합니다
    /// </summary>
    /// <param name="button">대상 버튼</param>
    /// <param name="visible">표시할지 여부</param>
    private void SetButtonVisible(Button button, bool visible)
    {
        if (button != null && button.gameObject != null)
        {
            button.gameObject.SetActive(visible);
        }
    }

    #endregion

    #region Animation Methods

    /// <summary>
    /// 앨범 열기 애니메이션
    /// </summary>
    private IEnumerator AnimateAlbumOpen()
    {
        isAnimating = true;

        // 사운드 재생
        PlaySound(albumOpenCloseSound);

        // 초기 상태 설정 - 원본 스케일을 기준으로 시작 크기 계산
        if (canvasGroup != null)
        {
            canvasGroup.alpha = 0f;
            canvasGroup.transform.localScale = originalScale * startScale;
        }

        // 캐릭터 정보 즉시 업데이트
        if (allCharacters != null && currentCharacterIndex < allCharacters.Length)
        {
            UpdateCharacterDisplay(allCharacters[currentCharacterIndex], currentCharacterIndex);
        }

        // 페이드 인 + 스케일 애니메이션
        float elapsedTime = 0f;
        while (elapsedTime < animationDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / animationDuration;

            // Ease out curve
            float easedProgress = 1f - Mathf.Pow(1f - progress, 3f);

            if (canvasGroup != null && !ReferenceEquals(canvasGroup, null) && canvasGroup.gameObject != null)
            {
                canvasGroup.alpha = easedProgress;
                canvasGroup.transform.localScale = Vector3.Lerp(originalScale * startScale, originalScale * finalScale, easedProgress);
            }
            else
            {
                // CanvasGroup이 파괴되었으면 애니메이션 중단
                Debug.LogWarning("❌ CanvasGroup이 파괴되어 애니메이션을 중단합니다!");
                break;
            }

            yield return null;
        }

        // 최종 상태 보장 - 원본 스케일을 기준으로 최종 크기 설정
        if (canvasGroup != null)
        {
            canvasGroup.alpha = 1f;
            canvasGroup.transform.localScale = originalScale * finalScale;
        }

        isPopupOpen = true;
        isAnimating = false;

        Debug.Log("📚 앨범 열기 완료");
    }

    /// <summary>
    /// 앨범 닫기 애니메이션
    /// </summary>
    private IEnumerator AnimateAlbumClose()
    {
        isAnimating = true;

        // 사운드 재생
        PlaySound(albumOpenCloseSound);

        // 페이드 아웃 + 스케일 애니메이션
        float elapsedTime = 0f;
        while (elapsedTime < animationDuration)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / animationDuration;

            // Ease in curve
            float easedProgress = Mathf.Pow(progress, 3f);

            if (canvasGroup != null && !ReferenceEquals(canvasGroup, null) && canvasGroup.gameObject != null)
            {
                canvasGroup.alpha = 1f - easedProgress;
                canvasGroup.transform.localScale = Vector3.Lerp(originalScale * finalScale, originalScale * startScale, easedProgress);
            }
            else
            {
                // CanvasGroup이 파괴되었으면 애니메이션 중단
                Debug.LogWarning("❌ CanvasGroup이 파괴되어 닫기 애니메이션을 중단합니다!");
                break;
            }

            yield return null;
        }

        // 최종 상태 설정
        if (albumPopup != null)
        {
            albumPopup.SetActive(false);
        }

        // Canvas Sort Order 복원
        RestoreAlbumCanvasOrder();

        isPopupOpen = false;
        isAnimating = false;

        Debug.Log("📚 앨범 닫기 완료");
    }

    /// <summary>
    /// 캐릭터 변경 애니메이션
    /// </summary>
    /// <param name="newCharacterIndex">새 캐릭터 인덱스</param>
    /// <param name="isMovingLeft">왼쪽으로 이동하는지 여부</param>
    private IEnumerator AnimateCharacterChange(int newCharacterIndex, bool isMovingLeft)
    {
        isAnimating = true;

        // SoundManager를 통한 페이지 넘김 사운드 재생 (우선순위)
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayBookSFX();
        }
        // SoundManager가 없으면 로컬 사운드 재생
        else
        {
            PlaySound(pageFlipSound);
        }

        // 현재 페이지 페이드 아웃
        float elapsedTime = 0f;
        while (elapsedTime < pageTransitionDuration * 0.5f)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / (pageTransitionDuration * 0.5f);

            if (canvasGroup != null)
            {
                canvasGroup.alpha = 1f - progress;
            }

            yield return null;
        }

        // 캐릭터 인덱스 업데이트 및 정보 갱신
        currentCharacterIndex = newCharacterIndex;
        if (allCharacters != null && currentCharacterIndex < allCharacters.Length)
        {
            UpdateCharacterDisplay(allCharacters[currentCharacterIndex], currentCharacterIndex);
        }

        // 새 페이지 페이드 인
        elapsedTime = 0f;
        while (elapsedTime < pageTransitionDuration * 0.5f)
        {
            elapsedTime += Time.deltaTime;
            float progress = elapsedTime / (pageTransitionDuration * 0.5f);

            if (canvasGroup != null)
            {
                canvasGroup.alpha = progress;
            }

            yield return null;
        }

        // 최종 상태 보장
        if (canvasGroup != null)
        {
            canvasGroup.alpha = 1f;
        }

        isAnimating = false;

        Debug.Log($"📖 캐릭터 변경 완료: {allCharacters[currentCharacterIndex].characterName}");
    }

    #endregion

    #region Audio Methods

    /// <summary>
    /// 사운드를 재생합니다
    /// </summary>
    /// <param name="audioClip">재생할 오디오 클립</param>
    private void PlaySound(AudioClip audioClip)
    {
        if (audioSource != null && audioClip != null)
        {
            audioSource.PlayOneShot(audioClip);
        }
    }

    #endregion

    #region Button Event Handlers

    /// <summary>
    /// X 버튼 클릭 핸들러
    /// </summary>
    public void OnXButtonClick()
    {
        CloseAlbum();
    }

    /// <summary>
    /// 왼쪽 화살표 버튼 클릭 핸들러
    /// </summary>
    public void OnLeftArrowClick()
    {
        ShowPreviousCharacter();
    }

    /// <summary>
    /// 오른쪽 화살표 버튼 클릭 핸들러
    /// </summary>
    public void OnRightArrowClick()
    {
        ShowNextCharacter();
    }

    #endregion

    #region Utility Methods

    /// <summary>
    /// 앨범 데이터를 새로고침합니다
    /// </summary>
    public void RefreshAlbumData()
    {
        // 모든 캐릭터 데이터 로드
        CharacterData[] allCharacterData = CharacterDisplayUtils.LoadAllCharacterData();
        
        // 잠기지 않은 캐릭터들만 필터링
        if (allCharacterData != null)
        {
            System.Collections.Generic.List<CharacterData> unlockedCharacters = new System.Collections.Generic.List<CharacterData>();
            
            foreach (CharacterData character in allCharacterData)
            {
                if (character != null && !character.isLocked)
                {
                    unlockedCharacters.Add(character);
                }
            }
            
            allCharacters = unlockedCharacters.ToArray();
            Debug.Log($"📚 앨범 새로고침 - 전체 캐릭터: {allCharacterData.Length}개, 잠금 해제된 캐릭터: {allCharacters.Length}개");
        }
        else
        {
            allCharacters = new CharacterData[0];
            Debug.LogWarning("❌ 캐릭터 데이터를 로드할 수 없습니다!");
        }

        // 현재 인덱스가 범위를 벗어나면 조정
        if (allCharacters != null && currentCharacterIndex >= allCharacters.Length)
        {
            currentCharacterIndex = Mathf.Max(0, allCharacters.Length - 1);
        }

        // 현재 표시 중이면 업데이트
        if (isPopupOpen && !isAnimating)
        {
            UpdateCharacterDisplay(allCharacters[currentCharacterIndex], currentCharacterIndex);
        }

        Debug.Log($"📚 앨범 데이터 새로고침 완료 - {allCharacters?.Length ?? 0}개 캐릭터 (잠긴 캐릭터 제외)");
    }

    /// <summary>
    /// 디버그 정보를 출력합니다
    /// </summary>
    public void LogAlbumStatus()
    {
        Debug.Log($"📚 === 앨범 상태 ===");
        Debug.Log($"   - 열림 상태: {isPopupOpen}");
        Debug.Log($"   - 애니메이션 중: {isAnimating}");
        Debug.Log($"   - 현재 캐릭터 인덱스: {currentCharacterIndex}");
        Debug.Log($"   - 전체 캐릭터 수: {allCharacters?.Length ?? 0}");
        Debug.Log($"   - Canvas Sort Order: {(albumCanvas != null ? albumCanvas.sortingOrder.ToString() : "없음")}");

        if (allCharacters != null && currentCharacterIndex < allCharacters.Length)
        {
            Debug.Log($"   - 현재 캐릭터: {allCharacters[currentCharacterIndex].characterName}");
        }
        Debug.Log($"===================");
    }

    #endregion

    #region Canvas Management Methods

    /// <summary>
    /// 앨범을 최상위로 올립니다
    /// </summary>
    private void BringAlbumToFront()
    {
        if (albumCanvas != null)
        {
            albumCanvas.sortingOrder = albumCanvasSortOrder;
            Debug.Log($"📚 앨범을 최상위로 올림 - Sort Order: {albumCanvasSortOrder}");
        }
        else
        {
            Debug.LogWarning("❌ 앨범 Canvas를 찾을 수 없어 최상위로 올리기 실패");
        }
    }

    /// <summary>
    /// 앨범 Canvas의 Sort Order를 원래대로 복원합니다
    /// </summary>
    private void RestoreAlbumCanvasOrder()
    {
        if (albumCanvas != null)
        {
            albumCanvas.sortingOrder = originalSortOrder;
            Debug.Log($"📚 앨범 Canvas Sort Order 복원 - Sort Order: {originalSortOrder}");
        }
    }

    /// <summary>
    /// 앨범 Canvas의 Sort Order를 수동으로 설정합니다
    /// </summary>
    /// <param name="sortOrder">설정할 Sort Order 값</param>
    public void SetAlbumCanvasSortOrder(int sortOrder)
    {
        if (albumCanvas != null)
        {
            albumCanvas.sortingOrder = sortOrder;
            Debug.Log($"📚 앨범 Canvas Sort Order 설정 - Sort Order: {sortOrder}");
        }
        else
        {
            Debug.LogWarning("❌ 앨범 Canvas를 찾을 수 없어 Sort Order 설정 실패");
        }
    }

    /// <summary>
    /// 현재 앨범 Canvas의 Sort Order를 반환합니다
    /// </summary>
    /// <returns>현재 Sort Order 값, Canvas가 없으면 -1</returns>
    public int GetCurrentCanvasSortOrder()
    {
        return albumCanvas != null ? albumCanvas.sortingOrder : -1;
    }

    #endregion
}
