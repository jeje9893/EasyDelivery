-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS delivery_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE delivery_app;

-- 기존 테이블이 있으면 삭제 (개발 환경에서만 사용)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS guardian_settings;
DROP TABLE IF EXISTS user_menus;

-- 1. 식당 테이블
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  img VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 보호자가 추가한 메뉴
CREATE TABLE IF NOT EXISTS guardian_menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_name VARCHAR(100) NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  image VARCHAR(255) DEFAULT '🍽️',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 추천 메뉴
CREATE TABLE IF NOT EXISTS recommended_menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store VARCHAR(100) NOT NULL,
  menu VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  emoji VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 식당 데이터
INSERT INTO restaurants (name, category, img) VALUES
('중국집', '중식', '🥟'),
('치킨마을', '치킨', '🍗'),
('한식당', '한식', '🍚'),
('피자집', '피자/양식', '🍕'),
('돈까스집', '일식/돈까스', '🍛'),
('족발보쌈', '족발/보쌈', '🥓'),
('분식집', '분식', '🍢'),
('카페', '카페/디저트', '☕')
ON DUPLICATE KEY UPDATE img=VALUES(img);

-- 초기 보호자 메뉴 (중국집, 짜장면, 9900원)
INSERT INTO guardian_menus (restaurant_name, menu_name, price, image) VALUES
('중국집', '짜장면', 9900, '🍜')
ON DUPLICATE KEY UPDATE price=VALUES(price);

-- 초기 추천 메뉴 (recommendedMenus.ts 기반)
INSERT INTO recommended_menus (store, menu, price, emoji, category) VALUES
('BBQ', '황금올리브치킨', 19900, '🍗', '치킨'),
('교토마마', '마라탕', 12000, '🍲', '중식'),
('육탄', '소불고기덮밥', 9800, '🍚', '한식'),
('피자헛', '슈프림 피자', 25000, '🍕', '피자/양식'),
('돈한마리', '돼지까스정식', 13900, '🍛', '일식/돈까스'),
('족발의신', '족발세트', 35000, '🥓', '족발/보쌈'),
('떡볶이왕', '매운 떡볶이', 7000, '🍢', '분식'),
('카페라떼', '아메리카노', 4500, '☕', '카페/디저트'),
('스시야', '생연어초밥', 18000, '🍣', '일식/돈까스'),
('버거킹', '와퍼세트', 14900, '🍔', '피자/양식')
ON DUPLICATE KEY UPDATE price=VALUES(price);
