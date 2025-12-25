// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieDetail from "./pages/MovieDetail";
import Navbar from "./components/Navbar";
import AddMovie from "./pages/AddMovie";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Watchlist from './pages/Watchlist';
import VerifyEmail from "./components/VerifyEmail";
import VerifyPending from "./components/VerifyPending";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/Policy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./pages/ErrorBoundary";
import UserFeed from "./components/UserFeed";
import Notifications from "./components/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import SuperuserDashboard from "./components/SuperuserDashboard";
import UserProfile from "./pages/UserProfile";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmDialogProvider } from "./components/ui/ConfirmDialog";




function App() {
  return (

    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ToastProvider>
          <ConfirmDialogProvider>
            {/* ✅ Navbar visible on all pages */}
            <Navbar />

            {/* ✅ Main Content Area - Pushes Footer down & Clears Fixed Navbar */}
            <main className="flex-grow pt-20">
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
                <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/superuser-dashboard" element={<PrivateRoute><SuperuserDashboard /></PrivateRoute>} />
                <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/feed" element={<PrivateRoute><UserFeed /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/verify/:token" element={<VerifyEmail />} />
                <Route path="/verify-pending" element={<VerifyPending />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer removed as per user request */}
          </ConfirmDialogProvider>
        </ToastProvider>
      </div>
    </ErrorBoundary>

  );
}

export default App;
