-- EMERGENCY FIX: Temporarily disable RLS or create super permissive policies
-- Run this in your Supabase SQL Editor

-- Option 1: Temporarily disable RLS entirely (for testing)
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, use this super permissive policy instead
-- First drop all existing policies
DROP POLICY IF EXISTS "Allow all authenticated users to read books" ON books;
DROP POLICY IF EXISTS "Allow all authenticated users to insert books" ON books;
DROP POLICY IF EXISTS "Allow all authenticated users to update books" ON books;
DROP POLICY IF EXISTS "Allow all authenticated users to delete books" ON books;

-- Create a single super permissive policy
CREATE POLICY "Allow everything for everyone" ON books
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Also fix the users table RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or create permissive policy for users table
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Ensure the books bucket exists and has proper permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  209715200, -- 200MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop all storage policies and create super permissive ones
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to book files" ON storage.objects;

-- Super permissive storage policies
CREATE POLICY "Allow all storage operations" ON storage.objects
  FOR ALL TO public
  USING (bucket_id = 'books')
  WITH CHECK (bucket_id = 'books');