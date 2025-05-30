import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, password, blogName } = await request.json()

    if (!name || !email || !password || !blogName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PENDING",
        blog: {
          create: {
            title: blogName,
            customUrl: email.split('@')[0] // 이메일의 @ 앞부분을 기본 URL로 사용
          }
        }
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Error in register:", error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
} 