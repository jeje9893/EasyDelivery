<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';

  // 메뉴 항목 타입
  interface Menu {
    id: number;
    name: string;
    price: number;
    isRecommended: boolean;
  }

  // 식당 타입
  interface Restaurant {
    id: number;
    name: string;
    category: string;
    img: string;
    menus: Menu[];
  }

  const restaurants: Restaurant[] = [
    { id: 1, name: "치킨", category: "치킨", img: "", menus: [] },
    { id: 2, name: "한식", category: "한식", img: "", menus: [] },
    { id: 3, name: "중식", category: "중식", img: "", menus: [] },
    { id: 4, name: "피자/양식", category: "피자/양식", img: "", menus: [] },
    { id: 5, name: "일식/돈까스", category: "일식/돈까스", img: "", menus: [] },
    { id: 6, name: "족발/보쌈", category: "족발/보쌈", img: "", menus: [] },
    { id: 7, name: "분식", category: "분식", img: "", menus: [] },
    { id: 8, name: "카페/디저트", category: "카페/디저트", img: "", menus: [] },
  ];

  const categories = [
    { name: "치킨", img: "" },
    { name: "한식", img: "" },
    { name: "중식", img: "" },
    { name: "피자/양식", img: "" },
    { name: "일식/돈까스", img: "" },
    { name: "족발/보쌈", img: "" },
    { name: "분식", img: "" },
    { name: "카페/디저트", img: "" }
  ];

  // -------------------------
  // 로컬 상태
  // -------------------------
  let selectedCategory: string = "";
  let selectedRestaurant: Restaurant | null = null;

  // 장바구니: 간단한 구조 (name으로 식별)
  // 필요하면 id 기반으로 변경 권장
  let cart: { name: string; price: number; qty: number }[] = [];

  let showPaymentAlert = false;
  let menuTab: '전체' | '추천' = '전체';
  let deliveryAddress: string = "";
  let showAddressWarning: boolean = false;
  let showMenuToggle: boolean = false;

  // -------------------------
  // 파생 상태 (reactive)
  // -------------------------
  // 선택된 카테고리에 따른 가게 목록 필터
  $: filteredRestaurants = selectedCategory
    ? restaurants.filter(r => r.category === selectedCategory)
    : restaurants;

  // 총 금액
  $: totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 총 개수
  $: totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // 추천 메뉴 전체 (모든 식당에서 추천된 메뉴 모음)
  $: allRecommendedMenus = restaurants
    .flatMap(r => r.menus)
    .filter(menu => menu.isRecommended);

  // 현재 선택된 식당의 표시할 메뉴(전체 or 추천)
  $: displayMenus = selectedRestaurant
    ? selectedRestaurant.menus.filter(menu => menuTab === '전체' || menu.isRecommended)
    : [];

  // 배달 주소가 있으면 경고 해제
  $: if (deliveryAddress) {
    showAddressWarning = false;
  }

  // -------------------------
  // 유틸 / 동작 함수
  // -------------------------
  // 주소 입력/수정 처리 (간단히 prompt 사용)
  function handleAddressChange() {
    const newAddress = prompt("새로운 배달 주소를 입력해 주세요:", deliveryAddress);
    if (newAddress !== null && newAddress.trim() !== "") {
      deliveryAddress = newAddress.trim();
      alert(`배달 위치가 '${deliveryAddress}'(으)로 변경되었습니다.`);
      showMenuToggle = false;
      return true;
    }
    return false;
  }

  // 주소가 없으면 동작을 막고 경고 표시
  function checkAddressBeforeAction(): boolean {
    if (!deliveryAddress) {
      showAddressWarning = true;
      return false;
    }
    return true;
  }

  // 장바구니에 담기 (동일 메뉴면 수량 증가)
  function addToCart(menu: Menu) {
    if (!checkAddressBeforeAction()) return;

    const existingItem = cart.find(item => item.name === menu.name);
    if (existingItem) {
      existingItem.qty += 1;
      // Svelte가 객체 내부 변경을 감지하도록 카피해서 재할당
      cart = [...cart];
    } else {
      cart = [...cart, { name: menu.name, price: menu.price, qty: 1 }];
    }
  }

  // 장바구니 초기화 (확인 대화)
  function resetCart() {
    if (confirm("장바구니를 비우시겠습니까?")) {
      cart = [];
    }
  }

  // 결제 처리(샘플): 간단한 애니메이션 후 초기화
  function handlePayment() {
    if (cart.length === 0) return;
    if (!checkAddressBeforeAction()) return;

    showPaymentAlert = true;
    setTimeout(() => {
      showPaymentAlert = false;
      cart = [];
      selectedRestaurant = null;
      selectedCategory = "";
      goHome();
    }, 3000);
  }

  // 홈으로 이동 (상태 초기화)
  function goHome() {
    selectedCategory = "";
    selectedRestaurant = null;
    menuTab = '전체';
    showAddressWarning = false;
    showMenuToggle = false;
  }

  // 추천 메뉴 클릭 핸들러: 해당 메뉴의 식당을 찾아 선택하고 바로 담기
  function handleQuickMenuClick(menu: Menu) {
    if (!checkAddressBeforeAction()) return;

    const owningRestaurant = restaurants.find(r => r.menus.some(m => m.id === menu.id));

    if (owningRestaurant) {
      selectedCategory = owningRestaurant.category;
      selectedRestaurant = owningRestaurant;
      addToCart(menu);
      menuTab = '전체';
    }
  }
