<script lang="ts">
  /// <reference types="svelte" />
  import { fly, fade, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { recommendedMenus } from '$lib/recommendedMenus';

  // API 엔드포인트
  const API_BASE_URL = 'http://localhost:3001/api';

  // 메뉴 항목 타입
  interface Menu {
    id: number;
    name: string;
    price: number;
    isRecommended: boolean;
    image?: string;
  }

  // 사용자 메뉴는 소속 매장을 포함
  interface UserMenu extends Menu {
    store: string;
  }

  // 추천 메뉴 타입
  interface RecommendedMenu {
    id: number;
    store: string;
    menu: string;
    price: number;
    emoji: string;
    category: string;
  }

  // 식당 타입
  interface Restaurant {
    id: number;
    name: string;
    category: string;
    img: string;
    menus: Menu[];
  }

  // 기본 식당 데이터
  const defaultRestaurants: Restaurant[] = [
    { 
      id: 1, 
      name: "치킨마을", 
      category: "치킨", 
      img: "🍗",
      menus: [
        { id: 101, name: "치킨 세트", price: 18000, isRecommended: true, image: "🍗" },
        { id: 102, name: "핫치킨 세트", price: 20000, isRecommended: false, image: "🔥" },
        { id: 103, name: "양념치킨", price: 19000, isRecommended: false, image: "🍗" },
      ]
    },
    { 
      id: 2, 
      name: "한식당", 
      category: "한식", 
      img: "🍚",
      menus: [
        { id: 201, name: "오므라이스 주먹밥", price: 15000, isRecommended: true, image: "🍙" },
        { id: 202, name: "김치 볶음밥", price: 12000, isRecommended: false, image: "🍚" },
        { id: 203, name: "비빔밥", price: 13000, isRecommended: false, image: "🥗" },
      ]
    },
    { 
      id: 3, 
      name: "중식당", 
      category: "중식", 
      img: "🥟",
      menus: [
        { id: 301, name: "피자", price: 25000, isRecommended: true, image: "🍕" },
        { id: 302, name: "짜장면", price: 8000, isRecommended: false, image: "🍜" },
        { id: 303, name: "탕수육", price: 22000, isRecommended: true, image: "🥘" },
      ]
    },
    { 
      id: 4, 
      name: "피자집", 
      category: "피자/양식", 
      img: "🍕",
      menus: [
        { id: 401, name: "콤비네이션 피자", price: 23000, isRecommended: false, image: "🍕" },
        { id: 402, name: "불고기 피자", price: 24000, isRecommended: false, image: "🍕" },
      ]
    },
    { 
      id: 5, 
      name: "돈까스집", 
      category: "일식/돈까스", 
      img: "🍛",
      menus: [
        { id: 501, name: "등심 돈까스", price: 12000, isRecommended: false, image: "🍛" },
        { id: 502, name: "치즈 돈까스", price: 14000, isRecommended: false, image: "🧀" },
      ]
    },
    { 
      id: 6, 
      name: "족발보쌈", 
      category: "족발/보쌈", 
      img: "🥓",
      menus: [
        { id: 601, name: "족발 세트", price: 35000, isRecommended: false, image: "🥓" },
        { id: 602, name: "보쌈 세트", price: 38000, isRecommended: false, image: "🥬" },
      ]
    },
    { 
      id: 7, 
      name: "분식집", 
      category: "분식", 
      img: "🍢",
      menus: [
        { id: 701, name: "떡볶이", price: 8000, isRecommended: false, image: "🍢" },
        { id: 702, name: "튀김", price: 10000, isRecommended: false, image: "🍤" },
      ]
    },
    { 
      id: 8, 
      name: "카페", 
      category: "카페/디저트", 
      img: "☕",
      menus: [
        { id: 801, name: "아메리카노", price: 4500, isRecommended: false, image: "☕" },
        { id: 802, name: "케이크", price: 6500, isRecommended: false, image: "🍰" },
      ]
    },
  ];

  // 식당 목록을 상태로 관리
  let restaurants: Restaurant[] = [];
  let isLoading = false;
  // 보호자 모드에서 편집한 사용자 메뉴 목록
  let userMenus: UserMenu[] = [];

  // 보호자 편집 메뉴 (사용자 모드의 "내 메뉴" 탭에 표시)
  let guardianMenus: UserMenu[] = [];

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

  // 장바구니: 수량 조절 가능하도록 구조 유지
  let cart: { name: string; price: number; qty: number }[] = [];

  let showPaymentAlert = false;
  let menuTab: '내 메뉴' | '추천 메뉴' | '전체' | '추천' = '내 메뉴';
  let deliveryAddress: string = "";
  let showAddressWarning: boolean = false;
  let showMenuToggle: boolean = false;
  let currentView: 'home' | 'menu' | 'cart' | 'ai-voice' = 'home';
  let showAIVoiceModal = false;
  let voiceChatHistory: { role: 'user' | 'ai'; message: string }[] = [];
  let isListening = false;
  let aiSpeechSynthesis: SpeechSynthesisUtterance | null = null;

  // 랜덤 추천 메뉴 4개 선택 상태
  let randomRecommendedMenus: RecommendedMenu[] = [];

  // API에서 식당 목록 불러오기
  async function fetchRestaurants() {
    try {
      isLoading = true;
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      if (!response.ok) throw new Error('식당 목록을 불러오는데 실패했습니다.');

      const data = await response.json();
      restaurants = data.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        img: r.img,
        menus: r.menus.map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          isRecommended: m.is_recommended === 1,
          image: m.image,
          isGuardianAdded: m.is_guardian_added === 1
        }))
      }));

      console.log('✅ [사용자 모드] API에서 식당 목록 로드:', restaurants.length, '개');
      console.log('📋 [사용자 모드] 식당별 메뉴:', 
        restaurants.map(r => ({
          name: r.name,
          totalMenus: r.menus.length,
          guardianMenus: r.menus.filter(m => m.isGuardianAdded).length
        }))
      );

      // 보호자가 추가한 메뉴만 필터링하여 guardianMenus에 할당
      guardianMenus = restaurants.flatMap((restaurant) =>
        restaurant.menus
          .filter((menu: any) => menu.isGuardianAdded)
          .map((menu: any) => ({
            ...menu,
            store: restaurant.name
          }))
      );

      console.log('✅ [사용자 모드] 보호자 메뉴 추출 완료:', guardianMenus.length, '개');
      console.log('📋 [사용자 모드] 보호자 메뉴 상세:', guardianMenus);
    } catch (error) {
      console.error('❌ [사용자 모드] 식당 목록 로드 실패:', error);
      restaurants = [...defaultRestaurants];
      guardianMenus = [];
    } finally {
      isLoading = false;
    }
  }

  // 보호자 설정을 API에서 불러오기
  async function loadGuardianSettingsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/guardian-settings`);
        if (!response.ok) throw new Error('보호자 설정을 불러오는데 실패했습니다.');
        const settings = await response.json();
        // settings를 사용하여 필요한 상태 업데이트
    } catch (error) {
        console.error('❌ 보호자 설정 로드 실패:', error);
    }
  }

  // 보호자 편집 메뉴를 가져오는 함수 (더 이상 사용 안 함 - fetchRestaurants에 통합됨)
  async function fetchGuardianMenus(): Promise<UserMenu[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-menus`);
      if (!response.ok) throw new Error('보호자 메뉴를 불러오는데 실패했습니다.');
      const data = await response.json();
      console.log('✅ [사용자 모드] 보호자 메뉴 API 직접 호출:', data.length, '개');
      guardianMenus = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        isRecommended: m.is_recommended === 1,
        image: m.image,
        store: m.restaurant_name || m.store
      }));
      return guardianMenus;
    } catch (error) {
      console.error('❌ [사용자 모드] 보호자 메뉴 로드 실패:', error);
      guardianMenus = [];
      return [];
    }
  }

  // 사용자 메뉴를 가져오는 함수 (기존 fetchUserMenus 제거)
  async function fetchUserMenusFromRestaurants() {
    try {
      // 더 이상 별도의 API 호출 불필요 - fetchRestaurants에서 통합됨
      console.log('✅ [사용자 모드] 메뉴 동기화 완료');
    } catch (error) {
      console.error('❌ [사용자 모드] 메뉴 동기화 실패:', error);
    }
  }

  // onMount: 페이지 로드 시 데이터 불러오기
  onMount(async () => {
    console.log('🚀 [사용자 모드] 페이지 로드 시작');
    await fetchRestaurants();
    await loadGuardianSettingsFromAPI();
    selectRandomRecommendedMenus();
    console.log('🚀 [사용자 모드] 페이지 로드 완료');
  });

  // 랜덤 추천 메뉴 4개 선택 함수
  function selectRandomRecommendedMenus() {
    const shuffled = [...recommendedMenus].sort(() => Math.random() - 0.5);
    randomRecommendedMenus = shuffled.slice(0, 4);
    console.log('🎲 랜덤 추천 메뉴 선택:', randomRecommendedMenus.map(m => m.menu));
  }

  // -------------------------
  // 디버깅: 상태 변경 추적
  // -------------------------
  $: {
    console.log('🔄 currentView 변경:', currentView);
  }

  $: {
    console.log('📦 장바구니 상태:', {
      items: cart.length,
      totalCount,
      totalAmount
    });
  }

  $: {
    console.log('🍽️ menuTab 변경:', menuTab);
  }

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

  // 보호자 편집 메뉴 → 사용자 모드의 "내 메뉴" 탭에 표시
  $: allRecommendedMenus = guardianMenus;

  // 현재 선택된 식당의 표시할 메뉴(전체 or 추천)
  $: displayMenus = selectedRestaurant
    ? (menuTab === '추천 메뉴' || menuTab === '추천'
        ? selectedRestaurant.menus.filter(menu => menu.isRecommended)
        : selectedRestaurant.menus)
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
    console.log('🔍 checkAddressBeforeAction 호출, 현재 주소:', deliveryAddress);
    if (!deliveryAddress) {
      showAddressWarning = true;
      console.log('❌ 주소가 없어서 동작 차단');
      return false;
    }
    console.log('✅ 주소 확인 통과');
    return true;
  }

  // 장바구니에 담기 (동일 메뉴면 수량 증가)
  function addToCart(menu: Menu) {
    console.log('➕ addToCart 호출:', menu.name);
    console.log('현재 장바구니:', cart);
    // 주소 체크 제거 - 바로 추가 가능하도록
    // if (!checkAddressBeforeAction()) return;

    const existingItem = cart.find(item => item.name === menu.name);
    if (existingItem) {
      existingItem.qty += 1;
      cart = [...cart];
      console.log('✅ 수량 증가:', menu.name, '→', existingItem.qty);
    } else {
      cart = [...cart, { name: menu.name, price: menu.price, qty: 1 }];
      console.log('✅ 새 항목 추가:', menu.name);
    }
    console.log('업데이트된 장바구니:', cart);
  }

  // 장바구니 초기화 (확인 대화)
  function resetCart() {
    console.log('🗑️ resetCart 호출');
    if (confirm("장바구니를 비우시겠습니까?")) {
      cart = [];
      console.log('✅ 장바구니 초기화 완료');
    } else {
      console.log('❌ 장바구니 초기화 취소');
    }
  }

  // 결제 처리(샘플): 간단한 애니메이션 후 초기화
  async function handlePayment() {
    console.log('💳 handlePayment 호출');
    if (cart.length === 0) {
      console.log('❌ 장바구니가 비어있음');
      return;
    }
    if (!checkAddressBeforeAction()) return;

    try {
      console.log('✅ 결제 진행 중...');
      
      const orderData = {
        delivery_address: deliveryAddress,
        request_note: '', // 요청사항이 있다면 여기에 추가
        total_amount: totalAmount,
        items: cart.map(item => {
          // 메뉴 ID 찾기
          const menu = restaurants
            .flatMap(r => r.menus)
            .find(m => m.name === item.name);
          
          return {
            menu_id: menu?.id || 0,
            name: item.name,
            price: item.price,
            qty: item.qty
          };
        })
      };
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) throw new Error('주문 처리 실패');
      
      const result = await response.json();
      console.log('✅ 주문 완료:', result);
      
      showPaymentAlert = true;
      setTimeout(() => {
        showPaymentAlert = false;
        cart = [];
        selectedRestaurant = null;
        selectedCategory = "";
        goHome();
      }, 3000);
    } catch (error) {
      console.error('❌ 주문 처리 오류:', error);
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  // 장바구니 항목 수량 증가
  function increaseQty(itemName: string) {
    console.log('⬆️ increaseQty 호출:', itemName);
    const item = cart.find(i => i.name === itemName);
    if (item) {
      item.qty += 1;
      cart = [...cart];
      console.log('✅ 수량 증가:', itemName, '→', item.qty);
    }
  }

  // 장바구니 항목 수량 감소 (0이 되면 제거)
  function decreaseQty(itemName: string) {
    console.log('⬇️ decreaseQty 호출:', itemName);
    const item = cart.find(i => i.name === itemName);
    if (item) {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== itemName);
        console.log('✅ 항목 제거:', itemName);
      } else {
        cart = [...cart];
        console.log('✅ 수량 감소:', itemName, '→', item.qty);
      }
    }
  }

  // 장바구니 항목 제거
  function removeFromCart(itemName: string) {
    console.log('🗑️ removeFromCart 호출:', itemName);
    cart = cart.filter(i => i.name !== itemName);
    console.log('✅ 항목 제거 완료');
  }

  // 장바구니 보기로 이동
  function viewCart() {
    console.log('🛒 viewCart 호출');
    if (cart.length === 0) {
      console.log('❌ 장바구니가 비어있음');
      return;
    }
    currentView = 'cart';
    console.log('✅ 장바구니 화면으로 이동');
  }

  // 홈으로 이동 (상태 초기화)
  function goHome() {
    console.log('🏠 goHome 호출');
    selectedCategory = "";
    selectedRestaurant = null;
    menuTab = '내 메뉴'; // 여기서 '배달' → '내 메뉴'로 변경
    showAddressWarning = false;
    showMenuToggle = false;
    currentView = 'home';
    console.log('✅ 홈 화면으로 이동 완료');
  }

  // 추천 메뉴 클릭 핸들러: 해당 메뉴의 식당을 찾아 선택하고 바로 담기
  function handleQuickMenuClick(menu: Menu) {
    console.log('⚡ handleQuickMenuClick 호출:', menu.name);
    const owningRestaurant = restaurants.find(r => r.menus.some(m => m.id === menu.id));

    if (owningRestaurant) {
      console.log('✅ 식당 찾음:', owningRestaurant.name);
      selectedCategory = owningRestaurant.category;
      selectedRestaurant = owningRestaurant;
      addToCart(menu);
      console.log('✅ 추천 메뉴 처리 완료:', {
        restaurant: owningRestaurant.name,
        menu: menu.name
      });
    } else {
      console.log('❌ 해당 메뉴의 식당을 찾을 수 없음');
    }
  }

  // 랜덤 추천 메뉴 클릭 핸들러
  function handleRecommendedMenuClick(recommendedMenu: RecommendedMenu) {
    console.log('⚡ 추천 메뉴 클릭:', recommendedMenu.menu);
    
    // 같은 이름의 식당 찾기 또는 새로운 식당 생성
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
    }

    // 메뉴 생성 및 장바구니에 추가
    const newMenu: Menu = {
      id: recommendedMenu.id,
      name: recommendedMenu.menu,
      price: recommendedMenu.price,
      isRecommended: true,
      image: recommendedMenu.emoji
    };

    selectedCategory = targetRestaurant.category;
    selectedRestaurant = targetRestaurant;
    addToCart(newMenu);
    
    console.log('✅ 추천 메뉴 처리 완료:', {
      store: targetRestaurant.name,
      menu: recommendedMenu.menu
    });
  }

  // AI 음성 주문 관련 함수
  function openAIVoiceMode() {
    console.log('🎤 AI 음성 주문 모드 시작');
    showAIVoiceModal = true;
    voiceChatHistory = [];
    startAIGreeting();
  }

  function closeAIVoiceMode() {
    showAIVoiceModal = false;
    voiceChatHistory = [];
    stopListening();
  }

  function startAIGreeting() {
    const greeting = "안녕하세요! 무엇을 주문하고 싶으신가요? 식당 이름이나 메뉴 이름을 말씀해주세요.";
    voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: greeting }];
    speakAI(greeting);
    setTimeout(() => startListening(), 2000);
  }

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('음성 인식을 지원하지 않는 브라우저입니다.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;

    isListening = true;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 사용자 입력:', transcript);
      voiceChatHistory = [...voiceChatHistory, { role: 'user', message: transcript }];
      processUserInput(transcript);
      isListening = false;
    };

    recognition.onerror = (event: any) => {
      console.error('❌ 음성 인식 오류:', event.error);
      isListening = false;
    };

    recognition.onend = () => {
      isListening = false;
    };

    recognition.start();
  }

  function stopListening() {
    isListening = false;
  }

  function speakAI(text: string) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    aiSpeechSynthesis = new SpeechSynthesisUtterance(text);
    aiSpeechSynthesis.lang = 'ko-KR';
    aiSpeechSynthesis.rate = 1;
    window.speechSynthesis.speak(aiSpeechSynthesis);
  }

  function processUserInput(userInput: string) {
    const lowerInput = userInput.toLowerCase();
    
    // 1. 메뉴 검색
    let foundMenu: Menu | null = null;
    let foundRestaurant: Restaurant | null = null;

    for (const restaurant of restaurants) {
      const menu = restaurant.menus.find((m: Menu) => 
        m.name.includes(userInput) || userInput.includes(m.name)
      );
      if (menu) {
        foundMenu = menu;
        foundRestaurant = restaurant;
        break;
      }
    }

    // 2. 식당 검색
    if (!foundRestaurant) {
      foundRestaurant = restaurants.find((r: Restaurant) => 
        r.name.includes(userInput) || userInput.includes(r.name)
      ) || null;
    }

    let response = '';

    if (foundMenu && foundRestaurant) {
      // 클로저 내부에서 사용할 변수를 const로 고정
      const confirmedMenu = foundMenu;
      const confirmedRestaurant = foundRestaurant;
      
      response = `${confirmedRestaurant.name}의 ${confirmedMenu.name}을 찾았습니다. ${confirmedMenu.price.toLocaleString()}원입니다. 주문하시겠습니까?`;
      voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: response }];
      speakAI(response);
      
      // 사용자 응답 대기
      setTimeout(() => {
        const confirmRecognition = new ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)();
        confirmRecognition.lang = 'ko-KR';
        
        confirmRecognition.onresult = (event: any) => {
          const confirmTranscript = event.results[0][0].transcript.toLowerCase();
          voiceChatHistory = [...voiceChatHistory, { role: 'user', message: confirmTranscript }];
          
          if (confirmTranscript.includes('주문') || confirmTranscript.includes('네') || 
              confirmTranscript.includes('맞') || confirmTranscript.includes('좋') || 
              confirmTranscript.includes('기') || confirmTranscript.includes('해')) {
            // 주문 확정 - const로 고정된 변수 사용
            selectedRestaurant = confirmedRestaurant;
            selectedCategory = confirmedRestaurant.category;
            addToCart(confirmedMenu);
            
            const confirmMsg = `${confirmedMenu.name}을 장바구니에 담았습니다. 장바구니로 이동합니다.`;
            voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: confirmMsg }];
            speakAI(confirmMsg);
            
            setTimeout(() => {
              closeAIVoiceMode();
              currentView = 'cart';
            }, 2000);
          } else {
            // 주문 취소
            const cancelMsg = '주문이 취소되었습니다. 다른 메뉴를 찾아드릴까요?';
            voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: cancelMsg }];
            speakAI(cancelMsg);
            setTimeout(() => startListening(), 2000);
          }
        };
        
        confirmRecognition.start();
      }, 1500);
    } else if (foundRestaurant) {
      response = `${foundRestaurant.name}을 찾았습니다. 어떤 메뉴를 원하시나요?`;
      voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: response }];
      speakAI(response);
      setTimeout(() => startListening(), 2000);
    } else {
      response = "죄송합니다. 찾는 메뉴나 식당이 없습니다. 다시 한 번 말씀해주세요.";
      voiceChatHistory = [...voiceChatHistory, { role: 'ai', message: response }];
      speakAI(response);
      setTimeout(() => startListening(), 2000);
    }
  }

  function goToHome() {
    window.location.href = '/';
  }
