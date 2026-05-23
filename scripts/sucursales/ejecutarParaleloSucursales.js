const {
  analizarConcurrencia,
  imprimirAnalisis,
  obtenerSaldo,
  NUMERO_CUENTA,
} = require("./common");

const sucursales = [
  require("./operacionSucursalLaPaz"),
  require("./operacionSucursalLosCabos"),
  require("./operacionSucursalLoreto"),
  require("./operacionSucursalMulege"),
];

async function main() {
  console.log(`Simulacion paralela de sucursales sobre cuenta ${NUMERO_CUENTA}`);
  const saldoInicial = await obtenerSaldo(NUMERO_CUENTA);
  console.log(`Saldo inicial observado: ${saldoInicial.toFixed(2)}`);

  const resultadosPorSucursal = await Promise.all(
    sucursales.map((sucursal) => sucursal.ejecutar())
  );
  const resultados = resultadosPorSucursal.flat();

  const saldoFinal = await obtenerSaldo(NUMERO_CUENTA);
  const analisis = analizarConcurrencia({
    saldoInicial,
    saldoFinal,
    resultados,
  });

  imprimirAnalisis(analisis);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
