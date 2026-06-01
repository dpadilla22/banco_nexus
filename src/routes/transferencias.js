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
  // !!CHECA AESTO JAVI!! -Ale
  // Si una validacion falla antes de startTransaction(), el catch no deberia intentar abortar una transaccion
  // que nunca iniciom metele una bandera
  const session = db.client.startSession(); // sesión para transacción atómica

  try {
    // 1. Validar formato cuenta destino
    if (!cuentaValida(cuentaDestino)) {
      return res.status(400).json({ error: 'Formato de cuenta destino inválido' });
    }

    // 2. Validar monto
    if (!monto || typeof monto !== 'number' || monto <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // 3. Obtener cuenta origen del token
    const clienteId = new ObjectId(req.cliente.clienteId);
    const cuentaOrigen = await db.collection('cuentas')
      .findOne({ clienteId });
    if (!cuentaOrigen) {
      return res.status(404).json({ error: 'Cuenta origen no encontrada' });
    }

    // 4. Verificar que no sea su propia cuenta
    if (cuentaOrigen.numeroCuenta === cuentaDestino) {
      return res.status(400).json({ error: 'No puedes transferirte a ti mismo' });
    }

    // 5. Verificar saldo suficiente
    // !!CHECA AESTO JAVI!! -Ale
    // Esta revision de saldo todavia tiene bug, el update de la cuenta origen deberia incluir saldo: { $gte: monto } y revisar
    // modifiedCount antes de acreditar al destino  
    if (cuentaOrigen.saldo < monto) {
      return res.status(400).json({
        error:           'Saldo insuficiente',
        saldoActual:     cuentaOrigen.saldo,
        montoSolicitado: monto
      });
    }

    // 6. Buscar cuenta destino
    const cuentaDestinoDoc = await db.collection('cuentas')
      .findOne({ numeroCuenta: cuentaDestino });
    if (!cuentaDestinoDoc) {
      return res.status(404).json({ error: 'Cuenta destino no encontrada' });
    }

    // 7. Transacción atómica
    session.startTransaction();

    // !!CHECA AESTO JAVI!! -Ale
    // Este descuento deberia usar el _id de la cuenta y validar saldo suficiente
    // en el mismo updatepara evitar que dos transferencias dejen saldo negativo
    await db.collection('cuentas').updateOne(
      { numeroCuenta: cuentaOrigen.numeroCuenta },
      { $inc: { saldo: -monto } },
      { session }
    );

    await db.collection('cuentas').updateOne(
      { numeroCuenta: cuentaDestino },
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

    await session.commitTransaction();

    // 8. Bitácora
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
    });

    res.json({
      mensaje:       'Transferencia realizada exitosamente',
      cuentaOrigen:  cuentaOrigen.numeroCuenta,
      cuentaDestino,
      monto,
      saldoActual:   cuentaOrigen.saldo - monto
    });

  } catch (error) {
    await session.abortTransaction(); // revertir si algo falló
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    session.endSession();
  }
});

module.exports = router;