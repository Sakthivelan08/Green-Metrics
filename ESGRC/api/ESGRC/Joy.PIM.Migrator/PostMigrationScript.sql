CREATE VIEW vw_user_list_item AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.mobile,
    u.isactive
FROM appuser u;

CREATE VIEW vw_labels AS
SELECT 
    l.id,
    l.name,
    l.description,
    l.languageid,
    la.name AS language,
    l.isactive
FROM label l
JOIN language la
    ON l.languageid = la.id;