</script>

<!-- ======================================================
     메인 템플릿
     ====================================================== -->
<div class="app-container">
  <!-- Header -->
  <header class="header">
    <!-- 사이드 토글 버튼 -->
    <button class="quick-toggle-btn" on:click={() => showMenuToggle = !showMenuToggle}>
      {#if showMenuToggle}
        닫기 X
      {:else}
        메뉴 ☰
      {/if}
    </button>

    <!-- 타이틀 버튼 (홈으로 이동) -->
    <button class="title-btn" on:click={goHome}>
      <h1 class="title-text">노인 배달 서비스</h1>
    </button>
  </header>

  <!-- 사이드 메뉴 (토글) -->
  {#if showMenuToggle}
    <div
      class="side-menu-container"
      transition:slide={{ duration: 300, axis: 'y' }}
    >
      <div class="side-menu-content">
        <!-- 사이드 메뉴는 필요시 기능을 추가하세요 -->
        <button class="menu-item">📞ai</button>
        <button class="menu-item">기능추가</button>
        <button class="menu-item">기능추가</button>
        <button class="menu-item">기능추가</button>
      </div>
    </div>
  {/if}

  <!-- 메인 컨텐츠 -->
  <main class="content">
    <!-- 초기화면: 주소 입력 + 추천 메뉴 + 카테고리 -->
    {#if !selectedCategory && !selectedRestaurant}
      <div class="delivery-address-section" in:fade>
        <div class="address-display">
          <span class="location-icon">📍</span>
          <div class="address-text">
            <div class="label">배달 받을 위치</div>
            <div
              class="address-current"
              class:warning={showAddressWarning}
            >
              {#if showAddressWarning}
                🚨 배달 받을 위치를 정해주세요!
              {:else}
                {deliveryAddress || "주소를 입력해주세요"}
              {/if}
            </div>
          </div>
        </div>
        <button class="address-edit-btn" on:click={handleAddressChange}>
          {deliveryAddress ? '수정' : '입력'}
        </button>
      </div>

      <!-- 오늘의 추천(할인가) 메뉴 -->
      <div class="quick-menu-section" in:fade={{ duration: 300 }}>
        <h3> 오늘 할인가 추천 메뉴</h3>
        <div class="quick-menu-list">
          {#each allRecommendedMenus.slice(0, 4) as menu}
            <button
              class="quick-menu-card"
              on:click={() => handleQuickMenuClick(menu)}
            >
              <div class="menu-name">{menu.name}</div>
              <div class="menu-price">{menu.price.toLocaleString()}원</div>
              <div class="menu-icon">🔥</div>
            </button>
          {/each}
          {#if allRecommendedMenus.length === 0}
            <div class="empty-msg" style="padding: 20px; font-size: 1rem;"></div>
          {/if}
        </div>
      </div>

      <!-- 카테고리 -->
      <div class="section-title">음식 종류</div>

      <div class="grid-container" in:fade={{ duration: 300, delay: 100 }}>
        {#each categories as cat}
          <button
            class="card category-card"
            class:active={selectedCategory === cat.name}
            on:click={() => selectedCategory = cat.name}
          >
            <div class="icon">{cat.img}</div>
            <div class="label">{cat.name}</div>
          </button>
        {/each}
      </div>

    <!-- 카테고리 선택 -> 식당 리스트 표시 -->
    {:else if !selectedRestaurant}
      <div class="nav-bar" in:fade>
        <span class="current-cat">{selectedCategory || '식당 목록'}</span>
        <button class="back-btn" on:click={goHome}>↩ 홈으로</button>
      </div>
      <div class="section-title">{selectedCategory || '전체'} 가게를 선택해주세요</div>

      <div class="list-container" in:fly={{ x: 200, duration: 400 }}>
        {#each filteredRestaurants as rest}
          <button class="card restaurant-card" on:click={() => selectedRestaurant = rest}>
            <img src={rest.img} alt={rest.name} class="rest-img" />
            <div class="rest-info">
              <div class="rest-name">{rest.name}</div>
              <div class="rest-desc">배달비 무료 / 별점 ⭐ 5.0</div>
            </div>
          </button>
        {/each}
        {#if filteredRestaurants.length === 0}
          <div class="empty-msg">선택하신 카테고리에 준비중인 가게가 없습니다.</div>
        {/if}
      </div>

    <!-- 식당 선택 -> 메뉴 목록 표시 -->
    {:else}
      <div class="nav-bar" in:fade>
        <span class="current-cat">{selectedRestaurant.name}</span>
        <button class="back-btn" on:click={() => selectedRestaurant = null}>↩ 가게 다시 고르기</button>
      </div>

      <!-- 메뉴 탭 -->
      <div class="menu-tabs">
        <button
          class="tab-btn"
          class:active={menuTab === '전체'}
          on:click={() => menuTab = '전체'}
        >
          전체 메뉴
        </button>
        <button
          class="tab-btn"
          class:active={menuTab === '추천'}
          on:click={() => menuTab = '추천'}
        >
          🌟 추천 메뉴
        </button>
      </div>

      <!-- 메뉴 리스트 -->
      <div class="menu-list" in:fly={{ y: 200, duration: 400 }}>
        {#each displayMenus as menu (menu.id)}
          <div class="menu-item">
            <div class="menu-info">
              <div class="menu-name">{menu.name}</div>
              <div class="menu-price">{menu.price.toLocaleString()}원</div>
            </div>
            <button class="add-btn" on:click={() => addToCart(menu)}>
              담기 +
            </button>
          </div>
        {:else}
          <div class="empty-msg">선택된 탭에 해당하는 메뉴가 없습니다.</div>
        {/each}
      </div>
    {/if}
  </main>

  <!-- 하단 고정 장바구니 바 -->
  <!-- Svelte class 바인딩으로 active 처리 -->
  <footer class="footer-cart" class:active={totalCount > 0}>
    <div class="cart-summary">
      <div class="cart-text">
        총 <span class="highlight">{totalCount}개</span> 담김
      </div>
      <div class="cart-total">
        {totalAmount.toLocaleString()}원
      </div>
    </div>
    <div class="cart-actions">
      {#if totalCount > 0}
        <button class="reset-btn" on:click={resetCart}>비우기</button>
        <button class="pay-btn" on:click={handlePayment}>주문하기</button>
      {:else}
        <div class="empty-cart-text">메뉴를 담아주세요</div>
      {/if}
    </div>
  </footer>

  <!-- 주문 완료 모달(간단) -->
  {#if showPaymentAlert}
    <div class="alert-overlay" transition:fade>
      <div class="alert-box">
        <div class="alert-icon">✅</div>
        <h2>주문이 완료되었습니다!</h2>
        <p>맛있게 만들어 배달해드릴게요.</p>
      </div>
    </div>
  {/if}
</div>

<!-- ======================================================
     스타일 (원본 스타일을 유지하되 일부 정리)
     ====================================================== -->
<style>
  :global(body) {
    margin: 0;
    font-family: 'Pretendard', sans-serif;
    background-color: #f0f2f5;
  }

  .app-container {
    width: 100%;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
    position: relative;
    padding-bottom: 120px; /* footer 공간 확보 */
    box-shadow: none;
  }

  /* ---------- Header ---------- */
  .header {
    background-color: #000000;
    padding: 20px 40px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .quick-toggle-btn {
    background: #ff9800;
    border: none;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }
  .quick-toggle-btn:hover { background: #e68a00; }

  .title-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: right;
  }
  .title-text { font-size: 1.8rem; margin: 0; font-weight: 800; color: white; }

  /* ---------- Side menu ---------- */
  .side-menu-container {
    background-color: #ffffff;
    border-bottom: 3px solid #ddd;
    padding: 30px 50px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 50;
  }
  .side-menu-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .side-menu-content .menu-item {
    background: #f0f0f0;
    color: #333;
    padding: 40px 30px;
    border: 2px solid #ccc;
    border-radius: 12px;
    font-size: 1.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    appearance: none;
    -webkit-appearance: none;
  }
  .side-menu-content .menu-item:hover {
    background: #e0e0e0;
  }

  /* ---------- Main ---------- */
  .content {
    padding: 20px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .section-title { font-size: 1.6rem; font-weight: 700; color: #333; margin-bottom: 20px; text-align: center; }
  .empty-msg { font-size: 1.4rem; color: #999; text-align: center; padding: 50px 0; }

  /* ---------- Address ---------- */
  .delivery-address-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 25px;
    background: #e1f5fe;
    border-radius: 12px;
    border: 2px solid #03a9f4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .address-display { display: flex; align-items: center; flex-grow: 1; }
  .location-icon { font-size: 2.5rem; margin-right: 15px; color: #03a9f4; }
  .address-text .label { font-size: 1.0rem; color: #555; font-weight: 600; }

  .address-current {
    font-size: 1.4rem;
    font-weight: 800;
    color: #000;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    max-width: none;
    transition: color 0.3s;
  }
  .address-current.warning {
    color: #ff0000;
    animation: flash-red 1s infinite alternate;
  }

  @keyframes flash-red {
    from { opacity: 1; }
    to { opacity: 0.7; }
  }

  .address-edit-btn { background: #03a9f4; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 1.2rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
  .address-edit-btn:active { background: #0288d1; }

  /* ---------- Quick menu ---------- */
  .quick-menu-section { margin-bottom: 30px; padding: 15px; background: #fffbe6; border-radius: 16px; border: 2px solid #ffcc80; }
  .quick-menu-section h3 { font-size: 1.4rem; font-weight: 800; color: #ff2222; margin-top: 0; margin-bottom: 15px; text-align: center; }
  .quick-menu-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .quick-menu-card { background: white; border: 2px solid #ffcc80; border-radius: 12px; padding: 15px 10px; text-align: center; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .quick-menu-card:active { background-color: #ffcc80; transform: scale(0.98); }
  .quick-menu-card .menu-name { font-size: 1.3rem; font-weight: 700; margin-bottom: 5px; color: #333; }
  .quick-menu-card .menu-price { font-size: 1.2rem; font-weight: 800; color: #ff5722; }
  .quick-menu-card .menu-icon { font-size: 1.6rem; margin-top: 8px; }

  /* ---------- Categories ---------- */
  .grid-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .card { background: white; border: 2px solid #eee; border-radius: 16px; padding: 20px; cursor: pointer; transition: 0.2s; text-align: center; }
  .card:active, .card.active { transform: scale(0.98); background-color: #fff8e1; border-color: #ff9800; }

  .category-card { height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .icon { font-size: 4rem; margin-bottom: 10px; }
  .label { font-size: 1.8rem; font-weight: 800; color: #333; }

  /* ---------- Store list ---------- */
  .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #f9f9f9; padding: 10px; border-radius: 8px; }
  .current-cat { font-size: 1.5rem; font-weight: 800; color: #ff9800; }
  .back-btn { background: #ddd; border: none; padding: 10px 16px; border-radius: 8px; font-size: 1.1rem; cursor: pointer; }

  .restaurant-card { display: flex; align-items: center; text-align: left; padding: 16px; margin-bottom: 16px; width: 100%; box-sizing: border-box; }
  .rest-img { width: 80px; height: 80px; border-radius: 12px; object-fit: cover; margin-right: 16px; background: #eee; }
  .rest-name { font-size: 1.5rem; font-weight: 800; color: #000; margin-bottom: 6px; }
  .rest-desc { font-size: 1.1rem; color: #666; }

  /* ---------- Menu tabs & list ---------- */
  .menu-tabs { display: flex; justify-content: center; margin: 0 0 20px 0; }
  .tab-btn { flex-grow: 1; background: #eee; border: none; padding: 15px 0; font-size: 1.3rem; font-weight: 700; color: #666; cursor: pointer; transition: 0.2s; }
  .tab-btn:first-child { border-radius: 12px 0 0 12px; }
  .tab-btn:last-child { border-radius: 0 12px 12px 0; }
  .tab-btn.active { background: #ff9800; color: white; box-shadow: 0 4px 8px rgba(255,152,0,0.3); }

  .menu-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; background: white; }
  .menu-name { font-size: 1.4rem; font-weight: 700; color: #222; margin-bottom: 4px; }
  .menu-price { font-size: 1.3rem; color: #ff5722; font-weight: 600; }
  .add-btn { background: #ff5722; color: white; border: none; padding: 12px 24px; border-radius: 50px; font-size: 1.2rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(255,87,34,0.3); }
  .add-btn:active { background: #e64a19; transform: translateY(2px); }

  /* ---------- Footer (cart) ---------- */
  .footer-cart {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #333; color: white;
    padding: 20px 40px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
    max-width: none;
    margin: 0;
    z-index: 100;
  }
  /* active 상태(A little visual hint) */
  .footer-cart.active { background: linear-gradient(90deg, #333, #ff9800); }

  .cart-summary { display: flex; flex-direction: column; }
  .cart-text { font-size: 1.2rem; color: #aaa; margin-bottom: 4px; }
  .cart-total { font-size: 1.9rem; font-weight: 800; color: #fff; }
  .highlight { color: #ff9800; font-weight: bold; }

  .cart-actions { display: flex; gap: 10px; align-items: center; }
  .empty-cart-text { font-size: 1.4rem; color: #888; font-weight: 600; }

  .reset-btn { background: #666; color: white; border: none; padding: 12px 18px; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
  .pay-btn { background: #ff9800; color: white; border: none; padding: 16px 26px; border-radius: 8px; font-size: 1.6rem; font-weight: 800; cursor: pointer; animation: pulse 2s infinite; }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  /* ---------- Alert (payment) ---------- */
  .alert-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 200; }
  .alert-box { background: white; padding: 40px; border-radius: 20px; text-align: center; width: 80%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .alert-icon { font-size: 4rem; margin-bottom: 20px; }
  .alert-box h2 { font-size: 2rem; color: #2e7d32; margin: 0 0 10px 0; }
  .alert-box p { font-size: 1.3rem; color: #555; margin: 0; }
</style>
