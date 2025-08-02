import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

async function deleteUserCompletely(userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available');
  }

  console.log(`Starting deletion process for user: ${userId}`);
  
  try {
    // Step 1: Delete the profile (this should cascade to other tables)
    console.log(`Deleting profile for user: ${userId}`);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error(`Profile deletion error for ${userId}:`, profileError);
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }
    
    console.log(`Profile deleted successfully for user: ${userId}`);
    
    // Step 2: Delete from Supabase Auth
    console.log(`Deleting auth user: ${userId}`);
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error(`Auth deletion error for ${userId}:`, authError);
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }
    
    console.log(`Auth user deleted successfully: ${userId}`);
    return { success: true };
    
  } catch (error) {
    console.error(`Complete deletion failed for ${userId}:`, error);
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin operations not available. Please configure SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bulkUserIds = searchParams.get('userIds');

    if (bulkUserIds) {
      // Handle bulk deletion
      const userIds = JSON.parse(bulkUserIds);
      let deletedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      
      for (const uid of userIds) {
        try {
          await deleteUserCompletely(uid);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete user ${uid}:`, error);
          failedCount++;
          errors.push(`${uid}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return NextResponse.json({
        success: true,
        deletedCount,
        failedCount,
        errors: failedCount > 0 ? errors : undefined,
        message: failedCount > 0 
          ? `${deletedCount} users deleted, ${failedCount} failed`
          : `${deletedCount} users deleted successfully`
      });
    } else if (userId) {
      // Handle single user deletion
      try {
        await deleteUserCompletely(userId);
        
        return NextResponse.json({
          success: true,
          message: 'User deleted successfully'
        });
      } catch (error) {
        console.error(`Single user deletion failed:`, error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Unknown error occurred' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No user ID provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('User deletion API error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}