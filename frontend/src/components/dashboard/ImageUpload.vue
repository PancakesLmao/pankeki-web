<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ImageUploadProps, ImageUploadEmits } from '@/types/upload'
import { Upload } from 'lucide-vue-next'
import { API_CONFIG } from '@/api/config'

const props = withDefaults(defineProps<ImageUploadProps>(), {
  maxSize: 10 * 1024 * 1024, // 10MB default
  acceptedTypes: () => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  required: false,
  disabled: false,
  autoUpload: true,
})

const emit = defineEmits<ImageUploadEmits>()

// State
const preview = ref<string | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const localError = ref<string | null>(null)
const pendingFile = ref<File | null>(null)

// Computed
const displayError = computed(() => props.error || localError.value)
const hasImage = computed(() => !!props.modelValue)
const acceptString = computed(() => props.acceptedTypes?.join(',') || 'image/*')

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!nextValue) {
      preview.value = null
      pendingFile.value = null
      localError.value = null
      return
    }

    if (preview.value) {
      preview.value = null
      pendingFile.value = null
      localError.value = null
    }
  },
)

/**
 * Validate file type and size
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!props.acceptedTypes?.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please select JPEG, PNG, WebP, or GIF images.',
    }
  }

  // Check file size
  if (file.size > props.maxSize!) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit. Please select a smaller image.',
    }
  }

  return { isValid: true }
}

/**
 * Generate preview from file
 */
function generatePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      resolve(dataUrl)
    }
    reader.onerror = (err) => {
      reject(err instanceof Error ? err : new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Handle file selection
 */
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Clear previous errors
  localError.value = null

  // Validate file
  const validation = validateFile(file)
  if (!validation.isValid) {
    localError.value = validation.error || 'Invalid file'
    return
  }

  // Generate preview
  try {
    const dataUrl = await generatePreview(file)
    preview.value = dataUrl
    emit('preview', dataUrl)
  } catch {
    localError.value = 'Failed to generate preview'
    return
  }

  pendingFile.value = file

  // Upload file
  if (props.autoUpload) {
    try {
      await uploadFile(file)
    } catch {
      // Error already surfaced via localError/emit; keep UI stable
    }
  }
}

/**
 * Upload file to backend
 */
async function uploadFile(file: File): Promise<string | null> {
  emit('upload:start')
  isUploading.value = true
  uploadProgress.value = 0
  localError.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', props.entityType)
    formData.append('imageType', props.imageType || 'project')

    // For replacements
    if (props.entityId) {
      formData.append('entityId', props.entityId)
    }
    if (props.oldImagePath) {
      formData.append('oldImagePath', props.oldImagePath)
    }

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest()
    xhr.withCredentials = true

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        uploadProgress.value = percent
        emit('upload:progress', percent)
      }
    })

    // Handle completion
    const uploadedPath = await new Promise<string>((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success && response.path) {
              emit('update:modelValue', response.path)
              emit('upload:success', response.path)
              resolve(response.path)
            } else {
              reject(new Error(response.error || 'Upload failed'))
            }
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error. Please try again.'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      // Send request
      xhr.open('POST', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`)
      xhr.send(formData)
    })

    uploadProgress.value = 100
    pendingFile.value = null
    return uploadedPath
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    localError.value = message
    emit('upload:error', message)
    throw error instanceof Error ? error : new Error(message)
  } finally {
    isUploading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/**
 * Trigger file input click
 */
function triggerFileInput() {
  fileInput.value?.click()
}

/**
 * Remove image
 */
function removeImage() {
  preview.value = null
  emit('update:modelValue', '')
  localError.value = null
  pendingFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadSelected(): Promise<string | null> {
  if (!pendingFile.value) return null
  return uploadFile(pendingFile.value)
}

defineExpose({ uploadSelected })
</script>

<template>
  <div class="image-upload">
    <!-- Label -->
    <label v-if="label" class="image-upload__label">
      {{ label }}
      <span v-if="required" class="image-upload__required">*</span>
    </label>

    <!-- Current image preview -->
    <div v-if="hasImage && !preview" class="image-upload__current">
      <img :src="modelValue" :alt="label" class="image-upload__current-img" />
      <button
        type="button"
        class="image-upload__replace-btn"
        :class="{ 'image-upload__btn--processing': isUploading }"
        @click="triggerFileInput"
        :disabled="isUploading || disabled"
      >
        Replace Image
      </button>
    </div>

    <!-- Preview during selection -->
    <div v-if="preview" class="image-upload__preview">
      <img :src="preview" :alt="label" class="image-upload__preview-img" />
    </div>

    <!-- Upload area -->
    <div
      v-if="!hasImage && !preview"
      class="image-upload__area"
      :class="{ 'image-upload__area--uploading': isUploading }"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptString"
        class="image-upload__input"
        @change="handleFileSelect"
        :disabled="isUploading || disabled"
      />

      <div class="image-upload__content">
        <div class="image-upload__icon"><Upload /></div>
        <p class="image-upload__text">
          <button
            type="button"
            class="image-upload__trigger"
            :class="{ 'image-upload__btn--processing': isUploading }"
            @click="triggerFileInput"
            :disabled="isUploading || disabled"
          >
            Click to select
          </button>
          or drag and drop
        </p>
        <p class="image-upload__hint">JPEG, PNG, WebP, or GIF (max 10MB)</p>
      </div>

      <!-- Progress bar -->
      <div v-if="isUploading" class="image-upload__progress">
        <div class="image-upload__progress-bar">
          <div class="image-upload__progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="image-upload__progress-text">{{ uploadProgress }}%</p>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="displayError" class="image-upload__error">
      {{ displayError }}
    </div>

    <!-- Action buttons -->
    <div v-if="preview" class="image-upload__actions">
      <button
        type="button"
        class="image-upload__btn image-upload__btn--remove"
        @click="removeImage"
        :disabled="isUploading"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-upload__label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
}

.image-upload__required {
  color: #ef4444;
}

.image-upload__current {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
}

.image-upload__current-img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 300px;
  object-fit: cover;
}

.image-upload__replace-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.image-upload__replace-btn:hover:not(:disabled) {
  background: #2563eb;
}

.image-upload__replace-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-upload__preview {
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
}

.image-upload__preview-img {
  width: 100%;
  height: auto;
  display: block;
  max-height: 300px;
  object-fit: cover;
}

.image-upload__area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  background: #f9fafb;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 1rem;
}

.image-upload__area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.image-upload__area--uploading {
  border-color: #3b82f6;
  background: #eff6ff;
}

.image-upload__input {
  display: none;
}

.image-upload__content {
  pointer-events: none;
}

.image-upload__icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  margin-left: 50%;
  margin-right: 50%;
}

.image-upload__text {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.image-upload__trigger {
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  pointer-events: auto;
}

.image-upload__trigger:hover {
  color: #2563eb;
}

.image-upload__trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-upload__hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #9ca3af;
}

.image-upload__progress {
  margin-top: 1rem;
}

.image-upload__progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.image-upload__progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.2s;
}

.image-upload__progress-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.image-upload__error {
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #991b1b;
}

.image-upload__actions {
  display: flex;
  gap: 0.5rem;
}

.image-upload__btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #374151;
}

.image-upload__btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.image-upload__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-upload__btn--remove {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.image-upload__btn--remove:hover:not(:disabled) {
  background: #fecaca;
}

.image-upload__btn--processing {
  position: relative;
  overflow: hidden;
}

.image-upload__btn--processing::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: translateX(-100%);
  animation: upload-shimmer 1s linear infinite;
}

@keyframes upload-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
