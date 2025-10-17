CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  numero_colegiado VARCHAR(100),
  dpi VARCHAR(100),
  fecha_nacimiento DATE,
  nombre_completo VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
