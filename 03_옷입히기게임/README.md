# AFTERSCHOOL 03 : 옷입히기 게임 핵심 코드

본 폴더는 `AFTERSCHOOL` 프로젝트의 옷입히기 미니게임을 구현할 때 필요한 핵심 스크립트만 정리한 버전입니다. 메인 프로젝트와 동일한 말투와 구성으로 정리했으며, 실제 씬에 붙어 있는 오브젝트의 핵심 로직을 그대로 옮겨 놓았습니다.

## 🎥 플레이 영상
- [실행 영상 보기](https://youtube.com/shorts/8AI1eVJTp2w)

## 구성
- `Scripts/Data` : 캐릭터/의상 정보(`CharacterData`, `MainSceneCharacterData`, `MainSceneClothingData`)를 다루는 스크립트.
- `Scripts/Managers` : 메인 씬 로직(`MainSceneManager`), 의상 생성(`ClothingSpriteManager`), 팝업, 사운드 등을 총괄하는 매니저 집합.
- `Scripts/Utils` : 드래그 앤 드롭(`DragAndDropItem`, `ClothingSlot`), UI 헬퍼, 팝업/레이어 관리 등 매니저가 의존하는 유틸리티.

> **필수 리소스** : `Resources/Characters` 아래에 `CharacterData` ScriptableObject / 의상 스프라이트, `Resources/Images`의 슬롯 UI, DOTween 패키지(`DG.Tweening`)가 동일하게 필요합니다.

## 구현 내용
- **메인 씬 컨트롤러** (`MainSceneManager`)
  - 선택된 캐릭터를 로드하고 상/하의·양말·신발·액세서리를 슬롯에 적용.
  - 완료 팝업, 스테이지 팝업, 밸리데이션 메시지, 드래그 활성화 타이밍까지 한 곳에서 제어.
- **의상 자동 생성 파이프라인** (`ClothingSpriteManager`)
  - `Resources/Characters`에 있는 모든 `CharacterData`를 읽어 올바른 슬롯 부모에 동적으로 아이템 프리팹을 생성.
  - 타입별 아이템 수 제한, 정답 아이템 마킹, 정렬/레이어링을 한 번에 처리.
- **드래그 앤 드롭 시스템** (`DragAndDropItem` + `ClothingSlot` + `ClothingUtils`)
  - 스프라이트 이름을 파싱해 아이템 타입을 결정하고, 슬롯과의 호환성을 검사해 스냅.
  - 실패 시 부드러운 원위치 복귀, 성공 시 스냅 애니메이션·레이어 정렬을 수행.
- **씬 전환 및 팝업 매니저** (`GameManager`, `SelectSceneManager`, `CharacterPopupManager`, `AlbumPopupManager`, `SimplePopupManager`)
  - 선택 씬 ↔ 메인 씬 간 데이터 전달, 앨범/캐릭터 팝업 토글, 공용 팝업 레이어 정리.
- **공통 유틸리티**
  - `StagePopupUtils`, `PopupLayerUI`, `MainSceneUtils` 등이 UI 계층 문제를 예방하고 디버깅 메시지 정리.
  - `MainSceneDebugAndValidationUtils`는 개발 중 유효성 검증과 자동화된 슬롯/데이터 검사를 돕습니다.

## 트러블슈팅
- **드롭 인식 범위가 좁아 아이템이 자꾸 튕겨나가는 문제**
  - `MainSceneManager`에서 슬롯 타입별 `snapDistance`를 재조정 (`상의 1.5x`, `양말 2x`, `액세서리 2.2x`).
- **액세서리 슬롯에서 드래그가 먹히지 않는 문제**
  - `EnsureAccessorySlots()`로 런타임에 강제로 `ClothingSlot` 컴포넌트를 붙이고 타입을 `acc1/acc2`로 고정.
- **의상 아이템 생성 타이밍 경합으로 NullReference가 발생**
  - `ClothingSpriteManager.Instance`가 준비되지 않은 경우 1초 후 `InitializeClothingSpriteManager`를 다시 호출하도록 백오프 처리.
- **스테이지 팝업이 다른 UI 아래로 가려지는 문제**
  - `ForceSetStagePopupToTop()`에서 캔버스 정렬·소팅 오더를 강제하여 항상 최상단에 위치.
- **드래그 직후 돌연 착용품이 사라지는 문제**
  - `RemoveSameTypeClothingFromOtherSlots()`로 동일 타입 중복을 안전하게 제거하고, 부모가 비활성화되면 `ForceShowSocksAndAccessoryParents()`로 즉시 복구.
- **초기 로딩 중 무분별한 드래그 시 오브젝트가 씬 밖으로 날아가는 현상**
  - 씬 시작 후 `dragEnableDelay` (기본 2초) 동안 드래그 입력을 잠시 막아 UI 세팅이 끝나기를 기다리도록 변경.

## 사용 메모
- 씬에 매니저를 붙일 때는 동일한 SerializeField를 맞춰 둬야 하며, `Resources` 경로 구조가 다르면 스프라이트 로딩이 실패합니다.
- DOTween을 프로젝트에 임포트한 뒤 `DOTween Utility Panel → Setup`을 한 번 실행해야 트윈 호출이 정삭 동작합니다.
- 테스트 시 `MainSceneDebugAndValidationUtils.ValidateSceneSetup()`을 호출하면 슬롯/데이터 누락 여부를 빠르게 확인할 수 있습니다.

필요한 스크립트를 이 폴더에서 복사한 뒤, `Assets/Scripts` 구조에 그대로 붙여 넣으면 메인 프로젝트와 동일한 동작을 재현할 수 있습니다.
