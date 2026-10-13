import React, { useState } from 'react';
import { Mountain, ArrowRight, CheckCircle2, Compass, Sparkles, Filter } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { STEMDomain } from '../types';
import { getCompletedStations } from '../utils/storage';

interface StationsMapGridProps {
  onSelectStation: (id: number) => void;
  onSelectTamDaoLab: () => void;
  activeStationId?: number | null;
  isTamDaoActive?: boolean;
}

export const StationsMapGrid: React.FC<StationsMapGridProps> = ({
  onSelectStation,
  onSelectTamDaoLab,
  activeStationId,
  isTamDaoActive,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<STEMDomain | 'all'>('all');
  const completedStations = getCompletedStations();

  const domainTabs: { id: STEMDomain | 'all'; label: string }[] = [
    { id: 'all', label: 'Tất cả (16 Trạm)' },
    { id: 'acoustics', label: 'Âm học & Sóng' },
    { id: 'mathematics', label: 'Toán & Hình học' },
    { id: 'mechanics', label: 'Cơ học & Kết cấu' },
    { id: 'thermodynamics', label: 'Nhiệt & Năng lượng' },
    { id: 'optics', label: 'Quang học & Màu sắc' },
    { id: 'environment', label: 'Môi trường & Địa chất' },
    { id: 'biology', label: 'Sinh học & Dữ liệu' },
  ];

  const filteredStations = STATIONS_DATA.filter((s) =>
    selectedDomain === 'all' ? true : s.stemDomain === selectedDomain
  );

  return (
    <div className="space-y-6">
      {/* Featured Banner: Tam Đảo Climate Lab */}
      <div
        onClick={onSelectTamDaoLab}
        className={`relative overflow-hidden rounded-lg p-5 sm:p-6 cursor-pointer transition-all border shadow-xs ${
          isTamDaoActive
            ? 'bg-gradient-to-r from-emerald-900 to-stone-900 text-white border-emerald-500 ring-2 ring-emerald-500/50'
            : 'bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white border-emerald-900/60 hover:border-emerald-600'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="font-bold tracking-wider uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                CHUYÊN ĐỀ ĐẶC BIỆT
              </span>
              <span>·</span>
              <span>LIÊN KẾT TRẠM 03, 10 & 16</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Mountain className="w-6 h-6 text-emerald-400 shrink-0" />
              TAM ĐẢO CLIMATE LAB – PHÒNG THÍ NGHIỆM KHÍ HẬU VÙNG NÚI
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Khám phá quy luật suy giảm nhiệt độ theo độ cao, sườn đón gió vs khuất gió (Hiệu ứng Phơn), mưa địa hình và bài toán kiến trúc nhà thích ứng trước thiên tai miền núi.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded transition-colors shadow-xs">
              Mở chuyên đề Tam Đảo <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Domain Filters (Segmented Filter Bar) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Lọc theo lĩnh vực STEM:</span>
        </div>

        <div className="flex items-center overflow-x-auto gap-1 bg-stone-100 p-1 rounded-md border border-stone-200">
          {domainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDomain(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedDomain === tab.id
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stations Grid (16 Interactive Stations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStations.map((station) => {
          const isCompleted = completedStations.includes(station.id);
          const isSelected = activeStationId === station.id && !isTamDaoActive;

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className={`flex flex-col justify-between p-4 rounded-lg border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                  : 'border-stone-200 hover:border-emerald-600 hover:shadow-xs'
              }`}
            >
              <div className="space-y-2">
                {/* Typographic Metadata (Zero-pill discipline) */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-emerald-800">TRẠM {station.numberStr}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] text-stone-600 truncate max-w-[120px]">
                      {station.stemDomainLabel}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã đo
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-stone-900 text-sm leading-snug tracking-tight">
                  {station.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {station.subtitle}
                </p>

                {/* Key formula preview */}
                {station.keyFormula && (
                  <div className="font-mono text-[11px] bg-stone-50 p-1.5 rounded border border-stone-100 text-stone-600 truncate">
                    {station.keyFormula}
                  </div>
                )}
              </div>

              {/* Card Footer: Heritage origin */}
              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate max-w-[170px]">{station.culturalHeritage}</span>
                <span className="text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Vào trạm →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
