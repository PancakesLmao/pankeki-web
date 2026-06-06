import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const toasts = ref<Toast[]>([])
let _id = 0

export function useToast() {
  const push = (type: ToastType, message: string, duration = 4000) => {
    const id = ++_id
    toasts.value.push({ id, type, message })
    setTimeout(() => dismiss(id), duration)
  }

  const dismiss = (id: number) => {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return {
    toasts,
    success: (msg: string, duration?: number) => push('success', msg, duration),
    error: (msg: string, duration?: number) => push('error', msg, duration),
    info: (msg: string, duration?: number) => push('info', msg, duration),
    dismiss,
  }
}
