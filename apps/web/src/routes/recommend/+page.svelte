<script>
  // 1. 데이터 정의 (리스트 렌더링을 위해 배열로 관리)
  let menuItems = [
    { 
      id: 1, 
      name: '치킨 세트', 
      price: '18,000원', 
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&h=150&fit=crop' 
    },
    { 
      id: 2, 
      name: '피자', 
      price: '25,000원', 
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop' 
    },
    { 
      id: 3, 
      name: '햄버거 세트', 
      price: '12,000원', 
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop' 
    },
    { 
      id: 4, 
      name: '짜장면', 
      price: '8,000원', 
      image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=150&h=150&fit=crop' 
    }
  ];
</script>

<main class="min-h-screen bg-gray-100 flex justify-center items-center py-10 font-sans">
  
  <div class="w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-[8px] border-gray-800">
    
    <div class="h-6 w-full bg-white"></div>

    <div class="px-5 pt-2 pb-20 h-full overflow-y-auto no-scrollbar">
      
      <header class="mb-4">
        <h1 class="text-sm font-bold text-gray-800 mb-4 ml-1">보호자 모드</h1>
        
        <div class="flex gap-2">
          <button class="flex-1 bg-orange-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-orange-600 transition">
            메뉴 관리
          </button>
          <button class="flex-1 bg-gray-100 text-gray-500 font-medium py-3 rounded-lg hover:bg-gray-200 transition">
            배달 정보
          </button>
        </div>
      </header>

      <button class="w-full bg-orange-500 text-white text-lg font-bold py-4 rounded-xl shadow-md mb-6 flex items-center justify-center gap-2 hover:bg-orange-600 transition">
        <span>+</span> 새 메뉴 추가
      </button>

      <div class="flex flex-col gap-4">
        {#each menuItems as item (item.id)}
          <div class="bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center gap-4">
            
            <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
            </div>

            <div class="flex-1 flex flex-col justify-center">
              <h3 class="text-gray-900 font-bold text-lg leading-tight">{item.name}</h3>
              <p class="text-orange-500 font-bold mt-1">{item.price}</p>
            </div>

            <div class="flex flex-col gap-2">
              <button aria-label = "메뉴수정"class="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button aria-label = "메뉴삭제"class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="absolute bottom-6 right-6">
      <button aria-label = "화면 잠금"class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:scale-105 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-orange-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </button>
    </div>

  </div>
</main>

<style>
  /* 스크롤바 숨기기 유틸리티 */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>