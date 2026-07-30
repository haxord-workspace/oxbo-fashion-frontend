import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-4 mb-16">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 text-sm text-gray-700">
          <div className="space-y-1">
            <p>Kerala, India</p>
            <p>oxbo@gmail.com</p>
          </div>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/oxbo_mens_store?igsh=MTN5bHhka3RsOGE3MA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="https://youtube.com/@oxbofashion?si=mOqnQEPZ39xk5ZBF" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <path d="m10 15 5-3-5-3z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.85 6.35 9.17-.09-.79-.17-2.01.03-2.88l1.19-5.07s-.3-.61-.3-1.52c0-1.42.82-2.48 1.85-2.48.87 0 1.29.65 1.29 1.43 0 .87-.55 2.18-.84 3.39-.24 1.01.51 1.83 1.51 1.83 1.81 0 3.2-1.91 3.2-4.66 0-2.43-1.75-4.13-4.25-4.13-2.89 0-4.59 2.17-4.59 4.41 0 .87.34 1.81.75 2.32.08.1.09.19.07.28l-.24 1c-.03.14-.11.16-.25.1-1.39-.64-2.25-2.65-2.25-4.26 0-3.47 2.52-6.65 7.27-6.65 3.82 0 6.78 2.72 6.78 6.35 0 3.8-2.39 6.85-5.71 6.85-1.12 0-2.17-.58-2.53-1.27l-.69 2.62c-.25.96-.92 2.16-1.38 2.9C10.45 23.85 11.21 24 12 24c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
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

      <div className="max-w-7xl mx-auto pt-6 text-xs text-gray-700 mt-auto">
        <p>&copy; 2026, <Link to="/" className="hover:underline uppercase text-primary font-medium">oxbo</Link></p>
      </div>
    </footer>
  );
};

export default Footer;
