"""
세로 학생증 제작 GUI - 사진 선택 개선 버전
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk
import os
import glob
from pointman_card_printer import PointmanCardPrinter
import win32print
import win32api

class VerticalCardGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("📱 세로 학생증 제작 프로그램")
        self.root.geometry("1000x700")
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
        self.orientation = tk.StringVar()
        
        # 기본값 설정
        self.student_id.set("20240001")
        self.department.set("컴퓨터공학과")
        self.grade.set("3학년")
        self.school_name.set("테크 대학교")
        self.orientation.set("portrait")  # 세로 기본값
        
        self.setup_ui()
        self.load_photos()
        
    def setup_ui(self):
        """UI 구성"""
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 제목
        title_label = ttk.Label(main_frame, text="📱 세로 학생증 제작 프로그램", 
                               font=('Arial', 20, 'bold'))
        title_label.grid(row=0, column=0, columnspan=4, pady=(0, 20))
        
        # 왼쪽 패널 - 사진 선택 (개선된 버전)
        photo_frame = ttk.LabelFrame(main_frame, text="📸 사진 선택", padding="15")
        photo_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # 사진 표시 영역 (더 큰 크기)
        self.photo_label = ttk.Label(photo_frame, text="사진을 로드 중...", 
                                    background='white', relief='sunken')
        self.photo_label.grid(row=0, column=0, columnspan=4, pady=(0, 15), ipady=20)
        
        # 사진 네비게이션 (더 큰 버튼들)
        nav_frame = ttk.Frame(photo_frame)
        nav_frame.grid(row=1, column=0, columnspan=4, pady=(0, 10))
        
        ttk.Button(nav_frame, text="◀◀ 처음", command=self.first_photo, width=8).grid(row=0, column=0, padx=2)
        ttk.Button(nav_frame, text="◀ 이전", command=self.prev_photo, width=8).grid(row=0, column=1, padx=2)
        
        self.photo_info_label = ttk.Label(nav_frame, text="1/6", font=('Arial', 12, 'bold'))
        self.photo_info_label.grid(row=0, column=2, padx=15)
        
        ttk.Button(nav_frame, text="다음 ▶", command=self.next_photo, width=8).grid(row=0, column=3, padx=2)
        ttk.Button(nav_frame, text="끝 ▶▶", command=self.last_photo, width=8).grid(row=0, column=4, padx=2)
        
        # 사진 관리 버튼들
        photo_btn_frame = ttk.Frame(photo_frame)
        photo_btn_frame.grid(row=2, column=0, columnspan=4, pady=(10, 0))
        
        ttk.Button(photo_btn_frame, text="📁 사진 추가", command=self.add_photo).grid(row=0, column=0, padx=5)
        ttk.Button(photo_btn_frame, text="🗑️ 사진 삭제", command=self.delete_photo).grid(row=0, column=1, padx=5)
        ttk.Button(photo_btn_frame, text="🔄 새로고침", command=self.load_photos).grid(row=0, column=2, padx=5)
        
        # 중간 패널 - 학생 정보 입력
        info_frame = ttk.LabelFrame(main_frame, text="✏️ 학생 정보", padding="15")
        info_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # 방향 선택
        ttk.Label(info_frame, text="카드 방향:").grid(row=0, column=0, sticky=tk.W, pady=5)
        orientation_frame = ttk.Frame(info_frame)
        orientation_frame.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=(10, 0))
        
        ttk.Radiobutton(orientation_frame, text="📱 세로", variable=self.orientation, 
                       value="portrait").grid(row=0, column=0, padx=(0, 10))
        ttk.Radiobutton(orientation_frame, text="💳 가로", variable=self.orientation, 
                       value="landscape").grid(row=0, column=1)
        
        # 학생 정보 입력 필드들
        ttk.Label(info_frame, text="이름:").grid(row=1, column=0, sticky=tk.W, pady=8)
        name_entry = ttk.Entry(info_frame, textvariable=self.student_name, font=('Arial', 12))
        name_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=8, padx=(10, 0))
        name_entry.focus()  # 포커스 설정
        
        ttk.Label(info_frame, text="학번:").grid(row=2, column=0, sticky=tk.W, pady=8)
        ttk.Entry(info_frame, textvariable=self.student_id, font=('Arial', 12)).grid(row=2, column=1, sticky=(tk.W, tk.E), pady=8, padx=(10, 0))
        
        ttk.Label(info_frame, text="학과:").grid(row=3, column=0, sticky=tk.W, pady=8)
        ttk.Entry(info_frame, textvariable=self.department, font=('Arial', 12)).grid(row=3, column=1, sticky=(tk.W, tk.E), pady=8, padx=(10, 0))
        
        ttk.Label(info_frame, text="학년:").grid(row=4, column=0, sticky=tk.W, pady=8)
        grade_combo = ttk.Combobox(info_frame, textvariable=self.grade, 
                                  values=["1학년", "2학년", "3학년", "4학년"], state="readonly")
        grade_combo.grid(row=4, column=1, sticky=(tk.W, tk.E), pady=8, padx=(10, 0))
        
        ttk.Label(info_frame, text="학교명:").grid(row=5, column=0, sticky=tk.W, pady=8)
        ttk.Entry(info_frame, textvariable=self.school_name, font=('Arial', 12)).grid(row=5, column=1, sticky=(tk.W, tk.E), pady=8, padx=(10, 0))
        
        # 생성 및 인쇄 버튼들
        btn_frame = ttk.Frame(info_frame)
        btn_frame.grid(row=6, column=0, columnspan=2, pady=(20, 10))
        
        ttk.Button(btn_frame, text="🎓 학생증 생성", 
                  command=self.create_student_card, 
                  style='Accent.TButton').grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Button(btn_frame, text="🖨️ 바로 인쇄", 
                  command=self.print_directly).grid(row=1, column=0, padx=(0, 5), sticky=(tk.W, tk.E))
        
        ttk.Button(btn_frame, text="🔧 프린터 연결", 
                  command=self.connect_printer).grid(row=1, column=1, padx=(5, 0), sticky=(tk.W, tk.E))
        
        # 오른쪽 패널 - 미리보기
        preview_frame = ttk.LabelFrame(main_frame, text="👀 미리보기", padding="15")
        preview_frame.grid(row=1, column=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.preview_label = ttk.Label(preview_frame, text="학생증을 생성하면\n여기에 미리보기가 표시됩니다", 
                                      background='white', relief='sunken', anchor='center')
        self.preview_label.grid(row=0, column=0, pady=(0, 15), ipady=30)
        
        # 미리보기 제어 버튼들
        preview_btn_frame = ttk.Frame(preview_frame)
        preview_btn_frame.grid(row=1, column=0)
        
        ttk.Button(preview_btn_frame, text="📁 파일 열기", command=self.open_output_folder).grid(row=0, column=0, pady=5)
        ttk.Button(preview_btn_frame, text="💾 다른 이름 저장", command=self.save_as).grid(row=1, column=0, pady=5)
        
        # 하단 상태 표시
        status_frame = ttk.Frame(main_frame)
        status_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(10, 0))
        
        self.status_label = ttk.Label(status_frame, text="준비됨", font=('Arial', 10))
        self.status_label.grid(row=0, column=0, sticky=tk.W)
        
        self.printer_status_label = ttk.Label(status_frame, text="프린터: 확인 중...", font=('Arial', 10))
        self.printer_status_label.grid(row=0, column=1, sticky=tk.E)
        
        # 그리드 가중치 설정
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.columnconfigure(2, weight=1)
        main_frame.rowconfigure(1, weight=1)
        
        info_frame.columnconfigure(1, weight=1)
        btn_frame.columnconfigure(0, weight=1)
        btn_frame.columnconfigure(1, weight=1)
        
        # 초기 프린터 상태 확인
        self.root.after(1000, self.update_printer_status)
        
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
            self.update_status(f"{len(self.photo_files)}개의 사진을 로드했습니다")
        else:
            self.photo_label.config(text="photos 폴더에 사진이 없습니다\n사진을 추가해주세요")
            self.update_status("사진이 없습니다")
            
    def show_current_photo(self):
        """현재 선택된 사진 표시"""
        if not self.photo_files:
            return
            
        try:
            # 현재 사진 경로
            self.current_photo_path = self.photo_files[self.current_photo_index]
            
            # 이미지 로드 및 리사이즈 (더 큰 크기로)
            image = Image.open(self.current_photo_path)
            image = image.resize((250, 300), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.photo_image = ImageTk.PhotoImage(image)
            self.photo_label.config(image=self.photo_image, text="")
            
            # 사진 정보 업데이트
            filename = os.path.basename(self.current_photo_path)
            self.photo_info_label.config(text=f"{self.current_photo_index + 1}/{len(self.photo_files)}\n{filename}")
            
        except Exception as e:
            self.photo_label.config(text=f"사진 로드 실패:\n{str(e)}")
            
    def first_photo(self):
        """첫 번째 사진으로 이동"""
        if self.photo_files:
            self.current_photo_index = 0
            self.show_current_photo()
            
    def last_photo(self):
        """마지막 사진으로 이동"""
        if self.photo_files:
            self.current_photo_index = len(self.photo_files) - 1
            self.show_current_photo()
            
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
            title="사진 선택 (여러 개 선택 가능)",
            filetypes=[
                ("이미지 파일", "*.jpg *.jpeg *.png *.gif *.bmp"),
                ("모든 파일", "*.*")
            ]
        )
        
        if file_paths:
            # photos 폴더에 복사
            if not os.path.exists('photos'):
                os.makedirs('photos')
                
            added_count = 0
            for file_path in file_paths:
                try:
                    filename = os.path.basename(file_path)
                    new_path = f"photos/{filename}"
                    
                    # 이미지 열고 저장 (형식 변환 포함)
                    image = Image.open(file_path)
                    image.save(new_path, 'JPEG', quality=95)
                    added_count += 1
                    
                except Exception as e:
                    messagebox.showerror("오류", f"사진 추가 실패: {filename}\n{str(e)}")
            
            if added_count > 0:
                # 사진 목록 다시 로드
                self.load_photos()
                messagebox.showinfo("성공", f"{added_count}개의 사진이 추가되었습니다")
                
    def delete_photo(self):
        """현재 사진 삭제"""
        if not self.current_photo_path:
            messagebox.showwarning("경고", "삭제할 사진이 없습니다")
            return
            
        filename = os.path.basename(self.current_photo_path)
        result = messagebox.askyesno("확인", f"'{filename}' 사진을 삭제하시겠습니까?")
        
        if result:
            try:
                os.remove(self.current_photo_path)
                self.load_photos()
                self.update_status(f"'{filename}' 삭제 완료")
            except Exception as e:
                messagebox.showerror("오류", f"사진 삭제 실패:\n{str(e)}")
                
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
        orientation_text = "세로" if self.orientation.get() == "portrait" else "가로"
        output_path = f"output/{student_data['student_id']}_{safe_name}_{orientation_text}_학생증.png"
        
        try:
            self.update_status("학생증 생성 중...")
            
            # 학생증 생성
            success = self.printer.create_student_card(
                template_path='card_template.png',
                student_data=student_data,
                output_path=output_path,
                orientation=self.orientation.get()
            )
            
            if success:
                # 미리보기 표시
                self.show_preview(output_path)
                self.update_status("학생증 생성 완료!")
                messagebox.showinfo("성공", f"{orientation_text} 학생증이 생성되었습니다!\n\n파일: {output_path}")
            else:
                self.update_status("학생증 생성 실패")
                messagebox.showerror("오류", "학생증 생성에 실패했습니다")
                
        except Exception as e:
            self.update_status("오류 발생")
            messagebox.showerror("오류", f"학생증 생성 중 오류:\n{str(e)}")
            
    def show_preview(self, image_path):
        """생성된 학생증 미리보기 표시"""
        try:
            # 이미지 로드 및 리사이즈
            image = Image.open(image_path)
            
            # 미리보기 크기 계산 (세로/가로에 따라 다르게)
            if self.orientation.get() == "portrait":
                # 세로 카드: 높이 300px 기준으로 조정
                preview_height = 300
                aspect_ratio = image.width / image.height
                preview_width = int(preview_height * aspect_ratio)
            else:
                # 가로 카드: 폭 300px 기준으로 조정
                preview_width = 300
                aspect_ratio = image.height / image.width
                preview_height = int(preview_width * aspect_ratio)
                
            image = image.resize((preview_width, preview_height), Image.Resampling.LANCZOS)
            
            # tkinter용 이미지로 변환
            self.preview_image = ImageTk.PhotoImage(image)
            self.preview_label.config(image=self.preview_image, text="")
            
        except Exception as e:
            self.preview_label.config(text=f"미리보기 로드 실패:\n{str(e)}")
            
    def print_directly(self):
        """바로 인쇄"""
        # 먼저 학생증 생성
        self.create_student_card()
        
        # 생성된 파일이 있다면 인쇄
        safe_name = "".join(c for c in self.student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
        orientation_text = "세로" if self.orientation.get() == "portrait" else "가로"
        output_path = f"output/{self.student_id.get()}_{safe_name}_{orientation_text}_학생증.png"
        
        if os.path.exists(output_path):
            try:
                self.update_status("인쇄 중...")
                
                # Windows API로 인쇄
                abs_path = os.path.abspath(output_path)
                result = win32api.ShellExecute(0, "print", abs_path, None, ".", 0)
                
                if result > 32:
                    self.update_status("인쇄 명령 전송 완료")
                    messagebox.showinfo("성공", "인쇄 명령이 전송되었습니다!\n프린터를 확인해주세요.")
                else:
                    self.update_status("인쇄 실패")
                    messagebox.showerror("실패", f"인쇄 실패 (코드: {result})")
                    
            except Exception as e:
                self.update_status("인쇄 오류")
                messagebox.showerror("오류", f"인쇄 중 오류:\n{str(e)}")
        
    def connect_printer(self):
        """프린터 연결"""
        try:
            printers = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
            pointman_printers = [p[2] for p in printers if "POINTMAN" in p[2].upper()]
            
            if not pointman_printers:
                messagebox.showwarning("알림", "POINTMAN 프린터를 찾을 수 없습니다.\n프린터를 연결하고 드라이버를 설치해주세요.")
                return
                
            printer_name = pointman_printers[0]
            
            # 프린터 상태 확인
            hprinter = win32print.OpenPrinter(printer_name)
            info = win32print.GetPrinter(hprinter, 2)
            status = info['Status']
            win32print.ClosePrinter(hprinter)
            
            if status == 0:
                messagebox.showinfo("성공", f"프린터 연결 성공!\n프린터: {printer_name}\n상태: Ready")
                self.update_printer_status()
            else:
                messagebox.showwarning("경고", f"프린터가 연결되었지만 상태가 Ready가 아닙니다.\n상태 코드: {status}")
                
        except Exception as e:
            messagebox.showerror("오류", f"프린터 연결 확인 실패:\n{str(e)}")
            
    def update_printer_status(self):
        """프린터 상태 업데이트"""
        try:
            printers = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
            pointman_printers = [p[2] for p in printers if "POINTMAN" in p[2].upper()]
            
            if pointman_printers:
                printer_name = pointman_printers[0]
                hprinter = win32print.OpenPrinter(printer_name)
                info = win32print.GetPrinter(hprinter, 2)
                status = info['Status']
                win32print.ClosePrinter(hprinter)
                
                if status == 0:
                    self.printer_status_label.config(text="프린터: ✅ Ready", foreground='green')
                else:
                    self.printer_status_label.config(text=f"프린터: ⚠️ 상태 {status}", foreground='orange')
            else:
                self.printer_status_label.config(text="프린터: ❌ 없음", foreground='red')
                
        except:
            self.printer_status_label.config(text="프린터: ❓ 확인 불가", foreground='gray')
            
    def update_status(self, message):
        """상태 메시지 업데이트"""
        self.status_label.config(text=message)
        self.root.update()
        
    def save_as(self):
        """다른 이름으로 저장"""
        if hasattr(self, 'preview_image'):
            file_path = filedialog.asksaveasfilename(
                title="학생증 저장",
                defaultextension=".png",
                filetypes=[("PNG 파일", "*.png"), ("모든 파일", "*.*")]
            )
            
            if file_path:
                try:
                    # 현재 미리보기의 원본 이미지 저장
                    safe_name = "".join(c for c in self.student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
                    orientation_text = "세로" if self.orientation.get() == "portrait" else "가로"
                    source_path = f"output/{self.student_id.get()}_{safe_name}_{orientation_text}_학생증.png"
                    
                    if os.path.exists(source_path):
                        image = Image.open(source_path)
                        image.save(file_path)
                        messagebox.showinfo("성공", f"학생증이 저장되었습니다:\n{file_path}")
                    else:
                        messagebox.showerror("오류", "저장할 학생증이 없습니다. 먼저 학생증을 생성해주세요.")
                        
                except Exception as e:
                    messagebox.showerror("오류", f"저장 실패:\n{str(e)}")
        else:
            messagebox.showwarning("경고", "저장할 학생증이 없습니다. 먼저 학생증을 생성해주세요.")
            
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
    app = VerticalCardGUI(root)
    
    # 프로그램 종료 시 프린터 연결 해제
    def on_closing():
        try:
            app.printer.disconnect()
        except:
            pass
        root.destroy()
        
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == "__main__":
    main()
