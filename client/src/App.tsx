import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext'; // <-- Importa el proveedor
import AppNavbar from './components/Navbar'; // <-- Importa el Navbar
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { Container } from 'react-bootstrap';
import ProtectedRoute from './components/ProtectedRoutes';
import CampaignDetailPage from './pages/CampaignDetailPage'; // <-- Importa la nueva página

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Container className="mt-5">
          <Routes>
            {/* 👇 Esta es la ruta que ahora está protegida 👇 */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            {/* 👇 Ruta protegida para detalle de campaña 👇 */}
            <Route
              path="/campaign/:id"
              element={
                <ProtectedRoute>
                  <CampaignDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;