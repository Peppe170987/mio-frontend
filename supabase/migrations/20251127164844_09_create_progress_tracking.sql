/*
  # Create progress tracking

  1. New Tables
    - `client_progress`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references client_profiles.id)
      - `date` (date)
      - `weight` (numeric)
      - `body_fat_percentage` (numeric)
      - `measurements` (jsonb) - chest, waist, hips, arms, legs, etc.
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `client_progress`
    - Clients can read/create own progress
    - Trainers can read progress for assigned clients

  3. Notes
    - Tracks weight, measurements, and body composition over time
    - Used for monitoring client progress
*/

CREATE TABLE IF NOT EXISTS client_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  weight numeric(6, 2),
  body_fat_percentage numeric(5, 2),
  measurements jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create own progress"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own progress"
  ON client_progress FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Trainers can read assigned client progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE client_profiles.id = client_progress.client_id
      AND client_profiles.assigned_trainer_id = auth.uid()
    )
  );
