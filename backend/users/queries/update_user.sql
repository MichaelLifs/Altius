UPDATE users 
SET {FIELDS}
WHERE id = :user_id AND deleted = false 
RETURNING id, name, last_name, email, role, deleted, created_at, updated_at;


