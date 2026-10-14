import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Layers, 
  Droplets, 
  Sun, 
  Clock, 
  Thermometer, 
  FlaskConical,
  BookOpen,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { 
  saveResearchLog, 
  getCurrentStudent, 
  markStationVisited, 
  getCompletedStations, 
  toggleStationCompleted 
} from '../utils/storage';
import { MuongPatternBorder } from '../components/MuongPatternBorder';
import { FormulaAccordion } from '../components/FormulaAccordion';

// Types of natural plant dyes
interface DyePlant {
  id: string;
  name: string;
  folkName: string;
  source: string;
  baseColor: string;
  rgbBase: [number, number, number];
  chemicalPigment: string;
  description: string;
}

const DYE_PLANTS: DyePlant[] = [
  {
    id: 'cham',
    name: 'Cây chàm núi (Strobilanthes cusia)',
    folkName: 'Lá chàm / Cây tràm',
    source: 'Bản Dao, Mông Sa Pa & Mường',
    baseColor: '#1E3A5F',
    rgbBase: [30, 58, 95],
    chemicalPigment: 'Indigotin (khử sang leuco-indigo dạng kiềm)',
    description: 'Sắc tố xanh đậm huyền thoại, chống tia cực tím, bền màu hàng chục năm.'
  },
  {
    id: 'nghe',
    name: 'Củ nghệ vàng (Curcuma longa)',
    folkName: 'Nghệ rừng',
    source: 'Vườn đồi trung du Phú Thọ',
    baseColor: '#EAB308',
    rgbBase: [234, 179, 8],
    chemicalPigment: 'Curcumin (nhạy với độ kiềm pH)',
    description: 'Màu vàng nắng ấm rực rỡ, tính kháng khuẩn tự nhiên cao.'
  },
  {
    id: 'cu_nau',
    name: 'Củ nâu (Dioscorea cirrhosa)',
    folkName: 'Củ nâu / Thao',
    source: 'Rừng tự nhiên Hòa Bình, Tuyên Quang',
    baseColor: '#78350F',
    rgbBase: [120, 53, 15],
    chemicalPigment: 'Tannin ngưng tụ (Proanthocyanidin)',
    description: 'Màu nâu đồng, làm sợi vải dai chắc, chịu được bùn lầy sông suối.'
  },
  {
    id: 'la_cam',
    name: 'Lá cẩm tím (Peristrophe bivalvis)',
    folkName: 'Lá cẩm',
    source: 'Thung lũng người Tày, Thái',
    baseColor: '#831843',
    rgbBase: [131, 24, 67],
    chemicalPigment: 'Anthocyanin thực vật',
    description: 'Màu tím hoa cà quý phái, dùng nhuộm xôi ngũ sắc và khăn thổ cẩm.'
  },
  {
    id: 'hoang_dang',
    name: 'Cây hoàng đằng (Fibraurea tinctoria)',
    folkName: 'Vàng đắng',
    source: 'Rừng già Hoàng Liên Sơn',
    baseColor: '#CA8A04',
    rgbBase: [202, 138, 4],
    chemicalPigment: 'Berberin alkaloid',
    description: 'Màu vàng chanh sáng, vừa là dược liệu quý vừa là chất nhuộm bắt màu cao.'
  }
];

// Mordants (Chất hãm/định màu)
interface Mordant {
  id: string;
  name: string;
  type: string;
  phValue: number;
  effect: string;
  rgbShift: [number, number, number]; // color modifier
}

const MORDANTS: Mordant[] = [
  {
    id: 'tro_bep',
    name: 'Nước tro bếp sạch (Kiềm nhẹ)',
    type: 'Kiềm tự nhiên (K2CO3)',
    phValue: 10.5,
    effect: 'Tạo môi trường kiềm giúp hòa tan khử chàm; đẩy màu trầm sâu và bền.',
    rgbShift: [-10, -5, +5]
  },
  {
    id: 'chanh_rung',
    name: 'Nước cốt chanh rừng / Quả chua (Axit)',
    type: 'Axit hữu cơ (Citric acid)',
    phValue: 3.5,
    effect: 'Chuyển sắc thái anthocyanin sang đỏ tươi rực, làm sáng sợi vải.',
    rgbShift: [+25, -15, -10]
  },
  {
    id: 'muoi_bien',
    name: 'Nước muối khoáng (Trung tính)',
    type: 'Chất trợ nở sợi (NaCl)',
    phValue: 7.0,
    effect: 'Tăng lực ion, giúp các phân tử sắc tố bám sâu đều vào lõi cellulose.',
    rgbShift: [0, 0, 0]
  },
  {
    id: 'phen_chua',
    name: 'Phèn chua truyền thống',
    type: 'Muối nhôm (KAl(SO4)2)',
    phValue: 4.2,
    effect: 'Tạo phức chelate với phân tử màu, tăng độ bền ánh sáng và giặt giũ đạt 5 sao.',
    rgbShift: [+10, +10, -5]
  }
];

