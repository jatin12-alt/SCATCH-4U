import { ShoppingCart, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/cartSlice';
import Toast from '../Toast';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  material_type: string;
  stock_count: number;
  image_url: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (product.stock_count === 0) {
      setToastMessage('Sorry, this item is out of stock');
      setShowToast(true);
      return;
    }

    await dispatch(addToCart({ userId: user.id, productId: product.id }));
    setToastMessage('Added to cart');
    setShowToast(true);
  };

  return (
    <>
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left w-full"
      >
        <div className="relative overflow-hidden h-64">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-green-700 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium shadow-lg">
            <Leaf className="w-3 h-3" />
            100% Vegan
          </div>
          {product.stock_count === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-1">{product.name}</h3>
            <p className="text-sm text-stone-600 line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded-md font-medium">
              {product.category}
            </span>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
              {product.material_type}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-stone-800">${product.price}</span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock_count === 0}
              className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Add to Cart</span>
            </button>
          </div>

          <p className="text-xs text-stone-500">{product.stock_count} in stock</p>
        </div>
      </button>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
