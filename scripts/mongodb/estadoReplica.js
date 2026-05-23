// Ejecutar desde mongosh para ver el rol de cada nodo:
// docker exec -it banco-mongo-rs mongosh --port 27017 /tmp/estadoReplica.js

const status = rs.status();

printjson({
  set: status.set,
  date: status.date,
  members: status.members.map((member) => ({
    name: member.name,
    stateStr: member.stateStr,
    health: member.health,
    uptime: member.uptime,
    optimeDate: member.optimeDate
  }))
});
