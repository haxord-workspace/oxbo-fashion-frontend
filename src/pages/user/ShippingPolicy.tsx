import React, { useEffect } from 'react';

const ShippingPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 uppercase">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="font-medium text-lg">Thank you for shopping with OXBO Fashion!</p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">Delivery Timeframe</h2>
            <p>
              All orders are delivered within 10 working days from the date of order placement. Please note that Sundays and public holidays are not counted as working days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">Order Processing</h2>
            <p>
              Orders are processed on working days only. If your order is placed on a Sunday or public holiday, processing will begin on the next working day.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">Delays</h2>
            <p>
              While we strive to deliver within the stated timeframe, unforeseen circumstances such as extreme weather, courier delays, or high-demand periods may occasionally affect delivery times. We appreciate your patience in such cases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">Tracking Your Order</h2>
            <p>
              Once your order is dispatched, you will receive a confirmation with tracking details so you can monitor your shipment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wider">Questions?</h2>
            <p>
              If you have any concerns about your order or delivery, feel free to reach out to us—we're happy to help.
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 inline-block">
              <p className="mb-1"><strong>Email:</strong> <a href="mailto:oxbostore@gmail.com" className="text-primary hover:underline">oxbostore@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 97470 43736</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
