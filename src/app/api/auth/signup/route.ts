import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "이메일, 비밀번호, 이름을 모두 입력해주세요." },
        { status: 400 }
      )
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // 사용자의 블로그 자동 생성
    const blog = await prisma.blog.create({
      data: {
        title: `${name}의 블로그`,
        description: `${name}의 블로그에 오신 것을 환영합니다.`,
        userId: user.id,
        isPublic: true,
        customUrl: `${name.toLowerCase()}-blog`,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      blog: {
        id: blog.id,
        title: blog.title,
        customUrl: blog.customUrl,
      },
    })
  } catch (error) {
    console.error("Error in signup:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 