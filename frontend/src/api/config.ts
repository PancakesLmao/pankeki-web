// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
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
