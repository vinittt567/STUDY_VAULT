/*
  # Create Default Admin User

  1. Purpose
    - Creates a default admin user for testing and initial setup
    - Ensures admin can access the system immediately after setup

  2. Admin Details
    - Email: admin@example.com
    - Role: admin
    - This will be used with password: password123 (set during signup)

  3. Security
    - Admin user will have full access to all books and admin panel
    - Can manage all books regardless of who uploaded them
*/

-- Insert default admin user (this will be linked when they sign up)
-- The actual user creation happens through Supabase Auth, this just ensures
-- the profile will be created with admin role when they sign up

-- Note: This is just a placeholder. The actual user creation happens
-- through the signup process with the email admin@example.com