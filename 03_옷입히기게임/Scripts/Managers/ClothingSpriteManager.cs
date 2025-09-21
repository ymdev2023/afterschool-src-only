using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// 의상 스프라이트를 자동으로 로드하고 관리하는 매니저 클래스
/// CharacterData를 기반으로 각 캐릭터의 의상 스프라이트를 자동으로 불러와서 UI에 표시합니다.
/// </summary>
public class ClothingSpriteManager : MonoBehaviour
{
    public static ClothingSpriteManager Instance { get; private set; }

    [Header("Auto Loading Settings")]
    [Tooltip("현재 선택된 캐릭터 번호 (1, 2, 3, 4...)")]
    public int currentCharacterNumber = 1;
    
    [Tooltip("각 타입별로 표시할 총 아이템 수 (정답 1개 + 다른 캐릭터 아이템들)")]
    public int itemsPerType = 4;

    [Header("Target Parents for Clothing Items")]
    [Tooltip("상의 아이템들을 생성할 부모 Transform")]
    public Transform topParent;
    
    [Tooltip("하의 아이템들을 생성할 부모 Transform")]
    public Transform bottomParent;
    
    [Tooltip("신발 아이템들을 생성할 부모 Transform")]
    public Transform shoesParent;
    
    [Tooltip("양말 아이템들을 생성할 부모 Transform")]
    public Transform socksParent;
    
    [Tooltip("Acc1 아이템들을 생성할 부모 Transform")]
    public Transform acc1Parent;
    
    [Tooltip("Acc2 아이템들을 생성할 부모 Transform")]
    public Transform acc2Parent;

    [Header("Debug Settings")]
    [Tooltip("디버그 로그 출력 여부")]
    public bool enableDebugLogging = true;

    // 내부 데이터 저장용
    private Dictionary<string, Dictionary<int, List<Sprite>>> loadedSprites = new Dictionary<string, Dictionary<int, List<Sprite>>>();
    private List<string> clothingTypes = new List<string> { "top", "bottom", "shoes", "socks", "acc1", "acc2" };

    private void Awake()
    {
        // 싱글톤 패턴 구현
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }

    private void Start()
    {
        LoadAllSprites();
        CreateAllClothingItems();
    }

    /// <summary>
    /// 모든 캐릭터의 의상 스프라이트를 로드합니다
    /// </summary>
    private void LoadAllSprites()
    {
        if (enableDebugLogging)
        {
            Debug.Log("🔄 ClothingSpriteManager: 모든 캐릭터 스프라이트 로드 시작");
        }

        // CharacterData 배열 로드
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
        
        if (allCharacters == null || allCharacters.Length == 0)
        {
            Debug.LogError("❌ Resources/Characters 폴더에서 CharacterData를 찾을 수 없습니다!");
            return;
        }

        if (enableDebugLogging)
        {
            Debug.Log($"📊 총 {allCharacters.Length}개의 CharacterData 발견");
            
            for (int i = 0; i < allCharacters.Length; i++)
            {
                CharacterData charData = allCharacters[i];
                if (charData != null)
                {
                    Debug.Log($"   [{i}] 캐릭터: {charData.characterName}, 파일명: {charData.name}, 인덱스: {charData.characterIndex}");
                    Debug.Log($"     - largeTop1Sprite: {(charData.largeTop1Sprite != null ? charData.largeTop1Sprite.name : "NULL")}");
                    Debug.Log($"     - largeBottom1Sprite: {(charData.largeBottom1Sprite != null ? charData.largeBottom1Sprite.name : "NULL")}");
                    Debug.Log($"     - largeShoesSprite: {(charData.largeShoesSprite != null ? charData.largeShoesSprite.name : "NULL")}");
                    Debug.Log($"     - largeSocksSprite: {(charData.largeSocksSprite != null ? charData.largeSocksSprite.name : "NULL")}");
                    Debug.Log($"     - largeAcc1Sprite: {(charData.largeAcc1Sprite != null ? charData.largeAcc1Sprite.name : "NULL")}");
                    Debug.Log($"     - largeAcc2Sprite: {(charData.largeAcc2Sprite != null ? charData.largeAcc2Sprite.name : "NULL")}");
                }
            }
        }
        
        foreach (string clothingType in clothingTypes)
        {
            loadedSprites[clothingType] = new Dictionary<int, List<Sprite>>();
            
            // 각 캐릭터별로 해당 타입의 스프라이트 로드
            for (int charNum = 1; charNum <= 5; charNum++) // 최대 5개 캐릭터 지원
            {
                List<Sprite> sprites = LoadSpritesForCharacterAndType(charNum, clothingType);
                if (sprites.Count > 0)
                {
                    loadedSprites[clothingType][charNum] = sprites;
                }
            }
        }

        if (enableDebugLogging)
        {
            Debug.Log("✅ 모든 캐릭터 스프라이트 로드 완료");
        }
    }

    /// <summary>
    /// 특정 캐릭터와 의상 타입에 대한 스프라이트를 로드합니다
    /// </summary>
    private List<Sprite> LoadSpritesForCharacterAndType(int characterNum, string clothingType)
    {
        List<Sprite> sprites = new List<Sprite>();
        
        // CharacterData에서 직접 스프라이트 정보 가져오기
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
        
        // 여러 방법으로 캐릭터 찾기 시도
        CharacterData targetCharacter = null;
        
        // 1. 파일 이름으로 찾기 (Cha_1, Cha_2 등)
        targetCharacter = System.Array.Find(allCharacters, c => c != null && c.name.Contains($"Cha_{characterNum}"));
        
        // 2. 캐릭터 인덱스로 찾기
        if (targetCharacter == null)
        {
            foreach (var character in allCharacters)
            {
                if (character != null && character.characterIndex == characterNum)
                {
                    targetCharacter = character;
                    break;
                }
            }
        }
        
        // 3. 배열 인덱스로 찾기 (fallback)
        if (targetCharacter == null && characterNum > 0 && characterNum <= allCharacters.Length)
        {
            int arrayIndex = characterNum - 1;
            if (arrayIndex >= 0 && arrayIndex < allCharacters.Length && allCharacters[arrayIndex] != null)
            {
                targetCharacter = allCharacters[arrayIndex];
            }
        }
        
        if (targetCharacter != null)
        {
            sprites = GetSpritesFromCharacterData(targetCharacter, clothingType);
            
            // 모든 타입에 대해 로드 결과 출력
            if (enableDebugLogging)
            {
                Debug.Log($"🔍 캐릭터 {characterNum}({targetCharacter.characterName})의 {clothingType}: {sprites.Count}개 스프라이트 로드됨");
                
                for (int i = 0; i < sprites.Count; i++)
                {
                    Debug.Log($"   [{i+1}] {sprites[i].name}");
                }
                
                if (sprites.Count == 0)
                {
                    if (clothingType == "acc1" || clothingType == "acc2")
                    {
                        Debug.Log($"ℹ️ {targetCharacter.characterName}에 {clothingType} 스프라이트가 없습니다 (선택사항)");
                    }
                    else
                    {
                        Debug.LogWarning($"❌ {targetCharacter.characterName}에 {clothingType} 스프라이트가 없습니다!");
                    }
                }
            }
        }
        else
        {
            if (enableDebugLogging)
            {
                Debug.LogWarning($"⚠️ 캐릭터 번호 {characterNum}에 해당하는 CharacterData를 찾을 수 없습니다!");
                Debug.Log($"🔍 사용 가능한 캐릭터들:");
                for (int i = 0; i < allCharacters.Length; i++)
                {
                    if (allCharacters[i] != null)
                    {
                        Debug.Log($"   [{i}] 이름: {allCharacters[i].characterName}, 파일명: {allCharacters[i].name}, 인덱스: {allCharacters[i].characterIndex}");
                    }
                }
            }
        }
        
        return sprites;
    }

