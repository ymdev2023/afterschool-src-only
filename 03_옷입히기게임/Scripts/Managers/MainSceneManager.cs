using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;
using DG.Tweening;

/// <summary>
/// 메인 씬의 핵심 기능만 담당하는 최적화된 매니저
/// </summary>
public class MainSceneManager : MonoBehaviour
{
    [Header("Character Display")]
    public Image largeCharacterImage;
    public Image characterImage;
    public bool applyCharacterOnStart = true;
    public bool preferLargeSprite = true;
    public int fallbackCharacterNumber = 1;
    public bool useFallbackCharacter = true;

    [Header("Clothing System")]
    public Transform chaLargeTransform;
    public Transform topSlot;
    public Transform socksSlot;
    public Transform shoesSlot;
    public Transform bottomSlot;
    public Transform accessory1Slot; 
    public Transform accessory2Slot; 
    public float snapDistance = 600f; // 500f에서 600f로 증가


    [Header("Popup Managers")]
    public CharacterPopupManager characterPopupManager;
    public GameObject albumPopupManagerObject;

    [Header("Validation")]
    public TextMeshProUGUI validationMessageText;
    public bool autoValidateClothing = false;
    public float messageDisplayTime = 3f;

    [Header("Complete Popup")]
    [Tooltip("완료 팝업 GameObject")]
    public GameObject completePopup;
    [Tooltip("DONE 버튼")]
    public Button doneButton;
    [Tooltip("완료 애니메이션 지속 시간")]
    public float completeAnimationDuration = 1f;

    [Header("Complete Popup UI Elements")]
    [Tooltip("언락 메시지 텍스트 (예: 이제 No.2 천사라의 등교 준비를 도울 수 있습니다...)")]
    public TextMeshProUGUI unlockMessageText;
    [Tooltip("언락된 캐릭터 이름 텍스트 (예: No.2 천사라)")]
    public TextMeshProUGUI unlockedCharacterNameText;
    [Tooltip("언락된 캐릭터 스프라이트를 표시할 Image")]
    public Image unlockedCharacterImage;

    [Header("Stage Popup UI Elements")]
    [Tooltip("현재 캐릭터 번호를 표시할 텍스트 (예: No.1)")]
    public TextMeshProUGUI stagePopupCharacterNumberText;
    [Tooltip("현재 캐릭터 이름을 표시할 텍스트 (예: 주인혜)")]
    public TextMeshProUGUI stagePopupCharacterNameText;

    // Private variables
    private CharacterData currentCharacterData;
    private Sprite currentLargeSprite;
    private Sprite currentCharacterSprite;
    private ClothingSlot[] clothingSlots;
    
    // Additional variables for compatibility with backup code
    public TextMeshProUGUI debugCharacterNameText;
    public Transform[] clothingItemsParents;
    private DragAndDropItem currentDraggedItem;
    
    // 서랍 상태 추적
    private bool isDrawerOpen = false;
    
    // 드래그 시스템 초기화 상태 추적
    private bool isDragSystemEnabled = false;
    
    [Header("Initialization Settings")]
    [Tooltip("씬 시작 후 드래그를 활성화하기까지 대기 시간 (초)")]
    public float dragEnableDelay = 2f;

    #region Unity Lifecycle

    void Start()
    {
        // cha_l 오브젝트 활성화 보장
        EnsureChaLargeActive();

        // 옷입히기 시스템 초기화
        clothingSlots = ClothingUtils.FindAllClothingSlots();
        // Debug.Log($"🎽 의상 슬롯 초기화 완료: {(clothingSlots != null ? clothingSlots.Length : 0)}개 슬롯 발견");
        
        if (clothingSlots != null)
        {
            // 찾은 모든 슬롯 타입 출력 (디버깅용)
            string allSlotTypes = "";
            for (int i = 0; i < clothingSlots.Length; i++)
            {
                if (clothingSlots[i] != null)
                {
                    allSlotTypes += $"{clothingSlots[i].GetSlotType()}({clothingSlots[i].name})";
                    if (i < clothingSlots.Length - 1) allSlotTypes += ", ";
                }
            }
            // Debug.Log($"🔍 발견된 슬롯 타입들: {allSlotTypes}");
            
            for (int i = 0; i < clothingSlots.Length; i++)
            {
                if (clothingSlots[i] != null)
                {
                    // 슬롯별 스냅 거리 설정
                    float slotSnapDistance = snapDistance;
                    string slotType = clothingSlots[i].GetSlotType().ToLower();
                    
                    if (slotType == "top")
                    {
                        slotSnapDistance = snapDistance * 1.5f; // 상의는 1.5배 더 넓게
                    }
                    else if (slotType == "socks")
                    {
                        slotSnapDistance = snapDistance * 2.0f; // 양말은 2배 더 넓게 (1200px)
                    }
                    else if (slotType == "accessory" || slotType == "acc1" || slotType == "acc2")
                    {
                        slotSnapDistance = snapDistance * 2.2f; // 악세서리는 2.2배 더 넓게 (1320px)
                    }
                    
                    // 모든 슬롯의 스냅 거리를 설정
                    clothingSlots[i].snapDistance = slotSnapDistance;
                    clothingSlots[i].dynamicSnapRatio = 0f; // 동적 스냅 비활성화
                    // Debug.Log($"   - 슬롯 {i}: {clothingSlots[i].GetSlotType()} ({clothingSlots[i].name}) - 스냅거리: {slotSnapDistance}");
                }
            }
        }

        // Accessory 슬롯 자동 설정 (ClothingSlot 컴포넌트가 없으면 추가)
        try
        {
            EnsureAccessorySlots();
        }
        catch (System.Exception)
        {
            // Debug.LogError($"❌ Accessory 슬롯 초기화 중 오류 발생");
            // 오류가 발생해도 계속 진행
        }

        // ClothingSpriteManager 의상 아이템 생성 및 드래그 시스템 초기화
        if (ClothingSpriteManager.Instance != null)
        {
            // 먼저 의상 아이템들을 생성
            ClothingSpriteManager.Instance.CreateClothingItems();
            // Debug.Log("🎽 ClothingSpriteManager 의상 아이템 생성 완료");
            
            // 그 다음 드래그 시스템 초기화
            ClothingSpriteManager.Instance.InitializeDragAndDropItems();
            // Debug.Log("🎮 ClothingSpriteManager 드래그 시스템 초기화 완료");
        }
        else
        {
            // Debug.LogWarning("⚠️ ClothingSpriteManager.Instance가 아직 초기화되지 않았습니다. 1초 후 재시도...");
            Invoke(nameof(InitializeClothingSpriteManager), 1f);
        }

        // 캐릭터 적용
        if (applyCharacterOnStart)
        {
            LoadAndApplySelectedCharacter();
        }

        // 서랍 초기 상태 설정 (기본적으로 닫힌 상태)
        isDrawerOpen = false;
        ToggleClothingItemsByType("socks", false);
        ToggleClothingItemsByType("accessory", false); // 모든 accessory 관련 타입 숨김
        
        // Debug.Log("🗂️ 서랍 초기 상태: 닫힘 (socks + accessory 모든 타입 숨김)");

        // StagePopup 최상위 레이어 강제 설정
        ForceSetStagePopupToTop();

        // DONE 버튼 이벤트 연결
        SetupDoneButton();

        // 완료 팝업 초기 상태 설정 (숨김)
        if (completePopup != null)
        {
            completePopup.SetActive(false);
        }

        // cha_l 활성화 재확인
        Invoke(nameof(EnsureChaLargeActive), 0.1f);
        
        // 드래그 시스템 지연 활성화 (2초 후)
        isDragSystemEnabled = false;
        Invoke(nameof(EnableDragSystem), dragEnableDelay);
        // Debug.Log($"⏰ 드래그 시스템을 {dragEnableDelay}초 후에 활성화합니다...");
        
        // StagePopup 캐릭터 정보 초기화 (캐릭터 로드 후 실행되도록 약간 지연)
        Invoke(nameof(UpdateStagePopupCharacterInfo), 0.2f);
    }

    void Update()
    {
        // cha_l 오브젝트 자동 활성화 유지
        if (chaLargeTransform != null && !chaLargeTransform.gameObject.activeInHierarchy)
        {
            chaLargeTransform.gameObject.SetActive(true);
        }

        // 테스트용 키보드 입력 (숫자 키 1,2,3,4로 캐릭터 변경) - Input System 에러로 인해 비활성화
        /*
        if (Input.GetKeyDown(KeyCode.Alpha1))
        {
            // Debug.Log("🎹 키보드 1번 키 입력 - 캐릭터 1번으로 변경");
            TestChangeCharacter(1);
        }
        else if (Input.GetKeyDown(KeyCode.Alpha2))
        {
            // Debug.Log("🎹 키보드 2번 키 입력 - 캐릭터 2번으로 변경");
            TestChangeCharacter(2);
        }
        else if (Input.GetKeyDown(KeyCode.Alpha3))
        {
            // Debug.Log("🎹 키보드 3번 키 입력 - 캐릭터 3번으로 변경");
            TestChangeCharacter(3);
        }
        else if (Input.GetKeyDown(KeyCode.Alpha4))
        {
            // Debug.Log("🎹 키보드 4번 키 입력 - 캐릭터 4번으로 변경");
            TestChangeCharacter(4);
        }
        */
    }

    #endregion

    #region Character Management

    /// <summary>
    /// 선택된 캐릭터를 불러와서 적용합니다
    /// </summary>
    public void LoadAndApplySelectedCharacter()
    {
        // Debug.Log("🔍 MainScene에서 선택된 캐릭터 로드 시작...");
        
        CharacterData selectedCharacterData = CharacterDisplayUtils.LoadSelectedCharacterData();

        if (selectedCharacterData != null)
        {
            Debug.Log($"✅ 선택된 캐릭터 발견: {selectedCharacterData.characterName}");
            currentCharacterData = selectedCharacterData;
            ApplyCharacterSprites();
            
            // StagePopup 캐릭터 정보 업데이트
            UpdateStagePopupCharacterInfo();
            
            // ClothingSpriteManager에 현재 캐릭터 번호 알림
            if (ClothingSpriteManager.Instance != null)
            {
                int characterNumber = ExtractCharacterNumber(selectedCharacterData.characterName);
                if (characterNumber > 0)
                {
                    ClothingSpriteManager.Instance.SetCurrentCharacterAndRefresh(characterNumber);
                    Debug.Log($"🎯 ClothingSpriteManager에 캐릭터 번호 설정 및 의상 아이템 새로고침: {characterNumber}");
                    
                    // 배경색 변경 로직 추가
                    CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
                    if (backgroundManager != null)
                    {
                        Debug.Log($"🎨 SelectScene에서 로드된 캐릭터로 배경색 변경: {characterNumber}번 캐릭터");
                        backgroundManager.OnCharacterChanged(characterNumber);
                    }
                    else
                    {
                        Debug.LogWarning("⚠️ CharacterBackgroundManager를 찾을 수 없습니다! 씬에 CharacterBackgroundManager가 있는지 확인해주세요.");
                    }
                }
            }
            return;
        }

        // Debug.LogWarning("⚠️ 선택된 캐릭터를 찾을 수 없음. Fallback 캐릭터 사용...");
        
        // fallback을 사용하도록 설정된 경우에만 fallback 적용
        if (useFallbackCharacter)
        {
            ApplyFallbackCharacter();
        }
        else
        {
            // Debug.LogError("❌ 선택된 캐릭터도 없고 fallback도 비활성화됨!");
        }
    }

