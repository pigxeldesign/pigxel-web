# Admin Setup Guide

## Overview

This guide explains how to set up admin authentication for the Web3 dApp Directory application.

## Prerequisites

1. Supabase project set up with the database schema
2. Environment variables configured
3. Database migrations run

## Setting Up Admin Authentication

### 1. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Create Admin User

Since user registration is disabled in the app, you need to create the admin user through Supabase:

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter email and password
5. Note the user ID

#### Option B: Using SQL

```sql
-- This will create a user in auth.users
-- You'll need to do this through Supabase dashboard or API
```

### 3. Grant Admin Privileges

After creating the user, grant admin privileges:

```sql
-- Replace 'user-id-here' with the actual user ID from auth.users
INSERT INTO profiles (id, email, user_type) 
VALUES (
  'user-id-here',
  'admin@yourdomain.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET 
  user_type = 'admin',
  updated_at = now();
```

### 4. Disable User Registration

The app is configured to prevent user registration:

- No signup form in the login page
- Only existing users can sign in
- Admin privileges must be granted manually

## Authentication Features

### Login Page (`/admin/login`)
- Email and password authentication
- Error handling and validation
- Redirects to admin dashboard on success
- Prevents access for non-admin users

### Admin Dashboard (`/admin/dashboard`)
- Protected route requiring admin privileges
- Overview of system statistics
- Quick action buttons for common tasks
- Sign out functionality

### Route Protection
- `ProtectedRoute` component wraps admin routes
- Checks authentication status and admin privileges
- Redirects unauthorized users appropriately

### Header Integration
- Shows user status when logged in
- Admin indicator for admin users
- User menu with dashboard link and sign out
- Login button for unauthenticated users

## Security Features

1. **Row Level Security (RLS)**: All database tables have RLS enabled
2. **Role-based Access**: Admin functions are restricted to admin users
3. **Session Management**: Automatic session handling with Supabase
4. **Protected Routes**: Client-side route protection
5. **No Registration**: Prevents unauthorized account creation

## Usage

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Access admin dashboard at `/admin/dashboard`
4. Use the header user menu to navigate or sign out

## Troubleshooting

### "Access Denied" Error
- Verify the user has `user_type = 'admin'` in the profiles table
- Check that the user is properly authenticated

### Login Issues
- Verify environment variables are set correctly
- Check Supabase project settings
- Ensure the user exists in auth.users table

### Database Connection Issues
- Verify Supabase URL and anon key
- Check network connectivity
- Review Supabase project status

## Next Steps

1. Implement CRUD operations for dApps
2. Add category management
3. Create flow and screen management interfaces
4. Add image upload functionality
5. Implement user management features