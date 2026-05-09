require('dotenv').config();
const express     = require('express');
const { conectar } = require('./config/db');

const app = express();
app.use(express.json());

const iniciar = async () => {
  await conectar();

  app.use('/api/cuenta', require('./routes/cuenta'));

  app.get('/health', (req, res) => res.json({ status: 'OK' }));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
};

iniciar().catch(err => {
  console.error('Error al iniciar:', err.message);
  process.exit(1);
});