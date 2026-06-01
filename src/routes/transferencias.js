const express = require('express');
const router  = express.Router();
const { getDb } = require('../config/db');
const { cuentaValida } = require('../../utils/numeroCuenta');
const { ObjectId } = require('mongodb');

// ──────────────────────────────────────────────────────────────────────────────────
//                              TRANSFERENCIAS
// ──────────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { cuentaDestino, monto, mensaje } = req.body;
  const db = getDb();
  const session = db.client.startSession();
  let transactionStarted = false;

  try {
    if (!cuentaValida(cuentaDestino)) {
      return res.status(400).json({ error: 'Formato de cuenta destino inválido' });
    }

    if (!monto || typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const clienteId = new ObjectId(req.cliente.clienteId);
    const cuentaOrigen = await db.collection('cuentas')
      .findOne({ clienteId });
    if (!cuentaOrigen) {
      return res.status(404).json({ error: 'Cuenta origen no encontrada' });
    }

    if (cuentaOrigen.numeroCuenta === cuentaDestino) {
      return res.status(400).json({ error: 'No puedes transferirte a ti mismo' });
    }

    if (cuentaOrigen.saldo < monto) {
      return res.status(400).json({
        error:           'Saldo insuficiente',
        saldoActual:     cuentaOrigen.saldo,
        montoSolicitado: monto
      });
    }

    const cuentaDestinoDoc = await db.collection('cuentas')
      .findOne({ numeroCuenta: cuentaDestino });
    if (!cuentaDestinoDoc) {
      return res.status(404).json({ error: 'Cuenta destino no encontrada' });
    }

    session.startTransaction();
    transactionStarted = true;

    const origenUpdate = await db.collection('cuentas').updateOne(
      { _id: cuentaOrigen._id, saldo: { $gte: monto } },
      { $inc: { saldo: -monto } },
      { session }
    );

    if (origenUpdate.modifiedCount !== 1) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Saldo insuficiente',
        saldoActual: cuentaOrigen.saldo,
        montoSolicitado: monto,
      });
    }

    await db.collection('cuentas').updateOne(
      { _id: cuentaDestinoDoc._id },
      { $inc: { saldo: monto } },
      { session }
    );

    const fecha = new Date();

    await db.collection('transacciones').insertOne({
      cuentaId:      cuentaOrigen._id,
      tipo:          'Transferencia',
      monto:         -monto,
      cuentaDestino,
      mensaje,
      fecha
    }, { session });

    await db.collection('transacciones').insertOne({
      cuentaId:      cuentaDestinoDoc._id,
      tipo:          'Transferencia',
      monto,
      cuentaOrigen:  cuentaOrigen.numeroCuenta,
      mensaje,
      fecha
    }, { session });

    await db.collection('bitacora').insertOne({
      accion:    'TRANSFERENCIA',
      usuarioId: clienteId,
      estado:    'EXITOSO',
      detalle: {
        cuentaOrigen:  cuentaOrigen.numeroCuenta,
        cuentaDestino,
        monto,
        mensaje
      },
      fecha
    }, { session });

    await session.commitTransaction();

    res.json({
      mensaje:       'Transferencia realizada exitosamente',
      cuentaOrigen:  cuentaOrigen.numeroCuenta,
      cuentaDestino,
      monto,
      saldoActual:   cuentaOrigen.saldo - monto
    });

  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    session.endSession();
  }
});

module.exports = router;