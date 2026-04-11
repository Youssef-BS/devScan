export type User = {
  id?: number
  accessToken?: string
  username?: string
  avatarUrl?: string
  githubId?: number
  email ?: string
  password? : string
  firstName? : string
  lastName? : string
}

export type UserResponse = {
  user: User | null
  isAuthenticated: boolean
}
