import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Info, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Auth.css";
import { API_URL } from "./config/api";
export default function Auth({ setUsuario }) {
  const [esRegistro, setEsRegistro] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    curp: "",
    telefono: "",
    correo: "",
    password: "",
  });

  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [mostrarPasswordRegistro, setMostrarPasswordRegistro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
  });

  const limpiarMensajes = () => {
    setErrores({});
    setErrorGeneral("");
  };

  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === "curp") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    setFormulario({
      ...formulario,
      [name]: value,
    });

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));

    setErrorGeneral("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (esRegistro && !formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (esRegistro && !formulario.curp.trim()) {
      nuevosErrores.curp = "La CURP es obligatoria";
    }

    if (esRegistro && formulario.curp && formulario.curp.length !== 18) {
      nuevosErrores.curp = "La CURP debe tener 18 caracteres";
    }

    if (esRegistro && !formulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    }

    if (
      esRegistro &&
      formulario.telefono &&
      !/^\d{10}$/.test(formulario.telefono)
    ) {
      nuevosErrores.telefono = "Debe contener 10 dígitos";
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

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setErrorGeneral("");

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formulario.correo,
          contrasena: formulario.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorGeneral(data.error || "Correo o contraseña incorrectos");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.cliente));

      setUsuario(data.cliente);
    } catch (error) {
      console.error(error);
      setErrorGeneral("No fue posible conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const registrarse = async (e) => {
    e.preventDefault();

    limpiarMensajes();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/registro`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nombre: formulario.nombre,
          curp: formulario.curp,
          telefono: formulario.telefono,
          correo: formulario.correo,
          contrasena: formulario.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorGeneral(data.error || "Error al registrarse");
        return;
      }

      setToast({
        visible: true,
        titulo: "Cuenta creada correctamente",
        mensaje: `Número de cuenta: ${data.numeroCuenta}`,
      });

      setTimeout(() => {
        setToast({
          visible: false,
          titulo: "",
          mensaje: "",
        });
      }, 4000);

      setEsRegistro(false);

      setFormulario({
        nombre: "",
        curp: "",
        telefono: "",
        correo: "",
        password: "",
      });
    } catch (error) {
      console.error(error);

      setErrorGeneral("No fue posible conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast.visible && (
        <div className="custom-toast">
          <div className="toast-accent"></div>

          <div className="toast-icon">✓</div>

          <div className="toast-content">
            <h4>{toast.titulo}</h4>
            <p>{toast.mensaje}</p>
          </div>
        </div>
      )}
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
                  <div className="form-header">
                    <h2>Registro</h2>

                    {errorGeneral && (
                      <div
                        className="error-global"
                        style={{ marginBottom: "10px" }}
                      >
                        <Info size={18} />
                        <span>{errorGeneral}</span>
                      </div>
                    )}
                  </div>

                  {/* Los campos se quedan dentro del scroll de manera independiente */}
                  <div className="form-scroll">
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
                      <label>CURP</label>
                      <div className="input-wrap">
                        <User size={16} className="input-icon" />
                        <input
                          type="text"
                          name="curp"
                          value={formulario.curp}
                          onChange={handleChange}
                          maxLength={18}
                          placeholder="Ingresa tu CURP"
                          className={errores.curp ? "input-error" : ""}
                        />
                      </div>
                      {errores.curp && (
                        <span className="error-text">{errores.curp}</span>
                      )}
                    </div>

                    <div className="field">
                      <label>Teléfono</label>
                      <div className="input-wrap">
                        <Phone size={16} className="input-icon" />
                        <input
                          type="text"
                          name="telefono"
                          value={formulario.telefono}
                          onChange={handleChange}
                          maxLength={10}
                          placeholder="8336153976"
                          className={errores.telefono ? "input-error" : ""}
                        />
                      </div>
                      {errores.telefono && (
                        <span className="error-text">{errores.telefono}</span>
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
                  </div>
                  <div className="form-footer">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? "Creando cuenta..." : "Registrarse"}
                    </button>
                  </div>
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

                  {errorGeneral && (
                    <div className="error-global">
                      <Info size={18} />
                      <span>{errorGeneral}</span>
                    </div>
                  )}

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

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
                {esRegistro
                  ? "¿Ya tienes una cuenta?"
                  : "¿No tienes una cuenta?"}
              </p>

              <button
                type="button"
                className="switch-btn"
                onClick={() => {
                  setEsRegistro(!esRegistro);

                  limpiarMensajes();

                  setFormulario({
                    nombre: "",
                    curp: "",
                    telefono: "",
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
    </>
  );
}
