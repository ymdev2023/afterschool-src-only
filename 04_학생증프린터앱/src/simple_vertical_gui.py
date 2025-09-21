"""
간단한 세로 학생증 GUI - 안정성 우선 버전
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import glob

def create_simple_gui():
    """간단한 세로 학생증 GUI"""
    
    root = tk.Tk()
    root.title("📱 간단한 세로 학생증 제작")
    root.geometry("800x600")
    root.configure(bg='#f0f0f0')
    
    # 변수들
    student_name = tk.StringVar()
    student_id = tk.StringVar()
    department = tk.StringVar()
    grade = tk.StringVar()
    school_name = tk.StringVar()
    orientation = tk.StringVar()
    
    # 기본값
    student_id.set("20240001")
    department.set("컴퓨터공학과")
    grade.set("3학년")
    school_name.set("테크 대학교")
    orientation.set("portrait")
    
    # 사진 관련
    photo_files = []
    current_photo_index = [0]  # 리스트로 감싸서 참조 가능하게
    current_photo_path = [""]
    
    def load_photos():
        """사진 로드"""
        nonlocal photo_files
        photo_extensions = ['*.jpg', '*.jpeg', '*.png']
        photo_files = []
        
        for ext in photo_extensions:
            photo_files.extend(glob.glob(f"photos/{ext}"))
            photo_files.extend(glob.glob(f"photos/{ext.upper()}"))
        
        if photo_files:
            current_photo_index[0] = 0
            current_photo_path[0] = photo_files[0]
            photo_label.config(text=f"사진: {os.path.basename(photo_files[0])}")
        else:
            photo_label.config(text="photos 폴더에 사진이 없습니다")
    
    def prev_photo():
        """이전 사진"""
        if photo_files and len(photo_files) > 1:
            current_photo_index[0] = (current_photo_index[0] - 1) % len(photo_files)
            current_photo_path[0] = photo_files[current_photo_index[0]]
            photo_label.config(text=f"사진 {current_photo_index[0]+1}/{len(photo_files)}: {os.path.basename(current_photo_path[0])}")
    
    def next_photo():
        """다음 사진"""
        if photo_files and len(photo_files) > 1:
            current_photo_index[0] = (current_photo_index[0] + 1) % len(photo_files)
            current_photo_path[0] = photo_files[current_photo_index[0]]
            photo_label.config(text=f"사진 {current_photo_index[0]+1}/{len(photo_files)}: {os.path.basename(current_photo_path[0])}")
    
    def create_card():
        """학생증 생성"""
        if not student_name.get().strip():
            messagebox.showerror("오류", "이름을 입력해주세요")
            return
            
        if not current_photo_path[0]:
            messagebox.showerror("오류", "사진을 선택해주세요")
            return
        
        try:
            from pointman_card_printer import PointmanCardPrinter
            
            printer = PointmanCardPrinter()
            
            student_data = {
                'name': student_name.get().strip(),
                'student_id': student_id.get().strip(),
                'photo_path': current_photo_path[0],
                'department': department.get().strip(),
                'grade': grade.get().strip(),
                'school_name': school_name.get().strip()
            }
            
            if not os.path.exists('output'):
                os.makedirs('output')
            
            safe_name = "".join(c for c in student_data['name'] if c.isalnum() or c in (' ', '-', '_')).strip()
            orientation_text = "세로" if orientation.get() == "portrait" else "가로"
            output_path = f"output/{student_data['student_id']}_{safe_name}_{orientation_text}_학생증.png"
            
            status_label.config(text="학생증 생성 중...")
            root.update()
            
            success = printer.create_student_card(
                template_path='card_template.png',
                student_data=student_data,
                output_path=output_path,
                orientation=orientation.get()
            )
            
            if success:
                status_label.config(text="✅ 학생증 생성 완료!")
                messagebox.showinfo("성공", f"{orientation_text} 학생증이 생성되었습니다!\n\n파일: {output_path}")
            else:
                status_label.config(text="❌ 생성 실패")
                messagebox.showerror("오류", "학생증 생성에 실패했습니다")
                
        except Exception as e:
            status_label.config(text="❌ 오류 발생")
            messagebox.showerror("오류", f"학생증 생성 중 오류:\n{str(e)}")
    
    def print_card():
        """학생증 인쇄"""
        create_card()  # 먼저 생성
        
        try:
            import win32api
            
            safe_name = "".join(c for c in student_name.get() if c.isalnum() or c in (' ', '-', '_')).strip()
            orientation_text = "세로" if orientation.get() == "portrait" else "가로"
            output_path = f"output/{student_id.get()}_{safe_name}_{orientation_text}_학생증.png"
            
            if os.path.exists(output_path):
                abs_path = os.path.abspath(output_path)
                result = win32api.ShellExecute(0, "print", abs_path, None, ".", 0)
                
                if result > 32:
                    status_label.config(text="✅ 인쇄 명령 전송!")
                    messagebox.showinfo("성공", "인쇄 명령이 전송되었습니다!")
                else:
                    status_label.config(text="❌ 인쇄 실패")
                    messagebox.showerror("실패", f"인쇄 실패 (코드: {result})")
            else:
                messagebox.showerror("오류", "인쇄할 파일이 없습니다")
                
        except Exception as e:
            messagebox.showerror("오류", f"인쇄 중 오류:\n{str(e)}")
    
    # UI 구성
    main_frame = ttk.Frame(root, padding="20")
    main_frame.pack(fill=tk.BOTH, expand=True)
    
    # 제목
    title_label = ttk.Label(main_frame, text="📱 간단한 세로 학생증 제작", font=('Arial', 18, 'bold'))
    title_label.pack(pady=(0, 20))
    
    # 사진 선택
    photo_frame = ttk.LabelFrame(main_frame, text="📸 사진 선택", padding="10")
    photo_frame.pack(fill=tk.X, pady=(0, 10))
    
    photo_label = ttk.Label(photo_frame, text="사진을 로드 중...")
    photo_label.pack(pady=5)
    
    photo_btn_frame = ttk.Frame(photo_frame)
    photo_btn_frame.pack(pady=5)
    
    ttk.Button(photo_btn_frame, text="◀ 이전", command=prev_photo).pack(side=tk.LEFT, padx=5)
    ttk.Button(photo_btn_frame, text="다음 ▶", command=next_photo).pack(side=tk.LEFT, padx=5)
    ttk.Button(photo_btn_frame, text="🔄 새로고침", command=load_photos).pack(side=tk.LEFT, padx=5)
    
    # 방향 선택
    orientation_frame = ttk.LabelFrame(main_frame, text="📐 방향 선택", padding="10")
    orientation_frame.pack(fill=tk.X, pady=(0, 10))
    
    ttk.Radiobutton(orientation_frame, text="📱 세로", variable=orientation, value="portrait").pack(side=tk.LEFT, padx=10)
    ttk.Radiobutton(orientation_frame, text="💳 가로", variable=orientation, value="landscape").pack(side=tk.LEFT, padx=10)
    
    # 학생 정보
    info_frame = ttk.LabelFrame(main_frame, text="✏️ 학생 정보", padding="10")
    info_frame.pack(fill=tk.X, pady=(0, 10))
    
    # 2열 그리드
    ttk.Label(info_frame, text="이름:").grid(row=0, column=0, sticky=tk.W, padx=(0, 10), pady=5)
    ttk.Entry(info_frame, textvariable=student_name, font=('Arial', 11)).grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5)
    
    ttk.Label(info_frame, text="학번:").grid(row=0, column=2, sticky=tk.W, padx=(20, 10), pady=5)
    ttk.Entry(info_frame, textvariable=student_id, font=('Arial', 11)).grid(row=0, column=3, sticky=(tk.W, tk.E), pady=5)
    
    ttk.Label(info_frame, text="학과:").grid(row=1, column=0, sticky=tk.W, padx=(0, 10), pady=5)
    ttk.Entry(info_frame, textvariable=department, font=('Arial', 11)).grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
    
    ttk.Label(info_frame, text="학년:").grid(row=1, column=2, sticky=tk.W, padx=(20, 10), pady=5)
    ttk.Combobox(info_frame, textvariable=grade, values=["1학년", "2학년", "3학년", "4학년"], state="readonly").grid(row=1, column=3, sticky=(tk.W, tk.E), pady=5)
    
    ttk.Label(info_frame, text="학교명:").grid(row=2, column=0, sticky=tk.W, padx=(0, 10), pady=5)
    ttk.Entry(info_frame, textvariable=school_name, font=('Arial', 11)).grid(row=2, column=1, columnspan=3, sticky=(tk.W, tk.E), pady=5)
    
    info_frame.columnconfigure(1, weight=1)
    info_frame.columnconfigure(3, weight=1)
    
    # 버튼들
    button_frame = ttk.Frame(main_frame)
    button_frame.pack(fill=tk.X, pady=10)
    
    ttk.Button(button_frame, text="🎓 학생증 생성", command=create_card, style='Accent.TButton').pack(side=tk.LEFT, padx=(0, 10))
    ttk.Button(button_frame, text="🖨️ 바로 인쇄", command=print_card).pack(side=tk.LEFT, padx=10)
    
    # 상태 표시
    status_label = ttk.Label(main_frame, text="준비됨", font=('Arial', 10))
    status_label.pack(pady=10)
    
    # 초기 사진 로드
    load_photos()
    
    print("✅ GUI가 성공적으로 시작되었습니다!")
    root.mainloop()

if __name__ == "__main__":
    print("🚀 간단한 세로 학생증 GUI 시작...")
    create_simple_gui()
