import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar               from './components/Navbar';
import Dashboard            from './pages/Dashboard';
import GestionLocatarios    from './pages/GestionLocatarios';
import GestionPagos         from './pages/GestionPagos';
import GestionPuestos       from './pages/GestionPuestos';
import Incidencias          from './pages/Incidencias';
import Login                from './pages/Login';
import RegistrarUsuario     from './pages/RegistrarUsuario';
import './styles/global.css';

// Páginas que NO muestran el navbar (login, registro)
const SIN_NAVBAR = ['/login', '/registro'];

function Layout({ children }) {
  return (
    <>
      <Routes>
        <Route path="/login"    element={null} />
        <Route path="/registro" element={null} />
        <Route path="*"         element={<Navbar />} />
      </Routes>
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <>
      {/* Navbar solo en páginas internas */}
      <Routes>
        <Route path="/login"    element={null} />
        <Route path="/registro" element={null} />
        <Route path="*"         element={<Navbar />} />
      </Routes>

      {/* Rutas de las vistas */}
      <Routes>
        <Route path="/"              element={<Navigate to="/login" replace />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/registro"      element={<RegistrarUsuario />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/locatarios"    element={<GestionLocatarios />} />
        <Route path="/pagos"         element={<GestionPagos />} />
        <Route path="/puestos"       element={<GestionPuestos />} />
        <Route path="/incidencias"   element={<Incidencias />} />
      </Routes>
    </>
  );
}
