const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db;

const conectar = async () => {
  await client.connect();
  db = client.db('nexus_banca');
  console.log('Conectado a MongoDB');
};

const getDb = () => {
  if (!db) throw new Error('Base de datos no inicializada');
  return db;
};

module.exports = { conectar, getDb };