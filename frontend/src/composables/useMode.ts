import { inject } from 'vue'
import { ModeInjectionKey} from '@/types/mode'

export function useMode() {
  const modeContext = inject(ModeInjectionKey)

  if (!modeContext) {
    throw new Error('useMode must be used within a component with ModeContext provided')
  }

  return modeContext
}
