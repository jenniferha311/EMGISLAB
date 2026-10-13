import { ResearchLogEntry, RubricEvaluation, PrePostSurveyRecord, AudioSampleRecord } from '../types';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'emgis_current_student',
  RESEARCH_LOGS: 'emgis_research_logs',
  RUBRIC_EVALS: 'emgis_rubric_evals',
  PRE_POST_SURVEYS: 'emgis_surveys',
  AUDIO_RECORDS: 'emgis_audio_records',
  COMPLETED_STATIONS: 'emgis_completed_stations',
};

// Initial default student
export function getCurrentStudent(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT) || 'HS-TD-101';
  } catch {
    return 'HS-TD-101';
  }
}

export function setCurrentStudent(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, code.trim().toUpperCase());
  } catch (e) {
    console.error('Failed to set student code', e);
  }
}

// Research Logs
export function getResearchLogs(): ResearchLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESEARCH_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveResearchLog(entry: Omit<ResearchLogEntry, 'id' | 'timestamp'>): ResearchLogEntry {
  const logs = getResearchLogs();
  const newEntry: ResearchLogEntry = {
    ...entry,
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  try {
    localStorage.setItem(STORAGE_KEYS.RESEARCH_LOGS, JSON.stringify(logs));
    markStationCompleted(entry.stationId);
  } catch (e) {
    console.error('Failed to save log', e);
  }
  return newEntry;
}

export function deleteResearchLog(id: string): void {
  const logs = getResearchLogs().filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.RESEARCH_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to delete log', e);
  }
}

// Completed Stations Tracker
export function getCompletedStations(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_STATIONS);
    return raw ? JSON.parse(raw) : [1];
  } catch {
    return [1];
  }
}

export function markStationCompleted(stationId: number): void {
  try {
    const set = new Set(getCompletedStations());
    set.add(stationId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_STATIONS, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error(e);
  }
}

// Rubric Evaluations
export function getRubricEvaluations(): RubricEvaluation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUBRIC_EVALS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRubricEvaluation(evalItem: Omit<RubricEvaluation, 'id' | 'date'>): RubricEvaluation {
  const list = getRubricEvaluations();
  const newEval: RubricEvaluation = {
    ...evalItem,
    id: 'rubric_' + Date.now(),
    date: new Date().toISOString().split('T')[0],
  };
  list.unshift(newEval);
  try {
    localStorage.setItem(STORAGE_KEYS.RUBRIC_EVALS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
  return newEval;
}

// Pre-Post Survey Records
export function getSurveyRecords(): PrePostSurveyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRE_POST_SURVEYS);
    return raw ? JSON.parse(raw) : [
      {
        id: 'survey_demo_1',
        studentCode: 'HS-TD-101',
        phase: 'T0',
        date: '2026-09-10',
        stemInterestScore: 3.2,
        culturalPrideScore: 3.5,
        scientificInquiryScore: 2.8,
        experimentalCompetenceScore: 2.6,
        notes: 'Khảo sát đầu vào trước khóa học'
      },
      {
        id: 'survey_demo_2',
        studentCode: 'HS-TD-101',
        phase: 'T1',
        date: '2026-10-05',
        stemInterestScore: 4.1,
        culturalPrideScore: 4.4,
        scientificInquiryScore: 3.9,
        experimentalCompetenceScore: 3.7,
        notes: 'Đánh giá sau khi hoàn thành 5 trạm thực nghiệm'
      }
    ];
  } catch {
    return [];
  }
}

export function saveSurveyRecord(record: Omit<PrePostSurveyRecord, 'id' | 'date'>): PrePostSurveyRecord {
  const list = getSurveyRecords();
  const newRecord: PrePostSurveyRecord = {
    ...record,
    id: 'survey_' + Date.now(),
    date: new Date().toISOString().split('T')[0],
  };
  list.unshift(newRecord);
  try {
    localStorage.setItem(STORAGE_KEYS.PRE_POST_SURVEYS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
  return newRecord;
}

// Audio Records
export function getAudioRecords(): AudioSampleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO_RECORDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAudioRecord(record: AudioSampleRecord): void {
  const list = getAudioRecords();
  list.unshift(record);
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIO_RECORDS, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

// Export utilities
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(v => typeof v === 'string' && (v.includes(',') || v.includes('\n')) ? `"${v.replace(/"/g, '""')}"` : v).join(','))
  ].join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename: string, data: unknown): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
