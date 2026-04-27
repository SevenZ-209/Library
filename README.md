# 📚 DigiLib — Hệ thống Quản lý Thư viện Số

DigiLib là hệ thống quản lý thư viện hiện đại gồm **Backend REST API** (Django) và **Frontend SPA** (React + Vite), tích hợp tác vụ nền tự động (Celery + RabbitMQ) để gửi email nhắc nhở khi sách sắp đến hạn hoặc quá hạn trả.

---

## 👥 Thành viên nhóm

| STT | MSSV | Họ tên | Vai trò |
|:---:|---|---|---|
| 1 | 2351010175 | Nguyễn Trần Minh Quân | Xây dựng Frontend, UI/UX & Tính năng tìm kiếm |
| 2 | 2351010099 | Lê Minh Đăng Khoa | Xây dựng API Backend, Database & Quản trị hệ thống |
| 3 | 2351010124 | Lê Duy Mạnh | Thiết lập DevOps, RabbitMQ & Tác vụ chạy ngầm |

---

## 💻 Công nghệ sử dụng

- **Backend:** Python, Django 6, Django REST Framework
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Database:** MySQL 8.0
- **Message Queue & Workers:** RabbitMQ, Celery
- **Container & Deploy:** Docker, Docker Compose
- **CI/CD Pipelines:** GitHub Actions

---

## 🏗️ Kiến trúc hệ thống

| Service | Mô tả | Port |
|---|---|---|
| `frontend` | React 19 + Vite + TailwindCSS, serve bởi Nginx | `80` |
| `backend` | Django 6 REST API + Admin | `8000` |
| `db` | MySQL 8.0 | `3307` (host) |
| `rabbitmq` | Message broker + Management UI | `5672`, `15672` |
| `celery_worker` | Xử lý tác vụ nền (gửi email) | — |
| `celery_beat` | Lập lịch tự động (8h sáng mỗi ngày) | — |

---

## 🚀 Cách 1: Chạy bằng Docker (Khuyến nghị)

### Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop) đã cài và đang chạy

### Bước 1 — Cấu hình biến môi trường

File `DigiLib/.env` chứa toàn bộ secrets. Đảm bảo file này có đủ các biến sau:

```ini
# Django
SECRET_KEY=<your-secret-key>
DEBUG=True

# Database (MySQL root password)
DB_PASSWORD=<mysql-password>

# Cloudinary (lưu ảnh bìa sách)
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Email SMTP (Gmail App Password)
# Tạo App Password tại: https://myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=<your-email>@gmail.com
EMAIL_HOST_PASSWORD=<16-char-app-password>
```

> ⚠️ File `.env` đã được `.gitignore` — **không bao giờ commit file này lên git**.

### Bước 2 — Build và khởi động

```bash
cd Library/
docker compose up --build -d
```

> Lần đầu mất ~5–10 phút để build image và pull MySQL/RabbitMQ.  
> MySQL khởi tạo chậm trên Windows (~3–4 phút) — đây là bình thường.

### Bước 3 — Load dữ liệu

Có 2 lựa chọn:

**Option A — Dữ liệu thật** *(khuyến nghị — sách thật có ảnh Cloudinary)*:
```bash
docker exec digilib_backend python manage.py flush --noinput
docker exec digilib_backend python manage.py loaddata backup_thuvien.json
```

**Option B — Dữ liệu giả** *(nhanh, dùng để demo)*:
```bash
docker exec digilib_backend python manage.py seed_data
```

### Bước 4 — Truy cập hệ thống

| Địa chỉ | Mô tả |
|---|---|
| `http://localhost` | **Frontend** React |
| `http://localhost:8000/api/` | **Backend** REST API |
| `http://localhost:8000/admin/` | **Django Admin** (Jazzmin) |
| `http://localhost:8000/swagger/` | **Swagger** API Docs |
| `http://localhost:15672` | **RabbitMQ** Management UI |

> **Quan trọng:** MySQL Docker dùng port `3307` (không phải `3306`) để không đụng MySQL local.  
> Kết nối bằng MySQL client: `host=localhost`, `port=3307`, `user=root`, `password=<DB_PASSWORD>`

### Lệnh quản lý Docker

```bash
# Xem trạng thái các container
docker compose ps

# Xem log real-time
docker compose logs -f

# Xem log của một service cụ thể
docker compose logs -f backend

# Dừng hệ thống (giữ nguyên database)
docker compose down

# Dừng và XÓA toàn bộ data (reset sạch)
docker compose down -v

# Restart một service
docker compose restart backend
```

---

## 👤 Tài khoản mặc định

### Khi dùng `backup_thuvien.json`

| Username | Password | Role | Ghi chú |
|---|---|---|---|
| `admin` | *(cần đặt lại)* | Admin/Superuser | Chạy: `docker exec -it digilib_backend python manage.py changepassword admin` |
| `thuthu` | `1` | Librarian (Thủ thư) | Tài khoản test |
| `lekhoa` | `1` | Reader (Độc giả) | Tài khoản test |
| `doc_gia_test` | *(đặt lúc setup)* | Reader | Email: `test.001.digilib@gmail.com`, có 2 phiếu **quá hạn** để test thông báo |

