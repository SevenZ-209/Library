# 📚 DigiLib — Hệ thống Quản lý Thư viện Số

DigiLib là hệ thống quản lý thư viện hiện đại gồm **Backend REST API** (Django) và **Frontend SPA** (React + Vite), tích hợp tác vụ nền tự động (Celery + RabbitMQ) để gửi email nhắc nhở khi sách sắp đến hạn hoặc quá hạn trả.

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
├── .github/workflows/          # CI/CD Pipelines (Backend, Frontend, Docker)
├── docker-compose.yml          # Orchestration toàn bộ hệ thống
├── .env.docker.example         # Mẫu biến môi trường
├── DigiLib/                    # Django Backend
│   ├── Dockerfile
│   ├── .env                    # Secrets (bị gitignore)
│   ├── requirements.txt
│   ├── backup_thuvien.json     # Fixture dữ liệu thật
│   ├── DigiLib/                # Config Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── celery.py
│   └── digilib_core/           # App chính
│       ├── models.py           # User, Book, BorrowRecord, Notification...
│       ├── views.py            # API ViewSets
│       ├── serializers.py
│       ├── tasks.py            # Celery tasks (gửi email)
│       └── urls.py
└── digilib-frontend/           # React Frontend (Vite + TS)
    ├── Dockerfile
    ├── nginx.conf              # Cấu hình Nginx cho SPA
    ├── src/
    │   ├── pages/              # Tổ chức theo tính năng (Feature-based)
    │   │   ├── home/           # Giao diện chính + CSS Module
    │   │   ├── auth/           # Đăng nhập/Đăng ký
    │   │   ├── collections/    # Quản lý bộ sưu tập
    │   │   └── ...
    │   ├── components/         # UI Components dùng chung
    │   ├── styles/             # Global CSS & Design Tokens
    │   └── services/           # API Services (Axios)
    └── package.json
```

---

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