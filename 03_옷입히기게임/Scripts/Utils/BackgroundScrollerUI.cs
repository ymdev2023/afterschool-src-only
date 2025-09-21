using UnityEngine;
using UnityEngine.UI;

public class BackgroundScrollerUI : MonoBehaviour
{
    [Header("Resources/Textures/pattern.png")]
    public string texturePath = "Textures/pattern";

    [Header("Pattern Size (in pixels)")]
    public Vector2 patternSize = new Vector2(128, 128);

    [Header("Tiling (screen coverage, fewer = larger tiles)")]
    public Vector2 tiling = new Vector2(2f, 2f);

    [Header("Scroll Speed (pixels/sec)")]
    public float scrollSpeed = 20f;

    [Header("Pattern Color (with alpha for transparency)")]
    [Tooltip("기본 패턴 색상 (캐릭터 선택 시 자동으로 변경됨)")]
    public Color patternColor = new Color(1f, 0.8f, 0.85f, 0.4f);

    [Header("Character Color Settings")]
    [Tooltip("캐릭터 색상을 적용할 때의 투명도")]
    [Range(0.1f, 1.0f)]
    public float characterColorAlpha = 0.4f;

    private RawImage rawImage;
    private Rect uvRect;
    private float scrollX = 0f;
    private float scrollY = 0f;

    void Awake()
    {
        Debug.Log("BackgroundScrollerUI AWAKE 호출됨! GameObject: " + gameObject.name);
    }

    void OnEnable()
    {
        Debug.Log("BackgroundScrollerUI OnEnable 호출됨! GameObject: " + gameObject.name);
    }

    void Start()
    {
        Debug.Log("BackgroundScrollerUI START 호출됨! GameObject: " + gameObject.name);
        Debug.Log("BackgroundScrollerUI 시작됨!");

        // 현재 오브젝트가 Canvas 하위에 있는지 확인
        Canvas parentCanvas = GetComponentInParent<Canvas>();
        if (parentCanvas == null)
        {
            // Canvas가 없으면 메인 Canvas 찾아서 하위로 이동
            Canvas[] allCanvases = FindObjectsByType<Canvas>(FindObjectsSortMode.None);
            if (allCanvases.Length > 0)
            {
                parentCanvas = allCanvases[0];
                transform.SetParent(parentCanvas.transform, false);
                Debug.Log("Canvas 하위로 자동 이동됨: " + parentCanvas.name);
            }
            else
            {
                Debug.LogError("Canvas를 찾을 수 없습니다!");
                return;
            }
        }

        Debug.Log("부모 Canvas 찾음: " + parentCanvas.name);

        // 현재 GameObject에 RawImage가 있는지 확인, 없으면 추가
        rawImage = GetComponent<RawImage>();
        if (rawImage == null)
        {
            rawImage = gameObject.AddComponent<RawImage>();
            Debug.Log("RawImage 컴포넌트 추가됨");
        }

        // RectTransform 설정 - 전체 화면에 맞게
        RectTransform rect = GetComponent<RectTransform>();
        if (rect != null)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            rect.anchoredPosition = Vector2.zero;
            rect.sizeDelta = Vector2.zero;
        }

        // 텍스처 로드 및 설정
        Texture2D tex = Resources.Load<Texture2D>(texturePath);
        if (tex == null)
        {
            Debug.LogWarning("Texture not found at Resources/" + texturePath + ", creating default pattern texture");
            tex = CreateDefaultPatternTexture();
        }
        else
        {
            Debug.Log("텍스처 로드됨: " + texturePath);
        }

        tex.filterMode = FilterMode.Point;
        tex.wrapMode = TextureWrapMode.Repeat;

        // RawImage 세팅
        rawImage.texture = tex;
        rawImage.raycastTarget = false;

        // 인스펙터에서 설정한 색 적용
        rawImage.color = patternColor;

        // 초기 타일링 사이즈 설정
        uvRect = new Rect(0, 0, tiling.x, tiling.y);
        rawImage.uvRect = uvRect;

        // 맨 뒤로 이동 (다른 UI보다 뒤에 배치)
        transform.SetAsFirstSibling();

