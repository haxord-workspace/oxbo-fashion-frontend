// src/components/layout/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout, selectCurrentUser, selectIsAuthenticated } from "../../features/auth/authSlice";
import { selectCartCount, selectIsCartOpen } from "../../features/cart/cartSlice";
import { toggleCart } from "../../features/ui/uiSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-900">
          Oxbo Fashion
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
            Products
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Button */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative p-2 text-gray-600 hover:text-gray-900"
            aria-label="Open cart"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                Orders
              </Link>
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
