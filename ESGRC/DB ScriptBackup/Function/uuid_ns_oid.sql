-- FUNCTION: public.uuid_ns_oid()

-- DROP FUNCTION IF EXISTS public.uuid_ns_oid();

CREATE OR REPLACE FUNCTION public.uuid_ns_oid(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    IMMUTABLE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_ns_oid'
;

ALTER FUNCTION public.uuid_ns_oid()
    OWNER TO danubehome;
