import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/ordersSlice';
import { supabase } from '../lib/supabase';
import { LogOut, Package, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_phone: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
      name: string;
      image_url: string | null;
    };
  }>;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: orders } = useAppSelector((state) => state.orders);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700';
      case 'shipped':
        return 'bg-purple-50 text-purple-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-stone-50 text-stone-700';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-stone-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-stone-800 text-stone-800'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-stone-800 text-stone-800'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && user && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">Account Information</h2>
                <div className="space-y-4">
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-stone-600" />
                      <span className="text-sm text-stone-600">Email Address</span>
                    </div>
                    <p className="font-medium text-stone-800">{user.email}</p>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-stone-600" />
                      <span className="text-sm text-stone-600">Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-stone-800">{orders.length}</p>
                  </div>

                  {orders.length > 0 && (
                    <>
                      <div className="bg-stone-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-stone-600" />
                          <span className="text-sm text-stone-600">Account Created</span>
                        </div>
                        <p className="font-medium text-stone-800">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="bg-stone-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-stone-600" />
                          <span className="text-sm text-stone-600">Last Shipping Address</span>
                        </div>
                        <p className="font-medium text-stone-800">{orders[0].shipping_name}</p>
                        <p className="text-stone-600">{orders[0].shipping_address}</p>
                        <p className="text-stone-600">
                          {orders[0].shipping_city}, {orders[0].shipping_postal_code}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-stone-600">
                          <Phone className="w-4 h-4" />
                          <span>{orders[0].shipping_phone}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                    <p className="text-stone-600 mb-4">No orders yet</p>
                    <button
                      onClick={() => navigate('/')}
                      className="text-green-700 hover:text-green-800 font-medium"
                    >
                      Start shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: Order) => (
                      <div key={order.id} className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-sm text-stone-600">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-stone-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mb-4 border-b border-stone-200 pb-4">
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&q=80'}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium text-stone-800">{item.product.name}</p>
                                    <p className="text-stone-600">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-medium text-stone-800">
                                  ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-stone-700">Shipping To:</p>
                          <p className="text-sm text-stone-600">{order.shipping_name}</p>
                          <p className="text-sm text-stone-600">{order.shipping_address}</p>
                          <p className="text-sm text-stone-600">
                            {order.shipping_city}, {order.shipping_postal_code}
                          </p>
                          <p className="text-sm text-stone-600">{order.shipping_phone}</p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-4">
                          <span className="text-stone-600">Total:</span>
                          <span className="text-xl font-bold text-stone-800">${order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
}
