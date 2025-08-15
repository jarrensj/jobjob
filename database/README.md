# Database Migrations

This directory contains SQL migration files for the Supabase database.

## Running Migrations

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from the migration file
4. Execute the SQL

## Migration Files

- `001_create_user_profiles.sql` - Creates the user_profiles table with Clerk integration

## Naming Convention

Migration files follow the pattern: `{number}_{description}.sql`

Example: `001_create_user_profiles.sql`, `002_add_user_preferences.sql`
