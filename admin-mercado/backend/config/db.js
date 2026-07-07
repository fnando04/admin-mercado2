const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "31501",
    database: "db_merc",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;