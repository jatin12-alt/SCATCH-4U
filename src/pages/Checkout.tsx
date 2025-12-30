import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CreditCard, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createOrder } from '../store/ordersSlice';
import { clearCart } from '../store/cartSlice';

type Step = 'shipping' | 'summary' | 'confirmation';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    if (items.length === 0 && currentStep !== 'confirmation') {
      navigate('/cart');
    }
  }, [items, currentStep, navigate]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('summary');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const cartItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const result = await dispatch(createOrder({ userId: user.id, cartItems, shippingInfo }));

      if (createOrder.fulfilled.match(result)) {
        setOrderId(result.payload.id);
        await dispatch(clearCart(user.id));
        setCurrentStep('confirmation');
      }
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-700" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Order Placed!</h1>
          <p className="text-stone-600 mb-6">
            Thank you for your order. Your premium vegan bags will be delivered soon.
          </p>
          <div className="bg-stone-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-stone-600 mb-1">Order ID</p>
            <p className="font-mono text-sm text-stone-800">{orderId}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 ${
                currentStep === 'shipping' ? 'text-stone-800' : 'text-stone-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'shipping' ? 'bg-stone-800 text-white' : 'bg-stone-200'
                }`}
              >
                1
              </div>
              <span className="font-medium hidden sm:inline">Shipping</span>
            </div>

            <div className="w-12 h-0.5 bg-stone-300"></div>

            <div
              className={`flex items-center gap-2 ${
                currentStep === 'summary' ? 'text-stone-800' : 'text-stone-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'summary' ? 'bg-stone-800 text-white' : 'bg-stone-200'
                }`}
              >
                2
              </div>
              <span className="font-medium hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-6 h-6 text-stone-700" />
                  <h2 className="text-xl font-serif font-bold text-stone-800">Shipping Information</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 transition-colors font-medium"
                  >
                    Continue to Review
                  </button>
                </form>
              </div>
            )}

            {currentStep === 'summary' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-serif font-bold text-stone-800 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-stone-800">{item.product.name}</h3>
                          <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                          <p className="font-bold text-stone-800">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-serif font-bold text-stone-800 mb-4">Shipping Address</h2>
                  <div className="text-stone-700 space-y-1">
                    <p className="font-medium">{shippingInfo.name}</p>
                    <p>{shippingInfo.address}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.postalCode}
                    </p>
                    <p>{shippingInfo.phone}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="mt-4 text-sm text-stone-600 hover:text-stone-800 underline"
                  >
                    Edit Address
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-6 h-6 text-stone-700" />
                    <h2 className="text-xl font-serif font-bold text-stone-800">Payment Method</h2>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-stone-800 font-medium">Cash on Delivery (COD)</p>
                    <p className="text-sm text-stone-600 mt-1">Pay when your order arrives</p>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-stone-800 text-white py-4 rounded-lg hover:bg-stone-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            )}
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
                <div className="border-t pt-3 flex justify-between font-bold text-stone-800 text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
