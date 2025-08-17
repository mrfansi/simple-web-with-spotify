import { createAdminClient } from './server'
import { createClient } from './browser'

/**
 * Upload a file to Supabase Storage
 * @param bucketName - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file to upload
 * @param isPublic - Whether the file should be publicly accessible
 */
export async function uploadFile(
  bucketName: string,
  path: string,
  file: File,
  isPublic: boolean = false
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return data
}

/**
 * Get a signed URL for a private file
 * @param bucketName - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
  bucketName: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Get the public URL for a file (works only if file is in a public bucket)
 * @param bucketName - The storage bucket name
 * @param path - The file path within the bucket
 */
export function getPublicUrl(bucketName: string, path: string) {
  const supabase = createClient()

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Delete a file from storage
 * @param bucketName - The storage bucket name
 * @param paths - Array of file paths to delete
 */
export async function deleteFiles(bucketName: string, paths: string[]) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove(paths)

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }

  return data
}

/**
 * Create a storage bucket (admin only)
 * @param bucketName - The name of the bucket to create
 * @param isPublic - Whether the bucket should be public
 */
export async function createBucket(bucketName: string, isPublic: boolean = false) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
    allowedMimeTypes: ['image/*', 'audio/*', 'video/*'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  })

  if (error) {
    throw new Error(`Bucket creation failed: ${error.message}`)
  }

  return data
}

/**
 * List files in a bucket
 * @param bucketName - The storage bucket name
 * @param path - The folder path (optional)
 */
export async function listFiles(bucketName: string, path: string = '') {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path)

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data
}

// Example usage for music-related assets:

/**
 * Upload album artwork
 */
export async function uploadAlbumArt(file: File, albumId: string) {
  const path = `album-art/${albumId}.${file.name.split('.').pop()}`
  return uploadFile('music-assets', path, file, true)
}

/**
 * Get album artwork URL
 */
export function getAlbumArtUrl(albumId: string, extension: string = 'jpg') {
  return getPublicUrl('music-assets', `album-art/${albumId}.${extension}`)
}
