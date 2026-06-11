<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useMusicStore } from '@/stores/music'
import SectionTitle from '@/components/SectionTitle.vue'
import type { Song } from '@/types/profile'

const music = useMusicStore()

onMounted(() => {
  music.fetchSongs()
})

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const progressPercent = computed(() => {
  if (!music.duration) return 0
  return (music.currentTime / music.duration) * 100
})

const handleSeek = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  music.seekTo(ratio * music.duration)
}

const handleVolumeChange = (e: Event) => {
  music.setVolume(Number((e.target as HTMLInputElement).value))
}

const getYoutubeLink = (song: Song) => song.youtube_url
</script>

<template>
  <section id="music" class="pb-12">
    <SectionTitle title="Playlist" />

    <!-- Loading state -->
    <div v-if="music.isSongsLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative mx-auto w-16 h-16 mb-4">
          <div class="w-16 h-16 rounded-full border-4 border-purple-700/30 border-t-purple-400 animate-spin" />
        </div>
        <p class="text-purple-300 font-mono text-sm">Loading playlist...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="music.error" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4 text-red-500">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-400 font-mono text-sm mb-4">{{ music.error }}</p>
      <button @click="music.fetchSongs()" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors">
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="music.songs.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <!-- Animated vinyl record placeholder -->
      <div class="relative w-32 h-32 mb-6 opacity-50">
        <div class="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-gray-600 border-4 border-gray-500 flex items-center justify-center">
            <div class="w-3 h-3 rounded-full bg-gray-400" />
          </div>
        </div>
        <!-- grooves -->
        <div class="absolute inset-4 rounded-full border border-gray-600/50" />
        <div class="absolute inset-7 rounded-full border border-gray-600/40" />
        <div class="absolute inset-10 rounded-full border border-gray-600/30" />
      </div>
      <p class="text-lg font-mono text-purple-300 mb-1">No records in the jukebox yet...</p>
    </div>

    <!-- Player + Playlist -->
    <div v-else class="space-y-8">

      <!-- NOW PLAYING CARD -->
      <div class="relative rounded-2xl border border-purple-800/40 bg-gray-900/60 backdrop-blur-md overflow-hidden p-6">
        <div class="flex flex-col md:flex-row gap-6 items-center">

          <!-- Track info + controls -->
          <div class="flex-1 min-w-0 w-full">
            <!-- Track name -->
            <div v-if="music.currentSong" class="mb-3">
              <h3 class="text-xl font-bold text-purple-100 font-mono truncate">
                {{ music.currentSong.title }}
              </h3>
              <p class="text-sm text-purple-400">{{ music.currentSong.artist }}</p>
              <a
                :href="getYoutubeLink(music.currentSong)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-gray-500 hover:text-purple-400 transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.56V6.82a4.85 4.85 0 01-1.07-.13z"/>
                </svg>
                View on YouTube
              </a>
            </div>
            <div v-else class="mb-3">
              <p class="text-gray-400 font-mono text-sm">Select a track to play</p>
            </div>

            <!-- Progress bar -->
            <div class="mb-3">
              <div
                class="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group"
                @click="handleSeek"
              >
                <div
                  class="h-full bg-purple-500 rounded-full relative transition-all group-hover:bg-purple-400"
                  :style="{ width: progressPercent + '%' }"
                >
                  <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                <span>{{ formatTime(music.currentTime) }}</span>
                <span>{{ formatTime(music.duration) }}</span>
              </div>
            </div>

            <!-- Controls row -->
            <div class="flex items-center justify-center gap-4">
              <!-- Prev -->
              <button
                @click="music.playPrev()"
                class="text-gray-400 hover:text-purple-300 transition-colors p-1"
                aria-label="Previous song"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                </svg>
              </button>

              <!-- Play/Pause -->
              <button
                @click="music.currentSong ? music.togglePlay() : undefined"
                :disabled="!music.currentSong || music.isLoading"
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                  music.currentSong && !music.isLoading
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/50 hover:scale-105'
                    : 'bg-gray-700 opacity-50 cursor-not-allowed',
                ]"
                aria-label="Play/Pause"
              >
                <!-- Loading spinner -->
                <svg v-if="music.isLoading" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <!-- Pause icon -->
                <svg v-else-if="music.isPlaying" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <!-- Play icon -->
                <svg v-else class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>

              <!-- Next -->
              <button
                @click="music.playNext()"
                class="text-gray-400 hover:text-purple-300 transition-colors p-1"
                aria-label="Next song"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12z M16 6h2v12h-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PLAYLIST -->
      <div>
        <!-- <h3 class="text-xs font-mono uppercase tracking-widest text-purple-500 mb-3">
          Playlist — {{ music.songs.length }} track{{ music.songs.length !== 1 ? 's' : '' }}
        </h3> -->
        <div class="space-y-1.5">
          <button
            v-for="(song, index) in music.songs"
            :key="song.id"
            @click="music.selectSong(song)"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left group',
              music.currentSong?.id === song.id
                ? 'bg-purple-900/50 border-purple-600/50 shadow-lg shadow-purple-900/20'
                : 'bg-gray-800/40 border-gray-700/40 hover:bg-gray-800/60 hover:border-purple-700/40',
            ]"
          >
            <!-- Track number / playing indicator -->
            <div class="w-8 flex-shrink-0 text-center">
              <span
                v-if="music.currentSong?.id === song.id && music.isPlaying"
                class="inline-flex items-end gap-px h-4"
              >
                <span v-for="j in 3" :key="j"
                  class="w-0.5 bg-purple-400 rounded-full inline-block"
                  :style="{ animation: `wave ${0.3 + j * 0.15}s ease-in-out infinite alternate`, minHeight: '4px', maxHeight: '14px' }"
                />
              </span>
              <span
                v-else
                :class="[
                  'text-xs font-mono',
                  music.currentSong?.id === song.id ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400',
                ]"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </span>
            </div>

            <!-- Track details -->
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'font-medium text-sm truncate',
                  music.currentSong?.id === song.id ? 'text-purple-100' : 'text-gray-300 group-hover:text-gray-100',
                ]"
              >
                {{ song.title }}
              </p>
              <p class="text-xs text-gray-500 truncate">{{ song.artist }}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes wave {
  from { height: 4px; }
  to { height: 14px; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 4s linear infinite;
}
</style>
