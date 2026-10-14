import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  HelpCircle, 
  Award, 
  Activity,
  Volume2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { StationMeta } from '../types';
import { STATIONS_DATA } from '../data/stationsData';
import { 
  saveResearchLog, 
  getCurrentStudent, 
  markStationVisited, 
  getCompletedStations, 
  toggleStationCompleted 
} from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { MuongPatternBorder } from '../components/MuongPatternBorder';
import { FormulaAccordion } from '../components/FormulaAccordion';

interface GenericStationLabProps {
  stationId: number;
}

// Friendly Vietnamese labels and unit formatters for computed keys
const RESULT_LABELS: Record<string, { label: string; unit?: string }> = {
  deflectionMm: { label: 'Độ võng cấu trúc', unit: 'mm' },
  maxStressMPa: { label: 'Ứng suất kéo cực đại', unit: 'MPa' },
  efficiencyScore: { label: 'Chỉ số bền vững', unit: 'điểm/100' },
  rpm: { label: 'Tốc độ quay của cọn', unit: 'vòng/phút' },
  torqueNm: { label: 'Mô-men quay thủy lực', unit: 'N·m' },
  flowLitersPerMin: { label: 'Lưu lượng nước múc lên', unit: 'Lít/phút' },
  heatFlux: { label: 'Mật độ dòng nhiệt truyền', unit: 'W/m²' },
  estimatedCookingMin: { label: 'Thời gian cơm chín ước tính', unit: 'phút' },
  coreTemp: { label: 'Nhiệt độ tâm hạt gạo', unit: '' },
  momentMax: { label: 'Mô-men uốn tối đa dầm cầu', unit: 'N·m' },
  safeFactor: { label: 'Đánh giá an toàn kết cấu', unit: '' },
  rawSoilLoss: { label: 'Lượng đất xói mòn nếu để đồi trọc', unit: 'tấn/ha' },
  reducedSoilLoss: { label: 'Lượng đất giữ lại nhờ bậc thang', unit: 'tấn/ha' },
  reductionPct: { label: 'Tỷ lệ chống rửa trôi đất', unit: '%' },
  runoffSpeed: { label: 'Vận tốc dòng chảy xuôi dốc', unit: 'm/s' },
  absorbance: { label: 'Độ hấp thụ quang phổ (A)', unit: 'OD' },
  concentrationGPerL: { label: 'Nồng độ chất màu chàm', unit: 'g/L' },
  d2Ideal: { label: 'Khoảng cách thúng sau d₂ lý tưởng', unit: 'mét' },
  totalWeightN: { label: 'Tổng trọng lượng đè lên vai', unit: 'Newton (N)' },
  isBalanced: { label: 'Trạng thái cân bằng', unit: '' },
  barFrequency: { label: 'Tần số nốt đàn tre (f)', unit: 'Hz' },
  node1: { label: 'Vị trí điểm nút dao động 1', unit: 'cm' },
  node2: { label: 'Vị trí điểm nút dao động 2', unit: 'cm' },
  volLiters: { label: 'Dung tích chứa của nơm cá', unit: 'Lít' },
  lateralAreaM2: { label: 'Diện tích mặt nan quanh nơm', unit: 'm²' },
  estimatedNanCount: { label: 'Số nan tre cật ước tính', unit: 'nan' },
  trainAccuracy: { label: 'Độ chính xác nhận diện lá', unit: '%' },
  leafClassified: { label: 'Loài cây được định danh', unit: '' },
  drainVelocityMs: { label: 'Vận tốc nước xả tràn', unit: 'm/s' },
  drainTimeSec: { label: 'Thời gian thoát sạch nước', unit: 'giây' },
  collectedWaterM3: { label: 'Lượng nước hứng vào bể', unit: 'm³/h' },
};

