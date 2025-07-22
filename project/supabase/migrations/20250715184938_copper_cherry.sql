/*
  # Create users and books tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text)
      - `role` (text, default 'student', check constraint)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    - `books`
      - `id` (uuid, primary key, auto-generated)
      - `title` (text, not null)
      - `subject` (text, not null)
      - `semester` (integer, check 1-8)
      - `author` (text)
      - `cover_image_url` (text)
      - `pdf_url` (text, not null)
      - `file_path` (text)
      - `file_size` (bigint)
      - `uploaded_by` (uuid, foreign key to users)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on both tables
    - Users can read/update their own data
    - All authenticated users can read books
    - Users can manage their own books
    - Admins can manage all books

  3. Indexes
    - Performance indexes on commonly queried columns
*/

-- Drop if exists (WARNING: will delete existing data)
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create books table
CREATE TABLE public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  author TEXT,
  cover_image_url TEXT,
  pdf_url TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for books table
CREATE POLICY "Authenticated users can read books" ON public.books
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own books" ON public.books
  FOR UPDATE TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own books" ON public.books
  FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all books" ON public.books
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX books_semester_idx ON public.books(semester);
CREATE INDEX books_subject_idx ON public.books(subject);
CREATE INDEX books_uploaded_by_idx ON public.books(uploaded_by);
CREATE INDEX books_created_at_idx ON public.books(created_at DESC);