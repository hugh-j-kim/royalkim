import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: "cmb9bjaex0000b2shlxe8e868"
      },
      include: {
        Post: true,
        Category: true,
        Series: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 