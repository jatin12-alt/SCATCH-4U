import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../store/productsSlice';
import { fetchOrders, updateOrderStatus } from '../store/ordersSlice';
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
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const { items: orders } = useAppSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Tote' as 'Tote' | 'Backpack' | 'Clutches',
    material_type: '',
    stock_count: '',
    image_url: '',
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Tote',
      material_type: '',
      stock_count: '',
      image_url: '',
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      material_type: product.material_type,
      stock_count: product.stock_count.toString(),
      image_url: product.image_url || '',
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      material_type: formData.material_type,
      stock_count: parseInt(formData.stock_count),
      image_url: formData.image_url || null,
      is_vegan: true,
    };

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, updates: productData }));
        setToastMessage('Product updated successfully');
      } else {
        await dispatch(addProduct(productData));
        setToastMessage('Product added successfully');
      }
      setToastType('success');
      setShowToast(true);
      resetForm();
    } catch (error) {
      setToastMessage('Failed to save product');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(id));
        setToastMessage('Product deleted successfully');
        setToastType('success');
        setShowToast(true);
      } catch (error) {
        setToastMessage('Failed to delete product');
        setToastType('error');
        setShowToast(true);
      }
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    await dispatch(updateOrderStatus({ orderId, status: status as any }));
    setToastMessage('Order status updated');
    setToastType('success');
    setShowToast(true);
  };

  return (
    <>
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">Owner Dashboard</h1>

          <div className="bg-white rounded-xl shadow-md mb-8">
            <div className="border-b border-stone-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'border-b-2 border-stone-800 text-stone-800'
                      : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  Products
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
              {activeTab === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-stone-800">Manage Products</h2>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>

                  {showProductForm && (
                    <div className="bg-stone-50 rounded-lg p-6 mb-6">
                      <h3 className="font-medium text-stone-800 mb-4">
                        {editingProduct ? 'Edit Product' : 'New Product'}
                      </h3>
                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Stock Count</label>
                          <input
                            type="number"
                            value={formData.stock_count}
                            onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          >
                            <option value="Tote">Tote</option>
                            <option value="Backpack">Backpack</option>
                            <option value="Clutches">Clutches</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Material Type</label>
                          <input
                            type="text"
                            value={formData.material_type}
                            onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div className="col-span-2 flex gap-3">
                          <button
                            type="submit"
                            className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-900 transition-colors"
                          >
                            {editingProduct ? 'Update' : 'Create'}
                          </button>
                          <button
                            type="button"
                            onClick={resetForm}
                            className="border border-stone-300 px-6 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-200">
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Material</th>
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Price</th>
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-stone-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&q=80'}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <span className="font-medium text-stone-800">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{product.category}</td>
                            <td className="py-3 px-4 text-stone-600">{product.material_type}</td>
                            <td className="py-3 px-4 font-medium text-stone-800">${product.price}</td>
                            <td className="py-3 px-4 text-stone-600">{product.stock_count}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-stone-600 hover:text-stone-800"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">All Orders</h2>

                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-stone-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-sm text-stone-600">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-stone-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-3 py-1 border border-stone-300 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-stone-700">Customer: {order.shipping_name}</p>
                          <p className="text-sm text-stone-600">{order.shipping_address}</p>
                          <p className="text-sm text-stone-600">
                            {order.shipping_city}, {order.shipping_postal_code}
                          </p>
                          <p className="text-sm text-stone-600">{order.shipping_phone}</p>
                        </div>

                        <div className="border-t pt-4">
                          <div className="space-y-2 mb-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-stone-700">
                                  {item.product.name} x {item.quantity}
                                </span>
                                <span className="text-stone-800 font-medium">
                                  ${(item.price_at_purchase * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between font-bold text-stone-800 pt-2 border-t">
                            <span>Total</span>
                            <span>${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {orders.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                        <p className="text-stone-600">No orders yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </>
  );
}
