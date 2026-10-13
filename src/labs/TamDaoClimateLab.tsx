import React, { useState } from 'react';
import { Mountain, CloudRain, Wind, Thermometer, Droplets, CheckCircle2, AlertTriangle, Download, ArrowRight, ShieldCheck, Sun } from 'lucide-react';
import { exportToCSV, getCurrentStudent, saveResearchLog } from '../utils/storage';

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

  // Lifted Condensation Level (LCL): Elevation where T drops to T_dew
  // Approx: LCL = (T - T_dew) / (0.8°C / 100m) * 100m
  const lclElevation = Math.max(200, Math.min(mountainPeakElevation, Math.round(((windwardSeaLevelTemp - dewPointSeaLevel) / 0.8) * 100)));

  // Temp at LCL
  const tempAtLcl = windwardSeaLevelTemp - (dryAdiabaticRate * lclElevation) / 100;
  // Temp at Mountain Peak (ascent from LCL to Peak at moist adiabatic rate)
  const tempAtPeak = Math.max(0, tempAtLcl - (moistAdiabaticRate * Math.max(0, mountainPeakElevation - lclElevation)) / 100);
  // Leeward foot descent (all dry adiabatic descent, moisture rained out!)
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
      stationId: 99, // Special Lab ID
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
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-lg p-6 shadow-md border border-emerald-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
              CHUYÊN ĐỀ ĐẶC BIỆT
            </span>
            <span className="text-xs text-stone-300">Liên kết Trạm 03 · Trạm 10 · Trạm 16</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">Dãy núi Tam Đảo (Vĩnh Phúc · Phú Thọ · Thái Nguyên)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Mountain className="w-7 h-7 text-emerald-400" />
          TAM ĐẢO CLIMATE LAB
        </h1>
        <p className="text-stone-300 text-sm mt-1 max-w-2xl">
          Phòng thí nghiệm vi khí hậu vùng núi: Mô phỏng quy luật nhiệt độ theo độ cao, hiệu ứng sườn đón gió / khuất gió (Phơn), mưa địa hình và kiến trúc nhà ở thích ứng.
        </p>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-stone-200">
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
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap rounded-t border-b-2 transition-colors ${
              activeModule === tab.id
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 rounded">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* MODULE A: TEMPERATURE VS ELEVATION */}
      {activeModule === 'elevation' && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                MÔ HÌNH GIÁO DỤC
              </span>
              <span>
                Công thức T₂ = T₁ - Γ(h₂ - h₁)/100. Đây là mô hình tính toán lý thuyết, không phải số liệu trạm quan trắc Tam Đảo thực tế.
              </span>
            </div>
            <span className="font-mono text-stone-500 hidden sm:inline">Lapse Rate Model</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Mountain Elevation Canvas / Graphic (7 cols) */}
            <div className="lg:col-span-7 bg-stone-900 p-5 rounded-lg border border-stone-800 text-white space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>MẶT CẮT ĐỘ CAO TAM ĐẢO & ĐỒ THỊ NHIỆT ĐỘ</span>
                <span className="text-emerald-400 font-bold">
                  Tại {targetElevation}m: ~{calculatedTemp}°C
                </span>
              </div>

              <div className="relative w-full h-72">
                <svg viewBox="0 0 500 280" className="w-full h-full">
                  <defs>
                    <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2d6a4f" />
                      <stop offset="60%" stopColor="#1b4332" />
                      <stop offset="100%" stopColor="#081c15" />
                    </linearGradient>
                    <linearGradient id="tempColorGrad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="60%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>

                  {/* Mountain Profile Polygon */}
                  <polygon
                    points="0,260 80,240 180,180 260,110 340,70 410,130 500,260"
                    fill="url(#mtnGrad)"
                    stroke="#52b788"
                    strokeWidth="1.5"
                  />

                  {/* Base station dot (e.g. 100m) */}
                  <circle cx="80" cy="240" r="5" fill="#f87171" />
                  <text x="80" y="256" fill="#fca5a5" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Chân núi ({baseElevation}m: {baseTemp}°C)
                  </text>

                  {/* Mountain Peak (Tháp / Đỉnh Rùng Rình ~1300m) */}
                  <line x1="340" y1="70" x2="340" y2="45" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="340" cy="45" r="3" fill="#ef4444" className="animate-ping" />
                  <text x="340" y="38" fill="#cbd5e1" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    Đỉnh Rùng Rình (~1300m)
                  </text>

                  {/* Target elevation indicator line & marker */}
                  {(() => {
                    // Map targetElevation (100 to 1300m) to SVG X, Y coordinate along mountain ridge
                    const ratio = Math.max(0, Math.min(1, (targetElevation - 100) / 1200));
                    const markerX = 80 + ratio * 260;
                    const markerY = 240 - ratio * 170;

                    return (
                      <g>
                        {/* Horizontal dashed guide */}
                        <line
                          x1="0"
                          y1={markerY}
                          x2={markerX}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        {/* Target marker circle */}
                        <circle cx={markerX} cy={markerY} r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                        <rect
                          x={markerX + 12}
                          y={markerY - 22}
                          width="120"
                          height="36"
                          fill="#0f172a"
                          rx="4"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x={markerX + 18}
                          y={markerY - 8}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          h = {targetElevation} m
                        </text>
                        <text
                          x={markerX + 18}
                          y={markerY + 6}
                          fill="#34d399"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          T = {calculatedTemp}°C
                        </text>
                      </g>
                    );
                  })()}

                  {/* Elevation axis */}
                  <line x1="30" y1="260" x2="30" y2="40" stroke="#475569" strokeWidth="1" />
                  {[100, 500, 900, 1300].map((h) => {
                    const y = 260 - ((h - 100) / 1200) * 200;
                    return (
                      <g key={h}>
                        <line x1="26" y1={y} x2="34" y2={y} stroke="#64748b" />
                        <text x="22" y={y + 3} fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">
                          {h}m
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-3">
                <span>Ví dụ: Tại 100m là 28°C, lên 900m với Γ = 0.6°C/100m nhiệt độ còn 23.2°C.</span>
                <span className="text-emerald-400">Chênh lệch: -{(baseTemp - calculatedTemp).toFixed(1)}°C</span>
              </div>
            </div>

            {/* Right: Controls & Parameters (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Tham số mô hình suy giảm nhiệt độ
              </h3>

              {/* Slider: Target Elevation */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Độ cao vị trí khảo sát h₂ (m):</span>
                  <span className="font-mono text-emerald-800 font-bold">{targetElevation} m</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1300"
                  step="25"
                  value={targetElevation}
                  onChange={(e) => setTargetElevation(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Chân núi (100m)</span>
                  <span>Thị trấn (900m)</span>
                  <span>Đỉnh Rùng Rình (1300m)</span>
                </div>
              </div>

              {/* Slider: Lapse Rate Gamma */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Suất giảm nhiệt độ Γ (°C / 100m):</span>
                  <span className="font-mono text-emerald-800 font-bold">{lapseRate.toFixed(2)} °C/100m</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={lapseRate}
                  onChange={(e) => setLapseRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>0.4 (ẩm nhiều)</span>
                  <span>0.6 (chuẩn giáo dục)</span>
                  <span>1.0 (khô hoàn toàn)</span>
                </div>
              </div>

              {/* Slider: Base temp T1 */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Nhiệt độ tại chân núi T₁ (100m):</span>
                  <span className="font-mono text-red-700 font-bold">{baseTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="38"
                  step="0.5"
                  value={baseTemp}
                  onChange={(e) => setBaseTemp(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              {/* Result Summary Box */}
              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-2">
                <div className="font-bold text-stone-800">Kết quả tính toán mô hình:</div>
                <div className="flex items-center justify-between font-mono">
                  <span>Độ cao chênh lệch Δh:</span>
                  <span className="font-bold">{targetElevation - baseElevation} m</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Độ giảm nhiệt độ ΔT:</span>
                  <span className="text-blue-700 font-bold">
                    -{((lapseRate * (targetElevation - baseElevation)) / 100).toFixed(1)}°C
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono pt-1 border-t border-stone-200 text-sm">
                  <span className="font-bold text-stone-900">Nhiệt độ ước tính T₂:</span>
                  <span className="text-emerald-800 font-bold">{calculatedTemp}°C</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Nhiet_do_theo_do_cao')}
                className="w-full py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Lưu vào Nhật ký nghiên cứu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE B: WINDWARD & FOEHN EFFECT */}
      {activeModule === 'foehn' && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                MÔ PHỎNG SUẤT ĐOẠN NHIỆT KHÔ / ẨM
              </span>
              <span>
                Sườn đón gió ngưng tụ giải phóng ẩn nhiệt (Γ_m ≈ 0.55°C/100m). Khi qua đỉnh, khối khí khô hạ xuống sườn khuất gió nóng lên nhanh theo suất khô (Γ_d = 1.0°C/100m) tạo gió Phơn khô nóng.
              </span>
            </div>
            <span className="font-mono text-stone-500 hidden sm:inline">Foehn Effect</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Mountain Diagram */}
            <div className="lg:col-span-8 bg-stone-900 p-5 rounded-lg border border-stone-800 text-white space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>MÔ PHỎNG ĐOẠN NHIỆT: SƯỜN ĐÓN GIÓ vs SƯỜN KHUẤT GIÓ</span>
                <span className="text-amber-400 font-bold">
                  Hiệu ứng Phơn: +{(leewardFootTemp - windwardSeaLevelTemp).toFixed(1)}°C
                </span>
              </div>

              <div className="relative w-full h-80">
                <svg viewBox="0 0 540 300" className="w-full h-full">
                  {/* Mountain Profile */}
                  <polygon
                    points="40,270 270,70 500,270"
                    fill="#1b4332"
                    stroke="#40916c"
                    strokeWidth="2"
                  />

                  {/* LCL Condensation cloud on windward side only */}
                  {(() => {
                    const lclY = 270 - (lclElevation / mountainPeakElevation) * 200;
                    return (
                      <g>
                        {/* Cloud line on windward */}
                        <line
                          x1="40"
                          y1={lclY}
                          x2="270"
                          y2={lclY}
                          stroke="#67e8f9"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text x="50" y={lclY - 6} fill="#67e8f9" fontSize="9" fontFamily="monospace">
                          Mực ngưng tụ mây LCL ({lclElevation}m: {tempAtLcl.toFixed(1)}°C)
                        </text>

                        {/* Rain cloud cluster */}
                        <ellipse cx="200" cy={(lclY + 70) / 2} rx="45" ry="18" fill="#e2e8f0" opacity="0.85" />
                        <ellipse cx="170" cy={(lclY + 70) / 2 + 5} rx="35" ry="16" fill="#cbd5e1" opacity="0.9" />

                        {/* Rain streaks on windward */}
                        {[160, 180, 200, 220].map((rx) => (
                          <line
                            key={rx}
                            x1={rx}
                            y1={(lclY + 70) / 2 + 20}
                            x2={rx - 10}
                            y2={lclY + 30}
                            stroke="#38bdf8"
                            strokeWidth="1.5"
                            strokeDasharray="4 6"
                          />
                        ))}
                      </g>
                    );
                  })()}

                  {/* Windward airflow arrow (Ascending) */}
                  <path
                    d="M 20,260 Q 140,240 250,90"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <text x="60" y="220" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    Gió ẩm đi lên (Lạnh dần)
                  </text>

                  {/* Leeward airflow arrow (Descending - hot dry foehn) */}
                  <path
                    d="M 290,90 Q 400,240 520,260"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <text x="350" y="210" fill="#f87171" fontSize="10" fontWeight="bold">
                    Gió khô hạ xuống (Nóng lên nhanh)
                  </text>

                  {/* Labels at key points */}
                  {/* Windward base */}
                  <circle cx="50" cy="270" r="4" fill="#38bdf8" />
                  <text x="50" y="290" fill="#93c5fd" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    Chân đón gió: {windwardSeaLevelTemp}°C
                  </text>

                  {/* Peak */}
                  <circle cx="270" cy="70" r="4" fill="#facc15" />
                  <text x="270" y="55" fill="#fde047" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Đỉnh núi ({mountainPeakElevation}m): {tempAtPeak.toFixed(1)}°C
                  </text>

                  {/* Leeward base */}
                  <circle cx="490" cy="270" r="4" fill="#ef4444" />
                  <text x="490" y="290" fill="#fca5a5" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    Chân khuất gió: {leewardFootTemp}°C
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-stone-950/60 rounded border border-stone-800">
                <div>
                  <div className="text-stone-400">1. Sườn đón gió</div>
                  <div className="font-bold text-sky-400">{windwardSeaLevelTemp}°C (Ẩm)</div>
                </div>
                <div>
                  <div className="text-stone-400">2. Trên đỉnh núi</div>
                  <div className="font-bold text-amber-400">{tempAtPeak.toFixed(1)}°C (Mây mưa)</div>
                </div>
                <div>
                  <div className="text-stone-400">3. Sườn khuất gió</div>
                  <div className="font-bold text-red-400">{leewardFootTemp}°C (Khô nóng)</div>
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Điều chỉnh khối khí & địa hình
              </h3>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Chiều cao đỉnh núi:</span>
                  <span className="font-mono text-emerald-800 font-bold">{mountainPeakElevation} m</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="50"
                  value={mountainPeakElevation}
                  onChange={(e) => setMountainPeakElevation(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Điểm sương T_dew (Độ ẩm):</span>
                  <span className="font-mono text-blue-800 font-bold">{dewPointSeaLevel}°C</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="26"
                  step="1"
                  value={dewPointSeaLevel}
                  onChange={(e) => setDewPointSeaLevel(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
                <span className="text-[11px] text-stone-400">Điểm sương càng cao, mây hình thành càng thấp</span>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-1.5 text-stone-700">
                <div className="font-bold text-stone-900">Giải thích cơ chế Phơn:</div>
                <p>
                  Khối khí ẩm đi lên sườn đón gió bị lạnh đi. Khi đạt mực ngưng tụ ({lclElevation}m), hơi nước hóa lỏng thành mưa và giải phóng ẩn nhiệt ngưng tụ (~2500 kJ/kg).
                </p>
                <p>
                  Khi sang sườn bên kia, không khí đã mất gần hết hơi ẩm nên khi hạ xuống chân núi, nó tăng nhiệt theo suất khô 1.0°C/100m, làm chân sườn khuất gió nóng hơn chân sườn đón gió tới {(leewardFootTemp - windwardSeaLevelTemp).toFixed(1)}°C!
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Hieu_ung_Phon')}
                className="w-full py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
              >
                Lưu vào Nhật ký nghiên cứu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE C: OROGRAPHIC RAINFALL */}
      {activeModule === 'orographic_rain' && (
        <div className="space-y-6">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900">
            <strong>MÔ HÌNH KHÁI NIỆM MƯA ĐỊA HÌNH:</strong> Trực quan hóa vùng tạo mây và dải mưa rơi theo hướng gió đón ẩm và ngưỡng ngưng tụ; không đưa ra số liệu dự báo thời tiết mm thực tế.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-800">Độ ẩm tương đối (%):</span>
              <input
                type="range"
                min="50"
                max="98"
                value={airHumidity}
                onChange={(e) => setAirHumidity(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <span className="font-mono text-sm font-bold text-emerald-800">{airHumidity}%</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-800">Vận tốc gió thổi vào sườn núi (km/h):</span>
              <input
                type="range"
                min="5"
                max="40"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <span className="font-mono text-sm font-bold text-blue-800">{windSpeed} km/h</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-800">Ngưỡng bão hòa ngưng tụ (%):</span>
              <input
                type="range"
                min="60"
                max="90"
                value={condensationThreshold}
                onChange={(e) => setCondensationThreshold(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <span className="font-mono text-sm font-bold text-stone-800">{condensationThreshold}%</span>
            </div>
          </div>

          <div className="p-5 bg-stone-900 rounded-lg border border-stone-800 text-center text-xs text-stone-300">
            {airHumidity >= condensationThreshold ? (
              <div className="space-y-2">
                <CloudRain className="w-8 h-8 text-sky-400 mx-auto animate-bounce" />
                <div className="text-emerald-300 font-bold text-sm">
                  ĐIỀU KIỆN ĐẠT NGƯỠNG: MÂY ĐỊA HÌNH VÀ MƯA RÀO TẠI SƯỜN NÚI
                </div>
                <p className="max-w-md mx-auto text-stone-400">
                  Khối khí bão hòa độ ẩm ({airHumidity}% ≥ {condensationThreshold}%) khi bị sườn dốc Tam Đảo đẩy lên cao bị lạnh nhanh, giải phóng lượng mưa lớn tập trung ở sườn đón gió.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Sun className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-stone-300 font-bold text-sm">CHƯA ĐẠT NGƯỠNG TẠO MƯA ĐỊA HÌNH</div>
                <p className="max-w-md mx-auto text-stone-400">
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
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900">
            <strong>THỬ THÁCH THIẾT KẾ NHÀ THÍCH ỨNG:</strong> Kết hợp tri thức nhà sàn (Trạm 03), thoát nước mái cọ (Trạm 16) và chống lũ quét (Trạm 10) để giải bài toán xây dựng an toàn trước khí hậu dông bão vùng núi Tam Đảo.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Cấu hình kiến trúc đề xuất
              </h3>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Góc dốc mái θ (°):</span>
                  <span className="font-mono text-emerald-800 font-bold">{houseRoofSlope}°</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={houseRoofSlope}
                  onChange={(e) => setHouseRoofSlope(parseInt(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Chiều cao sàn vượt lũ h (m):</span>
                  <span className="font-mono text-emerald-800 font-bold">{houseFloorHeight} m</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={houseFloorHeight}
                  onChange={(e) => setHouseFloorHeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-700">Thể tích bể trữ nước mưa (m³):</span>
                  <span className="font-mono text-emerald-800 font-bold">{rainCisternSize} m³</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={rainCisternSize}
                  onChange={(e) => setRainCisternSize(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-3 text-xs">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Đánh giá chỉ số an toàn & thích ứng
              </h3>

              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <div className="font-semibold text-stone-800">Khả năng thoát nước mưa dông:</div>
                  <div className={houseRoofSlope >= 40 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {houseRoofSlope >= 40 ? '✓ Tối ưu (Dốc ≥ 40° nước tuôn nhanh, không dột lá cọ)' : '⚠ Nguy cơ dột cao khi mưa rào Tam Đảo (Nên tăng dốc ≥ 40°)'}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <div className="font-semibold text-stone-800">Khả năng tránh lũ quét & ẩm mốc sườn núi:</div>
                  <div className={houseFloorHeight >= 1.8 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {houseFloorHeight >= 1.8 ? '✓ An toàn (Gầm sàn ≥ 1.8m thông thoáng vượt lũ bùn)' : '⚠ Sàn quá thấp, dễ ngập bùn đá từ sườn đồi'}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <div className="font-semibold text-stone-800">Trữ lượng nước sinh hoạt tự chủ:</div>
                  <div className="text-emerald-800 font-bold">
                    {rainCisternSize >= 2.0 ? '✓ Đủ dùng cho gia đình 4 người trong 25 ngày khô hạn' : '⚠ Bể nhỏ, nên tăng dung tích'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveToJournal('Nha_thich_ung_khi_hau')}
                className="w-full py-2 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900"
              >
                Lưu phương án thiết kế vào Nhật ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
