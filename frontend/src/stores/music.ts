import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { songsApi } from '@/api'
import type { Song } from '@/types/profile'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export const useMusicStore = defineStore('music', () => {
  const songs = ref<Song[]>([])
  const currentSong = ref<Song | null>(null)
  const isPlaying = ref(false)
  const volume = ref(70)
  const currentTime = ref(0)
  const duration = ref(0)
  const isLoading = ref(false)
  const isSongsLoading = ref(false)
  const error = ref<string | null>(null)

  let player: any = null
  let progressInterval: ReturnType<typeof setInterval> | null = null

  // Computed: background image URL (null = use default stars)
  const activeBgImage = computed<string | null>(() => {
    if (!currentSong.value) return null
    return currentSong.value.bg_image_url
  })

  // Extract YouTube video ID from any YouTube URL format
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Load YouTube IFrame API once
  const loadYouTubeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }
      window.onYouTubeIframeAPIReady = () => resolve()
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script')
        tag.id = 'yt-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    })
  }

  // Initialize the hidden YT player
  const initPlayer = async (videoId: string) => {
    await loadYouTubeAPI()

    const containerId = 'yt-player-hidden'
    let container = document.getElementById(containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      container.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;'
      document.body.appendChild(container)
    }

    return new Promise<void>((resolve) => {
      player = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume.value)
            resolve()
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              isPlaying.value = true
              duration.value = player.getDuration() || 0
              startProgressTracking()
            } else if (event.data === 2) {
              isPlaying.value = false
              stopProgressTracking()
            } else if (event.data === 0) {
              // Song ended — go to next track
              isPlaying.value = false
              stopProgressTracking()
              currentTime.value = 0
              playNext()
            }
          },
          onError: () => {
            isPlaying.value = false
            isLoading.value = false
          },
        },
      })
    })
  }

  const startProgressTracking = () => {
    stopProgressTracking()
    progressInterval = setInterval(() => {
      if (player && player.getCurrentTime) {
        currentTime.value = player.getCurrentTime() || 0
        duration.value = player.getDuration() || 0
      }
    }, 500)
  }

  const stopProgressTracking = () => {
    if (progressInterval !== null) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }

  // Fetch playlist from API
  const fetchSongs = async () => {
    isSongsLoading.value = true
    error.value = null
    try {
      const data = await songsApi.getAll()
      songs.value = data.songs || []
    } catch (e) {
      console.error('Failed to fetch songs:', e)
      error.value = 'Failed to load playlist. Please try again later.'
    } finally {
      isSongsLoading.value = false
    }
  }

  // Select and play a song
  const selectSong = async (song: Song) => {
    if (currentSong.value?.id === song.id) {
      togglePlay()
      return
    }

    isLoading.value = true
    currentSong.value = song
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0

    const videoId = extractVideoId(song.youtube_url)
    if (!videoId) {
      console.error('Invalid YouTube URL:', song.youtube_url)
      isLoading.value = false
      return
    }

    try {
      if (player && player.loadVideoById) {
        player.loadVideoById(videoId)
      } else {
        await initPlayer(videoId)
      }
    } catch (e) {
      console.error('Failed to initialize player:', e)
    } finally {
      isLoading.value = false
    }
  }

  const togglePlay = () => {
    if (!player) return
    if (isPlaying.value) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const setVolume = (v: number) => {
    volume.value = Math.min(100, Math.max(0, v))
    if (player && player.setVolume) {
      player.setVolume(volume.value)
    }
  }

  const seekTo = (seconds: number) => {
    if (player && player.seekTo) {
      player.seekTo(seconds, true)
      currentTime.value = seconds
    }
  }

  const playNext = () => {
    if (!songs.value.length) return
    const currentIndex = songs.value.findIndex((s) => s.id === currentSong.value?.id)
    const nextIndex = (currentIndex + 1) % songs.value.length
    selectSong(songs.value[nextIndex])
  }

  const playPrev = () => {
    if (!songs.value.length) return
    const currentIndex = songs.value.findIndex((s) => s.id === currentSong.value?.id)
    const prevIndex = (currentIndex - 1 + songs.value.length) % songs.value.length
    selectSong(songs.value[prevIndex])
  }

  return {
    songs,
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    isSongsLoading,
    error,
    activeBgImage,
    fetchSongs,
    selectSong,
    togglePlay,
    setVolume,
    seekTo,
    playNext,
    playPrev,
  }
})
