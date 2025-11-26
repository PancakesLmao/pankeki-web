const DOMAIN = import.meta.env.VITE_DOMAIN || 'localhost'
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '3000'
const isDevelopment = !import.meta.env.PROD

const getBackendUrl = (): string => {
  if (isDevelopment) {
    return `http://${DOMAIN}:${BACKEND_PORT}`
  }
  // Production: use VITE_DOMAIN env variable (must be set in production)
  if (!DOMAIN || DOMAIN === 'localhost') {
    throw new Error('VITE_DOMAIN environment variable must be set in production')
  }
  return `https://${DOMAIN}`
}

export const API_CONFIG = {
  BASE_URL: getBackendUrl(),
  ENDPOINTS: {
    // Auth
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNOUT: '/api/auth/signout',
      ME: '/api/auth/me',
    },
    // Projects
    PROJECTS: {
      BASE: '/api/projects',
      BY_ID: (id: string) => `/api/projects/${id}`,
    },
    // Games
    GAMES: {
      BASE: '/api/games',
      BY_ID: (id: string) => `/api/games/${id}`,
    },
    // Enums
    ENUMS: {
      PROJECT_STATUSES: '/api/enums/project-statuses',
      GAME_GENRES: '/api/enums/game-genres',
      GAME_PLATFORMS: '/api/enums/game-platforms',
    },
  },
}

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}
