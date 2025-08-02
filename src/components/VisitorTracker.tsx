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
        const referrer = document.referrer || null
        const userAgent = navigator.userAgent || null
        
        // 간단한 IP 주소 추적 (실제로는 서버 사이드에서 처리하는 것이 좋습니다)
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        const ipAddress = ipData.ip || null

        // 지역 정보 추적 (실제로는 더 정확한 서비스를 사용해야 합니다)
        let country = null
        let city = null
        try {
          const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
          const geoData = await geoResponse.json()
          country = geoData.country_name || null
          city = geoData.city || null
        } catch (error) {
          console.log('Failed to get location data')
        }

        await fetch('/api/visitor-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            postId,
            referrer,
            userAgent,
            ipAddress,
            country,
            city
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