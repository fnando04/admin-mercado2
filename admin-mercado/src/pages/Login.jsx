import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [sesionActiva, setSesionActiva] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí después conectas con tu backend
    // Por ahora navega directo al dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <h1>Bienvenido</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope"></i>
              <input type="email" id="email" placeholder="ejemplo@correo.com" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="btn-toggle-pwd"
                title="Mostrar contraseña"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                <i className={`fa-regular ${mostrarPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit">Sign In</button>
        </form>

        <div className="links-row">
          <a href="#">¿Olvidaste tu contraseña?</a>
          <Link to="/registro" className="register-link">¿No tienes cuenta? Regístrate</Link>
        </div>

        <div className="session-footer">
          <label className="switch">
            <input
              type="checkbox"
              id="chkSesion"
              checked={sesionActiva}
              onChange={() => setSesionActiva(!sesionActiva)}
            />
            <span className="slider"></span>
          </label>
          <span className="session-text">Sesión Iniciada</span>
        </div>

      </div>
    </div>
  );
}
