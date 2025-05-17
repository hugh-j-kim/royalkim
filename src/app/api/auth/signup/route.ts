import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "이메일, 비밀번호, 이름을 모두 입력해주세요." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 12)

    // 사용자 생성
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다." },
      { status: 201 }
    )
  } catch (error) {
    console.error("회원가입 오류:", error)
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 