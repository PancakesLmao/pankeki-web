import { ref } from 'vue'
import { defineStore } from 'pinia'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

interface User {
  id: string
  email: string
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check if user is already authenticated
  const checkAuth = async () => {
    try {
      isLoading.value = true
      const response = await fetch(`${BACKEND_URL}/auth/me`, {
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
        isAuthenticated.value = true
        return true
      } else {
        user.value = null
        isAuthenticated.value = false
        return false
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      user.value = null
      isAuthenticated.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Sign in
  const signin = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(`${BACKEND_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        error.value = data.error || 'Sign in failed'
        return { success: false, error: error.value }
      }

      user.value = data.user
      isAuthenticated.value = true
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      error.value = message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const signout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      user.value = null
      isAuthenticated.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    checkAuth,
    signin,
    signout,
  }
})
