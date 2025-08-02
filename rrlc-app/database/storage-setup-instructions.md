# Supabase Storage Setup Instructions

Since storage policies require owner permissions, you need to set up the avatars bucket through the Supabase Dashboard.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Enabled** (so avatars can be displayed publicly)
   - **File size limit**: 5MB (optional)
   - **Allowed MIME types**: `image/*` (optional)

## Step 2: Set Up Storage Policies

After creating the bucket, go to **Storage > Policies** and create these policies for the `avatars` bucket:

### Policy 1: Users can upload their own avatars
- **Policy name**: `Users can upload their own avatar`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Anyone can view avatars
- **Policy name**: `Anyone can view avatars`  
- **Allowed operation**: `SELECT`
- **Target roles**: `anon, authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars'
```

### Policy 3: Users can update their own avatars
- **Policy name**: `Users can update their own avatar`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: Users can delete their own avatars
- **Policy name**: `Users can delete their own avatar`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

## Alternative: Quick Setup via Dashboard

You can also use the **Quick start** templates in the Storage section:
1. Go to **Storage > Policies**
2. Click **New Policy**
3. Select **"For users to upload their own files"** template
4. Modify the bucket name to `avatars`
5. Repeat for other operations as needed

## Verification

After setup, you should be able to:
- Upload profile pictures without errors
- See uploaded avatars in the Storage browser
- Display avatars throughout the application
- Have proper access control (users can only modify their own avatars)