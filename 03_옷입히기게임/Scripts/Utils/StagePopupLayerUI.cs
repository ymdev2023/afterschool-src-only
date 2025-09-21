using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// StagePopup 전용 최상위 레이어 관리 컴포넌트
/// 이 컴포넌트가 부착된 UI 요소는 모든 다른 UI보다 위에 렌더링됩니다.
/// </summary>
[RequireComponent(typeof(RectTransform))]
public class StagePopupLayerUI : MonoBehaviour
{
    [Header("Stage Popup Layer Settings")]
    [Tooltip("하위 요소들도 모두 최상위 레이어로 설정할지 여부")]
    public bool applyToChildren = true;
    
    [Tooltip("활성화될 때마다 레이어를 다시 설정할지 여부")]
    public bool updateOnEnable = true;
    
    [Tooltip("다른 Canvas들을 강제로 낮은 순서로 설정할지 여부")]
    public bool forceOthersDown = true;

    private Canvas stagePopupCanvas;

    private void Awake()
    {
        SetupStagePopupLayer();
    }

    private void OnEnable()
    {
        if (updateOnEnable)
        {
            SetupStagePopupLayer();
        }
    }

    private void Start()
    {
        // Start에서 한 번 더 확실하게 설정
        Invoke(nameof(ForceSetupStagePopupLayer), 0.1f);
    }

    /// <summary>
    /// StagePopup을 최상위 레이어로 설정합니다
    /// </summary>
    public void SetupStagePopupLayer()
    {
        // Canvas 확인 및 생성
        stagePopupCanvas = GetComponent<Canvas>();
        if (stagePopupCanvas == null)
        {
            stagePopupCanvas = gameObject.AddComponent<Canvas>();
        }

        // GraphicRaycaster 확인 및 생성
        GraphicRaycaster raycaster = GetComponent<GraphicRaycaster>();
        if (raycaster == null)
        {
            raycaster = gameObject.AddComponent<GraphicRaycaster>();
        }

        // StagePopup 전용 최상위 레이어 설정
        LayerOrderManager.SetStagePopupLayer(stagePopupCanvas);

        // 하위 요소들도 처리
        if (applyToChildren)
        {
            SetChildrenAsTopMost();
        }

        // 계층 순서도 최상위로 설정
        transform.SetAsLastSibling();

        // 다른 Canvas들을 강제로 낮은 순서로 설정
        if (forceOthersDown)
        {
            ForceOtherCanvasesDown();
        }

        Debug.Log($"🔝 StagePopup Layer Setup - GameObject: {gameObject.name}, Canvas: {stagePopupCanvas != null}, SortingOrder: {stagePopupCanvas.sortingOrder}");
    }

    /// <summary>
    /// 강제로 StagePopup 레이어를 재설정합니다
    /// </summary>
    [ContextMenu("Force Setup Stage Popup Layer")]
    public void ForceSetupStagePopupLayer()
    {
        SetupStagePopupLayer();
        
        // 모든 Canvas 디버깅
        DebugAllCanvases();
        
        Debug.Log($"🔝 {gameObject.name}을 StagePopup 최상위 레이어로 강제 설정했습니다.");
    }

    /// <summary>
    /// 하위 요소들을 최상위로 설정합니다
    /// </summary>
    private void SetChildrenAsTopMost()
    {
        Canvas[] childCanvases = GetComponentsInChildren<Canvas>();
        foreach (Canvas childCanvas in childCanvases)
        {
            if (childCanvas != stagePopupCanvas) // 자기 자신 제외
            {
                childCanvas.overrideSorting = true;
                childCanvas.sortingOrder = LayerOrderManager.POPUP_ORDER + 101; // StagePopup보다도 약간 위
            }
        }
    }

    /// <summary>
    /// 다른 모든 Canvas들을 낮은 순서로 강제 설정합니다
    /// </summary>
    private void ForceOtherCanvasesDown()
    {
        Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        int stagePopupOrder = LayerOrderManager.POPUP_ORDER + 100;

        foreach (Canvas canvas in allCanvases)
        {
            if (canvas != stagePopupCanvas && canvas.sortingOrder >= stagePopupOrder)
            {
                // StagePopup보다 높은 순서의 Canvas들을 낮춤
                canvas.sortingOrder = LayerOrderManager.POPUP_ORDER - 100;
                Debug.Log($"📉 다른 Canvas '{canvas.name}' 순서를 낮춤: {canvas.sortingOrder}");
            }
        }
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
            bool isStagePopup = c == stagePopupCanvas;
            string mark = isStagePopup ? "🔝" : "  ";
            Debug.Log($"{mark} Canvas: {c.gameObject.name}, SortingOrder: {c.sortingOrder}, OverrideSorting: {c.overrideSorting}, RenderMode: {c.renderMode}");
        }
        
        Debug.Log("=== End Canvas Debug ===");
    }

    /// <summary>
    /// 특정 GameObject 이름으로 StagePopup을 찾아서 최상위로 설정합니다
    /// </summary>
    public static void ForceSetStagePopupToTop(string gameObjectName)
    {
        GameObject stagePopupObject = GameObject.Find(gameObjectName);
        if (stagePopupObject != null)
        {
            StagePopupLayerUI stagePopupLayer = stagePopupObject.GetComponent<StagePopupLayerUI>();
            if (stagePopupLayer != null)
            {
                stagePopupLayer.ForceSetupStagePopupLayer();
            }
            else
            {
                // 컴포넌트가 없으면 LayerOrderManager로 직접 설정
                LayerOrderManager.SetStagePopupLayer(stagePopupObject);
            }
            
            Debug.Log($"🔝 '{gameObjectName}' StagePopup을 최상위로 강제 설정 완료");
        }
        else
        {
            Debug.LogWarning($"⚠️ '{gameObjectName}' StagePopup 오브젝트를 찾을 수 없습니다!");
        }
    }
}
