# 🚀 완전한 설정 가이드 (DB 테이블 생성부터 앱 실행까지)

이 가이드는 DB를 켜고 테이블을 생성하는 것부터 시작하여 백엔드, 프론트엔드를 실행하고 정상 작동을 확인하는 전체 과정을 다룹니다.

---

## 📋 목차

1. [DB 컨테이너 시작 및 테이블 생성](#1-db-컨테이너-시작-및-테이블-생성)
2. [DB 정상 작동 확인](#2-db-정상-작동-확인)
3. [백엔드 API 서버 실행](#3-백엔드-api-서버-실행)
4. [프론트엔드 앱 실행](#4-프론트엔드-앱-실행)
5. [전체 시스템 작동 확인](#5-전체-시스템-작동-확인)
6. [문제 해결](#6-문제-해결)

---

## 1. DB 컨테이너 시작 및 테이블 생성

### 1-1. 기존 DB 완전 삭제 (깨끗한 시작)

```bash
# 프로젝트 루트로 이동
cd /home/jg/projects/ai-call

# 기존 컨테이너와 볼륨 완전 삭제
docker-compose down -v
```

**예상 출력:**
```
[+] Running 2/2
 ✓ Container delivery-app-db  Removed
 ✓ Volume ai-call_mysql_data  Removed
```

### 1-2. DB 컨테이너 시작

```bash
docker-compose up -d mysql
```

**예상 출력:**
```
[+] Running 2/2
 ✓ Volume "ai-call_mysql_data"  Created
 ✓ Container delivery-app-db    Started
```

### 1-3. DB 초기화 대기 (중요!)

```bash
echo "⏳ DB 초기화 중... 30초 대기"
sleep 30
```

**이 시간 동안 일어나는 일:**
- MySQL 서버 시작
- `schema.sql` 파일 자동 실행
- 테이블 생성 (`guardian_menus`, `recommended_menus`, `restaurants`)
- 초기 데이터 삽입

### 1-4. DB 상태 확인

```bash
docker ps
```

**정상 응답 (반드시 `healthy` 상태):**
```
CONTAINER ID   IMAGE       STATUS                   PORTS                 NAMES
abc123def      mysql:8.0   Up 1 minute (healthy)    0.0.0.0:3306->3306    delivery-app-db
```

**❌ 상태가 `unhealthy` 또는 `(health: starting)`이면:**
```bash
# 추가로 30초 더 대기
sleep 30
docker ps
```

---

## 2. DB 정상 작동 확인

### 2-1. 테이블 생성 확인

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
```

**정상 응답:**
```
mysql: [Warning] Using a password on the command line interface can be insecure.
+------------------------+
| Tables_in_delivery_app |
+------------------------+
| guardian_menus         |
| recommended_menus      |
| restaurants            |
+------------------------+
```

**✅ 3개의 테이블이 보이면 성공!**

**❌ 테이블이 없거나 에러가 나면:**
```bash
# schema.sql 수동 실행
docker exec -i delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app < ./database/schema.sql

# 다시 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
```

### 2-2. 보호자 메뉴 데이터 확인

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
```

**정상 응답:**
```
+----+-------------------+-----------+-------+-------+---------------------+
| id | restaurant_name   | menu_name | price | image | created_at          |
+----+-------------------+-----------+-------+-------+---------------------+
|  1 | 중국집            | 짜장면    |  9900 | 🍜   | 2024-12-10 12:00:00 |
+----+-------------------+-----------+-------+-------+---------------------+
```

**✅ 1개의 메뉴(중국집 짜장면)가 보이면 성공!**

### 2-3. 추천 메뉴 개수 확인

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT COUNT(*) as total FROM recommended_menus;"
```

**정상 응답:**
```
+-------+
| total |
+-------+
|    10 |
+-------+
```

**✅ 10개가 보이면 성공!**

### 2-4. 식당 데이터 확인

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM restaurants;"
```

**정상 응답:**
```
+----+--------------+------------------+------+
| id | name         | category         | img  |
+----+--------------+------------------+------+
|  1 | 중국집       | 중식             | 🥟  |
|  2 | 치킨마을     | 치킨             | 🍗  |
|  3 | 한식당       | 한식             | 🍚  |
|  4 | 피자집       | 피자/양식        | 🍕  |
|  5 | 돈까스집     | 일식/돈까스      | 🍛  |
|  6 | 족발보쌈     | 족발/보쌈        | 🥓  |
|  7 | 분식집       | 분식             | 🍢  |
|  8 | 카페         | 카페/디저트      | ☕   |
+----+--------------+------------------+------+
```

**✅ 8개의 식당이 보이면 성공!**

---

## 3. 백엔드 API 서버 실행

### 3-1. 새 터미널 열기 (터미널 2)

```bash
# 터미널 1은 그대로 두고
# 새 터미널 창 열기: Ctrl+Alt+T
```

### 3-2. 백엔드 디렉터리로 이동

```bash
cd /home/jg/projects/ai-call/apps/server
```

### 3-3. package.json 확인

```bash
cat package.json
```

**예상 내용:**
```json
{
  "name": "delivery-app-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

### 3-4. 의존성 설치 (처음 1회만)

```bash
npm install
```

**예상 출력:**
```
added 57 packages in 3s
```

### 3-5. 서버 실행

```bash
npm run dev
```

**정상 응답 (반드시 이 메시지가 나와야 함):**
```
🚀 서버 시작: http://localhost:3001
📌 API 베이스 URL: http://localhost:3001/api
```

**✅ 이 메시지가 보이면 백엔드 서버 실행 성공!**

**❌ 에러가 나면:**
```bash
# 포트 충돌 확인
lsof -i :3001

# 충돌하는 프로세스 종료
pkill -f "node server.js"

# 다시 실행
npm run dev
```

### 3-6. API 응답 테스트 (새 터미널 3에서)

```bash
# 새 터미널 열기
curl http://localhost:3001/api/health
```

**정상 응답:**
```json
{"status":"ok"}
```

```bash
# 보호자 메뉴 조회
curl http://localhost:3001/api/guardian-menus
```

**정상 응답:**
```json
[
  {
    "id": 1,
    "restaurant_name": "중국집",
    "menu_name": "짜장면",
    "price": 9900,
    "image": "🍜",
    "created_at": "2024-12-10T12:00:00.000Z"
  }
]
```

**✅ JSON 응답이 보이면 API 서버 정상 작동!**

---

## 4. 프론트엔드 앱 실행

### 4-1. 새 터미널 열기 (터미널 3)

```bash
# 터미널 1: DB 실행 중
# 터미널 2: 백엔드 서버 실행 중
# 터미널 3: 새로 열기 (Ctrl+Alt+T)
```

### 4-2. 프론트엔드 디렉터리로 이동

```bash
cd /home/jg/projects/ai-call/apps/web
```

### 4-3. 의존성 설치 (처음 1회만)

```bash
npm install
```

**예상 시간:** 1-2분

### 4-4. 앱 실행

```bash
npm run dev
```

**정상 응답:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**✅ Local 주소가 보이면 프론트엔드 실행 성공!**

**❌ 에러가 나면:**
```bash
# 포트 충돌 확인
lsof -i :5173

# 충돌하는 프로세스 종료
pkill -f "vite"

# 다시 실행
npm run dev
```

---

## 5. 전체 시스템 작동 확인

### 5-1. 현재 실행 중인 서비스 확인

```bash
# 새 터미널 열기 (터미널 4)

# DB 상태
docker ps | grep delivery-app-db
# → Up XX (healthy) 확인

# 백엔드 API 응답
curl -s http://localhost:3001/api/health
# → {"status":"ok"} 확인

# 프론트엔드 접속
curl -I http://localhost:5173
# → HTTP/1.1 200 OK 확인
```

**✅ 모두 응답하면 전체 시스템 정상 실행!**

### 5-2. 보호자 모드 브라우저 테스트

#### 접속
```
http://localhost:5173/guardian
```

#### 예상 화면
- 헤더: "🛡️ 보호자 메뉴 관리"
- "+ 추가" 버튼
- 메뉴 카드: "중국집 짜장면 9900원"

#### 브라우저 콘솔 확인 (F12 → Console)
```
📡 [보호자 모드] 보호자 메뉴 API 호출
✅ [보호자 모드] 메뉴 로드 성공: 1개
```

**✅ 메뉴가 보이고 콘솔에 로그가 나오면 성공!**

### 5-3. 사용자 모드 브라우저 테스트

#### 접속
```
http://localhost:5173
```

#### 예상 화면
- 타이틀: "Simple Delivery App"
- "내 메뉴" 탭: 중국집 짜장면 9900원
- "추천 메뉴" 탭: 10개의 추천 메뉴

#### 브라우저 콘솔 확인
```
✅ [사용자 모드] API에서 보호자 메뉴 로드: 1개
✅ [사용자 모드] API에서 추천 메뉴 로드: 10개
```

**✅ 메뉴가 보이고 콘솔에 로그가 나오면 성공!**

### 5-4. 메뉴 추가 기능 테스트

#### 보호자 모드에서 메뉴 추가
1. http://localhost:5173/guardian 접속
2. "+ 추가" 버튼 클릭
3. 다음 정보 입력:
   - 식당명: `한식당`
   - 메뉴명: `비빔밥`
   - 가격: `12000`
   - 아이콘: `🥗` 선택
4. "추가" 버튼 클릭

#### DB에서 확인
```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
```

**정상 응답:**
```
+----+-------------------+-----------+-------+-------+
| id | restaurant_name   | menu_name | price | image |
+----+-------------------+-----------+-------+-------+
|  1 | 중국집            | 짜장면    |  9900 | 🍜   |
|  2 | 한식당            | 비빔밥    | 12000 | 🥗   |
+----+-------------------+-----------+-------+-------+
```

**✅ 2개의 메뉴가 보이면 메뉴 추가 기능 정상!**

#### 사용자 모드에서 확인
1. http://localhost:5173 접속
2. 페이지 새로고침 (F5)
3. "내 메뉴" 탭 확인
4. "중국집 짜장면"과 "한식당 비빔밥" 표시 확인

**✅ 새로 추가한 메뉴가 보이면 동기화 정상!**

---

## 6. 문제 해결

### 문제 1: 테이블이 생성되지 않음

**증상:**
```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
# Empty set (0.00 sec)
```

**해결:**
```bash
# schema.sql 수동 실행
docker exec -i delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app < ./database/schema.sql

# 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
```

### 문제 2: 백엔드 서버가 시작되지 않음

**증상:**
```bash
npm run dev
# Error: Cannot find module 'express'
```

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 문제 3: 프론트엔드가 백엔드 API를 찾지 못함

**증상:**
브라우저 콘솔에서:
```
ERR_CONNECTION_REFUSED http://localhost:3001/api/guardian-menus
```

**해결:**
```bash
# 백엔드 서버 상태 확인
curl http://localhost:3001/api/health

# 응답 없으면 터미널 2에서 백엔드 서버 재시작
# Ctrl+C로 중단 후
npm run dev
```

### 문제 4: 한글이 깨져서 보임

**증상:**
```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
# ?????? ?????? ?????
```

**해결:**
```bash
# DB 인코딩 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW VARIABLES LIKE 'character_set%';"

# UTF-8로 설정되어 있는지 확인
# 안 되어 있으면 DB 재생성
docker-compose down -v
docker-compose up -d mysql
sleep 30
```

### 문제 5: 포트 충돌

**증상:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**해결:**
```bash
# 포트 사용 프로세스 확인
lsof -i :3001

# PID 확인 후 종료
kill -9 <PID>

# 또는 모든 node 프로세스 종료
pkill -f "node"

# 서버 재시작
npm run dev
```

---

## 📊 실행 상태 체크리스트

```bash
# 한 번에 모든 상태 확인
echo "=== DB 상태 ==="
docker ps | grep delivery-app-db

echo -e "\n=== 테이블 확인 ==="
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;" 2>/dev/null

echo -e "\n=== 보호자 메뉴 개수 ==="
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT COUNT(*) as count FROM guardian_menus;" 2>/dev/null

echo -e "\n=== 추천 메뉴 개수 ==="
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT COUNT(*) as count FROM recommended_menus;" 2>/dev/null

echo -e "\n=== 백엔드 API 상태 ==="
curl -s http://localhost:3001/api/health || echo "❌ 백엔드 미실행"

echo -e "\n=== 프론트엔드 상태 ==="
curl -I -s http://localhost:5173 | head -1 || echo "❌ 프론트엔드 미실행"
```

**정상 응답:**
```
=== DB 상태 ===
abc123  mysql:8.0  Up 5 minutes (healthy)  delivery-app-db

=== 테이블 확인 ===
guardian_menus
recommended_menus
restaurants

=== 보호자 메뉴 개수 ===
count
1

=== 추천 메뉴 개수 ===
count
10

=== 백엔드 API 상태 ===
{"status":"ok"}

=== 프론트엔드 상태 ===
HTTP/1.1 200 OK
```

**✅ 모두 정상이면 시스템 완벽 실행!**

---

## 🔄 종료 및 재시작

### 정상 종료

```bash
# 터미널 1: DB (유지 - 데이터 보존)
# Ctrl+C 하지 않음

# 터미널 2: 백엔드
# Ctrl+C

# 터미널 3: 프론트엔드
# Ctrl+C
```

### 완전 종료 (DB 포함)

```bash
# 터미널 1에서
docker-compose down

# 데이터까지 삭제하려면
docker-compose down -v
```

### 빠른 재시작

```bash
# 터미널 1: DB 시작
cd /home/jg/projects/ai-call
docker-compose up -d mysql
sleep 30

# 터미널 2: 백엔드
cd /home/jg/projects/ai-call/apps/server
npm run dev

# 터미널 3: 프론트엔드
cd /home/jg/projects/ai-call/apps/web
npm run dev
```

---

## 🎯 요약

### 필수 3단계

```bash
# 1단계: DB 시작 (터미널 1)
cd /home/jg/projects/ai-call
docker-compose down -v && docker-compose up -d mysql && sleep 30

# 2단계: 백엔드 시작 (터미널 2)
cd /home/jg/projects/ai-call/apps/server
npm install && npm run dev

# 3단계: 프론트엔드 시작 (터미널 3)
cd /home/jg/projects/ai-call/apps/web
npm install && npm run dev
```

### 접속 주소

- 보호자 모드: http://localhost:5173/guardian
- 사용자 모드: http://localhost:5173
- 백엔드 API: http://localhost:3001/api

---

## 🎉 완료!

이제 다음이 모두 실행 중입니다:

- ✅ MySQL DB (3개 테이블, 초기 데이터)
- ✅ 백엔드 API 서버 (포트 3001)
- ✅ 프론트엔드 앱 (포트 5173)
- ✅ 보호자 모드 / 사용자 모드 정상 작동
- ✅ 메뉴 추가/삭제/동기화 기능 정상

**앱을 자유롭게 테스트하세요!** 🚀
