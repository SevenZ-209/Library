# =============================================
# DigiLib Backend - Dockerfile
# Django 6 + MySQL + Celery + RabbitMQ
# =============================================

FROM python:3.12-slim

# Cài các package hệ thống cần thiết cho mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài dependencies Python trước (tận dụng Docker layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code backend
COPY . .

# Tạo thư mục media nếu chưa có
RUN mkdir -p /app/media

EXPOSE 8000

# Entrypoint mặc định: chạy Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
