<script setup lang="ts">
import { useMode } from '@/composables/useMode'

interface Props {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'textarea'
  modelValue: string | undefined
  required?: boolean
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const { mode } = useMode()
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
    </label>

    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 rounded-lg border transition-colors font-mono text-sm',
        mode === 'developer'
          ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          : 'bg-gray-800 border-purple-700 text-purple-100 focus:border-purple-500',
        'focus:outline-none focus:ring-2',
        mode === 'developer' ? 'focus:ring-blue-200' : 'focus:ring-purple-300',
        error ? (mode === 'developer' ? 'border-red-500' : 'border-red-400') : '',
      ]"
      rows="4"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <input
      v-else
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 rounded-lg border transition-colors font-mono text-sm',
        mode === 'developer'
          ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          : 'bg-gray-800 border-purple-700 text-purple-100 focus:border-purple-500',
        'focus:outline-none focus:ring-2',
        mode === 'developer' ? 'focus:ring-blue-200' : 'focus:ring-purple-300',
        error ? (mode === 'developer' ? 'border-red-500' : 'border-red-400') : '',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p
      v-if="error"
      :class="['text-xs mt-1', mode === 'developer' ? 'text-red-500' : 'text-red-400']"
    >
      {{ error }}
    </p>
  </div>
</template>
