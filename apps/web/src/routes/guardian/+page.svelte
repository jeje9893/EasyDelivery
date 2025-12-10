<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { recommendedMenus } from '$lib/recommendedMenus';

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

  let showRecommendedMenuModal = false;
  let showAddNewRestaurantModal = false;
  let currentRestaurantForMenu: Restaurant | null = null;

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
  function openMenuSelectionModal() {
    showRecommendedMenuModal = true;
  }

  function addRestaurant() {
    showAddNewRestaurantModal = true;
  }

  function createNewRestaurant() {
    const name = prompt('새 가게 이름:');
    if (!name) return;
    
    const category = prompt('카테고리:');
    if (!category) return;
    
    const img = prompt('이모지 아이콘:', '🍽️');
    if (!img) return;
    
    const newId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
    const newRestaurant = {
      id: newId,
      name,
      category,
      img,
      menus: []
    };
    
    restaurants = [...restaurants, newRestaurant];
    console.log('➕ 새 가게 추가:', name);
    
    showAddNewRestaurantModal = false;
    
    // 메뉴 추가 여부 확인
    if (confirm('이 가게에 메뉴를 추가하시겠습니까?')) {
      currentRestaurantForMenu = newRestaurant;
      showRecommendedMenuModal = true;
    } else {
      saveAllSettings();
    }
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

  function addMenuManually() {
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
    
    if (!currentRestaurantForMenu) return;
    
    const newId = currentRestaurantForMenu.menus.length > 0 
      ? Math.max(...currentRestaurantForMenu.menus.map(m => m.id)) + 1 
      : 1;
    
    currentRestaurantForMenu.menus = [...currentRestaurantForMenu.menus, {
      id: newId,
      name,
      price,
      isRecommended,
      image: image || '🍽️'
    }];
    
    restaurants = [...restaurants];
    console.log('➕ 새 메뉴 추가 (직접):', name, '→', currentRestaurantForMenu.name);
    saveAllSettings();
    closeRecommendedMenuModal();
    alert(`✅ "${name}"이(가) 추가되었습니다!`);
  }

  function addMenuFromRecommended(recommendedMenu: any) {
    // 같은 이름의 식당 찾기
    let targetRestaurant = restaurants.find(r => r.name === recommendedMenu.store);
    
    if (!targetRestaurant) {
      // 새로운 식당 생성
      const newRestaurantId = Math.max(0, ...restaurants.map(r => r.id)) + 1;
      targetRestaurant = {
        id: newRestaurantId,
        name: recommendedMenu.store,
        category: recommendedMenu.category,
        img: recommendedMenu.emoji,
        menus: []
      };
      restaurants = [...restaurants, targetRestaurant];
      console.log('➕ 새 가게 자동 생성:', recommendedMenu.store);
    }
    
    const newId = targetRestaurant.menus.length > 0 
      ? Math.max(...targetRestaurant.menus.map(m => m.id)) + 1 
      : 1;
    
    targetRestaurant.menus = [...targetRestaurant.menus, {
      id: newId,
      name: recommendedMenu.menu,
      price: recommendedMenu.price,
      isRecommended: true,
      image: recommendedMenu.emoji
    }];
    
    restaurants = [...restaurants];
    console.log('➕ 새 메뉴 추가 (추천):', recommendedMenu.menu, '→', targetRestaurant.name);
    saveAllSettings();
    
    // 모달 닫기
    closeRecommendedMenuModal();
    
    alert(`✅ "${recommendedMenu.store}"에 "${recommendedMenu.menu}"이(가) 추가되었습니다!`);
  }

  function selectExistingRestaurantForMenu(restaurant: Restaurant) {
    currentRestaurantForMenu = restaurant;
    showRecommendedMenuModal = true;
  }

  function closeRecommendedMenuModal() {
    showRecommendedMenuModal = false;
    currentRestaurantForMenu = null;
  }

  function closeAddNewRestaurantModal() {
    showAddNewRestaurantModal = false;
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
      <button class="add-btn" on:click={openMenuSelectionModal}>+ 메뉴 추가</button>
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
              <button class="icon-btn" on:click={() => selectExistingRestaurantForMenu(restaurant)}>➕</button>
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
        <p class="empty-section">등록된 가게가 없습니다. "메뉴 추가" 버튼을 눌러주세요.</p>
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

  <!-- 추천 메뉴 선택 모달 -->
  {#if showRecommendedMenuModal}
    <div class="modal-overlay" on:click={closeRecommendedMenuModal}>
      <div class="modal-content large" on:click|stopPropagation>
        <div class="modal-header">
          <h2>🍽️ 메뉴 추가</h2>
          <button class="close-btn" on:click={closeRecommendedMenuModal}>✕</button>
        </div>
        
        <div class="modal-body">
          {#if currentRestaurantForMenu}
            <p class="modal-description">
              <strong>{currentRestaurantForMenu.name}</strong>에 추가할 메뉴를 선택하세요
            </p>
          {:else}
            <p class="modal-description">
              추가할 메뉴를 선택하세요 (가게가 없으면 자동으로 생성됩니다)
            </p>
          {/if}
          
          <div class="recommended-menu-grid">
            {#each recommendedMenus as menu}
              <button 
                class="recommended-menu-card"
                on:click={() => addMenuFromRecommended(menu)}
              >
                <div class="menu-card-emoji">{menu.emoji}</div>
                <div class="menu-card-info">
                  <div class="menu-card-store">{menu.store}</div>
                  <div class="menu-card-name">{menu.menu}</div>
                  <div class="menu-card-price">{menu.price.toLocaleString()}원</div>
                  <div class="menu-card-category">{menu.category}</div>
                </div>
              </button>
            {/each}
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn secondary" on:click={closeRecommendedMenuModal}>
            취소
          </button>
          {#if currentRestaurantForMenu}
            <button class="modal-btn primary" on:click={addMenuManually}>
              직접 입력하기
            </button>
          {:else}
            <button class="modal-btn primary" on:click={addRestaurant}>
              새 가게 추가
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- 새 가게 추가 모달 -->
  {#if showAddNewRestaurantModal}
    <div class="modal-overlay" on:click={closeAddNewRestaurantModal}>
      <div class="modal-content small" on:click|stopPropagation>
        <div class="modal-header">
          <h2>🏪 새 가게 추가</h2>
          <button class="close-btn" on:click={closeAddNewRestaurantModal}>✕</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            새로운 가게 정보를 입력하세요
          </p>
          <div class="info-text">
            <p>✅ 가게를 추가한 후 메뉴를 선택할 수 있습니다</p>
            <p>✅ 추천 메뉴에서 선택하거나 직접 입력할 수 있습니다</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn secondary" on:click={closeAddNewRestaurantModal}>
            취소
          </button>
          <button class="modal-btn primary" on:click={createNewRestaurant}>
            가게 만들기
          </button>
        </div>
      </div>
    </div>
  {/if}
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

  /* 모달 스타일 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 10px;
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 800px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-content.large {
    max-width: 90vw;
    max-height: 90vh;
  }

  .modal-content.small {
    max-width: 500px;
    max-height: 70vh;
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .modal-header h2 {
    font-size: 1.4rem;
    font-weight: 800;
    color: #333;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: #999;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .close-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 0;
  }

  .modal-description {
    font-size: 1rem;
    color: #666;
    margin: 0 0 16px 0;
    text-align: center;
  }

  .recommended-menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .recommended-menu-card {
    background: white;
    border: 2px solid #eee;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 0;
  }

  .recommended-menu-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #4caf50;
  }

  .menu-card-emoji {
    font-size: 2.5rem;
    margin-bottom: 8px;
  }

  .menu-card-info {
    width: 100%;
  }

  .menu-card-store {
    font-size: 0.75rem;
    color: #999;
    font-weight: 600;
    margin-bottom: 3px;
  }

  .menu-card-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 6px;
    word-break: keep-all;
  }

  .menu-card-price {
    font-size: 1rem;
    font-weight: 800;
    color: #ff6b35;
    margin-bottom: 5px;
  }

  .menu-card-category {
    font-size: 0.7rem;
    color: #666;
    background: #f5f5f5;
    padding: 3px 6px;
    border-radius: 8px;
    display: inline-block;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 2px solid #f0f0f0;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
  }

  .modal-btn.secondary {
    background: #f5f5f5;
    color: #666;
  }

  .modal-btn.secondary:hover {
    background: #e0e0e0;
  }

  .modal-btn.primary {
    background: #4caf50;
    color: white;
  }

  .modal-btn.primary:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  .info-text {
    background: #f0f8ff;
    padding: 12px;
    border-radius: 12px;
    margin-top: 12px;
  }

  .info-text p {
    margin: 6px 0;
    font-size: 0.9rem;
    color: #333;
    line-height: 1.5;
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 5px;
    }

    .modal-content.large {
      max-width: 95vw;
      max-height: 92vh;
    }

    .modal-header h2 {
      font-size: 1.2rem;
    }

    .recommended-menu-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .menu-card-emoji {
      font-size: 2rem;
    }

    .menu-card-name {
      font-size: 0.85rem;
    }

    .menu-card-price {
      font-size: 0.9rem;
    }

    .modal-btn {
      padding: 8px 16px;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .modal-header {
      padding: 12px 16px;
    }

    .modal-body {
      padding: 12px;
    }

    .modal-footer {
      padding: 12px 16px;
      gap: 8px;
    }

    .recommended-menu-grid {
      gap: 8px;
    }

    .recommended-menu-card {
      padding: 10px;
    }

    .menu-card-emoji {
      font-size: 1.8rem;
      margin-bottom: 6px;
    }

    .menu-card-store {
      font-size: 0.7rem;
    }

    .menu-card-name {
      font-size: 0.8rem;
      margin-bottom: 4px;
    }

    .menu-card-price {
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .menu-card-category {
      font-size: 0.65rem;
      padding: 2px 5px;
    }
  }
</style>