    /// <summary>
    /// CharacterData에서 특정 의상 타입의 스프라이트들을 가져옵니다
    /// </summary>
    private List<Sprite> GetSpritesFromCharacterData(CharacterData characterData, string clothingType)
    {
        List<Sprite> sprites = new List<Sprite>();

        switch (clothingType.ToLower())
        {
            case "top":
                // 모든 할당된 top 스프라이트 추가 (스커트 제외)
                if (characterData.largeTop1Sprite != null && !IsSkirtSprite(characterData.largeTop1Sprite)) 
                    sprites.Add(characterData.largeTop1Sprite);
                if (characterData.largeTop2Sprite != null && !IsSkirtSprite(characterData.largeTop2Sprite)) 
                    sprites.Add(characterData.largeTop2Sprite);
                if (characterData.largeTop3Sprite != null && !IsSkirtSprite(characterData.largeTop3Sprite)) 
                    sprites.Add(characterData.largeTop3Sprite);
                break;
                
            case "bottom":
                // 모든 할당된 bottom 스프라이트 추가
                if (characterData.largeBottom1Sprite != null) sprites.Add(characterData.largeBottom1Sprite);
                if (characterData.largeBottom2Sprite != null) sprites.Add(characterData.largeBottom2Sprite);
                
                // Top 스프라이트 중에서 스커트인 것들을 bottom으로 이동
                if (characterData.largeTop1Sprite != null && IsSkirtSprite(characterData.largeTop1Sprite)) 
                {
                    sprites.Add(characterData.largeTop1Sprite);
                    if (enableDebugLogging)
                    {
                        Debug.Log($"🩲 {characterData.characterName}의 largeTop1Sprite에서 스커트 발견하여 bottom으로 이동: {characterData.largeTop1Sprite.name}");
                    }
                }
                if (characterData.largeTop2Sprite != null && IsSkirtSprite(characterData.largeTop2Sprite)) 
                {
                    sprites.Add(characterData.largeTop2Sprite);
                    if (enableDebugLogging)
                    {
                        Debug.Log($"🩲 {characterData.characterName}의 largeTop2Sprite에서 스커트 발견하여 bottom으로 이동: {characterData.largeTop2Sprite.name}");
                    }
                }
                if (characterData.largeTop3Sprite != null && IsSkirtSprite(characterData.largeTop3Sprite)) 
                {
                    sprites.Add(characterData.largeTop3Sprite);
                    if (enableDebugLogging)
                    {
                        Debug.Log($"🩲 {characterData.characterName}의 largeTop3Sprite에서 스커트 발견하여 bottom으로 이동: {characterData.largeTop3Sprite.name}");
                    }
                }
                break;
                
            case "shoes":
                if (characterData.largeShoesSprite != null) sprites.Add(characterData.largeShoesSprite);
                break;
                
            case "socks":
                if (characterData.largeSocksSprite != null) sprites.Add(characterData.largeSocksSprite);
                break;
                
            case "acc1":
                if (characterData.largeAcc1Sprite != null) 
                {
                    sprites.Add(characterData.largeAcc1Sprite);
                    if (enableDebugLogging)
                    {
                        Debug.Log($"✅ {characterData.characterName}의 acc1 스프라이트 발견: {characterData.largeAcc1Sprite.name}");
                    }
                }
                break;
                
            case "acc2":
                if (characterData.largeAcc2Sprite != null) 
                {
                    sprites.Add(characterData.largeAcc2Sprite);
                    if (enableDebugLogging)
                    {
                        Debug.Log($"✅ {characterData.characterName}의 acc2 스프라이트 발견: {characterData.largeAcc2Sprite.name}");
                    }
                }
                break;
        }

        // 중복 스프라이트 제거 (동일한 텍스처를 가진 스프라이트들 제거)
        // 개별 캐릭터 내에서도 전역 중복 검사 적용
        sprites = RemoveDuplicateSpritesGlobal(sprites, $"{clothingType}_char{characterData.characterIndex}");

        return sprites;
    }

    /// <summary>
    /// 중복 스프라이트를 제거합니다 (동일한 텍스처를 가진 스프라이트들)
    /// </summary>
    private List<Sprite> RemoveDuplicateSprites(List<Sprite> originalSprites, string clothingType)
    {
        if (originalSprites == null || originalSprites.Count <= 1)
        {
            return originalSprites;
        }

        List<Sprite> uniqueSprites = new List<Sprite>();
        HashSet<string> seenTextures = new HashSet<string>();
        List<string> duplicateNames = new List<string>();
        int duplicatesRemoved = 0;

        if (enableDebugLogging)
        {
            Debug.Log($"🔍 {clothingType} 중복 검사 시작 (총 {originalSprites.Count}개 스프라이트):");
        }

        foreach (Sprite sprite in originalSprites)
        {
            if (sprite == null) continue;

            // 텍스처 ID로 중복 검사 (같은 텍스처를 참조하는 스프라이트들)
            string textureId = GetSpriteTextureId(sprite);
            
            if (!seenTextures.Contains(textureId))
            {
                seenTextures.Add(textureId);
                uniqueSprites.Add(sprite);
                
                if (enableDebugLogging)
                {
                    Debug.Log($"   ✅ 고유: {sprite.name}");
                }
            }
            else
            {
                duplicatesRemoved++;
                duplicateNames.Add(sprite.name);
                if (enableDebugLogging)
                {
                    Debug.Log($"   🔄 중복 제거: {sprite.name} (텍스처: {textureId})");
                }
            }
        }

        // 중복 제거 후 스프라이트 수가 너무 적으면 경고 (예외 상황 처리)
        if (uniqueSprites.Count < 3 && originalSprites.Count >= 3)
        {
            if (enableDebugLogging)
            {
                Debug.LogWarning($"⚠️ {clothingType} 타입에서 중복 제거 후 스프라이트가 부족합니다 ({uniqueSprites.Count}개 남음)");
                Debug.Log($"   📋 제거된 중복 스프라이트들: {string.Join(", ", duplicateNames)}");
            }
        }

        if (enableDebugLogging && duplicatesRemoved > 0)
        {
            Debug.Log($"🧹 {clothingType} 중복 제거 완료: {duplicatesRemoved}개 제거, {uniqueSprites.Count}개 남음");
            if (duplicateNames.Count > 0)
            {
                Debug.Log($"   📝 제거된 스프라이트들: {string.Join(", ", duplicateNames)}");
            }
        }
        else if (enableDebugLogging)
        {
            Debug.Log($"✅ {clothingType}: 중복 없음 ({uniqueSprites.Count}개 모두 고유)");
        }

        return uniqueSprites;
    }

