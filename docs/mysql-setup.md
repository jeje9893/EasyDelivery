# MySQL 설치 및 시작 가이드

## 문제 해결: MySQL 서비스를 찾을 수 없는 경우

### 방법 1: Docker 사용 (가장 추천)

Docker를 사용하면 복잡한 설치 과정 없이 MySQL을 바로 실행할 수 있습니다.

#### 1-1. Docker 설치 확인
```bash
docker --version
docker-compose --version
```

#### 1-2. Docker가 설치되지 않았다면
```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 다시 로그인하거나
newgrp docker

# Docker Compose 설치 (필요시)
sudo apt install docker-compose
```

#### 1-3. Docker로 MySQL 실행
프로젝트 루트에서:
```bash
# Docker Compose로 MySQL 시작 (백그라운드)
docker-compose up -d

# 로그 확인
docker-compose logs -f mysql

# MySQL 접속 테스트
docker exec -it delivery-app-db mysql -u root -pyour_password

# 데이터베이스 확인
SHOW DATABASES;
USE delivery_app;
SHOW TABLES;
```

#### 1-4. API 서버 실행
```bash
cd apps/api
npm install
npm start
```

### 방법 2: 직접 MySQL 설치

#### 2-1. MySQL 설치
```bash
sudo apt update
sudo apt install mysql-server -y
```

#### 2-2. 서비스 이름 확인
```bash
# mysqld로 시도
sudo service mysqld status
sudo service mysqld start

# 또는 systemctl 사용
sudo systemctl status mysql
sudo systemctl start mysql
```

#### 2-3. 설치 확인
```bash
mysql --version
```

#### 2-4. 데이터베이스 스키마 적용
```bash
cd /home/jg/projects/ai-call/apps/api
mysql -u root -p < ../../database/schema.sql
```

## MySQL 서버 관리 명령어

### 서비스 제어 (직접 설치한 경우)
```bash
# 상태 확인
sudo service mysql status
# 또는
sudo systemctl status mysql

# 시작
sudo service mysql start

# 중지
sudo service mysql stop

# 재시작
sudo service mysql restart

# 자동 시작 설정
sudo systemctl enable mysql
```

### Docker 사용 시
```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 재시작
docker-compose restart mysql

# 로그 확인
docker-compose logs -f mysql

# 컨테이너 상태 확인
docker ps

# MySQL 접속
docker exec -it delivery-app-db mysql -u root -p
```

## MySQL 초기 보안 설정 (직접 설치 시)
```bash
sudo mysql_secure_installation
```

## 데이터베이스 백업 및 복원

### 백업 (Docker 사용 시)
```bash
docker exec delivery-app-db mysqldump -u root -pyour_password delivery_app > backup.sql
```

### 복원 (Docker 사용 시)
```bash
docker exec -i delivery-app-db mysql -u root -pyour_password delivery_app < backup.sql
```

## 문제 해결 팁

### 포트 충돌 확인
```bash
# 3306 포트 사용 확인
sudo lsof -i :3306
# 또는
sudo netstat -tulpn | grep 3306
```

### Docker 컨테이너 완전 제거 후 재시작
```bash
docker-compose down -v
docker-compose up -d
```

### WSL2에서 Docker 설정
```bash
# Docker Desktop for Windows 설치 필요
# WSL2 통합 활성화 후 사용
```
