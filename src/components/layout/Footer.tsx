import React from 'react';
import { Link } from 'react-router';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-6 pb-4 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 md:gap-4 mb-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 text-sm text-gray-700">
          <div className="space-y-1">
            <p>Kerala, India</p>
            <p>oxbostore@gmail.com</p>
          </div>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/oxbo_mens_store?igsh=MTN5bHhka3RsOGE3MA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@Oxbofashion/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <path d="m10 15 5-3-5-3z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/share/187BQwuuRT/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Middle Column */}
        <div className="flex flex-col gap-6 md:w-1/3 md:ml-12">
          <h3 className="uppercase tracking-wider font-medium text-primary text-base">Quick Links</h3>
          <ul className="flex flex-col gap-4 text-sm text-gray-700">
            <li><Link to="/contact" className="hover:underline hover:text-primary transition-colors">Contact us</Link></li>
            <li><Link to="/orders" className="hover:underline hover:text-primary transition-colors"> orders</Link></li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 md:w-1/3">
          <h3 className="uppercase tracking-wider font-medium text-primary text-base">Policies</h3>
          <ul className="flex flex-col gap-4 text-sm text-gray-700">
            <li><Link to="/terms" className="hover:underline hover:text-primary transition-colors">Terms & Condition</Link></li>
            <li><Link to="/privacy" className="hover:underline hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/shipping" className="hover:underline hover:text-primary transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-4 text-xs text-gray-700 mt-auto">
        <p>&copy; 2026, <Link to="/" className="hover:underline uppercase text-primary font-medium">oxbo</Link></p>
      </div>
    </footer>
  );
};

export default Footer;
