using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections.Generic;
using System.Collections;

/// <summary>
/// UI 관련 유틸리티 클래스
/// </summary>
public static class UIUtils
{
    /// <summary>
    /// 버튼에 클릭 이벤트를 설정합니다
    /// </summary>
    public static void SetButtonClick(Button button, System.Action action)
    {
        if (button != null && action != null)
        {
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(() => action());
        }
    }

    /// <summary>
    /// 여러 오브젝트의 활성 상태를 한번에 설정합니다
    /// </summary>
    public static void SetActiveMultiple(bool active, params GameObject[] objects)
    {
        foreach (GameObject obj in objects)
        {
            if (obj != null)
            {
                obj.SetActive(active);
            }
        }
    }

    /// <summary>
    /// 이미지 컴포넌트에 스프라이트를 설정합니다
    /// </summary>
    public static void SetImageSprite(Image image, Sprite sprite)
    {
        SetImageSprite(image, sprite, true);
    }

    /// <summary>
    /// 이미지 컴포넌트에 스프라이트를 설정합니다
    /// </summary>
    /// <param name="image">대상 이미지 컴포넌트</param>
    /// <param name="sprite">설정할 스프라이트</param>
    /// <param name="setNativeSize">native size 적용 여부</param>
    public static void SetImageSprite(Image image, Sprite sprite, bool setNativeSize)
    {
        if (image != null)
        {
            image.sprite = sprite;
            if (sprite != null && setNativeSize)
            {
                image.SetNativeSize(); // 스프라이트 설정 후 native size 적용
            }
            image.gameObject.SetActive(sprite != null);
        }
    }

    /// <summary>
    /// 여러 이미지에 동시에 스프라이트를 설정합니다
    /// </summary>
    public static void SetImageSprites(Sprite sprite, params Image[] images)
    {
        SetImageSprites(sprite, true, images);
    }

    /// <summary>
    /// 여러 이미지에 동시에 스프라이트를 설정합니다
    /// </summary>
    /// <param name="sprite">설정할 스프라이트</param>
    /// <param name="setNativeSize">native size 적용 여부</param>
    /// <param name="images">대상 이미지들</param>
    public static void SetImageSprites(Sprite sprite, bool setNativeSize, params Image[] images)
    {
        foreach (Image image in images)
        {
            SetImageSprite(image, sprite, setNativeSize);
        }
    }

    /// <summary>
    /// 캔버스 그룹의 알파값을 조절합니다
    /// </summary>
    public static void SetCanvasGroupAlpha(CanvasGroup canvasGroup, float alpha)
    {
        if (canvasGroup != null)
        {
            canvasGroup.alpha = Mathf.Clamp01(alpha);
        }
    }

    /// <summary>
    /// UI 요소들을 페이드 인/아웃 시킵니다
    /// </summary>
    public static IEnumerator FadeCanvasGroup(CanvasGroup canvasGroup, float targetAlpha, float duration)
    {
        if (canvasGroup == null) yield break;

        float startAlpha = canvasGroup.alpha;
        float elapsed = 0;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            canvasGroup.alpha = Mathf.Lerp(startAlpha, targetAlpha, t);
            yield return null;
        }

