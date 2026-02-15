# ThiraiView Backend API

The backend for ThiraiView, built with Express.js, Prisma, and TMDB integration. It serves as a comprehensive movie catalog API with search, caching, and recommendation features.

## 🚀 Key Features

- **Movie Discovery**: Search, filter, and browse movies via TMDB.
- **Intelligent Caching**: Prisma + PostgreSQL stores search results and movie details to reduce external API calls.
- **Mood Analysis**: Custom algorithm maps user moods (Happy, Sad, Tense) to movie genres and attributes.
- **Time Slot Matching**: Suggests movies that fit perfectly into a user's available time window.
- **DNA Scoring**: Calculates distinct attribute scores (Action, Emotion, Tension) for movies.

---

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure PostgreSQL is running and update `DATABASE_URL` in `.env`.
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Start Server**
   ```bash
   npm start
   # Server runs on port 5000 by default
   ```

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/thiraiview"
TMDB_API_KEY="your_tmdb_v3_key"
TMDB_BASE_URL="https://api.themoviedb.org/3"
NODE_ENV="development"
# Optional: VITE_BACKEND_URL for CORS
```

---

## 📡 API Endpoints

### 🔍 Catalog & Search

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/catalog/search` | Search movies by title | `q`, `page`, `region`, `year` |
| `GET` | `/catalog/autocomplete` | Quick search suggestions | `q` |
| `GET` | `/catalog/movies/:sourceId` | Get detailed movie info | `sourceId` (e.g., `tmdb:550`) |
| `GET` | `/catalog/collection/:type` | Get curated lists | `type` (`trending`, `top_rated`, `upcoming`, `action`, `comedy`, `indian`, `anime`) |

### 🎭 Recommendations & Discovery

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/catalog/moods` | Get movies by mood | `mood` (Happy, Sad...), `energy` (High/Low), `pace` (Fast/Slow) |
| `GET` | `/catalog/time-slot` | Find movies by duration | `minutesAvailable`, `region` |
| `GET` | `/catalog/dna/:sourceId` | Get movie attribute scores | `sourceId` |
| `GET` | `/catalog/multi` | Fetch multiple movies by ID | `ids` (comma-separated list of `tmdb:ID`) |

---

## 📦 Services

- **`catalogService.js`**: Core logic for searching, caching, and retrieving movie details.
- **`timeSlotService.js`**: Algorithms for matching movies to time constraints.
- **`tmdbClient.js`**: Axial client for TMDB API interactions.

