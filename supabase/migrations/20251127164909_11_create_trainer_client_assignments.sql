/*
  # Create trainer-client assignment tracking

  1. New Tables
    - `trainer_client_assignments`
      - `id` (uuid, primary key)
      - `trainer_id` (uuid, references trainer_profiles.id)
      - `client_id` (uuid, references client_profiles.id)
      - `start_date` (date)
      - `end_date` (date)
      - `is_active` (boolean)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trainer_client_assignments`
    - Trainers can manage their assignments
    - Clients can view their assignments

  3. Notes
    - Tracks trainer-client relationships
    - Can have multiple assignments per client
    - Current assignment tracked with is_active flag
*/

CREATE TABLE IF NOT EXISTS trainer_client_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trainer_client_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can read own assignments"
  ON trainer_client_assignments FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can create assignments"
  ON trainer_client_assignments FOR INSERT
  TO authenticated
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update assignments"
  ON trainer_client_assignments FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete assignments"
  ON trainer_client_assignments FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Clients can read own assignments"
  ON trainer_client_assignments FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
