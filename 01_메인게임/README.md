# AFTERSCHOOL - 2D 탑다운 RPG 게임 🎮

## 📋 프로젝트 개요

**AFTERSCHOOL**은 방과후 학교를 배경으로 한 2D 탑다운 RPG 웹 게임입니다. JavaScript와 Kaboom.js 게임 엔진을 사용하여 개발되었으며, Electron을 통해 데스크톱 앱으로도 배포 가능합니다.

### 🎮 게임 특징
- **장르**: 2D 탑다운 RPG
- **배경**: 방과후 학교 환경
- **플랫폼**: 웹 브라우저, Electron 데스크톱 앱
- **개발 언어**: JavaScript (ES6+)
- **게임 엔진**: Kaboom.js

## 🛠 기술 스택

-   **Engine**: Kaboom.js
-   **Language**: JavaScript (ES6+)
-   **Desktop**: Electron
-   **Graphics**: Custom pixel art sprites
-   **Audio**: Web Audio API
-   **Build**: Electron Builder

## 🎮 주요 기능

-   **씬 시스템**: 인트로, 메인메뉴, 튜토리얼, 크레딧, 게임월드
-   **다국어 지원**: 한국어/영어 전환
-   **대화 시스템**: NPC와의 상호작용
-   **퀘스트 시스템**: 체계적인 퀘스트 관리 및 진행
-   **UI 시스템**: 통합된 UI 관리 및 컴포넌트
-   **사운드**: BGM 및 효과음
-   **컨트롤**: 키보드 + 게임패드 지원

## 🏗️ 프로젝트 구조

```
afterschoolrpgweb/
├── src/                          # 소스 코드 메인 디렉토리
│   ├── main.js                   # 메인 엔트리 포인트
│   ├── kaboomContext.js          # Kaboom.js 컨텍스트 설정
│   ├── utils.js                  # 공통 유틸리티 함수들
│   ├── scenes/                   # 게임 씬(장면) 모듈들
│   │   ├── title.js              # 타이틀 화면
│   │   ├── intro.js              # 인트로 씬
│   │   ├── tutorial.js           # 튜토리얼 씬
│   │   ├── front.js              # 학교 앞마당
│   │   ├── first.js              # 1층 복도
│   │   ├── second.js             # 2층 복도
│   │   ├── class1.js             # 1학년 교실
│   │   ├── class2.js             # 2학년 교실
│   │   ├── restroom.js           # 화장실
│   │   ├── restaurant.js         # 식당
│   │   ├── garage.js             # 차고
│   │   ├── health.js             # 보건실
│   │   └── credits.js            # 크레딧
│   ├── systems/                  # 게임 시스템 모듈들
│   │   ├── autoSaveManager.js    # 자동 저장 시스템
│   │   ├── gameDataManager.js    # 게임 데이터 관리
│   │   ├── inventoryManager.js   # 인벤토리 시스템
│   │   ├── gamepadManager.js     # 게임패드 지원
│   │   └── cameraManager.js      # 카메라 제어
│   ├── entities/                 # 게임 엔티티 (캐릭터, 오브젝트)
│   ├── uiComponents/             # UI 컴포넌트들
│   ├── content/                  # 게임 콘텐츠 (대화, 스토리)
│   ├── state/                    # 게임 상태 관리
│   └── scene-assets/             # 씬별 에셋 정의
├── assets/                       # 게임 리소스
│   ├── images/                   # 이미지 파일들
│   ├── sounds/                   # 사운드 파일들
│   └── fonts/                    # 폰트 파일들
├── index.html                    # 메인 HTML 파일
├── electron-main.js              # Electron 메인 프로세스
└── package.json                  # 프로젝트 설정 및 의존성
```

## 🚀 주요 구현 내용

### 1. 게임 엔진 및 기술 스택
- **Kaboom.js**: 2D 게임 개발을 위한 JavaScript 게임 엔진
- **Electron**: 크로스 플랫폼 데스크톱 앱 지원
- **ES6 모듈**: 모던 JavaScript 모듈 시스템 활용
- **Canvas API**: 커스텀 렌더링 및 이펙트

### 2. 게임 시스템 아키텍처

#### 씬(Scene) 기반 구조
```javascript
// main.js - 씬 등록 예시
k.scene("title", title);
k.scene("front", front);
k.scene("tutorial", tutorial);
```

#### 상태 관리 시스템
- **gameState**: 전역 게임 상태 관리
- **autoSaveManager**: 자동 저장 기능
- **gameDataManager**: 게임 데이터 영속성

#### 오디오 시스템
```javascript
// 배경음악 및 효과음 관리
k.loadSound("title-bgm", "assets/sounds/title-bgm.mp3");
k.loadSound("confirm-beep-sfx", "assets/sounds/confirmbeep-sfx.wav");
```

### 3. 핵심 기능 구현

#### 캐릭터 이동 및 충돌 시스템
- 8방향 이동 지원
- 타일 기반 충돌 검사
- 부드러운 애니메이션

