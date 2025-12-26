export interface Memory {
  id: string
  user_id: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  color: string
  is_public: boolean
  photo_url: string | null
  category: string | null
  created_at: string
  updated_at: string
  profiles?: {
    username: string | null
    display_name: string | null
  }
}