using UnityEngine;

/// <summary>
/// 이 컴포넌트가 부착된 UI 요소를 Popup 레이어(최상위)로 설정합니다.
/// 주로 팝업 창, 알림, 드롭다운 메뉴 등에 사용됩니다.
/// </summary>
[RequireComponent(typeof(RectTransform))]
public class PopupLayerUI : MonoBehaviour
{
    [Header("Popup Layer Settings")]
    [Tooltip("하위 요소들도 모두 Popup 레이어로 설정할지 여부")]
    public bool applyToChildren = true;
    
    [Tooltip("활성화될 때마다 레이어를 다시 설정할지 여부")]
    public bool updateOnEnable = true;

    private void Awake()
    {
        SetupPopupLayer();
    }

    private void OnEnable()
    {
        if (updateOnEnable)
        {
            SetupPopupLayer();
        }
    }

    /// <summary>
    /// Popup 레이어로 설정합니다
    /// </summary>
    public void SetupPopupLayer()
    {
        if (applyToChildren)
        {
            LayerOrderManager.SetPopupLayerRecursive(transform);
        }
        else
        {
            LayerOrderManager.SetPopupLayer(gameObject);
        }

        // 항상 최상위로 이동
        transform.SetAsLastSibling();
        
        // Canvas 확인 및 강제 설정
        Canvas canvas = GetComponent<Canvas>();
        if (canvas != null)
        {
            canvas.overrideSorting = true;
            canvas.sortingOrder = LayerOrderManager.POPUP_ORDER;
            Canvas.ForceUpdateCanvases();
        }
        
        Debug.Log($"PopupLayerUI Setup - GameObject: {gameObject.name}, Canvas: {canvas != null}, SortingOrder: {(canvas != null ? canvas.sortingOrder.ToString() : "N/A")}");
    }

    /// <summary>
    /// 수동으로 Popup 레이어를 설정하는 메서드 (인스펙터에서 호출 가능)
    /// </summary>
    [ContextMenu("Setup Popup Layer")]
    public void ForceSetupPopupLayer()
    {
        SetupPopupLayer();
        
        // 모든 Canvas 디버깅
        DebugAllCanvases();
        
        Debug.Log($"🔝 {gameObject.name}을 Popup 레이어로 강제 설정했습니다.");
    }
    
    /// <summary>
    /// 현재 씬의 모든 Canvas를 디버그합니다
    /// </summary>
    private void DebugAllCanvases()
    {
        Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        Debug.Log($"=== All Canvases Debug ({allCanvases.Length} found) ===");
        
        foreach (Canvas c in allCanvases)
        {
            Debug.Log($"Canvas: {c.gameObject.name}, SortingOrder: {c.sortingOrder}, OverrideSorting: {c.overrideSorting}, RenderMode: {c.renderMode}");
        }
        
        Debug.Log("=== End Canvas Debug ===");
    }
}
