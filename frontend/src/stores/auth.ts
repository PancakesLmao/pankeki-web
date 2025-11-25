import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api'

interface User {
  id: string
  email: string
  created_at?: string
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
      const data = await authApi.me()
      user.value = data.user
      isAuthenticated.value = true
      return true
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

      const data = await authApi.signin(email, password)
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
      await authApi.signout()
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
