"""
간단한 테스트 스크립트
54mm x 86mm 카드 생성 테스트
"""

from pointman_card_printer import PointmanCardPrinter
import os

def create_test_photo():
    """테스트용 가짜 사진 생성"""
    from PIL import Image, ImageDraw
    
    # 테스트용 사진 (150x180 픽셀)
    photo = Image.new('RGB', (150, 180), 'lightblue')
    draw = ImageDraw.Draw(photo)
    
    # 간단한 얼굴 그리기
    draw.ellipse([30, 30, 120, 120], fill='peachpuff', outline='black', width=2)  # 얼굴
    draw.ellipse([50, 60, 70, 80], fill='black')  # 왼쪽 눈
    draw.ellipse([80, 60, 100, 80], fill='black')  # 오른쪽 눈
    draw.arc([60, 85, 90, 105], 0, 180, fill='red', width=3)  # 입
    
    # photos 폴더 생성
    if not os.path.exists('photos'):
        os.makedirs('photos')
    
    photo.save('photos/test_student.jpg')
    print("✓ 테스트용 사진 생성: photos/test_student.jpg")

def main():
    print("=== 카드 생성 테스트 ===\n")
    
    # 테스트용 사진 생성
    create_test_photo()
    
    # 프린터 객체 생성
    printer = PointmanCardPrinter()
    
    # 테스트 학생 데이터
    test_student = {
        'name': '테스트 학생',
        'student_id': '20240001',
        'photo_path': 'photos/test_student.jpg',
        'department': '컴퓨터공학과',
        'grade': '1학년',
        'school_name': 'ABC 대학교'
    }
    
    # 출력 폴더 생성
    if not os.path.exists('output'):
        os.makedirs('output')
    
    # 학생증 생성
    print("📋 학생증 생성 중...")
    success = printer.create_student_card(
        template_path='template.png',  # 없으면 자동 생성
        student_data=test_student,
        output_path='output/test_card.png'
    )
    
    if success:
        print("\n✅ 성공!")
        print("📁 생성된 파일: output/test_card.png")
        print("📐 카드 크기: 54mm x 86mm (638px x 1016px)")
        print("\n💡 실제 사용 시:")
        print("   1. photos/ 폴더에 실제 학생 사진들을 넣으세요")
        print("   2. test_student 데이터를 실제 학생 정보로 변경하세요")
        print("   3. COM 포트를 연결하여 프린터로 출력하세요")
    else:
        print("\n❌ 실패!")

if __name__ == "__main__":
    main()