    /// <summary>
    /// 전역적 중복 스프라이트를 제거합니다 (모든 캐릭터의 스프라이트에서 중복 제거)
    /// </summary>
    private List<Sprite> RemoveDuplicateSpritesGlobal(List<Sprite> originalSprites, string clothingType)
    {
        if (originalSprites == null || originalSprites.Count <= 1)
        {
            return originalSprites;
        }

        List<Sprite> uniqueSprites = new List<Sprite>();
        Dictionary<string, List<string>> textureGroups = new Dictionary<string, List<string>>();
        HashSet<string> seenTextures = new HashSet<string>();
        int duplicatesRemoved = 0;

        if (enableDebugLogging)
        {
            Debug.Log($"🌐 {clothingType} 전역 중복 검사 시작 (총 {originalSprites.Count}개 스프라이트):");
            
            // 양말인 경우 특별히 더 자세한 로그
            if (clothingType.Contains("socks"))
            {
                Debug.Log("🧦🧦🧦 양말 중복 검사 특별 모드 시작!");
                for (int i = 0; i < originalSprites.Count; i++)
                {
                    var sprite = originalSprites[i];
                    if (sprite != null)
                    {
                        Debug.Log($"   양말 #{i}: {sprite.name} (텍스처: {sprite.texture?.name})");
                    }
                }
            }
        }

        // 1단계: 텍스처별로 그룹화
        foreach (Sprite sprite in originalSprites)
        {
            if (sprite == null) continue;

            string textureId = GetSpriteTextureId(sprite);
            
            if (!textureGroups.ContainsKey(textureId))
            {
                textureGroups[textureId] = new List<string>();
            }
            textureGroups[textureId].Add(sprite.name);
        }

        // 2단계: 중복 그룹 식별 및 로깅
        if (enableDebugLogging)
        {
            foreach (var group in textureGroups)
            {
                if (group.Value.Count > 1)
                {
                    Debug.Log($"   🔍 중복 그룹 발견 (텍스처: {group.Key.Substring(0, Mathf.Min(50, group.Key.Length))}...): {string.Join(", ", group.Value)}");
                }
            }
        }

        // 3단계: 각 텍스처 그룹에서 첫 번째 스프라이트만 선택
        foreach (Sprite sprite in originalSprites)
        {
            if (sprite == null) continue;

            string textureId = GetSpriteTextureId(sprite);
            
            if (!seenTextures.Contains(textureId))
            {
                seenTextures.Add(textureId);
                uniqueSprites.Add(sprite);
                
                if (enableDebugLogging)
                {
                    Debug.Log($"   ✅ 선택: {sprite.name} (텍스처 대표)");
                }
            }
            else
            {
                duplicatesRemoved++;
                if (enableDebugLogging)
                {
                    Debug.Log($"   🔄 제거: {sprite.name} (중복)");
                }
            }
        }

        if (enableDebugLogging)
        {
            Debug.Log($"🌐 {clothingType} 전역 중복 제거 완료: {duplicatesRemoved}개 제거, {uniqueSprites.Count}개 고유 스프라이트 남음");
            
            // 양말인 경우 최종 결과 자세히 출력
            if (clothingType.Contains("socks"))
            {
                Debug.Log("🧦🧦🧦 양말 중복 제거 최종 결과:");
                for (int i = 0; i < uniqueSprites.Count; i++)
                {
                    var sprite = uniqueSprites[i];
                    if (sprite != null)
                    {
                        Debug.Log($"   최종 양말 #{i}: {sprite.name}");
                    }
                }
            }
        }

        return uniqueSprites;
    }

    /// <summary>
    /// 스프라이트의 텍스처 ID를 생성합니다 (중복 검사용)
    /// </summary>
    private string GetSpriteTextureId(Sprite sprite)
    {
        if (sprite == null || sprite.texture == null)
        {
            return "null";
        }

        // 텍스처 이름과 스프라이트의 텍스처 좌표를 조합하여 고유 ID 생성
        Texture2D texture = sprite.texture;
        Rect textureRect = sprite.textureRect;
        
        // 텍스처 이름 + 좌표 + 크기로 고유 식별자 생성
        string textureId = $"{texture.name}_{textureRect.x}_{textureRect.y}_{textureRect.width}_{textureRect.height}";
        
        return textureId;
    }

    /// <summary>
    /// CharacterData에서 중복 제거하지 않은 원본 스프라이트들을 가져옵니다 (예외 상황용)
    /// </summary>
    private List<Sprite> GetOriginalSpritesFromCharacterData(CharacterData characterData, string clothingType)
    {
        List<Sprite> sprites = new List<Sprite>();

        switch (clothingType.ToLower())
        {
            case "top":
                // 모든 할당된 top 스프라이트 추가 (중복 제거 없이, 스커트 제외)
                if (characterData.largeTop1Sprite != null && !IsSkirtSprite(characterData.largeTop1Sprite)) 
                    sprites.Add(characterData.largeTop1Sprite);
                if (characterData.largeTop2Sprite != null && !IsSkirtSprite(characterData.largeTop2Sprite)) 
                    sprites.Add(characterData.largeTop2Sprite);
                if (characterData.largeTop3Sprite != null && !IsSkirtSprite(characterData.largeTop3Sprite)) 
                    sprites.Add(characterData.largeTop3Sprite);
                break;
                
            case "bottom":
                // 모든 할당된 bottom 스프라이트 추가 (중복 제거 없이)
                if (characterData.largeBottom1Sprite != null) sprites.Add(characterData.largeBottom1Sprite);
                if (characterData.largeBottom2Sprite != null) sprites.Add(characterData.largeBottom2Sprite);
                
                // Top 스프라이트 중에서 스커트인 것들을 bottom으로 이동
                if (characterData.largeTop1Sprite != null && IsSkirtSprite(characterData.largeTop1Sprite)) 
                    sprites.Add(characterData.largeTop1Sprite);
                if (characterData.largeTop2Sprite != null && IsSkirtSprite(characterData.largeTop2Sprite)) 
                    sprites.Add(characterData.largeTop2Sprite);
                if (characterData.largeTop3Sprite != null && IsSkirtSprite(characterData.largeTop3Sprite)) 
                    sprites.Add(characterData.largeTop3Sprite);
                break;
                
            case "shoes":
                if (characterData.largeShoesSprite != null) sprites.Add(characterData.largeShoesSprite);
                break;
                
            case "socks":
                if (characterData.largeSocksSprite != null) sprites.Add(characterData.largeSocksSprite);
                break;
                
            case "acc1":
                if (characterData.largeAcc1Sprite != null) sprites.Add(characterData.largeAcc1Sprite);
                break;
                
            case "acc2":
                if (characterData.largeAcc2Sprite != null) sprites.Add(characterData.largeAcc2Sprite);
                break;
        }

        // 중복 제거 없이 원본 그대로 반환
        return sprites;
    }

    /// <summary>
    /// 모든 의상 아이템들을 생성합니다
    /// </summary>
    private void CreateAllClothingItems()
    {
        if (enableDebugLogging)
        {
            Debug.Log("🔄 의상 아이템 생성 시작");
        }

        CreateClothingItemsOfType("top", topParent);
        CreateClothingItemsOfType("bottom", bottomParent);
        CreateClothingItemsOfType("shoes", shoesParent);
        
        // 양말은 특별히 중복 체크 로그 활성화
        Debug.Log("🧦 양말(socks) 아이템 생성 시작 - 중복 검사 실행");
        CreateClothingItemsOfType("socks", socksParent);
        Debug.Log("🧦 양말(socks) 아이템 생성 완료");
        
        CreateClothingItemsOfType("acc1", acc1Parent);
        CreateClothingItemsOfType("acc2", acc2Parent);

        if (enableDebugLogging)
        {
            Debug.Log("✅ 모든 의상 아이템 생성 완료");
        }
    }

