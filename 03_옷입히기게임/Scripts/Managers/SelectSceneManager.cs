using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections.Generic;
using TMPro;

public class SelectSceneManager : MonoBehaviour
{
    [Header("Character Display")]
    public Image student1Image;
    public Image student2Image;
    public Image student3Image;

    [Header("Character Name Display")]
    public TextMeshProUGUI characterNameText;
    public Text characterNameTextLegacy;

    [Header("Navigation Buttons")]
    public Button leftArrowButton;
    public Button rightArrowButton;
    public Button playButton;

    [Header("Character Data")]
    public List<CharacterData> availableCharacters = new List<CharacterData>();

    [Header("Scene Management")]
    public string nextSceneName = "GameScene";

    // Current selected character index
    private int selectedCharacterIndex = 0;
    private bool isPlayingAnimation = false;

    // Static variables to store selected character data
    public static CharacterData selectedCharacterData;
    public static Sprite selectedCharacterSprite;

    void Start()
    {
        LoadCharacterData();
        InitializeCharacters();
        SetupButtons();
        UpdateCharacterDisplay();
    }

    void LoadCharacterData()
    {
        // If no character data assigned, try to load from Resources
        if (availableCharacters.Count == 0)
        {
            CharacterData[] loadedCharacters = Resources.LoadAll<CharacterData>("Characters");
            availableCharacters.AddRange(loadedCharacters);
        }

        // If still no data, create default characters with sprites from Resources
        if (availableCharacters.Count == 0)
        {
            CreateDefaultCharacters();
        }
    }

    void CreateDefaultCharacters()
    {
        // Load sprites from Resources and create default character data
        Sprite[] sprites = Resources.LoadAll<Sprite>("Sprites");

        for (int i = 0; i < sprites.Length && i < 6; i++) // Limit to 6 characters max
        {
            // Create a temporary CharacterData in memory
            CharacterData newCharacter = ScriptableObject.CreateInstance<CharacterData>();
            newCharacter.characterName = $"Character {i + 1}";
            newCharacter.characterDescription = $"A unique character with special abilities.";
            newCharacter.characterSprite = sprites[i];
            newCharacter.characterColor = Color.white; // 단일 캐릭터 색상으로 변경
            newCharacter.isLocked = (i > 2); // Lock characters after the first 3
            newCharacter.unlockCondition = i > 2 ? "Complete special mission" : "";
            newCharacter.isAvailable = true;

            availableCharacters.Add(newCharacter);
        }

        Debug.Log($"Created {availableCharacters.Count} default characters");
    }

    void InitializeCharacters()
    {
        // Filter only available and unlocked characters
        List<CharacterData> unlockedCharacters = new List<CharacterData>();
        foreach (CharacterData character in availableCharacters)
        {
            if (character.isAvailable && !character.isLocked)
            {
                unlockedCharacters.Add(character);
            }
        }

        if (unlockedCharacters.Count > 0)
        {
            // Replace availableCharacters with only unlocked ones
            availableCharacters.Clear();
            availableCharacters.AddRange(unlockedCharacters);
            Debug.Log($"Initialized with {availableCharacters.Count} unlocked characters");
        }
        else
        {
            Debug.LogError("No available unlocked characters found!");
        }
    }

    void SetupButtons()
    {
        if (leftArrowButton != null)
        {
            leftArrowButton.onClick.AddListener(OnLeftArrowClick);
        }

        if (rightArrowButton != null)
        {
            rightArrowButton.onClick.AddListener(OnRightArrowClick);
        }

        if (playButton != null)
        {
            playButton.onClick.AddListener(OnPlayButtonClick);
        }
    }

    void OnLeftArrowClick()
    {
        // Play arrow sound effect
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 화살표 버튼용 효과음
        }

