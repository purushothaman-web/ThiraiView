import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
  const location = useLocation();

  return (
    <ErrorBoundary>
      <div className="film-grain"></div>
      <div className="min-h-screen flex flex-col bg-transparent text-[#eeeeee] transition-colors duration-300 relative z-10 w-full overflow-x-hidden">
        <ToastProvider>
            <AxiosInterceptor />
            <Navbar />
            
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies/:sourceId" element={<MovieDetail />} />
                  <Route path="/time-slot" element={<TimeSlotPicker />} />
                  <Route path="/moods" element={<MoodExplorer />} />
                  <Route path="/cast-mixer" element={<CastMixer />} />
                  <Route path="/genre-blender" element={<GenreBlender />} />
                  <Route path="/compare" element={<MovieComparator />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
            
        </ToastProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
