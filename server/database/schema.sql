-- Schema para la base de datos de la aplicación de votaciones
-- Crea las tablas principales: users, campaigns, candidates, votes

BEGIN;

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
    campaign_id INTEGER NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE
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

-- Índices para acelerar joins y búsquedas
CREATE INDEX IF NOT EXISTS idx_candidates_campaign ON public.candidates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_votes_campaign ON public.votes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);

COMMIT;