    /// <summary>
    /// 캐릭터 스프라이트를 적용합니다
    /// </summary>
    private void ApplyCharacterSprites()
    {
        if (currentCharacterData == null) return;

        currentLargeSprite = CharacterDisplayUtils.LoadLargeCharacterSprite(currentCharacterData);
        currentCharacterSprite = CharacterDisplayUtils.LoadCharacterSprite(currentCharacterData);

        // cha_l (Large Character Image)에 적용
        if (largeCharacterImage != null)
        {
            if (currentLargeSprite != null)
            {
                UIUtils.SetImageSprite(largeCharacterImage, currentLargeSprite);
            }
            else if (currentCharacterSprite != null && preferLargeSprite)
            {
                UIUtils.SetImageSprite(largeCharacterImage, currentCharacterSprite);
            }
            else
            {
                UIUtils.SetImageSprite(largeCharacterImage, null);
            }
        }

        // cha_m (Character Image)에 적용
        if (characterImage != null)
        {
            if (currentCharacterSprite != null)
            {
                UIUtils.SetImageSprite(characterImage, currentCharacterSprite);
            }
            else if (currentLargeSprite != null)
            {
                UIUtils.SetImageSprite(characterImage, currentLargeSprite);
            }
            else
            {
                UIUtils.SetImageSprite(characterImage, null);
            }
        }
    }

    /// <summary>
    /// 폴백 캐릭터를 적용합니다
    /// </summary>
    private void ApplyFallbackCharacter()
    {
        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        if (allCharacters == null || allCharacters.Length == 0) return;

        CharacterData fallbackCharacter = null;

        // 1단계: 캐릭터 인덱스로 찾기
        if (useFallbackCharacter && fallbackCharacterNumber > 0)
        {
            fallbackCharacter = AlbumPopupUtils.FindCharacterByIndex(allCharacters, fallbackCharacterNumber);
        }

        // 2단계: 배열 인덱스로 접근
        if (fallbackCharacter == null && useFallbackCharacter && fallbackCharacterNumber > 0)
        {
            int arrayIndex = fallbackCharacterNumber - 1;
            if (arrayIndex >= 0 && arrayIndex < allCharacters.Length && allCharacters[arrayIndex] != null)
            {
                fallbackCharacter = allCharacters[arrayIndex];
            }
        }

        // 3단계: 파일명으로 찾기
        if (fallbackCharacter == null && useFallbackCharacter && fallbackCharacterNumber > 0)
        {
            string targetFileName = $"Cha_{fallbackCharacterNumber}";
            fallbackCharacter = AlbumPopupUtils.FindCharacterByFileName(allCharacters, targetFileName);
        }

        // 4단계: 첫 번째 캐릭터 사용
        if (fallbackCharacter == null && allCharacters.Length > 0)
        {
            fallbackCharacter = allCharacters[0];
        }

        // 최종 적용
        if (fallbackCharacter != null)
        {
            currentCharacterData = fallbackCharacter;
            ApplyCharacterSprites();
            
            // StagePopup 캐릭터 정보 업데이트
            UpdateStagePopupCharacterInfo();
            
            // 배경색 변경 로직 추가 (fallback 캐릭터용)
            int characterNumber = ExtractCharacterNumber(fallbackCharacter.characterName);
            CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
            if (backgroundManager != null)
            {
                Debug.Log($"🎨 Fallback 캐릭터로 배경색 변경: {characterNumber}번 캐릭터 ({fallbackCharacter.characterName})");
                backgroundManager.OnCharacterChanged(characterNumber);
            }
            else
            {
                Debug.LogWarning("⚠️ CharacterBackgroundManager를 찾을 수 없습니다! (fallback)");
            }
        }
    }

    /// <summary>
    /// 캐릭터 이름에서 번호를 추출합니다 (예: "Character 2" -> 2, "주인혜" -> 1)
    /// </summary>
    private int ExtractCharacterNumber(string characterName)
    {
        if (string.IsNullOrEmpty(characterName)) return 1;
        
        // 한국어 캐릭터 이름 매핑 우선 처리
        switch (characterName)
        {
            case "주인혜": return 1;
            case "차예진": return 2;  // Cha_2.asset의 실제 이름
            case "천사라": return 3;  // Cha_3.asset의 실제 이름
            case "정다정": return 4;  // Cha_4.asset의 실제 이름
            case "이미나": return 5;
        }
        
        // "Character 1", "Character 2" 등에서 숫자 추출
        var match = System.Text.RegularExpressions.Regex.Match(characterName, @"\d+");
        if (match.Success && int.TryParse(match.Value, out int number))
        {
            return number;
        }
        
        // Debug.LogWarning($"⚠️ 알 수 없는 캐릭터 이름: {characterName}");
        return 1; // 기본값
    }

    /// <summary>
    /// cha_l 오브젝트가 항상 활성화되도록 보장합니다
    /// </summary>
    void EnsureChaLargeActive()
    {
        CharacterDisplayUtils.EnsureGameObjectActive(chaLargeTransform?.gameObject);
    }
    
    /// <summary>
    /// ClothingSpriteManager 초기화를 지연 실행합니다
    /// </summary>
    private void InitializeClothingSpriteManager()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            // 먼저 의상 아이템들을 생성
            ClothingSpriteManager.Instance.CreateClothingItems();
            // Debug.Log("🎽 ClothingSpriteManager 의상 아이템 생성 완료 (지연 초기화)");
            