export const GenericStationLab: React.FC<GenericStationLabProps> = ({ stationId }) => {
  const station = STATIONS_DATA.find((s) => s.id === stationId) || STATIONS_DATA[3];
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(stationId));

  useEffect(() => {
    markStationVisited(stationId);
    setIsCompleted(getCompletedStations().includes(stationId));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(stationId));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, [stationId]);

  // General simulation parameters per station with proper initial states
  const [param1, setParam1] = useState<number>(50);
  const [param2, setParam2] = useState<number>(50);
  const [param3, setParam3] = useState<number>(50);
  const [selectMode, setSelectMode] = useState<string>('default');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [animTick, setAnimTick] = useState<number>(0);

  // Predictions and Notes
  const [selectedPrediction, setSelectedPrediction] = useState<string>(station.steps.prediction.options[0]?.id || 'p1');
  const [hypothesisText, setHypothesisText] = useState<string>('');
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [reflectionAnswer, setReflectionAnswer] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Animation ticker for active motion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setAnimTick((t) => (t + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Reset parameters when station changes
  useEffect(() => {
    setActiveStep(4);
    setIsRunning(true);
    if (stationId === 4) { setParam1(3); setParam2(15); setSelectMode('mat_cao'); } // Weaving
    else if (stationId === 5) { setParam1(2.5); setParam2(1.8); setParam3(14); } // Water wheel
    else if (stationId === 8) { setParam1(8); setParam2(350); } // Cơm lam bamboo thickness mm, Fire Temp C
    else if (stationId === 9) { setParam1(6); setParam2(1200); setSelectMode('co_giang'); } // Bamboo Bridge
    else if (stationId === 10) { setParam1(30); setParam2(5); setParam3(80); } // Terrace
    else if (stationId === 11) { setParam1(15); setParam2(2); } // Indigo colorimetry (cuvette length & conc)
    else if (stationId === 12) { setParam1(20); setParam2(25); setParam3(0.5); } // Carrying pole
    else if (stationId === 13) { setParam1(35); setParam2(6); } // Bamboo instrument bar
    else if (stationId === 14) { setParam1(10); setParam2(35); setParam3(65); } // Fish trap (Nơm)
    else if (stationId === 15) { setParam1(70); setParam2(1); } // Leaf dataset split & traits
  }, [stationId]);

  // Audio tone for Station 13 (Nhạc cụ tre)
  const handlePlayTone = (freq: number) => {
    audioEngine.playSyntheticGong([
      { id: 1, name: 'Mode 1', frequency: freq, amplitude: 0.9, decay: 1.2, phase: 0 },
      { id: 2, name: 'Mode 2', frequency: freq * 2.75, amplitude: 0.25, decay: 0.8, phase: 0.4 },
    ], 0.8, 'soft');
  };

  // Scientific calculation engines per station
  const computeStationData = () => {
    switch (stationId) {
      case 4: { // Đan lát Mây tre: Structure & strength
        const density = param1; // 1 - 5 nan/cm
        const loadKg = param2; // 5 - 30 kg
        const factor = selectMode === 'mat_cao' ? 0.5 : selectMode === 'nong_doi' ? 0.75 : 1.0;
        const deflectionMm = Math.round(((loadKg * 1.8) / (density * 1.5)) * factor * 10) / 10;
        const maxStressMPa = Math.round((loadKg * 9.81 * factor * 1.2) * 10) / 10;
        return { deflectionMm, maxStressMPa, efficiencyScore: (100 - deflectionMm * 2).toFixed(0) };
      }
      case 5: { // Guồng nước Thủy lực
        const radius = param1; // 1.5 - 4.5 m
        const waterSpeed = param2; // 0.8 - 3.0 m/s
        const blades = param3; // 8 - 20
        const omega = (waterSpeed * 0.65) / radius;
        const rpm = Math.round((omega * 60) / (2 * Math.PI) * 10) / 10;
        const torqueNm = Math.round(1000 * 0.15 * waterSpeed * radius * 10) / 10;
        const flowLitersPerMin = Math.round(blades * (rpm / 60) * 14 * 10) / 10;
        return { rpm, torqueNm, flowLitersPerMin };
      }
      case 8: { // Cơm lam: Conduction & Fourier heat flux
        const wallThicknessMm = param1; // 4 - 15 mm
        const fireTemp = param2; // 250 - 500 C
        const heatFlux = Math.round((0.25 * (fireTemp - 100)) / (wallThicknessMm / 1000));
        const estimatedCookingMin = Math.round(30 + wallThicknessMm * 2.2);
        return { heatFlux, estimatedCookingMin, coreTemp: '98°C - 100°C (Hồ hóa dẻo thơm)' };
      }
      case 9: { // Cầu tre: Truss mechanics
        const spanM = param1; // 3 - 9 m
        const loadN = param2; // 300 - 2500 N
        const isBraced = selectMode === 'co_giang';
        const momentMax = Math.round((loadN * spanM) / 4);
        const deflectionMm = Math.round(((loadN * Math.pow(spanM, 3)) / (48 * 14e9 * 4e-6)) * (isBraced ? 0.35 : 1.0) * 1000);
        return { momentMax, deflectionMm: Math.min(80, deflectionMm), safeFactor: (deflectionMm < 35 ? 'An toàn chịu tải' : 'Võng quá mức - Cần thêm thanh giằng') };
      }
      case 10: { // Ruộng bậc thang: Runoff & soil loss
        const slopeDeg = param1; // 15 - 45 deg
        const terraceCount = param2; // 1 - 8
        const rainfall = param3; // 40 - 140 mm/h
        const slopeFactor = Math.sin((slopeDeg * Math.PI) / 180);
        const rawSoilLoss = Math.round(rainfall * slopeFactor * 0.85);
        const reducedSoilLoss = Math.round(rawSoilLoss / terraceCount);
        const runoffSpeed = Math.round((2.5 * slopeFactor) / Math.sqrt(terraceCount) * 10) / 10;
        return { rawSoilLoss, reducedSoilLoss, reductionPct: Math.round(((rawSoilLoss - reducedSoilLoss) / rawSoilLoss) * 100), runoffSpeed };
      }
      case 11: { // Đo màu dung dịch chàm & Phổ trắc quang
        const pathLengthCm = param1; // 1 - 5 cm
        const concGPerL = param2; // 0.5 - 5 g/L
        const epsilon = 0.42;
        const absorbance = Math.round((epsilon * concGPerL * pathLengthCm) * 100) / 100;
        return { absorbance, concentrationGPerL: concGPerL };
      }
      case 12: { // Gùi & đòn gánh: Torque balance
        const m1 = param1; // 5 - 35 kg
        const m2 = param2; // 5 - 35 kg
        const d1 = param3; // 0.2 - 0.8 m
        const d2Ideal = Math.round(((m1 * d1) / m2) * 100) / 100;
        const totalWeightN = Math.round((m1 + m2 + 2) * 9.81);
        const torqueDiff = Math.round(Math.abs(m1 * 9.81 * d1 - m2 * 9.81 * d2Ideal) * 10) / 10;
        return { d2Ideal, totalWeightN, isBalanced: torqueDiff < 0.5 ? 'Hoàn toàn cân bằng' : 'Đang bị lệch đòn' };
      }
      case 13: { // Nhạc cụ tre: Vibrating bar
        const lengthCm = param1; // 15 - 50 cm
        const thicknessMm = param2; // 3 - 10 mm
        const f = Math.round((1.03 * (thicknessMm / 1000) / Math.pow(lengthCm / 100, 2)) * Math.sqrt(12e9 / 750));
        const nodePositionCm = Math.round(lengthCm * 0.224 * 10) / 10;
        return { barFrequency: f, node1: nodePositionCm, node2: Math.round((lengthCm - nodePositionCm) * 10) / 10 };
      }
      case 14: { // Nơm cá: Conical geometry
        const rTop = param1; // cm
        const rBot = param2; // cm
        const height = param3; // cm
        const r1 = rBot / 100;
        const r2 = rTop / 100;
        const h = height / 100;
        const volLiters = Math.round(((Math.PI * h) / 3) * (r1 * r1 + r1 * r2 + r2 * r2) * 1000 * 10) / 10;
        const slantHeight = Math.sqrt(h * h + Math.pow(r1 - r2, 2));
        const lateralAreaM2 = Math.round(Math.PI * (r1 + r2) * slantHeight * 100) / 100;
        const estimatedNanCount = Math.round((2 * Math.PI * rBot * 10) / 12);
        return { volLiters, lateralAreaM2, estimatedNanCount };
      }
      case 15: { // Phân loại lá cây bản địa
        const trainSplitPct = param1; // 50 - 90 %
        const traitIdx = param2; // 1 to 3
        const accuracy = Math.round(Math.min(96, 68 + (trainSplitPct / 90) * 24 + (traitIdx * 2)));
        return { trainAccuracy: accuracy, leafClassified: traitIdx === 1 ? 'Lá cây Men rừng (Gân lông chim)' : traitIdx === 2 ? 'Lá chàm (Mép nguyên)' : 'Củ nâu (Hình tim)' };
      }
      default:
        return {};
    }
  };

  const computed = computeStationData();

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: station.id,
      stationTitle: station.title,
      hypothesis: hypothesisText || `Khảo sát thực nghiệm trạm ${station.numberStr}: ${station.title}`,
      selectedPrediction,
      changedVariables: { param1, param2, param3, selectMode },
      recordedResults: computed as Record<string, number | string>,
      observationNotes: challengeAnswer || 'Đã kiểm chứng thông số và ghi nhận quy luật biến thiên.',
      reflectionAnswers: reflectionAnswer || station.steps.reflection.culturalConnection,
      isVerifiedRealData: false,
    });
    setSaveSuccess(`Đã lưu dữ liệu vào Nhật ký học sinh ${student}!`);
    setTimeout(() => setSaveSuccess(null), 3500);
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
              TRẠM {station.numberStr}
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">{station.stemDomainLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">{station.locationContext}</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(stationId)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
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

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight">{station.title}</h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">{station.subtitle}</p>

        {/* Quick Question Curiosity Callout */}
        <div className="mt-4 p-3 bg-[#FBF6EA] border border-[#D6AA55]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#20332D]">
            <span className="font-bold text-[#A94438] bg-[#FBF0EE] px-2 py-0.5 rounded-md">CÂU HỎI KHÁM PHÁ</span>
            <span>{station.steps.stemQuestion.question}</span>
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
          { id: 4, label: '4. Thí nghiệm trực tiếp' },
          { id: 5, label: '5. Phân tích dữ liệu' },
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

      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* STEP 4: Interactive Simulation */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Canvas / SVG Interactive Panel (7 cols) */}
            <div className="lg:col-span-7 bg-[#1F2B25] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#E8E2D5] font-bold">MÔ HÌNH VẬT THỂ THÍ NGHIỆM TRỰC QUAN</span>
                <span className="text-[#D6AA55] font-bold">
                  {isRunning ? '● Đang hoạt động' : '○ Trạng thái tĩnh'}
                </span>
              </div>

              {/* Graphic Display Area */}
              <div className="relative w-full h-80 bg-gradient-to-b from-[#15221B] to-[#0A130E] rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                {/* Station 4: Weaving Weft & Warp */}
                {stationId === 4 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#16221B" rx="8" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line
                        key={`warp-${i}`}
                        x1={30 + i * 25}
                        y1="25"
                        x2={30 + i * 25}
                        y2="215"
                        stroke={selectMode === 'mat_cao' ? '#10B981' : '#F59E0B'}
                        strokeWidth={Math.max(2, 6 - param1)}
                      />
                    ))}
                    {Array.from({ length: 9 }).map((_, j) => (
                      <line
                        key={`weft-${j}`}
                        x1="20"
                        y1={35 + j * 21}
                        x2="320"
                        y2={35 + j * 21}
                        stroke="#E2E8F0"
                        strokeWidth="3.5"
                        strokeDasharray={selectMode === 'mat_cao' ? '12 8' : '16 6'}
                      />
                    ))}
                    <circle cx="170" cy="120" r={Math.min(35, param2 * 1.2)} fill="rgba(239, 68, 68, 0.4)" stroke="#EF4444" strokeWidth="2" />
                    <text x="170" y="124" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="bold">
                      Tải trọng {param2}kg
                    </text>
                    <text x="170" y="232" fill="#D6AA55" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Kiểu đan: {selectMode === 'mat_cao' ? 'Mắt cáo lục giác (Triaxial)' : 'Nong đôi truyền thống'}
                    </text>
                  </svg>
                )}

                {/* Station 5: Rotating Water Wheel (Cọn nước) */}
                {stationId === 5 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0C1A1E" rx="8" />
                    {/* Flowing Mountain River */}
                    <rect x="0" y="185" width="340" height="55" fill="#0369A1" opacity="0.6" />
                    <line x1="0" y1="185" x2="340" y2="185" stroke="#38BDF8" strokeWidth="2" strokeDasharray="10 8" />
                    
                    {/* Wooden support posts */}
                    <line x1="170" y1="125" x2="140" y2="235" stroke="#78350F" strokeWidth="5" />
                    <line x1="170" y1="125" x2="200" y2="235" stroke="#78350F" strokeWidth="5" />

                    {/* Rotating Wheel Group */}
                    <g transform={`translate(170, 125) rotate(${animTick * 3})`}>
                      <circle cx="0" cy="0" r={param1 * 22} fill="none" stroke="#CA8A04" strokeWidth="6" />
                      <circle cx="0" cy="0" r="14" fill="#713F12" />
                      {Array.from({ length: Math.round(param3) }).map((_, b) => {
                        const angle = (b * 360) / param3;
                        const rad = (angle * Math.PI) / 180;
                        const bx = Math.cos(rad) * param1 * 22;
                        const by = Math.sin(rad) * param1 * 22;
                        return (
                          <g key={b}>
                            <line x1="0" y1="0" x2={bx} y2={by} stroke="#854D0E" strokeWidth="3" />
                            {/* Water scoop tube (Ống bương múc nước vát góc) */}
                            <line
                              x1={bx}
                              y1={by}
                              x2={bx + Math.cos(rad + 0.6) * 16}
                              y2={by + Math.sin(rad + 0.6) * 16}
                              stroke="#D97706"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </g>
                        );
                      })}
                    </g>
                    <text x="170" y="30" fill="#38BDF8" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Tốc độ quay: {(computed as { rpm: number }).rpm} RPM · Lưu lượng: {(computed as { flowLitersPerMin: number }).flowLitersPerMin} L/phút
                    </text>
                  </svg>
                )}

                {/* Station 8: Cơm lam & Dẫn nhiệt ống tre nứa */}
                {stationId === 8 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#181311" rx="8" />
                    {/* Firepit flame at bottom */}
                    <path d="M 90,210 Q 120,165 150,210 Q 180,160 210,210 Q 230,170 250,210 Z" fill="#EF4444" className="animate-pulse" />
                    <path d="M 120,210 Q 170,175 220,210 Z" fill="#F59E0B" />
                    
                    {/* Green bamboo tube (Ống nứa tươi) */}
                    <g transform="translate(170, 110) rotate(-15)">
                      {/* Outer bamboo green skin */}
                      <rect x="-100" y="-22" width="200" height="44" rx="10" fill="#15803D" stroke="#166534" strokeWidth="3" />
                      {/* Inner bamboo wall thickness */}
                      <rect x="-95" y={-22 + param1} width="190" height={44 - param1 * 2} rx="6" fill="#FEF3C7" stroke="#CA8A04" strokeWidth="1.5" />
                      {/* Sticky rice core */}
                      <rect x="-90" y="-8" width="180" height="16" rx="4" fill="#F8FAFC" />
                      <text x="0" y="4" fill="#78350F" fontSize="9" textAnchor="middle" fontWeight="bold">
                        Gạo nếp nương
                      </text>
                    </g>

                    <text x="170" y="30" fill="#FDE047" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Độ dày thành tre: {param1}mm · Lửa than: {param2}°C
                    </text>
                  </svg>
                )}

                {/* Station 9: Cầu tre & Cơ học dầm giằng */}
                {stationId === 9 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#111827" rx="8" />
                    {/* Stream below */}
                    <path d="M 0,200 Q 170,180 340,200 L 340,240 L 0,240 Z" fill="#0369A1" opacity="0.6" />
                    {/* Rocky riverbanks */}
                    <polygon points="0,150 70,160 60,240 0,240" fill="#475569" />
                    <polygon points="340,150 270,160 280,240 340,240" fill="#475569" />

                    {/* Bridge Bamboo Deck with Deflection curve */}
                    {(() => {
                      const defl = Math.min(25, (computed as { deflectionMm: number }).deflectionMm * 0.4);
                      return (
                        <g>
                          {/* Bamboo Handrail */}
                          <path d={`M 60,110 Q 170,${110 + defl * 0.7} 280,110`} fill="none" stroke="#CA8A04" strokeWidth="4" />
                          {/* Main walking bamboo deck */}
                          <path d={`M 60,155 Q 170,${155 + defl} 280,155`} fill="none" stroke="#EAB308" strokeWidth="7" strokeLinecap="round" />
                          {/* Person load on bridge */}
                          <circle cx="170" cy={125 + defl} r="8" fill="#EF4444" />
                          <line x1="170" y1={133 + defl} x2="170" y2={155 + defl} stroke="#EF4444" strokeWidth="3" />
                        </g>
                      );
                    })()}

                    <text x="170" y="35" fill="#FDE047" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Nhịp cầu: {param1}m · Tải trọng: {param2}N · Độ võng: {(computed as { deflectionMm: number }).deflectionMm} mm
                    </text>
                  </svg>
                )}

                {/* Station 10: Terraced Hillslope Runoff */}
                {stationId === 10 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    {(() => {
                      const count = param2;
                      const stepW = 280 / count;
                      const stepH = 150 / count;
                      let d = 'M 25,210 ';
                      for (let i = 0; i < count; i++) {
                        const x1 = 25 + i * stepW;
                        const y1 = 210 - i * stepH;
                        d += `L ${x1},${y1} L ${x1 + stepW},${y1} `;
                      }
                      d += 'L 315,210 Z';
                      return (
                        <g>
                          <path d={d} fill="#166534" stroke="#22C55E" strokeWidth="2.5" />
                          {Array.from({ length: 8 }).map((_, r) => (
                            <line
                              key={r}
                              x1={45 + r * 32}
                              y1={15 + (animTick * 6 + r * 15) % 65}
                              x2={40 + r * 32}
                              y2={30 + (animTick * 6 + r * 15) % 65}
                              stroke="#38BDF8"
                              strokeWidth="2"
                            />
                          ))}
                        </g>
                      );
                    })()}
                    <text x="170" y="230" fill="#86EFAC" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Số bậc: {param2} · Giảm xói mòn: {(computed as { reductionPct: number }).reductionPct}% so với đồi trọc
                    </text>
                  </svg>
                )}

                {/* Station 11: Đo màu dung dịch chàm & Phổ trắc quang */}
                {stationId === 11 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    {/* Light source */}
                    <circle cx="50" cy="120" r="14" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
                    <line x1="64" y1="120" x2="130" y2="120" stroke="#FDE047" strokeWidth="4" />
                    {/* Quartz Cuvette */}
                    <rect x="130" y="60" width={param1 * 4 + 20} height="120" rx="4" fill="rgba(30, 58, 95, 0.75)" stroke="#38BDF8" strokeWidth="3" />
                    {/* Transmitted Light Beam */}
                    <line x1={130 + param1 * 4 + 20} y1="120" x2="280" y2="120" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="4 2" />
                    {/* Photodetector */}
                    <rect x="280" y="95" width="25" height="50" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
                    <text x="170" y="215" fill="#38BDF8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Độ hấp thụ A = {(computed as { absorbance: number }).absorbance} OD (Beer-Lambert)
                    </text>
                  </svg>
                )}

                {/* Station 12: Balance Lever Beam (Đòn gánh & Gùi) */}
                {stationId === 12 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    {/* Fulcrum Triangle (Vai người gánh) */}
                    <polygon points="170,135 155,175 185,175" fill="#D97706" />
                    {/* Flexible bamboo carrying pole */}
                    <line x1="45" y1="135" x2="295" y2="135" stroke="#CA8A04" strokeWidth="7" strokeLinecap="round" />
                    {/* Baskets */}
                    <rect x="55" y="145" width="34" height="28" fill="#854D0E" rx="3" />
                    <text x="72" y="163" fill="#FEF3C7" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      {param1}kg
                    </text>
                    <rect x="250" y="145" width="34" height="28" fill="#854D0E" rx="3" />
                    <text x="267" y="163" fill="#FEF3C7" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      {param2}kg
                    </text>
                    <text x="170" y="35" fill="#FBBF24" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Cánh tay đòn sau lý tưởng: d₂ = {(computed as { d2Ideal: number }).d2Ideal} m
                    </text>
                  </svg>
                )}

                {/* Station 13: Nhạc cụ tre (Đàn T'rưng / Klông pút) */}
                {stationId === 13 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    {/* Multiple bamboo tubes hung on cords */}
                    {[20, 26, 32, 38, 44].map((len, idx) => (
                      <g key={idx} className="cursor-pointer" onClick={() => handlePlayTone(300 + idx * 75)}>
                        <rect
                          x={60 + idx * 45}
                          y={110 - len * 1.5}
                          width="24"
                          height={len * 3}
                          rx="4"
                          fill={idx === 2 ? '#EAB308' : '#854D0E'}
                          stroke="#CA8A04"
                          strokeWidth="2"
                        />
                      </g>
                    ))}
                    <text x="170" y="225" fill="#FDE047" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Bấm vào các ống tre để thử âm thanh rung nốt
                    </text>
                  </svg>
                )}

                {/* Station 14: Nơm cá & Hình học nón cụt */}
                {stationId === 14 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    <ellipse cx="170" cy="55" rx={param1 * 2.2} ry={param1 * 0.7} fill="#B45309" stroke="#CA8A04" strokeWidth="2.5" />
                    <ellipse cx="170" cy="185" rx={param2 * 2.2} ry={param2 * 0.7} fill="none" stroke="#CA8A04" strokeWidth="2.5" />
                    {[-3, -1.5, 0, 1.5, 3].map((step, idx) => (
                      <line
                        key={idx}
                        x1={170 + step * (param1 * 0.6)}
                        y1="55"
                        x2={170 + step * (param2 * 0.7)}
                        y2="185"
                        stroke="#EAB308"
                        strokeWidth="2"
                      />
                    ))}
                    <text x="170" y="220" fill="#FDE047" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      V = {(computed as { volLiters: number }).volLiters} Lít · Ước tính: ~{(computed as { estimatedNanCount: number }).estimatedNanCount} nan tre
                    </text>
                  </svg>
                )}

                {/* Station 15: Phân loại lá cây bản địa */}
                {stationId === 15 && (
                  <svg viewBox="0 0 340 240" className="w-full h-full select-none">
                    <rect width="100%" height="100%" fill="#0F172A" rx="8" />
                    {/* Leaf outline */}
                    <path d="M 170,40 Q 220,100 170,180 Q 120,100 170,40 Z" fill="#15803D" stroke="#22C55E" strokeWidth="2.5" />
                    {/* Leaf midrib */}
                    <line x1="170" y1="40" x2="170" y2="180" stroke="#86EFAC" strokeWidth="2" />
                    {/* Leaf veins */}
                    {[-20, 0, 20, 40].map((y, idx) => (
                      <g key={idx}>
                        <line x1="170" y1={100 + y} x2="195" y2={90 + y} stroke="#86EFAC" strokeWidth="1.5" />
                        <line x1="170" y1={100 + y} x2="145" y2={90 + y} stroke="#86EFAC" strokeWidth="1.5" />
                      </g>
                    ))}
                    <text x="170" y="215" fill="#86EFAC" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      Độ chính xác phân loại: {(computed as { trainAccuracy: number }).trainAccuracy}% ({param1}% tập Train)
                    </text>
                  </svg>
                )}
              </div>

              {/* Station Audio preview if acoustic (Station 13) */}
              {stationId === 13 && (
                <div className="flex items-center justify-between p-3.5 bg-black/20 rounded-xl border border-[#174C3C] text-xs">
                  <span className="text-[#E8E2D5] font-mono">Nghe âm thanh cộng hưởng tổng hợp:</span>
                  <button
                    type="button"
                    onClick={() => handlePlayTone((computed as { barFrequency: number }).barFrequency || 392)}
                    className="min-h-[40px] px-4 py-2 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-lg font-bold flex items-center gap-2 border border-[#D6AA55]/50 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-[#D6AA55]" /> Phát âm thanh
                  </button>
                </div>
              )}
            </div>

            {/* Right: Controls & Results Table (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Điều chỉnh tham số thực nghiệm
              </h3>

              {/* Parameter 1 Slider with Context-rich Vietnamese Name */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">
                    {stationId === 4 ? 'Mật độ nan (nan/cm):' : stationId === 5 ? 'Bán kính guồng R (m):' : stationId === 8 ? 'Độ dày thành ống nứa (mm):' : stationId === 9 ? 'Chiều dài nhịp cầu (m):' : stationId === 10 ? 'Độ dốc sườn (°):' : stationId === 11 ? 'Chiều dài cuvet đo (cm):' : stationId === 12 ? 'Khối lượng thúng 1 (kg):' : stationId === 13 ? 'Chiều dài thanh tre (cm):' : stationId === 14 ? 'Bán kính miệng nơm (cm):' : 'Tỷ lệ tập huấn luyện Train (%):'}
                  </span>
                  <span className="font-mono text-[#174C3C] font-bold">{param1}</span>
                </div>
                <input
                  type="range"
                  min={stationId === 4 ? 1 : stationId === 5 ? 1.5 : stationId === 8 ? 4 : stationId === 9 ? 3 : stationId === 10 ? 10 : stationId === 11 ? 1 : stationId === 12 ? 5 : stationId === 13 ? 15 : stationId === 14 ? 6 : 50}
                  max={stationId === 4 ? 5 : stationId === 5 ? 4.5 : stationId === 8 ? 15 : stationId === 9 ? 9 : stationId === 10 ? 45 : stationId === 11 ? 5 : stationId === 12 ? 35 : stationId === 13 ? 50 : stationId === 14 ? 15 : 90}
                  value={param1}
                  onChange={(e) => setParam1(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* Parameter 2 Slider with Context-rich Vietnamese Name */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">
                    {stationId === 4 ? 'Tải trọng thử (kg):' : stationId === 5 ? 'Vận tốc dòng nước suối (m/s):' : stationId === 8 ? 'Nhiệt độ đống lửa than (°C):' : stationId === 9 ? 'Tải trọng người đi (N):' : stationId === 10 ? 'Số bậc thang:' : stationId === 11 ? 'Nồng độ chất màu (g/L):' : stationId === 12 ? 'Khối lượng thúng 2 (kg):' : stationId === 13 ? 'Độ dày thanh tre (mm):' : stationId === 14 ? 'Bán kính đáy nơm (cm):' : 'Đặc trưng hình thái lá:'}
                  </span>
                  <span className="font-mono text-[#174C3C] font-bold">{param2}</span>
                </div>
                <input
                  type="range"
                  min={stationId === 4 ? 5 : stationId === 5 ? 0.8 : stationId === 8 ? 250 : stationId === 9 ? 300 : stationId === 10 ? 1 : stationId === 11 ? 1 : stationId === 12 ? 5 : stationId === 13 ? 3 : stationId === 14 ? 20 : 1}
                  max={stationId === 4 ? 30 : stationId === 5 ? 3.0 : stationId === 8 ? 500 : stationId === 9 ? 2500 : stationId === 10 ? 8 : stationId === 11 ? 5 : stationId === 12 ? 35 : stationId === 13 ? 10 : stationId === 14 ? 50 : 3}
                  value={param2}
                  onChange={(e) => setParam2(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* Mode Select for Weaving & Bridge */}
              {stationId === 4 && (
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#20332D]">Kiểu đan kết cấu mây tre:</label>
                  <select
                    value={selectMode}
                    onChange={(e) => setSelectMode(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#20332D]"
                  >
                    <option value="mat_cao">Đan mắt cáo lục giác (Triaxial - Chịu tải tối ưu)</option>
                    <option value="nong_doi">Đan nong đôi</option>
                    <option value="nong_mot">Đan nong mốt vuông góc</option>
                  </select>
                </div>
              )}

              {stationId === 9 && (
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#20332D]">Kiểu kết cấu dầm cầu:</label>
                  <select
                    value={selectMode}
                    onChange={(e) => setSelectMode(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#20332D]"
                  >
                    <option value="co_giang">Có thanh giằng chéo tam giác (Giảm võng 65%)</option>
                    <option value="don_thuan">Dầm tre thẳng đơn thuần</option>
                  </select>
                </div>
              )}

              {/* Computed Results Display Card with Clear Vietnamese Labels */}
              <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-2">
                <div className="font-bold text-[#174C3C] uppercase tracking-wider">
                  Kết quả tính toán thời gian thực:
                </div>
                {Object.entries(computed).map(([k, val]) => {
                  const meta = RESULT_LABELS[k] || { label: k };
                  return (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-[#E8E2D5]/60 last:border-0">
                      <span className="text-[#556D65] font-medium">{meta.label}:</span>
                      <span className="font-mono text-[#174C3C] font-bold">
                        {String(val)} {meta.unit || ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isRunning ? 'bg-[#A94438] text-white hover:bg-[#8D372C]' : 'bg-[#174C3C] text-white hover:bg-[#11382C]'
                  }`}
                >
                  {isRunning ? 'Tạm dừng mô phỏng' : 'Chạy chuyển động'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToJournal}
                  className="flex-1 min-h-[44px] bg-white border border-[#E8E2D5] hover:bg-[#FAF7F0] text-[#174C3C] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#D6AA55]" /> Lưu kết quả
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Math & Model Engine */}
          <FormulaAccordion
            formula={station.keyFormula}
            description={station.formulaDescription}
            title="Xem công thức & Toán học đằng sau"
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
            Bối cảnh di sản & Tri thức dân gian
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed font-normal">{station.steps.context.description}</p>
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3">
            <h3 className="font-bold text-xs uppercase text-[#174C3C] tracking-wider">Chi tiết di sản văn hóa:</h3>
            <ul className="space-y-2 text-sm text-[#20332D]">
              {station.steps.context.culturalDetails.map((d, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#A94438] font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C]"
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
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border-l-4 border-[#174C3C] text-base font-semibold text-[#20332D]">
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
          <h2 className="text-xl font-bold text-[#174C3C]">Dự đoán của học sinh</h2>
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

      {/* STEP 5, 6, 7 */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Phân tích dữ liệu khoa học</h2>
          <p className="text-sm text-[#556D65]">
            Dữ liệu thực nghiệm giúp học sinh nhận diện quy luật tự nhiên ẩn sau các vật phẩm truyền thống của cha ông.
          </p>
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
            <div className="font-bold text-[#20332D]">Mục tiêu cần đạt:</div>
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
              Ghi chép của em vào nhật ký:
            </label>
            <textarea
              rows={3}
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
              placeholder="Ghi lại các ghi chép sau khi hoàn thành thí nghiệm..."
              className="w-full p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#20332D] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => toggleStationCompleted(stationId)}
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
