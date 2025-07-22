/*
  # Fix RLS Policies for Books and Storage

  This migration fixes the Row Level Security policies that are causing upload failures.
  
  1. Books Table Policies
    - Allow authenticated users to read all books
    - Allow authenticated users to insert books (with uploaded_by check)
    - Allow users to update/delete their own books
    - Allow admins to manage all books
    
  2. Storage Bucket Policies
    - Allow authenticated users to upload files
    - Allow users to access their own files
    - Allow admins to manage all files
*/

-- Drop existing conflicting policies on books table
DROP POLICY IF EXISTS "Authenticated users can read books" ON books;
DROP POLICY IF EXISTS "Authenticated users can read all books" ON books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
DROP POLICY IF EXISTS "Users can update their own books" ON books;
DROP POLICY IF EXISTS "Users can delete their own books" ON books;
DROP POLICY IF EXISTS "Admins can manage all books" ON books;

-- Create comprehensive RLS policies for books table
CREATE POLICY "Enable read access for authenticated users" ON books
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON books
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Enable update for book owners" ON books
  FOR UPDATE TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Enable delete for book owners" ON books
  FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Enable all operations for admins" ON books
  FOR ALL TO authenticated
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

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;

-- Create storage policies for books bucket
CREATE POLICY "Enable upload for authenticated users" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'books');

CREATE POLICY "Enable read access for authenticated users" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'books');

CREATE POLICY "Enable update for file owners" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'books' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'books' AND auth.uid()::text = owner);

CREATE POLICY "Enable delete for file owners" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'books' AND auth.uid()::text = owner);

CREATE POLICY "Enable all operations for admins on storage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'books' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'books' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );