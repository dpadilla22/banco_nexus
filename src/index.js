require("dotenv").config();
const express = require("express");
const { conectar } = require("./config/db");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth");

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : null;

app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

const validateEnvironment = () => {
  const required = ["MONGO_URI", "DB_NAME", "JWT_SECRET", "JWT_EXPIRES"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(", ")}`);
  }
};

const iniciar = async () => {
  validateEnvironment();
  await conectar();

  app.use("/api/auth", require("./routes/auth"));

  app.use("/api/cuenta", authMiddleware, require("./routes/cuenta"));
  app.use("/api", authMiddleware, require("./routes/transacciones"));
  app.use("/api/beneficiarios", authMiddleware, require("./routes/beneficiarios"));
  app.use("/api/transferencias", authMiddleware, require("./routes/transferencias"));
  app.use("/api/bitacora", authMiddleware, require("./routes/bitacora"));

  app.get("/health", (req, res) => res.json({ status: "OK" }));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
};

iniciar().catch((err) => {
  console.error("Error al iniciar:", err.message);
  process.exit(1);
});
