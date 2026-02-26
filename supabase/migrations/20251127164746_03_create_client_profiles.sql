/*
  # Create client profiles

  1. New Tables
    - `client_profiles`
      - `id` (uuid, primary key, references user_profiles.id)
      - `assigned_trainer_id` (uuid, references trainer_profiles.id)
      - `fitness_goal` (enum: 'lose_fat', 'gain_muscle', 'tone', 'endurance', 'athletic_prep', 'rehabilitation')
      - `current_weight` (numeric)
      - `target_weight` (numeric)
      - `height_cm` (integer)
      - `age` (integer)
      - `gender` (text)
      - `injuries_limitations` (text)
      - `start_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `client_profiles`
    - Clients can read/update own profile
    - Assigned trainers can read client profile
    - Clients can insert own profile

  3. Notes
    - Extends user_profiles for clients specifically
    - Stores client-specific information and fitness goals
*/

CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  assigned_trainer_id uuid REFERENCES trainer_profiles(id) ON DELETE SET NULL,
  fitness_goal text CHECK (fitness_goal IN ('lose_fat', 'gain_muscle', 'tone', 'endurance', 'athletic_prep', 'rehabilitation')),
  current_weight numeric(6, 2),
  target_weight numeric(6, 2),
  height_cm integer,
  age integer,
  gender text,
  injuries_limitations text,
  start_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own profile"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Assigned trainers can read client profile"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (assigned_trainer_id = auth.uid());

CREATE POLICY "Clients can insert own profile"
  ON client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
