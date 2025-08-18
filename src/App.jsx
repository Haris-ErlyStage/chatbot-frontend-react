// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import HomePage from './pages/HomePage/HomePage';
import FileManager from './components/FileManager/FileManager';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return !currentUser ? children : <Navigate to="/home" replace />;
};

function App() {
  const location = useLocation();

  // Routes where header & footer should be hidden (protected routes)
  const protectedRoutes = ["/home", "/files"];
  const shouldShowHeaderFooter = !protectedRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {shouldShowHeaderFooter && <Header />}
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          <Route path="/files" element={
            <ProtectedRoute>
              <FileManager />
            </ProtectedRoute>
          } />

          {/* Redirect all other routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {shouldShowHeaderFooter && <Footer />}
    </div>
  );
}

export default App;