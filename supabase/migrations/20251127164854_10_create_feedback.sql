/*
  # Create feedback system

  1. New Tables
    - `client_feedback`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references client_profiles.id)
      - `trainer_id` (uuid, references trainer_profiles.id)
      - `workout_plan_id` (uuid, references workout_plans.id)
      - `title` (text)
      - `message` (text)
      - `rating` (integer 1-5)
      - `is_read` (boolean)
      - `created_at` (timestamp)
      - `read_at` (timestamp)

  2. Security
    - Enable RLS on `client_feedback`
    - Clients can create feedback
    - Trainers can read feedback for their clients
    - Clients can read own feedback

  3. Notes
    - Clients send feedback to their trainers
    - Trainers can track client satisfaction
*/

CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create feedback"
  ON client_feedback FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can read own feedback"
  ON client_feedback FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Trainers can read client feedback"
  ON client_feedback FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can update feedback read status"
  ON client_feedback FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());
