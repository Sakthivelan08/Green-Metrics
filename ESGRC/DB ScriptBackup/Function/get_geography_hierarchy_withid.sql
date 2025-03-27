-- FUNCTION: public.get_geography_hierarchy_withid(bigint)

-- DROP FUNCTION IF EXISTS public.get_geography_hierarchy_withid(bigint);

CREATE OR REPLACE FUNCTION public.get_geography_hierarchy_withid(
	locationid bigint)
    RETURNS TABLE(id bigint, name character varying, type_name character varying) 
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
WITH RECURSIVE location_hierarchy AS (
    SELECT 
        g.id, 
        g.name, 
        g.parentid,
        t.name AS type
    FROM 
        geography g
    JOIN 
        type t ON g.typeid = t.id
    WHERE 
        g.id = locationid
    
    UNION ALL
    
    SELECT 
        g.id, 
        g.name, 
        g.parentid,
        t.name AS type
    FROM 
        geography g
    JOIN 
        type t ON g.typeid = t.id
    INNER JOIN 
        location_hierarchy lh ON g.id = lh.parentid
)
SELECT 
    id,
    name,
    type
FROM 
    location_hierarchy
ORDER BY 
    id;
$BODY$;

ALTER FUNCTION public.get_geography_hierarchy_withid(bigint)
    OWNER TO danubehome;
