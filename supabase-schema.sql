-- CoolDecide Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Boiling Datasets table
CREATE TABLE IF NOT EXISTS boiling_datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('experiment', 'literature')),
  data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  experiment_meta JSONB,
  literature_meta JSONB
);

-- Boiling Backups table
CREATE TABLE IF NOT EXISTS boiling_backups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  datasets JSONB NOT NULL DEFAULT '[]',
  dataset_count INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE boiling_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE boiling_backups ENABLE ROW LEVEL SECURITY;

-- Allow public access (for anon key)
-- These policies allow anyone with the anon key to read/write
-- For production, you would want to add authentication

CREATE POLICY "Allow public read access" ON boiling_datasets
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON boiling_datasets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON boiling_datasets
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON boiling_datasets
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON boiling_backups
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON boiling_backups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON boiling_backups
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON boiling_backups
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boiling_datasets_created_at ON boiling_datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boiling_backups_created_at ON boiling_backups(created_at DESC);