    /// <summary>
    /// 특정 타입의 의상 아이템들을 생성합니다
    /// 기존 GameObject들(top_01, top_02 등)의 스프라이트를 교체하는 방식으로 동작합니다
    /// </summary>
    private void CreateClothingItemsOfType(string clothingType, Transform parent)
    {
        if (parent == null)
        {
            Debug.LogWarning($"❌ {clothingType}의 부모 Transform이 설정되지 않았습니다!");
            return;
        }

        // 현재 캐릭터의 정답 스프라이트 가져오기
        List<Sprite> currentCharacterSprites = new List<Sprite>();
        if (loadedSprites.ContainsKey(clothingType) && loadedSprites[clothingType].ContainsKey(currentCharacterNumber))
        {
            currentCharacterSprites = loadedSprites[clothingType][currentCharacterNumber];
            
            if (enableDebugLogging)
            {
                Debug.Log($"✅ 현재 캐릭터({currentCharacterNumber})의 {clothingType} 정답 스프라이트 {currentCharacterSprites.Count}개 발견");
            }
        }

        // 부모 아래의 기존 GameObject들 찾기 (top_01, top_02, top_03 등)
        List<Transform> availableSlots = new List<Transform>();
        for (int i = 0; i < parent.childCount; i++)
        {
            Transform child = parent.GetChild(i);
            if (child != null)
            {
                availableSlots.Add(child);
            }
        }

        if (availableSlots.Count == 0)
        {
            Debug.LogWarning($"⚠️ {clothingType} 부모 아래에 교체할 GameObject가 없습니다!");
            return;
        }

        if (enableDebugLogging)
        {
            Debug.Log($"🎯 {clothingType}: {availableSlots.Count}개의 슬롯 발견");
            foreach (var slot in availableSlots)
            {
                Debug.Log($"   - {slot.name}");
            }
        }

        // 현재 캐릭터의 정답 스프라이트가 있으면 랜덤 슬롯에 할당
        if (currentCharacterSprites.Count > 0)
        {
            // 양말의 경우 특별 디버깅
            if (clothingType == "socks")
            {
                Debug.Log($"🧦🧦 현재 캐릭터({currentCharacterNumber})의 양말 정답 스프라이트들:");
                for (int i = 0; i < currentCharacterSprites.Count; i++)
                {
                    Debug.Log($"   정답 양말 #{i}: {currentCharacterSprites[i].name}");
                }
            }
            
            // 랜덤하게 하나의 슬롯 선택
            int randomIndex = UnityEngine.Random.Range(0, availableSlots.Count);
            Transform selectedSlot = availableSlots[randomIndex];
            
            // 현재 캐릭터의 첫 번째 정답 스프라이트를 해당 슬롯에 설정
            Sprite correctSprite = currentCharacterSprites[0];
            SetupClothingSlot(selectedSlot, correctSprite, clothingType, true);
            
            if (enableDebugLogging)
            {
                Debug.Log($"✅ 정답 스프라이트 '{correctSprite.name}'를 '{selectedSlot.name}'에 할당");
            }
            
            // 사용된 슬롯을 목록에서 제거
            availableSlots.RemoveAt(randomIndex);
        }
        else
        {
            if (clothingType != "acc1" && clothingType != "acc2")
            {
                Debug.LogError($"❌ 심각한 오류: 현재 캐릭터({currentCharacterNumber})에게 필수 의상 타입 '{clothingType}'의 스프라이트가 없습니다!");
            }
        }

        // 나머지 슬롯들에 다른 캐릭터의 스프라이트들로 채우기
        List<Sprite> otherSprites = new List<Sprite>();
        foreach (var charEntry in loadedSprites[clothingType])
        {
            if (charEntry.Key != currentCharacterNumber)
            {
                otherSprites.AddRange(charEntry.Value);
            }
        }

        if (enableDebugLogging)
        {
            Debug.Log($"🔍 {clothingType}: 다른 캐릭터들의 스프라이트 {otherSprites.Count}개 수집됨 (중복 제거 전)");
            for (int i = 0; i < otherSprites.Count; i++)
            {
                Debug.Log($"   [{i+1}] {otherSprites[i].name}");
            }
        }

        // 현재 캐릭터의 정답 스프라이트와 중복되는 것들을 다른 캐릭터 스프라이트에서 제거
        if (currentCharacterSprites.Count > 0)
        {
            HashSet<string> currentCharacterTextureIds = new HashSet<string>();
            foreach (Sprite correctSprite in currentCharacterSprites)
            {
                if (correctSprite != null)
                {
                    currentCharacterTextureIds.Add(GetSpriteTextureId(correctSprite));
                }
            }

            // 현재 캐릭터와 동일한 텍스처를 가진 스프라이트들을 다른 캐릭터 목록에서 제거
            List<Sprite> filteredOtherSprites = new List<Sprite>();
            int currentCharDuplicatesRemoved = 0;
            
            foreach (Sprite otherSprite in otherSprites)
            {
                if (otherSprite != null)
                {
                    string otherTextureId = GetSpriteTextureId(otherSprite);
                    if (!currentCharacterTextureIds.Contains(otherTextureId))
                    {
                        filteredOtherSprites.Add(otherSprite);
                    }
                    else
                    {
                        currentCharDuplicatesRemoved++;
                        if (enableDebugLogging)
                        {
                            Debug.Log($"   🚫 현재 캐릭터와 중복 제거: {otherSprite.name}");
                        }
                    }
                }
            }
            
            otherSprites = filteredOtherSprites;
            
            if (enableDebugLogging && currentCharDuplicatesRemoved > 0)
            {
                Debug.Log($"🎯 현재 캐릭터와 중복되는 {currentCharDuplicatesRemoved}개 스프라이트 제거됨");
            }
        }

        // 전체적인 중복 제거 (모든 캐릭터의 스프라이트에서 중복 제거)
        otherSprites = RemoveDuplicateSpritesGlobal(otherSprites, clothingType + "_others");

        // 스프라이트가 부족한 경우 예외 처리 (되도록이면 중복 제거, 하지만 필요시 허용)
        int remainingSlotsCount = availableSlots.Count;
        if (otherSprites.Count < remainingSlotsCount && remainingSlotsCount > 0)
        {
            if (enableDebugLogging)
            {
                Debug.LogWarning($"⚠️ {clothingType}: 남은 슬롯({remainingSlotsCount}개)보다 중복 제거된 스프라이트({otherSprites.Count}개)가 적습니다. 중복 허용을 고려합니다.");
            }

            // 중복 제거하지 않은 원본 스프라이트들을 다시 수집
            List<Sprite> originalOtherSprites = new List<Sprite>();
            foreach (var charEntry in loadedSprites[clothingType])
            {
                if (charEntry.Key != currentCharacterNumber)
                {
                    // GetSpritesFromCharacterData에서 중복 제거 전 원본을 가져오기
                    CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
                    CharacterData targetChar = System.Array.Find(allCharacters, c => c != null && c.name.Contains($"Cha_{charEntry.Key}"));
                    if (targetChar != null)
                    {
                        List<Sprite> originalSprites = GetOriginalSpritesFromCharacterData(targetChar, clothingType);
                        originalOtherSprites.AddRange(originalSprites);
                    }
                }
            }

            // 중복을 포함한 원본 스프라이트가 충분하면 사용
            if (originalOtherSprites.Count >= remainingSlotsCount)
            {
                otherSprites = originalOtherSprites;
                if (enableDebugLogging)
                {
                    Debug.Log($"✅ {clothingType}: 중복 포함 원본 스프라이트 사용 ({otherSprites.Count}개)");
                }
            }
        }

        // 나머지 슬롯들에 랜덤하게 다른 캐릭터의 스프라이트 할당 (중복 방지)
        List<Sprite> availableSprites = new List<Sprite>(otherSprites); // 사용 가능한 스프라이트 복사본
        
        for (int i = 0; i < availableSlots.Count; i++)
        {
            Transform slot = availableSlots[i];
            
            if (availableSprites.Count > 0)
            {
                // 랜덤하게 스프라이트 선택 후 리스트에서 제거 (중복 방지)
                int randomIndex = UnityEngine.Random.Range(0, availableSprites.Count);
                Sprite sprite = availableSprites[randomIndex];
                availableSprites.RemoveAt(randomIndex); // 🔥 핵심: 사용한 스프라이트 제거
                
                SetupClothingSlot(slot, sprite, clothingType, false);
                
                if (enableDebugLogging)
                {
                    Debug.Log($"🔄 오답 스프라이트 '{sprite.name}'를 '{slot.name}'에 할당 (남은 스프라이트: {availableSprites.Count}개)");
                }
            }
            else
            {
                // 스프라이트가 부족한 경우, 원본 리스트를 다시 복사해서 재사용
                if (otherSprites.Count > 0)
                {
                    availableSprites = new List<Sprite>(otherSprites);
                    int randomIndex = UnityEngine.Random.Range(0, availableSprites.Count);
                    Sprite sprite = availableSprites[randomIndex];
                    availableSprites.RemoveAt(randomIndex);
                    
                    SetupClothingSlot(slot, sprite, clothingType, false);
                    
                    if (enableDebugLogging)
                    {
                        Debug.Log($"🔄 오답 스프라이트 '{sprite.name}'를 '{slot.name}'에 할당 (스프라이트 부족으로 재사용)");
                    }
                }
                else
                {
                    if (enableDebugLogging)
                    {
                        Debug.LogWarning($"⚠️ {clothingType}: 슬롯 '{slot.name}'에 할당할 스프라이트가 없습니다.");
                    }
                }
            }
        }

        if (enableDebugLogging)
        {
            Debug.Log($"� {clothingType}: 총 {availableSlots.Count + (currentCharacterSprites.Count > 0 ? 1 : 0)}개 슬롯에 스프라이트 할당 완료");
        }
    }

