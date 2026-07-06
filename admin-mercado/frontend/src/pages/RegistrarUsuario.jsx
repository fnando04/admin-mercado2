import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegistrarUsuario.css';

export default function RegistrarUsuario() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    telefono: '',
    giroComercial: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tu BD guarda el nombre completo en un solo campo, así que lo unimos aquí
    const nombreCompleto = [formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno]
      .filter(Boolean)
      .join(' ');

    try {
      const respuesta = await fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreCompleto,
          correo: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          giro_comercial: formData.giroComercial,
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error || "No se pudo crear la cuenta");
        return;
      }

      alert(datos.mensaje || "Cuenta creada correctamente");
      navigate('/login');

    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="header-title-box">
            <h1>Registrar Locatario</h1>
            <i className="fa-regular fa-user"></i>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

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
              <label htmlFor="telefono">Teléfono</label>
              <div className="input-container">
                <i className="fa-solid fa-phone"></i>
                <input
                  type="text"
                  id="telefono"
                  placeholder="Tu número de contacto"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="giroComercial">Giro comercial</label>
              <div className="input-container">
                <i className="fa-solid fa-shop"></i>
                <input
                  type="text"
                  id="giroComercial"
                  placeholder="Ej. Verduras y Frutas"
                  value={formData.giroComercial}
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

          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            Tu cuenta se crea sin puesto asignado — un administrador te asignará uno después.
          </p>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Crear Cuenta</button>
            <Link to="/login" className="back-to-login">
              <i className="fa-solid fa-arrow-left"></i> Volver al inicio de sesión
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}