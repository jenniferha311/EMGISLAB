import React from 'react';

export const HeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-lg mx-auto flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 520 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="skyMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBF2EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FAF7F0" />
          </linearGradient>

          <linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8AA39B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#174C3C" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D5A4C" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#174C3C" stopOpacity="0.85" />
          </linearGradient>

          <radialGradient id="heroGong" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#F7DF94" />
            <stop offset="45%" stopColor="#D6AA55" />
            <stop offset="85%" stopColor="#8A6627" />
            <stop offset="100%" stopColor="#4A3411" />
          </radialGradient>

          <linearGradient id="stemGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D6AA55" />
            <stop offset="50%" stopColor="#A94438" />
            <stop offset="100%" stopColor="#174C3C" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft rounded background container */}
        <rect width="520" height="320" rx="20" fill="url(#skyMtn)" />

        {/* Distant Mountain Ridges (Dãy núi Tam Đảo / miền núi Tây Bắc) */}
        <path
          d="M0,210 Q90,140 180,185 T360,150 T520,180 L520,320 L0,320 Z"
          fill="url(#mtnFar)"
        />
        <path
          d="M0,235 Q110,180 230,225 T440,195 T520,220 L520,320 L0,320 Z"
          fill="url(#mtnMid)"
          opacity="0.3"
        />

        {/* Traditional Stilt House Roofline (Mái nhà sàn Mường dốc đứng) */}
        <g opacity="0.4" stroke="#174C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="60,240 110,195 160,240" fill="#E8E2D5" fillOpacity="0.3" />
          <line x1="80" y1="240" x2="80" y2="280" />
          <line x1="140" y1="240" x2="140" y2="280" />
          <line x1="70" y1="260" x2="150" y2="260" strokeWidth="1.5" />
          <line x1="110" y1="195" x2="110" y2="185" stroke="#D6AA55" strokeWidth="2.5" />
        </g>

        {/* Floating STEM Science & Acoustics Waves (Sóng âm và dữ liệu số) */}
        <path
          d="M170,165 Q220,120 270,165 T370,165 T470,165"
          fill="none"
          stroke="#D6AA55"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.8"
        />
        <path
          d="M200,185 Q250,145 300,185 T400,185 T490,185"
          fill="none"
          stroke="#A94438"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.7"
        />

        {/* Mathematical FFT & Coordinate Grid element */}
        <g transform="translate(320, 50)" opacity="0.85">
          <rect x="0" y="0" width="160" height="95" rx="12" fill="#FFFFFF" stroke="#E8E2D5" strokeWidth="1.5" />
          <line x1="15" y1="75" x2="145" y2="75" stroke="#174C3C" strokeWidth="1" />
          <line x1="15" y1="20" x2="15" y2="75" stroke="#174C3C" strokeWidth="1" />
          {/* FFT Spectrum bars */}
          <rect x="25" y="55" width="8" height="20" fill="#174C3C" rx="1" />
          <rect x="40" y="35" width="8" height="40" fill="#D6AA55" rx="1" />
          <rect x="55" y="45" width="8" height="30" fill="#A94438" rx="1" />
          <rect x="70" y="60" width="8" height="15" fill="#174C3C" rx="1" />
          <rect x="85" y="65" width="8" height="10" fill="#174C3C" opacity="0.6" rx="1" />
          <path d="M29,55 Q44,30 59,45 T89,65" fill="none" stroke="#A94438" strokeWidth="1.5" />
          <text x="100" y="40" fill="#20332D" fontSize="10" fontWeight="700" fontFamily="sans-serif">f₁: 218Hz</text>
          <text x="100" y="55" fill="#556D65" fontSize="8" fontFamily="monospace">Δf: 21.5Hz</text>
          <text x="100" y="68" fill="#174C3C" fontSize="8" fontWeight="600" fontFamily="sans-serif">Cồng chiêng</text>
        </g>

        {/* Chiêng Mường Vector (Traditional Bronze Gong) */}
        <g transform="translate(85, 95)">
          <circle cx="50" cy="50" r="46" fill="#174C3C" opacity="0.1" />
          <circle cx="50" cy="50" r="42" fill="url(#heroGong)" stroke="#8A6627" strokeWidth="2" filter="url(#softGlow)" />
          {/* Concentric rings & geometric dots on gong */}
          <circle cx="50" cy="50" r="32" fill="none" stroke="#F7DF94" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.8" />
          <circle cx="50" cy="50" r="22" fill="#9C772F" stroke="#F7DF94" strokeWidth="1" />
          {/* Boss (Rốn chiêng) */}
          <circle cx="50" cy="50" r="12" fill="#F7DF94" stroke="#4A3411" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3" fill="#D6AA55" />
        </g>

        {/* Central Character: Ethnic Minority Female Student Exploring STEM (Nữ sinh làm chủ công nghệ) */}
        <g transform="translate(195, 80)">
          {/* Subtle aura behind character */}
          <circle cx="65" cy="110" r="68" fill="#D6AA55" fillOpacity="0.15" />

          {/* Traditional headband / khăn đội đầu Mường đặc trưng với dải hoa văn thổ cẩm */}
          <path
            d="M48,64 Q65,58 82,64 L80,74 Q65,68 50,74 Z"
            fill="#FFFFFF"
            stroke="#174C3C"
            strokeWidth="1.2"
          />
          {/* Small geometric lozenges on headband */}
          <polygon points="56,69 59,66 62,69 59,72" fill="#A94438" />
          <polygon points="64,69 67,66 70,69 67,72" fill="#D6AA55" />
          <polygon points="72,69 75,66 78,69 75,72" fill="#A94438" />

          {/* Hair (Tóc tết gọn gàng, tự tin) */}
          <path
            d="M44,72 C42,50 54,42 65,42 C78,42 88,50 86,72 C86,85 82,90 82,92 C78,82 72,80 65,80 C58,80 52,82 48,92 C48,90 44,85 44,72 Z"
            fill="#20332D"
          />

          {/* Face (Gương mặt rạng rỡ, tập trung) */}
          <path
            d="M50,68 C50,68 50,88 65,92 C80,88 80,68 80,68 Z"
            fill="#FDEED9"
          />
          {/* Friendly expression */}
          <path d="M55,75 Q58,74 61,75" stroke="#20332D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M69,75 Q72,74 75,75" stroke="#20332D" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="58" cy="78" r="1.5" fill="#20332D" />
          <circle cx="72" cy="78" r="1.5" fill="#20332D" />
          <path d="M61,84 Q65,88 69,84" stroke="#A94438" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Traditional vest / áo ngắn Mường với cạp dệt thổ cẩm */}
          <path
            d="M40,105 L48,92 L82,92 L90,105 L96,155 L34,155 Z"
            fill="#174C3C"
          />
          {/* Inner shirt neckline */}
          <polygon points="58,92 65,110 72,92" fill="#FAF7F0" />
          {/* Subtle embroidered border on collar (Đường viền áo dệt) */}
          <line x1="58" y1="92" x2="65" y2="110" stroke="#D6AA55" strokeWidth="1.5" />
          <line x1="72" y1="92" x2="65" y2="110" stroke="#D6AA55" strokeWidth="1.5" />

          {/* Hands holding modern digital tablet (Làm chủ công nghệ) */}
          <rect
            x="36"
            y="132"
            width="58"
            height="38"
            rx="4"
            fill="#FFFFFF"
            stroke="#20332D"
            strokeWidth="2"
          />
          {/* Tablet screen showing interactive lab graphics */}
          <rect x="40" y="136" width="50" height="30" fill="#FAF7F0" />
          {/* Mini pulse wave on tablet */}
          <path
            d="M44,152 L50,152 L54,142 L58,160 L62,146 L66,155 L74,152 L86,152"
            fill="none"
            stroke="#174C3C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="58" cy="160" r="2" fill="#D6AA55" />
          <circle cx="62" cy="146" r="2" fill="#A94438" />

          {/* Student hands */}
          <ellipse cx="36" cy="150" rx="4.5" ry="5.5" fill="#FDEED9" stroke="#20332D" strokeWidth="1" />
          <ellipse cx="94" cy="150" rx="4.5" ry="5.5" fill="#FDEED9" stroke="#20332D" strokeWidth="1" />
        </g>

        {/* Small floating badges of scientific inquiry */}
        <g transform="translate(18, 220)">
          <rect x="0" y="0" width="130" height="34" rx="8" fill="#FFFFFF" stroke="#E8E2D5" strokeWidth="1.5" />
          <circle cx="18" cy="17" r="7" fill="#174C3C" />
          <path d="M15,17 L17,19 L21,15" stroke="#FAF7F0" strokeWidth="1.5" strokeLinecap="round" />
          <text x="32" y="15" fill="#20332D" fontSize="9" fontWeight="700">16 Trạm STEM số</text>
          <text x="32" y="26" fill="#556D65" fontSize="8">Thực nghiệm tương tác</text>
        </g>

        <g transform="translate(370, 220)">
          <rect x="0" y="0" width="134" height="34" rx="8" fill="#FFFFFF" stroke="#E8E2D5" strokeWidth="1.5" />
          <circle cx="18" cy="17" r="7" fill="#A94438" />
          <path d="M15,17 L21,17 M18,14 L18,20" stroke="#FAF7F0" strokeWidth="1.5" strokeLinecap="round" />
          <text x="32" y="15" fill="#20332D" fontSize="9" fontWeight="700">Khí hậu Tam Đảo</text>
          <text x="32" y="26" fill="#556D65" fontSize="8">Mô phỏng vi khí hậu</text>
        </g>
      </svg>
    </div>
  );
};
