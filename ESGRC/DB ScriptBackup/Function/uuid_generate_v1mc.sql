-- FUNCTION: public.uuid_generate_v1mc()

-- DROP FUNCTION IF EXISTS public.uuid_generate_v1mc();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    VOLATILE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_generate_v1mc'
;

ALTER FUNCTION public.uuid_generate_v1mc()
    OWNER TO danubehome;
