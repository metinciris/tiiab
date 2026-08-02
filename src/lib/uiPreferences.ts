export type UiPreferences = {
  stainOpen: boolean;
  specimenOpen: boolean;
};

const STORAGE_KEY = 'tiiab-ui-preferences-v1';

const DEFAULT_PREFERENCES: UiPreferences = {
  stainOpen: false,
  specimenOpen: true,
};

export function loadUiPreferences(): UiPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UiPreferences>;
    return {
      stainOpen: typeof parsed.stainOpen === 'boolean' ? parsed.stainOpen : DEFAULT_PREFERENCES.stainOpen,
      specimenOpen: typeof parsed.specimenOpen === 'boolean' ? parsed.specimenOpen : DEFAULT_PREFERENCES.specimenOpen,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUiPreferences(preferences: UiPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
