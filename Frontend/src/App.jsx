// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar"; // ✅ Use Navbar component
import AddMovie from "./pages/AddMovie";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Watchlist from './pages/Watchlist';
import VerifyEmail from "./components/VerifyEmail";
import VerifyPending from "./components/VerifyPending";



function App() {
  return (
    <div>
      {/* ✅ Navbar visible on all pages */}
      <Navbar />

      {/* ✅ Define all routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/add-movie" element={<AddMovie />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
                <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
  <Route path="/verify-pending" element={<VerifyPending />} />
      </Routes>
    </div>
  );
}

export default App;
