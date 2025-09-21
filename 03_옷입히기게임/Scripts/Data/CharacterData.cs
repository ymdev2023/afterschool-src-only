using UnityEngine;

[CreateAssetMenu(fileName = "New Character Data", menuName = "Character Selection/Character Data")]
public class CharacterData : ScriptableObject
{
    [Header("Character Index")]
    [Tooltip("캐릭터 인덱스 번호 (1부터 시작, Cha_1 = 1, Cha_2 = 2, ...)")]
    public int characterIndex = 1;

    [Header("Basic Character Information")]
    public string characterName;

    [Header("Character Sprites")]
    [Tooltip("작은 캐릭터 스프라이트 (선택창에서 사용)")]
    public Sprite characterSprite;

    [Tooltip("큰 캐릭터 스프라이트 (게임에서 사용)")]
    public Sprite largeCharacterSprite;

    [Header("Large Character Clothing Sprites - Base Layer")]
    [Tooltip("큰 캐릭터용 상의 스프라이트 1 (베이스 레이어, 필수)")]
    public Sprite largeTop1Sprite;
    [Tooltip("상의 1 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeTop1SpriteName = "";

    [Tooltip("큰 캐릭터용 하의 스프라이트 1 (베이스 레이어, 필수)")]
    public Sprite largeBottom1Sprite;
    [Tooltip("하의 1 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeBottom1SpriteName = "";

    [Tooltip("큰 캐릭터용 신발 스프라이트 (필수)")]
    public Sprite largeShoesSprite;
    [Tooltip("신발 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeShoesSpriteName = "";

    [Header("Optional Large Character Clothing - Upper Layers")]
    [Tooltip("큰 캐릭터용 상의 스프라이트 2 (상위 레이어, 선택사항)")]
    public Sprite largeTop2Sprite;
    [Tooltip("상의 2 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeTop2SpriteName = "";

    [Tooltip("큰 캐릭터용 상의 스프라이트 3 (최상위 레이어, 선택사항)")]
    public Sprite largeTop3Sprite;
    [Tooltip("상의 3 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeTop3SpriteName = "";

    [Tooltip("큰 캐릭터용 하의 스프라이트 2 (상위 레이어, 선택사항)")]
    public Sprite largeBottom2Sprite;
    [Tooltip("하의 2 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeBottom2SpriteName = "";

    [Tooltip("큰 캐릭터용 양말 스프라이트 (선택사항)")]
    public Sprite largeSocksSprite;
    [Tooltip("양말 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeSocksSpriteName = "";

    [Tooltip("큰 캐릭터용 악세서리 스프라이트 1 (선택사항)")]
    public Sprite largeAcc1Sprite;
    [Tooltip("악세서리 1 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeAcc1SpriteName = "";

    [Tooltip("큰 캐릭터용 악세서리 스프라이트 2 (최상위 레이어, 선택사항)")]
    public Sprite largeAcc2Sprite;
    [Tooltip("악세서리 2 스프라이트 이름 (드래그 아이템과 매칭용)")]
    public string largeAcc2SpriteName = "";

    [Header("Optional Description")]
    [TextArea(2, 4)]
    public string characterDescription = "";

    [Header("Character Color")]
    [Tooltip("캐릭터의 상징색 (MainScene 배경색으로 사용됨)")]
    public Color characterColor = Color.white;

    [Header("Lock Status")]
    public bool isLocked = false;
    public string unlockCondition = "";

    [Header("Availability")]
    public bool isAvailable = true;

    #region Clothing Sprite Name Helper Methods

    /// <summary>
    /// 특정 의상 타입의 스프라이트 이름을 반환합니다
    /// </summary>
    /// <param name="clothingType">의상 타입 (top1, top2, top3, bottom1, bottom2, socks, shoes, acc1, acc2)</param>
    /// <returns>해당하는 스프라이트 이름 또는 빈 문자열</returns>
    public string GetClothingSpriteName(string clothingType)
    {
        if (string.IsNullOrEmpty(clothingType)) return "";

        switch (clothingType.ToLower())
        {
            case "top1":
                return largeTop1SpriteName;
            case "top2":
                return largeTop2SpriteName;
            case "top3":
                return largeTop3SpriteName;
            case "bottom1":
                return largeBottom1SpriteName;
            case "bottom2":
                return largeBottom2SpriteName;
            case "socks":
                return largeSocksSpriteName;
            case "shoes":
                return largeShoesSpriteName;
            case "acc1":
            case "accessory1":
                return largeAcc1SpriteName;
            case "acc2":
            case "accessory2":
                return largeAcc2SpriteName;
            case "acc":
            case "accessory":
                // 하위 호환성을 위해 acc1 이름을 반환
                return largeAcc1SpriteName;
            default:
                return "";
        }
    }

    /// <summary>
    /// 특정 의상 타입에 스프라이트 이름을 설정합니다
    /// </summary>
    /// <param name="clothingType">의상 타입</param>
    /// <param name="spriteName">설정할 스프라이트 이름</param>
    public void SetClothingSpriteName(string clothingType, string spriteName)
    {
        if (string.IsNullOrEmpty(clothingType)) return;

        switch (clothingType.ToLower())
        {
            case "top1":
                largeTop1SpriteName = spriteName;
                break;
            case "top2":
                largeTop2SpriteName = spriteName;
                break;
            case "top3":
                largeTop3SpriteName = spriteName;
                break;
            case "bottom1":
                largeBottom1SpriteName = spriteName;
                break;
            case "bottom2":
                largeBottom2SpriteName = spriteName;
                break;
            case "socks":
                largeSocksSpriteName = spriteName;
                break;
            case "shoes":
                largeShoesSpriteName = spriteName;
                break;
            case "acc1":
            case "accessory1":
                largeAcc1SpriteName = spriteName;
                break;
            case "acc2":
            case "accessory2":
                largeAcc2SpriteName = spriteName;
                break;
            case "acc":
            case "accessory":
                largeAcc1SpriteName = spriteName;
                break;
        }
    }

    /// <summary>
    /// 모든 의상 스프라이트 이름 정보를 로그로 출력합니다 (디버그용)
    /// </summary>
    public void LogAllClothingSpriteNames()
    {
        Debug.Log($"캐릭터 '{characterName}'의 의상 스프라이트 이름 정보:");
        Debug.Log($"- Top1: '{largeTop1SpriteName}' (스프라이트: {(largeTop1Sprite != null ? largeTop1Sprite.name : "없음")})");
        Debug.Log($"- Top2: '{largeTop2SpriteName}' (스프라이트: {(largeTop2Sprite != null ? largeTop2Sprite.name : "없음")})");
        Debug.Log($"- Top3: '{largeTop3SpriteName}' (스프라이트: {(largeTop3Sprite != null ? largeTop3Sprite.name : "없음")})");
        Debug.Log($"- Bottom1: '{largeBottom1SpriteName}' (스프라이트: {(largeBottom1Sprite != null ? largeBottom1Sprite.name : "없음")})");
        Debug.Log($"- Bottom2: '{largeBottom2SpriteName}' (스프라이트: {(largeBottom2Sprite != null ? largeBottom2Sprite.name : "없음")})");
        Debug.Log($"- Socks: '{largeSocksSpriteName}' (스프라이트: {(largeSocksSprite != null ? largeSocksSprite.name : "없음")})");
        Debug.Log($"- Shoes: '{largeShoesSpriteName}' (스프라이트: {(largeShoesSprite != null ? largeShoesSprite.name : "없음")})");
        Debug.Log($"- Acc1: '{largeAcc1SpriteName}' (스프라이트: {(largeAcc1Sprite != null ? largeAcc1Sprite.name : "없음")})");
        Debug.Log($"- Acc2: '{largeAcc2SpriteName}' (스프라이트: {(largeAcc2Sprite != null ? largeAcc2Sprite.name : "없음")})");
        Debug.Log($"- 캐릭터 상징색: {characterColor}");
    }

    /// <summary>
    /// 캐릭터 번호에 따른 추천 상징색을 설정합니다 (개발용 헬퍼)
    /// </summary>
    [ContextMenu("Set Recommended Color")]
    public void SetRecommendedColor()
    {
        // 캐릭터 이름에서 번호 추출
        if (characterName.Contains("Cha_1"))
        {
            characterColor = new Color(1f, 0.7f, 0.7f, 1f); // 연한 핑크
        }
        else if (characterName.Contains("Cha_2"))
        {
            characterColor = new Color(0.7f, 0.9f, 1f, 1f); // 연한 하늘색
        }
        else if (characterName.Contains("Cha_3"))
        {
            characterColor = new Color(0.9f, 1f, 0.7f, 1f); // 연한 연두색
        }
        else if (characterName.Contains("Cha_4"))
        {
            characterColor = new Color(1f, 0.9f, 0.7f, 1f); // 연한 주황색
        }
        else if (characterName.Contains("Cha_5"))
        {
            characterColor = new Color(0.9f, 0.7f, 1f, 1f); // 연한 보라색
        }
        else
        {
            characterColor = new Color(1f, 1f, 1f, 1f); // 기본 흰색
        }

        Debug.Log($"🎨 {characterName}에 추천 상징색 설정: {characterColor}");
    }

    #endregion
}