### Khi dùng `seed_data`

| Username | Password | Role |
|---|---|---|
| `khach_hang_test` | `1` | Reader |

---

## 🧪 Test chức năng thông báo email (Demo)

File `backup_thuvien.json` đã chứa sẵn 2 phiếu mượn sách đang mượn (`borrowed`) nhưng **đã lùi ngày để giả lập quá hạn**. Tài khoản nhận là `doc_gia_test` (email: `test.001.digilib@gmail.com`). 

Để demo cho giảng viên xem hệ thống bắt được phiếu quá hạn và gửi email ngay lập tức (thay vì chờ đến 8h sáng mai), hãy chạy 2 lệnh sau:

**Bước 1: Nạp lại Database mẫu (để chắc chắn 2 phiếu mượn giả lập xuất hiện)**
```powershell
docker exec digilib_backend python manage.py flush --noinput
docker exec digilib_backend python manage.py loaddata backup_thuvien.json
```

**Bước 2: Ép hệ thống quét quá hạn và gửi email**
```powershell
docker exec digilib_backend python manage.py shell -c "from digilib_core.tasks import check_overdue_books_and_notify; check_overdue_books_and_notify()"
```

Hệ thống sẽ quét, đổi trạng thái 2 phiếu thành `overdue` và tự động gửi 2 email báo quá hạn đến `test.001.digilib@gmail.com`.
Hoặc có thể dùng lệnh để ép trạng thái sách về borrow và trễ 2 ngày
```powershell
docker exec -it digilib_backend python manage.py shell -c "from digilib_core.models import BorrowRecord; from django.utils import timezone; from datetime import timedelta; r=BorrowRecord.objects.get(pk=<id_phieu_muon>); r.status='borrowed'; r.due_date=timezone.now()-timedelta(days=2); r.save();
docker exec -it digilib_backend python manage.py shell -c "from digilib_core.tasks import check_overdue_books_and_notify; check_overdue_books_and_notify.delay()"
```
Kiểm tra bằng
docker compose logs -f celery_worker
*(Ghi chú: Trong môi trường thực tế, Celery Beat sẽ tự động gọi hàm quét này mỗi ngày lúc 8h sáng).*

---

## 🧪 Chạy Unit Test bằng Docker

Dự án đã được thiết lập sẵn một service đặc biệt trong `docker-compose.yml` để chạy test (Kiểm thử tự động) mà không cần cài đặt môi trường Python local:

```bash
docker compose --profile test up test_runner
```
Lệnh này sẽ tự động chạy toàn bộ các bài Unit Test cho Backend (kiểm tra phân quyền, tạo danh mục, mượn trả sách, v.v.) bên trong môi trường Docker an toàn.

---

## 🛠️ Cách 2: Chạy Local (Development)

### Yêu cầu
- Python 3.10+
- MySQL Server (XAMPP, Laragon, hoặc MySQL Workbench)
- Node.js 20+

### Backend

```bash
# 1. Tạo virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 2. Cài thư viện
cd DigiLib
pip install -r requirements.txt

# 3. Tạo database MySQL tên 'librarydb', sau đó chạy migration
python manage.py migrate

# 4. Load dữ liệu (chọn 1 trong 2)
python manage.py loaddata backup_thuvien.json   # dữ liệu thật
# hoặc
python manage.py seed_data                       # dữ liệu giả

# 5. Khởi động server
python manage.py runserver

# 6. Chạy Unit Test (Tùy chọn)
python manage.py test
```

Backend chạy tại: `http://127.0.0.1:8000/`

### Frontend

```bash
cd digilib-frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173/`

### Celery Worker & Beat *(tính năng gửi email)*

```bash
# Terminal 1 — RabbitMQ (dùng Docker)
docker run -d --name my-rabbit -p 5672:5672 rabbitmq:3-management

# Terminal 2 — Celery Worker
cd DigiLib
celery -A DigiLib worker --loglevel=info --pool=solo

# Terminal 3 — Celery Beat
cd DigiLib
celery -A DigiLib beat --loglevel=info
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/token/` | Đăng nhập, lấy JWT token |
| `POST` | `/api/token/refresh/` | Refresh JWT token |
| `POST` | `/api/users/` | Đăng ký tài khoản mới |

### Sách & Danh mục
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/books/` | Danh sách sách (hỗ trợ filter, search) |
| `GET` | `/api/books/{id}/` | Chi tiết một cuốn sách |
| `GET` / `POST` | `/api/category/` | Danh sách thể loại / Tạo thể loại mới (Admin/Thủ thư) |
| `GET` | `/api/tags/` | Danh sách tags |
| `GET` | `/api/collection/` | Danh sách các Bộ sưu tập sách |
| `GET` | `/api/collection/{id}/` | Chi tiết một Bộ sưu tập |

### Mượn / Trả sách *(có Transaction, tự động cập nhật tồn kho)*
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/borrower/` | Độc giả gửi phiếu mượn |
| `GET` | `/api/borrower/` | Danh sách phiếu mượn của tôi |
| `POST` | `/api/borrower/{id}/confirm-pickup/` | Thủ thư xác nhận giao sách |
| `POST` | `/api/borrower/{id}/return/` | Thủ thư nhận lại sách |

