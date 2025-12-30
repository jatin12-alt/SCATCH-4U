import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Leaf } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signOut } from '../../store/authSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await dispatch(signOut());
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf className="w-7 h-7 text-green-700 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-serif font-bold text-stone-800">SCATCH</span>
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="relative hover:text-stone-600 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {user.role === 'owner' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full">
                    <User className="w-4 h-4 text-stone-600" />
                    <span className="text-sm font-medium text-stone-700 hidden sm:inline">
                      {user.full_name || user.email}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="text-stone-600 hover:text-stone-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-stone-900 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
