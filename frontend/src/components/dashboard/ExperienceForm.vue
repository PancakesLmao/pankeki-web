<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useMode } from '@/composables/useMode'
import FormInput from './FormInput.vue'
import ImageUpload from './ImageUpload.vue'
import FormSubmitButton from './FormSubmitButton.vue'
import type { ExperienceFormData } from '@/types/forms'
import type { ExperiencePosition, Experience } from '@/types/profile'

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

const emptyPosition = (): ExperiencePosition => ({ title: '', date: '', description: '' })

const emptyForm = (): ExperienceFormData => ({
  company: '',
  location: '',
  logo: '',
  positions: [emptyPosition()],
})

const form = ref<ExperienceFormData>(emptyForm())
const errors = ref<Record<string, string>>({})
const logoUploadRef = ref<InstanceType<typeof ImageUpload> | null>(null)
const pendingEntityId = ref<string | null>(null)

watch(
  () => props.editingExperience,
  (exp) => {
    pendingEntityId.value = null
    if (exp) {
      const positions =
        exp.positions && exp.positions.length > 0
          ? exp.positions.map((p) => ({ ...p }))
          : [{ title: exp.title, date: exp.date, description: exp.description }]
      form.value = {
        company: exp.company,
        location: exp.location ?? '',
        logo: exp.logo ?? '',
        positions,
      }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true },
)

const addPosition = () => {
  form.value.positions.push(emptyPosition())
}

const removePosition = (index: number) => {
  if (form.value.positions.length <= 1) return
  form.value.positions.splice(index, 1)
}

const validate = (): boolean => {
  errors.value = {}
  if (!form.value.company.trim()) errors.value.company = 'Company is required'
  form.value.positions.forEach((pos, i) => {
    if (!pos.title.trim()) errors.value[`pos_title_${i}`] = 'Title is required'
    if (!pos.date.trim()) errors.value[`pos_date_${i}`] = 'Date range is required'
    if (!pos.description.trim()) errors.value[`pos_desc_${i}`] = 'Description is required'
  })
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
  emit('submit', { ...form.value, positions: form.value.positions.map((p) => ({ ...p })) })
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

    <!-- Company-level fields -->
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

    <!-- Positions -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <label
          :class="[
            'text-sm font-medium',
            mode === 'developer' ? 'text-gray-700' : 'text-purple-200',
          ]"
        >
          Positions
        </label>
        <button
          type="button"
          @click="addPosition"
          :class="[
            'text-xs px-3 py-1 rounded-md font-medium transition-colors',
            mode === 'developer'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-purple-900 text-purple-100 hover:bg-purple-800',
          ]"
        >
          + Add Position
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(pos, i) in form.positions"
          :key="i"
          :class="[
            'p-4 rounded-lg border relative',
            mode === 'developer' ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600',
          ]"
        >
          <!-- Position header -->
          <div class="flex items-center justify-between mb-3">
            <span
              :class="[
                'text-xs font-semibold uppercase tracking-wide',
                mode === 'developer' ? 'text-gray-400' : 'text-purple-400',
              ]"
            >
              Position {{ i + 1 }}
            </span>
            <button
              v-if="form.positions.length > 1"
              type="button"
              @click="removePosition(i)"
              :class="[
                'text-xs px-2 py-0.5 rounded transition-colors',
                mode === 'developer'
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-900/30',
              ]"
            >
              Remove
            </button>
          </div>

          <FormInput
            v-model="pos.title"
            label="Job Title"
            placeholder="e.g. Intern"
            required
            :error="errors[`pos_title_${i}`]"
          />
          <FormInput
            v-model="pos.date"
            label="Date Range"
            placeholder="e.g. January 2024 - March 2024"
            required
            :error="errors[`pos_date_${i}`]"
          />
          <FormInput
            v-model="pos.description"
            label="Description"
            type="textarea"
            placeholder="Describe your role and responsibilities..."
            required
            :error="errors[`pos_desc_${i}`]"
          />
        </div>
      </div>
    </div>

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
