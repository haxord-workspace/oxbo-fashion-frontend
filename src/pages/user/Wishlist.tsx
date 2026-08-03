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
    <div className="w-full max-w-[1920px] mx-auto bg-white flex-1 flex flex-col">
      <div className="text-xs text-gray-500 py-4 px-4 sm:px-8 border-b border-gray-100 flex gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-primary uppercase">Wishlist</span>
      </div>

      <div className="px-4 sm:px-8 py-8 lg:py-12">
        

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group relative flex flex-col border border-gray-100 pb-2 sm:pb-4">
                <Link to={`/products/${item.id}`} className="aspect-[3/4] bg-gray-100 relative overflow-hidden mb-2 sm:mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="px-2 sm:px-4 flex-1 flex flex-col">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{item.category}</p>
                  <Link to={`/products/${item.id}`} className="hover:underline">
                    <h3 className="font-bold uppercase tracking-wide text-[11px] sm:text-sm mb-1 sm:mb-2 line-clamp-2">{item.name}</h3>
                  </Link>
                  <p className="text-[#e35a39] text-xs sm:text-base mb-2 sm:mb-4 mt-auto font-medium">Rs. {(item.price || 0).toLocaleString('en-IN')}</p>

                  <div className="flex gap-1 sm:gap-2 mt-auto">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 bg-primary text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-800 transition-colors"
                    >
                      <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Move to Cart</span><span className="sm:hidden">To Cart</span>
                    </button>
                    <button
                      onClick={() => dispatch(removeFromWishlistAsync(item.id || (item as any)._id))}
                      className="w-8 sm:w-10 flex items-center justify-center border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
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
