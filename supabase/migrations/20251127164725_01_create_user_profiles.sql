/*
  # Create user profiles and role setup

  1. New Tables
    - `user_profiles` (extends auth.users)
      - `id` (uuid, primary key, references auth.users.id)
      - `email` (text, from auth.users)
      - `user_type` (enum: 'client' or 'trainer')
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `bio` (text)
      - `profile_image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles`
    - Users can read their own profile
    - Users can update their own profile
    - Trainers and clients can view each other's public info

  3. Notes
    - This table extends the built-in auth.users table
    - user_type determines if they are a client or trainer
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('client', 'trainer')),
  first_name text,
  last_name text,
  phone text,
  bio text,
  profile_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view public trainer info"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_type = 'trainer');

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
