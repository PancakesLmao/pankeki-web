export interface Project {
  id: string
  title: string
  description: string
  status: string
  tags: string[]
  link: string
  time_range: string
  project_img: string
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
  cover_img: string
  icon_img: string
  created_at: string
}
