/**
 * Core type definitions for EMGIS LAB
 * All educational and cultural labels are gender-neutral and serve all students.
 */

export type STEMDomain = 
  | 'acoustics'      // Âm học & Sóng
  | 'mathematics'    // Toán & Hình học
  | 'mechanics'      // Cơ học & Cấu trúc
  | 'thermodynamics' // Nhiệt & Năng lượng
  | 'optics'         // Quang học & Hóa màu
  | 'environment'    // Môi trường & Khí hậu
  | 'biology';       // Sinh học & Sinh thái

export type DataBadgeType = 'MÔ PHỎNG' | 'ĐO THỰC TẾ' | 'DỮ LIỆU MINH HỌA';

export interface StationStepContent {
  context: {
    title: string;
    description: string;
    culturalDetails: string[];
    verifiedSources: string[];
    artisanNote?: string;
  };
  stemQuestion: {
    question: string;
    contextExplanation: string;
    subQuestions: string[];
  };
  prediction: {
    prompt: string;
    options: { id: string; label: string; explanation: string }[];
    openPrompt?: string;
  };
  challenge: {
    title: string;
    scenario: string;
    criteria: string[];
    task: string;
  };
  reflection: {
    questions: string[];
    culturalConnection: string;
    physicalLimitations: string[];
  };
}

export interface StationMeta {
  id: number;
  numberStr: string; // '01' - '16'
  title: string;
  subtitle: string;
  stemDomain: STEMDomain;
  stemDomainLabel: string;
  culturalHeritage: string;
  locationContext: string;
  keyFormula?: string;
  formulaDescription?: string;
  steps: StationStepContent;
  scientificBasis: {
    principles: string[];
    variables: { symbol: string; name: string; unit: string; range: string; description: string }[];
    assumptions: string[];
    limitations: string[];
    safetyNotes: string[];
    references: string[];
  };
}

export interface ResearchLogEntry {
  id: string;
  studentCode: string;
  stationId: number;
  stationTitle: string;
  timestamp: string;
  hypothesis: string;
  selectedPrediction?: string;
  changedVariables: Record<string, number | string>;
  recordedResults: Record<string, number | string>;
  observationNotes: string;
  reflectionAnswers: string;
  isVerifiedRealData: boolean;
}

export interface RubricEvaluation {
  id: string;
  studentCode: string;
  stationId: number;
  date: string;
  scores: {
    taskOwnership: number;       // 0-3: Chủ động nhận nhiệm vụ
    technicalHandling: number;   // 0-3: Thao tác kỹ thuật
    inquiryQuestioning: number;  // 0-3: Đặt câu hỏi
    solutionDesign: number;      // 0-3: Đề xuất giải pháp
    evidenceUse: number;         // 0-3: Dùng bằng chứng
    collaboration: number;       // 0-3: Hợp tác
    presentation: number;        // 0-3: Trình bày
  };
  teacherNotes?: string;
}

export interface PrePostSurveyRecord {
  id: string;
  studentCode: string;
  phase: 'T0' | 'T1' | 'T2'; // Trước can thiệp, Giữa can thiệp, Sau can thiệp
  date: string;
  stemInterestScore: number;       // 1-5
  culturalPrideScore: number;      // 1-5
  scientificInquiryScore: number;  // 1-5
  experimentalCompetenceScore: number; // 1-5
  notes?: string;
}

export interface AudioPeak {
  frequency: number; // Hz
  magnitude: number; // dB or normalized amplitude
  relativeDecay?: number; // ms
}

export interface AudioSampleRecord {
  id: string;
  sampleCode: string;
  title: string;
  timestamp: string;
  sourceType: 'synthetic' | 'mic_recording' | 'file_upload';
  sampleRate: number;
  durationSec: number;
  strikeZone: string;
  strikeTechnique: string;
  distanceCm?: number;
  peaks: AudioPeak[];
  spectralDataSummary?: {
    dominantFrequency: number;
    spectralCentroid: number;
    peakCount: number;
  };
  culturalConsentConfirmed: boolean;
  notes: string;
}
