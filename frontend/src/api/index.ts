import { API_CONFIG, DEFAULT_HEADERS } from './config'
import type { Project, Game } from '@/types/profile'
import type { ProjectFormData, GameFormData } from '@/types/forms'

// HTTP Client with error handling
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      credentials: 'include', // Always include cookies for auth
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(error.message || error.error || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient(API_CONFIG.BASE_URL)

// ============================================
// Projects API
// ============================================
export const projectsApi = {
  // Get all projects
  async getAll(): Promise<{ projects: Project[] }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE)
  },

  // Get project by ID
  async getById(id: string): Promise<{ project: Project }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id))
  },

  // Create project
  async create(data: ProjectFormData): Promise<{ message: string; project: Project }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.PROJECTS.BASE, data)
  },

  // Update project
  async update(
    id: string,
    data: Partial<ProjectFormData>,
  ): Promise<{ message: string; project: Project }> {
    return apiClient.put(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id), data)
  },

  // Delete project
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(id))
  },
}

// ============================================
// Games API
// ============================================
export const gamesApi = {
  // Get all games (sorted from oldest to latest)
  async getAll(): Promise<{ games: Game[] }> {
    const response = await apiClient.get<{ games: Game[] }>(API_CONFIG.ENDPOINTS.GAMES.BASE)
    // Sort by created_at from oldest to latest
    response.games.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateA - dateB
    })
    return response
  },

  // Get game by ID
  async getById(id: string): Promise<{ game: Game }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.GAMES.BY_ID(id))
  },

  // Create game
  async create(data: GameFormData): Promise<{ message: string; game: Game }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.GAMES.BASE, data)
  },

  // Update game
  async update(id: string, data: Partial<GameFormData>): Promise<{ message: string; game: Game }> {
    return apiClient.put(API_CONFIG.ENDPOINTS.GAMES.BY_ID(id), data)
  },

  // Delete game
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.GAMES.BY_ID(id))
  },
}

// ============================================
// Auth API
// ============================================
export const authApi = {
  // Sign in
  async signin(email: string, password: string): Promise<{ user: { id: string; email: string } }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNIN, { email, password })
  },

  // Sign out
  async signout(): Promise<{ message: string }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNOUT)
  },

  // Get current user
  async me(): Promise<{ user: { id: string; email: string } }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME)
  },
}

// ============================================
// Enums API
// ============================================
export const enumsApi = {
  // Get project statuses
  async getProjectStatuses(): Promise<{ data: Array<{ value: string; label: string }> }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.ENUMS.PROJECT_STATUSES)
  },

  // Get game genres
  async getGameGenres(): Promise<{ data: Array<{ value: string; label: string }> }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.ENUMS.GAME_GENRES)
  },

  // Get game platforms
  async getGamePlatforms(): Promise<{ data: Array<{ value: string; label: string }> }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.ENUMS.GAME_PLATFORMS)
  },
}

// Export everything
export { API_CONFIG }
