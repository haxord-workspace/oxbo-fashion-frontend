import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectWishlistItems, removeFromWishlistAsync, clearWishlist, fetchWishlist } from '../../features/wishlist/wishlistSlice';
import { addToCartAsync } from '../../features/cart/cartSlice';
import { toggleCart } from '../../features/ui/uiSlice';

const Wishlist: React.FC = () => {
  const wishlistItems = useAppSelector(selectWishlistItems);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchWishlist())
      .unwrap()
      .then((data) => console.log("fetchWishlist success:", data))
      .catch((err) => console.error("fetchWishlist failed:", err));
  }, [dispatch]);

  const handleMoveToCart = (item: any) => {
    dispatch(addToCartAsync({
      product: {
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
        description: item.description
      },
      quantity: 1,
      variantId: item.variantId || item.id || item._id // Use actual variantId if available
    }));
    dispatch(removeFromWishlistAsync(item.id || item._id));
    dispatch(toggleCart());
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto bg-white min-h-[70vh]">
      <div className="text-xs text-gray-500 py-4 px-4 sm:px-8 border-b border-gray-100 flex gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-primary uppercase">Wishlist</span>
      </div>

      <div className="px-4 sm:px-8 py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">

          {wishlistItems.length > 0 && (
            <button
              onClick={() => dispatch(clearWishlist())}
              className="text-sm text-gray-500 hover:text-primary underline"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-500 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love and buy them later.</p>
            <Link
              to="/"
              className="bg-primary text-white rounded-xl px-8 py-4 font-medium hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group relative flex flex-col border border-gray-100 pb-4">
                <Link to={`/products/${item.id}`} className="aspect-[3/4] bg-gray-100 relative overflow-hidden mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="px-4 flex-1 flex flex-col">
                  <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                  <Link to={`/products/${item.id}`} className="hover:underline">
                    <h3 className="font-bold uppercase tracking-wide text-sm mb-2">{item.name}</h3>
                  </Link>
                  <p className="text-[#e35a39] mb-4 mt-auto">Rs. {(item.price || 0).toLocaleString('en-IN')}.00</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 bg-primary text-white text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                      <ShoppingBag size={14} /> Move to Cart
                    </button>
                    <button
                      onClick={() => dispatch(removeFromWishlistAsync(item.id || (item as any)._id))}
                      className="w-10 flex items-center justify-center border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
