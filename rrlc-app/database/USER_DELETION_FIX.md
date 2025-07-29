# Fix for User Deletion Error in Supabase

## Problem
When trying to delete a user from Supabase Authentication, you get the error:
```
Failed to delete selected users: Database error deleting user
```

This happens because the `profiles` table has a foreign key reference to `auth.users` without `ON DELETE CASCADE`, preventing user deletion when there are related records.

## Solution

### Option 1: Run the Fix Script (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix-user-deletion.sql`
4. Run the script

This will update all foreign key constraints to properly handle user deletion.

### Option 2: Manual Deletion

If you need to delete a specific user immediately:

```sql
-- First delete from profiles (and this will cascade to other tables)
DELETE FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Then delete from auth.users
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### Option 3: Complete Reset (Development Only)

If you're in development and want to clear all users:

```sql
-- Delete all application data first
DELETE FROM event_registrations;
DELETE FROM applications;
DELETE FROM scholarships;
DELETE FROM profiles;

-- Then you can delete from auth.users
DELETE FROM auth.users;
```

## Prevention

For future tables that reference users, always use `ON DELETE CASCADE`:

```sql
CREATE TABLE new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- other columns
);
```

## After Running the Fix

Once you've run the fix script, you should be able to:
1. Delete users directly from the Supabase Authentication dashboard
2. Use the Supabase Admin API to delete users
3. Have all related data automatically cleaned up when a user is deleted

## Testing

To test if the fix worked:
1. Create a test user
2. Make sure they have a profile and some related data
3. Try deleting them from the Authentication dashboard
4. Verify all related data was also deleted