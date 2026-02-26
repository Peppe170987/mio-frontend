import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- IMPORT PAGINE ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrainerDashboard from './pages/TrainerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientManagement from './pages/ClientManagement'; 
import WorkoutDetail from './pages/WorkoutDetail'; 
import TrainerProfile from './pages/TrainerProfile'; 
import ClientProfile from './pages/ClientProfile'; 
import TrainerRequests from './pages/TrainerRequests'; // Verifica che il file esista in /pages

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotte Pubbliche */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-cliente" element={<LoginPage />} />
          <Route path="/login-trainer" element={<LoginPage />} />
          <Route path="/registrati" element={<RegisterPage />} />

          {/* --- ROTTE TRAINER --- */}
          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute requiredUserType="trainer">
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/client-management/:clientId"
            element={
              <ProtectedRoute requiredUserType="trainer">
                <ClientManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trainer-profile"
            element={
              <ProtectedRoute requiredUserType="trainer">
                <TrainerProfile />
              </ProtectedRoute>
            }
          />

          {/* ROTTA RICHIESTE: Gestisce sia cambio esercizi che nuove schede */}
          <Route
            path="/trainer-requests"
            element={
              <ProtectedRoute requiredUserType="trainer">
                <TrainerRequests />
              </ProtectedRoute>
            }
          />

          {/* --- ROTTE CLIENTE --- */}
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute requiredUserType="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workout-plan/:id"
            element={
              <ProtectedRoute requiredUserType="client">
                <WorkoutDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client-profile"
            element={
              <ProtectedRoute requiredUserType="client">
                <ClientProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback per rotte non trovate */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;