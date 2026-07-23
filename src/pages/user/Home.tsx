import React from 'react';
import Reviews from '../../components/layout/review';
import ProductGrid from '../../components/layout/ProductGrid';
import ShopByCategory from '../../components/layout/ShopByCategory';
import BannerDisplay from '../../components/layout/BannerDisplay';

const Home: React.FC = () => {
  return (
    <div className="w-full flex flex-col bg-white overflow-hidden">
      
      <BannerDisplay position="Home-Top" />

      {/* Hero Section */}
      <section className="w-full">
        <BannerDisplay position="Carousel" className="!mb-0" />
      </section>

      {/* Shop By Category Section */}
      <ShopByCategory />

      {/* Offer Banner Section */}
      <BannerDisplay position="Home-Middle" />

      {/* Product Grid Section */}
      <ProductGrid />

      {/* Reviews Section */}
      <Reviews />

    </div>
  );
};

export default Home;
