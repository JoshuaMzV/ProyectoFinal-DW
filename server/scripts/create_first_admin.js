// Script para crear el admin ROOT (ejecutar con node)
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const username = 'root';
    const password = 'root';
    const nombre_completo = 'adminroot';
    const email = 'root@gmail.com';
  const numero_colegiado = 'root';
  const dpi = 'root';
  const fecha_nacimiento = new Date();

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

  const sql = `INSERT INTO admins (username, password, nombre_completo, email, numero_colegiado, dpi, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password RETURNING id`;
  const res = await pool.query(sql, [username, hashed, nombre_completo, email, numero_colegiado, dpi, fecha_nacimiento]);
    console.log('Admin ROOT creado/actualizado, id=', res.rows[0].id);
    process.exit(0);
  } catch (err) {
    console.error('Error creando admin ROOT', err);
    process.exit(1);
  }
})();
