-- Schéma de base de données pour les plateformes belges
-- 
-- 1. Nouvelles Tables
--    platforms: Gestion des différentes plateformes
--    user_platform_auth: Authentification par plateforme pour chaque utilisateur
--    platform_favorites: Favoris multi-plateformes
--    platform_watch_history: Historique de visionnage multi-plateformes
--
-- 2. Security
--    Enable RLS on all tables
--    Users can only access their own data

-- Table platforms
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  logo_url text,
  requires_auth boolean DEFAULT false,
  is_active boolean DEFAULT true,
  auth_type text DEFAULT 'none',
  primary_color text DEFAULT '#3B82F6',
  category text DEFAULT 'national',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table user_platform_auth
CREATE TABLE IF NOT EXISTS user_platform_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  is_authenticated boolean DEFAULT false,
  auth_data jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_id)
);

-- Table platform_favorites
CREATE TABLE IF NOT EXISTS platform_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  content_id text NOT NULL,
  content_type text NOT NULL,
  content_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_id, content_id)
);

-- Table platform_watch_history
CREATE TABLE IF NOT EXISTS platform_watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  content_id text NOT NULL,
  content_type text NOT NULL,
  content_data jsonb DEFAULT '{}'::jsonb,
  progress integer DEFAULT 0,
  duration integer DEFAULT 0,
  last_watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform_id, content_id)
);

-- Enable RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platform_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_watch_history ENABLE ROW LEVEL SECURITY;

-- Policies for platforms (public read)
CREATE POLICY "Anyone can view active platforms"
  ON platforms FOR SELECT
  USING (is_active = true);

-- Policies for user_platform_auth
CREATE POLICY "Users can view own platform auth"
  ON user_platform_auth FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform auth"
  ON user_platform_auth FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform auth"
  ON user_platform_auth FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own platform auth"
  ON user_platform_auth FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for platform_favorites
CREATE POLICY "Users can view own favorites"
  ON platform_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON platform_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON platform_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for platform_watch_history
CREATE POLICY "Users can view own watch history"
  ON platform_watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON platform_watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON platform_watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON platform_watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial Belgian platforms
INSERT INTO platforms (slug, name, description, logo_url, requires_auth, auth_type, primary_color, category) VALUES
  ('rtbf', 'RTBF Auvio', 'Radio-télévision belge de la Communauté française', '/logos/rtbf.png', true, 'gigya', '#E31E24', 'national'),
  ('rtlplay', 'RTL Play', 'Groupe RTL Belgium - RTL-TVI, Club RTL, Plug RTL', '/logos/rtlplay.png', true, 'oauth', '#FFD100', 'national'),
  ('ln24', 'LN24', 'Chaîne d''information en continu', '/logos/ln24.png', false, 'none', '#0066CC', 'national'),
  ('antennecentre', 'Antenne Centre', 'Télévision locale du Centre', '/logos/antennecentre.png', false, 'none', '#4CAF50', 'local'),
  ('bouke', 'Bouke', 'Télévision locale de la région', '/logos/bouke.png', false, 'none', '#FF5722', 'local'),
  ('canalzoom', 'Canal Zoom', 'Télévision locale', '/logos/canalzoom.png', false, 'none', '#9C27B0', 'local'),
  ('matele', 'Ma Télé', 'Télévision locale de Mons-Borinage', '/logos/matele.png', false, 'none', '#00BCD4', 'local'),
  ('notele', 'No Télé', 'Télévision locale de Wallonie picarde', '/logos/notele.png', false, 'none', '#8BC34A', 'local'),
  ('telesambre', 'Télé Sambre', 'Télévision locale de la région de Charleroi', '/logos/telesambre.png', false, 'none', '#3F51B5', 'local'),
  ('telemb', 'Télé MB', 'Télévision locale du Brabant wallon', '/logos/telemb.png', false, 'none', '#FF9800', 'local'),
  ('tvlux', 'TV Lux', 'Télévision locale de la province de Luxembourg', '/logos/tvlux.png', false, 'none', '#795548', 'local')
ON CONFLICT (slug) DO NOTHING;