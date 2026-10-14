import { ResearchLogEntry, RubricEvaluation, PrePostSurveyRecord, AudioSampleRecord } from '../types';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'emgis_current_student',
  RESEARCH_LOGS: 'emgis_research_logs',
  RUBRIC_EVALS: 'emgis_rubric_evals',
  PRE_POST_SURVEYS: 'emgis_surveys',
  AUDIO_RECORDS: 'emgis_audio_records',
  COMPLETED_STATIONS: 'emgis_completed_stations',
  VISITED_STATIONS: 'emgis_visited_stations',
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

// Helper to notify progress changes across all UI components
function dispatchProgressEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('emgis_progress_updated', {
      detail: {
        visited: getVisitedStations(),
        completed: getCompletedStations(),
      }
    }));
  }
}

// Visited Stations Tracker (1-16)
export function getVisitedStations(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITED_STATIONS);
    const parsed: number[] = raw ? JSON.parse(raw) : [1];
    const set = new Set<number>(Array.isArray(parsed) ? parsed : [1]);
    // Also any completed station is considered visited
    const completedRaw = localStorage.getItem(STORAGE_KEYS.COMPLETED_STATIONS);
    if (completedRaw) {
      const compArr: number[] = JSON.parse(completedRaw);
      compArr.forEach((id) => set.add(id));
    }
    // Also include any stations found in research logs
    const logs = getResearchLogs();
    logs.forEach((log) => {
      if (log.stationId) set.add(log.stationId);
    });
    // Ensure station IDs are within 1..16
    return Array.from(set).filter((id) => id >= 1 && id <= 16).sort((a, b) => a - b);
  } catch {
    return [1];
  }
}

export function markStationVisited(stationId: number): void {
  if (!stationId || stationId < 1 || stationId > 16) return;
  try {
    const current = getVisitedStations();
    const set = new Set(current);
    if (!set.has(stationId)) {
      set.add(stationId);
      localStorage.setItem(STORAGE_KEYS.VISITED_STATIONS, JSON.stringify(Array.from(set)));
      dispatchProgressEvent();
    }
  } catch (e) {
    console.error('Failed to mark station visited', e);
  }
}

// Completed Stations Tracker (1-16)
export function getCompletedStations(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_STATIONS);
    const parsed: number[] = raw ? JSON.parse(raw) : [1];
    const set = new Set<number>(Array.isArray(parsed) ? parsed : [1]);
    // Also include any stations found in research logs
    const logs = getResearchLogs();
    logs.forEach((log) => {
      if (log.stationId) set.add(log.stationId);
    });
    return Array.from(set).filter((id) => id >= 1 && id <= 16).sort((a, b) => a - b);
  } catch {
    return [1];
  }
}

export function markStationCompleted(stationId: number): void {
  if (!stationId || stationId < 1 || stationId > 16) return;
  try {
    // A completed station is definitely also visited
    const visitedSet = new Set(getVisitedStations());
    visitedSet.add(stationId);
    localStorage.setItem(STORAGE_KEYS.VISITED_STATIONS, JSON.stringify(Array.from(visitedSet)));

    const set = new Set(getCompletedStations());
    set.add(stationId);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_STATIONS, JSON.stringify(Array.from(set)));
    dispatchProgressEvent();
  } catch (e) {
    console.error('Failed to mark station completed', e);
  }
}

export function toggleStationCompleted(stationId: number): boolean {
  if (!stationId || stationId < 1 || stationId > 16) return false;
  try {
    const set = new Set(getCompletedStations());
    let isNowCompleted = false;
    if (set.has(stationId)) {
      set.delete(stationId);
      isNowCompleted = false;
    } else {
      set.add(stationId);
      isNowCompleted = true;
      // Also ensure it is marked visited
      const visitedSet = new Set(getVisitedStations());
      visitedSet.add(stationId);
      localStorage.setItem(STORAGE_KEYS.VISITED_STATIONS, JSON.stringify(Array.from(visitedSet)));
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETED_STATIONS, JSON.stringify(Array.from(set)));
    dispatchProgressEvent();
    return isNowCompleted;
  } catch (e) {
    console.error('Failed to toggle station completed', e);
    return false;
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
