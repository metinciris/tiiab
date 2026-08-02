import { describe, expect, it } from 'vitest';
import { getTemplate } from '../data/reportTemplates';
import { createSample } from './storage';
import { getMissingSections, isSampleComplete, requiredMicroscopySections } from './completion';

describe('rapor tamamlanma kontrolü', () => {
  it('mikroskopi tamam olsa bile tanı yoksa tik göstermez', () => {
    const sample = createSample(1, 'tiiab');
    sample.diagnosisNote = 'Serbest tanı notu';
    sample.sectionNotes = Object.fromEntries(
      requiredMicroscopySections(sample).map((section) => [section.id, 'Değerlendirildi.']),
    );

    expect(isSampleComplete(sample)).toBe(false);
    expect(getMissingSections(sample)).toContain('Tanı');
  });

  it('tanı ve zorunlu mikroskopi alanları doluysa tamamlanır', () => {
    const sample = createSample(1, 'tiiab');
    const diagnosis = getTemplate('tiiab').sections.find((section) => section.exclusive);
    if (!diagnosis) throw new Error('Tanı bölümü bulunamadı');

    sample.selections[diagnosis.options[0].id] = 0;
    sample.sectionNotes = Object.fromEntries(
      requiredMicroscopySections(sample).map((section) => [section.id, 'Değerlendirildi.']),
    );

    expect(isSampleComplete(sample)).toBe(true);
    expect(getMissingSections(sample)).toEqual([]);
  });
});

describe('çoklu varyant sırası', () => {
  it('kaynak kutularda görünen etiket ilk tıklanan varyanttır', () => {
    const sourceOptions = getTemplate('lap').sections.flatMap((section) => section.options)
      .filter((option) => option.id !== 'LAP-2-LN-CONTENT');

    sourceOptions.forEach((option) => {
      expect(option.variants[0]).toBe(option.label);
    });
  });
});
