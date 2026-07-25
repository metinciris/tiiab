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

function specimenLine(sample: Sample, location: string): string {
  const template = getTemplate(sample.mode);
  if (!isCustomLocation(sample, location)) {
    return `${sample.number}- (Örnek NO:${sample.number}) ${template.specimenText(location || template.defaultLocation)}`;
  }
  const quotedLocation = location.replace(/"/g, '\\"');
  if (sample.mode === 'tiiab') {
    return `${sample.number}- (Örnek NO:${sample.number}, "${quotedLocation}") Tiroid; İnce iğne aspirasyon biyopsisi; sıvı bazlı sitoloji`;
  }
  return `${sample.number}- (Örnek NO:${sample.number}, "${quotedLocation}") Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma`;
}

export function generateSampleReportBody(sample: Sample): string {
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
  const firstLine = specimenLine(sample, location);
  const lines: string[] = [diagnosisText ? `${firstLine}: ${diagnosisText}` : firstLine];

  const microscopyLines = microscopySections.flatMap((section) => {
    const values = section.options
      .map((option) => selectedOutput(sample, option))
      .filter((value): value is string => Boolean(value));
    const sectionNote = sample.sectionNotes?.[section.id]?.trim();
    const combined = [...values, sectionNote].filter(Boolean).map(sentence);
    if (!combined.length) return [];

    if (isCellBlockSection(section)) return [`- Hücre bloğu: ${combined.join(' ')}`];
    return [`- ${section.title}: ${combined.join(' ')}`];
  });

  if (microscopyLines.length || sample.microscopyNote.trim()) {
    lines.push('', 'MİKROSKOPİ');
    lines.push(...microscopyLines);
    if (sample.microscopyNote.trim()) lines.push(`- Ek not: ${sentence(sample.microscopyNote)}`);
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
  return `${reportBody}\n\n\nEK BOYALAR\n${generateStainText(sampleCount, override)}`;
}

export function generateSampleReport(sample: Sample, sampleCount = 1, override: number | null = null): string {
  return appendStains(generateSampleReportBody(sample), sampleCount, override);
}

export function generateAllReports(state: AppState): string {
  const reports = state.samples.filter(sampleHasContent).map(generateSampleReportBody);
  const reportBody = reports.length ? reports.join('\n\n') : generateSampleReportBody(state.samples[0]);
  return appendStains(reportBody, state.samples.length, state.stainCountOverride);
}