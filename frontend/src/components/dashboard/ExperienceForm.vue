<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMode } from '@/composables/useMode'
import FormInput from './FormInput.vue'
import type { ExperienceFormData } from '@/types/forms'
import type { Experience } from '@/types/profile'

interface Props {
  editingExperience?: Experience | null
}

interface Emits {
  (e: 'submit', data: ExperienceFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingExperience: null,
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
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

watch(
  () => props.editingExperience,
  (exp) => {
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

const handleSubmit = async () => {
  if (!validate()) return
  isSubmitting.value = true
  try {
    emit('submit', { ...form.value })
    if (!props.editingExperience) form.value = emptyForm()
  } finally {
    isSubmitting.value = false
  }
}
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
      {{ editingExperience ? 'Edit Experience' : 'Create New Experience' }}
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

    <FormInput
      v-model="form.logo"
      label="Logo URL"
      type="url"
      placeholder="https://example.com/logo.svg"
      :error="errors.logo"
    />

    <div class="flex gap-2">
      <button
        type="submit"
        :disabled="isSubmitting"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50',
          mode === 'developer'
            ? 'bg-gray-800 text-white hover:bg-gray-900'
            : 'bg-purple-500 text-purple-100 hover:bg-purple-600',
        ]"
      >
        {{
          isSubmitting
            ? editingExperience
              ? 'Updating...'
              : 'Creating...'
            : editingExperience
              ? 'Update Experience'
              : 'Create Experience'
        }}
      </button>
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
