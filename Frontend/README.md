# ThiraiView Frontend

The frontend for ThiraiView, a cinematic React application built with Vite, Tailwind CSS, and Framer Motion for a modern, immersive movie discovery experience.

## 🚀 Features

- **Cinematic UI**: A dark-themed, glassmorphic design inspired by premium streaming experiences with smooth Ken Burns effects and subtle film grain.
- **Fluid Animations**: Page transitions, staggered lists, and micro-interactions powered by `framer-motion`.
- **Movie Comparator**: Stack two movies head-to-head to compare their stats, runtime, and ratings.
- **Cast Mixer**: Select multiple actors to uncover their shared cinematic universe.
- **Genre Blender**: Mix and match genres to discover unique crossover films.
- **Mood Explorer**: Find movies that perfectly align with your current emotional state and energy.
- **Time Slot Picker**: Tell us exactly how much time you have, and we'll find movies that fit perfectly.
- **Cinematic DNA**: View a detailed radar chart breaking down a movie's unique thematic fingerprint and pacing.
- **Advanced Search**: Global search overlay to find movies by title, actor, or keyword instantly.

---

## 🛠️ Stack & Technologies

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS (with custom font imports and glassmorphic utilities)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **API Client**: Axios (configured with base URL and interceptors)
- **Typography**: `Outfit` (Headings) and `Inter` (Body) via Google Fonts.

---

## ⚙️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Duplicate `.env.example` to `.env` (if applicable) or set up your `.env` file manually:
   ```env
   VITE_BACKEND_URL="http://localhost:5000"
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # The app runs on http://localhost:5174 (or 5173 depending on Vite config)
   ```

---

## 📂 Project Structure

```
src/
├── api/               # Axios instance configuration
├── components/        # Reusable UI elements (Navbar, MovieCards, RadarChart, etc.)
├── pages/             # Main route views
│   ├── Home.jsx             # Landing page with trending rows
│   ├── MovieDetail.jsx      # Deep dive into a movie + DNA
│   ├── MoodExplorer.jsx     # Mood-based movie discovery
│   ├── GenreBlender.jsx     # Custom genre mixing
│   ├── CastMixer.jsx        # Actor crossover search
│   ├── MovieComparator.jsx  # Head-to-head stats
│   └── TimeSlotPicker.jsx   # Exact runtime matching
│
├── App.jsx            # Routing and AnimatePresence setup
├── index.css          # Global styles, Tailwind directives, and film grain
└── main.jsx           # App entry point
```

---

## 🎨 Design Philosophy

ThiraiView moves away from standard grid-based catalogs toward a "theater-like" experience. Key principles include:
- **Depth & Lighting**: Utilizing drop shadows, glowing accents (`text-brand-yellow`), and backdrop blurs to create a sense of space.
- **Motion as Context**: Using animations not just for flair, but to guide the user's eye and provide spatial awareness during navigation.
- **Bold Typography**: High-contrast, uppercase tracking for section headers to evoke movie posters and title sequences.
