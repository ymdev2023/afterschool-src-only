"""
학생증 제작 GUI 프로그램
사진 선택 + 이름 입력 → 학생증 생성
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk
import os
import glob
from pointman_card_printer import PointmanCardPrinter

class StudentCardGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🎓 학생증 제작 프로그램")
        self.root.geometry("800x600")
        self.root.configure(bg='#f0f0f0')
        
        # 프린터 객체
        self.printer = PointmanCardPrinter()
        
        # 사진 관련 변수
        self.photo_files = []
        self.current_photo_index = 0
        self.current_photo_path = ""
        
        # 학생 정보 변수
        self.student_name = tk.StringVar()
        self.student_id = tk.StringVar()
        self.department = tk.StringVar()
        self.grade = tk.StringVar()
        self.school_name = tk.StringVar()
        
        # 기본값 설정
        self.student_id.set("20240001")
        self.department.set("컴퓨터공학과")
        self.grade.set("3학년")
        self.school_name.set("테크 대학교")
        
        self.setup_ui()
        self.load_photos()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 제목
        title_label = ttk.Label(main_frame, text="🎓 학생증 제작 프로그램", 
                               font=('Arial', 18, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # 왼쪽 패널 - 사진 선택
        photo_frame = ttk.LabelFrame(main_frame, text="📸 사진 선택", padding="10")
        photo_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # 사진 표시 영역
        self.photo_label = ttk.Label(photo_frame, text="사진을 로드 중...", 
                                    background='white', relief='sunken')
        self.photo_label.grid(row=0, column=0, columnspan=3, pady=(0, 10))
        
        # 사진 네비게이션 버튼
        ttk.Button(photo_frame, text="◀ 이전", command=self.prev_photo).grid(row=1, column=0, padx=5)
        self.photo_info_label = ttk.Label(photo_frame, text="1/6")
        self.photo_info_label.grid(row=1, column=1, padx=10)
        ttk.Button(photo_frame, text="다음 ▶", command=self.next_photo).grid(row=1, column=2, padx=5)
        
        # 사진 추가 버튼
        ttk.Button(photo_frame, text="📁 사진 추가", command=self.add_photo).grid(row=2, column=0, columnspan=3, pady=(10, 0))
        
        # 오른쪽 패널 - 학생 정보 입력
        info_frame = ttk.LabelFrame(main_frame, text="✏️ 학생 정보", padding="10")
        info_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # 학생 정보 입력 필드들
        ttk.Label(info_frame, text="이름:").grid(row=0, column=0, sticky=tk.W, pady=5)
        name_entry = ttk.Entry(info_frame, textvariable=self.student_name, font=('Arial', 12))
        name_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        name_entry.focus()  # 포커스 설정
        
        ttk.Label(info_frame, text="학번:").grid(row=1, column=0, sticky=tk.W, pady=5)
        ttk.Entry(info_frame, textvariable=self.student_id, font=('Arial', 12)).grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        ttk.Label(info_frame, text="학과:").grid(row=2, column=0, sticky=tk.W, pady=5)
        ttk.Entry(info_frame, textvariable=self.department, font=('Arial', 12)).grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        ttk.Label(info_frame, text="학년:").grid(row=3, column=0, sticky=tk.W, pady=5)
        grade_combo = ttk.Combobox(info_frame, textvariable=self.grade, 
                                  values=["1학년", "2학년", "3학년", "4학년"], state="readonly")
        grade_combo.grid(row=3, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        ttk.Label(info_frame, text="학교명:").grid(row=4, column=0, sticky=tk.W, pady=5)
        ttk.Entry(info_frame, textvariable=self.school_name, font=('Arial', 12)).grid(row=4, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        # 생성 버튼
        create_button = ttk.Button(info_frame, text="🎓 학생증 생성", 
                                  command=self.create_student_card, 
                                  style='Accent.TButton')
        create_button.grid(row=5, column=0, columnspan=2, pady=(20, 10), sticky=(tk.W, tk.E))
        
        # 프린터 연결 버튼
        printer_button = ttk.Button(info_frame, text="🖨️ 프린터 연결", 
                                   command=self.connect_printer)
        printer_button.grid(row=6, column=0, columnspan=2, pady=5, sticky=(tk.W, tk.E))
        
        # 미리보기 패널
        preview_frame = ttk.LabelFrame(main_frame, text="👀 미리보기", padding="10")
        preview_frame.grid(row=1, column=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.preview_label = ttk.Label(preview_frame, text="학생증을 생성하면\n여기에 미리보기가 표시됩니다", 
                                      background='white', relief='sunken', anchor='center')
        self.preview_label.grid(row=0, column=0, pady=(0, 10))
        
        # 저장된 파일 열기 버튼
        ttk.Button(preview_frame, text="📁 파일 열기", command=self.open_output_folder).grid(row=1, column=0)
        
        # 그리드 가중치 설정
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.columnconfigure(2, weight=1)
        main_frame.rowconfigure(1, weight=1)
        
        info_frame.columnconfigure(1, weight=1)
        
    def load_photos(self):
        """photos 폴더에서 사진들 로드"""
        photo_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp']
        self.photo_files = []
        
        for ext in photo_extensions:
            self.photo_files.extend(glob.glob(f"photos/{ext}"))
            self.photo_files.extend(glob.glob(f"photos/{ext.upper()}"))
        
        if self.photo_files:
            self.current_photo_index = 0
            self.show_current_photo()
        else:
            self.photo_label.config(text="photos 폴더에 사진이 없습니다\n사진을 추가해주세요")
            
    def show_current_photo(self):
        """현재 선택된 사진 표시"""
        if not self.photo_files:
            return
            
        try:
            # 현재 사진 경로
            self.current_photo_path = self.photo_files[self.current_photo_index]
            
            # 이미지 로드 및 리사이즈
            image = Image.open(self.current_photo_path)
            image = image.resize((200, 240), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.photo_image = ImageTk.PhotoImage(image)
            self.photo_label.config(image=self.photo_image, text="")
            
            # 사진 정보 업데이트
            filename = os.path.basename(self.current_photo_path)
            self.photo_info_label.config(text=f"{self.current_photo_index + 1}/{len(self.photo_files)}\n{filename}")
            
        except Exception as e:
            self.photo_label.config(text=f"사진 로드 실패:\n{str(e)}")
            
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
        file_path = filedialog.askopenfilename(
            title="사진 선택",
            filetypes=[
                ("이미지 파일", "*.jpg *.jpeg *.png *.gif *.bmp"),
                ("모든 파일", "*.*")
            ]
        )
        
        if file_path:
            # photos 폴더에 복사
            if not os.path.exists('photos'):
                os.makedirs('photos')
                
            filename = os.path.basename(file_path)
            new_path = f"photos/{filename}"
            
            try:
                # 이미지 열고 저장 (형식 변환 포함)
                image = Image.open(file_path)
                image.save(new_path, 'JPEG', quality=95)
                
                # 사진 목록 다시 로드
                self.load_photos()
                
                # 새로 추가된 사진으로 이동
                for i, photo in enumerate(self.photo_files):
                    if new_path in photo:
                        self.current_photo_index = i
                        break
                        
                self.show_current_photo()
                messagebox.showinfo("성공", f"사진이 추가되었습니다:\n{filename}")
                
            except Exception as e:
                messagebox.showerror("오류", f"사진 추가 실패:\n{str(e)}")
                
    def create_student_card(self):
        """학생증 생성"""
        # 입력 검증
        if not self.student_name.get().strip():
            messagebox.showerror("오류", "이름을 입력해주세요")
            return
            
        if not self.current_photo_path:
            messagebox.showerror("오류", "사진을 선택해주세요")
            return
            
        # 학생 데이터 준비
        student_data = {
            'name': self.student_name.get().strip(),
            'student_id': self.student_id.get().strip(),
            'photo_path': self.current_photo_path,
            'department': self.department.get().strip(),
            'grade': self.grade.get().strip(),
            'school_name': self.school_name.get().strip()
        }
        
        # 출력 폴더 생성
        if not os.path.exists('output'):
            os.makedirs('output')
            
        # 출력 파일 경로
        safe_name = "".join(c for c in student_data['name'] if c.isalnum() or c in (' ', '-', '_')).strip()
        output_path = f"output/{student_data['student_id']}_{safe_name}_학생증.png"
        
        try:
            # 학생증 생성
            success = self.printer.create_student_card(
                template_path='card_template.png',
                student_data=student_data,
                output_path=output_path
            )
            
            if success:
                # 미리보기 표시
                self.show_preview(output_path)
                messagebox.showinfo("성공", f"학생증이 생성되었습니다!\n\n파일: {output_path}")
            else:
                messagebox.showerror("오류", "학생증 생성에 실패했습니다")
                
        except Exception as e:
            messagebox.showerror("오류", f"학생증 생성 중 오류:\n{str(e)}")
            
    def show_preview(self, image_path):
        """생성된 학생증 미리보기 표시"""
        try:
            # 이미지 로드 및 리사이즈
            image = Image.open(image_path)
            # 미리보기 크기로 조정 (가로 200px 기준)
            aspect_ratio = image.height / image.width
            preview_width = 200
            preview_height = int(preview_width * aspect_ratio)
            image = image.resize((preview_width, preview_height), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.preview_image = ImageTk.PhotoImage(image)
            self.preview_label.config(image=self.preview_image, text="")
            
        except Exception as e:
            self.preview_label.config(text=f"미리보기 로드 실패:\n{str(e)}")
            
    def connect_printer(self):
        """프린터 연결"""
        available_ports = self.printer.find_available_ports()
        
        if not available_ports:
            messagebox.showwarning("알림", "사용 가능한 COM 포트가 없습니다.\nPointman N20 프린터를 연결해주세요.")
            return
            
        # 첫 번째 포트로 연결 시도
        self.printer.com_port = available_ports[0]
        
        if self.printer.connect_printer():
            messagebox.showinfo("성공", f"프린터 연결 성공!\n포트: {available_ports[0]}")
        else:
            messagebox.showerror("실패", "프린터 연결에 실패했습니다.")
            
    def open_output_folder(self):
        """출력 폴더 열기"""
        import subprocess
        import platform
        
        output_path = os.path.abspath('output')
        
        if not os.path.exists(output_path):
            os.makedirs(output_path)
            
        try:
            if platform.system() == 'Windows':
                subprocess.run(['explorer', output_path])
            elif platform.system() == 'Darwin':  # macOS
                subprocess.run(['open', output_path])
            else:  # Linux
                subprocess.run(['xdg-open', output_path])
        except Exception as e:
            messagebox.showerror("오류", f"폴더 열기 실패:\n{str(e)}")

def main():
    root = tk.Tk()
    app = StudentCardGUI(root)
    
    # 프로그램 종료 시 프린터 연결 해제
    def on_closing():
        app.printer.disconnect()
        root.destroy()
        
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()

