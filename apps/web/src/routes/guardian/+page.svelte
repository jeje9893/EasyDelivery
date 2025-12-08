<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  interface Menu {
    id: number;
    name: string;
    price: number;
    isRecommended: boolean;
    image?: string;
  }

  interface Restaurant {
    id: number;
    name: string;
    category: string;
    img: string;
    menus: Menu[];
  }

  interface Address {
    id: number;
    address: string;
    isDefault: boolean;
  }

  interface PaymentMethod {
    id: number;
    type: string;
    name: string;
    isDefault: boolean;
  }

  let restaurants: Restaurant[] = [];
  let savedAddresses: Address[] = [];
  let paymentMethods: PaymentMethod[] = [];
  let selectedRestaurant: Restaurant | null = null;

  onMount(() => {
    loadSettings();
  });

  function loadSettings() {
    const saved = localStorage.getItem('guardianSettings');
    console.log('📋 보호자 모드 - localStorage 로드:', saved);
    
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        restaurants = settings.restaurants || [];
        savedAddresses = settings.addresses || [];
        paymentMethods = settings.payments || [];
        console.log('✅ 보호자 모드 - 데이터 로드 완료');
        console.log('식당:', restaurants.length, '개');
        console.log('주소:', savedAddresses.length, '개');
        console.log('결제수단:', paymentMethods.length, '개');
      } catch (e) {
        console.error('❌ 보호자 모드 - localStorage 파싱 오류:', e);
        initializeDefaultData();
      }
    } else {
      console.log('ℹ️ 보호자 모드 - 저장된 설정 없음');
      initializeDefaultData();
    }
  }

  function initializeDefaultData() {
    restaurants = [];
    savedAddresses = [];
    paymentMethods = [];
  }

  function saveAllSettings() {
    try {
      const defaultAddress = savedAddresses.find(a => a.isDefault);
      const settings = {
        restaurants,
        addresses: savedAddresses,
        payments: paymentMethods,
        defaultDeliveryAddress: defaultAddress?.address || '',
        defaultRestaurantId: selectedRestaurant?.id || null,
        defaultCategoryName: selectedRestaurant?.category || ''
      };
      
      const settingsStr = JSON.stringify(settings);
      localStorage.setItem('guardianSettings', settingsStr);
      
      console.log('💾 전체 설정 저장 완료');
      console.log('저장된 데이터:', settingsStr);
      
      alert('✅ 모든 설정이 저장되었습니다!');
    } catch (e) {
      console.error('❌ 저장 오류:', e);
      alert('저장 중 오류가 발생했습니다.');
    }
  }

  // 식당 관련 함수
  function addRestaurant() {
    const name = prompt('새 가게 이름:');
    if (!name) return;
    
    const category = prompt('카테고리:');
    if (!category) return;
    
    const img = prompt('이모지 아이콘:', '🍽️');
    if (!img) return;
    
    const newId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
    restaurants = [...restaurants, {
      id: newId,
      name,
      category,
      img,
      menus: []
    }];
    
    console.log('➕ 새 가게 추가:', name);
    saveAllSettings();
  }

  function deleteRestaurant(id: number) {
    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) return;
    
    if (confirm(`"${restaurant.name}" 가게를 삭제하시겠습니까?`)) {
      restaurants = restaurants.filter(r => r.id !== id);
      console.log('🗑️ 가게 삭제:', restaurant.name);
      saveAllSettings();
    }
  }

  function addMenu(restaurant: Restaurant) {
    const name = prompt('메뉴 이름:');
    if (!name) return;
    
    const priceStr = prompt('가격:');
    if (!priceStr) return;
    
    const price = parseInt(priceStr);
    if (isNaN(price)) {
      alert('올바른 가격을 입력하세요.');
      return;
    }
    
    const image = prompt('이모지:', '🍽️');
    const isRecommended = confirm('추천 메뉴로 설정하시겠습니까?');
    
    const newId = restaurant.menus.length > 0 
      ? Math.max(...restaurant.menus.map(m => m.id)) + 1 
      : 1;
    
    restaurant.menus = [...restaurant.menus, {
      id: newId,
      name,
      price,
      isRecommended,
      image: image || '🍽️'
    }];
    
    restaurants = [...restaurants];
    console.log('➕ 새 메뉴 추가:', name, '→', restaurant.name);
    saveAllSettings();
  }

  function deleteMenu(restaurant: Restaurant, menuId: number) {
    const menu = restaurant.menus.find(m => m.id === menuId);
    if (!menu) return;
    
    if (confirm(`"${menu.name}" 메뉴를 삭제하시겠습니까?`)) {
      restaurant.menus = restaurant.menus.filter(m => m.id !== menuId);
      restaurants = [...restaurants];
      console.log('🗑️ 메뉴 삭제:', menu.name);
      saveAllSettings();
    }
  }

  function toggleRecommend(restaurant: Restaurant, menuId: number) {
    const menu = restaurant.menus.find(m => m.id === menuId);
    if (menu) {
      menu.isRecommended = !menu.isRecommended;
      restaurants = [...restaurants];
      console.log('⭐ 추천 토글:', menu.name, '→', menu.isRecommended);
      saveAllSettings();
    }
  }

  // 주소 관련 함수
  function addAddress() {
    const address = prompt('배달 주소를 입력하세요:');
    if (!address) return;
    
    const isDefault = savedAddresses.length === 0 || confirm('기본 주소로 설정하시겠습니까?');
    
    if (isDefault) {
      savedAddresses = savedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    
    const newId = savedAddresses.length > 0 ? Math.max(...savedAddresses.map(a => a.id)) + 1 : 1;
    savedAddresses = [...savedAddresses, { id: newId, address, isDefault }];
    
    console.log('➕ 새 주소 추가:', address);
    saveAllSettings();
  }

  function deleteAddress(id: number) {
    const address = savedAddresses.find(a => a.id === id);
    if (!address) return;
    
    if (confirm(`"${address.address}" 주소를 삭제하시겠습니까?`)) {
      savedAddresses = savedAddresses.filter(a => a.id !== id);
      console.log('🗑️ 주소 삭제:', address.address);
      saveAllSettings();
    }
  }

  function setDefaultAddress(id: number) {
    savedAddresses = savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAllSettings();
  }

  // 결제 수단 관련 함수
  function addPaymentMethod() {
    const type = prompt('결제 수단 종류 (카드/계좌):');
    if (!type) return;
    
    const name = prompt('결제 수단 이름 (예: 신한카드):');
    if (!name) return;
    
    const isDefault = paymentMethods.length === 0 || confirm('기본 결제 수단으로 설정하시겠습니까?');
    
    if (isDefault) {
      paymentMethods = paymentMethods.map(p => ({ ...p, isDefault: false }));
    }
    
    const newId = paymentMethods.length > 0 ? Math.max(...paymentMethods.map(p => p.id)) + 1 : 1;
    paymentMethods = [...paymentMethods, { id: newId, type, name, isDefault }];
    
    console.log('➕ 새 결제 수단 추가:', name);
    saveAllSettings();
  }

  function deletePaymentMethod(id: number) {
    const payment = paymentMethods.find(p => p.id === id);
    if (!payment) return;
    
    if (confirm(`"${payment.name}" 결제 수단을 삭제하시겠습니까?`)) {
      paymentMethods = paymentMethods.filter(p => p.id !== id);
      console.log('🗑️ 결제 수단 삭제:', payment.name);
      saveAllSettings();
    }
  }

  function setDefaultPayment(id: number) {
    paymentMethods = paymentMethods.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    saveAllSettings();
  }
</script>

<div class="guardian-container">
  <div class="guardian-top">
    <button class="home-btn" on:click={() => goto('/')}>← 홈</button>
    <h1>보호자 모드</h1>
  </div>

  <!-- 식당 및 메뉴 관리 섹션 -->
  <section class="guardian-section">
    <div class="section-header">
      <h2>🏪 식당 및 메뉴 관리</h2>
      <button class="add-btn" on:click={addRestaurant}>+ 가게 추가</button>
    </div>

    <div class="restaurants-list">
      {#each restaurants as restaurant}
        <div class="restaurant-card">
          <div class="restaurant-header">
            <div class="restaurant-info">
              <span class="restaurant-icon">{restaurant.img}</span>
              <div>
                <h3>{restaurant.name}</h3>
                <span class="category-badge">{restaurant.category}</span>
              </div>
            </div>
            <div class="restaurant-actions">
              <button class="icon-btn" on:click={() => addMenu(restaurant)}>➕</button>
              <button class="icon-btn danger" on:click={() => deleteRestaurant(restaurant.id)}>🗑️</button>
            </div>
          </div>

          <div class="menus-list">
            {#each restaurant.menus as menu}
              <div class="menu-row">
                <span class="menu-icon">{menu.image || '🍽️'}</span>
                <div class="menu-details">
                  <span class="menu-name">{menu.name}</span>
                  <span class="menu-price">{menu.price.toLocaleString()}원</span>
                </div>
                <div class="menu-actions">
                  <button 
                    class="recommend-btn" 
                    class:active={menu.isRecommended}
                    on:click={() => toggleRecommend(restaurant, menu.id)}
                  >
                    ⭐
                  </button>
                  <button class="icon-btn danger sm" on:click={() => deleteMenu(restaurant, menu.id)}>✕</button>
                </div>
              </div>
            {:else}
              <p class="empty-text">메뉴가 없습니다. ➕ 버튼을 눌러 추가하세요.</p>
            {/each}
          </div>
        </div>
      {:else}
        <p class="empty-section">등록된 가게가 없습니다. "가게 추가" 버튼을 눌러주세요.</p>
      {/each}
    </div>
  </section>

  <!-- 배달 주소 관리 섹션 -->
  <section class="guardian-section">
    <div class="section-header">
      <h2>📍 배달 주소 관리</h2>
      <button class="add-btn" on:click={addAddress}>+ 주소 추가</button>
    </div>

    <div class="address-list">
      {#each savedAddresses as addr}
        <div class="address-item" class:default={addr.isDefault}>
          <div class="address-text">
            {addr.address}
            {#if addr.isDefault}
              <span class="default-badge">기본</span>
            {/if}
          </div>
          <div class="address-actions">
            {#if !addr.isDefault}
              <button class="small-btn" on:click={() => setDefaultAddress(addr.id)}>기본 설정</button>
            {/if}
            <button class="icon-btn danger sm" on:click={() => deleteAddress(addr.id)}>✕</button>
          </div>
        </div>
      {:else}
        <p class="empty-section">등록된 주소가 없습니다.</p>
      {/each}
    </div>
  </section>

  <!-- 결제 수단 관리 섹션 -->
  <section class="guardian-section">
    <div class="section-header">
      <h2>💳 결제 수단 관리</h2>
      <button class="add-btn" on:click={addPaymentMethod}>+ 결제 수단 추가</button>
    </div>

    <div class="payment-list">
      {#each paymentMethods as payment}
        <div class="payment-item" class:default={payment.isDefault}>
          <div class="payment-text">
            <span class="payment-type">{payment.type}</span>
            {payment.name}
            {#if payment.isDefault}
              <span class="default-badge">기본</span>
            {/if}
          </div>
          <div class="payment-actions">
            {#if !payment.isDefault}
              <button class="small-btn" on:click={() => setDefaultPayment(payment.id)}>기본 설정</button>
            {/if}
            <button class="icon-btn danger sm" on:click={() => deletePaymentMethod(payment.id)}>✕</button>
          </div>
        </div>
      {:else}
        <p class="empty-section">등록된 결제 수단이 없습니다.</p>
      {/each}
    </div>
  </section>
</div>

<style>
  .guardian-container {
    width: 100%;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
    padding: 20px;
  }

  .guardian-top {
    position: relative;
    margin-bottom: 20px;
  }

  .guardian-top h1 {
    text-align: center;
    font-size: 2rem;
    margin: 0;
    color: #333;
  }

  .home-btn {
    position: absolute;
    top: 0;
    left: 0;
    background: #f5f5f5;
    color: #333;
    border: 2px solid #ddd;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .home-btn:hover {
    background: #e8e8e8;
    border-color: #999;
    transform: translateX(-2px);
  }

  .guardian-section {
    background: white;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #333;
    margin: 0;
  }

  .add-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
  }

  .add-btn:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  .restaurants-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .restaurant-card {
    border: 2px solid #eee;
    border-radius: 12px;
    padding: 16px;
    background: #fafafa;
  }

  .restaurant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #eee;
  }

  .restaurant-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .restaurant-icon {
    font-size: 2.5rem;
  }

  .restaurant-info h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px 0;
  }

  .category-badge {
    background: #ff9800;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .restaurant-actions {
    display: flex;
    gap: 8px;
  }

  .icon-btn {
    background: #f5f5f5;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: #e0e0e0;
  }

  .icon-btn.danger {
    color: #f44336;
  }

  .icon-btn.danger:hover {
    background: #ffebee;
  }

  .icon-btn.sm {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }

  .menus-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .menu-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .menu-icon {
    font-size: 1.8rem;
  }

  .menu-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .menu-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }

  .menu-price {
    font-size: 0.95rem;
    color: #ff6b35;
    font-weight: 600;
  }

  .menu-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .recommend-btn {
    background: #f5f5f5;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
    opacity: 0.3;
  }

  .recommend-btn.active {
    opacity: 1;
    background: #fff3cd;
  }

  .recommend-btn:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .empty-text {
    text-align: center;
    color: #999;
    padding: 20px;
    font-size: 0.95rem;
  }

  .empty-section {
    text-align: center;
    color: #999;
    padding: 40px;
    font-size: 1.1rem;
  }

  .address-list, .payment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .address-item, .payment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 2px solid #eee;
  }

  .address-item.default, .payment-item.default {
    border-color: #4caf50;
    background: #f1f8f4;
  }

  .default-badge {
    background: #4caf50;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-left: 8px;
  }

  .address-actions, .payment-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .small-btn {
    background: #2196f3;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .small-btn:hover {
    background: #1976d2;
  }

  .payment-type {
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-right: 8px;
  }
</style>
