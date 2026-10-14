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
  BookOpen
} from 'lucide-react';
import { StationMeta } from '../types';
import { STATIONS_DATA } from '../data/stationsData';
import { saveResearchLog, getCurrentStudent, exportToCSV } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';
import { MuongPatternBorder } from '../components/MuongPatternBorder';

interface GenericStationLabProps {
  stationId: number;
}

export const GenericStationLab: React.FC<GenericStationLabProps> = ({ stationId }) => {
  const station = STATIONS_DATA.find((s) => s.id === stationId) || STATIONS_DATA[3];
  const [activeStep, setActiveStep] = useState<number>(4);

  // General simulation parameters per station
  const [param1, setParam1] = useState<number>(50);
  const [param2, setParam2] = useState<number>(50);
  const [param3, setParam3] = useState<number>(50);
  const [selectMode, setSelectMode] = useState<string>('default');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [animTick, setAnimTick] = useState<number>(0);

  // Predictions and Notes
  const [selectedPrediction, setSelectedPrediction] = useState<string>(station.steps.prediction.options[0]?.id || 'p1');
  const [hypothesisText, setHypothesisText] = useState<string>('');
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [reflectionAnswer, setReflectionAnswer] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Animation ticker for active motion (water wheel, runoff, waves)
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
    setIsRunning(false);
    if (stationId === 4) { setParam1(3); setParam2(15); setSelectMode('mat_cao'); } // Weaving
    else if (stationId === 5) { setParam1(2.5); setParam2(1.8); setParam3(12); setIsRunning(true); } // Water wheel
    else if (stationId === 6) { setParam1(4); setParam2(9.5); } // Dye
    else if (stationId === 7) { setParam1(42); setParam2(25); } // Flute length cm, Temp C
    else if (stationId === 8) { setParam1(8); setParam2(350); } // Lam bamboo thickness mm, Fire Temp C
    else if (stationId === 9) { setParam1(6); setParam2(1200); setSelectMode('co_giang'); } // Bridge
    else if (stationId === 10) { setParam1(30); setParam2(5); setParam3(80); setIsRunning(true); } // Terrace
    else if (stationId === 11) { setParam1(15); setParam2(6); } // Indigo colorimetry
    else if (stationId === 12) { setParam1(20); setParam2(25); setParam3(0.5); } // Lever loads & distance
    else if (stationId === 13) { setParam1(35); setParam2(6); } // Bamboo bar
    else if (stationId === 14) { setParam1(10); setParam2(35); setParam3(65); } // Cone r, R, h
    else if (stationId === 15) { setParam1(70); setParam2(1); } // Leaf dataset split & traits
    else if (stationId === 16) { setParam1(45); setParam2(60); setParam3(75); setIsRunning(true); } // Roof pitch
  }, [stationId]);

  // Play audio note for acoustic stations (Station 7 Sáo trúc, Station 13 Nhạc cụ tre)
  const handlePlayTone = (freq: number) => {
    audioEngine.playSyntheticGong([
      { id: 1, name: 'Mode 1', frequency: freq, amplitude: 0.9, decay: 1.2, phase: 0 },
      { id: 2, name: 'Mode 2', frequency: freq * 2, amplitude: 0.25, decay: 2.0, phase: 0.4 },
    ], 0.8, 'soft');
  };

  // Scientific calculation engines per station
  const computeStationData = () => {
    switch (stationId) {
      case 4: { // Đan lát: Structure & strength
        const density = param1; // 1 - 5 nan/cm
        const loadKg = param2; // 5 - 30 kg
        const factor = selectMode === 'mat_cao' ? 0.5 : selectMode === 'nong_doi' ? 0.75 : 1.0;
        const deflectionMm = Math.round(((loadKg * 1.8) / (density * 1.5)) * factor * 10) / 10;
        const maxStressMPa = Math.round((loadKg * 9.81 * factor * 1.2) * 10) / 10;
        return { deflectionMm, maxStressMPa, efficiencyScore: (100 - deflectionMm * 2).toFixed(0) };
      }
      case 5: { // Guồng nước: Water wheel kinetics
        const radius = param1; // 1.5 - 4.5 m
        const waterSpeed = param2; // 0.8 - 3.0 m/s
        const blades = param3; // 8 - 20
        const omega = (waterSpeed * 0.65) / radius;
        const rpm = Math.round((omega * 60) / (2 * Math.PI) * 10) / 10;
        const torqueNm = Math.round(1000 * 0.15 * waterSpeed * radius * 10) / 10;
        const flowLitersPerMin = Math.round(blades * (rpm / 60) * 14 * 10) / 10;
        return { rpm, torqueNm, flowLitersPerMin };
      }
      case 7: { // Sáo trúc: Acoustic column
        const lengthCm = param1; // 25 - 65 cm
        const tempC = param2; // 5 - 40 C
        const speedOfSound = 331.3 * Math.sqrt(1 + tempC / 273.15);
        const effectiveLengthM = (lengthCm + 1.2) / 100;
        const fundamentalFreq = Math.round((speedOfSound / (2 * effectiveLengthM)) * 10) / 10;
        return { speedOfSound: Math.round(speedOfSound * 10) / 10, fundamentalFreq, harmonic2: Math.round(fundamentalFreq * 2), harmonic3: Math.round(fundamentalFreq * 3) };
      }
      case 8: { // Cơm lam: Conduction
        const wallThicknessMm = param1; // 4 - 15 mm
        const fireTemp = param2; // 250 - 500 C
        const heatFlux = Math.round((0.25 * (fireTemp - 100)) / (wallThicknessMm / 1000));
        const estimatedCookingMin = Math.round(30 + wallThicknessMm * 2.2);
        return { heatFlux, estimatedCookingMin, coreTemp: '98°C - 100°C (Hồ hóa)' };
      }
      case 9: { // Cầu tre: Truss mechanics
        const spanM = param1; // 3 - 9 m
        const loadN = param2; // 300 - 2500 N
        const isBraced = selectMode === 'co_giang';
        const momentMax = Math.round((loadN * spanM) / 4);
        const deflectionMm = Math.round(((loadN * Math.pow(spanM, 3)) / (48 * 14e9 * 4e-6)) * (isBraced ? 0.35 : 1.0) * 1000);
        return { momentMax, deflectionMm: Math.min(80, deflectionMm), safeFactor: (deflectionMm < 35 ? 'An toàn' : 'Võng quá mức') };
      }
      case 10: { // Ruộng bậc thang: Runoff & erosion
        const slopeDeg = param1; // 15 - 45 deg
        const terraceCount = param2; // 1 - 8
        const rainfall = param3; // 40 - 140 mm/h
        const slopeFactor = Math.sin((slopeDeg * Math.PI) / 180);
        const rawSoilLoss = Math.round(rainfall * slopeFactor * 0.85);
        const reducedSoilLoss = Math.round(rawSoilLoss / terraceCount);
        const runoffSpeed = Math.round((2.5 * slopeFactor) / Math.sqrt(terraceCount) * 10) / 10;
        return { rawSoilLoss, reducedSoilLoss, reductionPct: Math.round(((rawSoilLoss - reducedSoilLoss) / rawSoilLoss) * 100), runoffSpeed };
      }
      case 12: { // Gùi & đòn gánh: Torque & balance
        const m1 = param1; // 5 - 35 kg
        const m2 = param2; // 5 - 35 kg
        const d1 = param3; // 0.2 - 0.8 m
        const d2Ideal = Math.round(((m1 * d1) / m2) * 100) / 100;
        const totalWeightN = Math.round((m1 + m2 + 2) * 9.81);
        const torqueDiff = Math.round(Math.abs(m1 * 9.81 * d1 - m2 * 9.81 * d2Ideal) * 10) / 10;
        return { d2Ideal, totalWeightN, isBalanced: torqueDiff < 0.5 };
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
      case 16: { // Mái nhà: Drainage
        const pitchDeg = param1; // 15 - 60 deg
        const roofAreaM2 = param2; // 30 - 120 m2
        const rainMmH = param3; // 20 - 120 mm/h
        const slopeRad = (pitchDeg * Math.PI) / 180;
        const drainVelocityMs = Math.round(Math.sqrt(2 * 9.81 * Math.sin(slopeRad) * 4.5) * 10) / 10;
        const drainTimeSec = Math.round((6.0 / drainVelocityMs) * 10) / 10;
        const collectedWaterM3 = Math.round((roofAreaM2 * Math.cos(slopeRad) * (rainMmH / 1000) * 0.88) * 100) / 100;
        return { drainVelocityMs, drainTimeSec, collectedWaterM3 };
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
          <span className="text-xs text-[#556D65] font-medium">{station.locationContext}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight">{station.title}</h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">{station.subtitle}</p>

        <div className="mt-4 pt-3.5 border-t border-[#E8E2D5] flex flex-wrap items-center justify-between gap-2 text-xs text-[#556D65]">
          <div>
            <strong className="text-[#20332D]">Di sản văn hóa:</strong> {station.culturalHeritage}
          </div>
          <div className="font-mono text-[#174C3C] font-semibold">
            {station.keyFormula}
          </div>
        </div>
      </div>

      {/* 7-Step Navigation */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-[#E8E2D5]">
        {[
          { id: 1, label: '1. Khám phá bối cảnh' },
          { id: 2, label: '2. Câu hỏi STEM' },
          { id: 3, label: '3. Dự đoán' },
          { id: 4, label: '4. Thí nghiệm số (Trực tiếp)' },
          { id: 5, label: '5. Phân tích dữ liệu' },
          { id: 6, label: '6. Thử thách' },
          { id: 7, label: '7. Phản tư' },
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
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                MÔ PHỎNG VẬT LÝ SỐ
              </span>
              <span>Mô hình toán học tương tác dựa trên nguyên lý cơ học, nhiệt, quang hoặc hình học.</span>
            </div>
            <span className="font-mono text-[#556D65] hidden sm:inline">{station.keyFormula}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Canvas / SVG Interactive Panel (7 cols) */}
            <div className="lg:col-span-7 bg-[#20332D] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-[#E8E2D5]">
                <span>MÔ HÌNH TRỰC QUAN HÓA THÍ NGHIỆM</span>
                <span className="text-[#D6AA55] font-bold">
                  {isRunning ? '● Đang chuyển động' : '○ Trạng thái tĩnh'}
                </span>
              </div>

              {/* Graphic Display Area */}
              <div className="relative w-full h-72 flex items-center justify-center">
                {/* Station 4: Weaving Weft & Warp */}
                {stationId === 4 && (
                  <svg viewBox="0 0 300 240" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#18181b" rx="6" />
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line
                        key={`warp-${i}`}
                        x1={30 + i * 26}
                        y1="20"
                        x2={30 + i * 26}
                        y2="220"
                        stroke={selectMode === 'mat_cao' ? '#10b981' : '#f59e0b'}
                        strokeWidth="4"
                      />
                    ))}
                    {Array.from({ length: 8 }).map((_, j) => (
                      <line
                        key={`weft-${j}`}
                        x1="20"
                        y1={30 + j * 24}
                        x2="280"
                        y2={30 + j * 24}
                        stroke="#e2e8f0"
                        strokeWidth="3"
                        strokeDasharray={selectMode === 'mat_cao' ? '8 6' : '12 8'}
                      />
                    ))}
                    <text x="150" y="235" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      Kiểu đan: {selectMode === 'mat_cao' ? 'Mắt cáo lục giác (Triaxial)' : 'Nong mốt / Nong đôi'}
                    </text>
                  </svg>
                )}

                {/* Station 5: Rotating Water Wheel */}
                {stationId === 5 && (
                  <svg viewBox="0 0 300 240" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#090d16" rx="6" />
                    {/* Flowing River */}
                    <rect x="0" y="190" width="300" height="50" fill="#0284c7" opacity="0.6" />
                    <line x1="0" y1="190" x2="300" y2="190" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 6" />

                    {/* Rotating Wheel Group */}
                    <g transform={`translate(150, 130) rotate(${animTick * 3})`}>
                      <circle cx="0" cy="0" r={param1 * 20} fill="none" stroke="#ca8a04" strokeWidth="5" />
                      <circle cx="0" cy="0" r="12" fill="#713f12" />
                      {Array.from({ length: Math.round(param3) }).map((_, b) => {
                        const angle = (b * 360) / param3;
                        return (
                          <line
                            key={b}
                            x1="0"
                            y1="0"
                            x2={Math.cos((angle * Math.PI) / 180) * param1 * 20}
                            y2={Math.sin((angle * Math.PI) / 180) * param1 * 20}
                            stroke="#854d0e"
                            strokeWidth="3"
                          />
                        );
                      })}
                    </g>
                    <text x="150" y="25" fill="#38bdf8" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Tốc độ quay: {(computed as { rpm: number }).rpm} RPM · Lưu lượng: {(computed as { flowLitersPerMin: number }).flowLitersPerMin} L/phút
                    </text>
                  </svg>
                )}

                {/* Station 7: Flute Acoustic Pipe & Standing Waves */}
                {stationId === 7 && (
                  <svg viewBox="0 0 320 220" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#0f172a" rx="6" />
                    {/* Bamboo Flute body */}
                    <rect x="30" y="80" width={param1 * 4.2} height="36" fill="#854d0e" rx="4" stroke="#ca8a04" strokeWidth="2" />
                    {/* Embouchure hole */}
                    <circle cx="60" cy="98" r="6" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
                    {/* Tone holes */}
                    {[120, 150, 180, 210, 240].map((hx) => (
                      <circle key={hx} cx={hx} cy="98" r="5" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
                    ))}
                    {/* Standing Wave sinusoidal curve */}
                    <path
                      d={`M 30,160 Q ${30 + param1 * 2.1},${120 + Math.sin(animTick * 0.1) * 25} ${30 + param1 * 4.2},160`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M 30,160 Q ${30 + param1 * 2.1},${200 - Math.sin(animTick * 0.1) * 25} ${30 + param1 * 4.2},160`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text x="160" y="40" fill="#38bdf8" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Tần số nốt cơ bản f₀ = {(computed as { fundamentalFreq: number }).fundamentalFreq} Hz
                    </text>
                  </svg>
                )}

                {/* Station 10: Terraced Hillslope Runoff */}
                {stationId === 10 && (
                  <svg viewBox="0 0 320 220" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#0f172a" rx="6" />
                    {/* Terraces */}
                    {(() => {
                      const count = param2; // steps
                      const stepW = 280 / count;
                      const stepH = 160 / count;
                      let d = 'M 20,200 ';
                      for (let i = 0; i < count; i++) {
                        const x1 = 20 + i * stepW;
                        const y1 = 200 - i * stepH;
                        d += `L ${x1},${y1} L ${x1 + stepW},${y1} `;
                      }
                      d += 'L 300,200 Z';
                      return (
                        <g>
                          <path d={d} fill="#166534" stroke="#22c55e" strokeWidth="2" />
                          {/* Rain drops */}
                          {Array.from({ length: 8 }).map((_, r) => (
                            <line
                              key={r}
                              x1={40 + r * 30}
                              y1={10 + (animTick * 5 + r * 15) % 60}
                              x2={35 + r * 30}
                              y2={25 + (animTick * 5 + r * 15) % 60}
                              stroke="#38bdf8"
                              strokeWidth="2"
                            />
                          ))}
                        </g>
                      );
                    })()}
                    <text x="160" y="215" fill="#86efac" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      Số bậc: {param2} · Giảm xói mòn: {(computed as { reductionPct: number }).reductionPct}% so với đồi trọc
                    </text>
                  </svg>
                )}

                {/* Station 12: Balance Lever Beam */}
                {stationId === 12 && (
                  <svg viewBox="0 0 320 220" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#0f172a" rx="6" />
                    {/* Fulcrum Triangle */}
                    <polygon points="160,140 150,175 170,175" fill="#d97706" />
                    {/* Lever Bar */}
                    <line x1="40" y1="138" x2="280" y2="138" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" />
                    {/* Baskets */}
                    <rect x="50" y="145" width="28" height="24" fill="#854d0e" rx="2" />
                    <text x="64" y="161" fill="#fef3c7" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {param1}kg
                    </text>
                    <rect x="240" y="145" width="28" height="24" fill="#854d0e" rx="2" />
                    <text x="254" y="161" fill="#fef3c7" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {param2}kg
                    </text>
                    <text x="160" y="35" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                      Cánh tay đòn lý tưởng: d₂ = {(computed as { d2Ideal: number }).d2Ideal} m
                    </text>
                  </svg>
                )}

                {/* Station 14: 3D Truncated Cone Fish Trap (Nơm cá) */}
                {stationId === 14 && (
                  <svg viewBox="0 0 320 220" className="w-full h-full">
                    <rect width="100%" height="100%" fill="#0f172a" rx="6" />
                    {/* Truncated Cone Profile */}
                    <polygon
                      points={`160 - ${param1 * 2},60 160 + ${param1 * 2},60 160 + ${param2 * 2.2},180 160 - ${param2 * 2.2},180`}
                      fill="#78350f"
                      opacity="0.4"
                    />
                    {/* Top ellipse */}
                    <ellipse cx="160" cy="60" rx={param1 * 2} ry={param1 * 0.7} fill="#b45309" stroke="#ca8a04" strokeWidth="2" />
                    {/* Bottom ellipse */}
                    <ellipse cx="160" cy="180" rx={param2 * 2.2} ry={param2 * 0.7} fill="none" stroke="#ca8a04" strokeWidth="2" />
                    {/* Nan ribs */}
                    {[-3, -1.5, 0, 1.5, 3].map((step, idx) => (
                      <line
                        key={idx}
                        x1={160 + step * (param1 * 0.6)}
                        y1="60"
                        x2={160 + step * (param2 * 0.7)}
                        y2="180"
                        stroke="#eab308"
                        strokeWidth="1.5"
                      />
                    ))}
                    <text x="160" y="210" fill="#fde047" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      V = {(computed as { volLiters: number }).volLiters} Lít · Ước tính nan tre: ~{(computed as { estimatedNanCount: number }).estimatedNanCount} nan
                    </text>
                  </svg>
                )}

                {/* Default or Other Stations SVG Display */}
                {![4, 5, 7, 10, 12, 14].includes(stationId) && (
                  <div className="text-center space-y-2">
                    <Activity className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                    <div className="text-emerald-300 font-mono font-bold text-sm">
                      MÔ PHỎNG THỰC NGHIỆM ĐANG HOẠT ĐỘNG
                    </div>
                    <div className="text-stone-400 text-xs font-mono">
                      Công thức: {station.keyFormula}
                    </div>
                  </div>
                )}
              </div>

              {/* Station Audio preview if acoustic */}
              {(stationId === 7 || stationId === 13) && (
                <div className="flex items-center justify-between p-3.5 bg-black/20 rounded-xl border border-[#174C3C] text-xs">
                  <span className="text-[#E8E2D5] font-mono">Nghe âm thanh cộng hưởng tổng hợp:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handlePlayTone(
                        stationId === 7
                          ? (computed as { fundamentalFreq: number }).fundamentalFreq || 440
                          : (computed as { barFrequency: number }).barFrequency || 392
                      )
                    }
                    className="min-h-[40px] px-4 py-2 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-lg font-bold flex items-center gap-2 border border-[#D6AA55]/50 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-[#D6AA55]" /> Phát âm nốt
                  </button>
                </div>
              )}
            </div>

            {/* Right: Controls & Results Table (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Điều chỉnh tham số thực nghiệm
              </h3>

              {/* Parameter 1 Slider */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">
                    {stationId === 4 ? 'Mật độ nan (nan/cm):' : stationId === 5 ? 'Bán kính guồng R (m):' : stationId === 7 ? 'Chiều dài sáo L (cm):' : stationId === 10 ? 'Độ dốc sườn (°):' : stationId === 12 ? 'Khối lượng thúng 1 (kg):' : stationId === 14 ? 'Bán kính miệng r (cm):' : stationId === 16 ? 'Độ dốc mái θ (°):' : 'Biến số 1:'}
                  </span>
                  <span className="font-mono text-[#174C3C] font-bold">{param1}</span>
                </div>
                <input
                  type="range"
                  min={stationId === 4 ? 1 : stationId === 5 ? 1.5 : stationId === 7 ? 25 : stationId === 10 ? 10 : stationId === 12 ? 5 : stationId === 14 ? 6 : 15}
                  max={stationId === 4 ? 5 : stationId === 5 ? 4.5 : stationId === 7 ? 65 : stationId === 10 ? 45 : stationId === 12 ? 35 : stationId === 14 ? 15 : 60}
                  value={param1}
                  onChange={(e) => setParam1(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* Parameter 2 Slider */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">
                    {stationId === 4 ? 'Tải trọng thử (kg):' : stationId === 5 ? 'Vận tốc dòng nước (m/s):' : stationId === 7 ? 'Nhiệt độ không khí (°C):' : stationId === 10 ? 'Số bậc thang:' : stationId === 12 ? 'Khối lượng thúng 2 (kg):' : stationId === 14 ? 'Bán kính đáy R (cm):' : stationId === 16 ? 'Diện tích mái (m²):' : 'Biến số 2:'}
                  </span>
                  <span className="font-mono text-[#174C3C] font-bold">{param2}</span>
                </div>
                <input
                  type="range"
                  min={stationId === 4 ? 5 : stationId === 5 ? 0.8 : stationId === 7 ? 5 : stationId === 10 ? 1 : stationId === 12 ? 5 : stationId === 14 ? 20 : 30}
                  max={stationId === 4 ? 30 : stationId === 5 ? 3.0 : stationId === 7 ? 40 : stationId === 10 ? 8 : stationId === 12 ? 35 : stationId === 14 ? 50 : 120}
                  value={param2}
                  onChange={(e) => setParam2(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* Mode Select if applicable */}
              {stationId === 4 && (
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-[#20332D]">Kiểu đan kết cấu:</label>
                  <select
                    value={selectMode}
                    onChange={(e) => setSelectMode(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#20332D] focus:ring-2 focus:ring-[#174C3C]"
                  >
                    <option value="mat_cao">Đan mắt cáo lục giác (Triaxial - Chịu tải tối ưu)</option>
                    <option value="nong_doi">Đan nong đôi</option>
                    <option value="nong_mot">Đan nong mốt vuông góc</option>
                  </select>
                </div>
              )}

              {/* Computed Results Display Card */}
              <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-1.5">
                <div className="font-bold text-[#174C3C] uppercase tracking-wider">
                  Kết quả tính toán thời gian thực:
                </div>
                {Object.entries(computed).map(([k, val]) => (
                  <div key={k} className="flex items-center justify-between font-mono">
                    <span className="text-[#556D65] font-sans">{k}:</span>
                    <span className="text-[#174C3C] font-bold">{String(val)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isRunning ? 'bg-[#A94438] text-white hover:bg-[#8D372C]' : 'bg-[#174C3C] text-white hover:bg-[#11382C]'
                  }`}
                >
                  {isRunning ? 'Tạm dừng mô phỏng' : 'Chạy mô phỏng'}
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
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
            >
              Tiếp tục: Bước 2 – Câu hỏi STEM →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STEM Question */}
      {activeStep === 2 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#D6AA55]" />
            Vấn đề khoa học cốt lõi
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.stemQuestion.question}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">{station.steps.stemQuestion.contextExplanation}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Quay lại Bước 1
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
            >
              Tiếp tục: Bước 3 – Đưa ra dự đoán →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Prediction */}
      {activeStep === 3 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-[#D6AA55]" />
            Hình thành giả thuyết nghiên cứu
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#20332D]">{station.steps.prediction.prompt}</h2>
          <div className="space-y-3">
            {station.steps.prediction.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPrediction === opt.id
                    ? 'border-[#174C3C] bg-[#EBF2EE] ring-1 ring-[#174C3C]/30'
                    : 'border-[#E8E2D5] hover:bg-[#FAF7F0]'
                }`}
              >
                <input
                  type="radio"
                  name={`pred_${stationId}`}
                  checked={selectedPrediction === opt.id}
                  onChange={() => setSelectedPrediction(opt.id)}
                  className="mt-1 text-[#174C3C] focus:ring-[#174C3C]"
                />
                <div>
                  <div className="text-sm font-bold text-[#20332D]">{opt.label}</div>
                  <div className="text-xs text-[#556D65] mt-1 leading-relaxed">{opt.explanation}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
            >
              Chuyển sang Bước 4: Thí nghiệm số →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Data Analysis Table */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#D6AA55]" />
                Dữ liệu thực nghiệm
              </div>
              <h2 className="text-xl font-bold text-[#174C3C] mt-0.5">Bảng dữ liệu thực nghiệm đã ghi</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = ['Station', 'KeyFormula', 'Data'];
                const rows = [[station.title, station.keyFormula || '', JSON.stringify(computed)]];
                exportToCSV(`tram${station.numberStr}_du_lieu.csv`, headers, rows);
              }}
              className="min-h-[44px] px-4 py-2 border border-[#E8E2D5] rounded-xl text-xs sm:text-sm font-bold text-[#20332D] hover:bg-[#FAF7F0] flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#174C3C]" /> Xuất CSV
            </button>
          </div>

          <div className="p-5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-3">
            <div className="font-bold text-[#174C3C] uppercase tracking-wider">Biến số đầu vào:</div>
            <div className="font-mono text-[#20332D] bg-white p-3 rounded-lg border border-[#E8E2D5]">
              Param1 = {param1} · Param2 = {param2} · Mode = {selectMode}
            </div>
            <div className="font-bold text-[#174C3C] uppercase tracking-wider pt-2">
              Đại lượng đầu ra tính toán:
            </div>
            <div className="font-mono text-[#174C3C] font-semibold bg-white p-3 rounded-lg border border-[#E8E2D5]">
              {JSON.stringify(computed, null, 2)}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Quay lại Thí nghiệm
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
            >
              Chuyển sang Bước 6: Thử thách STEM →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Challenge */}
      {activeStep === 6 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#D6AA55]" />
            Thử thách khoa học
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.challenge.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">{station.steps.challenge.scenario}</p>
          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs sm:text-sm text-[#20332D]">
            <strong className="text-[#174C3C]">Nhiệm vụ:</strong> {station.steps.challenge.task}
          </div>
          <textarea
            value={challengeAnswer}
            onChange={(e) => setChallengeAnswer(e.target.value)}
            placeholder="Nhập câu trả lời và lập luận dựa trên bằng chứng khoa học của bạn..."
            rows={3}
            className="w-full p-3.5 border border-[#E8E2D5] bg-[#FAF7F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
            >
              Chuyển sang Bước 7: Phản tư →
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Reflection */}
      {activeStep === 7 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#D6AA55]" />
            Phản tư & Kết nối di sản
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">Phản tư & Kết nối di sản văn hóa</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">{station.steps.reflection.culturalConnection}</p>
          <div className="p-4 bg-[#FBF0EE] rounded-xl border border-[#A94438]/30 text-xs text-[#20332D]">
            <strong className="text-[#A94438]">Giới hạn vật lý & Sai số:</strong> {station.steps.reflection.physicalLimitations.join(' ')}
          </div>
          <textarea
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            placeholder="Ghi nhận phản tư của bạn về bài học STEM và trí tuệ bản địa..."
            rows={3}
            className="w-full p-3.5 border border-[#E8E2D5] bg-[#FAF7F0] rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={handleSaveToJournal}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] flex items-center gap-2 shadow-xs active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
              Hoàn thành trạm & Lưu vào Nhật ký
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
