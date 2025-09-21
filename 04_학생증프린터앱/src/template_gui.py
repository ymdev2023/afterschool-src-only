"""
포토샵 템플릿 기반 학생증 제작 GUI
- 포토샵 배경 + 사진 선택 + 이름만 입력
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk
import os
import glob
import json

class TemplateCardGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🎨 포토샵 템플릿 학생증 제작")
        self.root.geometry("900x700")
        self.root.configure(bg='#f0f0f0')
        
        # 변수들
        self.student_name = tk.StringVar()
        self.school_name = tk.StringVar(value="은하여자고등학교")
        self.grade = tk.StringVar(value="3")
        self.class_num = tk.StringVar(value="2")
        self.template_path = tk.StringVar()
        
        # 사진 관련
        self.photo_files = []
        self.current_photo_index = 0
        self.current_photo_path = ""
        
        # 템플릿 관련
        self.template_files = []
        self.current_template_index = 0
        
        self.setup_ui()
        self.load_templates()
        self.load_photos()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="🎨 포토샵 템플릿 학생증 제작", 
                               font=('Arial', 20, 'bold'))
        title_label.pack(pady=(0, 20))
        
        # 상단 프레임 (템플릿 + 사진 선택)
        top_frame = ttk.Frame(main_frame)
        top_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 템플릿 선택 (왼쪽)
        template_frame = ttk.LabelFrame(top_frame, text="🖼️ 배경 템플릿", padding="15")
        template_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        self.template_label = ttk.Label(template_frame, text="템플릿을 로드 중...", 
                                       background='white', relief='sunken')
        self.template_label.pack(pady=(0, 10), ipady=20)
        
        template_btn_frame = ttk.Frame(template_frame)
        template_btn_frame.pack(pady=5)
        
        ttk.Button(template_btn_frame, text="◀ 이전", command=self.prev_template).pack(side=tk.LEFT, padx=2)
        self.template_info_label = ttk.Label(template_btn_frame, text="1/1", font=('Arial', 10, 'bold'))
        self.template_info_label.pack(side=tk.LEFT, padx=10)
        ttk.Button(template_btn_frame, text="다음 ▶", command=self.next_template).pack(side=tk.LEFT, padx=2)
        
        ttk.Button(template_frame, text="📁 템플릿 추가", command=self.add_template).pack(pady=(10, 0))
        
        # 사진 선택 (오른쪽)
        photo_frame = ttk.LabelFrame(top_frame, text="📸 학생 사진", padding="15")
        photo_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.photo_label = ttk.Label(photo_frame, text="사진을 로드 중...", 
                                     background='white', relief='sunken')
        self.photo_label.pack(pady=(0, 10), ipady=20)
        
        photo_btn_frame = ttk.Frame(photo_frame)
        photo_btn_frame.pack(pady=5)
        
        ttk.Button(photo_btn_frame, text="◀ 이전", command=self.prev_photo).pack(side=tk.LEFT, padx=2)
        self.photo_info_label = ttk.Label(photo_btn_frame, text="1/6", font=('Arial', 10, 'bold'))
        self.photo_info_label.pack(side=tk.LEFT, padx=10)
        ttk.Button(photo_btn_frame, text="다음 ▶", command=self.next_photo).pack(side=tk.LEFT, padx=2)
        
        ttk.Button(photo_frame, text="📁 사진 추가", command=self.add_photo).pack(pady=(10, 0))
        
        # 중간 프레임 (학생 정보 입력)
        input_frame = ttk.LabelFrame(main_frame, text="✏️ 학생 정보", padding="15")
        input_frame.pack(fill=tk.X, pady=(0, 20))
        
        # 학교명 입력
        school_frame = ttk.Frame(input_frame)
        school_frame.pack(fill=tk.X, pady=(0, 10))
        ttk.Label(school_frame, text="학교명:", font=('Arial', 12)).pack(side=tk.LEFT, padx=(0, 10))
        school_entry = ttk.Entry(school_frame, textvariable=self.school_name, font=('Arial', 14))
        school_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 학년/반 입력
        grade_frame = ttk.Frame(input_frame)
        grade_frame.pack(fill=tk.X, pady=(0, 10))
        ttk.Label(grade_frame, text="학년:", font=('Arial', 12)).pack(side=tk.LEFT, padx=(0, 10))
        grade_entry = ttk.Entry(grade_frame, textvariable=self.grade, font=('Arial', 14), width=10)
        grade_entry.pack(side=tk.LEFT, padx=(0, 20))
        
        ttk.Label(grade_frame, text="반:", font=('Arial', 12)).pack(side=tk.LEFT, padx=(0, 10))
        class_entry = ttk.Entry(grade_frame, textvariable=self.class_num, font=('Arial', 14), width=10)
        class_entry.pack(side=tk.LEFT)
        
        # 이름 입력
        name_frame = ttk.Frame(input_frame)
        name_frame.pack(fill=tk.X, pady=(10, 0))
        ttk.Label(name_frame, text="이름:", font=('Arial', 12)).pack(side=tk.LEFT, padx=(0, 10))
        name_entry = ttk.Entry(name_frame, textvariable=self.student_name, font=('Arial', 14))
        name_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        name_entry.focus()  # 포커스 설정
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Button(button_frame, text="🎨 학생증 생성", 
                   command=self.create_card, 
                   style='Accent.TButton').pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(button_frame, text="🖨️ 바로 인쇄", command=self.print_card).pack(side=tk.LEFT, padx=10)
        ttk.Button(button_frame, text="⚙️ 설정", command=self.open_settings).pack(side=tk.LEFT, padx=10)
        
        # 미리보기 프레임
        preview_frame = ttk.LabelFrame(main_frame, text="👀 미리보기", padding="15")
        preview_frame.pack(fill=tk.BOTH, expand=True)
        
        self.preview_label = ttk.Label(preview_frame, text="학생증을 생성하면\\n여기에 미리보기가 표시됩니다", 
                                       background='white', relief='sunken', anchor='center')
        self.preview_label.pack(fill=tk.BOTH, expand=True, pady=(0, 10), ipady=50)
        
        # 하단 버튼들
        bottom_btn_frame = ttk.Frame(preview_frame)
        bottom_btn_frame.pack(fill=tk.X)
        
        ttk.Button(bottom_btn_frame, text="📁 출력폴더", command=self.open_output_folder).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(bottom_btn_frame, text="💾 다른이름저장", command=self.save_as).pack(side=tk.LEFT, padx=5)
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="준비됨", font=('Arial', 10))
        self.status_label.pack(pady=10)
        
    def load_templates(self):
        """템플릿 폴더에서 템플릿들 로드"""
        template_extensions = ['*.png', '*.jpg', '*.jpeg']
        self.template_files = []
        
        # templates 폴더 생성
        if not os.path.exists('templates'):
            os.makedirs('templates')
            
        for ext in template_extensions:
            self.template_files.extend(glob.glob(f"templates/{ext}"))
            self.template_files.extend(glob.glob(f"templates/{ext.upper()}"))
        
        if self.template_files:
            self.current_template_index = 0
            self.show_current_template()
            self.update_status(f"{len(self.template_files)}개의 템플릿을 로드했습니다")
        else:
            self.template_label.config(text="📄 흰색 배경 사용\\n(템플릿 추가 가능)")
            self.update_status("흰색 배경으로 학생증 생성 가능")
            
    def show_current_template(self):
        """현재 선택된 템플릿 표시"""
        if not self.template_files:
            return
            
        try:
            template_path = self.template_files[self.current_template_index]
            self.template_path.set(template_path)
            
            # 이미지 로드 및 리사이즈
            image = Image.open(template_path)
            
            # 실제 카드 비율 유지 (86mm x 54mm = 약 1.59:1)
            card_ratio = 86 / 54  # 실제 카드 비율
            
            # 템플릿 미리보기 크기 (실제 카드 크기에 가깝게!)
            preview_width = 500
            preview_height = 310  # 카드 비율에 맞춤
            
            # 카드 비율에 맞춰 미리보기 크기 계산
            if image.width / image.height > card_ratio:
                # 이미지가 카드보다 더 가로로 긴 경우
                new_width = preview_width
                new_height = int(preview_width / card_ratio)
            else:
                # 이미지가 카드보다 더 세로로 긴 경우
                new_height = preview_height
                new_width = int(preview_height * card_ratio)
            
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.template_image = ImageTk.PhotoImage(image)
            self.template_label.config(image=self.template_image, text="")
            
            # 템플릿 정보 업데이트
            filename = os.path.basename(template_path)
            self.template_info_label.config(text=f"{self.current_template_index + 1}/{len(self.template_files)}\\n{filename}")
            
        except Exception as e:
            self.template_label.config(text=f"템플릿 로드 실패:\\n{str(e)}")
            
    def prev_template(self):
        """이전 템플릿으로 이동"""
        if self.template_files and len(self.template_files) > 1:
            self.current_template_index = (self.current_template_index - 1) % len(self.template_files)
            self.show_current_template()
            
    def next_template(self):
        """다음 템플릿으로 이동"""
        if self.template_files and len(self.template_files) > 1:
            self.current_template_index = (self.current_template_index + 1) % len(self.template_files)
            self.show_current_template()
            
    def add_template(self):
        """새 템플릿 추가"""
        file_path = filedialog.askopenfilename(
            title="배경 템플릿 선택 (포토샵 PNG 파일)",
            filetypes=[
                ("PNG 파일", "*.png"),
                ("이미지 파일", "*.jpg *.jpeg *.png"),
                ("모든 파일", "*.*")
            ]
        )
        
        if file_path:
            if not os.path.exists('templates'):
                os.makedirs('templates')
                
            filename = os.path.basename(file_path)
            new_path = f"templates/{filename}"
            
            try:
                # 이미지 복사
                image = Image.open(file_path)
                image.save(new_path, 'PNG')
                
                # 템플릿 목록 다시 로드
                self.load_templates()
                messagebox.showinfo("성공", f"템플릿이 추가되었습니다:\\n{filename}")
                
            except Exception as e:
                messagebox.showerror("오류", f"템플릿 추가 실패:\\n{str(e)}")
                
    def load_photos(self):
        """photos 폴더에서 사진들 로드"""
        photo_extensions = ['*.jpg', '*.jpeg', '*.png']
        self.photo_files = []
        
        for ext in photo_extensions:
            self.photo_files.extend(glob.glob(f"photos/{ext}"))
            self.photo_files.extend(glob.glob(f"photos/{ext.upper()}"))
        
        if self.photo_files:
            self.current_photo_index = 0
            self.show_current_photo()
        else:
            self.photo_label.config(text="photos 폴더에\\n학생 사진을 넣어주세요")
            
    def show_current_photo(self):
        """현재 선택된 사진 표시"""
        if not self.photo_files:
            return
            
        try:
            self.current_photo_path = self.photo_files[self.current_photo_index]
            
            # 이미지 로드 및 리사이즈
            image = Image.open(self.current_photo_path)
            image = image.resize((400, 480), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.photo_image = ImageTk.PhotoImage(image)
            self.photo_label.config(image=self.photo_image, text="")
            
            # 사진 정보 업데이트
            filename = os.path.basename(self.current_photo_path)
            self.photo_info_label.config(text=f"{self.current_photo_index + 1}/{len(self.photo_files)}\\n{filename}")
            
        except Exception as e:
            self.photo_label.config(text=f"사진 로드 실패:\\n{str(e)}")
            
    def prev_photo(self):
        """이전 사진으로 이동"""
        if self.photo_files and len(self.photo_files) > 1:
            self.current_photo_index = (self.current_photo_index - 1) % len(self.photo_files)
            self.show_current_photo()
            
    def next_photo(self):
        """다음 사진으로 이동"""
        if self.photo_files and len(self.photo_files) > 1:
            self.current_photo_index = (self.current_photo_index + 1) % len(self.photo_files)
            self.show_current_photo()
            
    def add_photo(self):
        """새 사진 추가"""
        file_paths = filedialog.askopenfilenames(
            title="학생 사진 선택 (여러 개 선택 가능)",
            filetypes=[
                ("이미지 파일", "*.jpg *.jpeg *.png"),
                ("모든 파일", "*.*")
            ]
        )
        
        if file_paths:
            if not os.path.exists('photos'):
                os.makedirs('photos')
                
            added_count = 0
            for file_path in file_paths:
                try:
                    filename = os.path.basename(file_path)
                    new_path = f"photos/{filename}"
                    
                    image = Image.open(file_path)
                    image.save(new_path, 'JPEG', quality=95)
                    added_count += 1
                    
                except Exception as e:
                    messagebox.showerror("오류", f"사진 추가 실패: {filename}\\n{str(e)}")
            
            if added_count > 0:
                self.load_photos()
                messagebox.showinfo("성공", f"{added_count}개의 사진이 추가되었습니다")
                
    def create_card(self):
        """학생증 생성"""
        # 입력 검증
        if not self.student_name.get().strip():
            messagebox.showerror("오류", "이름을 입력해주세요")
            return
            
        if not self.school_name.get().strip():
            messagebox.showerror("오류", "학교명을 입력해주세요")
            return
            
        if not self.grade.get().strip():
            messagebox.showerror("오류", "학년을 입력해주세요")
            return
            
        if not self.class_num.get().strip():
            messagebox.showerror("오류", "반을 입력해주세요")
            return
            
        # 템플릿이 없으면 흰색 배경 사용
        if not self.template_files:
            print("⚠️ 템플릿이 없습니다. 흰색 배경을 사용합니다.")
            # 가상의 템플릿 경로 설정 (실제로는 사용되지 않음)
            self.template_path.set("white_background")
            
        if not self.current_photo_path:
            messagebox.showerror("오류", "학생 사진을 선택해주세요")
            return
        
        try:
            from template_card_maker import TemplateCardMaker
            
            maker = TemplateCardMaker()
            
            # 출력 경로 설정
            if not os.path.exists('output'):
                os.makedirs('output')
                
            safe_name = "".join(c for c in self.student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
            output_path = f"output/{safe_name}_템플릿학생증.png"
            
            self.update_status("학생증 생성 중...")
            
            # 학생 데이터 준비
            student_data = {
                'name': self.student_name.get().strip(),
                'school_name': self.school_name.get().strip(),
                'grade': self.grade.get().strip(),
                'class': self.class_num.get().strip()
            }
            
            # 학생증 생성
            success = maker.create_card_with_template(
                template_path=self.template_path.get(),
                photo_path=self.current_photo_path,
                student_data=student_data,
                output_path=output_path
            )
            
            if success:
                # 미리보기 표시
                self.show_preview(output_path)
                self.update_status("✅ 학생증 생성 완료!")
                messagebox.showinfo("성공", f"템플릿 학생증이 생성되었습니다!\\n\\n파일: {output_path}")
            else:
                self.update_status("❌ 생성 실패")
                messagebox.showerror("오류", "학생증 생성에 실패했습니다")
                
        except Exception as e:
            self.update_status("❌ 오류 발생")
            messagebox.showerror("오류", f"학생증 생성 중 오류:\\n{str(e)}")
            
    def show_preview(self, image_path):
        """생성된 학생증 미리보기 표시"""
        try:
            # 이미지 로드
            image = Image.open(image_path)
            
            # 실제 카드 비율 유지 (86mm x 54mm = 약 1.59:1)
            card_ratio = 86 / 54  # 실제 카드 비율
            
            # 미리보기 영역 크기 (실제 카드 크기에 가깝게!)
            preview_width = 800
            preview_height = 500
            
            # 카드 비율에 맞춰 미리보기 크기 계산
            if image.width / image.height > card_ratio:
                # 이미지가 카드보다 더 가로로 긴 경우
                new_width = preview_width
                new_height = int(preview_width / card_ratio)
            else:
                # 이미지가 카드보다 더 세로로 긴 경우
                new_height = preview_height
                new_width = int(preview_height * card_ratio)
            
            # 이미지 리사이즈
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.preview_image = ImageTk.PhotoImage(image)
            self.preview_label.config(image=self.preview_image, text="")
            
        except Exception as e:
            self.preview_label.config(text=f"미리보기 로드 실패:\\n{str(e)}")
            
    def print_card(self):
        """학생증 인쇄"""
        # 먼저 생성
        self.create_card()
        
        # 생성된 파일 인쇄
        safe_name = "".join(c for c in self.student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
        output_path = f"output/{safe_name}_템플릿학생증.png"
        
        if os.path.exists(output_path):
            try:
                import win32api
                abs_path = os.path.abspath(output_path)
                result = win32api.ShellExecute(0, "print", abs_path, None, ".", 0)
                
                if result > 32:
                    self.update_status("✅ 인쇄 명령 전송!")
                    messagebox.showinfo("성공", "인쇄 명령이 전송되었습니다!")
                else:
                    self.update_status("❌ 인쇄 실패")
                    messagebox.showerror("실패", f"인쇄 실패 (코드: {result})")
                    
            except Exception as e:
                messagebox.showerror("오류", f"인쇄 중 오류:\\n{str(e)}")
        
    def open_settings(self):
        """설정 창 열기"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("⚙️ 템플릿 설정")
        settings_window.geometry("500x400")
        
        # 설정 내용
        ttk.Label(settings_window, text="📝 template_config.json 설정", font=('Arial', 14, 'bold')).pack(pady=10)
        
        info_text = """
현재 설정:
• 사진 영역: (x, y, width, height)
• 이름 위치: (x, y)
• 폰트 크기: 픽셀 단위

설정 파일 위치: template_config.json

포토샵에서 템플릿 제작 시:
1. 사진이 들어갈 영역의 좌표를 기록
2. 이름이 들어갈 위치 좌표를 기록  
3. template_config.json에서 수정
        """
        
        text_widget = tk.Text(settings_window, wrap=tk.WORD, height=15)
        text_widget.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        text_widget.insert(tk.END, info_text)
        text_widget.config(state=tk.DISABLED)
        
        ttk.Button(settings_window, text="📁 설정파일 열기", 
                   command=lambda: os.startfile("template_config.json") if os.path.exists("template_config.json") else None).pack(pady=10)
        
    def save_as(self):
        """다른 이름으로 저장"""
        safe_name = "".join(c for c in self.student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
        source_path = f"output/{safe_name}_템플릿학생증.png"
        
        if not os.path.exists(source_path):
            messagebox.showwarning("경고", "저장할 학생증이 없습니다. 먼저 학생증을 생성해주세요.")
            return
            
        file_path = filedialog.asksaveasfilename(
            title="학생증 저장",
            defaultextension=".png",
            filetypes=[("PNG 파일", "*.png"), ("모든 파일", "*.*")]
        )
        
        if file_path:
            try:
                image = Image.open(source_path)
                image.save(file_path)
                messagebox.showinfo("성공", f"학생증이 저장되었습니다:\\n{file_path}")
            except Exception as e:
                messagebox.showerror("오류", f"저장 실패:\\n{str(e)}")
                
    def open_output_folder(self):
        """출력 폴더 열기"""
        output_path = os.path.abspath('output')
        if not os.path.exists(output_path):
            os.makedirs(output_path)
            
        try:
            import subprocess
            subprocess.run(['explorer', output_path])
        except Exception as e:
            messagebox.showerror("오류", f"폴더 열기 실패:\\n{str(e)}")
            
    def update_status(self, message):
        """상태 메시지 업데이트"""
        self.status_label.config(text=message)
        self.root.update()

def main():
    root = tk.Tk()
    app = TemplateCardGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
