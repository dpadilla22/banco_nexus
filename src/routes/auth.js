const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");
const { generarNumeroCuenta, cuentaValida } = require('../../utils/numeroCuenta');

// ──────────────────────────────────────────────────────────────────────────────────
//                                      REGISTRO
// ──────────────────────────────────────────────────────────────────────────────────
router.post("/registro", async (req, res) => {
  try {
    const { nombre, curp, telefono, correo, contrasena, tipoCuenta } = req.body;
    const db = getDb();

    if (!nombre || !curp || !telefono || !correo || !contrasena) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const existe = await db.collection("clientes").findOne({ correo });
    if (existe) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const resultado = await db.collection("clientes").insertOne({
      nombre,
      curp,
      telefono,
      correo,
      contrasena: hash,
      fechaRegistro: new Date(),
    });

    const clienteId = resultado.insertedId;

    // !!CHECA AESTO JAVI!! -Ale
    // countDocuments()puede generqr duplicados si
    // dos usuarios se registran al mismo tiempo, so lo mas seguro es un contador
    // atomico en Mongo o un indezçx unico en numeroCuenta con reintento 
    const totalCuentas = await db.collection("cuentas").countDocuments();
    const numeroCuenta = generarNumeroCuenta(totalCuentas + 1);

    await db.collection("cuentas").insertOne({
      numeroCuenta,
      saldo: 0,
      tipoCuenta: tipoCuenta || "Débito",
      clienteId,
      fechaCreacion: new Date(),
    });

    await db.collection("bitacora").insertOne({
      accion: "REGISTRO",
      usuarioId: clienteId,
      estado: "EXITOSO",
      detalle: `Cliente registrado con cuenta ${numeroCuenta}`,
      fecha: new Date(),
    });

    res.status(201).json({
      mensaje: "Cliente registrado exitosamente",
      numeroCuenta,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────────
//                              INICIO DE SESIÓN
// ──────────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const db = getDb();

    if (!correo || !contrasena) {
      return res
        .status(400)
        .json({ error: "Correo y contraseña son requeridos" });
    }

    const cliente = await db.collection("clientes").findOne({ correo });
    if (!cliente) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const valida = await bcrypt.compare(contrasena, cliente.contrasena);
    if (!valida) {
      await db.collection("bitacora").insertOne({
        accion: "LOGIN",
        usuarioId: cliente._id,
        estado: "FALLIDO",
        detalle: "Contraseña incorrecta",
        fecha: new Date(),
      });
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const cuenta = await db
      .collection("cuentas")
      .findOne({ clienteId: cliente._id });

    // !!CHECA AESTO JAVI!! -Ale
    // Antes de firmar tokens hay que validar al arrancar que JWT_SECRET exista
    // y no sea el valor de ejemplo. Si falta, la API no deberia iniciar.
    const token = jwt.sign(
      {
        clienteId: cliente._id,
        correo: cliente.correo,
        numeroCuenta: cuenta?.numeroCuenta,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );

    await db.collection("bitacora").insertOne({
      accion: "LOGIN",
      usuarioId: cliente._id,
      estado: "EXITOSO",
      detalle: `Inicio de sesión: ${correo}`,
      fecha: new Date(),
    });

    // !!CHECA AESTO JAVI!! -Ale
    // Si por algun dato roto no existe cliente o cuenta, esto truena con 500.
    // Mejor responder 404/controlado antes de usar cliente.nombre o cuenta.saldo.
    res.json({
      token,
      cliente: {
        nombre: cliente.nombre,
        correo: cliente.correo,
        numeroCuenta: cuenta?.numeroCuenta,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────────
//                              PERFIL DEL USUARIO (PROTEGIDO)
// ──────────────────────────────────────────────────────────────────────────────────
router.get("/perfil", require("../middlewares/auth"), async (req, res) => {
  try {
    const db = getDb();
    const { ObjectId } = require("mongodb");

    const cliente = await db
      .collection("clientes")
      .findOne(
        { _id: new ObjectId(req.cliente.clienteId) },
        { projection: { contrasena: 0 } },
      );

    const cuenta = await db.collection("cuentas").findOne({
      clienteId: new ObjectId(req.cliente.clienteId),
    });

    res.json({
      nombre: cliente.nombre,
      correo: cliente.correo,
      curp: cliente.curp,
      telefono: cliente.telefono,
      numeroCuenta: cuenta.numeroCuenta,
      tipoCuenta: cuenta.tipoCuenta,
      saldo: cuenta.saldo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
