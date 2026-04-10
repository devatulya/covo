import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Feed & Core
import { Feed } from './pages/Feed';
import { Explore } from './pages/Explore';
import { CreatePost } from './pages/CreatePost';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// Auth Pages (Placeholder exports for now, creating next)
import { Landing } from './pages/auth/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Routes */}
        {!isAuthenticated && (
          <>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </>
        )}

        {/* Authenticated Routes */}
        {isAuthenticated && (
          <>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Route>
            {/* Settings is usually outside the bottom nav layout, or full screen */}
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
