import type { AppState, ReportMode, Sample, SelectionState } from '../types';
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
    sectionNotes: {},
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

function migrateParatiroidSelections(selections: SelectionState): SelectionState {
  const migrated: SelectionState = {};
  Object.entries(selections ?? {}).forEach(([key, value]) => {
    if (key.startsWith('paratiroid-')) migrated[key.replace(/^paratiroid-/, 'LAP-')] = value;
    else migrated[key] = value;
  });
  return migrated;
}

type StoredSample = Omit<Partial<Sample>, 'mode'> & { mode?: string };

function migrateSample(sample: StoredSample, index: number): Sample {
  const mode: ReportMode = sample.mode === 'tiiab' ? 'tiiab' : 'lap';
  const selections = sample.mode === 'paratiroid'
    ? migrateParatiroidSelections(sample.selections ?? {})
    : (sample.selections ?? {});

  return {
    id: sample.id || createId(),
    number: index + 1,
    mode,
    location: sample.location || getTemplate(mode).defaultLocation,
    selections,
    sectionNotes: sample.sectionNotes ?? {},
    diagnosisNote: sample.diagnosisNote ?? '',
    microscopyNote: sample.microscopyNote ?? '',
    copiedAt: sample.copiedAt,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState> & { samples?: StoredSample[] };
    if (parsed.version !== 1 || !Array.isArray(parsed.samples) || parsed.samples.length === 0) return createInitialState();

    const samples = parsed.samples.map(migrateSample);
    const activeSampleId = samples.some((sample) => sample.id === parsed.activeSampleId)
      ? String(parsed.activeSampleId)
      : samples[0].id;

    return {
      version: 1,
      samples,
      activeSampleId,
      stainCountOverride: typeof parsed.stainCountOverride === 'number' ? parsed.stainCountOverride : null,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
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