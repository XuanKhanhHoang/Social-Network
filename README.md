<div align="center">
  <h1>🚀 Full-Stack Social Network Application</h1>
  
  <p>
    A modern, feature-rich social networking platform built with <strong>Next.js</strong>, <strong>NestJS</strong>, <strong>MongoDB</strong>, and <strong>Docker</strong>.
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-api-keys-guide">API Keys Guide</a>
  </p>
</div>

---

## ✨ Features

- **User Authentication**: Secure JWT-based login, registration, and refresh tokens.
- **Real-time Interactions**: Live chat and instant notifications powered by Socket.io.
- **Media Management**: Seamless image and media uploads using Cloudinary integrations.
- **Email Notifications**: Automated emails via Nodemailer (SMTP/Gmail).
- **Responsive UI**: Next.js frontend delivering an optimal experience across all devices.
- **Containerized Environment**: Fully Dockerized for a smooth and consistent development workflow.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/)
- **State Management & UI:** React setup with optimized rendering
- **Deployment:** Vercel (optional)

### Backend
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Real-time Engine:** [Socket.io](https://socket.io/)
- **Authentication:** Passport.js, JWT, Bcrypt
- **File Uploads:** Multer, Fluent-FFmpeg, Cloudinary

### DevOps
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Git](https://git-scm.com/)
- [Docker & Docker Compose](https://www.docker.com/)
- Node.js (if running locally outside Docker containers)

### 1. Clone the Repository

```bash
git clone https://github.com/XuanKhanhHoang/Social-Network.git
cd Social-Network
```

### 2. Configure Environment Variables

Create a new `.env` file based on the provided template:

```bash
cp .env.example .env
```

Open the `.env` file and populate it with your specific details (see the [Environment Variables](#-environment-variables) section below for details).

### 3. Build and Run via Docker

Start the entire application stack (Frontend, Backend, and MongoDB) with a single command:

```bash
docker-compose up -d --build
```

### 4. Access the Application

Once the containers are successfully running, you can access the services here:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## ⚙️ Environment Variables

Ensure the following variables are correctly configured in your `.env` file:

```env
# Database
MONGO_PORT=27017

# Backend Configuration
BACKEND_PORT=3001
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mail Service (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@socialnetwork.com

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🔑 API Keys Guide

If you need help getting the required third-party API keys, follow these quick instructions:

### Gmail App Password (for `MAIL_PASS`)
1. Go to your Google Account and enable [2-Step Verification](https://myaccount.google.com/security).
2. Navigate to [App Passwords](https://myaccount.google.com/apppasswords).
3. Select "Mail" and generate a new app password.
4. Copy the 16-character string into your `.env` file.

### Cloudinary Credentials
1. Register for a free account at [Cloudinary](https://cloudinary.com).
2. Go to your Dashboard.
3. Copy your `Cloud Name`, `API Key`, and `API Secret` into your `.env` file.

---

<div align="center">
  <i>Developed with ❤️ by <a href="https://github.com/XuanKhanhHoang">XuanKhanhHoang</a></i>
</div>
