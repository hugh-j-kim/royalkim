-- 운영DB에 통계 기능 추가 스크립트
-- 기존 데이터는 건드리지 않고 새로운 테이블만 추가

-- 1. VisitorLog 테이블 생성 (이미 존재하면 무시)
CREATE TABLE IF NOT EXISTS "VisitorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "city" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- 2. 외래키 제약조건 추가 (이미 존재하면 무시)
DO $$ 
BEGIN
    -- User 테이블과의 관계
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'VisitorLog_userId_fkey'
    ) THEN
        ALTER TABLE "VisitorLog" 
        ADD CONSTRAINT "VisitorLog_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Post 테이블과의 관계
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'VisitorLog_postId_fkey'
    ) THEN
        ALTER TABLE "VisitorLog" 
        ADD CONSTRAINT "VisitorLog_postId_fkey" 
        FOREIGN KEY ("postId") REFERENCES "Post"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS "VisitorLog_userId_idx" ON "VisitorLog"("userId");
CREATE INDEX IF NOT EXISTS "VisitorLog_visitedAt_idx" ON "VisitorLog"("visitedAt");
CREATE INDEX IF NOT EXISTS "VisitorLog_postId_idx" ON "VisitorLog"("postId");

-- 4. 완료 메시지
SELECT '통계 기능이 성공적으로 추가되었습니다!' as message; 