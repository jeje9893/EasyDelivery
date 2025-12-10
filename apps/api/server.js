const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'delivery_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 식당 목록 조회
app.get('/api/restaurants', async (req, res) => {
  try {
    const [restaurants] = await pool.query('SELECT * FROM restaurants ORDER BY id');
    
    // 각 식당의 메뉴 조회
    for (let restaurant of restaurants) {
      const [menus] = await pool.query(
        'SELECT * FROM menus WHERE restaurant_id = ? ORDER BY id',
        [restaurant.id]
      );
      restaurant.menus = menus;
    }
    
    res.json(restaurants);
  } catch (error) {
    console.error('식당 조회 오류:', error);
    res.status(500).json({ error: '식당 목록을 불러오는데 실패했습니다.' });
  }
});

// 특정 식당 조회
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [req.params.id]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({ error: '식당을 찾을 수 없습니다.' });
    }
    
    const restaurant = restaurants[0];
    const [menus] = await pool.query(
      'SELECT * FROM menus WHERE restaurant_id = ?',
      [restaurant.id]
    );
    restaurant.menus = menus;
    
    res.json(restaurant);
  } catch (error) {
    console.error('식당 조회 오류:', error);
    res.status(500).json({ error: '식당 정보를 불러오는데 실패했습니다.' });
  }
});

// 추천 메뉴 조회
app.get('/api/menus/recommended', async (req, res) => {
  try {
    const [menus] = await pool.query(`
      SELECT m.*, r.name as restaurant_name, r.category, r.img as restaurant_img
      FROM menus m
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE m.is_recommended = TRUE
      ORDER BY m.id
    `);
    
    res.json(menus);
  } catch (error) {
    console.error('추천 메뉴 조회 오류:', error);
    res.status(500).json({ error: '추천 메뉴를 불러오는데 실패했습니다.' });
  }
});

// 주문 생성
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { delivery_address, request_note, total_amount, items } = req.body;
    
    // 주문 생성
    const [orderResult] = await connection.query(
      'INSERT INTO orders (delivery_address, request_note, total_amount) VALUES (?, ?, ?)',
      [delivery_address, request_note || null, total_amount]
    );
    
    const orderId = orderResult.insertId;
    
    // 주문 상세 항목 추가
    for (let item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, menu_id, menu_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.menu_id, item.name, item.price, item.qty]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      orderId,
      message: '주문이 완료되었습니다.' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('주문 생성 오류:', error);
    res.status(500).json({ error: '주문 처리 중 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
});

// 주문 내역 조회
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    
    for (let order of orders) {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({ error: '주문 내역을 불러오는데 실패했습니다.' });
  }
});

// 보호자 설정 조회
app.get('/api/guardian-settings/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || 'default';
    const [settings] = await pool.query(
      'SELECT * FROM guardian_settings WHERE user_id = ?',
      [userId]
    );
    
    if (settings.length === 0) {
      return res.json(null);
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('설정 조회 오류:', error);
    res.status(500).json({ error: '설정을 불러오는데 실패했습니다.' });
  }
});

// 보호자 설정 저장
app.post('/api/guardian-settings', async (req, res) => {
  try {
    const { 
      user_id = 'default', 
      default_delivery_address, 
      default_restaurant_id, 
      default_category_name 
    } = req.body;
    
    await pool.query(`
      INSERT INTO guardian_settings 
      (user_id, default_delivery_address, default_restaurant_id, default_category_name)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      default_delivery_address = VALUES(default_delivery_address),
      default_restaurant_id = VALUES(default_restaurant_id),
      default_category_name = VALUES(default_category_name),
      updated_at = CURRENT_TIMESTAMP
    `, [user_id, default_delivery_address, default_restaurant_id, default_category_name]);
    
    res.json({ success: true, message: '설정이 저장되었습니다.' });
  } catch (error) {
    console.error('설정 저장 오류:', error);
    res.status(500).json({ error: '설정 저장에 실패했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
