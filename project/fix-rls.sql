-- COMPREHENSIVE FIX for RLS policy issues
-- Run this in your Supabase SQL editor

-- 1. Drop all existing conflicting policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable update for book owners" ON books;
DROP POLICY IF EXISTS "Enable delete for book owners" ON books;
DROP POLICY IF EXISTS "Enable all operations for admins" ON books;
DROP POLICY IF EXISTS "Allow authenticated users to insert books" ON books;
DROP POLICY IF EXISTS "Authenticated users can read all books" ON books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
DROP POLICY IF EXISTS "Users can update their own books" ON books;
DROP POLICY IF EXISTS "Users can delete their own books" ON books;
DROP POLICY IF EXISTS "Admins can manage all books" ON books;

-- 2. Create simple, permissive policies for admin panel access
CREATE POLICY "Allow all authenticated users to read books" ON books
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow all authenticated users to insert books" ON books
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update books" ON books
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete books" ON books
  FOR DELETE TO authenticated
  USING (true);

-- 3. Ensure all authenticated users have a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    CASE 
      WHEN new.email = 'admin@example.com' THEN 'admin'
      ELSE 'student'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Fix storage policies to be more permissive
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for file owners" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for file owners" ON storage.objects;
DROP POLICY IF EXISTS "Enable all operations for admins on storage" ON storage.objects;

-- Create permissive storage policies
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'books');

CREATE POLICY "Allow authenticated users to read files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'books');

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'books')
  WITH CHECK (bucket_id = 'books');

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'books');

-- 6. Ensure books bucket exists and is properly configured
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