// Script para crear o actualizar el admin 'root' sin usar psql.
// Uso: node reset-admin-password.js <nuevaPassword>

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: node reset-admin-password.js <nuevaPassword> [databaseUrl]');
    process.exit(1);
  }
  const newPass = argv[0];
  const databaseUrl = argv[1] || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Falta DATABASE_URL (pasa como segundo argumento o exporta env var).');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const hash = await bcrypt.hash(newPass, 10);

    // Comprobar si existe usuario root
    const check = await pool.query("SELECT id FROM users WHERE username = 'root' LIMIT 1");
    if (check.rows.length > 0) {
      const id = check.rows[0].id;
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, id]);
      console.log(`Updated root (id=${id}) password successfully.`);
    } else {
      const insertSql = `INSERT INTO users (username, nombre_completo, email, dpi, fecha_nacimiento, password, role) VALUES ('root','Root','root@example.com','0000000000000', '2000-01-01', $1, 'admin') RETURNING id`;
      const r = await pool.query(insertSql, [hash]);
      console.log(`Inserted root with id=${r.rows[0].id}`);
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
    process.exit(2);
  }
}

main();
