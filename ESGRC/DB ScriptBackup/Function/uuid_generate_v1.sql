-- FUNCTION: public.uuid_generate_v1()

-- DROP FUNCTION IF EXISTS public.uuid_generate_v1();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    VOLATILE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_generate_v1'
;

ALTER FUNCTION public.uuid_generate_v1()
    OWNER TO danubehome;
