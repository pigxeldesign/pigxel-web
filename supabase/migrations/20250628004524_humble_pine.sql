/*
  # Initial Database Schema for Web3 dApp Directory

  1. New Tables
    - `profiles` - User profiles with role-based access (admin, general_user, premium_user)
    - `categories` - dApp categories with metadata
    - `dapps` - Decentralized applications with detailed information
    - `integrations` - Third-party integrations
    - `dapp_integrations` - Junction table for dApps and integrations
    - `flows` - User flows/tutorials (with premium access control)
    - `flow_screens` - Individual screens within flows

  2. Security
    - Enable RLS on all tables
    - Admin-only policies for content management (INSERT, UPDATE, DELETE)
    - Role-based SELECT policies for different user types
    - Premium content access control

  3. Storage
    - Buckets for dApp logos, thumbnails, and flow screen images
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('admin', 'general_user', 'premium_user');
CREATE TYPE difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  user_type user_type_enum DEFAULT 'general_user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  color_gradient text NOT NULL,
  sub_categories text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. dApps table
CREATE TABLE IF NOT EXISTS dapps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  problem_solved text NOT NULL,
  logo_url text,
  thumbnail_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sub_category text NOT NULL,
  blockchains text[] DEFAULT '{}' NOT NULL,
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  user_count text DEFAULT '0',
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  live_url text NOT NULL,
  github_url text,
  twitter_url text,
  documentation_url text,
  discord_url text,
  founded text,
  team text,
  total_value_locked text,
  daily_active_users text,
  transactions text,
  audits text[] DEFAULT '{}',
  licenses text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_emoji text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. dApp integrations junction table
CREATE TABLE IF NOT EXISTS dapp_integrations (
  dapp_id uuid REFERENCES dapps(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (dapp_id, integration_id)
);

-- 6. Flows table
CREATE TABLE IF NOT EXISTS flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dapp_id uuid REFERENCES dapps(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  duration text NOT NULL,
  difficulty difficulty_enum DEFAULT 'Beginner' NOT NULL,
  screen_count integer DEFAULT 0 NOT NULL,
  is_premium boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Flow screens table
CREATE TABLE IF NOT EXISTS flow_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
  order_index integer NOT NULL,
  thumbnail_url text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(flow_id, order_index)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_dapps_category_id ON dapps(category_id);
CREATE INDEX IF NOT EXISTS idx_dapps_is_featured ON dapps(is_featured);
CREATE INDEX IF NOT EXISTS idx_dapps_is_new ON dapps(is_new);
CREATE INDEX IF NOT EXISTS idx_flows_dapp_id ON flows(dapp_id);
CREATE INDEX IF NOT EXISTS idx_flows_is_premium ON flows(is_premium);
CREATE INDEX IF NOT EXISTS idx_flow_screens_flow_id ON flow_screens(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_screens_order ON flow_screens(flow_id, order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dapps_updated_at BEFORE UPDATE ON dapps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flow_screens_updated_at BEFORE UPDATE ON flow_screens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dapps ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dapp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_screens ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is premium
CREATE OR REPLACE FUNCTION is_premium_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type IN ('premium_user', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for categories table
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for dapps table
CREATE POLICY "Anyone can view dapps"
  ON dapps FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert dapps"
  ON dapps FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update dapps"
  ON dapps FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete dapps"
  ON dapps FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for integrations table
CREATE POLICY "Anyone can view integrations"
  ON integrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for dapp_integrations table
CREATE POLICY "Anyone can view dapp integrations"
  ON dapp_integrations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert dapp integrations"
  ON dapp_integrations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete dapp integrations"
  ON dapp_integrations FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for flows table
CREATE POLICY "Anyone can view free flows"
  ON flows FOR SELECT
  TO anon, authenticated
  USING (NOT is_premium);

CREATE POLICY "Premium users can view premium flows"
  ON flows FOR SELECT
  TO authenticated
  USING (is_premium AND is_premium_user());

CREATE POLICY "Admins can view all flows"
  ON flows FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert flows"
  ON flows FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update flows"
  ON flows FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete flows"
  ON flows FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS Policies for flow_screens table
CREATE POLICY "Users can view screens of accessible flows"
  ON flow_screens FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM flows 
      WHERE flows.id = flow_screens.flow_id 
      AND (
        NOT flows.is_premium 
        OR (flows.is_premium AND is_premium_user())
        OR is_admin()
      )
    )
  );

CREATE POLICY "Admins can insert flow screens"
  ON flow_screens FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update flow screens"
  ON flow_screens FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete flow screens"
  ON flow_screens FOR DELETE
  TO authenticated
  USING (is_admin());

-- Function to automatically update screen_count in flows table
CREATE OR REPLACE FUNCTION update_flow_screen_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flows 
    SET screen_count = (
      SELECT COUNT(*) FROM flow_screens WHERE flow_id = NEW.flow_id
    )
    WHERE id = NEW.flow_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flows 
    SET screen_count = (
      SELECT COUNT(*) FROM flow_screens WHERE flow_id = OLD.flow_id
    )
    WHERE id = OLD.flow_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update screen_count
CREATE TRIGGER update_flow_screen_count_trigger
  AFTER INSERT OR DELETE ON flow_screens
  FOR EACH ROW EXECUTE FUNCTION update_flow_screen_count();