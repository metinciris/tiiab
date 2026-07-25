import sourceJson from './sourceData.json';
import type {
  ReportMode,
  ReportOption,
  ReportSection,
  ReportTemplate,
  SourceOption,
  SourceRow,
  SourceWorkbook,
} from '../types';

const source = sourceJson as SourceWorkbook;

const tumorKeywords = [
  'malign',
  'papiller',
  'psödoinklüzyon',
  'groove',
  'nükleer membran düzensiz',
  'kohezyon kayb',
  'tall',
  'belirgin nükleer atipi',
  'mikrofolikül',
  'düzensiz yığılım',
  'psammom',
];

const benignKeywords = ['atipik hücre yok', 'atipik hücre görülmemiş', 'yok.'];

function isTumorRelated(option: SourceOption): boolean {
  const text = [option.label, ...option.variants].join(' ').toLocaleLowerCase('tr-TR');
  if (benignKeywords.some((word) => text.includes(word))) return false;
  return tumorKeywords.some((word) => text.includes(word));
}

const textCorrections: Array<[RegExp, string]> = [
  [/\bTriosit\b/g, 'Tirosit'],
  [/\bttirositler\b/gi, 'tirositler'],
  [/\bTiroistlerde\b/g, 'Tirositlerde'],
  [/\bpigmnet\b/gi, 'pigment'],
  [/grupdüzenli/gi, 'grup düzenli'],
  [/geliişim/gi, 'gelişim'],
  [/\bBir kaç\b/g, 'Birkaç'],
  [/\.\.+/g, '.'],
  [/^\./, ''],
];

function cleanSourceText(value: string): string {
  return textCorrections
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeVariants(option: SourceOption): string[] {
  return Array.from(new Set(option.variants.map(cleanSourceText).filter(Boolean)));
}

function toOption(sheet: string, row: SourceRow, option: SourceOption): ReportOption {
  return {
    id: `${sheet}-${row.row}-${option.cell}`,
    label: cleanSourceText(option.label),
    variants: normalizeVariants(option),
    tumorRelated: isTumorRelated(option),
  };
}

function dedupeOptions(options: ReportOption[]): ReportOption[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = option.label.toLocaleLowerCase('tr-TR');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sourceSections(sheet: 'tiiab' | 'LAP'): ReportSection[] {
  return source[sheet].map((row) => ({
    id: `${sheet}-${row.row}`,
    title: row.row === 2 ? 'Tanı' : (row.label?.trim() || `Bölüm ${row.row}`),
    exclusive: row.row === 2,
    options: row.row === 2
      ? dedupeOptions(row.options.map((option) => toOption(sheet, row, option)))
      : row.options.map((option) => toOption(sheet, row, option)),
  }));
}

const extraMicroscopyLabels = [
  'Preparat kalitesi değerlendirmeyi kısmen sınırlandırmaktadır.',
  'Kuruma artefaktı izlenmiştir.',
  'Kalın yayma alanları mevcuttur.',
  'Hücresel dejenerasyon belirgindir.',
  'Akut inflamatuvar hücreler izlenmiştir.',
  'Granülomatöz inflamasyon izlenmiştir.',
  'Nekrotik materyal izlenmiştir.',
  'Proteinöz materyal izlenmiştir.',
];

function createExtraMicroscopySection(prefix: 'tiiab' | 'LAP'): ReportSection {
  return {
    id: `${prefix}-extra`,
    title: 'Ek mikroskopik bulgular',
    exclusive: false,
    options: extraMicroscopyLabels.map((label, index) => ({
      id: `${prefix}-extra-${index + 1}`,
      label,
      variants: [label],
      tumorRelated: false,
    })),
  };
}

const tiiabSections = sourceSections('tiiab');
const lapSections = sourceSections('LAP');

tiiabSections.push(createExtraMicroscopySection('tiiab'));
lapSections.push(createExtraMicroscopySection('LAP'));

const tiiabDiagnosisOutput: Record<string, string> = {
  'tiiab-2-E2': 'Non-diagnostik sitoloji, Bethesda 1',
  'tiiab-2-G2': 'Kist içeriği, Bethesda 1',
  'tiiab-2-I2': 'Benign sitoloji, Bethesda 2',
  'tiiab-2-K2': 'Önemi belirsiz atipi, Bethesda 3, Nükleer',
  'tiiab-2-O2': 'Foliküler neoplazi şüphesi, Bethesda 4',
  'tiiab-2-Q2': 'MALİGNİTE YÖNÜNDEN KUŞKULU SİTOLOJİ, Bethesda 5. Tiroid papiller karsinom yönünden kuşkuludur',
  'tiiab-2-S2': 'MALİGN SİTOLOJİ, Bethesda 6. Tiroid papiller karsinom ile uyumlu',
};

const tiiabDiagnosis = tiiabSections[0];
tiiabDiagnosis.options = tiiabDiagnosis.options.map((option) => {
  if (option.id === 'tiiab-2-M2') {
    return {
      ...option,
      label: 'ÖBA-Y / ÖBA-Y+N',
      variants: ['ÖBA-Y', 'ÖBA-Y+N'],
      outputByVariant: {
        'ÖBA-Y': 'Önemi belirsiz atipi, Bethesda 3, Yapısal',
        'ÖBA-Y+N': 'Önemi belirsiz atipi, Bethesda 3, Nükleer ve Yapısal',
      },
    };
  }
  const output = tiiabDiagnosisOutput[option.id];
  return output ? { ...option, outputByVariant: { [option.variants[0]]: output } } : option;
});

const lapDiagnosis = lapSections[0];
const retainedLapDiagnosisIds = new Set([
  'LAP-2-E2',
  'LAP-2-I2',
  'LAP-2-M2',
  'LAP-2-O2',
  'LAP-2-Q2',
  'LAP-2-S2',
]);
const retainedLapDiagnoses = lapDiagnosis.options.filter((option) => retainedLapDiagnosisIds.has(option.id));
const benignDiagnosisIndex = retainedLapDiagnoses.findIndex((option) => option.id === 'LAP-2-I2');
retainedLapDiagnoses.splice(benignDiagnosisIndex + 1, 0, {
  id: 'LAP-2-LN-CONTENT',
  label: 'Lenf nodu içeriği ile uyumlu',
  variants: ['Lenf nodu içeriği ile uyumlu'],
  tumorRelated: false,
});
lapDiagnosis.options = retainedLapDiagnoses;

export const templates: Record<ReportMode, ReportTemplate> = {
  tiiab: {
    mode: 'tiiab',
    pageNumber: 1,
    pageLabel: 'Tiroid',
    title: 'Tiroid İnce İğne Aspirasyon Biyopsisi',
    shortTitle: '1. sayfa',
    defaultLocation: 'Tiroid',
    locationSuggestions: ['Tiroid'],
    specimenText: (location) => `${location}; İnce iğne aspirasyon biyopsisi; sıvı bazlı sitoloji`,
    sections: tiiabSections,
  },
  lap: {
    mode: 'lap',
    pageNumber: 2,
    pageLabel: 'Tiroid loju / Paratiroid / LAP',
    title: 'Tiroid loju, Paratiroid ve LAP Sitolojisi',
    shortTitle: '2. sayfa',
    defaultLocation: 'Lenf nodu',
    locationSuggestions: ['Lenf nodu', 'Tiroid loju', 'Paratiroid'],
    specimenText: (location) => `${location}: Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma`,
    sections: lapSections,
  },
};

export function getTemplate(mode: ReportMode): ReportTemplate {
  return templates[mode];
}
