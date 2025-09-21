using UnityEngine;
using UnityEngine.UI;
using System.Collections; // 애니메이션을 위해 추가

public class ClothingSlot : MonoBehaviour
{
    [Header("Slot Settings")]
    [Tooltip("이 슬롯의 타입 (top, bottom, shoes, socks)")]
    public string slotType = "top";

    [Tooltip("슬롯의 정확한 위치 (자석 효과의 목표점)")]
    public RectTransform snapPoint;

    [Tooltip("스냅 감지 거리 (픽셀 단위) - 이 거리 안에 들어오면 스냅됨")]
    public float snapDistance = 150f;

    [Tooltip("화면 크기에 비례한 동적 스냅 거리 사용 (0=사용안함, 0.1=화면 폭의 10%)")]
    public float dynamicSnapRatio = 0.08f;

    [Header("Layering")]
    [Tooltip("이 슬롯의 렌더링 순서 (낮을수록 뒤에)")]
    public int layerOrder = 0;

    private Image slotImage;
    private DragAndDropItem currentItem;
    private bool isHighlighted = false;
    private MainSceneManager mainSceneManager; // 중복 착용 방지를 위한 참조

    void Awake()
    {
        // slotImage는 선택적 - 없어도 됨 (빈 슬롯용)
        slotImage = GetComponent<Image>();

        // snapPoint가 설정되지 않았으면 자신을 사용
        if (snapPoint == null)
        {
            snapPoint = GetComponent<RectTransform>();
        }
    }

    void Start()
    {
        // MainSceneManager 참조 찾기 (Start에서 한 번 더 시도)
        if (mainSceneManager == null)
        {
            mainSceneManager = FindFirstObjectByType<MainSceneManager>();
            if (mainSceneManager != null)
            {
                Debug.Log($"✅ {slotType} 슬롯이 MainSceneManager를 찾았습니다.");
            }
            else
            {
                Debug.LogWarning($"❌ {slotType} 슬롯이 MainSceneManager를 찾지 못했습니다!");
            }
        }
    }    /// <summary>
         /// 아이템이 이 슬롯에 배치 가능한지 확인
         /// </summary>
    public bool CanAcceptItem(MonoBehaviour item)
    {
        if (item == null) return false;

        // DragAndDropItem 컴포넌트 확인
        DragAndDropItem dragItem = item as DragAndDropItem;
        if (dragItem == null)
        {
            dragItem = item.GetComponent<DragAndDropItem>();
        }

        if (dragItem == null)
        {
            Debug.LogWarning($"❌ {item.name}에 DragAndDropItem 컴포넌트가 없습니다!");
            return false;
        }

        // 타입이 일치하는지 확인
        string itemType = dragItem.GetItemType();
        bool canAccept = IsCompatibleType(itemType.ToLower(), slotType.ToLower());

        Debug.Log($"🔍 슬롯 호환성 검사: {slotType} 슬롯 ← {itemType} 아이템 = {(canAccept ? "✅ 호환" : "❌ 비호환")}");

        return canAccept;
    }