</script>

<!-- ======================================================
     메인 템플릿
     ====================================================== -->
<div class="app-container">
  <!-- Header -->
  <header class="header">
    <!-- 홈 버튼 -->
    <button class="home-btn" on:click={goToHome} title="홈으로">← 홈</button>
    
    <!-- 타이틀 버튼 (홈으로 이동) -->
    <button class="title-btn" on:click={goHome}>
      <h1 class="title-text">Simple Delivery App</h1>
    </button>
    
    <!-- AI 음성 주문 버튼 -->
    <button class="ai-voice-btn" on:click={openAIVoiceMode} title="AI 음성 주문">
      <img src="/images/phone-icon.png" alt="전화" class="phone-icon" />
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
    <!-- 초기화면: 주소 입력 + 추천 메뉴 -->
    {#if currentView === 'home'}
      <div class="top-question" in:fade>
        <h2>무엇을 주문할까요?</h2>
        <p>원하는 메뉴를 선택해주세요</p>
      </div>

      <!-- 배달/주문 탭 -->
      <div class="delivery-tabs">
        <button
          class="tab-my"
          class:active={menuTab === '내 메뉴'}
          on:click={() => menuTab = '내 메뉴'}
          title="보호자가 편집한 추천 메뉴"
        >
          내 메뉴
        </button>
        <button
          class="tab-recommend"
          class:active={menuTab === '추천 메뉴'}
          on:click={() => menuTab = '추천 메뉴'}
          title="AI가 추천하는 메뉴"
        >
          추천 메뉴
        </button>
      </div>

      <!-- 내 메뉴 탭 - 보호자 편집 메뉴 -->
      {#if menuTab === '내 메뉴'}
        <div class="recommended-grid" in:fade={{ duration: 300 }}>
          {#if allRecommendedMenus.length > 0}
            {#each allRecommendedMenus as menu, idx}
              <button
                class="recommended-card"
                class:highlight={idx === 0}
                on:click={() => handleQuickMenuClick(menu)}
              >
                <div class="card-image">{menu.image || '🍽️'}</div>
                <div class="card-info">
                  <div class="card-store">{menu.store}</div>
                  <div class="card-name">{menu.name}</div>
                  <div class="card-price">{menu.price.toLocaleString()}원</div>
                </div>
              </button>
            {/each}
          {:else}
            <div class="empty-msg" style="grid-column: 1/-1;">
              아직 추가된 메뉴가 없습니다.
            </div>
          {/if}
        </div>
      {/if}

      <!-- 추천 메뉴 탭 - 랜덤 추천 메뉴 -->
      {#if menuTab === '추천 메뉴'}
        <div class="recommended-grid" in:fade={{ duration: 300 }}>
          {#if randomRecommendedMenus.length > 0}
            {#each randomRecommendedMenus as menu, idx}
              <button
                class="recommended-card"
                class:highlight={idx === 0}
                on:click={() => handleRecommendedMenuClick(menu)}
              >
                <div class="card-image">{menu.emoji}</div>
                <div class="card-info">
                  <div class="card-store">{menu.store}</div>
                  <div class="card-name">{menu.menu}</div>
                  <div class="card-price">{menu.price.toLocaleString()}원</div>
                </div>
              </button>
            {/each}
          {:else}
            <div class="empty-msg" style="grid-column: 1/-1;">
              추천 메뉴를 불러오는 중...
            </div>
          {/if}
        </div>
      {/if}

    <!-- 장바구니 화면 -->
    {:else if currentView === 'cart'}
      <div class="cart-header" in:fade>
        <button class="back-btn" on:click={() => currentView = 'home'}>← 뒤로</button>
        <h2>보관함 보드</h2>
      </div>

      <div class="cart-list" in:fly={{ y: 200, duration: 400 }}>
        <h3>주문 메뉴</h3>
        {#each cart as item}
          <div class="cart-item">
            <img src="https://via.placeholder.com/60" alt={item.name} class="cart-item-img" />
            <div class="cart-item-info">
              <div class="cart-item-name">{item.name}</div>
              <div class="cart-item-price">{item.price.toLocaleString()}원</div>
            </div>
            <div class="cart-item-controls">
              <button class="qty-btn" on:click={() => decreaseQty(item.name)}>-</button>
              <span class="qty-display">{item.qty}</span>
              <button class="qty-btn" on:click={() => increaseQty(item.name)}>+</button>
            </div>
            <button class="remove-btn" on:click={() => removeFromCart(item.name)}>🗑️</button>
          </div>
        {/each}

        <div class="order-details">
          <div class="detail-row">
            <span>주문 종류</span>
            <span>배달주문</span>
          </div>
          <div class="detail-row">
            <span>총 개수</span>
            <span>{totalCount}개</span>
          </div>
          <div class="detail-row total">
            <span>총 금액</span>
            <span>{totalAmount.toLocaleString()}원</span>
          </div>
        </div>

        <div class="cart-address">
          <label>배달 주소</label>
          <input
            type="text"
            bind:value={deliveryAddress}
            placeholder="서울시 강남구 신사동 123"
            class="address-input"
          />
        </div>

        <div class="payment-info">
          <label>요청사항 (선택사항)</label>
          <textarea placeholder="덜 맵게 해주세요"  class="user-info-input"></textarea>
        </div>

        <div class="cart-actions-bottom">
          <button class="cancel-btn" on:click={resetCart}>취소</button>
          <button class="confirm-btn" on:click={handlePayment}>주문</button>
        </div>
      </div>

    <!-- 식당 선택 -> 메뉴 목록 표시 -->
    {:else}
      {#if selectedRestaurant}
        <div class="nav-bar" in:fade>
          <span class="current-cat">{selectedRestaurant.name}</span>
          <button class="back-btn" on:click={() => selectedRestaurant = null}>↩ 가게 다시 고르기</button>
        </div>

        <!-- 메뉴 탭 -->
        <div class="menu-tabs">
          <button
            class="tab-btn"
            class:active={menuTab === '내 메뉴'}
            on:click={() => menuTab = '내 메뉴'}
          >
            내 메뉴
          </button>
          <button
            class="tab-btn"
            class:active={menuTab === '추천 메뉴'}
            on:click={() => menuTab = '추천 메뉴'}
          >
            추천 메뉴
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
              <button class="add-btn" on:click={() => {
                addToCart(menu);
                menuTab = '내 메뉴';
              }}>
                담기 +
              </button>
            </div>
          {:else}
            <div class="empty-msg">선택된 탭에 해당하는 메뉴가 없습니다.</div>
          {/each}
        </div>
      {/if}
    {/if}

    {#if isLoading}
      <div class="loading-overlay">
        <div class="loading-spinner">🔄</div>
        <p>메뉴를 불러오는 중...</p>
      </div>
    {/if}
  </main>

  <!-- 하단 고정 장바구니 바 -->
  {#if currentView !== 'cart'}
    <footer class="footer-cart" class:active={totalCount > 0} on:click={viewCart}>
      <div class="cart-icon-wrapper">
        <span class="cart-icon">🛒</span>
        {#if totalCount > 0}
          <span class="cart-badge">{totalCount}</span>
        {/if}
      </div>
      <div class="cart-summary">
        <div class="cart-text">주문하기</div>
        <div class="cart-total">{totalAmount.toLocaleString()}원</div>
      </div>
    </footer>
  {/if}

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

  <!-- AI 음성 주문 모달 -->
  {#if showAIVoiceModal}
    <div class="ai-modal-overlay" transition:fade on:click={closeAIVoiceMode}>
      <div class="ai-modal-content" on:click|stopPropagation transition:slide>
        <button class="ai-close-btn" on:click={closeAIVoiceMode}>✕</button>
        
        <div class="ai-header">
          <h2>🤖 AI 음성 주문</h2>
          <div class="ai-status" class:listening={isListening}>
            {#if isListening}
              <span class="listening-dot"></span>
              <span>듣는 중...</span>
            {:else}
              <span>준비 완료</span>
            {/if}
          </div>
        </div>

        <div class="ai-chat-box">
          {#each voiceChatHistory as chat (chat.role + JSON.stringify(chat.message))}
            <div class="chat-message" class:user={chat.role === 'user'} class:ai={chat.role === 'ai'}>
              <div class="chat-bubble">
                {chat.message}
              </div>
            </div>
          {/each}
        </div>

        <div class="ai-controls">
          <button 
            class="listen-btn" 
            on:click={startListening}
            disabled={isListening}
          >
            🎤 다시 듣기
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- ======================================================
     스타일
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
    padding-bottom: 120px;
    box-shadow: none;
  }

  /* ---------- Header ---------- */
  .header {
    background-color: #000000;
    padding: 15px 20px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .home-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .home-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateX(-2px);
  }

  .title-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: center;
    flex: 1;
  }
  
  .title-text { 
    font-size: 1.6rem; 
    margin: 0; 
    font-weight: 800; 
    color: white; 
  }

  /* ---------- AI Voice Button ---------- */
  .ai-voice-btn {
    background: #f0f8f0;
    border: 3px solid #81c784;
    color: white;
    padding: 6px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
  }

  .ai-voice-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 18px rgba(76, 175, 80, 0.5);
    border-color: #a5d6a7;
  }

  .ai-voice-btn:active {
    transform: scale(0.95);
  }

  .phone-icon {
    width: 36px;
    height: 36px;
    stroke: white;
  }

  /* ---------- Main ---------- */
  .content {
    padding: 20px 20px;
    max-width: 100%;
    margin: 0 auto;
  }

  .top-question {
    text-align: center;
    padding: 30px 20px 20px;
  }
  .top-question h2 {
    font-size: 2rem;
    font-weight: 800;
    color: #000;
    margin: 0 0 10px 0;
  }
  .top-question p {
    font-size: 1.2rem;
    color: #666;
    margin: 0;
  }

  /* 배달/주문 탭 */
  .delivery-tabs {
    display: flex;
    gap: 12px;
    margin: 20px 0 24px 0;
    justify-content: center;
  }
  .tab-my, .tab-recommend {
    flex: 1;
    min-width: 120px;
    max-width: 180px;
    height: 44px;
    padding: 0 10px;
    border: none;
    border-radius: 24px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    background: #f5f5f5;
    color: #999;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tab-my.active {
    background: #ff9800;
    color: white;
    box-shadow: 0 2px 8px rgba(255,152,0,0.18);
  }
  .tab-recommend.active {
    background: #ffcc00;
    color: white;
    box-shadow: 0 2px 8px rgba(255,204,0,0.18);
  }

  /* ---------- 추천 메뉴 그리드 (2x2) */
  .recommended-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
    max-width: 100%;
    margin: 0 auto;
  }
  .recommended-card {
    background: white;
    border: 2px solid #eee;
    border-radius: 20px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 180px;
  }
  .recommended-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  .recommended-card.highlight {
    border-color: #ff6b35;
    background: linear-gradient(135deg, #fff 0%, #fff5f2 100%);
  }
  .card-image {
    font-size: 4rem;
    margin-bottom: 15px;
  }
  .card-store {
    font-size: 0.9rem;
    font-weight: 600;
    color: #999;
    margin-bottom: 4px;
  }
  .card-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
    text-align: center;
  }
  .card-price {
    font-size: 1.5rem;
    font-weight: 800;
    color: #ff6b35;
  }

  /* 장바구니 화면 */
  .cart-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 40px;
    border-bottom: 2px solid #eee;
  }
  .cart-header h2 {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
    color: #333;
  }

  .cart-list {
    padding: 20px 40px;
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 140px;
  }
  .cart-list h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 20px;
  }

  .cart-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: white;
    border: 2px solid #eee;
    border-radius: 12px;
    margin-bottom: 15px;
  }
  .cart-item-img {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
    background: #f5f5f5;
  }
  .cart-item-info {
    flex: 1;
  }
  .cart-item-name {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
  }
  .cart-item-price {
    font-size: 1.1rem;
    color: #ff6b35;
    font-weight: 600;
  }
  .cart-item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f5f5f5;
    padding: 5px 10px;
    border-radius: 20px;
  }
  .qty-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: white;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .qty-display {
    font-size: 1.2rem;
    font-weight: 700;
    min-width: 30px;
    text-align: center;
  }
  .remove-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
  }

  .order-details {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 12px;
    margin: 30px 0;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 1.2rem;
    color: #666;
  }
  .detail-row.total {
    border-top: 2px solid #ddd;
    padding-top: 15px;
    margin-top: 10px;
    font-size: 1.4rem;
    font-weight: 800;
    color: #000;
  }

  .cart-address, .payment-info {
    margin: 20px 0;
  }
  .cart-address label, .payment-info label {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }
  .address-input, .user-info-input {
    width: 100%;
    padding: 15px;
    border: 2px solid #eee;
    border-radius: 12px;
    font-size: 1.1rem;
    box-sizing: border-box;
  }
  .user-info-input {
    min-height: 80px;
    resize: vertical;
    font-family: inherit;
  }

  .cart-actions-bottom {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  .cancel-btn, .confirm-btn {
    flex: 1;
    padding: 18px;
    border: none;
    border-radius: 12px;
    font-size: 1.4rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
  }
  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }
  .confirm-btn {
    background: #ff6b35;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }

  /* 메뉴 탭 */
  .menu-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    justify-content: center;
  }
  .menu-tabs .tab-btn {
    flex: 1;
    min-width: 120px;
    max-width: 180px;
    height: 44px;
    padding: 0 10px;
    border: none;
    border-radius: 24px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    background: #f5f5f5;
    color: #999;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .menu-tabs .tab-btn.active {
    background: #ff9800;
    color: white;
    box-shadow: 0 2px 8px rgba(255,152,0,0.18);
  }

  .nav-bar { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 20px; 
    background: #f9f9f9; 
    padding: 10px; 
    border-radius: 8px; 
  }
  .current-cat { 
    font-size: 1.5rem; 
    font-weight: 800; 
    color: #ff9800; 
  }
  .back-btn { 
    background: #ddd; 
    border: none; 
    padding: 10px 16px; 
    border-radius: 8px; 
    font-size: 1.1rem; 
    cursor: pointer; 
  }

  .menu-list {
    padding-bottom: 20px;
  }

  .menu-item { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 20px; 
    border-bottom: 1px solid #eee; 
    background: white; 
  }
  .menu-info {
    flex: 1;
  }
  .menu-name { 
    font-size: 1.4rem; 
    font-weight: 700; 
    color: #222; 
    margin-bottom: 4px; 
  }
  .menu-price { 
    font-size: 1.3rem; 
    color: #ff5722; 
    font-weight: 600; 
  }
  .add-btn { 
    background: #ff5722; 
    color: white; 
    border: none; 
    padding: 12px 24px; 
    border-radius: 50px; 
    font-size: 1.2rem; 
    font-weight: 700; 
    cursor: pointer; 
    box-shadow: 0 4px 6px rgba(255,87,34,0.3); 
  }
  .add-btn:active { 
    background: #e64a19; 
    transform: translateY(2px); 
  }

  .empty-msg { 
    font-size: 1.4rem; 
    color: #999; 
    text-align: center; 
    padding: 50px 0; 
  }

  /* ---------- Footer (cart) ---------- */
  .footer-cart {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: #333;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    z-index: 100;
    max-width: 85%;
    min-height: 44px;
  }

  .footer-cart.active {
    box-shadow: 0 4px 25px rgba(255, 152, 0, 0.4), 
                0 0 0 3px rgba(255, 152, 0, 0.6),
                0 0 20px rgba(255, 184, 77, 0.3);
  }

  .footer-cart:hover {
    box-shadow: 0 6px 30px rgba(0,0,0,0.25);
    transform: translateX(-50%) translateY(-3px);
  }

  .footer-cart.active:hover {
    box-shadow: 0 6px 35px rgba(255, 152, 0, 0.5), 
                0 0 0 3px rgba(255, 152, 0, 0.7),
                0 0 25px rgba(255, 184, 77, 0.4);
  }

  .cart-icon-wrapper {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cart-icon {
    font-size: 1.8rem;
  }
  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff6b35;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 20px;
    text-align: center;
  }

  .cart-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    text-align: right;
  }
  .cart-text {
    font-size: 0.9rem;
    color: #999;
    line-height: 1.2;
  }
  .cart-total {
    font-size: 1.3rem;
    font-weight: 800;
    color: #ff6b35;
    line-height: 1.2;
  }

  /* ---------- Alert (payment) ---------- */
  .alert-overlay { 
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%; 
    background: rgba(0,0,0,0.7); 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    z-index: 200; 
  }
  .alert-box { 
    background: white; 
    padding: 40px; 
    border-radius: 20px; 
    text-align: center; 
    width: 80%; 
    max-width: 400px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  }
  .alert-icon { 
    font-size: 4rem; 
    margin-bottom: 20px; 
  }
  .alert-box h2 { 
    font-size: 2rem; 
    color: #2e7d32; 
    margin: 0 0 10px 0; 
  }
  .alert-box p { 
    font-size: 1.3rem; 
    color: #555; 
    margin: 0; 
  }

  /* ---------- AI Voice Modal ---------- */
  .ai-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 300;
  }

  .ai-modal-content {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .ai-close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-close-btn:hover {
    color: #333;
  }

  .ai-header {
    padding: 20px;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ai-header h2 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #333;
    margin: 0;
  }

  .ai-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #666;
    font-weight: 600;
  }

  .ai-status.listening {
    color: #4caf50;
  }

  .listening-dot {
    width: 8px;
    height: 8px;
    background: #4caf50;
    border-radius: 50%;
    animation: pulse-dot 1.5s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .ai-chat-box {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .chat-message {
    display: flex;
    margin-bottom: 10px;
  }

  .chat-message.user {
    justify-content: flex-end;
  }

  .chat-message.ai {
    justify-content: flex-start;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 1rem;
    line-height: 1.5;
    word-break: break-word;
  }

  .chat-message.user .chat-bubble {
    background: #4caf50;
    color: white;
    border-radius: 16px 0 16px 16px;
  }

  .chat-message.ai .chat-bubble {
    background: #f5f5f5;
    color: #333;
    border-radius: 0 16px 16px 16px;
  }

  .ai-controls {
    padding: 20px;
    border-top: 2px solid #f0f0f0;
    display: flex;
    gap: 10px;
  }

  .listen-btn {
    flex: 1;
    background: #4caf50;
    color: white;
    border: none;
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  .listen-btn:hover:not(:disabled) {
    background: #45a049;
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
  }

  .listen-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .loading-spinner {
    font-size: 4rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>