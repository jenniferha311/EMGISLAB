import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CloudRain, 
  Wind, 
  Droplets, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight,
  Play,
  Pause
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

export const Station16RoofDrainage: React.FC = () => {
  const station = STATIONS_DATA.find((s) => s.id === 16) || STATIONS_DATA[15];
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(16));

  useEffect(() => {
    markStationVisited(16);
    setIsCompleted(getCompletedStations().includes(16));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(16));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

  // Structural & Hydraulic Parameters
  const [pitchDeg, setPitchDeg] = useState<number>(45); // Roof pitch: 15° to 65°
  const [thatchThicknessCm, setThatchThicknessCm] = useState<number>(15); // 5 to 25 cm
  const [roofMaterial, setRoofMaterial] = useState<'la_co' | 'ngoi_am_duong' | 'ton'>('la_co');
  const [roofAreaM2, setRoofAreaM2] = useState<number>(60); // 30 to 120 m²
  
  // Weather Simulator Mode
  const [weatherMode, setWeatherMode] = useState<'light' | 'heavy' | 'storm'>('heavy');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [animRainTick, setAnimRainTick] = useState<number>(0);

  // Step 3 & 7 Forms
  const [selectedPrediction, setSelectedPrediction] = useState<string>(station.steps.prediction.options[0]?.id || 'p1');
  const [notes, setNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Animation ticker for falling raindrops and water flow
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setAnimRainTick((t) => (t + 1) % 120);
      }, 45);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Weather parameters mapping
  const weatherConfig = {
    light: { name: 'Mưa phùn núi cao', intensityMmH: 15, windSpeedMs: 2.0, dropsCount: 12 },
    heavy: { name: 'Mưa rào nhiệt đới Tam Đảo', intensityMmH: 70, windSpeedMs: 6.5, dropsCount: 28 },
    storm: { name: 'Dông bão giật cấp 7-8', intensityMmH: 130, windSpeedMs: 16.0, dropsCount: 45 },
  }[weatherMode];

  // Hydraulic Calculations:
  // 1. Runoff velocity v = sqrt(2 * g * sin(theta) * L_roof)
  const slopeRad = (pitchDeg * Math.PI) / 180;
  const gravity = 9.81;
  const roofRafterLengthM = 5.0; // chiều dài mái xuôi

  // Surface roughness resistance factor (n coefficient): thatch has higher friction than tin
  const frictionFactor = roofMaterial === 'la_co' ? 0.72 : roofMaterial === 'ngoi_am_duong' ? 0.85 : 0.95;
  const drainVelocityMs = Math.round(Math.sqrt(2 * gravity * Math.sin(slopeRad) * roofRafterLengthM) * frictionFactor * 10) / 10;
  
  // Time for water drop to leave roof (giây)
  const drainTimeSec = Math.round((roofRafterLengthM / drainVelocityMs) * 10) / 10;

  // Runoff volume collected into bamboo gutter: Q = C * I * A * cos(theta)
  // C = runoff coefficient (0.85 for palm thatch, 0.95 for tin)
  const runoffCoeff = roofMaterial === 'la_co' ? 0.85 : roofMaterial === 'ngoi_am_duong' ? 0.90 : 0.95;
  const collectedWaterM3PerHour = Math.round(
    (roofAreaM2 * Math.cos(slopeRad) * (weatherConfig.intensityMmH / 1000) * runoffCoeff) * 100
  ) / 100;
  const collectedLitersPerHour = Math.round(collectedWaterM3PerHour * 1000);

  // Aerodynamic Wind Lift Force (Lực gió bốc mái N/m2)
  // F_wind = 0.5 * rho * v^2 * sin(theta) * dragCoeff
  const airDensity = 1.2; // kg/m3
  const windForceNPerM2 = Math.round(
    0.5 * airDensity * Math.pow(weatherConfig.windSpeedMs, 2) * Math.sin(slopeRad) * 1.3
  );

  // Leakage & Structural Stability Diagnosis
  let roofStatus: 'safe' | 'leak_danger' | 'wind_danger' = 'safe';
  let diagnosticTitle = 'Thoát nước hoàn hảo, an toàn tuyệt đối';
  let diagnosticMessage = 'Góc dốc đủ lớn để trọng lực thắng lực mao dẫn trong kẽ lá, nước chảy tuôn xuôi không thấm dột.';

  if (roofMaterial === 'la_co' && pitchDeg < 35) {
    roofStatus = 'leak_danger';
    diagnosticTitle = 'CẢNH BÁO DỘT NƯỚC NGHIÊM TRỌNG!';
    diagnosticMessage = 'Độ dốc mái quá lài (<35°)! Nước mưa thoát chậm, hiện tượng mao dẫn qua khe lá cọ hút nước thấm ngược vào trong nhà.';
  } else if (pitchDeg > 55 && weatherMode === 'storm') {
    roofStatus = 'wind_danger';
    diagnosticTitle = 'CẢNH BÁO NGUY CƠ TỐC MÁI DO GIÓ DÔNG!';
    diagnosticMessage = 'Góc mái quá dốc (>55°) tạo diện tích cản gió cực lớn khi có bão. Lực nâng khí động học có thể làm bật tung lớp lợp nếu thiếu dây chằng lạt!';
  } else if (thatchThicknessCm < 10 && weatherMode !== 'light') {
    roofStatus = 'leak_danger';
    diagnosticTitle = 'Lớp lá cọ quá mỏng!';
    diagnosticMessage = 'Độ dày lớp lá dưới 10 cm không đủ các tầng úp so le để phân tán hạt mưa lớn, dễ bị rỉ giọt.';
  }

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 16,
      stationTitle: station.title,
      hypothesis: notes || `Khảo sát độ dốc mái ${pitchDeg}° và vật liệu ${roofMaterial} thích ứng mưa ${weatherConfig.name}`,
      selectedPrediction,
      changedVariables: {
        pitchDeg,
        thatchThicknessCm,
        roofMaterial,
        roofAreaM2,
        weatherMode: weatherConfig.name,
      },
      recordedResults: {
        'Vận tốc thoát nước': `${drainVelocityMs} m/s`,
        'Thời gian thoát hết nước': `${drainTimeSec} giây`,
        'Lưu lượng thu gom vào bể': `${collectedLitersPerHour} Lít/giờ`,
        'Lực cản gió bốc mái': `${windForceNPerM2} N/m²`,
        'Đánh giá an toàn mái': diagnosticTitle,
      },
      observationNotes: `Góc mái ${pitchDeg}°. ${diagnosticMessage}`,
      reflectionAnswers: station.steps.reflection.culturalConnection,
      isVerifiedRealData: false,
    });
    setSaveSuccessMsg(`Đã ghi nhận dữ liệu thoát nước vào Nhật ký của học sinh ${student}!`);
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
              TRẠM 16
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">Thủy lực học & Khí hậu công trình</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">Vùng đồi cọ Phú Thọ & Dải núi Tam Đảo</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(16)}
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
          Mái nhà – Góc nghiêng, Thoát nước & Khí động lực học
        </h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">
          Kỹ thuật lợp mái cọ dốc đứng vùng đồi trung du: cân bằng giữa vận tốc xả tràn hạt mưa chống dột và sức chịu tải gió bão vùng núi.
        </p>

        {/* Quick Question Curiosity Callout */}
        <div className="mt-4 p-3 bg-[#FBF6EA] border border-[#D6AA55]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#20332D]">
            <span className="font-bold text-[#A94438] bg-[#FBF0EE] px-2 py-0.5 rounded-md">CÂU HỎI KHÁM PHÁ</span>
            <span>Độ dốc mái nhà sàn ảnh hưởng thế nào đến vận tốc thoát nước mưa và nguy cơ dột?</span>
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
          { id: 4, label: '4. Thí nghiệm trực tiếp (Giả lập Mưa & Gió)' },
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

      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 4: INTERACTIVE DIRECT ROOF SIMULATOR */}
      {activeStep === 4 && (
        <div className="space-y-6">
          {/* Diagnostic Banner */}
          <div className={`p-4 rounded-2xl border flex items-start sm:items-center gap-3 text-xs sm:text-sm font-medium transition-colors ${
            roofStatus === 'safe'
              ? 'bg-[#EBF2EE] border-[#174C3C]/30 text-[#174C3C]'
              : 'bg-[#FBF0EE] border-[#A94438] text-[#8D372C]'
          }`}>
            {roofStatus === 'safe' ? (
              <ShieldCheck className="w-5 h-5 text-[#174C3C] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#A94438] shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">
              <strong>{diagnosticTitle}</strong> – {diagnosticMessage}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Canvas (7 cols): Roof Cross-section, Raindrops, Water Runoff & Storage Vat */}
            <div className="lg:col-span-7 bg-[#1F2B25] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#E8E2D5] font-bold flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#D6AA55]" />
                  MÔ PHỎNG THỦY ĐỘNG LỰC HỌC MÁI NHÀ SÀN
                </span>

                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-lg text-xs font-bold border border-white/20 flex items-center gap-1.5"
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-300" />}
                  {isSimulating ? 'Tạm dừng mưa' : 'Bật mưa dông'}
                </button>
              </div>

              {/* Graphic Display Canvas */}
              <div className="relative w-full h-84 bg-gradient-to-b from-[#15221B] to-[#0A130E] rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                <svg viewBox="0 0 460 280" className="w-full h-full select-none">
                  <defs>
                    <linearGradient id="palmThatchGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#854D0E" />
                      <stop offset="50%" stopColor="#A16207" />
                      <stop offset="100%" stopColor="#713F12" />
                    </linearGradient>

                    <linearGradient id="rainSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Sky background */}
                  <rect width="460" height="280" fill="url(#rainSky)" rx="8" />

                  {/* Wind flow arrows */}
                  {weatherConfig.windSpeedMs > 4 && (
                    <g opacity="0.4">
                      {Array.from({ length: 4 }).map((_, w) => (
                        <path
                          key={w}
                          d={`M ${20 + w * 90},${35 + w * 12} Q ${60 + w * 90},${25 + w * 12} ${110 + w * 90},${35 + w * 12}`}
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                        />
                      ))}
                    </g>
                  )}

                  {/* Animated Raindrops Falling with wind drift angle */}
                  {isSimulating && (
                    <g>
                      {Array.from({ length: weatherConfig.dropsCount }).map((_, d) => {
                        const windDrift = (weatherConfig.windSpeedMs / 10) * 15;
                        const rx = (d * 19 + animRainTick * 7) % 440;
                        const ry = (d * 23 + animRainTick * 14) % 240;
                        return (
                          <line
                            key={d}
                            x1={rx}
                            y1={ry}
                            x2={rx + windDrift}
                            y2={ry + 16}
                            stroke="#38BDF8"
                            strokeWidth={weatherMode === 'storm' ? 2 : 1.2}
                            opacity={0.7}
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* Roof Geometry: Apex at (200, 70), Eaves extend based on pitchDeg */}
                  {(() => {
                    const apexX = 200;
                    const apexY = 65;
                    const roofRunLength = 160; // horizontal base
                    // pitchDeg determines eaves drop: tan(theta) = dy / dx
                    const dropY = Math.tan(slopeRad) * roofRunLength;
                    const clampedDropY = Math.min(150, Math.max(45, dropY));

                    const leftEaveX = apexX - roofRunLength;
                    const leftEaveY = apexY + clampedDropY;
                    const rightEaveX = apexX + roofRunLength;
                    const rightEaveY = apexY + clampedDropY;

                    const thatchThicknessPx = 6 + (thatchThicknessCm / 25) * 16;

                    return (
                      <g>
                        {/* House Wall & Stilts Structure underneath */}
                        <g opacity="0.6">
                          {/* House floor */}
                          <line x1={leftEaveX + 30} y1={leftEaveY + 30} x2={rightEaveX - 30} y2={rightEaveY + 30} stroke="#78350F" strokeWidth="5" />
                          {/* Wooden columns (Cột nhà sàn) */}
                          <line x1={leftEaveX + 50} y1={leftEaveY + 30} x2={leftEaveX + 50} y2="250" stroke="#854D0E" strokeWidth="6" />
                          <line x1={rightEaveX - 50} y1={rightEaveY + 30} x2={rightEaveX - 50} y2="250" stroke="#854D0E" strokeWidth="6" />
                          <line x1={apexX} y1={apexY + clampedDropY * 0.4} x2={apexX} y2="250" stroke="#713F12" strokeWidth="4" strokeDasharray="4 2" />
                        </g>

                        {/* Thatch Layer (Lớp lá cọ / Mái tranh) */}
                        <path
                          d={`M ${leftEaveX},${leftEaveY} L ${apexX},${apexY} L ${rightEaveX},${rightEaveY}`}
                          fill="none"
                          stroke={roofMaterial === 'la_co' ? 'url(#palmThatchGrad)' : roofMaterial === 'ngoi_am_duong' ? '#C2410C' : '#94A3B8'}
                          strokeWidth={thatchThicknessPx}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Thatch fringe fibers / Overlapping layers effect */}
                        {roofMaterial === 'la_co' && Array.from({ length: 9 }).map((_, f) => {
                          const t = f / 8;
                          const fx = leftEaveX + t * (apexX - leftEaveX);
                          const fy = leftEaveY + t * (apexY - leftEaveY);
                          return (
                            <line
                              key={f}
                              x1={fx}
                              y1={fy}
                              x2={fx - 6}
                              y2={fy + 8}
                              stroke="#D97706"
                              strokeWidth="2"
                              opacity="0.8"
                            />
                          );
                        })}

                        {/* Water Runoff Streams on Roof Slope */}
                        {isSimulating && (
                          <g>
                            {/* Water film flowing down left slope */}
                            <path
                              d={`M ${apexX - 10},${apexY - thatchThicknessPx/2} L ${leftEaveX},${leftEaveY - thatchThicknessPx/2}`}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="2.5"
                              strokeDasharray="10 6"
                              opacity="0.9"
                            />
                            {/* Water film flowing down right slope */}
                            <path
                              d={`M ${apexX + 10},${apexY - thatchThicknessPx/2} L ${rightEaveX},${rightEaveY - thatchThicknessPx/2}`}
                              fill="none"
                              stroke="#38BDF8"
                              strokeWidth="2.5"
                              strokeDasharray="10 6"
                              opacity="0.9"
                            />
                          </g>
                        )}

                        {/* Bamboo Gutter under Right Eave (Máng tre thu nước) */}
                        <ellipse cx={rightEaveX + 6} cy={rightEaveY + 10} rx="12" ry="6" fill="#A16207" stroke="#713F12" strokeWidth="2" />
                        <path
                          d={`M ${rightEaveX + 6},${rightEaveY + 10} Q ${rightEaveX + 16},${rightEaveY + 30} ${rightEaveX + 10},220`}
                          fill="none"
                          stroke="#CA8A04"
                          strokeWidth="5"
                        />

                        {/* Water dripping from gutter into rainwater vat */}
                        {isSimulating && (
                          <g>
                            <circle cx={rightEaveX + 10} cy={222 + (animRainTick % 12)} r="2.5" fill="#38BDF8" />
                            <circle cx={rightEaveX + 10} cy={232 + (animRainTick % 12)} r="2" fill="#38BDF8" />
                          </g>
                        )}

                        {/* Rainwater Collection Earthenware Vat (Chum hứng nước) */}
                        <path
                          d={`M ${rightEaveX - 6},230 Q ${rightEaveX - 14},245 ${rightEaveX - 10},265 L ${rightEaveX + 30},265 Q ${rightEaveX + 34},245 ${rightEaveX + 26},230 Z`}
                          fill="#4A250E"
                          stroke="#2D1506"
                          strokeWidth="2"
                        />
                        <ellipse cx={rightEaveX + 10} cy="230" rx="16" ry="5" fill="#0284C7" />
                        <text x={rightEaveX + 10} y="278" fill="#FDE047" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          {collectedLitersPerHour} L/h
                        </text>

                        {/* Angle Arc Indicator at apex */}
                        <text x={apexX} y={apexY - 18} fill="#D6AA55" fontSize="12" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          θ = {pitchDeg}°
                        </text>
                        <path
                          d={`M ${apexX - 25},${apexY + 20} Q ${apexX},${apexY + 32} ${apexX + 25},${apexY + 20}`}
                          fill="none"
                          stroke="#D6AA55"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Real-time Metric Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Vận tốc nước thoát (v)</div>
                  <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                    {drainVelocityMs} m/s
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Thời gian thoát mái</div>
                  <div className="font-mono font-bold text-sky-300 text-sm mt-0.5">
                    {drainTimeSec} giây
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Lượng nước thu bể</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    {collectedWaterM3PerHour} m³/h
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Lực gió cản bốc mái</div>
                  <div className="font-mono font-bold text-purple-300 text-sm mt-0.5">
                    {windForceNPerM2} N/m²
                  </div>
                </div>
              </div>
            </div>

            {/* Right Controls Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#174C3C]" />
                  Điều chỉnh kết cấu & Giả lập thời tiết
                </h3>
              </div>

              {/* 1. Kéo thả độ dốc mái theta */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D]">Góc nghiêng độ dốc mái (θ):</span>
                  <span className="font-mono text-[#174C3C] font-extrabold text-sm bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                    {pitchDeg}°
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={pitchDeg}
                  onChange={(e) => setPitchDeg(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>15° (Quá lài - dột nặng)</span>
                  <span className="font-bold text-emerald-700">45° (Mái cọ truyền thống)</span>
                  <span>65° (Rất dốc - cản gió)</span>
                </div>
              </div>

              {/* 2. Chọn vật liệu lợp */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D]">Vật liệu bề mặt mái:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'la_co', label: 'Lá cọ Phú Thọ' },
                    { id: 'ngoi_am_duong', label: 'Ngói máng' },
                    { id: 'ton', label: 'Mái tôn hiện đại' },
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setRoofMaterial(mat.id as any)}
                      className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                        roofMaterial === mat.id
                          ? 'border-[#174C3C] bg-[#174C3C] text-white shadow-2xs'
                          : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65] hover:bg-white'
                      }`}
                    >
                      {mat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Độ dày lớp lá lợp */}
              {roofMaterial === 'la_co' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#20332D]">Độ dày lớp lá cọ xếp so le:</span>
                    <span className="font-mono text-[#174C3C] font-bold">
                      {thatchThicknessCm} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={thatchThicknessCm}
                    onChange={(e) => setThatchThicknessCm(parseInt(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9E96]">
                    <span>5 cm (mỏng)</span>
                    <span>15 cm (tiêu chuẩn 4-6 lớp)</span>
                    <span>25 cm (dày, chống nóng cực tốt)</span>
                  </div>
                </div>
              )}

              {/* 4. Giả lập kịch bản Mưa & Gió */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D] flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-[#0284C7]" />
                  Kịch bản thời tiết giả lập:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'light', label: 'Mưa nhỏ (15 mm/h)' },
                    { id: 'heavy', label: 'Mưa rào (70 mm/h)' },
                    { id: 'storm', label: 'Dông bão (130 mm/h)' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeatherMode(w.id as any)}
                      className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold border transition-all ${
                        weatherMode === w.id
                          ? 'border-[#0284C7] bg-[#E0F2FE] text-[#0369A1] shadow-2xs'
                          : 'border-[#E8E2D5] bg-[#FAF7F0] text-[#556D65] hover:bg-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => {
                    setPitchDeg(45);
                    setThatchThicknessCm(15);
                    setWeatherMode('heavy');
                  }}
                  className="flex-1 min-h-[44px] bg-[#FAF7F0] border border-[#E8E2D5] hover:bg-white text-[#174C3C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4 text-[#D6AA55]" /> Đặt lại chuẩn
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

          {/* Collapsible Math & Hydraulic Formulas Behind the Scenes */}
          <FormulaAccordion
            formula={station.keyFormula}
            description={station.formulaDescription}
            title="Xem công thức thủy động lực học & Khí tượng đằng sau"
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
            Bối cảnh di sản & Kiến trúc rừng cọ
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed font-normal">{station.steps.context.description}</p>
          
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3 text-xs sm:text-sm text-[#20332D]">
            <h3 className="font-bold uppercase text-[#174C3C] tracking-wider">Kỹ thuật dân gian lợp mái cọ:</h3>
            <ul className="space-y-1.5">
              {station.steps.context.culturalDetails.map((det, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#D6AA55] font-bold">•</span>
                  <span>{det}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-3">
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
              Vào làm thí nghiệm mô phỏng trực tiếp →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5, 6, 7 */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Phân tích dữ liệu thủy lực</h2>
          <p className="text-sm text-[#556D65] leading-relaxed">
            Thành phần gia tốc trọng trường dọc theo mặt dốc là $a = g \cdot \sin(\theta)$. Khi góc nghiêng $\theta$ tăng từ 25° lên 45°, gia tốc tăng từ 4.1 m/s² lên 6.9 m/s², giúp hạt nước thoát nhanh gấp 1.6 lần, ngăn triệt để hiện tượng mao dẫn qua kẽ lá.
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
            <div className="font-bold text-[#20332D]">Tiêu chí hoàn thành:</div>
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
              Ghi chép của em về kinh nghiệm dựng nhà của đồng bào:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi lại các ghi chép về độ dốc tối ưu để vừa thoát nước mưa vừa chống được gió bão..."
              className="w-full p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#20332D] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => toggleStationCompleted(16)}
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
