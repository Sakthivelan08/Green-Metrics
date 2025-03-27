-- FUNCTION: public.uuid_ns_x500()

-- DROP FUNCTION IF EXISTS public.uuid_ns_x500();

CREATE OR REPLACE FUNCTION public.uuid_ns_x500(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    IMMUTABLE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_ns_x500'
;

ALTER FUNCTION public.uuid_ns_x500()
    OWNER TO danubehome;
