using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 캐릭터 팝업창의 의상 레이어들을 관리하는 클래스
/// CharacterData에 따라 적절한 레이어만 활성화하고 스프라이트를 적용합니다
/// </summary>
public class CharacterPopupManager : MonoBehaviour
{
    [Header("Popup References")]
    [Tooltip("전체 캐릭터 팝업 오브젝트")]
    public GameObject chaPopup;

    [Tooltip("큰 캐릭터 컨테이너 (cha_l)")]
    public GameObject chaLargeContainer;

    [Tooltip("팝업 닫기 X 버튼 (선택사항 - OnCloseButtonClick() 메서드와 연결)")]
    public Button closeButton;

    [Header("Character Sprite")]
    [Tooltip("메인 캐릭터 이미지 (cha_l의 배경)")]
    public Image mainCharacterImage;

    [Header("Anchor Settings")]
    [Tooltip("스프라이트 적용 시 앵커를 자동으로 조정할지 여부 (false 권장)")]
    public bool autoAdjustAnchors = false;

    [Header("Clothing Layer Objects")]
    [Tooltip("하의 레이어 1 (베이스)")]
    public GameObject chaLBottom1;
    public Image chaLBottom1Image;

    [Tooltip("하의 레이어 2 (상위)")]
    public GameObject chaLBottom2;
    public Image chaLBottom2Image;

    [Tooltip("상의 레이어 1 (베이스)")]
    public GameObject chaLTop1;
    public Image chaLTop1Image;

    [Tooltip("상의 레이어 2 (중간)")]
    public GameObject chaLTop2;
    public Image chaLTop2Image;

    [Tooltip("상의 레이어 3 (최상위)")]
    public GameObject chaLTop3;
    public Image chaLTop3Image;

    [Tooltip("양말 레이어")]
    public GameObject chaLSocks;
    public Image chaLSocksImage;

    [Tooltip("신발 레이어")]
    public GameObject chaLShoes;
    public Image chaLShoesImage;

    [Tooltip("악세서리 레이어 1")]
    public GameObject chaLAcc1;
    public Image chaLAcc1Image;

    [Tooltip("악세서리 레이어 2")]
    public GameObject chaLAcc2;
    public Image chaLAcc2Image;

    [Header("Display Settings")]
    [Tooltip("팝업이 표시될 때 사용할 Canvas Sorting Order (높을수록 위에 표시)")]
    public int popupSortingOrder = 2000;

    [Tooltip("팝업을 자동으로 최상위로 올릴지 여부")]
    public bool bringToFront = true;

    [Header("Debug")]
    [Tooltip("디버그 로그 출력 여부")]
    public bool enableDebugLog = true;

    // 현재 적용된 캐릭터 데이터
    private CharacterData currentCharacterData;

    #region Unity Lifecycle

    void Start()
    {
        // X 버튼 이벤트 자동 연결
        if (closeButton != null)
        {
            closeButton.onClick.AddListener(OnCloseButtonClick);
            
            if (enableDebugLog)
                Debug.Log("✅ 팝업 닫기 버튼 이벤트 연결 완료");
        }
        else if (enableDebugLog)
        {
            Debug.LogWarning("⚠️ 팝업 닫기 버튼이 설정되지 않았습니다. 수동으로 OnCloseButtonClick() 메서드를 버튼에 연결해주세요.");
        }

        // 팝업 시작 시 비활성화
        if (chaPopup != null)
        {
            chaPopup.SetActive(false);
        }
    }

    #endregion

    #region Public Methods

    /// <summary>
    /// 팝업을 표시하고 캐릭터 데이터를 적용합니다
    /// </summary>
    /// <param name="characterData">적용할 캐릭터 데이터</param>
    public void ShowPopupWithCharacter(CharacterData characterData)
    {
        if (characterData == null)
        {
            Debug.LogWarning("❌ CharacterData가 null입니다!");
            return;
        }

        currentCharacterData = characterData;

        if (enableDebugLog)
            Debug.Log($"🎭 팝업 표시: {characterData.characterName}");

        // 팝업 활성화
        SetPopupActive(true);

        // 캐릭터 적용
        ApplyCharacterToPopup(characterData);
    }

    /// <summary>
    /// 팝업을 숨깁니다
    /// </summary>
    public void HidePopup()
    {
        SetPopupActive(false);

        if (enableDebugLog)
            Debug.Log("🎭 팝업 숨김");
    }

