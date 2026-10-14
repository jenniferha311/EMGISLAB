import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Volume2, 
  FileText, 
  BookOpen, 
  Users, 
  Menu, 
  X,
  Compass
} from 'lucide-react';
import { getCurrentStudent } from '../utils/storage';
import { MuongPatternBorder } from './MuongPatternBorder';

interface NavbarProps {
  activeView: 'map' | 'station' | 'tamdao' | 'research';
  activeStationId: number;
  onNavigateMap: () => void;
  onNavigateStation: (id: number) => void;
  onNavigateTamDao: () => void;
  onNavigateResearch: () => void;
  onOpenCultureModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  activeStationId,
  onNavigateMap,
  onNavigateStation,
  onNavigateTamDao,
  onNavigateResearch,
  onOpenCultureModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const currentStudent = getCurrentStudent();

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs">
      {/* Subtle Muong Pattern decorative hair-line at very top */}
      <MuongPatternBorder variant="subtle" height={6} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Identity */}
          <button
            type="button"
            onClick={onNavigateMap}
            className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-[#174C3C] rounded-lg p-1 transition-transform active:scale-98"
            aria-label="Về trang chủ EMGIS LAB"
          >
            {/* Cultural Logo Emblem */}
            <div className="w-11 h-11 rounded-xl bg-[#174C3C] text-white flex items-center justify-center font-bold text-xl shadow-xs border-2 border-[#D6AA55]/50 relative overflow-hidden group">
              <span className="font-extrabold tracking-tighter text-[#FAF7F0] group-hover:scale-110 transition-transform">
                E
              </span>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#D6AA55] rotate-45" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-[#174C3C] tracking-tight leading-none">
                  EMGIS LAB
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A94438]" aria-hidden="true" />
              </div>
              <div className="text-[11px] font-semibold text-[#556D65] tracking-wide mt-0.5 uppercase">
                Văn hóa bản địa & Công nghệ số
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-[#556D65]" aria-label="Điều hướng chính">
            <button
              type="button"
              onClick={onNavigateMap}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                activeView === 'map'
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'hover:bg-[#EBF2EE] text-[#20332D]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Bản đồ 16 Trạm
            </button>

            <button
              type="button"
              onClick={() => onNavigateStation(1)}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                activeView === 'station' && activeStationId === 1
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'hover:bg-[#EBF2EE] text-[#20332D]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#D6AA55]" />
              Trạm 01: Chiêng Mường
            </button>

            <button
              type="button"
              onClick={onNavigateTamDao}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                activeView === 'tamdao'
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'hover:bg-[#EBF2EE] text-[#20332D]'
              }`}
            >
              <Mountain className="w-4 h-4 text-[#174C3C]" />
              Tam Đảo Climate Lab
            </button>

            <button
              type="button"
              onClick={onNavigateResearch}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 ${
                activeView === 'research'
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'hover:bg-[#EBF2EE] text-[#20332D]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Nhật ký & Báo cáo
            </button>

            <button
              type="button"
              onClick={onOpenCultureModal}
              className="min-h-[44px] px-3 py-2 text-xs font-medium text-[#556D65] hover:text-[#174C3C] hover:bg-[#EBF2EE] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A94438]" />
              Di sản & An toàn
            </button>
          </nav>

          {/* Right: Anonymous Student Code Display */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateResearch}
              className="min-h-[44px] flex items-center gap-2 text-xs bg-white hover:bg-[#EBF2EE] px-3 py-2 rounded-xl border border-[#E8E2D5] text-[#20332D] shadow-2xs transition-colors"
              title="Nhấn để mở Nhật ký và quản lý mã học sinh"
            >
              <div className="w-6 h-6 rounded-lg bg-[#EBF2EE] flex items-center justify-center text-[#174C3C]">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-[#556D65] uppercase font-semibold leading-tight">Mã học sinh</div>
                <div className="font-mono font-bold text-[#174C3C] leading-none">{currentStudent}</div>
              </div>
            </button>
          </div>

          {/* Mobile Hamburger Button (44px target) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#20332D] hover:bg-[#EBF2EE] rounded-xl transition-colors"
              aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#A94438]" /> : <Menu className="w-6 h-6 text-[#174C3C]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E2D5] px-4 pt-3 pb-5 space-y-2 text-base font-semibold shadow-md animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => {
              onNavigateMap();
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${
              activeView === 'map' ? 'bg-[#174C3C] text-white' : 'hover:bg-[#FAF7F0] text-[#20332D]'
            }`}
          >
            <Compass className="w-5 h-5" /> Bản đồ 16 Trạm STEM
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateStation(1);
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${
              activeView === 'station' && activeStationId === 1
                ? 'bg-[#174C3C] text-white'
                : 'hover:bg-[#FAF7F0] text-[#20332D]'
            }`}
          >
            <Volume2 className="w-5 h-5 text-[#D6AA55]" /> Trạm 01: Chiêng Mường (Âm học di sản)
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateTamDao();
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${
              activeView === 'tamdao' ? 'bg-[#174C3C] text-white' : 'hover:bg-[#FAF7F0] text-[#20332D]'
            }`}
          >
            <Mountain className="w-5 h-5 text-[#174C3C]" /> Tam Đảo Climate Lab
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateResearch();
              setMobileMenuOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${
              activeView === 'research' ? 'bg-[#174C3C] text-white' : 'hover:bg-[#FAF7F0] text-[#20332D]'
            }`}
          >
            <FileText className="w-5 h-5" /> Nhật ký khoa học & Rubric đánh giá
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenCultureModal();
              setMobileMenuOpen(false);
            }}
            className="w-full min-h-[48px] text-left px-4 py-2.5 rounded-xl hover:bg-[#FAF7F0] text-[#556D65] flex items-center gap-3 border-t border-[#E8E2D5] pt-3"
          >
            <BookOpen className="w-5 h-5 text-[#A94438]" /> Cơ sở di sản văn hóa & An toàn
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-[#556D65] px-2 bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8E2D5]">
            <span>Học sinh nghiên cứu:</span>
            <span className="font-mono font-bold text-[#174C3C]">{currentStudent}</span>
          </div>
        </div>
      )}
    </header>
  );
};
