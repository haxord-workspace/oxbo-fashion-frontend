import React from 'react';
import Reviews from '../../components/layout/review';
import ProductGrid from '../../components/layout/ProductGrid';
import ShopByCategory from '../../components/layout/ShopByCategory';
import BannerDisplay from '../../components/layout/BannerDisplay';

const Home: React.FC = () => {
  return (
    <div className="w-full flex flex-col bg-white overflow-hidden">
      <BannerDisplay position="Home-Top" className="!mb-1 sm:!mb-4" />

      {/* Hero Section */}
      <section className="w-full">
        <BannerDisplay position="Carousel" className="!mb-0" />
      </section>

      {/* Shop By Category Section */}
      <ShopByCategory />

      {/* Offer Banner Section */}
      <BannerDisplay position="Home-Middle" />

      {/* Product Grid Section */}
      <div className="w-full pt-2 md:pt-6 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
            <span className="text-primary"> Featured Products</span>
          </h2>
        </div>
      </div>
      <ProductGrid pageSize={8} showPagination={false} className="!pt-0 md:!pt-4" />

      {/* Reviews Section */}
      <Reviews />

    </div>
  );
};

export default Home;
