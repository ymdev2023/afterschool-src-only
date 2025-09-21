using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// UI 레이어 순서를 관리하는 유틸리티 클래스
/// 
/// 레이어 순서 규칙:
/// - shoes: 100
/// - socks: 150  
/// - bottom: 200
/// - top: 300
/// - bottom2: 350 (top1보다 위에)
/// - top2: 400
/// - top3: 450
/// - accessory: 500
/// - 드래그 중: 1000
/// - Popup: 2000 (최상위)
/// </summary>
public static class LayerOrderManager
{
    // 레이어 순서 상수
    public const int SHOES_ORDER = 100;
    public const int SOCKS_ORDER = 150;
    public const int BOTTOM_ORDER = 200;
    public const int TOP_ORDER = 300;
    public const int BOTTOM2_ORDER = 350; // bottom2가 top1보다 위에
    public const int TOP2_ORDER = 400;
    public const int TOP3_ORDER = 450;
    public const int ACCESSORY_ORDER = 500;
    public const int DRAGGING_ORDER = 1000;
    public const int POPUP_ORDER = 2000; // 최상위

    /// <summary>
    /// Canvas를 Popup 레이어로 설정합니다 (최상위)
    /// </summary>
    public static void SetPopupLayer(Canvas canvas)
    {
        if (canvas == null) return;

        canvas.overrideSorting = true;
        canvas.sortingOrder = POPUP_ORDER;
        canvas.sortingLayerName = "Default";

        Debug.Log($"🔝 Canvas '{canvas.name}'을 Popup 레이어로 설정 (sortingOrder: {POPUP_ORDER})");
    }

    /// <summary>
    /// GameObject에서 Canvas를 찾아서 Popup 레이어로 설정합니다
    /// </summary>
    public static void SetPopupLayer(GameObject gameObject)
    {
        if (gameObject == null) return;

        Canvas canvas = gameObject.GetComponent<Canvas>();
        if (canvas == null)
        {
            canvas = gameObject.AddComponent<Canvas>();
            
            // GraphicRaycaster도 추가
            if (gameObject.GetComponent<GraphicRaycaster>() == null)
            {
                gameObject.AddComponent<GraphicRaycaster>();
            }
        }

        SetPopupLayer(canvas);
    }

    /// <summary>
    /// Transform 하위의 모든 Canvas를 Popup 레이어로 설정합니다
    /// </summary>
    public static void SetPopupLayerRecursive(Transform parent)
    {
        if (parent == null) return;

        // 현재 오브젝트의 Canvas 설정
        Canvas canvas = parent.GetComponent<Canvas>();
        if (canvas != null)
        {
            SetPopupLayer(canvas);
        }

        // 자식들도 재귀적으로 설정
        for (int i = 0; i < parent.childCount; i++)
        {
            SetPopupLayerRecursive(parent.GetChild(i));
        }
    }

    /// <summary>
    /// 의상 타입별로 적절한 sorting order를 반환합니다
    /// </summary>
    public static int GetSortingOrderForClothingType(string itemType, bool isDragging = false)
    {
        if (isDragging) return DRAGGING_ORDER;
        if (string.IsNullOrEmpty(itemType)) return TOP_ORDER; // 기본값
        
        string lowerType = itemType.ToLower();
        
        switch (lowerType)
        {
            case "shoes":
                return SHOES_ORDER;
            case "socks":
                return SOCKS_ORDER;
            case "bottom":
                return BOTTOM_ORDER;
            case "top":
                return TOP_ORDER;
            case "bottom2":
                return BOTTOM2_ORDER; // bottom2가 top1보다 위에 오도록
            case "top2":
                return TOP2_ORDER;
            case "top3":
                return TOP3_ORDER;
            case "accessory":
            case "acc":
            case "acc1":
            case "acc2":
                return ACCESSORY_ORDER;
            default:
                return TOP_ORDER; // 기본값
        }
    }

    /// <summary>
    /// 디버그: 현재 sorting order 정보를 출력합니다
    /// </summary>
    public static void DebugLayerOrder()
    {
        Debug.Log("=== UI 레이어 순서 정보 ===");
        Debug.Log($"👟 shoes: {SHOES_ORDER}");
        Debug.Log($"🧦 socks: {SOCKS_ORDER}");
        Debug.Log($"👖 bottom: {BOTTOM_ORDER}");
        Debug.Log($"👕 top: {TOP_ORDER}");
        Debug.Log($"👖+ bottom2: {BOTTOM2_ORDER} (top1보다 위)");
        Debug.Log($"👕+ top2: {TOP2_ORDER}");
        Debug.Log($"👕++ top3: {TOP3_ORDER}");
        Debug.Log($"💎 accessory: {ACCESSORY_ORDER}");
        Debug.Log($"🖱️ dragging: {DRAGGING_ORDER}");
        Debug.Log($"🪟 popup: {POPUP_ORDER} (최상위)");
        Debug.Log("========================");
    }
    
    /// <summary>
    /// 강력한 Popup 레이어 설정 (StagePopup 등 중요한 팝업용)
    /// </summary>
    public static void SetStagePopupLayer(Canvas canvas)
    {
        if (canvas == null) return;

        // 1. Canvas 기본 설정
        canvas.overrideSorting = true;
        canvas.sortingOrder = POPUP_ORDER + 100; // 일반 팝업보다도 더 위에
        canvas.sortingLayerName = "Default";
        
        // 2. Canvas Render Mode를 Screen Space - Overlay로 강제 설정
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        // 3. 픽셀 퍼펙트 설정
        canvas.pixelPerfect = false;
        
        // 4. Transform의 계층 순서도 최상위로 설정
        canvas.transform.SetAsLastSibling();
        
        // 5. Canvas 강제 업데이트
        Canvas.ForceUpdateCanvases();
        
        Debug.Log($"🔝 StagePopup Canvas '{canvas.name}'을 최상위 레이어로 설정 (sortingOrder: {POPUP_ORDER + 100})");
    }
    
    /// <summary>
    /// GameObject에서 Canvas를 찾아서 StagePopup 레이어로 설정합니다
    /// </summary>
    public static void SetStagePopupLayer(GameObject gameObject)
    {
        if (gameObject == null) return;

        Canvas canvas = gameObject.GetComponent<Canvas>();
        if (canvas == null)
        {
            canvas = gameObject.AddComponent<Canvas>();
            
            // GraphicRaycaster도 추가
            if (gameObject.GetComponent<GraphicRaycaster>() == null)
            {
                gameObject.AddComponent<GraphicRaycaster>();
            }
        }

        SetStagePopupLayer(canvas);
    }
    
    /// <summary>
    /// 특정 GameObject를 최상위 Popup으로 강제 설정 (이름으로 찾기)
    /// </summary>
    public static void ForceSetTopMostPopup(string gameObjectName)
    {
        GameObject popupObject = GameObject.Find(gameObjectName);
        if (popupObject != null)
        {
            SetStagePopupLayer(popupObject);
            Debug.Log($"🔝 '{gameObjectName}'을 최상위 팝업으로 강제 설정 완료");
        }
        else
        {
            Debug.LogWarning($"⚠️ '{gameObjectName}' 오브젝트를 찾을 수 없습니다!");
        }
    }
}
