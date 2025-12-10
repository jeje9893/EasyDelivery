#!/bin/bash

# MySQL 서버 시작 스크립트
echo "🚀 MySQL 서버 시작 중..."

# MySQL 서비스 시작
sudo service mysql start

# 서비스 상태 확인
if sudo service mysql status | grep -q "running"; then
    echo "✅ MySQL 서버가 성공적으로 시작되었습니다."
    echo ""
    echo "📋 데이터베이스 스키마를 적용하려면:"
    echo "cd apps/api"
    echo "mysql -u root -p < ../../database/schema.sql"
else
    echo "❌ MySQL 서버 시작 실패"
    echo "다음 명령어로 로그를 확인하세요:"
    echo "sudo tail -f /var/log/mysql/error.log"
fi
