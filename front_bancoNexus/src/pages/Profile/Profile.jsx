import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Save,
  Wallet,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "./config/api";
import "./Profile.css";

export default function Profile({ authHeaders, usuario, setUsuario }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({});

  const hayCambios =
    perfil &&
    (nombre !== perfil.nombre ||
      correo !== perfil.correo ||
      telefono !== perfil.telefono);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPerfil(data);

      setNombre(data.nombre);
      setCorreo(data.correo);
      setTelefono(data.telefono);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    if (!correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!regexCorreo.test(correo)) {
      nuevosErrores.correo = "Ingresa un correo válido";
    }
    if (!telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(telefono)) {
      nuevosErrores.telefono = "Debe contener 10 dígitos";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCambios = async () => {
    if (!hayCambios || saving) return;

    if (!validarFormulario()) {
      return;
    }

    try {
      setSaving(true);

      setMensaje("");
      setError("");

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setMensaje(data.mensaje);

      const usuarioActualizado = {
        ...usuario,
        nombre,
        correo,
        telefono,
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      setUsuario(usuarioActualizado);

      setPerfil((prev) => ({
        ...prev,
        nombre,
        correo,
        telefono,
      }));
      setErrores({});

      setTimeout(() => {
        setMensaje("");
      }, 3000);
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError("No fue posible conectar con el servidor.");
      } else {
        setError(err.message || "Ocurrió un error al guardar los cambios.");
      }

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Cargando perfil...</div>;
  }

  return (
    <div className="profile-page">
      <h2>Perfil</h2>

      {mensaje && (
        <div className="success-box">
          <CheckCircle size={18} />
          {mensaje}
        </div>
      )}

      {error && (
        <div className="error-box">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="profile-card">
        <h3>Información Personal</h3>
        <div className="profile-field">
          <label>
            <User size={16} />
            Nombre
          </label>

          <input
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);

              setErrores((prev) => ({
                ...prev,
                nombre: "",
              }));

              if (mensaje) setMensaje("");
              if (error) setError("");
            }}
            className={errores.nombre ? "profile-input-error" : ""}
          />
          {errores.nombre && (
            <span className="field-error">{errores.nombre}</span>
          )}
        </div>

        <div className="profile-field">
          <label>
            <Mail size={16} />
            Correo
          </label>

          <input
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);

              setErrores((prev) => ({
                ...prev,
                correo: "",
              }));

              if (mensaje) setMensaje("");
              if (error) setError("");
            }}
            className={errores.correo ? "profile-input-error" : ""}
          />
          {errores.correo && (
            <span className="field-error">{errores.correo}</span>
          )}
        </div>

        <div className="profile-field">
          <label>
            <Phone size={16} />
            Teléfono
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={telefono}
            onChange={(e) => {
              const valor = e.target.value.replace(/\D/g, "");

              setTelefono(valor);

              setErrores((prev) => ({
                ...prev,
                telefono: "",
              }));

              if (mensaje) setMensaje("");
              if (error) setError("");
            }}
            className={errores.telefono ? "profile-input-error" : ""}
          />
          {errores.telefono && (
            <span className="field-error">{errores.telefono}</span>
          )}
        </div>

        <div className="profile-field">
          <label>
            <Shield size={16} />
            CURP
          </label>

          <input value={perfil.curp} disabled />
        </div>
        <div className="profile-actions">
          <button
            className="save-btn"
            onClick={guardarCambios}
            disabled={!hayCambios || saving}
          >
            <Save size={18} />

            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            className="cancel-btn"
            disabled={saving || !hayCambios}
            onClick={() => {
              setNombre(perfil.nombre);
              setCorreo(perfil.correo);
              setTelefono(perfil.telefono);

              setMensaje("");
              setError("");
              setErrores({});
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="profile-card bank-info">
        <h3>Información Bancaria</h3>

        <div className="bank-grid">
          <div className="bank-item">
            <span>
              <CreditCard size={16} />
              Número de Cuenta
            </span>

            <strong>{perfil.numeroCuenta}</strong>
          </div>

          <div className="bank-item">
            <span>
              <Wallet size={16} />
              Tipo de Cuenta
            </span>

            <strong>{perfil.tipoCuenta}</strong>
          </div>

          <div className="bank-item">
            <span>
              <DollarSign size={16} />
              Saldo
            </span>

            <strong>
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(perfil.saldo)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