    /// <summary>
    /// 아이템 타입과 슬롯 타입이 호환되는지 확인
    /// </summary>
    private bool IsCompatibleType(string itemType, string slotType)
    {
        Debug.Log($"🔍 IsCompatibleType 상세 검사: '{itemType}' → '{slotType}'");
        
        // 정확히 일치하는 경우
        if (itemType == slotType)
        {
            Debug.Log($"   ✅ 정확 일치: '{itemType}' == '{slotType}'");
            return true;
        }

        // top2, top3 아이템은 top 슬롯에 배치 가능
        if ((itemType == "top2" || itemType == "top3") && slotType == "top")
        {
            Debug.Log($"   ✅ top 계열: '{itemType}' → '{slotType}'");
            return true;
        }

        // bottom2 아이템은 bottom 슬롯에 배치 가능
        if (itemType == "bottom2" && slotType == "bottom")
        {
            Debug.Log($"   ✅ bottom 계열: '{itemType}' → '{slotType}'");
            return true;
        }

        // acc1 아이템은 acc1 슬롯에만 배치 가능
        if (itemType == "acc1" && slotType == "acc1")
        {
            Debug.Log($"   ✅ acc1 전용: '{itemType}' → '{slotType}'");
            return true;
        }

        // acc2 아이템은 acc2 슬롯에만 배치 가능
        if (itemType == "acc2" && slotType == "acc2")
        {
            Debug.Log($"   ✅ acc2 전용: '{itemType}' → '{slotType}'");
            return true;
        }

        // 일반 acc 아이템은 acc1, acc2 슬롯에 모두 배치 가능
        if (itemType == "acc" && (slotType == "acc1" || slotType == "acc2"))
        {
            Debug.Log($"   ✅ 일반 acc → acc1/acc2: '{itemType}' → '{slotType}'");
            return true;
        }

        // accessory 아이템도 acc1, acc2 슬롯에 배치 가능 (하위 호환성)
        if (itemType == "accessory" && (slotType == "acc1" || slotType == "acc2"))
        {
            Debug.Log($"   ✅ accessory → acc1/acc2: '{itemType}' → '{slotType}'");
            return true;
        }

        Debug.Log($"   ❌ 호환 불가: '{itemType}' → '{slotType}'");
        return false;
    }

    /// <summary>
    /// 아이템을 이 슬롯에 배치
    /// </summary>
    public bool PlaceItem(MonoBehaviour item)
    {
        if (item == null)
        {
            Debug.LogWarning("❌ PlaceItem: item이 null입니다!");
            return false;
        }

        // DragAndDropItem 컴포넌트 확인
        DragAndDropItem dragItem = item as DragAndDropItem;
        if (dragItem == null)
        {
            dragItem = item.GetComponent<DragAndDropItem>();
        }

        if (dragItem == null)
        {
            Debug.LogWarning($"❌ {item.name}에 DragAndDropItem 컴포넌트가 없습니다!");
            return false;
        }

        if (!CanAcceptItem(item))
        {
            Debug.LogWarning($"❌ {slotType} 슬롯이 {dragItem.GetItemType()} 아이템을 받을 수 없습니다!");
            return false;
        }

        // 🔄 중복 착용 방지: MainSceneManager를 통해 같은 타입 아이템 제거
        if (mainSceneManager != null)
        {
            Debug.Log($"🛡️ 중복 착용 방지 확인: {dragItem.GetItemType()} 타입 아이템 중복 제거");
            mainSceneManager.RemoveSameTypeClothingFromOtherSlots(dragItem.GetItemType(), this);
        }
        else
        {
            Debug.LogWarning("⚠️ MainSceneManager 참조를 찾을 수 없어 중복 착용 방지가 비활성화됩니다.");
        }

        // 기존 아이템 제거
        if (currentItem != null)
        {
            Debug.Log($"🔄 기존 아이템 {currentItem.GetItemType()} 제거 중...");
            RemoveCurrentItem();
        }

        // 새 아이템 배치
        currentItem = dragItem;
        dragItem.PlaceInSlot(snapPoint);

        // 렌더링 순서 설정
        SetItemLayerOrder(dragItem);

        // 배치 성공 애니메이션 재생
        PlayPlaceSuccessAnimation();

        Debug.Log($"✅ {slotType} 슬롯에 {dragItem.GetItemType()} 아이템 배치 완료!");

        return true;
    }

    /// <summary>
    /// 현재 배치된 아이템 제거
    /// </summary>
    public void RemoveCurrentItem()
    {
        if (currentItem != null)
        {
            currentItem.ReturnToOriginalPosition();
            currentItem = null;
        }
    }

