using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 범용 GameObject 활성화/비활성화 관리 유틸리티
/// 버튼을 누르면 오브젝트가 나타나고, X버튼을 누르면 사라지는 기능을 제공
/// 팝업창, 패널, UI 등 모든 GameObject에 사용 가능
/// </summary>
public class SimpleToggleManager : MonoBehaviour
{
    [Header("Toggle Settings")]
    [Tooltip("표시/숨김할 오브젝트")]
    public GameObject targetObject;

    [Tooltip("오브젝트를 여는 버튼 (선택사항)")]
    public Button openButton;

    [Tooltip("오브젝트를 닫는 X 버튼 (선택사항)")]
    public Button closeButton;

    [Tooltip("시작할 때 오브젝트를 숨길지 여부")]
    public bool hideOnStart = true;

    [Header("Display Settings")]
    [Tooltip("표시할 때 가장 위 레이어로 올릴지 여부")]
    public bool bringToFront = true;

    [Tooltip("가장 위 레이어의 SortingOrder 값")]
    public int topSortingOrder = 1000;

    void Start()
    {
        // 시작할 때 오브젝트 숨기기
        if (hideOnStart && targetObject != null)
        {
            targetObject.SetActive(false);
        }

        // 버튼 이벤트 자동 연결
        if (openButton != null)
        {
            openButton.onClick.AddListener(ShowObject);
        }

        if (closeButton != null)
        {
            closeButton.onClick.AddListener(HideObject);
        }
    }

    /// <summary>
    /// 오브젝트를 표시합니다
    /// </summary>
    public void ShowObject()
    {
        if (targetObject != null)
        {
            targetObject.SetActive(true);

            // 가장 위 레이어로 올리기
            if (bringToFront)
            {
                BringToFront();
            }

            // Canvas 강제 새로고침으로 즉시 표시 보장
            ForceCanvasUpdate();

            Debug.Log($"오브젝트 표시: {targetObject.name}");
        }
    }

    /// <summary>
    /// 오브젝트를 숨깁니다
    /// </summary>
    public void HideObject()
    {
        if (targetObject != null)
        {
            targetObject.SetActive(false);
            Debug.Log($"오브젝트 숨김: {targetObject.name}");
        }
    }

    /// <summary>
    /// 오브젝트 표시/숨김을 토글합니다
    /// </summary>
    public void ToggleObject()
    {
        if (targetObject != null)
        {
            bool isActive = targetObject.activeInHierarchy;
            if (!isActive)
            {
                ShowObject(); // 표시할 때는 ShowObject 사용 (레이어 처리 포함)
            }
            else
            {
                HideObject();
            }
        }
    }

    /// <summary>
    /// 가장 위 레이어로 올립니다
    /// </summary>
    private void BringToFront()
    {
        if (targetObject == null) return;

        // Canvas가 있으면 SortingOrder 설정
        Canvas canvas = targetObject.GetComponent<Canvas>();
        if (canvas != null)
        {
            canvas.sortingOrder = topSortingOrder;
            canvas.overrideSorting = true;
        }
        else
        {
            // Canvas가 없으면 부모에서 찾기
            canvas = targetObject.GetComponentInParent<Canvas>();
            if (canvas != null)
            {
                canvas.sortingOrder = topSortingOrder;
                canvas.overrideSorting = true;
            }
        }

        // Transform 계층에서도 맨 마지막으로 이동 (렌더링 순서상 가장 위)
        targetObject.transform.SetAsLastSibling();
    }

    /// <summary>
    /// Canvas 강제 업데이트로 즉시 렌더링 보장
    /// </summary>
    private void ForceCanvasUpdate()
    {
        if (targetObject == null) return;

        Canvas canvas = targetObject.GetComponent<Canvas>();
        if (canvas == null)
        {
            canvas = targetObject.GetComponentInParent<Canvas>();
        }

        if (canvas != null)
        {
            // Canvas 강제 업데이트
            Canvas.ForceUpdateCanvases();

            // LayoutGroup이 있으면 강제 리빌드
            LayoutGroup layoutGroup = targetObject.GetComponent<LayoutGroup>();
            if (layoutGroup != null)
            {
                LayoutRebuilder.ForceRebuildLayoutImmediate(targetObject.GetComponent<RectTransform>());
            }
        }
    }

    #region Legacy Method Names (호환성)

    /// <summary>
    /// 팝업을 표시합니다 (호환성을 위한 메소드)
    /// </summary>
    public void ShowPopup() => ShowObject();

    /// <summary>
    /// 팝업을 숨깁니다 (호환성을 위한 메소드)
    /// </summary>
    public void HidePopup() => HideObject();

    /// <summary>
    /// 팝업 토글 (호환성을 위한 메소드)
    /// </summary>
    public void TogglePopup() => ToggleObject();

    #endregion

    void OnDestroy()
    {
        // 이벤트 해제
        if (openButton != null)
        {
            openButton.onClick.RemoveListener(ShowObject);
        }

        if (closeButton != null)
        {
            closeButton.onClick.RemoveListener(HideObject);
        }
    }
}
