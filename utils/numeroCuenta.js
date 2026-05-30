function generarNumeroCuenta(idUsuario) {

  const prefijo = "180";

  const secuencial = Number(idUsuario)
    .toString()
    .padStart(6, "0");

  const base = prefijo + secuencial;

  const suma = base
    .split("")
    .reduce(
      (acc, num) => acc + parseInt(num),
      0
    );

  const verificador = suma % 10;

  return base + verificador;
}

function cuentaValida(numeroCuenta) {
  return /^\d{10}$/.test(numeroCuenta);
}

module.exports = {
  generarNumeroCuenta,
  cuentaValida
};