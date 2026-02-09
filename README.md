# Social Network Application

Dự án mạng xã hội full-stack sử dụng **NestJS** (Backend) và **Next.js** (Frontend).

---

## 🚀 Quick Start với Docker Compose

### Bước 1: Clone repository

```bash
git clone https://github.com/XuanKhanhHoang/Social-Network.git
cd Social-Network
```

### Bước 2: Tạo file cấu hình

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị của bạn:

```env
# MongoDB
MONGO_PORT=27017

# Backend
BACKEND_PORT=3001
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Cloudinary (đăng ký tại https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mail (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@socialnetwork.com

# Frontend
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Bước 3: Build và chạy

```bash
docker-compose up -d --build
```

### Bước 4: Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
---

## 🔑 Lấy API Keys

### Gmail App Password

1. Bật **2-Step Verification**: https://myaccount.google.com/security
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Chọn "Mail" → Copy 16 ký tự password

### Cloudinary

1. Đăng ký tại: https://cloudinary.com
2. Vào Dashboard → Lấy Cloud Name, API Key, API Secret

---
