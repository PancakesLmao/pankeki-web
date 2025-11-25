<script lang="ts" setup>
import { useMode } from '@/composables/useMode'
const { mode } = useMode()
</script>

<template>
  <div
    :class="[
      'p-6 rounded-xl transition-colors',
      mode === 'developer'
        ? 'bg-white border border-gray-200'
        : 'bg-gray-900 border border-purple-900',
    ]"
  >
    <h4
      :class="[
        'text-lg font-medium mb-4 transition-colors',
        mode === 'developer' ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ mode === 'developer' ? 'Quick message' : 'Say hello' }}
    </h4>

    <form class="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Your name"
          :class="[
            'w-full p-3 rounded-md border transition-colors',
            mode === 'developer'
              ? 'border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
              : 'border-gray-700 bg-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
          ]"
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Your email"
          :class="[
            'w-full p-3 rounded-md border transition-colors',
            mode === 'developer'
              ? 'border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
              : 'border-gray-700 bg-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
          ]"
        />
      </div>

      <div>
        <textarea
          placeholder="Your message"
          rows="4"
          :class="[
            'w-full p-3 rounded-md border transition-colors',
            mode === 'developer'
              ? 'border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500'
              : 'border-gray-700 bg-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
          ]"
        ></textarea>
      </div>

      <button
        type="submit"
        :class="[
          'w-full py-3 rounded-md font-medium transition-colors',
          mode === 'developer'
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-purple-600 text-white hover:bg-purple-700',
        ]"
      >
        Send message
      </button>
    </form>
  </div>
</template>
