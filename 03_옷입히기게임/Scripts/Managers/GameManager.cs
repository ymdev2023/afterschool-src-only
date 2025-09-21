using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections;

public class GameManager : MonoBehaviour
{
    [Header("Manager Settings")]
    public bool isUniversalManager = true; // 프리팹에서는 기본적으로 true

    [Header("Prefab Settings")]
    [Tooltip("프리팹 사용 시 체크하세요. 이미 Managers가 있으면 자동으로 제거됩니다.")]
    public bool isPrefabInstance = true;

    [Header("Player Character References")]
    [Tooltip("씬에 따라 자동으로 찾아집니다. 수동 설정도 가능합니다.")]
    public GameObject playerCharacterObject;
    public Image playerCharacterUIImage;
    public SpriteRenderer playerCharacterRenderer;

    [Header("Character Display Settings")]
    public bool applyOnStart = true;

    private Sprite currentCharacterSprite;

    // Static instance for universal access
    public static GameManager Instance;

    // Scene Management Variables
    private bool isTransitioning = false;

    void Awake()
    {
        // Prefab instance management
        if (isPrefabInstance)
        {
            // Check if there's already a GameManager instance
            if (Instance != null && Instance != this)
            {
                Debug.Log("GameManager prefab instance already exists. Destroying duplicate.");
                Destroy(gameObject);
                return;
            }

            // Set up singleton
            Instance = this;

            if (isUniversalManager)
            {
                DontDestroyOnLoad(gameObject);
                // Subscribe to scene change events
                SceneManager.sceneLoaded += OnSceneLoaded;
                Debug.Log("GameManager prefab loaded and set as universal manager");
            }
        }
    }

    void Start()
    {
        // For non-prefab instances (legacy support)
        if (!isPrefabInstance)
        {
            // Setup singleton for universal manager
            if (isUniversalManager)
            {
                if (Instance == null)
                {
                    Instance = this;
                    DontDestroyOnLoad(gameObject);

                    // Subscribe to scene change events
                    SceneManager.sceneLoaded += OnSceneLoaded;
                }
                else
                {
                    Destroy(gameObject);
                    return;
                }
            }
        }

        if (applyOnStart)
        {
            LoadAndApplySelectedCharacter();
        }
    }

