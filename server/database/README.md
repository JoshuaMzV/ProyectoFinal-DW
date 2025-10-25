# Database scripts

Instrucciones para inicializar la base de datos PostgreSQL localmente.

Requisitos:
- PostgreSQL instalado (psql en PATH)

1) Crear base de datos (ejemplo):

   createdb votaciones_db

2) Ejecutar el schema y los datos iniciales:

   psql -d votaciones_db -f path/to/schema.sql
   psql -d votaciones_db -f path/to/inserts.sql

3) Conectar desde la API (en `.env` del server):

   DATABASE_URL=postgres://user:password@localhost:5432/votaciones_db

Notas:

Notas:
- Las contraseñas en `inserts.sql` están hasheadas con bcrypt; sustituye por tus propios hashes en producción.
- La estructura usa una única tabla `users` con columna `role` que puede ser 'admin' o 'votante'.
