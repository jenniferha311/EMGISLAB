import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface GongInteractiveGraphicProps {
  onStrike: (zone: 'ron' | 'than' | 'vanh') => void;
  isVibrating: boolean;
  selectedZone: 'ron' | 'than' | 'vanh';
  malletType: 'soft' | 'hard';
}

export const GongInteractiveGraphic: React.FC<GongInteractiveGraphicProps> = ({
  onStrike,
  isVibrating,
  selectedZone,
  malletType,
}) => {
  const [hoveredZone, setHoveredZone] = useState<'ron' | 'than' | 'vanh' | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#1F2D27] rounded-2xl border border-[#D6AA55]/30 shadow-md">
      <div className="flex items-center justify-between w-full mb-3 text-xs text-[#FAF7F0]/80">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6AA55] font-bold">
          Tương tác gõ Chiêng (Chạm vào từng vùng)
        </span>
        <span className="text-[#FAF7F0] font-semibold flex items-center gap-1.5 bg-[#174C3C] px-2.5 py-1 rounded-lg border border-[#D6AA55]/40 text-xs">
          <Volume2 className="w-3.5 h-3.5 text-[#D6AA55]" />
          {malletType === 'soft' ? 'Dùi bọc vải mềm' : 'Dùi gỗ trần'}
        </span>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none cursor-pointer my-1">
        {/* Animated vibration rings */}
        {isVibrating && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-[#D6AA55] animate-ping pointer-events-none opacity-60" />
            <div className="absolute inset-6 rounded-full border-2 border-[#A94438] animate-pulse pointer-events-none opacity-40" />
          </>
        )}

        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-2xl transition-transform active:scale-95 duration-100"
          role="img"
          aria-label="Hình họa chiêng Mường tương tác"
        >
          <defs>
            {/* Bronze texture gradients */}
            <radialGradient id="bronzeOuter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8c6239" />
              <stop offset="65%" stopColor="#543d2b" />
              <stop offset="90%" stopColor="#3d2c1e" />
              <stop offset="100%" stopColor="#251a12" />
            </radialGradient>

            <radialGradient id="bronzeMid" cx="45%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#b3874d" />
              <stop offset="70%" stopColor="#7a552b" />
              <stop offset="100%" stopColor="#4a331a" />
            </radialGradient>

            <radialGradient id="bronzeBoss" cx="40%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#f3c27e" />
              <stop offset="50%" stopColor="#c59146" />
              <stop offset="85%" stopColor="#7c5520" />
              <stop offset="100%" stopColor="#3d260c" />
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Vành ngoài (Rim & Flange) */}
          <circle
            cx="150"
            cy="150"
            r="142"
            fill="url(#bronzeOuter)"
            stroke={hoveredZone === 'vanh' || selectedZone === 'vanh' ? '#D6AA55' : '#3d2c1e'}
            strokeWidth={hoveredZone === 'vanh' ? '4' : '2.5'}
            className="transition-all cursor-pointer"
            onClick={() => onStrike('vanh')}
            onMouseEnter={() => setHoveredZone('vanh')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* Vành gờ họa tiết vân búa đồng */}
          <circle
            cx="150"
            cy="150"
            r="128"
            fill="none"
            stroke="#D6AA55"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="pointer-events-none opacity-40"
          />

          {/* Thân chiêng (Body / Mid section) */}
          <circle
            cx="150"
            cy="150"
            r="105"
            fill="url(#bronzeMid)"
            stroke={hoveredZone === 'than' || selectedZone === 'than' ? '#174C3C' : '#4a331a'}
            strokeWidth={hoveredZone === 'than' ? '4' : '2'}
            className="transition-all cursor-pointer"
            onClick={() => onStrike('than')}
            onMouseEnter={() => setHoveredZone('than')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* Vòng chấm hạt cúc truyền thống trên thân */}
          <circle
            cx="150"
            cy="150"
            r="82"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            className="pointer-events-none opacity-50"
          />

          {/* Rốn chiêng (Central Boss - nhô cao) */}
          <circle
            cx="150"
            cy="150"
            r="52"
            fill="url(#bronzeBoss)"
            stroke={hoveredZone === 'ron' || selectedZone === 'ron' ? '#A94438' : '#593a17'}
            strokeWidth={hoveredZone === 'ron' ? '4' : '2.5'}
            filter={isVibrating ? 'url(#glow)' : undefined}
            className="transition-all cursor-pointer"
            onClick={() => onStrike('ron')}
            onMouseEnter={() => setHoveredZone('ron')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* Điểm tâm rốn */}
          <circle cx="150" cy="150" r="10" fill="#fde68a" opacity="0.7" className="pointer-events-none" />

          {/* Text labels inside SVG */}
          <text
            x="150"
            y="154"
            textAnchor="middle"
            fill="#301f0c"
            fontSize="11"
            fontWeight="bold"
            fontFamily="'Be Vietnam Pro', sans-serif"
            className="pointer-events-none select-none"
          >
            RỐN
          </text>
        </svg>

        {/* Hover indicator tooltip */}
        <div className="absolute bottom-2 bg-[#174C3C]/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-[#FAF7F0] border border-[#D6AA55]/50 pointer-events-none shadow-sm text-center">
          {hoveredZone === 'ron' && 'Rốn chiêng: Kích thích Mode 1 cơ bản, âm trầm sâu lắng'}
          {hoveredZone === 'than' && 'Thân chiêng: Mode 2 & 3 uốn thân, âm rền lan tỏa'}
          {hoveredZone === 'vanh' && 'Vành chiêng: Kích thích họa âm cao > 600Hz đanh sắc'}
          {!hoveredZone && 'Chạm vào Rốn, Thân hoặc Vành để phát âm tổng hợp'}
        </div>
      </div>

      {/* Strike selector quick buttons with 44px min-height */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4">
        <button
          type="button"
          onClick={() => onStrike('ron')}
          className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${
            selectedZone === 'ron'
              ? 'bg-[#A94438] text-white border-[#A94438] shadow-xs'
              : 'bg-[#174C3C]/60 text-[#FAF7F0] border-[#E8E2D5]/20 hover:bg-[#174C3C]'
          }`}
        >
          Rốn chiêng (Trầm)
        </button>
        <button
          type="button"
          onClick={() => onStrike('than')}
          className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${
            selectedZone === 'than'
              ? 'bg-[#174C3C] text-white border-[#D6AA55] shadow-xs'
              : 'bg-[#174C3C]/60 text-[#FAF7F0] border-[#E8E2D5]/20 hover:bg-[#174C3C]'
          }`}
        >
          Thân chiêng (Lan tỏa)
        </button>
        <button
          type="button"
          onClick={() => onStrike('vanh')}
          className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${
            selectedZone === 'vanh'
              ? 'bg-[#D6AA55] text-[#20332D] border-[#D6AA55] shadow-xs font-extrabold'
              : 'bg-[#174C3C]/60 text-[#FAF7F0] border-[#E8E2D5]/20 hover:bg-[#174C3C]'
          }`}
        >
          Vành chiêng (Đanh)
        </button>
      </div>
    </div>
  );
};
