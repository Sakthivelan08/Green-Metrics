-- FUNCTION: public.uuid_ns_url()

-- DROP FUNCTION IF EXISTS public.uuid_ns_url();

CREATE OR REPLACE FUNCTION public.uuid_ns_url(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    IMMUTABLE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_ns_url'
;

ALTER FUNCTION public.uuid_ns_url()
    OWNER TO danubehome;
