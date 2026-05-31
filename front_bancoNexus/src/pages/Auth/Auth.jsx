import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Auth.css";

export default function Auth({ setUsuario }) {
  const [esRegistro, setEsRegistro] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const [errores, setErrores] = useState({});
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [mostrarPasswordRegistro, setMostrarPasswordRegistro] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (esRegistro && !formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!formulario.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!regexCorreo.test(formulario.correo)) {
      nuevosErrores.correo = "Ingresa un correo válido";
    }

    if (!formulario.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (formulario.password.length < 8) {
      nuevosErrores.password = "Debe contener al menos 8 caracteres";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const iniciarSesion = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setUsuario({
      nombre: "Usuario",
      correo: formulario.correo,
    });
  };

  const registrarse = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setUsuario({
      nombre: formulario.nombre,
      correo: formulario.correo,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          className="auth-forms"
          style={{
            justifyContent: esRegistro ? "flex-start" : "flex-end",
          }}
        >
          <AnimatePresence mode="wait">
            {esRegistro ? (
              <motion.form
                key="registro"
                onSubmit={registrarse}
                className="form-box"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Registro</h2>

                <div className="field">
                  <label htmlFor="nombre">Nombre</label>

                  <div className="input-wrap">
                    <User size={16} className="input-icon" />

                    <input
                      id="nombre"
                      type="text"
                      name="nombre"
                      placeholder="Ingrese su nombre"
                      onChange={handleChange}
                      value={formulario.nombre}
                      className={errores.nombre ? "input-error" : ""}
                    />
                  </div>

                  {errores.nombre && (
                    <span className="error-text">{errores.nombre}</span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="correo-r">Correo</label>

                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" />

                    <input
                      id="correo-r"
                      type="email"
                      name="correo"
                      placeholder="ejemplo@correo.com"
                      onChange={handleChange}
                      value={formulario.correo}
                      className={errores.correo ? "input-error" : ""}
                    />
                  </div>

                  {errores.correo && (
                    <span className="error-text">{errores.correo}</span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password-r">Contraseña</label>

                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />

                    <input
                      id="password-r"
                      type={mostrarPasswordRegistro ? "text" : "password"}
                      name="password"
                      placeholder="Crea una contraseña"
                      onChange={handleChange}
                      value={formulario.password}
                      className={errores.password ? "input-error" : ""}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setMostrarPasswordRegistro(!mostrarPasswordRegistro)
                      }
                    >
                      {mostrarPasswordRegistro ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errores.password && (
                    <span className="error-text">{errores.password}</span>
                  )}
                </div>

                <button type="submit" className="submit-btn">
                  Registrarse
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="login"
                onSubmit={iniciarSesion}
                className="form-box"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Iniciar Sesión</h2>

                <div className="field">
                  <label htmlFor="correo">Correo</label>

                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" />

                    <input
                      id="correo"
                      type="email"
                      name="correo"
                      placeholder="ejemplo@correo.com"
                      onChange={handleChange}
                      value={formulario.correo}
                      className={errores.correo ? "input-error" : ""}
                    />
                  </div>

                  {errores.correo && (
                    <span className="error-text">{errores.correo}</span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password">Contraseña</label>

                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" />

                    <input
                      id="password"
                      type={mostrarPasswordLogin ? "text" : "password"}
                      name="password"
                      placeholder="Ingresa tu contraseña"
                      onChange={handleChange}
                      value={formulario.password}
                      className={errores.password ? "input-error" : ""}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setMostrarPasswordLogin(!mostrarPasswordLogin)
                      }
                    >
                      {mostrarPasswordLogin ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errores.password && (
                    <span className="error-text">{errores.password}</span>
                  )}
                </div>

                <button type="submit" className="submit-btn">
                  Iniciar Sesión
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="overlay-panel"
          animate={{
            x: esRegistro ? "100%" : "0%",
          }}
          transition={{
            duration: 0.7,
            ease: "easeInOut",
          }}
        >
          <div className="overlay-content">
            <h1>Banco Nexus</h1>

            <p>
              {esRegistro ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
            </p>

            <button
              type="button"
              className="switch-btn"
              onClick={() => {
                setEsRegistro(!esRegistro);

                setErrores({});

                setFormulario({
                  nombre: "",
                  correo: "",
                  password: "",
                });
              }}
            >
              {esRegistro ? "Inicia Sesión" : "Registrate"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