            // 그 다음 드래그 시스템 초기화
            ClothingSpriteManager.Instance.InitializeDragAndDropItems();
            // Debug.Log("🎮 ClothingSpriteManager 드래그 시스템 초기화 완료 (지연 초기화)");
        }
        else
        {
            // Debug.LogError("❌ ClothingSpriteManager.Instance가 여전히 null입니다! 씬에 ClothingSpriteManager가 있는지 확인해주세요.");
        }
    }
    
    /// <summary>
    /// 드래그 시스템을 활성화합니다 (지연 활성화용)
    /// </summary>
    private void EnableDragSystem()
    {
        isDragSystemEnabled = true;
        // Debug.Log("✅ 드래그 시스템이 활성화되었습니다!");
    }

    #endregion

    #region Clothing System

    /// <summary>
    /// 모든 의상을 제거합니다
    /// </summary>
    public void ClearAllClothing()
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
    }

    /// <summary>
    /// 특정 타입의 의상을 제거합니다
    /// </summary>
    public void RemoveClothingByType(string clothingType)
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
    }

    /// <summary>
    /// 모든 의상 아이템을 원래 위치로 되돌립니다
    /// </summary>
    public void ResetAllClothingItems()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            ClothingSpriteManager.Instance.ResetAllClothingItems();
        }
    }

    /// <summary>
    /// 특정 타입의 의상 아이템 표시 토글
    /// </summary>
    public void ToggleClothingItemsByType(string itemType, bool show)
    {
        if (ClothingSpriteManager.Instance != null)
        {
            // accessory 타입의 경우 모든 관련 타입을 함께 처리
            if (itemType.ToLower() == "accessory")
            {
                string[] accessoryTypes = { "accessory", "acc", "acc1", "acc2" };
                int totalItemsFound = 0;
                
                // drawer_02를 직접 찾아서 처리
                GameObject drawer02 = GameObject.Find("drawer_02");
                if (drawer02 != null)
                {
                    DragAndDropItem[] drawer02Items = drawer02.GetComponentsInChildren<DragAndDropItem>(true);
                    
                    foreach (DragAndDropItem item in drawer02Items)
                    {
                        if (item != null)
                        {
                            string itemTypeFound = item.GetItemType();
                            bool isAccessoryType = itemTypeFound == "accessory" || itemTypeFound == "acc" || 
                                                  itemTypeFound == "acc1" || itemTypeFound == "acc2";
                            
                            if (isAccessoryType)
                            {
                                item.gameObject.SetActive(show);
                                totalItemsFound++;
                                
                                // 표시할 때 드래그 활성화 + acc 아이템은 지연 수정
                                if (show)
                                {
                                    item.ForceEnableInteraction();
                                    
                                    if (itemTypeFound.StartsWith("acc"))
                                    {
                                        StartCoroutine(DelayedFixAccItem(item));
                                    }
                                }
                            }
                        }
                    }
                }
                
                // 기존 방식으로도 처리
                foreach (string accType in accessoryTypes)
                {
                    DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(accType);
                    totalItemsFound += items.Length;
                    
                    foreach (DragAndDropItem item in items)
                    {
                        if (item != null)
                        {
                            UIUtils.SetActiveMultiple(show, item.gameObject);
                            
                            // 표시할 때 드래그 활성화 + acc 아이템은 지연 수정
                            if (show)
                            {
                                item.ForceEnableInteraction();
                                
                                if (accType.StartsWith("acc"))
                                {
                                    StartCoroutine(DelayedFixAccItem(item));
                                }
                            }
                        }
                    }
                }
                
                // acc1, acc2 아이템이 없으면 경고 출력
                if (totalItemsFound == 0)
                {
                    // Debug.LogWarning("❌ accessory (acc1/acc2) 아이템을 찾을 수 없습니다!");
                }
            }
            else
            {
                DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(itemType);
                
                foreach (DragAndDropItem item in items)
                {
                    if (item != null)
                    {
                        UIUtils.SetActiveMultiple(show, item.gameObject);
                        
                        // 표시할 때 드래그 활성화
                        if (show)
                        {
                            item.ForceEnableInteraction();
                        }
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// acc 아이템의 상태를 지연 수정합니다
    /// </summary>
    private IEnumerator DelayedFixAccItem(DragAndDropItem item)
    {
        // 0.2초 대기
        yield return new WaitForSeconds(0.2f);
        
        if (item != null && item.gameObject.activeInHierarchy)
        {
            // 강제로 상태 재설정
            item.ForceEnableInteraction();
            
            // Image raycastTarget 다시 설정
            Image img = item.GetComponent<Image>();
            if (img != null)
            {
                img.raycastTarget = true;
            }
            
            // CanvasGroup 다시 설정
            CanvasGroup canvasGroup = item.GetComponent<CanvasGroup>();
            if (canvasGroup != null)
            {
                canvasGroup.blocksRaycasts = true;
                canvasGroup.alpha = 1f;
                canvasGroup.interactable = true;
            }
            
            // Canvas sorting order 확인
            Canvas itemCanvas = item.GetComponent<Canvas>();
            if (itemCanvas != null && itemCanvas.sortingOrder < 100)
            {
                itemCanvas.sortingOrder = 200;
            }
            
            // RectTransform 크기 확인
            RectTransform rectTransform = item.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                Vector2 size = rectTransform.sizeDelta;
                if (size.x <= 0 || size.y <= 0)
                {
                    rectTransform.sizeDelta = new Vector2(100, 100);
                }
            }
            
            // 컴포넌트 재시작
            item.enabled = false;
            yield return null; // 한 프레임 대기
            item.enabled = true;
            
            // Debug.Log($"🔧 지연 수정 완료: {item.name}");
        }
    }

    #endregion

    #region Clothing Validation

    /// <summary>
    /// 현재 착용한 의상이 정답인지 검증합니다
    /// </summary>
    public void ValidateCurrentClothing()
    {
        if (currentCharacterData == null)
        {
            if (validationMessageText != null)
            {
                validationMessageText.text = "서랍에 양말도 있어! 잘 찾아봐~";
                validationMessageText.color = Color.red;
            }
            return;
        }

        bool isCorrect = MainSceneDebugAndValidationUtils.ValidateCurrentClothing(currentCharacterData, clothingSlots);
        MainSceneDebugAndValidationUtils.ShowDetailedValidationMessage(currentCharacterData, clothingSlots, validationMessageText, isCorrect);

        if (validationMessageText != null && messageDisplayTime > 0)
        {
            StartCoroutine(MainSceneDebugAndValidationUtils.ClearMessageCoroutine(validationMessageText, messageDisplayTime));
        }

        // 정답일 때 완료 팝업 표시
        if (isCorrect)
        {
            StartCoroutine(ShowCompletePopupAfterDelay());
        }
    }

    /// <summary>
    /// 자동 검증을 수행합니다
    /// </summary>
    public void AutoValidateIfEnabled()
    {
        if (autoValidateClothing)
        {
            ValidateCurrentClothing();
        }
    }

    /// <summary>
    /// 검증 메시지를 즉시 지웁니다
    /// </summary>
    public void ClearValidationMessage()
    {
        if (validationMessageText != null)
        {
            validationMessageText.text = "";
            validationMessageText.color = Color.white;
        }
    }

    #endregion

    #region Popup Management

    /// <summary>
    /// 캐릭터 팝업을 표시합니다
    /// </summary>
    public void ShowCharacterPopup()
    {
        SetPopupState(true, currentCharacterData);
    }
    
    /// <summary>
    /// 특정 캐릭터로 팝업을 표시합니다
    /// </summary>
    /// <param name="characterName">표시할 캐릭터 이름</param>
    public void ShowCharacterPopup(string characterName)
    {
        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        CharacterData characterData = System.Array.Find(allCharacters, c => c != null && c.characterName == characterName);
        SetPopupState(true, characterData);
    }

    /// <summary>
    /// 캐릭터 팝업을 숨깁니다
    /// </summary>
    public void HideCharacterPopup()
    {
        SetPopupState(false);
    }

    /// <summary>
    /// 캐릭터 팝업을 토글합니다
    /// </summary>
    public void ToggleCharacterPopup()
    {
        if (characterPopupManager != null)
        {
            bool isActive = characterPopupManager.IsPopupActive();
            SetPopupState(!isActive, currentCharacterData);
        }
    }

    /// <summary>
    /// 팝업 상태를 설정합니다
    /// </summary>
    public void SetPopupState(bool show, CharacterData characterData = null)
    {
        if (characterPopupManager == null) return;

        if (show)
        {
            CharacterData targetCharacter = characterData ?? currentCharacterData;
            if (targetCharacter != null)
            {
                characterPopupManager.ShowPopupWithCharacter(targetCharacter);
            }
        }
        else
        {
            characterPopupManager.HidePopup();
        }
    }

    /// <summary>
    /// 현재 캐릭터로 팝업을 새로고침합니다
    /// </summary>
    public void ForceRefreshPopup()
    {
        if (characterPopupManager != null && currentCharacterData != null)
        {
            if (characterPopupManager.IsPopupActive())
            {
                characterPopupManager.ShowPopupWithCharacter(currentCharacterData);
            }
        }
    }

    #endregion

    #region Button Handlers

    // 의상 관련 버튼들
    public void ClearAllClothingButton() => ClearAllClothing();
    public void ResetAllClothingItemsButton() => ResetAllClothingItems();
    public void ToggleSocksItems(bool show) => ToggleClothingItemsByType("socks", show);
    public void ToggleAccessoryItems(bool show) => ToggleClothingItemsByType("accessory", show);
    public void ToggleAccItems(bool show) => ToggleClothingItemsByType("accessory", show); // acc도 accessory로 처리

    // 팝업 관련 버튼들
    public void ShowCharacterPopupButton() => SetPopupState(true);
    public void HideCharacterPopupButton() => SetPopupState(false);
    public void ToggleCharacterPopupButton() => ToggleCharacterPopup();

    // 검증 관련 버튼들
    public void ValidateClothingButton() => ValidateCurrentClothing();
    public void ClearValidationMessageButton() => ClearValidationMessage();

    // 테스트용 캐릭터 변경 버튼들
    /// <summary>
    /// 캐릭터 1번으로 변경 (테스트용)
    /// </summary>
    public void TestChangeToCharacter1Button()
    {
        Debug.Log("🧪 테스트: 캐릭터 1번으로 변경");
        TestChangeCharacter(1);
    }

    /// <summary>
    /// 캐릭터 2번으로 변경 (테스트용)
    /// </summary>
    public void TestChangeToCharacter2Button()
    {
        Debug.Log("🧪 테스트: 캐릭터 2번으로 변경");
        TestChangeCharacter(2);
    }

    /// <summary>
    /// 캐릭터 3번으로 변경 (테스트용)
    /// </summary>
    public void TestChangeToCharacter3Button()
    {
        Debug.Log("🧪 테스트: 캐릭터 3번으로 변경");
        TestChangeCharacter(3);
    }

    /// <summary>
    /// 캐릭터 4번으로 변경 (테스트용)
    /// </summary>
    public void TestChangeToCharacter4Button()
    {
        Debug.Log("🧪 테스트: 캐릭터 4번으로 변경");
        TestChangeCharacter(4);
    }

    /// <summary>
    /// 테스트용 캐릭터 변경 핵심 로직
    /// </summary>
    private void TestChangeCharacter(int characterNumber)
    {
        Debug.Log($"🧪🧪🧪 테스트 캐릭터 변경 시작: {characterNumber}번 캐릭터로 변경");

        // ClothingSpriteManager를 통해 캐릭터 변경
        if (ClothingSpriteManager.Instance != null)
        {
            ClothingSpriteManager.Instance.SetCurrentCharacterAndRefresh(characterNumber);
            Debug.Log($"✅ ClothingSpriteManager를 통한 캐릭터 {characterNumber} 변경 완료");
        }
        else
        {
            Debug.LogError("❌ ClothingSpriteManager.Instance가 null입니다!");
        }

        // 배경색 변경도 직접 테스트
        CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
        if (backgroundManager != null)
        {
            Debug.Log($"🎨 CharacterBackgroundManager 직접 테스트: {characterNumber}번 캐릭터로 배경색 변경");
            backgroundManager.OnCharacterChanged(characterNumber);
        }
        else
        {
            Debug.LogError("❌ CharacterBackgroundManager를 찾을 수 없습니다!");
        }

        Debug.Log($"🧪🧪🧪 테스트 캐릭터 {characterNumber} 변경 완료!");
    }

    /// <summary>
    /// 캐릭터 디스플레이를 새로고침합니다
    /// </summary>
    public void RefreshCharacterDisplay()
    {
        LoadAndApplySelectedCharacter();
        ForceRefreshPopup();
    }

    /// <summary>
    /// 서랍 토글 처리 (boolean 파라미터 버전 - 기존 호환성용)
    /// </summary>
    public void ToggleDrawer(bool isOpen)
    {
        // Debug.Log($"🗂️ ToggleDrawer({isOpen}) 호출됨");
        
        if (isOpen)
        {
            // socks 아이템 표시
            ToggleClothingItemsByType("socks", true);
            
            // accessory 아이템 표시 (내부적으로 모든 accessory 관련 타입 처리)
            ToggleClothingItemsByType("accessory", true);
            
            // acc 아이템들의 드래그 상태 강제 수정
            Invoke(nameof(FixAccItemsDragAfterToggle), 0.1f);
            
            isDrawerOpen = true;
            // Debug.Log("🧦👑 서랍 열림: socks + accessory (모든 관련 타입 포함) 아이템 표시");
        }
        else
        {
            // socks 아이템 숨김
            ToggleClothingItemsByType("socks", false);
            
            // accessory 아이템 숨김 (내부적으로 모든 accessory 관련 타입 처리)
            ToggleClothingItemsByType("accessory", false);
            
            isDrawerOpen = false;
            // Debug.Log("🚫 서랍 닫힘: socks + accessory (모든 관련 타입 포함) 아이템 숨김");
        }

        // Debug.Log($"✅ 서랍 상태 최종 설정 완료: {(isDrawerOpen ? "열림" : "닫힘")}");
    }
    
    /// <summary>
    /// 서랍 토글 후 acc 아이템들의 드래그 상태를 수정합니다
    /// </summary>
    private void FixAccItemsDragAfterToggle()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            // Debug.Log("🔧 서랍 토글 후 ACC 아이템 드래그 상태 수정...");
            
            // 강력한 수정 방법 적용
            ClothingSpriteManager.Instance.ForceFixAcc1Acc2ClickIssues();
            
            // 추가로 직접 수정도 적용
            string[] accTypes = { "accessory", "acc", "acc1", "acc2" };
            
            foreach (string accType in accTypes)
            {
                DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(accType);
                
                foreach (DragAndDropItem item in items)
                {
                    if (item != null && item.gameObject.activeInHierarchy)
                    {
                        // Image raycastTarget 확실히 설정
                        Image img = item.GetComponent<Image>();
                        if (img != null)
                        {
                            img.raycastTarget = true;
                        }
                        
                        // CanvasGroup 설정
                        CanvasGroup canvasGroup = item.GetComponent<CanvasGroup>();
                        if (canvasGroup != null)
                        {
                            canvasGroup.blocksRaycasts = true;
                            canvasGroup.alpha = 1f;
                            canvasGroup.interactable = true;
                        }
                        
                        // DragAndDropItem 컴포넌트 재활성화
                        if (!item.enabled)
                        {
                            item.enabled = true;
                        }
                        
                        // 컴포넌트 강제 새로고침
                        item.enabled = false;
                        item.enabled = true;
                        
                        // 강제 상호작용 활성화
                        item.ForceEnableInteraction();
                    }
                }
            }
            
            // Debug.Log("✅ ACC 아이템 드래그 상태 수정 완료");
        }
    }

    /// <summary>
    /// 서랍 토글 처리 (파라미터 없는 버전 - 실제 토글)
    /// </summary>
    public void ToggleDrawer()
    {
        // Debug.Log($"🔧 ToggleDrawer() 호출됨 - 현재 상태: {isDrawerOpen}");
        isDrawerOpen = !isDrawerOpen;
        // Debug.Log($"🔄 서랍 상태 변경: {isDrawerOpen}");
        ToggleDrawer(isDrawerOpen);
    }

    /// <summary>
    /// 서랍 버튼 클릭 핸들러 (Unity 버튼에서 사용)
    /// </summary>
    public void ToggleDrawerButton()
    {
        // Debug.LogError("🚨🚨🚨 ToggleDrawerButton() 호출됨!!! 🚨🚨🚨");
        // Debug.Log("🖱️ ToggleDrawerButton() 호출됨 - 서랍 버튼 클릭 감지!");
        
        // 서랍 토글
        ToggleDrawer();
        
        // ClickToToggle의 sprite 변경을 위해 강제로 Toggle 호출
        ClickToToggle clickToToggle = FindClickToToggleOnDrawerButton();
        if (clickToToggle != null)
        {
            // Debug.Log("🎨 ClickToToggle 발견 - sprite 변경을 위해 직접 Toggle 호출");
            // ClickToToggle의 isToggled 상태를 현재 drawer 상태와 맞춤
            clickToToggle.SendMessage("Toggle", SendMessageOptions.DontRequireReceiver);
        }
    }
    
    /// <summary>
    /// 서랍 버튼에서 ClickToToggle 컴포넌트를 찾습니다
    /// </summary>
    private ClickToToggle FindClickToToggleOnDrawerButton()
    {
        // 현재 오브젝트에서 먼저 찾기
        ClickToToggle clickToToggle = GetComponent<ClickToToggle>();
        if (clickToToggle != null) return clickToToggle;
        
        // dressup_closet 버튼에서 찾기
        GameObject drawerButton = GameObject.Find("dressup_closet");
        if (drawerButton != null)
        {
            clickToToggle = drawerButton.GetComponent<ClickToToggle>();
            if (clickToToggle != null) return clickToToggle;
        }
        
        // Debug.LogWarning("⚠️ ClickToToggle 컴포넌트를 찾을 수 없습니다!");
        return null;
    }

    #endregion
    
    #region Drag and Drop Events
    
    /// <summary>
    /// 드래그 시작 시 호출됩니다
    /// </summary>
    public void OnItemDragStart(DragAndDropItem item)
    {
        // 드래그 시스템이 아직 활성화되지 않았으면 드래그 시작을 차단
        if (!isDragSystemEnabled)
        {
            // Debug.Log("⏰ 드래그 시스템이 아직 활성화되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }
        
        currentDraggedItem = item;
    }
    
    /// <summary>
    /// 드래그 업데이트 시 호출됩니다
    /// </summary>
    public void OnItemDragUpdate(DragAndDropItem item, Vector2 position)
    {
        // 드래그 시스템이 활성화되지 않았으면 업데이트 차단
        if (!isDragSystemEnabled)
        {
            return;
        }
        
        // 드래그 중 업데이트 로직 (필요시 구현)
    }
    
    /// <summary>
    /// 드래그 종료 시 호출됩니다
    /// </summary>
    public bool OnItemDragEnd(DragAndDropItem item, Vector2 position)
    {
        // 드래그 시스템이 활성화되지 않았으면 드래그 종료 차단
        if (!isDragSystemEnabled)
        {
            // Debug.Log("⏰ 드래그 시스템이 아직 활성화되지 않았습니다.");
            return false;
        }
        
        // Debug.Log($"🎯 드래그 종료: {(item != null ? item.GetItemType() : "null")} 아이템, 위치: {position}");
        
        currentDraggedItem = null;
        
        // 의상 슬롯에 배치되었는지 확인
        bool wasPlaced = CheckItemPlacement(item, position);
        
        // Debug.Log($"   배치 결과: {(wasPlaced ? "성공" : "실패")}");
        
        // 배치되지 않았다면 DragAndDropItem에서 자체적으로 원위치로 복귀
        // CorrectItemOriginalPosition 호출 제거 - 원위치 혼선 방지
        
        // 자동 검증 제거 - ValidateClothingButton을 통해서만 검증하도록 변경
        // if (wasPlaced)
        // {
        //     AutoValidateIfEnabled();
        // }
        
        return wasPlaced;
    }

    /// <summary>
    /// 아이템의 올바른 원위치를 찾아서 설정합니다 (사용 중지 - 원위치 혼선 방지)
    /// </summary>
    /*
    private void CorrectItemOriginalPosition(DragAndDropItem item)
    {
        if (item == null) return;

        string itemType = item.GetItemType();
        Debug.Log($"🔧 원위치 보정 시작: {item.name} ({itemType})");

        // socks나 accessory 타입인 경우 서랍 상태 확인
        if (itemType.ToLower() == "socks" || IsAccessoryType(itemType))
        {
            // 서랍이 닫혀있으면 아이템이 숨겨져야 하므로 원위치 보정 후 숨김 처리
            if (!isDrawerOpen)
            {
                Debug.Log($"🗂️ 서랍이 닫힌 상태이므로 {itemType} 아이템 숨김 처리");
                
                // 먼저 올바른 원위치를 설정
                SetCorrectOriginalPositionForItem(item);
                
                // 그 다음 아이템 숨김
                item.gameObject.SetActive(false);
                return;
            }
        }

        // 일반적인 원위치 보정
        SetCorrectOriginalPositionForItem(item);
    }
    */

    /// <summary>
    /// 아이템의 올바른 원위치를 설정하는 실제 로직 (사용 중지 - 원위치 혼선 방지)
    /// </summary>
    /*
    private void SetCorrectOriginalPositionForItem(DragAndDropItem item)
    {
        // 아이템 타입에 따라 올바른 부모를 찾기
        Transform correctParent = FindCorrectParentForItem(item);
        if (correctParent != null)
        {
            // 해당 부모에서 같은 이름의 아이템을 찾아서 위치 확인
            Transform correctPosition = FindCorrectPositionInParent(correctParent, item.name);
            if (correctPosition != null)
            {
                // 강제로 올바른 원위치 설정
                item.SetCorrectOriginalPosition(correctPosition.GetComponent<RectTransform>().anchoredPosition, correctParent);
                Debug.Log($"✅ 원위치 보정 완료: {item.name} → {correctParent.name} 위치: {correctPosition.GetComponent<RectTransform>().anchoredPosition}");
            }
            else
            {
                Debug.LogWarning($"⚠️ {correctParent.name}에서 {item.name}의 올바른 위치를 찾을 수 없습니다");
            }
        }
        else
        {
            Debug.LogWarning($"⚠️ {item.GetItemType()} 타입의 올바른 부모를 찾을 수 없습니다");
        }
    }
    */

    /// <summary>
    /// 아이템 타입이 accessory 관련인지 확인합니다
    /// </summary>
    private bool IsAccessoryType(string itemType)
    {
        if (string.IsNullOrEmpty(itemType)) return false;
        
        string lowerType = itemType.ToLower();
        return lowerType == "accessory" || lowerType == "acc" || lowerType == "acc1" || lowerType == "acc2";
    }

    /// <summary>
    /// 현재 모든 드래그 앤 드롭 아이템들의 상태를 디버그 출력합니다 (테스트용)
    /// </summary>
    [System.Diagnostics.Conditional("UNITY_EDITOR")]
    public void DebugAllItemsStatus()
    {
        Debug.Log("=== 모든 드래그 앤 드롭 아이템 상태 ===");
        
        if (ClothingSpriteManager.Instance != null)
        {
            // 모든 타입의 아이템들 확인
            string[] itemTypes = { "top", "bottom", "shoes", "socks", "accessory" };
            
            foreach (string itemType in itemTypes)
            {
                DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(itemType);
                Debug.Log($"📂 {itemType} 타입 아이템들 ({items.Length}개):");
                
                foreach (DragAndDropItem item in items)
                {
                    if (item != null)
                    {
                        item.DebugItemStatus();
                    }
                }
            }
        }
        
        Debug.Log("=== 디버그 출력 완료 ===");
    }

    /// <summary>
    /// 아이템 타입에 따라 올바른 부모 Transform을 찾습니다
    /// </summary>
    private Transform FindCorrectParentForItem(DragAndDropItem item)
    {
        if (item == null || ClothingSpriteManager.Instance == null) return null;

        string itemType = item.GetItemType().ToLower();
        Transform[] parentArray = null;

        // 타입에 따라 올바른 부모 배열 선택
        switch (itemType)
        {
            case "top":
            case "top2":
            case "top3":
                parentArray = ClothingSpriteManager.Instance.topItemParents;
                break;
            case "bottom":
            case "bottom2":
                parentArray = ClothingSpriteManager.Instance.bottomItemParents;
                break;
            case "shoes":
                parentArray = ClothingSpriteManager.Instance.shoesItemParents;
                break;
            case "socks":
                parentArray = ClothingSpriteManager.Instance.socksItemParents;
                break;
            case "accessory":
            case "acc":
                // 범용 acc 타입의 경우 acc1, acc2 부모를 모두 포함
                List<Transform> allAccParents = new List<Transform>();
                allAccParents.AddRange(ClothingSpriteManager.Instance.acc1ItemParents);
                allAccParents.AddRange(ClothingSpriteManager.Instance.acc2ItemParents);
                parentArray = allAccParents.ToArray();
                break;
            case "acc1":
                parentArray = ClothingSpriteManager.Instance.acc1ItemParents;
                break;
            case "acc2":
                parentArray = ClothingSpriteManager.Instance.acc2ItemParents;
                break;
            default:
                Debug.LogWarning($"⚠️ 알 수 없는 아이템 타입: {itemType}");
                break;
        }

        if (parentArray != null && parentArray.Length > 0)
        {
            // 첫 번째 부모를 반환 (보통 모든 같은 타입 아이템들이 같은 부모 아래 있음)
            return parentArray[0];
        }

        return null;
    }

    /// <summary>
    /// 특정 부모 내에서 아이템 이름과 일치하는 Transform을 찾습니다
    /// </summary>
    private Transform FindCorrectPositionInParent(Transform parent, string itemName)
    {
        if (parent == null || string.IsNullOrEmpty(itemName)) return null;

        // 부모 오브젝트가 비활성화되어 있으면 활성화
        if (!parent.gameObject.activeInHierarchy)
        {
            Debug.Log($"🔧 부모 오브젝트 활성화: {parent.name}");
            parent.gameObject.SetActive(true);
        }

        // 자식들 중에서 같은 이름을 가진 오브젝트 찾기
        for (int i = 0; i < parent.childCount; i++)
        {
            Transform child = parent.GetChild(i);
            if (child.name == itemName)
            {
                Debug.Log($"🎯 정확한 위치 발견: {child.name} in {parent.name}");
                return child;
            }
        }

        // 직접 일치하는 것이 없으면 비슷한 이름 찾기
        for (int i = 0; i < parent.childCount; i++)
        {
            Transform child = parent.GetChild(i);
            if (child.name.Contains(itemName) || itemName.Contains(child.name))
            {
                Debug.Log($"🎯 유사한 위치 발견: {child.name} in {parent.name}");
                return child;
            }
        }

        // 아무것도 찾지 못했으면 첫 번째 자식 반환 (최후의 수단)
        if (parent.childCount > 0)
        {
            Debug.LogWarning($"⚠️ 정확한 위치를 찾지 못해 첫 번째 자식 위치 사용: {parent.GetChild(0).name}");
            return parent.GetChild(0);
        }

        return null;
    }
    
    /// <summary>
    /// 같은 타입의 의상을 다른 슬롯에서 제거합니다
    /// </summary>
    public void RemoveSameTypeClothingFromOtherSlots(string clothingType, ClothingSlot currentSlot)
    {
        if (clothingSlots != null)
        {
            foreach (ClothingSlot slot in clothingSlots)
            {
                if (slot != null && slot != currentSlot && slot.GetSlotType().ToLower() == clothingType.ToLower())
                {
                    slot.ClearSlot();
                }
            }
        }
    }
    
    /// <summary>
    /// socks와 accessory parent layer를 강제로 활성화합니다
    /// </summary>
    public void ForceShowSocksAndAccessoryParents()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            Transform[] socksParents = ClothingSpriteManager.Instance.socksItemParents;
            if (socksParents != null && socksParents.Length > 0)
            {
                foreach (Transform parent in socksParents)
                {
                    if (parent != null)
                    {
                        parent.gameObject.SetActive(true);
                        ActivateAllChildLayers(parent);
                    }
                }
            }
            
            // Acc1 부모들 활성화
            Transform[] acc1Parents = ClothingSpriteManager.Instance.acc1ItemParents;
            if (acc1Parents != null && acc1Parents.Length > 0)
            {
                foreach (Transform parent in acc1Parents)
                {
                    if (parent != null)
                    {
                        parent.gameObject.SetActive(true);
                        ActivateAllChildLayers(parent);
                    }
                }
            }
            
            // Acc2 부모들 활성화
            Transform[] acc2Parents = ClothingSpriteManager.Instance.acc2ItemParents;
            if (acc2Parents != null && acc2Parents.Length > 0)
            {
                foreach (Transform parent in acc2Parents)
                {
                    if (parent != null)
                    {
                        parent.gameObject.SetActive(true);
                        ActivateAllChildLayers(parent);
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// 드래그 앤 드롭 아이템들을 새로고침합니다
    /// </summary>
    public void RefreshDragAndDropItems()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            ClothingSpriteManager.Instance.InitializeDragAndDropItems();
        }
    }
    
    /// <summary>
    /// 특정 parent 하위의 모든 child layer들을 활성화합니다
    /// </summary>
    private int ActivateAllChildLayers(Transform parent)
    {
        if (parent == null) return 0;
        
        int activatedCount = 0;
        foreach (Transform child in parent)
        {
            if (child != null && !child.gameObject.activeInHierarchy)
            {
                child.gameObject.SetActive(true);
                activatedCount++;
            }
        }
        return activatedCount;
    }
    
    /// <summary>
    /// 드래그된 아이템이 적절한 슬롯에 배치되었는지 확인합니다
    /// </summary>
    private bool CheckItemPlacement(DragAndDropItem item, Vector2 position)
    {
        if (clothingSlots == null || item == null) 
        {
            // Debug.LogWarning($"❌ CheckItemPlacement 실패: clothingSlots={clothingSlots != null}, item={item != null}");
            return false;
        }
        
        // Debug.Log($"🎯 아이템 배치 확인 시작: {item.GetItemType()} 아이템, 위치: {position}, 슬롯 수: {clothingSlots.Length}");
        
        ClothingSlot bestSlot = null;
        float minDistance = float.MaxValue;
        
        // 먼저 호환되는 슬롯들 중에서 가장 가까운 것을 찾기
        foreach (ClothingSlot slot in clothingSlots)
        {
            if (slot != null)
            {
                float distance = slot.GetDistanceToPoint(position);
                bool canAccept = slot.CanAcceptItem(item);
                
                // 모든 슬롯의 호환성 검사 결과 출력 (디버깅용)
                // Debug.Log($"   - {slot.GetSlotType()} 슬롯: 거리={distance:F1}, 호환={(canAccept ? "✅" : "❌")}, 슬롯스냅거리={slot.snapDistance}, 스냅거리내={distance <= slot.snapDistance}");
                
                // 호환되고 각 슬롯의 개별 스냅 거리 내에 있으며 가장 가까운 슬롯 찾기
                if (canAccept && distance <= slot.snapDistance && distance < minDistance)
                {
                    minDistance = distance;
                    bestSlot = slot;
                    // Debug.Log($"   ✅ 새로운 최적 슬롯: {slot.GetSlotType()} (거리: {distance:F1})");
                }
            }
        }
        
        // 호환되는 슬롯이 없으면 전체적으로 다시 확인 (디버깅용)
        if (bestSlot == null)
        {
            // Debug.LogWarning($"⚠️ {item.GetItemType()} 아이템과 호환되는 슬롯을 스냅 거리({snapDistance}) 내에서 찾을 수 없습니다!");
            
            // 디버깅: 모든 슬롯과의 거리와 호환성 출력
            /*
            foreach (ClothingSlot slot in clothingSlots)
            {
                if (slot != null)
                {
                    float distance = slot.GetDistanceToPoint(position);
                    bool canAccept = slot.CanAcceptItem(item);
                    Debug.Log($"   📋 {slot.GetSlotType()}: 거리={distance:F1}, 호환={canAccept}");
                }
            }
            */
            return false;
        }
        
        // 최적의 슬롯에 배치 시도
        // Debug.Log($"🎯 최적 슬롯에 배치 시도: {item.GetItemType()} → {bestSlot.GetSlotType()} (거리: {minDistance:F1})");
        bool placed = bestSlot.PlaceItem(item);
        // Debug.Log($"   배치 결과: {(placed ? "✅ 성공" : "❌ 실패")}");
        
        return placed;
    }
    
    #endregion

    #region Public Getters

    /// <summary>
    /// 현재 캐릭터 데이터를 반환합니다
    /// </summary>
    public CharacterData GetCurrentCharacterData() => currentCharacterData;

    /// <summary>
    /// 현재 큰 스프라이트를 반환합니다
    /// </summary>
    public Sprite GetCurrentLargeSprite() => currentLargeSprite;

    /// <summary>
    /// 현재 캐릭터 스프라이트를 반환합니다
    /// </summary>
    public Sprite GetCurrentCharacterSprite() => currentCharacterSprite;

    /// <summary>
    /// 팝업이 현재 활성화되어 있는지 확인합니다
    /// </summary>
    public bool IsPopupActive()
    {
        return characterPopupManager != null && characterPopupManager.IsPopupActive();
    }

    /// <summary>
    /// 서랍이 현재 열려있는지 확인합니다
    /// </summary>
    public bool IsDrawerOpen() => isDrawerOpen;

    #endregion

    #region Album Management

    /// <summary>
    /// AlbumPopupManager를 가져옵니다
    /// </summary>
    private AlbumPopupManager GetAlbumPopupManager()
    {
        if (albumPopupManagerObject != null)
        {
            return albumPopupManagerObject.GetComponent<AlbumPopupManager>();
        }
        return null;
    }

    /// <summary>
    /// 앨범 팝업을 현재 캐릭터로 엽니다
    /// </summary>
    public void OpenAlbum()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null)
        {
            albumManager.OpenAlbumWithCurrentCharacter();
            // Debug.Log("📚 앨범 팝업 열기 (현재 캐릭터)");
        }
        else
        {
            // Debug.LogWarning("❌ AlbumPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 앨범 팝업을 특정 캐릭터로 엽니다
    /// </summary>
    /// <param name="characterName">표시할 캐릭터 이름</param>
    public void OpenAlbumWithCharacter(string characterName)
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null)
        {
            albumManager.OpenAlbumWithCharacterName(characterName);
            // Debug.Log($"📚 앨범 팝업 열기: {characterName}");
        }
        else
        {
            // Debug.LogWarning("❌ AlbumPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 앨범 팝업을 첫 번째 캐릭터로 엽니다
    /// </summary>
    public void OpenAlbumFromStart()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null)
        {
            albumManager.OpenAlbum();
            // Debug.Log("📚 앨범 팝업 열기 (첫 번째 캐릭터)");
        }
        else
        {
            // Debug.LogWarning("❌ AlbumPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 앨범 팝업을 닫습니다
    /// </summary>
    public void CloseAlbum()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null)
        {
            albumManager.CloseAlbum();
            // Debug.Log("📚 앨범 팝업 닫기");
        }
        else
        {
            // Debug.LogWarning("❌ AlbumPopupManager가 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// 앨범 팝업을 토글합니다
    /// </summary>
    public void ToggleAlbum()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null)
        {
            if (albumManager.IsAlbumOpen())
            {
                albumManager.CloseAlbum();
                // Debug.Log("📚 앨범 팝업 닫기 (토글)");
            }
            else
            {
                albumManager.OpenAlbumWithCurrentCharacter();
                // Debug.Log("📚 앨범 팝업 열기 (토글)");
            }
        }
        else
        {
            // Debug.LogWarning("❌ AlbumPopupManager가 설정되지 않았습니다!");
        }
    }

    #endregion

    #region Album Button Handlers

    // 앨범 관련 버튼 이벤트 핸들러들
    public void OpenAlbumButton() => OpenAlbum();
    public void CloseAlbumButton() => CloseAlbum();
    public void ToggleAlbumButton() => ToggleAlbum();

    // 특정 캐릭터 앨범 버튼들
    public void OpenAlbumCha1Button() => OpenAlbumWithCharacter("Cha_1");
    public void OpenAlbumCha2Button() => OpenAlbumWithCharacter("Cha_2");
    public void OpenAlbumCha3Button() => OpenAlbumWithCharacter("Cha_3");
    public void OpenAlbumCha4Button() => OpenAlbumWithCharacter("Cha_4");
    public void OpenAlbumCha5Button() => OpenAlbumWithCharacter("Cha_5");

    // 앨범 네비게이션 버튼들 (앨범이 열려있을 때 사용)
    public void AlbumPreviousCharacterButton()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null && albumManager.IsAlbumOpen())
        {
            albumManager.ShowPreviousCharacter();
            // Debug.Log("📚 앨범: 이전 캐릭터");
        }
    }

    public void AlbumNextCharacterButton()
    {
        var albumManager = GetAlbumPopupManager();
        if (albumManager != null && albumManager.IsAlbumOpen())
        {
            albumManager.ShowNextCharacter();
            // Debug.Log("📚 앨범: 다음 캐릭터");
        }
    }

    /// <summary>
    /// Accessory 슬롯들에 ClothingSlot 컴포넌트를 안전하게 설정합니다
    /// </summary>
    private void EnsureAccessorySlots()
    {
        // Application이 실행 중이 아닐 때는 컴포넌트 추가를 건너뜁니다
        if (!Application.isPlaying)
        {
            // Debug.LogWarning("⚠️ 에디터 모드에서는 accessory 슬롯 자동 설정을 건너뜁니다.");
            return;
        }

        try
        {
            // accessory1Slot 확인 및 설정
            if (accessory1Slot != null)
            {
                ClothingSlot slot1 = accessory1Slot.GetComponent<ClothingSlot>();
                if (slot1 == null)
                {
                    // 런타임에만 컴포넌트 추가
                    slot1 = accessory1Slot.gameObject.AddComponent<ClothingSlot>();
                    // Debug.Log($"✅ accessory1Slot에 ClothingSlot 컴포넌트 추가 (런타임)");
                    
                    // 컴포넌트가 에디터에서 저장되지 않도록 설정
                    if (slot1 != null)
                    {
                        // Unity 내부 플래그 설정하여 에디터 저장 방지
                        slot1.hideFlags = HideFlags.DontSaveInEditor | HideFlags.DontSaveInBuild;
                    }
                }
                
                // 슬롯 타입을 강제로 acc1로 설정 (기존에 잘못 설정된 경우 수정)
                if (slot1 != null && slot1.slotType != "acc1")
                {
                    // Debug.Log($"🔧 accessory1Slot 타입 수정: '{slot1.slotType}' → 'acc1'");
                    slot1.slotType = "acc1";
                }
                
                if (slot1 != null)
                {
                    slot1.snapDistance = snapDistance * 2.2f; // 악세서리 스냅 거리
                    // Debug.Log($"✅ accessory1Slot 설정 완료 (타입: {slot1.slotType})");
                }
            }
            else
            {
                // Debug.LogWarning("❌ accessory1Slot이 설정되지 않았습니다!");
            }

            // accessory2Slot 확인 및 설정
            if (accessory2Slot != null)
            {
                ClothingSlot slot2 = accessory2Slot.GetComponent<ClothingSlot>();
                if (slot2 == null)
                {
                    // 런타임에만 컴포넌트 추가
                    slot2 = accessory2Slot.gameObject.AddComponent<ClothingSlot>();
                    Debug.Log($"✅ accessory2Slot에 ClothingSlot 컴포넌트 추가 (런타임)");
                    
                    // 컴포넌트가 에디터에서 저장되지 않도록 설정
                    if (slot2 != null)
                    {
                        // Unity 내부 플래그 설정하여 에디터 저장 방지
                        slot2.hideFlags = HideFlags.DontSaveInEditor | HideFlags.DontSaveInBuild;
                    }
                }
                
                // 슬롯 타입을 강제로 acc2로 설정 (기존에 잘못 설정된 경우 수정)
                if (slot2 != null && slot2.slotType != "acc2")
                {
                    Debug.Log($"🔧 accessory2Slot 타입 수정: '{slot2.slotType}' → 'acc2'");
                    slot2.slotType = "acc2";
                }
                
                if (slot2 != null)
                {
                    slot2.snapDistance = snapDistance * 2.2f; // 악세서리 스냅 거리
                    Debug.Log($"✅ accessory2Slot 설정 완료 (타입: {slot2.slotType})");
                }
            }
            else
            {
                Debug.LogWarning("❌ accessory2Slot이 설정되지 않았습니다!");
            }

            // 슬롯 설정 후 다시 검색하여 업데이트
            Debug.Log("🔄 Accessory 슬롯 설정 후 의상 슬롯 재검색...");
            clothingSlots = ClothingUtils.FindAllClothingSlots();
        }
        catch (System.Exception ex)
        {
            Debug.LogError($"❌ Accessory 슬롯 설정 중 오류 발생: {ex.Message}");
            Debug.LogError($"스택 트레이스: {ex.StackTrace}");
        }
    }

    /// <summary>
    /// StagePopup을 최상위 레이어로 강제 설정합니다
    /// </summary>
    public void ForceSetStagePopupToTop()
    {
        // 일반적인 StagePopup 이름들로 시도
        string[] stagePopupNames = { "StagePopup", "stagepopup", "Stage_Popup", "stage_popup", "StageUI", "PopupStage" };
        
        bool found = false;
        foreach (string popupName in stagePopupNames)
        {
            GameObject stagePopupObject = GameObject.Find(popupName);
            if (stagePopupObject != null)
            {
                LayerOrderManager.SetStagePopupLayer(stagePopupObject);
                found = true;
                Debug.Log($"🔝 '{popupName}' StagePopup을 최상위 레이어로 설정했습니다.");
                break;
            }
        }
        
        if (!found)
        {
            // StagePopup을 찾지 못했으면 모든 "Popup" 포함 오브젝트들을 최상위로 설정
            Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
            foreach (Canvas canvas in allCanvases)
            {
                if (canvas.gameObject.name.ToLower().Contains("popup") || 
                    canvas.gameObject.name.ToLower().Contains("stage"))
                {
                    LayerOrderManager.SetStagePopupLayer(canvas);
                    Debug.Log($"🔝 Popup/Stage 관련 Canvas '{canvas.gameObject.name}'을 최상위로 설정했습니다.");
                }
            }
        }
    }
    
    /// <summary>
    /// 특정 이름의 StagePopup을 최상위로 설정합니다
    /// </summary>
    /// <param name="popupName">설정할 팝업 오브젝트 이름</param>
    public void ForceSetStagePopupToTop(string popupName)
    {
        if (string.IsNullOrEmpty(popupName))
        {
            ForceSetStagePopupToTop(); // 기본 메서드 호출
            return;
        }
        
        LayerOrderManager.ForceSetTopMostPopup(popupName);
    }
    
    /// <summary>
    /// 모든 Canvas 상태를 디버그 출력합니다
    /// </summary>
    [ContextMenu("Debug All Canvas States")]
    public void DebugAllCanvasStates()
    {
        Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        Debug.Log($"=== 모든 Canvas 상태 디버그 ({allCanvases.Length}개) ===");
        
        foreach (Canvas canvas in allCanvases)
        {
            Debug.Log($"Canvas: {canvas.gameObject.name}");
            Debug.Log($"  - SortingOrder: {canvas.sortingOrder}");
            Debug.Log($"  - OverrideSorting: {canvas.overrideSorting}");
            Debug.Log($"  - RenderMode: {canvas.renderMode}");
            Debug.Log($"  - SortingLayerName: {canvas.sortingLayerName}");
            Debug.Log($"  - Active: {canvas.gameObject.activeInHierarchy}");
        }
        
        Debug.Log("=== Canvas 디버그 완료 ===");
    }
    
    /// <summary>
    /// acc 아이템들의 드래그 상태를 디버그합니다
    /// </summary>
    [ContextMenu("Debug ACC Items Drag State")]
    public void DebugAccItemsDragState()
    {
        if (ClothingSpriteManager.Instance == null)
        {
            Debug.LogError("❌ ClothingSpriteManager.Instance가 null입니다!");
            return;
        }
        
        Debug.Log("=== ACC 아이템 드래그 상태 디버그 ===");
        
        // 모든 accessory 관련 타입 확인
        string[] accTypes = { "accessory", "acc", "acc1", "acc2" };
        
        foreach (string accType in accTypes)
        {
            DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(accType);
            Debug.Log($"📂 {accType} 타입 아이템들 ({items.Length}개):");
            
            foreach (DragAndDropItem item in items)
            {
                if (item != null)
                {
                    // DragAndDropItem 컴포넌트 상태 확인
                    bool isEnabled = item.enabled;
                    bool isActive = item.gameObject.activeInHierarchy;
                    bool isDragging = item.IsDragging();
                    
                    // Image 컴포넌트 확인
                    Image img = item.GetComponent<Image>();
                    bool hasImage = img != null;
                    bool hasSprite = hasImage && img.sprite != null;
                    bool raycastTarget = hasImage && img.raycastTarget;
                    
                    // Canvas 컴포넌트 확인
                    Canvas itemCanvas = item.GetComponent<Canvas>();
                    bool hasCanvas = itemCanvas != null;
                    int sortingOrder = hasCanvas ? itemCanvas.sortingOrder : -1;
                    
                    // CanvasGroup 확인
                    CanvasGroup canvasGroup = item.GetComponent<CanvasGroup>();
                    bool blocksRaycasts = canvasGroup == null || canvasGroup.blocksRaycasts;
                    
                    Debug.Log($"   - {item.name}:");
                    Debug.Log($"     ✓ 활성화: {isActive}");
                    Debug.Log($"     ✓ 컴포넌트 enabled: {isEnabled}");
                    Debug.Log($"     ✓ 드래그 중: {isDragging}");
                    Debug.Log($"     ✓ Image 있음: {hasImage}");
                    Debug.Log($"     ✓ Sprite 있음: {hasSprite}");
                    Debug.Log($"     ✓ Raycast Target: {raycastTarget}");
                    Debug.Log($"     ✓ Canvas 있음: {hasCanvas}");
                    Debug.Log($"     ✓ Sorting Order: {sortingOrder}");
                    Debug.Log($"     ✓ Blocks Raycasts: {blocksRaycasts}");
                    
                    if (hasSprite)
                    {
                        Debug.Log($"     ✓ Sprite: {img.sprite.name}");
                    }
                    
                    // 문제가 있는 경우 경고
                    if (!isActive)
                    {
                        Debug.LogWarning($"     ⚠️ {item.name}이 비활성화되어 있습니다!");
                    }
                    if (!isEnabled)
                    {
                        Debug.LogWarning($"     ⚠️ {item.name}의 DragAndDropItem 컴포넌트가 비활성화되어 있습니다!");
                    }
                    if (!raycastTarget)
                    {
                        Debug.LogWarning($"     ⚠️ {item.name}의 Image가 raycastTarget이 아닙니다!");
                    }
                    if (!blocksRaycasts)
                    {
                        Debug.LogWarning($"     ⚠️ {item.name}이 raycast를 차단하지 않습니다!");
                    }
                }
            }
        }
        
        Debug.Log("=== ACC 디버그 완료 ===");
    }
    
    /// <summary>
    /// acc 아이템들을 강제로 드래그 가능하게 만듭니다
    /// </summary>
    [ContextMenu("Fix ACC Items Drag")]
    public void FixAccItemsDrag()
    {
        if (ClothingSpriteManager.Instance == null)
        {
            Debug.LogError("❌ ClothingSpriteManager.Instance가 null입니다!");
            return;
        }
        
        Debug.Log("🔧 ACC 아이템들 드래그 수정 중...");
        
        string[] accTypes = { "accessory", "acc", "acc1", "acc2" };
        int fixedCount = 0;
        
        foreach (string accType in accTypes)
        {
            DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(accType);
            
            foreach (DragAndDropItem item in items)
            {
                if (item != null)
                {
                    // 1. GameObject 활성화
                    if (!item.gameObject.activeInHierarchy)
                    {
                        item.gameObject.SetActive(true);
                        Debug.Log($"   ✅ {item.name} 활성화");
                    }
                    
                    // 2. DragAndDropItem 컴포넌트 활성화
                    if (!item.enabled)
                    {
                        item.enabled = true;
                        Debug.Log($"   ✅ {item.name} DragAndDropItem 활성화");
                    }
                    
                    // 3. Image raycastTarget 활성화
                    Image img = item.GetComponent<Image>();
                    if (img != null && !img.raycastTarget)
                    {
                        img.raycastTarget = true;
                        Debug.Log($"   ✅ {item.name} raycastTarget 활성화");
                    }
                    
                    // 4. CanvasGroup raycasts 활성화
                    CanvasGroup canvasGroup = item.GetComponent<CanvasGroup>();
                    if (canvasGroup != null && !canvasGroup.blocksRaycasts)
                    {
                        canvasGroup.blocksRaycasts = true;
                        Debug.Log($"   ✅ {item.name} blocksRaycasts 활성화");
                    }
                    
                    // 5. 강제로 interaction 재설정
                    item.ForceEnableInteraction();
                    
                    fixedCount++;
                }
            }
        }
        
        Debug.Log($"🔧 총 {fixedCount}개의 ACC 아이템이 수정되었습니다.");
    }
    
    /// <summary>
    /// acc1, acc2 클릭 불가 문제를 강력하게 해결합니다
    /// </summary>
    [ContextMenu("Force Fix ACC1 ACC2 Click Issues")]
    public void ForceFixAcc1Acc2ClickIssues()
    {
        if (ClothingSpriteManager.Instance != null)
        {
            ClothingSpriteManager.Instance.ForceFixAcc1Acc2ClickIssues();
        }
        else
        {
            Debug.LogError("❌ ClothingSpriteManager.Instance가 null입니다!");
        }
    }
    
    /// <summary>
    /// 실제로 acc1, acc2 아이템들이 생성되었는지 확인합니다
    /// </summary>
    [ContextMenu("Debug Check ACC Items Creation")]
    public void DebugCheckAccItemsCreation()
    {
        Debug.Log("=== ACC 아이템 생성 상태 확인 ===");
        
        // ClothingSpriteManager가 아직 초기화되지 않았다면 잠시 기다렸다가 다시 시도
        if (ClothingSpriteManager.Instance == null)
        {
            Debug.LogWarning("⚠️ ClothingSpriteManager.Instance가 아직 초기화되지 않았습니다. 0.5초 후 재시도...");
            Invoke(nameof(DebugCheckAccItemsCreation), 0.5f);
            return;
        }
        
        // 1. acc1Parent, acc2Parent 확인
        Transform[] acc1Parents = ClothingSpriteManager.Instance.acc1ItemParents;
        Transform[] acc2Parents = ClothingSpriteManager.Instance.acc2ItemParents;
        
        Debug.Log($"📂 acc1Parent 개수: {(acc1Parents != null ? acc1Parents.Length : 0)}");
        Debug.Log($"📂 acc2Parent 개수: {(acc2Parents != null ? acc2Parents.Length : 0)}");
        
        // acc1Parent, acc2Parent null 체크
        if (acc1Parents != null && acc1Parents.Length > 0)
        {
            Debug.Log($"🔍 acc1Parent 상태: {(acc1Parents[0] != null ? acc1Parents[0].name : "NULL!")}");
        }
        else
        {
            Debug.LogError("❌ acc1Parents가 null이거나 비어있습니다!");
        }
        
        if (acc2Parents != null && acc2Parents.Length > 0)
        {
            Debug.Log($"🔍 acc2Parent 상태: {(acc2Parents[0] != null ? acc2Parents[0].name : "NULL!")}");
        }
        else
        {
            Debug.LogError("❌ acc2Parents가 null이거나 비어있습니다!");
        }
        
        // 2. 각 부모의 자식 개수 확인
        if (acc1Parents != null)
        {
            foreach (Transform parent in acc1Parents)
            {
                if (parent != null)
                {
                    Debug.Log($"   - acc1Parent '{parent.name}': {parent.childCount}개 자식, 활성화={parent.gameObject.activeInHierarchy}");
                    
                    for (int i = 0; i < parent.childCount; i++)
                    {
                        Transform child = parent.GetChild(i);
                        DragAndDropItem dragItem = child.GetComponent<DragAndDropItem>();
                        Image img = child.GetComponent<Image>();
                        
                        Debug.Log($"     [{i}] {child.name}: DragItem={dragItem != null}, Image={img != null}, Active={child.gameObject.activeInHierarchy}");
                        
                        if (dragItem != null)
                        {
                            Debug.Log($"         DragItem Type: {dragItem.GetItemType()}, Enabled: {dragItem.enabled}");
                        }
                    }
                }
            }
        }
        
        if (acc2Parents != null)
        {
            foreach (Transform parent in acc2Parents)
            {
                if (parent != null)
                {
                    Debug.Log($"   - acc2Parent '{parent.name}': {parent.childCount}개 자식, 활성화={parent.gameObject.activeInHierarchy}");
                    
                    for (int i = 0; i < parent.childCount; i++)
                    {
                        Transform child = parent.GetChild(i);
                        DragAndDropItem dragItem = child.GetComponent<DragAndDropItem>();
                        Image img = child.GetComponent<Image>();
                        
                        Debug.Log($"     [{i}] {child.name}: DragItem={dragItem != null}, Image={img != null}, Active={child.gameObject.activeInHierarchy}");
                        
                        if (dragItem != null)
                        {
                            Debug.Log($"         DragItem Type: {dragItem.GetItemType()}, Enabled: {dragItem.enabled}");
                        }
                    }
                }
            }
        }
        
        // 3. GetItemsByType으로 확인
        string[] accTypes = { "acc1", "acc2" };
        foreach (string accType in accTypes)
        {
            DragAndDropItem[] items = ClothingSpriteManager.Instance.GetItemsByType(accType);
            Debug.Log($"🔍 GetItemsByType('{accType}') 결과: {items.Length}개");
            
            foreach (DragAndDropItem item in items)
            {
                if (item != null)
                {
                    Debug.Log($"   - {item.name}: Type={item.GetItemType()}, Active={item.gameObject.activeInHierarchy}, Enabled={item.enabled}");
                }
            }
        }
        
        Debug.Log("=== ACC 아이템 생성 확인 완료 ===");
    }

    #endregion

    #region DONE Button & Complete Popup

    /// <summary>
    /// DONE 버튼 설정을 초기화합니다
    /// </summary>
    private void SetupDoneButton()
    {
        if (doneButton != null)
        {
            doneButton.onClick.RemoveAllListeners();
            doneButton.onClick.AddListener(OnDoneButtonClicked);
            Debug.Log("✅ DONE 버튼 이벤트 연결 완료");
        }
        else
        {
            Debug.LogWarning("⚠️ DONE 버튼이 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// DONE 버튼 클릭 핸들러
    /// </summary>
    public void OnDoneButtonClicked()
    {
        Debug.Log("🎯 DONE 버튼 클릭됨!");

        // 옷을 알맞게 입혀서 검증 수행
        ValidateCurrentClothing();
    }

    /// <summary>
    /// "내 취향을 어떻게 알았지?+_+" 메시지 표시 후 1초 뒤에 완료 팝업을 활성화합니다
    /// </summary>
    private IEnumerator ShowCompletePopupAfterDelay()
    {
        Debug.Log("🎉 정답! 1초 후 완료 팝업 표시 예정...");

        // 1초 대기
        yield return new WaitForSeconds(1f);

        // 완료 팝업 활성화 및 애니메이션
        if (completePopup != null)
        {
            ShowCompletePopupWithAnimation();
        }
        else
        {
            Debug.LogWarning("⚠️ completePopup이 설정되지 않았습니다!");
        }
    }

    /// <summary>
    /// DOTween Pro를 사용하여 완료 팝업을 애니메이션과 함께 표시합니다
    /// </summary>
    private void ShowCompletePopupWithAnimation()
    {
        if (completePopup == null) return;

        Debug.Log("🎊 완료 팝업 DOTween 애니메이션 시작!");

        // 다음 캐릭터 unlock 로직 처리
        CharacterData nextCharacter = UnlockNextCharacter();

        // 팝업 UI 업데이트
        UpdateCompletePopupUI(nextCharacter);

        // 팝업 활성화
        completePopup.SetActive(true);

        // 팝업 RectTransform 크기 강제 설정 (안전장치)
        RectTransform popupRect = completePopup.GetComponent<RectTransform>();
        if (popupRect != null)
        {
            // 앵커를 중앙으로 설정하여 크기 계산을 정확하게 함
            popupRect.anchorMin = new Vector2(0.5f, 0.5f);
            popupRect.anchorMax = new Vector2(0.5f, 0.5f);
            popupRect.pivot = new Vector2(0.5f, 0.5f);
            
            // 화면 크기에 비례한 적절한 크기 설정
            Canvas rootCanvas = FindFirstObjectByType<Canvas>();
            if (rootCanvas != null)
            {
                RectTransform canvasRect = rootCanvas.GetComponent<RectTransform>();
                if (canvasRect != null)
                {
                    // 화면 크기의 70% 정도로 설정 (너무 크지 않게)
                    Vector2 canvasSize = canvasRect.sizeDelta;
                    Vector2 targetSize = canvasSize * 0.7f;
                    
                    // 최소/최대 크기 제한
                    targetSize.x = Mathf.Clamp(targetSize.x, 600f, 1200f);
                    targetSize.y = Mathf.Clamp(targetSize.y, 400f, 800f);
                    
                    popupRect.sizeDelta = targetSize;
                    Debug.Log($"📏 완료 팝업 크기 강제 설정: {popupRect.sizeDelta}");
                }
                else
                {
                    // fallback: 고정 크기 설정
                    popupRect.sizeDelta = new Vector2(800f, 600f);
                    Debug.Log("📏 완료 팝업 고정 크기 설정: 800x600");
                }
            }
            else
            {
                // fallback: 고정 크기 설정
                popupRect.sizeDelta = new Vector2(800f, 600f);
                Debug.Log("📏 완료 팝업 고정 크기 설정: 800x600");
            }
        }

        // 완료 팝업을 최상위 레이어로 강제 설정
        LayerOrderManager.SetStagePopupLayer(completePopup);
        Debug.Log("🔝 완료 팝업을 최상위 레이어로 설정했습니다!");

        // DONE 버튼 숨김
        if (doneButton != null)
        {
            doneButton.gameObject.SetActive(false);
            Debug.Log("🔒 DONE 버튼 숨김 처리 완료");
        }

        // 완료 팝업을 적절한 크기로 설정 (스케일 8배로 조정)
        Vector3 targetScale = new Vector3(8f, 8f, 8f); // 최종 목표 크기 (8, 8, 8) - 적절한 크기

        // 초기 상태 설정 (크기의 30%에서 시작)
        completePopup.transform.localScale = targetScale * 0.3f; // 8배 크기 기준 30%에서 시작
        
        CanvasGroup canvasGroup = completePopup.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
        {
            canvasGroup = completePopup.AddComponent<CanvasGroup>();
        }
        canvasGroup.alpha = 0f;

        Debug.Log($"🎯 완료 팝업 초기 스케일: {completePopup.transform.localScale}, 목표 스케일: {targetScale} (스케일 8배)");

        // DOTween 시퀀스 생성
        Sequence completeSequence = DOTween.Sequence();

        // 스케일 애니메이션 (팝업 효과) - 8배 크기 기준으로 자연스러운 팝업
        Vector3 overshootScale = targetScale * 1.05f; // 8배 크기보다 약간만 오버스케일 (5%)
        
        // 1단계: 빠르게 오버스케일까지 확대
        completeSequence.Append(completePopup.transform.DOScale(overshootScale, completeAnimationDuration * 0.6f)
            .SetEase(Ease.OutBack, 1.2f)); // OutBack으로 자연스러운 팝업 효과
            
        // 2단계: 페이드 인과 동시에 진행
        completeSequence.Join(canvasGroup.DOFade(1f, completeAnimationDuration * 0.6f)
            .SetEase(Ease.OutQuad));

        // 3단계: 최종 정확한 크기로 안정화
        completeSequence.Append(completePopup.transform.DOScale(targetScale, completeAnimationDuration * 0.4f)
            .SetEase(Ease.InOutQuad));

        // 애니메이션 완료 시 최종 상태 보장
        completeSequence.OnComplete(() => {
            // 최종 상태를 확실하게 설정 (8배 크기로)
            completePopup.transform.localScale = targetScale;
            canvasGroup.alpha = 1f;
            
            Debug.Log($"✨ 완료 팝업 애니메이션 완료! 최종 스케일: {completePopup.transform.localScale} (8배 크기)");
        });

        // 시퀀스 실행
        completeSequence.Play();
    }

    /// <summary>
    /// 완료 팝업을 숨깁니다 (필요시 사용)
    /// </summary>
    public void HideCompletePopup()
    {
        if (completePopup != null)
        {
            completePopup.SetActive(false);
            Debug.Log("📝 완료 팝업 숨김");
        }

        // DONE 버튼 다시 보이기
        if (doneButton != null)
        {
            doneButton.gameObject.SetActive(true);
            Debug.Log("🔓 DONE 버튼 다시 보이기 완료");
        }
    }

    /// <summary>
    /// 다음 캐릭터를 unlock하고 반환합니다
    /// </summary>
    /// <returns>unlock된 다음 캐릭터 데이터</returns>
    private CharacterData UnlockNextCharacter()
    {
        if (currentCharacterData == null)
        {
            Debug.LogWarning("⚠️ 현재 캐릭터 데이터가 없어서 unlock할 수 없습니다!");
            return null;
        }

        // 모든 캐릭터 데이터 로드
        CharacterData[] allCharacters = CharacterDisplayUtils.LoadAllCharacterData();
        if (allCharacters == null || allCharacters.Length == 0)
        {
            Debug.LogWarning("⚠️ 캐릭터 데이터를 로드할 수 없습니다!");
            return null;
        }

        // 현재 캐릭터의 번호 찾기
        int currentCharacterNumber = ExtractCharacterNumber(currentCharacterData.characterName);
        if (currentCharacterNumber <= 0)
        {
            Debug.LogWarning($"⚠️ 현재 캐릭터의 번호를 추출할 수 없습니다: {currentCharacterData.characterName}");
            return null;
        }

        // 다음 캐릭터 (현재 + 1) 찾기
        int nextCharacterNumber = currentCharacterNumber + 1;
        CharacterData nextCharacter = null;

        foreach (CharacterData character in allCharacters)
        {
            if (character != null)
            {
                int characterNumber = ExtractCharacterNumber(character.characterName);
                if (characterNumber == nextCharacterNumber)
                {
                    nextCharacter = character;
                    break;
                }
            }
        }

        if (nextCharacter == null)
        {
            Debug.Log($"🏁 다음 캐릭터(No.{nextCharacterNumber})가 없습니다. 마지막 캐릭터입니다!");
            return null;
        }

        // 다음 캐릭터가 이미 unlock되어 있다면 건너뛰기
        if (!nextCharacter.isLocked)
        {
            Debug.Log($"🔓 No.{nextCharacterNumber} {nextCharacter.characterName}는 이미 unlock되어 있습니다!");
            return nextCharacter;
        }

        // 다음 캐릭터 unlock
        nextCharacter.isLocked = false;
        Debug.Log($"🎉 No.{nextCharacterNumber} {nextCharacter.characterName}를 unlock했습니다!");

        // 캐릭터 데이터 저장 (필요시 구현)
        // CharacterDisplayUtils.SaveCharacterData(nextCharacter);

        return nextCharacter;
    }

    /// <summary>
    /// 완료 팝업의 UI 요소들을 업데이트합니다
    /// </summary>
    /// <param name="nextCharacter">unlock된 다음 캐릭터</param>
    private void UpdateCompletePopupUI(CharacterData nextCharacter)
    {
        if (nextCharacter == null)
        {
            // 마지막 캐릭터인 경우 - 현재 캐릭터 정보로 표시
            if (unlockMessageText != null)
            {
                unlockMessageText.text = "축하합니다. 모든 캐릭터의 등교 준비를 완벽하게 수행하셨습니다!";
            }
            
            if (currentCharacterData != null)
            {
                int currentCharacterNumber = ExtractCharacterNumber(currentCharacterData.characterName);
                
                // 텍스트2: 현재 캐릭터 이름
                if (unlockedCharacterNameText != null)
                {
                    unlockedCharacterNameText.text = $"\"No.{currentCharacterNumber} {currentCharacterData.characterName}\"";
                }
                
                // 스프라이트: 현재 캐릭터의 cha_0X_m 형식
                if (unlockedCharacterImage != null)
                {
                    Sprite characterSprite = CharacterDisplayUtils.LoadCharacterSprite(currentCharacterData);
                    if (characterSprite != null)
                    {
                        unlockedCharacterImage.sprite = characterSprite;
                        unlockedCharacterImage.color = Color.white;
                    }
                    else
                    {
                        unlockedCharacterImage.color = Color.clear; // 스프라이트가 없으면 투명하게
                    }
                }
            }
            else
            {
                // currentCharacterData가 없는 경우 기본값
                if (unlockedCharacterNameText != null)
                {
                    unlockedCharacterNameText.text = "완료!";
                }
                if (unlockedCharacterImage != null)
                {
                    unlockedCharacterImage.color = Color.clear; // 투명하게
                }
            }
            return;
        }

        int nextCharacterNumber = ExtractCharacterNumber(nextCharacter.characterName);

        // 텍스트1: 언락 메시지
        if (unlockMessageText != null)
        {
            string message = $"이제 \"No.{nextCharacterNumber} {nextCharacter.characterName}\"의 등교 준비를 도울 수 있습니다.\n\n친구들이 지각하지 않도록 도와주세요!";
            unlockMessageText.text = message;
        }

        // 텍스트2: 캐릭터 이름
        if (unlockedCharacterNameText != null)
        {
            unlockedCharacterNameText.text = $"\"No.{nextCharacterNumber} {nextCharacter.characterName}\"";
        }

        // 스프라이트: cha_0X_m 형식
        if (unlockedCharacterImage != null)
        {
            Sprite characterSprite = CharacterDisplayUtils.LoadCharacterSprite(nextCharacter);
            if (characterSprite != null)
            {
                unlockedCharacterImage.sprite = characterSprite;
                unlockedCharacterImage.color = Color.white;
            }
            else
            {
                Debug.LogWarning($"⚠️ {nextCharacter.characterName}의 캐릭터 스프라이트를 찾을 수 없습니다!");
                unlockedCharacterImage.color = Color.clear;
            }
        }

        Debug.Log($"🎨 완료 팝업 UI 업데이트 완료: {nextCharacter.characterName}");
    }

    /// <summary>
    /// AlbumPopup의 크기를 참조하여 반환합니다
    /// </summary>
    /// <returns>AlbumPopup의 크기</returns>
    private Vector3 GetAlbumPopupScale()
    {
        // AlbumPopupManager 찾기
        if (albumPopupManagerObject != null)
        {
            AlbumPopupManager albumManager = albumPopupManagerObject.GetComponent<AlbumPopupManager>();
            if (albumManager != null && albumManager.albumPopup != null)
            {
                Vector3 albumScale = albumManager.albumPopup.transform.localScale;
                Debug.Log($"📏 AlbumPopup 크기 참조: {albumScale}");
                return albumScale;
            }
        }

        // 기본값 반환
        Debug.LogWarning("⚠️ AlbumPopup을 찾을 수 없어 기본 크기 사용");
        return Vector3.one;
    }

    /// <summary>
    /// 완료 팝업의 X 버튼을 클릭했을 때 SelectScene으로 넘어갑니다
    /// </summary>
    public void OnCompletePopupCloseButtonClicked()
    {
        Debug.Log("❌ 완료 팝업 X 버튼 클릭됨 - SelectScene으로 이동");
        
        // 완료 팝업 숨김
        HideCompletePopup();
        
        // SelectScene으로 이동
        UnityEngine.SceneManagement.SceneManager.LoadScene("2SelectScene");
    }

    /// <summary>
    /// StagePopup의 현재 캐릭터 정보를 업데이트합니다
    /// </summary>
    private void UpdateStagePopupCharacterInfo()
    {
        if (currentCharacterData == null)
        {
            Debug.LogWarning("⚠️ 현재 캐릭터 데이터가 없어서 StagePopup을 업데이트할 수 없습니다!");
            return;
        }

        // 현재 캐릭터의 번호 추출
        int currentCharacterNumber = ExtractCharacterNumber(currentCharacterData.characterName);
        
        // 캐릭터 번호 텍스트 업데이트 (예: "No.1")
        if (stagePopupCharacterNumberText != null)
        {
            stagePopupCharacterNumberText.text = $"{currentCharacterNumber}";
            Debug.Log($"🔢 StagePopup 캐릭터 번호 업데이트: No.{currentCharacterNumber}");
        }
        else
        {
            Debug.LogWarning("⚠️ stagePopupCharacterNumberText가 설정되지 않았습니다!");
        }

        // 캐릭터 이름 텍스트 업데이트 (예: "주인혜")
        if (stagePopupCharacterNameText != null)
        {
            stagePopupCharacterNameText.text = currentCharacterData.characterName;
            Debug.Log($"👤 StagePopup 캐릭터 이름 업데이트: {currentCharacterData.characterName}");
        }
        else
        {
            Debug.LogWarning("⚠️ stagePopupCharacterNameText가 설정되지 않았습니다!");
        }
        
        // 배경색 변경 로직 추가 (StagePopup 업데이트 시에도)
        CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
        if (backgroundManager != null)
        {
            Debug.Log($"🎨 StagePopup 업데이트와 함께 배경색 변경: {currentCharacterNumber}번 캐릭터");
            backgroundManager.OnCharacterChanged(currentCharacterNumber);
        }
        else
        {
            Debug.LogError("❌ CharacterBackgroundManager를 찾을 수 없습니다! (StagePopup 업데이트)");
        }
    }

    /// <summary>
    /// StagePopup 캐릭터 정보를 수동으로 업데이트합니다 (외부 호출용)
    /// </summary>
    public void RefreshStagePopupCharacterInfo()
    {
        UpdateStagePopupCharacterInfo();
    }

    #endregion
}
