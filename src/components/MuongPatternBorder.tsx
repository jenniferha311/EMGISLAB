import React from 'react';

interface MuongPatternBorderProps {
  className?: string;
  variant?: 'subtle' | 'vibrant' | 'divider';
  height?: number;
}

export const MuongPatternBorder: React.FC<MuongPatternBorderProps> = ({
  className = '',
  variant = 'subtle',
  height = 8,
}) => {
  return (
    <div
      className={`w-full overflow-hidden flex items-center select-none pointer-events-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          <pattern
            id={`muong-pattern-${variant}`}
            width="48"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            {/* Background of the strip */}
            <rect width="48" height={height} fill="#FAF7F0" opacity={0.6} />

            {/* Top & bottom thin hairline guide */}
            <line x1="0" y1="0.5" x2="48" y2="0.5" stroke="#D6AA55" strokeWidth="0.75" opacity="0.6" />
            <line x1="0" y1={height - 0.5} x2="48" y2={height - 0.5} stroke="#174C3C" strokeWidth="0.75" opacity="0.6" />

            {/* Interlocking geometric lozenges (Quả trám) */}
            <polygon
              points={`12,${height * 0.5} 24,${height * 0.15} 36,${height * 0.5} 24,${height * 0.85}`}
              fill={variant === 'vibrant' ? '#174C3C' : '#174C3C'}
              opacity={variant === 'subtle' ? 0.75 : 0.9}
            />
            {/* Center diamond in lozenge */}
            <polygon
              points={`20,${height * 0.5} 24,${height * 0.3} 28,${height * 0.5} 24,${height * 0.7}`}
              fill="#D6AA55"
            />

            {/* Side triangles (sawtooth mountain pattern / răng cưa) */}
            <polygon
              points={`0,${height * 0.5} 6,${height * 0.15} 12,${height * 0.5} 6,${height * 0.85}`}
              fill="#A94438"
              opacity={0.85}
            />
            <polygon
              points={`36,${height * 0.5} 42,${height * 0.15} 48,${height * 0.5} 42,${height * 0.85}`}
              fill="#A94438"
              opacity={0.85}
            />

            {/* Small accent points */}
            <circle cx="6" cy={height * 0.5} r="1" fill="#FAF7F0" />
            <circle cx="24" cy={height * 0.5} r="1" fill="#FAF7F0" />
            <circle cx="42" cy={height * 0.5} r="1" fill="#FAF7F0" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#muong-pattern-${variant})`} />
      </svg>
    </div>
  );
};