    /// <summary>
    /// 개별 의상 슬롯을 설정합니다 (기존 GameObject의 스프라이트를 교체)
    /// </summary>
    private void SetupClothingSlot(Transform slot, Sprite sprite, string clothingType, bool isCorrect)
    {
        if (slot == null || sprite == null) return;

        // Image 컴포넌트 찾기 또는 추가
        Image itemImage = slot.GetComponent<Image>();
        if (itemImage == null)
        {
            itemImage = slot.gameObject.AddComponent<Image>();
        }

        // 스프라이트를 교체하고 SetNativeSize 적용
        itemImage.sprite = sprite;
        itemImage.SetNativeSize();
        itemImage.raycastTarget = true;

        if (enableDebugLogging)
        {
            Debug.Log($"🖼️ 스프라이트 교체 및 SetNativeSize 적용: {sprite.name} → {slot.name}");
        }

        // DragAndDropItem 컴포넌트 찾기 또는 추가
        DragAndDropItem dragItem = slot.GetComponent<DragAndDropItem>();
        if (dragItem == null)
        {
            dragItem = slot.gameObject.AddComponent<DragAndDropItem>();
        }

        // DragAndDropItem 설정
        dragItem.clothingType = clothingType;
        dragItem.isCorrectItem = isCorrect;
        dragItem.spriteName = sprite.name;
        dragItem.enabled = true;

        if (enableDebugLogging)
        {
            Debug.Log($"🔧 DragAndDropItem 설정: {slot.name}");
            Debug.Log($"   - clothingType: '{clothingType}' (길이: {clothingType.Length})");
            Debug.Log($"   - isCorrectItem: {isCorrect}");
            Debug.Log($"   - spriteName: '{sprite.name}'");
            Debug.Log($"   - enabled: {dragItem.enabled}");
            
            // 설정 직후 재확인
            Debug.Log($"   - 설정 후 clothingType 재확인: '{dragItem.clothingType}' (길이: {dragItem.clothingType?.Length ?? -1})");
        }

        // CanvasGroup 설정
        CanvasGroup canvasGroup = slot.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
        {
            canvasGroup = slot.gameObject.AddComponent<CanvasGroup>();
        }
        canvasGroup.blocksRaycasts = true;
        canvasGroup.interactable = true;
        canvasGroup.alpha = 1f;

        // GameObject 활성화
        slot.gameObject.SetActive(true);

        if (enableDebugLogging)
        {
            Debug.Log($"✅ 슬롯 설정 완료: {slot.name} - {clothingType} ({(isCorrect ? "정답" : "오답")})");
        }
    }

    /* [이전 방식 - 더 이상 사용하지 않음]
    /// <summary>
    /// 개별 의상 아이템을 생성합니다
    /// </summary>
    private void CreateClothingItem_OLD(Sprite sprite, Transform parent, string clothingType, bool isCorrect)
    {
        // GameObject를 코드에서 직접 생성
        GameObject itemObj = new GameObject($"{sprite.name}_Item");
        itemObj.transform.SetParent(parent, false);
        
        // RectTransform 추가 (UI 요소이므로 필수)
        RectTransform rectTransform = itemObj.AddComponent<RectTransform>();
        rectTransform.sizeDelta = new Vector2(100, 100); // 기본 크기
        
        // Image 컴포넌트 추가 및 스프라이트 설정
        Image itemImage = itemObj.AddComponent<Image>();
        itemImage.sprite = sprite;
        itemImage.raycastTarget = true; // 드래그를 위해 레이캐스트 활성화
        
        // 스프라이트를 교체하고 SetNativeSize 적용 (사용자 요청사항)
        itemImage.SetNativeSize();
        
        if (enableDebugLogging)
        {
            Debug.Log($"🖼️ 스프라이트 교체 및 SetNativeSize 적용: {sprite.name}");
        }

        // 스프라이트 이름에서 실제 타입 추출 (largeTop2Sprite -> top2)
        string actualType = GetActualTypeFromSpriteName(sprite.name, clothingType);

        // DragAndDropItem 컴포넌트 추가 및 설정
        DragAndDropItem dragItem = itemObj.AddComponent<DragAndDropItem>();
        dragItem.clothingType = clothingType;
        dragItem.isCorrectItem = isCorrect;
        dragItem.spriteName = sprite.name;
        
        // 모든 아이템에 대해 기본 드래그 설정
        dragItem.enabled = true;
        itemObj.SetActive(true);
        
        // CanvasGroup 추가 및 설정
        CanvasGroup canvasGroup = itemObj.AddComponent<CanvasGroup>();
        canvasGroup.blocksRaycasts = true;
        canvasGroup.interactable = true;
        canvasGroup.alpha = 1f;
        
        // acc1, acc2 아이템의 경우 추가 로깅
        if (clothingType == "acc1" || clothingType == "acc2")
        {
            if (enableDebugLogging)
            {
                Debug.Log($"🔧 액세서리 아이템 드래그 기능 설정 완료: {itemObj.name} ({clothingType})");
            }
        }
        
        if (enableDebugLogging)
        {
            Debug.Log($"✅ {clothingType} 아이템 생성 완료: {itemObj.name}");
        }

        // 이름 설정 (디버깅용)
        itemObj.name = $"{actualType}_{sprite.name}_{(isCorrect ? "정답" : "오답")}";

        if (enableDebugLogging)
        {
            Debug.Log($"  ➡️ {itemObj.name} 생성됨 (타입: {clothingType} → {actualType})");
            Debug.Log($"     부모: {parent.name}, 위치: {itemObj.GetComponent<RectTransform>().anchoredPosition}");
            
            // 레이어 순서 정보도 출력
            Canvas itemCanvas = itemObj.GetComponent<Canvas>();
            if (itemCanvas != null)
            {
                Debug.Log($"     레이어 순서: {itemCanvas.sortingOrder} ({actualType} 타입)");
            }
        }
    }
    */ // 이전 방식 주석 처리 끝

    /// <summary>
    /// 스프라이트가 스커트인지 확인합니다
    /// </summary>
    private bool IsSkirtSprite(Sprite sprite)
    {
        if (sprite == null || sprite.name == null) return false;
        
        string spriteName = sprite.name.ToLower();
        
        // 스커트 관련 키워드들을 확인
        return spriteName.Contains("skirt") || 
               spriteName.Contains("스커트") || 
               spriteName.Contains("치마");
    }

    /// <summary>
    /// 스프라이트 이름에서 실제 타입을 추출합니다
    /// </summary>
    private string GetActualTypeFromSpriteName(string spriteName, string baseType)
    {
        if (string.IsNullOrEmpty(spriteName)) return baseType;

        string name = spriteName.ToLower();

        // top 계열 확인
        if (baseType == "top")
        {
            if (name.Contains("top1") || name.Contains("largetop1")) return "top";
            if (name.Contains("top2") || name.Contains("largetop2")) return "top2";
            if (name.Contains("top3") || name.Contains("largetop3")) return "top3";
        }

        // bottom 계열 확인  
        if (baseType == "bottom")
        {
            if (name.Contains("bottom1") || name.Contains("largebottom1")) return "bottom";
            if (name.Contains("bottom2") || name.Contains("largebottom2")) return "bottom2";
        }

        // 기본값 반환
        return baseType;
    }

    /// <summary>
    /// 현재 캐릭터 번호를 변경하고 아이템들을 다시 생성합니다
    /// </summary>
    public void ChangeCharacter(int newCharacterNumber)
    {
        if (newCharacterNumber == currentCharacterNumber) return;

        currentCharacterNumber = newCharacterNumber;
        
        // 기존 아이템들 삭제
        ClearAllClothingItems();
        
        // 새로운 아이템들 생성
        CreateAllClothingItems();

        // 캐릭터 변경에 따른 배경색 업데이트
        NotifyCharacterChanged(newCharacterNumber);

        if (enableDebugLogging)
        {
            Debug.Log($"🔄 캐릭터 {currentCharacterNumber}로 변경되어 아이템들이 재생성되었습니다.");
        }
    }

