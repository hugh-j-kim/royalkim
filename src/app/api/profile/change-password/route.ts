import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Session } from 'next-auth';

export async function PUT(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 필수 필드 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 새 비밀번호 길이 검증
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 현재 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { message: '비밀번호가 설정되어 있지 않습니다.' },
        { status: 400 }
      );
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 새 비밀번호 해싱
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json(
      { message: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 