<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMode } from '@/composables/useMode'
import { useEnums } from '@/composables/useEnums'
import FormInput from './FormInput.vue'
import FormCheckboxGroup from './FormCheckboxGroup.vue'
import type { GameFormData } from '@/types/forms'
import type { Game } from '@/types/profile'

interface Props {
  editingGame?: Game | null
}

interface Emits {
  (e: 'submit', data: GameFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingGame: null,
})

const emit = defineEmits<Emits>()

const { mode } = useMode()
const { gameGenres, gamePlatforms, loading, fetchEnums } = useEnums()

const form = ref<GameFormData>({
  title: '',
  description: '',
  tags: [],
  genre: [],
  platform: [],
  link: '',
  cover_img: '',
  icon_img: '',
})

const tagInput = ref('')
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(() => {
  fetchEnums()
})

// Watch editingGame to populate form
watch(
  () => props.editingGame,
  (editingGame) => {
    if (editingGame) {
      form.value = {
        title: editingGame.title,
        description: editingGame.description,
        tags: [...editingGame.tags],
        genre: editingGame.genre as GameFormData['genre'],
        platform: editingGame.platform as GameFormData['platform'],
        link: editingGame.link,
        cover_img: editingGame.cover_img || '',
        icon_img: editingGame.icon_img || '',
      }
    } else {
      // Reset form when not editing
      form.value = {
        title: '',
        description: '',
        tags: [],
        genre: [],
        platform: [],
        link: '',
        cover_img: '',
        icon_img: '',
      }
    }
  },
  { immediate: true },
)

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const validateForm = (): boolean => {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  }
  if (form.value.genre.length === 0) {
    errors.value.genre = 'At least one genre is required'
  }
  if (form.value.platform.length === 0) {
    errors.value.platform = 'At least one platform is required'
  }
  if (form.value.tags.length === 0) {
    errors.value.tags = 'At least one tag is required'
  }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    emit('submit', form.value)
    // Reset form after successful submit
    if (!props.editingGame) {
      form.value = {
        title: '',
        description: '',
        tags: [],
        genre: [],
        platform: [],
        link: '',
        cover_img: '',
        icon_img: '',
      }
    }
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
      {{ editingGame ? 'Edit Game' : 'Create New Game' }}
    </h3>

    <!-- Title -->
    <FormInput
      v-model="form.title"
      label="Game Title"
      placeholder="Enter game title"
      required
      :error="errors.title"
    />

    <!-- Description -->
    <FormInput
      v-model="form.description"
      label="Description"
      type="textarea"
      placeholder="Describe the game..."
      :error="errors.description"
    />

    <!-- Genre -->
    <FormCheckboxGroup
      v-model="form.genre"
      label="Genre"
      :options="gameGenres as any"
      :loading="loading"
      required
      :error="errors.genre"
    />

    <!-- Platform -->
    <FormCheckboxGroup
      v-model="form.platform"
      label="Platform"
      :options="gamePlatforms as any"
      :loading="loading"
      required
      :error="errors.platform"
    />

    <!-- Link -->
    <FormInput
      v-model="form.link"
      label="Game Link"
      type="url"
      placeholder="https://example.com"
      :error="errors.link"
    />

    <!-- Cover Image URL -->
    <FormInput
      v-model="form.cover_img"
      label="Cover Image URL"
      type="url"
      placeholder="https://example.com/cover.jpg"
      :error="errors.cover_img"
    />

    <!-- Icon Image URL -->
    <FormInput
      v-model="form.icon_img"
      label="Icon Image URL"
      type="url"
      placeholder="https://example.com/icon.jpg"
      :error="errors.icon_img"
    />

    <!-- Tags -->
    <div class="mb-4">
      <label
        :class="[
          'block text-sm font-medium mb-2 transition-colors',
          mode === 'developer' ? 'text-gray-700' : 'text-purple-300',
        ]"
      >
        Tags
        <span class="text-red-500">*</span>
      </label>

      <div class="flex gap-2 mb-2">
        <input
          v-model="tagInput"
          type="text"
          placeholder="Enter tag and press Add"
          :class="[
            'flex-1 px-3 py-2 rounded-lg border transition-colors font-mono text-sm',
            mode === 'developer'
              ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              : 'bg-gray-800 border-purple-700 text-purple-100 focus:border-purple-500',
            'focus:outline-none focus:ring-2',
            mode === 'developer' ? 'focus:ring-blue-200' : 'focus:ring-purple-300',
          ]"
          @keydown.enter.prevent="addTag"
        />
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            mode === 'developer'
              ? 'bg-gray-700 text-white hover:bg-gray-800'
              : 'bg-purple-600 text-purple-100 hover:bg-purple-700',
          ]"
          @click="addTag"
        >
          Add
        </button>
      </div>

      <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in form.tags"
          :key="index"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer',
            mode === 'developer'
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-purple-900 text-purple-100 hover:bg-purple-800',
          ]"
          @click="removeTag(index)"
        >
          {{ tag }}
          <span class="ml-1">×</span>
        </span>
      </div>

      <p
        v-if="errors.tags"
        :class="['text-xs mt-1', mode === 'developer' ? 'text-red-500' : 'text-red-400']"
      >
        {{ errors.tags }}
      </p>
    </div>

    <!-- Submit Button -->
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
            ? editingGame
              ? 'Updating...'
              : 'Creating...'
            : editingGame
              ? 'Update Game'
              : 'Create Game'
        }}
      </button>
      <button
        v-if="editingGame"
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