    /// <summary>
    /// 팝업 활성/비활성 토글
    /// </summary>
    public void TogglePopup()
    {
        if (chaPopup != null)
        {
            bool isActive = chaPopup.activeInHierarchy;
            SetPopupActive(!isActive);
        }
    }

    /// <summary>
    /// 현재 표시된 캐릭터 데이터를 새로고침합니다
    /// </summary>
    public void RefreshCurrentCharacter()
    {
        if (currentCharacterData != null)
        {
            ApplyCharacterToPopup(currentCharacterData);
        }
        else
        {
            Debug.LogWarning("❌ 새로고침할 캐릭터 데이터가 없습니다!");
        }
    }

    /// <summary>
    /// 특정 캐릭터 이름으로 팝업을 업데이트합니다
    /// </summary>
    /// <param name="characterName">캐릭터 이름</param>
    public void ShowPopupWithCharacterName(string characterName)
    {
        CharacterData characterData = FindCharacterDataByName(characterName);
        if (characterData != null)
        {
            ShowPopupWithCharacter(characterData);
        }
        else
        {
            Debug.LogWarning($"❌ 캐릭터를 찾을 수 없습니다: {characterName}");
        }
    }

    /// <summary>
    /// 팝업이 현재 활성화되어 있는지 확인합니다
    /// </summary>
    public bool IsPopupActive()
    {
        return chaPopup != null && chaPopup.activeInHierarchy;
    }

    /// <summary>
    /// 현재 팝업에 표시된 캐릭터 데이터를 반환합니다
    /// </summary>
    public CharacterData GetCurrentCharacterData()
    {
        return currentCharacterData;
    }

