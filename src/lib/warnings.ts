import { getTemplate } from '../data/reportTemplates';
import type { ReportOption, ReportSection, Sample } from '../types';
import { selectedOutput } from './report';

type SelectedFinding = {
  section: ReportSection;
  option: ReportOption;
  text: string;
};

function lower(value: string): string {
  return value.toLocaleLowerCase('tr-TR');
}

function isNegativeText(value: string): boolean {
  const text = lower(value);
  return /\b(yok|yoktur|görülmemiştir|görülmemiş|izlenmemiştir|izlenmemiş|saptanmamıştır|saptanmamış)\b/.test(text);
}

function isStandaloneNone(value: string): boolean {
  return /^yok[.!]?$/i.test(value.trim());
}

function selectedFindings(sample: Sample, section: ReportSection): SelectedFinding[] {
  return section.options.flatMap((option) => {
    const text = selectedOutput(sample, option);
    return text ? [{ section, option, text }] : [];
  });
}

function hasNegativeSubject(findings: SelectedFinding[], pattern: RegExp): boolean {
  return findings.some(({ text }) => pattern.test(lower(text)) && isNegativeText(text));
}

function hasPositiveSubject(findings: SelectedFinding[], pattern: RegExp): boolean {
  return findings.some(({ text }) => pattern.test(lower(text)) && !isNegativeText(text));
}

export function getSampleWarnings(sample: Sample): string[] {
  const template = getTemplate(sample.mode);
  const diagnosisSection = template.sections.find((section) => section.exclusive);
  const microscopySections = template.sections.filter((section) => !section.exclusive);
  const microscopyFindings = microscopySections.flatMap((section) => selectedFindings(sample, section));
  const warnings = new Set<string>();

  const diagnosisText = [
    ...(diagnosisSection ? selectedFindings(sample, diagnosisSection).map(({ text }) => text) : []),
    diagnosisSection ? sample.sectionNotes?.[diagnosisSection.id] ?? '' : '',
    sample.diagnosisNote,
  ].join(' ');
  const normalizedDiagnosis = lower(diagnosisText);
  const benignDiagnosis = /\bbenign\b|lenf nodu içeriği ile uyumlu/.test(normalizedDiagnosis);
  const malignantDiagnosis = /malign|kuşkulu/.test(normalizedDiagnosis);
  const tumorFindingSelected = microscopyFindings.some(({ option }) => option.tumorRelated);
  const noAtypiaSelected = microscopyFindings.some(({ text }) => /atipik hücre (yoktur|görülmemiştir|görülmemiş)/.test(lower(text)));

  if (benignDiagnosis && tumorFindingSelected) {
    warnings.add('Benign tanı ile malignite ilişkili mikroskopik bulgular birlikte seçildi.');
  }
  if (malignantDiagnosis && noAtypiaSelected) {
    warnings.add('Malign veya kuşkulu tanı ile “atipik hücre yoktur” ifadesi birlikte seçildi.');
  }

  microscopySections.forEach((section) => {
    const findings = selectedFindings(sample, section);
    if (findings.length < 2) return;

    const standaloneNone = findings.some(({ text }) => isStandaloneNone(text));
    const anotherFinding = findings.some(({ text }) => !isStandaloneNone(text));
    if (standaloneNone && anotherFinding) {
      warnings.add(`${section.title} bölümünde “Yok” ile başka bir bulgu birlikte seçildi.`);
    }

    const negativeLymphocyte = hasNegativeSubject(findings, /lenfosit/);
    const positiveLymphocyte = hasPositiveSubject(findings, /lenfosit/);
    if (negativeLymphocyte && positiveLymphocyte) {
      warnings.add(`${section.title} bölümünde lenfositlerin hem olmadığı hem bulunduğu belirtilmiş.`);
    }

    const epithelialPattern = /epitelyal|tirosit|paratiroid|paratirosit|folikül/;
    const negativeEpithelial = hasNegativeSubject(findings, /epitelyal hücre/);
    const positiveEpithelial = hasPositiveSubject(findings, epithelialPattern);
    if (negativeEpithelial && positiveEpithelial) {
      warnings.add(`${section.title} bölümünde epitelyal hücrelerin hem olmadığı hem bulunduğu belirtilmiş.`);
    }

    const thyroidPattern = /tirosit|folikül|mikrofolikül/;
    const negativeThyroid = hasNegativeSubject(findings, /tirosit/);
    const positiveThyroid = hasPositiveSubject(findings, thyroidPattern);
    if (negativeThyroid && positiveThyroid) {
      warnings.add(`${section.title} bölümünde tirositlerin hem olmadığı hem bulunduğu belirtilmiş.`);
    }

    const negativeAtypia = findings.some(({ text }) => /atipik hücre (yoktur|görülmemiştir|görülmemiş)/.test(lower(text)));
    const positiveAtypia = findings.some(({ option, text }) => option.tumorRelated && !isNegativeText(text));
    if (negativeAtypia && positiveAtypia) {
      warnings.add(`${section.title} bölümünde “atipik hücre yoktur” ile atipik veya tümör ilişkili bulgu birlikte seçildi.`);
    }
  });

  return Array.from(warnings);
}