### Bộ sưu tập (Collections)
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/collection/` | Danh sách các bộ sưu tập công khai |
| `POST` | `/api/collection/` | Tạo bộ sưu tập mới (Admin/Thủ thư) |
| `GET` | `/api/collection/featured/` | Lấy danh sách bộ sưu tập nổi bật |
| `GET` | `/api/collection/{id}/` | Chi tiết bộ sưu tập và danh sách sách bên trong |
| `PATCH` | `/api/collection/{id}/` | Chỉnh sửa tên, mô tả hoặc ảnh bìa bộ sưu tập |
| `POST` | `/api/collection/{id}/add-book/` | Thêm một cuốn sách vào bộ sưu tập |
| `POST` | `/api/collection/{id}/remove-book/` | Rút một cuốn sách khỏi bộ sưu tập |

### Thống kê & Thông báo
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/notifications/` | Thông báo của người dùng |
| `POST` | `/api/notifications/mark-all-read/` | Đánh dấu tất cả đã đọc |
| `GET` | `/api/books/dashboard-stats/` | Thống kê tổng quan (Admin) |

> 📖 Xem đầy đủ tại Swagger UI: `http://localhost:8000/swagger/`

---

## 📁 Cấu trúc dự án

```
Library/
├── .github/workflows/          # Cấu hình CI/CD Pipelines (GitHub Actions)
├── docs/                       # Tài liệu kiến trúc và quyết định kỹ thuật
├── docker-compose.yml          # Cấu hình Orchestration cho môi trường cục bộ
├── backend/                    # Mã nguồn Backend (Django REST Framework)
│   ├── DigiLib/                # Cấu hình cốt lõi của Server
│   ├── digilib_core/           # Ứng dụng nghiệp vụ chính (Business Logic)
│   ├── backup_thuvien.json     # Dữ liệu sao lưu (Backup)
│   ├── Dockerfile              # Kịch bản đóng gói Docker cho Backend
│   └── requirements.txt        # Danh sách thư viện Python phụ thuộc
└── digilib-frontend/           # Mã nguồn Frontend (React + TypeScript + Vite)
    ├── public/                 # Tài nguyên tĩnh công khai (Icons, Favicon)
    ├── src/                    # Mã nguồn chính của ứng dụng Web
    │   ├── assets/             # Tài nguyên tĩnh (Hình ảnh)
    │   ├── components/         # Các UI component dùng chung và đặc thù
    │   ├── hooks/              # Custom React Hooks
    │   ├── lib/                # Các hàm tiện ích (Utility functions)
    │   ├── pages/              # Giao diện chia theo cụm tính năng
    │   ├── services/           # Lớp giao tiếp gọi API
    │   ├── stores/             # Lớp quản lý trạng thái toàn cục
    │   ├── styles/             # Quản lý CSS và hiệu ứng chuyển động
    │   └── types/              # Định nghĩa kiểu dữ liệu (TypeScript Interfaces)
    ├── nginx.conf              # Cấu hình Web Server Nginx để phục vụ Frontend
    ├── vite.config.ts          # Cấu hình công cụ Build Vite
    └── Dockerfile              # Kịch bản đóng gói Docker cho Frontend

```


## ⚙️ Tính năng nổi bật

- 🔐 **JWT Authentication** — Bảo mật API với SimpleJWT
- 📧 **Email tự động** — Celery + RabbitMQ gửi email khi sách sắp/đã quá hạn
- 🖼️ **Lưu ảnh Cloudinary** — Upload ảnh bìa sách lên cloud
- 📊 **Admin Dashboard** — Jazzmin theme đẹp cho Django Admin
- 📖 **Swagger UI** — Tài liệu API tự động
- 🐳 **Docker Ready** — Chạy toàn bộ hệ thống bằng 1 lệnh
- 🔄 **Transaction** — Mượn/trả sách an toàn với database transaction
- 🤖 **CI/CD Pipeline** — 3 luồng GitHub Actions tự động build Frontend & test Backend
- 📚 **Bộ sưu tập (Collections)** — Quản lý và gom nhóm sách theo chủ đề nổi bật
- 🎨 **Modern UI/UX** — Giao diện được tối ưu hóa với Material Symbols, thiết kế theo chuẩn Modern Web và cấu trúc mã nguồn Feature-based chuyên nghiệp.


## 📚 Tài liệu tham khảo
- API Documentation (Swagger): http://localhost:8000/swagger/
- Tài liệu Kiến trúc (ADRs): Xem tại thư mục docs/adrs/
- Mã nguồn Backend: Thư mục backend/
- Mã nguồn Frontend: Thư mục digilib-frontend/
