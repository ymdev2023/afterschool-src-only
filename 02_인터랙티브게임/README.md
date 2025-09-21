# 🎮 02_인터랙티브게임

핸드 트래킹과 얼굴 인식을 활용한 방과후 수업용 인터랙티브 게임 핵심 코드 모음입니다. 메인 저장소에서 사용했던 말투와 형식을 그대로 유지하면서, 가장 많이 사용하는 두 가지 게임 코드를 정리했습니다.

## 🎯 포함된 게임

1. **학생 이동 게임** (`student_moving_game.py`)
   - 엄지+검지 하트 제스처로 게임 시작
   - 핀치 드래그로 픽셀 캐릭터 이동
   - 30초 안에 목표 구역으로 학생을 최대한 많이 옮기기

2. **음식 먹기 게임** (`food_eating_game.py`)
   - 입 벌리기 제스처로 음식 먹기
   - 점수/콤보 및 파티클 이펙트
   - 배경음악과 효과음, 하이스코어 저장 지원

## 🧠 구현 내용

- MediaPipe Hands & FaceMesh를 활용해 손 제스처와 입 벌리기 상태를 동시에 추적합니다.
- OpenCV로 카메라 프레임을 캡처하고, Pillow로 한글 폰트 렌더링 및 HUD를 합성합니다.
- Pygame을 이용해 배경음악/효과음을 재생하고, 파티클·캐릭터 스프라이트를 렌더링합니다.
- Windows 환경에서 `.venv`를 자동 감지하여 PowerShell로 스크립트를 재실행하도록 보조 로직을 넣었습니다.
- `student_moving_game.py`는 캐릭터 스폰 큐, 타이머, 하이스코어 저장을 담당하는 클래스 구조로 구성되어 있고, `food_eating_game.py`는 파티클과 먹기 판정, 콤보 시스템을 분리된 함수로 관리합니다.

## 🛠 사용 언어 & 라이브러리

- Python 3.x
- OpenCV (`cv2`)
- MediaPipe (`mediapipe`)
- Pygame (`pygame`)
- NumPy (`numpy`)
- Pillow (`PIL`)
- 표준 라이브러리: `json`, `os`, `math`, `time`, `random`, `subprocess` 등

## 🧰 필요 환경

- Python 3.9 이상 권장
- macOS / Windows / Raspberry Pi / Linux에서 동작 확인
- GPU 가속 없이도 640x480 해상도에서 원활히 동작하도록 최적화

필요 패키지는 메인 저장소의 `requirements.txt`를 그대로 사용할 수 있습니다.

```bash
pip install -r requirements.txt
```

## 📦 리소스 준비하기

이 폴더에는 핵심 코드만 포함되어 있습니다. 실제 플레이를 위해서는 아래 리소스를 메인 프로젝트와 동일한 경로로 복사해 주세요.

- `cha/` : 픽셀 학생 캐릭터 이미지 (PNG)
- `food/` : 간식 이미지 (snack1.png ~ snack11.png)
- `neodgm.ttf` : 한글 비트맵 폰트
- `student-bgm.mp3`, `food-bgm.mp3`, `coin-sfx.mp3`, `confirmbeep-sfx.wav` 등 사운드 파일
- 선택: `high_score.json` (없으면 자동 생성)

리소스는 https://github.com/ymdev2023/handtracking_game 에 있는 메인 게임 데이터와 동일하게 맞춰주면 됩니다.

## 🚀 실행 방법

```bash
# 학생 이동 게임
python student_moving_game.py

# 음식 먹기 게임
python food_eating_game.py
```

가상환경을 사용 중이라면 활성화한 뒤 실행하세요. 두 게임 모두 Windows에서 `.venv`가 감지되면 자동으로 활성화 스크립트를 안내합니다.

## 🧩 트러블슈팅 메모

- **가상환경 자동 실행 문제**: Windows PowerShell 보안 정책으로 실패할 수 있습니다. `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 후 다시 시도하면 해결됩니다.
- **카메라 미인식**: macOS는 시스템 설정에서 카메라 권한, Raspberry Pi는 `libcamera-hello --list-cameras`로 센서 감지를 확인합니다.
- **MediaPipe 초기화 오류**: `pip install mediapipe --upgrade`로 최신 버전을 설치하거나, ARM 환경에서는 `mediapipe-rpi4` 대신 휠 파일을 사용합니다.
- **Pygame 사운드 깨짐**: 라즈베리파이에서 `pygame.mixer.pre_init(44100, -16, 2, 512)`를 추가하면 더 안정적으로 재생됩니다.

## 🎮 조작법 요약

**학생 이동 게임**
- 하트 제스처: 게임 시작/재시작
- 핀치 제스처: 캐릭터 집기/놓기
- 드래그: 목표 구역(우측)으로 이동
- `S`: 스크린샷 저장
- `F11`: 전체화면 토글
- `ESC`: 게임 종료

**음식 먹기 게임**
- 입 벌리기: 음식 먹기
- `F11`: 전체화면 토글
- `ESC`: 게임 종료

## 📁 폴더 구조

```
02_인터랙티브게임/
├── README.md
├── food_eating_game.py
└── student_moving_game.py
```

## 📄 라이선스

MIT License (메인 프로젝트와 동일)

---

**즐거운 인터랙티브 수업 되세요! 🎉**
