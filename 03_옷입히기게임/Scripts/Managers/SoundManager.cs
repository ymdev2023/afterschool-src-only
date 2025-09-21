using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance;

    [Header("Audio Sources")]
    public AudioSource bgmSource;
    public AudioSource sfxSource;

    [Header("BGM Clips")]
    public AudioClip selectBGM;  // select-bgm
    public AudioClip introBGM;   // intro-bgm
    public AudioClip mainBGM;    // main-bgm

    [Header("SFX Clips")]
    public AudioClip boopSFX;        // boop-sfx
    public AudioClip bubbleSFX;      // bubble-sfx 
    public AudioClip coinSFX;        // coin-sfx
    public AudioClip confirmBeepSFX; // confirmbeep-sfx
    public AudioClip talkSFX;        // talk-sfx
    public AudioClip textSFX;        // text-sfx
    public AudioClip bookSFX;        // book-sfx (앨범 페이지 넘기기)

    [Header("Volume Settings")]
    [Range(0f, 1f)]
    public float bgmVolume = 0.7f;
    [Range(0f, 1f)]
    public float sfxVolume = 1f;

    [Header("Auto Play Settings")]
    public bool playBGMOnStart = true;
    public string currentSceneName = "";

    void Awake()
    {
        // Singleton pattern
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeAudioSources();

            // Subscribe to scene change events for automatic BGM switching
            UnityEngine.SceneManagement.SceneManager.sceneLoaded += OnSceneLoaded;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void OnDestroy()
    {
        // Unsubscribe from scene change events
        if (Instance == this)
        {
            UnityEngine.SceneManagement.SceneManager.sceneLoaded -= OnSceneLoaded;
        }
    }

    // Automatically called when a new scene is loaded
    void OnSceneLoaded(UnityEngine.SceneManagement.Scene scene, UnityEngine.SceneManagement.LoadSceneMode mode)
    {
        Debug.Log($"🎵 SoundManager: Scene loaded '{scene.name}', switching BGM...");
        currentSceneName = scene.name;

        // Wait a bit for everything to be ready, then play appropriate BGM
        StartCoroutine(PlaySceneBGMDelayed());
    }

    System.Collections.IEnumerator PlaySceneBGMDelayed()
    {
        yield return new WaitForSeconds(0.1f); // Wait a bit longer for stability
        Debug.Log("🎵 Playing scene BGM after delay...");
        PlaySceneBGM();
    }

    void Start()
    {
        Debug.Log("🎵 SoundManager Start() called");

        // Ensure audio sources are properly set up
        InitializeAudioSources();

        // Load saved volume settings
        LoadVolumeSettings();

        // Check if BGM clips are assigned
        CheckBGMClips();

        // Check if SFX clips are assigned
        CheckSFXClips();

        // Get current scene name
        currentSceneName = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
        Debug.Log($"🎵 Current scene on Start: {currentSceneName}");

        if (playBGMOnStart)
        {
            Debug.Log("🎵 Auto-playing BGM on start...");
            StartCoroutine(PlayBGMOnStartDelayed());
        }
    }

    System.Collections.IEnumerator PlayBGMOnStartDelayed()
    {
        yield return new WaitForSeconds(0.2f); // Wait a bit for everything to be ready
        PlaySceneBGM();
    }

    void CheckBGMClips()
    {
        Debug.Log("🎵 Checking BGM clips assignment:");
        Debug.Log($"   - selectBGM: {(selectBGM != null ? selectBGM.name : "NULL")}");
        Debug.Log($"   - introBGM: {(introBGM != null ? introBGM.name : "NULL")}");
        Debug.Log($"   - mainBGM: {(mainBGM != null ? mainBGM.name : "NULL")}");

        if (selectBGM == null || introBGM == null || mainBGM == null)
        {
            Debug.LogWarning("⚠️ Some BGM clips are not assigned in the Inspector!");
        }
    }

    void CheckSFXClips()
    {
        Debug.Log("🔊 Checking SFX clips assignment:");
        Debug.Log($"   - boopSFX: {(boopSFX != null ? boopSFX.name : "NULL")}");
        Debug.Log($"   - bubbleSFX: {(bubbleSFX != null ? bubbleSFX.name : "NULL")}");
        Debug.Log($"   - coinSFX: {(coinSFX != null ? coinSFX.name : "NULL")}");
        Debug.Log($"   - confirmBeepSFX: {(confirmBeepSFX != null ? confirmBeepSFX.name : "NULL")}");
        Debug.Log($"   - talkSFX: {(talkSFX != null ? talkSFX.name : "NULL")}");
        Debug.Log($"   - textSFX: {(textSFX != null ? textSFX.name : "NULL")}");
        Debug.Log($"   - bookSFX: {(bookSFX != null ? bookSFX.name : "NULL")}");

        if (boopSFX == null || bubbleSFX == null || coinSFX == null ||
            confirmBeepSFX == null || talkSFX == null || textSFX == null || bookSFX == null)
        {
            Debug.LogWarning("⚠️ Some SFX clips are not assigned in the Inspector!");
        }
    }

    void InitializeAudioSources()
    {
        // Create BGM AudioSource if not assigned
        if (bgmSource == null)
        {
            GameObject bgmObj = new GameObject("BGM Source");
            bgmObj.transform.SetParent(transform);
            bgmSource = bgmObj.AddComponent<AudioSource>();
        }

        // Create SFX AudioSource if not assigned
        if (sfxSource == null)
        {
            GameObject sfxObj = new GameObject("SFX Source");
            sfxObj.transform.SetParent(transform);
            sfxSource = sfxObj.AddComponent<AudioSource>();
        }

        // Configure BGM source
        bgmSource.loop = true;
        bgmSource.volume = bgmVolume;
        bgmSource.playOnAwake = false;

        // Configure SFX source
        sfxSource.loop = false;
        sfxSource.volume = sfxVolume;
        sfxSource.playOnAwake = false;
    }

    void Update()
    {
        // Update volume in real-time
        if (bgmSource != null)
            bgmSource.volume = bgmVolume;
        if (sfxSource != null)
            sfxSource.volume = sfxVolume;
    }

    public void PlaySceneBGM()
    {
        string sceneName = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
        currentSceneName = sceneName;

        AudioClip bgmToPlay = null;

        Debug.Log($"🎵 PlaySceneBGM called for scene: '{sceneName}'");

        // Check if AudioSources are ready
        if (bgmSource == null)
        {
            Debug.LogError("❌ BGM AudioSource is null! Re-initializing...");
            InitializeAudioSources();
        }

        // Determine which BGM to play based on exact scene names
        switch (sceneName)
        {
            case "1IntroScene":
                bgmToPlay = introBGM;
                Debug.Log("✅ Selected intro BGM for 1IntroScene");
                break;
            case "2SelectScene":
                bgmToPlay = selectBGM;
                Debug.Log("✅ Selected character selection BGM for 2SelectScene");
                break;
            case "3MainScene":
                bgmToPlay = mainBGM;
                Debug.Log("✅ Selected main game BGM for 3MainScene");
                break;
            default:
                // Fallback: check if scene name contains keywords
                if (sceneName.Contains("Intro"))
                {
                    bgmToPlay = introBGM;
                    Debug.Log($"✅ Fallback: Selected intro BGM for scene containing 'Intro': {sceneName}");
                }
                else if (sceneName.Contains("Select") || sceneName.Contains("Character"))
                {
                    bgmToPlay = selectBGM;
                    Debug.Log($"✅ Fallback: Selected selection BGM for scene containing 'Select': {sceneName}");
                }
                else if (sceneName.Contains("Main") || sceneName.Contains("Game"))
                {
                    bgmToPlay = mainBGM;
                    Debug.Log($"✅ Fallback: Selected main BGM for scene containing 'Main': {sceneName}");
                }
                else
                {
                    Debug.LogWarning($"⚠️ No BGM mapping found for scene: '{sceneName}' - trying selectBGM as default");
                    bgmToPlay = selectBGM; // Default fallback
                }
                break;
        }

        if (bgmToPlay != null)
        {
            Debug.Log($"🎵 Attempting to play BGM: {bgmToPlay.name}");
            PlayBGM(bgmToPlay);
        }
        else
        {
            Debug.LogError($"❌ No BGM clip assigned for scene '{sceneName}' - check Inspector assignments!");
            CheckBGMClips(); // Show current assignments
        }
    }

    public void PlayBGM(AudioClip clip)
    {
        if (bgmSource == null)
        {
            Debug.LogError("❌ BGM AudioSource is null! Re-initializing...");
            InitializeAudioSources();
            if (bgmSource == null)
            {
                Debug.LogError("❌ Failed to initialize BGM AudioSource!");
                return;
            }
        }

        if (clip == null)
        {
            Debug.LogError("❌ BGM AudioClip is null!");
            return;
        }

        // Stop current BGM first
        if (bgmSource.isPlaying)
        {
            Debug.Log($"🛑 Stopping current BGM: {(bgmSource.clip != null ? bgmSource.clip.name : "Unknown")}");
            bgmSource.Stop();
        }

        // Set new clip and play
        bgmSource.clip = clip;
        bgmSource.volume = bgmVolume;
        bgmSource.loop = true;
        bgmSource.Play();

        Debug.Log($"✅ Successfully started playing BGM: {clip.name} (Volume: {bgmVolume})");

        // Verify playback started
        StartCoroutine(VerifyBGMPlayback(clip.name));
    }

    System.Collections.IEnumerator VerifyBGMPlayback(string clipName)
    {
        yield return new WaitForSeconds(0.1f);

        if (bgmSource != null && bgmSource.isPlaying)
        {
            Debug.Log($"✅ BGM playback verified: {clipName} is playing");
        }
        else
        {
            Debug.LogError($"❌ BGM playback failed: {clipName} is not playing!");
            Debug.LogError($"   - AudioSource exists: {bgmSource != null}");
            if (bgmSource != null)
            {
                Debug.LogError($"   - Clip assigned: {bgmSource.clip != null}");
                Debug.LogError($"   - Volume: {bgmSource.volume}");
                Debug.LogError($"   - Muted: {bgmSource.mute}");
                Debug.LogError($"   - Enabled: {bgmSource.enabled}");
            }
        }
    }

    public void StopBGM()
    {
        if (bgmSource == null) return;
        bgmSource.Stop();
    }

    public void PlaySFX(AudioClip clip)
    {
        if (sfxSource == null)
        {
            Debug.LogError("❌ SFX AudioSource is null!");
            return;
        }

        if (clip == null)
        {
            Debug.LogError("❌ SFX AudioClip is null!");
            return;
        }

        Debug.Log($"🔊 Playing SFX: {clip.name}");
        sfxSource.PlayOneShot(clip);
    }

    // Volume control methods
    public void SetBGMVolume(float volume)
    {
        bgmVolume = Mathf.Clamp01(volume);
        if (bgmSource != null)
            bgmSource.volume = bgmVolume;

        // Save to PlayerPrefs
        PlayerPrefs.SetFloat("BGMVolume", bgmVolume);
        PlayerPrefs.Save();
    }

    public void SetSFXVolume(float volume)
    {
        sfxVolume = Mathf.Clamp01(volume);
        if (sfxSource != null)
            sfxSource.volume = sfxVolume;

        // Save to PlayerPrefs
        PlayerPrefs.SetFloat("SFXVolume", sfxVolume);
        PlayerPrefs.Save();
    }

    public void LoadVolumeSettings()
    {
        bgmVolume = PlayerPrefs.GetFloat("BGMVolume", 0.7f);
        sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1f);

        if (bgmSource != null)
            bgmSource.volume = bgmVolume;
        if (sfxSource != null)
            sfxSource.volume = sfxVolume;
    }

    // Mute/Unmute methods
    public void MuteBGM(bool mute)
    {
        if (bgmSource != null)
            bgmSource.mute = mute;
    }

    public void MuteSFX(bool mute)
    {
        if (sfxSource != null)
            sfxSource.mute = mute;
    }

    public void MuteAll(bool mute)
    {
        MuteBGM(mute);
        MuteSFX(mute);
    }

    // Scene transition method
    public void OnSceneChanged()
    {
        PlaySceneBGM();
    }

    #region Inspector Assignable SFX Methods (Unity OnClick Events)

    /// <summary>
    /// Inspector에서 버튼 OnClick에 직접 할당할 수 있는 효과음 메서드들
    /// 파일명 기반으로 명명된 메서드들
    /// </summary>

    // 파일명 기반 효과음 메서드들 (boop-sfx, bubble-sfx, coin-sfx, confirmbeep-sfx, talk-sfx, text-sfx)
    public void PlayBoopSFX()
    {
        Debug.Log("🔊 PlayBoopSFX() called");
        if (boopSFX != null)
            PlaySFX(boopSFX);
        else
            Debug.LogWarning("⚠️ boopSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayBubbleSFX()
    {
        Debug.Log("🔊 PlayBubbleSFX() called");
        if (bubbleSFX != null)
            PlaySFX(bubbleSFX);
        else
            Debug.LogWarning("⚠️ bubbleSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayCoinSFX()
    {
        Debug.Log("🔊 PlayCoinSFX() called");
        if (coinSFX != null)
            PlaySFX(coinSFX);
        else
            Debug.LogWarning("⚠️ coinSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayConfirmBeepSFX()
    {
        Debug.Log("🔊 PlayConfirmBeepSFX() called");
        if (confirmBeepSFX != null)
            PlaySFX(confirmBeepSFX);
        else
            Debug.LogWarning("⚠️ confirmBeepSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayTalkSFX()
    {
        Debug.Log("🔊 PlayTalkSFX() called");
        if (talkSFX != null)
            PlaySFX(talkSFX);
        else
            Debug.LogWarning("⚠️ talkSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayTextSFX()
    {
        Debug.Log("🔊 PlayTextSFX() called");
        if (textSFX != null)
            PlaySFX(textSFX);
        else
            Debug.LogWarning("⚠️ textSFX AudioClip이 Inspector에서 할당되지 않았습니다!");
    }

    public void PlayBookSFX()
    {
        Debug.Log("🔊 PlayBookSFX() called - 앨범 페이지 넘기기");
        if (bookSFX != null)
        {
            PlaySFX(bookSFX);
        }
        else
        {
            // Inspector에서 할당되지 않았으면 Resources에서 자동 로드 시도
            AudioClip autoLoadedClip = Resources.Load<AudioClip>("Audio/book-sfx");
            if (autoLoadedClip != null)
            {
                bookSFX = autoLoadedClip; // 캐시해서 다음에는 바로 사용
                PlaySFX(bookSFX);
                Debug.Log("📖 bookSFX를 Resources에서 자동 로드했습니다.");
            }
            else
            {
                Debug.LogWarning("⚠️ bookSFX AudioClip을 Inspector나 Resources/Audio/book-sfx에서 찾을 수 없습니다!");
            }
        }
    }

    // BGM 제어 (Inspector 할당용) - 파일명 기반
    public void PlaySelectBGM() => PlayBGM(selectBGM);
    public void PlayIntroBGM() => PlayBGM(introBGM);
    public void PlayMainBGM() => PlayBGM(mainBGM);
    public void StopAllBGM() => StopBGM();

    // 볼륨 제어 (Slider 등에서 사용)
    public void SetBGMVolumeFromSlider(float volume) => SetBGMVolume(volume);
    public void SetSFXVolumeFromSlider(float volume) => SetSFXVolume(volume);

    // 음소거 제어 (Toggle에서 사용)
    public void ToggleBGMMute(bool mute) => MuteBGM(mute);
    public void ToggleSFXMute(bool mute) => MuteSFX(mute);
    public void ToggleAllMute(bool mute) => MuteAll(mute);

    #endregion

    /// <summary>
    /// 수동으로 BGM 재생 테스트 (Inspector나 다른 스크립트에서 호출 가능)
    /// </summary>
    public void TestPlaySceneBGM()
    {
        Debug.Log("🎵 Manual BGM test triggered");
        PlaySceneBGM();
    }

    /// <summary>
    /// 강제로 BGM 재시작 (문제 해결용)
    /// </summary>
    public void ForceRestartBGM()
    {
        Debug.Log("🎵 Force restarting BGM...");

        if (bgmSource != null && bgmSource.isPlaying)
        {
            bgmSource.Stop();
        }

        // Re-initialize audio sources
        InitializeAudioSources();

        // Wait a bit then play BGM
        StartCoroutine(ForceRestartBGMDelayed());
    }

    System.Collections.IEnumerator ForceRestartBGMDelayed()
    {
        yield return new WaitForSeconds(0.1f);
        PlaySceneBGM();
    }

    /// <summary>
    /// 현재 재생 중인 BGM 정보 출력 (디버깅용)
    /// </summary>
    public void LogCurrentBGMStatus()
    {
        Debug.Log("🎵 Current BGM Status:");
        Debug.Log($"   - Scene: {currentSceneName}");
        Debug.Log($"   - BGM Source exists: {bgmSource != null}");

        if (bgmSource != null)
        {
            Debug.Log($"   - Is playing: {bgmSource.isPlaying}");
            Debug.Log($"   - Current clip: {(bgmSource.clip != null ? bgmSource.clip.name : "None")}");
            Debug.Log($"   - Volume: {bgmSource.volume}");
            Debug.Log($"   - Muted: {bgmSource.mute}");
            Debug.Log($"   - Time: {bgmSource.time}/{(bgmSource.clip != null ? bgmSource.clip.length : 0)}");
        }

        CheckBGMClips();
    }

    /// <summary>
    /// 전체 사운드 시스템 상태 확인 (디버깅용)
    /// </summary>
    public void LogAllSoundStatus()
    {
        Debug.Log("🎵🔊 === SOUND SYSTEM STATUS ===");
        LogCurrentBGMStatus();
        CheckSFXClips();

        Debug.Log("🔊 Audio Sources Status:");
        Debug.Log($"   - BGM Source: {(bgmSource != null ? "OK" : "NULL")}");
        Debug.Log($"   - SFX Source: {(sfxSource != null ? "OK" : "NULL")}");

        if (sfxSource != null)
        {
            Debug.Log($"   - SFX Volume: {sfxSource.volume}");
            Debug.Log($"   - SFX Muted: {sfxSource.mute}");
            Debug.Log($"   - SFX Enabled: {sfxSource.enabled}");
        }
    }
}