#### 대화 시스템
- 순차적 텍스트 출력
- 캐릭터별 음성 효과 (Animalese 스타일)
- 선택지 기반 상호작용

#### 인벤토리 시스템
- 아이템 수집 및 관리
- 퀘스트 아이템 추적
- 저장/로드 지원

#### 자동 저장 시스템
```javascript
// autoSaveManager.js
export class AutoSaveManager {
    static save() {
        const saveData = {
            currentScene: gameState.currentScene,
            playerPosition: gameState.playerPosition,
            inventory: gameState.inventory,
        };
        localStorage.setItem('afterschool-save', JSON.stringify(saveData));
    }
}
```

## 🛠️ 빌드 및 실행

### 개발 환경 실행
```bash
# 의존성 설치
npm install

# Electron으로 실행
npm run electron
```

### 프로덕션 빌드
```bash
# Windows 빌드
npm run build-win

# macOS 빌드
npm run build-mac

# 전체 플랫폼 빌드
npm run dist
```

## 🔧 기술적 도전과 해결

### 1. 메모리 최적화
**문제**: 큰 이미지 파일로 인한 메모리 사용량 증가
**해결**:
- 타이틀 화면에서 Canvas API로 직접 렌더링
- 불필요한 스프라이트 로딩 제거
- 이미지 압축 및 최적화

```javascript
// title.js - Canvas를 활용한 직접 렌더링
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// 큰 이미지들을 Canvas로 직접 처리하여 메모리 절약
```

### 2. 크로스 플랫폼 호환성
**문제**: 웹과 Electron 환경에서의 다른 동작
**해결**:
- 조건부 로딩 시스템 구현
- 플랫폼별 설정 분리
- 일관된 API 인터페이스 제공

### 3. 게임패드 지원
**문제**: 다양한 게임패드 기기 호환성
**해결**:
```javascript
// gamepadManager.js
export const gamepadManager = {
    init() {
        window.addEventListener("gamepadconnected", this.onGamepadConnected);
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected);
    },
    // 표준화된 버튼 매핑 구현
};
```

### 4. 사운드 시스템 최적화
**문제**: 사운드 파일 로딩 지연 및 메모리 사용
**해결**:
- 지연 로딩(Lazy Loading) 구현
- 사운드 풀링 시스템
- 압축된 오디오 형식 사용

## 🎯 트러블슈팅 사례

### 1. Kaboom.js 버전 호환성 문제
**증상**: 특정 API가 예상과 다르게 동작
**원인**: Kaboom.js 버전 업데이트로 인한 API 변경
**해결**:
- 안정된 버전으로 고정
- 레거시 API 래퍼 함수 구현

### 2. Electron 빌드 최적화
**증상**: 빌드 파일 크기가 과도하게 큼
**원인**: 불필요한 의존성 및 에셋 포함
**해결**:
```json
// package.json - build 설정 최적화
"build": {
  "files": [
    "**/*",
    "!**/*.{py,md}",
    "!node_modules/.cache/**/*"
  ]
}
```

### 3. 게임 상태 동기화 문제
**증상**: 씬 전환 시 상태 불일치
**원인**: 비동기 상태 업데이트 타이밍 이슈
**해결**:
- 중앙화된 상태 관리 시스템 구현
- 상태 변경 시 검증 로직 추가

### 4. 모바일 터치 지원
**증상**: 모바일에서 조작 불가
**원인**: 터치 이벤트 미지원
**해결**:
- 가상 D-pad 구현
- 터치 제스처 인식 시스템 추가

## 📈 성능 최적화

### 1. 에셋 로딩 최적화
- 필요한 에셋만 선택적 로딩
- 이미지 압축 및 최적화
- 사운드 파일 형식 최적화

### 2. 렌더링 최적화
- 오프스크린 캔버스 활용
- 불필요한 렌더링 호출 제거
- 프레임레이트 제한

### 3. 메모리 관리
- 가비지 컬렉션 최적화
- 이벤트 리스너 정리
- 텍스처 메모리 관리

## 🎨 디자인 패턴 및 아키텍처

### 1. 모듈 패턴
각 시스템을 독립적인 모듈로 분리하여 유지보수성 향상

### 2. 옵저버 패턴
게임 상태 변경 시 관련 시스템들에 자동 알림

### 3. 팩토리 패턴
엔티티 생성을 위한 재사용 가능한 팩토리 함수들

### 4. 싱글톤 패턴
게임 상태 및 매니저 클래스들의 전역 접근 보장

## 📝 향후 개선 계획

1. **멀티플레이어 지원**: WebSocket을 활용한 실시간 멀티플레이어
2. **모바일 최적화**: PWA 기능 및 터치 인터페이스 개선
3. **콘텐츠 확장**: 추가 씬 및 스토리라인 구현
4. **성능 모니터링**: 실시간 성능 지표 수집 시스템

---

> 이 프로젝트는 개인 포트폴리오 목적으로 공개되었으며, 게임의 핵심 소스코드와 구조를 포함하고 있습니다.
