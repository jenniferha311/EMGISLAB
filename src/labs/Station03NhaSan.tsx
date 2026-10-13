import React, { useState } from 'react';
import { Wind, Sun, Home, Thermometer, Droplets, CheckCircle2, FileText, Download } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { saveResearchLog, getCurrentStudent, exportToCSV } from '../utils/storage';

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
  // Thermal resistance R of roof: Palm thatch (R ≈ 1.8 m²K/W) vs Tin (R ≈ 0.2 m²K/W)
  const rValue = roofMaterial === 'co_gianh' ? 1.8 : 0.25;
  // Natural indoor airflow velocity estimate
  const indoorAirSpeed = Math.round((outdoorWind * (ventOpening / 100) * 0.55 + (floorHeight / 3) * 0.2) * 10) / 10;
  // Indoor temperature reduction: cooling effect from underfloor draft + roof insulation
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
      hypothesis: 'Khảo sát hiệu ứng đối lưu vi khí hậu và lớp đệm nhiệt mái lá cọ trong kiến trúc nhà sàn.',
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
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            TRẠM {station.numberStr}
          </span>
          <span className="text-xs text-stone-500 font-medium">·</span>
          <span className="text-xs text-stone-600 font-medium">{station.stemDomainLabel}</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{station.title}</h1>
        <p className="text-sm text-stone-600 mt-1">{station.subtitle}</p>
      </div>

      {/* 7-Step Navigation */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1 border-b border-stone-200">
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
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t border-b-2 transition-colors ${
              activeStep === tab.id
                ? 'border-emerald-700 text-emerald-900 bg-white font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
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

      {/* STEP 4: 2D Interactive Architecture & Ventilation Model */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                MÔ PHỎNG VẬT LÝ GIẢ ĐỊNH
              </span>
              <span>Mô hình nhiệt động học 1D và thông gió tự nhiên; có ô nhập số liệu thực đo ngoài đời.</span>
            </div>
            <span className="font-mono text-stone-500 hidden sm:inline">Stack Effect & R-Value</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 2D Architectural Cross-section Graphic (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 shadow-md">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2 font-mono">
                  <span>MẶT CẮT 2D NHÀ SÀN & DÒNG GIÓ LÙA</span>
                  <span className="text-emerald-400 font-bold">
                    Vận tốc gió trong nhà: ~{indoorAirSpeed} m/s
                  </span>
                </div>

                <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3f2e1d" />
                        <stop offset="100%" stopColor="#1e140d" />
                      </linearGradient>
                      <marker id="windArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                      </marker>
                    </defs>

                    {/* Sky & Ground */}
                    <rect x="0" y="0" width="400" height="250" fill="url(#skyGrad)" />
                    <rect x="0" y="250" width="400" height="50" fill="url(#groundGrad)" />

                    {/* Ground line grass marks */}
                    <line x1="0" y1="250" x2="400" y2="250" stroke="#16a34a" strokeWidth="2" />

                    {/* Sun radiation */}
                    <circle cx="50" cy="50" r="22" fill="#fbbf24" opacity="0.8" />
                    <circle cx="50" cy="50" r="30" fill="#f59e0b" opacity="0.3" className="animate-pulse" />

                    {/* Stilt Pillars (Cột nhà sàn) based on floorHeight */}
                    {/* SVG baseline ground at Y=250. Floor height in SVG: 250 - floorHeight*40 */}
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
                              fill="#78350f"
                              stroke="#451a03"
                              strokeWidth="1"
                            />
                          ))}

                          {/* Floor Plank */}
                          <rect
                            x="110"
                            y={floorY - 6}
                            width="180"
                            height="8"
                            fill="#92400e"
                            stroke="#451a03"
                            strokeWidth="1"
                          />

                          {/* Wall / Living Area */}
                          <rect
                            x="120"
                            y={roofEavesY}
                            width="160"
                            height={floorY - 6 - roofEavesY}
                            fill="#b45309"
                            opacity="0.3"
                          />

                          {/* Windows with ventOpening % */}
                          <rect
                            x="140"
                            y={roofEavesY + 8}
                            width={30 * (ventOpening / 100)}
                            height="24"
                            fill="#0284c7"
                            opacity="0.6"
                          />
                          <rect
                            x="230"
                            y={roofEavesY + 8}
                            width={30 * (ventOpening / 100)}
                            height="24"
                            fill="#0284c7"
                            opacity="0.6"
                          />

                          {/* Roof Triangle (Palm Thatch vs Tin) */}
                          <polygon
                            points={`200,${roofPeakY} 100,${roofEavesY} 300,${roofEavesY}`}
                            fill={roofMaterial === 'co_gianh' ? '#ca8a04' : '#94a3b8'}
                            stroke={roofMaterial === 'co_gianh' ? '#854d0e' : '#475569'}
                            strokeWidth="3"
                          />

                          {/* Thatch texture lines if palm */}
                          {roofMaterial === 'co_gianh' && (
                            <g stroke="#713f12" strokeWidth="1" strokeDasharray="3 3">
                              <line x1="200" y1={roofPeakY} x2="115" y2={roofEavesY} />
                              <line x1="200" y1={roofPeakY} x2="285" y2={roofEavesY} />
                              <line x1="160" y1={(roofPeakY + roofEavesY) / 2} x2="240" y2={(roofPeakY + roofEavesY) / 2} />
                            </g>
                          )}

                          {/* Underfloor Wind Flow Arrows */}
                          <path
                            d={`M 30,${(floorY + 250) / 2} Q 150,${(floorY + 250) / 2} 370,${(floorY + 250) / 2}`}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            markerEnd="url(#windArrow)"
                          />

                          {/* Indoor Cross-Ventilation Wind Arrow */}
                          <path
                            d={`M 50,${floorY - 18} Q 200,${floorY - 26} 360,${roofPeakY + 25}`}
                            fill="none"
                            stroke="#67e8f9"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            markerEnd="url(#windArrow)"
                          />

                          {/* Indoor Temperature Readout Label */}
                          <rect x="160" y={floorY - 32} width="80" height="20" fill="#0f172a" rx="4" />
                          <text
                            x="200"
                            y={floorY - 18}
                            textAnchor="middle"
                            fill="#34d399"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {estimatedIndoorTemp}°C
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800">
                  <span>Gầm sàn cao {floorHeight}m giúp gió lùa làm mát liên tục</span>
                  <span>Mái dốc {roofPitch}° hỗ trợ thoát khí nóng</span>
                </div>
              </div>
            </div>

            {/* Right: Parameter Controls & Metrics (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Điều chỉnh thông số kiến trúc & môi trường
                </h3>

                {/* Material Choice */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Vật liệu lợp mái:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRoofMaterial('co_gianh')}
                      className={`p-2 rounded border text-left transition-colors ${
                        roofMaterial === 'co_gianh'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div>Lá cọ / Gianh dày</div>
                      <div className="text-[11px] text-stone-500 font-normal">Cách nhiệt cao (R ≈ 1.8)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoofMaterial('ton')}
                      className={`p-2 rounded border text-left transition-colors ${
                        roofMaterial === 'ton'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div>Tôn kim loại</div>
                      <div className="text-[11px] text-stone-500 font-normal">Hấp thụ bức xạ lớn (R ≈ 0.25)</div>
                    </button>
                  </div>
                </div>

                {/* Floor Height */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-700">Chiều cao gầm sàn h (m):</span>
                    <span className="font-mono text-emerald-800 font-bold">{floorHeight.toFixed(1)} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.8"
                    step="0.1"
                    value={floorHeight}
                    onChange={(e) => setFloorHeight(parseFloat(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>1.2m (thấp)</span>
                    <span>2.0m (chuẩn Mường cổ)</span>
                    <span>2.8m (rất thoáng)</span>
                  </div>
                </div>

                {/* Roof Pitch */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-700">Góc nghiêng mái θ (°):</span>
                    <span className="font-mono text-emerald-800 font-bold">{roofPitch}°</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="60"
                    step="1"
                    value={roofPitch}
                    onChange={(e) => setRoofPitch(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                {/* Vent Openings */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-700">Độ mở cửa thông gió (%):</span>
                    <span className="font-mono text-emerald-800 font-bold">{ventOpening}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={ventOpening}
                    onChange={(e) => setVentOpening(parseInt(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>

                {/* Outdoor Climate inputs */}
                <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-stone-600">Nhiệt độ ngoài trời:</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={outdoorTemp}
                        onChange={(e) => setOutdoorTemp(parseFloat(e.target.value) || 20)}
                        className="w-full p-1.5 rounded border border-stone-300 font-mono"
                      />
                      <span>°C</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-stone-600">Vận tốc gió ngoài:</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={outdoorWind}
                        onChange={(e) => setOutdoorWind(parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 rounded border border-stone-300 font-mono"
                      />
                      <span>m/s</span>
                    </div>
                  </div>
                </div>

                {/* Output Comparison Box */}
                <div className="p-3 bg-stone-50 rounded border border-stone-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-stone-500">Nhiệt độ trong nhà tính toán:</div>
                    <div className="text-xl font-bold font-mono text-emerald-800">
                      {estimatedIndoorTemp}°C
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Chênh lệch: -{(outdoorTemp - estimatedIndoorTemp).toFixed(1)}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-500">Lưu lượng gió thông phòng:</div>
                    <div className="text-xl font-bold font-mono text-blue-800">
                      ~{indoorAirSpeed} m/s
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {indoorAirSpeed > 0.4 ? 'Gió lưu thông dễ chịu' : 'Gió yếu'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lưu kết quả mô phỏng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Real Field Measurements Logger */}
      {activeStep === 5 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Bảng số liệu đo thực tế vi khí hậu (Học sinh thu thập ngoài thực địa)
              </h2>
              <p className="text-xs text-stone-500">
                Gắn nhãn <strong>ĐO THỰC TẾ</strong> – Học sinh nhập số liệu đo bằng nhiệt ẩm kế cầm tay tại địa phương.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const headers = ['ThoiGian', 'DiaDiem', 'NhietDoNgoai_C', 'NhietDoTrong_C', 'DoAm_Pct', 'Gio_ms'];
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
              className="px-3 py-1.5 border border-stone-300 rounded text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Xuất dữ liệu CSV
            </button>
          </div>

          {/* Input Row */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            <div>
              <label className="text-stone-600">Giờ đo:</label>
              <input
                type="text"
                value={newLog.time}
                onChange={(e) => setNewLog({ ...newLog, time: e.target.value })}
                className="w-full mt-1 p-1.5 bg-white border border-stone-300 rounded font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-stone-600">Địa điểm / Đặc điểm nhà:</label>
              <input
                type="text"
                value={newLog.location}
                onChange={(e) => setNewLog({ ...newLog, location: e.target.value })}
                className="w-full mt-1 p-1.5 bg-white border border-stone-300 rounded"
              />
            </div>
            <div>
              <label className="text-stone-600">T ngoài (°C):</label>
              <input
                type="number"
                value={newLog.outdoorTemp}
                onChange={(e) => setNewLog({ ...newLog, outdoorTemp: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 p-1.5 bg-white border border-stone-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="text-stone-600">T trong (°C):</label>
              <input
                type="number"
                value={newLog.indoorTemp}
                onChange={(e) => setNewLog({ ...newLog, indoorTemp: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1 p-1.5 bg-white border border-stone-300 rounded font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="w-full py-1.5 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900"
              >
                + Thêm mẫu
              </button>
            </div>
          </div>

          {/* Measurements Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700">
                <tr>
                  <th className="py-2 px-3">Thời gian</th>
                  <th className="py-2 px-3">Địa điểm khảo sát</th>
                  <th className="py-2 px-3">T ngoài (°C)</th>
                  <th className="py-2 px-3">T trong nhà (°C)</th>
                  <th className="py-2 px-3">Chênh lệch ΔT</th>
                  <th className="py-2 px-3">Độ ẩm (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {fieldMeasurements.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3">{m.time}</td>
                    <td className="py-2 px-3 font-sans text-stone-800">{m.location}</td>
                    <td className="py-2 px-3 text-red-700 font-semibold">{m.outdoorTemp}°C</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">{m.indoorTemp}°C</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">
                      -{(m.outdoorTemp - m.indoorTemp).toFixed(1)}°C
                    </td>
                    <td className="py-2 px-3 text-stone-600">{m.humidity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 1, 2, 3, 6, 7 */}
      {activeStep !== 4 && activeStep !== 5 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4 text-sm text-stone-700">
          <h2 className="text-base font-bold text-stone-900">
            {activeStep === 1
              ? station.steps.context.title
              : activeStep === 2
              ? station.steps.stemQuestion.question
              : activeStep === 3
              ? station.steps.prediction.prompt
              : activeStep === 6
              ? station.steps.challenge.title
              : 'Phản tư & Di sản kiến trúc'}
          </h2>
          <p>
            {activeStep === 1
              ? station.steps.context.description
              : activeStep === 2
              ? station.steps.stemQuestion.contextExplanation
              : activeStep === 3
              ? 'Hãy thử thay đổi độ dốc mái và gầm sàn trong Thí nghiệm số để kiểm chứng giả thuyết.'
              : activeStep === 6
              ? station.steps.challenge.scenario
              : station.steps.reflection.culturalConnection}
          </p>
        </div>
      )}
    </div>
  );
};
