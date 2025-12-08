import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface OrderModalProps {
  menu: MenuItem;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ menu, onClose }) => {
  const [activeTab, setActiveTab] = useState<'메뉴 관리' | '메뉴 정보'>('메뉴 관리');
  const [items, setItems] = useState([
    { id: '1', name: '치킨 세트', price: 18000 },
    { id: '2', name: '피자', price: 22000 },
    { id: '3', name: '햄버거 세트', price: 8000 },
    { id: '4', name: '파전만', price: 7000 },
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">보증된 식당</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('메뉴 관리')}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                activeTab === '메뉴 관리'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              메뉴 관리
            </button>
            <button
              onClick={() => setActiveTab('메뉴 정보')}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                activeTab === '메뉴 정보'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              메뉴 정보
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === '메뉴 관리' ? (
            <>
              <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                새 메뉴 추가
              </button>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                  >
                    <img
                      src={menu.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-orange-500 font-bold">
                        {item.price.toLocaleString()}원
                      </p>
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  세부 주기
                </label>
                <input
                  type="text"
                  placeholder="매뉴"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  치킨 세트
                </label>
                <input
                  type="text"
                  placeholder="치킨"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">가격</label>
                <input
                  type="text"
                  placeholder="14200"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  이미지 URL (선택사항)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full p-3 border rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold"
          >
            취소
          </button>
          <button className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold">
            추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
