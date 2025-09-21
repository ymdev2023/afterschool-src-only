"""
테스트용 3x4cm 학생증 사진 생성기
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_photo(name, bg_color, text_color, filename):
    """테스트용 학생증 사진 생성"""
    # 3cm x 4cm 크기 (300 DPI 기준)
    width_mm = 30   # 3cm
    height_mm = 40  # 4cm
    dpi = 300
    
    # 픽셀 계산
    width_px = int((width_mm / 25.4) * dpi)   # 354px
    height_px = int((height_mm / 25.4) * dpi) # 472px
    
    # 이미지 생성
    image = Image.new('RGB', (width_px, height_px), bg_color)
    draw = ImageDraw.Draw(image)
    
    # 폰트 설정 (시스템 폰트 사용)
    try:
        font_large = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 40)
        font_small = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 20)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # 얼굴 그리기 (간단한 원형)
    face_radius = 50
    face_center_x = width_px // 2
    face_center_y = height_px // 3
    
    # 얼굴 (살색)
    draw.ellipse([face_center_x - face_radius, face_center_y - face_radius,
                  face_center_x + face_radius, face_center_y + face_radius], 
                 fill='#FFDBAC', outline='#DEB887', width=2)
    
    # 눈 그리기
    eye_size = 8
    eye_y = face_center_y - 15
    # 왼쪽 눈
    draw.ellipse([face_center_x - 20 - eye_size//2, eye_y - eye_size//2,
                  face_center_x - 20 + eye_size//2, eye_y + eye_size//2], fill='black')
    # 오른쪽 눈
    draw.ellipse([face_center_x + 20 - eye_size//2, eye_y - eye_size//2,
                  face_center_x + 20 + eye_size//2, eye_y + eye_size//2], fill='black')
    
    # 코 그리기
    nose_y = face_center_y
    draw.ellipse([face_center_x - 3, nose_y - 2, face_center_x + 3, nose_y + 2], fill='#CD853F')
    
    # 입 그리기
    mouth_y = face_center_y + 20
    draw.arc([face_center_x - 15, mouth_y - 5, face_center_x + 15, mouth_y + 10], 
             start=0, end=180, fill='#8B4513', width=3)
    
    # 머리카락 그리기
    hair_y = face_center_y - face_radius - 10
    draw.ellipse([face_center_x - face_radius - 5, hair_y,
                  face_center_x + face_radius + 5, face_center_y + 10], 
                 fill='#654321', outline='#4A4A4A', width=2)
    
    # 이름 텍스트 추가
    text_y = height_px - 80
    
    # 텍스트 크기 측정
    bbox = draw.textbbox((0, 0), name, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_x = (width_px - text_width) // 2
    
    # 텍스트 배경 (반투명)
    draw.rectangle([text_x - 10, text_y - 5, text_x + text_width + 10, text_y + 40], 
                   fill=(255, 255, 255, 200))
    
    # 이름 텍스트
    draw.text((text_x, text_y), name, font=font_large, fill=text_color)
    
    # "TEST" 워터마크
    watermark_y = height_px - 30
    bbox = draw.textbbox((0, 0), "TEST", font=font_small)
    watermark_width = bbox[2] - bbox[0]
    watermark_x = (width_px - watermark_width) // 2
    draw.text((watermark_x, watermark_y), "TEST", font=font_small, fill='gray')
    
    return image

def main():
    """테스트 사진들 생성"""
    # photos 폴더 생성
    photos_dir = "photos"
    if not os.path.exists(photos_dir):
        os.makedirs(photos_dir)
    
    # 테스트 학생 데이터
    test_students = [
        {
            'name': '김학생',
            'bg_color': '#E6F3FF',  # 연한 파란색
            'text_color': '#000080',  # 진한 파란색
            'filename': 'test_student_01.jpg'
        },
        {
            'name': '이학생',
            'bg_color': '#F0FFF0',  # 연한 초록색
            'text_color': '#006400',  # 진한 초록색
            'filename': 'test_student_02.jpg'
        },
        {
            'name': '박학생',
            'bg_color': '#FFF0F5',  # 연한 분홍색
            'text_color': '#8B008B',  # 진한 보라색
            'filename': 'test_student_03.jpg'
        }
    ]
    
    print("🎨 테스트용 학생증 사진 생성 중...")
    
    for i, student in enumerate(test_students, 1):
        print(f"[{i}/3] {student['name']} 사진 생성 중...")
        
        # 사진 생성
        photo = create_test_photo(
            student['name'],
            student['bg_color'],
            student['text_color'],
            student['filename']
        )
        
        # 저장
        file_path = os.path.join(photos_dir, student['filename'])
        photo.save(file_path, 'JPEG', quality=95, dpi=(300, 300))
        
        print(f"✅ 저장 완료: {file_path}")
    
    print(f"\n🎉 테스트 사진 생성 완료!")
    print(f"📁 위치: {os.path.abspath(photos_dir)}")
    print(f"📏 크기: 3cm × 4cm (354×472px, 300 DPI)")
    print(f"📄 형식: JPEG, RGB")
    print(f"\n🚀 이제 run_photo_card.py를 실행하여 테스트해보세요!")

if __name__ == "__main__":
    main()
