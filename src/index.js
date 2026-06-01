require("dotenv").config();
const express = require("express");
const { conectar } = require("./config/db");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth");

const app = express();
// !!CHECA AESTO JAVI!! -Ale
// CORS esta abierto, luego cambiar a CORS_ORIGIN 
app.use(cors());
app.use(express.json());

const iniciar = async () => {
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
