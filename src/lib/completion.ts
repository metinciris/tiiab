import { getTemplate } from '../data/reportTemplates';
import type { ReportSection, Sample } from '../types';

function sectionHasContent(sample: Sample, section: ReportSection): boolean {
  return section.options.some((option) => sample.selections[option.id] !== undefined)
    || Boolean(sample.sectionNotes?.[section.id]?.trim());
}

function diagnosisHasContent(sample: Sample): boolean {
  const diagnosis = getTemplate(sample.mode).sections.find((section) => section.exclusive);
  if (!diagnosis) return false;
  return sectionHasContent(sample, diagnosis) || Boolean(sample.diagnosisNote.trim());
}

export function requiredMicroscopySections(sample: Sample): ReportSection[] {
  return getTemplate(sample.mode).sections.filter((section) => (
    !section.exclusive
    && section.title.toLocaleLowerCase('tr-TR') !== 'hücre bloğu'
    && !section.id.endsWith('-extra')
  ));
}

export function getMissingSections(sample: Sample): string[] {
  const missing = requiredMicroscopySections(sample)
    .filter((section) => !sectionHasContent(sample, section))
    .map((section) => section.title);

  return diagnosisHasContent(sample) ? missing : ['Tanı', ...missing];
}

export function isSampleComplete(sample: Sample): boolean {
  const microscopySections = requiredMicroscopySections(sample);
  return diagnosisHasContent(sample)
    && microscopySections.length > 0
    && microscopySections.every((section) => sectionHasContent(sample, section));
}