    /// <summary>
    /// MainSceneManager에서 호출할 수 있는 통합 팝업 제어 메서드
    /// </summary>
    /// <param name="show">true면 표시, false면 숨김</param>
    /// <param name="characterData">표시할 캐릭터 데이터 (null이면 현재 캐릭터 유지)</param>
    public void SetPopupState(bool show, CharacterData characterData = null)
    {
        if (show)
        {
            if (characterData != null)
            {
                ShowPopupWithCharacter(characterData);
            }
            else if (currentCharacterData != null)
            {
                ShowPopupWithCharacter(currentCharacterData);
            }
            else
            {
                Debug.LogWarning("❌ 표시할 캐릭터 데이터가 없습니다!");
            }
        }
        else
        {
            HidePopup();
        }
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// 팝업의 활성/비활성 상태를 설정합니다
    /// </summary>
    private void SetPopupActive(bool active)
    {
        if (chaPopup != null)
        {
            chaPopup.SetActive(active);

            // 팝업을 표시할 때는 항상 최상위로 이동
            if (active && bringToFront)
            {
                BringPopupToFront();
            }
        }
    }

    /// <summary>
    /// 팝업을 최상위로 올립니다 (텍스트 위에 표시되도록)
    /// </summary>
    private void BringPopupToFront()
    {
        if (chaPopup == null) return;

        // 방법 1: 팝업에 Canvas 컴포넌트 추가 (가장 확실한 방법)
        Canvas popupCanvas = chaPopup.GetComponent<Canvas>();
        if (popupCanvas == null)
        {
            popupCanvas = chaPopup.AddComponent<Canvas>();
            
            // GraphicRaycaster도 함께 추가 (UI 상호작용을 위해 필요)
            if (chaPopup.GetComponent<GraphicRaycaster>() == null)
            {
                chaPopup.AddComponent<GraphicRaycaster>();
            }
        }

        // 항상 매우 높은 Sorting Order로 설정하여 확실하게 최상위에 표시
        popupCanvas.sortingOrder = 9999;  // 더 높은 값으로 설정
        popupCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
        popupCanvas.overrideSorting = true;

        // 방법 2: Transform 순서로도 최상위 이동
        chaPopup.transform.SetAsLastSibling();

        // 방법 3: 모든 부모 Canvas보다 확실히 위에 표시
        Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        int highestOrder = 0;
        foreach (Canvas canvas in allCanvases)
        {
            if (canvas != popupCanvas && canvas.sortingOrder > highestOrder)
            {
                highestOrder = canvas.sortingOrder;
            }
        }
        
        // 가장 높은 Order보다 더 높게 설정
        if (highestOrder >= popupCanvas.sortingOrder)
        {
            popupCanvas.sortingOrder = highestOrder + 100;
        }

        if (enableDebugLog)
            Debug.Log($"✅ 팝업을 최상위로 이동 완료 (Sorting Order: {popupCanvas.sortingOrder})");
    }

    /// <summary>
    /// 캐릭터 데이터를 팝업에 적용합니다
    /// </summary>
    /// <param name="characterData">적용할 캐릭터 데이터</param>
    private void ApplyCharacterToPopup(CharacterData characterData)
    {
        if (characterData == null) return;

        if (enableDebugLog)
            Debug.Log($"🎨 캐릭터 적용 시작: {characterData.characterName}");

        // 메인 캐릭터 이미지 적용
        ApplyMainCharacterSprite(characterData);

        // 각 의상 레이어 적용
        ApplyClothingLayer(chaLBottom1, chaLBottom1Image, characterData.largeBottom1Sprite, "Bottom1");
        ApplyClothingLayer(chaLBottom2, chaLBottom2Image, characterData.largeBottom2Sprite, "Bottom2");

        ApplyClothingLayer(chaLTop1, chaLTop1Image, characterData.largeTop1Sprite, "Top1");
        ApplyClothingLayer(chaLTop2, chaLTop2Image, characterData.largeTop2Sprite, "Top2");
        ApplyClothingLayer(chaLTop3, chaLTop3Image, characterData.largeTop3Sprite, "Top3");

        ApplyClothingLayer(chaLSocks, chaLSocksImage, characterData.largeSocksSprite, "Socks");
        ApplyClothingLayer(chaLShoes, chaLShoesImage, characterData.largeShoesSprite, "Shoes");

        ApplyClothingLayer(chaLAcc1, chaLAcc1Image, characterData.largeAcc1Sprite, "Acc1");
        ApplyClothingLayer(chaLAcc2, chaLAcc2Image, characterData.largeAcc2Sprite, "Acc2");

        if (enableDebugLog)
            Debug.Log($"✅ 캐릭터 적용 완료: {characterData.characterName}");
    }

    /// <summary>
    /// 메인 캐릭터 스프라이트를 적용합니다
    /// </summary>
    private void ApplyMainCharacterSprite(CharacterData characterData)
    {
        if (mainCharacterImage == null) return;

        // Large Character Sprite 우선, 없으면 일반 Character Sprite 사용
        Sprite characterSprite = characterData.largeCharacterSprite ?? characterData.characterSprite;

        if (characterSprite != null)
        {
            mainCharacterImage.sprite = characterSprite;
            mainCharacterImage.SetNativeSize(); // native size 적용
            
            // 옵션이 활성화된 경우에만 앵커 포인트 조정
            if (autoAdjustAnchors)
            {
                RectTransform rectTransform = mainCharacterImage.GetComponent<RectTransform>();
                if (rectTransform != null)
                {
                    // 앵커를 bottom-center로 설정
                    rectTransform.anchorMin = new Vector2(0.5f, 0f);
                    rectTransform.anchorMax = new Vector2(0.5f, 0f);
                    rectTransform.pivot = new Vector2(0.5f, 0f);
                    
                    if (enableDebugLog)
                        Debug.Log($"✅ 메인 캐릭터 앵커 포인트를 Bottom으로 설정");
                }
            }
            
            mainCharacterImage.gameObject.SetActive(true);

            if (enableDebugLog)
                Debug.Log($"✅ 메인 캐릭터 스프라이트 적용: {characterSprite.name}");
        }
        else
        {
            mainCharacterImage.gameObject.SetActive(false);
            Debug.LogWarning($"❌ {characterData.characterName}의 캐릭터 스프라이트가 없습니다!");
        }
    }

    /// <summary>
    /// 개별 의상 레이어에 스프라이트를 적용합니다
    /// </summary>
    /// <param name="layerObject">레이어 GameObject</param>
    /// <param name="layerImage">레이어 Image 컴포넌트</param>
    /// <param name="sprite">적용할 스프라이트</param>
    /// <param name="layerName">레이어 이름 (디버그용)</param>
    private void ApplyClothingLayer(GameObject layerObject, Image layerImage, Sprite sprite, string layerName)
    {
        if (layerObject == null)
        {
            if (enableDebugLog)
                Debug.LogWarning($"❌ {layerName} GameObject가 설정되지 않았습니다!");
            return;
        }

        if (sprite != null)
        {
            // 스프라이트가 있으면 활성화하고 적용
            layerObject.SetActive(true);

            if (layerImage != null)
            {
                layerImage.sprite = sprite;
                layerImage.SetNativeSize(); // native size 적용
                
                // 옵션이 활성화된 경우에만 앵커 포인트 조정
                if (autoAdjustAnchors)
                {
                    RectTransform rectTransform = layerImage.GetComponent<RectTransform>();
                    if (rectTransform != null)
                    {
                        // 앵커를 bottom-center로 설정
                        rectTransform.anchorMin = new Vector2(0.5f, 0f);
                        rectTransform.anchorMax = new Vector2(0.5f, 0f);
                        rectTransform.pivot = new Vector2(0.5f, 0f);
                    }
                }
                
                if (enableDebugLog)
                    Debug.Log($"✅ {layerName} 레이어 활성화: {sprite.name}");
            }
            else
            {
                Debug.LogWarning($"❌ {layerName} Image 컴포넌트가 설정되지 않았습니다!");
            }
        }
        else
        {
            // 스프라이트가 없으면 비활성화
            layerObject.SetActive(false);

            if (enableDebugLog)
                Debug.Log($"⚪ {layerName} 레이어 비활성화 (스프라이트 없음)");
        }
    }

    /// <summary>
    /// 캐릭터 이름으로 CharacterData를 찾습니다
    /// </summary>
    private CharacterData FindCharacterDataByName(string characterName)
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

    #region Button Event Handlers

    /// <summary>
    /// 버튼 이벤트: 팝업 닫기
    /// </summary>
    public void OnCloseButtonClick()
    {
        HidePopup();
    }

    /// <summary>
    /// 버튼 이벤트: 현재 선택된 캐릭터로 팝업 표시
    /// </summary>
    public void OnShowCurrentCharacterButtonClick()
    {
        // MainSceneManager에서 현재 캐릭터 데이터 가져오기
        MainSceneManager mainManager = FindFirstObjectByType<MainSceneManager>();
        if (mainManager != null)
        {
            CharacterData currentCharacter = mainManager.GetCurrentCharacterData();
            if (currentCharacter != null)
            {
                ShowPopupWithCharacter(currentCharacter);
            }
            else
            {
                Debug.LogWarning("❌ 현재 선택된 캐릭터가 없습니다!");
            }
        }
        else
        {
            Debug.LogWarning("❌ MainSceneManager를 찾을 수 없습니다!");
        }
    }

    /// <summary>
    /// 버튼 이벤트: 특정 캐릭터로 팝업 표시 (cha1)
    /// </summary>
    public void OnShowCha1ButtonClick() => ShowPopupWithCharacterName("cha1");

    /// <summary>
    /// 버튼 이벤트: 특정 캐릭터로 팝업 표시 (cha2)
    /// </summary>
    public void OnShowCha2ButtonClick() => ShowPopupWithCharacterName("cha2");

    /// <summary>
    /// 버튼 이벤트: 특정 캐릭터로 팝업 표시 (cha3)
    /// </summary>
    public void OnShowCha3ButtonClick() => ShowPopupWithCharacterName("cha3");

    /// <summary>
    /// 버튼 이벤트: 특정 캐릭터로 팝업 표시 (cha4)
    /// </summary>
    public void OnShowCha4ButtonClick() => ShowPopupWithCharacterName("cha4");

    #endregion

    #region Debug Methods

    /// <summary>
    /// 현재 레이어들의 상태를 로그로 출력합니다
    /// </summary>
    public void LogCurrentLayerStatus()
    {
        if (!enableDebugLog) return;

        Debug.Log("=== 팝업 레이어 상태 ===");
        LogLayerStatus("Bottom1", chaLBottom1);
        LogLayerStatus("Bottom2", chaLBottom2);
        LogLayerStatus("Top1", chaLTop1);
        LogLayerStatus("Top2", chaLTop2);
        LogLayerStatus("Top3", chaLTop3);
        LogLayerStatus("Socks", chaLSocks);
        LogLayerStatus("Shoes", chaLShoes);
        LogLayerStatus("Acc1", chaLAcc1);
        LogLayerStatus("Acc2", chaLAcc2);
        Debug.Log("=====================");
    }

    /// <summary>
    /// 개별 레이어의 상태를 로그로 출력합니다
    /// </summary>
    private void LogLayerStatus(string layerName, GameObject layerObject)
    {
        if (layerObject != null)
        {
            bool isActive = layerObject.activeInHierarchy;
            Debug.Log($"   {layerName}: {(isActive ? "활성" : "비활성")}");
        }
        else
        {
            Debug.Log($"   {layerName}: 설정되지 않음");
        }
    }

    #endregion
}
