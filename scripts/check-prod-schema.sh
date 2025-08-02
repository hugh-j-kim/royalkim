#!/bin/bash

# 운영DB 스키마 확인 스크립트

echo "🔍 운영DB 스키마를 확인합니다..."

# 환경 변수 설정
export DATABASE_URL="postgresql://royalkim_owner:npg_ZxYBPbQf30yO@ep-flat-boat-a4w78aof-pooler.us-east-1.aws.neon.tech/royalkim?sslmode=require"

echo "📊 현재 데이터베이스 테이블 목록:"
npx prisma db pull --print

echo ""
echo "🔍 VisitorLog 테이블 존재 여부 확인:"
npx prisma db execute --stdin <<< "
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'VisitorLog'
ORDER BY ordinal_position;
"

echo ""
echo "🔍 외래키 제약조건 확인:"
npx prisma db execute --stdin <<< "
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'VisitorLog';
"

echo ""
echo "✅ 스키마 확인이 완료되었습니다." 