        Debug.Log("BackgroundScrollerUI 설정완료!");
        Debug.Log("패턴 크기: " + patternSize + ", 타일링: " + tiling + ", 색상: " + patternColor);
        Debug.Log("Canvas: " + parentCanvas.name + ", GameObject: " + gameObject.name);
    }

    void Update()
    {
        if (rawImage == null) return;

        scrollX += (scrollSpeed * Time.deltaTime) / patternSize.x;
        scrollY += (scrollSpeed * Time.deltaTime) / patternSize.y;

        uvRect.x = scrollX;
        uvRect.y = scrollY;
        rawImage.uvRect = uvRect;
    }

    private Texture2D CreateDefaultPatternTexture()
    {
        int size = 32;
        Texture2D texture = new Texture2D(size, size);

        Color bgColor = new Color(1f, 1f, 1f, 0f);
        Color dotColor = new Color(1f, 0.8f, 0.85f, 0.3f);

        // 배경 채우기
        for (int x = 0; x < size; x++)
        {
            for (int y = 0; y < size; y++)
            {
                texture.SetPixel(x, y, bgColor);
            }
        }

        // 도트 패턴 그리기 (격자 무늬)
        for (int x = 0; x < size; x += 8)
        {
            for (int y = 0; y < size; y += 8)
            {
                // 3x3 도트 그리기
                for (int dx = 0; dx < 3 && x + dx < size; dx++)
                {
                    for (int dy = 0; dy < 3 && y + dy < size; dy++)
                    {
                        texture.SetPixel(x + dx, y + dy, dotColor);
                    }
                }
            }
        }

        texture.Apply();
        texture.filterMode = FilterMode.Point;
        texture.wrapMode = TextureWrapMode.Repeat;

        Debug.Log("기본 도트 패턴 텍스처 생성됨 (32x32)");
        return texture;
    }

    /// <summary>
    /// 캐릭터 상징색으로 배경 패턴 색상을 변경합니다
    /// </summary>
    /// <param name="characterColor">캐릭터의 상징색</param>
    public void SetCharacterColor(Color characterColor)
    {
        if (rawImage == null) 
        {
            Debug.LogError("BackgroundScrollerUI: rawImage가 null입니다!");
            return;
        }

        // 캐릭터 색상에 설정된 투명도 적용
        Color newPatternColor = characterColor;
        newPatternColor.a = characterColorAlpha;

        patternColor = newPatternColor;
        rawImage.color = patternColor;
        
        // RawImage 강제 업데이트
        if (rawImage.material != null)
        {
            rawImage.SetMaterialDirty();
        }
        rawImage.SetVerticesDirty();
        
        // Canvas 강제 업데이트
        Canvas.ForceUpdateCanvases();

        Debug.Log($"🎨 배경 패턴 색상이 캐릭터 색상으로 변경됨: {characterColor} (투명도: {characterColorAlpha})");
        Debug.Log($"🔍 실제 rawImage.color: {rawImage.color}, patternColor: {patternColor}");
    }

    /// <summary>
    /// 기본 패턴 색상으로 복원합니다
    /// </summary>
    public void ResetToDefaultColor()
    {
        Color defaultColor = new Color(1f, 0.8f, 0.85f, 0.4f);
        SetPatternColor(defaultColor);
        Debug.Log("🔄 배경 패턴 색상이 기본색으로 복원됨");
    }
    
    /// <summary>
    /// 현재 배경 상태를 디버깅합니다
    /// </summary>
    public void DebugCurrentState()
    {
        Debug.Log($"=== BackgroundScrollerUI 상태 디버그 ===");
        Debug.Log($"GameObject: {gameObject.name}");
        Debug.Log($"Active: {gameObject.activeInHierarchy}");
        Debug.Log($"RawImage: {rawImage != null}");
        if (rawImage != null)
        {
            Debug.Log($"RawImage Color: {rawImage.color}");
            Debug.Log($"RawImage Texture: {rawImage.texture != null}");
            Debug.Log($"RawImage Material: {rawImage.material != null}");
        }
        Debug.Log($"Pattern Color: {patternColor}");
        Debug.Log($"Character Color Alpha: {characterColorAlpha}");
        Debug.Log($"================================");
    }

    /// <summary>
    /// 패턴 색상을 직접 설정합니다
    /// </summary>
    /// <param name="color">설정할 색상</param>
    public void SetPatternColor(Color color)
    {
        if (rawImage == null) return;

        patternColor = color;
        rawImage.color = patternColor;

        Debug.Log($"🎨 배경 패턴 색상 직접 설정: {color}");
    }

    /// <summary>
    /// 현재 패턴 색상을 반환합니다
    /// </summary>
    /// <returns>현재 패턴 색상</returns>
    public Color GetCurrentPatternColor()
    {
        return patternColor;
    }
}
