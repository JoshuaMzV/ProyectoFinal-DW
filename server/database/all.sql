-- Schema para la base de datos de la aplicación de votaciones
-- Crea las tablas principales: users, campaigns, candidates, votes, user_profiles

-- Asegurarse de limpiar transacción abortada en la sesión (evita 25P02)
ROLLBACK;

-- Nota: no envolver este archivo en una única transacción (BEGIN/COMMIT)
-- porque si una instrucción falla la transacción entera queda abortada
-- y las órdenes siguientes se ignorarán (estado 25P02). Ejecuta este
-- archivo como una serie de sentencias independientes.

-- Usuarios (votantes y admins)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    numero_colegiado VARCHAR(50) UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    dpi VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin','votante')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Campañas
CREATE TABLE IF NOT EXISTS public.campaigns (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'deshabilitada',
    cantidad_votos INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT campaigns_estado_check CHECK (estado IN ('habilitada','deshabilitada','finalizada'))
);

-- Candidatos
CREATE TABLE IF NOT EXISTS public.candidates (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  campaign_id INTEGER NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NULL REFERENCES public.users(id) ON DELETE SET NULL
);

-- Votos
CREATE TABLE IF NOT EXISTS public.votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id),
    campaign_id INTEGER NOT NULL REFERENCES public.campaigns(id),
    candidate_id INTEGER NOT NULL REFERENCES public.candidates(id),
    fecha_voto TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT votes_unique_vote UNIQUE (user_id, campaign_id)
);

-- Perfiles de usuario (información adicional)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    licenciatura VARCHAR(255),
    carrera VARCHAR(255),
    edad INTEGER,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    profile_image_path VARCHAR(500),
    info_adicional JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Índices para acelerar joins y búsquedas
CREATE INDEX IF NOT EXISTS idx_candidates_campaign ON public.candidates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_votes_campaign ON public.votes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON public.user_profiles(user_id);

-- Inserts iniciales seguros (no usan ON CONFLICT) para evitar errores si no existen constraints
-- Inserta un admin root, un votante, una campaña y dos candidatos

-- Admin root
DO $$
BEGIN
  -- Admin root seguro
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'root') THEN
    INSERT INTO public.users (username, nombre_completo, email, dpi, fecha_nacimiento, password, role)
    VALUES ('root', 'Root', 'root@example.com', '0000000000000', DATE '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'admin');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping admin root insert: %', SQLERRM;
END$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- Votante de prueba seguro
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE numero_colegiado = '12345') THEN
    INSERT INTO public.users (numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password, role)
    VALUES ('12345', 'Joshua Mendez', 'j@gmail.com', '1234567890132', DATE '2000-01-01', '$2b$10$ho8Hfk1ZUvQDPgtnPnEnIOt05f5UjFKeSw9KGawMx04mwk0Di8aVu', 'votante');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping test voter insert: %', SQLERRM;
END$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- Campaña de ejemplo segura
  IF NOT EXISTS (SELECT 1 FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025') THEN
    INSERT INTO public.campaigns (titulo, descripcion, fecha_inicio, fecha_fin, estado)
    VALUES (
      'Elecciones Junta Directiva 2025',
      'Votación para elegir a los nuevos miembros de la junta.',
      TIMESTAMP WITH TIME ZONE '2025-09-25 14:00:00+00',
      TIMESTAMP WITH TIME ZONE '2025-10-20 00:00:00+00',
      'habilitada'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping campaign insert: %', SQLERRM;
END$$ LANGUAGE plpgsql;

DO $$
DECLARE
  cid INTEGER;
BEGIN
  -- Insertar candidatos sólo si la campaña existe
  SELECT id INTO cid FROM public.campaigns WHERE titulo = 'Elecciones Junta Directiva 2025' LIMIT 1;
  IF cid IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.candidates WHERE nombre = 'Ana Gómez' AND campaign_id = cid) THEN
      INSERT INTO public.candidates (nombre, campaign_id) VALUES ('Ana Gómez', cid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.candidates WHERE nombre = 'Carlos Valdes' AND campaign_id = cid) THEN
      INSERT INTO public.candidates (nombre, campaign_id) VALUES ('Carlos Valdes', cid);
    END IF;
  ELSE
    RAISE NOTICE 'Campaign not found, skipping candidates';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping candidates insert: %', SQLERRM;
END$$ LANGUAGE plpgsql;

