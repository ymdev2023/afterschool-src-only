using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 간단한 팝업 토글을 위한 스크립트
/// 버튼이나 다른 UI 요소에서 쉽게 사용할 수 있습니다
/// </summary>
public class SimplePopupToggle : MonoBehaviour
{
    [Header("Popup References")]
    [Tooltip("토글할 팝업 오브젝트")]
    public GameObject targetPopup;

    [Tooltip("MainSceneManager 참조 (자동으로 찾기)")]
    public MainSceneManager mainSceneManager;

    [Header("Settings")]
    [Tooltip("팝업을 열 때 현재 캐릭터를 자동으로 적용할지 여부")]
    public bool autoApplyCurrentCharacter = true;

    [Tooltip("특정 캐릭터 이름 (비어있으면 현재 캐릭터 사용)")]
    public string specificCharacterName = "";

    void Start()
    {
        // MainSceneManager가 설정되지 않았으면 자동으로 찾기
        if (mainSceneManager == null)
        {
            mainSceneManager = FindFirstObjectByType<MainSceneManager>();
        }
    }

    /// <summary>
    /// 팝업을 토글합니다
    /// </summary>
    public void TogglePopup()
    {
        if (targetPopup == null)
        {
            Debug.LogWarning("❌ 대상 팝업이 설정되지 않았습니다!");
            return;
        }

        bool isCurrentlyActive = targetPopup.activeInHierarchy;

        if (isCurrentlyActive)
        {
            // 팝업이 활성화되어 있으면 숨기기
            targetPopup.SetActive(false);
            Debug.Log("🎭 팝업 숨김");
        }
        else
        {
            // 팝업이 비활성화되어 있으면 표시하기
            ShowPopup();
        }
    }

    /// <summary>
    /// 팝업을 표시합니다
    /// </summary>
    public void ShowPopup()
    {
        if (targetPopup == null)
        {
            Debug.LogWarning("❌ 대상 팝업이 설정되지 않았습니다!");
            return;
        }

        targetPopup.SetActive(true);

        // 캐릭터 자동 적용
        if (autoApplyCurrentCharacter && mainSceneManager != null)
        {
            if (!string.IsNullOrEmpty(specificCharacterName))
            {
                // 특정 캐릭터 이름이 설정되어 있으면 해당 캐릭터 사용
                mainSceneManager.ShowCharacterPopup(specificCharacterName);
                Debug.Log($"🎭 팝업 표시: {specificCharacterName}");
            }
            else
            {
                // 현재 캐릭터 사용
                mainSceneManager.ShowCharacterPopup();
                Debug.Log("🎭 팝업 표시: 현재 캐릭터");
            }
        }
        else
        {
            Debug.Log("🎭 팝업 표시 (캐릭터 적용 없음)");
        }
    }

    /// <summary>
    /// 팝업을 숨깁니다
    /// </summary>
    public void HidePopup()
    {
        if (targetPopup != null)
        {
            targetPopup.SetActive(false);
            Debug.Log("🎭 팝업 숨김");
        }
    }

    /// <summary>
    /// 특정 캐릭터로 팝업을 표시합니다
    /// </summary>
    /// <param name="characterName">캐릭터 이름</param>
    public void ShowPopupWithCharacter(string characterName)
    {
        specificCharacterName = characterName;
        ShowPopup();
    }

    #region Button Event Handlers

    public void OnToggleButtonClick() => TogglePopup();
    public void OnShowButtonClick() => ShowPopup();
    public void OnHideButtonClick() => HidePopup();

    public void OnShowCha1Click() => ShowPopupWithCharacter("cha1");
    public void OnShowCha2Click() => ShowPopupWithCharacter("cha2");
    public void OnShowCha3Click() => ShowPopupWithCharacter("cha3");
    public void OnShowCha4Click() => ShowPopupWithCharacter("cha4");

    #endregion
}
