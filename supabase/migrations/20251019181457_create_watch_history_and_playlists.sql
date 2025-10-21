/*
  # Create watch history and playlists tables

  ## Overview
  This migration creates the necessary tables for storing user watch history and playlists,
  enabling multi-device synchronization and persistent data storage.

  ## New Tables
  
  ### `watch_history`
  - `id` (uuid, primary key) - Unique identifier for each watch history entry
  - `video_id` (text, not null) - External video ID from RTBF API
  - `progress` (numeric, not null) - Playback progress (0.0 to 1.0)
  - `video_data` (jsonb, not null) - Cached video metadata
  - `updated_at` (timestamptz, not null) - Last update timestamp
  - `created_at` (timestamptz, not null) - Creation timestamp
  
  ### `playlists`
  - `id` (uuid, primary key) - Unique identifier for each playlist
  - `name` (text, not null) - Playlist name
  - `created_at` (timestamptz, not null) - Creation timestamp
  - `updated_at` (timestamptz, not null) - Last update timestamp
  
  ### `playlist_videos`
  - `id` (uuid, primary key) - Unique identifier for each playlist video entry
  - `playlist_id` (uuid, not null, foreign key) - References playlists table
  - `video_data` (jsonb, not null) - Cached video metadata
  - `added_at` (timestamptz, not null) - When video was added to playlist
  - `position` (integer, not null) - Order position in playlist

  ## Security
  - Enable RLS on all tables
  - Public access for now (future: add authentication-based policies)

  ## Indexes
  - Index on `watch_history.video_id` for fast lookups
  - Index on `playlist_videos.playlist_id` for efficient playlist queries
  - Index on `playlist_videos.position` for ordered retrieval
*/

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  progress numeric NOT NULL CHECK (progress >= 0 AND progress <= 1),
  video_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(video_id)
);

-- Create index on video_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_watch_history_video_id ON watch_history(video_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_updated_at ON watch_history(updated_at DESC);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies for watch_history (public access for now)
CREATE POLICY "Allow all operations on watch_history"
  ON watch_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for playlists (public access for now)
CREATE POLICY "Allow all operations on playlists"
  ON playlists FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create playlist_videos table
CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_data jsonb NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  position integer NOT NULL DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_position ON playlist_videos(playlist_id, position);

-- Enable RLS
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for playlist_videos (public access for now)
CREATE POLICY "Allow all operations on playlist_videos"
  ON playlist_videos FOR ALL
  USING (true)
  WITH CHECK (true);