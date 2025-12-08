import React, { useState } from 'react';
import { Phone, ShoppingCart, Plus, Star } from 'lucide-react';
import OrderModal from './OrderModal';
import CartDrawer from './CartDrawer';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const FoodOrderPage: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'내 메뉴' | '추천 메뉴'>('내 메뉴');

  const myMenus: MenuItem[] = [
    { id: '1', name: '치킨 세트', price: 18000, image: 'https://via.placeholder.com/300x200?text=치킨' },
    { id: '2', name: '피자', price: 22000, image: 'https://via.placeholder.com/300x200?text=피자' },
    { id: '3', name: '햄버거 세트', price: 12000, image: 'https://via.placeholder.com/300x200?text=햄버거' },
    { id: '4', name: '파전만', price: 8000, image: 'https://via.placeholder.com/300x200?text=파전' },
  ];

  const recommendedMenus: MenuItem[] = [
    { id: '5', name: '모둠회 주천', price: 15000, image: 'https://via.placeholder.com/300x200?text=회' },
    { id: '6', name: '인기 메뉴', price: 22000, image: 'https://via.placeholder.com/300x200?text=인기' },
    { id: '7', name: '월남 특선', price: 12000, image: 'https://via.placeholder.com/300x200?text=월남' },
    { id: '8', name: '게장 주천', price: 18000, image: 'https://via.placeholder.com/300x200?text=게장' },
  ];

  const menus = activeTab === '내 메뉴' ? myMenus : recommendedMenus;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold mb-2">무엇을 주문할까요?</h1>
        <p className="text-sm text-gray-600">원하는 메뉴를 선택하세요</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setActiveTab('내 메뉴')}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            activeTab === '내 메뉴'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          내 메뉴
        </button>
        <button
          onClick={() => setActiveTab('추천 메뉴')}
          className={`flex items-center justify-center gap-1 flex-1 py-3 rounded-lg font-semibold ${
            activeTab === '추천 메뉴'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          <Star className="w-4 h-4" />
          추천 메뉴
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedMenu(menu)}
          >
            <div className="aspect-video bg-gray-200">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold mb-1">{menu.name}</h3>
              <p className="text-orange-500 font-bold">
                {menu.price.toLocaleString()}원
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2">
        <button className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
          <Phone className="w-5 h-5" />
          식당에 주문
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 px-6 py-3 rounded-lg"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Modals */}
      {selectedMenu && (
        <OrderModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}
      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </div>
  );
};

export default FoodOrderPage;