    /// <summary>
    /// 아이템의 렌더링 순서 설정
    /// </summary>
    private void SetItemLayerOrder(DragAndDropItem item)
    {
        Canvas itemCanvas = item.GetComponent<Canvas>();
        if (itemCanvas == null)
        {
            itemCanvas = item.gameObject.AddComponent<Canvas>();
        }

        itemCanvas.overrideSorting = true;

        // 의상 타입별 레이어 순서 설정 (높을수록 앞에 표시)
        int sortingOrder = GetSortingOrderForItemType(item.GetItemType());
        itemCanvas.sortingOrder = sortingOrder;

        // 슬롯 자체의 Canvas도 설정
        Canvas slotCanvas = GetComponent<Canvas>();
        if (slotCanvas == null)
        {
            slotCanvas = gameObject.AddComponent<Canvas>();
        }
        slotCanvas.overrideSorting = true;
        slotCanvas.sortingOrder = 50; // 슬롯은 배경보다 높게, 아이템보다는 낮게

        // GraphicRaycaster도 추가 (UI 상호작용을 위해)
        if (item.GetComponent<GraphicRaycaster>() == null)
        {
            item.gameObject.AddComponent<GraphicRaycaster>();
        }

        Debug.Log($"🎨 레이어 순서 설정: 슬롯({name})=50, {item.GetItemType()}({item.name})={sortingOrder}");
    }

    /// <summary>
    /// 의상 타입별 소팅 순서 반환
    /// </summary>
    private int GetSortingOrderForItemType(string itemType)
    {
        switch (itemType.ToLower())
        {
            case "socks":
                return 100; // 가장 뒤 (바닥)
            case "bottom":
                return 200; // socks 위
            case "top":
                return 300; // bottom 위
            case "shoes":
                return 400; // top 위
            case "acc":
            case "acc1":
            case "acc2":
            case "accessory":
                return 500; // 가장 앞 (모든 의상 위)
            default:
                return 150; // 기본값
        }
    }

    /// <summary>
    /// 하이라이트 표시/숨김 (효과 제거됨)
    /// </summary>
    public void SetHighlight(bool highlight)
    {
        isHighlighted = highlight;
        // 하이라이트 효과 제거 - 아무것도 하지 않음
    }

    /// <summary>
    /// 아이템 배치 성공 애니메이션
    /// </summary>
    public void PlayPlaceSuccessAnimation()
    {
        StartCoroutine(PlaceSuccessAnimationCoroutine());
        // 효과음 제거
    }

    /// <summary>
    /// 배치 성공 애니메이션 코루틴
    /// </summary>
    private IEnumerator PlaceSuccessAnimationCoroutine()
    {
        Vector3 originalScale = transform.localScale;
        float bounceScale = 1.2f;
        float animationDuration = 0.3f;

        // 바운스 확대
        float elapsedTime = 0f;
        while (elapsedTime < animationDuration * 0.5f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (animationDuration * 0.5f);
            float scale = Mathf.Lerp(1f, bounceScale, t);
            transform.localScale = originalScale * scale;
            yield return null;
        }

        // 바운스 축소
        elapsedTime = 0f;
        while (elapsedTime < animationDuration * 0.5f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (animationDuration * 0.5f);
            float scale = Mathf.Lerp(bounceScale, 1f, t);
            transform.localScale = originalScale * scale;
            yield return null;
        }

        // 원본 크기로 복원
        transform.localScale = originalScale;
    }

