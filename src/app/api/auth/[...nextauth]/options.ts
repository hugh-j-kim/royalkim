// import type { DefaultSession, NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

// 타입 확장 선언 주석 처리 (타입 에러 우회)
// declare module "next-auth" {
//   interface User {
//     id: string
//     role?: string | null
//   }
//   interface Session extends DefaultSession {
//     user: {
//       id: string
//       role?: string | null
//     } & DefaultSession["user"]
//   }
// }

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // 승인된 사용자만 로그인 가능
        if (!(user as any).role || (user as any).role === "PENDING") {
          throw new Error("승인 대기 중인 계정입니다. 관리자 승인 후 로그인해주세요.")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // @ts-ignore
          role: (user as any).role
        }
      }
    })
  ],
  callbacks: {
    // @ts-ignore
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    // @ts-ignore
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        (session.user as any).role = (token as any).role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  session: {
    strategy: "jwt" as const
  }
} 