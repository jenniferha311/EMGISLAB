import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  Square, 
  Upload, 
  Download, 
  Play, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  Layers,
  HelpCircle,
  Award
} from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { audioEngine, GongMode, GONG_PRESETS } from '../utils/audioEngine';
import { WaveformCanvas } from '../components/audio/WaveformCanvas';
import { SpectrumCanvas } from '../components/audio/SpectrumCanvas';
import { GongInteractiveGraphic } from '../components/audio/GongInteractiveGraphic';
import { saveResearchLog, exportToCSV, getCurrentStudent, saveAudioRecord } from '../utils/storage';

export const Station01ChiengMuong: React.FC = () => {
  const station = STATIONS_DATA[0]; // Station 01
  const [activeStep, setActiveStep] = useState<number>(4); // Default to digital experiment (Step 4)
  const [labMode, setLabMode] = useState<'synthetic' | 'real_analysis'>('synthetic');

  // Mode A: Synthetic model state
  const [presetKey, setPresetKey] = useState<string>('chieng_dam_soft');
  const [strikeZone, setStrikeZone] = useState<'ron' | 'than' | 'vanh'>('ron');
  const [malletType, setMalletType] = useState<'soft' | 'hard'>('soft');
  const [modes, setModes] = useState<GongMode[]>(GONG_PRESETS.chieng_dam_soft.modes);
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [strikeVolume, setStrikeVolume] = useState<number>(0.9);

  // A/B compare slot
  const [compareModeB, setCompareModeB] = useState<boolean>(false);
  const [presetKeyB, setPresetKeyB] = useState<string>('chieng_khong_hard');

  // Mode B: Real sound analysis state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [realAudioBuffer, setRealAudioBuffer] = useState<AudioBuffer | null>(null);
  const [realAnalysis, setRealAnalysis] = useState<{
    sampleRate: number;
    freqResolution: number;
    frequencies: Float32Array;
    magnitudes: Float32Array;
    peaks: { frequency: number; magnitude: number }[];
    waveform: Float32Array;
  } | null>(null);
  const [realMetadata, setRealMetadata] = useState({
    sampleCode: 'CM-THUC-01',
    distanceCm: 100,
    strikeMethod: 'Dùi bọc vải đập rốn chiêng',
    repetition: 1,
    notes: 'Thu âm trong phòng tĩnh, micro hướng trực diện mặt chiêng',
    consentConfirmed: true,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Step 3 Hypothesis State
  const [selectedPrediction, setSelectedPrediction] = useState<string>('pred_1');
  const [hypothesisText, setHypothesisText] = useState<string>('');

  // Step 6 & 7 State
  const [challengeAnswers, setChallengeAnswers] = useState<string>('');
  const [reflectionAnswers, setReflectionAnswers] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Handle Preset change
  const handleSelectPreset = (key: string) => {
    setPresetKey(key);
    const p = GONG_PRESETS[key];
    if (p) {
      setModes(p.modes);
      setStrikeZone(p.strikeZone);
      setMalletType(p.malletType);
    }
  };

  // Play synthetic gong
  const handleStrike = (zone = strikeZone) => {
    setStrikeZone(zone);
    setIsVibrating(true);
    audioEngine.playSyntheticGong(modes, strikeVolume, malletType);
    setTimeout(() => setIsVibrating(false), 800);
  };

  // Update single mode parameter
  const handleUpdateMode = (index: number, field: keyof GongMode, value: number) => {
    setModes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Mode B: Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Decode and analyze
        try {
          const buffer = await audioEngine.decodeAudioData(audioBlob);
          setRealAudioBuffer(buffer);
          const analysis = audioEngine.analyzeAudioBuffer(buffer);
          setRealAnalysis(analysis);
        } catch (err) {
          console.error('Failed to decode recorded audio', err);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập trên trình duyệt hoặc sử dụng tính năng tải tệp âm thanh bên cạnh.');
      console.error(err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Mode B: File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    try {
      const buffer = await audioEngine.decodeAudioData(file);
      setRealAudioBuffer(buffer);
      const analysis = audioEngine.analyzeAudioBuffer(buffer);
      setRealAnalysis(analysis);
    } catch (err) {
      alert('Không thể giải mã tệp âm thanh. Vui lòng chọn tệp định dạng WAV hoặc MP3 hợp lệ.');
      console.error(err);
    }
  };

  // Playback recorded audio
  const handlePlayRealAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play();
    }
  };

  // Export Real Audio CSV
  const handleExportRealCSV = () => {
    if (!realAnalysis) return;
    const headers = ['Frequency_Hz', 'Magnitude_dB'];
    const rows: (string | number)[][] = [];

    for (let i = 0; i < realAnalysis.frequencies.length; i++) {
      rows.push([
        Math.round(realAnalysis.frequencies[i]),
        Math.round(realAnalysis.magnitudes[i] * 10) / 10,
      ]);
    }

    // Append metadata rows at top
    const metaHeader = [
      `# Sample_Code: ${realMetadata.sampleCode}`,
      `# Sample_Rate_Hz: ${realAnalysis.sampleRate}`,
      `# Resolution_Hz: ${realAnalysis.freqResolution}`,
      `# Distance_cm: ${realMetadata.distanceCm}`,
      `# Strike_Method: ${realMetadata.strikeMethod}`,
      `# Window: Hann`,
      `# Top_Peaks: ${realAnalysis.peaks.map((p) => `${p.frequency}Hz(${p.magnitude}dB)`).join('; ')}`,
    ];

    exportToCSV(`${realMetadata.sampleCode}_spectral_analysis.csv`, metaHeader, rows);
  };

  // Save to Student Journal
  const handleSaveToJournal = () => {
    const student = getCurrentStudent();
    const log = saveResearchLog({
      studentCode: student,
      stationId: 1,
      stationTitle: station.title,
      hypothesis: hypothesisText || 'Khảo sát mode dao động phi điều hòa và phổ FFT của chiêng.',
      selectedPrediction,
      changedVariables: {
        modeA_preset: presetKey,
        strikeZone,
        malletType,
        f1: modes[0]?.frequency || 0,
        f2: modes[1]?.frequency || 0,
        f3: modes[2]?.frequency || 0,
        decay_lambda1: modes[0]?.decay || 0,
      },
      recordedResults: realAnalysis
        ? {
            real_sampleRate: realAnalysis.sampleRate,
            real_topPeaks: realAnalysis.peaks.map((p) => `${p.frequency}Hz`).join(', '),
            real_sampleCode: realMetadata.sampleCode,
          }
        : {
            synthetic_peaks: modes.map((m) => `${m.frequency}Hz`).join(', '),
          },
      observationNotes: challengeAnswers || 'Đã kiểm tra 5 mode dao động. Tỷ số f2/f1 cho thấy rõ tính chất phi điều hòa.',
      reflectionAnswers: reflectionAnswers || 'Chiêng có các mode phân tán không phải dãy số nguyên.',
      isVerifiedRealData: labMode === 'real_analysis' && !!realAnalysis,
    });

    if (labMode === 'real_analysis' && realAnalysis) {
      saveAudioRecord({
        id: 'rec_' + Date.now(),
        sampleCode: realMetadata.sampleCode,
        title: 'Bản đo âm thanh chiêng thực tế',
        timestamp: new Date().toISOString(),
        sourceType: audioUrl ? 'mic_recording' : 'file_upload',
        sampleRate: realAnalysis.sampleRate,
        durationSec: realAudioBuffer?.duration || 0,
        strikeZone,
        strikeTechnique: realMetadata.strikeMethod,
        distanceCm: realMetadata.distanceCm,
        peaks: realAnalysis.peaks,
        culturalConsentConfirmed: realMetadata.consentConfirmed,
        notes: realMetadata.notes,
      });
    }

    setSaveSuccessMsg(`Đã lưu thành công vào Nhật ký nghiên cứu của học sinh ${student}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Station Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              TRẠM {station.numberStr}
            </span>
            <span className="text-xs text-stone-500 font-medium">·</span>
            <span className="text-xs text-stone-600 font-medium">{station.stemDomainLabel}</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-md border border-stone-200">
            <button
              type="button"
              onClick={() => setLabMode('synthetic')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                labMode === 'synthetic'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              A. Mô phỏng âm tổng hợp
            </button>
            <button
              type="button"
              onClick={() => setLabMode('real_analysis')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                labMode === 'real_analysis'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              B. Phân tích âm chiêng thật
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{station.title}</h1>
        <p className="text-sm text-stone-600 mt-1">{station.subtitle}</p>

        {/* Heritage Context Bar */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            <strong className="text-stone-700">Di sản:</strong> {station.culturalHeritage}
          </div>
          <div>
            <strong className="text-stone-700">Địa bàn:</strong> {station.locationContext}
          </div>
        </div>
      </div>

      {/* 7-Step Navigation Tabs */}
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

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 rounded">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 1: Context */}
      {activeStep === 1 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-stone-900">{station.steps.context.title}</h2>
          <p className="text-stone-700 leading-relaxed text-sm">{station.steps.context.description}</p>

          <div className="bg-stone-50 p-4 rounded border border-stone-200">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Đặc điểm âm học di sản đã kiểm chứng
            </h3>
            <ul className="space-y-1.5 text-sm text-stone-600">
              {station.steps.context.culturalDetails.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {station.steps.context.artisanNote && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{station.steps.context.artisanNote}</span>
            </div>
          )}

          <div className="pt-2 text-xs text-stone-500">
            <strong>Nguồn kiểm chứng:</strong> {station.steps.context.verifiedSources.join(' · ')}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
            >
              Tiếp tục: Bước 2 – Câu hỏi STEM →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STEM Question */}
      {activeStep === 2 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            Vấn đề khoa học cốt lõi
          </div>
          <h2 className="text-xl font-bold text-stone-900">{station.steps.stemQuestion.question}</h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            {station.steps.stemQuestion.contextExplanation}
          </p>

          <div className="bg-stone-50 p-4 rounded border border-stone-200 space-y-2">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Các câu hỏi nghiên cứu cụ thể:
            </h3>
            {station.steps.stemQuestion.subQuestions.map((q, idx) => (
              <div key={idx} className="text-sm text-stone-700 flex items-start gap-2">
                <span className="font-mono text-emerald-700 font-semibold">{idx + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs hover:bg-stone-50"
            >
              ← Quay lại Bước 1
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
            >
              Tiếp tục: Bước 3 – Đưa ra dự đoán →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Prediction */}
      {activeStep === 3 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            Hình thành giả thuyết nghiên cứu
          </div>
          <h2 className="text-base font-bold text-stone-900">{station.steps.prediction.prompt}</h2>

          <div className="space-y-3">
            {station.steps.prediction.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                  selectedPrediction === opt.id
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="prediction_radio"
                  value={opt.id}
                  checked={selectedPrediction === opt.id}
                  onChange={() => setSelectedPrediction(opt.id)}
                  className="mt-1 text-emerald-700 focus:ring-emerald-600"
                />
                <div>
                  <div className="text-sm font-semibold text-stone-900">{opt.label}</div>
                  <div className="text-xs text-stone-600 mt-0.5">{opt.explanation}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-stone-700">
              Ghi chú thêm lập luận giả thuyết của bạn (nếu có):
            </label>
            <textarea
              value={hypothesisText}
              onChange={(e) => setHypothesisText(e.target.value)}
              placeholder="Ví dụ: Tôi dự đoán khi gõ vành chiêng, màng kim loại ở mép có bậc tự do dao động cao hơn nên kích thích các tần số trên 600 Hz mạnh hơn..."
              rows={3}
              className="w-full text-xs p-2.5 rounded border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs hover:bg-stone-50"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
            >
              Chuyển sang Bước 4: Thí nghiệm kiểm chứng →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Digital Experiment (Core Lab) */}
      {activeStep === 4 && (
        <div className="space-y-6">
          {/* Scientific Disclaimer Badge */}
          {labMode === 'synthetic' ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  MÔ PHỎNG ÂM TỔNG HỢP MINH HỌA
                </span>
                <span>Âm thanh phát ra từ mô hình toán học mode suy giảm; không tự nhận là bản ghi chiêng Mường thật.</span>
              </div>
              <span className="font-mono text-stone-500 hidden sm:inline">Web Audio API · Synthesis</span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                  ĐO THỰC TẾ & PHÂN TÍCH TÍN HIỆU
                </span>
                <span>Xử lý FFT cửa sổ Hann từ micro hoặc tệp âm thanh ngoại vi. Dữ liệu xử lý cục bộ trên máy bạn.</span>
              </div>
              <span className="font-mono text-stone-500 hidden sm:inline">Hann Window · FFT Resolution</span>
            </div>
          )}

          {/* MODE A: SYNTHETIC GONG LAB */}
          {labMode === 'synthetic' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Gong & Quick Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <GongInteractiveGraphic
                  onStrike={handleStrike}
                  isVibrating={isVibrating}
                  selectedZone={strikeZone}
                  malletType={malletType}
                />

                {/* Preset & Mallet Configuration */}
                <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">Cấu hình mẫu chiêng giả lập:</span>
                    <span className="font-mono text-stone-500">Mẫu có sẵn</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(GONG_PRESETS).map(([key, p]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPreset(key)}
                        className={`text-left p-2 rounded text-xs border transition-colors ${
                          presetKey === key
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-medium'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[11px] text-stone-500">{p.description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Mallet toggle */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-700 font-medium">Vật liệu dùi gõ:</span>
                    <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded border border-stone-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setMalletType('soft')}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          malletType === 'soft' ? 'bg-white font-medium shadow-xs' : 'text-stone-600'
                        }`}
                      >
                        Dùi vải mềm
                      </button>
                      <button
                        type="button"
                        onClick={() => setMalletType('hard')}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          malletType === 'hard' ? 'bg-white font-medium shadow-xs' : 'text-stone-600'
                        }`}
                      >
                        Dùi gỗ trần
                      </button>
                    </div>
                  </div>

                  {/* Master strike volume */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-700">Lực gõ (Biên độ):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={strikeVolume}
                        onChange={(e) => setStrikeVolume(parseFloat(e.target.value))}
                        className="w-24 accent-emerald-700"
                      />
                      <span className="font-mono text-stone-600 w-8 text-right">
                        {Math.round(strikeVolume * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Big Strike Button */}
                  <button
                    type="button"
                    onClick={() => handleStrike(strikeZone)}
                    className="w-full py-2.5 bg-emerald-800 text-white rounded font-medium text-xs hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    GÕ CHIÊNG (PHÁT ÂM TỔNG HỢP)
                  </button>
                </div>
              </div>

              {/* Right Column: Oscilloscope, Spectrum & Mode Fine-tuning (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Waveform & Spectrum Canvases */}
                <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-4">
                  <WaveformCanvas isPlaying={isVibrating} />
                  <SpectrumCanvas
                    isPlaying={isVibrating}
                    peaks={modes.map((m) => ({
                      frequency: m.frequency,
                      magnitude: Math.round(20 * Math.log10(Math.max(0.01, m.amplitude))),
                    }))}
                  />
                </div>

                {/* 5 Physical Modes Sliders */}
                <div className="bg-white p-4 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      5 Mode dao động thành phần: x(t) = Σ Aᵢ e^(-λᵢ t) sin(2π fᵢ t + φᵢ)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(presetKey)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Đặt lại mặc định
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modes.map((m, idx) => (
                      <div
                        key={m.id}
                        className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800">{m.name}</span>
                          <span className="font-mono text-emerald-800 font-medium">
                            f{idx + 1} = {m.frequency} Hz (Tỉ số: {(m.frequency / modes[0].frequency).toFixed(2)})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                          {/* Frequency */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-stone-500">Tần số f (Hz):</span>
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="range"
                                min="100"
                                max="2200"
                                step="5"
                                value={m.frequency}
                                onChange={(e) => handleUpdateMode(idx, 'frequency', parseInt(e.target.value))}
                                className="w-full accent-emerald-700"
                              />
                              <span className="font-mono w-10 text-right">{m.frequency}</span>
                            </div>
                          </div>

                          {/* Amplitude */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-stone-500">Biên độ A:</span>
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.05"
                                value={m.amplitude}
                                onChange={(e) => handleUpdateMode(idx, 'amplitude', parseFloat(e.target.value))}
                                className="w-full accent-emerald-700"
                              />
                              <span className="font-mono w-8 text-right">{m.amplitude.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Decay Rate lambda */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-stone-500">Suy giảm λ (s⁻¹):</span>
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="range"
                                min="0.3"
                                max="6.0"
                                step="0.1"
                                value={m.decay}
                                onChange={(e) => handleUpdateMode(idx, 'decay', parseFloat(e.target.value))}
                                className="w-full accent-emerald-700"
                              />
                              <span className="font-mono w-8 text-right">{m.decay.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Save to Journal Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-500">Học sinh: {getCurrentStudent()}</span>
                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lưu tham số vào Nhật ký khoa học
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: REAL SOUND ANALYSIS */}
          {labMode === 'real_analysis' && (
            <div className="space-y-6">
              {/* Record & Upload Control Center */}
              <div className="bg-white p-5 rounded-lg border border-stone-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Thu âm trực tiếp từ microphone hoặc Nhập tệp âm thanh ngoại vi
                    </h3>
                    <p className="text-xs text-stone-500">
                      Hỗ trợ microphone điện thoại/máy tính hoặc nhập tệp WAV/MP3 từ thiết bị ghi âm chuyên dụng.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-3.5 py-2 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Mic className="w-4 h-4" /> Bắt đầu ghi âm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-3.5 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 animate-pulse"
                      >
                        <Square className="w-4 h-4" /> Dừng ghi âm
                      </button>
                    )}

                    {/* File upload input */}
                    <label className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-stone-600" /> Nhập tệp WAV/MP3
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Cultural Consent Checkbox */}
                <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent_check"
                    checked={realMetadata.consentConfirmed}
                    onChange={(e) =>
                      setRealMetadata((prev) => ({ ...prev, consentConfirmed: e.target.checked }))
                    }
                    className="mt-0.5 text-emerald-700 rounded focus:ring-emerald-600"
                  />
                  <label htmlFor="consent_check" className="cursor-pointer">
                    <strong>Xác nhận quyền tư liệu văn hóa:</strong> Dữ liệu âm thanh được đo đạc với sự đồng thuận, phục vụ mục đích học tập STEM và nghiên cứu di sản; ứng dụng không tải bản ghi âm lên máy chủ đám mây.
                  </label>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-stone-600 font-medium">Mã mẫu đo:</label>
                    <input
                      type="text"
                      value={realMetadata.sampleCode}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, sampleCode: e.target.value }))
                      }
                      className="w-full mt-1 p-2 rounded border border-stone-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium">Khoảng cách micro (cm):</label>
                    <input
                      type="number"
                      value={realMetadata.distanceCm}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, distanceCm: parseInt(e.target.value) || 0 }))
                      }
                      className="w-full mt-1 p-2 rounded border border-stone-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 font-medium">Kỹ thuật gõ / Vị trí gõ:</label>
                    <input
                      type="text"
                      value={realMetadata.strikeMethod}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, strikeMethod: e.target.value }))
                      }
                      className="w-full mt-1 p-2 rounded border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                {/* Audio playback & status */}
                {audioUrl && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <audio ref={audioElementRef} src={audioUrl} className="hidden" />
                      <button
                        type="button"
                        onClick={handlePlayRealAudio}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded font-medium flex items-center gap-1 hover:bg-emerald-800"
                      >
                        <Play className="w-3.5 h-3.5" /> Nghe lại bản ghi
                      </button>
                      <span className="text-emerald-900 font-mono">
                        {realAudioBuffer
                          ? `Thời lượng: ${realAudioBuffer.duration.toFixed(2)}s · fs = ${realAudioBuffer.sampleRate} Hz`
                          : 'Đang chuẩn bị...'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAudioUrl(null);
                        setRealAudioBuffer(null);
                        setRealAnalysis(null);
                      }}
                      className="text-stone-500 hover:text-red-700"
                    >
                      Xóa bản ghi
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis Results Display */}
              {realAnalysis ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Canvases (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-4">
                      <WaveformCanvas
                        isPlaying={false}
                        staticData={realAnalysis.waveform}
                        label="Dạng sóng thực tế thu được (Đã chuẩn hóa biên độ)"
                      />
                      <SpectrumCanvas
                        isPlaying={false}
                        staticFrequencies={realAnalysis.frequencies}
                        staticMagnitudes={realAnalysis.magnitudes}
                        peaks={realAnalysis.peaks}
                        label="Phổ FFT thực nghiệm (Cửa sổ Hann, Δf ≈ 21.5 Hz)"
                      />
                    </div>
                  </div>

                  {/* Right: Detected Peaks & Export (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                          Các đỉnh phổ nhận diện (Peaks Detected)
                        </h4>
                        <span className="text-xs font-mono text-emerald-800">
                          Δf = {realAnalysis.freqResolution} Hz
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                            <tr>
                              <th className="py-1.5 px-2 font-semibold">Đỉnh</th>
                              <th className="py-1.5 px-2 font-semibold">Tần số (Hz)</th>
                              <th className="py-1.5 px-2 font-semibold">Biên độ (dB)</th>
                              <th className="py-1.5 px-2 font-semibold">Tỉ số fi / f1</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 font-mono">
                            {realAnalysis.peaks.map((p, idx) => {
                              const ratio =
                                realAnalysis.peaks[0]?.frequency > 0
                                  ? (p.frequency / realAnalysis.peaks[0].frequency).toFixed(2)
                                  : '1.00';
                              return (
                                <tr key={idx} className="hover:bg-stone-50">
                                  <td className="py-1.5 px-2 font-sans font-bold text-stone-800">
                                    f{idx + 1}
                                  </td>
                                  <td className="py-1.5 px-2 text-emerald-800 font-bold">
                                    {p.frequency} Hz
                                  </td>
                                  <td className="py-1.5 px-2 text-stone-600">{p.magnitude} dB</td>
                                  <td className="py-1.5 px-2 text-stone-700">
                                    {idx === 0 ? '1.00 (gốc)' : ratio}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 space-y-1">
                        <div className="font-semibold text-stone-800">Nhận xét âm học:</div>
                        <p>
                          Tỉ số các đỉnh phổ {realAnalysis.peaks.slice(1).map((p, i) => `f${i + 2}/f1 = ${(p.frequency / (realAnalysis.peaks[0]?.frequency || 1)).toFixed(2)}`).join(', ')} không trùng với dãy số nguyên 2, 3, 4, 5. Điều này minh chứng tính chất phi điều hòa đặc trưng của màng kim loại đúc.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleExportRealCSV}
                          className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          Xuất dữ liệu phổ ra CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveToJournal}
                          className="w-full py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Lưu vào Nhật ký nghiên cứu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-300 rounded-lg text-xs text-stone-500">
                  Chưa có tín hiệu âm thanh nào được phân tích. Hãy nhấn <strong>Bắt đầu ghi âm</strong> hoặc <strong>Nhập tệp WAV/MP3</strong> để hiển thị phổ FFT.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Data Analysis */}
      {activeStep === 5 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Bảng dữ liệu lặp đo & Phân tích phổ</h2>
            <button
              type="button"
              onClick={() => {
                const headers = ['Mode', 'Frequency_Hz', 'Decay_lambda', 'Ratio_fi_f1', 'Initial_Amp'];
                const rows = modes.map((m, i) => [
                  m.name,
                  m.frequency,
                  m.decay,
                  (m.frequency / modes[0].frequency).toFixed(2),
                  m.amplitude,
                ]);
                exportToCSV('tram01_chieng_muong_modes.csv', headers, rows);
              }}
              className="px-3 py-1.5 border border-stone-300 rounded text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Xuất bảng CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700">
                <tr>
                  <th className="py-2 px-3 font-semibold">Mode dao động</th>
                  <th className="py-2 px-3 font-semibold">Tần số f (Hz)</th>
                  <th className="py-2 px-3 font-semibold">Hệ số suy giảm λ (s⁻¹)</th>
                  <th className="py-2 px-3 font-semibold">Tỉ số fᵢ / f₁</th>
                  <th className="py-2 px-3 font-semibold">Thời gian tắt T60 ước tính (s)</th>
                  <th className="py-2 px-3 font-semibold">Ý nghĩa vật lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {modes.map((m, idx) => {
                  const ratio = (m.frequency / modes[0].frequency).toFixed(2);
                  const t60 = (6.9 / m.decay).toFixed(2);
                  return (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-2 px-3 font-sans font-medium text-stone-800">{m.name}</td>
                      <td className="py-2 px-3 font-bold text-emerald-800">{m.frequency} Hz</td>
                      <td className="py-2 px-3 text-stone-600">{m.decay} s⁻¹</td>
                      <td className="py-2 px-3 text-stone-700">{idx === 0 ? '1.00 (cơ bản)' : ratio}</td>
                      <td className="py-2 px-3 text-amber-800">{t60} s</td>
                      <td className="py-2 px-3 font-sans text-stone-500 text-[11px]">
                        {idx === 0
                          ? 'Quyết định cao độ cảm nhận chính'
                          : idx === 1
                          ? 'Đặc trưng màng uốn phi điều hòa'
                          : 'Tạo độ đanh và sắc thái kim khí'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 p-4 rounded border border-stone-200 text-xs text-stone-700 space-y-2">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider">
              Kết luận từ dữ liệu thực nghiệm:
            </h3>
            <p>
              1. <strong>Tính phi điều hòa:</strong> Tỉ số f2/f1 ≈ 1.56 và f3/f1 ≈ 2.52 không phải là số nguyên như dây đàn hay cột khí sáo trúc. Đây là bản chất dao động 2 chiều của màng kim loại tròn có gờ.
            </p>
            <p>
              2. <strong>Suy giảm có chọn lọc:</strong> Các mode tần số cao có hệ số suy giảm λ lớn hơn, tắt nhanh hơn nhiều so với mode cơ bản f1, giải thích vì sao tiếng chiêng lúc mới gõ nghe keng đanh, nhưng sau vài giây chỉ còn lại âm trầm rền ngân dài.
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs hover:bg-stone-50"
            >
              ← Quay lại Thí nghiệm
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
            >
              Chuyển sang Bước 6: Thử thách STEM →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Challenge */}
      {activeStep === 6 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            Thử thách thám tử âm học di sản
          </div>
          <h2 className="text-base font-bold text-stone-900">{station.steps.challenge.title}</h2>
          <p className="text-sm text-stone-700 leading-relaxed">{station.steps.challenge.scenario}</p>

          <div className="bg-stone-50 p-4 rounded border border-stone-200">
            <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
              Tiêu chí đánh giá lập luận khoa học:
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {station.steps.challenge.criteria.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-800">
              {station.steps.challenge.task}
            </label>
            <textarea
              value={challengeAnswers}
              onChange={(e) => setChallengeAnswers(e.target.value)}
              placeholder="Nhập câu trả lời của bạn: So sánh đỉnh phổ của Chiêng A vs Chiêng B, giải thích sự khác biệt dựa trên vị trí gõ và dùi gõ..."
              rows={4}
              className="w-full text-xs p-3 rounded border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs hover:bg-stone-50"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
            >
              Chuyển sang Bước 7: Phản tư & Di sản →
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Reflection */}
      {activeStep === 7 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            Phản tư khoa học & Kết nối tri thức bản địa
          </div>

          <div className="space-y-3">
            {station.steps.reflection.questions.map((q, idx) => (
              <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs">
                <strong className="text-stone-900">{idx + 1}. {q}</strong>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="font-bold text-emerald-900 uppercase tracking-wider">
              Ý nghĩa văn hóa bản địa:
            </div>
            <p className="leading-relaxed">{station.steps.reflection.culturalConnection}</p>
          </div>

          <div className="p-4 bg-amber-50 rounded border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Giới hạn vật lý & Sai số đo đạc:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-stone-700">
              {station.steps.reflection.physicalLimitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-stone-800">
              Ghi lại cảm nhận và suy nghĩ của bạn:
            </label>
            <textarea
              value={reflectionAnswers}
              onChange={(e) => setReflectionAnswers(e.target.value)}
              placeholder="Nhập phản tư của bạn về mối liên hệ giữa vật lý âm học và bàn tay tài hoa của nghệ nhân đúc chiêng..."
              rows={3}
              className="w-full text-xs p-3 rounded border border-stone-300 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-xs hover:bg-stone-50"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={handleSaveToJournal}
              className="px-5 py-2.5 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900 flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Hoàn thành trạm & Lưu vào Nhật ký
            </button>
          </div>
        </div>
      )}

      {/* Scientific Basis Drawer / Accordion at bottom */}
      <div className="bg-stone-100 border border-stone-200 rounded-lg p-5 text-xs text-stone-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-900 uppercase tracking-wider">
            Cơ sở khoa học, Giả định, Biến số & Nguồn tham khảo (Trạm 01)
          </span>
          <span className="font-mono text-stone-500">Peer-Reviewed / Ethnography</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-stone-800 mb-1">Nguyên lý cốt lõi:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
              {station.scientificBasis.principles.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-stone-800 mb-1">Giả định mô hình:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
              {station.scientificBasis.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <div>
            <strong>Tài liệu tham khảo:</strong> {station.scientificBasis.references.join(' · ')}
          </div>
          <div className="text-amber-800">
            <strong>An toàn:</strong> {station.scientificBasis.safetyNotes.join(' ')}
          </div>
        </div>
      </div>
    </div>
  );
};
