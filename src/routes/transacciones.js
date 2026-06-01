const express = require("express");
const router = express.Router();
const { getDb } = require("../config/db");

const validarMonto = (monto) => {
  if (monto === undefined || monto === null) return "El monto es requerido";
  if (typeof monto !== "number") return "El monto debe ser un número";
  if (monto <= 0) return "El monto debe ser mayor a 0";
  if (!Number.isFinite(monto)) return "El monto no es válido";
  return null;
};

const buscarCuenta = async (db, numeroCuenta) => {
  if (!numeroCuenta) throw new Error("El número de cuenta es requerido");
  return await db
    .collection("cuentas")
    .findOne({ numeroCuenta: String(numeroCuenta) });
};

router.post("/deposito", async (req, res) => {
  try {
    const { numeroCuenta, monto } = req.body;
    const db = getDb();

    const errorMonto = validarMonto(monto);
    if (errorMonto) {
      return res.status(400).json({ error: errorMonto });
    }

    const cuenta = await buscarCuenta(db, numeroCuenta);
    if (!cuenta) {
      return res
        .status(404)
        .json({ error: `Cuenta ${numeroCuenta} no encontrada` });
    }

    const nuevoSaldo = cuenta.saldo + monto;
    //Solo agregué esto ATT: Mich
    const sucursal = "Principal";

    await db
      .collection("cuentas")
      .updateOne(
        { numeroCuenta: String(numeroCuenta) },
        { $set: { saldo: nuevoSaldo } },
      );

    await db.collection("transacciones").insertOne({
      cuentaId: cuenta._id,
      tipo: "Depósito",
      monto,
      sucursal,
      fecha: new Date(),
    });

    await db.collection("bitacora").insertOne({
      accion: "DEPOSITO",
      usuarioId: cuenta.clienteId,
      estado: "EXITOSO",
      detalle: {
        numeroCuenta,
        monto,
        sucursal,
        saldoAnterior: cuenta.saldo,
        saldoActual: nuevoSaldo,
      },
      fecha: new Date(),
    });

    res.json({
      mensaje: "Depósito realizado exitosamente",
      numeroCuenta,
      montoDepositado: monto,
      saldoAnterior: cuenta.saldo,
      saldoActual: nuevoSaldo,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || "Error interno del servidor" });
  }
});

router.post("/retiro", async (req, res) => {
  try {
    const { numeroCuenta, monto } = req.body;
    const db = getDb();

    const errorMonto = validarMonto(monto);
    if (errorMonto) {
      return res.status(400).json({ error: errorMonto });
    }

    const cuenta = await buscarCuenta(db, numeroCuenta);
    if (!cuenta) {
      return res
        .status(404)
        .json({ error: `Cuenta ${numeroCuenta} no encontrada` });
    }

    if (cuenta.saldo < monto) {
      return res.status(400).json({
        error: "Saldo insuficiente",
        saldoActual: cuenta.saldo,
        montoSolicitado: monto,
        diferencia: monto - cuenta.saldo,
      });
    }

    const nuevoSaldo = cuenta.saldo - monto;
    //Solo agregué esto  ATT: Mich
    const sucursal = "Principal";
    await db
      .collection("cuentas")
      .updateOne(
        { numeroCuenta: String(numeroCuenta) },
        { $set: { saldo: nuevoSaldo } },
      );

    await db.collection("transacciones").insertOne({
      cuentaId: cuenta._id,
      tipo: "Retiro",
      monto,
      sucursal,
      fecha: new Date(),
    });

    await db.collection("bitacora").insertOne({
      accion: "RETIRO",
      usuarioId: cuenta.clienteId,
      estado: "EXITOSO",
      detalle: {
        numeroCuenta,
        monto,
        sucursal,
        saldoAnterior: cuenta.saldo,
        saldoActual: nuevoSaldo,
      },
      fecha: new Date(),
    });

    res.json({
      mensaje: "Retiro realizado exitosamente",
      numeroCuenta,
      montoRetirado: monto,
      saldoAnterior: cuenta.saldo,
      saldoActual: nuevoSaldo,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || "Error interno del servidor" });
  }
});

module.exports = router;
