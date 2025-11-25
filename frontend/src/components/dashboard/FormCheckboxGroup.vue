<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import { computed } from 'vue'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  options: Option[]
  modelValue: string[]
  required?: boolean
  error?: string
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { mode } = useMode()

const handleChange = (value: string, checked: boolean) => {
  const current = [...props.modelValue]
  if (checked) {
    if (!current.includes(value)) {
      current.push(value)
    }
  } else {
    const index = current.indexOf(value)
    if (index > -1) {
      current.splice(index, 1)
    }
  }
  emit('update:modelValue', current)
}

const isChecked = (value: string) => props.modelValue.includes(value)

// Split options into two columns if more than 6 items
const shouldUseTwoColumns = computed(() => props.options.length > 6)
const optionsFirstColumn = computed(() =>
  shouldUseTwoColumns.value
    ? props.options.slice(0, Math.ceil(props.options.length / 2))
    : props.options,
)
const optionsSecondColumn = computed(() =>
  shouldUseTwoColumns.value ? props.options.slice(Math.ceil(props.options.length / 2)) : [],
)
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center gap-2">
      <label
        :class="[
          'block text-sm font-medium transition-colors',
          mode === 'developer' ? 'text-gray-700' : 'text-purple-300',
        ]"
      >
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <span
        v-if="loading"
        class="text-xs"
        :class="mode === 'developer' ? 'text-gray-500' : 'text-purple-400'"
      >
        (loading...)
      </span>
    </div>

    <div
      :class="[
        'mt-2 p-3 rounded-lg border transition-colors',
        mode === 'developer' ? 'bg-gray-50 border-gray-200' : 'bg-gray-900 border-purple-800',
      ]"
    >
      <div v-if="loading" class="flex items-center justify-center py-4">
        <div :class="['text-sm', mode === 'developer' ? 'text-gray-500' : 'text-purple-400']">
          Loading options...
        </div>
      </div>

      <div v-else :class="[shouldUseTwoColumns ? 'grid grid-cols-2 gap-x-4' : 'space-y-2']">
        <!-- First column -->
        <div :class="[shouldUseTwoColumns ? 'space-y-2' : '']">
          <label
            v-for="option in optionsFirstColumn"
            :key="option.value"
            :class="[
              'flex items-center gap-2 p-2 rounded cursor-pointer transition-colors',
              mode === 'developer' ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
            ]"
          >
            <input
              type="checkbox"
              :checked="isChecked(option.value)"
              :class="[
                'w-4 h-4 rounded transition-colors cursor-pointer',
                mode === 'developer'
                  ? 'border-gray-300 text-blue-600 focus:ring-blue-500'
                  : 'border-purple-600 text-purple-600 focus:ring-purple-500',
              ]"
              @change="handleChange(option.value, ($event.target as HTMLInputElement).checked)"
            />
            <span
              :class="[
                'text-sm font-medium transition-colors',
                mode === 'developer' ? 'text-gray-700' : 'text-purple-200',
              ]"
            >
              {{ option.label }}
            </span>
          </label>
        </div>

        <!-- Second column -->
        <div v-if="shouldUseTwoColumns" :class="['space-y-2']">
          <label
            v-for="option in optionsSecondColumn"
            :key="option.value"
            :class="[
              'flex items-center gap-2 p-2 rounded cursor-pointer transition-colors',
              mode === 'developer' ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
            ]"
          >
            <input
              type="checkbox"
              :checked="isChecked(option.value)"
              :class="[
                'w-4 h-4 rounded transition-colors cursor-pointer',
                mode === 'developer'
                  ? 'border-gray-300 text-blue-600 focus:ring-blue-500'
                  : 'border-purple-600 text-purple-600 focus:ring-purple-500',
              ]"
              @change="handleChange(option.value, ($event.target as HTMLInputElement).checked)"
            />
            <span
              :class="[
                'text-sm font-medium transition-colors',
                mode === 'developer' ? 'text-gray-700' : 'text-purple-200',
              ]"
            >
              {{ option.label }}
            </span>
          </label>
        </div>

        <div
          v-if="options.length === 0"
          :class="[
            'text-xs text-center py-2',
            mode === 'developer' ? 'text-gray-400' : 'text-purple-400',
          ]"
        >
          No options available
        </div>
      </div>
    </div>

    <div v-if="modelValue.length > 0" class="mt-2 flex flex-wrap gap-1">
      <span
        v-for="(value, index) in modelValue"
        :key="index"
        :class="[
          'px-2 py-1 rounded text-xs font-medium transition-colors',
          mode === 'developer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-900 text-purple-100',
        ]"
      >
        {{ options.find((o) => o.value === value)?.label || value }}
      </span>
    </div>

    <p
      v-if="error"
      :class="['text-xs mt-2', mode === 'developer' ? 'text-red-500' : 'text-red-400']"
    >
      {{ error }}
    </p>
  </div>
</template>
