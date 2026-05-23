// Ejecutar una sola vez desde mongosh en el puerto 27017:
// docker exec -it banco-mongo-rs mongosh --port 27017 /tmp/iniciarReplica.js

rs.initiate({
  _id: "rsBanco",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});