    void OnDestroy()
    {
        // Unsubscribe from scene change events
        if ((isUniversalManager && Instance == this) || isPrefabInstance)
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;

            // Clear static reference if this is the instance being destroyed
            if (Instance == this)
            {
                Instance = null;
            }
        }
    }

    // Called when a new scene is loaded
    void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        Debug.Log($"GameManager: Scene loaded: {scene.name}");

        // Ensure SoundManager exists and is working
        if (SoundManager.Instance == null)
        {
            Debug.LogWarning("SoundManager not found! Trying to find or create...");
            SoundManager soundManager = FindFirstObjectByType<SoundManager>();
            if (soundManager == null)
            {
                Debug.LogError("No SoundManager found in scene! BGM will not play.");
            }
        }
        else
        {
            Debug.Log("✅ SoundManager found, BGM should play automatically");
        }

        // Reset character references for new scene
        if (isUniversalManager)
        {
            playerCharacterObject = null;
            playerCharacterUIImage = null;
            playerCharacterRenderer = null;

            // Auto-apply character if it's a game scene
            if (scene.name.Contains("Game") || scene.name.Contains("Play") || scene.name.Contains("3MainScene"))
            {
                // 🔧 MainScene에서는 MainSceneManager의 폴백 시스템을 우선으로 사용
                if (scene.name == "3MainScene")
                {
                    Debug.Log("🎭 MainScene 감지 - MainSceneManager의 폴백 시스템 사용");
                    // MainSceneManager가 자체적으로 캐릭터를 처리하므로 GameManager는 개입하지 않음
                    return;
                }

                // 다른 게임 씬에서는 기존 로직 사용
                Invoke(nameof(ApplyCharacterToCurrentScene), 0.1f);
            }
        }
    }

    public void LoadAndApplySelectedCharacter()
    {
        // Skip character application if no character references are set (like in IntroScene)
        if (playerCharacterObject == null && playerCharacterUIImage == null && playerCharacterRenderer == null)
        {
            Debug.Log("No character references set - skipping character application (likely in IntroScene)");
            return;
        }

        // Get selected character data from SelectSceneManager
        CharacterData selectedCharacterData = SelectSceneManager.GetSelectedCharacterData();
        Sprite selectedSprite = null;

        if (selectedCharacterData != null)
        {
            // Use large sprite if available, otherwise fall back to regular sprite
            selectedSprite = selectedCharacterData.largeCharacterSprite != null
                ? selectedCharacterData.largeCharacterSprite
                : selectedCharacterData.characterSprite;

            ApplyCharacterSprite(selectedSprite);
            Debug.Log($"Applied selected character: {selectedCharacterData.characterName} (Large: {selectedCharacterData.largeCharacterSprite != null})");
            return;
        }

        // Try to get sprite directly
        selectedSprite = SelectSceneManager.GetSelectedCharacterSprite();
        if (selectedSprite != null)
        {
            ApplyCharacterSprite(selectedSprite);
            Debug.Log($"Applied selected character: {selectedSprite.name}");
            return;
        }

        // Try to load from PlayerPrefs if static variables are null
        string characterName = SelectSceneManager.GetSelectedCharacterName();
        if (!string.IsNullOrEmpty(characterName))
        {
            selectedSprite = LoadSpriteByName(characterName);
            if (selectedSprite != null)
            {
                ApplyCharacterSprite(selectedSprite);
                Debug.Log($"Loaded character from PlayerPrefs: {characterName}");
                return;
            }
        }

        Debug.LogWarning("No character selected or character not found! Using default character.");
        ApplyDefaultCharacter();
    }

    public void ApplyCharacterSprite(Sprite sprite)
    {
        if (sprite == null) return;

        currentCharacterSprite = sprite;

        // Apply to player character object's components
        if (playerCharacterObject != null)
        {
            ApplyToGameObject(playerCharacterObject, sprite);
        }

        // Apply to specific UI Image if assigned
        if (playerCharacterUIImage != null)
        {
            playerCharacterUIImage.sprite = sprite;
            if (sprite != null)
            {
                playerCharacterUIImage.SetNativeSize(); // native size 적용
            }
        }

        // Apply to specific SpriteRenderer if assigned
        if (playerCharacterRenderer != null)
        {
            playerCharacterRenderer.sprite = sprite;
        }
    }

    void ApplyToGameObject(GameObject target, Sprite sprite)
    {
        // Apply to SpriteRenderer on the target object
        SpriteRenderer renderer = target.GetComponent<SpriteRenderer>();
        if (renderer != null)
        {
            renderer.sprite = sprite;
        }

        // Apply to UI Image on the target object
        Image image = target.GetComponent<Image>();
        if (image != null)
        {
            image.sprite = sprite;
            if (sprite != null)
            {
                image.SetNativeSize(); // native size 적용
            }
        }

        // Also check child objects
        SpriteRenderer[] childRenderers = target.GetComponentsInChildren<SpriteRenderer>();
        foreach (SpriteRenderer childRenderer in childRenderers)
        {
            if (childRenderer.gameObject.name.Contains("Character") ||
                childRenderer.gameObject.name.Contains("Player") ||
                childRenderer.gameObject.name.Contains("Avatar"))
            {
                childRenderer.sprite = sprite;
            }
        }

        Image[] childImages = target.GetComponentsInChildren<Image>();
        foreach (Image childImage in childImages)
        {
            if (childImage.gameObject.name.Contains("Character") ||
                childImage.gameObject.name.Contains("Player") ||
                childImage.gameObject.name.Contains("Avatar"))
            {
                childImage.sprite = sprite;
                if (sprite != null)
                {
                    childImage.SetNativeSize(); // native size 적용
                }
            }
        }
    }

    void ApplyDefaultCharacter()
    {
        // Try to load a default character sprite
        Sprite defaultSprite = Resources.Load<Sprite>("Sprites/DefaultCharacter");
        if (defaultSprite == null)
        {
            // Try to load any sprite as fallback
            Sprite[] allSprites = Resources.LoadAll<Sprite>("Sprites");
            if (allSprites.Length > 0)
            {
                defaultSprite = allSprites[0];
            }
        }

        if (defaultSprite != null)
        {
            ApplyCharacterSprite(defaultSprite);
            Debug.Log("Applied default character sprite");
        }
    }

    Sprite LoadSpriteByName(string spriteName)
    {
        // Try to load the sprite from Resources
        string[] resourceFolders = { "Sprites", "Images", "Characters", "Textures" };

        foreach (string folder in resourceFolders)
        {
            Sprite[] sprites = Resources.LoadAll<Sprite>(folder);
            foreach (Sprite sprite in sprites)
            {
                if (sprite.name == spriteName)
                {
                    return sprite;
                }
            }
        }

        return null;
    }

    // Public methods for runtime character changing
    public void ChangeCharacter(Sprite newSprite)
    {
        if (newSprite != null)
        {
            ApplyCharacterSprite(newSprite);

            // Update the selection manager's static variable
            SelectSceneManager.selectedCharacterSprite = newSprite;

            // Save to PlayerPrefs
            PlayerPrefs.SetString("SelectedCharacterName", newSprite.name);
            PlayerPrefs.Save();
        }
    }

    public void ChangeCharacterByName(string characterName)
    {
        Sprite sprite = LoadSpriteByName(characterName);
        if (sprite != null)
        {
            ChangeCharacter(sprite);
        }
        else
        {
            Debug.LogWarning($"Character sprite '{characterName}' not found!");
        }
    }

    public Sprite GetCurrentCharacterSprite()
    {
        return currentCharacterSprite;
    }

    public string GetCurrentCharacterName()
    {
        return currentCharacterSprite != null ? currentCharacterSprite.name : "";
    }

    // Public method to find and set character references in current scene
    public void FindCharacterReferences()
    {
        // Try to find character references automatically
        if (playerCharacterObject == null)
        {
            GameObject foundPlayer = GameObject.FindGameObjectWithTag("Player");
            if (foundPlayer == null)
            {
                // Try to find by name
                string[] playerNames = { "Player", "Character", "PlayerCharacter", "Avatar", "MainCharacter" };
                foreach (string name in playerNames)
                {
                    foundPlayer = GameObject.Find(name);
                    if (foundPlayer != null) break;
                }
            }
            playerCharacterObject = foundPlayer;
        }

        // Try to find UI Image
        if (playerCharacterUIImage == null)
        {
            Image[] images = FindObjectsByType<Image>(FindObjectsSortMode.None);
            foreach (Image img in images)
            {
                if (img.gameObject.name.Contains("Character") ||
                    img.gameObject.name.Contains("Player") ||
                    img.gameObject.name.Contains("Avatar"))
                {
                    playerCharacterUIImage = img;
                    break;
                }
            }
        }

        // Try to find SpriteRenderer
        if (playerCharacterRenderer == null)
        {
            SpriteRenderer[] renderers = FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None);
            foreach (SpriteRenderer renderer in renderers)
            {
                if (renderer.gameObject.name.Contains("Character") ||
                    renderer.gameObject.name.Contains("Player") ||
                    renderer.gameObject.name.Contains("Avatar"))
                {
                    playerCharacterRenderer = renderer;
                    break;
                }
            }
        }

        Debug.Log($"Character references found - Object: {playerCharacterObject != null}, UI: {playerCharacterUIImage != null}, Renderer: {playerCharacterRenderer != null}");
    }

    // Method to apply character to specific scene (called from other scenes)
    public void ApplyCharacterToCurrentScene()
    {
        FindCharacterReferences();
        LoadAndApplySelectedCharacter();
    }

    // Static method to instantiate the Managers prefab if needed
    public static GameManager EnsureManagersExist()
    {
        if (Instance == null)
        {
            // Try to find existing GameManager first
            GameManager existing = FindFirstObjectByType<GameManager>();
            if (existing != null)
            {
                Instance = existing;
                return existing;
            }

            // Load and instantiate the Managers prefab
            GameObject managersPrefab = Resources.Load<GameObject>("Prefabs/Managers");
            if (managersPrefab != null)
            {
                GameObject managersInstance = Instantiate(managersPrefab);
                managersInstance.name = "Managers";

                GameManager gameManager = managersInstance.GetComponent<GameManager>();
                if (gameManager != null)
                {
                    Instance = gameManager;
                    Debug.Log("Managers prefab instantiated successfully");
                    return gameManager;
                }
            }
            else
            {
                Debug.LogWarning("Managers prefab not found in Resources/Prefabs/Managers");
            }
        }

        return Instance;
    }

    // Helper methods for character sprite selection
    public Sprite GetBestCharacterSprite(CharacterData characterData, bool preferLarge = true)
    {
        if (characterData == null) return null;

        if (preferLarge && characterData.largeCharacterSprite != null)
        {
            return characterData.largeCharacterSprite;
        }

        return characterData.characterSprite;
    }

    public void ApplyCharacterData(CharacterData characterData, bool useLargeSprite = true)
    {
        if (characterData == null) return;

        Sprite spriteToUse = GetBestCharacterSprite(characterData, useLargeSprite);
        ApplyCharacterSprite(spriteToUse);

        Debug.Log($"Applied character data: {characterData.characterName} (Using large: {useLargeSprite && characterData.largeCharacterSprite != null})");
    }

    [Header("Scene Management")]
    [Tooltip("씬 전환 시 페이드 효과 사용")]
    public bool useFadeTransition = true;

    [Tooltip("페이드 시간 (초)")]
    public float fadeTime = 0.5f;

    [Tooltip("로딩 화면 표시 시간 (초)")]
    public float loadingDisplayTime = 1f;

    #region Scene Management

    /// <summary>
    /// 씬을 전환합니다 (효과음과 페이드 효과 포함)
    /// </summary>
    public void LoadScene(string sceneName, bool playTransitionSFX = true)
    {
        if (isTransitioning) return;

        if (playTransitionSFX && SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 씬 전환용 효과음
        }

        if (useFadeTransition)
        {
            StartCoroutine(LoadSceneWithFade(sceneName));
        }
        else
        {
            SceneManager.LoadScene(sceneName);
        }
    }

    /// <summary>
    /// 씬을 비동기로 전환합니다
    /// </summary>
    public void LoadSceneAsync(string sceneName, bool playTransitionSFX = true)
    {
        if (isTransitioning) return;

        if (playTransitionSFX && SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 씬 전환용 효과음
        }

        StartCoroutine(LoadSceneAsyncCoroutine(sceneName));
    }

    /// <summary>
    /// 현재 씬을 다시 로드합니다
    /// </summary>
    public void ReloadCurrentScene()
    {
        string currentSceneName = SceneManager.GetActiveScene().name;
        LoadScene(currentSceneName, false);
    }

    /// <summary>
    /// 이전 씬으로 돌아갑니다 (뒤로가기)
    /// </summary>
    public void GoBack()
    {
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 화살표 버튼용 효과음
        }

        // 씬 히스토리 기능은 필요시 추가 구현
        Debug.Log("Go back functionality - implement scene history if needed");
    }

    /// <summary>
    /// 게임을 종료합니다
    /// </summary>
    public void QuitGame()
    {
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 선택 버튼용 효과음
        }

        Debug.Log("Quitting game...");

