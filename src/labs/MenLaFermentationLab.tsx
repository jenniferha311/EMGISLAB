import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Thermometer, 
  Clock, 
  Flame, 
  Droplets, 
  Wind, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  BookOpen, 
  Layers, 
  FlaskConical, 
  ArrowRight,
  Plus,
  Play,
  Volume2
} from 'lucide-react';
import { 
  saveResearchLog, 
  getCurrentStudent, 
  markStationVisited, 
  getCompletedStations, 
  toggleStationCompleted 
} from '../utils/storage';
import { MuongPatternBorder } from '../components/MuongPatternBorder';
import { FormulaAccordion } from '../components/FormulaAccordion';
import { MathFormula } from '../components/MathFormula';

// Herbs used in traditional leaf yeast (Men lá Tày, Nùng, Thái, Dao)
interface ForestHerb {
  id: string;
  name: string;
  folkName: string;
  botanicalName: string;
  role: string;
  bioFunction: string;
  essentialOil: string;
  color: string;
  selected: boolean;
}

const INITIAL_HERBS: ForestHerb[] = [
  {
    id: 'la_men',
    name: 'Lá cây men rừng (Lá thong bong / Cây men ngố)',
    folkName: 'Lá men chủ',
    botanicalName: 'Alpinia / Amomum sp.',
    role: 'Nguồn giống vi sinh vật tự nhiên',
    bioFunction: 'Cung cấp tế bào nấm mốc và nấm men hoang dã chịu cồn cao',
    essentialOil: 'Monoterpene & Cineol',
    color: '#166534',
    selected: true,
  },
  {
    id: 'rieng_dai',
    name: 'Củ riềng dại / Riềng núi',
    folkName: 'Củ cắm riềng',
    botanicalName: 'Alpinia galanga',
    role: 'Kháng khuẩn & Kích thích lên men',
    bioFunction: 'Tinh dầu ức chế vi khuẩn Lactic gây chua hỏng rượu; kích thích sợi nấm tơ',
    essentialOil: 'Galangin & Eugenol',
    color: '#D97706',
    selected: true,
  },
  {
    id: 'que_rung',
    name: 'Vỏ quế rừng Tây Bắc',
    folkName: 'Vỏ quế núi',
    botanicalName: 'Cinnamomum cassia',
    role: 'Hương thơm & Diệt nấm độc',
    bioFunction: 'Cinnamaldehyde kháng nấm mốc đen nguy hại, giữ hương rượu ngọt thanh',
    essentialOil: 'Cinnamaldehyde',
    color: '#92400E',
    selected: false,
  },
  {
    id: 'thao_qua',
    name: 'Hạt thảo quả Hoàng Liên Sơn',
    folkName: 'Đò ho',
    botanicalName: 'Amomum tsao-ko',
    role: 'Tăng nhiệt sinh học & Khử khuẩn',
    bioFunction: 'Làm ấm khối ủ, kích hoạt enzyme amylase thủy phân tinh bột nếp',
    essentialOil: '1,8-Cineole & Sabinene',
    color: '#713F12',
    selected: true,
  },
  {
    id: 'nhan_tran',
    name: 'Cây nhân trần / Bồ bồ rừng',
    folkName: 'Cỏ nhân trần',
    botanicalName: 'Adenosma caeruleum',
    role: 'Thanh nhiệt & Ổn định dịch đường',
    bioFunction: 'Chống oxy hóa, giúp nước rượu trong vắt và dịu êm hậu vị',
    essentialOil: 'Flavonoid & Saponin',
    color: '#065F46',
    selected: false,
  }
];

