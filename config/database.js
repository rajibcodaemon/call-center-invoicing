const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

var pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPWD,
  database: process.env.DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((error, connection) => {
  if (error) {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (error.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
  }
  if (connection) {
    connection.release();
  }
  return;
});

module.exports = pool;