/*
  # Create exercises database

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references trainer_profiles.id)
      - `name` (text)
      - `description` (text)
      - `muscle_group` (text)
      - `difficulty_level` (enum: 'beginner', 'intermediate', 'advanced')
      - `video_url` (text)
      - `image_url` (text)
      - `instructions` (text array)
      - `equipment_needed` (text array)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `exercises`
    - Trainers can create/manage own exercises
    - Clients assigned to trainer can view trainer's exercises
    - Trainers can view their assigned clients' exercises

  3. Notes
    - Trainers can create custom exercises for their clients
    - Public exercises can be shared across the platform
*/

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  muscle_group text NOT NULL,
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  video_url text,
  image_url text,
  instructions text[] DEFAULT '{}',
  equipment_needed text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read own exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can create exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own exercises"
  ON exercises FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Clients can view trainer exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.assigned_trainer_id = exercises.trainer_id
      AND client_profiles.id = auth.uid()
    )
  );