    /// <summary>
    /// 캐릭터 변경을 다른 매니저들에게 알립니다
    /// </summary>
    private void NotifyCharacterChanged(int newCharacterNumber)
    {
        if (enableDebugLogging)
        {
            Debug.Log($"📢 캐릭터 {newCharacterNumber} 변경 알림 시작...");
        }

        // CharacterBackgroundManager에게 캐릭터 변경 알림
        CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
        if (backgroundManager != null)
        {
            if (enableDebugLogging)
            {
                Debug.Log($"🎨 CharacterBackgroundManager 발견! OnCharacterChanged({newCharacterNumber}) 호출 중...");
            }
            
            backgroundManager.OnCharacterChanged(newCharacterNumber);
            
            if (enableDebugLogging)
            {
                Debug.Log($"✅ CharacterBackgroundManager.OnCharacterChanged({newCharacterNumber}) 완료");
            }
        }
        else
        {
            Debug.LogWarning($"❌ CharacterBackgroundManager를 찾을 수 없습니다! 배경색이 변경되지 않을 수 있습니다.");
            
            // 씬에 있는 모든 MonoBehaviour 컴포넌트 중에서 검색
            CharacterBackgroundManager[] allManagers = FindObjectsByType<CharacterBackgroundManager>(FindObjectsSortMode.None);
            if (allManagers.Length > 0)
            {
                Debug.Log($"🔍 FindObjectsByType으로 {allManagers.Length}개의 CharacterBackgroundManager 발견:");
                for (int i = 0; i < allManagers.Length; i++)
                {
                    Debug.Log($"   [{i}] {allManagers[i].gameObject.name} (활성: {allManagers[i].gameObject.activeInHierarchy})");
                    if (allManagers[i].gameObject.activeInHierarchy)
                    {
                        allManagers[i].OnCharacterChanged(newCharacterNumber);
                        Debug.Log($"✅ {allManagers[i].gameObject.name}에서 OnCharacterChanged 호출 완료");
                    }
                }
            }
            else
            {
                Debug.LogError("❌ 씬에 CharacterBackgroundManager가 전혀 없습니다! 배경색 변경 기능이 동작하지 않습니다.");
            }
        }

        if (enableDebugLogging)
        {
            Debug.Log($"📢 캐릭터 {newCharacterNumber} 변경 알림 완료");
        }
    }

    /// <summary>
    /// 모든 의상 아이템들의 스프라이트를 클리어합니다 (GameObject는 삭제하지 않음)
    /// </summary>
    private void ClearAllClothingItems()
    {
        Transform[] parents = { topParent, bottomParent, shoesParent, socksParent, acc1Parent, acc2Parent };
        
        foreach (Transform parent in parents)
        {
            if (parent != null)
            {
                for (int i = 0; i < parent.childCount; i++)
                {
                    Transform child = parent.GetChild(i);
                    if (child != null)
                    {
                        // Image 컴포넌트의 스프라이트만 클리어
                        Image childImage = child.GetComponent<Image>();
                        if (childImage != null)
                        {
                            childImage.sprite = null;
                        }
                        
                        // DragAndDropItem 컴포넌트 초기화
                        DragAndDropItem dragItem = child.GetComponent<DragAndDropItem>();
                        if (dragItem != null)
                        {
                            dragItem.spriteName = "";
                            dragItem.isCorrectItem = false;
                        }
                        
                        // GameObject는 비활성화만 함 (삭제하지 않음)
                        child.gameObject.SetActive(false);
                    }
                }
            }
        }
        
        if (enableDebugLogging)
        {
            Debug.Log("🧹 모든 의상 아이템 스프라이트 클리어 완료 (GameObject는 유지)");
        }
    }

    /// <summary>
    /// 디버그: 로드된 모든 스프라이트 정보를 출력합니다
    /// </summary>
    [ContextMenu("Debug: Print All Loaded Sprites")]
    public void DebugPrintAllLoadedSprites()
    {
        Debug.Log("=== 로드된 스프라이트 정보 ===");
        
        foreach (var typeEntry in loadedSprites)
        {
            Debug.Log($"📂 {typeEntry.Key}:");
            
            foreach (var charEntry in typeEntry.Value)
            {
                Debug.Log($"  캐릭터 {charEntry.Key}: {charEntry.Value.Count}개");
                
                foreach (var sprite in charEntry.Value)
                {
                    Debug.Log($"    - {sprite.name}");
                }
            }
        }
    }

    /// <summary>
    /// MainSceneManager에서 호출할 수 있는 의상 아이템 생성 메서드
    /// </summary>
    public void CreateClothingItems()
    {
        LoadAllSprites();
        CreateAllClothingItems();
    }

    /// <summary>
    /// 현재 캐릭터 번호를 설정하고 의상 아이템들을 새로 생성합니다
    /// MainSceneManager에서 캐릭터 변경 시 호출됩니다
    /// </summary>
    public void SetCurrentCharacterAndRefresh(int characterNumber)
    {
        if (enableDebugLogging)
        {
            Debug.Log($"🔄 ClothingSpriteManager: 캐릭터 {characterNumber}로 설정하고 의상 아이템 새로고침");
        }

        currentCharacterNumber = characterNumber;

        // 현재 캐릭터의 스프라이트 데이터 유효성 검사
        ValidateCurrentCharacterSprites();
        
        // 기존 아이템들 삭제
        ClearAllClothingItems();
        
        // 새로운 아이템들 생성 (현재 캐릭터의 정답 스프라이트 포함 보장)
        CreateAllClothingItems();

        // 캐릭터 변경에 따른 배경색 업데이트
        NotifyCharacterChanged(characterNumber);

        if (enableDebugLogging)
        {
            Debug.Log($"✅ 캐릭터 {characterNumber}의 의상 아이템 생성 완료");
        }
    }

    /// <summary>
    /// 현재 캐릭터의 스프라이트 데이터 유효성을 검사합니다
    /// </summary>
    private void ValidateCurrentCharacterSprites()
    {
        if (enableDebugLogging)
        {
            Debug.Log($"🔍 캐릭터 {currentCharacterNumber}의 스프라이트 데이터 검증 중...");
        }

        foreach (string clothingType in clothingTypes)
        {
            if (loadedSprites.ContainsKey(clothingType) && 
                loadedSprites[clothingType].ContainsKey(currentCharacterNumber))
            {
                var sprites = loadedSprites[clothingType][currentCharacterNumber];
                if (enableDebugLogging)
                {
                    Debug.Log($"✅ {clothingType}: {sprites.Count}개 스프라이트 있음");
                    foreach (var sprite in sprites)
                    {
                        Debug.Log($"   - {sprite.name}");
                    }
                }
            }
            else
            {
                if (clothingType == "acc1" || clothingType == "acc2")
                {
                    if (enableDebugLogging)
                    {
                        Debug.Log($"ℹ️ {clothingType}: 액세서리는 선택사항이므로 없어도 됨");
                    }
                }
                else
                {
                    Debug.LogWarning($"⚠️ {clothingType}: 캐릭터 {currentCharacterNumber}의 필수 의상 타입이 없습니다!");
                }
            }
        }
    }

    /// <summary>
    /// 드래그 앤 드롭 시스템을 초기화합니다
    /// </summary>
    public void InitializeDragAndDropItems()
    {
        Transform[] parents = GetClothingItemParents();
        ClothingUtils.AutoAddDragAndDropItems(parents);
        
        if (enableDebugLogging)
        {
            Debug.Log("🎮 ClothingSpriteManager: 드래그 앤 드롭 시스템 초기화 완료");
        }
    }

    /// <summary>
    /// 모든 의상 아이템들을 원래 위치로 되돌립니다
    /// </summary>
    public void ResetAllClothingItems()
    {
        Transform[] parents = GetClothingItemParents();
        ClothingUtils.ResetAllClothingItems(parents);
        
        if (enableDebugLogging)
        {
            Debug.Log("↩️ ClothingSpriteManager: 모든 의상 아이템 원위치 복구 완료");
        }
    }

