import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { CreatePost } from './pages/CreatePost';
import { Explore } from './pages/Explore';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Landing } from './pages/auth/Landing';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { useAuthStore } from './store/authStore';
import { useUiStore } from './store/uiStore';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, user, loading, initAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    initAuth: state.initAuth,
  }));
  const initializeTheme = useUiStore((state) => state.initializeTheme);

  React.useEffect(() => {
    initializeTheme();
    initAuth();
  }, [initializeTheme, initAuth]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neoBg">
        <div className="text-xl font-black uppercase text-neoText animate-pulse">Loading COVO...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NotificationsModal />

      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/profile" element={<Navigate to={`/profile/${user?.id ?? 'me'}`} replace />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/landing'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