        canvasGroup.alpha = targetAlpha;
    }

    /// <summary>
    /// 스크롤 뷰를 맨 위로 리셋합니다
    /// </summary>
    public static void ResetScrollView(ScrollRect scrollRect)
    {
        if (scrollRect != null)
        {
            scrollRect.verticalNormalizedPosition = 1f;
            scrollRect.horizontalNormalizedPosition = 0f;
        }
    }

    /// <summary>
    /// 텍스트 컴포넌트의 내용을 설정합니다
    /// </summary>
    public static void SetText(Text textComponent, string text)
    {
        if (textComponent != null)
        {
            textComponent.text = text ?? "";
        }
    }

    /// <summary>
    /// TMPro 텍스트 컴포넌트의 내용을 설정합니다
    /// </summary>
    public static void SetTextMeshPro(TMPro.TextMeshProUGUI textComponent, string text)
    {
        if (textComponent != null)
        {
            textComponent.text = text ?? "";
        }
    }

    /// <summary>
    /// 이미지의 색상을 설정합니다
    /// </summary>
    public static void SetImageColor(Image image, Color color)
    {
        if (image != null)
        {
            image.color = color;
        }
    }

    /// <summary>
    /// 여러 이미지의 색상을 한번에 설정합니다
    /// </summary>
    public static void SetImageColors(Color color, params Image[] images)
    {
        foreach (Image image in images)
        {
            SetImageColor(image, color);
        }
    }

    /// <summary>
    /// 버튼의 상호작용 가능 여부를 설정합니다
    /// </summary>
    public static void SetButtonInteractable(Button button, bool interactable)
    {
        if (button != null)
        {
            button.interactable = interactable;
        }
    }

    /// <summary>
    /// 여러 버튼의 상호작용 가능 여부를 한번에 설정합니다
    /// </summary>
    public static void SetButtonsInteractable(bool interactable, params Button[] buttons)
    {
        foreach (Button button in buttons)
        {
            SetButtonInteractable(button, interactable);
        }
    }

    /// <summary>
    /// 슬라이더 값을 설정합니다
    /// </summary>
    public static void SetSliderValue(Slider slider, float value)
    {
        if (slider != null)
        {
            slider.value = Mathf.Clamp(value, slider.minValue, slider.maxValue);
        }
    }

    /// <summary>
    /// 토글 상태를 설정합니다
    /// </summary>
    public static void SetToggleValue(Toggle toggle, bool isOn)
    {
        if (toggle != null)
        {
            toggle.isOn = isOn;
        }
    }

    /// <summary>
    /// 인풋필드의 텍스트를 설정합니다
    /// </summary>
    public static void SetInputFieldText(InputField inputField, string text)
    {
        if (inputField != null)
        {
            inputField.text = text ?? "";
        }
    }

    /// <summary>
    /// RectTransform의 위치를 설정합니다
    /// </summary>
    public static void SetRectPosition(RectTransform rectTransform, Vector2 position)
    {
        if (rectTransform != null)
        {
            rectTransform.anchoredPosition = position;
        }
    }

    /// <summary>
    /// RectTransform의 크기를 설정합니다
    /// </summary>
    public static void SetRectSize(RectTransform rectTransform, Vector2 size)
    {
        if (rectTransform != null)
        {
            rectTransform.sizeDelta = size;
        }
    }

    /// <summary>
    /// UI 요소를 부드럽게 이동시킵니다
    /// </summary>
    public static IEnumerator MoveUI(RectTransform rectTransform, Vector2 targetPosition, float duration)
    {
        if (rectTransform == null) yield break;

        Vector2 startPosition = rectTransform.anchoredPosition;
        float elapsed = 0;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            rectTransform.anchoredPosition = Vector2.Lerp(startPosition, targetPosition, t);
            yield return null;
        }

        rectTransform.anchoredPosition = targetPosition;
    }

    /// <summary>
    /// UI 요소를 부드럽게 스케일 변경합니다
    /// </summary>
    public static IEnumerator ScaleUI(Transform transform, Vector3 targetScale, float duration)
    {
        if (transform == null) yield break;

        Vector3 startScale = transform.localScale;
        float elapsed = 0;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            transform.localScale = Vector3.Lerp(startScale, targetScale, t);
            yield return null;
        }

        transform.localScale = targetScale;
    }

    #region Scene Management
    /// <summary>
    /// 지정한 씬으로 이동합니다
    /// </summary>
    public static void LoadScene(string sceneName)
    {
        SceneManager.LoadScene(sceneName);
    }

    /// <summary>
    /// SelectScene으로 이동합니다
    /// </summary>
    public static void GoToSelectScene()
    {
        LoadScene("SelectScene");
    }

    /// <summary>
    /// MainScene으로 이동합니다
    /// </summary>
    public static void GoToMainScene()
    {
        LoadScene("MainScene");
    }
    #endregion

    #region Loading Screen
    /// <summary>
    /// 로딩 화면을 표시하거나 숨깁니다
    /// </summary>
    public static void ShowLoadingScreen(GameObject loadingScreen, bool show)
    {
        if (loadingScreen != null)
        {
            loadingScreen.SetActive(show);
        }
    }
    #endregion

    #region Toast Messages
    /// <summary>
    /// 간단한 토스트 메시지를 표시합니다 (MonoBehaviour 필요)
    /// </summary>
    public static void ShowToast(MonoBehaviour behaviour, Text textComponent, string message, float duration = 2f)
    {
        if (behaviour != null && textComponent != null)
        {
            behaviour.StartCoroutine(ShowToastCoroutine(textComponent, message, duration));
        }
    }

    /// <summary>
    /// 토스트 메시지 표시 코루틴
    /// </summary>
    private static IEnumerator ShowToastCoroutine(Text textComponent, string message, float duration)
    {
        if (textComponent == null) yield break;

        string originalText = textComponent.text;
        bool originalActive = textComponent.gameObject.activeSelf;

        textComponent.text = message;
        textComponent.gameObject.SetActive(true);

        yield return new WaitForSeconds(duration);

        textComponent.text = originalText;
        textComponent.gameObject.SetActive(originalActive);
    }
    #endregion
}
