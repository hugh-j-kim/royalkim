import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, password, blogName, urlId } = await request.json()

    if (!email || !password || !name || !blogName || !urlId) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름, 블로그명, url id를 모두 입력해주세요." },
        { status: 400 }
      )
    }

    if (!/^[a-z0-9]{3,20}$/.test(urlId)) {
      return NextResponse.json(
        { error: "url id는 3~20자의 영문 소문자와 숫자만 입력 가능합니다." },
        { status: 400 }
      )
    }

    // 예약어 체크
    const reserved = [
      "admin", "posts", "user", "api", "auth", "login", "logout", "signup", "register", "category", "categories", "dashboard", "about", "contact", "search", "static", "public", "favicon.ico", "robots.txt"
    ]
    if (reserved.includes(urlId)) {
      return NextResponse.json(
        { error: "사용할 수 없는 url id입니다." },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      )
    }

    if (urlId) {
      const existingUrlId = await prisma.user.findFirst({
        where: { urlId: urlId } as any,
      })
      if (existingUrlId) {
        return NextResponse.json(
          { error: "이미 사용 중인 url id입니다." },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        blogTitle: blogName,
        urlId,
        role: "PENDING"
      } as any,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Error in register:", error)
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
} 