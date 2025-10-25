import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import VoterDashboard from './pages/VoterDashboard';
import ProfilePage from './pages/ProfilePage';
import CreateAdminPage from './pages/CreateAdminPage';
import CandidatesManagement from './pages/CandidatesManagement';
import VotersManagement from './pages/VotersManagement';
import ReportPage from './pages/ReportPage';
import NotFoundPage from './pages/NotFoundPage';
import { Container } from 'react-bootstrap';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <AppNavbar />
          <Container className="mt-5 main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voter"
                element={
                  <ProtectedRoute>
                    <VoterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-admin"
                element={
                  <ProtectedRoute>
                    <CreateAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates-management"
                element={
                  <ProtectedRoute>
                    <CandidatesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voters-management"
                element={
                  <ProtectedRoute>
                    <VotersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* Ruta catch-all para 404 - DEBE SER LA ÚLTIMA */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;