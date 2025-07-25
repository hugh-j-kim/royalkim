import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"
import type { JWT } from "next-auth/jwt"
import type { Session as NextAuthSession, User as NextAuthUser } from "next-auth"

// Session 타입 확장 필요시 아래와 같이 사용하세요.
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string
//       name: string
//       email: string
//       image?: string | null
//       role?: string
//     }
//   }
// }

export const authOptions: any = {
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
        if (!user.role || user.role === "PENDING") {
          throw new Error("승인 대기 중인 계정입니다. 관리자 승인 후 로그인해주세요.")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          blogTitle: user.blogTitle,
          urlId: user.urlId,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.urlId = user.urlId;
        token.blogTitle = user.blogTitle;
      }
      return token;
    },
    async session({ session, token }: { session: NextAuthSession; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.urlId = token.urlId as string;
        session.user.blogTitle = token.blogTitle as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  session: {
    strategy: "jwt" as const
  }
} 