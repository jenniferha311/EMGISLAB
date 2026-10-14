import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Layers, 
  Sliders, 
  BookOpen, 
  Music, 
  Activity,
  ArrowRight,
  Play
} from 'lucide-react';
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

interface FluteHole {
  id: number;
  label: string;
  noteName: string;
  isOpen: boolean;
  relPos: number; // 0.0 to 1.0 along the body
}

export const Station07Flute: React.FC = () => {
  const station = STATIONS_DATA.find((s) => s.id === 7) || STATIONS_DATA[6];
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(7));

  useEffect(() => {
    markStationVisited(7);
    setIsCompleted(getCompletedStations().includes(7));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(7));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

  // Flute acoustic parameters
  const [tubeLengthCm, setTubeLengthCm] = useState<number>(42); // 25 to 60 cm
  const [tubeDiameterMm, setTubeDiameterMm] = useState<number>(14); // 10 to 20 mm
  const [airTempC, setAirTempC] = useState<number>(25); // 5 to 40 °C
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animTick, setAnimTick] = useState<number>(0);

  // 6 Finger holes state (true = open, false = closed)
  // Standard 6-hole bamboo flute (Sáo trúc ngang)
  const [holes, setHoles] = useState<boolean[]>([
    false, // Hole 1 (farthest from blow hole)
    false, // Hole 2
    false, // Hole 3
    false, // Hole 4
    false, // Hole 5
    false, // Hole 6 (closest to blow hole)
  ]);

  // Step 3 & 7 States
  const [selectedPrediction, setSelectedPrediction] = useState<string>(station.steps.prediction.options[0]?.id || 'p1');
  const [notes, setNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Animation ticker for standing wave motion
  useEffect(() => {
    let animId: number;
    let tick = 0;
    const loop = () => {
      tick++;
      setAnimTick(tick);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Physical calculations
  // 1. Sound speed in air: v(T) = 331.3 * sqrt(1 + T / 273.15)
  const soundSpeedMs = 331.3 * Math.sqrt(1 + airTempC / 273.15);

  // 2. Effective acoustic length L_eff
  // Finding the first open hole from the blowing hole (index 5 down to 0)
  // If all holes closed, air column length is full tube length
  const calculateEffectiveLength = () => {
    // Holes are indexed 0 (tip) to 5 (near embouchure)
    // First open hole closest to embouchure defines the primary acoustic node
    let activeOpenHoleIdx = -1;
    for (let i = 5; i >= 0; i--) {
      if (holes[i]) {
        activeOpenHoleIdx = i;
        break;
      }
    }

    let fraction = 1.0;
    if (activeOpenHoleIdx !== -1) {
      // Fraction of tube from embouchure to that hole
      // Embouchure at 0.15, holes spread from 0.45 to 0.85
      const holePositions = [0.85, 0.77, 0.69, 0.61, 0.53, 0.45];
      fraction = holePositions[activeOpenHoleIdx];
    }

    const physicalLenM = (tubeLengthCm * fraction) / 100;
    // End correction: delta_L = 0.61 * r at open ends (2 open ends = 1.2 * r)
    const radiusM = (tubeDiameterMm / 2) / 1000;
    const endCorrectionM = 1.22 * radiusM;
    const effectiveLenM = physicalLenM + endCorrectionM;

    return Math.max(0.12, effectiveLenM);
  };

  const effectiveLengthM = calculateEffectiveLength();

  // 3. Fundamental frequency f0 = v / (2 * L_eff) for open-open tube
  const fundamentalFreq = Math.round((soundSpeedMs / (2 * effectiveLengthM)) * 10) / 10;
  const wavelengthCm = Math.round(((soundSpeedMs / fundamentalFreq) * 100) * 10) / 10;

  // Closest note name mapping
  const getNoteName = (freq: number) => {
    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const semitonesFromA4 = Math.round(12 * Math.log2(freq / a4));
    const midi = 69 + semitonesFromA4;
    const noteName = noteStrings[(midi % 12 + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  };

  const currentNote = getNoteName(fundamentalFreq);

  // Play synthetic flute tone using Web Audio API
  const handlePlayTone = () => {
    setIsPlaying(true);
    // Play with rich harmonics characteristic of bamboo flute
    audioEngine.playSyntheticGong([
      { id: 1, name: 'Cơ bản (f₀)', frequency: fundamentalFreq, amplitude: 0.9, decay: 1.8, phase: 0 },
      { id: 2, name: 'Họa âm 2 (2f₀)', frequency: fundamentalFreq * 2, amplitude: 0.35, decay: 1.5, phase: 0.2 },
      { id: 3, name: 'Họa âm 3 (3f₀)', frequency: fundamentalFreq * 3, amplitude: 0.15, decay: 1.2, phase: 0.5 },
      { id: 4, name: 'Họa âm 4 (4f₀)', frequency: fundamentalFreq * 4, amplitude: 0.05, decay: 0.9, phase: 0.1 },
    ], 0.85, 'soft');

    setTimeout(() => {
      setIsPlaying(false);
    }, 1200);
  };

  // Toggle a finger hole
  const toggleHole = (index: number) => {
    const updated = [...holes];
    updated[index] = !updated[index];
    setHoles(updated);
    
    // Automatically trigger audio preview
    setTimeout(() => {
      handlePlayTone();
    }, 50);
  };

  // Preset scales: Ngũ cung & Thất cung bản địa
  const applyPreset = (presetHoles: boolean[]) => {
    setHoles(presetHoles);
    setTimeout(() => {
      handlePlayTone();
    }, 50);
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 7,
      stationTitle: station.title,
      hypothesis: notes || `Khảo sát tần số âm thanh sáo trúc khi thay đổi chiều dài cột khí và nhiệt độ`,
      selectedPrediction,
      changedVariables: {
        tubeLengthCm,
        tubeDiameterMm,
        airTempC,
        openHolesCount: holes.filter(Boolean).length,
        fingerPattern: holes.map((h, i) => `Lỗ ${6 - i}: ${h ? 'Mở' : 'Bịt'}`).join(', ')
      },
      recordedResults: {
        'Tần số cơ bản f₀': `${fundamentalFreq} Hz`,
        'Nốt nhạc tương ứng': currentNote,
        'Bước sóng λ': `${wavelengthCm} cm`,
        'Vận tốc âm thanh v': `${Math.round(soundSpeedMs * 10) / 10} m/s`,
        'Chiều dài hiệu dụng L_eff': `${Math.round(effectiveLengthM * 100 * 10) / 10} cm`,
      },
      observationNotes: `Nhiệt độ ${airTempC}°C, khi mở lỗ bấm gần miệng thổi nhất, chiều dài cột khí giảm làm tần số tăng vọt sang nốt cao. Đồ thị sóng dừng hiển thị các bụng sóng rõ nét.`,
      reflectionAnswers: station.steps.reflection.culturalConnection,
      isVerifiedRealData: false,
    });
    setSaveSuccessMsg(`Đã ghi dữ liệu âm học vào Nhật ký của học sinh ${student}!`);
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
              TRẠM 07
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">Âm học & Vật lý sóng</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">Rừng nứa Phú Thọ & Tây Bắc</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(7)}
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
          Sáo trúc – Cột khí & Cộng hưởng âm học
        </h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed">
          Khám phá nghệ thuật khoét sáo nứa Mường - H'Mông: quy luật sóng dừng 2 đầu hở, hiệu chỉnh đầu mút ống sáo và ảnh hưởng của nhiệt độ không khí đến cao độ nốt nhạc.
        </p>

        {/* Quick Curiosity Banner */}
        <div className="mt-4 p-3 bg-[#FBF6EA] border border-[#D6AA55]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#20332D]">
            <span className="font-bold text-[#A94438] bg-[#FBF0EE] px-2 py-0.5 rounded-md">CÂU HỎI KHÁM PHÁ</span>
            <span>Vì sao sáo dài phát âm trầm hơn sáo ngắn, và tại sao trời lạnh âm sáo lại bị trầm xuống?</span>
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
          { id: 4, label: '4. Thí nghiệm trực tiếp (Sáo trúc ảo)' },
          { id: 5, label: '5. Phân tích dữ liệu' },
          { id: 6, label: '6. Thử thách nốt La 440Hz' },
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

      {/* STEP 4: INTERACTIVE FLUTE SIMULATION */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Graphic Display (7 cols): Virtual Bamboo Flute & Standing Wave Visualizer */}
            <div className="lg:col-span-7 bg-[#1C2822] p-5 sm:p-6 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#E8E2D5] font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#D6AA55]" />
                  MÔ PHỎNG CỘT KHÍ & LỖ BẤM SÁO TRÚC
                </span>
                <span className="text-[#D6AA55] font-bold">
                  {isPlaying ? '● Đang phát âm thanh...' : '○ Sẵn sàng thổi'}
                </span>
              </div>

              {/* Graphic Display Area: Bamboo Body & Hole Controls */}
              <div className="relative w-full h-84 bg-gradient-to-b from-[#141E1A] to-[#0D1512] rounded-xl border border-white/10 p-4 flex flex-col justify-between overflow-hidden">
                {/* Top: Acoustic Note & Frequency Header Badge */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#174C3C] border border-[#D6AA55]/50 text-white rounded-lg font-mono font-bold text-sm shadow-md">
                      Nốt {currentNote}
                    </span>
                    <span className="text-xs font-mono text-[#D6AA55] font-bold">
                      {fundamentalFreq} Hz
                    </span>
                  </div>

                  <div className="text-right text-[11px] font-mono text-[#8A9E96]">
                    Vận tốc âm: <strong className="text-white">{Math.round(soundSpeedMs)} m/s</strong> (ở {airTempC}°C)
                  </div>
                </div>

                {/* Center SVG: Realistic Bamboo Flute with Clickable Holes & Standing Waves */}
                <div className="relative w-full h-44 flex items-center justify-center my-auto">
                  <svg viewBox="0 0 540 180" className="w-full h-full select-none">
                    <defs>
                      {/* Realistic Bamboo Gradient */}
                      <linearGradient id="bambooSkin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#854D0E" />
                        <stop offset="25%" stopColor="#B45309" />
                        <stop offset="50%" stopColor="#D97706" />
                        <stop offset="80%" stopColor="#92400E" />
                        <stop offset="100%" stopColor="#451A03" />
                      </linearGradient>

                      {/* Standing Wave Glow */}
                      <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Flute Main Body (length adjusts with tubeLengthCm) */}
                    {(() => {
                      const fluteStartX = 40;
                      // Max visual length 460px mapped to tubeLengthCm (25 to 60 cm)
                      const fluteWidth = 240 + ((tubeLengthCm - 25) / 35) * 220;
                      const fluteHeight = 36 + ((tubeDiameterMm - 10) / 10) * 14;
                      const centerY = 90;
                      const topY = centerY - fluteHeight / 2;

                      // Embouchure hole at X = 95
                      const embouchureX = fluteStartX + 55;

                      // 6 Finger hole positions along the tube
                      // Holes: 5 (closest to mouth) to 0 (farthest)
                      const holeSpacing = (fluteWidth - 110) / 8;
                      const holeXs = [
                        fluteStartX + fluteWidth - holeSpacing * 1.5, // Hole 1 (index 0)
                        fluteStartX + fluteWidth - holeSpacing * 2.3, // Hole 2
                        fluteStartX + fluteWidth - holeSpacing * 3.1, // Hole 3
                        fluteStartX + fluteWidth - holeSpacing * 4.3, // Hole 4
                        fluteStartX + fluteWidth - holeSpacing * 5.1, // Hole 5
                        fluteStartX + fluteWidth - holeSpacing * 5.9, // Hole 6 (index 5)
                      ];

                      return (
                        <g>
                          {/* Bamboo Tube Cylinder */}
                          <rect
                            x={fluteStartX}
                            y={topY}
                            width={fluteWidth}
                            height={fluteHeight}
                            rx={fluteHeight / 4}
                            fill="url(#bambooSkin)"
                            stroke="#78350F"
                            strokeWidth="2"
                            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
                          />

                          {/* Bamboo Nodes (Đốt tre nứa) */}
                          <line
                            x1={fluteStartX + 40}
                            y1={topY}
                            x2={fluteStartX + 40}
                            y2={topY + fluteHeight}
                            stroke="#451A03"
                            strokeWidth="3"
                            strokeDasharray="2 1"
                          />
                          <line
                            x1={fluteStartX + fluteWidth * 0.48}
                            y1={topY}
                            x2={fluteStartX + fluteWidth * 0.48}
                            y2={topY + fluteHeight}
                            stroke="#451A03"
                            strokeWidth="3.5"
                          />

                          {/* Bamboo grain lines */}
                          <line
                            x1={fluteStartX + 10}
                            y1={centerY - fluteHeight * 0.25}
                            x2={fluteStartX + fluteWidth - 10}
                            y2={centerY - fluteHeight * 0.25}
                            stroke="#F59E0B"
                            strokeWidth="0.8"
                            opacity="0.35"
                          />

                          {/* Embouchure blowing hole (Lỗ thổi) */}
                          <ellipse
                            cx={embouchureX}
                            cy={centerY}
                            rx="8"
                            ry="6"
                            fill="#18181B"
                            stroke="#CA8A04"
                            strokeWidth="2"
                          />
                          <text
                            x={embouchureX}
                            y={topY - 8}
                            fill="#D6AA55"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                          >
                            Lỗ thổi
                          </text>

                          {/* Interactive 6 Finger Holes */}
                          {holeXs.map((hx, idx) => {
                            const isOpen = holes[idx];
                            const holeNumber = 6 - idx; // 6 near mouth, 1 at tip

                            return (
                              <g 
                                key={idx} 
                                className="cursor-pointer group"
                                onClick={() => toggleHole(idx)}
                              >
                                {/* Glow hover ring */}
                                <circle
                                  cx={hx}
                                  cy={centerY}
                                  r="13"
                                  fill={isOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(214, 170, 85, 0.15)'}
                                  className="group-hover:opacity-100 transition-opacity"
                                />

                                {/* Hole interior */}
                                <circle
                                  cx={hx}
                                  cy={centerY}
                                  r="7"
                                  fill={isOpen ? '#0369A1' : '#27272A'}
                                  stroke={isOpen ? '#38BDF8' : '#71717A'}
                                  strokeWidth="2"
                                />

                                {/* If closed: Finger plugging representation */}
                                {!isOpen && (
                                  <circle
                                    cx={hx}
                                    cy={centerY}
                                    r="4"
                                    fill="#A16207"
                                    opacity="0.8"
                                  />
                                )}

                                {/* If open: Air vortex wave indicator */}
                                {isOpen && (
                                  <path
                                    d={`M ${hx - 4},${centerY - 8} Q ${hx},${centerY - 14 + Math.sin(animTick * 0.2 + idx) * 3} ${hx + 4},${centerY - 8}`}
                                    fill="none"
                                    stroke="#38BDF8"
                                    strokeWidth="1.5"
                                  />
                                )}

                                {/* Hole Number & State Label */}
                                <text
                                  x={hx}
                                  y={topY + fluteHeight + 14}
                                  fill={isOpen ? '#38BDF8' : '#A1A1AA'}
                                  fontSize="9"
                                  textAnchor="middle"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                >
                                  Lỗ {holeNumber}
                                </text>
                                <text
                                  x={hx}
                                  y={topY + fluteHeight + 25}
                                  fill={isOpen ? '#38BDF8' : '#71717A'}
                                  fontSize="8"
                                  textAnchor="middle"
                                  fontFamily="sans-serif"
                                >
                                  {isOpen ? 'MỞ' : 'BỊT'}
                                </text>
                              </g>
                            );
                          })}

                          {/* Dynamic Standing Wave Simulation (Sóng dừng âm học) */}
                          {/* Active standing wave column extends from embouchure to first open hole or flute end */}
                          {(() => {
                            // Find active column end
                            let activeHoleIdx = -1;
                            for (let i = 5; i >= 0; i--) {
                              if (holes[i]) {
                                activeHoleIdx = i;
                                break;
                              }
                            }
                            const columnEnd = activeHoleIdx !== -1 ? holeXs[activeHoleIdx] : fluteStartX + fluteWidth;
                            const waveWidth = columnEnd - embouchureX;
                            const waveMidY = 32;

                            // Sine wave path
                            const pointsCount = 40;
                            let waveD1 = `M ${embouchureX},${waveMidY} `;
                            let waveD2 = `M ${embouchureX},${waveMidY} `;

                            for (let p = 0; p <= pointsCount; p++) {
                              const x = embouchureX + (p / pointsCount) * waveWidth;
                              // Open-open tube: Antinodes (bụng sóng) at both open ends!
                              // cos(pi * p / pointsCount) gives max at 0 and at ends
                              const phase = (p / pointsCount) * Math.PI;
                              const envelope = Math.cos(phase);
                              const amp = Math.sin(animTick * 0.15) * 14 * envelope;
                              waveD1 += `L ${x},${waveMidY + amp} `;
                              waveD2 += `L ${x},${waveMidY - amp} `;
                            }

                            return (
                              <g filter="url(#waveGlow)">
                                {/* Background guide line */}
                                <line
                                  x1={embouchureX}
                                  y1={waveMidY}
                                  x2={columnEnd}
                                  y2={waveMidY}
                                  stroke="#38BDF8"
                                  strokeWidth="0.8"
                                  strokeDasharray="4 4"
                                  opacity="0.4"
                                />

                                {/* Upper and lower envelope of standing wave */}
                                <path
                                  d={waveD1}
                                  fill="none"
                                  stroke="#38BDF8"
                                  strokeWidth="2.5"
                                  opacity="0.9"
                                />
                                <path
                                  d={waveD2}
                                  fill="none"
                                  stroke="#38BDF8"
                                  strokeWidth="1.5"
                                  strokeDasharray="3 3"
                                  opacity="0.6"
                                />

                                {/* Nodes & Antinodes labels */}
                                <text
                                  x={embouchureX}
                                  y={waveMidY - 12}
                                  fill="#38BDF8"
                                  fontSize="9"
                                  textAnchor="middle"
                                  fontWeight="bold"
                                >
                                  Bụng sóng (Antinode)
                                </text>
                                <text
                                  x={embouchureX + waveWidth * 0.5}
                                  y={waveMidY - 12}
                                  fill="#FDE047"
                                  fontSize="9"
                                  textAnchor="middle"
                                  fontWeight="bold"
                                >
                                  Nút sóng (Node)
                                </text>
                                <text
                                  x={columnEnd}
                                  y={waveMidY - 12}
                                  fill="#38BDF8"
                                  fontSize="9"
                                  textAnchor="middle"
                                  fontWeight="bold"
                                >
                                  Bụng sóng (Lỗ thoát khí)
                                </text>
                              </g>
                            );
                          })()}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Bottom Sound Control Bar inside Canvas */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 z-10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8A9E96]">Bấm vào từng lỗ sáo để đóng/mở hoặc thổi âm:</span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlayTone}
                    className="min-h-[40px] px-5 py-2 bg-[#D6AA55] hover:bg-[#C29744] text-[#20332D] font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <Volume2 className="w-4 h-4 text-[#20332D]" />
                    Thổi nốt sáo ({currentNote} – {fundamentalFreq} Hz)
                  </button>
                </div>
              </div>

              {/* Real-time Metric Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Tần số riêng f₀</div>
                  <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                    {fundamentalFreq} Hz
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Bước sóng âm λ</div>
                  <div className="font-mono font-bold text-sky-300 text-sm mt-0.5">
                    {wavelengthCm} cm
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Cột khí hiệu dụng</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    {Math.round(effectiveLengthM * 100 * 10) / 10} cm
                  </div>
                </div>

                <div className="p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <div className="text-[#8A9E96] text-[10px] uppercase font-bold">Số lỗ đang mở</div>
                  <div className="font-mono font-bold text-purple-300 text-sm mt-0.5">
                    {holes.filter(Boolean).length} / 6 lỗ
                  </div>
                </div>
              </div>
            </div>

            {/* Right Controls Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#174C3C]" />
                  Điều khiển hình học ống sáo & Môi trường
                </h3>
              </div>

              {/* 1. Quick Presets (Thang âm nốt) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#20332D]">
                  Bấm phím chọn thế ngón nhanh (Preset thế sáo):
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Đô (C5)', pattern: [false, false, false, false, false, false] },
                    { label: 'Rê (D5)', pattern: [true, false, false, false, false, false] },
                    { label: 'Mi (E5)', pattern: [true, true, false, false, false, false] },
                    { label: 'Fa (F5)', pattern: [true, true, true, false, false, false] },
                    { label: 'Sol (G5)', pattern: [true, true, true, true, false, false] },
                    { label: 'La (A5)', pattern: [true, true, true, true, true, false] },
                    { label: 'Si (B5)', pattern: [true, true, true, true, true, true] },
                    { label: 'Mở hết', pattern: [true, true, true, true, true, true] },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => applyPreset(preset.pattern)}
                      className="py-1.5 px-2 bg-[#FAF7F0] hover:bg-[#EBF2EE] text-[#174C3C] font-semibold rounded-lg border border-[#E8E2D5] text-[11px] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chiều dài ống sáo L */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D]">Chiều dài thân sáo (L):</span>
                  <span className="font-mono text-[#174C3C] font-extrabold text-sm bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                    {tubeLengthCm} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="1"
                  value={tubeLengthCm}
                  onChange={(e) => setTubeLengthCm(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>25 cm (sáo ngắn - âm cao)</span>
                  <span>42 cm (sáo Đô chuẩn)</span>
                  <span>60 cm (sáo tiêu trầm)</span>
                </div>
              </div>

              {/* 3. Đường kính lòng ống sáo */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D]">Đường kính lòng ống (D):</span>
                  <span className="font-mono text-[#174C3C] font-bold">
                    {tubeDiameterMm} mm (ΔL = {Math.round(0.61 * (tubeDiameterMm / 2) * 10) / 10} mm)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="20"
                  step="1"
                  value={tubeDiameterMm}
                  onChange={(e) => setTubeDiameterMm(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* 4. Nhiệt độ không khí T */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#20332D]">Nhiệt độ không khí môi trường:</span>
                  <span className="font-mono text-[#A94438] font-bold">
                    {airTempC}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={airTempC}
                  onChange={(e) => setAirTempC(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
                <div className="flex justify-between text-[10px] text-[#8A9E96]">
                  <span>5°C (Mùa đông - âm trầm)</span>
                  <span>25°C (Tiêu chuẩn phòng)</span>
                  <span>40°C (Mùa hè - âm cao hơn)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={handlePlayTone}
                  className="flex-1 min-h-[44px] bg-[#FAF7F0] border border-[#E8E2D5] hover:bg-white text-[#174C3C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Volume2 className="w-4 h-4 text-[#D6AA55]" /> Thử lại âm thanh
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

          {/* Collapsible Math & Acoustic Engine Behind the Scenes */}
          <FormulaAccordion
            formula={station.keyFormula}
            description={station.formulaDescription}
            title="Xem công thức sóng dừng & Âm học đằng sau"
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
            Bối cảnh di sản & Nghệ nhân khoét sáo
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed font-normal">{station.steps.context.description}</p>
          
          <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3 text-xs sm:text-sm text-[#20332D]">
            <h3 className="font-bold uppercase text-[#174C3C] tracking-wider">Bí quyết dân gian từ nứa già:</h3>
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
          <h2 className="text-xl font-bold text-[#174C3C]">Vấn đề âm học thực tế</h2>
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
              Vào làm thí nghiệm trên sáo ảo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5, 6, 7 */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h2 className="text-xl font-bold text-[#174C3C]">Phân tích dữ liệu & Họa âm</h2>
          <p className="text-sm text-[#556D65] leading-relaxed">
            Sáo trúc là một ống cộng hưởng hai đầu hở (lỗ thổi và lỗ ngón tay mở gần nhất). Ở trạng thái cộng hưởng, hai đầu là hai bụng sóng áp suất âm, ở giữa thân ống là các nút sóng.
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
              Nhận xét của học sinh về mối quan hệ giữa chiều dài và cao độ:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi lại các ghi chép về tần số nốt Đô, Rê, Mi khi thay đổi nhiệt độ hoặc độ dài ống sáo..."
              className="w-full p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs text-[#20332D] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => toggleStationCompleted(7)}
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
