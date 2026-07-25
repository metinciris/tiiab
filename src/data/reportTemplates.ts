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
  return Array.from(
    new Set(option.variants.map(cleanSourceText).filter(Boolean)),
  );
}

function toOption(sheet: string, row: SourceRow, option: SourceOption): ReportOption {
  const variants = normalizeVariants(option);
  return {
    id: `${sheet}-${row.row}-${option.cell}`,
    label: cleanSourceText(option.label),
    variants,
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

function sectionTitle(row: SourceRow, fallback: string): string {
  return row.label?.trim() || fallback;
}

function sourceSections(sheet: 'tiiab' | 'LAP'): ReportSection[] {
  return source[sheet].map((row) => ({
    id: `${sheet}-${row.row}`,
    title: sectionTitle(row, row.row === 2 ? 'Tanı' : `Bölüm ${row.row}`),
    exclusive: row.row === 2,
    options: row.row === 2
      ? dedupeOptions(row.options.map((option) => toOption(sheet, row, option)))
      : row.options.map((option) => toOption(sheet, row, option)),
  }));
}

const tiiabSections = sourceSections('tiiab');
const lapSections = sourceSections('LAP');

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

const paratiroidAllowedCells = new Set([
  'E2', 'W2',
  'M3', 'O3', 'Q3', 'S3', 'U3', 'W3', 'Y3', 'AA3', 'AC3', 'AE3', 'AG3', 'AI3', 'AK3',
  'E4', 'G4', 'I4', 'K4', 'M4', 'R4', 'Z4', 'AA4', 'AH4', 'AI4', 'AJ4', 'AK4',
  'E5', 'G5', 'I5', 'K5', 'M5', 'N5', 'O5', 'P5', 'Q5',
  'E6', 'G6', 'I6', 'K6', 'M6', 'O6', 'Q6', 'S6', 'V6', 'W6', 'X6', 'Y6', 'Z6', 'AA6',
  'E7', 'G7', 'I7', 'J7', 'K7', 'L7', 'M7', 'P7', 'Q7', 'T7', 'U7', 'V7', 'W7', 'X7', 'Y7', 'Z7', 'AA7', 'AB7', 'AC7', 'AD7', 'AE7', 'AF7', 'AG7', 'AH7', 'AI7', 'AJ7', 'AK7',
  'E8', 'G8', 'I8', 'K8', 'M8', 'N8', 'O8', 'P8', 'Q8', 'R8', 'S8', 'T8', 'U8', 'V8', 'W8', 'X8', 'Y8',
]);

function paratiroidSectionsFromLap(): ReportSection[] {
  const sections = source.LAP.map((row) => {
    const options = row.options
      .filter((option) => paratiroidAllowedCells.has(option.cell))
      .map((option) => toOption('paratiroid', row, option));
    return {
      id: `paratiroid-${row.row}`,
      title: sectionTitle(row, row.row === 2 ? 'Tanı' : `Bölüm ${row.row}`),
      exclusive: row.row === 2,
      options: dedupeOptions(options),
    } satisfies ReportSection;
  }).filter((section) => section.options.length > 0);

  const diagnosis = sections[0];
  diagnosis.title = 'Tanı';
  diagnosis.options = [
    {
      id: 'paratiroid-diagnosis-nondiagnostic',
      label: 'Nondiagnostik sitoloji',
      variants: ['Nondiagnostik sitoloji'],
    },
    {
      id: 'paratiroid-diagnosis-compatible',
      label: 'Paratiroid benzeri hücre grupları',
      variants: ['Paratiroid benzeri hücre grupları'],
    },
    {
      id: 'paratiroid-diagnosis-indeterminate',
      label: 'Tirosit–paratiroid ayrımı yapılamayan hücreler',
      variants: ['Tirosit–paratiroid ayrımı yapılamayan hücreler'],
    },
    {
      id: 'paratiroid-diagnosis-suspicious',
      label: 'Malignite yönünden kuşkulu sitoloji',
      variants: ['Malignite yönünden kuşkulu sitoloji'],
      tumorRelated: true,
    },
  ];
  return sections;
}

export const templates: Record<ReportMode, ReportTemplate> = {
  tiiab: {
    mode: 'tiiab',
    title: 'Tiroid İnce İğne Aspirasyon Biyopsisi',
    shortTitle: 'TİİAB',
    defaultLocation: 'Tiroid',
    specimenText: (location) => `${location}; İnce iğne aspirasyon biyopsisi; sıvı bazlı sitoloji`,
    sections: tiiabSections,
  },
  lap: {
    mode: 'lap',
    title: 'Lenf Nodu İnce İğne Aspirasyon Biyopsisi',
    shortTitle: 'LAP',
    defaultLocation: 'Lenf nodu',
    specimenText: (location) => `${location}: Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma`,
    sections: lapSections,
  },
  paratiroid: {
    mode: 'paratiroid',
    title: 'Paratiroid İnce İğne Aspirasyon Biyopsisi',
    shortTitle: 'Paratiroid',
    defaultLocation: 'Paratiroid loju',
    specimenText: (location) => `${location}: Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma`,
    sections: paratiroidSectionsFromLap(),
  },
};

export function getTemplate(mode: ReportMode): ReportTemplate {
  return templates[mode];
}