        RotateCharactersLeft();
        UpdateCharacterDisplay();
    }

    void OnRightArrowClick()
    {
        // Play arrow sound effect  
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayConfirmBeepSFX(); // 화살표 버튼용 효과음
        }

        RotateCharactersRight();
        UpdateCharacterDisplay();
    }

    void RotateCharactersLeft()
    {
        if (availableCharacters.Count < 2) return;

        // 왼쪽 회전: 선택된 인덱스를 앞으로 이동 (순환)
        selectedCharacterIndex--;
        if (selectedCharacterIndex < 0)
        {
            selectedCharacterIndex = availableCharacters.Count - 1;
        }
    }

    void RotateCharactersRight()
    {
        if (availableCharacters.Count < 2) return;

        // 오른쪽 회전: 선택된 인덱스를 뒤로 이동 (순환)
        selectedCharacterIndex++;
        if (selectedCharacterIndex >= availableCharacters.Count)
        {
            selectedCharacterIndex = 0;
        }
    }

    void UpdateCharacterDisplay()
    {
        if (availableCharacters.Count == 0) return;

        // Update Student1 (가운데 위치) - 현재 선택된 캐릭터
        if (student1Image != null && selectedCharacterIndex < availableCharacters.Count)
        {
            student1Image.sprite = availableCharacters[selectedCharacterIndex].characterSprite;
            student1Image.SetNativeSize(); // native size 적용
            // Keep it bright for selected character
            student1Image.color = Color.white;
        }

        // Update Student2 (왼쪽 위치) - 이전 캐릭터
        if (student2Image != null && availableCharacters.Count > 1)
        {
            int leftIndex = selectedCharacterIndex - 1;
            if (leftIndex < 0) leftIndex = availableCharacters.Count - 1; // 순환

            student2Image.sprite = availableCharacters[leftIndex].characterSprite;
            student2Image.SetNativeSize(); // native size 적용
            // Make it darker/silhouette-like for non-selected characters
            student2Image.color = new Color(0.3f, 0.3f, 0.3f, 1f);
        }

        // Update Student3 (오른쪽 위치) - 다음 캐릭터
        if (student3Image != null && availableCharacters.Count > 1)
        {
            int rightIndex = selectedCharacterIndex + 1;
            if (rightIndex >= availableCharacters.Count) rightIndex = 0; // 순환

            student3Image.sprite = availableCharacters[rightIndex].characterSprite;
            student3Image.SetNativeSize(); // native size 적용
            // Make it darker/silhouette-like for non-selected characters
            student3Image.color = new Color(0.3f, 0.3f, 0.3f, 1f);
        }

        // Update character name text - 현재 선택된 캐릭터의 이름 표시
        if (selectedCharacterIndex < availableCharacters.Count)
        {
            string characterName = availableCharacters[selectedCharacterIndex].characterName;

            // Update TextMeshPro text
            if (characterNameText != null)
            {
                characterNameText.text = characterName;
            }

            // Update legacy Text component
            if (characterNameTextLegacy != null)
            {
                characterNameTextLegacy.text = characterName;
            }
        }
    }

    void OnPlayButtonClick()
    {
        // 이미 애니메이션 중이면 무시
        if (isPlayingAnimation) return;

        // Play play/confirm sound effect
        if (SoundManager.Instance != null)
        {
            SoundManager.Instance.PlayBoopSFX(); // Play 버튼용 효과음
        }

        // Store the selected character data (현재 선택된 인덱스의 캐릭터)
        if (availableCharacters.Count > 0 && selectedCharacterIndex < availableCharacters.Count)
        {
            selectedCharacterData = availableCharacters[selectedCharacterIndex]; // 현재 선택된 캐릭터
            selectedCharacterSprite = selectedCharacterData.characterSprite;

            // Store in PlayerPrefs for persistence
            PlayerPrefs.SetString("SelectedCharacterName", selectedCharacterData.characterName);
            PlayerPrefs.SetString("SelectedCharacterSpriteName", selectedCharacterData.characterSprite.name);
            PlayerPrefs.Save();

            Debug.Log($"Selected character: {selectedCharacterData.characterName} (Index: {selectedCharacterIndex})");
        }

        // Animation will be handled manually in Inspector - just load scene
        StartCoroutine(LoadSceneAfterSFX());
    }

    System.Collections.IEnumerator LoadSceneAfterSFX()
    {
        // Wait minimal time for SFX to play
        yield return new WaitForSeconds(0.15f);

        // Load the next scene using GameManager's scene management
        if (!string.IsNullOrEmpty(nextSceneName))
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.LoadSceneImmediateSilent(nextSceneName); // No additional SFX
            }
            else
            {
                SceneManager.LoadScene(nextSceneName); // Fallback
            }
        }
        else
        {
            Debug.LogWarning("Next scene name is not set!");
        }
    }

    // Static methods to get selected character data from other scripts
    public static CharacterData GetSelectedCharacterData()
    {
        return selectedCharacterData;
    }

    public static Sprite GetSelectedCharacterSprite()
    {
        return selectedCharacterSprite;
    }

    public static string GetSelectedCharacterName()
    {
        return PlayerPrefs.GetString("SelectedCharacterName", "");
    }
}
