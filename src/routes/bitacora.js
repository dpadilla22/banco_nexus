const express = require('express');
const router  = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// ─── GET /api/bitacora ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const clienteId = new ObjectId(req.cliente.clienteId);
    const db = getDb();

    const eventos = await db.collection('bitacora')
      .find({ usuarioId: clienteId })
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      total: eventos.length,
      eventos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/bitacora/todos ──────────────────────────────────────────────────
router.get('/todos', async (req, res) => {
  try {
    const db = getDb();

    const eventos = await db.collection('bitacora')
      .find({})
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      total: eventos.length,
      eventos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;