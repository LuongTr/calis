ALTER TABLE users DROP CONSTRAINT IF EXISTS users_training_style_check;
ALTER TABLE users
  ADD CONSTRAINT users_training_style_check
  CHECK (training_style IN ('full_body', 'upper_lower', 'push_pull_legs'));
