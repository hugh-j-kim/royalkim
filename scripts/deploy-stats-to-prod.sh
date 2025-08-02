#!/bin/bash

# 운영DB에 통계 기능 배포 스크립트
# 기존 데이터는 건드리지 않고 새로운 테이블만 추가

echo "🚀 운영DB에 통계 기능 배포를 시작합니다..."

# 환경 변수 설정
export DATABASE_URL="postgresql://royalkim_owner:npg_ZxYBPbQf30yO@ep-flat-boat-a4w78aof-pooler.us-east-1.aws.neon.tech/royalkim?sslmode=require"

echo "📊 데이터베이스 연결 확인 중..."
npx prisma db pull

echo "🔍 현재 데이터베이스 스키마 확인 중..."
npx prisma db diff --from-empty --to-schema-datamodel prisma/schema.prisma

echo "⚠️  위의 차이점을 확인하세요. 기존 데이터는 영향을 받지 않습니다."
echo "계속하시겠습니까? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "✅ 마이그레이션을 실행합니다..."
    
    # 안전한 마이그레이션 실행
    npx prisma migrate deploy
    
    echo "✅ Prisma 클라이언트를 재생성합니다..."
    npx prisma generate
    
    echo "🎉 통계 기능 배포가 완료되었습니다!"
    echo ""
    echo "📋 배포된 기능:"
    echo "  - VisitorLog 테이블 (방문자 추적)"
    echo "  - 통계 API 엔드포인트 (/api/stats)"
    echo "  - 방문자 로그 API (/api/visitor-log)"
    echo "  - 통계 대시보드 (/dashboard/stats)"
    echo ""
    echo "🔗 다음 URL에서 확인할 수 있습니다:"
    echo "  - 통계 대시보드: https://royalkim.com/dashboard/stats"
    echo ""
    echo "⚠️  주의사항:"
    echo "  - 기존 데이터는 그대로 유지됩니다"
    echo "  - 새로운 방문자 추적이 시작됩니다"
    echo "  - 통계 데이터는 시간이 지나면서 쌓입니다"
else
    echo "❌ 배포가 취소되었습니다."
    exit 1
fi 