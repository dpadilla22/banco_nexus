import { useEffect, useState } from "react";
import {
  UserPlus,
  ArrowLeftRight,
  CheckCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { API_URL } from "./config/api";
import "./Transferencias.css";
import SearchBar from "../../components/SearchBar/SearchBar";

export default function Transferencias({
  authHeaders,
  onTransferSuccess,
  saldoActual,
}) {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [alias, setAlias] = useState("");
  const [cuentaDestino, setCuentaDestino] = useState("");
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] =
    useState(null);
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");

  const [mensajeBeneficiario, setMensajeBeneficiario] = useState("");
  const [mensajeTransferencia, setMensajeTransferencia] = useState("");

  const [erroresBeneficiario, setErroresBeneficiario] = useState({});
  const [erroresTransferencia, setErroresTransferencia] = useState({});

  const [errorBeneficiarioBack, setErrorBeneficiarioBack] = useState("");
  const [errorTransferenciaBack, setErrorTransferenciaBack] = useState("");

  const [loadingBeneficiario, setLoadingBeneficiario] = useState(false);
  const [loadingTransferencia, setLoadingTransferencia] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const beneficiariosFiltrados = beneficiarios.filter((b) => {
    const texto = busqueda.toLowerCase();

    return (
      b.alias.toLowerCase().includes(texto) || b.cuentaDestino.includes(texto)
    );
  });

  useEffect(() => {
    cargarBeneficiarios();
  }, []);

  const cargarBeneficiarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/beneficiarios`, {
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setBeneficiarios(data.beneficiarios || []);
    } catch (err) {
      setErrorBeneficiarioBack(err.message);
    }
  };

  const agregarBeneficiario = async () => {
    setMensajeBeneficiario("");
    setErrorBeneficiarioBack("");

    const nuevosErrores = {};

    if (!alias.trim()) {
      nuevosErrores.alias = "El alias es obligatorio";
    }

    if (!cuentaDestino.trim()) {
      nuevosErrores.cuentaDestino = "La cuenta es obligatoria";
    } else if (!/^\d{10}$/.test(cuentaDestino)) {
      nuevosErrores.cuentaDestino = "Debe contener 10 dígitos";
    }

    setErroresBeneficiario(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      setLoadingBeneficiario(true);

      const response = await fetch(`${API_URL}/api/beneficiarios`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          alias,
          cuentaDestino,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setMensajeBeneficiario(data.mensaje);
      setAlias("");
      setCuentaDestino("");
      setBeneficiarioSeleccionado(null);

      cargarBeneficiarios();

      setTimeout(() => {
        setMensajeBeneficiario("");
      }, 3000);
    } catch (err) {
      setErrorBeneficiarioBack(err.message);

      setTimeout(() => {
        setErrorBeneficiarioBack("");
      }, 4000);
    } finally {
      setLoadingBeneficiario(false);
    }
  };

  const transferir = async () => {
    setMensajeTransferencia("");
    setErrorTransferenciaBack("");

    const nuevosErrores = {};

    if (!beneficiarioSeleccionado) {
      nuevosErrores.beneficiario = "Selecciona un beneficiario";
    }

    if (!monto.trim()) {
      nuevosErrores.monto = "Ingresa un monto válido";
    } else if (parseFloat(monto) <= 0) {
      nuevosErrores.monto = "Ingresa un monto válido";
    }

    setErroresTransferencia(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      setLoadingTransferencia(true);

      const response = await fetch(`${API_URL}/api/transferencias`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          cuentaDestino: beneficiarioSeleccionado.cuentaDestino,
          monto: parseFloat(monto),
          mensaje: concepto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setMonto("");
      setConcepto("");
      setBeneficiarioSeleccionado(null);

      if (onTransferSuccess) {
        await onTransferSuccess();
      }

      setMensajeTransferencia("Transferencia realizada exitosamente.");

      setTimeout(() => {
        setMensajeTransferencia("");
      }, 3000);
    } catch (err) {
      setErrorTransferenciaBack(err.message);

      setTimeout(() => {
        setErrorTransferenciaBack("");
      }, 5000);
    } finally {
      setLoadingTransferencia(false);
    }
  };

  return (
    <div className="transfer-page">
      <h2>Transferencias</h2>
      <div className="transfer-container">
        <div className="transfer-main-flow">
          <div className="transfer-card">
            <h3>Beneficiarios Guardados</h3>
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por alias o cuenta"
            />
            {erroresTransferencia.beneficiario && (
              <div className="error-box">
                <AlertCircle size={18} />
                {erroresTransferencia.beneficiario}
              </div>
            )}

            <div className="beneficiarios-grid">
              {beneficiariosFiltrados.map((b) => (
                <div
                  key={b._id}
                  className={`beneficiario-card ${
                    beneficiarioSeleccionado?._id === b._id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setBeneficiarioSeleccionado(b);
                    setErroresTransferencia((prev) => ({
                      ...prev,
                      beneficiario: "",
                    }));
                    if (errorTransferenciaBack) setErrorTransferenciaBack("");
                  }}
                >
                  <CreditCard size={18} />
                  <h4>{b.alias}</h4>
                  <span>{b.cuentaDestino}</span>
                </div>
              ))}
              {beneficiariosFiltrados.length === 0 && (
                <div className="empty-beneficiarios">
                  No se encontraron beneficiarios.
                </div>
              )}
            </div>
          </div>

          <div className="transfer-card">
            <h3>Realizar Transferencia</h3>

            {mensajeTransferencia && (
              <div className="success-box">
                <CheckCircle size={18} />
                {mensajeTransferencia}
              </div>
            )}

            {(erroresTransferencia.monto || errorTransferenciaBack) && (
              <div className="error-box">
                <AlertCircle size={18} />
                {erroresTransferencia.monto || errorTransferenciaBack}
              </div>
            )}
            <div className="info-saldo-transfer">
              <span>Saldo disponible</span>

              <strong>
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(saldoActual)}
              </strong>
            </div>

            <div className="profile-form-group">
              <label className="form-label">Monto a transferir</label>

              <div className="transfer-input-wrapper">
                <DollarSign size={18} />

                <input
                  placeholder="0.00"
                  value={monto}
                  className={erroresTransferencia.monto ? "input-error" : ""}
                  onChange={(e) => {
                    setMonto(e.target.value.replace(/[^0-9.]/g, ""));

                    setErroresTransferencia((prev) => ({
                      ...prev,
                      monto: "",
                    }));

                    if (mensajeTransferencia) setMensajeTransferencia("");

                    if (errorTransferenciaBack) setErrorTransferenciaBack("");
                  }}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="form-label">Concepto</label>

              <textarea
                rows="3"
                placeholder="Ej. Pago de renta"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
              />
            </div>

            <button
              className="save-btn"
              onClick={transferir}
              disabled={loadingTransferencia}
            >
              <ArrowLeftRight size={18} />

              {loadingTransferencia ? "Procesando..." : "Transferir"}
            </button>
          </div>
        </div>
        <div className="transfer-card">
          <h3>Agregar Beneficiario</h3>

          {mensajeBeneficiario && (
            <div className="success-box">
              <CheckCircle size={18} />
              {mensajeBeneficiario}
            </div>
          )}

          {errorBeneficiarioBack && (
            <div className="error-box">
              <AlertCircle size={18} />
              {errorBeneficiarioBack}
            </div>
          )}

          <div className="profile-form-group">
            <label className="form-label">Alias del beneficiario</label>
            <input
              placeholder="Ej. Mamá, Juan Pérez"
              value={alias}
              className={erroresBeneficiario.alias ? "input-error" : ""}
              onChange={(e) => {
                setAlias(e.target.value);
                setErroresBeneficiario((prev) => ({ ...prev, alias: "" }));
                if (mensajeBeneficiario) setMensajeBeneficiario("");
                if (errorBeneficiarioBack) setErrorBeneficiarioBack("");
              }}
            />
            {erroresBeneficiario.alias && (
              <span className="field-error">{erroresBeneficiario.alias}</span>
            )}
          </div>

          <div className="profile-form-group">
            <label className="form-label">Número de Cuenta</label>
            <input
              placeholder="1800000xxx"
              maxLength={10}
              value={cuentaDestino}
              className={erroresBeneficiario.cuentaDestino ? "input-error" : ""}
              onChange={(e) => {
                setCuentaDestino(e.target.value.replace(/\D/g, ""));
                setErroresBeneficiario((prev) => ({
                  ...prev,
                  cuentaDestino: "",
                }));
                if (mensajeBeneficiario) setMensajeBeneficiario("");
                if (errorBeneficiarioBack) setErrorBeneficiarioBack("");
              }}
            />
            {erroresBeneficiario.cuentaDestino && (
              <span className="field-error">
                {erroresBeneficiario.cuentaDestino}
              </span>
            )}
          </div>

          <button
            className="save-btn btn-add-contacto"
            onClick={agregarBeneficiario}
            disabled={loadingBeneficiario}
          >
            <UserPlus size={18} />
            {loadingBeneficiario ? "Guardando..." : "Agregar Beneficiario"}
          </button>
        </div>
      </div>
    </div>
  );
}
