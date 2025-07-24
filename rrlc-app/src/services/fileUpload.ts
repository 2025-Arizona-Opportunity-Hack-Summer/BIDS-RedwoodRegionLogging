import { supabase } from '@/lib/supabaseClient';

export interface UploadFileResult {
  success: boolean;
  error?: string;
  fileUrl?: string;
  filePath?: string;
}

export interface FileUploadData {
  file: File;
  bucket: string;
  folder?: string;
  fileName?: string;
}

// Allowed file types for document uploads
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload PDF, Word, image, or text files only.'
    };
  }

  return { valid: true };
}

// Generate unique file name
export function generateFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${prefix ? prefix + '_' : ''}${sanitizedBaseName}_${timestamp}_${randomString}.${extension}`;
}

// Upload file to Supabase Storage
export async function uploadFile({ file, bucket, folder, fileName }: FileUploadData): Promise<UploadFileResult> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate file path
    const finalFileName = fileName || generateFileName(file.name);
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      fileUrl: publicUrl,
      filePath: filePath
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

// Upload application document
export async function uploadApplicationDocument(
  applicationId: string,
  file: File,
  documentType: 'transcript' | 'recommendation' | 'essay' | 'other'
): Promise<{ success: boolean; error?: string; documentId?: string }> {
  try {
    // Upload file to storage
    const uploadResult = await uploadFile({
      file,
      bucket: 'application-documents',
      folder: `applications/${applicationId}`,
      fileName: generateFileName(file.name, documentType)
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error
      };
    }

    // Save document record to database
    const { data, error } = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        file_url: uploadResult.fileUrl!,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) {
      // If database insert fails, try to clean up the uploaded file
      if (uploadResult.filePath) {
        await deleteFile('application-documents', uploadResult.filePath);
      }
      
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      documentId: data.id
    };
  } catch (error) {
    console.error('Document upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown document upload error'
    };
  }
}

// Get application documents
export async function getApplicationDocuments(applicationId: string) {
  try {
    const { data, error } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('uploaded_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching application documents:', error);
    return { data: null, error };
  }
}

// Delete application document
export async function deleteApplicationDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, get the document details
    const { data: document, error: fetchError } = await supabase
      .from('application_documents')
      .select('file_url')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message
      };
    }

    // Extract file path from URL
    const url = new URL(document.file_url);
    const filePath = url.pathname.split('/').slice(-2).join('/'); // Get last two parts of path

    // Delete from storage
    const storageResult = await deleteFile('application-documents', filePath);
    if (!storageResult.success) {
      console.error('Failed to delete file from storage:', storageResult.error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('application_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Document deletion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

// Get file download URL (for private files)
export async function getFileDownloadUrl(bucket: string, filePath: string, expiresIn = 3600): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}