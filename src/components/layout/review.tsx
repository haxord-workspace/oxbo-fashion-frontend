import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Star, BadgeCheck, Loader2 } from 'lucide-react';
import { userReviewsApi } from '../../services/user/reviews.Api';

const Reviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;
  
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLocalPagination, setIsLocalPagination] = useState<boolean>(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data: any = await userReviewsApi.getAllReviews({ page: currentPage, limit: itemsPerPage });
        
        let fetchedReviews = [];
        let total = 0;
        if (Array.isArray(data)) {
          fetchedReviews = data;
          total = data.length;
        } else if (data?.data?.reviews && Array.isArray(data.data.reviews)) {
          fetchedReviews = data.data.reviews;
          total = data.data.total || data.data.totalCount || data.data.reviews.length;
        } else if (data?.reviews && Array.isArray(data.reviews)) {
          fetchedReviews = data.reviews;
          total = data.total || data.totalCount || data.reviews.length;
        } else if (data?.data && Array.isArray(data.data)) {
          fetchedReviews = data.data;
          total = data.total || data.totalCount || data.data.length;
        }

        if (fetchedReviews.length > itemsPerPage && currentPage === 1) {
          // Backend did not paginate. We need to do it locally.
          setReviews(fetchedReviews);
          setTotalItems(fetchedReviews.length);
          setIsLocalPagination(true);
        } else if (fetchedReviews.length <= itemsPerPage && currentPage === 1) {
           // Either backend paginated or total is small
           setReviews(fetchedReviews);
           setTotalItems(total || fetchedReviews.length);
           setIsLocalPagination(false);
        } else {
           // Current page > 1, backend paginated
           setReviews(fetchedReviews);
           // If backend doesn't provide total, we assume there is more if we got limit items
           setTotalItems(total || (currentPage - 1) * itemsPerPage + fetchedReviews.length + (fetchedReviews.length === itemsPerPage ? 1 : 0));
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (isLocalPagination && reviews.length > 0) return;
    
    fetchReviews();
  }, [currentPage, isLocalPagination, reviews.length]);

  const displayedReviews = isLocalPagination 
    ? reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) 
    : reviews;

  // Determine if there is a next page based on total items
  let hasNext = false;
  if (isLocalPagination) {
    hasNext = currentPage * itemsPerPage < totalItems;
  } else {
    // If we have a total from backend, use it. Otherwise guess based on if we received full page
    if (totalItems > currentPage * itemsPerPage) {
      hasNext = true;
    } else if (totalItems === 0 && reviews.length === itemsPerPage) {
      hasNext = true;
    }
  }
  
  const hasPrev = currentPage > 1;

  const handleNext = () => {
    if (hasNext) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (hasPrev) setCurrentPage(prev => prev - 1);
  };

  return (
    <section className="w-full bg-white  pb-2 sm:py-16">
      <h2 className="text-center text-lg sm:text-xl font-oswald uppercase tracking-widest mb-6 text-primary">
        Reviews
      </h2>
      
      {/* Outer Wrapper for positioning arrows outside */}
      <div className="relative max-w-7xl mx-auto px-12 min-h-[350px] flex items-center justify-center">
        
        {loading && (
          <div className="flex flex-col items-center justify-center text-gray-500 w-full">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading reviews...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center text-red-500 w-full">
            <p>Failed to load reviews. Please try again later.</p>
          </div>
        )}

        {!loading && !error && displayedReviews.length === 0 && (
          <div className="flex items-center justify-center text-gray-500 w-full">
            <p>No reviews available</p>
          </div>
        )}

        {!loading && !error && displayedReviews.length > 0 && (
          <>
            {/* Left Arrow */}
            {hasPrev && (
              <button 
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:opacity-70 transition-opacity"
              >
                <ChevronLeft size={36} strokeWidth={1.5} />
              </button>
            )}

            {/* Carousel Container */}
            <div 
              className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar pb-4 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayedReviews.map((review, idx) => {
                const reviewerName = review.userId?.firstName 
                  ? `${review.userId.firstName} ${review.userId.lastName || ''}`.trim() 
                  : review.user?.name || review.user?.firstName || review.reviewerName || review.author || 'Anonymous';
                
                const reviewComment = review.review || review.comment || review.text || '';
                const reviewRating = review.rating || 5;
                const productName = review.productId?.name || review.product?.name || review.productName || review.product || '';
                const displayImage = (review.images && review.images.length > 0) 
                  ? review.images[0] 
                  : review.productId?.thumbnail || review.userId?.image || review.user?.image || review.user?.avatar || review.reviewerImage || review.image || '/images/model1.png';

                const productId = review.productId?._id || review.productId?.id || review.productId;

                return (
                  <div 
                    key={review._id || review.id || idx} 
                    onClick={() => {
                      if (productId) {
                        navigate(`/products/${productId}`);
                      }
                    }}
                    className={`w-[85%] sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] flex-shrink-0 flex flex-col rounded-b-[8px] overflow-hidden snap-center ${productId ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="h-[350px] w-full bg-gray-100 relative">
                      <img 
                        src={displayImage} 
                        alt="Review Image" 
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/model1.png'; }}
                      />
                    </div>

                    {/* Review Content */}
                    <div className="bg-[#e9e9e9] p-6 flex flex-col items-center text-center flex-1">
                      <p className="text-[13px] leading-tight text-gray-800 mb-5 h-[40px] flex items-center justify-center line-clamp-3">
                        {reviewComment}
                      </p>
                      
                      <div className="flex gap-1 mb-5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={i < reviewRating ? "fill-primary text-primary" : "text-primary"} 
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1 font-bold text-primary mb-2 text-sm">
                        {reviewerName}
                        <BadgeCheck size={16} className="fill-primary text-[#e9e9e9]" />
                      </div>

                      {productName && (
                        <div className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mt-1 truncate w-full">
                          {productName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Arrow */}
            {hasNext && (
              <button 
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:opacity-70 transition-opacity"
              >
                <ChevronRight size={36} strokeWidth={1.5} />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Reviews;

