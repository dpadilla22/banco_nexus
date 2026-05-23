const { consultarCuenta, money, NUMERO_CUENTA } = require("./common");

async function main() {
  const data = await consultarCuenta(NUMERO_CUENTA);
  console.log(`Consulta Sucursal La paz - cuenta ${data.cuenta.numeroCuenta}`);
  console.log(`Saldo actual: ${money(data.cuenta.saldo)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { main };
