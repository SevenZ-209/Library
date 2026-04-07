
# 🚀 Hướng dẫn chạy Backend (DigiLib API) dành cho Team Frontend

Tài liệu này được soạn ra để giúp các bạn phụ trách Frontend (Option 1) có thể tự setup Backend tại máy cá nhân, chạy server và dễ dàng lấy dữ liệu để ghép vào giao diện (Trang chủ, Tìm kiếm, Chi tiết sách...).

## 🛠 1. Môi trường cần chuẩn bị
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:
* **Python** (phiên bản 3.8 trở lên).
* **MySQL Server** (Có thể dùng XAMPP, MySQL Workbench, hoặc Laragon).

## 📥 2. Cài đặt và Chạy dự án (Chỉ mất 2 phút)

**Bước 1: Cài đặt các thư viện cần thiết**
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
pip install -r requirements.txt
Bước 2: Cấu hình Database

Bật MySQL của bạn lên và tạo một database trống có tên là librarydb.

Mở file DigiLib/settings.py. Tìm đến khối DATABASES và sửa lại USER, PASSWORD, PORT cho khớp với cấu hình MySQL trên máy bạn.

Bước 3: Khởi tạo các bảng trong Database
Chạy lần lượt 2 lệnh sau để Backend tự động tạo bảng:

Bash
python manage.py makemigrations
python manage.py migrate
Bước 4: Bơm dữ liệu mẫu (Rất quan trọng!)
Để Frontend có sẵn hình ảnh, sách, thể loại hiển thị lên Trang chủ mà không cần nhập tay, hãy chạy lệnh này:

Bash
python manage.py seed_data
(Lệnh này sẽ tự động tạo ra 50 cuốn sách, gán đầy đủ Tag, Thể loại và tạo 100 giao dịch mượn sách ảo).

Bước 5: Khởi động Server

Bash
python manage.py runserver
🎉 Server Backend sẽ chạy tại địa chỉ: http://127.0.0.1:8000/