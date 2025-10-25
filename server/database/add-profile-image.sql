-- Agregar columna profile_image_path a user_profiles si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='user_profiles' 
        AND column_name='profile_image_path'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN profile_image_path VARCHAR(500);
        RAISE NOTICE 'Columna profile_image_path agregada exitosamente a user_profiles';
    ELSE
        RAISE NOTICE 'Columna profile_image_path ya existe en user_profiles';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al agregar columna: %', SQLERRM;
END$$ LANGUAGE plpgsql;
