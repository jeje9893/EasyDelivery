<script>
  // 부모 컴포넌트에서 전달받을 데이터 (기본값 설정됨)
  export let name = "치킨 세트";
  export let price = "18,000원";
  export let image = "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&h=150&fit=crop";
</script>

<div class="flex items-center gap-4 p-3 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
  
  <img 
    src={image} 
    alt={name} 
    class="object-cover w-20 h-20 bg-gray-200 rounded-xl shrink-0" 
  />
  
  <div class="flex-1 min-w-0">
    <h3 class="text-lg font-bold text-gray-800 truncate">{name}</h3>
    <p class="mt-1 font-bold text-orange-500">{price}</p>
  </div>
  
  <div class="flex flex-col gap-2">
    
    <button class="flex items-center justify-center w-8 h-8 transition rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100" aria-label="수정">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
    
    <button class="flex items-center justify-center w-8 h-8 transition rounded-full bg-red-50 text-red-500 hover:bg-red-100" aria-label="삭제">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>

  </div>
</div>