    /// <summary>
    /// 특정 타입의 의상 아이템들을 가져옵니다
    /// </summary>
    public DragAndDropItem[] GetItemsByType(string itemType)
    {
        Transform[] parents = GetClothingItemParents();
        return ClothingUtils.GetItemsByType(itemType, parents);
    }

    /// <summary>
    /// 의상 아이템 부모들을 배열로 반환합니다
    /// </summary>
    private Transform[] GetClothingItemParents()
    {
        return new Transform[] 
        { 
            topParent, 
            bottomParent, 
            shoesParent, 
            socksParent, 
            acc1Parent,
            acc2Parent 
        };
    }

    /// <summary>
    /// 상의 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] topItemParents => new Transform[] { topParent };

    /// <summary>
    /// 하의 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] bottomItemParents => new Transform[] { bottomParent };

    /// <summary>
    /// 신발 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] shoesItemParents => new Transform[] { shoesParent };

    /// <summary>
    /// 양말 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] socksItemParents => new Transform[] { socksParent };

    /// <summary>
    /// Acc1 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] acc1ItemParents => new Transform[] { acc1Parent };

    /// <summary>
    /// Acc2 아이템 부모들 (호환성용)
    /// </summary>
    public Transform[] acc2ItemParents => new Transform[] { acc2Parent };

    /// <summary>
    /// stuck된 아이템들을 강제로 복구합니다 (디버깅용)
    /// </summary>
    [ContextMenu("Fix Stuck Items")]
    public void FixStuckItems()
    {
        Transform[] parents = GetClothingItemParents();
        int fixedCount = 0;

        foreach (Transform parent in parents)
        {
            if (parent != null)
            {
                DragAndDropItem[] items = parent.GetComponentsInChildren<DragAndDropItem>(true);
                foreach (DragAndDropItem item in items)
                {
                    if (item != null)
                    {
                        // 다음 조건 중 하나라도 해당되면 stuck된 것으로 판단:
                        // 1. 드래그 상태가 계속 true인 경우
                        // 2. 위치가 원래 위치에서 너무 멀리 있는 경우 (100 픽셀 이상)
                        // 3. 부모가 원래 부모와 다른 경우 (슬롯에 있지 않다면)
                        bool isStuck = item.IsDragging() || 
                                      Vector3.Distance(item.transform.localPosition, Vector3.zero) > 100f ||
                                      (item.transform.parent != parent && !IsInValidSlot(item));
                        
                        if (isStuck)
                        {
                            Debug.Log($"🔧 Stuck 아이템 발견: {item.GetItemType()} - 드래그 상태: {item.IsDragging()}, 위치: {item.transform.localPosition}");
                            item.ForceEnableInteraction();
                            fixedCount++;
                        }
                    }
                }
            }
        }

        if (fixedCount > 0)
        {
            Debug.Log($"🔧 총 {fixedCount}개의 stuck된 아이템이 수정되었습니다.");
        }
        else
        {
            Debug.Log("✅ stuck된 아이템을 찾지 못했습니다.");
        }
    }

    /// <summary>
    /// 아이템이 유효한 슬롯에 있는지 확인합니다
    /// </summary>
    private bool IsInValidSlot(DragAndDropItem item)
    {
        if (item == null || item.transform.parent == null) return false;
        
        string parentName = item.transform.parent.name.ToLower();
        return parentName.Contains("slot") || parentName.Contains("슬롯");
    }

    /// <summary>
    /// 특정 타입의 아이템들만 복구합니다
    /// </summary>
    public void FixItemsByType(string itemType)
    {
        if (string.IsNullOrEmpty(itemType))
        {
            Debug.LogWarning("⚠️ 아이템 타입이 지정되지 않았습니다!");
            return;
        }

        DragAndDropItem[] items = GetItemsByType(itemType);
        int fixedCount = 0;

        foreach (DragAndDropItem item in items)
        {
            if (item != null)
            {
                Debug.Log($"🔧 {itemType} 아이템 복구 중: {item.name}");
                item.ForceEnableInteraction();
                fixedCount++;
            }
        }

        Debug.Log($"🔧 {itemType} 타입 {fixedCount}개 아이템이 복구되었습니다.");
    }

    /// <summary>
    /// 양말 아이템만 특별히 복구합니다 (컨텍스트 메뉴용)
    /// </summary>
    [ContextMenu("Fix Socks Items")]
    public void FixSocksItems()
    {
        FixItemsByType("socks");
    }
    
    /// <summary>
    /// Accessory 아이템만 특별히 복구합니다 (컨텍스트 메뉴용)
    /// </summary>
    [ContextMenu("Fix Accessory Items")]
    public void FixAccessoryItems()
    {
        Debug.Log("🔧 모든 Accessory 관련 아이템 복구 시작...");
        
        string[] accTypes = { "accessory", "acc", "acc1", "acc2" };
        int totalFixed = 0;
        
        foreach (string accType in accTypes)
        {
            DragAndDropItem[] items = GetItemsByType(accType);
            Debug.Log($"📂 {accType} 타입: {items.Length}개 아이템 발견");
            
            foreach (DragAndDropItem item in items)
            {
                if (item != null)
                {
                    Debug.Log($"🔧 {accType} 아이템 복구 중: {item.name}");
                    
                    // GameObject 활성화
                    if (!item.gameObject.activeInHierarchy)
                    {
                        item.gameObject.SetActive(true);
                        Debug.Log($"   ✅ {item.name} 활성화");
                    }
                    
                    // 강제 상호작용 복구
                    item.ForceEnableInteraction();
                    totalFixed++;
                }
            }
        }
        
        Debug.Log($"🔧 총 {totalFixed}개의 Accessory 아이템이 복구되었습니다.");
    }
    
    /// <summary>
    /// acc1, acc2 아이템들의 클릭 불가 문제를 강력하게 해결합니다
    /// </summary>
    [ContextMenu("Force Fix ACC1 ACC2 Click Issues")]
    public void ForceFixAcc1Acc2ClickIssues()
    {
        Debug.Log("🚨 ACC1, ACC2 클릭 문제 강력 해결 시작...");
        
        // 1. drawer_02에서 직접 찾기
        GameObject drawer02 = GameObject.Find("drawer_02");
        if (drawer02 != null)
        {
            Debug.Log("📂 drawer_02에서 acc 아이템들 검색 중...");
            DragAndDropItem[] drawer02Items = drawer02.GetComponentsInChildren<DragAndDropItem>(true);
            
            foreach (DragAndDropItem item in drawer02Items)
            {
                if (item != null)
                {
                    string itemType = item.GetItemType();
                    if (itemType == "acc1" || itemType == "acc2" || itemType == "acc" || itemType == "accessory")
                    {
                        ForceFixSingleAccItem(item, "drawer_02");
                    }
                }
            }
        }
        
        // 2. acc1Parent에서 찾기
        if (acc1Parent != null)
        {
            Debug.Log("📂 acc1Parent에서 acc 아이템들 검색 중...");
            DragAndDropItem[] acc1Items = acc1Parent.GetComponentsInChildren<DragAndDropItem>(true);
            
            foreach (DragAndDropItem item in acc1Items)
            {
                if (item != null)
                {
                    string itemType = item.GetItemType();
                    if (itemType == "acc1" || itemType == "acc" || itemType == "accessory")
                    {
                        ForceFixSingleAccItem(item, "acc1Parent");
                    }
                }
            }
        }
        
        // 3. acc2Parent에서 찾기
        if (acc2Parent != null)
        {
            Debug.Log("📂 acc2Parent에서 acc 아이템들 검색 중...");
            DragAndDropItem[] acc2Items = acc2Parent.GetComponentsInChildren<DragAndDropItem>(true);
            
            foreach (DragAndDropItem item in acc2Items)
            {
                if (item != null)
                {
                    string itemType = item.GetItemType();
                    if (itemType == "acc2" || itemType == "acc" || itemType == "accessory")
                    {
                        ForceFixSingleAccItem(item, "acc2Parent");
                    }
                }
            }
        }
        
        // 3. 모든 DragAndDropItem에서 검색
        Debug.Log("🔍 전체 씬에서 acc 아이템들 검색 중...");
        DragAndDropItem[] allItems = FindObjectsByType<DragAndDropItem>(FindObjectsSortMode.None);
        
        foreach (DragAndDropItem item in allItems)
        {
            if (item != null)
            {
                string itemType = item.GetItemType();
                if (itemType == "acc1" || itemType == "acc2" || itemType == "acc" || itemType == "accessory")
                {
                    ForceFixSingleAccItem(item, "전체검색");
                }
            }
        }
        
        Debug.Log("✅ ACC1, ACC2 클릭 문제 강력 해결 완료!");
    }
    
