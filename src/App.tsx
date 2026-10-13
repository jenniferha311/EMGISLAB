import React, { useState } from 'react';
import { 
  Mountain, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StationsMapGrid } from './components/StationsMapGrid';
import { Station01ChiengMuong } from './labs/Station01ChiengMuong';
import { Station02ThoCam } from './labs/Station02ThoCam';
import { Station03NhaSan } from './labs/Station03NhaSan';
import { GenericStationLab } from './labs/GenericStationLab';
import { TamDaoClimateLab } from './labs/TamDaoClimateLab';
import { ResearchHub } from './research/ResearchHub';
import { ScientificCultureModal } from './components/ScientificCultureModal';
import { STATIONS_DATA } from './data/stationsData';

export default function App() {
  const [activeView, setActiveView] = useState<'map' | 'station' | 'tamdao' | 'research'>('map');
  const [activeStationId, setActiveStationId] = useState<number>(1);
  const [isCultureModalOpen, setIsCultureModalOpen] = useState<boolean>(false);

  const handleSelectStation = (id: number) => {
    setActiveStationId(id);
    setActiveView('station');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTamDao = () => {
    setActiveView('tamdao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStation = () => {
    if (activeStationId < 16) {
      setActiveStationId(activeStationId + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStation = () => {
    if (activeStationId > 1) {
      setActiveStationId(activeStationId - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        activeStationId={activeStationId}
        onNavigateMap={() => {
          setActiveView('map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateStation={(id) => handleSelectStation(id)}
        onNavigateTamDao={handleSelectTamDao}
        onNavigateResearch={() => {
          setActiveView('research');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCultureModal={() => setIsCultureModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: HOME & MAP GRID */}
        {activeView === 'map' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-stone-900 text-white rounded-lg p-6 sm:p-8 border border-stone-800 shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="font-bold tracking-wider uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    STEM SỐ & DI SẢN BẢN ĐỊA
                  </span>
                  <span>·</span>
                  <span>16 TRẠM THỰC NGHIỆM TƯƠNG TÁC</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  EMGIS LAB – PHÒNG THÍ NGHIỆM VĂN HÓA BẢN ĐỊA
                </h1>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  Khám phá khoa học từ di sản và đời sống. Trải nghiệm phòng thí nghiệm STEM số tương tác, kết nối kiến thức âm học, cơ học kết cấu, nhiệt động học, vi khí hậu núi đồi và toán học với tri thức bản địa.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStation(1)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    Khám phá Trạm 01: Chiêng Mường
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectTamDao}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold rounded flex items-center gap-2 transition-colors"
                  >
                    <Mountain className="w-4 h-4 text-emerald-400" />
                    Chuyên đề Tam Đảo Climate Lab
                  </button>
                </div>
              </div>
            </div>

            {/* Stations Map Grid */}
            <StationsMapGrid
              onSelectStation={handleSelectStation}
              onSelectTamDaoLab={handleSelectTamDao}
              activeStationId={activeStationId}
              isTamDaoActive={false}
            />
          </div>
        )}

        {/* VIEW 2: INDIVIDUAL STATION RUNNER */}
        {activeView === 'station' && (
          <div className="space-y-6">
            {/* Back to map & Station switcher bar */}
            <div className="flex items-center justify-between text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveView('map')}
                className="text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Trở về Bản đồ 16 Trạm
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStationId <= 1}
                  onClick={handlePrevStation}
                  className={`px-3 py-1.5 rounded border flex items-center gap-1 transition-colors ${
                    activeStationId <= 1
                      ? 'opacity-40 cursor-not-allowed border-stone-200 text-stone-400'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  ← Trạm trước
                </button>

                <select
                  value={activeStationId}
                  onChange={(e) => setActiveStationId(parseInt(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-stone-300 rounded font-bold text-emerald-900 text-xs"
                >
                  {STATIONS_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      Trạm {s.numberStr}: {s.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={activeStationId >= 16}
                  onClick={handleNextStation}
                  className={`px-3 py-1.5 rounded border flex items-center gap-1 transition-colors ${
                    activeStationId >= 16
                      ? 'opacity-40 cursor-not-allowed border-stone-200 text-stone-400'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Trạm sau →
                </button>
              </div>
            </div>

            {/* Render Station Component */}
            {activeStationId === 1 && <Station01ChiengMuong />}
            {activeStationId === 2 && <Station02ThoCam />}
            {activeStationId === 3 && <Station03NhaSan />}
            {activeStationId >= 4 && <GenericStationLab stationId={activeStationId} />}
          </div>
        )}

        {/* VIEW 3: TAM ĐẢO CLIMATE LAB */}
        {activeView === 'tamdao' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trở về Bản đồ 16 Trạm
            </button>
            <TamDaoClimateLab />
          </div>
        )}

        {/* VIEW 4: RESEARCH & JOURNAL HUB */}
        {activeView === 'research' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trở về Bản đồ 16 Trạm
            </button>
            <ResearchHub />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <div className="text-sm font-bold text-white tracking-tight">
                EMGIS LAB – PHÒNG THÍ NGHIỆM VĂN HÓA BẢN ĐỊA
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Khám phá khoa học từ di sản và đời sống. Phục vụ tất cả học sinh và người học.
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsCultureModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Cơ sở di sản & An toàn
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('research');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-stone-300 hover:text-white"
              >
                Nhật ký & Báo cáo
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
            <div>
              © 2026 EMGIS LAB. Ứng dụng công nghệ Web Audio API, Canvas & Toán mô phỏng số. Dữ liệu lưu cục bộ trên thiết bị của người học.
            </div>
            <div className="text-stone-400 font-mono">
              Phú Thọ · Hòa Bình · Tam Đảo
            </div>
          </div>
        </div>
      </footer>

      {/* Verification & Safety Modal */}
      <ScientificCultureModal
        isOpen={isCultureModalOpen}
        onClose={() => setIsCultureModalOpen(false)}
      />
    </div>
  );
}
