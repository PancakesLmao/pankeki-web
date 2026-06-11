<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, provide, computed } from 'vue'
import { ModeInjectionKey } from '@/types/mode'
import { useMusicStore } from '@/stores/music'
import Header from './components/AppHeader.vue'
import Footer from './components/AppFooter.vue'

// Reactive mode state
const mode = ref('developer')
// Provide mode and setMode to child components
provide(ModeInjectionKey, {
  mode,
  setMode: (newMode: string) => {
    mode.value = newMode
  },
})

const musicStore = useMusicStore()

// Active background — only used when in gamer mode
const activeBg = computed(() => musicStore.activeBgImage)
</script>

<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-500',
      mode === 'developer'
        ? 'bg-gray-50 text-gray-900'
        : 'bg-gray-900 text-gray-50',
    ]"
  >
    <!-- Gamer mode: song background crossfade layer -->
    <Transition name="bg-fade">
      <div
        v-if="mode !== 'developer' && activeBg"
        :key="activeBg"
        class="fixed inset-0 bg-cover bg-center bg-fixed z-0 pointer-events-none"
        :style="{ backgroundImage: `url(${activeBg})` }"
      />
    </Transition>

    <!-- Gamer mode: dark readability overlay (only when song bg is present) -->
    <Transition name="bg-fade">
      <div
        v-if="mode !== 'developer' && activeBg"
        class="fixed inset-0 bg-gray-950/70 backdrop-blur-[2px] z-10 pointer-events-none"
      />
    </Transition>

    <!-- Global background art credit (Bottom left fixed) -->
    <Transition name="fade-credit">
      <div
        v-if="mode !== 'developer' && activeBg && musicStore.currentSong?.art_credit"
        class="fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-full bg-gray-900/60 backdrop-blur-md border border-gray-700/50 text-xs text-gray-400 tracking-wider uppercase flex items-center gap-1.5"
      >
        <span>Art by <span class="text-gray-300 font-medium">{{ musicStore.currentSong.art_credit }}</span></span>
      </div>
    </Transition>

    <div class="max-w-5xl mx-auto px-4 py-8 relative z-20">
      <Header></Header>
      <main class="mb-8">
        <RouterView />
      </main>
      <Footer></Footer>
    </div>
  </div>
</template>

<style scoped>
/* Smooth crossfade for background image transitions */
.bg-fade-enter-active {
  transition: opacity 1.5s ease;
}
.bg-fade-leave-active {
  transition: opacity 1.5s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.fade-credit-enter-active,
.fade-credit-leave-active {
  transition: opacity 0.5s ease;
}
.fade-credit-enter-from,
.fade-credit-leave-to {
  opacity: 0;
}
</style>