    /// <summary>
    /// 개별 acc 아이템의 클릭 문제를 강력하게 해결합니다
    /// </summary>
    private void ForceFixSingleAccItem(DragAndDropItem item, string source)
    {
        if (item == null) return;
        
        Debug.Log($"🔧 [{source}] {item.name} ({item.GetItemType()}) 강력 수정 중...");
        
        // 1. GameObject 활성화
        if (!item.gameObject.activeInHierarchy)
        {
            item.gameObject.SetActive(true);
            Debug.Log($"   ✅ GameObject 활성화: {item.name}");
        }
        
        // 2. DragAndDropItem 컴포넌트 활성화
        if (!item.enabled)
        {
            item.enabled = true;
            Debug.Log($"   ✅ DragAndDropItem 활성화: {item.name}");
        }
        
        // 3. Image 컴포넌트 수정
        Image img = item.GetComponent<Image>();
        if (img != null)
        {
            if (!img.raycastTarget)
            {
                img.raycastTarget = true;
                Debug.Log($"   ✅ raycastTarget 활성화: {item.name}");
            }
            
            // Image가 null sprite면 임시로라도 설정
            if (img.sprite == null)
            {
                Debug.LogWarning($"   ⚠️ {item.name}의 sprite가 null입니다!");
            }
        }
        else
        {
            Debug.LogError($"   ❌ {item.name}에 Image 컴포넌트가 없습니다!");
        }
        
        // 4. CanvasGroup 수정
        CanvasGroup canvasGroup = item.GetComponent<CanvasGroup>();
        if (canvasGroup != null)
        {
            if (!canvasGroup.blocksRaycasts)
            {
                canvasGroup.blocksRaycasts = true;
                Debug.Log($"   ✅ blocksRaycasts 활성화: {item.name}");
            }
            
            if (canvasGroup.alpha < 1f)
            {
                canvasGroup.alpha = 1f;
                Debug.Log($"   ✅ alpha를 1로 설정: {item.name}");
            }
            
            if (!canvasGroup.interactable)
            {
                canvasGroup.interactable = true;
                Debug.Log($"   ✅ interactable 활성화: {item.name}");
            }
        }
        
        // 5. Collider2D가 있으면 활성화
        Collider2D collider2D = item.GetComponent<Collider2D>();
        if (collider2D != null && !collider2D.enabled)
        {
            collider2D.enabled = true;
            Debug.Log($"   ✅ Collider2D 활성화: {item.name}");
        }
        
        // 6. Canvas 설정 (sorting order 확인)
        Canvas itemCanvas = item.GetComponent<Canvas>();
        if (itemCanvas != null)
        {
            if (itemCanvas.sortingOrder < 100)
            {
                itemCanvas.sortingOrder = 200; // 충분히 높은 값으로 설정
                Debug.Log($"   ✅ Canvas sortingOrder를 200으로 설정: {item.name}");
            }
        }
        
        // 7. RectTransform 크기 확인
        RectTransform rectTransform = item.GetComponent<RectTransform>();
        if (rectTransform != null)
        {
            Vector2 size = rectTransform.sizeDelta;
            if (size.x <= 0 || size.y <= 0)
            {
                rectTransform.sizeDelta = new Vector2(100, 100); // 최소 크기 보장
                Debug.Log($"   ✅ RectTransform 크기 보정: {item.name} -> {rectTransform.sizeDelta}");
            }
        }
        
        // 8. 강제 상호작용 활성화
        item.ForceEnableInteraction();
        
        // 9. 컴포넌트 새로고침 (끄고 켜기)
        item.enabled = false;
        item.enabled = true;
        
        Debug.Log($"   🎯 {item.name} 강력 수정 완료!");
    }

    /// <summary>
    /// 모든 아이템의 상태를 리셋하고 원위치로 되돌립니다
    /// </summary>
    [ContextMenu("Reset All Items To Original")]
    public void ResetAllItemsToOriginal()
    {
        ResetAllClothingItems();
        FixStuckItems(); // 추가로 stuck 된 아이템도 수정
        Debug.Log("🔄 모든 아이템이 원위치로 복구되고 stuck 상태가 해제되었습니다.");
    }

    /// <summary>
    /// 현재 모든 아이템의 레이어 순서를 디버그 출력합니다
    /// </summary>
    [ContextMenu("Debug: Print Layer Orders")]
    public void DebugPrintLayerOrders()
    {
        Debug.Log("=== 의상 아이템 레이어 순서 ===");
        LayerOrderManager.DebugLayerOrder();
        
        Transform[] parents = GetClothingItemParents();
        
        foreach (Transform parent in parents)
        {
            if (parent != null)
            {
                DragAndDropItem[] items = parent.GetComponentsInChildren<DragAndDropItem>(true);
                Debug.Log($"📂 {parent.name} 하위 아이템들:");
                
                foreach (DragAndDropItem item in items)
                {
                    if (item != null)
                    {
                        Canvas itemCanvas = item.GetComponent<Canvas>();
                        int sortingOrder = itemCanvas != null ? itemCanvas.sortingOrder : -1;
                        Debug.Log($"   - {item.name}: sortingOrder={sortingOrder} (타입: {item.GetItemType()})");
                    }
                }
            }
        }
        
        Debug.Log("==========================");
    }

    /// <summary>
    /// 현재 캐릭터의 상징색과 배경색 정보를 출력합니다
    /// </summary>
    [ContextMenu("Debug: Print Character Color Info")]
    public void DebugPrintCharacterColorInfo()
    {
        Debug.Log("=== 캐릭터 색상 정보 ===");
        
        CharacterData currentCharacterData = GetCurrentCharacterData();
        if (currentCharacterData != null)
        {
            Debug.Log($"🎭 현재 캐릭터: {currentCharacterData.characterName}");
            Debug.Log($"🎨 상징색: {currentCharacterData.characterColor}");
            
            // 배경 관리자 정보
            CharacterBackgroundManager backgroundManager = FindFirstObjectByType<CharacterBackgroundManager>();
            if (backgroundManager != null)
            {
                Color currentBgColor = backgroundManager.GetCurrentBackgroundColor();
                Debug.Log($"🌈 현재 배경색: {currentBgColor}");
            }
            else
            {
                Debug.Log("⚠️ CharacterBackgroundManager를 찾을 수 없습니다.");
            }
        }
        else
        {
            Debug.LogWarning($"⚠️ 현재 캐릭터({currentCharacterNumber})의 CharacterData를 찾을 수 없습니다!");
        }
        
        Debug.Log("====================");
    }

    /// <summary>
    /// 현재 캐릭터의 CharacterData를 반환합니다
    /// </summary>
    /// <returns>현재 캐릭터의 CharacterData 또는 null</returns>
    private CharacterData GetCurrentCharacterData()
    {
        CharacterData[] allCharacters = Resources.LoadAll<CharacterData>("Characters");
        
        foreach (CharacterData charData in allCharacters)
        {
            if (charData != null && charData.characterName.Contains($"Cha_{currentCharacterNumber}"))
            {
                return charData;
            }
        }

        return null;
    }
}