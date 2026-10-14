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
  Award,
  BookOpen
} from 'lucide-react';
import { STATIONS_DATA } from '../data/stationsData';
import { audioEngine, GongMode, GONG_PRESETS } from '../utils/audioEngine';
import { WaveformCanvas } from '../components/audio/WaveformCanvas';
import { SpectrumCanvas } from '../components/audio/SpectrumCanvas';
import { GongInteractiveGraphic } from '../components/audio/GongInteractiveGraphic';
import { MuongPatternBorder } from '../components/MuongPatternBorder';
import { 
  saveResearchLog, 
  exportToCSV, 
  getCurrentStudent, 
  saveAudioRecord,
  markStationVisited,
  getCompletedStations,
  toggleStationCompleted
} from '../utils/storage';

export const Station01ChiengMuong: React.FC = () => {
  const station = STATIONS_DATA[0]; // Station 01
  const [activeStep, setActiveStep] = useState<number>(4); // Default to digital experiment (Step 4)
  const [labMode, setLabMode] = useState<'synthetic' | 'real_analysis'>('synthetic');
  const [isCompleted, setIsCompleted] = useState<boolean>(() => getCompletedStations().includes(1));

  useEffect(() => {
    markStationVisited(1);
    setIsCompleted(getCompletedStations().includes(1));

    const handleProgress = () => {
      setIsCompleted(getCompletedStations().includes(1));
    };
    window.addEventListener('emgis_progress_updated', handleProgress);
    window.addEventListener('storage', handleProgress);
    return () => {
      window.removeEventListener('emgis_progress_updated', handleProgress);
      window.removeEventListener('storage', handleProgress);
    };
  }, []);

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      setErrorMessage(null);
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
          setErrorMessage('Không thể giải mã bản ghi âm. Vui lòng thử ghi âm lại.');
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      setErrorMessage('Không thể truy cập microphone. Vui lòng kiểm tra quyền micro trên trình duyệt hoặc dùng tệp âm thanh có sẵn.');
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

    setErrorMessage(null);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    try {
      const buffer = await audioEngine.decodeAudioData(file);
      setRealAudioBuffer(buffer);
      const analysis = audioEngine.analyzeAudioBuffer(buffer);
      setRealAnalysis(analysis);
    } catch (err) {
      setErrorMessage('Không thể giải mã tệp âm thanh. Vui lòng chọn tệp định dạng WAV hoặc MP3 hợp lệ.');
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
      <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={5} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
                TRẠM {station.numberStr}
              </span>
              <span className="text-xs text-[#D6AA55]">·</span>
              <span className="text-xs font-semibold text-[#556D65]">{station.stemDomainLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => toggleStationCompleted(1)}
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

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#FAF7F0] p-1.5 rounded-xl border border-[#E8E2D5]">
            <button
              type="button"
              onClick={() => setLabMode('synthetic')}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                labMode === 'synthetic'
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'text-[#556D65] hover:text-[#20332D]'
              }`}
            >
              A. Mô phỏng âm tổng hợp
            </button>
            <button
              type="button"
              onClick={() => setLabMode('real_analysis')}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                labMode === 'real_analysis'
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'text-[#556D65] hover:text-[#20332D]'
              }`}
            >
              B. Phân tích âm chiêng thật
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight">{station.title}</h1>
        <p className="text-sm text-[#556D65] mt-1.5 leading-relaxed">{station.subtitle}</p>

        {/* Heritage Context Bar */}
        <div className="mt-5 pt-3.5 border-t border-[#E8E2D5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#556D65]">
          <div>
            <strong className="text-[#20332D]">Di sản bản địa:</strong> {station.culturalHeritage}
          </div>
          <div>
            <strong className="text-[#20332D]">Địa bàn:</strong> {station.locationContext}
          </div>
        </div>
      </div>

      {/* 7-Step Navigation Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-[#E8E2D5]">
        {[
          { id: 1, label: '1. Khám phá bối cảnh' },
          { id: 2, label: '2. Câu hỏi STEM' },
          { id: 3, label: '3. Dự đoán' },
          { id: 4, label: '4. Thí nghiệm số' },
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#FBF0EE] text-[#A94438] border border-[#A94438]/30 rounded-2xl shadow-2xs font-medium">
          <AlertTriangle className="w-4 h-4 text-[#A94438] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* STEP 1: Context */}
      {activeStep === 1 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#D6AA55]" />
            Bối cảnh di sản & Không gian văn hóa
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#174C3C] tracking-tight">{station.steps.context.title}</h2>
          <p className="text-[#20332D] leading-relaxed text-sm sm:text-base font-normal">{station.steps.context.description}</p>

          <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-[#E8E2D5] space-y-3">
            <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
              Đặc điểm âm học di sản đã kiểm chứng:
            </h3>
            <ul className="space-y-2 text-sm text-[#20332D]">
              {station.steps.context.culturalDetails.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#A94438] font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {station.steps.context.artisanNote && (
            <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs sm:text-sm text-[#20332D] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D6AA55] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{station.steps.context.artisanNote}</span>
            </div>
          )}

          <div className="pt-2 text-xs text-[#556D65] border-t border-[#E8E2D5]">
            <strong className="text-[#20332D]">Nguồn kiểm chứng:</strong> {station.steps.context.verifiedSources.join(' · ')}
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
          <p className="text-sm sm:text-base text-[#20332D] leading-relaxed">
            {station.steps.stemQuestion.contextExplanation}
          </p>

          <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-[#E8E2D5] space-y-3">
            <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
              Các câu hỏi nghiên cứu cụ thể:
            </h3>
            {station.steps.stemQuestion.subQuestions.map((q, idx) => (
              <div key={idx} className="text-sm text-[#20332D] flex items-start gap-3">
                <span className="font-mono font-bold text-[#174C3C] text-sm shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>

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
                  name="prediction_radio"
                  value={opt.id}
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

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-[#20332D]">
              Ghi chú thêm lập luận giả thuyết của bạn (nếu có):
            </label>
            <textarea
              value={hypothesisText}
              onChange={(e) => setHypothesisText(e.target.value)}
              placeholder="Ví dụ: Tôi dự đoán khi gõ vành chiêng, màng kim loại ở mép có bậc tự do dao động cao hơn nên kích thích các tần số trên 600 Hz mạnh hơn..."
              rows={3}
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
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
            <div className="p-4 bg-[#FBF6EA] border border-[#D6AA55]/50 rounded-2xl text-xs text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold bg-[#D6AA55] text-[#20332D] px-2 py-0.5 rounded-lg font-mono text-[11px]">
                  MÔ PHỎNG ÂM TỔNG HỢP MINH HỌA
                </span>
                <span className="leading-relaxed">Âm thanh phát ra từ mô hình toán học mode uốn tắt dần; không tự nhận là bản ghi chiêng Mường thật.</span>
              </div>
              <span className="font-mono text-[#556D65] hidden sm:inline text-[11px]">Web Audio API</span>
            </div>
          ) : (
            <div className="p-4 bg-[#EBF2EE] border border-[#174C3C]/30 rounded-2xl text-xs text-[#20332D] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold bg-[#174C3C] text-white px-2 py-0.5 rounded-lg font-mono text-[11px]">
                  ĐO THỰC TẾ & PHÂN TÍCH TÍN HIỆU
                </span>
                <span className="leading-relaxed">Xử lý FFT cửa sổ Hann từ micro hoặc tệp âm thanh ngoại vi. Dữ liệu xử lý cục bộ trên máy bạn.</span>
              </div>
              <span className="font-mono text-[#174C3C] hidden sm:inline text-[11px]">Hann Window · FFT</span>
            </div>
          )}

          {/* MODE A: SYNTHETIC GONG LAB */}
          {labMode === 'synthetic' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Gong & Quick Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <GongInteractiveGraphic
                  onStrike={handleStrike}
                  isVibrating={isVibrating}
                  selectedZone={strikeZone}
                  malletType={malletType}
                />

                {/* Preset & Mallet Configuration */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#174C3C] uppercase tracking-wider">Cấu hình mẫu chiêng giả lập:</span>
                    <span className="font-mono text-[#556D65] text-[11px]">Mẫu Mường cổ</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(GONG_PRESETS).map(([key, p]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPreset(key)}
                        className={`text-left p-3 rounded-xl text-xs border transition-all ${
                          presetKey === key
                            ? 'bg-[#EBF2EE] text-[#174C3C] border-[#174C3C] font-bold shadow-2xs'
                            : 'bg-[#FAF7F0] text-[#20332D] border-[#E8E2D5] hover:bg-white'
                        }`}
                      >
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-[11px] text-[#556D65] mt-0.5">{p.description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Mallet toggle */}
                  <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between">
                    <span className="text-xs text-[#20332D] font-semibold">Vật liệu dùi gõ:</span>
                    <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E8E2D5] text-xs">
                      <button
                        type="button"
                        onClick={() => setMalletType('soft')}
                        className={`min-h-[36px] px-3 py-1 rounded-lg font-semibold transition-all ${
                          malletType === 'soft' ? 'bg-[#174C3C] text-white shadow-xs' : 'text-[#556D65]'
                        }`}
                      >
                        Dùi vải mềm
                      </button>
                      <button
                        type="button"
                        onClick={() => setMalletType('hard')}
                        className={`min-h-[36px] px-3 py-1 rounded-lg font-semibold transition-all ${
                          malletType === 'hard' ? 'bg-[#174C3C] text-white shadow-xs' : 'text-[#556D65]'
                        }`}
                      >
                        Dùi gỗ trần
                      </button>
                    </div>
                  </div>

                  {/* Master strike volume */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#20332D] font-semibold">Lực gõ (Biên độ xung):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={strikeVolume}
                        onChange={(e) => setStrikeVolume(parseFloat(e.target.value))}
                        className="w-24 accent-[#174C3C]"
                      />
                      <span className="font-mono text-[#174C3C] font-bold w-10 text-right">
                        {Math.round(strikeVolume * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Big Strike Button */}
                  <button
                    type="button"
                    onClick={() => handleStrike(strikeZone)}
                    className="w-full min-h-[48px] py-3 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                  >
                    <Volume2 className="w-5 h-5 text-[#D6AA55]" />
                    GÕ CHIÊNG (PHÁT ÂM TỔNG HỢP)
                  </button>
                </div>
              </div>

              {/* Right Column: Oscilloscope, Spectrum & Mode Fine-tuning (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Waveform & Spectrum Canvases */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
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
                <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#174C3C] flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-[#174C3C]" />
                      5 Mode dao động thành phần: x(t) = Σ Aᵢ e^(-λᵢ t) sin(2π fᵢ t + φᵢ)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(presetKey)}
                      className="text-xs text-[#556D65] hover:text-[#174C3C] flex items-center gap-1 min-h-[36px] px-2 rounded-lg font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Đặt lại mặc định
                    </button>
                  </div>

                  <div className="space-y-3">
                    {modes.map((m, idx) => (
                      <div
                        key={m.id}
                        className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#20332D]">{m.name}</span>
                          <span className="font-mono text-[#174C3C] font-bold text-xs">
                            f{idx + 1} = {m.frequency} Hz (Tỉ số: {(m.frequency / modes[0].frequency).toFixed(2)})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                          {/* Frequency */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-[#556D65] font-medium">Tần số f (Hz):</span>
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="range"
                                min="100"
                                max="2200"
                                step="5"
                                value={m.frequency}
                                onChange={(e) => handleUpdateMode(idx, 'frequency', parseInt(e.target.value))}
                                className="w-full accent-[#174C3C]"
                              />
                              <span className="font-mono w-10 text-right font-bold text-[#20332D]">{m.frequency}</span>
                            </div>
                          </div>

                          {/* Amplitude */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-[#556D65] font-medium">Biên độ A:</span>
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.05"
                                value={m.amplitude}
                                onChange={(e) => handleUpdateMode(idx, 'amplitude', parseFloat(e.target.value))}
                                className="w-full accent-[#174C3C]"
                              />
                              <span className="font-mono w-8 text-right font-bold text-[#20332D]">{m.amplitude.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Decay Rate lambda */}
                          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                            <span className="text-[#556D65] font-medium">Suy giảm λ (s⁻¹):</span>
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="range"
                                min="0.3"
                                max="6.0"
                                step="0.1"
                                value={m.decay}
                                onChange={(e) => handleUpdateMode(idx, 'decay', parseFloat(e.target.value))}
                                className="w-full accent-[#174C3C]"
                              />
                              <span className="font-mono w-8 text-right font-bold text-[#20332D]">{m.decay.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Save to Journal Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#556D65]">Mã học sinh: <strong className="font-mono text-[#174C3C]">{getCurrentStudent()}</strong></span>
                  <button
                    type="button"
                    onClick={handleSaveToJournal}
                    className="min-h-[44px] px-5 py-2.5 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-[#D6AA55]" />
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
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#174C3C]">
                      Thu âm trực tiếp từ microphone hoặc Nhập tệp âm thanh ngoại vi
                    </h3>
                    <p className="text-xs text-[#556D65] mt-0.5">
                      Hỗ trợ microphone điện thoại/máy tính hoặc nhập tệp WAV/MP3 từ thiết bị ghi âm chuyên dụng.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="min-h-[44px] px-4 py-2.5 bg-[#A94438] hover:bg-[#8D372C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-98"
                      >
                        <Mic className="w-4 h-4" /> Bắt đầu ghi âm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="min-h-[44px] px-4 py-2.5 bg-[#20332D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 animate-pulse shadow-xs"
                      >
                        <Square className="w-4 h-4 text-[#A94438]" /> Dừng ghi âm
                      </button>
                    )}

                    {/* File upload input */}
                    <label className="min-h-[44px] px-4 py-2.5 bg-[#FAF7F0] hover:bg-white text-[#20332D] border border-[#E8E2D5] rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-2xs">
                      <Upload className="w-4 h-4 text-[#174C3C]" /> Nhập tệp WAV/MP3
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
                <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs text-[#20332D] flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent_check"
                    checked={realMetadata.consentConfirmed}
                    onChange={(e) =>
                      setRealMetadata((prev) => ({ ...prev, consentConfirmed: e.target.checked }))
                    }
                    className="mt-0.5 text-[#174C3C] rounded focus:ring-[#174C3C]"
                  />
                  <label htmlFor="consent_check" className="cursor-pointer leading-relaxed">
                    <strong>Xác nhận quyền tư liệu văn hóa bản địa:</strong> Dữ liệu âm thanh được đo đạc với sự đồng thuận, phục vụ mục đích học tập STEM và nghiên cứu di sản; ứng dụng không gửi bản ghi âm cá nhân lên đám mây.
                  </label>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-[#556D65] font-semibold">Mã mẫu đo:</label>
                    <input
                      type="text"
                      value={realMetadata.sampleCode}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, sampleCode: e.target.value }))
                      }
                      className="w-full mt-1 p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] font-mono text-xs text-[#20332D] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[#556D65] font-semibold">Khoảng cách micro (cm):</label>
                    <input
                      type="number"
                      value={realMetadata.distanceCm}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, distanceCm: parseInt(e.target.value) || 0 }))
                      }
                      className="w-full mt-1 p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] font-mono text-xs text-[#20332D]"
                    />
                  </div>
                  <div>
                    <label className="text-[#556D65] font-semibold">Kỹ thuật gõ / Vị trí gõ:</label>
                    <input
                      type="text"
                      value={realMetadata.strikeMethod}
                      onChange={(e) =>
                        setRealMetadata((prev) => ({ ...prev, strikeMethod: e.target.value }))
                      }
                      className="w-full mt-1 p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs text-[#20332D]"
                    />
                  </div>
                </div>

                {/* Audio playback & status */}
                {audioUrl && (
                  <div className="flex items-center justify-between p-3.5 bg-[#EBF2EE] rounded-xl border border-[#174C3C]/30 text-xs">
                    <div className="flex items-center gap-3">
                      <audio ref={audioElementRef} src={audioUrl} className="hidden" />
                      <button
                        type="button"
                        onClick={handlePlayRealAudio}
                        className="min-h-[40px] px-4 py-2 bg-[#174C3C] text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#11382C] transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-[#D6AA55]" /> Nghe lại bản ghi
                      </button>
                      <span className="text-[#174C3C] font-mono font-semibold">
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
                      className="text-[#556D65] hover:text-[#A94438] font-semibold"
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
                    <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
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
                    <div className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                          Các đỉnh phổ nhận diện (Peaks Detected)
                        </h4>
                        <span className="text-xs font-mono text-[#174C3C] font-bold">
                          Δf = {realAnalysis.freqResolution} Hz
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-[#E8E2D5]">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#174C3C]">
                            <tr>
                              <th className="py-2 px-2.5 font-bold">Đỉnh</th>
                              <th className="py-2 px-2.5 font-bold">Tần số (Hz)</th>
                              <th className="py-2 px-2.5 font-bold">Biên độ (dB)</th>
                              <th className="py-2 px-2.5 font-bold">Tỉ số fi / f1</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E2D5] font-mono">
                            {realAnalysis.peaks.map((p, idx) => {
                              const ratio =
                                realAnalysis.peaks[0]?.frequency > 0
                                  ? (p.frequency / realAnalysis.peaks[0].frequency).toFixed(2)
                                  : '1.00';
                              return (
                                <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                                  <td className="py-2 px-2.5 font-sans font-bold text-[#20332D]">
                                    f{idx + 1}
                                  </td>
                                  <td className="py-2 px-2.5 text-[#174C3C] font-bold">
                                    {p.frequency} Hz
                                  </td>
                                  <td className="py-2 px-2.5 text-[#556D65]">{p.magnitude} dB</td>
                                  <td className="py-2 px-2.5 text-[#20332D] font-semibold">
                                    {idx === 0 ? '1.00 (gốc)' : ratio}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs text-[#20332D] space-y-1">
                        <div className="font-bold text-[#174C3C]">Nhận xét âm học di sản:</div>
                        <p className="leading-relaxed text-[#556D65]">
                          Tỉ số các đỉnh phổ {realAnalysis.peaks.slice(1).map((p, i) => `f${i + 2}/f1 = ${(p.frequency / (realAnalysis.peaks[0]?.frequency || 1)).toFixed(2)}`).join(', ')} không trùng với dãy số nguyên 2, 3, 4, 5. Điều này minh chứng tính chất phi điều hòa đặc trưng của cồng chiêng kim loại đúc thủ công.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleExportRealCSV}
                          className="w-full min-h-[44px] py-2.5 bg-white hover:bg-[#FAF7F0] text-[#20332D] border border-[#E8E2D5] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
                        >
                          <Download className="w-4 h-4 text-[#174C3C]" />
                          Xuất dữ liệu phổ ra CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveToJournal}
                          className="w-full min-h-[44px] py-2.5 bg-[#174C3C] text-white rounded-xl text-xs font-bold hover:bg-[#11382C] transition-all flex items-center justify-center gap-2 shadow-xs"
                        >
                          <FileText className="w-4 h-4 text-[#D6AA55]" />
                          Lưu vào Nhật ký nghiên cứu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-[#FAF7F0] border border-dashed border-[#E8E2D5] rounded-2xl text-xs text-[#556D65]">
                  Chưa có tín hiệu âm thanh nào được phân tích. Hãy nhấn <strong>Bắt đầu ghi âm</strong> hoặc <strong>Nhập tệp WAV/MP3</strong> để hiển thị phổ FFT.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Data Analysis */}
      {activeStep === 5 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#174C3C]">Bảng dữ liệu lặp đo & Phân tích phổ</h2>
              <p className="text-xs text-[#556D65]">Đối chiếu các mode dao động và đánh giá thời gian suy giảm năng lượng T60.</p>
            </div>
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
              className="min-h-[40px] px-3.5 py-2 border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#20332D] hover:bg-[#FAF7F0] flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#174C3C]" /> Xuất bảng CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E8E2D5]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#174C3C]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Mode dao động</th>
                  <th className="py-2.5 px-3 font-bold">Tần số f (Hz)</th>
                  <th className="py-2.5 px-3 font-bold">Hệ số suy giảm λ (s⁻¹)</th>
                  <th className="py-2.5 px-3 font-bold">Tỉ số fᵢ / f₁</th>
                  <th className="py-2.5 px-3 font-bold">Thời gian tắt T60 (s)</th>
                  <th className="py-2.5 px-3 font-bold">Ý nghĩa vật lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5] font-mono">
                {modes.map((m, idx) => {
                  const ratio = (m.frequency / modes[0].frequency).toFixed(2);
                  const t60 = (6.9 / m.decay).toFixed(2);
                  return (
                    <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                      <td className="py-2.5 px-3 font-sans font-bold text-[#20332D]">{m.name}</td>
                      <td className="py-2.5 px-3 font-bold text-[#174C3C]">{m.frequency} Hz</td>
                      <td className="py-2.5 px-3 text-[#556D65]">{m.decay} s⁻¹</td>
                      <td className="py-2.5 px-3 text-[#20332D]">{idx === 0 ? '1.00 (cơ bản)' : ratio}</td>
                      <td className="py-2.5 px-3 text-[#A94438] font-bold">{t60} s</td>
                      <td className="py-2.5 px-3 font-sans text-[#556D65] text-[11px]">
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

          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E2D5] text-xs text-[#20332D] space-y-2">
            <h3 className="font-bold text-[#174C3C] uppercase tracking-wider">
              Kết luận từ dữ liệu thực nghiệm:
            </h3>
            <p className="leading-relaxed">
              1. <strong>Tính phi điều hòa:</strong> Tỉ số f2/f1 ≈ 1.56 và f3/f1 ≈ 2.52 không phải là số nguyên như dây đàn hay cột khí sáo trúc. Đây là bản chất dao động 2 chiều của màng kim loại tròn có gờ.
            </p>
            <p className="leading-relaxed">
              2. <strong>Suy giảm có chọn lọc:</strong> Các mode tần số cao có hệ số suy giảm λ lớn hơn, tắt nhanh hơn nhiều so với mode cơ bản f1, giải thích vì sao tiếng chiêng lúc mới gõ nghe keng đanh, nhưng sau vài giây chỉ còn lại âm trầm rền ngân dài.
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="min-h-[44px] px-5 py-2 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs font-semibold hover:bg-[#FAF7F0]"
            >
              ← Quay lại Thí nghiệm
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="min-h-[44px] px-5 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold hover:bg-[#11382C] shadow-xs"
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
            Thử thách thám tử âm học di sản
          </div>
          <h2 className="text-xl font-bold text-[#174C3C]">{station.steps.challenge.title}</h2>
          <p className="text-sm text-[#20332D] leading-relaxed">{station.steps.challenge.scenario}</p>

          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E8E2D5]">
            <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider mb-2">
              Tiêu chí đánh giá lập luận khoa học:
            </h3>
            <ul className="space-y-2 text-xs text-[#20332D]">
              {station.steps.challenge.criteria.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#20332D]">
              {station.steps.challenge.task}
            </label>
            <textarea
              value={challengeAnswers}
              onChange={(e) => setChallengeAnswers(e.target.value)}
              placeholder="Nhập câu trả lời của bạn: So sánh đỉnh phổ của Chiêng A vs Chiêng B, giải thích sự khác biệt dựa trên vị trí gõ và dùi gõ..."
              rows={4}
              className="w-full text-xs p-3.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="min-h-[44px] px-5 py-2 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs font-semibold hover:bg-[#FAF7F0]"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="min-h-[44px] px-5 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold hover:bg-[#11382C] shadow-xs"
            >
              Chuyển sang Bước 7: Phản tư & Di sản →
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Reflection */}
      {activeStep === 7 && (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#174C3C] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#D6AA55]" />
            Phản tư khoa học & Kết nối tri thức bản địa Mường
          </div>

          <div className="space-y-3">
            {station.steps.reflection.questions.map((q, idx) => (
              <div key={idx} className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs">
                <strong className="text-[#174C3C]">{idx + 1}. {q}</strong>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#EBF2EE] rounded-xl border border-[#174C3C]/30 text-xs text-[#20332D] space-y-1.5">
            <div className="font-bold text-[#174C3C] uppercase tracking-wider">
              Ý nghĩa văn hóa bản địa:
            </div>
            <p className="leading-relaxed">{station.steps.reflection.culturalConnection}</p>
          </div>

          <div className="p-4 bg-[#FBF0EE] rounded-xl border border-[#A94438]/30 text-xs text-[#20332D] space-y-1.5">
            <div className="font-bold text-[#A94438] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#A94438]" />
              Giới hạn vật lý & Sai số đo đạc:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[#556D65]">
              {station.steps.reflection.physicalLimitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-[#20332D]">
              Ghi lại cảm nhận và suy nghĩ của bạn:
            </label>
            <textarea
              value={reflectionAnswers}
              onChange={(e) => setReflectionAnswers(e.target.value)}
              placeholder="Nhập phản tư của bạn về mối liên hệ giữa vật lý âm học và bàn tay tài hoa của nghệ nhân đúc chiêng..."
              rows={3}
              className="w-full text-xs p-3.5 rounded-xl border border-[#E8E2D5] bg-[#FAF7F0] focus:ring-2 focus:ring-[#174C3C] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="min-h-[44px] px-5 py-2 border border-[#E8E2D5] text-[#20332D] rounded-xl text-xs font-semibold hover:bg-[#FAF7F0]"
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={handleSaveToJournal}
              className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] text-white rounded-xl text-xs font-bold hover:bg-[#11382C] flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D6AA55]" />
              Hoàn thành trạm & Lưu vào Nhật ký
            </button>
          </div>
        </div>
      )}

      {/* Scientific Basis Drawer / Accordion at bottom */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 text-xs text-[#20332D] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
          <span className="font-bold text-[#174C3C] uppercase tracking-wider text-xs">
            Cơ sở khoa học, Giả định & Nguồn tham khảo (Trạm 01: Chiêng Mường)
          </span>
          <span className="font-mono text-[#556D65] text-[11px]">Tư liệu Dân tộc học & Âm học</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <div className="font-bold text-[#174C3C]">Nguyên lý cốt lõi:</div>
            <ul className="list-disc pl-4 space-y-1 text-[#556D65]">
              {station.scientificBasis.principles.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-[#174C3C]">Giả định mô hình:</div>
            <ul className="list-disc pl-4 space-y-1 text-[#556D65]">
              {station.scientificBasis.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8E2D5] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#556D65]">
          <div>
            <strong>Tài liệu tham khảo:</strong> {station.scientificBasis.references.join(' · ')}
          </div>
          <div className="text-[#A94438] font-medium">
            <strong>An toàn:</strong> {station.scientificBasis.safetyNotes.join(' ')}
          </div>
        </div>
      </div>
    </div>
  );
};
