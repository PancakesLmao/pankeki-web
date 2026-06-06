<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMode } from '@/composables/useMode'
import FormInput from './FormInput.vue'
import ImageUpload from './ImageUpload.vue'
import FormSubmitButton from './FormSubmitButton.vue'
import type { CertificationFormData } from '@/types/forms'
import type { Certification } from '@/types/profile'

interface Props {
  editingCertification?: Certification | null
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: CertificationFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingCertification: null,
  loading: false,
})

const emit = defineEmits<Emits>()
const { mode } = useMode()

const emptyForm = (): CertificationFormData => ({
  title: '',
  issuer: '',
  date: '',
  icon: '',
  image_url: '',
  url: '',
})

const form = ref<CertificationFormData>(emptyForm())
const errors = ref<Record<string, string>>({})
const iconUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)
const imageUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)
const pendingEntityId = ref<string | null>(null)

watch(
  () => props.editingCertification,
  (cert) => {
    pendingEntityId.value = null
    if (cert) {
      form.value = {
        title: cert.title,
        issuer: cert.issuer,
        date: cert.date ?? '',
        icon: cert.icon ?? '',
        image_url: cert.image_url ?? '',
        url: cert.url ?? '',
      }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

const validate = (): boolean => {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  if (!form.value.issuer.trim()) errors.value.issuer = 'Issuer is required'
  return Object.keys(errors.value).length === 0
}

const handleIconUploadSuccess = (path: string) => {
  form.value.icon = path
  errors.value.icon = ''
}

const handleIconUploadError = (error: string) => {
  errors.value.icon = error
}

const handleImageUploadSuccess = (path: string) => {
  form.value.image_url = path
  errors.value.image_url = ''
}

const handleImageUploadError = (error: string) => {
  errors.value.image_url = error
}

const handleSubmit = async () => {
  if (!validate()) return
  emit('submit', { ...form.value })
}

const reset = () => {
  if (!props.editingCertification) form.value = emptyForm()
}

const uploadImages = async (entityId?: string) => {
  if (entityId) {
    pendingEntityId.value = entityId
    await nextTick()
  }
  
  let uploaded = false
  
  const iconPath = await iconUploadRef.value?.uploadSelected()
  if (iconPath) uploaded = true
  
  const imagePath = await imageUploadRef.value?.uploadSelected()
  if (imagePath) uploaded = true
  
  return {
    uploaded,
    icon: iconPath || null,
    image_url: imagePath || null,
  }
}

defineExpose({ uploadImages, reset })
</script>

<template>
  <form
    :class="[
      'p-6 rounded-lg border transition-colors',
      mode === 'developer' ? 'bg-white border-gray-200' : 'bg-gray-800 border-purple-900',
    ]"
    @submit.prevent="handleSubmit"
  >
    <h3
      :class="[
        'text-xl font-bold mb-6 transition-colors',
        mode === 'developer' ? 'font-serif text-gray-900' : 'font-mono text-purple-100',
      ]"
    >
      {{ editingCertification ? 'Edit Certification' : 'Add New Certification' }}
    </h3>

    <FormInput
      v-model="form.title"
      label="Title"
      placeholder="e.g. AWS Certified Solutions Architect"
      required
      :error="errors.title"
    />

    <FormInput
      v-model="form.issuer"
      label="Issuer"
      placeholder="e.g. Amazon Web Services"
      required
      :error="errors.issuer"
    />

    <FormInput
      v-model="form.date"
      label="Date"
      placeholder="e.g. Jan 2024"
      :error="errors.date"
    />

    <FormInput
      v-model="form.url"
      label="Credential URL"
      placeholder="e.g. https://www.credly.com/badges/..."
      :error="errors.url"
    />

    <ImageUpload
      ref="iconUploadRef"
      v-model="form.icon"
      label="Badge Icon"
      entityType="certifications"
      imageType="icon"
      :entityId="pendingEntityId || editingCertification?.id"
      :oldImagePath="editingCertification?.icon || undefined"
      :autoUpload="false"
      :error="errors.icon"
      @upload:success="handleIconUploadSuccess"
      @upload:error="handleIconUploadError"
    />

    <ImageUpload
      ref="imageUploadRef"
      v-model="form.image_url"
      label="Certificate Image"
      entityType="certifications"
      imageType="image"
      :entityId="pendingEntityId || editingCertification?.id"
      :oldImagePath="editingCertification?.image_url || undefined"
      :autoUpload="false"
      :error="errors.image_url"
      @upload:success="handleImageUploadSuccess"
      @upload:error="handleImageUploadError"
    />

    <div class="flex gap-2 mt-6">
      <FormSubmitButton
        :loading="loading"
        :label="editingCertification ? 'Update Certification' : 'Add Certification'"
        :loading-label="editingCertification ? 'Updating...' : 'Creating...'"
      />
      <button
        v-if="editingCertification"
        type="button"
        @click="emit('cancel')"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          mode === 'developer'
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-gray-700 text-purple-100 hover:bg-gray-600',
        ]"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
