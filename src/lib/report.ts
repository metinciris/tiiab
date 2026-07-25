import { getTemplate } from '../data/reportTemplates';
import type { AppState, ReportOption, Sample } from '../types';

export function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
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
  return Object.keys(sample.selections).length > 0 || Boolean(sample.diagnosisNote.trim()) || Boolean(sample.microscopyNote.trim());
}

export function generateSampleReport(sample: Sample): string {
  const template = getTemplate(sample.mode);
  const diagnosisSection = template.sections.find((section) => section.exclusive);
  const microscopySections = template.sections.filter((section) => !section.exclusive);

  const diagnosis = diagnosisSection?.options
    .map((option) => selectedOutput(sample, option))
    .filter((value): value is string => Boolean(value)) ?? [];

  const lines: string[] = [];
  lines.push(`${sample.number}- (Örnek NO:${sample.number}) ${template.specimenText(sample.location.trim() || template.defaultLocation)}`);

  if (diagnosis.length || sample.diagnosisNote.trim()) {
    lines.push('', 'TANI');
    diagnosis.forEach((value) => lines.push(sentence(value)));
    if (sample.diagnosisNote.trim()) lines.push(sentence(sample.diagnosisNote));
  }

  const microscopyLines = microscopySections.flatMap((section) => {
    const values = section.options
      .map((option) => selectedOutput(sample, option))
      .filter((value): value is string => Boolean(value));
    if (!values.length) return [];
    return [`- ${section.title}: ${values.map(sentence).join(' ')}`];
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

export function generateAllReports(state: AppState): string {
  const reports = state.samples.filter(sampleHasContent).map(generateSampleReport);
  const stainText = generateStainText(state.samples.length, state.stainCountOverride);
  return [...reports, reports.length ? `EK BOYALAR\n${stainText}` : stainText].join('\n\n------------------------------\n\n');
}
