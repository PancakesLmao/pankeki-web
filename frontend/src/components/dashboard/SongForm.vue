<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMode } from '@/composables/useMode'
import FormInput from './FormInput.vue'
import FormSubmitButton from './FormSubmitButton.vue'
import type { SongFormData } from '@/types/forms'
import type { Song } from '@/types/profile'

interface Props {
  editingSong?: Song | null
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: SongFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  editingSong: null,
  loading: false,
})

const emit = defineEmits<Emits>()

const { mode } = useMode()

const form = ref<SongFormData>({
  title: '',
  artist: '',
  youtube_url: '',
  bg_image_url: '',
  art_credit: '',
})

const errors = ref<Record<string, string>>({})

watch(
  () => props.editingSong,
  (song) => {
    if (song) {
      form.value = {
        title: song.title,
        artist: song.artist,
        youtube_url: song.youtube_url,
        bg_image_url: song.bg_image_url,
        art_credit: song.art_credit || '',
      }
    } else {
      form.value = { title: '', artist: '', youtube_url: '', bg_image_url: '', art_credit: '' }
    }
  },
  { immediate: true },
)

const validateForm = (): boolean => {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = 'Title is required'
  if (!form.value.artist.trim()) errors.value.artist = 'Artist is required'
  if (!form.value.youtube_url.trim()) {
    errors.value.youtube_url = 'YouTube URL is required'
  } else if (!form.value.youtube_url.includes('youtube.com') && !form.value.youtube_url.includes('youtu.be')) {
    errors.value.youtube_url = 'Must be a valid YouTube URL'
  }
  if (!form.value.bg_image_url.trim()) {
    errors.value.bg_image_url = 'Background image URL is required'
  } else if (!form.value.bg_image_url.startsWith('http')) {
    errors.value.bg_image_url = 'Must be a valid HTTP(S) URL'
  }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) return
  emit('submit', form.value)
}

const reset = () => {
  if (!props.editingSong) {
    form.value = { title: '', artist: '', youtube_url: '', bg_image_url: '', art_credit: '' }
  }
}

defineExpose({ reset })
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
      {{ editingSong ? 'Edit Song' : 'Add Song' }}
    </h3>

    <FormInput
      v-model="form.title"
      label="Song Title"
      placeholder="e.g. Lofi Study Beats"
      required
      :error="errors.title"
    />

    <FormInput
      v-model="form.artist"
      label="Artist / Channel"
      placeholder="e.g. Lofi Girl"
      required
      :error="errors.artist"
    />

    <FormInput
      v-model="form.youtube_url"
      label="YouTube URL"
      type="url"
      placeholder="https://www.youtube.com/watch?v=..."
      required
      :error="errors.youtube_url"
    />

    <FormInput
      v-model="form.bg_image_url"
      label="Background Image URL"
      type="url"
      placeholder="https://images.unsplash.com/..."
      required
      :error="errors.bg_image_url"
    />

    <FormInput
      v-model="form.art_credit"
      label="Background Art Credit"
      placeholder="e.g. Photo by John Doe on Unsplash"
      :error="errors.art_credit"
    />

    <!-- Preview bg image thumbnail -->
    <div v-if="form.bg_image_url && form.bg_image_url.startsWith('http')" class="mb-4">
      <p
        :class="['text-xs font-medium mb-1', mode === 'developer' ? 'text-gray-600' : 'text-purple-300']"
      >Background Preview</p>
      <div
        class="w-full h-20 rounded-lg bg-cover bg-center border"
        :class="mode === 'developer' ? 'border-gray-200' : 'border-purple-800'"
        :style="{ backgroundImage: `url(${form.bg_image_url})` }"
      />
    </div>

    <div class="flex gap-2 mt-6">
      <FormSubmitButton
        :loading="loading"
        :label="editingSong ? 'Update Song' : 'Add Song'"
        :loading-label="editingSong ? 'Updating...' : 'Adding...'"
      />
      <button
        v-if="editingSong"
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
