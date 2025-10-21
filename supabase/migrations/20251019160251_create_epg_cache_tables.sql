/*
  # Create EPG Cache Tables

  1. New Tables
    - `epg_channels`
      - `id` (text, primary key) - Channel ID from RTBF API
      - `label` (text) - Channel name
      - `data` (jsonb) - Complete channel data from API
      - `cached_at` (timestamptz) - When this data was cached
      - `created_at` (timestamptz) - Record creation time

    - `epg_programs`
      - `id` (uuid, primary key)
      - `channel_id` (text, foreign key to epg_channels)
      - `program_id` (text) - Program ID from RTBF API
      - `external_id` (text) - External asset ID
      - `title` (text) - Program title
      - `subtitle` (text) - Program subtitle
      - `description` (text) - Program description
      - `start_time` (timestamptz) - Program start time
      - `end_time` (timestamptz) - Program end time
      - `illustration` (text) - Image URL
      - `is_available` (boolean) - Availability status
      - `data` (jsonb) - Complete program data from API
      - `cached_at` (timestamptz) - When this data was cached
      - `created_at` (timestamptz) - Record creation time

    - `live_channel_cache`
      - `id` (text, primary key) - Channel ID or external_id
      - `data` (jsonb) - Complete live channel data
      - `cached_at` (timestamptz) - When this data was cached
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (EPG data is public)
    - No write policies needed (only API writes to cache)

  3. Indexes
    - Index on channel_id for fast program lookups
    - Index on start_time and end_time for schedule queries
    - Index on cached_at for cache invalidation queries

  4. Important Notes
    - Cache TTL is handled in application logic
    - Data older than 1 hour should be refreshed
    - JSONB columns allow flexible storage of API responses
*/

CREATE TABLE IF NOT EXISTS epg_channels (
  id text PRIMARY KEY,
  label text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  cached_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS epg_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  program_id text NOT NULL,
  external_id text,
  title text NOT NULL,
  subtitle text,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  illustration text,
  is_available boolean DEFAULT false,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  cached_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_channel FOREIGN KEY (channel_id) REFERENCES epg_channels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_channel_cache (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  cached_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_epg_programs_channel_id ON epg_programs(channel_id);
CREATE INDEX IF NOT EXISTS idx_epg_programs_start_time ON epg_programs(start_time);
CREATE INDEX IF NOT EXISTS idx_epg_programs_end_time ON epg_programs(end_time);
CREATE INDEX IF NOT EXISTS idx_epg_programs_cached_at ON epg_programs(cached_at);
CREATE INDEX IF NOT EXISTS idx_epg_channels_cached_at ON epg_channels(cached_at);
CREATE INDEX IF NOT EXISTS idx_live_channel_cache_cached_at ON live_channel_cache(cached_at);

ALTER TABLE epg_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE epg_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_channel_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "EPG channels are publicly readable"
  ON epg_channels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "EPG programs are publicly readable"
  ON epg_programs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Live channel cache is publicly readable"
  ON live_channel_cache FOR SELECT
  TO public
  USING (true);