import React, { useEffect } from 'react';

const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 mb-8 font-medium">Last Updated: June 30, 2026</p>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <p>
              OXBO Fashion operates this store and website, including all related information, content, features, tools, products, and services, to provide you, the customer, with a seamless shopping experience (the "Services"). OXBO Fashion is powered by Shopify, which enables us to provide the Services to you.
            </p>
            <p>
              This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using our Services, or otherwise communicate with us.
            </p>
            <p>
              If there is any conflict between our Terms of Service and this Privacy Policy, this Privacy Policy will govern with respect to the collection, processing, and disclosure of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Personal Information We Collect or Process</h2>
            <p>
              When we use the term "personal information," we refer to information that identifies or can reasonably be linked to you. Personal information does not include anonymous or de-identified information.
            </p>
            <p>Depending on how you interact with our Services, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Contact details such as your name, shipping address, billing address, phone number, and email address.</li>
              <li>Payment information including payment method and transaction details.</li>
              <li>Account information including username, password, preferences, and settings.</li>
              <li>Order history, wishlist, cart items, purchases, returns, and exchanges.</li>
              <li>Customer support communications.</li>
              <li>Device information including browser type, IP address, operating system, and device identifiers.</li>
              <li>Usage information about how you interact with our website and Services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Personal Information Sources</h2>
            <p>We may collect your information:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Directly from you when you create an account, place an order, or contact us.</li>
              <li>Automatically through cookies and similar technologies.</li>
              <li>From our service providers who assist us in operating our business.</li>
              <li>From our business partners and third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Personal Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Process and fulfill your orders.</li>
              <li>Deliver products and services.</li>
              <li>Process payments and refunds.</li>
              <li>Manage your account.</li>
              <li>Improve our website and Services.</li>
              <li>Recommend products based on your interests.</li>
              <li>Send order updates and important account notifications.</li>
              <li>Provide customer support.</li>
              <li>Detect and prevent fraud.</li>
              <li>Comply with legal obligations.</li>
              <li>Send promotional offers and marketing communications (where permitted).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How We Share Your Personal Information</h2>
            <p>We may share your personal information with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Shopify and trusted service providers.</li>
              <li>Payment gateways.</li>
              <li>Shipping and logistics partners.</li>
              <li>Marketing and advertising partners.</li>
              <li>Government authorities where required by law.</li>
              <li>Business affiliates during mergers or business transfers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Shopify</h2>
            <p>Our Services are hosted by Shopify.</p>
            <p>
              Information submitted through our website may be processed by Shopify to operate and improve the Services. Shopify may also process information according to its own Privacy Policy.
            </p>
            <p>For more information, please visit Shopify's Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Third-Party Websites</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Children's Privacy</h2>
            <p>
              Our Services are not intended for children. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Security and Data Retention</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the internet or electronic storage is completely secure.
            </p>
            <p className="mt-2">We retain your personal information only as long as necessary to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Provide our Services.</li>
              <li>Maintain your account.</li>
              <li>Comply with legal obligations.</li>
              <li>Resolve disputes.</li>
              <li>Enforce our agreements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Right to access your personal information.</li>
              <li>Right to request deletion.</li>
              <li>Right to correct inaccurate information.</li>
              <li>Right to data portability.</li>
              <li>Right to opt out of marketing communications.</li>
            </ul>
            <p className="mt-2">To exercise these rights, please contact us using the details provided below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Complaints</h2>
            <p>
              If you have concerns regarding how we process your personal information, please contact us first. Depending on your location, you may also have the right to lodge a complaint with the relevant data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">International Transfers</h2>
            <p>
              Your personal information may be transferred to and processed in countries outside your country of residence where necessary for providing our Services.
            </p>
            <p>Where required by law, appropriate safeguards will be implemented for such transfers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our business practices, legal requirements, or operational needs.
            </p>
            <p>Any updates will be posted on this page together with the revised Last Updated date.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, your personal information, or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="font-bold text-lg mb-2">OXBO Fashion</p>
              <p className="mb-1"><strong>Website:</strong> <a href="https://oxbofashion.in/" className="text-primary hover:underline">https://oxbofashion.in/</a></p>
              <p className="mb-1"><strong>Phone:</strong> +91 6282-856050</p>
              <p className="mb-3"><strong>Email:</strong> <a href="mailto:oxbostore@gmail.com" className="text-primary hover:underline">oxbostore@gmail.com</a></p>
              <p>
                <strong>Registered Address:</strong><br />
                KPPAN Trade Center,<br />
                Palakkad Road,<br />
                Melepattambi,<br />
                District Palakkad,<br />
                Kerala, India.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
