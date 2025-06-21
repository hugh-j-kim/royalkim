import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      urlId?: string | null
      blogTitle?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    urlId?: string | null
    blogTitle?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
    urlId?: string | null
  }
} 