/*
  # Create workout days

  1. New Tables
    - `workout_days`
      - `id` (uuid, primary key)
      - `plan_id` (uuid, references workout_plans.id)
      - `day_of_week` (integer: 0-6)
      - `day_name` (text)
      - `focus` (text)
      - `rest_day` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workout_days`
    - Same access as workout_plans

  3. Notes
    - Represents each day of the week within a plan
    - Contains exercises for that specific day
*/

CREATE TABLE IF NOT EXISTS workout_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  day_name text NOT NULL,
  focus text,
  rest_day boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read workout days"
  ON workout_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = workout_days.plan_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create workout days"
  ON workout_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = plan_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update workout days"
  ON workout_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = workout_days.plan_id
      AND workout_plans.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = plan_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can read workout days"
  ON workout_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = workout_days.plan_id
      AND workout_plans.client_id = auth.uid()
    )
  );
