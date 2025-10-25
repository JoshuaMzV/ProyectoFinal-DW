require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const sqlFile = __dirname + '/add-profile-image.sql';
const sql = fs.readFileSync(sqlFile, 'utf8');

pool.query(sql)
    .then(() => {
        console.log('✅ Migración ejecutada exitosamente');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error en migración:', err.message);
        process.exit(1);
    });
