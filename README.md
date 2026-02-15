# 🎬 ThiraiView

ThiraiView is a modern movie discovery platform designed to help users find the perfect movie for their current mood and time availability. Powered by **TMDB** and a custom **Node.js/Express** backend with **Prisma**, it offers intelligent search, mood-based recommendations, and detailed movie insights.

## 🚀 Features

- **🎥 Smart Movie Catalog**
  - Search movies by title with auto-complete.
  - Browse trending, popular, and top-rated collections.
  - Filter by region (e.g., Indian movies) and genre.

- **🎭 Mood-Based Discovery**
  - Find movies based on your mood (Happy, Sad, Tense, Exciting, Chill).
  - Customize by Energy Level (High/Low) and Pace (Fast/Slow).

- **⏳ Time Slot Picker**
  - Have a specific amount of time? Find movies that fit exactly into your schedule.
  - "I have 90 minutes" -> Get movies ~90 mins long.

- **🧬 Movie DNA**
  - Deep analysis of movie attributes (Action, Emotion, Tension, Thought, Lightheartedness).
  - Visual representation of what makes a movie tick.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Lucide Icons
- **Backend:** Node.js, Express
- **Database/ORM:** PostgreSQL, Prisma (for caching & logging)
- **External API:** TMDB (The Movie Database)
- **Architectural Patterns:** Service-Repository, Caching Layer

---

## 📂 Project Structure

```
ThiraiView/
├── Backend/           # Node.js API & Services
│   ├── config/        # Environment & App Config
│   ├── routes/        # API Routes (Catalog)
│   ├── services/      # Business Logic (TMDB, Search, Scoring)
│   ├── prisma/        # Database Schema & Cache Models
│   └── server.js      # Entry Point
│
├── Frontend/          # React Application
│   ├── src/
│   │   ├── components/# Reusable UI Components
│   │   ├── pages/     # Main Views (Home, Search, Detail)
│   │   └── services/  # API Clients
│   └── vite.config.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (for Prisma cache)
- TMDB API Key

### 1. Clone the Repository
```sh
git clone https://github.com/purushothaman-web/ThiraiView.git
cd ThiraiView
```

### 2. Backend Setup
```sh
cd Backend
npm install

# Configure .env
cp .env.example .env
# Update DATABASE_URL and TMDB_API_KEY in .env

# Run Migrations
npx prisma migrate dev

# Start Server
npm start
```

### 3. Frontend Setup
```sh
cd Frontend
npm install

# Configure .env
cp .env.example .env
# Update VITE_BACKEND_URL (default: http://localhost:5000)

# Start Dev Server
npm run dev
```

---

## 🔒 Environment Variables

**Backend (.env)**
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/thiraiview"
TMDB_API_KEY="your_tmdb_key"
TMDB_BASE_URL="https://api.themoviedb.org/3"
NODE_ENV="development"
```

**Frontend (.env)**
```env
VITE_BACKEND_URL="http://localhost:5000"
```

---

## 🧑‍💻 Author

**Purushothaman**  
Built with ❤️ for movie lovers.
