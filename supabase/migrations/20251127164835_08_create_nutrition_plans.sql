/*
  # Create nutrition plans

  1. New Tables
    - `nutrition_plans`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references trainer_profiles.id)
      - `client_id` (uuid, references client_profiles.id)
      - `name` (text)
      - `description` (text)
      - `daily_calories` (integer)
      - `protein_g` (numeric)
      - `carbs_g` (numeric)
      - `fats_g` (numeric)
      - `start_date` (date)
      - `end_date` (date)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `nutrition_plans`
    - Trainers can create/manage plans for clients
    - Clients can read their assigned plans

  3. Notes
    - Personalized nutrition plans created by trainers
    - Contains macro targets for clients
*/

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  daily_calories integer,
  protein_g numeric(8, 2),
  carbs_g numeric(8, 2),
  fats_g numeric(8, 2),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read nutrition plans"
  ON nutrition_plans FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can create nutrition plans"
  ON nutrition_plans FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update nutrition plans"
  ON nutrition_plans FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete nutrition plans"
  ON nutrition_plans FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Clients can read own nutrition plans"
  ON nutrition_plans FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
