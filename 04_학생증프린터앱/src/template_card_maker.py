"""
포토샵 템플릿 기반 학생증 제작기
- 포토샵으로 만든 배경 프레임 사용
- 사진 합성 + 이름만 추가
"""

from PIL import Image, ImageDraw, ImageFont
import os
import json

class TemplateCardMaker:
    def __init__(self):
        """템플릿 기반 카드 제작기 초기화"""
        self.template_config = self.load_template_config()
        
    def load_template_config(self):
        """템플릿 설정 로드"""
        # 기본 설정 (config.json이 없으면 사용)
        default_config = {
            "photo_area": {
                "x": 50,
                "y": 80,
                "width": 120,
                "height": 150
            },
            "name_area": {
                "x": 200,
                "y": 100,
                "font_size": 24,
                "color": [0, 0, 0],
                "align": "left"
            }
        }
        
        config_path = "template_config.json"
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                print("⚠️ 설정 파일 로드 실패, 기본 설정 사용")
                
        return default_config
    
    def create_template_config(self, template_path):
        """템플릿 설정 파일 생성 도우미"""
        if not os.path.exists(template_path):
            print(f"❌ 템플릿 파일이 없습니다: {template_path}")
            return
            
        # 템플릿 이미지 크기 확인
        template = Image.open(template_path)
        width, height = template.size
        
        # 설정 파일 생성
        config = {
            "template_info": {
                "width": width,
                "height": height,
                "description": "포토샵으로 제작된 학생증 템플릿"
            },
            "photo_area": {
                "x": 50,
                "y": 80,
                "width": 120,
                "height": 150,
                "description": "사진이 들어갈 영역 (픽셀 단위)"
            },
            "name_area": {
                "x": 200,
                "y": 100,
                "font_size": 24,
                "color": [0, 0, 0],
                "align": "center",
                "description": "이름이 들어갈 위치 및 스타일"
            }
        }
        
        with open("template_config.json", 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
            
        print(f"✅ 설정 파일 생성: template_config.json")
        print(f"템플릿 크기: {width} x {height}")
        print("📝 설정을 수정한 후 사용하세요!")
        
    def create_card_with_template(self, template_path, photo_path, student_data, output_path):
        """
        포토샵 템플릿을 사용하여 학생증 생성
        
        Args:
            template_path: 포토샵 배경 프레임 PNG 파일
            photo_path: 학생 사진 파일
            student_data: {
                'name': '홍길동',
                'school_name': '은하여자고등학교',
                'grade': '3',
                'class': '2'
            }
            output_path: 완성된 학생증 저장 경로
        """
        try:
            print(f"🎨 템플릿 기반 학생증 생성 시작...")
            print(f"   템플릿: {template_path}")
            print(f"   사진: {photo_path}")
            print(f"   학생 정보: {student_data}")
            
            # 1. 포토샵 템플릿 로드 (없으면 흰색 배경 생성)
            if not os.path.exists(template_path):
                print(f"⚠️ 템플릿 파일이 없습니다: {template_path}")
                print("📄 흰색 배경으로 학생증을 생성합니다")
                
                # 기본 카드 크기로 흰색 배경 생성 (실제 카드 크기)
                card_width = 1016  # 86mm x 300DPI
                card_height = 637  # 54mm x 300DPI
                template = Image.new('RGB', (card_width, card_height), (255, 255, 255))
                print(f"✅ 흰색 배경 생성: {template.size}")
            else:
                template = Image.open(template_path)
                if template.mode != 'RGBA':
                    template = template.convert('RGBA')
                print(f"✅ 템플릿 로드: {template.size}")
            
            # 2. 학생 사진 로드 및 크기 조정
            if not os.path.exists(photo_path):
                print(f"❌ 사진 파일이 없습니다: {photo_path}")
                return False
                
            photo = Image.open(photo_path)
            
            # 사진 영역 설정
            photo_config = self.template_config["photo_area"]
            photo_x = photo_config["x"]
            photo_y = photo_config["y"] 
            photo_width = photo_config["width"]
            photo_height = photo_config["height"]
            
            # 사진 크기 조정
            photo = photo.resize((photo_width, photo_height), Image.Resampling.LANCZOS)
            if photo.mode != 'RGBA':
                photo = photo.convert('RGBA')
            print(f"✅ 사진 처리: {photo.size} → ({photo_x}, {photo_y})")
            
            # 3. 사진을 템플릿에 합성
            # 알파 채널을 고려한 합성
            template.paste(photo, (photo_x, photo_y), photo)
            
            # 4. 텍스트 정보 추가 (학교명, 학년/반, 이름)
            draw = ImageDraw.Draw(template)
            
            # 폰트 로드 함수
            def load_font(font_size):
                try:
                    font_paths = [
                        "C:/Windows/Fonts/malgun.ttf",    # 맑은 고딕
                        "C:/Windows/Fonts/gulim.ttc",     # 굴림
                        "C:/Windows/Fonts/batang.ttc",    # 바탕
                    ]
                    
                    for font_path in font_paths:
                        if os.path.exists(font_path):
                            return ImageFont.truetype(font_path, font_size)
                            
                    return ImageFont.load_default()
                except Exception as e:
                    print(f"⚠️ 폰트 로드 실패: {e}")
                    return ImageFont.load_default()
            
            # 텍스트 그리기 함수
            def draw_text(text, config_key, default_text=""):
                if config_key not in self.template_config:
                    return
                    
                config = self.template_config[config_key]
                font_size = config["font_size"]
                font = load_font(font_size)
                
                x = config["x"]
                y = config["y"]
                color = tuple(config["color"])
                align = config.get("align", "left")
                
                # 중앙 정렬인 경우 위치 조정
                if align == "center":
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    x = x - (text_width // 2)
                
                draw.text((x, y), text, font=font, fill=color)
                print(f"✅ {config_key} 추가: '{text}' at ({x}, {y})")
            
            # 학교명 추가
            school_name = student_data.get('school_name', '은하여자고등학교')
            draw_text(school_name, "school_name_area")
            
            # 학년/반 추가
            grade = student_data.get('grade', '')
            class_num = student_data.get('class', '')
            if grade and class_num:
                grade_class_text = f"{grade}학년 {class_num}반"
            else:
                grade_class_text = "3학년 2반"  # 기본값
            draw_text(grade_class_text, "grade_class_area")
            
            # 이름 추가
            name = student_data.get('name', '')
            draw_text(name, "name_area")
            
            # 5. 최종 이미지 저장
            # 출력 폴더 생성
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # RGBA를 RGB로 변환 (PNG 호환성)
            if template.mode == 'RGBA':
                # 흰색 배경과 합성
                background = Image.new('RGB', template.size, (255, 255, 255))
                background.paste(template, mask=template.split()[-1])  # 알파 채널을 마스크로 사용
                template = background
            
            template.save(output_path, 'PNG')
            print(f"✅ 학생증 생성 완료: {output_path}")
            
            return True
            
        except Exception as e:
            print(f"❌ 학생증 생성 실패: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def batch_create_cards(self, template_path, students_data, output_folder):
        """여러 학생증 일괄 생성"""
        success_count = 0
        
        for i, student in enumerate(students_data, 1):
            print(f"\n[{i}/{len(students_data)}] {student['name']} 학생증 생성 중...")
            
            safe_name = "".join(c for c in student['name'] if c.isalnum() or c in (' ', '-', '_')).strip()
            output_path = os.path.join(output_folder, f"{safe_name}_학생증.png")
            
            success = self.create_card_with_template(
                template_path=template_path,
                photo_path=student['photo_path'],
                student_data=student,
                output_path=output_path
            )
            
            if success:
                success_count += 1
            
        print(f"\n📊 완료: {success_count}/{len(students_data)} 개 성공")
        return success_count

# 사용 예시 및 테스트
if __name__ == "__main__":
    print("🎨 === 포토샵 템플릿 기반 학생증 제작기 ===\n")
    
    maker = TemplateCardMaker()
    
    # 설정 파일이 없으면 생성
    template_path = "templates/student_card_template.png"
    if not os.path.exists("template_config.json"):
        print("📝 설정 파일이 없습니다. 기본 설정 파일을 생성합니다.")
        if os.path.exists(template_path):
            maker.create_template_config(template_path)
        else:
            print(f"⚠️ 템플릿 파일을 {template_path}에 준비해주세요")
    
    # 테스트 데이터
    test_students = [
        {
            'name': '김포토샵',
            'school_name': '은하여자고등학교',
            'grade': '3',
            'class': '2',
            'photo_path': 'photos/student_01.jpg'
        },
        {
            'name': '이템플릿',
            'school_name': '은하여자고등학교', 
            'grade': '2',
            'class': '1',
            'photo_path': 'photos/student_02.jpg'
        }
    ]
    
    # 출력 폴더 생성
    if not os.path.exists('output'):
        os.makedirs('output')
    
    # 템플릿이 있으면 테스트 실행
    if os.path.exists(template_path):
        print("\n🎯 테스트 실행")
        test_student_data = {
            'name': '김포토샵',
            'school_name': '은하여자고등학교',
            'grade': '3',
            'class': '2'
        }
        
        success = maker.create_card_with_template(
            template_path=template_path,
            photo_path='photos/student_01.jpg',
            student_data=test_student_data,
            output_path='output/김포토샵_템플릿학생증.png'
        )
        
        if success:
            print("\n✅ 테스트 성공! output 폴더를 확인하세요.")
        else:
            print("\n❌ 테스트 실패")
    else:
        print(f"\n💡 사용법:")
        print(f"1. 포토샵으로 학생증 배경을 제작하여 {template_path}에 저장")
        print(f"2. template_config.json에서 사진/이름 위치 설정")
        print(f"3. 프로그램 재실행")
