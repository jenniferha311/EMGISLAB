import React, { useState } from 'react';
import { Mountain, ArrowRight, CheckCircle2, Compass, Filter, Sparkles } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { STEMDomain } from '../types';
import { getCompletedStations } from '../utils/storage';
import { MuongPatternBorder } from './MuongPatternBorder';

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
    <div className="space-y-8">
      {/* Featured Banner: Tam Đảo Climate Lab (Special Interconnected Lab) */}
      <div
        onClick={onSelectTamDaoLab}
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 cursor-pointer transition-all border shadow-xs group ${
          isTamDaoActive
            ? 'bg-[#174C3C] text-white border-[#D6AA55] ring-2 ring-[#D6AA55]/50'
            : 'bg-gradient-to-br from-[#174C3C] via-[#1E4337] to-[#11382C] text-white border-[#174C3C]/80 hover:border-[#D6AA55] hover:shadow-md'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTamDaoLab(); }}
        aria-label="Mở chuyên đề Tam Đảo Climate Lab"
      >
        {/* Subtle decorative Muong geometric corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6AA55]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Unboxed inline metadata */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D6AA55]">
              <span className="uppercase tracking-wider">Chuyên đề đặc biệt</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FAF7F0]/80">Liên kết Trạm 03 · Trạm 10 · Trạm 16</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5 leading-snug">
              <div className="w-9 h-9 rounded-xl bg-[#D6AA55]/20 border border-[#D6AA55]/40 flex items-center justify-center shrink-0">
                <Mountain className="w-5 h-5 text-[#D6AA55]" />
              </div>
              TAM ĐẢO CLIMATE LAB
            </h2>

            <p className="text-sm sm:text-base text-[#FAF7F0]/85 leading-relaxed">
              Mô phỏng vi khí hậu vùng núi: Quy luật nhiệt độ theo độ cao, sườn đón gió và gió Phơn khô nóng, mưa địa hình và kiến trúc nhà sàn thích ứng thiên tai.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <span className="min-h-[44px] px-5 py-2.5 bg-[#FAF7F0] text-[#174C3C] text-xs font-bold rounded-xl flex items-center gap-2 group-hover:bg-[#D6AA55] group-hover:text-[#20332D] transition-colors shadow-xs">
              Mở chuyên đề nghiên cứu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Subtle decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={4} />
        </div>
      </div>

      {/* Domain Filters (Segmented Filter Bar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-[#20332D] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#174C3C]" />
            <span>Phân loại trạm theo lĩnh vực STEM:</span>
          </div>

          <div className="text-xs text-[#556D65]">
            Hiển thị <strong>{filteredStations.length}</strong> / 16 trạm
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center overflow-x-auto gap-1.5 p-1.5 bg-white rounded-xl border border-[#E8E2D5] shadow-2xs">
          {domainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDomain(tab.id)}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedDomain === tab.id
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'text-[#556D65] hover:text-[#20332D] hover:bg-[#FAF7F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stations Grid (16 Interactive Stations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStations.map((station) => {
          const isCompleted = completedStations.includes(station.id);
          const isSelected = activeStationId === station.id && !isTamDaoActive;

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectStation(station.id); }}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer bg-white group ${
                isSelected
                  ? 'border-[#174C3C] ring-2 ring-[#174C3C]/20 shadow-md'
                  : 'border-[#E8E2D5] hover:border-[#174C3C] hover:shadow-sm'
              }`}
            >
              <div className="space-y-2.5">
                {/* Typographic Metadata (Clean, zero-pill discipline) */}
                <div className="flex items-center justify-between text-xs text-[#556D65] border-b border-[#FAF7F0] pb-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-[#174C3C]">TRẠM {station.numberStr}</span>
                    <span aria-hidden="true" className="text-[#D6AA55]">·</span>
                    <span className="text-[11px] font-sans font-medium text-[#556D65] truncate max-w-[130px]">
                      {station.stemDomainLabel}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="text-[#174C3C] font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#174C3C]" />
                      Đã ghi
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-[#20332D] text-base leading-snug group-hover:text-[#174C3C] transition-colors">
                  {station.title}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-[#556D65] leading-relaxed line-clamp-2">
                  {station.subtitle}
                </p>

                {/* Key formula preview */}
                {station.keyFormula && (
                  <div className="font-mono text-[11px] bg-[#FAF7F0] px-2.5 py-1.5 rounded-lg border border-[#E8E2D5] text-[#20332D] truncate">
                    {station.keyFormula}
                  </div>
                )}
              </div>

              {/* Card Footer: Heritage context & CTA */}
              <div className="pt-3.5 mt-3.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs">
                <span className="truncate max-w-[170px] text-[11px] text-[#556D65]" title={station.culturalHeritage}>
                  {station.culturalHeritage}
                </span>
                <span className="font-bold text-xs text-[#174C3C] flex items-center gap-1 group-hover:text-[#A94438] transition-colors">
                  Vào trạm <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
