-- 001_init_easyDelivery.sql
-- EasyDelivery DB 초기 스키마

CREATE DATABASE IF NOT EXISTS EasyDelivery
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE EasyDelivery;

CREATE TABLE IF NOT EXISTS incoming_data (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
