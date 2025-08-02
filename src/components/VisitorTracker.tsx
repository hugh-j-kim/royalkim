"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface VisitorTrackerProps {
  userId: string
  postId?: string
}

export default function VisitorTracker({ userId, postId }: VisitorTrackerProps) {
  const { data: session } = useSession()

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // 서버에서 HTTP 헤더를 통해 정보를 수집하므로
        // 클라이언트에서는 최소한의 정보만 전송
        await fetch('/api/visitor-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            postId
          })
        })
      } catch (error) {
        console.error('Failed to track visit:', error)
      }
    }

    // 로그인한 사용자가 아닌 경우에만 방문 추적
    if (!session?.user?.id || session.user.id !== userId) {
      trackVisit()
    }
  }, [userId, postId, session?.user?.id])

  return null // 이 컴포넌트는 UI를 렌더링하지 않습니다
} 