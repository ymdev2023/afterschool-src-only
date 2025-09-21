"""
📸 사진 선택 세로형 학생증 생성기 실행기
"""

import sys
import os

# src 폴더를 Python 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def main():
    print("📸 === 사진 선택 세로형 학생증 생성기 ===\n")
    
    try:
        from photo_card_maker import create_photo_card_gui
        print("🚀 GUI 시작 중...")
        create_photo_card_gui()
    except ImportError as e:
        print(f"❌ 모듈 import 오류: {e}")
        print("\n필요한 라이브러리를 설치해주세요:")
        print("pip install Pillow")
        print("\n설치 후 다시 실행해주세요.")
        input("Press Enter to exit...")
    except Exception as e:
        print(f"❌ 실행 오류: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
