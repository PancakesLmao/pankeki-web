/**
 * Upload Types
 * Defines TypeScript interfaces for image upload operations
 */

/**
 * Props for the ImageUpload component
 * Handles file selection, validation, preview, and upload progress
 */
export interface ImageUploadProps {
  /** Current image path/URL (v-model binding) */
  modelValue: string | undefined
  /** Label displayed above the file input */
  label: string
  /** Entity type: projects, games, or experiences */
  entityType: 'projects' | 'games' | 'experiences' | 'certifications'
  /** Image type: project, cover, icon, or logo */
  imageType?: 'project' | 'cover' | 'icon' | 'logo' | 'image'
  /** Entity ID for database updates (required for replacements) */
  entityId?: string
  /** Path to old image for deletion on replacement */
  oldImagePath?: string
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number
  /** Accepted MIME types (default: JPEG, PNG, WebP, GIF) */
  acceptedTypes?: string[]
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Upload immediately on file select (default: true) */
  autoUpload?: boolean
}

/**
 * Emits for the ImageUpload component
 * Events fired during upload lifecycle
 */
export interface ImageUploadEmits {
  /** Update v-model binding with new image path */
  (e: 'update:modelValue', value: string): void
  /** Fired when upload starts */
  (e: 'upload:start'): void
  /** Fired during upload with progress percentage */
  (e: 'upload:progress', percent: number): void
  /** Fired when upload completes successfully */
  (e: 'upload:success', path: string): void
  /** Fired when upload fails */
  (e: 'upload:error', error: string): void
  /** Fired when preview is generated */
  (e: 'preview', dataUrl: string): void
}

/**
 * Request body for upload endpoint
 * Sent as multipart/form-data
 */
export interface UploadRequest {
  /** File to upload */
  file: File
  /** Entity type: projects, games, or experiences */
  entityType: 'projects' | 'games' | 'experiences' | 'certifications'
  /** Image type: project, cover, icon, or logo */
  imageType: 'project' | 'cover' | 'icon' | 'logo' | 'image'
  /** Entity ID for database updates (required for replacements) */
  entityId?: string
  /** Path to old image for deletion on replacement */
  oldImagePath?: string
}

/**
 * Response from upload endpoint
 * Contains storage path and status information
 */
export interface UploadResponse {
  /** Whether upload was successful */
  success: boolean
  /** Storage path: {entityType}/{timestamp}-{filename}.{ext} */
  path?: string
  /** Error message if upload failed */
  error?: string
  /** Additional message */
  message?: string
  /** Whether old image was deleted (for replacements) */
  oldImageDeleted?: boolean
}

/**
 * File validation result
 */
export interface FileValidationResult {
  /** Whether file is valid */
  isValid: boolean
  /** Error message if invalid */
  error?: string
}
