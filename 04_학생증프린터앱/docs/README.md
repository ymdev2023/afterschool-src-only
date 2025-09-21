# Pointman N20 학생증 제작 프로그램

## 설치 방법

### 1. Python 설치
- Python 3.8 이상 필요
- Microsoft Store에서 설치 또는 https://python.org에서 다운로드

### 2. 라이브러리 설치
```bash
pip install pyserial Pillow
```

또는 requirements.txt 사용:
```bash
pip install -r requirements.txt
```

## 사용 방법

### 1. 기본 사용법
```python
from student_card_maker import StudentCardMaker

# 학생증 제작기 초기화
card_maker = StudentCardMaker(com_port='COM3')

# 학생 정보
student_info = {
    'name': '홍길동',
    'student_id': '20231234', 
    'photo_path': 'photos/hong.jpg',
    'department': '컴퓨터공학과'
}

# 학생증 생성
card_maker.create_student_card(
    template_path='template.png',
    student_data=student_info,
    output_path='output/hong_card.png'
)
```

### 2. 템플릿 PNG 파일 준비
- 학생증 크기: 400x250 픽셀 권장
- 사진 영역: (50, 80) 위치에 120x150 크기
- 이름 영역: (200, 100) 위치
- 학번 영역: (200, 140) 위치
- 학과 영역: (200, 180) 위치

### 3. 폴더 구조
```
프로젝트 폴더/
├── student_card_maker.py
├── card_template.png (템플릿)
├── photos/ (학생 사진들)
│   ├── hong.jpg
│   └── kim.jpg
└── output/ (완성된 학생증들)
    ├── hong_card.png
    └── kim_card.png
```

## 좌표 수정 방법

코드에서 다음 변수들을 수정하여 위치 조정:

```python
# 사진 위치
photo_x, photo_y = 50, 80

# 이름 위치  
name_x, name_y = 200, 100

# 학번 위치
id_x, id_y = 200, 140

# 학과 위치
dept_x, dept_y = 200, 180
```

## COM 포트 확인 방법

1. 장치 관리자 열기
2. "포트(COM 및 LPT)" 확인
3. Pointman N20이 연결된 포트 번호 확인

## 문제 해결

### 프린터 연결 실패
- USB 케이블 연결 확인
- 드라이버 설치 확인
- COM 포트 번호 확인

### 이미지 생성 실패
- 템플릿 파일 경로 확인
- 사진 파일 경로 확인
- 출력 폴더 권한 확인
