import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, CheckCircle2, Grid, Sparkles, FileText, ArrowRight, BookOpen, HelpCircle, Sliders, Award } from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { 
  saveResearchLog, 
  getCurrentStudent, 
  markStationVisited, 
  getCompletedStations, 
  toggleStationCompleted 
} from '../utils/storage';
import { MuongPatternBorder } from '../components/MuongPatternBorder';

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
  { id: 'cham', name: 'Xanh chàm & Trắng ngà', fg: '#174C3C', bg: '#FAF7F0', accent: '#D6AA55' },
  { id: 'vang_do', name: 'Đỏ đất & Vàng nghệ', fg: '#A94438', bg: '#FAF7F0', accent: '#D6AA55' },
  { id: 'rung_nui', name: 'Vàng ấm & Xanh đen', fg: '#D6AA55', bg: '#20332D', accent: '#A94438' },
  { id: 'huyen_bi', name: 'Đen vỏ cây & Trắng', fg: '#20332D', bg: '#FFFFFF', accent: '#174C3C' },
];

export const Station02ThoCam: React.FC = () => {
  const station = STATIONS_DATA[1];
  const [activeStep, setActiveStep] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(2));

  useEffect(() => {
    markStationVisited(2);
    setIsCompleted(getCompletedStations().includes(2));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(2));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

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
    link.download = `tho_cam_muong_${currentMotifKey}_frieze.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    saveResearchLog({
      studentCode: student,
      stationId: 2,
      stationTitle: station.title,
      hypothesis: 'Khảo sát nhóm đối xứng phẳng Frieze và các phép biến hình trong hoa văn dệt cạp váy Mường.',
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
        symmetryGroup: mirrorX && mirrorY ? 'p2mm (Diedral)' : mirrorX ? 'p1m1' : 'p1',
        totalPoints: customGrid.flat().filter((x) => x === 1).length,
        friezeLength: repeatCount * 8,
      },
      observationNotes: `Tạo thành công dải hoa văn ${currentMotifKey} gồm ${repeatCount} chu kỳ với phép quay ${rotation}° và đối xứng trục [X:${mirrorX}, Y:${mirrorY}].`,
      reflectionAnswers: 'Tư duy hình học không gian và tính chu kỳ đã được các bà, các mẹ người Mường đúc kết qua từng đường thoi dệt cạp váy.',
      isVerifiedRealData: false,
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

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#556D65] font-medium hidden sm:inline">{station.locationContext}</span>
            <button
              type="button"
              onClick={() => toggleStationCompleted(2)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isCompleted
                  ? 'bg-[#174C3C] text-white border-[#174C3C] shadow-2xs hover:bg-[#11382C]'
                  : 'bg-white hover:bg-[#FAF7F0] border-[#E8E2D5] text-[#556D65] hover:text-[#174C3C]'
              }`}
              title="Đánh dấu hoàn thành trạm để cập nhật tiến độ trên thanh tiêu đề"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#D6AA55]' : 'text-[#8A9E96]'}`} />
              {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </button>
          </div>
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
          { id: 4, label: '4. Thí nghiệm số (Dệt ma trận)' },
          { id: 5, label: '5. Phân tích đối xứng' },
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

      {/* STEP 4: Interactive Weaving Matrix & Transformations */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                MÔ PHỎNG HÌNH HỌC TOÁN HỌC
              </span>
              <span>Lưới điểm dệt 8×8 tương tác và các phép biến hình affine tạo dải hoa văn Frieze.</span>
            </div>
            <span className="font-mono text-[#556D65] hidden sm:inline">Affine Transformations</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Motif Editor & Templates (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-[#D6AA55]" />
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
                    className="min-h-[36px] px-2.5 py-1 text-xs text-[#556D65] hover:text-[#A94438] hover:bg-[#FBF0EE] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Xóa trắng
                  </button>
                </div>
                <p className="text-xs text-[#556D65]">
                  Chạm vào từng ô vuông để dệt sợi màu (1) hoặc sợi nền (0):
                </p>

                {/* 8x8 Interactive Grid */}
                <div
                  className="grid grid-cols-8 gap-1.5 p-3 rounded-xl border border-[#E8E2D5] max-w-[290px] mx-auto shadow-inner"
                  style={{ backgroundColor: palette.bg }}
                >
                  {customGrid.map((row, r) =>
                    row.map((cell, c) => (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleToggleCell(r, c)}
                        className={`w-7 h-7 rounded-sm border transition-all ${
                          cell === 1
                            ? 'border-transparent shadow-xs scale-95'
                            : 'border-[#20332D]/15 hover:bg-[#20332D]/10'
                        }`}
                        style={{
                          backgroundColor: cell === 1 ? palette.fg : 'transparent',
                        }}
                        aria-label={`Ô dệt hàng ${r + 1} cột ${c + 1}`}
                      />
                    ))
                  )}
                </div>

                {/* Template Motif Selectors */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D5]">
                  <span className="text-xs font-bold text-[#20332D]">Mẫu hoa văn cổ truyền Mường:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(MOTIF_TEMPLATES).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectTemplate(key)}
                        className={`min-h-[44px] p-2.5 text-left rounded-xl text-xs border transition-all flex items-center justify-between ${
                          currentMotifKey === key
                            ? 'bg-[#EBF2EE] text-[#174C3C] border-[#174C3C] font-bold shadow-2xs'
                            : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <span>{item.name}</span>
                        {currentMotifKey === key && <CheckCircle2 className="w-4 h-4 text-[#174C3C]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palettes */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D5]">
                  <span className="text-xs font-bold text-[#20332D]">Bảng màu dệt thổ cẩm tự nhiên:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActivePaletteIndex(idx)}
                        className={`min-h-[44px] p-2 rounded-xl text-xs border flex items-center gap-2.5 transition-all ${
                          activePaletteIndex === idx
                            ? 'border-[#174C3C] bg-[#EBF2EE] font-bold text-[#174C3C]'
                            : 'border-[#E8E2D5] bg-white text-[#20332D] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: p.fg }}
                        />
                        <span className="truncate text-xs">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Transformation Sliders & Frieze Strip Display (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                  <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D6AA55]" />
                    Các phép biến hình toán học
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
                    Nhóm: {mirrorX && mirrorY ? 'p2mm (Diedral)' : mirrorX ? 'p1m1' : 'p1 (Cyclic)'}
                  </span>
                </div>

                {/* Transform controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E2D5]">
                  {/* Rotation */}
                  <div>
                    <label className="text-[#20332D] font-bold block mb-1">Phép quay R_θ:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotation(deg)}
                          className={`min-h-[40px] py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            rotation === deg
                              ? 'bg-[#174C3C] text-white border-[#174C3C]'
                              : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mirror Reflections */}
                  <div>
                    <label className="text-[#20332D] font-bold block mb-1">Đối xứng trục (Reflection):</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setMirrorX(!mirrorX)}
                        className={`min-h-[40px] py-1 px-1 rounded-lg text-xs font-bold border transition-colors ${
                          mirrorX
                            ? 'bg-[#174C3C] text-white border-[#174C3C]'
                            : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        Trục dọc S_y
                      </button>
                      <button
                        type="button"
                        onClick={() => setMirrorY(!mirrorY)}
                        className={`min-h-[40px] py-1 px-1 rounded-lg text-xs font-bold border transition-colors ${
                          mirrorY
                            ? 'bg-[#174C3C] text-white border-[#174C3C]'
                            : 'bg-white text-[#20332D] border-[#E8E2D5] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        Trục ngang S_x
                      </button>
                    </div>
                  </div>

                  {/* Repetition */}
                  <div>
                    <label className="text-[#20332D] font-bold block mb-1">Số chu kỳ lặp T(dx):</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                        className="w-full accent-[#174C3C]"
                      />
                      <span className="font-mono text-[#174C3C] font-bold text-sm w-5">{repeatCount}</span>
                    </div>
                  </div>
                </div>

                {/* Live Frieze Band Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#556D65]">
                    <span className="font-semibold text-[#20332D]">Dải viền Frieze thổ cẩm hoàn chỉnh:</span>
                    <span className="font-mono text-[#174C3C] font-bold">
                      {repeatCount * 8} sợi dọc × 8 sợi ngang
                    </span>
                  </div>

                  <div
                    className="p-4 rounded-xl border border-[#E8E2D5] overflow-x-auto shadow-inner"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <div className="flex gap-1 min-w-max">
                      {Array.from({ length: repeatCount }).map((_, rep) => (
                        <div key={rep} className="grid grid-cols-8 gap-0.5 border-r border-[#20332D]/20 pr-1">
                          {transformedMotif.map((row, r) =>
                            row.map((val, c) => (
                              <div
                                key={`${rep}-${r}-${c}`}
                                className="w-3.5 h-3.5 rounded-2xs"
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
                <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs font-mono text-[#20332D] space-y-1.5">
                  <div className="text-[#174C3C] font-sans font-bold">Công thức ánh xạ hình học phẳng:</div>
                  <div>
                    Vector tịnh tiến: T = (k · 8 · Δx, 0) với k ∈ [0, {repeatCount - 1}]
                  </div>
                  <div>
                    Ma trận biến đổi: M = R({rotation}°) · [ {mirrorX ? '-1' : '1'} 0 ; 0 {mirrorY ? '-1' : '1'} ]
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportSVG}
                    className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#FAF7F0] text-[#20332D] border border-[#E8E2D5] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-[#174C3C]" />
                    Xuất file vector SVG
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all flex items-center gap-2 shadow-xs active:scale-98"
                  >
                    <FileText className="w-4 h-4 text-[#D6AA55]" />
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
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#D6AA55]" />
            Bối cảnh di sản & Nghệ thuật dệt Mường
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed font-normal">{station.steps.context.description}</p>
          <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-[#E8E2D5] space-y-3">
            <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">Đặc điểm đồ án hoa văn dệt:</h3>
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
            Vấn đề toán học cốt lõi
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
            Hình thành giả thuyết toán học
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
                  name="p2_pred"
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
              Chuyển sang Bước 4: Thí nghiệm dệt →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5, 6, 7 */}
      {activeStep >= 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#D6AA55]" />
            {activeStep === 5 ? 'Phân tích đối xứng' : activeStep === 6 ? 'Thử thách STEM' : 'Phản tư & Di sản'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C]">
            {activeStep === 5
              ? 'Phân tích cấu trúc nhóm đối xứng Frieze'
              : activeStep === 6
              ? station.steps.challenge.title
              : 'Phản tư toán học & Tri thức dân gian Mường'}
          </h2>
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">
            {activeStep === 5
              ? 'Dải hoa văn Frieze chỉ có đúng 7 nhóm đối xứng hình học trên mặt phẳng. Khung dệt truyền thống thường kết hợp nhóm p2mm (có cả trục đối xứng ngang và dọc), tạo nên sự cân bằng thị giác tuyệt đối.'
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
              ← Quay lại Thí nghiệm
            </button>
            {activeStep < 7 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
              >
                Chuyển sang Bước {activeStep + 1} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveToJournal}
                className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] flex items-center gap-2 shadow-xs active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
                Hoàn thành & Lưu vào Nhật ký
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
