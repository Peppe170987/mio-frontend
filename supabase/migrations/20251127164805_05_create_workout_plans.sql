/*
  # Create workout plans

  1. New Tables
    - `workout_plans`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references trainer_profiles.id)
      - `client_id` (uuid, references client_profiles.id)
      - `name` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `duration_weeks` (integer)
      - `difficulty_level` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workout_plans`
    - Trainers can create/manage plans for their clients
    - Clients can read their assigned plans
    - Only trainer and assigned client can access

  3. Notes
    - A trainer creates a workout plan for each client
    - Plans have duration and difficulty levels
*/

CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  duration_weeks integer DEFAULT 12,
  difficulty_level text DEFAULT 'intermediate',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read client plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can create plans"
  ON workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update plans"
  ON workout_plans FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete plans"
  ON workout_plans FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Clients can read own plans"
  ON workout_plans FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
