export interface Project {
  id: string
  title: string
  description: string
  status: string
  tags: string[]
  link: string
  time_range: string
  image_url: string | null
  project_img?: string
  created_at: string
  created_by: string
}

export interface Game {
  id: string
  title: string
  description: string
  genre: string[]
  platform: string[]
  tags: string[]
  link: string
  cover_url: string | null
  icon_url: string | null
  cover_img?: string
  icon_img?: string
  created_at: string
}
