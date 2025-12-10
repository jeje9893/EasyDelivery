<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  const API_BASE_URL = 'http://localhost:3001/api';

  interface GuardianMenu {
    id: number;
    restaurant_name: string;
    menu_name: string;
    price: number;
    image: string;
    created_at?: string;
  }

  // 상태 변수
  let menus: GuardianMenu[] = [];
  let isLoading = false;
  let showModal = false;
  let errorMessage = '';

  // 폼 입력값
  let restaurantName = '';
  let menuName = '';
  let price = '';
  let selectedEmoji = '🍽️';

  // 이모지 목록
  const emojis = ['🍽️', '🍗', '🍕', '🍜', '🍚', '🥘', '🍙', '🥗', '🍤', '🧀', '🍢', '🍰', '☕'];

  // 메뉴 목록 불러오기
  async function loadMenus() {
    try {
      console.log('📡 메뉴 불러오기 시작');
      const response = await fetch(`${API_BASE_URL}/guardian-menus`);
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      menus = await response.json();
      console.log('✅ 메뉴 로드 성공:', menus);
      errorMessage = '';
    } catch (error) {
      console.error('❌ 메뉴 로드 실패:', error);
      errorMessage = '메뉴를 불러오는데 실패했습니다.';
      menus = [];
    }
  }

  // 메뉴 추가
  async function addMenu() {
    // 입력값 검증
    if (!restaurantName.trim()) {
      alert('식당명을 입력해주세요.');
      return;
    }
    if (!menuName.trim()) {
      alert('메뉴명을 입력해주세요.');
      return;
    }
    if (!price.trim()) {
      alert('가격을 입력해주세요.');
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('올바른 가격을 입력해주세요.');
      return;
    }

    try {
      isLoading = true;
      errorMessage = '';

      const newMenu = {
        restaurant_name: restaurantName.trim(),
        menu_name: menuName.trim(),
        price: priceNum,
        image: selectedEmoji
      };

      console.log('📤 메뉴 추가 요청:', newMenu);

      const response = await fetch(`${API_BASE_URL}/guardian-menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMenu)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 메뉴 추가 성공:', result);

      // 성공 메시지
      alert(`${restaurantName}의 ${menuName} 메뉴가 추가되었습니다!`);

      // 폼 초기화
      restaurantName = '';
      menuName = '';
      price = '';
      selectedEmoji = '🍽️';
      showModal = false;

      // 목록 새로고침
      await loadMenus();

    } catch (error) {
      console.error('❌ 메뉴 추가 실패:', error);
      errorMessage = error instanceof Error ? error.message : '메뉴 추가에 실패했습니다.';
      alert(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  // 메뉴 삭제
  async function deleteMenu(id: number, name: string) {
    if (!confirm(`'${name}' 메뉴를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      isLoading = true;
      errorMessage = '';

      console.log('🗑️ 메뉴 삭제 요청:', id);

      const response = await fetch(`${API_BASE_URL}/guardian-menus/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      console.log('✅ 메뉴 삭제 성공');
      alert(`${name} 메뉴가 삭제되었습니다.`);

      // 목록 새로고침
      await loadMenus();

    } catch (error) {
      console.error('❌ 메뉴 삭제 실패:', error);
      errorMessage = '메뉴 삭제에 실패했습니다.';
      alert(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  // 모달 열기
  function openModal() {
    showModal = true;
    restaurantName = '';
    menuName = '';
    price = '';
    selectedEmoji = '🍽️';
  }

  // 모달 닫기
  function closeModal() {
    showModal = false;
  }

  // 홈으로 이동
  function goHome() {
    window.location.href = '/';
  }

  // 페이지 로드시 메뉴 불러오기
  onMount(() => {
    console.log('🚀 보호자 모드 시작');
    loadMenus();
  });
</script>

<div class="container">
  <!-- 헤더 -->
  <header class="header">
    <button class="btn-home" on:click={goHome}>← 홈</button>
    <h1>🛡️ 보호자 메뉴 관리</h1>
    <button class="btn-add" on:click={openModal}>+ 추가</button>
  </header>

  <!-- 에러 메시지 -->
  {#if errorMessage}
    <div class="error-banner" transition:fade>
      <p>{errorMessage}</p>
      <button on:click={() => errorMessage = ''}>✕</button>
    </div>
  {/if}

  <!-- 로딩 -->
  {#if isLoading}
    <div class="loading">처리 중...</div>
  {/if}

  <!-- 메뉴 목록 -->
  <main class="main">
    {#if menus.length === 0}
      <div class="empty">
        <p>등록된 메뉴가 없습니다.</p>
        <button class="btn-add-large" on:click={openModal}>
          첫 메뉴 추가하기
        </button>
      </div>
    {:else}
      <h2>등록된 메뉴 ({menus.length}개)</h2>
      <div class="menu-grid">
        {#each menus as menu (menu.id)}
          <div class="menu-card" transition:fade>
            <div class="menu-top">
              <span class="emoji">{menu.image}</span>
              <button class="btn-delete" on:click={() => deleteMenu(menu.id, menu.menu_name)}>
                ✕
              </button>
            </div>
            <h3>{menu.menu_name}</h3>
            <p class="price">{menu.price.toLocaleString()}원</p>
            <p class="restaurant">{menu.restaurant_name}</p>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <!-- 메뉴 추가 모달 -->
  {#if showModal}
    <div class="modal-overlay" transition:fade on:click={closeModal}>
      <div class="modal" on:click|stopPropagation transition:slide>
        <button class="modal-close" on:click={closeModal}>✕</button>
        
        <h2>메뉴 추가</h2>

        <form on:submit|preventDefault={addMenu}>
          <div class="form-group">
            <label for="restaurant">식당명</label>
            <input 
              id="restaurant"
              type="text" 
              bind:value={restaurantName}
              placeholder="예: 중국집"
              required
            />
          </div>

          <div class="form-group">
            <label for="menu">메뉴명</label>
            <input 
              id="menu"
              type="text" 
              bind:value={menuName}
              placeholder="예: 짜장면"
              required
            />
          </div>

          <div class="form-group">
            <label for="price">가격 (원)</label>
            <input 
              id="price"
              type="number" 
              bind:value={price}
              placeholder="예: 9900"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label>아이콘 선택</label>
            <div class="emoji-grid">
              {#each emojis as emoji}
                <button
                  type="button"
                  class="emoji-btn"
                  class:active={selectedEmoji === emoji}
                  on:click={() => selectedEmoji = emoji}
                >
                  {emoji}
                </button>
              {/each}
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" on:click={closeModal}>
              취소
            </button>
            <button type="submit" class="btn-submit" disabled={isLoading}>
              {isLoading ? '추가 중...' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  * {
    box-sizing: border-box;
  }

  .container {
    min-height: 100vh;
    background: #f5f5f5;
  }

  /* 헤더 */
  .header {
    background: #000;
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .header h1 {
    margin: 0;
    font-size: 1.5rem;
    flex: 1;
    text-align: center;
  }

  .btn-home {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
  }

  .btn-home:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .btn-add {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
  }

  .btn-add:hover {
    background: #5568d3;
  }

  /* 에러 배너 */
  .error-banner {
    background: #fee;
    border-left: 4px solid #f44;
    padding: 1rem;
    margin: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
  }

  .error-banner p {
    margin: 0;
    color: #c33;
  }

  .error-banner button {
    background: #f44;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    cursor: pointer;
  }

  /* 로딩 */
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 1.2rem;
  }

  /* 메인 */
  .main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .main h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.3rem;
  }

  /* 빈 상태 */
  .empty {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 8px;
  }

  .empty p {
    color: #999;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .btn-add-large {
    background: #667eea;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .btn-add-large:hover {
    background: #5568d3;
  }

  /* 메뉴 그리드 */
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .menu-card {
    background: white;
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s;
  }

  .menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .menu-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .emoji {
    font-size: 2.5rem;
  }

  .btn-delete {
    background: #ff6b6b;
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-delete:hover {
    background: #ff5252;
  }

  .menu-card h3 {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .price {
    font-size: 1.2rem;
    color: #667eea;
    font-weight: 700;
    margin: 0.5rem 0;
  }

  .restaurant {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
  }

  /* 모달 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
  }

  .modal-close:hover {
    color: #333;
  }

  .modal h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
  }

  /* 폼 */
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #eee;
    border-radius: 6px;
    font-size: 1rem;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
  }

  /* 이모지 그리드 */
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .emoji-btn {
    padding: 0.75rem;
    font-size: 1.8rem;
    border: 2px solid #eee;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .emoji-btn:hover {
    transform: scale(1.1);
  }

  .emoji-btn.active {
    border-color: #667eea;
    background: #f0f4ff;
  }

  /* 폼 액션 */
  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .btn-cancel,
  .btn-submit {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .btn-cancel:hover {
    background: #e0e0e0;
  }

  .btn-submit {
    background: #667eea;
    color: white;
  }

  .btn-submit:hover:not(:disabled) {
    background: #5568d3;
  }

  .btn-submit:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
