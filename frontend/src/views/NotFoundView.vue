<script lang="ts" setup>
import { useMode } from '@/composables/useMode'
import { RouterLink } from 'vue-router'

const { mode } = useMode()
</script>

<template>
  <div
    :class="[
      ' flex flex-col items-center justify-center text-center px-4',
      mode === 'developer' ? '' : 'bg-gray-900/50 rounded-lg',
    ]"
  >
    <!-- GIF Container -->
    <div class="mb-5 w-full max-w-md">
      <div
        :class="[
          'w-full h-[23rem] rounded-lg flex items-center justify-center overflow-hidden shadow-lg',
          mode === 'developer'
            ? 'bg-gray-200 border-2 border-gray-300'
            : 'bg-gray-800 border-2 border-purple-900',
        ]"
      >
        <img
          src="@/assets/arknights-nian.gif"
          alt="Nian vibing"
          class="w-full h-full object-cover"
          @error="
            (e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }
          "
        />
      </div>
    </div>

    <!-- Error Code and Message -->
    <div class="mb-8">
      <h1
        :class="[
          'text-6xl font-bold mb-4',
          mode === 'developer' ? 'text-gray-900' : 'text-purple-300',
        ]"
      >
      </h1>
      <p :class="['text-xl mb-2', mode === 'developer' ? 'text-gray-700' : 'text-purple-200']">
        There's nothing to be found here
      </p>
      <p :class="['text-lg', mode === 'developer' ? 'text-gray-600' : 'text-purple-300']">
        Just some beans vibing
      </p>
    </div>

    <!-- Navigation Links -->
    <div class="flex gap-4 flex-wrap justify-center">
      <RouterLink
        to="/"
        :class="[
          'px-6 py-3 rounded-lg font-medium transition-colors',
          mode === 'developer'
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-purple-600 text-white hover:bg-purple-700',
        ]"
      >
        Back Home
      </RouterLink>
      <a
        href="https://github.com/PancakesLmao"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
          'px-6 py-3 rounded-lg font-medium transition-colors border',
          mode === 'developer'
            ? 'border-gray-300 text-gray-900 hover:bg-gray-100'
            : 'border-purple-500 text-purple-300 hover:bg-purple-900/30',
        ]"
      >
        GitHub Repo
      </a>
    </div>
  </div>
</template>
