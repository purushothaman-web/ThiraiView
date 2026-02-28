# 🎬 ThiraiView

ThiraiView is a modern, cinematic movie discovery platform designed to help users find the perfect movie for their current mood and time availability. Powered by **TMDB** and a custom **Node.js/Express** backend, it offers an immersive, theater-like experience with intelligent search, mood-based recommendations, and detailed movie insights.

## 🚀 Features

- **🎥 Cinematic Catalog**
  - Experience a fluid, glassmorphic UI with Ken Burns effects and seamless `framer-motion` page transitions.
  - Browse trending, popular, and top-rated collections.

- **🎭 Mood Explorer**
  - Find movies based on your mood (Happy, Sad, Tense, Exciting, Chill).
  - Customize by Energy Level (High/Low) and Pace (Fast/Slow).

- **⏳ Time Slot Picker**
  - Have a specific amount of time? Find movies that fit exactly into your schedule.
  - "I have 90 minutes" -> Get movies ~90 mins long.

- **🧬 Cinematic DNA Breakdown**
  - Deep analysis of contextual movie attributes (Action, Emotion, Tension, Thought, Lightheartedness) rendered in a glowing Radar chart.
  
- **🔀 Genre Blender & Cast Mixer**
  - Mix multiple genres or actors to uncover crossover films and shared cinematic universes.

- **⚔️ Movie Comparator**
  - Stack two movies head-to-head to compare their stats, runtime, and ratings.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, Axios
- **External API:** TMDB (The Movie Database)
- **Architectural Patterns:** Service-Repository pattern for organized backend logic

---

## 📂 Project Structure

```
ThiraiView/
├── Backend/           # Node.js API & Services
│   ├── config/        # Environment Configuration
│   ├── routes/        # API Routes (Catalog, Search)
│   ├── services/      # Business Logic (TMDB integration, Scoring)
│   └── server.js      # Entry Point
│
├── Frontend/          # React Application
│   ├── src/
│   │   ├── components/# Reusable Cinematic UI Components
│   │   ├── pages/     # Main Views (Home, MovieDetail, Explorers)
│   │   └── api/       # API Clients
│   └── index.css      # Core styles & CSS film grain
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
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

# Configure environment
cp .env.example .env

# Update TMDB_API_KEY in .env

# Start Server
npm start
```

### 3. Frontend Setup
```sh
cd ../Frontend
npm install

# Configure environment
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
