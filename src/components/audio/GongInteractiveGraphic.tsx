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
    <div className="flex flex-col items-center justify-center p-4 bg-stone-900 rounded-lg border border-stone-800 shadow-md">
      <div className="flex items-center justify-between w-full mb-2 text-xs text-stone-400">
        <span className="font-mono">TƯƠNG TÁC GÕ CHIÊNG (Bấm trực tiếp vào vùng gõ)</span>
        <span className="text-amber-400 font-medium flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5" />
          {malletType === 'soft' ? 'Dùi bọc vải mềm' : 'Dùi gỗ trần'}
        </span>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none cursor-pointer">
        {/* Animated vibration rings */}
        {isVibrating && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-emerald-400/30 animate-pulse pointer-events-none" />
          </>
        )}

        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-2xl transition-transform active:scale-95 duration-100"
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

            {/* Pattern highlight */}
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
            stroke={hoveredZone === 'vanh' || selectedZone === 'vanh' ? '#f59e0b' : '#3d2c1e'}
            strokeWidth={hoveredZone === 'vanh' ? '4' : '2'}
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
            stroke="#6b4c2b"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="pointer-events-none opacity-60"
          />

          {/* Thân chiêng (Body / Mid section) */}
          <circle
            cx="150"
            cy="150"
            r="105"
            fill="url(#bronzeMid)"
            stroke={hoveredZone === 'than' || selectedZone === 'than' ? '#10b981' : '#4a331a'}
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
            stroke="#9c723f"
            strokeWidth="2"
            strokeDasharray="2 8"
            className="pointer-events-none opacity-80"
          />

          {/* Rốn chiêng (Central Boss - nhô cao) */}
          <circle
            cx="150"
            cy="150"
            r="52"
            fill="url(#bronzeBoss)"
            stroke={hoveredZone === 'ron' || selectedZone === 'ron' ? '#ef4444' : '#593a17'}
            strokeWidth={hoveredZone === 'ron' ? '4' : '2.5'}
            filter={isVibrating ? 'url(#glow)' : undefined}
            className="transition-all cursor-pointer"
            onClick={() => onStrike('ron')}
            onMouseEnter={() => setHoveredZone('ron')}
            onMouseLeave={() => setHoveredZone(null)}
          />

          {/* Điểm tâm rốn */}
          <circle cx="150" cy="150" r="10" fill="#fde68a" opacity="0.6" className="pointer-events-none" />

          {/* Text labels inside SVG */}
          <text
            x="150"
            y="154"
            textAnchor="middle"
            fill="#301f0c"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
            className="pointer-events-none select-none"
          >
            RỐN
          </text>
        </svg>

        {/* Hover indicator tooltip */}
        <div className="absolute bottom-2 bg-stone-950/80 backdrop-blur px-2.5 py-1 rounded text-[11px] text-amber-200 border border-stone-700 pointer-events-none">
          {hoveredZone === 'ron' && 'Rốn chiêng: Kích thích Mode 1 cơ bản, âm trầm sâu'}
          {hoveredZone === 'than' && 'Thân chiêng: Mode 2 & 3 uốn thân, âm lan tỏa'}
          {hoveredZone === 'vanh' && 'Vành chiêng: Kích thích họa âm cao > 600Hz, đanh sắc'}
          {!hoveredZone && 'Bấm vào Rốn, Thân hoặc Vành để gõ phát âm'}
        </div>
      </div>

      {/* Strike selector quick buttons */}
      <div className="grid grid-cols-3 gap-2 w-full mt-3">
        <button
          type="button"
          onClick={() => onStrike('ron')}
          className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors ${
            selectedZone === 'ron'
              ? 'bg-amber-900/60 text-amber-200 border-amber-600'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
          }`}
        >
          Rốn chiêng (Trầm)
        </button>
        <button
          type="button"
          onClick={() => onStrike('than')}
          className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors ${
            selectedZone === 'than'
              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
          }`}
        >
          Thân chiêng (Lan tỏa)
        </button>
        <button
          type="button"
          onClick={() => onStrike('vanh')}
          className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors ${
            selectedZone === 'vanh'
              ? 'bg-red-900/60 text-red-200 border-red-600'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
          }`}
        >
          Vành chiêng (Đanh)
        </button>
      </div>
    </div>
  );
};
