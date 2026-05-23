const { ejecutarLoteSucursal } = require("./common");

const SUCURSAL = "La paz";
const operaciones = [
  { tipo: "deposito", monto: 100 },
  { tipo: "retiro", monto: 50 },
  { tipo: "deposito", monto: 70 },
  { tipo: "retiro", monto: 40 },
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