
var Sequelize = require('sequelize');

// initialize database connection
var sequelize = new Sequelize(
  'sql12171993',
  'sql12171993',
  'cydwSk74pT',
  {"dialect": "mysql", "host": 'sql12.freemysqlhosting.net', "port": '3306',
    "logging": false, "define": {underscored: true}
  }
);

// export connection
module.exports.sequelize = sequelize;

