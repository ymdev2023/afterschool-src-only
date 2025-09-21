from PIL import Image, ImageDraw, ImageFont
import os

# photos 폴더에 테스트 사진 3개 생성
photos_dir = "c:/Users/NCA 27/Desktop/printer_test/photos"

# 3cm x 4cm 크기 (300 DPI)
width = int((30 / 25.4) * 300)   # 354px
height = int((40 / 25.4) * 300)  # 472px

colors = [
    ('#E6F3FF', '#000080', '김학생'),  # 파란색 배경
    ('#F0FFF0', '#006400', '이학생'),  # 초록색 배경  
    ('#FFF0F5', '#8B008B', '박학생')   # 분홍색 배경
]

for i, (bg_color, text_color, name) in enumerate(colors, 1):
    # 이미지 생성
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # 얼굴 그리기
    face_x, face_y = width//2, height//3
    face_r = 45
    draw.ellipse([face_x-face_r, face_y-face_r, face_x+face_r, face_y+face_r], 
                 fill='#FFDBAC', outline='#DEB887', width=2)
    
    # 눈
    draw.ellipse([face_x-18, face_y-12, face_x-10, face_y-4], fill='black')
    draw.ellipse([face_x+10, face_y-12, face_x+18, face_y-4], fill='black')
    
    # 코
    draw.ellipse([face_x-2, face_y-2, face_x+2, face_y+2], fill='#CD853F')
    
    # 입
    draw.arc([face_x-12, face_y+8, face_x+12, face_y+20], 0, 180, fill='#8B4513', width=2)
    
    # 머리
    draw.ellipse([face_x-50, face_y-60, face_x+50, face_y+5], fill='#654321')
    
    # 이름 (기본 폰트 사용)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 32)
    except:
        font = ImageFont.load_default()
    
    # 텍스트 배경
    bbox = draw.textbbox((0, 0), name, font=font)
    text_w = bbox[2] - bbox[0]
    text_x = (width - text_w) // 2
    text_y = height - 70
    
    draw.rectangle([text_x-5, text_y-5, text_x+text_w+5, text_y+35], fill='white', outline=text_color)
    draw.text((text_x, text_y), name, font=font, fill=text_color)
    
    # 저장
    filename = f"test_student_{i:02d}.jpg"
    filepath = os.path.join(photos_dir, filename)
    img.save(filepath, 'JPEG', quality=95, dpi=(300, 300))
    print(f"✅ 생성: {filename} ({width}x{height}px)")

print("🎉 테스트 사진 3개 생성 완료!")
