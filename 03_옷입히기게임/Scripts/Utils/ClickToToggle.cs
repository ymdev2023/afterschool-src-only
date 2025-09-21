using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

/// <summary>
/// 클릭하면 스프라이트가 바뀌고 다른 오브젝트들이 활성화/비활성화되는 범용 컴포넌트
/// </summary>
public class ClickToToggle : MonoBehaviour, IPointerClickHandler
{
    [Header("스프라이트 설정")]
    [Tooltip("기본 상태 스프라이트")]
    public Sprite defaultSprite;

    [Tooltip("토글된 상태 스프라이트")]
    public Sprite toggledSprite;

    [Header("토글할 오브젝트들")]
    [Tooltip("상태가 바뀔 때 활성화/비활성화할 오브젝트들")]
    public GameObject[] objectsToToggle;

    [Header("설정")]
    [Tooltip("시작할 때 토글된 상태인지 여부")]
    public bool startToggled = false;

    [Tooltip("스프라이트 변경 시 네이티브 사이즈를 유지할지 여부")]
    public bool preserveNativeSize = true;

    [Tooltip("앵커를 위쪽으로 설정하여 아래로만 늘어나게 할지 여부")]
    public bool setTopAnchor = true;

    [Header("드래그 시스템 연동")]
    [Tooltip("토글 시 드래그 시스템을 자동으로 새로고침할지 여부")]
    public bool autoRefreshDragSystem = false; // 기본값을 false로 변경

    [Tooltip("MainSceneManager 참조 (드래그 시스템 새로고침용)")]
    public MainSceneManager mainSceneManager;
    
    [Tooltip("클릭 이벤트를 처리할지 여부 (false면 외부에서만 제어 가능)")]
    public bool handleClickEvents = false; // 새로운 옵션 추가

    private Image image;
    private SpriteRenderer spriteRenderer;
    private bool isToggled;

    void Start()
    {
        // Image 또는 SpriteRenderer 컴포넌트 가져오기
        image = GetComponent<Image>();
        spriteRenderer = GetComponent<SpriteRenderer>();

        if (image == null && spriteRenderer == null)
        {
            Debug.LogError($"{gameObject.name}에 Image 또는 SpriteRenderer 컴포넌트가 없습니다!");
            return;
        }

        // 앵커를 위쪽으로 설정 (Image인 경우만)
        if (setTopAnchor && image != null)
        {
            RectTransform rectTransform = GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                // 앵커를 Top-Center로 설정
                rectTransform.anchorMin = new Vector2(0.5f, 1f);
                rectTransform.anchorMax = new Vector2(0.5f, 1f);

                // Pivot을 위쪽 중앙으로 설정
                rectTransform.pivot = new Vector2(0.5f, 1f);
            }
        }

        // MainSceneManager 자동 찾기 (할당되지 않은 경우)
        if (autoRefreshDragSystem && mainSceneManager == null)
        {
            mainSceneManager = FindFirstObjectByType<MainSceneManager>();
            if (mainSceneManager == null)
            {
                Debug.LogWarning($"{gameObject.name}: MainSceneManager를 찾을 수 없습니다. 드래그 시스템 자동 새로고침이 비활성화됩니다.");
                autoRefreshDragSystem = false;
            }
        }

        // 초기 상태 설정
        isToggled = startToggled;
        UpdateState();
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        // handleClickEvents가 true일 때만 클릭 이벤트 처리
        if (handleClickEvents)
        {
            Toggle();
        }
        else
        {
            Debug.Log($"[ClickToToggle] 클릭 이벤트가 비활성화되어 있습니다. (handleClickEvents = false)");
        }
    }

    /// <summary>
    /// 상태를 토글합니다
    /// </summary>
    public void Toggle()
    {
        isToggled = !isToggled;
        UpdateState();
    }

    /// <summary>
    /// 특정 상태로 설정합니다
    /// </summary>
    public void SetToggled(bool toggled)
    {
        isToggled = toggled;
        UpdateState();
    }

    /// <summary>
    /// 현재 토글 상태를 반환합니다
    /// </summary>
    public bool IsToggled()
    {
        return isToggled;
    }

    /// <summary>
    /// 스프라이트와 오브젝트 상태를 업데이트합니다
    /// </summary>
    private void UpdateState()
    {
        // 스프라이트 변경 (Image 또는 SpriteRenderer)
        Sprite targetSprite = isToggled ? toggledSprite : defaultSprite;

        if (image != null)
        {
            image.sprite = targetSprite;

            // 네이티브 사이즈 유지 옵션
            if (preserveNativeSize && targetSprite != null)
            {
                image.SetNativeSize();
            }
        }
        else if (spriteRenderer != null)
        {
            spriteRenderer.sprite = targetSprite;
        }

        // 오브젝트들 활성화/비활성화
        if (objectsToToggle != null)
        {
            foreach (GameObject obj in objectsToToggle)
            {
                if (obj != null)
                {
                    obj.SetActive(isToggled);
                }
            }
        }

        // 드래그 시스템 자동 새로고침 (오브젝트들이 활성화된 후)
        if (autoRefreshDragSystem && mainSceneManager != null && isToggled)
        {
            // 잠시 기다린 후 드래그 시스템 새로고침 (오브젝트들이 완전히 활성화된 후)
            StartCoroutine(RefreshDragSystemDelayed());
        }
    }

    /// <summary>
    /// 드래그 시스템을 지연 후 새로고침합니다
    /// </summary>
    private System.Collections.IEnumerator RefreshDragSystemDelayed()
    {
        yield return new WaitForEndOfFrame(); // 한 프레임 기다림

        if (mainSceneManager != null)
        {
            Debug.Log($"[ClickToToggle] 드래그 시스템 자동 새로고침 시작...");
            
            // 🔧 서랍이 열릴 때 socks와 accessory parent layer 강제 활성화
            if (isToggled)
            {
                Debug.Log($"[ClickToToggle] 서랍이 열렸으므로 socks와 accessory parent 강제 활성화...");
                mainSceneManager.ForceShowSocksAndAccessoryParents();
            }
            
            mainSceneManager.RefreshDragAndDropItems();
        }
    }
}
