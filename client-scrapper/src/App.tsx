import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import CaseList from '@/components/cases/CaseList';
import CaseDetail from '@/components/cases/CaseDetail';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { Toaster } from './components/ui/sonner';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Authentication Routes */}
            <Route
              path="/login"
              element={
                <AppLayout requireAuth={false}>
                  <LoginPage />
                </AppLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AppLayout requireAuth={false}>
                  <SignupPage />
                </AppLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/cases"
              element={
                <AppLayout>
                  <CaseList />
                </AppLayout>
              }
            />
            <Route
              path="/changePassword"
              element={
                <AppLayout>
                  <ChangePasswordPage />
                </AppLayout>
              }
            />
            <Route
              path="/case/:caseNumber"
              element={
                <AppLayout>
                  <CaseDetail />
                </AppLayout>
              }
            />

            {/* Redirect root to cases page */}
            <Route path="/" element={<Navigate to="/cases" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/cases" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
      <Toaster position="top-right" />

    </AuthProvider>
  );
}

export default App;