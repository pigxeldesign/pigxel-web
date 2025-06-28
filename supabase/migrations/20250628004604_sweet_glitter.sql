/*
  # Insert Initial Data

  1. Categories
    - Insert the 6 main categories with proper metadata
  
  2. Sample Admin User
    - Create a sample admin profile (you'll need to update the ID)
  
  3. Sample Integrations
    - Common Web3 integrations
*/

-- Insert initial categories
INSERT INTO categories (slug, title, description, icon_name, color_gradient, sub_categories) VALUES
(
  'getting-started',
  'Getting Started with Web3',
  'Learn the basics of decentralized applications and digital ownership with beginner-friendly tools and educational resources.',
  'GraduationCap',
  'from-blue-500 to-cyan-600',
  ARRAY['Wallets', 'Educational', 'Tutorials', 'Onboarding']
),
(
  'digital-assets',
  'Managing Your Digital Assets',
  'Learn how to own, trade, and grow your digital property with DeFi protocols, trading platforms, and portfolio management tools.',
  'Wallet',
  'from-green-500 to-emerald-600',
  ARRAY['DeFi', 'Trading', 'Lending', 'Yield Farming', 'Portfolio Management']
),
(
  'communities',
  'Decentralized Communities',
  'Join and contribute to community-driven organizations, DAOs, and governance platforms that shape the future of collaboration.',
  'Users',
  'from-purple-500 to-violet-600',
  ARRAY['DAOs', 'Governance', 'Social Networks', 'Forums', 'Voting']
),
(
  'creative-publishing',
  'Creative & Publishing',
  'Monetize your creative work through decentralized platforms, NFT marketplaces, and content creation tools.',
  'Palette',
  'from-pink-500 to-rose-600',
  ARRAY['NFT Marketplaces', 'Content Creation', 'Art Platforms', 'Music', 'Writing']
),
(
  'data-infrastructure',
  'Data & Infrastructure',
  'Build and use decentralized data storage, computing networks, and infrastructure services for Web3 applications.',
  'Database',
  'from-orange-500 to-red-600',
  ARRAY['Storage', 'Computing', 'Oracles', 'Analytics', 'APIs']
),
(
  'real-world-apps',
  'Real-World Applications',
  'Solve everyday problems with blockchain technology through practical applications and utility-focused dApps.',
  'Globe',
  'from-teal-500 to-cyan-600',
  ARRAY['Identity', 'Supply Chain', 'Healthcare', 'Real Estate', 'Gaming']
);

-- Insert common integrations
INSERT INTO integrations (name, logo_emoji, description) VALUES
('MetaMask', '🦊', 'Popular Web3 wallet browser extension'),
('WalletConnect', '🔗', 'Protocol for connecting wallets to dApps'),
('Coinbase Wallet', '🔷', 'Self-custody wallet by Coinbase'),
('Rainbow', '🌈', 'Ethereum wallet with beautiful design'),
('Trust Wallet', '🛡️', 'Multi-chain mobile wallet'),
('Ledger', '🔐', 'Hardware wallet for secure storage'),
('Trezor', '🔒', 'Hardware wallet for cryptocurrency'),
('Gnosis Safe', '🏦', 'Multi-signature wallet for teams'),
('Argent', '💎', 'Smart contract wallet with social recovery'),
('Phantom', '👻', 'Solana wallet browser extension');

-- Note: To create an admin user, you'll need to:
-- 1. First create a user through Supabase Auth (sign up)
-- 2. Then update their profile with admin privileges
-- 
-- Example (replace 'your-user-id' with actual UUID from auth.users):
-- INSERT INTO profiles (id, email, user_type) VALUES 
-- ('your-user-id', 'admin@example.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET user_type = 'admin';