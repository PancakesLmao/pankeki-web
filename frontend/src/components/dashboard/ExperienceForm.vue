<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMode } from '@/composables/useMode'
import FormInput from './FormInput.vue'
import ImageUpload from './ImageUpload.vue'
import FormSubmitButton from './FormSubmitButton.vue'
import type { ExperienceFormData } from '@/types/forms'
import type { Experience } from '@/types/profile'

interface Props {
  editingExperience?: Experience | null
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: ExperienceFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingExperience: null,
  loading: false,
})

const emit = defineEmits<Emits>()
const { mode } = useMode()

const emptyForm = (): ExperienceFormData => ({
  title: '',
  company: '',
  location: '',
  description: '',
  date: '',
  logo: '',
})

const form = ref<ExperienceFormData>(emptyForm())
const errors = ref<Record<string, string>>({})
const logoUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)
const pendingEntityId = ref<string | null>(null)

watch(
  () => props.editingExperience,
  (exp) => {
    pendingEntityId.value = null
    form.value = exp
      ? {
          title: exp.title,
          company: exp.company,
          location: exp.location ?? '',
          description: exp.description,
          date: exp.date,
          logo: exp.logo ?? '',
        }
      : emptyForm()
  },
  { immediate: true },
)

const validate = (): boolean => {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  if (!form.value.company.trim()) errors.value.company = 'Company is required'
  if (!form.value.description.trim()) errors.value.description = 'Description is required'
  if (!form.value.date.trim()) errors.value.date = 'Date range is required'
  return Object.keys(errors.value).length === 0
}

const handleLogoUploadSuccess = (path: string) => {
  form.value.logo = path
  errors.value.logo = ''
}

const handleLogoUploadError = (error: string) => {
  errors.value.logo = error
}

const handleSubmit = async () => {
  if (!validate()) return
  emit('submit', { ...form.value })
}

const reset = () => {
  if (!props.editingExperience) form.value = emptyForm()
}

const uploadImages = async (entityId?: string) => {
  if (entityId) {
    pendingEntityId.value = entityId
    await nextTick()
  }
  const path = await logoUploadRef.value?.uploadSelected()
  return {
    uploaded: !!path,
    logo: path || null,
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
      {{ editingExperience ? 'Edit Experience' : 'Add New Experience' }}
    </h3>

    <FormInput
      v-model="form.title"
      label="Job Title"
      placeholder="e.g. Lab Assistant"
      required
      :error="errors.title"
    />

    <FormInput
      v-model="form.company"
      label="Company"
      placeholder="e.g. Company A"
      required
      :error="errors.company"
    />

    <FormInput
      v-model="form.location"
      label="Location"
      placeholder="e.g. Gehenna, Kivotos"
      :error="errors.location"
    />

    <FormInput
      v-model="form.date"
      label="Date Range"
      placeholder="e.g. January YYYY - December YYYY"
      required
      :error="errors.date"
    />

    <FormInput
      v-model="form.description"
      label="Description"
      type="textarea"
      placeholder="Describe your role and responsibilities..."
      required
      :error="errors.description"
    />

    <ImageUpload
      ref="logoUploadRef"
      v-model="form.logo"
      label="Logo"
      entityType="experiences"
      imageType="logo"
      :entityId="pendingEntityId || editingExperience?.id"
      :oldImagePath="editingExperience?.logo || undefined"
      :autoUpload="false"
      :error="errors.logo"
      @upload:success="handleLogoUploadSuccess"
      @upload:error="handleLogoUploadError"
    />

    <div class="flex gap-2 mt-6">
      <FormSubmitButton
        :loading="loading"
        :label="editingExperience ? 'Update Experience' : 'Add Experience'"
        :loading-label="editingExperience ? 'Updating...' : 'Creating...'"
      />
      <button
        v-if="editingExperience"
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


