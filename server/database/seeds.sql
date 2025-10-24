-- Seeds iniciales para la base de datos
-- Inserta un admin root, un votante, una campaña y dos candidatos

BEGIN;

-- Admin root (password debe ser reemplazada por hash en producción)
INSERT INTO public.users (username, nombre_completo, email, dpi, fecha_nacimiento, password, role)
VALUES ('root', 'Root', 'root@example.com', '0000000000000', '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Votante de prueba
INSERT INTO public.users (numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password, role)
VALUES ('12345', 'Joshua Mendez', 'j@gmail.com', '1234567890132', '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'votante')
ON CONFLICT (numero_colegiado) DO NOTHING;

-- Campaña de ejemplo
INSERT INTO public.campaigns (titulo, descripcion, fecha_inicio, fecha_fin, estado)
VALUES ('Elecciones Junta Directiva 2025', 'Votación para elegir a los nuevos miembros de la junta.', '2025-09-25 14:00:00+00', '2025-10-20 00:00:00+00', 'habilitada')
ON CONFLICT (titulo) DO NOTHING;

-- Insertar candidatos para la campaña (si no existen)
WITH c AS (
  SELECT id FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025' LIMIT 1
)
INSERT INTO public.candidates (nombre, campaign_id)
SELECT 'Ana Gómez', c.id FROM c
ON CONFLICT DO NOTHING;

WITH c2 AS (
  SELECT id FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025' LIMIT 1
)
INSERT INTO public.candidates (nombre, campaign_id)
SELECT 'Carlos Valdes', c2.id FROM c2
ON CONFLICT DO NOTHING;

COMMIT;