export const MenLaFermentationLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'step1' | 'step2' | 'step3'>('step2');
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(14));

  useEffect(() => {
    markStationVisited(14);
    setIsCompleted(getCompletedStations().includes(14));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(14));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

  // Step 1: Herb recipe selection
  const [herbs, setHerbs] = useState<ForestHerb[]>(INITIAL_HERBS);
  const [riceRatioGrams, setRiceRatioGrams] = useState<number>(500); // Rice powder
  const [cakeCount, setCakeCount] = useState<number>(10);

  // Step 2: Fermentation Physics & Biology Controls
  const [temperature, setTemperature] = useState<number>(30); // 15°C to 42°C
  const [isSealed, setIsSealed] = useState<boolean>(true); // false = Hiếu khí (mở nắp ủ tơ), true = Yếm khí (đậy kín ủ rượu)
  const [fermentDays, setFermentDays] = useState<number>(5); // 1 to 14 days
  const [microscopeView, setMicroscopeView] = useState<boolean>(false);
  const [microscopeZoom, setMicroscopeZoom] = useState<'mold' | 'yeast'>('yeast');
  const [animBubbleTick, setAnimBubbleTick] = useState<number>(0);

  // Step 3: Distillation Controls
  const [potFireIntensity, setPotFireIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [coolingWaterTemp, setCoolingWaterTemp] = useState<number>(18); // 10°C to 35°C
  const [isDistilling, setIsDistilling] = useState<boolean>(false);
  const [distillTimeMinutes, setDistillTimeMinutes] = useState<number>(20);

  // Journal and notes
  const [journalNote, setJournalNote] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Animation ticker for fermentation gas bubbling and steam
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimBubbleTick((t) => (t + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Biological & Chemical Calculations:
  // Vi sinh vật:
  // - Nấm mốc (Rhizopus / Aspergillus): Cần HIẾU KHÍ ở giai đoạn 1-2 ngày đầu để tiết Amylase đường hóa tinh bột.
  // - Nấm men (Saccharomyces): Cần YẾM KHÍ (đậy kín) để chuyển glucose thành Cồn Ethanol + CO2.
  // - Nhiệt độ tối ưu: 28°C - 32°C.
  // - Dưới 18°C: Vi sinh bị ức chế, enzym amylase hoạt động rất chậm.
  // - Trên 38°C: Biến tính protein enzym, nấm men chết, vi khuẩn chịu nhiệt làm chua.

  const selectedHerbsCount = herbs.filter((h) => h.selected).length;
  const hasAntiBacterial = herbs.find((h) => h.id === 'rieng_dai')?.selected;

  // Evaluation status of fermentation
  const isTooCold = temperature < 18;
  const isTooHot = temperature > 38;
  const isOptimalTemp = temperature >= 26 && temperature <= 32;

  // Warning text
  let statusMessage = '';
  let statusSeverity: 'success' | 'warning' | 'error' = 'success';

  if (isTooCold) {
    statusSeverity = 'warning';
    statusMessage = 'Nhiệt độ quá lạnh (<18°C)! Nấm men ngủ đông, enzyme Amylase bất hoạt, tốc độ lên men gần như bằng 0.';
  } else if (isTooHot) {
    statusSeverity = 'error';
    statusMessage = 'Nhiệt độ quá nóng (>38°C)! Protein enzyme bị biến tính, tế bào nấm men bị chết. Rượu có nguy cơ bị chua hỏng!';
  } else if (!isSealed && fermentDays > 3) {
    statusSeverity = 'warning';
    statusMessage = 'Hũ để mở nắp quá lâu (>3 ngày)! Oxy làm nấm men hô hấp hiếu khí tạo CO2 và H2O thay vì tạo rượu, rượu nhạt và dễ nhiễm khuẩn giấm.';
  } else if (isSealed && fermentDays < 2) {
    statusSeverity = 'warning';
    statusMessage = 'Đậy kín quá sớm khi tơ nấm mốc chưa mọc đều! Quá trình đường hóa tinh bột bị thiếu hụt, men kém ngọt.';
  } else {
    statusSeverity = 'success';
    statusMessage = 'Điều kiện lý tưởng! Tinh dầu thảo mộc ức chế vi khuẩn chua, nấm men phân giải đường thành Ethanol và khí CO2 thơm ngào ngạt.';
  }

  // Calculated Real-time Parameters:
  // Glucose sugar level (% Brix)
  const sugarBrix = Math.max(1, Math.min(24, Math.round(
    (!isSealed ? 8 : 16) * (selectedHerbsCount / 3) * (isOptimalTemp ? 1.0 : isTooCold ? 0.3 : 0.15)
  )));

  // Alcohol level in mash (% ABV)
  const alcoholLevel = isTooHot 
    ? 2.5 
    : isTooCold 
      ? 1.8 
      : !isSealed 
        ? Math.min(4.0, fermentDays * 0.6) 
        : Math.min(15.5, Math.round((fermentDays * 1.8 * (isOptimalTemp ? 1.0 : 0.6) * (hasAntiBacterial ? 1.1 : 0.8)) * 10) / 10);

  // Distilled Alcohol Output (% ABV)
  const distilledProof = Math.round(Math.min(55, Math.max(0, alcoholLevel * 3.1 - (coolingWaterTemp > 25 ? 5 : 0))));
  const collectedLiquorMl = Math.round((riceRatioGrams * 0.9 * (alcoholLevel / 14)) * 10) / 10;

  const toggleHerb = (id: string) => {
    setHerbs(herbs.map((h) => h.id === id ? { ...h, selected: !h.selected } : h));
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 14,
      stationTitle: 'Rượu men lá truyền thống – Vi sinh & Lên men',
      hypothesis: journalNote || 'Khảo sát ảnh hưởng của nhiệt độ và chế độ yếm khí đến nồng độ cồn và sinh khối nấm men',
      selectedPrediction: isSealed ? 'Yếm khí tạo cồn tối ưu' : 'Hiếu khí sinh tơ nấm',
      changedVariables: {
        temperature,
        isSealed: isSealed ? 'Đậy kín (Yếm khí)' : 'Mở nắp (Hiếu khí)',
        fermentDays,
        herbsUsed: herbs.filter((h) => h.selected).map((h) => h.folkName).join(', '),
        coolingWaterTemp,
      },
      recordedResults: {
        'Nhiệt độ ủ (°C)': `${temperature}°C`,
        'Chế độ ủ': isSealed ? 'Yếm khí (Anaerobic)' : 'Hiếu khí (Aerobic)',
        'Hàm lượng cồn bỗng rượu (% ABV)': `${alcoholLevel}%`,
        'Nồng độ đường còn lại (°Brix)': `${sugarBrix}°Bx`,
        'Độ cồn rượu sau chưng cất': `${distilledProof}° (vol)`,
        'Lượng rượu tinh khiết thu hoạch': `${collectedLiquorMl} ml`,
      },
      observationNotes: `Quan sát kính hiển vi: ${microscopeZoom === 'yeast' ? 'Tế bào Saccharomyces nảy chồi mạnh mẽ' : 'Sợi nấm mốc Rhizopus phân nhánh tiết Amylase'}. Tinh dầu riềng núi giúp rượu không bị chua.`,
      reflectionAnswers: 'Tri thức dân gian sử dụng lá thảo mộc là đỉnh cao của công nghệ sinh học bản địa, chọn lọc chủng vi sinh có lợi và ức chế tạp khuẩn một cách tự nhiên.',
      isVerifiedRealData: false,
    });
    setSaveSuccessMsg(`Đã ghi nhận dữ liệu thực nghiệm vào Nhật ký của học sinh ${student}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={5} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
              TRẠM MỚI · CÔNG NGHỆ SINH HỌC
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">Vi sinh vật học, Enzyme & Hóa sinh cồn</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">Tri thức dân gian Tày, Nùng, Mường, Thái</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(14)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isCompleted
                  ? 'bg-[#174C3C] text-white border-[#174C3C] shadow-2xs hover:bg-[#11382C]'
                  : 'bg-white hover:bg-[#FAF7F0] border-[#E8E2D5] text-[#556D65] hover:text-[#174C3C]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#D6AA55]' : 'text-[#8A9E96]'}`} />
              {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight">
          Rượu men lá truyền thống – Sinh học vi sinh & Lên men
        </h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">
          Khám phá sự kỳ diệu của thảo mộc rừng tự nhiên kết hợp cùng nấm men <em>Saccharomyces</em> và nấm mốc thủy phân tinh bột trong chum gốm đất nung.
        </p>

        {/* 3 Main Process Phase Tabs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={() => setActiveTab('step1')}
            className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
              activeTab === 'step1'
                ? 'bg-[#EBF2EE] border-[#174C3C] text-[#174C3C] shadow-2xs'
                : 'bg-[#FAF7F0] border-[#E8E2D5] text-[#556D65] hover:bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              activeTab === 'step1' ? 'bg-[#174C3C] text-white' : 'bg-white text-[#20332D] border border-[#E8E2D5]'
            }`}>
              1
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs">Làm bánh men</div>
              <div className="text-[11px] text-[#8A9E96] truncate">Chọn thảo mộc & kháng khuẩn</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('step2')}
            className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
              activeTab === 'step2'
                ? 'bg-[#EBF2EE] border-[#174C3C] text-[#174C3C] shadow-2xs'
                : 'bg-[#FAF7F0] border-[#E8E2D5] text-[#556D65] hover:bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              activeTab === 'step2' ? 'bg-[#174C3C] text-white' : 'bg-white text-[#20332D] border border-[#E8E2D5]'
            }`}>
              2
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs">Đường hóa & Lên men</div>
              <div className="text-[11px] text-[#8A9E96] truncate">Kính hiển vi ảo & Chum ủ</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('step3')}
            className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
              activeTab === 'step3'
                ? 'bg-[#EBF2EE] border-[#174C3C] text-[#174C3C] shadow-2xs'
                : 'bg-[#FAF7F0] border-[#E8E2D5] text-[#556D65] hover:bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              activeTab === 'step3' ? 'bg-[#174C3C] text-white' : 'bg-white text-[#20332D] border border-[#E8E2D5]'
            }`}>
              3
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs">Chưng cất ngưng tụ</div>
              <div className="text-[11px] text-[#8A9E96] truncate">Máng tre & Giọt rượu tinh khiết</div>
            </div>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================================
          BƯỚC 1: LÀM BÁNH MEN (LỰA CHỌN THẢO MỘC RỪNG)
          ========================================================================= */}
      {activeTab === 'step1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Mortar & Pestle Visual (Cối đá & Giã bánh men) */}
          <div className="lg:col-span-7 bg-[#1F2B25] p-6 rounded-2xl border border-[#174C3C] text-white space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#E8E2D5] font-bold">CỐI GIÃ BÁNH MEN DÂN TỘC</span>
              <span className="text-[#D6AA55]">Đã chọn {selectedHerbsCount} vị thảo mộc</span>
            </div>

            {/* Mortar SVG canvas */}
            <div className="relative w-full h-80 bg-gradient-to-b from-[#16231C] to-[#0E1712] rounded-xl border border-white/10 flex flex-col items-center justify-center p-4 overflow-hidden">
              <svg viewBox="0 0 400 260" className="w-full h-full select-none">
                {/* Stone mortar (Cối đá) */}
                <ellipse cx="200" cy="180" rx="110" ry="25" fill="#334155" />
                <path d="M 90,120 Q 80,180 130,220 Q 200,240 270,220 Q 320,180 310,120 Z" fill="#475569" stroke="#1E293B" strokeWidth="4" />
                <ellipse cx="200" cy="120" rx="110" ry="32" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
                {/* Rice flour and crushed herbs in mortar */}
                <ellipse cx="200" cy="128" rx="85" ry="22" fill="#E2E8F0" />
                
                {/* Herb particles sprinkled in dough */}
                {herbs.filter((h) => h.selected).map((herb, idx) => (
                  <g key={herb.id}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={140 + ((idx * 31 + i * 17) % 120)}
                        cy={120 + ((idx * 13 + i * 7) % 20)}
                        r="3.5"
                        fill={herb.color}
                        opacity="0.9"
                      />
                    ))}
                  </g>
                ))}

                {/* Wooden pestle (Chày gỗ giã men) */}
                <g transform="rotate(18, 220, 70)">
                  <rect x="210" y="20" width="22" height="130" rx="8" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                  <ellipse cx="221" cy="148" rx="15" ry="10" fill="#92400E" />
                </g>

                <text x="200" y="250" fill="#CBD5E1" fontSize="11" textAnchor="middle" fontFamily="monospace">
                  Bột gạo nếp ({riceRatioGrams}g) trộn thảo mộc rừng
                </text>
              </svg>
            </div>

            {/* Scientific Explanation Card */}
            <div className="p-3.5 bg-black/30 rounded-xl border border-white/10 text-xs space-y-1 text-[#E8E2D5]">
              <div className="font-bold text-[#D6AA55]">Ý nghĩa sinh học của thảo mộc tự nhiên:</div>
              <p className="text-[#8A9E96] leading-relaxed">
                Người vùng cao không dùng men hóa học công nghiệp; họ dùng thảo mộc để tạo tính chọn lọc vi sinh tự nhiên. Tinh dầu Cineol, Galangin từ riềng và quế đóng vai trò kháng sinh thảo dược ức chế vi khuẩn chua (Lactobacillus), tạo môi trường cho nấm men rượu phát triển khỏe mạnh.
              </p>
            </div>
          </div>

          {/* Right: Herb Checklist */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                Chọn thảo mộc bí truyền làm bánh men
              </h3>
            </div>

            <div className="space-y-2.5">
              {herbs.map((h) => (
                <div
                  key={h.id}
                  onClick={() => toggleHerb(h.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    h.selected
                      ? 'border-[#174C3C] bg-[#EBF2EE]'
                      : 'border-[#E8E2D5] bg-[#FAF7F0] hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={h.selected}
                    onChange={() => {}}
                    className="mt-1 accent-[#174C3C]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#20332D]">{h.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-[#E8E2D5] text-[#174C3C]">
                        {h.essentialOil}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A94438] font-semibold mt-0.5">{h.role}</div>
                    <div className="text-[11px] text-[#556D65] mt-1 leading-snug">{h.bioFunction}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8E2D5] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('step2')}
                className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs"
              >
                Tiếp tục: Bước 2 – Đường hóa & Lên men trong chum →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BƯỚC 2: ĐƯỜNG HÓA & LÊN MEN (PHÒNG THÍ NGHIỆM VI SINH ẢO)
          ========================================================================= */}
      {activeTab === 'step2' && (
        <div className="space-y-6">
          {/* Real-time Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-start sm:items-center gap-3 text-xs sm:text-sm font-medium transition-colors ${
            statusSeverity === 'success'
              ? 'bg-[#EBF2EE] border-[#174C3C]/30 text-[#174C3C]'
              : statusSeverity === 'warning'
                ? 'bg-[#FBF6EA] border-[#D6AA55] text-[#713F12]'
                : 'bg-[#FBF0EE] border-[#A94438] text-[#8D372C]'
          }`}>
            {statusSeverity === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#174C3C] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">
              <strong>Trạng thái vi sinh:</strong> {statusMessage}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Canvas (7 cols): The Earthen Jar (Chum ủ) OR Virtual Microscope View */}
            <div className="lg:col-span-7 bg-[#1F2B25] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#E8E2D5] font-bold flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-[#D6AA55]" />
                  {microscopeView ? 'KÍNH HIỂN VI QUANG HỌC VI SINH (1000x)' : 'CHUM GỐM Ủ RƯỢU MEN LÁ'}
                </span>

                <button
                  type="button"
                  onClick={() => setMicroscopeView(!microscopeView)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    microscopeView 
                      ? 'bg-[#D6AA55] text-[#20332D] border-[#D6AA55]' 
                      : 'bg-black/40 text-[#E8E2D5] hover:bg-black/60 border-white/20'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {microscopeView ? 'Đóng kính hiển vi' : 'Soi kính hiển vi (1000x)'}
                </button>
              </div>

              {/* Graphic Display: Earthen Fermentation Jar or Microscope View */}
              <div className="relative w-full h-84 bg-gradient-to-b from-[#141F19] to-[#0A120E] rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                {!microscopeView ? (
                  /* ================= Normal View: Ceramic Jar (Chum gốm đất nung) ================= */
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <svg viewBox="0 0 360 260" className="w-full h-full select-none">
                      {/* Ambient warm heat glow around jar */}
                      {temperature > 25 && (
                        <circle
                          cx="180"
                          cy="140"
                          r="110"
                          fill="radial-gradient(circle, rgba(214,170,85,0.15) 0%, transparent 70%)"
                          className={isTooHot ? 'opacity-80' : 'opacity-40'}
                        />
                      )}

                      {/* Earthenware Jar body (Chum sành tráng men da lươn) */}
                      <path
                        d="M 125,75 Q 70,120 85,190 Q 95,235 180,240 Q 265,235 275,190 Q 290,120 235,75 Z"
                        fill="#5C3317"
                        stroke="#3E200C"
                        strokeWidth="4"
                      />
                      {/* Glaze sheen */}
                      <path
                        d="M 135,85 Q 90,130 100,185 Q 105,210 140,225"
                        fill="none"
                        stroke="#8B5A2B"
                        strokeWidth="6"
                        opacity="0.6"
                        strokeLinecap="round"
                      />

                      {/* Jar Neck */}
                      <rect x="120" y="60" width="120" height="18" fill="#4A250E" rx="3" stroke="#2D1506" strokeWidth="2" />
                      {/* Jar Rim */}
                      <ellipse cx="180" cy="60" rx="60" ry="10" fill="#3A1C0B" stroke="#240D04" strokeWidth="2" />

                      {/* Lid / Seal state: Mở nắp (Aerobic) vs Đậy kín lá chuối buộc lạt (Anaerobic) */}
                      {isSealed ? (
                        /* Sealed with Banana leaves & Bamboo ropes */
                        <g>
                          <path
                            d="M 110,60 Q 180,35 250,60 Q 260,75 235,80 Q 180,68 125,80 Z"
                            fill="#15803D"
                            stroke="#14532D"
                            strokeWidth="2"
                          />
                          {/* Bamboo tied lạt strings */}
                          <line x1="120" y1="72" x2="240" y2="72" stroke="#CA8A04" strokeWidth="3" />
                          <line x1="125" y1="77" x2="235" y2="77" stroke="#EAB308" strokeWidth="2" />
                          <text x="180" y="30" fill="#86EFAC" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                            Đậy kín yếm khí (Lá chuối & lạt tre)
                          </text>
                        </g>
                      ) : (
                        /* Open lid for mycelium growth */
                        <g>
                          <ellipse cx="180" cy="60" rx="50" ry="8" fill="#E2E8F0" />
                          <text x="180" y="30" fill="#FDE047" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                            Mở nắp ủ hiếu khí (Nuôi tơ nấm mốc)
                          </text>
                        </g>
                      )}

                      {/* CO2 gas bubbles escaping if sealed & fermenting */}
                      {isSealed && isOptimalTemp && (
                        <g>
                          {Array.from({ length: 6 }).map((_, b) => {
                            const bx = 160 + (b * 15 + animBubbleTick * 3) % 40;
                            const by = 55 - ((animBubbleTick * 2 + b * 20) % 50);
                            return (
                              <circle
                                key={b}
                                cx={bx}
                                cy={by}
                                r={2.5 + (b % 3)}
                                fill="#38BDF8"
                                opacity="0.75"
                              />
                            );
                          })}
                          <text x="265" y="45" fill="#38BDF8" fontSize="9" fontFamily="monospace">
                            CO₂ ↑ sủi bọt
                          </text>
                        </g>
                      )}

                      {/* Label on Jar */}
                      <rect x="140" y="145" width="80" height="30" fill="#FEF3C7" rx="4" stroke="#D97706" />
                      <text x="180" y="160" fill="#78350F" fontSize="10" textAnchor="middle" fontWeight="bold">
                        Bỗng rượu nếp
                      </text>
                      <text x="180" y="171" fill="#92400E" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {alcoholLevel}% vol cồn
                      </text>
                    </svg>
                  </div>
                ) : (
                  /* ================= Microscope View (1000x): Nấm mốc & Nấm men ================= */
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* Circular microscope field */}
                    <div className="relative w-64 h-64 rounded-full border-4 border-white/30 bg-[#064E3B]/40 shadow-inner overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,#10b981_0%,transparent_75%)] opacity-20" />

                      {microscopeZoom === 'yeast' ? (
                        /* Yeast: Saccharomyces cerevisiae cells budding */
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Mother yeast cell */}
                          <circle cx="100" cy="100" r="32" fill="#34D399" opacity="0.85" stroke="#059669" strokeWidth="2.5" />
                          <circle cx="95" cy="95" r="10" fill="#065F46" opacity="0.5" />
                          
                          {/* Daughter budding cell */}
                          <circle cx="132" cy="80" r="18" fill="#6EE7B7" opacity="0.9" stroke="#059669" strokeWidth="2" />
                          <circle cx="130" cy="78" r="5" fill="#065F46" opacity="0.4" />

                          {/* Nearby cells */}
                          <circle cx="50" cy="65" r="24" fill="#34D399" opacity="0.75" />
                          <circle cx="150" cy="140" r="26" fill="#34D399" opacity="0.8" />
                          <circle cx="65" cy="145" r="20" fill="#6EE7B7" opacity="0.8" />

                          {/* CO2 micro-bubbles */}
                          <circle cx="125" cy="110" r="3" fill="#BAE6FD" />
                          <circle cx="80" cy="75" r="4" fill="#BAE6FD" />
                        </svg>
                      ) : (
                        /* Mold: Aspergillus / Rhizopus mycelium branching */
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Mycelium hyphae network (Tơ nấm) */}
                          <path d="M 30,170 Q 80,120 100,100 T 170,40" fill="none" stroke="#FDE047" strokeWidth="4" />
                          <path d="M 100,100 Q 130,130 160,170" fill="none" stroke="#FDE047" strokeWidth="3" />
                          <path d="M 60,140 Q 40,90 30,60" fill="none" stroke="#FBBF24" strokeWidth="2.5" />
                          <path d="M 130,70 Q 160,80 180,95" fill="none" stroke="#FBBF24" strokeWidth="2.5" />

                          {/* Sporangium head (Bào tử nấm) */}
                          <circle cx="170" cy="40" r="10" fill="#D97706" />
                          <circle cx="30" cy="60" r="8" fill="#D97706" />
                        </svg>
                      )}

                      {/* Reticle / Crosshair */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                        <div className="w-full h-px bg-white" />
                        <div className="h-full w-px bg-white absolute" />
                      </div>
                    </div>

                    {/* Switcher under microscope */}
                    <div className="absolute bottom-2 flex gap-2 z-10">
                      <button
                        type="button"
                        onClick={() => setMicroscopeZoom('yeast')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          microscopeZoom === 'yeast' ? 'bg-emerald-500 text-slate-900' : 'bg-black/50 text-white'
                        }`}
                      >
                        Nấm men (Saccharomyces – Lên men cồn)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMicroscopeZoom('mold')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          microscopeZoom === 'mold' ? 'bg-amber-400 text-slate-900' : 'bg-black/50 text-white'
                        }`}
                      >
                        Nấm mốc (Rhizopus – Tiết Amylase)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Biological Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Nồng độ cồn bỗng rượu</div>
                  <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                    {alcoholLevel}% ABV
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Hàm lượng đường</div>
                  <div className="font-mono font-bold text-sky-300 text-sm mt-0.5">
                    {sugarBrix}° Brix
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Thời gian ủ</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    {fermentDays} ngày
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Chế độ hô hấp</div>
                  <div className="font-bold text-purple-300 text-sm mt-0.5 truncate">
                    {isSealed ? 'Yếm khí (Tạo rượu)' : 'Hiếu khí (Tạo tơ)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Controls Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                  Điều khiển điều kiện lên men
                </h3>
              </div>

              {/* 1. Switch Hiếu khí / Yếm khí */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D]">Chế độ nắp chum (Oxy không khí):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSealed(false)}
                    className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                      !isSealed 
                        ? 'border-[#174C3C] bg-[#EBF2EE] text-[#174C3C] font-bold shadow-2xs' 
                        : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65]'
                    }`}
                  >
                    <Unlock className="w-4 h-4 text-[#D6AA55]" />
                    <div>
                      <div className="text-xs font-bold">Mở nắp (Hiếu khí)</div>
                      <div className="text-[10px] text-[#8A9E96]">Ủ 1-2 ngày đầu mọc tơ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSealed(true)}
                    className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                      isSealed 
                        ? 'border-[#174C3C] bg-[#EBF2EE] text-[#174C3C] font-bold shadow-2xs' 
                        : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65]'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-[#174C3C]" />
                    <div>
                      <div className="text-xs font-bold">Đậy kín (Yếm khí)</div>
                      <div className="text-[10px] text-[#8A9E96]">Buộc lá chuối tạo cồn</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Slider Nhiệt độ phòng ủ */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D] flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#A94438]" />
                    Nhiệt độ phòng ủ:
                  </span>
                  <span className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded-md ${
                    isOptimalTemp 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isTooCold 
                        ? 'bg-sky-100 text-sky-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="42"
                  step="1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>15°C (Quá lạnh)</span>
                  <span className="font-bold text-emerald-700">28°C - 32°C (Lý tưởng)</span>
                  <span>42°C (Chết men)</span>
                </div>
              </div>

              {/* 3. Slider Số ngày ủ men */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D6AA55]" />
                    Thời gian lên men trong chum:
                  </span>
                  <span className="font-mono text-[#174C3C] font-extrabold text-sm bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                    {fermentDays} ngày
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="1"
                  value={fermentDays}
                  onChange={(e) => setFermentDays(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>1 ngày (mới ngọt)</span>
                  <span>5-7 ngày (chín muồi)</span>
                  <span>14 ngày (men kiệt)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setActiveTab('step3')}
                  className="flex-1 min-h-[44px] bg-[#FAF7F0] border border-[#E8E2D5] hover:bg-white text-[#174C3C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Flame className="w-4 h-4 text-[#D6AA55]" /> Sang nồi chưng cất →
                </button>

                <button
                  type="button"
                  onClick={handleSaveToJournal}
                  className="flex-1 min-h-[44px] bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D6AA55]" /> Lưu nhật ký thí nghiệm
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Scientific Equations */}
          <FormulaAccordion
            formula="\text{Tinh bột} \xrightarrow[\text{Amylase}]{\text{Nấm mốc}} \text{Glucose} \xrightarrow[\text{Zymase}]{\text{Nấm men (Yếm khí)}} 2\, \text{C}_2\text{H}_5\text{OH} + 2\, \text{CO}_2 \uparrow + \Delta H"
            description="Phương trình sinh hóa 2 giai đoạn: Giai đoạn 1 nấm mốc tiết enzym Amylase thủy phân tinh bột nếp thành đường; Giai đoạn 2 nấm men lên men đường thành rượu Ethanol và khí Carbonic."
            title="Xem phương trình sinh hóa & Khoa học vi sinh đằng sau"
            principles={[
              'Hô hấp yếm khí của tế bào Saccharomyces cerevisiae: Khi không có oxy, pyruvate chuyển hóa thành acetaldehyde rồi thành ethanol.',
              'Tác dụng kìm khuẩn của thảo mộc: Cineol và polyphenol làm thủng màng tế bào vi khuẩn gram dương sinh axit mà không ảnh hưởng thành tế bào nấm men.',
              'Nhiệt động học enzym: Nhiệt độ tối ưu kích hoạt phức hợp enzyme-cơ chất, vượt quá 38°C sẽ gây biến tính cấu trúc bậc ba của protein.'
            ]}
            assumptions={[
              'Hiệu suất lên men lý thuyết đạt tối đa 92% do một phần đường chuyển thành sinh khối tế bào nấm men mới.',
              'Độ ẩm khối nếp ủ duy trì 60-65% theo kinh nghiệm nghệ nhân.'
            ]}
            variables={[
              { symbol: 'T', name: 'Nhiệt độ phòng ủ', unit: '°C', range: '15 - 42 °C', description: 'Nhiệt độ kiểm soát hoạt tính enzym' },
              { symbol: 't', name: 'Thời gian lên men', unit: 'ngày', range: '1 - 14 ngày', description: 'Thời gian chuyển hóa tinh bột thành cồn' },
              { symbol: 'ABV', name: 'Nồng độ cồn thể tích', unit: '% vol', range: '0 - 16%', description: 'Tỷ lệ ethanol trong bỗng rượu' }
            ]}
            defaultOpen={false}
          />
        </div>
      )}

      {/* =========================================================================
          BƯỚC 3: CHƯNG CẤT CỒN (VẬT LÝ NGƯNG TỤ QUA MÁNG TRE)
          ========================================================================= */}
      {activeTab === 'step3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Distillation Still SVG Canvas */}
          <div className="lg:col-span-7 bg-[#1F2B25] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#E8E2D5] font-bold">NỒI NẤU RƯỢU & MÁNG TRE NGƯNG TỤ</span>
              <span className="text-[#D6AA55]">Điểm sôi Ethanol: 78.37°C</span>
            </div>

            <div className="relative w-full h-84 bg-gradient-to-b from-[#141F19] to-[#0A120E] rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
              <svg viewBox="0 0 420 260" className="w-full h-full select-none">
                {/* Fireplace (Bếp củi đỏ lửa) */}
                <path d="M 50,240 L 150,240 L 140,200 L 60,200 Z" fill="#334155" />
                <path d="M 75,230 Q 100,185 125,230 Q 110,210 100,200 Q 90,210 75,230 Z" fill="#EF4444" className="animate-pulse" />
                <path d="M 85,230 Q 100,195 115,230 Z" fill="#F59E0B" />

                {/* Copper Pot (Nồi đồng đun bỗng rượu) */}
                <path d="M 60,130 Q 50,190 70,200 L 130,200 Q 150,190 140,130 Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
                {/* Wooden steam cone (Chõ gỗ nung) */}
                <polygon points="70,130 130,130 120,70 80,70" fill="#854D0E" stroke="#5B21B6" strokeWidth="1" />

                {/* Bamboo cooling gutter (Máng tre dẫn hơi và ngưng tụ) */}
                <path d="M 100,70 Q 180,45 280,100" fill="none" stroke="#CA8A04" strokeWidth="10" strokeLinecap="round" />
                <path d="M 100,70 Q 180,45 280,100" fill="none" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />

                {/* Cold mountain stream water trough (Thau nước suối lạnh làm mát) */}
                <rect x="230" y="80" width="100" height="40" fill="#0284C7" rx="6" opacity="0.65" />
                <text x="280" y="75" fill="#38BDF8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  Nước suối lạnh ({coolingWaterTemp}°C)
                </text>

                {/* Liquor Drops Falling from Gutter (Giọt rượu tinh khiết nhỏ tí tách) */}
                <circle cx="280" cy={110 + (animBubbleTick % 30)} r="2.5" fill="#F8FAFC" />
                <circle cx="280" cy={125 + (animBubbleTick % 25)} r="2" fill="#E2E8F0" />

                {/* Ceramic Collection Jug (Bình gốm hứng rượu) */}
                <path d="M 265,170 Q 255,200 260,230 L 300,230 Q 305,200 295,170 Z" fill="#475569" stroke="#1E293B" strokeWidth="3" />
                <rect x="272" y="155" width="16" height="15" fill="#334155" />
                <ellipse cx="280" cy="155" rx="8" ry="3" fill="#64748B" />

                <text x="280" y="248" fill="#FDE047" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Rượu cất: {distilledProof}° cồn
                </text>
              </svg>
            </div>

            {/* Distillation Principles */}
            <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-xs text-[#E8E2D5] space-y-1">
              <div className="font-bold text-[#D6AA55]">Nguyên lý Vật lý tách cồn:</div>
              <p className="text-[#8A9E96] leading-relaxed">
                Ethanol có nhiệt độ sôi (78.37°C) thấp hơn nước (100°C). Khi duy trì lửa nhỏ âm ỉ, hơi cồn bốc lên trước, đi qua máng tre được bao quanh bởi nước suối lạnh sẽ tỏa nhiệt ngưng tụ thành từng giọt rượu thơm trong suốt.
              </p>
            </div>
          </div>

          {/* Right: Controls & Harvest Summary */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
              Thông số chưng cất & Thu hoạch
            </h3>

            {/* 1. Fire intensity */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#20332D]">Mức lửa bếp củi:</label>
              <div className="flex gap-2">
                {[
                  { id: 'low', label: 'Lửa nhỏ âm ỉ (Chuẩn)' },
                  { id: 'medium', label: 'Lửa vừa' },
                  { id: 'high', label: 'Lửa to (Khê rượu)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPotFireIntensity(f.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      potFireIntensity === f.id
                        ? 'border-[#A94438] bg-[#FBF0EE] text-[#A94438] font-bold'
                        : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Cooling water temp */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#20332D]">Nhiệt độ nước suối làm mát:</span>
                <span className="font-mono text-[#0284C7] font-bold">{coolingWaterTemp}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="1"
                value={coolingWaterTemp}
                onChange={(e) => setCoolingWaterTemp(parseInt(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
              <div className="flex justify-between text-[10px] text-[#8A9E96]">
                <span>10°C (Suối nguồn mát lạnh - ngưng tụ 100%)</span>
                <span>35°C (Hao hụt hơi cồn)</span>
              </div>
            </div>

            {/* Final Harvest Metrics */}
            <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] space-y-2 text-xs">
              <div className="font-bold text-[#174C3C] uppercase tracking-wider">
                Kết quả mẻ rượu men lá:
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D5]">
                <span className="text-[#556D65]">Nồng độ cồn thu được:</span>
                <span className="font-mono font-bold text-[#A94438] text-sm">{distilledProof}° (vol)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D5]">
                <span className="text-[#556D65]">Lượng rượu tinh khiết:</span>
                <span className="font-mono font-bold text-[#174C3C]">{collectedLiquorMl} ml</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#556D65]">Hương vị & Độ êm:</span>
                <span className="font-semibold text-emerald-700">Thơm dịu thảo mộc, không đau đầu</span>
              </div>
            </div>

            {/* Note & Save */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#20332D]">Ghi chép của em vào nhật ký:</label>
              <textarea
                rows={2}
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="Ghi lại nhận xét về sự khác biệt khi ủ yếm khí so với mở nắp..."
                className="w-full p-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#20332D]"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveToJournal}
              className="w-full min-h-[44px] bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#D6AA55]" /> Lưu kết quả mẻ rượu vào Nhật ký học sinh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
