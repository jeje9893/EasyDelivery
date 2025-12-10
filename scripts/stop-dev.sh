#!/bin/bash

echo "🛑 배달 앱 개발 환경 종료..."

cd "$(dirname "$0")/.."

docker-compose down

echo "✅ 개발 환경이 종료되었습니다."
