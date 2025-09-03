# 🎬 ThiraiView

ThiraiView is a full-stack movie platform for exploring movies, posting reviews, managing watchlists, and interacting with other users.  
Built with **React (Vite) + TailwindCSS (frontend)** and **Node.js + Express + Prisma + PostgreSQL (backend)**.

---

## 🚀 Features

- **Authentication**
  - JWT-based signup & login
  - Email verification flow
  - Profile with picture, username, bio, and verified badge

- **Movies**
  - Add, view, update, delete movies (with posters)
  - Poster uploads (JPEG, PNG, WebP)
  - Pagination, search, filter, and sorting

- **Reviews**
  - Add/edit/delete reviews
  - Like/unlike reviews
  - Show user details on reviews

- **Watchlist**
  - Add/remove movies
  - Mark as watched/unwatched

- **User Profile**
  - Upload profile picture
  - Update bio and username
  - View added movies, reviews, and watchlist

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Context API
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT (Access & Refresh tokens)
- **Email:** SMTP (Mailtrap for dev)
- **Storage:** Local uploads

---

## 📂 Project Structure

```
ThiraiView/
├── Backend/           # Node.js + Express API
│   ├── controllers/   # Route handlers
│   ├── generated/     # Prisma client
│   ├── middleware/    # Auth & uploads
│   ├── prisma/        # Prisma schema & migrations
│   ├── routes/        # API routes
│   ├── uploads/       # Uploaded files (movies, profiles)
│   ├── server.js      # Backend entry point
│   └── .env           # Backend environment variables
│
├── Frontend/          # React (Vite) app
│   ├── src/           # App code
│   ├── public/        # Static assets
│   ├── vite.config.js
│   └── .env           # Frontend environment variables
└── readme.md          #
```

---

## ⚙️ Environment Variables

### Backend (`Backend/.env`)
```env
# Core
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:2343@localhost:5432/postgres"

# Auth
JWT_SECRET="your_jwt_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="30d"

# URLs
FRONTEND_URL="http://localhost:5173"
APP_BASE_URL="http://localhost:3000"
ASSETS_BASE_URL="http://localhost:3000"

# Upload directories
MOVIE_UPLOADS_DIR="uploads/movies"
PROFILE_UPLOADS_DIR="uploads/profiles"

# Email (Mailtrap for dev)
MAIL_HOST="sandbox.smtp.mailtrap.io"
MAIL_PORT=587
MAIL_USER="your_user"
MAIL_PASS="your_pass"
EMAIL_FROM="no-reply@thiraiview.com"
```

### Frontend (`Frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

---

## 🖥️ Setup Instructions

1. **Clone the repo**
   ```sh
   git clone https://github.com/FrontEndExplorer-Temp/ThiraiView.git
   cd ThiraiView
   ```

2. **Install dependencies**
   - Backend:
     ```sh
     cd Backend
     npm install
     ```
   - Frontend:
     ```sh
     cd ../Frontend
     npm install
     ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` in both `Backend/` and `Frontend/`
   - Fill in values (database, JWT secrets, email configs, etc.)

4. **Setup database**
   ```sh
   cd Backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the project**
   - Backend:
     ```sh
     cd Backend
     npm start
     ```
   - Frontend:
     ```sh
     cd Frontend
     npm run dev
     ```

- Backend → http://localhost:3000  
- Frontend → http://localhost:5173

---


## 🔒 Security Best Practices

- Use HTTPS in production
- Add CORS whitelist for `FRONTEND_URL`
- Rate-limit API requests
- Use Helmet for secure headers
- Rotate JWT secrets if compromised

---

## 🧑‍💻 Author

ThiraiView Team  
🚀 Built with ❤️ for movie lovers
