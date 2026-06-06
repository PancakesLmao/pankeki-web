// Type-safe form types matching Prisma schema
import type { ExperiencePosition } from '@/types/profile'

export interface ProjectFormData {
  title: string
  description?: string
  tags: string[]
  status:
    | 'completed-and-published'
    | 'ongoing'
    | 'deprecated'
    | 'completed-and-documenting'
    | 'upcoming'
    | 'under-maintenance'
  link?: string
  project_img?: string
  time_range?: string
}

export interface GameFormData {
  title: string
  description?: string
  tags: string[]
  genre: Array<
    | 'Gacha'
    | 'Sci_Fi'
    | 'Fantasy'
    | 'Hack_And_Slash'
    | 'Action_RPG'
    | 'RPG'
    | 'JRPG'
    | 'Visual_Novel'
    | 'Turn_based'
    | 'Open_World'
  >
  platform: Array<'PC' | 'Mobile' | 'PlayStation'>
  link?: string
  cover_img?: string
  icon_img?: string
}

export const PROJECT_STATUSES = [
  { value: 'completed-and-published', label: 'Completed & Published' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'completed-and-documenting', label: 'Completed & Documenting' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'under-maintenance', label: 'Under Maintenance' },
] as const

export const GAME_GENRES = [
  { value: 'Gacha', label: 'Gacha' },
  { value: 'Sci_Fi', label: 'Sci-Fi' },
  { value: 'Fantasy', label: 'Fantasy' },
  { value: 'Hack_And_Slash', label: 'Hack And Slash' },
  { value: 'Action_RPG', label: 'Action RPG' },
  { value: 'RPG', label: 'RPG' },
  { value: 'JRPG', label: 'JRPG' },
  { value: 'Visual_Novel', label: 'Visual Novel' },
  { value: 'Turn_based', label: 'Turn-based' },
  { value: 'Open_World', label: 'Open World' },
] as const

export const GAME_PLATFORMS = [
  { value: 'PC', label: 'PC' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'PlayStation', label: 'PlayStation' },
] as const

export interface ExperienceFormData {
  company: string
  location?: string
  logo?: string
  positions: ExperiencePosition[]
}

export interface CertificationFormData {
  title: string
  issuer: string
  date?: string | null
  icon?: string | null
  image_url?: string | null
  url?: string | null
}
