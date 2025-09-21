"""
🎓 세로 학생증 제작 프로그램 실행기
"""

import sys
import os

# src 폴더를 Python 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def main():
    print("🎓 === 세로 학생증 제작 프로그램 ===\n")
    
    try:
        from simple_vertical_gui import create_simple_gui
        print("🚀 GUI 시작 중...")
        create_simple_gui()
    except ImportError as e:
        print(f"❌ 모듈 import 오류: {e}")
        print("\n필요한 라이브러리를 설치해주세요:")
        print("pip install Pillow pyserial pywin32")
        print("\n설치 후 다시 실행해주세요.")
        input("Press Enter to exit...")
    except Exception as e:
        print(f"❌ 실행 오류: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
