import React from 'react';
import { X } from 'lucide-react';

interface CartDrawerProps {
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">메뉴 결정 요청</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              바뀐 수요
            </label>
            <div className="text-sm text-gray-600">
              시분식 연구사 대화내역 (2)
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              전화번호
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              근재 수요
            </label>
            <div className="text-sm text-gray-600">
              키는 외교 마키방 소리다
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold">
            지금하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
