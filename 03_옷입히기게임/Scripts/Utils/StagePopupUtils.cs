using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// StagePopup 관련 유틸리티 클래스
/// 즉시 StagePopup을 최상위로 설정하거나 디버깅할 때 사용합니다.
/// </summary>
public static class StagePopupUtils
{
    /// <summary>
    /// 현재 씬의 모든 StagePopup을 찾아서 최상위로 설정합니다
    /// </summary>
    public static void ForceAllStagePopupsToTop()
    {
        // 1단계: 이름으로 찾기
        string[] popupNames = { "StagePopup", "stagepopup", "Stage_Popup", "stage_popup", "StageUI", "PopupStage", "Popup" };
        int foundCount = 0;
        
        foreach (string popupName in popupNames)
        {
            GameObject[] popups = GameObject.FindGameObjectsWithTag("Untagged"); // 모든 오브젝트 검색
            foreach (GameObject obj in popups)
            {
                if (obj.name.ToLower().Contains(popupName.ToLower()))
                {
                    LayerOrderManager.SetStagePopupLayer(obj);
                    foundCount++;
                    Debug.Log($"🔝 '{obj.name}' Popup을 최상위로 설정했습니다.");
                }
            }
        }
        
        // 2단계: Canvas 컴포넌트로 찾기
        Canvas[] allCanvases = GameObject.FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        foreach (Canvas canvas in allCanvases)
        {
            string objName = canvas.gameObject.name.ToLower();
            if (objName.Contains("popup") || objName.Contains("stage"))
            {
                LayerOrderManager.SetStagePopupLayer(canvas);
                foundCount++;
                Debug.Log($"🔝 Canvas '{canvas.gameObject.name}'을 최상위로 설정했습니다.");
            }
        }
        
        Debug.Log($"✅ 총 {foundCount}개의 Popup을 최상위로 설정했습니다.");
        
        // 3단계: 결과 확인
        DebugAllCanvasOrders();
    }
    
    /// <summary>
    /// 특정 GameObject를 StagePopup으로 강제 설정합니다
    /// </summary>
    /// <param name="popupObject">설정할 팝업 오브젝트</param>
    public static void ForceSetAsStagePopup(GameObject popupObject)
    {
        if (popupObject == null)
        {
            Debug.LogWarning("⚠️ 설정할 팝업 오브젝트가 null입니다!");
            return;
        }
        
        LayerOrderManager.SetStagePopupLayer(popupObject);
        
        // Transform 순서도 최상위로 설정
        popupObject.transform.SetAsLastSibling();
        
        Debug.Log($"🔝 '{popupObject.name}'을 StagePopup으로 강제 설정했습니다.");
    }
    
    /// <summary>
    /// 모든 Canvas의 렌더링 순서를 디버그 출력합니다
    /// </summary>
    public static void DebugAllCanvasOrders()
    {
        Canvas[] allCanvases = GameObject.FindObjectsByType<Canvas>(FindObjectsSortMode.None);
        Debug.Log($"=== 모든 Canvas 렌더링 순서 ({allCanvases.Length}개) ===");
        
        // 렌더링 순서대로 정렬
        System.Array.Sort(allCanvases, (a, b) => b.sortingOrder.CompareTo(a.sortingOrder));
        
        for (int i = 0; i < allCanvases.Length; i++)
        {
            Canvas canvas = allCanvases[i];
            string mark = i == 0 ? "🔝" : "  ";
            string popupMark = canvas.gameObject.name.ToLower().Contains("popup") ? "📋" : "  ";
            
            Debug.Log($"{mark}{popupMark} {i+1}. {canvas.gameObject.name} (Order: {canvas.sortingOrder}, Override: {canvas.overrideSorting})");
        }
        
        Debug.Log("=== Canvas 순서 디버그 완료 ===");
    }
    
    /// <summary>
    /// 런타임에서 즉시 실행할 수 있는 메서드 (테스트용)
    /// </summary>
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    public static void AutoSetupStagePopupsOnLoad()
    {
        // 씬 로드 후 자동으로 StagePopup 설정
        // 프로덕션에서는 주석 처리할 수 있습니다
        
        // 0.5초 후에 실행 (UI가 모두 초기화된 후)
        if (Application.isPlaying)
        {
            var mainSceneManager = GameObject.FindFirstObjectByType<MainSceneManager>();
            if (mainSceneManager != null)
            {
                mainSceneManager.Invoke(nameof(ForceAllStagePopupsToTop), 0.5f);
            }
        }
    }
    
    /// <summary>
    /// 특정 이름의 팝업을 강제로 찾아서 최상위로 설정합니다
    /// </summary>
    /// <param name="popupName">찾을 팝업 이름</param>
    /// <returns>설정 성공 여부</returns>
    public static bool FindAndSetStagePopup(string popupName)
    {
        if (string.IsNullOrEmpty(popupName))
        {
            Debug.LogWarning("⚠️ 팝업 이름이 비어있습니다!");
            return false;
        }
        
        // 정확한 이름으로 찾기
        GameObject popup = GameObject.Find(popupName);
        if (popup != null)
        {
            ForceSetAsStagePopup(popup);
            return true;
        }
        
        // 부분 일치로 찾기
        GameObject[] allObjects = GameObject.FindObjectsByType<GameObject>(FindObjectsSortMode.None);
        foreach (GameObject obj in allObjects)
        {
            if (obj.name.ToLower().Contains(popupName.ToLower()))
            {
                ForceSetAsStagePopup(obj);
                return true;
            }
        }
        
        Debug.LogWarning($"⚠️ '{popupName}' 팝업을 찾을 수 없습니다!");
        return false;
    }
}
