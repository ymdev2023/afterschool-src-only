using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Collections; // 코루틴을 위해 추가

public class DragAndDropItem : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    [Header("Drag Settings")]
    [Tooltip("드래그 시 크기 배율")]
    [Range(0.8f, 1.5f)]
    public float dragScale = 1.0f;

    [Tooltip("스냅 애니메이션 시간 (초)")]
    [Range(0.1f, 1f)]
    public float snapAnimationDuration = 0.3f;

    [Tooltip("원위치 복귀 애니메이션 시간 (초)")]
    [Range(0.1f, 1f)]
    public float returnAnimationDuration = 0.5f;

    [Header("Item Info")]
    [Tooltip("자동으로 스프라이트 이름에서 파싱됩니다")]
    public string itemType = ""; // top, bottom, shoes, socks

    [Tooltip("자동으로 스프라이트 이름에서 파싱됩니다")]
    public string characterNumber = ""; // 01, 02, 03 등

    [Header("ClothingSpriteManager Integration")]
    [Tooltip("의상 타입 (top, bottom, shoes, socks, acc1, acc2)")]
    public string clothingType = "";
    
    [Tooltip("정답 아이템 여부")]
    public bool isCorrectItem = false;
    
    [Tooltip("스프라이트 이름")]
    public string spriteName = "";

    [Header("Visual Effects")]
    [Tooltip("드래그 중 그림자 효과 - 사용 안함")]
    public bool enableDropShadow = false;

    [Tooltip("그림자 색상")]
    public Color shadowColor = new Color(0, 0, 0, 0.3f);

    private Image itemImage;
    private Canvas canvas;
    private CanvasGroup canvasGroup;
    private RectTransform rectTransform;
    private Vector3 originalPosition;
    private Vector3 originalScale;
    private Transform originalParent;
    private MainSceneManager mainSceneManager;
    private bool isDragging = false;
    private Vector2 dragOffset; // 드래그 시작 시 마우스와 오브젝트 중심 간의 오프셋
    // shadowImage 변수는 더 이상 사용하지 않음

    void Awake()
    {
        itemImage = GetComponent<Image>();
        rectTransform = GetComponent<RectTransform>();
        canvas = GetComponentInParent<Canvas>();
        mainSceneManager = FindFirstObjectByType<MainSceneManager>();

        // CanvasGroup 추가 (투명도 제어용)
        canvasGroup = GetComponent<CanvasGroup>();
        if (canvasGroup == null)
        {
            canvasGroup = gameObject.AddComponent<CanvasGroup>();
        }

        // 스프라이트 이름에서 정보 파싱
        ParseItemInfo();

        // 그림자 효과는 사용하지 않음
    }

    void Start()
    {
        // 원위치 정보 저장 (중요: 시작할 때의 실제 위치와 부모)
        originalPosition = rectTransform.anchoredPosition;
        originalParent = transform.parent;
        originalScale = rectTransform.localScale;

        // 원위치 정보 검증
        if (originalParent == null)
        {
            Debug.LogWarning($"⚠️ {name}의 원래 부모가 null입니다! 현재 부모로 설정합니다.");
            originalParent = transform.parent;
        }

        // Canvas 초기 설정
        SetupCanvasForNormalState();

        // Start에서 한 번 더 파싱 시도 (Awake에서 스프라이트가 설정되지 않았을 수 있음)
        if (string.IsNullOrEmpty(itemType) || string.IsNullOrEmpty(characterNumber))
        {
            ParseItemInfo();
        }

        // 의상 아이템의 스프라이트를 native size로 설정
        Image itemImage = GetComponent<Image>();
        if (itemImage != null && itemImage.sprite != null)
        {
            itemImage.SetNativeSize();
            Debug.Log($"🎽 의상 아이템 {name}의 스프라이트를 native size로 초기화: {itemImage.sprite.name}");
        }

        // 초기 상태 로그
        Debug.Log($"🔧 {name} 초기화 완료 - 원위치: {originalPosition}, 부모: {(originalParent != null ? originalParent.name : "null")}");
        
        // acc1, acc2 아이템의 경우 추가 검증
        if (itemType == "acc1" || itemType == "acc2")
        {
            Debug.Log($"🔍 ACC 아이템 초기화 검증: {name} ({itemType})");
            Debug.Log($"   - Image raycastTarget: {(itemImage != null ? itemImage.raycastTarget.ToString() : "null")}");
            Debug.Log($"   - CanvasGroup 설정: blocksRaycasts={canvasGroup.blocksRaycasts}, interactable={canvasGroup.interactable}, alpha={canvasGroup.alpha}");
            Debug.Log($"   - DragAndDropItem enabled: {enabled}");
            Debug.Log($"   - GameObject active: {gameObject.activeInHierarchy}");
            
            // Canvas 확인
            Canvas itemCanvas = GetComponent<Canvas>();
            if (itemCanvas != null)
            {
                Debug.Log($"   - Canvas sortingOrder: {itemCanvas.sortingOrder}, overrideSorting: {itemCanvas.overrideSorting}");
            }
            else
            {
                Debug.Log($"   - Canvas: 없음");
            }
        }
    }

    /// <summary>
    /// 스프라이트 파일명에서 아이템 정보를 파싱합니다
    /// 지원하는 패턴:
    /// - "cha_01_l_shoes" -> itemType="shoes", characterNumber="01"
    /// - "cha_02_top" -> itemType="top", characterNumber="02"
    /// - "cha_03_bottom" -> itemType="bottom", characterNumber="03"
    /// </summary>
    void ParseItemInfo()
    {
        if (itemImage != null && itemImage.sprite != null)
        {
            string spriteName = itemImage.sprite.name.ToLower();
            Debug.Log($"DragAndDropItem: 스프라이트 이름 파싱 중 - {spriteName}");

            // 기본값 초기화
            itemType = "";
            characterNumber = "";

            // 패턴 1: cha_XX_l_type (예: cha_01_l_shoes, cha_03_l_acc2_tie)
            if (spriteName.Contains("cha_") && spriteName.Contains("_l_"))
            {
                string[] parts = spriteName.Split('_');
                if (parts.Length >= 4)
                {
                    characterNumber = parts[1]; // 01, 02, 03 등
                    
                    // acc1, acc2가 포함된 경우 특별 처리
                    if (spriteName.Contains("acc1"))
                    {
                        itemType = "acc1";
                    }
                    else if (spriteName.Contains("acc2"))
                    {
                        itemType = "acc2";
                    }
                    else
                    {
                        itemType = parts[3]; // shoes, top, bottom, socks
                    }
                    
                    Debug.Log($"✅ 패턴1 파싱 성공 - Character: {characterNumber}, Type: {itemType}");
                }
            }
            // 패턴 2: cha_XX_type (예: cha_02_top, cha_03_acc1, cha_03_acc2)
            else if (spriteName.Contains("cha_"))
            {
                string[] parts = spriteName.Split('_');
                if (parts.Length >= 3)
                {
                    characterNumber = parts[1]; // 01, 02, 03 등
                    
                    // acc1, acc2가 포함된 경우 특별 처리
                    if (spriteName.Contains("acc1"))
                    {
                        itemType = "acc1";
                    }
                    else if (spriteName.Contains("acc2"))
                    {
                        itemType = "acc2";
                    }
                    else
                    {
                        string lastPart = parts[parts.Length - 1]; // 마지막 부분이 타입

                        // 유효한 타입인지 확인
                        if (IsValidItemType(lastPart))
                        {
                            itemType = lastPart;
                        }
                    }
                    
                    if (!string.IsNullOrEmpty(itemType))
                    {
                        Debug.Log($"✅ 패턴2 파싱 성공 - Character: {characterNumber}, Type: {itemType}");
                    }
                }
            }

            // 타입을 찾지 못했다면 파일명에서 키워드 검색 (구체적인 것부터 먼저 체크)
            if (string.IsNullOrEmpty(itemType))
            {
                // 먼저 구체적인 패턴부터 체크 (top3, top2, bottom2를 top, bottom보다 먼저)
                if (spriteName.Contains("top3")) itemType = "top3";
                else if (spriteName.Contains("top2")) itemType = "top2";
                else if (spriteName.Contains("bottom2")) itemType = "bottom2";
                else if (spriteName.Contains("acc1")) itemType = "acc1"; // acc1은 acc1 타입
                else if (spriteName.Contains("acc2")) itemType = "acc2"; // acc2는 acc2 타입
    
                else if (spriteName.Contains("top")) itemType = "top";
                else if (spriteName.Contains("bottom")) itemType = "bottom";
                else if (spriteName.Contains("shoes")) itemType = "shoes";
                else if (spriteName.Contains("socks")) itemType = "socks";

                if (!string.IsNullOrEmpty(itemType))
                {
                    Debug.Log($"✅ 키워드 검색으로 타입 발견 - Type: {itemType}");
                }
            }

            // 캐릭터 번호를 찾지 못했다면 숫자 패턴 검색
            if (string.IsNullOrEmpty(characterNumber))
            {
                var match = System.Text.RegularExpressions.Regex.Match(spriteName, @"\d{2}");
                if (match.Success)
                {
                    characterNumber = match.Value;
                    Debug.Log($"✅ 숫자 패턴으로 캐릭터 번호 발견 - Number: {characterNumber}");
                }
            }

            // 파싱 결과 검증
            if (string.IsNullOrEmpty(itemType) || string.IsNullOrEmpty(characterNumber))
            {
                Debug.LogWarning($"⚠️ 파싱 실패: {spriteName} -> Type: '{itemType}', Number: '{characterNumber}'");
                Debug.LogWarning("💡 파일명을 다음 패턴으로 변경하세요: cha_01_l_shoes 또는 cha_02_top");
            }
            else
            {
                Debug.Log($"🎯 최종 파싱 결과 - {spriteName} -> Character: {characterNumber}, Type: {itemType}");
            }
        }
        else
        {
            Debug.LogWarning("❌ Image 컴포넌트나 Sprite가 없습니다!");
        }
    }

    /// <summary>
    /// 유효한 아이템 타입인지 확인합니다
    /// </summary>
    bool IsValidItemType(string type)
    {
        string[] validTypes = { "top", "top2", "top3", "bottom", "bottom2", "shoes", "socks", "acc1", "acc2" };
        foreach (string validType in validTypes)
        {
            if (type == validType)
                return true;
        }
        return false;
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        Debug.Log($"시작 드래그: {itemType} ({characterNumber})");
        
        // acc1, acc2 아이템의 경우 추가 디버깅
        if (itemType == "acc1" || itemType == "acc2")
        {
            Debug.Log($"🔍 ACC 아이템 드래그 시작: {name}");
            Debug.Log($"   - 현재 위치: {rectTransform.anchoredPosition}");
            Debug.Log($"   - 부모: {(transform.parent != null ? transform.parent.name : "null")}");
            Debug.Log($"   - CanvasGroup 상태: blocksRaycasts={canvasGroup.blocksRaycasts}, alpha={canvasGroup.alpha}");
            Debug.Log($"   - 활성화 상태: {gameObject.activeInHierarchy}");
        }

        isDragging = true;

        // 드래그 오프셋을 0으로 설정하여 아이템이 커서 중앙에 오도록 함
        dragOffset = Vector2.zero;

        // 투명도는 변경하지 않음 (항상 1.0 유지)
        canvasGroup.alpha = 1.0f;

        // 크기는 변경하지 않음 (원래 크기 유지)
        // rectTransform.localScale = originalScale * dragScale;

        // 레이캐스트 비활성화 (다른 UI 요소와 상호작용 방지)
        canvasGroup.blocksRaycasts = false;

        // 아이템을 캔버스의 최상위로 이동 (캐릭터보다 앞에 오도록)
        transform.SetAsLastSibling();

        // Canvas 컴포넌트로 캐릭터보다 앞에 표시
        SetupCanvasForNormalState();

        // 메인 씬 매니저에 드래그 시작 알림
        if (mainSceneManager != null)
        {
            mainSceneManager.OnItemDragStart(this);
        }
    }

    public void OnDrag(PointerEventData eventData)
    {
        // 최상위 Canvas 찾기
        Canvas rootCanvas = canvas;
        while (rootCanvas.rootCanvas != rootCanvas)
        {
            rootCanvas = rootCanvas.rootCanvas;
        }

        // 마우스 위치를 최상위 캔버스 로컬 좌표로 변환
        Vector2 localPoint;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            rootCanvas.transform as RectTransform,
            eventData.position,
            eventData.pressEventCamera,
            out localPoint
        );

        // 현재 아이템의 부모 캔버스로 좌표 변환
        Vector2 targetPosition;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(
            rectTransform.parent as RectTransform,
            eventData.position,
            eventData.pressEventCamera,
            out targetPosition
        );

        // 아이템의 중심이 정확히 마우스 커서 위치에 오도록 설정
        rectTransform.anchoredPosition = targetPosition;

        // 메인 씬 매니저에 드래그 위치 업데이트
        if (mainSceneManager != null)
        {
            mainSceneManager.OnItemDragUpdate(this, eventData.position);
        }
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        Debug.Log($"드래그 끝: {itemType} ({characterNumber})");

        // 즉시 드래그 상태를 false로 설정 (stuck 방지)
        isDragging = false;

        // 기본 상태 복원
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;

        // Canvas 설정 정리
        SetupCanvasForNormalState();

        // 메인 씬 매니저에 드래그 종료 알림
        bool wasPlaced = false;
        if (mainSceneManager != null)
        {
            wasPlaced = mainSceneManager.OnItemDragEnd(this, eventData.position);
        }

        // 배치되지 않았으면 원래 위치로 복귀 (즉시 실행)
        if (!wasPlaced)
        {
            Debug.Log($"⚠️ {itemType} 아이템이 슬롯에 배치되지 않아 원위치로 복귀합니다.");
            ReturnToOriginalPositionImmediate();
        }
        else
        {
            Debug.Log($"✅ {itemType} 아이템이 슬롯에 성공적으로 배치되었습니다.");
        }
    }

    /// <summary>
    /// 원래 위치로 되돌립니다 (애니메이션 포함)
    /// </summary>
    public void ReturnToOriginalPosition()
    {
        Debug.Log($"🔄 {itemType} 아이템 원위치 복귀 시작 - 현재 위치: {rectTransform.anchoredPosition}, 목표 위치: {originalPosition}");
        
        // 즉시 상태 초기화 (stuck 방지)
        isDragging = false;
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;
        
        // 오브젝트가 활성화되어 있을 때만 Coroutine 시작
        if (gameObject.activeInHierarchy)
        {
            StartCoroutine(ReturnToOriginalCoroutine());
        }
        else
        {
            // 비활성화된 상태라면 즉시 위치 설정
            if (originalParent != null)
            {
                transform.SetParent(originalParent);
                rectTransform.anchoredPosition = originalPosition;
                SetupCanvasForNormalState();
            }
        }
    }

    /// <summary>
    /// 원래 위치로 즉시 되돌립니다 (애니메이션 없음, stuck 방지용)
    /// </summary>
    private void ReturnToOriginalPositionImmediate()
    {
        Debug.Log($"🔄 {itemType} 아이템 즉시 원위치 복귀 - 현재 위치: {rectTransform.anchoredPosition}, 목표 위치: {originalPosition}");
        
        // 상태 초기화
        isDragging = false;
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;

        // 원래 부모가 유효한지 확인
        if (originalParent == null)
        {
            Debug.LogWarning($"⚠️ {name}의 originalParent가 null입니다!");
            return;
        }

        // 부모 복원
        transform.SetParent(originalParent);
        
        // 위치 복원
        rectTransform.anchoredPosition = originalPosition;
        
        // Canvas 설정 복원
        SetupCanvasForNormalState();
        
        Debug.Log($"↩️ {itemType} 아이템이 즉시 원래 위치로 복구되었습니다. (부모: {originalParent.name})");
    }

    /// <summary>
    /// 특정 슬롯에 배치합니다
    /// </summary>
    public void PlaceInSlot(Transform slot)
    {
        if (slot == null)
        {
            Debug.LogWarning($"⚠️ {itemType} 아이템을 null 슬롯에 배치하려고 합니다!");
            return;
        }

        // 슬롯에 배치
        transform.SetParent(slot);
        rectTransform.anchoredPosition = Vector2.zero;

        // 상태 초기화
        isDragging = false;
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;

        // Canvas 설정
        SetupCanvasForNormalState();

        // 의상 아이템 스프라이트를 native size로 설정
        Image itemImage = GetComponent<Image>();
        if (itemImage != null && itemImage.sprite != null)
        {
            itemImage.SetNativeSize();
            Debug.Log($"🎽 {itemType} 아이템의 스프라이트를 native size로 설정: {itemImage.sprite.name}");
        }

        Debug.Log($"✅ {itemType} 아이템이 {slot.name} 슬롯에 성공적으로 배치되었습니다.");
    }

    /// <summary>
    /// 아이템 타입 반환
    /// </summary>
    public string GetItemType()
    {
        return itemType;
    }

    /// <summary>
    /// 캐릭터 번호 반환
    /// </summary>
    public string GetCharacterNumber()
    {
        return characterNumber;
    }

    /// <summary>
    /// 아이템의 스프라이트 반환
    /// </summary>
    public Sprite GetSprite()
    {
        return itemImage != null ? itemImage.sprite : null;
    }

    /// <summary>
    /// 수동으로 아이템 정보를 재파싱합니다 (Inspector나 외부에서 호출 가능)
    /// </summary>
    public void ReparseItemInfo()
    {
        ParseItemInfo();
    }

    /// <summary>
    /// 아이템 정보가 유효한지 확인합니다
    /// </summary>
    public bool IsItemInfoValid()
    {
        return !string.IsNullOrEmpty(itemType) && !string.IsNullOrEmpty(characterNumber);
    }

    /// <summary>
    /// 아이템 정보를 수동으로 설정합니다
    /// </summary>
    public void SetItemInfo(string newItemType, string newCharacterNumber)
    {
        itemType = newItemType;
        characterNumber = newCharacterNumber;
        Debug.Log($"수동 설정: {name} -> Type: {itemType}, Character: {characterNumber}");
    }

    /// <summary>
    /// 아이템 정보를 직접 설정합니다 (ClothingSpriteManager에서 사용)
    /// </summary>
    /// <param name="charNumber">캐릭터 번호 (1, 2, 3, 4 등)</param>
    /// <param name="clothingType">의상 타입 (top, bottom, shoes, socks, accessory)</param>
    public void SetItemInfo(int charNumber, string clothingType)
    {
        // 캐릭터 번호를 2자리 형식으로 변환 (1 -> "01", 2 -> "02")
        characterNumber = charNumber.ToString("D2");
        itemType = clothingType.ToLower();

        Debug.Log($"🔧 아이템 정보 직접 설정: Character={characterNumber}, Type={itemType}");
    }

    /// <summary>
    /// 캐릭터 번호를 정수로 반환합니다
    /// </summary>
    public int GetCharacterNumberAsInt()
    {
        if (int.TryParse(characterNumber, out int number))
        {
            return number;
        }
        return 1; // 기본값
    }

    /// <summary>
    /// 부드러운 스냅 애니메이션
    /// </summary>
    public void AnimateToSlot(Transform targetSlot)
    {
        if (targetSlot == null) return;

        StartCoroutine(SnapToSlotCoroutine(targetSlot));
    }

    /// <summary>
    /// 스냅 애니메이션 코루틴
    /// </summary>
    private IEnumerator SnapToSlotCoroutine(Transform targetSlot)
    {
        Vector3 startPos = rectTransform.anchoredPosition;
        Vector3 targetPos = Vector3.zero; // 슬롯의 로컬 좌표계에서 중앙
        Transform originalParentTemp = transform.parent;

        // 부모 변경
        transform.SetParent(targetSlot);

        float elapsedTime = 0f;
        while (elapsedTime < snapAnimationDuration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / snapAnimationDuration;

            // Ease-out 애니메이션 곡선
            t = 1f - Mathf.Pow(1f - t, 3f);

            rectTransform.anchoredPosition = Vector3.Lerp(startPos, targetPos, t);

            yield return null;
        }

        // 최종 위치 설정
        rectTransform.anchoredPosition = targetPos;

        // 상태 정리
        isDragging = false;
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true; // 레이캐스트 활성화
        // 크기는 원래 크기 유지 (변경하지 않음)
        // rectTransform.localScale = originalScale;

        // 배치된 아이템은 캐릭터 위에 렌더링되도록 Canvas 설정 유지
        Canvas itemCanvas = GetComponent<Canvas>();
        if (itemCanvas == null)
        {
            itemCanvas = gameObject.AddComponent<Canvas>();
        }
        itemCanvas.overrideSorting = true;
        itemCanvas.sortingOrder = GetSortingOrderForItemType(GetItemType()); // 타입별 적절한 순서 사용

        Debug.Log($"✨ {itemType} 아이템이 {targetSlot.name} 슬롯에 부드럽게 배치되었습니다. (렌더링 순서: {itemCanvas.sortingOrder})");
    }

    /// <summary>
    /// 원위치 복귀 애니메이션 코루틴
    /// </summary>
    private IEnumerator ReturnToOriginalCoroutine()
    {
        Vector3 startPos = rectTransform.anchoredPosition;

        // 원래 부모가 유효한지 확인
        if (originalParent == null)
        {
            Debug.LogWarning($"⚠️ {name}의 originalParent가 null입니다. 현재 부모 유지: {(transform.parent != null ? transform.parent.name : "null")}");
            yield break;
        }

        // 원래 부모가 비활성화되어 있으면 활성화
        if (!originalParent.gameObject.activeInHierarchy)
        {
            Debug.Log($"🔧 원래 부모 활성화: {originalParent.name}");
            originalParent.gameObject.SetActive(true);
        }

        // 부모 변경
        transform.SetParent(originalParent);

        // 즉시 Canvas 설정 정리
        SetupCanvasForNormalState();

        float elapsedTime = 0f;
        while (elapsedTime < returnAnimationDuration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / returnAnimationDuration;

            // Ease-out 애니메이션 곡선
            t = 1f - Mathf.Pow(1f - t, 2f);

            rectTransform.anchoredPosition = Vector3.Lerp(startPos, originalPosition, t);

            yield return null;
        }

        // 최종 상태 설정
        rectTransform.anchoredPosition = originalPosition;
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;
        isDragging = false;

        // 최상위로 이동
        transform.SetAsLastSibling();

        Debug.Log($"↩️ {itemType} 아이템이 원래 위치로 부드럽게 돌아갔습니다. (부모: {originalParent.name})");
    }

    /// <summary>
    /// 햅틱 피드백 (모바일용)
    /// </summary>
    private void TriggerHapticFeedback()
    {
#if UNITY_ANDROID || UNITY_IOS
        if (Application.isMobilePlatform)
        {
            Handheld.Vibrate(); // 간단한 진동
        }
#endif
    }

    /// <summary>
    /// 아이템이 현재 드래그 중인지 확인
    /// </summary>
    public bool IsDragging()
    {
        return isDragging;
    }

    /// <summary>
    /// Canvas를 정상 상태로 설정하는 헬퍼 메서드
    /// </summary>
    private void SetupCanvasForNormalState()
    {
        Canvas itemCanvas = GetComponent<Canvas>();
        if (itemCanvas == null)
        {
            itemCanvas = gameObject.AddComponent<Canvas>();
        }

        itemCanvas.overrideSorting = true;
        itemCanvas.sortingOrder = GetSortingOrderForItemType(GetItemType());
        itemCanvas.sortingLayerName = "Default";

        // GraphicRaycaster 확인
        GraphicRaycaster raycaster = GetComponent<GraphicRaycaster>();
        if (raycaster == null)
        {
            raycaster = gameObject.AddComponent<GraphicRaycaster>();
        }

        // 자식 순서를 최상위로 설정
        transform.SetAsLastSibling();
    }

    /// <summary>
    /// 의상 타입별로 적절한 sorting order를 반환합니다
    /// 레이어 순서: shoes(100) < socks(150) < bottom(200) < top(300) < bottom2(350) < top2(400) < top3(450) < accessory(500) < 드래그중(1000) < Popup(2000)
    /// </summary>
    private int GetSortingOrderForItemType(string itemType)
    {
        return LayerOrderManager.GetSortingOrderForClothingType(itemType, isDragging);
    }    /// <summary>
         /// 아이템의 상호작용을 강제로 복구하는 메서드 (디버깅/수정용)
         /// </summary>
    public void ForceEnableInteraction()
    {
        Debug.Log($"🔧 {itemType} 아이템 강제 복구 시작");

        // 상태 초기화
        isDragging = false;
        if (canvasGroup != null)
        {
            canvasGroup.blocksRaycasts = true;
            canvasGroup.alpha = 1f;
        }

        // Canvas 설정 정리
        SetupCanvasForNormalState();

        // 원위치로 복구 (위치가 이상한 경우)
        if (originalParent != null)
        {
            // 현재 부모가 원래 부모와 다르거나, 위치가 너무 멀리 있는 경우
            bool needsPositionFix = (transform.parent != originalParent) || 
                                   (Vector3.Distance(rectTransform.anchoredPosition, originalPosition) > 100f);
            
            if (needsPositionFix)
            {
                Debug.Log($"🔧 {itemType} 위치 복구: 부모 {(transform.parent != null ? transform.parent.name : "null")} → {originalParent.name}");
                transform.SetParent(originalParent);
                rectTransform.anchoredPosition = originalPosition;
                SetupCanvasForNormalState();
            }
        }

        Debug.Log($"✅ {itemType} 아이템의 상호작용이 강제로 복구되었습니다.");
    }

    /// <summary>
    /// 올바른 원위치를 외부에서 설정할 수 있는 메서드 (사용 중지 - 원위치 혼선 방지)
    /// 원위치는 Start()에서 한 번만 설정되고 변경되지 않아야 합니다
    /// </summary>
    /*
    public void SetCorrectOriginalPosition(Vector3 correctPosition, Transform correctParent)
    {
        Debug.Log($"🔧 원위치 수정: {name} - 기존 위치: {originalPosition} → 새 위치: {correctPosition}");
        Debug.Log($"🔧 부모 수정: {name} - 기존 부모: {(originalParent != null ? originalParent.name : "null")} → 새 부모: {(correctParent != null ? correctParent.name : "null")}");
        
        originalPosition = correctPosition;
        originalParent = correctParent;
    }
    */

    /// <summary>
    /// 현재 아이템의 상태와 원위치 정보를 디버그 출력합니다
    /// </summary>
    public void DebugItemStatus()
    {
        Debug.Log($"📋 아이템 상태 - {name}:");
        Debug.Log($"   타입: {itemType}, 캐릭터: {characterNumber}");
        Debug.Log($"   현재 위치: {rectTransform.anchoredPosition}");
        Debug.Log($"   원위치: {originalPosition}");
        Debug.Log($"   현재 부모: {(transform.parent != null ? transform.parent.name : "null")}");
        Debug.Log($"   원래 부모: {(originalParent != null ? originalParent.name : "null")}");
        Debug.Log($"   드래그 중: {isDragging}");
        Debug.Log($"   활성화: {gameObject.activeInHierarchy}");
        Debug.Log($"   레이캐스트 활성화: {(canvasGroup != null ? canvasGroup.blocksRaycasts.ToString() : "null")}");
        Debug.Log($"   투명도: {(canvasGroup != null ? canvasGroup.alpha.ToString() : "null")}");

        Canvas itemCanvas = GetComponent<Canvas>();
        if (itemCanvas != null)
        {
            Debug.Log($"   Canvas sortingOrder: {itemCanvas.sortingOrder}");
            Debug.Log($"   Canvas overrideSorting: {itemCanvas.overrideSorting}");
        }
        else
        {
            Debug.Log($"   Canvas: 없음");
        }
    }

    /// <summary>
    /// 아이템이 stuck 상태인지 확인합니다
    /// </summary>
    public bool IsStuck()
    {
        // 드래그 중이지만 실제로는 드래그가 끝난 상태
        if (isDragging && (canvasGroup == null || canvasGroup.blocksRaycasts))
        {
            return true;
        }

        // 위치가 비정상적으로 멀리 있는 경우
        if (Vector3.Distance(rectTransform.anchoredPosition, originalPosition) > 2000f)
        {
            return true;
        }

        // 부모가 잘못된 경우 (슬롯에 있지 않은데 원래 부모가 아닌 경우)
        if (originalParent != null && transform.parent != originalParent && !isDragging && !IsInValidSlot())
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// 현재 아이템이 유효한 슬롯에 있는지 확인합니다
    /// </summary>
    private bool IsInValidSlot()
    {
        if (transform.parent == null) return false;
        
        string parentName = transform.parent.name.ToLower();
        return parentName.Contains("slot") || parentName.Contains("슬롯");
    }

    /// <summary>
    /// 이 아이템을 즉시 수정합니다 (컨텍스트 메뉴용)
    /// </summary>
    [ContextMenu("Fix This Item")]
    public void FixThisItem()
    {
        Debug.Log($"🔧 {name} 아이템 개별 수정 시작");
        ForceEnableInteraction();
    }

    /// <summary>
    /// 이 아이템을 원위치로 즉시 되돌립니다 (컨텍스트 메뉴용)
    /// </summary>
    [ContextMenu("Return To Original Position")]
    public void ReturnToOriginalPositionMenu()
    {
        Debug.Log($"↩️ {name} 원위치 복귀 (메뉴에서 호출)");
        ReturnToOriginalPositionImmediate();
    }

    /// <summary>
     /// 그림자 효과 토글 (현재 비활성화됨)
     /// </summary>
    public void ToggleDropShadow(bool enable)
    {
        enableDropShadow = enable;

        // 그림자 효과는 현재 사용하지 않음
        Debug.Log($"그림자 효과 토글: {enable} (현재 비활성화됨)");
    }
}
