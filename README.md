# AI Call - 배달 앱

음성 AI를 활용한 간편한 배달 주문 애플리케이션

## 빠른 시작

### 1. Docker로 MySQL 시작

```bash
# 개발 환경 시작 스크립트 실행 권한 부여
chmod +x scripts/start-dev.sh

# 개발 환경 시작
./scripts/start-dev.sh
```

### 2. API 서버 실행

```bash
cd apps/api
npm install
npm start
```

### 3. 웹 애플리케이션 실행

```bash
cd apps/web
npm install
npm run dev
```

## 수동 설정

### Docker 없이 MySQL 사용

```bash
# MySQL 설치
sudo apt update
sudo apt install mysql-server

# 서비스 시작
sudo service mysql start

# 데이터베이스 스키마 적용
cd apps/api
mysql -u root -p < ../../database/schema.sql
```

## 유용한 명령어

```bash
# MySQL 로그 확인
docker-compose logs -f mysql

# MySQL 접속
docker exec -it delivery-app-db mysql -u root -pdelivery2024

# 개발 환경 종료
./scripts/stop-dev.sh

# 또는
docker-compose down
```

## 환경 변수

`apps/api/.env` 파일:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=delivery2024
DB_NAME=delivery_app
PORT=3001
```

## 문제 해결

자세한 내용은 [MySQL 설정 가이드](docs/mysql-setup.md)를 참조하세요.