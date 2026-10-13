const bcrypt = require('bcryptjs');
const h = '$2a$10$MaNJe9WwiyB8O6hBKp4VnOBhiIwiE6.yrdy/MQS4TBaPL2MrTrX0m';
const candidates = ['admin123', 'FrenchBell@2026!', 'admin', 'admin@123'];
Promise.all(candidates.map(p => bcrypt.compare(p, h).then(r => `${JSON.stringify(p)} => ${r}`)))
  .then(a => console.log(a.join('\n')))
  .catch(e => console.error(e));
