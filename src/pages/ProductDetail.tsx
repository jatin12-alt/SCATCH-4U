import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { Leaf, Heart, Share2, ChevronRight } from 'lucide-react';
import Toast from '../components/Toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Tote' | 'Backpack' | 'Clutches';
  material_type: string;
  stock_count: number;
  image_url: string | null;
  is_vegan: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items.length]);

  const product = items.find((p) => p.id === id);
  const relatedProducts = product
    ? items.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    if (product.stock_count < quantity) {
      setToastMessage('Not enough stock available');
      setShowToast(true);
      return;
    }

    await dispatch(addToCart({ userId: user.id, productId: product.id, quantity }));
    setToastMessage('Added to cart');
    setShowToast(true);
    setQuantity(1);
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-green-700 hover:text-green-800 font-medium"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-8 font-medium"
        >
          <span>Products</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-400">{product.name}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium shadow-lg">
                <Leaf className="w-4 h-4" />
                100% Vegan
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {product.category}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {product.material_type}
                    </span>
                  </div>
                </div>
                <button className="p-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">
                  <Heart className="w-6 h-6 text-stone-800" />
                </button>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <p className="text-5xl font-bold text-stone-800 mb-2">${product.price}</p>
              <p className="text-stone-600 text-sm">
                {product.stock_count > 0 ? (
                  <span className="text-green-700 font-medium">{product.stock_count} in stock</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of stock</span>
                )}
              </p>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <p className="text-lg font-serif font-bold text-stone-800 mb-4">Description</p>
              <p className="text-stone-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-50 p-4 rounded-xl">
                  <p className="text-xs text-stone-600 mb-1">Material</p>
                  <p className="font-bold text-stone-800">{product.material_type}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl">
                  <p className="text-xs text-stone-600 mb-1">Category</p>
                  <p className="font-bold text-stone-800">{product.category}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-stone-800 font-medium">Quantity:</label>
                <div className="flex items-center gap-3 bg-stone-100 rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-stone-200 rounded transition-colors"
                    disabled={product.stock_count === 0}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-stone-200 rounded transition-colors"
                    disabled={product.stock_count === 0 || quantity >= product.stock_count}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_count === 0}
                  className="flex-1 bg-stone-800 text-white px-6 py-4 rounded-lg hover:bg-stone-900 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button className="px-6 py-4 border-2 border-stone-800 text-stone-800 rounded-lg hover:bg-stone-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-stone-200 pt-12">
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
                >
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={relatedProduct.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-stone-800">{relatedProduct.name}</h3>
                    <p className="text-2xl font-bold text-stone-800">${relatedProduct.price}</p>
                    <p className="text-xs text-stone-500">{relatedProduct.stock_count} in stock</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
}
