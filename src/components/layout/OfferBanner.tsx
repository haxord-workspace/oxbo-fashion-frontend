import React from 'react';

const OfferBanner: React.FC = () => {
  return (
    <div className="w-full my-8">
      <svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <clipPath id="bannerClip">
            <rect width="900" height="300" rx="0"/>
          </clipPath>
        </defs>

        {/* Background */}
        <rect width="900" height="300" fill="#c8c4b7"/>
        <rect width="900" height="300" fill="#bfbcaf" opacity="0.3"/>

        {/* Gray Jeans (back) */}
        <g transform="translate(80, 20) rotate(-18, 130, 150)">
          <rect x="60" y="0" width="140" height="22" rx="4" fill="#9ea5ad"/>
          <rect x="75" y="-3" width="10" height="8" rx="2" fill="#8a9099"/>
          <rect x="155" y="-3" width="10" height="8" rx="2" fill="#8a9099"/>
          <rect x="115" y="-3" width="10" height="8" rx="2" fill="#8a9099"/>
          <circle cx="130" cy="10" r="4" fill="#7a8088"/>
          <path d="M60,20 L60,180 Q60,190 65,190 L115,190 Q120,190 122,185 L130,145 L138,185 Q140,190 145,190 L195,190 Q200,190 200,180 L200,20 Z" fill="#aab0b8"/>
          <line x1="130" y1="20" x2="130" y2="100" stroke="#9aa0a8" strokeWidth="1.5"/>
          <path d="M65,25 Q90,35 115,28" stroke="#9aa0a8" strokeWidth="1" fill="none"/>
          <path d="M145,28 Q170,35 195,25" stroke="#9aa0a8" strokeWidth="1" fill="none"/>
          <ellipse cx="88" cy="110" rx="22" ry="45" fill="#c8cdd4" opacity="0.5"/>
          <ellipse cx="172" cy="110" rx="22" ry="45" fill="#c8cdd4" opacity="0.45"/>
          <ellipse cx="88" cy="145" rx="18" ry="20" fill="#d0d5dc" opacity="0.4"/>
          <ellipse cx="172" cy="145" rx="18" ry="20" fill="#d0d5dc" opacity="0.35"/>
          <rect x="60" y="180" width="70" height="12" rx="2" fill="#9ea5ad"/>
          <rect x="130" y="180" width="70" height="12" rx="2" fill="#9ea5ad"/>
          <line x1="62" y1="185" x2="128" y2="185" stroke="#aab0b8" strokeWidth="0.8" strokeDasharray="4,3"/>
          <line x1="132" y1="185" x2="198" y2="185" stroke="#aab0b8" strokeWidth="0.8" strokeDasharray="4,3"/>
        </g>

        {/* Dark/Black Jeans (front) */}
        <g transform="translate(170, 35) rotate(-8, 130, 150)">
          <rect x="60" y="0" width="150" height="24" rx="4" fill="#2a2a2a"/>
          <rect x="75" y="-4" width="11" height="9" rx="2" fill="#222222"/>
          <rect x="160" y="-4" width="11" height="9" rx="2" fill="#222222"/>
          <rect x="118" y="-4" width="11" height="9" rx="2" fill="#222222"/>
          <circle cx="135" cy="11" r="5" fill="#111111"/>
          <circle cx="135" cy="11" r="2.5" fill="#3a3a3a"/>
          <path d="M60,22 L58,195 Q58,208 65,208 L118,208 Q124,208 126,202 L135,158 L144,202 Q146,208 152,208 L205,208 Q212,208 210,195 L208,22 Z" fill="#2d2d2d"/>
          <line x1="135" y1="22" x2="135" y2="110" stroke="#1a1a1a" strokeWidth="2"/>
          <path d="M65,28 Q95,40 120,30" stroke="#222" strokeWidth="1.2" fill="none"/>
          <path d="M150,30 Q175,40 205,28" stroke="#222" strokeWidth="1.2" fill="none"/>
          <ellipse cx="90" cy="120" rx="26" ry="55" fill="#555555" opacity="0.5"/>
          <ellipse cx="180" cy="120" rx="26" ry="55" fill="#555555" opacity="0.45"/>
          <ellipse cx="90" cy="155" rx="22" ry="25" fill="#6a6a6a" opacity="0.55"/>
          <ellipse cx="180" cy="155" rx="22" ry="25" fill="#6a6a6a" opacity="0.5"/>
          <ellipse cx="90" cy="95" rx="18" ry="30" fill="#4a4a4a" opacity="0.4"/>
          <ellipse cx="180" cy="95" rx="18" ry="30" fill="#4a4a4a" opacity="0.35"/>
          <line x1="62" y1="22" x2="208" y2="22" stroke="#3d3d3d" strokeWidth="1"/>
          <line x1="60" y1="22" x2="58" y2="195" stroke="#222" strokeWidth="1.5" strokeDasharray="5,4"/>
          <line x1="210" y1="22" x2="208" y2="195" stroke="#222" strokeWidth="1.5" strokeDasharray="5,4"/>
          <rect x="58" y="198" width="68" height="14" rx="2" fill="#252525"/>
          <rect x="142" y="198" width="68" height="14" rx="2" fill="#252525"/>
          <line x1="60" y1="204" x2="124" y2="204" stroke="#3a3a3a" strokeWidth="0.8" strokeDasharray="4,3"/>
          <line x1="144" y1="204" x2="208" y2="204" stroke="#3a3a3a" strokeWidth="0.8" strokeDasharray="4,3"/>
        </g>

        {/* Sale Text */}
        <text x="580" y="110" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" letterSpacing="6" fill="white" textAnchor="middle">UP TO</text>
        <text x="580" y="168" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="58" letterSpacing="2" fill="white" textAnchor="middle">₹300 OFF</text>
        <line x1="430" y1="185" x2="730" y2="185" stroke="white" strokeWidth="2.5"/>
        <text x="580" y="228" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="36" letterSpacing="5" fill="white" textAnchor="middle">FLASH SALE</text>
      </svg>
    </div>
  );
};

export default OfferBanner;