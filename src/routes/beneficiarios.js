const express = require('express');
const router  = express.Router();
const { getDb } = require('../config/db');
const { cuentaValida } = require('../../utils/numeroCuenta');
const { ObjectId } = require('mongodb');

// ──────────────────────────────────────────────────────────────────────────────────
//                              BENEFICIARIOS (AGREGAR)
// ──────────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { cuentaDestino, alias } = req.body;
    const clienteId = new ObjectId(req.cliente.clienteId);
    const db = getDb();

    if (!cuentaDestino || !alias) {
      return res.status(400).json({ error: 'Cuenta destino y alias son requeridos' });
    }

    if (!cuentaValida(cuentaDestino)) {
      return res.status(400).json({ error: 'Formato de cuenta inválido' });
    }

    const cuentaDestinoDoc = await db.collection('cuentas')
      .findOne({ numeroCuenta: cuentaDestino });
    if (!cuentaDestinoDoc) {
      return res.status(404).json({ error: 'Cuenta destino no encontrada' });
    }

    const miCuenta = await db.collection('cuentas')
      .findOne({ clienteId });
    if (miCuenta.numeroCuenta === cuentaDestino) {
      return res.status(400).json({ error: 'No puedes agregarte a ti mismo' });
    }

    const existe = await db.collection('beneficiarios').findOne({
      usuarioId: clienteId,
      cuentaDestino
    });
    if (existe) {
      return res.status(400).json({ error: 'Este beneficiario ya está registrado' });
    }

    await db.collection('beneficiarios').insertOne({
      usuarioId: clienteId,
      alias,
      cuentaDestino,
      fecha: new Date()
    });

    await db.collection('bitacora').insertOne({
      accion:    'ALTA_BENEFICIARIO',
      usuarioId: clienteId,
      estado:    'EXITOSO',
      detalle:   `Beneficiario agregado: ${alias} - ${cuentaDestino}`,
      fecha:     new Date()
    });

    res.status(201).json({
      mensaje: 'Beneficiario registrado exitosamente',
      alias,
      cuentaDestino
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────────
//                              BENEFICIARIOS (LISTAR)
// ──────────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const clienteId = new ObjectId(req.cliente.clienteId);
    const db = getDb();

    const beneficiarios = await db.collection('beneficiarios')
      .find({ usuarioId: clienteId })
      .toArray();

    res.json({ beneficiarios });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;