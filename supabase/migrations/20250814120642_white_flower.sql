/*
  # Goal Dashboard Schema

  1. New Tables
    - `goal_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `timeframe` (text, enum: daily/weekly/monthly/quarterly/yearly/lifelong)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `tasks`
      - `id` (uuid, primary key)
      - `board_id` (uuid, foreign key to goal_boards)
      - `text` (text)
      - `completed` (boolean, default false)
      - `order_index` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own boards and tasks
    - Policies for CRUD operations based on user authentication

  3. Indexes
    - Index on user_id for efficient board queries
    - Index on board_id for efficient task queries
    - Index on order_index for task ordering
*/

-- Create goal_boards table
CREATE TABLE IF NOT EXISTS goal_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifelong')),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, timeframe)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES goal_boards(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE goal_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_boards
CREATE POLICY "Users can view own boards"
  ON goal_boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own boards"
  ON goal_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boards"
  ON goal_boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own boards"
  ON goal_boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goal_boards 
      WHERE goal_boards.id = tasks.board_id 
      AND goal_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goal_boards 
      WHERE goal_boards.id = tasks.board_id 
      AND goal_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goal_boards 
      WHERE goal_boards.id = tasks.board_id 
      AND goal_boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goal_boards 
      WHERE goal_boards.id = tasks.board_id 
      AND goal_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goal_boards 
      WHERE goal_boards.id = tasks.board_id 
      AND goal_boards.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goal_boards_user_id ON goal_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_boards_timeframe ON goal_boards(timeframe);
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_goal_boards_updated_at
  BEFORE UPDATE ON goal_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();