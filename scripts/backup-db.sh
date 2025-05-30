#!/bin/bash

# 현재 날짜와 시간을 파일명에 포함
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/royalkim_$TIMESTAMP.sql"

# 백업 디렉토리가 없으면 생성
mkdir -p $BACKUP_DIR

# 데이터베이스 백업 실행
echo "데이터베이스 백업을 시작합니다..."
pg_dump -h localhost -p 5432 -U postgres royalkim > $BACKUP_FILE

# 백업 파일 압축
gzip $BACKUP_FILE

echo "백업이 완료되었습니다: ${BACKUP_FILE}.gz" 