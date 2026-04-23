# 🚀 Hướng dẫn chạy Backend (DigiLib API) dành cho Team Frontend

Tài liệu này được soạn ra để giúp các bạn phụ trách Frontend (Option 1) có thể tự setup Backend tại máy cá nhân, chạy server và dễ dàng lấy dữ liệu để ghép vào giao diện (Trang chủ, Tìm kiếm, Chi tiết sách...).

## 🛠 1. Môi trường cần chuẩn bị
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:
* **Python** (phiên bản 3.8 trở lên).
* **MySQL Server** (Có thể dùng XAMPP, MySQL Workbench, hoặc Laragon).
* **Docker** (Dành cho tính năng Celery/RabbitMQ của Backend).

## 📥 2. Cài đặt và Chạy dự án (Chỉ mất 2 phút)

### Bước 1: Cài đặt các thư viện cần thiết
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
pip install -r requirements.txt
```

### Bước 2: Cấu hình Database
Bật MySQL của bạn lên và tạo một database trống có tên là `librarydb`.

Mở file `DigiLib/DigiLib/settings.py`. Tìm đến khối `DATABASES` và sửa lại `USER`, `PASSWORD`, `PORT` cho khớp với cấu hình MySQL trên máy bạn.

### Bước 3: Khởi tạo các bảng trong Database
Chạy lần lượt 2 lệnh sau để Backend tự động tạo bảng:
```bash
cd DigiLib
python manage.py makemigrations
python manage.py migrate
```

### Bước 4: Bơm dữ liệu mẫu (Rất quan trọng!)
Để Frontend có sẵn hình ảnh, sách, thể loại hiển thị lên Trang chủ mà không cần nhập tay, hãy chạy lệnh này:
```bash
python manage.py seed_data
```
*(Lệnh này sẽ tự động tạo ra 50 cuốn sách, gán đầy đủ Tag, Thể loại và tạo 100 giao dịch mượn sách ảo).*

### Bước 5: Khởi động Server
```bash
python manage.py runserver
```
🎉 Server Backend sẽ chạy tại địa chỉ: `http://127.0.0.1:8000/`

---

## ⚙️ 3. Phần Bổ sung: Khởi động hệ thống Background Tasks (Celery & RabbitMQ)

*(Phần này do đội Backend - Option 3 đảm nhận, xử lý chức năng tự động gửi email nhắc nhở độc giả khi sách tới hạn hoặc quá hạn)*

Hệ thống sử dụng **Celery** và **RabbitMQ** chạy ngầm ở background. Nếu Team Frontend cần test tính năng này hoặc chạy full hệ thống, vui lòng làm thêm các bước sau:

### 3.1. Khởi động RabbitMQ
Sử dụng Docker để bật container RabbitMQ:
```bash
docker start my-rabbit
```
*(Nếu máy chưa có container, hãy tạo mới bằng: `docker run -d --name my-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management`)*

### 3.2. Cấu hình Email
Kiểm tra file `DigiLib/DigiLib/settings.py` (ở cuối file) để đảm bảo đã cấu hình App Password cho `thuvien.digilib@gmail.com` để hệ thống có thể gửi email thực tế.

### 3.3. Chạy Celery Worker (Người xử lý gửi mail)
Mở một terminal mới (phải activate môi trường ảo `venv`) và chạy:
```bash
cd DigiLib
celery -A DigiLib worker --loglevel=info --pool=solo
```

### 3.4. Chạy Celery Beat (Bộ lập lịch)
Mở thêm một terminal khác (activate `venv`) và chạy:
```bash
cd DigiLib
celery -A DigiLib beat --loglevel=info
```
*(Lưu ý: Mặc định Beat sẽ chạy mỗi ngày 1 lần vào lúc 8h sáng để quét database và gửi email).*

### 3.5. Danh sách API Endpoints (Nghiệp vụ Mượn/Trả sách)
Các API này được viết kèm Transaction để đảm bảo tự động cập nhật số lượng sách tồn kho chính xác:
- `POST /api/borrower/`: Độc giả gửi phiếu mượn (tự động trừ tồn kho).
- `GET /api/borrower/`: Lấy danh sách phiếu mượn.
- `POST /api/borrower/{id}/confirm-pickup/`: Thủ thư xác nhận giao sách.
- `POST /api/borrower/{id}/return/`: Thủ thư nhận lại sách (tự động cộng hoàn tồn kho).