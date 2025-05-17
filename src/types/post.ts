export interface Post {
  id: string
  title: string
  content?: string
  imageUrl?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    name?: string
    email: string
  }
  authorId?: string
} 