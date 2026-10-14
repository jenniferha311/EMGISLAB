import React, { useState, useEffect } from 'react';
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
  FileText,
  Compass,
  Cpu,
  GraduationCap
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
import { HeroIllustration } from './components/HeroIllustration';
import { MuongPatternBorder } from './components/MuongPatternBorder';
import { STATIONS_DATA } from './data/stationsData';
import { markStationVisited } from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<'map' | 'station' | 'tamdao' | 'research'>('map');
  const [activeStationId, setActiveStationId] = useState<number>(1);
  const [isCultureModalOpen, setIsCultureModalOpen] = useState<boolean>(false);

  // Mark station visited whenever user enters or changes active station
  useEffect(() => {
    if (activeView === 'station') {
      markStationVisited(activeStationId);
    }
  }, [activeView, activeStationId]);

  const handleSelectStation = (id: number) => {
    markStationVisited(id);
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
      const nextId = activeStationId + 1;
      markStationVisited(nextId);
      setActiveStationId(nextId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStation = () => {
    if (activeStationId > 1) {
      const prevId = activeStationId - 1;
      markStationVisited(prevId);
      setActiveStationId(prevId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#20332D] font-sans selection:bg-[#D6AA55]/30 selection:text-[#174C3C]">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: HOME & MAP GRID */}
        {activeView === 'map' && (
          <div className="space-y-10">
            {/* Hero Section: Văn hóa bản địa Mường kết hợp công nghệ số */}
            <section className="relative bg-white rounded-2xl border border-[#E8E2D5] p-6 sm:p-10 shadow-xs overflow-hidden">
              {/* Subtle top decorative border */}
              <div className="absolute top-0 left-0 right-0">
                <MuongPatternBorder variant="subtle" height={6} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                {/* Left: Inspiring Headline & Calls to Action (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#D6AA55]" aria-hidden="true" />
                    <span>Văn hóa bản địa Mường & Công nghệ số</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#174C3C] leading-[1.2]">
                    EMGIS LAB – PHÒNG THÍ NGHIỆM VĂN HÓA BẢN ĐỊA
                  </h1>

                  <p className="text-base sm:text-lg text-[#20332D]/90 leading-relaxed font-normal">
                    Khám phá khoa học từ di sản và đời sống. Phòng thí nghiệm số tương tác kết nối âm học cồng chiêng, toán học dệt thổ cẩm, kiến trúc nhà sàn vi khí hậu và thủy học dòng suối với tư duy khoa học hiện đại.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectStation(1)}
                      className="min-h-[48px] px-6 py-3 bg-[#174C3C] hover:bg-[#11382C] text-white text-sm font-bold rounded-xl flex items-center gap-2.5 transition-all shadow-xs active:scale-98"
                    >
                      <Volume2 className="w-4 h-4 text-[#D6AA55]" />
                      Khám phá Trạm 01: Chiêng Mường
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectTamDao}
                      className="min-h-[48px] px-5 py-3 bg-white hover:bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 text-sm font-bold rounded-xl flex items-center gap-2 transition-all active:scale-98"
                    >
                      <Mountain className="w-4 h-4 text-[#174C3C]" />
                      Tam Đảo Climate Lab
                    </button>
                  </div>

                  {/* Highlights Bar */}
                  <div className="pt-4 border-t border-[#E8E2D5] grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[#174C3C] text-base font-mono">16</div>
                      <div className="text-[#556D65] font-medium">Trạm thí nghiệm số</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[#A94438] text-base font-mono">100%</div>
                      <div className="text-[#556D65] font-medium">Web Audio & Vật lý thật</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-[#D6AA55] text-base font-mono">0-3</div>
                      <div className="text-[#556D65] font-medium">Rubric quan sát STEM</div>
                    </div>
                  </div>
                </div>

                {/* Right: Modern Vector Illustration (5 cols) */}
                <div className="lg:col-span-5 flex justify-center">
                  <HeroIllustration className="w-full max-w-md" />
                </div>
              </div>
            </section>

            {/* Core Features Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div 
                onClick={() => handleSelectStation(1)}
                className="bg-white p-6 rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-[#174C3C] transition-all cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSelectStation(1); }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#EBF2EE] text-[#174C3C] flex items-center justify-center mb-4 group-hover:bg-[#174C3C] group-hover:text-white transition-colors">
                  <Volume2 className="w-6 h-6 text-[#D6AA55] group-hover:text-white" />
                </div>
                <h3 className="text-base font-bold text-[#20332D] group-hover:text-[#174C3C] transition-colors mb-1.5">
                  Âm học di sản Cồng chiêng
                </h3>
                <p className="text-xs text-[#556D65] leading-relaxed">
                  Phân tích phổ FFT thực nghiệm từ microphone, tính toán mode dao động phi điều hòa màng kim loại và nghe âm tổng hợp.
                </p>
                <div className="mt-4 text-xs font-bold text-[#174C3C] flex items-center gap-1">
                  Trải nghiệm Trạm 01 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div 
                onClick={handleSelectTamDao}
                className="bg-white p-6 rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-[#174C3C] transition-all cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSelectTamDao(); }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#EBF2EE] text-[#174C3C] flex items-center justify-center mb-4 group-hover:bg-[#174C3C] group-hover:text-white transition-colors">
                  <Mountain className="w-6 h-6 text-[#174C3C] group-hover:text-white" />
                </div>
                <h3 className="text-base font-bold text-[#20332D] group-hover:text-[#174C3C] transition-colors mb-1.5">
                  Tam Đảo Climate Lab
                </h3>
                <p className="text-xs text-[#556D65] leading-relaxed">
                  Mô phỏng vi khí hậu miền núi: Suất đoạn nhiệt sườn đón gió, hiệu ứng Phơn khô nóng và thiết kế nhà sàn thích ứng thiên tai.
                </p>
                <div className="mt-4 text-xs font-bold text-[#174C3C] flex items-center gap-1">
                  Vào phòng khí hậu <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div 
                onClick={() => {
                  setActiveView('research');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white p-6 rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-[#174C3C] transition-all cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setActiveView('research'); }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#FBF0EE] text-[#A94438] flex items-center justify-center mb-4 group-hover:bg-[#A94438] group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6 text-[#A94438] group-hover:text-white" />
                </div>
                <h3 className="text-base font-bold text-[#20332D] group-hover:text-[#A94438] transition-colors mb-1.5">
                  Nhật ký khoa học & Rubric
                </h3>
                <p className="text-xs text-[#556D65] leading-relaxed">
                  Lưu trữ kết quả nghiên cứu ẩn danh theo mã học sinh, phiếu khảo sát T0/T1/T2 và khung rubric quan sát 7 tiêu chí khoa học.
                </p>
                <div className="mt-4 text-xs font-bold text-[#A94438] flex items-center gap-1">
                  Mở nhật ký nghiên cứu <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </section>

            {/* Stations Map Grid Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#174C3C] tracking-tight">
                    Khám phá 16 Trạm STEM Di sản
                  </h2>
                  <p className="text-xs text-[#556D65] mt-0.5">
                    Mỗi trạm trải qua 7 bước: Bối cảnh, Câu hỏi, Dự đoán, Thí nghiệm số, Phân tích dữ liệu, Thử thách và Phản tư.
                  </p>
                </div>
              </div>

              <StationsMapGrid
                onSelectStation={handleSelectStation}
                onSelectTamDaoLab={handleSelectTamDao}
                activeStationId={activeStationId}
                isTamDaoActive={false}
              />
            </section>
          </div>
        )}

        {/* VIEW 2: INDIVIDUAL STATION RUNNER */}
        {activeView === 'station' && (
          <div className="space-y-6">
            {/* Back to map & Station switcher bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8E2D5] shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveView('map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-[#174C3C] hover:bg-[#EBF2EE] rounded-xl flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Bản đồ 16 Trạm
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeStationId <= 1}
                  onClick={handlePrevStation}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                    activeStationId <= 1
                      ? 'opacity-40 cursor-not-allowed border-[#E8E2D5] text-[#556D65]'
                      : 'border-[#E8E2D5] bg-white text-[#20332D] hover:bg-[#FAF7F0]'
                  }`}
                  aria-label="Trạm trước"
                >
                  ← Trước
                </button>

                <select
                  value={activeStationId}
                  onChange={(e) => setActiveStationId(parseInt(e.target.value))}
                  className="min-h-[44px] px-3 py-2 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl font-bold text-[#174C3C] text-xs focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
                  aria-label="Chọn trạm thí nghiệm"
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
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                    activeStationId >= 16
                      ? 'opacity-40 cursor-not-allowed border-[#E8E2D5] text-[#556D65]'
                      : 'border-[#E8E2D5] bg-white text-[#20332D] hover:bg-[#FAF7F0]'
                  }`}
                  aria-label="Trạm tiếp theo"
                >
                  Sau →
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
              onClick={() => {
                setActiveView('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-[#174C3C] hover:bg-white rounded-xl inline-flex items-center gap-2 border border-[#E8E2D5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Trở về Bản đồ 16 Trạm
            </button>
            <TamDaoClimateLab />
          </div>
        )}

        {/* VIEW 4: RESEARCH & JOURNAL HUB */}
        {activeView === 'research' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => {
                setActiveView('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-[#174C3C] hover:bg-white rounded-xl inline-flex items-center gap-2 border border-[#E8E2D5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Trở về Bản đồ 16 Trạm
            </button>
            <ResearchHub />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E2D5] text-[#556D65] text-xs py-10 mt-16 relative">
        <div className="absolute top-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={6} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#E8E2D5] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#174C3C] tracking-tight">
                  EMGIS LAB – PHÒNG THÍ NGHIỆM VĂN HÓA BẢN ĐỊA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A94438]" aria-hidden="true" />
              </div>
              <p className="text-xs text-[#556D65] max-w-xl">
                Khám phá khoa học từ di sản và đời sống. Nền tảng học tập STEM số hiện đại kết nối tri thức bản địa Mường và khoa học tự nhiên.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsCultureModalOpen(true)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl text-[#174C3C] bg-[#EBF2EE] hover:bg-[#174C3C] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#D6AA55]" /> Cơ sở di sản & An toàn
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('research');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E8E2D5] text-[#20332D] hover:bg-[#FAF7F0] transition-colors"
              >
                Nhật ký & Báo cáo
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#556D65]">
            <div>
              © 2026 EMGIS LAB. Ứng dụng Web Audio API & Mô phỏng hình học số. Lưu trữ cục bộ trên thiết bị.
            </div>
            <div className="font-medium text-[#174C3C]">
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
