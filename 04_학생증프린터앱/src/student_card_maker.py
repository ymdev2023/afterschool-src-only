"""
Pointman N20 학생증 제작 프로그램
PNG 파일에 사진과 텍스트를 합성하여 학생증을 만들고 프린터로 출력
"""

import serial
import time
from PIL import Image, ImageDraw, ImageFont
import os

class StudentCardMaker:
    def __init__(self, com_port='COM3', baud_rate=9600):
        """
        학생증 제작기 초기화
        
        Args:
            com_port: 프린터가 연결된 COM 포트 (예: 'COM3')
            baud_rate: 통신 속도 (기본값: 9600)
        """
        self.com_port = com_port
        self.baud_rate = baud_rate
        self.serial_conn = None
        
    def find_available_ports(self):
        """사용 가능한 COM 포트 찾기"""
        import serial.tools.list_ports
        ports = serial.tools.list_ports.comports()
        available_ports = []
        for port in ports:
            available_ports.append(port.device)
        return available_ports
        
    def connect_printer(self):
        """프린터와 시리얼 통신 연결"""
        try:
            self.serial_conn = serial.Serial(
                port=self.com_port,
                baudrate=self.baud_rate,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=1
            )
            print(f"프린터 연결 성공: {self.com_port}")
            return True
        except Exception as e:
            print(f"프린터 연결 실패: {e}")
            print("사용 가능한 포트:", self.find_available_ports())
            return False
    
    def create_student_card(self, template_path, student_data, output_path):
        """
        학생증 이미지 생성
        
        Args:
            template_path: PNG 템플릿 파일 경로
            student_data: 학생 정보 딕셔너리 {'name': '홍길동', 'student_id': '20231234', 'photo_path': 'photo.jpg'}
            output_path: 완성된 학생증 이미지 저장 경로
        """
        try:
            # 템플릿 이미지 로드
            template = Image.open(template_path)
            print(f"템플릿 크기: {template.size}")
            
            # 학생 사진 로드 및 크기 조정
            if os.path.exists(student_data['photo_path']):
                photo = Image.open(student_data['photo_path'])
                # 사진 크기를 학생증에 맞게 조정 (예: 120x150 픽셀)
                photo = photo.resize((120, 150), Image.Resampling.LANCZOS)
                
                # 사진을 템플릿에 붙이기 (좌표는 템플릿에 맞게 조정 필요)
                photo_x, photo_y = 50, 80  # 사진 위치 좌표 (수정 가능)
                template.paste(photo, (photo_x, photo_y))
                print(f"사진 추가: {photo.size} at ({photo_x}, {photo_y})")
            else:
                print(f"사진 파일을 찾을 수 없습니다: {student_data['photo_path']}")
            
            # 텍스트 추가를 위한 Draw 객체 생성
            draw = ImageDraw.Draw(template)
            
            # 폰트 설정 (시스템 폰트 사용)
            try:
                font_name = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 24)  # 맑은 고딕
                font_id = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 18)
            except:
                print("맑은 고딕 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                font_name = ImageFont.load_default()
                font_id = ImageFont.load_default()
            
            # 이름 추가
            name_x, name_y = 200, 100  # 이름 위치 좌표 (수정 가능)
            draw.text((name_x, name_y), student_data['name'], 
                     font=font_name, fill=(0, 0, 0))
            print(f"이름 추가: '{student_data['name']}' at ({name_x}, {name_y})")
            
            # 학번 추가
            id_x, id_y = 200, 140  # 학번 위치 좌표 (수정 가능)
            draw.text((id_x, id_y), student_data['student_id'], 
                     font=font_id, fill=(0, 0, 0))
            print(f"학번 추가: '{student_data['student_id']}' at ({id_x}, {id_y})")
            
            # 학과 정보 (있는 경우)
            if 'department' in student_data and student_data['department']:
                dept_x, dept_y = 200, 180  # 학과 위치 좌표 (수정 가능)
                draw.text((dept_x, dept_y), student_data['department'], 
                         font=font_id, fill=(0, 0, 0))
                print(f"학과 추가: '{student_data['department']}' at ({dept_x}, {dept_y})")
            
            # 완성된 이미지 저장
            # 출력 폴더가 없으면 생성
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            template.save(output_path)
            print(f"✓ 학생증 이미지 생성 완료: {output_path}")
            return True
            
        except Exception as e:
            print(f"✗ 학생증 생성 실패: {e}")
            return False
    
    def send_to_printer(self, image_path):
        """
        완성된 학생증을 프린터로 전송
        """
        if not self.serial_conn:
            print("프린터가 연결되지 않았습니다.")
            return False
        
        try:
            print("프린터로 이미지 전송 중...")
            
            # 프린터 초기화
            init_cmd = b'\x1B\x40'  # ESC @
            self.serial_conn.write(init_cmd)
            time.sleep(0.5)
            
            # 상태 확인
            status_cmd = b'\x1B\x76'  # 상태 확인 명령
            self.serial_conn.write(status_cmd)
            response = self.serial_conn.read(10)
            print(f"프린터 응답: {response}")
            
            print("프린터로 전송 완료")
            return True
            
        except Exception as e:
            print(f"프린터 전송 실패: {e}")
            return False
    
    def disconnect_printer(self):
        """프린터 연결 해제"""
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            print("프린터 연결 해제")

# 간단한 테스트용 함수들
def create_sample_template():
    """샘플 템플릿 이미지 생성"""
    # 학생증 크기 (일반적으로 85.6mm x 53.98mm = 약 324x204 픽셀 at 96 DPI)
    width, height = 400, 250
    
    # 흰색 배경 이미지 생성
    template = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(template)
    
    # 테두리 그리기
    draw.rectangle([5, 5, width-5, height-5], outline='black', width=2)
    
    # 제목 추가
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 20)
    except:
        title_font = ImageFont.load_default()
    
    draw.text((width//2-50, 20), "학생증", font=title_font, fill='black')
    
    # 사진 영역 표시
    photo_area = [50, 80, 170, 230]
    draw.rectangle(photo_area, outline='gray', width=1)
    draw.text((80, 150), "사진", font=title_font, fill='gray')
    
    template.save('card_template.png')
    print("샘플 템플릿 생성: card_template.png")

def create_sample_data():
    """샘플 학생 데이터 생성"""
    return {
        'name': '홍길동',
        'student_id': '20231234',
        'photo_path': 'sample_photo.jpg',  # 실제 사진 파일로 교체
        'department': '컴퓨터공학과'
    }

# 사용 예시
if __name__ == "__main__":
    print("=== Pointman N20 학생증 제작 프로그램 ===")
    
    # 샘플 템플릿 생성 (처음 실행시)
    if not os.path.exists('card_template.png'):
        create_sample_template()
    
    # 학생증 제작기 초기화
    card_maker = StudentCardMaker(com_port='COM3')  # 실제 COM 포트로 변경
    
    # 사용 가능한 포트 확인
    available_ports = card_maker.find_available_ports()
    print(f"사용 가능한 COM 포트: {available_ports}")
    
    # 샘플 학생 정보
    student_info = create_sample_data()
    
    # 학생증 이미지 생성 (프린터 연결 없이도 가능)
    success = card_maker.create_student_card(
        template_path='card_template.png',
        student_data=student_info,
        output_path='output/sample_card.png'
    )
    
    if success:
        print("\n이미지 생성이 완료되었습니다!")
        print("프린터를 연결하고 싶다면 connect_printer() 함수를 사용하세요.")
        
        # 프린터 연결 시도 (선택사항)
        if available_ports:
            print(f"\n프린터 연결을 시도합니다... (포트: {available_ports[0]})")
            card_maker.com_port = available_ports[0]
            if card_maker.connect_printer():
                # 프린터로 출력 (실제 프로토콜 구현 필요)
                # card_maker.send_to_printer('output/sample_card.png')
                pass
        
    # 연결 해제
    card_maker.disconnect_printer()
