SELECT id, name, last_name, email, role, deleted, created_at, updated_at
FROM users 
WHERE LOWER(role) = LOWER(:role) AND deleted = false 
ORDER BY id;


