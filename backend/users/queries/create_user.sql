INSERT INTO users (name, last_name, email, password, role) 
VALUES (:name, :last_name, :email, :password, :role) 
RETURNING id, name, last_name, email, role, deleted, created_at, updated_at;


