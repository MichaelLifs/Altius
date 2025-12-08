SELECT id, name, last_name, email, role, deleted, created_at, updated_at
FROM users 
WHERE id = :user_id AND deleted = false;


