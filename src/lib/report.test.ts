import { describe, expect, it } from 'vitest';
import type { AppState, ReportMode, Sample, SelectionState } from '../types';
import {
  automaticStainCount,
  generateAllReports,
  generateSampleReport,
  generateSampleReportBody,
} from './report';
import { getSampleWarnings } from './warnings';

function sample(mode: ReportMode, selections: SelectionState, number = 1): Sample {
  return {
    id: `sample-${number}`,
    number,
    mode,
    location: mode === 'tiiab' ? 'Tiroid' : 'Lenf nodu',
    selections,
    sectionNotes: {},
    diagnosisNote: '',
    microscopyNote: '',
  };
}

const TIIAB_NDS: SelectionState = {
  'tiiab-2-E2': 0,
  'tiiab-3-E3': 0,
  'tiiab-4-E4': 0,
  'tiiab-5-E5': 0,
  'tiiab-6-E6': 0,
  'tiiab-7-E7': 0,
};

const OTHER_NDS: SelectionState = {
  'LAP-2-E2': 0,
  'LAP-3-E3': 0,
  'LAP-3-M3': 0,
  'LAP-4-E4': 0,
  'LAP-5-E5': 0,
  'LAP-6-E6': 0,
  'LAP-7-E7': 0,
};

describe('rapor metni sözleşmesi', () => {
  it('tek Diğer NDS raporunda sıra ve Örnek NO alanını kullanmaz', () => {
    const report = generateSampleReportBody(sample('lap', OTHER_NDS));

    expect(report).toBe([
      'Lenf nodu: Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma: Nondiagnostik Sitoloji.',
      '   - Yeterlilik: Lenfosit yoktur, epitelyal hücre yoktur.',
      '   - Atipik hücre varlığı: Atipik hücre yoktur.',
      '   - Kolloid: Yok.',
      '   - Makrofaj: Yok.',
      '   - Eşlik eden diğer yapılar: Yok.',
    ].join('\n'));
    expect(report).not.toMatch(/^1-/);
    expect(report).not.toContain('Örnek NO');
    expect(report).not.toContain('MİKROSKOPİ');
  });

  it('tek TİİAB NDS raporunda sıra ve Örnek NO alanını kullanmaz', () => {
    const report = generateSampleReportBody(sample('tiiab', TIIAB_NDS));

    expect(report.startsWith(
      'Tiroid; İnce iğne aspirasyon biyopsisi; sıvı bazlı sitoloji: Non-diagnostik sitoloji, Bethesda 1.',
    )).toBe(true);
    expect(report).not.toMatch(/^1-/);
    expect(report).not.toContain('Örnek NO');
    expect(report.split('\n').slice(1).every((line) => line.startsWith('   - '))).toBe(true);
  });

  it('tek örnekte elle yazılan alınma yerini korur ancak sıra ve Örnek NO eklemez', () => {
    const custom = sample('lap', OTHER_NDS);
    custom.location = 'Sağ servikal seviye 3';
    const report = generateSampleReportBody(custom);

    expect(report.startsWith(
      '("Sağ servikal seviye 3") Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma:',
    )).toBe(true);
    expect(report).not.toMatch(/^1-/);
    expect(report).not.toContain('Örnek NO');
  });

  it('çoklu mikroskopi ifadelerini virgülle tek cümlede birleştirir', () => {
    const report = generateSampleReportBody(sample('lap', {
      'LAP-3-G3': 0,
      'LAP-3-I3': 0,
    }));

    expect(report).toContain('   - Yeterlilik: Dağınık lenfosit, yaygın lenfosit.');
    expect(report).not.toContain('Dağınık lenfosit. Yaygın lenfosit.');
  });

  it('büyük harfli malign tanıları değiştirmez', () => {
    const report = generateSampleReportBody(sample('lap', { 'LAP-2-Q2': 0 }));
    expect(report).toContain('MALİGNİTE YÖNÜNDEN KUŞKULU SİTOLOJİ.');
  });

  it('birden fazla raporda sıra ve Örnek NO alanlarını korur', () => {
    const first = sample('lap', OTHER_NDS, 1);
    const second = sample('tiiab', TIIAB_NDS, 2);
    const state: AppState = {
      version: 1,
      samples: [first, second],
      activeSampleId: first.id,
      stainCountOverride: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const report = generateAllReports(state);
    const stainSeparator = '\n\n\n\nEK BOYALAR\n';
    const parts = report.split(stainSeparator);

    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain('1- (Örnek NO:1) Lenf nodu:');
    expect(parts[0]).toContain('   - Eşlik eden diğer yapılar: Yok.\n\n2- (Örnek NO:2) Tiroid;');
    expect(parts[0]).toMatch(/   - Eşlik eden lenfositler ve diğer yapılar: Yok\.$/);
    expect(parts[1]).toContain('6 adet histokimyasal boya');
  });

  it('alınma yeri kapatıldığında çoklu raporda yalnızca sıra numarasını korur', () => {
    const first = sample('lap', OTHER_NDS, 1);
    const second = sample('tiiab', TIIAB_NDS, 2);
    const state: AppState = {
      version: 1,
      samples: [first, second],
      activeSampleId: first.id,
      stainCountOverride: 0,
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const report = generateAllReports(state, false);

    expect(report.startsWith('1- Nondiagnostik Sitoloji.')).toBe(true);
    expect(report).toContain('\n\n2- Non-diagnostik sitoloji, Bethesda 1.');
    expect(report).not.toContain('Lenf nodu');
    expect(report).not.toContain('Tiroid; İnce iğne aspirasyon biyopsisi');
    expect(report).not.toContain('Örnek NO');
  });

  it('tek raporda boya başlığını ve sayısını doğru üretir', () => {
    const report = generateSampleReport(sample('lap', OTHER_NDS));
    expect(report).toContain('\n\n\n\nEK BOYALAR\n');
    expect(report).toContain('3 adet histokimyasal boya');
  });

  it('ek boya sayısı sıfır olduğunda boya bölümünü hiç oluşturmaz', () => {
    const report = generateSampleReport(sample('lap', OTHER_NDS), 1, 0);
    expect(report).not.toContain('EK BOYALAR');
    expect(report).not.toContain('histokimyasal boya');
  });
});

describe('boya sayısı', () => {
  it.each([
    [0, 0],
    [1, 3],
    [2, 6],
    [3, 9],
    [4, 10],
    [8, 10],
  ])('%i örnekte %i boya hesaplar', (sampleCount, expected) => {
    expect(automaticStainCount(sampleCount)).toBe(expected);
  });
});

describe('çelişki önerileri', () => {
  it('benign tanı ile malignite ilişkili mikroskopiyi öneri olarak bildirir', () => {
    const warnings = getSampleWarnings(sample('lap', {
      'LAP-2-I2': 0,
      'LAP-4-G4': 0,
    }));

    expect(warnings).toContain('Benign tanı ile malignite ilişkili mikroskopik bulgular birlikte seçildi.');
  });

  it('Yok ile pozitif bulgunun birlikte seçilmesini bildirir', () => {
    const warnings = getSampleWarnings(sample('lap', {
      'LAP-5-E5': 0,
      'LAP-5-G5': 0,
    }));

    expect(warnings).toContain('Kolloid bölümünde “Yok” ile başka bir bulgu birlikte seçildi.');
  });

  it('malign tanı ile atipik hücre yoktur birlikteliğini bildirir', () => {
    const warnings = getSampleWarnings(sample('lap', {
      'LAP-2-S2': 0,
      'LAP-4-E4': 0,
    }));

    expect(warnings).toContain('Malign veya kuşkulu tanı ile “atipik hücre yoktur” ifadesi birlikte seçildi.');
  });
});
