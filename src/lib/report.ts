import { getTemplate } from '../data/reportTemplates';
import type { AppState, ReportOption, ReportSection, Sample } from '../types';

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

export function sentence(value: string): string {
  const clean = normalizeText(value);
  if (!clean) return '';
  return /[.!?;:]$/.test(clean) ? clean : `${clean}.`;
}

function stripTerminalPunctuation(value: string): string {
  return normalizeText(value).replace(/[.!?;:,]+$/g, '').trim();
}

function startsWithProtectedToken(value: string): boolean {
  return /^[a-zçğıöşü]\d/u.test(value) || /^[A-ZÇĞİÖŞÜ]{2,}(?:\s|[-/]|$)/u.test(value);
}

function upperInitial(value: string): string {
  if (!value || startsWithProtectedToken(value)) return value;
  const characters = Array.from(value);
  return `${characters[0].toLocaleUpperCase('tr-TR')}${characters.slice(1).join('')}`;
}

function lowerInitial(value: string): string {
  if (!value || startsWithProtectedToken(value)) return value;
  const characters = Array.from(value);
  return `${characters[0].toLocaleLowerCase('tr-TR')}${characters.slice(1).join('')}`;
}

function microscopySentence(values: string[]): string {
  const fragments = values.map(stripTerminalPunctuation).filter(Boolean);
  if (!fragments.length) return '';

  const ordered = fragments.map((fragment, index) => (
    index === 0 ? upperInitial(fragment) : lowerInitial(fragment)
  ));
  return `${ordered.join(', ')}.`;
}

export function selectedVariant(sample: Sample, option: ReportOption): string | null {
  const index = sample.selections[option.id];
  if (index === undefined || index < 0 || index >= option.variants.length) return null;
  return option.variants[index];
}

export function selectedOutput(sample: Sample, option: ReportOption): string | null {
  const variant = selectedVariant(sample, option);
  if (!variant) return null;
  return option.outputByVariant?.[variant] ?? variant;
}

export function sampleHasContent(sample: Sample): boolean {
  return Object.keys(sample.selections).length > 0
    || Object.values(sample.sectionNotes ?? {}).some((value) => Boolean(value.trim()))
    || Boolean(sample.diagnosisNote.trim())
    || Boolean(sample.microscopyNote.trim());
}

function isCellBlockSection(section: ReportSection): boolean {
  return section.title.toLocaleLowerCase('tr-TR') === 'hücre bloğu';
}

function isCustomLocation(sample: Sample, location: string): boolean {
  const standardLocations = sample.mode === 'tiiab' ? ['Tiroid'] : ['Lenf nodu', 'Tiroid loju', 'Paratiroid'];
  return Boolean(location) && !standardLocations.includes(location);
}

function specimenLine(sample: Sample, location: string, sampleCount: number): string {
  const template = getTemplate(sample.mode);
  const isMultiple = sampleCount > 1;
  const prefix = isMultiple ? `${sample.number}- ` : '';

  if (!isCustomLocation(sample, location)) {
    const sampleNumber = isMultiple ? `(Örnek NO:${sample.number}) ` : '';
    return `${prefix}${sampleNumber}${template.specimenText(location || template.defaultLocation)}`;
  }

  const quotedLocation = location.replace(/"/g, '\\"');
  const locationField = isMultiple
    ? `(Örnek NO:${sample.number}, "${quotedLocation}")`
    : `("${quotedLocation}")`;

  if (sample.mode === 'tiiab') {
    return `${prefix}${locationField} Tiroid; İnce iğne aspirasyon biyopsisi; sıvı bazlı sitoloji`;
  }
  return `${prefix}${locationField} Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma`;
}

export function generateSampleReportBody(sample: Sample, sampleCount = 1): string {
  const template = getTemplate(sample.mode);
  const diagnosisSection = template.sections.find((section) => section.exclusive);
  const microscopySections = template.sections.filter((section) => !section.exclusive);

  const diagnosis = diagnosisSection?.options
    .map((option) => selectedOutput(sample, option))
    .filter((value): value is string => Boolean(value)) ?? [];
  const diagnosisSectionNote = diagnosisSection ? sample.sectionNotes?.[diagnosisSection.id]?.trim() : '';
  const diagnosisText = [...diagnosis, diagnosisSectionNote, sample.diagnosisNote.trim()]
    .filter(Boolean)
    .map(sentence)
    .join(' ');

  const location = sample.location.trim() || template.defaultLocation;
  const firstLine = specimenLine(sample, location, sampleCount);
  const lines: string[] = [diagnosisText ? `${firstLine}: ${diagnosisText}` : firstLine];

  const microscopyLines = microscopySections.flatMap((section) => {
    const values = section.options
      .map((option) => selectedOutput(sample, option))
      .filter((value): value is string => Boolean(value));
    const sectionNote = sample.sectionNotes?.[section.id]?.trim();
    const combined = [...values, sectionNote].filter((value): value is string => Boolean(value));
    const combinedText = microscopySentence(combined);
    if (!combinedText) return [];

    if (isCellBlockSection(section)) return [`   - Hücre bloğu: ${combinedText}`];
    return [`   - ${section.title}: ${combinedText}`];
  });

  if (microscopyLines.length || sample.microscopyNote.trim()) {
    lines.push(...microscopyLines);
    if (sample.microscopyNote.trim()) lines.push(`   - Ek not: ${microscopySentence([sample.microscopyNote])}`);
  }

  return lines.join('\n').trim();
}

export function automaticStainCount(sampleCount: number): number {
  if (sampleCount <= 0) return 0;
  if (sampleCount === 1) return 3;
  if (sampleCount === 2) return 6;
  if (sampleCount === 3) return 9;
  return 10;
}

export function generateStainText(sampleCount: number, override: number | null): string {
  const count = override ?? automaticStainCount(sampleCount);
  return `Ayırıcı tanı amacıyla ${count} adet histokimyasal boya: Papanicolaou, Giemsa, ayrıca Hematoksilen Eozin çalışılmıştır. Örnekler, direkt yayma ve SurePath sıvı bazlı yöntemle değerlendirilmiştir.`;
}

function appendStains(reportBody: string, sampleCount: number, override: number | null): string {
  return `${reportBody}\n\n\n\nEK BOYALAR\n${generateStainText(sampleCount, override)}`;
}

export function generateSampleReport(sample: Sample, sampleCount = 1, override: number | null = null): string {
  return appendStains(generateSampleReportBody(sample, sampleCount), sampleCount, override);
}

export function generateAllReports(state: AppState): string {
  const reports = state.samples
    .filter(sampleHasContent)
    .map((sample) => generateSampleReportBody(sample, state.samples.length));
  const reportBody = reports.length
    ? reports.join('\n\n')
    : generateSampleReportBody(state.samples[0], state.samples.length);
  return appendStains(reportBody, state.samples.length, state.stainCountOverride);
}
