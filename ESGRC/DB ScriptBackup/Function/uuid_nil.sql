-- FUNCTION: public.uuid_nil()

-- DROP FUNCTION IF EXISTS public.uuid_nil();

CREATE OR REPLACE FUNCTION public.uuid_nil(
	)
    RETURNS uuid
    LANGUAGE 'c'
    COST 1
    IMMUTABLE STRICT PARALLEL SAFE 
AS '$libdir/uuid-ossp', 'uuid_nil'
;

ALTER FUNCTION public.uuid_nil()
    OWNER TO danubehome;
