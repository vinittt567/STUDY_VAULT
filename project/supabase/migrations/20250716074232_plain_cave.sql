/*
  # Create storage bucket for books

  1. Storage
    - Create 'books' bucket for PDF files
    - Set up public access policies
    - Configure file upload permissions

  2. Security
    - Allow authenticated users to upload files
    - Allow public read access to files
    - Restrict file types to PDF only
*/

-- Create the books storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  209715200, -- 200MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload books"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own book files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'books' AND auth.uid()::text = owner);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own book files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'books' AND auth.uid()::text = owner);

-- Allow public read access to book files
CREATE POLICY "Public can view book files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'books');