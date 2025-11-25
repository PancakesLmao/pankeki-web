<script setup lang="ts">
import { useMode } from '@/composables/useMode'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  options: Option[]
  modelValue: string | string[]
  multiple?: boolean
  required?: boolean
  error?: string
  placeholder?: string
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { mode } = useMode()

const handleSelect = (e: Event) => {
  const select = e.target as HTMLSelectElement
  if (props.multiple) {
    const selected = Array.from(select.selectedOptions).map((o) => o.value)
    emit('update:modelValue', selected)
  } else {
    emit('update:modelValue', select.value)
  }
}
</script>

<template>
  <div class="mb-4">
    <label
      :class="[
        'block text-sm font-medium mb-2 transition-colors',
        mode === 'developer' ? 'text-gray-700' : 'text-purple-300',
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span
        v-if="loading"
        class="ml-2 text-xs"
        :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
      >
        (loading...)
      </span>
    </label>

    <select
      :multiple="multiple"
      :value="modelValue"
      :disabled="loading"
      :class="[
        'w-full px-3 py-2 rounded-lg border transition-colors font-mono text-sm',
        mode === 'developer'
          ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          : 'bg-gray-800 border-purple-700 text-purple-100 focus:border-purple-500',
        'focus:outline-none focus:ring-2',
        mode === 'developer' ? 'focus:ring-blue-200' : 'focus:ring-purple-300',
        error ? (mode === 'developer' ? 'border-red-500' : 'border-red-400') : '',
        loading ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @change="handleSelect"
    >
      <option v-if="placeholder && !multiple" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p
      v-if="error"
      :class="['text-xs mt-1', mode === 'developer' ? 'text-red-500' : 'text-red-400']"
    >
      {{ error }}
    </p>

    <p
      v-if="multiple && Array.isArray(modelValue) && modelValue.length > 0"
      :class="['text-xs mt-2', mode === 'developer' ? 'text-gray-500' : 'text-purple-400']"
    >
      Selected: {{ modelValue.length }} item(s)
    </p>
  </div>
</template>
