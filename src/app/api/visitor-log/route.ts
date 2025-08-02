import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, postId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // HTTP 헤더에서 정보 추출
    const headers = request.headers
    
    // Referer 헤더 (이전 페이지 URL)
    const referrer = headers.get('referer') || null
    
    // User-Agent 헤더 (브라우저 정보)
    const userAgent = headers.get('user-agent') || null
    
    // X-Forwarded-For 헤더 (프록시를 통한 실제 IP)
    const forwardedFor = headers.get('x-forwarded-for')
    const realIp = headers.get('x-real-ip')
    const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
    
    // IP 주소 결정 (우선순위: Cloudflare > X-Real-IP > X-Forwarded-For > 기본)
    let ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || null
    
    // Accept-Language 헤더 (언어 설정)
    const acceptLanguage = headers.get('accept-language') || null
    
    // Accept 헤더 (브라우저가 받을 수 있는 콘텐츠 타입)
    const accept = headers.get('accept') || null
    
    // Sec-Ch-Ua 헤더 (브라우저 정보 - 최신 브라우저)
    const secChUa = headers.get('sec-ch-ua') || null
    const secChUaPlatform = headers.get('sec-ch-ua-platform') || null
    const secChUaMobile = headers.get('sec-ch-ua-mobile') || null

    // HTTPS 관련 헤더들
    const xForwardedProto = headers.get('x-forwarded-proto') // 'https' 또는 'http'
    const xForwardedHost = headers.get('x-forwarded-host') // 원본 호스트
    const xForwardedPort = headers.get('x-forwarded-port') // 원본 포트

    // 디버깅을 위한 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Visitor Log Debug Info ===')
      console.log('Referrer:', referrer)
      console.log('User-Agent:', userAgent?.substring(0, 100) + '...')
      console.log('IP Address:', ipAddress)
      console.log('X-Forwarded-For:', forwardedFor)
      console.log('X-Real-IP:', realIp)
      console.log('CF-Connecting-IP:', cfConnectingIp)
      console.log('X-Forwarded-Proto:', xForwardedProto)
      console.log('X-Forwarded-Host:', xForwardedHost)
      console.log('Accept-Language:', acceptLanguage)
      console.log('Sec-CH-UA-Mobile:', secChUaMobile)
      console.log('================================')
    }

    // 지역 정보 추적 (IP 기반)
    let country = null
    let city = null
    
    if (ipAddress) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          country = geoData.country_name || null
          city = geoData.city || null
        }
      } catch (error) {
        console.log('Failed to get location data for IP:', ipAddress)
      }
    }

    // 브라우저 정보 파싱
    let browserInfo = null
    if (userAgent) {
      browserInfo = parseUserAgent(userAgent)
    }

    // Referrer 분석 및 정리
    const referrerInfo = analyzeReferrer(referrer, xForwardedProto)

    const visitorLog = await prisma.visitorLog.create({
      data: {
        userId,
        postId,
        referrer: referrerInfo.cleanReferrer,
        userAgent,
        ipAddress,
        country,
        city,
        // 추가 정보를 JSON으로 저장할 수 있도록 스키마 확장이 필요
        // browserInfo: JSON.stringify(browserInfo),
        // acceptLanguage,
        // accept,
        // secChUa,
        // secChUaPlatform,
        // secChUaMobile,
        // referrerType: referrerInfo.type,
        // isHttps: xForwardedProto === 'https'
      }
    })

    return NextResponse.json({
      ...visitorLog,
      debug: process.env.NODE_ENV === 'development' ? {
        referrerInfo,
        browserInfo,
        isHttps: xForwardedProto === 'https',
        protocol: xForwardedProto
      } : undefined
    })
  } catch (error) {
    console.error('Visitor log API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// User-Agent 파싱 함수
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  let browser = 'Unknown'
  let version = 'Unknown'
  let os = 'Unknown'
  
  // 브라우저 감지
  if (ua.includes('chrome')) {
    browser = 'Chrome'
    const match = ua.match(/chrome\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
    const match = ua.match(/firefox\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
    const match = ua.match(/version\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('edge')) {
    browser = 'Edge'
    const match = ua.match(/edge\/(\d+)/)
    if (match) version = match[1]
  }
  
  // OS 감지
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('mac')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }
  
  return {
    browser,
    version,
    os,
    isMobile: ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')
  }
}

// Referrer 분석 함수
function analyzeReferrer(referrer: string | null, protocol: string | null) {
  if (!referrer) {
    return {
      type: 'direct',
      cleanReferrer: null,
      domain: null,
      isHttps: false
    }
  }

  try {
    const url = new URL(referrer)
    const isHttps = url.protocol === 'https:'
    
    // 도메인별 분류
    let type = 'other'
    const domain = url.hostname.toLowerCase()
    
    if (domain.includes('google')) {
      type = 'google'
    } else if (domain.includes('naver')) {
      type = 'naver'
    } else if (domain.includes('daum')) {
      type = 'daum'
    } else if (domain.includes('bing')) {
      type = 'bing'
    } else if (domain.includes('youtube')) {
      type = 'youtube'
    } else if (domain.includes('twitter') || domain.includes('x.com')) {
      type = 'twitter'
    } else if (domain.includes('facebook')) {
      type = 'facebook'
    } else if (domain.includes('instagram')) {
      type = 'instagram'
    } else if (domain.includes('royalkim.com') || domain.includes('localhost')) {
      type = 'internal'
    }

    return {
      type,
      cleanReferrer: referrer,
      domain,
      isHttps
    }
  } catch (error) {
    return {
      type: 'invalid',
      cleanReferrer: referrer,
      domain: null,
      isHttps: false
    }
  }
} 