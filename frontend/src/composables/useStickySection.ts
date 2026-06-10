import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMode } from './useMode'

export type SectionId = 'about' | 'certifications' | 'experience' | 'projects' | 'contact'

const SECTION_ORDER: SectionId[] = ['about', 'certifications', 'experience', 'projects', 'contact']

export function useStickySection() {
  const activeSection = ref<SectionId | null>(null)
  const { mode } = useMode()
  let rafId: number | null = null

  const isVisible = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden'
  }

  const update = () => {
    let last: SectionId | null = null
    for (const id of SECTION_ORDER) {
      const el = document.getElementById(id)
      if (!el || !isVisible(el)) continue
      const rect = el.getBoundingClientRect()
      // Section top has scrolled past the viewport top
      if (rect.top <= 0) last = id
    }
    activeSection.value = last
  }

  const handleScroll = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(update)
  }

  // Re-evaluate when mode switches (certifications/experience visibility changes)
  watch(mode, () => update())

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    update()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  return { activeSection }
}
