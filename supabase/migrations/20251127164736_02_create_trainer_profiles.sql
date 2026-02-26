/*
  # Create trainer profiles

  1. New Tables
    - `trainer_profiles`
      - `id` (uuid, primary key, references user_profiles.id)
      - `specialization` (text)
      - `experience_years` (integer)
      - `certifications` (text array)
      - `hourly_rate` (numeric)
      - `is_available` (boolean)
      - `max_clients` (integer)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trainer_profiles`
    - Trainers can manage their own profile
    - Clients can view trainer profiles

  3. Notes
    - Extends user_profiles for trainers specifically
    - Stores trainer-specific information
*/

CREATE TABLE IF NOT EXISTS trainer_profiles (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  specialization text,
  experience_years integer DEFAULT 0,
  certifications text[] DEFAULT '{}',
  hourly_rate numeric(10, 2),
  is_available boolean DEFAULT true,
  max_clients integer DEFAULT 20,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read own profile"
  ON trainer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Trainers can update own profile"
  ON trainer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Clients can view trainer profiles"
  ON trainer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Trainers can insert own profile"
  ON trainer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
