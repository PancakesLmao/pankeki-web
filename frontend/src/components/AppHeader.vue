<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import { Mode } from '@/types/mode'
import { RouterLink } from 'vue-router'
import { Gamepad2, Code } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const { mode, setMode } = useMode()
const isScrolled = ref(false)
const music = useMusicStore()
const previousVolume = ref(70)

const toggleMute = () => {
  if (music.volume > 0) {
    previousVolume.value = music.volume
    music.setVolume(0)
  } else {
    music.setVolume(previousVolume.value > 0 ? previousVolume.value : 70)
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
<template>
  <header 
    class="sticky top-0 z-50 flex justify-between items-center h-16 mb-8 -mx-4 px-4 transition-all duration-300"
    :class="[
      isScrolled && mode === Mode.Developer
        ? 'bg-gray-50/95 backdrop-blur-md border-b border-gray-200/50' 
        : 'bg-transparent border-transparent'
    ]"
  >
    <RouterLink
      to="/"
      :class="[
        'text-2xl font-medium transition-colors hover:opacity-80 cursor-pointer',
        mode === Mode.Developer ? 'font-serif' : 'font-mono',
      ]"
    >
      {{ mode === Mode.Developer ? 'Nguyen Thinh' : 'Pankeki' }}
    </RouterLink>

    <div class="flex items-center gap-3">
      <!-- Music Indicator / Volume Control (Only in gamer mode when a song is playing) -->
      <div 
        v-if="mode === 'gamer' && music.currentSong" 
        class="relative flex items-center group mr-2"
      >
        <!-- Playing indicator & Mute toggle -->
        <button 
          @click="toggleMute"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700/30"
          :aria-label="music.volume === 0 ? 'Unmute' : 'Mute'"
        >
          <!-- Waves animation icon (always visible, animates from the center, flat when muted, static when paused) -->
          <div class="flex items-center justify-center gap-[3px] h-4 w-4">
            <div 
              v-for="i in 3" 
              :key="i"
              class="w-[3px] rounded-full"
              :class="[
                music.volume === 0 ? 'bg-gray-500' : 'bg-purple-400',
                music.isPlaying && music.volume > 0 ? 'bar-' + i : 'transition-all duration-300'
              ]"
              :style="{
                height: music.volume === 0 ? '4px' : (music.isPlaying ? '' : (i === 1 ? '6px' : i === 2 ? '12px' : '8px'))
              }"
            />
          </div>
        </button>

        <!-- Hover Volume Slider -->
        <div class="absolute right-full top-1/2 -translate-y-1/2 mr-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full px-3 py-2 flex items-center shadow-lg transform translate-x-2 group-hover:translate-x-0 after:absolute after:inset-y-0 after:-right-4 after:w-4">
          <input
            type="range"
            min="0"
            max="100"
            :value="music.volume"
            @input="(e) => music.setVolume(Number((e.target as HTMLInputElement).value))"
            class="w-20 h-1 accent-purple-500 cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </div>

      <span
        :class="[
          'text-sm transition-colors',
          mode === Mode.Developer ? 'text-gray-600' : 'text-purple-400',
        ]"
      >
        {{ mode === Mode.Developer ? 'Developer On' : 'Developer Off' }}
      </span>
      <button
        @click="setMode(mode === Mode.Developer ? 'gamer' : 'developer')"
        :class="[
          'p-2 rounded-full transition-colors',
          mode === Mode.Developer ? 'bg-gray-200' : 'bg-purple-900',
        ]"
        :aria-label="`Switch to ${mode === Mode.Developer ? 'gamer' : 'developer'} mode`"
      >
        <Code v-if="mode === Mode.Developer" :size="20" />
        <Gamepad2 v-else :size="20" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.bar-1 {
  animation: wave 0.55s ease-in-out infinite alternate;
}
.bar-2 {
  animation: wave 0.7s ease-in-out infinite alternate;
}
.bar-3 {
  animation: wave 0.85s ease-in-out infinite alternate;
}

@keyframes wave {
  from { height: 4px; }
  to { height: 16px; }
}
</style>
