const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL 연결 풀
const pool = mysql.createPool({
  host: 'localhost',
  user: 'delivery_user',
  password: 'delivery_pass',
  database: 'delivery_app',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 보호자 메뉴 조회
app.get('/api/guardian-menus', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [menus] = await connection.query('SELECT * FROM guardian_menus ORDER BY created_at DESC');
    connection.release();
    console.log('✅ GET /api/guardian-menus - 보호자 메뉴 반환:', menus.length, '개');
    res.json(menus);
  } catch (error) {
    console.error('❌ GET /api/guardian-menus 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 추천 메뉴 조회
app.get('/api/recommended-menus', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [menus] = await connection.query('SELECT * FROM recommended_menus');
    connection.release();
    console.log('✅ GET /api/recommended-menus - 추천 메뉴 반환:', menus.length, '개');
    res.json(menus);
  } catch (error) {
    console.error('❌ GET /api/recommended-menus 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 보호자 메뉴 추가
app.post('/api/guardian-menus', async (req, res) => {
  try {
    const { restaurant_name, menu_name, price, image } = req.body;
    
    if (!restaurant_name || !menu_name || !price) {
      return res.status(400).json({ error: '필수 정보가 없습니다' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO guardian_menus (restaurant_name, menu_name, price, image) VALUES (?, ?, ?, ?)',
      [restaurant_name, menu_name, price, image || '🍽️']
    );
    connection.release();
    
    console.log('✅ POST /api/guardian-menus - 메뉴 추가 성공:', { id: result.insertId, restaurant_name, menu_name });
    res.json({ id: result.insertId, restaurant_name, menu_name, price, image: image || '🍽️' });
  } catch (error) {
    console.error('❌ POST /api/guardian-menus 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 보호자 메뉴 삭제
app.delete('/api/guardian-menus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM guardian_menus WHERE id = ?', [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
    }
    
    console.log('✅ DELETE /api/guardian-menus/:id - 메뉴 삭제 성공:', id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('❌ DELETE /api/guardian-menus/:id 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 서버 시작: http://localhost:${PORT}`);
  console.log('📌 API 베이스 URL: http://localhost:3001/api');
});
