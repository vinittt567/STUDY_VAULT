/*
  # Fix Books RLS Policies for Upload

  1. Security Updates
    - Remove conflicting RLS policies
    - Add proper policies for authenticated users
    - Ensure admins can manage all books
    - Allow users to upload books with proper authentication

  2. Policy Changes
    - Simplify insert policy for authenticated users
    - Ensure uploaded_by field is properly handled
    - Fix policy conflicts
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow insert if uploaded_by = auth.uid()" ON books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
DROP POLICY IF EXISTS "Users can read own data" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

-- Create new, cleaner policies
CREATE POLICY "Authenticated users can read all books"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own books"
  ON books
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);

-- Ensure admins can do everything (keep existing admin policy)
-- This policy should already exist, but let's make sure it's correct
DROP POLICY IF EXISTS "Admins can manage all books" ON books;
CREATE POLICY "Admins can manage all books"
  ON books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );