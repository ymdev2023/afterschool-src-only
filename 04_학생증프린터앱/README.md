# 04_학생증프린터앱

Pointman N20 카드 프린터로 학생증을 제작‧인쇄하는 데스크톱 앱입니다. 포토샵으로 만든 템플릿을 불러와 학생 사진과 정보를 자동으로 합성하고, 미리보기와 즉시 인쇄를 지원합니다.

📹 데모 영상: https://youtube.com/shorts/9Gi6G6DxSWQ

## 구현 개요
- `run_template_card.py`를 통해 템플릿 기반 GUI(`src/template_gui.py`)를 실행합니다.
- GUI는 Tkinter로 작성되었으며 템플릿/사진 탐색, 학생 정보 입력, 결과 미리보기를 한 화면에서 제공합니다.
- 카드 생성 로직은 `src/template_card_maker.py`에서 Pillow를 이용해 템플릿 위에 사진과 텍스트를 배치합니다.
- `template_config.json`으로 사진·텍스트 위치와 스타일을 조정할 수 있고, `neodgm.ttf` 등 사용자 지정 폰트를 로드합니다.
- Pointman N20 프린터 제어는 `src/pointman_card_printer.py`가 담당하며 pywin32로 윈도우 인쇄 스풀러에 작업을 등록합니다.
- `docs/` 폴더에는 설치, 템플릿 제작, RIBBON 오류 대응 등 운영 가이드가 정리돼 있습니다.

## 실행 방법
1. Python 3.8 이상 설치 (Windows 권장)
2. 필수 라이브러리 설치
   ```bash
   pip install -r docs/requirements.txt
   # 또는 Pillow pywin32
   ```
3. 템플릿 PNG를 `templates/`에, 학생 사진을 `photos/`에 배치합니다.
4. `python run_template_card.py` 실행 후 GUI에서 템플릿·사진·학생 정보를 선택해 카드 생성/인쇄를 진행합니다.

### 주요 보조 스크립트
- `quick_test_photos.py` / `create_test_photos.py`: 더미 사진을 만들어 UI를 빠르게 확인할 때 사용합니다.
- `run_student_card.py`, `run_photo_card.py`: 구(舊) 버전 GUI 실행 진입점으로, 필요 시 호환 테스트용으로 유지됩니다.

## 폴더 구조
```
04_학생증프린터앱/
├── run_template_card.py         # 메인 실행 스크립트
├── template_config.json         # 템플릿 배치 설정
├── src/
│   ├── template_gui.py          # 템플릿 기반 Tkinter GUI
│   ├── template_card_maker.py   # Pillow 기반 합성 로직
│   ├── pointman_card_printer.py # Pointman N20 제어 모듈
│   └── student_card_maker.py 등 과거 버전 로직
├── templates/                   # 포토샵 제작 템플릿 PNG
├── photos/                      # 학생 사진 원본
├── output/                      # GUI에서 생성한 카드 결과물
├── student_cards/               # 과거 학생증 샘플 아카이브
└── docs/                        # 설치 및 문제 해결 가이드
```

## 트러블슈팅
- **RIBBON ERROR**: `docs/RIBBON_ERROR_해결가이드.md`의 순서대로 전원 재부팅 → 리본 재장착 → 흑백 모드 인쇄를 점검합니다.
- **인쇄가 시작되지 않을 때**: Windows 인쇄 스풀러 서비스 재시작 후 `pointman_card_printer.py`의 `PRINTER_NAME`이 실제 장치 이름과 일치하는지 확인합니다.
- **폰트/한글 깨짐**: `neodgm.ttf`가 존재하는지 확인하고, 다른 폰트를 쓰려면 `template_card_maker.py`의 `FONT_PATH`를 수정합니다.
- **사진 미리보기 미표시**: JPG/PNG 외 확장자는 미지원이며, 경로에 한글·공백이 포함된 경우 절대경로로 불러오는 것이 안전합니다.
- **위치가 어긋난 카드**: `template_config.json`의 `photo_area`와 텍스트 영역 좌표를 수정한 뒤 다시 실행하면 GUI가 즉시 반영합니다.
- **프린터 연결 실패(COM 포트)**: 장치 관리자에서 포트 번호를 확인하고 `docs/README.md` 안내에 따라 설정합니다.

## 참고 자료
- `docs/README.md`: 설치, 템플릿 규칙, COM 포트 설정 등 기본 운영 문서
- `docs/포토샵_템플릿_사용법.md`: 포토샵에서 템플릿을 제작할 때의 레이어 구성 팁
- `docs/requirements.txt`: 배포 시 필요한 패키지 목록

필요 시 `output/`과 `student_cards/`의 샘플 이미지를 참고해 완성본 품질을 비교할 수 있습니다.
