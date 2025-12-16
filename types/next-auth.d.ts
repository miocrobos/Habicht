import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    playerId?: string
    recruiterId?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      playerId?: string
      recruiterId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    playerId?: string
    recruiterId?: string
  }
}