interface SwatchSample {
  id: string;
  name: string;
  plantName: string;
  mordantName: string;
  dips: number;
  temp: number;
  hexColor: string;
  rgb: [number, number, number];
  fastnessScore: number;
}

export const Station06Dyeing: React.FC = () => {
  const station = STATIONS_DATA.find((s) => s.id === 6) || STATIONS_DATA[5];
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(6));

  useEffect(() => {
    markStationVisited(6);
    setIsCompleted(getCompletedStations().includes(6));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(6));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

  // Experiment States
  const [selectedPlantId, setSelectedPlantId] = useState<string>('cham');
  const [selectedMordantId, setSelectedMordantId] = useState<string>('tro_bep');
  const [dipsCount, setDipsCount] = useState<number>(3); // 1 to 8 dips
  const [bathTemp, setBathTemp] = useState<number>(60); // 25°C to 90°C
  const [steepMinutes, setSteepMinutes] = useState<number>(30); // 10 to 60 mins
  const [fabricType, setFabricType] = useState<'cotton' | 'linen' | 'silk'>('linen'); // Vải lanh H'Mông, Bông thô, Lụa tơ tằm

  // Simulation interaction state
  const [isFabricDipped, setIsFabricDipped] = useState<boolean>(false);
  const [isOxidizing, setIsOxidizing] = useState<boolean>(false);
  const [savedSwatches, setSavedSwatches] = useState<SwatchSample[]>([
    {
      id: 'swatch-init-1',
      name: 'Mẫu 1: Chàm nhúng 1 lần',
      plantName: 'Lá chàm',
      mordantName: 'Nước tro bếp',
      dips: 1,
      temp: 45,
      hexColor: '#6B8CA8',
      rgb: [107, 140, 168],
      fastnessScore: 3.2,
    },
    {
      id: 'swatch-init-2',
      name: 'Mẫu 2: Chàm nhúng 5 lần truyền thống',
      plantName: 'Lá chàm',
      mordantName: 'Nước tro bếp',
      dips: 5,
      temp: 60,
      hexColor: '#19324C',
      rgb: [25, 50, 76],
      fastnessScore: 4.8,
    }
  ]);

  // Step 3 & 7 Forms
  const [selectedPrediction, setSelectedPrediction] = useState<string>(station.steps.prediction.options[0]?.id || 'p1');
  const [notes, setNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentPlant = DYE_PLANTS.find((p) => p.id === selectedPlantId) || DYE_PLANTS[0];
  const currentMordant = MORDANTS.find((m) => m.id === selectedMordantId) || MORDANTS[0];

  // Calculate resulting fabric color based on plant, mordant, dips, temp, and fabric type
  const calculateResultingColor = () => {
    const [r0, g0, b0] = currentPlant.rgbBase;
    const [dr, dg, db] = currentMordant.rgbShift;

    // Intensity factor based on dips: 1 dip is washed out, 8 dips is saturated and deep
    const dipFactor = Math.min(1.0, 0.4 + (dipsCount / 8) * 0.6);
    // Temperature effect: higher temp increases extraction rate up to 75°C
    const tempFactor = bathTemp >= 50 && bathTemp <= 80 ? 1.05 : 0.9;
    // Time effect
    const timeFactor = Math.min(1.1, 0.8 + (steepMinutes / 60) * 0.3);

    // Fabric affinity
    const fabricAffinity = fabricType === 'silk' ? 1.15 : fabricType === 'linen' ? 1.0 : 0.92;

    const netFactor = dipFactor * tempFactor * timeFactor * fabricAffinity;

    // In natural dyeing, more dips make colors darker (lower RGB) and richer
    const darken = Math.max(0.25, 1.25 - dipsCount * 0.11);

    let r = Math.round(Math.min(255, Math.max(10, (r0 * darken + dr) * (netFactor > 1 ? 0.95 : 1.05))));
    let g = Math.round(Math.min(255, Math.max(10, (g0 * darken + dg) * (netFactor > 1 ? 0.95 : 1.05))));
    let b = Math.round(Math.min(255, Math.max(10, (b0 * darken + db) * (netFactor > 1 ? 0.95 : 1.05))));

    // If currently dipped in liquid before air oxidation for indigo
    if (isFabricDipped && selectedPlantId === 'cham') {
      // Leuco-indigo in vat is yellowish-green before air oxidation!
      r = Math.round(r * 0.4 + 110);
      g = Math.round(g * 0.6 + 130);
      b = Math.round(b * 0.2 + 40);
    }

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    
    // Fastness (1 to 5 stars)
    const fastness = Math.min(5, Math.max(2, Math.round((2.5 + (dipsCount * 0.25) + (selectedMordantId === 'phen_chua' || selectedMordantId === 'tro_bep' ? 0.8 : 0.2)) * 10) / 10));

    // Approximate CIE L* lightness (0 to 100)
    const lightness = Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) / 2.55);

    return {
      hex,
      rgb: [r, g, b] as [number, number, number],
      fastness,
      lightness,
    };
  };

  const currentColor = calculateResultingColor();

  const handleDipToggle = () => {
    if (!isFabricDipped) {
      setIsFabricDipped(true);
      setIsOxidizing(false);
    } else {
      setIsFabricDipped(false);
      setIsOxidizing(true);
      setTimeout(() => {
        setIsOxidizing(false);
      }, 1600);
    }
  };

  const handleSaveSwatch = () => {
    const newSwatch: SwatchSample = {
      id: `swatch-${Date.now()}`,
      name: `Mẫu ${savedSwatches.length + 1}: ${currentPlant.folkName} (${dipsCount} lần)`,
      plantName: currentPlant.folkName,
      mordantName: currentMordant.name,
      dips: dipsCount,
      temp: bathTemp,
      hexColor: currentColor.hex,
      rgb: currentColor.rgb,
      fastnessScore: currentColor.fastness,
    };
    setSavedSwatches([newSwatch, ...savedSwatches.slice(0, 4)]);
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 6,
      stationTitle: station.title,
      hypothesis: notes || `Khảo sát độ bắt màu của ${currentPlant.name} với chất định màu ${currentMordant.name}`,
      selectedPrediction,
      changedVariables: {
        plant: currentPlant.name,
        mordant: currentMordant.name,
        dips: dipsCount,
        bathTempC: bathTemp,
        steepMinutes,
        fabricType
      },
      recordedResults: {
        'Mã màu HEX': currentColor.hex,
        'Giá trị RGB': `rgb(${currentColor.rgb.join(', ')})`,
        'Độ sáng L*': `${currentColor.lightness}%`,
        'Độ bền màu giặt (1-5 sao)': `${currentColor.fastness}/5.0`,
        'Độ pH dung dịch': currentMordant.phValue,
      },
      observationNotes: `Nhúng ${dipsCount} lần, nhiệt độ ${bathTemp}°C. Vải ${fabricType === 'linen' ? 'lanh dệt thủ công' : fabricType === 'silk' ? 'tơ tằm' : 'bông thô'}. Màu sắc đồng đều, phản ứng chuyển màu theo nồng độ sắc tố.`,
      reflectionAnswers: station.steps.reflection.culturalConnection,
      isVerifiedRealData: false,
    });
    setSaveSuccessMsg(`Đã ghi nhận mẫu vải vào Nhật ký của học sinh ${student}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={5} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
              TRẠM 06
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">Hóa học & Quang học sắc tố</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">Vùng cao Sa Pa, Yên Bái & Mường</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(6)}
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
          Nhuộm vải – Khoa học màu sắc tự nhiên
        </h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">
          Thí nghiệm trích ly sắc tố thực vật bản địa (chàm, nghệ, củ nâu, lá cẩm), môi trường kiềm hóa tro bếp và cơ chế oxy hóa gắn màu trên thớ sợi lanh.
        </p>

        {/* Quick Question Curiosity Callout */}
        <div className="mt-4 p-3 bg-[#FBF6EA] border border-[#D6AA55]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#20332D]">
            <span className="font-bold text-[#A94438] bg-[#FBF0EE] px-2 py-0.5 rounded-md">CÂU HỎI KHÁM PHÁ</span>
            <span>Làm thế nào để tấm vải thổ cẩm lên màu đậm đà và bền bỉ qua năm tháng?</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className="font-bold text-[#174C3C] hover:underline flex items-center gap-1 shrink-0"
          >
            Thử nghiệm ngay <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-Step Navigation */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-[#E8E2D5]">
        {[
          { id: 1, label: '1. Khám phá bối cảnh' },
          { id: 2, label: '2. Câu hỏi STEM' },
          { id: 3, label: '3. Dự đoán' },
          { id: 4, label: '4. Thí nghiệm trực tiếp (Vại nhuộm ảo)' },
          { id: 5, label: '5. Phân tích quang phổ' },
          { id: 6, label: '6. Thử thách' },
          { id: 7, label: '7. Phản tư & Nhật ký' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStep(tab.id)}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl border-b-2 transition-all ${
              activeStep === tab.id
                ? 'border-[#174C3C] text-[#174C3C] bg-white shadow-2xs'
                : 'border-transparent text-[#556D65] hover:text-[#20332D] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 4: INTERACTIVE DIRECT EXPERIMENT */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Experiment Canvas (7 cols): The Dye Vat, Suspended Cloth & Liquid Animation */}
            <div className="lg:col-span-7 bg-[#1F2B25] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#E8E2D5] font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#D6AA55]" />
                  PHÒNG THÍ NGHIỆM VẠI NHUỘM DÂN GIAN
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isFabricDipped ? 'bg-amber-400 text-slate-900' : isOxidizing ? 'bg-emerald-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isFabricDipped ? 'Đang ngâm trong vại' : isOxidizing ? 'Đang oxy hóa ngoài không khí' : 'Sẵn sàng nhúng vải'}
                </span>
              </div>

              {/* Graphic Display: Clay Vat + Loom Fabric */}
              <div className="relative w-full h-80 bg-gradient-to-b from-[#18231E] to-[#121B16] rounded-xl border border-white/10 flex flex-col items-center justify-between p-4 overflow-hidden">
                {/* Background ambient lighting */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-700"
                  style={{ backgroundColor: currentPlant.baseColor }}
                />

                {/* Bamboo Hanging Rack at Top */}
                <div className="relative w-full max-w-xs flex flex-col items-center z-10">
                  {/* Bamboo pole */}
                  <div className="w-full h-3.5 bg-gradient-to-r from-[#854D0E] via-[#A16207] to-[#854D0E] rounded-full shadow-md border-b border-[#713F12] relative">
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-[#451A03]/50" />
                    <div className="absolute right-8 top-0 bottom-0 w-1 bg-[#451A03]/50" />
                  </div>

                  {/* Suspended Fabric Strip */}
                  <div 
                    className="relative transition-all duration-700 ease-in-out cursor-pointer group"
                    style={{
                      transform: isFabricDipped ? 'translateY(70px)' : 'translateY(8px)',
                    }}
                    onClick={handleDipToggle}
                    title="Bấm vào tấm vải để nhúng hoặc vớt lên khỏi vại"
                  >
                    {/* Hanging ropes */}
                    <div className="flex justify-between w-40 px-4">
                      <div className="w-0.5 h-6 bg-[#D6AA55]" />
                      <div className="w-0.5 h-6 bg-[#D6AA55]" />
                    </div>

                    {/* Cloth body with indigenous weave texture */}
                    <div 
                      className="w-40 h-36 rounded-b-md shadow-xl border border-white/20 relative overflow-hidden transition-colors duration-700"
                      style={{
                        backgroundColor: isFabricDipped && selectedPlantId === 'cham' ? '#657E52' : currentColor.hex,
                      }}
                    >
                      {/* Subdued fabric weave pattern */}
                      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
                      {/* Thổ cẩm decorative border strip */}
                      <div className="absolute bottom-2 left-0 right-0 h-4 bg-black/25 flex items-center justify-around px-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rotate-45 bg-[#D6AA55]/80" />
                        ))}
                      </div>

                      {/* Fabric Type Label */}
                      <div className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold text-white/80 tracking-wider">
                        {fabricType === 'linen' ? 'VẢI LANH H\'MÔNG' : fabricType === 'silk' ? 'LỤA TƠ TẰM' : 'VẢI BÔNG THÔ'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: Earthenware Vat (Chậu sành/đồng gốm nung) */}
                <div className="relative w-72 h-32 flex flex-col items-center justify-end z-20">
                  {/* Vat Opening & Liquid Surface */}
                  <div className="w-64 h-12 rounded-full border-4 border-[#5E3A18] bg-[#3B230E] relative overflow-hidden shadow-inner flex items-center justify-center">
                    {/* Liquid pool */}
                    <div 
                      className="w-full h-full opacity-90 transition-colors duration-500 relative flex items-center justify-center"
                      style={{ backgroundColor: currentPlant.baseColor }}
                    >
                      {/* Liquid bubbles & ripples */}
                      <div className="absolute inset-0 flex items-center justify-around opacity-60">
                        <span className="w-3 h-3 rounded-full bg-white/20 animate-ping" />
                        <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse delay-200" />
                        <span className="w-2.5 h-2.5 rounded-full bg-white/20 animate-bounce delay-500" />
                      </div>
                      <span className="text-[10px] font-bold text-white/90 drop-shadow-sm font-mono">
                        Dung dịch: {currentPlant.folkName} · pH {currentMordant.phValue}
                      </span>
                    </div>
                  </div>

                  {/* Clay Vat body */}
                  <div className="w-72 h-20 bg-gradient-to-b from-[#4A2810] via-[#5C3214] to-[#361B09] rounded-b-3xl border-x-4 border-b-4 border-[#301606] shadow-2xl relative flex items-center justify-center">
                    {/* Cultural carved motif on pot */}
                    <div className="text-[11px] font-bold text-[#D6AA55]/70 tracking-widest uppercase">
                      Chậu gốm nung · {bathTemp}°C
                    </div>
                  </div>
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-3 right-3 z-30">
                  <button
                    type="button"
                    onClick={handleDipToggle}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                      isFabricDipped 
                        ? 'bg-[#A94438] text-white hover:bg-[#8D372C]' 
                        : 'bg-[#D6AA55] text-[#20332D] hover:bg-[#C29744]'
                    }`}
                  >
                    <Droplets className="w-4 h-4" />
                    {isFabricDipped ? 'Vớt vải ra phơi nắng & oxy hóa' : 'Nhúng tấm vải vào chậu'}
                  </button>
                </div>
              </div>

              {/* Real-time Spectrophotometry & Swatch Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Mã màu tạo thành</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="w-5 h-5 rounded-md border border-white/40 shadow-xs shrink-0" 
                      style={{ backgroundColor: currentColor.hex }}
                    />
                    <span className="font-mono font-bold text-[#E8E2D5]">{currentColor.hex}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Độ sáng L* (CIE)</div>
                  <div className="font-mono font-bold text-amber-300 mt-1">
                    {currentColor.lightness}% (Tối màu dần)
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Độ bền màu giặt</div>
                  <div className="font-bold text-emerald-400 mt-1">
                    {'★'.repeat(Math.round(currentColor.fastness))}{'☆'.repeat(5 - Math.round(currentColor.fastness))} ({currentColor.fastness}/5)
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Độ kiềm dung dịch</div>
                  <div className="font-mono font-bold text-sky-300 mt-1">
                    pH {currentMordant.phValue} ({currentMordant.type})
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-[#174C3C]" />
                  Công thức nhuộm tự nhiên
                </h3>
                <span className="text-[11px] text-[#556D65]">Thay đổi tham số để quan sát</span>
              </div>

              {/* 1. Chọn loại lá/củ thực vật */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D] flex items-center justify-between">
                  <span>1. Nguyên liệu thảo mộc:</span>
                  <span className="text-[#174C3C] font-semibold">{currentPlant.folkName}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DYE_PLANTS.map((plant) => (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => setSelectedPlantId(plant.id)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        selectedPlantId === plant.id
                          ? 'border-[#174C3C] bg-[#EBF2EE] text-[#174C3C] font-bold shadow-2xs'
                          : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65] hover:bg-white'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                        style={{ backgroundColor: plant.baseColor }}
                      />
                      <span className="truncate text-[11px]">{plant.folkName}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#556D65] italic leading-tight pt-0.5">
                  Sắc tố chính: {currentPlant.chemicalPigment}
                </p>
              </div>

              {/* 2. Chọn chất định màu / hãm màu (Mordant) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D] flex items-center justify-between">
                  <span>2. Chất định màu (Trợ nhuộm):</span>
                  <span className="text-[#A94438] font-bold">pH {currentMordant.phValue}</span>
                </label>
                <select
                  value={selectedMordantId}
                  onChange={(e) => setSelectedMordantId(e.target.value)}
                  className="w-full min-h-[42px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#20332D] focus:ring-2 focus:ring-[#174C3C]"
                >
                  {MORDANTS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} – {m.type}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#556D65] leading-tight">
                  {currentMordant.effect}
                </p>
              </div>

              {/* 3. Số lần nhúng nhuộm & phơi oxy hóa */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D] flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-[#D6AA55]" />
                    3. Số chu kỳ nhúng & phơi khô:
                  </span>
                  <span className="font-mono text-[#174C3C] font-extrabold text-sm bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                    {dipsCount} lần
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={dipsCount}
                  onChange={(e) => setDipsCount(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>1 lần (nhạt, dễ trôi)</span>
                  <span>4 lần (tiêu chuẩn)</span>
                  <span>8 lần (xanh thẫm huyền thoại)</span>
                </div>
              </div>

              {/* 4. Nhiệt độ & Thời gian ngâm */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#20332D]">Nhiệt độ chậu:</span>
                    <span className="font-mono text-[#174C3C] font-bold">{bathTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="90"
                    step="5"
                    value={bathTemp}
                    onChange={(e) => setBathTemp(parseInt(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#20332D]">Thời gian ngâm:</span>
                    <span className="font-mono text-[#174C3C] font-bold">{steepMinutes} phút</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={steepMinutes}
                    onChange={(e) => setSteepMinutes(parseInt(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                </div>
              </div>

              {/* 5. Chọn loại sợi vải */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D]">Loại sợi dệt truyền thống:</label>
                <div className="flex gap-2">
                  {[
                    { id: 'linen', label: 'Vải lanh H\'Mông' },
                    { id: 'cotton', label: 'Vải bông thô' },
                    { id: 'silk', label: 'Lụa tơ tằm' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFabricType(f.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        fabricType === f.id
                          ? 'border-[#174C3C] bg-[#174C3C] text-white shadow-2xs'
                          : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65] hover:bg-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={handleSaveSwatch}
                  className="flex-1 min-h-[44px] bg-[#FAF7F0] border border-[#E8E2D5] hover:bg-white text-[#174C3C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-[#D6AA55]" /> Lưu mẫu thử
                </button>

                <button
                  type="button"
                  onClick={handleSaveToJournal}
                  className="flex-1 min-h-[44px] bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D6AA55]" /> Ghi vào nhật ký
                </button>
              </div>
            </div>
          </div>

          {/* Test Swatch Comparison Matrix: Thử lại và so sánh các lần thử */}
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#174C3C]">
                  Bảng so sánh các mẫu vải thử nghiệm (Swatches Comparison)
                </h3>
                <p className="text-xs text-[#556D65]">
                  Học sinh thử lại các tỷ lệ khác nhau và quan sát sự biến chuyển màu sắc trực quan.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#8A9E96]">
                {savedSwatches.length} mẫu đã lưu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {savedSwatches.map((sw) => (
                <div key={sw.id} className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-14 rounded-lg shadow-md border border-black/10 shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: sw.hexColor }}
                    >
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#20332D] truncate">{sw.name}</div>
                      <div className="font-mono text-[11px] text-[#174C3C] font-semibold">{sw.hexColor}</div>
                      <div className="text-[10px] text-[#556D65]">{sw.mordantName}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E8E2D5] text-[#556D65]">
                    <span>{sw.dips} lần nhúng · {sw.temp}°C</span>
                    <span className="font-bold text-emerald-600">★ {sw.fastnessScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Math & Chemistry Behind the Scenes */}
          <FormulaAccordion
            formula={station.keyFormula}
            description={station.formulaDescription}
            title="Xem công thức quang phổ & Hóa học đằng sau"
            principles={station.scientificBasis.principles}
            assumptions={station.scientificBasis.assumptions}
            variables={station.scientificBasis.variables}
            defaultOpen={false}
          />
        </div>
      )}

      {/* STEP 1: Context */}
      {activeStep === 1 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#D6AA55]" />
            Bối cảnh di sản & Hóa học dân gian
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed font-normal">{station.steps.context.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {DYE_PLANTS.slice(0, 3).map((plant) => (
              <div key={plant.id} className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: plant.baseColor }} />
                  <span className="font-bold text-xs text-[#174C3C]">{plant.name}</span>
                </div>
                <p className="text-xs text-[#556D65] leading-relaxed">{plant.description}</p>
                <div className="text-[11px] text-[#A94438] font-semibold">{plant.source}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs"
            >
              Tiếp tục: Bước 2 – Câu hỏi STEM →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STEM Question */}
      {activeStep === 2 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Vấn đề khoa học đặt ra</h2>
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border-l-4 border-[#174C3C] text-base font-semibold text-[#20332D] leading-relaxed">
            "{station.steps.stemQuestion.question}"
          </div>
          <p className="text-sm text-[#556D65]">{station.steps.stemQuestion.contextExplanation}</p>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C]"
            >
              Tiếp tục: Bước 3 – Đưa ra dự đoán →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Prediction */}
      {activeStep === 3 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Dự đoán khoa học</h2>
          <p className="text-sm text-[#20332D]">{station.steps.prediction.prompt}</p>
          <div className="space-y-3">
            {station.steps.prediction.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPrediction === opt.id
                    ? 'border-[#174C3C] bg-[#EBF2EE]'
                    : 'border-[#E8E2D5] bg-white hover:bg-[#FAF7F0]'
                }`}
              >
                <input
                  type="radio"
                  name="prediction"
                  value={opt.id}
                  checked={selectedPrediction === opt.id}
                  onChange={(e) => setSelectedPrediction(e.target.value)}
                  className="mt-1 accent-[#174C3C]"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#20332D]">{opt.label}</div>
                  <div className="text-xs text-[#556D65] mt-1">{opt.explanation}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="text-xs font-bold text-[#556D65]"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C]"
            >
              Vào làm thí nghiệm kiểm chứng →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5, 6, 7: Simplified & Direct */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Phân tích dữ liệu & Phổ màu</h2>
          <p className="text-sm text-[#556D65]">
            Màu chàm đậm sinh ra do hiện tượng tích tụ nhiều lớp phân tử indigotin không tan trong nước, bám cơ học xen kẽ các vi sợi cellulose của lanh.
          </p>
          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] space-y-2 text-xs">
            <div className="font-bold text-[#174C3C]">Khoảng cách màu sắc sai khác CIE-Lab:</div>
            <p className="text-[#556D65]">
              Khi số lần nhúng tăng từ 1 lên 5, giá trị độ sáng L* giảm từ 58% xuống 24%, tạo ra độ tương phản sâu thẳm đặc trưng của trang phục thổ cẩm vùng cao.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C]"
            >
              Tiếp tục: Bước 6 – Thử thách →
            </button>
          </div>
        </div>
      )}

      {activeStep === 6 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">{station.steps.challenge.title}</h2>
          <p className="text-sm text-[#20332D]">{station.steps.challenge.scenario}</p>
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-[#20332D]">Mục tiêu hoàn thành:</div>
            <ul className="list-disc list-inside space-y-1 text-[#556D65]">
              {station.steps.challenge.criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C]"
            >
              Tiếp tục: Bước 7 – Phản tư & Nhật ký →
            </button>
          </div>
        </div>
      )}

      {activeStep === 7 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Phản tư văn hóa & Nhật ký khoa học</h2>
          <p className="text-sm text-[#20332D] leading-relaxed">
            {station.steps.reflection.culturalConnection}
          </p>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#20332D] uppercase tracking-wider">
              Ghi chú quan sát hoặc câu trả lời của em:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi lại nhận xét về màu sắc khi thay đổi nhiệt độ hoặc số lần nhúng nhuộm..."
              className="w-full p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#20332D] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => toggleStationCompleted(6)}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                isCompleted 
                  ? 'bg-[#174C3C] text-white border-[#174C3C]' 
                  : 'bg-white border-[#E8E2D5] text-[#556D65]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
              {isCompleted ? 'Trạm đã hoàn thành' : 'Đánh dấu hoàn thành trạm'}
            </button>

            <button
              type="button"
              onClick={handleSaveToJournal}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#D6AA55]" />
              Lưu toàn bộ dữ liệu vào Nhật ký học sinh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
