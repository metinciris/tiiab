import type { AppState, ReportMode, Sample } from '../types';
import { getTemplate } from '../data/reportTemplates';

const STORAGE_KEY = 'tiiab-raporlama-state-v1';

export function createId(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createSample(number: number, mode: ReportMode = 'tiiab'): Sample {
  return {
    id: createId(),
    number,
    mode,
    location: getTemplate(mode).defaultLocation,
    selections: {},
    diagnosisNote: '',
    microscopyNote: '',
  };
}

export function createInitialState(): AppState {
  const first = createSample(1);
  return {
    version: 1,
    samples: [first],
    activeSampleId: first.id,
    stainCountOverride: null,
    updatedAt: new Date().toISOString(),
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1 || !Array.isArray(parsed.samples) || parsed.samples.length === 0) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearSavedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
