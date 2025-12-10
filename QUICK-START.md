# 🚀 빠른 시작 가이드 (처음부터 끝까지)

새로 구축된 DB와 앱을 처음부터 실행하는 완전한 가이드입니다.

---

## 📦 사전 준비

### 필수 설치 프로그램
- Docker Desktop (https://www.docker.com/products/docker-desktop)
- Node.js v16+ (https://nodejs.org)
- npm 또는 yarn

### 설치 확인
```bash
docker --version
node --version
npm --version
```

---

## 🗂️ 프로젝트 구조

```
/home/jg/projects/ai-call/
├── docker-compose.yml          # Docker 설정
├── database/
│   └── schema.sql              # DB 초기 스키마
├── apps/
│   ├── web/                    # 프론트엔드 (포트 5173)
│   └── server/                 # 백엔드 API (포트 3001)
└── TEST-GUIDE.md              # 상세 테스트 가이드
```

---

## 🔧 Step 1: DB 실행 (5분)

### 1-1. 프로젝트 루트로 이동

```bash
cd /home/jg/projects/ai-call
```

### 1-2. Docker 컨테이너 시작

```bash
docker-compose up -d mysql
```

**예상 출력:**
```
[+] Running 1/1
 ✓ Container delivery-app-db  Started
```

### 1-3. DB 상태 확인 (중요!)

```bash
docker ps
```

**정상 응답 - 반드시 `healthy` 상태여야 함:**
```
CONTAINER ID   IMAGE       STATUS                   NAMES
abc123def456   mysql:8.0   Up 2 minutes (healthy)   delivery-app-db
```

**❌ unhealthy 또는 (health: starting) 상태면:**
- 30초 더 대기 후 다시 실행
```bash
sleep 30
docker ps
```

**❌ 여전히 unhealthy면:**
```bash
# 완전 초기화
docker-compose down -v
docker-compose up -d mysql
sleep 30
docker ps
```

### 1-4. 테이블 생성 확인 ⭐ 중요!

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
```

**정상 응답:**
```
+------------------------+
| Tables_in_delivery_app |
+------------------------+
| guardian_menus         |
| recommended_menus      |
| restaurants            |
+------------------------+
```

**❌ 테이블이 없거나 다른 테이블이 나오면:**

```bash
# 방법 1: schema.sql 수동 실행
docker exec -i delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app < ./database/schema.sql

# 방법 2: DB 완전 재시작
docker-compose down -v
docker-compose up -d mysql
sleep 30

# 다시 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
```

### 1-5. DB 데이터 확인

```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
```

**정상 응답:**
```
+----+-------------------+-----------+-------+-------+---------------------+
| id | restaurant_name   | menu_name | price | image | created_at          |
+----+-------------------+-----------+-------+-------+---------------------+
| 1  | 중국집            | 짜장면    | 9900  | 🍜   | 2024-12-10 12:00:00 |
+----+-------------------+-----------+-------+-------+---------------------+
```

**❌ ERROR 1146 (42S02) 에러가 나면:**

```bash
echo "❌ 테이블이 생성되지 않았습니다."
echo "🔧 해결 방법: 위의 '테이블이 없거나 다른 테이블이 나오면' 섹션 참고"
```

✅ **DB 실행 완료!**

---

## 🔌 Step 2: 백엔드 API 서버 실행 (3분)

### 2-1. 새로운 터미널 열기 (터미널 2)

```bash
# 현재 터미널 1은 DB 실행 중인 상태 유지
# 새로운 터미널 창 열기 (Ctrl+Alt+T 또는 터미널 앱 실행)
```

### 2-2. 백엔드 디렉터리로 이동

```bash
cd /home/jg/projects/ai-call/apps/server
```

### 2-3. 의존성 설치 (처음 1회만)

```bash
npm install
```

**예상 시간:** 1-2분

### 2-4. 서버 실행

```bash
npm run dev
```

**정상 응답 - 반드시 이 메시지가 나와야 함:**
```
🚀 서버 시작: http://localhost:3001
📌 API 베이스 URL: http://localhost:3001/api
```

✅ **백엔드 서버 실행 완료!**

### 2-5. API 응답 테스트 (새로운 터미널 3에서)

```bash
curl http://localhost:3001/api/health
```

**정상 응답:**
```json
{"status":"ok"}
```

---

## 🎨 Step 3: 프론트엔드 앱 실행 (3분)

### 3-1. 새로운 터미널 열기 (터미널 3)

```bash
# 터미널 1: DB 실행 중
# 터미널 2: 백엔드 서버 실행 중
# 터미널 3: 새로 열기
```

### 3-2. 프론트엔드 디렉터리로 이동

```bash
cd /home/jg/projects/ai-call/apps/web
```

### 3-3. 의존성 설치 (처음 1회만)

```bash
npm install
```

**예상 시간:** 2-3분

### 3-4. 앱 실행

```bash
npm run dev
```

**정상 응답 - 반드시 이 메시지가 나와야 함:**
```
  ➜  Local:   http://localhost:5173/
```

✅ **프론트엔드 앱 실행 완료!**

---

## 📋 Step 4: 브라우저에서 앱 접속

### 4-1. 사용자 모드 (배달 앱)

브라우저에서 다음 주소로 이동:
```
http://localhost:5173
```

**예상 화면:**
- "Simple Delivery App" 타이틀
- "내 메뉴" / "추천 메뉴" 탭
- 중국집 짜장면 9900원 표시

### 4-2. 보호자 모드

브라우저에서 다음 주소로 이동:
```
http://localhost:5173/guardian
```

**예상 화면:**
- "🛡️ 보호자 메뉴 관리" 타이틀
- "+ 추가" 버튼
- 중국집 짜장면 9900원 카드

✅ **앱 실행 완료!**

---

## ✅ 현재 상태 확인

### 체크리스트

```bash
# 터미널 1 상태
docker ps
# → status: Up XX (healthy)

# 터미널 2 상태
# → "🚀 서버 시작: http://localhost:3001" 메시지

# 터미널 3 상태
# → "Local: http://localhost:5173/" 메시지

# API 응답 확인
curl http://localhost:3001/api/guardian-menus
# → [{"id":1,"restaurant_name":"중국집",...}]

# 브라우저 확인
# → http://localhost:5173 접속 가능
# → http://localhost:5173/guardian 접속 가능
```

✅ **모든 서비스 정상 실행!**

---

## 🧪 Step 5: 기본 기능 테스트

### 5-1. 보호자 모드 - 메뉴 추가

1. http://localhost:5173/guardian 접속
2. "+ 추가" 버튼 클릭
3. 다음 정보 입력:
   - 식당명: `한식당`
   - 메뉴명: `비빔밥`
   - 가격: `12000`
   - 아이콘: `🥗` 선택
4. "추가" 버튼 클릭

**확인:**
- 성공 메시지 나타남
- 새 메뉴 카드 표시

### 5-2. 사용자 모드 - 메뉴 확인

1. http://localhost:5173 접속
2. "내 메뉴" 탭에서 메뉴 확인:
   - 중국집 짜장면 9900원
   - 한식당 비빔밥 12000원

**확인:**
- 보호자가 추가한 메뉴가 보임

### 5-3. 추천 메뉴 확인

1. http://localhost:5173 접속
2. "추천 메뉴" 탭 클릭

**확인:**
- 10개의 추천 메뉴 표시:
  - BBQ 황금올리브치킨
  - 교토마마 마라탕
  - 등등...

✅ **기본 기능 테스트 완료!**

---

## 🐛 문제 해결

### 문제 0: ❌ Table 'delivery_app.guardian_menus' doesn't exist

**증상:**
```bash
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
# ERROR 1146 (42S02) at line 1: Table 'delivery_app.guardian_menus' doesn't exist
```

**원인:** 
- `schema.sql`이 실행되지 않음
- DB 초기화 실패

**해결 방법:**

```bash
# 1. 현재 테이블 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"

# 2. 테이블이 없거나 잘못된 테이블이 있으면 완전 초기화
docker-compose down -v
docker-compose up -d mysql
sleep 30

# 3. 테이블 다시 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"

# 4. 여전히 안 되면 수동 실행
docker exec -i delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app < ./database/schema.sql

# 5. 최종 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SHOW TABLES;"
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"
```

**예상 결과:**
```
+------------------------+
| Tables_in_delivery_app |
+------------------------+
| guardian_menus         |
| recommended_menus      |
| restaurants            |
+------------------------+

+----+-------------------+-----------+-------+-------+
| id | restaurant_name   | menu_name | price | image |
+----+-------------------+-----------+-------+-------+
| 1  | 중국집            | 짜장면    | 9900  | 🍜   |
+----+-------------------+-----------+-------+-------+
```

---

### 문제 1: Docker 시작 안 됨

```bash
# 해결방법
docker-compose down -v
docker-compose up -d mysql
sleep 30
docker ps
```

### 문제 2: 백엔드 포트 충돌

```bash
# 포트 사용 확인
lsof -i :3001

# 충돌하는 프로세스 종료
pkill -f "node server.js"

# 다시 실행
npm run dev
```

### 문제 3: 프론트엔드 포트 충돌

```bash
# 포트 사용 확인
lsof -i :5173

# 충돌하는 프로세스 종료
pkill -f "vite"

# 다시 실행
npm run dev
```

### 문제 4: 메뉴가 안 보임

```bash
# 1. 브라우저 콘솔 확인 (F12 → Console)
# 2. API 직접 테스트
curl http://localhost:3001/api/guardian-menus

# 3. DB 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"

# 4. 페이지 새로고침 (Ctrl+Shift+R)
```

### 문제 5: 한글이 깨짐

```bash
# DB에서 인코딩 확인
docker exec -it delivery-app-db mysql -u delivery_user -pdelivery_pass delivery_app -e "SELECT * FROM guardian_menus;"

# 정상: 한글 표시
# 비정상: ????? 표시

# 해결: DB 재초기화
docker-compose down -v
docker-compose up -d mysql
```

---

## 🔄 종료 및 재시작

### 정상 종료

```bash
# 각 터미널에서 Ctrl+C 입력
# 터미널 1 (DB): Ctrl+C
# 터미널 2 (백엔드): Ctrl+C
# 터미널 3 (프론트): Ctrl+C
```

### 깔끔한 재시작

```bash
# 모든 컨테이너 정지 및 데이터 삭제
docker-compose down -v

# 처음부터 시작
# 위의 Step 1부터 다시 진행
```

---

## 📱 접속 주소 정리

| 역할 | URL | 포트 | 용도 |
|------|-----|------|------|
| 사용자 모드 | http://localhost:5173 | 5173 | 배달 앱 메인 |
| 보호자 모드 | http://localhost:5173/guardian | 5173 | 메뉴 관리 |
| 백엔드 API | http://localhost:3001/api | 3001 | API 요청 |
| DB | localhost:3306 | 3306 | MySQL |

---

## 📊 DB 정보

| 항목 | 값 |
|------|-----|
| Host | localhost |
| Port | 3306 |
| User | delivery_user |
| Password | delivery_pass |
| Database | delivery_app |

---

## 📚 추가 학습

더 자세한 테스트 방법은 **TEST-GUIDE.md** 참조:
```bash
cat /home/jg/projects/ai-call/TEST-GUIDE.md
```

---

## 🎉 완료!

축하합니다! 이제 앱이 완벽하게 실행 중입니다:

- ✅ DB 실행 (MySQL)
- ✅ 백엔드 API 실행 (Node.js)
- ✅ 프론트엔드 앱 실행 (Svelte)
- ✅ 브라우저에서 접속 가능
- ✅ 기본 기능 테스트 완료

**이제 앱을 자유롭게 테스트할 수 있습니다!** 🚀