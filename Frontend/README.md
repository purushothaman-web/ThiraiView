# ThiraiView Frontend

The frontend for ThiraiView, a React application built with Vite and TailwindCSS for a modern, responsive movie discovery experience.

## 🚀 Features

- **Home Page**: Showcases trending, popular, and top-rated movies in a visually immersive layout.
- **Advanced Search**: Find movies by title, year, or genre with instant suggestions.
- **Time Slot Picker**: Unique feature to find movies that fit your exact time availability.
- **Mood Selector**: Discover movies based on your current mood and energy level.
- **Movie Details**: View comprehensive info, cast, and "Movie DNA" analysis.

---

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Set up your `.env` file:
   ```env
   VITE_BACKEND_URL="http://localhost:5000"
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 📂 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/            # Generic UI elements (Toast, Button, Modal)
│   ├── SearchBar.jsx  # Main search component
│   ├── MovieCard.jsx  # Standard movie display card
│   └── TimeSlotPicker.jsx # Time-based discovery tool
│
├── pages/             # Page components
│   ├── HomePage.jsx   # Landing page
│   ├── Catalog.jsx    # Search results & filtering
│   ├── MovieDetail.jsx # Detailed movie view
│   └── MoodSelector.jsx # Mood-based discovery
│
├── services/          # API integration
│   └── api.js         # Axios instance & endpoints
│
└── App.jsx            # Main application router
```

---

## 🎨 Styling

- **TailwindCSS**: Used for rapid UI development and responsive design.
- **Lucide React**: Provides the icon set used throughout the application.
- **Google Fonts**: Uses 'Outfit' for headings and 'Inter' for body text.

