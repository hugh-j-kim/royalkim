import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
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
    const { name, email, blogTitle, image } = body;

    // 필수 필드 검증
    if (!name || !email) {
      return NextResponse.json(
        { message: '이름과 이메일은 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인 (자신의 이메일이 아닌 경우)
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { message: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        blogTitle: blogTitle || null,
        image: image || null
      }
    });

    const response = NextResponse.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        blogTitle: updatedUser.blogTitle,
        urlId: updatedUser.urlId,
        role: updatedUser.role,
        image: updatedUser.image
      }
    });

    // 캐시 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json(
      { message: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 