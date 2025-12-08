UPDATE users 
SET deleted = true 
WHERE id = :user_id AND deleted = false 
RETURNING id, name, last_name, email, role, deleted, created_at, updated_at;


