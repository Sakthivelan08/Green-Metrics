-- FUNCTION: public.get_table_columns(text)

-- DROP FUNCTION IF EXISTS public.get_table_columns(text);

CREATE OR REPLACE FUNCTION public.get_table_columns(
	p_table_name text)
    RETURNS TABLE(columns text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        column_name::text
          FROM 
        information_schema.columns
    WHERE 
        table_name = p_table_name;
END;
$BODY$;

ALTER FUNCTION public.get_table_columns(text)
    OWNER TO danubehome;
