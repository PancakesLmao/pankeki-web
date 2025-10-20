<script setup lang="ts">
import { useMode } from '@/composables/useMode'

defineProps<{
  title: string
  description: string
  tags: string[]
  link: string
}>()

const { mode } = useMode()

</script>

<template>
  <div
    :class="[
      'p-6 rounded-xl transition-all hover:-translate-y-1',
      mode === 'developer'
        ? 'bg-white border border-gray-200 hover:shadow-md'
        : 'bg-gray-800 border border-gray-700 hover:border-purple-700',
    ]"
  >
    <h3
      :class="[
        'text-xl font-bold mb-2 transition-colors',
        mode === 'developer' ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ title }}
    </h3>

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
        mode === 'developer' ? 'text-gray-900 hover:text-gray-700' : 'text-purple-400 hover:text-purple-300',
      ]"
    >
      {{ mode === 'developer' ? 'View project' : 'See details' }}
    </a>
  </div>
</template>
