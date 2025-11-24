<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMode } from '@/composables/useMode'
import { useEnums } from '@/composables/useEnums'

const props = defineProps<{
  title: string
  description: string
  tags: string[]
  link: string
  status: string
  timeRange: string
}>()

const { mode } = useMode()
const { projectStatuses, fetchEnums } = useEnums()

// Fetch enums on mount
onMounted(() => {
  fetchEnums()
})

// Get status label from enum
const statusLabel = computed(() => {
  const found = projectStatuses.value.find((s) => s.value === props.status)
  return found?.label || props.status.replace(/_/g, ' ')
})

// Get status color based on status type
const statusColor = computed(() => {
  const status = props.status.toLowerCase()

  // Green for completed
  if (status.includes('completed')) {
    return mode.value === 'developer'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-green-900/50 text-green-300 border-green-700'
  }

  // Yellow for ongoing or under maintenance
  if (status.includes('ongoing') || status.includes('maintenance')) {
    return mode.value === 'developer'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : 'bg-yellow-900/50 text-yellow-300 border-yellow-700'
  }

  // Blue for upcoming
  if (status.includes('upcoming')) {
    return mode.value === 'developer'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-blue-900/50 text-blue-300 border-blue-700'
  }

  // Red for deprecated
  if (status.includes('deprecated')) {
    return mode.value === 'developer'
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-red-900/50 text-red-300 border-red-700'
  }

  // Default gray
  return mode.value === 'developer'
    ? 'bg-gray-100 text-gray-700 border-gray-200'
    : 'bg-gray-700/50 text-gray-300 border-gray-600'
})
</script>

<template>
  <div
    :class="[
      'relative p-6 rounded-xl transition-all hover:-translate-y-1',
      mode === 'developer'
        ? 'bg-white border border-gray-200 hover:shadow-md'
        : 'bg-gray-800 border border-gray-700 hover:border-purple-700',
    ]"
  >
    <!-- Status Badge - Top Right -->
    <span
      :class="[
        'absolute top-4 right-4 rounded-full border px-3 py-1 text-xs font-medium',
        statusColor,
      ]"
    >
      {{ statusLabel }}
    </span>

    <!-- Title -->
    <h3
      :class="[
        'text-xl font-bold mb-2 pr-24 transition-colors',
        mode === 'developer' ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ title }}
    </h3>

    <!-- Time Range -->
    <div :class="['mb-3 text-xs', mode === 'developer' ? 'text-gray-500' : 'text-gray-400']">
      {{ timeRange }}
    </div>

    <!-- Description -->
    <p
      :class="[
        'mb-4 transition-colors',
        mode === 'developer' ? 'text-gray-600' : 'text-purple-200',
      ]"
    >
      {{ description }}
    </p>

    <div class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="(tag, index) in tags"
        :key="index"
        :class="[
          'text-xs px-2 py-1 rounded-full transition-colors',
          mode === 'developer' ? 'bg-gray-100 text-gray-700' : 'bg-gray-700 text-purple-300',
        ]"
      >
        {{ tag }}
      </span>
    </div>

    <a
      :href="link"
      target="_blank"
      rel="noopener noreferrer"
      :class="[
        'inline-flex items-center text-sm font-medium transition-colors',
        mode === 'developer'
          ? 'text-gray-900 hover:text-gray-700'
          : 'text-purple-400 hover:text-purple-300',
      ]"
    >
      {{ mode === 'developer' ? 'View project' : 'See details' }}
    </a>
  </div>
</template>