    /// <summary>
    /// 두 점 사이의 거리 계산
    /// </summary>
    public float GetDistanceToPoint(Vector2 screenPoint)
    {
        // UI 캔버스의 경우 적절한 카메라 찾기
        Canvas canvas = GetComponentInParent<Canvas>();
        Camera renderCamera = null;

        if (canvas != null)
        {
            if (canvas.renderMode == RenderMode.ScreenSpaceOverlay)
            {
                // Overlay 모드에서는 카메라가 필요 없음
                renderCamera = null;
            }
            else if (canvas.renderMode == RenderMode.ScreenSpaceCamera)
            {
                // Camera 모드에서는 캔버스의 카메라 사용
                renderCamera = canvas.worldCamera;
            }
            else if (canvas.renderMode == RenderMode.WorldSpace)
            {
                // World Space에서는 캔버스의 카메라 또는 Main Camera 사용
                renderCamera = canvas.worldCamera != null ? canvas.worldCamera : Camera.main;
            }
        }

        // 카메라가 없으면 Main Camera 시도
        if (renderCamera == null && canvas != null && canvas.renderMode != RenderMode.ScreenSpaceOverlay)
        {
            renderCamera = Camera.main;
        }

        // snapPoint가 없으면 자신의 RectTransform 중심점 사용
        Vector3 worldPosition;
        if (snapPoint != null)
        {
            worldPosition = snapPoint.position;
        }
        else
        {
            RectTransform rectTransform = GetComponent<RectTransform>();
            worldPosition = rectTransform != null ? rectTransform.position : transform.position;
        }

        Vector2 slotScreenPoint = RectTransformUtility.WorldToScreenPoint(renderCamera, worldPosition);
        float distance = Vector2.Distance(screenPoint, slotScreenPoint);

        float effectiveSnapDistance = GetEffectiveSnapDistance();

        // 디버그 로그 간소화 - 스냅 거리 내에 있을 때만 출력
        if (distance <= effectiveSnapDistance)
        {
            Debug.Log($"📏 거리 계산: {name} 슬롯 (타입:{slotType}) ({slotScreenPoint}) ← 마우스 ({screenPoint}) = {distance:F1}px (임계값: {effectiveSnapDistance:F1}px)");
        }

        return distance;
    }

    /// <summary>
    /// 마우스 포인트가 스냅 범위 안에 있는지 확인
    /// </summary>
    public bool IsWithinSnapRange(Vector2 screenPoint)
    {
        float distance = GetDistanceToPoint(screenPoint);
        float effectiveSnapDistance = GetEffectiveSnapDistance();
        return distance <= effectiveSnapDistance;
    }

    /// <summary>
    /// 동적 스냅 거리를 계산합니다
    /// </summary>
    private float GetEffectiveSnapDistance()
    {
        float effectiveSnapDistance = snapDistance;
        if (dynamicSnapRatio > 0)
        {
            float dynamicDistance = Screen.width * dynamicSnapRatio;
            effectiveSnapDistance = Mathf.Max(snapDistance, dynamicDistance);
        }
        return effectiveSnapDistance;
    }

    /// <summary>
    /// 현재 유효한 스냅 거리를 반환합니다 (디버그용)
    /// </summary>
    public float GetCurrentSnapDistance()
    {
        return GetEffectiveSnapDistance();
    }

    /// <summary>
    /// 현재 아이템 반환
    /// </summary>
    public DragAndDropItem GetCurrentItem()
    {
        return currentItem;
    }

    /// <summary>
    /// 슬롯 타입 반환
    /// </summary>
    public string GetSlotType()
    {
        return slotType;
    }

    /// <summary>
    /// 슬롯이 비어있는지 확인
    /// </summary>
    public bool IsEmpty()
    {
        return currentItem == null;
    }

    /// <summary>
    /// 스냅 포인트의 월드 위치 반환
    /// </summary>
    public Vector3 GetSnapWorldPosition()
    {
        return snapPoint.position;
    }

    /// <summary>
    /// 스냅 포인트의 스크린 위치 반환
    /// </summary>
    public Vector2 GetSnapScreenPosition()
    {
        return RectTransformUtility.WorldToScreenPoint(null, snapPoint.position);
    }

    /// <summary>
    /// 슬롯의 현재 하이라이트 상태 반환
    /// </summary>
    public bool IsHighlighted()
    {
        return isHighlighted;
    }

    /// <summary>
    /// 슬롯을 비웁니다 (현재 아이템 제거)
    /// </summary>
    public void ClearSlot()
    {
        if (currentItem != null)
        {
            Debug.Log($"🧹 {slotType} 슬롯 청소: {currentItem.GetItemType()} 아이템 제거");

            // 아이템을 원래 위치로 되돌리기
            currentItem.ReturnToOriginalPosition();
            currentItem = null;
        }
        else
        {
            Debug.Log($"🧹 {slotType} 슬롯은 이미 비어있습니다");
        }
    }
}