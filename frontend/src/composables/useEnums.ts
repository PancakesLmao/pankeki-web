import { ref, computed } from 'vue'

export interface EnumOption {
  value: string
  label: string
}

// Default values matching the Prisma schema
const DEFAULT_PROJECT_STATUSES: EnumOption[] = [
  { value: 'completed-and-published', label: 'Completed & Published' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'completed-and-documenting', label: 'Completed & Documenting' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'under-maintenance', label: 'Under Maintenance' },
]

const DEFAULT_GAME_GENRES: EnumOption[] = [
  { value: 'gacha', label: 'Gacha' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'hack-and-slash', label: 'Hack and Slash' },
  { value: 'action-rpg', label: 'Action RPG' },
  { value: 'rpg', label: 'RPG' },
  { value: 'jrpg', label: 'JRPG' },
  { value: 'visual-novel', label: 'Visual Novel' },
  { value: 'turn-based', label: 'Turn-based' },
  { value: 'open-world', label: 'Open World' },
]

const DEFAULT_GAME_PLATFORMS: EnumOption[] = [
  { value: 'pc', label: 'PC' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'playstation', label: 'PlayStation' },
]

interface EnumCache {
  projectStatuses: EnumOption[]
  gameGenres: EnumOption[]
  gamePlatforms: EnumOption[]
  loading: boolean
  error: string | null
}

const cache = ref<EnumCache>({
  projectStatuses: DEFAULT_PROJECT_STATUSES,
  gameGenres: DEFAULT_GAME_GENRES,
  gamePlatforms: DEFAULT_GAME_PLATFORMS,
  loading: false,
  error: null,
})

export const useEnums = () => {
  const fetchEnums = async () => {
    cache.value.loading = true
    cache.value.error = null

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

      const [statusRes, genresRes, platformsRes] = await Promise.all([
        fetch(`${baseUrl}/enums/project-statuses`),
        fetch(`${baseUrl}/enums/game-genres`),
        fetch(`${baseUrl}/enums/game-platforms`),
      ])

      if (!statusRes.ok || !genresRes.ok || !platformsRes.ok) {
        throw new Error('Failed to fetch enums from server')
      }

      const [statusData, genresData, platformsData] = await Promise.all([
        statusRes.json(),
        genresRes.json(),
        platformsRes.json(),
      ])

      cache.value.projectStatuses = statusData.data || DEFAULT_PROJECT_STATUSES
      cache.value.gameGenres = genresData.data || DEFAULT_GAME_GENRES
      cache.value.gamePlatforms = platformsData.data || DEFAULT_GAME_PLATFORMS
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      cache.value.error = errorMsg
      console.error('Failed to fetch enums:', err)
      // Keep using defaults on error
    } finally {
      cache.value.loading = false
    }
  }

  return {
    projectStatuses: computed(() => cache.value.projectStatuses),
    gameGenres: computed(() => cache.value.gameGenres),
    gamePlatforms: computed(() => cache.value.gamePlatforms),
    loading: computed(() => cache.value.loading),
    error: computed(() => cache.value.error),
    fetchEnums,
  }
}
