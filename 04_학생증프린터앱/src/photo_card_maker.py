"""
📸 사진 선택 세로형 학생증 생성기
배경 프레임 + 사진만 선택하여 학생증 생성
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import os
import datetime

class PhotoCardMaker:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("📸 사진 선택 세로형 학생증 생성기")
        self.root.geometry("500x700")
        self.root.configure(bg='#f0f0f0')
        
        # 변수들
        self.selected_photo_path = tk.StringVar()
        self.student_name = tk.StringVar(value="고혜성")  # 기본 이름
        self.birth_date = tk.StringVar(value="2025.08.21")    # 기본 생년월일
        self.preview_image = None
        
        # 카드 크기 설정 (300 DPI 기준)
        self.CARD_WIDTH_MM = 54   # 세로형이므로 폭이 54mm
        self.CARD_HEIGHT_MM = 86  # 세로형이므로 높이가 86mm
        self.DPI = 300
        
        # 픽셀 계산
        self.CARD_WIDTH_PX = int((self.CARD_WIDTH_MM / 25.4) * self.DPI)   # 638px
        self.CARD_HEIGHT_PX = int((self.CARD_HEIGHT_MM / 25.4) * self.DPI) # 1016px
        
        # === 통일된 레이아웃 상수 (학생증 생성과 인쇄에서 동일하게 사용) ===
        # 배경 프레임 설정
        self.FRAME_SCALE = 1.01      # 프레임 크기 101%
        
        # 사진 설정
        self.PHOTO_WIDTH_PX = 324    # 고정 사진 폭 (픽셀)
        self.PHOTO_HEIGHT_PX = 380   # 고정 사진 높이 (픽셀)
        self.PHOTO_TOP_MM = 24       # 사진 상단 여백 (mm)
        
        # 텍스트 설정
        self.NAME_FONT_SIZE = 48     # 이름 폰트 크기
        self.BIRTH_FONT_SIZE = 46    # 생년월일 폰트 크기
        self.NAME_BOTTOM_MM = 28   # 이름 하단 여백 (mm)
        self.BIRTH_BOTTOM_MM = 22.5  # 생년월일 하단 여백 (mm)
        
        # 색상 설정 (CMYK C20 M76 Y0 K50을 RGB로 변환)
        c, m, y, k = 0.20, 0.76, 0.00, 0.50
        r = int(255 * (1 - c) * (1 - k))
        g = int(255 * (1 - m) * (1 - k))
        b = int(255 * (1 - y) * (1 - k))
        self.TEXT_COLOR = (r, g, b)
        
        # 픽셀 변환된 값들
        self.photo_top_px = int((self.PHOTO_TOP_MM / 25.4) * self.DPI)
        self.photo_left_px = (self.CARD_WIDTH_PX - self.PHOTO_WIDTH_PX) // 2
        self.name_bottom_px = int((self.NAME_BOTTOM_MM / 25.4) * self.DPI)
        self.birth_bottom_px = int((self.BIRTH_BOTTOM_MM / 25.4) * self.DPI)
        
        # 사진 위치 및 크기 (mm 단위) - 이전 호환성
        self.PHOTO_TOP_MM_OLD = 21.7  # 위에서 정확히 3cm (30mm)
        self.PHOTO_WIDTH_MM = 30  # 3cm 폭
        self.PHOTO_HEIGHT_MM = 40 # 4cm 높이
        
        # 픽셀로 변환 - 이전 호환성
        self.photo_top_px_old = int((self.PHOTO_TOP_MM_OLD / 25.4) * self.DPI)
        self.photo_width_px = int((self.PHOTO_WIDTH_MM / 25.4) * self.DPI)
        self.photo_height_px = int((self.PHOTO_HEIGHT_MM / 25.4) * self.DPI)
        self.photo_left_px_old = (self.CARD_WIDTH_PX - self.photo_width_px) // 2  # 중앙 정렬
        
        print(f"카드 크기: {self.CARD_WIDTH_MM}mm x {self.CARD_HEIGHT_MM}mm")
        print(f"카드 픽셀: {self.CARD_WIDTH_PX}px x {self.CARD_HEIGHT_PX}px")
        print(f"사진 위치: 위에서 {self.PHOTO_TOP_MM}mm ({self.photo_top_px}px)")
        print(f"사진 크기: {self.PHOTO_WIDTH_MM}x{self.PHOTO_HEIGHT_MM}mm ({self.photo_width_px}x{self.photo_height_px}px)")
        print(f"사진 좌표: x={self.photo_left_px}px, y={self.photo_top_px}px")
        
        self.setup_ui()
    
    def setup_ui(self):
        """UI 설정"""
        # 스크롤 가능한 캔버스 프레임 생성
        canvas = tk.Canvas(self.root, bg='#f0f0f0')
        scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # 스크롤바와 캔버스 배치
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # 메인 프레임 (스크롤 가능한 영역)
        main_frame = ttk.Frame(scrollable_frame, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 마우스 휠 스크롤 바인딩
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        # 제목
        title_label = ttk.Label(main_frame, text="📸 사진 선택 세로형 학생증 생성기", 
                               font=('Arial', 18, 'bold'))
        title_label.pack(pady=(0, 20))
        
        # 설명
        desc_label = ttk.Label(main_frame, 
                              text="배경 프레임에 사진을 합성하여 학생증을 만듭니다.\n위에서 3cm 위치에 3×4cm 크기로 사진이 배치됩니다.",
                              font=('Arial', 10), foreground='gray')
        desc_label.pack(pady=(0, 20))
        
        # 사진 선택 섹션
        photo_frame = ttk.LabelFrame(main_frame, text="📷 사진 선택", padding="15")
        photo_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 사진 선택 버튼
        select_btn = ttk.Button(photo_frame, text="🖼️ 사진 파일 선택", 
                               command=self.select_photo, style='Accent.TButton')
        select_btn.pack(pady=5)
        
        # 선택된 사진 표시
        self.photo_label = ttk.Label(photo_frame, text="사진이 선택되지 않았습니다", 
                                    font=('Arial', 10))
        self.photo_label.pack(pady=5)
        
        # 사진 미리보기
        self.preview_frame = ttk.LabelFrame(main_frame, text="🔍 사진 미리보기", padding="10")
        self.preview_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.preview_label = ttk.Label(self.preview_frame, text="사진을 선택하면 미리보기가 표시됩니다",
                                      font=('Arial', 10), foreground='gray')
        self.preview_label.pack(pady=20)
        
        # 이름 입력 섹션
        name_frame = ttk.LabelFrame(main_frame, text="✏️ 학생 이름", padding="15")
        name_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 이름 입력 라벨
        name_label = ttk.Label(name_frame, text="학생 이름:", font=('Arial', 10))
        name_label.pack(anchor='w', pady=(0, 5))
        
        # 이름 입력 필드
        name_entry = ttk.Entry(name_frame, textvariable=self.student_name, 
                              font=('Arial', 12), width=30)
        name_entry.pack(fill=tk.X, pady=(0, 5))
        
        # 이름 입력 안내
        name_hint = ttk.Label(name_frame, 
                             text="학생증에 표시될 이름을 입력하세요 (카드 하단에 표시됩니다)",
                             font=('Arial', 9), foreground='gray')
        name_hint.pack(anchor='w')
        
        # 생년월일 입력 섹션
        birth_frame = ttk.LabelFrame(main_frame, text="📅 생년월일", padding="15")
        birth_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 생년월일 입력 라벨
        birth_label = ttk.Label(birth_frame, text="생년월일:", font=('Arial', 10))
        birth_label.pack(anchor='w', pady=(0, 5))
        
        # 생년월일 입력 필드
        birth_entry = ttk.Entry(birth_frame, textvariable=self.birth_date, 
                               font=('Arial', 12), width=30)
        birth_entry.pack(fill=tk.X, pady=(0, 5))
        
        # 생년월일 입력 안내
        birth_hint = ttk.Label(birth_frame, 
                              text="생년월일을 YYYY.MM.DD 형식으로 입력하세요 (예: 1992.05.10)",
                              font=('Arial', 9), foreground='gray')
        birth_hint.pack(anchor='w')
        
        # 생성 버튼 섹션
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=20)
        
        # 학생증 생성 버튼
        create_btn = ttk.Button(button_frame, text="🎓 학생증 생성", 
                               command=self.create_student_card, 
                               style='Accent.TButton')
        create_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # 미리보기 버튼
        preview_btn = ttk.Button(button_frame, text="👁️ 결과 미리보기", 
                                command=self.preview_result)
        preview_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # 인쇄 버튼
        print_btn = ttk.Button(button_frame, text="🖨️ 바로 인쇄", 
                              command=self.print_card)
        print_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # 간단 인쇄 버튼 (대안)
        simple_print_btn = ttk.Button(button_frame, text="📄 간단 인쇄", 
                                     command=self.simple_print_card)
        simple_print_btn.pack(side=tk.LEFT)
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="사진을 선택해주세요", 
                                     font=('Arial', 10))
        self.status_label.pack(pady=10)
    
    def select_photo(self):
        """사진 파일 선택"""
        file_path = filedialog.askopenfilename(
            title="학생증에 넣을 사진 선택",
            filetypes=[
                ("이미지 파일", "*.jpg *.jpeg *.png *.bmp *.tiff"),
                ("JPEG 파일", "*.jpg *.jpeg"),
                ("PNG 파일", "*.png"),
                ("모든 파일", "*.*")
            ]
        )
        
        if file_path:
            self.selected_photo_path.set(file_path)
            filename = os.path.basename(file_path)
            self.photo_label.config(text=f"선택된 사진: {filename}")
            self.status_label.config(text="사진이 선택되었습니다. 학생증을 생성할 수 있습니다.")
            
            # 사진 미리보기 업데이트
            self.update_photo_preview(file_path)
    
    def update_photo_preview(self, photo_path):
        """사진 미리보기 업데이트"""
        try:
            # 원본 이미지 로드
            image = Image.open(photo_path)
            
            # 미리보기용 크기로 조정 (최대 200x250)
            preview_width = 200
            preview_height = 250
            
            # 비율 유지하면서 크기 조정
            image.thumbnail((preview_width, preview_height), Image.Resampling.LANCZOS)
            
            # Tkinter용 이미지로 변환
            photo = ImageTk.PhotoImage(image)
            
            # 미리보기 업데이트
            self.preview_label.config(image=photo, text="")
            self.preview_label.image = photo  # 참조 유지
            
        except Exception as e:
            self.preview_label.config(image="", text=f"미리보기 오류: {str(e)}")
            print(f"미리보기 오류: {e}")
    
    def create_student_card(self):
        """학생증 생성"""
        photo_path = self.selected_photo_path.get()
        
        if not photo_path:
            messagebox.showerror("오류", "사진을 먼저 선택해주세요.")
            return
        
        # 이름 확인
        student_name = self.student_name.get().strip()
        if not student_name:
            messagebox.showwarning("경고", "학생 이름을 입력해주세요!")
            return
        
        # 생년월일 확인
        birth_date = self.birth_date.get().strip()
        if not birth_date:
            messagebox.showwarning("경고", "생년월일을 입력해주세요!")
            return
        
        # 생년월일 형식 검증 (YYYY.MM.DD)
        import re
        if not re.match(r'^\d{4}\.\d{2}\.\d{2}$', birth_date):
            messagebox.showwarning("경고", "생년월일을 YYYY.MM.DD 형식으로 입력해주세요!\n예: 1992.05.10")
            return
        
        if not os.path.exists(photo_path):
            messagebox.showerror("오류", "선택된 사진 파일을 찾을 수 없습니다.")
            return
        
        try:
            self.status_label.config(text="학생증 생성 중...")
            self.root.update()
            
            # 배경 프레임 로드 (첨부된 이미지를 배경으로 사용)
            background_path = "background_frame.jpg"
            
            if os.path.exists(background_path):
                # 배경 이미지 로드
                background = Image.open(background_path)
                # 카드 크기의 101%로 리사이즈
                scaled_width = int(self.CARD_WIDTH_PX * self.FRAME_SCALE)
                scaled_height = int(self.CARD_HEIGHT_PX * self.FRAME_SCALE)
                background = background.resize((scaled_width, scaled_height), 
                                             Image.Resampling.LANCZOS)
                
                # 중앙에서 원래 카드 크기만큼 크롭
                left = (scaled_width - self.CARD_WIDTH_PX) // 2
                top = (scaled_height - self.CARD_HEIGHT_PX) // 2
                right = left + self.CARD_WIDTH_PX
                bottom = top + self.CARD_HEIGHT_PX
                background = background.crop((left, top, right, bottom))
                print(f"✓ 배경 프레임 로드 (101% 크기): {background_path}")
            else:
                # 기본 흰색 배경 생성
                background = Image.new('RGB', (self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), 'white')
                print("⚠️ 배경 프레임이 없어서 흰색 배경을 사용합니다.")
                print("   background_frame.jpg 파일을 프로젝트 폴더에 저장해주세요.")
            
            # RGB 모드로 변환 (필요한 경우)
            if background.mode != 'RGB':
                background = background.convert('RGB')
            
            # 학생 사진 로드 및 처리
            student_photo = Image.open(photo_path)
            print(f"✓ 학생 사진 로드: {photo_path}")
            
            # PNG 투명도 처리 - transparent 상태 유지
            original_mode = student_photo.mode
            if student_photo.mode in ('RGBA', 'LA'):
                # 투명도가 있는 경우 그대로 유지
                print(f"✓ 투명도 유지: {student_photo.mode} 모드")
            elif student_photo.mode != 'RGB':
                student_photo = student_photo.convert('RGB')
                print("✓ RGB 모드로 변환 완료")
            
            # 사진을 고정 크기로 리사이즈 (통일된 상수 사용)
            student_photo = student_photo.resize((self.PHOTO_WIDTH_PX, self.PHOTO_HEIGHT_PX), Image.Resampling.LANCZOS)
            print(f"✓ 사진 크기 고정: {self.PHOTO_WIDTH_PX}x{self.PHOTO_HEIGHT_PX}px")
            
            # 사진을 카드 중앙에 배치 (통일된 상수 사용)
            photo_left = self.photo_left_px
            photo_top = self.photo_top_px
            
            # 배경에 사진 합성 (투명도 처리)
            if original_mode in ('RGBA', 'LA') and student_photo.mode == 'RGBA':
                # 투명도가 있는 경우 알파 채널 사용
                background.paste(student_photo, (photo_left, photo_top), student_photo)
                print(f"✓ 투명도 적용하여 사진 합성 완료: 위치 ({photo_left}, {photo_top})")
            else:
                # 일반 RGB 이미지인 경우
                background.paste(student_photo, (photo_left, photo_top))
                print(f"✓ 사진 합성 완료: 위치 ({photo_left}, {photo_top})")
            
            # 학생 이름 텍스트 추가
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(background)
            
            # 통일된 텍스트 색상 사용
            text_color = self.TEXT_COLOR
            
            # 폰트 로드 (통일된 상수 사용)
            try:
                font = ImageFont.truetype("neodgm.ttf", self.NAME_FONT_SIZE)
                print(f"✓ neodgm.ttf 폰트 로드 완료 (크기: {self.NAME_FONT_SIZE})")
            except:
                # 기본 폰트 사용
                try:
                    font = ImageFont.load_default()
                    print("⚠️ neodgm.ttf 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                except:
                    font = None
                    print("❌ 폰트 로드 실패")
            
            # 텍스트 위치 계산 (통일된 상수 사용)
            text_y = self.CARD_HEIGHT_PX - self.name_bottom_px
            
            # 텍스트 크기 측정하여 가운데 정렬
            if font:
                bbox = draw.textbbox((0, 0), student_name, font=font)
                text_width = bbox[2] - bbox[0]
                text_x = (self.CARD_WIDTH_PX - text_width) // 2  # 가운데 정렬
                
                # 텍스트 그리기
                draw.text((text_x, text_y), student_name, fill=text_color, font=font)
                print(f"✓ 이름 텍스트 추가: '{student_name}' (위치: {text_x}, {text_y})")
            else:
                print("❌ 폰트 없음으로 텍스트 추가 실패")
            
            # 생년월일 텍스트 추가 (통일된 상수 사용)
            try:
                font_birth = ImageFont.truetype("neodgm.ttf", self.BIRTH_FONT_SIZE)
                print(f"✓ 생년월일용 neodgm.ttf 폰트 로드 완료 (크기: {self.BIRTH_FONT_SIZE})")
            except:
                # 기본 폰트 사용
                try:
                    font_birth = ImageFont.load_default()
                    print("⚠️ neodgm.ttf 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                except:
                    font_birth = None
                    print("❌ 생년월일 폰트 로드 실패")
            
            # 생년월일 텍스트 위치 계산 (통일된 상수 사용)
            birth_text_y = self.CARD_HEIGHT_PX - self.birth_bottom_px
            
            # 생년월일 텍스트 크기 측정하여 가운데 정렬
            if font_birth:
                birth_bbox = draw.textbbox((0, 0), birth_date, font=font_birth)
                birth_text_width = birth_bbox[2] - birth_bbox[0]
                birth_text_x = (self.CARD_WIDTH_PX - birth_text_width) // 2  # 가운데 정렬
                
                # 생년월일 텍스트 그리기 (통일된 텍스트 색상 사용)
                draw.text((birth_text_x, birth_text_y), birth_date, fill=text_color, font=font_birth)
                print(f"✓ 생년월일 텍스트 추가: '{birth_date}' (위치: {birth_text_x}, {birth_text_y})")
            else:
                print("❌ 폰트 없음으로 생년월일 텍스트 추가 실패")
            
            # 출력 폴더 생성
            output_dir = "output"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
                print(f"✓ 출력 폴더 생성: {output_dir}")
            
            # 파일명 생성 (학생 이름 포함)
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"{student_name}_{birth_date.replace('.', '')}_학생증_{timestamp}.jpg"
            output_path = os.path.join(output_dir, output_filename)
            
            # JPG로 저장 (RGB, 300 DPI)
            background.save(output_path, 'JPEG', quality=95, dpi=(self.DPI, self.DPI))
            print(f"✅ 학생증 저장 완료: {output_path}")
            
            self.status_label.config(text="✅ 학생증 생성 완료!")
            
            # 성공 메시지
            messagebox.showinfo("생성 완료", 
                              f"학생증이 성공적으로 생성되었습니다!\n\n"
                              f"학생 이름: {student_name}\n"
                              f"생년월일: {birth_date}\n"
                              f"파일: {output_path}\n"
                              f"크기: {self.CARD_WIDTH_MM}mm × {self.CARD_HEIGHT_MM}mm\n"
                              f"해상도: 300 DPI\n"
                              f"형식: RGB JPEG\n"
                              f"사진: 324×380 픽셀 고정 크기\n"
                              f"텍스트 색상: CMYK C20 M76 Y0 K50")
            
            # 생성된 파일 열기 여부 묻기
            if messagebox.askyesno("파일 열기", "생성된 학생증을 바로 확인하시겠습니까?"):
                try:
                    import subprocess
                    subprocess.run(['start', output_path], shell=True, check=True)
                except Exception as e:
                    print(f"파일 열기 오류: {e}")
                    
            return True
            
        except Exception as e:
            self.status_label.config(text="❌ 생성 실패")
            error_message = f"학생증 생성 중 오류가 발생했습니다:\n{str(e)}"
            messagebox.showerror("오류", error_message)
            print(f"학생증 생성 오류: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def preview_result(self):
        """결과 미리보기 - 인쇄 기준과 동일한 결과 표시"""
        photo_path = self.selected_photo_path.get()
        
        if not photo_path:
            messagebox.showwarning("경고", "사진을 먼저 선택해주세요.")
            return
        
        # 이름 확인
        student_name = self.student_name.get().strip()
        if not student_name:
            messagebox.showwarning("경고", "학생 이름을 입력해주세요!")
            return
        
        # 생년월일 확인
        birth_date = self.birth_date.get().strip()
        if not birth_date:
            messagebox.showwarning("경고", "생년월일을 입력해주세요!")
            return
        
        try:
            # 인쇄와 동일한 방식으로 학생증 생성
            # 배경 프레임 로드
            background_path = "background_frame.jpg"
            if os.path.exists(background_path):
                background = Image.open(background_path)
                # 카드 크기의 101%로 리사이즈
                scaled_width = int(self.CARD_WIDTH_PX * self.FRAME_SCALE)
                scaled_height = int(self.CARD_HEIGHT_PX * self.FRAME_SCALE)
                background = background.resize((scaled_width, scaled_height), 
                                             Image.Resampling.LANCZOS)
                
                # 중앙에서 원래 카드 크기만큼 크롭
                left = (scaled_width - self.CARD_WIDTH_PX) // 2
                top = (scaled_height - self.CARD_HEIGHT_PX) // 2
                right = left + self.CARD_WIDTH_PX
                bottom = top + self.CARD_HEIGHT_PX
                background = background.crop((left, top, right, bottom))
            else:
                background = Image.new('RGB', (self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), 'white')
            
            if background.mode != 'RGB':
                background = background.convert('RGB')
            
            # 학생 사진 로드 및 처리 (인쇄와 동일)
            student_photo = Image.open(photo_path)
            
            # PNG 투명도 처리 - transparent 상태 유지
            original_mode = student_photo.mode
            if student_photo.mode in ('RGBA', 'LA'):
                print(f"✓ 투명도 유지: {student_photo.mode} 모드")
            elif student_photo.mode != 'RGB':
                student_photo = student_photo.convert('RGB')
            
            # 사진을 고정 크기로 리사이즈 (통일된 상수 사용)
            student_photo = student_photo.resize((self.PHOTO_WIDTH_PX, self.PHOTO_HEIGHT_PX), Image.Resampling.LANCZOS)
            
            # 사진을 카드 중앙에 배치 (통일된 상수 사용)
            photo_left = self.photo_left_px
            photo_top = self.photo_top_px
            
            # 배경에 사진 합성 (투명도 처리)
            if original_mode in ('RGBA', 'LA') and student_photo.mode == 'RGBA':
                background.paste(student_photo, (photo_left, photo_top), student_photo)
            else:
                background.paste(student_photo, (photo_left, photo_top))
            
            # 텍스트 추가 (인쇄와 동일)
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(background)
            text_color = self.TEXT_COLOR
            
            # 이름 텍스트 추가
            try:
                font = ImageFont.truetype("neodgm.ttf", self.NAME_FONT_SIZE)
            except:
                font = ImageFont.load_default()
            
            text_y = self.CARD_HEIGHT_PX - self.name_bottom_px
            if font:
                bbox = draw.textbbox((0, 0), student_name, font=font)
                text_width = bbox[2] - bbox[0]
                text_x = (self.CARD_WIDTH_PX - text_width) // 2
                draw.text((text_x, text_y), student_name, fill=text_color, font=font)
            
            # 생년월일 텍스트 추가
            try:
                font_birth = ImageFont.truetype("neodgm.ttf", self.BIRTH_FONT_SIZE)
            except:
                font_birth = ImageFont.load_default()
            
            birth_text_y = self.CARD_HEIGHT_PX - self.birth_bottom_px
            if font_birth:
                birth_bbox = draw.textbbox((0, 0), birth_date, font=font_birth)
                birth_text_width = birth_bbox[2] - birth_bbox[0]
                birth_text_x = (self.CARD_WIDTH_PX - birth_text_width) // 2
                draw.text((birth_text_x, birth_text_y), birth_date, fill=text_color, font=font_birth)
            
            # 미리보기용 크기로 조정
            preview_width = 400
            preview_height = int(preview_width * self.CARD_HEIGHT_PX / self.CARD_WIDTH_PX)
            preview_image = background.resize((preview_width, preview_height), Image.Resampling.LANCZOS)
            
            # 미리보기 창 생성
            preview_window = tk.Toplevel(self.root)
            preview_window.title("📋 학생증 미리보기 (인쇄 기준)")
            preview_window.geometry(f"{preview_width + 50}x{preview_height + 100}")
            
            # Tkinter용 이미지로 변환
            preview_photo = ImageTk.PhotoImage(preview_image)
            
            # 미리보기 라벨
            preview_label = ttk.Label(preview_window, image=preview_photo)
            preview_label.image = preview_photo  # 참조 유지
            preview_label.pack(padx=20, pady=20)
            
            # 설명 라벨
            info_label = ttk.Label(preview_window, 
                                  text=f"실제 크기: {self.CARD_WIDTH_MM}mm × {self.CARD_HEIGHT_MM}mm\n"
                                       f"해상도: 300 DPI\n"
                                       f"사진 위치: 위에서 {self.PHOTO_TOP_MM}mm",
                                  font=('Arial', 10))
            info_label.pack(pady=10)
            
        except Exception as e:
            messagebox.showerror("오류", f"미리보기 생성 중 오류가 발생했습니다:\n{str(e)}")
    
    def print_card(self):
        """학생증 인쇄"""
        photo_path = self.selected_photo_path.get()
        
        if not photo_path:
            messagebox.showerror("오류", "사진을 먼저 선택해주세요.")
            return
        
        # 이름 확인
        student_name = self.student_name.get().strip()
        if not student_name:
            messagebox.showwarning("경고", "학생 이름을 입력해주세요!")
            return
        
        # 생년월일 확인
        birth_date = self.birth_date.get().strip()
        if not birth_date:
            messagebox.showwarning("경고", "생년월일을 입력해주세요!")
            return
        
        # 생년월일 형식 검증 (YYYY.MM.DD)
        import re
        if not re.match(r'^\d{4}\.\d{2}\.\d{2}$', birth_date):
            messagebox.showwarning("경고", "생년월일을 YYYY.MM.DD 형식으로 입력해주세요!\n예: 1992.05.10")
            return
        
        if not os.path.exists(photo_path):
            messagebox.showerror("오류", "선택된 사진 파일을 찾을 수 없습니다.")
            return
        
        temp_path = None  # 임시 파일 경로 초기화
        
        try:
            # 먼저 학생증 생성
            self.status_label.config(text="학생증 생성 중...")
            self.root.update()
            
            # 배경 프레임 로드
            background_path = "background_frame.jpg"
            if os.path.exists(background_path):
                background = Image.open(background_path)
                # 카드 크기의 101%로 리사이즈
                scaled_width = int(self.CARD_WIDTH_PX * self.FRAME_SCALE)
                scaled_height = int(self.CARD_HEIGHT_PX * self.FRAME_SCALE)
                background = background.resize((scaled_width, scaled_height), 
                                             Image.Resampling.LANCZOS)
                
                # 중앙에서 원래 카드 크기만큼 크롭
                left = (scaled_width - self.CARD_WIDTH_PX) // 2
                top = (scaled_height - self.CARD_HEIGHT_PX) // 2
                right = left + self.CARD_WIDTH_PX
                bottom = top + self.CARD_HEIGHT_PX
                background = background.crop((left, top, right, bottom))
                print(f"✓ 배경 프레임 로드 (101% 크기): {background_path}")
            else:
                background = Image.new('RGB', (self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), 'white')
                print("⚠️ 배경 프레임이 없어서 흰색 배경을 사용합니다.")
            
            if background.mode != 'RGB':
                background = background.convert('RGB')
            
            # 학생 사진 로드 및 처리 (create_student_card와 동일)
            student_photo = Image.open(photo_path)
            print(f"✓ 학생 사진 로드: {photo_path}")
            
            # PNG 투명도 처리 - transparent 상태 유지
            original_mode = student_photo.mode
            if student_photo.mode in ('RGBA', 'LA'):
                # 투명도가 있는 경우 그대로 유지
                print(f"✓ 투명도 유지: {student_photo.mode} 모드")
            elif student_photo.mode != 'RGB':
                student_photo = student_photo.convert('RGB')
                print("✓ RGB 모드로 변환 완료")
            
            # 사진을 고정 크기로 리사이즈 (통일된 상수 사용)
            student_photo = student_photo.resize((self.PHOTO_WIDTH_PX, self.PHOTO_HEIGHT_PX), Image.Resampling.LANCZOS)
            print(f"✓ 사진 크기 고정: {self.PHOTO_WIDTH_PX}x{self.PHOTO_HEIGHT_PX}px")
            
            # 사진을 카드 중앙에 배치 (통일된 상수 사용)
            photo_left = self.photo_left_px
            photo_top = self.photo_top_px
            
            # 배경에 사진 합성 (투명도 처리)
            if original_mode in ('RGBA', 'LA') and student_photo.mode == 'RGBA':
                # 투명도가 있는 경우 알파 채널 사용
                background.paste(student_photo, (photo_left, photo_top), student_photo)
                print(f"✓ 투명도 적용하여 사진 합성 완료: 위치 ({photo_left}, {photo_top})")
            else:
                # 일반 RGB 이미지인 경우
                background.paste(student_photo, (photo_left, photo_top))
                print(f"✓ 사진 합성 완료: 위치 ({photo_left}, {photo_top})")
            
            # 학생 이름 텍스트 추가
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(background)
            
            # 통일된 텍스트 색상 사용
            text_color = self.TEXT_COLOR
            
            # 폰트 로드 (통일된 상수 사용)
            try:
                font = ImageFont.truetype("neodgm.ttf", self.NAME_FONT_SIZE)
                print(f"✓ neodgm.ttf 폰트 로드 완료 (크기: {self.NAME_FONT_SIZE})")
            except:
                try:
                    font = ImageFont.load_default()
                    print("⚠️ neodgm.ttf 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                except:
                    font = None
                    print("❌ 폰트 로드 실패")
            
            # 텍스트 위치 계산 (통일된 상수 사용)
            text_y = self.CARD_HEIGHT_PX - self.name_bottom_px
            
            # 텍스트 크기 측정하여 가운데 정렬
            if font:
                bbox = draw.textbbox((0, 0), student_name, font=font)
                text_width = bbox[2] - bbox[0]
                text_x = (self.CARD_WIDTH_PX - text_width) // 2  # 가운데 정렬
                
                # 텍스트 그리기
                draw.text((text_x, text_y), student_name, fill=text_color, font=font)
                print(f"✓ 이름 텍스트 추가: '{student_name}' (위치: {text_x}, {text_y})")
            else:
                print("❌ 폰트 없음으로 텍스트 추가 실패")
            
            # 생년월일 텍스트 추가 (통일된 상수 사용)
            try:
                font_birth = ImageFont.truetype("neodgm.ttf", self.BIRTH_FONT_SIZE)
                print(f"✓ 생년월일용 neodgm.ttf 폰트 로드 완료 (크기: {self.BIRTH_FONT_SIZE})")
            except:
                try:
                    font_birth = ImageFont.load_default()
                    print("⚠️ neodgm.ttf 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
                except:
                    font_birth = None
                    print("❌ 생년월일 폰트 로드 실패")
            
            # 생년월일 텍스트 위치 계산 (통일된 상수 사용)
            birth_text_y = self.CARD_HEIGHT_PX - self.birth_bottom_px
            # 생년월일 텍스트 크기 측정하여 가운데 정렬
            if font_birth:
                birth_bbox = draw.textbbox((0, 0), birth_date, font=font_birth)
                birth_text_width = birth_bbox[2] - birth_bbox[0]
                birth_text_x = (self.CARD_WIDTH_PX - birth_text_width) // 2  # 가운데 정렬
                
                # 생년월일 텍스트 그리기 (통일된 텍스트 색상 사용)
                draw.text((birth_text_x, birth_text_y), birth_date, fill=text_color, font=font_birth)
                print(f"✓ 생년월일 텍스트 추가: '{birth_date}' (위치: {birth_text_x}, {birth_text_y})")
            else:
                print("❌ 폰트 없음으로 생년월일 텍스트 추가 실패")
            
            # 임시 파일로 저장
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                temp_path = temp_file.name
                background.save(temp_path, 'JPEG', quality=95, dpi=(self.DPI, self.DPI))
                print(f"✓ 임시 파일 저장: {temp_path}")
            
            self.status_label.config(text="프린터로 전송 중...")
            self.root.update()
            
            # Windows에서 기본 프린터로 인쇄
            print_success = False
            try:
                import win32api
                import win32print
                
                # 기본 프린터 확인
                try:
                    default_printer = win32print.GetDefaultPrinter()
                    print(f"✓ 기본 프린터: {default_printer}")
                    self.status_label.config(text=f"인쇄 중: {default_printer}")
                    self.root.update()
                except Exception as printer_error:
                    print(f"❌ 프린터 확인 오류: {printer_error}")
                    raise Exception(f"기본 프린터를 찾을 수 없습니다: {printer_error}")
                
                # 인쇄 실행
                result = win32api.ShellExecute(
                    0,
                    "print", 
                    temp_path,
                    f'/d:"{default_printer}"',
                    ".",
                    0
                )
                
                print(f"ShellExecute 결과 코드: {result}")
                
                if result > 32:
                    print_success = True
                    self.status_label.config(text="✅ 인쇄 명령 전송 완료!")
                    messagebox.showinfo("인쇄 성공", 
                                      f"학생증이 프린터로 전송되었습니다!\n\n"
                                      f"프린터: {default_printer}\n"
                                      f"파일 크기: {self.CARD_WIDTH_MM}mm × {self.CARD_HEIGHT_MM}mm\n"
                                      f"해상도: 300 DPI")
                else:
                    error_messages = {
                        0: "시스템에 메모리나 리소스가 부족합니다",
                        2: "파일을 찾을 수 없습니다",
                        3: "경로를 찾을 수 없습니다", 
                        5: "액세스가 거부되었습니다",
                        8: "메모리가 부족합니다",
                        26: "공유 위반이 발생했습니다",
                        27: "파일 이름 연결이 완전하지 않거나 잘못되었습니다",
                        30: "함수가 지원되지 않습니다",
                        31: "네트워크 연결이 없습니다"
                    }
                    error_msg = error_messages.get(result, f"알 수 없는 오류 (코드: {result})")
                    print(f"❌ 인쇄 실패: {error_msg}")
                    self.status_label.config(text="❌ 인쇄 실패")
                    messagebox.showerror("인쇄 실패", 
                                       f"인쇄 명령 전송에 실패했습니다.\n\n"
                                       f"오류: {error_msg}\n"
                                       f"코드: {result}")
                    
            except ImportError as import_error:
                print(f"❌ win32api import 오류: {import_error}")
                # win32api가 없는 경우 대안 방법
                try:
                    print("대안 인쇄 방법 시도...")
                    os.startfile(temp_path, "print")
                    print_success = True
                    self.status_label.config(text="✅ 인쇄 대화상자 열림")
                    messagebox.showinfo("인쇄", "인쇄 대화상자가 열렸습니다.\n프린터를 선택하고 인쇄하세요.")
                except Exception as fallback_error:
                    print(f"❌ 대안 인쇄 방법 오류: {fallback_error}")
                    self.status_label.config(text="❌ 인쇄 실패")
                    messagebox.showerror("인쇄 오류", 
                                       f"인쇄 기능을 사용할 수 없습니다.\n\n"
                                       f"win32api 오류: {import_error}\n"
                                       f"대안 방법 오류: {fallback_error}\n\n"
                                       f"해결 방법:\n"
                                       f"1. 'pip install pywin32' 실행\n"
                                       f"2. 또는 수동으로 파일을 열어서 인쇄하세요:\n{temp_path}")
            except Exception as print_error:
                print(f"❌ 인쇄 중 일반 오류: {print_error}")
                import traceback
                traceback.print_exc()
                self.status_label.config(text="❌ 인쇄 실패")
                messagebox.showerror("인쇄 오류", 
                                   f"인쇄 중 오류가 발생했습니다:\n\n{print_error}\n\n"
                                   f"해결 방법:\n"
                                   f"1. 프린터가 연결되어 있는지 확인\n"
                                   f"2. 프린터 드라이버가 설치되어 있는지 확인\n"
                                   f"3. 기본 프린터가 설정되어 있는지 확인")
            
            # 임시 파일 정리 (성공했을 때만 5초 후, 실패하면 즉시)
            if print_success and temp_path:
                self.root.after(5000, lambda: self._cleanup_temp_file(temp_path))
            elif temp_path:
                self.root.after(1000, lambda: self._cleanup_temp_file(temp_path))
                
        except Exception as e:
            self.status_label.config(text="❌ 인쇄 오류 발생")
            error_message = f"인쇄 중 오류가 발생했습니다:\n{str(e)}"
            messagebox.showerror("오류", error_message)
            print(f"인쇄 오류: {e}")
            import traceback
            traceback.print_exc()
            
            # 오류 발생 시 임시 파일 정리
            if temp_path:
                self.root.after(1000, lambda: self._cleanup_temp_file(temp_path))
    
    def simple_print_card(self):
        """간단한 방법으로 학생증 인쇄 (Windows 기본 이미지 뷰어 사용)"""
        photo_path = self.selected_photo_path.get()
        
        if not photo_path:
            messagebox.showerror("오류", "사진을 먼저 선택해주세요.")
            return
        
        try:
            # 학생증 생성 (create_student_card와 동일한 로직)
            self.status_label.config(text="학생증 생성 중...")
            self.root.update()
            
            if not os.path.exists(photo_path):
                messagebox.showerror("오류", "선택된 사진 파일을 찾을 수 없습니다.")
                return
            
            # 배경 프레임 로드
            background_path = "background_frame.jpg"
            if os.path.exists(background_path):
                background = Image.open(background_path)
                background = background.resize((self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), 
                                             Image.Resampling.LANCZOS)
            else:
                background = Image.new('RGB', (self.CARD_WIDTH_PX, self.CARD_HEIGHT_PX), 'white')
                print("⚠️ 배경 프레임이 없어서 흰색 배경을 사용합니다.")
            
            if background.mode != 'RGB':
                background = background.convert('RGB')
            
            # 학생 사진 처리
            student_photo = Image.open(photo_path)
            if student_photo.mode != 'RGB':
                student_photo = student_photo.convert('RGB')
            
            student_photo = student_photo.resize((self.photo_width_px, self.photo_height_px), 
                                               Image.Resampling.LANCZOS)
            
            background.paste(student_photo, (self.photo_left_px, self.photo_top_px))
            
            # output 폴더에 저장
            output_dir = "output"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"인쇄용_학생증_{timestamp}.jpg"
            output_path = os.path.join(output_dir, output_filename)
            
            background.save(output_path, 'JPEG', quality=95, dpi=(self.DPI, self.DPI))
            
            self.status_label.config(text="이미지 뷰어로 열기 중...")
            self.root.update()
            
            # Windows 기본 이미지 뷰어로 열기
            import subprocess
            
            try:
                # 방법 1: os.startfile 사용 (가장 안전)
                os.startfile(output_path)
                self.status_label.config(text="✅ 이미지 뷰어 열기 완료")
                
                messagebox.showinfo("인쇄 안내", 
                                  f"학생증 이미지가 열렸습니다!\n\n"
                                  f"인쇄 방법:\n"
                                  f"1. 이미지 뷰어에서 Ctrl+P 누르기\n"
                                  f"2. 또는 마우스 우클릭 → 인쇄 선택\n"
                                  f"3. 프린터 설정에서 '실제 크기'로 인쇄\n\n"
                                  f"파일 위치: {output_path}")
                
            except Exception as viewer_error:
                # 방법 2: 파일 탐색기로 열기
                try:
                    subprocess.run(['explorer', '/select,', output_path], check=True)
                    self.status_label.config(text="✅ 파일 탐색기 열기 완료")
                    messagebox.showinfo("인쇄 안내", 
                                      f"파일 탐색기가 열렸습니다!\n\n"
                                      f"인쇄 방법:\n"
                                      f"1. 파일을 더블클릭하여 열기\n"
                                      f"2. Ctrl+P로 인쇄하거나 마우스 우클릭 → 인쇄\n\n"
                                      f"파일: {output_filename}")
                except Exception as explorer_error:
                    # 방법 3: 수동 안내
                    self.status_label.config(text="✅ 파일 저장 완료")
                    messagebox.showinfo("수동 인쇄 안내", 
                                      f"학생증이 저장되었습니다!\n\n"
                                      f"수동 인쇄 방법:\n"
                                      f"1. 파일 탐색기에서 다음 위치로 이동:\n"
                                      f"   {os.path.abspath(output_path)}\n\n"
                                      f"2. 파일을 더블클릭하여 열기\n"
                                      f"3. Ctrl+P로 인쇄\n\n"
                                      f"오류: {viewer_error}")
                    
        except Exception as e:
            self.status_label.config(text="❌ 생성 오류 발생")
            messagebox.showerror("오류", f"학생증 생성 중 오류가 발생했습니다:\n{str(e)}")
    
    def _cleanup_temp_file(self, file_path):
        """임시 파일 정리"""
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
        except:
            pass  # 정리 실패해도 무시
    
    def run(self):
        """프로그램 실행"""
        print("📸 사진 선택 세로형 학생증 생성기를 시작합니다...")
        print(f"배경 프레임: background_frame.jpg (없으면 흰색 배경 사용)")
        print(f"사진 배치: 위에서 {self.PHOTO_TOP_MM}mm, 크기 {self.PHOTO_WIDTH_MM}×{self.PHOTO_HEIGHT_MM}mm")
        
        self.root.mainloop()

def create_photo_card_gui():
    """사진 선택 학생증 생성기 실행"""
    app = PhotoCardMaker()
    app.run()

if __name__ == "__main__":
    create_photo_card_gui()
