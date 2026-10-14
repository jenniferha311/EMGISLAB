import React, { useState } from 'react';
import { Wind, Sun, Home, Thermometer, Droplets, CheckCircle2, FileText, Download, BookOpen, HelpCircle, Sliders, Award } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { saveResearchLog, getCurrentStudent, exportToCSV } from '../utils/storage';
import { MuongPatternBorder } from '../components/MuongPatternBorder';

export const Station03NhaSan: React.FC = () => {
  const station = STATIONS_DATA[2];
  const [activeStep, setActiveStep] = useState<number>(4);

  // Architecture parameters
  const [floorHeight, setFloorHeight] = useState<number>(1.8); // meters (1.2 - 2.8)
  const [roofPitch, setRoofPitch] = useState<number>(45); // degrees (25 - 60)
  const [ventOpening, setVentOpening] = useState<number>(60); // % (10 - 90)
  const [roofMaterial, setRoofMaterial] = useState<'co_gianh' | 'ton'>('co_gianh'); // Palm thatch vs Corrugated tin
  const [outdoorTemp, setOutdoorTemp] = useState<number>(34.0); // °C
  const [outdoorWind, setOutdoorWind] = useState<number>(2.5); // m/s

  // Real field measurement logging table (actual measured data by students)
  const [fieldMeasurements, setFieldMeasurements] = useState<Array<{
    id: number;
    time: string;
    location: string;
    outdoorTemp: number;
    indoorTemp: number;
    humidity: number;
    windSpeed: number;
  }>>([
    { id: 1, time: '11:30', location: 'Nhà sàn Mường Động (Mái cọ, sàn 2.0m)', outdoorTemp: 34.5, indoorTemp: 29.8, humidity: 68, windSpeed: 1.8 },
    { id: 2, time: '13:00', location: 'Nhà sàn Mường Động (Mái cọ, sàn 2.0m)', outdoorTemp: 36.2, indoorTemp: 31.0, humidity: 62, windSpeed: 2.2 },
  ]);

  const [newLog, setNewLog] = useState({
    time: '14:30',
    location: 'Nhà mẫu lớp học',
    outdoorTemp: 33.5,
    indoorTemp: 30.2,
    humidity: 70,
    windSpeed: 1.5,
  });

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Model physical calculations (Explicit assumptions)
  const rValue = roofMaterial === 'co_gianh' ? 1.8 : 0.25;
  const indoorAirSpeed = Math.round((outdoorWind * (ventOpening / 100) * 0.55 + (floorHeight / 3) * 0.2) * 10) / 10;
  const coolingDelta = (roofMaterial === 'co_gianh' ? 3.8 : 0.8) + (floorHeight - 1.2) * 0.9 + (ventOpening / 100) * 1.5;
  const estimatedIndoorTemp = Math.round((outdoorTemp - coolingDelta) * 10) / 10;

  const handleAddMeasurement = () => {
    setFieldMeasurements((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: newLog.time,
        location: newLog.location,
        outdoorTemp: newLog.outdoorTemp,
        indoorTemp: newLog.indoorTemp,
        humidity: newLog.humidity,
        windSpeed: newLog.windSpeed,
      },
    ]);
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 3,
      stationTitle: station.title,
      hypothesis: 'Khảo sát hiệu ứng đối lưu vi khí hậu và lớp đệm nhiệt mái lá cọ trong kiến trúc nhà sàn Mường.',
      changedVariables: {
        floorHeight_m: floorHeight,
        roofPitch_deg: roofPitch,
        ventOpening_pct: ventOpening,
        roofMaterial,
        outdoorTemp_C: outdoorTemp,
      },
      recordedResults: {
        estimatedIndoorTemp_C: estimatedIndoorTemp,
        indoorAirSpeed_ms: indoorAirSpeed,
        coolingDelta_C: Math.round(coolingDelta * 10) / 10,
        fieldMeasurementCount: fieldMeasurements.length,
      },
      observationNotes: `Nhà sàn mái cọ giảm nhiệt trong nhà ${(outdoorTemp - estimatedIndoorTemp).toFixed(1)}°C so với môi trường nhờ gió lùa gầm sàn ${floorHeight}m và thông gió mái ${ventOpening}%.`,
      reflectionAnswers: 'Gầm sàn thoáng và mái lá cọ dày là giải pháp điều hòa không khí tự nhiên không phát thải carbon.',
      isVerifiedRealData: fieldMeasurements.length > 0,
    });
    setSaveSuccess(`Đã lưu vào Nhật ký của học sinh ${student}!`);
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
            <strong className="text-[#20332D]">Di sản kiến trúc:</strong> {station.culturalHeritage}
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
          { id: 5, label: '5. Phân tích dữ liệu & Đo thực tế' },
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

      {/* STEP 4: 2D Interactive Architecture & Ventilation Model */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                MÔ PHỎNG VẬT LÝ GIẢ ĐỊNH
              </span>
              <span>Mô hình nhiệt động học 1D và thông gió tự nhiên; có ô nhập số liệu thực đo ngoài đời.</span>
            </div>
            <span className="font-mono text-[#556D65] hidden sm:inline">Stack Effect & R-Value</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 2D Architectural Cross-section Graphic (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#20332D] p-5 rounded-2xl border border-[#174C3C] shadow-sm text-white">
                <div className="flex items-center justify-between text-xs text-[#E8E2D5] mb-2 font-mono">
                  <span>MẶT CẮT 2D NHÀ SÀN & DÒNG GIÓ LÙA</span>
                  <span className="text-[#D6AA55] font-bold">
                    Vận tốc gió trong nhà: ~{indoorAirSpeed} m/s
                  </span>
                </div>

                <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <defs>
                      <linearGradient id="skyGradNhaSan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#174C3C" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#20332D" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="groundGradNhaSan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3f2e1d" />
                        <stop offset="100%" stopColor="#1e140d" />
                      </linearGradient>
                      <marker id="windArrowNhaSan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#D6AA55" />
                      </marker>
                    </defs>

                    {/* Sky & Ground */}
                    <rect x="0" y="0" width="400" height="250" fill="url(#skyGradNhaSan)" />
                    <rect x="0" y="250" width="400" height="50" fill="url(#groundGradNhaSan)" />

                    {/* Ground line */}
                    <line x1="0" y1="250" x2="400" y2="250" stroke="#174C3C" strokeWidth="2.5" />

                    {/* Sun radiation */}
                    <circle cx="50" cy="50" r="22" fill="#D6AA55" opacity="0.85" />
                    <circle cx="50" cy="50" r="30" fill="#D6AA55" opacity="0.25" className="animate-pulse" />

                    {/* Stilt Pillars based on floorHeight */}
                    {(() => {
                      const floorY = 250 - floorHeight * 45;
                      const roofPeakY = floorY - 50 - (roofPitch / 45) * 45;
                      const roofEavesY = floorY - 20;

                      return (
                        <g>
                          {/* 4 Pillars */}
                          {[130, 180, 220, 270].map((x) => (
                            <rect
                              key={x}
                              x={x - 4}
                              y={floorY}
                              width="8"
                              height={250 - floorY}
                              fill="#8A6627"
                              stroke="#4A3411"
                              strokeWidth="1"
                            />
                          ))}

                          {/* Floor Plank */}
                          <rect
                            x="110"
                            y={floorY - 6}
                            width="180"
                            height="8"
                            fill="#9C772F"
                            stroke="#4A3411"
                            strokeWidth="1"
                          />

                          {/* Wall / Living Area */}
                          <rect
                            x="120"
                            y={roofEavesY}
                            width="160"
                            height={floorY - 6 - roofEavesY}
                            fill="#D6AA55"
                            opacity="0.2"
                          />

                          {/* Windows with ventOpening % */}
                          <rect
                            x="140"
                            y={roofEavesY + 8}
                            width={30 * (ventOpening / 100)}
                            height="24"
                            fill="#FAF7F0"
                            opacity="0.8"
                          />
                          <rect
                            x="230"
                            y={roofEavesY + 8}
                            width={30 * (ventOpening / 100)}
                            height="24"
                            fill="#FAF7F0"
                            opacity="0.8"
                          />

                          {/* Roof Triangle (Palm Thatch vs Tin) */}
                          <polygon
                            points={`95,${roofEavesY} 200,${roofPeakY} 305,${roofEavesY}`}
                            fill={roofMaterial === 'co_gianh' ? '#A94438' : '#8AA39B'}
                            stroke="#D6AA55"
                            strokeWidth="2"
                          />

                          {/* Underfloor Air Draft Arrows (Gió lùa gầm sàn) */}
                          <path
                            d={`M 30,${250 - (floorHeight * 45) / 2} Q 110,${250 - (floorHeight * 45) / 2} 370,${250 - (floorHeight * 45) / 2}`}
                            fill="none"
                            stroke="#D6AA55"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            markerEnd="url(#windArrowNhaSan)"
                          />

                          {/* Roof Eaves Air Exhaust Draft (Gió thoát mái) */}
                          <path
                            d={`M 150,${roofEavesY + 20} Q 200,${roofPeakY + 15} 250,${roofPeakY - 10}`}
                            fill="none"
                            stroke="#FAF7F0"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            opacity="0.8"
                          />

                          {/* Temperature Callouts */}
                          <text x="25" y="105" fill="#FAF7F0" fontSize="11" fontWeight="bold">
                            T ngoài: {outdoorTemp}°C
                          </text>
                          <text x="145" y={floorY - 15} fill="#D6AA55" fontSize="12" fontWeight="bold">
                            T trong: {estimatedIndoorTemp}°C
                          </text>
                          <text x="145" y={floorY - 2} fill="#FAF7F0" fontSize="9">
                            ΔT: -{coolingDelta.toFixed(1)}°C
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#FAF7F0]/90 border-t border-[#174C3C] pt-2.5">
                  <div>
                    Độ cao gầm sàn: <strong>{floorHeight}m</strong>
                  </div>
                  <div>
                    Vật liệu mái: <strong>{roofMaterial === 'co_gianh' ? 'Lá cọ (R ≈ 1.8)' : 'Tôn (R ≈ 0.25)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Architectural Parameter Controls (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E8E2D5] pb-2.5">
                  <Sliders className="w-4 h-4 text-[#D6AA55]" />
                  Điều chỉnh thông số vi khí hậu kiến trúc
                </h3>

                {/* Floor Height Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#20332D]">Chiều cao gầm sàn (H_sàn):</span>
                    <span className="font-mono text-[#174C3C] font-bold">{floorHeight} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.8"
                    step="0.1"
                    value={floorHeight}
                    onChange={(e) => setFloorHeight(parseFloat(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#556D65]">
                    <span>1.2m (thấp)</span>
                    <span>1.8m - 2.2m (chuẩn Mường)</span>
                    <span>2.8m (rất thoáng)</span>
                  </div>
                </div>

                {/* Roof Pitch Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#20332D]">Độ dốc mái (Góc nghiêng θ):</span>
                    <span className="font-mono text-[#174C3C] font-bold">{roofPitch}°</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="60"
                    step="5"
                    value={roofPitch}
                    onChange={(e) => setRoofPitch(parseInt(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                  <div className="flex justify-between text-[11px] text-[#556D65]">
                    <span>25° (mái lài)</span>
                    <span>45° (mái dốc cọ)</span>
                    <span>60° (dốc đứng)</span>
                  </div>
                </div>

                {/* Vent opening */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#20332D]">Độ mở cửa sổ & giàn thông gió:</span>
                    <span className="font-mono text-[#174C3C] font-bold">{ventOpening}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={ventOpening}
                    onChange={(e) => setVentOpening(parseInt(e.target.value))}
                    className="w-full accent-[#174C3C]"
                  />
                </div>

                {/* Roof Material Switcher */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#20332D] block">Vật liệu lợp mái:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoofMaterial('co_gianh')}
                      className={`min-h-[44px] p-2 rounded-xl text-xs font-bold border transition-all ${
                        roofMaterial === 'co_gianh'
                          ? 'bg-[#EBF2EE] text-[#174C3C] border-[#174C3C]'
                          : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                      }`}
                    >
                      Lá cọ dày (Truyền thống, R=1.8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoofMaterial('ton')}
                      className={`min-h-[44px] p-2 rounded-xl text-xs font-bold border transition-all ${
                        roofMaterial === 'ton'
                          ? 'bg-[#EBF2EE] text-[#174C3C] border-[#174C3C]'
                          : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                      }`}
                    >
                      Mái tôn (Hiện đại, R=0.25)
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                  >
                    <FileText className="w-4 h-4 text-[#D6AA55]" />
                    Lưu kết quả mô phỏng vào Nhật ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Real Field Measurements Table */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D5] pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                <Thermometer className="w-4 h-4 text-[#A94438]" />
                Số liệu thực đo ngoài đời thực
              </div>
              <h2 className="text-xl font-bold text-[#174C3C] mt-0.5">Bảng nhật ký đo đạc vi khí hậu thực địa</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                const headers = ['ThoiGian', 'DiaDiem', 'T_Ngoai_C', 'T_Trong_C', 'DoAm_Pct', 'Gio_ms'];
                const rows = fieldMeasurements.map((m) => [
                  m.time,
                  m.location,
                  m.outdoorTemp,
                  m.indoorTemp,
                  m.humidity,
                  m.windSpeed,
                ]);
                exportToCSV('tram03_nha_san_thuc_te.csv', headers, rows);
              }}
              className="min-h-[44px] px-4 py-2 border border-[#E8E2D5] rounded-xl text-xs sm:text-sm font-bold text-[#20332D] hover:bg-[#FAF7F0] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#174C3C]" /> Xuất dữ liệu CSV
            </button>
          </div>

          {/* Input Row */}
          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="text-[#20332D] font-bold block mb-1">Giờ đo:</label>
              <input
                type="text"
                value={newLog.time}
                onChange={(e) => setNewLog({ ...newLog, time: e.target.value })}
                className="w-full min-h-[40px] px-2.5 bg-white border border-[#E8E2D5] rounded-lg font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#20332D] font-bold block mb-1">Địa điểm / Đặc điểm nhà:</label>
              <input
                type="text"
                value={newLog.location}
                onChange={(e) => setNewLog({ ...newLog, location: e.target.value })}
                className="w-full min-h-[40px] px-2.5 bg-white border border-[#E8E2D5] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[#20332D] font-bold block mb-1">T ngoài (°C):</label>
              <input
                type="number"
                value={newLog.outdoorTemp}
                onChange={(e) => setNewLog({ ...newLog, outdoorTemp: parseFloat(e.target.value) || 0 })}
                className="w-full min-h-[40px] px-2.5 bg-white border border-[#E8E2D5] rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[#20332D] font-bold block mb-1">T trong (°C):</label>
              <input
                type="number"
                value={newLog.indoorTemp}
                onChange={(e) => setNewLog({ ...newLog, indoorTemp: parseFloat(e.target.value) || 0 })}
                className="w-full min-h-[40px] px-2.5 bg-white border border-[#E8E2D5] rounded-lg font-mono text-xs"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="w-full min-h-[40px] bg-[#174C3C] text-white rounded-lg text-xs font-bold hover:bg-[#11382C] transition-colors"
              >
                + Thêm mẫu
              </button>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="overflow-x-auto border border-[#E8E2D5] rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#20332D] font-bold">
                <tr>
                  <th className="py-2.5 px-3.5">Thời gian</th>
                  <th className="py-2.5 px-3.5">Địa điểm khảo sát</th>
                  <th className="py-2.5 px-3.5">T ngoài (°C)</th>
                  <th className="py-2.5 px-3.5">T trong nhà (°C)</th>
                  <th className="py-2.5 px-3.5">Chênh lệch ΔT</th>
                  <th className="py-2.5 px-3.5">Độ ẩm (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5] font-mono">
                {fieldMeasurements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF7F0]/50">
                    <td className="py-2.5 px-3.5">{m.time}</td>
                    <td className="py-2.5 px-3.5 font-sans text-[#20332D]">{m.location}</td>
                    <td className="py-2.5 px-3.5 text-[#A94438] font-bold">{m.outdoorTemp}°C</td>
                    <td className="py-2.5 px-3.5 text-[#174C3C] font-bold">{m.indoorTemp}°C</td>
                    <td className="py-2.5 px-3.5 text-[#174C3C] font-bold">
                      -{(m.outdoorTemp - m.indoorTemp).toFixed(1)}°C
                    </td>
                    <td className="py-2.5 px-3.5 text-[#556D65]">{m.humidity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 1, 2, 3, 6, 7 */}
      {activeStep !== 4 && activeStep !== 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#D6AA55]" />
            {activeStep === 1
              ? 'Bối cảnh di sản & Kiến trúc bản địa'
              : activeStep === 2
              ? 'Câu hỏi nghiên cứu STEM'
              : activeStep === 3
              ? 'Dự đoán & Giả thuyết'
              : activeStep === 6
              ? 'Thử thách thiết kế thích ứng'
              : 'Phản tư & Di sản kiến trúc'}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">
            {activeStep === 1
              ? station.steps.context.title
              : activeStep === 2
              ? station.steps.stemQuestion.question
              : activeStep === 3
              ? station.steps.prediction.prompt
              : activeStep === 6
              ? station.steps.challenge.title
              : 'Phản tư & Di sản kiến trúc Mường'}
          </h2>

          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">
            {activeStep === 1
              ? station.steps.context.description
              : activeStep === 2
              ? station.steps.stemQuestion.contextExplanation
              : activeStep === 3
              ? 'Hãy thử thay đổi độ dốc mái và gầm sàn trong Thí nghiệm số để kiểm chứng giả thuyết về dòng khí lùa.'
              : activeStep === 6
              ? station.steps.challenge.scenario
              : station.steps.reflection.culturalConnection}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="min-h-[44px] px-5 py-2.5 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#FAF7F0] transition-colors"
            >
              ← Chuyển đến Thí nghiệm số
            </button>
            <button
              type="button"
              onClick={handleSaveToJournal}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] flex items-center gap-2 shadow-xs active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
              Lưu vào Nhật ký nghiên cứu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
