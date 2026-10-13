import React, { useState } from 'react';
import { Download, RotateCcw, CheckCircle2, Grid, Sparkles, Copy, FileText } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { saveResearchLog, getCurrentStudent } from '../utils/storage';

const MOTIF_TEMPLATES: Record<string, { name: string; grid: number[][] }> = {
  qua_tram: {
    name: 'Quả trám lồng nhau (Hình thoi truyền thống)',
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  rang_cua: {
    name: 'Răng cưa dãy núi (Tam giác tuần hoàn)',
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  hoa_hoi: {
    name: 'Hoa hồi 8 cánh cách điệu',
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
};

const COLOR_PALETTES = [
  { id: 'cham', name: 'Xanh chàm & Trắng mộc', fg: '#1e3a8a', bg: '#fef3c7', accent: '#3b82f6' },
  { id: 'vang_do', name: 'Đỏ vang & Vàng nghệ', fg: '#b91c1c', bg: '#fef9c3', accent: '#d97706' },
  { id: 'rung_nui', name: 'Xanh rừng & Đất nung', fg: '#1b4332', bg: '#ffedd5', accent: '#bc4749' },
  { id: 'huyen_bi', name: 'Đen vỏ cây & Trắng', fg: '#18181b', bg: '#f4f4f5', accent: '#71717a' },
];

export const Station02ThoCam: React.FC = () => {
  const station = STATIONS_DATA[1];
  const [activeStep, setActiveStep] = useState<number>(4);

  // Simulation controls
  const [currentMotifKey, setCurrentMotifKey] = useState<string>('qua_tram');
  const [activePaletteIndex, setActivePaletteIndex] = useState<number>(0);
  const [repeatCount, setRepeatCount] = useState<number>(5);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [mirrorX, setMirrorX] = useState<boolean>(false);
  const [mirrorY, setMirrorY] = useState<boolean>(false);
  const [customGrid, setCustomGrid] = useState<number[][]>(MOTIF_TEMPLATES.qua_tram.grid);

  // Prediction and Notes
  const [selectedPrediction, setSelectedPrediction] = useState<string>('p1');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const palette = COLOR_PALETTES[activePaletteIndex];

  // Toggle single cell in 8x8 motif
  const handleToggleCell = (r: number, c: number) => {
    setCustomGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  const handleSelectTemplate = (key: string) => {
    setCurrentMotifKey(key);
    setCustomGrid(MOTIF_TEMPLATES[key].grid);
  };

  // Transform 8x8 motif by rotation and mirror
  const getTransformedMotif = () => {
    let grid = customGrid.map((row) => [...row]);

    // Mirror X (horizontal flip)
    if (mirrorX) {
      grid = grid.map((row) => [...row].reverse());
    }

    // Mirror Y (vertical flip)
    if (mirrorY) {
      grid = [...grid].reverse();
    }

    // Rotate (0, 90, 180, 270)
    const turns = Math.floor((rotation % 360) / 90);
    for (let t = 0; t < turns; t++) {
      const rotated: number[][] = Array(8)
        .fill(0)
        .map(() => Array(8).fill(0));
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          rotated[c][7 - r] = grid[r][c];
        }
      }
      grid = rotated;
    }

    return grid;
  };

  const transformedMotif = getTransformedMotif();

  // Export generated Frieze pattern as SVG
  const handleExportSVG = () => {
    const cellSize = 12;
    const motifWidth = 8 * cellSize;
    const totalWidth = repeatCount * motifWidth;
    const totalHeight = 8 * cellSize;

    let rects = '';
    for (let rep = 0; rep < repeatCount; rep++) {
      const offsetX = rep * motifWidth;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (transformedMotif[r][c] === 1) {
            const x = offsetX + c * cellSize;
            const y = r * cellSize;
            rects += `<rect x="${x}" y="${y}" width="${cellSize - 1}" height="${cellSize - 1}" fill="${palette.fg}" rx="1"/>\n`;
          }
        }
      }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <rect width="100%" height="100%" fill="${palette.bg}"/>
  ${rects}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tho_cam_frieze_pattern_${currentMotifKey}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 2,
      stationTitle: station.title,
      hypothesis: 'Khảo sát nhóm đối xứng Frieze và các phép biến hình affine trên dải hoa văn thổ cẩm.',
      selectedPrediction,
      changedVariables: {
        motif: currentMotifKey,
        repeatCount,
        rotation_deg: rotation,
        mirrorX: mirrorX ? 'Có' : 'Không',
        mirrorY: mirrorY ? 'Có' : 'Không',
        palette: palette.name,
      },
      recordedResults: {
        friezeSymmetryType: mirrorX && mirrorY ? 'p2mm (Đối xứng 2 trục & tâm)' : mirrorX ? 'p1m1 (Đối xứng trục dọc)' : 'p1 (Chỉ tịnh tiến)',
        activeCells: transformedMotif.flat().filter((v) => v === 1).length,
      },
      observationNotes: `Tạo dải viền thổ cẩm chu kỳ ${repeatCount} với góc quay ${rotation}° và đối xứng [X:${mirrorX}, Y:${mirrorY}].`,
      reflectionAnswers: 'Khung dệt của người phụ nữ miền núi là một cấu trúc tính toán số nguyên chính xác.',
      isVerifiedRealData: false,
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
          { id: 5, label: '5. Phân tích dữ liệu' },
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

      {/* STEP 4: Interactive Weaving Matrix & Transformations */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                MÔ PHỎNG HÌNH HỌC TOÁN HỌC
              </span>
              <span>Lưới điểm dệt 8×8 tương tác và các phép biến hình affine tạo dải hoa văn Frieze.</span>
            </div>
            <span className="font-mono text-stone-500 hidden sm:inline">Affine Transformations</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Motif Editor & Templates (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-emerald-700" />
                    Đơn vị Motif gốc (8 × 8 ô dệt)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomGrid(
                        Array(8)
                          .fill(0)
                          .map(() => Array(8).fill(0))
                      )
                    }
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Xóa trắng
                  </button>
                </div>
                <p className="text-xs text-stone-500">
                  Bấm vào từng ô để dệt sợi màu (1) hoặc để trống sợi mộc (0):
                </p>

                {/* 8x8 Interactive Grid */}
                <div
                  className="grid grid-cols-8 gap-1 p-2 rounded border border-stone-300 max-w-[280px] mx-auto shadow-inner"
                  style={{ backgroundColor: palette.bg }}
                >
                  {customGrid.map((row, r) =>
                    row.map((cell, c) => (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleToggleCell(r, c)}
                        className={`w-7 h-7 rounded-xs border transition-colors ${
                          cell === 1
                            ? 'border-transparent shadow-xs'
                            : 'border-stone-300/40 hover:bg-stone-300/20'
                        }`}
                        style={{
                          backgroundColor: cell === 1 ? palette.fg : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>

                {/* Template Motif Selectors */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-700">Mẫu hoa văn cổ truyền:</span>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(MOTIF_TEMPLATES).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectTemplate(key)}
                        className={`p-2 text-left rounded text-xs border transition-colors ${
                          currentMotifKey === key
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-medium'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palettes */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-700">Bảng màu tự nhiên:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_PALETTES.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePaletteIndex(idx)}
                        className={`p-1.5 rounded text-xs border flex items-center gap-2 ${
                          activePaletteIndex === idx
                            ? 'border-emerald-600 bg-emerald-50 font-medium'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-stone-400"
                          style={{ backgroundColor: p.fg }}
                        />
                        <span className="truncate text-[11px]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Transformation Sliders & Frieze Strip Display (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    Các phép biến hình toán học
                  </h3>
                  <span className="font-mono text-xs text-stone-600">
                    Nhóm đối xứng: {mirrorX && mirrorY ? 'p2mm (Diedral)' : mirrorX ? 'p1m1' : 'p1 (Cyclic)'}
                  </span>
                </div>

                {/* Transform controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded border border-stone-200">
                  {/* Rotation */}
                  <div>
                    <label className="text-stone-600 font-medium">Phép quay R_θ:</label>
                    <div className="flex items-center gap-1 mt-1">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotation(deg)}
                          className={`flex-1 py-1 rounded text-xs font-mono border ${
                            rotation === deg
                              ? 'bg-emerald-800 text-white font-bold border-emerald-800'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mirror Reflections */}
                  <div>
                    <label className="text-stone-600 font-medium">Đối xứng trục (Reflection):</label>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setMirrorX(!mirrorX)}
                        className={`flex-1 py-1 rounded text-xs border ${
                          mirrorX
                            ? 'bg-emerald-800 text-white font-medium border-emerald-800'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        Trục dọc S_y
                      </button>
                      <button
                        type="button"
                        onClick={() => setMirrorY(!mirrorY)}
                        className={`flex-1 py-1 rounded text-xs border ${
                          mirrorY
                            ? 'bg-emerald-800 text-white font-medium border-emerald-800'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        Trục ngang S_x
                      </button>
                    </div>
                  </div>

                  {/* Repetition */}
                  <div>
                    <label className="text-stone-600 font-medium">Số chu kỳ lặp T(dx):</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                        className="w-full accent-emerald-700"
                      />
                      <span className="font-mono text-stone-700 font-bold">{repeatCount}</span>
                    </div>
                  </div>
                </div>

                {/* Live Frieze Band Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Dải viền Frieze thổ cẩm hoàn chỉnh:</span>
                    <span className="font-mono text-emerald-800">
                      Độ dài dải: {repeatCount * 8} sợi dọc × 8 sợi ngang
                    </span>
                  </div>

                  <div
                    className="p-3 rounded border border-stone-300 overflow-x-auto shadow-inner"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <div className="flex gap-0.5 min-w-max">
                      {Array.from({ length: repeatCount }).map((_, rep) => (
                        <div key={rep} className="grid grid-cols-8 gap-0.5 border-r border-stone-300/60 pr-0.5">
                          {transformedMotif.map((row, r) =>
                            row.map((val, c) => (
                              <div
                                key={`${rep}-${r}-${c}`}
                                className="w-3.5 h-3.5 rounded-xs"
                                style={{
                                  backgroundColor: val === 1 ? palette.fg : 'transparent',
                                }}
                              />
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mathematical Formulation Display */}
                <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs font-mono text-stone-700 space-y-1">
                  <div className="text-stone-500 font-sans font-semibold">Công thức ánh xạ hình học:</div>
                  <div>
                    Vector tịnh tiến: T = (k · 8 · Δx, 0) với k ∈ [0, {repeatCount - 1}]
                  </div>
                  <div>
                    Ma trận biến đổi: M = R({rotation}°) · [ {mirrorX ? '-1' : '1'} 0 ; 0 {mirrorY ? '-1' : '1'} ]
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleExportSVG}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    Xuất file vector SVG
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lưu hoa văn vào Nhật ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Context */}
      {activeStep === 1 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4 text-sm text-stone-700">
          <h2 className="text-lg font-bold text-stone-900">{station.steps.context.title}</h2>
          <p>{station.steps.context.description}</p>
          <ul className="space-y-1.5 list-disc pl-5">
            {station.steps.context.culturalDetails.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STEP 2: STEM Question */}
      {activeStep === 2 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4 text-sm text-stone-700">
          <h2 className="text-lg font-bold text-stone-900">{station.steps.stemQuestion.question}</h2>
          <p>{station.steps.stemQuestion.contextExplanation}</p>
        </div>
      )}

      {/* STEP 3: Prediction */}
      {activeStep === 3 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
          <h2 className="text-base font-bold text-stone-900">{station.steps.prediction.prompt}</h2>
          <div className="space-y-3">
            {station.steps.prediction.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer ${
                  selectedPrediction === opt.id ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200'
                }`}
              >
                <input
                  type="radio"
                  name="p2_pred"
                  checked={selectedPrediction === opt.id}
                  onChange={() => setSelectedPrediction(opt.id)}
                  className="mt-1 text-emerald-700"
                />
                <div>
                  <div className="text-sm font-semibold text-stone-900">{opt.label}</div>
                  <div className="text-xs text-stone-600">{opt.explanation}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5, 6, 7 */}
      {activeStep >= 5 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4 text-sm text-stone-700">
          <h2 className="text-base font-bold text-stone-900">
            {activeStep === 5
              ? 'Phân tích cấu trúc nhóm đối xứng Frieze'
              : activeStep === 6
              ? station.steps.challenge.title
              : 'Phản tư & Di sản'}
          </h2>
          <p>
            {activeStep === 5
              ? 'Dải hoa văn Frieze chỉ có đúng 7 nhóm đối xứng hình học trên mặt phẳng. Khung dệt truyền thống thường kết hợp nhóm p2mm (có cả trục đối xứng ngang và dọc).'
              : activeStep === 6
              ? station.steps.challenge.scenario
              : station.steps.reflection.culturalConnection}
          </p>
        </div>
      )}
    </div>
  );
};
