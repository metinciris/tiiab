export type ReportMode = 'tiiab' | 'lap';

export type SourceOption = {
  cell: string;
  label: string;
  variants: string[];
  fill?: string | null;
};

export type SourceRow = {
  row: number;
  label: string | null;
  options: SourceOption[];
};

export type SourceWorkbook = Record<'tiiab' | 'LAP', SourceRow[]>;

export type ReportOption = {
  id: string;
  label: string;
  variants: string[];
  tumorRelated?: boolean;
  outputByVariant?: Record<string, string>;
};

export type ReportSection = {
  id: string;
  title: string;
  exclusive?: boolean;
  options: ReportOption[];
};

export type ReportTemplate = {
  mode: ReportMode;
  pageNumber: 1 | 2;
  pageLabel: string;
  title: string;
  shortTitle: string;
  defaultLocation: string;
  locationSuggestions: string[];
  specimenText: (location: string) => string;
  sections: ReportSection[];
};

export type SelectionState = Record<string, number>;
export type SectionNotes = Record<string, string>;

export type Sample = {
  id: string;
  number: number;
  mode: ReportMode;
  location: string;
  selections: SelectionState;
  sectionNotes: SectionNotes;
  diagnosisNote: string;
  microscopyNote: string;
  copiedAt?: string;
};

export type AppState = {
  version: 1;
  samples: Sample[];
  activeSampleId: string;
  stainCountOverride: number | null;
  updatedAt: string;
};