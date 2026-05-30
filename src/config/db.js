const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  retryWrites:  true,
  retryReads:   true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
});

let db;

const conectar = async () => {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log('✔ Conectado');
};

const getDb = () => {
  if (!db) throw new Error('✘ Base de datos no inicializada');
  return db;
};

module.exports = { conectar, getDb };