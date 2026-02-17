import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import TimeSlotPicker from "./pages/TimeSlotPicker";
import MoodExplorer from "./pages/MoodExplorer";
import MovieComparator from "./pages/MovieComparator";
import CastMixer from "./pages/CastMixer";
import GenreBlender from "./pages/GenreBlender";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./pages/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import AxiosInterceptor from "./components/AxiosInterceptor";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ToastProvider>
            <AxiosInterceptor />
            {/* ✅ Navbar visible on all pages */}
            <Navbar />

            {/* ✅ Main Content Area */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies/:sourceId" element={<MovieDetail />} />
                <Route path="/time-slot" element={<TimeSlotPicker />} />
                <Route path="/moods" element={<MoodExplorer />} />
                <Route path="/cast-mixer" element={<CastMixer />} />
                <Route path="/genre-blender" element={<GenreBlender />} />
                <Route path="/compare" element={<MovieComparator />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
        </ToastProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
