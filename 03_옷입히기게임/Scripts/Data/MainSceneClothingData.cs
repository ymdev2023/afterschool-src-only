using UnityEngine;

/// <summary>
/// MainScene의 옷입히기 시스템 데이터 관리 클래스
/// </summary>
public class MainSceneClothingData : MonoBehaviour
{
    [Header("Clothing System")]
    [Tooltip("cha_l (Large Character) 캔버스 오브젝트")]
    public Transform chaLargeTransform;

    [Tooltip("각 의상 부위별 슬롯들")]
    public Transform topSlot;
    public Transform socksSlot;
    public Transform shoesSlot;
    public Transform bottomSlot;

    [Header("Clothing Settings")]
    [Tooltip("자석 효과 범위 (픽셀 단위) - 값이 작을수록 더 정확한 위치에서만 스냅")]
    public float snapDistance = 150f;

    [Header("Clothing Items Parents")]
    [Tooltip("의상 아이템들이 들어있는 부모 오브젝트들")]
    public Transform[] clothingItemsParents;

    // Private variables
    private ClothingSlot[] clothingSlots;
    private DragAndDropItem currentDraggedItem;

    /// <summary>
    /// 옷입히기 슬롯들을 초기화합니다
    /// </summary>
    public void InitializeClothingSlots()
    {
        clothingSlots = ClothingUtils.FindAllClothingSlots();
    }

    /// <summary>
    /// 모든 옷입히기 슬롯들을 반환합니다
    /// </summary>
    public ClothingSlot[] GetClothingSlots()
    {
        return clothingSlots;
    }

    /// <summary>
    /// 현재 드래그 중인 아이템을 설정합니다
    /// </summary>
    public void SetCurrentDraggedItem(DragAndDropItem item)
    {
        currentDraggedItem = item;
    }

    /// <summary>
    /// 현재 드래그 중인 아이템을 반환합니다
    /// </summary>
    public DragAndDropItem GetCurrentDraggedItem()
    {
        return currentDraggedItem;
    }

    /// <summary>
    /// cha_l 오브젝트가 활성화되어 있는지 확인하고 필요시 활성화합니다
    /// </summary>
    public void EnsureChaLargeActive()
    {
        if (chaLargeTransform != null && !chaLargeTransform.gameObject.activeInHierarchy)
        {
            chaLargeTransform.gameObject.SetActive(true);
        }
    }
}
