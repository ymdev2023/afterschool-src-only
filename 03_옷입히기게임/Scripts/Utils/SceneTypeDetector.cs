using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// 현재 씬의 타입을 판단하는 유틸리티 클래스
/// </summary>
public static class SceneTypeDetector
{
    /// <summary>
    /// 현재 씬이 MainScene인지 확인합니다
    /// </summary>
    /// <returns>MainScene이면 true, 아니면 false</returns>
    public static bool IsMainScene()
    {
        Scene currentScene = SceneManager.GetActiveScene();
        string sceneName = currentScene.name.ToLower();
        
        // MainScene 패턴들 확인 (3MainScene 포함)
        return sceneName.Contains("main") || 
               sceneName.Contains("game") || 
               sceneName.Contains("play") ||
               sceneName == "mainscene" ||
               sceneName == "gamescene" ||
               sceneName == "3mainscene"; // 3MainScene도 포함
    }

    /// <summary>
    /// 현재 씬이 캐릭터 선택 씬인지 확인합니다
    /// </summary>
    /// <returns>캐릭터 선택 씬이면 true, 아니면 false</returns>
    public static bool IsCharacterSelectionScene()
    {
        Scene currentScene = SceneManager.GetActiveScene();
        string sceneName = currentScene.name.ToLower();
        
        return sceneName.Contains("character") ||
               sceneName.Contains("select") ||
               sceneName.Contains("choose") ||
               sceneName == "characterselection";
    }

    /// <summary>
    /// 현재 씬의 이름을 반환합니다
    /// </summary>
    /// <returns>현재 씬 이름</returns>
    public static string GetCurrentSceneName()
    {
        return SceneManager.GetActiveScene().name;
    }

    /// <summary>
    /// 현재 씬 정보를 디버그 출력합니다
    /// </summary>
    public static void DebugCurrentScene()
    {
        Scene currentScene = SceneManager.GetActiveScene();
        Debug.Log($"🎬 현재 씬 정보:");
        Debug.Log($"   이름: {currentScene.name}");
        Debug.Log($"   경로: {currentScene.path}");
        Debug.Log($"   MainScene 여부: {IsMainScene()}");
        Debug.Log($"   캐릭터 선택 씬 여부: {IsCharacterSelectionScene()}");
    }
}
