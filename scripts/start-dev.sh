#!/bin/bash

echo "🚀 배달 앱 개발 환경 시작..."
echo ""

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

# Docker가 설치되어 있는지 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    exit 1
fi

# Docker Compose가 설치되어 있는지 확인
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요:"
    echo "sudo apt install docker-compose"
    exit 1
fi

# MySQL 컨테이너 시작
echo "📦 MySQL 컨테이너 시작 중..."
docker-compose up -d mysql

# MySQL이 준비될 때까지 대기
echo "⏳ MySQL 초기화 대기 중..."
for i in {1..30}; do
    if docker exec delivery-app-db mysqladmin ping -h localhost -u root -pdelivery2024 --silent &> /dev/null; then
        echo "✅ MySQL이 준비되었습니다."
        break
    fi
    echo "   대기 중... ($i/30)"
    sleep 2
done

# 데이터베이스 확인
echo ""
echo "📊 데이터베이스 확인..."
docker exec delivery-app-db mysql -u root -pdelivery2024 -e "USE delivery_app; SHOW TABLES;"

echo ""
echo "✅ 개발 환경 준비 완료!"
echo ""
echo "다음 명령어로 API 서버를 시작하세요:"
echo "cd apps/api"
echo "npm install"
echo "npm start"
echo ""
echo "유용한 명령어:"
echo "  docker-compose logs -f mysql    # MySQL 로그 확인"
echo "  docker-compose down             # 서비스 중지"
echo "  docker exec -it delivery-app-db mysql -u root -pdelivery2024  # MySQL 접속"
