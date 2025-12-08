SELECT id, name, last_name, email, password, role, deleted, created_at, updated_at
FROM users 
WHERE LOWER(email) = LOWER(:email) AND deleted = false;


