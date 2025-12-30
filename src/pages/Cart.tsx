import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCart, updateCartQuantity, removeFromCart } from '../store/cartSlice';
import Toast from '../components/Toast';

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items, loading } = useAppSelector((state) => state.cart);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  const handleQuantityChange = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    await dispatch(updateCartQuantity({ cartItemId, quantity: newQuantity }));
  };

  const handleRemove = async (cartItemId: string) => {
    await dispatch(removeFromCart(cartItemId));
    setToastMessage('Item removed from cart');
    setShowToast(true);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Your cart is empty</h2>
          <p className="text-stone-600 mb-6">Add some premium vegan bags to get started!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-900 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex gap-6">
                    <img
                      src={item.product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80'}
                      alt={item.product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-stone-800">{item.product.name}</h3>
                          <p className="text-sm text-stone-600">{item.product.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-sm text-stone-600 mb-4">{item.product.material_type}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-stone-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-stone-800 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= item.product.stock_count}
                            className="w-8 h-8 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-stone-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="text-xl font-bold text-stone-800">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="font-serif text-xl font-bold text-stone-800 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-stone-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {subtotal > 0 && subtotal < 100 && (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-stone-800 text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 border border-stone-300 text-stone-700 py-3 rounded-lg hover:bg-stone-50 transition-colors font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