#if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
    }

    private IEnumerator LoadSceneWithFade(string sceneName)
    {
        isTransitioning = true;

        // 페이드 아웃 (검은 화면으로)
        yield return StartCoroutine(FadeOut());

        // 로딩 시간
        yield return new WaitForSeconds(loadingDisplayTime);

        // 씬 로드
        SceneManager.LoadScene(sceneName);

        isTransitioning = false;
    }

    private IEnumerator LoadSceneAsyncCoroutine(string sceneName)
    {
        isTransitioning = true;

        // 페이드 아웃
        yield return StartCoroutine(FadeOut());

        // 비동기 씬 로드 시작
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
        asyncLoad.allowSceneActivation = false;

        // 로딩 진행 상황 표시 (필요시)
        while (asyncLoad.progress < 0.9f)
        {
            float progress = asyncLoad.progress / 0.9f;
            Debug.Log($"Loading progress: {progress * 100:F1}%");
            yield return null;
        }

        // 최소 로딩 시간 대기
        yield return new WaitForSeconds(loadingDisplayTime);

        // 씬 활성화
        asyncLoad.allowSceneActivation = true;

        // 씬 로드 완료 대기
        yield return asyncLoad;

        isTransitioning = false;
    }

    private IEnumerator FadeOut()
    {
        // 간단한 페이드 효과 (CanvasGroup이나 Image를 사용해서 구현 가능)
        // 여기서는 시간만 대기
        yield return new WaitForSeconds(fadeTime);
    }

    #endregion

    #region Inspector Assignable Methods (Unity OnClick Events)

    /// <summary>
    /// Inspector에서 버튼 OnClick에 할당할 수 있는 씬 전환 메서드들
    /// </summary>

    /// <summary>
    /// Inspector에서 버튼 OnClick에 할당 - 씬 이름을 Inspector에서 입력
    /// 사용법: Button OnClick() -> GameManager.LoadSceneByName -> 씬 이름 입력
    /// </summary>
    public void LoadSceneByName(string sceneName)
    {
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("Scene name is empty!");
            return;
        }
        LoadScene(sceneName);
    }

    /// <summary>
    /// 효과음 없이 씬 전환 (Inspector 할당용)
    /// </summary>
    public void LoadSceneSilent(string sceneName)
    {
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("Scene name is empty!");
            return;
        }
        LoadScene(sceneName, false);
    }

    /// <summary>
    /// 비동기 씬 전환 (Inspector 할당용)
    /// </summary>
    public void LoadSceneAsyncByName(string sceneName)
    {
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("Scene name is empty!");
            return;
        }
        LoadSceneAsync(sceneName);
    }

    /// <summary>
    /// 즉시 씬 전환 (Inspector 할당용) - 페이드나 대기시간 없음
    /// </summary>
    public void LoadSceneImmediateByName(string sceneName)
    {
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("Scene name is empty!");
            return;
        }
        LoadSceneImmediate(sceneName);
    }

    /// <summary>
    /// 조용히 즉시 씬 전환 (Inspector 할당용) - 효과음과 페이드 없음
    /// </summary>
    public void LoadSceneImmediateSilentByName(string sceneName)
    {
        if (string.IsNullOrEmpty(sceneName))
        {
            Debug.LogWarning("Scene name is empty!");
            return;
        }
        LoadSceneImmediateSilent(sceneName);
    }

    /// <summary>
    /// 즉시 씬을 전환합니다 (페이드나 대기시간 없음)
    /// </summary>
    public void LoadSceneImmediate(string sceneName, bool playTransitionSFX = true)
    {
        if (playTransitionSFX && SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 씬 전환용 효과음
            StartCoroutine(LoadSceneImmediateAfterSFX(sceneName));
        }
        else
        {
            SceneManager.LoadScene(sceneName);
        }
    }

    /// <summary>
    /// 조용히 즉시 씬을 전환합니다 (효과음과 페이드 없음)
    /// </summary>
    public void LoadSceneImmediateSilent(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }

    private IEnumerator LoadSceneImmediateAfterSFX(string sceneName)
    {
        // Wait minimal time for SFX to play
        yield return new WaitForSeconds(0.15f);
        SceneManager.LoadScene(sceneName);
    }

    #endregion
}
