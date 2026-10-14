import React, { useState } from 'react';
import { Mountain, CloudRain, Wind, Thermometer, Droplets, CheckCircle2, AlertTriangle, Download, ArrowRight, ShieldCheck, Sun } from 'lucide-react';
import { exportToCSV, getCurrentStudent, saveResearchLog } from '../utils/storage';
import { MuongPatternBorder } from '../components/MuongPatternBorder';

export const TamDaoClimateLab: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'elevation' | 'foehn' | 'orographic_rain' | 'adaptive_house'>('elevation');

  // Module A: Elevation vs Temperature
  const [baseTemp, setBaseTemp] = useState<number>(28.0); // T1 at base (e.g. 100m)
  const [baseElevation, setBaseElevation] = useState<number>(100); // meters
  const [targetElevation, setTargetElevation] = useState<number>(900); // meters (e.g. Tam Dao town ~900m)
  const [lapseRate, setLapseRate] = useState<number>(0.6); // °C / 100m

  // Calculation for Module A: T2 = T1 - Gamma * (h2 - h1) / 100
  const calculatedTemp = Math.round((baseTemp - (lapseRate * (targetElevation - baseElevation)) / 100) * 10) / 10;

  // Module B: Windward & Leeward (Foehn Effect)
  const [windwardSeaLevelTemp, setWindwardSeaLevelTemp] = useState<number>(30.0); // °C
  const [dewPointSeaLevel, setDewPointSeaLevel] = useState<number>(22.0); // °C
  const [mountainPeakElevation, setMountainPeakElevation] = useState<number>(1200); // meters
  const dryAdiabaticRate = 1.0; // °C / 100m
  const moistAdiabaticRate = 0.55; // °C / 100m

  // Lifted Condensation Level (LCL)
  const lclElevation = Math.max(200, Math.min(mountainPeakElevation, Math.round(((windwardSeaLevelTemp - dewPointSeaLevel) / 0.8) * 100)));
  const tempAtLcl = windwardSeaLevelTemp - (dryAdiabaticRate * lclElevation) / 100;
  const tempAtPeak = Math.max(0, tempAtLcl - (moistAdiabaticRate * Math.max(0, mountainPeakElevation - lclElevation)) / 100);
  const leewardFootTemp = Math.round((tempAtPeak + (dryAdiabaticRate * mountainPeakElevation) / 100) * 10) / 10;

  // Module C: Orographic Rain
  const [airHumidity, setAirHumidity] = useState<number>(85); // %
  const [windSpeed, setWindSpeed] = useState<number>(14); // km/h
  const [condensationThreshold, setCondensationThreshold] = useState<number>(75); // %

  // Module D: Climate-Adaptive House Challenge
  const [houseRoofSlope, setHouseRoofSlope] = useState<number>(45); // degrees
  const [houseFloorHeight, setHouseFloorHeight] = useState<number>(2.0); // meters
  const [rainCisternSize, setRainCisternSize] = useState<number>(2.5); // m3
  const [houseVentilation, setHouseVentilation] = useState<number>(70); // %

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveToJournal = (moduleName: string) => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 99,
      stationTitle: 'Tam Đảo Climate Lab – Chuyên đề vi khí hậu vùng núi',
      hypothesis: `Khảo sát chuyên đề khí hậu Tam Đảo (${moduleName})`,
      changedVariables: {
        module: moduleName,
        baseTemp,
        targetElevation,
        lapseRate,
        mountainPeakElevation,
        leewardFootTemp,
      },
      recordedResults: {
        calculatedTemp_at_elevation: calculatedTemp,
        lclElevation_clouds: lclElevation,
        tempAtPeak,
        foehnEffectDelta: (leewardFootTemp - windwardSeaLevelTemp).toFixed(1),
      },
      observationNotes: `Tại 900m mô hình ước tính ${calculatedTemp}°C (giảm ${(baseTemp - calculatedTemp).toFixed(1)}°C so với chân núi 100m). Hiệu ứng Phơn làm sườn khuất gió nóng thêm ${(leewardFootTemp - windwardSeaLevelTemp).toFixed(1)}°C.`,
      reflectionAnswers: 'Độ cao và sườn núi tạo nên sự phân hóa vi khí hậu sâu sắc, quyết định cách bố trí nhà cửa và cây trồng.',
      isVerifiedRealData: false,
    });
    setSaveSuccess(`Đã lưu dữ liệu chuyên đề Tam Đảo vào Nhật ký học sinh ${student}!`);
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
              CHUYÊN ĐỀ ĐẶC BIỆT
            </span>
            <span className="text-xs text-[#D6AA55]">·</span>
            <span className="text-xs font-semibold text-[#556D65]">Liên kết Trạm 03 · Trạm 10 · Trạm 16</span>
          </div>
          <span className="text-xs font-mono text-[#174C3C] font-semibold">Dãy núi Tam Đảo (Vĩnh Phúc · Phú Thọ · Thái Nguyên)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight flex items-center gap-2.5">
          <Mountain className="w-7 h-7 text-[#D6AA55]" />
          TAM ĐẢO CLIMATE LAB
        </h1>
        <p className="text-sm sm:text-base text-[#556D65] mt-1.5 leading-relaxed max-w-2xl">
          Phòng thí nghiệm vi khí hậu vùng núi: Mô phỏng quy luật nhiệt độ theo độ cao, hiệu ứng sườn đón gió / khuất gió (Phơn), mưa địa hình và kiến trúc nhà ở thích ứng thiên tai.
        </p>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-[#E8E2D5]">
        {[
          { id: 'elevation', label: 'A. Nhiệt độ theo độ cao (Lapse Rate)' },
          { id: 'foehn', label: 'B. Sườn đón gió & Hiệu ứng Phơn' },
          { id: 'orographic_rain', label: 'C. Mưa địa hình khái niệm' },
          { id: 'adaptive_house', label: 'D. Nhà thích ứng bão lũ Tam Đảo' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveModule(tab.id as typeof activeModule)}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl border-b-2 transition-all ${
              activeModule === tab.id
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

      {/* MODULE A: TEMPERATURE VS ELEVATION */}
      {activeModule === 'elevation' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                MÔ HÌNH GIÁO DỤC
              </span>
              <span>
                Công thức T₂ = T₁ - Γ(h₂ - h₁)/100. Đây là mô hình tính toán lý thuyết, không phải số liệu trạm quan trắc Tam Đảo thực tế.
              </span>
            </div>
            <span className="font-mono text-[#556D65] hidden sm:inline">Lapse Rate Model</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Mountain Elevation Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-[#20332D] p-5 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-[#E8E2D5]">
                <span>MẶT CẮT ĐỘ CAO TAM ĐẢO & ĐỒ THỊ NHIỆT ĐỘ</span>
                <span className="text-[#D6AA55] font-bold">
                  Tại {targetElevation}m: ~{calculatedTemp}°C
                </span>
              </div>

              <div className="relative w-full h-72">
                <svg viewBox="0 0 500 280" className="w-full h-full">
                  <defs>
                    <linearGradient id="mtnGradTamDao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#174C3C" />
                      <stop offset="60%" stopColor="#11382C" />
                      <stop offset="100%" stopColor="#0B2019" />
                    </linearGradient>
                  </defs>

                  {/* Mountain Profile Polygon */}
                  <polygon
                    points="0,260 80,240 180,180 260,110 340,70 410,130 500,260"
                    fill="url(#mtnGradTamDao)"
                    stroke="#D6AA55"
                    strokeWidth="1.5"
                  />

                  {/* Base station dot */}
                  <circle cx="80" cy="240" r="5" fill="#A94438" />
                  <text x="80" y="256" fill="#FAF7F0" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Chân núi ({baseElevation}m: {baseTemp}°C)
                  </text>

                  {/* Mountain Peak (Đỉnh Rùng Rình ~1300m) */}
                  <line x1="340" y1="70" x2="340" y2="45" stroke="#E8E2D5" strokeWidth="2" />
                  <circle cx="340" cy="45" r="3" fill="#D6AA55" />
                  <text x="340" y="38" fill="#FAF7F0" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    Đỉnh Rùng Rình (~1300m)
                  </text>

                  {/* Target elevation indicator line & marker */}
                  {(() => {
                    const ratio = Math.max(0, Math.min(1, (targetElevation - 100) / 1200));
                    const markerX = 80 + ratio * 260;
                    const markerY = 240 - ratio * 170;

                    return (
                      <g>
                        <line
                          x1="0"
                          y1={markerY}
                          x2={markerX}
                          stroke="#D6AA55"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <circle cx={markerX} cy={markerY} r="7" fill="#D6AA55" stroke="#FFFFFF" strokeWidth="2" />
                        <rect
                          x={markerX + 12}
                          y={markerY - 22}
                          width="120"
                          height="36"
                          fill="#174C3C"
                          rx="6"
                          stroke="#D6AA55"
                          strokeWidth="1"
                        />
                        <text x={markerX + 20} y={markerY - 8} fill="#FAF7F0" fontSize="10" fontWeight="bold">
                          {targetElevation}m: {calculatedTemp}°C
                        </text>
                        <text x={markerX + 20} y={markerY + 6} fill="#D6AA55" fontSize="8" fontFamily="monospace">
                          ΔT: -{((lapseRate * (targetElevation - baseElevation)) / 100).toFixed(1)}°C
                        </text>
                      </g>
                    );
                  })()}

                  {/* Axis indicators */}
                  {[100, 500, 900, 1300].map((h) => {
                    const ratio = (h - 100) / 1200;
                    const y = 240 - ratio * 170;
                    return (
                      <g key={h}>
                        <line x1="26" y1={y} x2="34" y2={y} stroke="#8AA39B" />
                        <text x="22" y={y + 3} fill="#FAF7F0" fontSize="8" textAnchor="end" fontFamily="monospace">
                          {h}m
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-[#E8E2D5] border-t border-[#174C3C] pt-3">
                <span>Ví dụ: Tại 100m là 28°C, lên 900m với Γ = 0.6°C/100m nhiệt độ còn 23.2°C.</span>
                <span className="text-[#D6AA55] font-bold">Chênh lệch: -{(baseTemp - calculatedTemp).toFixed(1)}°C</span>
              </div>
            </div>

            {/* Right: Controls & Parameters (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Tham số mô hình suy giảm nhiệt độ
              </h3>

              {/* Slider: Target Elevation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Độ cao vị trí khảo sát h₂ (m):</span>
                  <span className="font-mono text-[#174C3C] font-bold">{targetElevation} m</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1300"
                  step="25"
                  value={targetElevation}
                  onChange={(e) => setTargetElevation(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
                <div className="flex justify-between text-[11px] text-[#556D65]">
                  <span>Chân núi (100m)</span>
                  <span>Thị trấn (900m)</span>
                  <span>Đỉnh Rùng Rình (1300m)</span>
                </div>
              </div>

              {/* Slider: Lapse Rate Gamma */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Suất giảm nhiệt độ Γ (°C / 100m):</span>
                  <span className="font-mono text-[#174C3C] font-bold">{lapseRate.toFixed(2)} °C/100m</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={lapseRate}
                  onChange={(e) => setLapseRate(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
                <div className="flex justify-between text-[11px] text-[#556D65]">
                  <span>0.4 (ẩm nhiều)</span>
                  <span>0.6 (chuẩn giáo dục)</span>
                  <span>1.0 (khô hoàn toàn)</span>
                </div>
              </div>

              {/* Slider: Base temp T1 */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Nhiệt độ tại chân núi T₁ (100m):</span>
                  <span className="font-mono text-[#A94438] font-bold">{baseTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="38"
                  step="0.5"
                  value={baseTemp}
                  onChange={(e) => setBaseTemp(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              {/* Result Summary Box */}
              <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-2">
                <div className="font-bold text-[#174C3C]">Kết quả tính toán mô hình:</div>
                <div className="flex items-center justify-between font-mono">
                  <span>Độ cao chênh lệch Δh:</span>
                  <span className="font-bold">{targetElevation - baseElevation} m</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Độ giảm nhiệt độ ΔT:</span>
                  <span className="text-[#A94438] font-bold">
                    -{((lapseRate * (targetElevation - baseElevation)) / 100).toFixed(1)}°C
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono pt-1.5 border-t border-[#E8E2D5] text-sm">
                  <span className="font-bold text-[#20332D]">Nhiệt độ ước tính T₂:</span>
                  <span className="text-[#174C3C] font-extrabold">{calculatedTemp}°C</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Nhiet_do_theo_do_cao')}
                className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
                Lưu vào Nhật ký nghiên cứu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE B: WINDWARD & FOEHN EFFECT */}
      {activeModule === 'foehn' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                MÔ PHỎNG SUẤT ĐOẠN NHIỆT KHÔ / ẨM
              </span>
              <span>
                Sườn đón gió ngưng tụ giải phóng ẩn nhiệt (Γ_m ≈ 0.55°C/100m). Khi qua đỉnh, khối khí khô hạ xuống sườn khuất gió nóng lên nhanh theo suất khô (Γ_d = 1.0°C/100m) tạo gió Phơn khô nóng.
              </span>
            </div>
            <span className="font-mono text-[#556D65] hidden sm:inline">Foehn Effect</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#20332D] p-5 rounded-2xl border border-[#174C3C] text-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-[#E8E2D5]">
                <span>MÔ PHỎNG ĐOẠN NHIỆT: SƯỜN ĐÓN GIÓ vs SƯỜN KHUẤT GIÓ</span>
                <span className="text-[#D6AA55] font-bold">
                  Hiệu ứng Phơn: +{(leewardFootTemp - windwardSeaLevelTemp).toFixed(1)}°C
                </span>
              </div>

              <div className="relative w-full h-80">
                <svg viewBox="0 0 540 300" className="w-full h-full">
                  <polygon
                    points="40,270 270,70 500,270"
                    fill="#174C3C"
                    stroke="#D6AA55"
                    strokeWidth="2"
                  />

                  {(() => {
                    const lclY = 270 - (lclElevation / mountainPeakElevation) * 200;
                    return (
                      <g>
                        <line
                          x1="40"
                          y1={lclY}
                          x2="270"
                          y2={lclY}
                          stroke="#D6AA55"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text x="50" y={lclY - 6} fill="#D6AA55" fontSize="9" fontFamily="monospace">
                          Mực ngưng tụ mây LCL ({lclElevation}m: {tempAtLcl.toFixed(1)}°C)
                        </text>

                        <ellipse cx="200" cy={(lclY + 70) / 2} rx="45" ry="18" fill="#FAF7F0" opacity="0.85" />
                        <ellipse cx="170" cy={(lclY + 70) / 2 + 5} rx="35" ry="16" fill="#E8E2D5" opacity="0.9" />

                        {[160, 180, 200, 220].map((rx) => (
                          <line
                            key={rx}
                            x1={rx}
                            y1={(lclY + 70) / 2 + 20}
                            x2={rx - 10}
                            y2={lclY + 30}
                            stroke="#D6AA55"
                            strokeWidth="1.5"
                            strokeDasharray="4 6"
                          />
                        ))}
                      </g>
                    );
                  })()}

                  <path
                    d="M 20,260 Q 140,240 250,90"
                    fill="none"
                    stroke="#FAF7F0"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <text x="60" y="220" fill="#FAF7F0" fontSize="10" fontWeight="bold">
                    Gió ẩm đi lên (Lạnh dần)
                  </text>

                  <path
                    d="M 290,90 Q 400,240 520,260"
                    fill="none"
                    stroke="#A94438"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <text x="350" y="210" fill="#A94438" fontSize="10" fontWeight="bold">
                    Gió khô hạ xuống (Nóng lên nhanh)
                  </text>

                  <circle cx="50" cy="270" r="4" fill="#FAF7F0" />
                  <text x="50" y="290" fill="#FAF7F0" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Chân đón gió: {windwardSeaLevelTemp}°C
                  </text>

                  <circle cx="270" cy="70" r="4" fill="#D6AA55" />
                  <text x="270" y="55" fill="#D6AA55" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Đỉnh núi ({mountainPeakElevation}m): {tempAtPeak.toFixed(1)}°C
                  </text>

                  <circle cx="490" cy="270" r="4" fill="#A94438" />
                  <text x="490" y="290" fill="#A94438" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Chân khuất gió: {leewardFootTemp}°C
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-black/20 rounded-xl border border-[#174C3C]">
                <div>
                  <div className="text-[#E8E2D5]">1. Sườn đón gió</div>
                  <div className="font-bold text-[#FAF7F0]">{windwardSeaLevelTemp}°C (Ẩm)</div>
                </div>
                <div>
                  <div className="text-[#E8E2D5]">2. Trên đỉnh núi</div>
                  <div className="font-bold text-[#D6AA55]">{tempAtPeak.toFixed(1)}°C (Mây mưa)</div>
                </div>
                <div>
                  <div className="text-[#E8E2D5]">3. Sườn khuất gió</div>
                  <div className="font-bold text-[#A94438]">{leewardFootTemp}°C (Khô nóng)</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Thông số điều kiện vi khí hậu
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Nhiệt độ chân đón gió:</span>
                  <span className="font-mono text-[#174C3C] font-bold">{windwardSeaLevelTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="36"
                  step="0.5"
                  value={windwardSeaLevelTemp}
                  onChange={(e) => setWindwardSeaLevelTemp(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Điểm sương T_dew chân núi:</span>
                  <span className="font-mono text-[#174C3C] font-bold">{dewPointSeaLevel}°C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="26"
                  step="0.5"
                  value={dewPointSeaLevel}
                  onChange={(e) => setDewPointSeaLevel(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Độ cao đỉnh núi Tam Đảo:</span>
                  <span className="font-mono text-[#174C3C] font-bold">{mountainPeakElevation} m</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="1500"
                  step="50"
                  value={mountainPeakElevation}
                  onChange={(e) => setMountainPeakElevation(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Suon_don_gio_va_Phoen')}
                className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 pt-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
                Lưu vào Nhật ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE C: OROGRAPHIC RAIN */}
      {activeModule === 'orographic_rain' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] shadow-2xs">
            <strong>MÔ PHỎNG MƯA ĐỊA HÌNH KHÁI NIỆM:</strong> Khám phá điều kiện độ ẩm bão hòa và vận tốc gió sườn núi để kích hoạt quá trình ngưng tụ tạo mây và mưa tại sườn đón gió Tam Đảo.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2">
              <label className="text-xs font-bold text-[#20332D]">Độ ẩm khối khí ẩm (%):</label>
              <input
                type="range"
                min="50"
                max="98"
                value={airHumidity}
                onChange={(e) => setAirHumidity(parseInt(e.target.value))}
                className="w-full accent-[#174C3C]"
              />
              <span className="font-mono text-sm font-bold text-[#174C3C]">{airHumidity}%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2">
              <label className="text-xs font-bold text-[#20332D]">Vận tốc gió sườn núi (km/h):</label>
              <input
                type="range"
                min="5"
                max="40"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                className="w-full accent-[#174C3C]"
              />
              <span className="font-mono text-sm font-bold text-[#174C3C]">{windSpeed} km/h</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2">
              <label className="text-xs font-bold text-[#20332D]">Ngưỡng ngưng tụ bão hòa (%):</label>
              <input
                type="range"
                min="60"
                max="90"
                value={condensationThreshold}
                onChange={(e) => setCondensationThreshold(parseInt(e.target.value))}
                className="w-full accent-[#174C3C]"
              />
              <span className="font-mono text-sm font-bold text-[#174C3C]">{condensationThreshold}%</span>
            </div>
          </div>

          <div className="p-6 bg-[#20332D] rounded-2xl border border-[#174C3C] text-center text-xs text-[#FAF7F0] shadow-sm">
            {airHumidity >= condensationThreshold ? (
              <div className="space-y-3">
                <CloudRain className="w-10 h-10 text-[#D6AA55] mx-auto animate-bounce" />
                <div className="text-[#D6AA55] font-extrabold text-base">
                  ĐIỀU KIỆN ĐẠT NGƯỠNG: MÂY ĐỊA HÌNH VÀ MƯA RÀO TẠI SƯỜN NÚI
                </div>
                <p className="max-w-md mx-auto text-[#E8E2D5] leading-relaxed text-sm">
                  Khối khí bão hòa độ ẩm ({airHumidity}% ≥ {condensationThreshold}%) khi bị sườn dốc Tam Đảo đẩy lên cao bị lạnh nhanh, giải phóng lượng mưa lớn tập trung ở sườn đón gió.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Sun className="w-10 h-10 text-[#D6AA55] mx-auto" />
                <div className="text-[#FAF7F0] font-bold text-base">CHƯA ĐẠT NGƯỠNG TẠO MƯA ĐỊA HÌNH</div>
                <p className="max-w-md mx-auto text-[#E8E2D5] leading-relaxed text-sm">
                  Độ ẩm hiện tại ({airHumidity}%) thấp hơn ngưỡng bão hòa ({condensationThreshold}%). Khối khí chưa đủ điều kiện ngưng tụ thành hạt mưa khi vượt qua sườn núi.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE D: CLIMATE-ADAPTIVE HOUSE */}
      {activeModule === 'adaptive_house' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#EBF2EE] border border-[#174C3C]/30 rounded-2xl text-xs sm:text-sm text-[#20332D] shadow-2xs">
            <strong className="text-[#174C3C]">THỬ THÁCH THIẾT KẾ NHÀ THÍCH ỨNG:</strong> Kết hợp tri thức nhà sàn (Trạm 03), thoát nước mái cọ (Trạm 16) và chống lũ quét (Trạm 10) để giải bài toán xây dựng an toàn trước khí hậu dông bão vùng núi Tam Đảo.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Cấu hình kiến trúc đề xuất
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Góc dốc mái θ (°):</span>
                  <span className="font-mono text-[#174C3C] font-bold">{houseRoofSlope}°</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={houseRoofSlope}
                  onChange={(e) => setHouseRoofSlope(parseInt(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Chiều cao sàn vượt lũ h (m):</span>
                  <span className="font-mono text-[#174C3C] font-bold">{houseFloorHeight} m</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={houseFloorHeight}
                  onChange={(e) => setHouseFloorHeight(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#20332D]">Thể tích bể trữ nước mưa (m³):</span>
                  <span className="font-mono text-[#174C3C] font-bold">{rainCisternSize} m³</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={rainCisternSize}
                  onChange={(e) => setRainCisternSize(parseFloat(e.target.value))}
                  className="w-full accent-[#174C3C]"
                />
              </div>
            </div>

            <div className="bg-[#FAF7F0] p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 text-xs shadow-xs">
              <h3 className="font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E2D5] pb-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D6AA55]" />
                Đánh giá chỉ số an toàn & thích ứng
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
                  <div className="font-bold text-[#20332D]">Khả năng thoát nước mưa dông:</div>
                  <div className={houseRoofSlope >= 40 ? 'text-[#174C3C] font-bold mt-0.5' : 'text-[#A94438] font-bold mt-0.5'}>
                    {houseRoofSlope >= 40 ? '✓ Tối ưu (Dốc ≥ 40° nước tuôn nhanh, không dột lá cọ)' : '⚠ Nguy cơ dột cao khi mưa rào Tam Đảo (Nên tăng dốc ≥ 40°)'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
                  <div className="font-bold text-[#20332D]">Khả năng tránh lũ quét & ẩm mốc sườn núi:</div>
                  <div className={houseFloorHeight >= 1.8 ? 'text-[#174C3C] font-bold mt-0.5' : 'text-[#A94438] font-bold mt-0.5'}>
                    {houseFloorHeight >= 1.8 ? '✓ An toàn (Gầm sàn ≥ 1.8m thông thoáng vượt lũ bùn)' : '⚠ Sàn quá thấp, dễ ngập bùn đá từ sườn đồi'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E8E2D5]">
                  <div className="font-bold text-[#20332D]">Trữ lượng nước sinh hoạt tự chủ:</div>
                  <div className="text-[#174C3C] font-bold mt-0.5">
                    {rainCisternSize >= 2.0 ? '✓ Đủ dùng cho gia đình 4 người trong 25 ngày khô hạn' : '⚠ Bể nhỏ, nên tăng dung tích'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Nha_thich_ung_khi_hau')}
                className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
                Lưu phương án thiết kế vào Nhật ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
