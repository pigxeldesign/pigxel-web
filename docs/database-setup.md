# Database Setup Guide

## Overview

This guide explains how to set up the Supabase database for the Web3 dApp Directory application.

## Database Schema

### Tables

1. **profiles** - User profiles with role-based access
2. **categories** - dApp categories with metadata
3. **dapps** - Decentralized applications with detailed information
4. **integrations** - Third-party integrations
5. **dapp_integrations** - Junction table for dApps and integrations
6. **flows** - User flows/tutorials (with premium access control)
7. **flow_screens** - Individual screens within flows

### User Types

- **admin** - Full CRUD access to all content
- **premium_user** - Access to premium flows and features
- **general_user** - Basic authenticated user access
- **anon** - Visitor (unauthenticated) access

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Migrations

Execute the SQL files in order:

1. `create_initial_schema.sql` - Creates all tables and RLS policies
2. `create_storage_buckets.sql` - Sets up image storage buckets
3. `insert_initial_data.sql` - Adds initial categories and integrations
4. `create_admin_user.sql` - Helper for creating admin users

### 3. Create Admin User

1. Have the admin user sign up through your app
2. Get their user ID from Supabase Auth dashboard
3. Update `create_admin_user.sql` with their ID
4. Run the script to grant admin privileges

### 4. Configure Environment Variables

Add to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Access Control

### Visitors (Unauthenticated)
- View categories, dApps, integrations
- View non-premium flows and screens

### General Users (Authenticated)
- All visitor permissions
- View their own profile
- Access to basic features

### Premium Users
- All general user permissions
- Access to premium flows and features

### Admins
- Full CRUD access to all content
- User management capabilities
- Access to admin dashboard

## Storage Buckets

Three storage buckets are created:

- `dapp_logos` - For dApp logo images
- `dapp_thumbnails` - For dApp thumbnail images
- `flow_screen_thumbnails` - For flow screen images

All buckets have public read access but admin-only write access.

## Security Features

- Row Level Security (RLS) enabled on all tables
- Helper functions for role checking
- Automatic timestamp updates
- Foreign key constraints
- Data validation through CHECK constraints

## Next Steps

1. Set up the Supabase client in your React app
2. Implement authentication flows
3. Create admin dashboard for content management
4. Add premium feature logic to frontend