const { ejecutarLoteSucursal } = require("./common");

const SUCURSAL = "Los cabos";
const operaciones = [
  { tipo: "deposito", monto: 180 },
  { tipo: "retiro", monto: 70 },
  { tipo: "deposito", monto: 50 },
  { tipo: "retiro", monto: 15 },
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