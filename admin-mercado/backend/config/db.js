const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "31501",
    database: process.env.DB_NAME || "db_merc",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
