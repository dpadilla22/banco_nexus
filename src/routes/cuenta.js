const express = require('express');
const router  = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

router.get('/:cuenta', async (req, res) => {
  try {
    const db = getDb();

    const cuenta = await db.collection('cuentas')
      .findOne({ numeroCuenta: req.params.cuenta });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const cliente = await db.collection('clientes')
      .findOne({ _id: cuenta.clienteId });

    const transacciones = await db.collection('transacciones')
      .find({ cuentaId: cuenta._id })
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      cuenta: {
        numeroCuenta: cuenta.numeroCuenta,
        tipoCuenta:   cuenta.tipoCuenta,
        saldo:        cuenta.saldo,
        titular: {
          nombre:   cliente?.nombre,
          correo:   cliente?.correo,
          telefono: cliente?.telefono
        }
      },
      totalTransacciones: transacciones.length,
      transacciones: transacciones.map(t => ({
        tipo:  t.tipo,
        monto: t.monto,
        fecha: t.fecha
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;