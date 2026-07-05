import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegistrarUsuario.css';

export default function RegistrarUsuario() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí después conectas con tu backend (POST a tu API de registro)
    // Por ahora navega directo al login tras "crear" la cuenta
    navigate('/');
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="header-title-box">
            <h1>Registrar Usuario</h1>
            <i className="fa-regular fa-user"></i>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="usuario">Usuario</label>
              <div className="input-container">
                <i className="fa-regular fa-id-badge"></i>
                <input
                  type="text"
                  id="usuario"
                  placeholder="Usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre(s)</label>
              <div className="input-container">
                <input
                  type="text"
                  id="nombre"
                  className="no-icon"
                  placeholder="Nombre(s)"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="apellidoPaterno">Apellido Paterno</label>
              <div className="input-container">
                <input
                  type="text"
                  id="apellidoPaterno"
                  className="no-icon"
                  placeholder="Apellido Paterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="apellidoMaterno">Apellido Materno</label>
              <div className="input-container">
                <input
                  type="text"
                  id="apellidoMaterno"
                  className="no-icon"
                  placeholder="Apellido Materno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-container">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <i className="fa-solid fa-lock"></i>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn-view-password"
                  title="Ver contraseña"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  <i className={`fa-regular ${mostrarPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Crear Cuenta</button>
            <Link to="/" className="back-to-login">
              <i className="fa-solid fa-arrow-left"></i> Volver al inicio de sesión
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
