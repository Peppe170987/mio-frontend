/*
  # Create plan exercises (join table)

  1. New Tables
    - `plan_exercises`
      - `id` (uuid, primary key)
      - `workout_day_id` (uuid, references workout_days.id)
      - `exercise_id` (uuid, references exercises.id)
      - `sets` (integer)
      - `reps` (text)
      - `weight` (numeric)
      - `rest_seconds` (integer)
      - `notes` (text)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `plan_exercises`
    - Same access as workout_plans

  3. Notes
    - Join table linking exercises to specific days in workout plans
    - Stores exercise-specific details (sets, reps, weight, etc.)
*/

CREATE TABLE IF NOT EXISTS plan_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id uuid NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer DEFAULT 3,
  reps text DEFAULT '8-12',
  weight numeric(8, 2),
  rest_seconds integer DEFAULT 60,
  notes text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read plan exercises"
  ON plan_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_days
      JOIN workout_plans ON workout_plans.id = workout_days.plan_id
      WHERE workout_days.id = plan_exercises.workout_day_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create plan exercises"
  ON plan_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_days
      JOIN workout_plans ON workout_plans.id = workout_days.plan_id
      WHERE workout_days.id = workout_day_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update plan exercises"
  ON plan_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_days
      JOIN workout_plans ON workout_plans.id = workout_days.plan_id
      WHERE workout_days.id = plan_exercises.workout_day_id
      AND workout_plans.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_days
      JOIN workout_plans ON workout_plans.id = workout_days.plan_id
      WHERE workout_days.id = workout_day_id
      AND workout_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can read plan exercises"
  ON plan_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_days
      JOIN workout_plans ON workout_plans.id = workout_days.plan_id
      WHERE workout_days.id = plan_exercises.workout_day_id
      AND workout_plans.client_id = auth.uid()
    )
  );
