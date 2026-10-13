import React, { useState } from 'react';
import { 
  Compass, 
  Mountain, 
  Volume2, 
  FileText, 
  BookOpen, 
  Users, 
  Menu, 
  X,
  Layers
} from 'lucide-react';
import { getCurrentStudent } from '../utils/storage';

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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div
            onClick={onNavigateMap}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-900 flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-emerald-800 transition-colors">
              E
            </div>
            <div>
              <div className="text-base font-extrabold text-stone-900 tracking-tight leading-none group-hover:text-emerald-900 transition-colors">
                EMGIS LAB
              </div>
              <div className="text-[10px] text-stone-500 font-medium tracking-wide mt-0.5 uppercase">
                Phòng thí nghiệm văn hóa bản địa
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Clean Typography, No pill badges) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <button
              type="button"
              onClick={onNavigateMap}
              className={`transition-colors py-1 hover:text-stone-900 ${
                activeView === 'map' ? 'text-emerald-800 border-b-2 border-emerald-800' : ''
              }`}
            >
              Bản đồ 16 Trạm
            </button>

            <button
              type="button"
              onClick={() => onNavigateStation(1)}
              className={`transition-colors py-1 hover:text-stone-900 flex items-center gap-1 ${
                activeView === 'station' && activeStationId === 1
                  ? 'text-emerald-800 border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              Trạm 01: Chiêng Mường
            </button>

            <button
              type="button"
              onClick={onNavigateTamDao}
              className={`transition-colors py-1 hover:text-stone-900 flex items-center gap-1 ${
                activeView === 'tamdao' ? 'text-emerald-800 border-b-2 border-emerald-800' : ''
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-emerald-700" />
              Tam Đảo Climate Lab
            </button>

            <button
              type="button"
              onClick={onNavigateResearch}
              className={`transition-colors py-1 hover:text-stone-900 flex items-center gap-1 ${
                activeView === 'research' ? 'text-emerald-800 border-b-2 border-emerald-800' : ''
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              Nhật ký & Nghiên cứu
            </button>

            <button
              type="button"
              onClick={onOpenCultureModal}
              className="text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Cơ sở di sản & An toàn
            </button>
          </nav>

          {/* Right: Anonymous Student Code Display */}
          <div className="hidden sm:flex items-center gap-3">
            <div
              onClick={onNavigateResearch}
              className="flex items-center gap-1.5 text-xs bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded border border-stone-200 cursor-pointer transition-colors"
              title="Đổi mã học sinh trong Nhật ký & Nghiên cứu"
            >
              <Users className="w-3.5 h-3.5 text-emerald-800" />
              <span className="text-stone-500 font-sans">Mã HS:</span>
              <span className="font-mono font-bold text-stone-900">{currentStudent}</span>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-2 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              onNavigateMap();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-stone-50"
          >
            Bản đồ 16 Trạm
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigateStation(1);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-stone-50 text-amber-900 font-semibold flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" /> Trạm 01: Chiêng Mường (Âm học di sản)
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigateTamDao();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-stone-50 text-emerald-900 font-semibold flex items-center gap-2"
          >
            <Mountain className="w-4 h-4" /> Tam Đảo Climate Lab
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigateResearch();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-stone-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Nhật ký & Bảng nghiên cứu
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenCultureModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded hover:bg-stone-50 text-stone-600 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Cơ sở di sản & An toàn
          </button>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 px-3">
            <span>Học sinh: <strong className="font-mono text-emerald-900">{currentStudent}</strong></span>
          </div>
        </div>
      )}
    </header>
  );
};
