-- Inserts iniciales seguros para la base de datos
-- Inserta un admin root, un votante, una campaña y dos candidatos si no existen

BEGIN;

-- Admin root
INSERT INTO public.users (username, nombre_completo, email, dpi, fecha_nacimiento, password, role)
SELECT 'root', 'Root', 'root@example.com', '0000000000000', '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'root');

-- Votante de prueba
INSERT INTO public.users (numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password, role)
SELECT '12345', 'Joshua Mendez', 'j@gmail.com', '1234567890132', '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'votante'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE numero_colegiado = '12345');

-- Campaña de ejemplo
INSERT INTO public.campaigns (titulo, descripcion, fecha_inicio, fecha_fin, estado)
SELECT 'Elecciones Junta Directiva 2025', 'Votación para elegir a los nuevos miembros de la junta.', '2025-09-25 14:00:00+00', '2025-10-20 00:00:00+00', 'habilitada'
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025');

-- Insertar candidatos para la campaña (si no existen)
WITH c AS (
  SELECT id FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025' LIMIT 1
)
INSERT INTO public.candidates (nombre, campaign_id)
SELECT 'Ana Gómez', c.id FROM c
WHERE NOT EXISTS (SELECT 1 FROM public.candidates WHERE nombre = 'Ana Gómez' AND campaign_id = c.id);

WITH c2 AS (
  SELECT id FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025' LIMIT 1
)
INSERT INTO public.candidates (nombre, campaign_id)
SELECT 'Carlos Valdes', c2.id FROM c2
WHERE NOT EXISTS (SELECT 1 FROM public.candidates WHERE nombre = 'Carlos Valdes' AND campaign_id = c2.id);

COMMIT;
