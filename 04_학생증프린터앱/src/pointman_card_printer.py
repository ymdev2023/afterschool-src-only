"""
Pointman N20 학생증 제작 프로그램
54mm x 86mm (CR80) 카드 사이즈 맞춤형
"""

import serial
import time
from PIL import Image, ImageDraw, ImageFont
import os
import math

class PointmanCardPrinter:
    def __init__(self, com_port='COM3', baud_rate=9600):
        """
        카드 사이즈: 54mm x 86mm (2.12" x 3.38")
        300 DPI 기준: 638 x 1016 픽셀
        """
        self.com_port = com_port
        self.baud_rate = baud_rate
        self.serial_conn = None
        
        # CR80 카드 사이즈 (300 DPI 기준)
        self.CARD_WIDTH_MM = 86  # 가로 86mm
        self.CARD_HEIGHT_MM = 54  # 세로 54mm
        self.DPI = 300
        
        # 픽셀 계산 (1인치 = 25.4mm)
        self.CARD_WIDTH_PX = int((self.CARD_WIDTH_MM / 25.4) * self.DPI)   # 1016px
        self.CARD_HEIGHT_PX = int((self.CARD_HEIGHT_MM / 25.4) * self.DPI)  # 638px
        
        print(f"카드 크기: {self.CARD_WIDTH_MM}mm x {self.CARD_HEIGHT_MM}mm")
        print(f"픽셀 크기: {self.CARD_WIDTH_PX}px x {self.CARD_HEIGHT_PX}px")
    
    def mm_to_px(self, mm):
        """밀리미터를 픽셀로 변환"""
        return int((mm / 25.4) * self.DPI)
    
    def find_available_ports(self):
        """사용 가능한 COM 포트 찾기"""
        try:
            import serial.tools.list_ports
            ports = serial.tools.list_ports.comports()
            return [port.device for port in ports]
        except ImportError:
            print("pyserial이 설치되지 않았습니다. pip install pyserial")
            return []
    
    def connect_printer(self):
        """프린터 연결"""
        try:
            self.serial_conn = serial.Serial(
                port=self.com_port,
                baudrate=self.baud_rate,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=2
            )
            print(f"✓ 프린터 연결 성공: {self.com_port}")
            return True
        except Exception as e:
            print(f"✗ 프린터 연결 실패: {e}")
            available = self.find_available_ports()
            if available:
                print(f"사용 가능한 포트: {available}")
            return False
    
    def create_card_template(self, background_color='white', border=True):
        """기본 카드 템플릿 생성"""
        template = Image.new('RGB', (self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), background_color)
        
        if border:
            draw = ImageDraw.Draw(template)
            border_width = self.mm_to_px(0.5)  # 0.5mm 테두리
            draw.rectangle([border_width, border_width, 
                          self.CARD_WIDTH_PX - border_width, 
                          self.CARD_HEIGHT_PX - border_width], 
                          outline='black', width=2)
        
        return template
    
    def create_vertical_template(self, background_color='white', border=True):
        """세로 방향 카드 템플릿 생성"""
        # 세로 방향: 높이가 폭보다 큼
        template = Image.new('RGB', (self.CARD_HEIGHT_PX, self.CARD_WIDTH_PX), background_color)
        
        if border:
            draw = ImageDraw.Draw(template)
            border_width = self.mm_to_px(0.5)  # 0.5mm 테두리
            draw.rectangle([border_width, border_width, 
                          self.CARD_HEIGHT_PX - border_width, 
                          self.CARD_WIDTH_PX - border_width], 
                          outline='black', width=2)
        
        return template
    
    def create_student_card(self, template_path, student_data, output_path, photo_position=None, orientation='portrait'):
        """
        포토샵 템플릿 기반 학생증 생성
        
        Args:
            template_path: 포토샵으로 제작된 배경 프레임 PNG 파일
            student_data: {'name': '홍길동', 'photo_path': 'photo.jpg'}
            output_path: 완성된 학생증 저장 경로
            photo_position: 사진 위치 (x, y, width, height) 튜플
            orientation: 'portrait' (세로) 또는 'landscape' (가로)
        """
        try:
            # 방향에 따른 카드 크기 설정
            if orientation == 'portrait':
                card_width = self.CARD_HEIGHT_PX  # 세로일 때는 높이가 폭
                card_height = self.CARD_WIDTH_PX  # 세로일 때는 폭이 높이
            else:  # landscape
                card_width = self.CARD_WIDTH_PX
                card_height = self.CARD_HEIGHT_PX
            
            # 템플릿 로드 또는 기본 템플릿 생성
            if os.path.exists(template_path):
                template = Image.open(template_path)
                # 카드 사이즈로 리사이즈
                template = template.resize((card_width, card_height), 
                                         Image.Resampling.LANCZOS)
            else:
                print("템플릿이 없어서 기본 템플릿을 생성합니다.")
                template = self.create_vertical_template() if orientation == 'portrait' else self.create_card_template()
            
            # 학생 사진 처리
            if 'photo_path' in student_data and os.path.exists(student_data['photo_path']):
                photo = Image.open(student_data['photo_path'])
                
                # 방향에 따른 사진 크기 및 위치 설정
                if orientation == 'portrait':
                    # 세로 방향: 사진을 상단 중앙에 배치
                    photo_width = self.mm_to_px(25)   # 25mm
                    photo_height = self.mm_to_px(30)  # 30mm
                    photo_x = (card_width - photo_width) // 2  # 중앙 정렬
                    photo_y = self.mm_to_px(8)   # 상단에서 8mm
                else:
                    # 가로 방향: 기존 위치
                    photo_width = self.mm_to_px(25)   # 25mm = ~295px
                    photo_height = self.mm_to_px(30)  # 30mm = ~354px
                    photo_x = self.mm_to_px(10)  # 10mm from left
                    photo_y = self.mm_to_px(12)  # 12mm from top
                
                photo = photo.resize((photo_width, photo_height), Image.Resampling.LANCZOS)
                
                # 사진이 RGB가 아니면 변환
                if photo.mode != 'RGB':
                    photo = photo.convert('RGB')
                
                template.paste(photo, (photo_x, photo_y))
                print(f"✓ 사진 추가: {photo_width}x{photo_height}px at ({photo_x}, {photo_y})")
            else:
                print(f"⚠ 사진 파일을 찾을 수 없습니다: {student_data.get('photo_path', 'None')}")
            
            # 텍스트 추가
            draw = ImageDraw.Draw(template)
            
            # 폰트 설정
            try:
                # Windows 한글 폰트들
                font_paths = [
                    "C:/Windows/Fonts/malgun.ttf",    # 맑은 고딕
                    "C:/Windows/Fonts/gulim.ttc",     # 굴림
                    "C:/Windows/Fonts/batang.ttc",    # 바탕
                ]
                
                font_large = None
                font_medium = None
                font_small = None
                
                for font_path in font_paths:
                    if os.path.exists(font_path):
                        font_large = ImageFont.truetype(font_path, 36)   # 큰 글씨 (이름)
                        font_medium = ImageFont.truetype(font_path, 28)  # 중간 글씨 (학번)
                        font_small = ImageFont.truetype(font_path, 24)   # 작은 글씨 (기타)
                        print(f"✓ 폰트 로드: {font_path}")
                        break
                
                if not font_large:
                    print("⚠ 시스템 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                    font_large = ImageFont.load_default()
                    font_medium = ImageFont.load_default()
                    font_small = ImageFont.load_default()
                    
            except Exception as e:
                print(f"폰트 로드 실패: {e}")
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_small = ImageFont.load_default()
            
            # 방향에 따른 텍스트 위치 계산
            if orientation == 'portrait':
                # 세로 방향: 사진 아래에 텍스트 배치
                text_start_y = photo_y + photo_height + self.mm_to_px(5)  # 사진 아래 5mm
                
                # 이름 (중앙 정렬)
                name_text = student_data['name']
                bbox = draw.textbbox((0, 0), name_text, font=font_large)
                name_width = bbox[2] - bbox[0]
                name_x = (card_width - name_width) // 2
                name_y = text_start_y
                draw.text((name_x, name_y), name_text, font=font_large, fill=(0, 0, 0))
                print(f"✓ 이름 추가: '{name_text}' at ({name_x}, {name_y})")
                
                # 학번 (중앙 정렬)
                id_text = student_data['student_id']
                bbox = draw.textbbox((0, 0), id_text, font=font_medium)
                id_width = bbox[2] - bbox[0]
                id_x = (card_width - id_width) // 2
                id_y = name_y + self.mm_to_px(8)
                draw.text((id_x, id_y), id_text, font=font_medium, fill=(0, 0, 0))
                print(f"✓ 학번 추가: '{id_text}' at ({id_x}, {id_y})")
                
                # 학과 (중앙 정렬)
                if 'department' in student_data:
                    dept_text = student_data['department']
                    bbox = draw.textbbox((0, 0), dept_text, font=font_small)
                    dept_width = bbox[2] - bbox[0]
                    dept_x = (card_width - dept_width) // 2
                    dept_y = id_y + self.mm_to_px(6)
                    draw.text((dept_x, dept_y), dept_text, font=font_small, fill=(0, 0, 0))
                    print(f"✓ 학과 추가: '{dept_text}' at ({dept_x}, {dept_y})")
                
                # 학년 (중앙 정렬)
                if 'grade' in student_data:
                    grade_text = student_data['grade']
                    bbox = draw.textbbox((0, 0), grade_text, font=font_small)
                    grade_width = bbox[2] - bbox[0]
                    grade_x = (card_width - grade_width) // 2
                    grade_y = dept_y + self.mm_to_px(5) if 'department' in student_data else id_y + self.mm_to_px(6)
                    draw.text((grade_x, grade_y), grade_text, font=font_small, fill=(0, 0, 0))
                    print(f"✓ 학년 추가: '{grade_text}' at ({grade_x}, {grade_y})")
                    
            else:
                # 가로 방향: 기존 레이아웃
                text_start_x = self.mm_to_px(40)  # 사진 오른쪽 40mm 지점부터
                
                # 이름 (가장 크게, 위쪽)
                name_x, name_y = text_start_x, self.mm_to_px(15)
                draw.text((name_x, name_y), student_data['name'], 
                         font=font_large, fill=(0, 0, 0))
                print(f"✓ 이름 추가: '{student_data['name']}' at ({name_x}, {name_y})")
                
                # 학번
                id_x, id_y = text_start_x, self.mm_to_px(25)
                draw.text((id_x, id_y), student_data['student_id'], 
                         font=font_medium, fill=(0, 0, 0))
                print(f"✓ 학번 추가: '{student_data['student_id']}' at ({id_x}, {id_y})")
                
                # 학과
                if 'department' in student_data:
                    dept_x, dept_y = text_start_x, self.mm_to_px(33)
                    draw.text((dept_x, dept_y), student_data['department'], 
                             font=font_small, fill=(0, 0, 0))
                    print(f"✓ 학과 추가: '{student_data['department']}' at ({dept_x}, {dept_y})")
                
                # 학년 (있는 경우)
                if 'grade' in student_data:
                    grade_x, grade_y = text_start_x, self.mm_to_px(40)
                    draw.text((grade_x, grade_y), student_data['grade'], 
                             font=font_small, fill=(0, 0, 0))
                    print(f"✓ 학년 추가: '{student_data['grade']}' at ({grade_x}, {grade_y})")
            
            # 학교명 (하단 중앙)
            if 'school_name' in student_data:
                school_name = student_data['school_name']
                # 텍스트 크기 측정
                bbox = draw.textbbox((0, 0), school_name, font=font_medium)
                text_width = bbox[2] - bbox[0]
                school_x = (card_width - text_width) // 2  # 중앙 정렬
                school_y = card_height - self.mm_to_px(8)  # 하단에서 8mm 위
                
                draw.text((school_x, school_y), school_name, 
                         font=font_medium, fill=(0, 0, 100))  # 진한 파란색
                print(f"✓ 학교명 추가: '{school_name}' at ({school_x}, {school_y})")
            
            # 출력 폴더 생성
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # 이미지 저장
            template.save(output_path, 'PNG', dpi=(self.DPI, self.DPI))
            print(f"✅ 학생증 생성 완료: {output_path}")
            print(f"   실제 크기: {self.CARD_WIDTH_MM}mm x {self.CARD_HEIGHT_MM}mm")
            
            return True
            
        except Exception as e:
            print(f"❌ 학생증 생성 실패: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def print_card(self, image_path):
        """카드 프린터로 출력"""
        if not self.serial_conn:
            print("프린터가 연결되지 않았습니다.")
            return False
        
        try:
            print("🖨️ 프린터로 전송 중...")
            
            # 프린터 초기화
            self.serial_conn.write(b'\x1B\x40')  # ESC @
            time.sleep(0.5)
            
            # 프린터 상태 확인
            self.serial_conn.write(b'\x1B\x76')  # 상태 확인
            response = self.serial_conn.read(10)
            print(f"프린터 응답: {response.hex() if response else 'No response'}")
            
            # 실제 이미지 전송 로직은 프린터 매뉴얼에 따라 구현 필요
            # 여기서는 기본적인 명령어만 예시
            
            print("✅ 프린터 전송 완료")
            return True
            
        except Exception as e:
            print(f"❌ 프린터 전송 실패: {e}")
            return False
    
    def batch_create_cards(self, template_path, students_data, output_folder):
        """여러 학생증 일괄 생성"""
        success_count = 0
        
        for i, student in enumerate(students_data, 1):
            print(f"\n[{i}/{len(students_data)}] {student['name']} 학생증 생성 중...")
            
            output_path = os.path.join(output_folder, f"{student['student_id']}_학생증.png")
            
            if self.create_student_card(template_path, student, output_path):
                success_count += 1
            
        print(f"\n📊 완료: {success_count}/{len(students_data)} 개 성공")
        return success_count
    
    def disconnect(self):
        """프린터 연결 해제"""
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            print("🔌 프린터 연결 해제")

# 사용 예시 및 테스트
if __name__ == "__main__":
    print("=== Pointman N20 카드 프린터 (54mm x 86mm) ===\n")
    
    # 프린터 초기화
    printer = PointmanCardPrinter(com_port='COM3')
    
    # 사용 가능한 포트 확인
    available_ports = printer.find_available_ports()
    print(f"사용 가능한 COM 포트: {available_ports}")
    
    # 샘플 학생 데이터
    sample_students = [
        {
            'name': '홍길동',
            'student_id': '20231234',
            'photo_path': 'photos/hong.jpg',  # 실제 사진 경로로 변경
            'department': '컴퓨터공학과',
            'grade': '3학년',
            'school_name': 'ABC 대학교'
        },
        {
            'name': '김영희',
            'student_id': '20231235',
            'photo_path': 'photos/kim.jpg',   # 실제 사진 경로로 변경
            'department': '전자공학과',
            'grade': '2학년',
            'school_name': 'ABC 대학교'
        }
    ]
    
    # 출력 폴더 생성
    output_folder = 'student_cards'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # 단일 학생증 생성 예시
    print("\n🎯 단일 학생증 생성 테스트")
    success = printer.create_student_card(
        template_path='card_template.png',  # 템플릿이 없으면 자동 생성
        student_data=sample_students[0],
        output_path=os.path.join(output_folder, 'sample_card.png')
    )
    
    if success:
        print("✅ 테스트 성공! student_cards/sample_card.png 파일을 확인하세요.")
        
        # 프린터 연결 시도 (선택사항)
        if available_ports:
            print(f"\n🖨️ 프린터 연결 시도: {available_ports[0]}")
            printer.com_port = available_ports[0]
            if printer.connect_printer():
                # 실제 출력 (프로토콜 구현 필요)
                # printer.print_card(os.path.join(output_folder, 'sample_card.png'))
                pass
    
    # 일괄 생성 예시 (주석 해제해서 사용)
    # print("\n📚 일괄 생성 테스트")
    # printer.batch_create_cards('card_template.png', sample_students, output_folder)
    
    # 연결 해제
    printer.disconnect()
    
    print("\n✨ 프로그램 종료")
    print("💡 사용법:")
    print("   1. photos/ 폴더에 학생 사진들을 넣으세요")
    print("   2. student_data에 실제 학생 정보를 입력하세요")
    print("   3. 프로그램을 실행하면 student_cards/ 폴더에 학생증이 생성됩니다")
