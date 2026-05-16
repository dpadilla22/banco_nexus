const { ejecutarLoteSucursal } = require("./common");

const SUCURSAL = "Mulege";
const operaciones = [
  { tipo: "deposito", monto: 120 },
  { tipo: "retiro", monto: 45 },
  { tipo: "deposito", monto: 110 },
  { tipo: "retiro", monto: 35 },
];

async function ejecutar() {
  return ejecutarLoteSucursal({ sucursal: SUCURSAL, operaciones });
}

if (require.main === module) {
  ejecutar().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { SUCURSAL, operaciones, ejecutar };