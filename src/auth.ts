import NextAuth from "next-auth"
import { authConfig } from "./app/api/auth/[...nextauth]/options"

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig) 