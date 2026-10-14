import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Compass, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  X,
  Award,
  BookOpen
} from 'lucide-react';
import { getVisitedStations, getCompletedStations } from '../utils/storage';
import { STATIONS_DATA } from '../data/stationsData';

interface HeaderProgressIndicatorProps {
  onNavigateStation: (id: number) => void;
  onNavigateMap: () => void;
  compactOnly?: boolean;
}

export const HeaderProgressIndicator: React.FC<HeaderProgressIndicatorProps> = ({
  onNavigateStation,
  onNavigateMap,
  compactOnly = false,
}) => {
  const [visitedStations, setVisitedStations] = useState<number[]>(() => getVisitedStations());
  const [completedStations, setCompletedStations] = useState<number[]>(() => getCompletedStations());
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state with storage and custom event
  useEffect(() => {
    const handleProgressUpdate = () => {
      setVisitedStations(getVisitedStations());
      setCompletedStations(getCompletedStations());
    };

    window.addEventListener('emgis_progress_updated', handleProgressUpdate);
    window.addEventListener('storage', handleProgressUpdate);

    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgressUpdate);
      window.removeEventListener('storage', handleProgressUpdate);
    };
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPopoverOpen) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopoverOpen]);

  const totalStations = 16;
  const visitedCount = visitedStations.length;
  const completedCount = completedStations.length;
  const visitedPercent = Math.min(100, Math.round((visitedCount / totalStations) * 100));
  const completedPercent = Math.min(100, Math.round((completedCount / totalStations) * 100));

  // Circular progress calculations for compact indicator
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (visitedPercent / 100) * circumference;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* COMPACT VIEW (Visible on mobile / small headers) */}
      <div className={compactOnly ? 'block' : 'sm:hidden'}>
        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 flex items-center gap-2 bg-white hover:bg-[#EBF2EE] border border-[#E8E2D5] hover:border-[#174C3C]/40 rounded-xl transition-all shadow-2xs active:scale-98"
          aria-label={`Tiến độ: đã ghé thăm ${visitedCount} trên 16 trạm. Nhấn để mở chi tiết.`}
          aria-expanded={isPopoverOpen}
        >
          {/* Mini circular progress indicator */}
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="stroke-[#E8E2D5]"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="stroke-[#174C3C] transition-all duration-500 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute text-[9px] font-bold font-mono text-[#174C3C]">
              {visitedCount}
            </span>
          </div>

          <div className="text-left text-[11px] leading-tight pr-0.5">
            <span className="font-bold text-[#174C3C]">{visitedCount}</span>
            <span className="text-[#556D65]">/16</span>
          </div>
        </button>
      </div>

      {/* FULL DESKTOP VIEW (Visible on sm and larger screens) */}
      {!compactOnly && (
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`min-h-[44px] flex items-center gap-3 px-3.5 py-1.5 rounded-xl border transition-all text-xs shadow-2xs group ${
              isPopoverOpen
                ? 'bg-[#EBF2EE] border-[#174C3C] ring-2 ring-[#174C3C]/20'
                : 'bg-white hover:bg-[#EBF2EE] border-[#E8E2D5] hover:border-[#174C3C]/40'
            }`}
            aria-label={`Tiến độ học tập: ${visitedCount} trên 16 trạm đã ghé thăm. Nhấn để xem danh sách trạm.`}
            aria-expanded={isPopoverOpen}
          >
            {/* Visual Icon Badge */}
            <div className="w-7 h-7 rounded-lg bg-[#EBF2EE] group-hover:bg-[#174C3C] group-hover:text-white text-[#174C3C] flex items-center justify-center transition-colors shrink-0">
              {completedCount === totalStations ? (
                <Award className="w-4 h-4 text-[#D6AA55]" />
              ) : (
                <Compass className="w-4 h-4" />
              )}
            </div>

            {/* Label and Progress Bar */}
            <div className="text-left">
              <div className="flex items-center justify-between gap-2 leading-tight">
                <span className="text-[10px] font-semibold text-[#556D65] uppercase tracking-wide">
                  Tiến độ trạm
                </span>
                <span className="font-mono text-[11px] font-bold text-[#174C3C]">
                  {visitedCount}<span className="text-[#8A9E96]">/16</span>
                </span>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-24 lg:w-28 h-2 bg-[#E8E2D5] rounded-full overflow-hidden mt-1 relative">
                <div
                  className="h-full bg-gradient-to-r from-[#174C3C] via-[#205E4C] to-[#D6AA55] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${visitedPercent}%` }}
                />
              </div>
            </div>

            <ChevronDown 
              className={`w-3.5 h-3.5 text-[#556D65] transition-transform duration-200 ${
                isPopoverOpen ? 'rotate-180 text-[#174C3C]' : 'group-hover:translate-y-0.5'
              }`} 
            />
          </button>
        </div>
      )}

      {/* DETAILED PROGRESS POPOVER MODAL */}
      {isPopoverOpen && (
        <div 
          className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-[#E8E2D5] rounded-2xl shadow-xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#20332D]"
          role="dialog"
          aria-label="Chi tiết tiến độ học tập 16 trạm STEM"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D6AA55]" />
                Tiến độ 16 Trạm STEM
              </div>
              <h3 className="text-base font-bold text-[#174C3C] mt-0.5">
                Không gian Thực nghiệm EMGIS
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="p-1.5 text-[#556D65] hover:text-[#174C3C] hover:bg-[#FAF7F0] rounded-lg transition-colors"
              aria-label="Đóng bảng tiến độ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics: Visited vs Completed */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5]">
              <div className="text-[11px] font-medium text-[#556D65]">Đã ghé thăm</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold font-mono text-[#174C3C]">
                  {visitedCount}
                </span>
                <span className="text-xs text-[#556D65] font-medium">/16 trạm</span>
              </div>
              <div className="text-[10px] text-[#174C3C] font-semibold mt-1">
                {visitedPercent}% lộ trình
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5]">
              <div className="text-[11px] font-medium text-[#556D65]">Đã lưu nhật ký</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold font-mono text-[#A94438]">
                  {completedCount}
                </span>
                <span className="text-xs text-[#556D65] font-medium">/16 trạm</span>
              </div>
              <div className="text-[10px] text-[#A94438] font-semibold mt-1">
                {completedPercent}% hoàn thành
              </div>
            </div>
          </div>

          {/* Large Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#556D65]">
              <span>Mức độ trải nghiệm tổng thể</span>
              <span className="font-mono font-bold text-[#174C3C]">{visitedPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#174C3C] via-[#205E4C] to-[#D6AA55] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${visitedPercent}%` }}
              />
            </div>
          </div>

          {/* 16-Station Interactive Matrix */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#20332D]">Ma trận 16 trạm:</span>
              <div className="flex items-center gap-3 text-[10px] text-[#556D65]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#174C3C]" /> Đã ghé thăm
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D6AA55]" /> Đã ghi nhận
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
              {STATIONS_DATA.map((st) => {
                const isVisited = visitedStations.includes(st.id);
                const isCompleted = completedStations.includes(st.id);

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onNavigateStation(st.id);
                      setIsPopoverOpen(false);
                    }}
                    title={`Trạm ${st.numberStr}: ${st.title} (${
                      isCompleted ? 'Đã hoàn thành' : isVisited ? 'Đã ghé thăm' : 'Chưa khám phá'
                    })`}
                    className={`min-h-[36px] flex flex-col items-center justify-center rounded-lg text-xs font-mono font-bold transition-all border relative ${
                      isCompleted
                        ? 'bg-[#174C3C] text-white border-[#D6AA55] shadow-2xs hover:scale-105'
                        : isVisited
                        ? 'bg-[#EBF2EE] text-[#174C3C] border-[#174C3C]/40 hover:bg-[#D5E6DC]'
                        : 'bg-[#FAF7F0] text-[#8A9E96] border-[#E8E2D5] hover:border-[#174C3C]/50 hover:text-[#20332D]'
                    }`}
                  >
                    <span>{st.numberStr}</span>
                    {isCompleted ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6AA55] mt-0.5" />
                    ) : isVisited ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#174C3C] mt-0.5" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onNavigateMap();
                setIsPopoverOpen(false);
              }}
              className="text-xs font-bold text-[#174C3C] hover:text-[#A94438] flex items-center gap-1.5 transition-colors p-1"
            >
              Mở bản đồ 16 trạm <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] text-[#556D65]">
              {visitedCount === totalStations
                ? 'Đã mở khóa toàn bộ 16 trạm!'
                : `Còn ${totalStations - visitedCount} trạm chưa khám phá`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
