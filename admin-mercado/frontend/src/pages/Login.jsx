import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");


  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [sesionActiva, setSesionActiva] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const respuesta = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo,
        password
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.message);
      return;
    }

    // Guardar información del usuario
    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.user));

    alert("Bienvenido " + datos.user.nombre);

    if (datos.user.rol === "administrador") {
      navigate("/dashboard");
    } else {
      navigate("/locatario/inicio");
    }

  } catch (error) {
    console.error(error);
    alert("No se pudo conectar con el servidor.");
  }
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
              <input
                type="email"
                id="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
