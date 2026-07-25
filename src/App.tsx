import { useEffect, useMemo, useRef, useState } from 'react';
import { ToggleCard } from './components/ToggleCard';
import { getTemplate, templates } from './data/reportTemplates';
import { automaticStainCount, generateAllReports, generateSampleReport, generateStainText, sampleHasContent } from './lib/report';
import { clearSavedState, createId, createInitialState, createSample, loadState, saveState } from './lib/storage';
import type { AppState, ReportMode, Sample } from './types';
import './styles.css';

type Toast = { id: number; text: string } | null;

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function reNumber(samples: Sample[]): Sample[] {
  return samples.map((sample, index) => ({ ...sample, number: index + 1 }));
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<Toast>(null);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date(state.updatedAt));
  const importRef = useRef<HTMLInputElement>(null);

  const activeSample = state.samples.find((sample) => sample.id === state.activeSampleId) ?? state.samples[0];
  const template = getTemplate(activeSample.mode);
  const activeIndex = state.samples.findIndex((sample) => sample.id === activeSample.id);

  const preview = useMemo(
    () => showAllPreview ? generateAllReports(state) : generateSampleReport(activeSample),
    [activeSample, showAllPreview, state],
  );

  useEffect(() => {
    const savedAt = new Date();
    saveState({ ...state, updatedAt: savedAt.toISOString() });
    setLastSavedAt(savedAt);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 1900);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function notify(text: string) {
    setToast({ id: Date.now(), text });
  }

  function updateActive(updater: (sample: Sample) => Sample) {
    setState((current) => ({
      ...current,
      samples: current.samples.map((sample) => sample.id === current.activeSampleId ? updater(sample) : sample),
    }));
  }

  function changeMode(mode: ReportMode) {
    updateActive((sample) => ({
      ...sample,
      mode,
      location: sampleHasContent(sample) ? sample.location : getTemplate(mode).defaultLocation,
      selections: {},
      diagnosisNote: '',
      microscopyNote: '',
      copiedAt: undefined,
    }));
  }

  function cycleOption(sectionId: string, optionId: string, variantCount: number, exclusive: boolean) {
    updateActive((sample) => {
      const current = sample.selections[optionId];
      const nextSelections = { ...sample.selections };
      if (exclusive) {
        const section = getTemplate(sample.mode).sections.find((item) => item.id === sectionId);
        section?.options.forEach((option) => delete nextSelections[option.id]);
      }
      if (current === undefined) {
        nextSelections[optionId] = 0;
      } else if (current + 1 < variantCount) {
        nextSelections[optionId] = current + 1;
      } else {
        delete nextSelections[optionId];
      }
      return { ...sample, selections: nextSelections, copiedAt: undefined };
    });
  }

  function addSample(mode: ReportMode = activeSample.mode) {
    setState((current) => {
      const sample = createSample(current.samples.length + 1, mode);
      return { ...current, samples: [...current.samples, sample], activeSampleId: sample.id };
    });
  }

  function duplicateSample() {
    const duplicated: Sample = {
      ...activeSample,
      id: createId(),
      number: state.samples.length + 1,
      copiedAt: undefined,
    };
    setState((current) => ({ ...current, samples: [...current.samples, duplicated], activeSampleId: duplicated.id }));
    notify('Alan kopyalandı');
  }

  function deleteSample(id: string) {
    if (state.samples.length === 1) {
      resetActiveSample();
      return;
    }
    setState((current) => {
      const index = current.samples.findIndex((sample) => sample.id === id);
      const remaining = reNumber(current.samples.filter((sample) => sample.id !== id));
      const next = remaining[Math.min(index, remaining.length - 1)];
      return { ...current, samples: remaining, activeSampleId: next.id };
    });
    notify('Alan silindi');
  }

  function resetActiveSample() {
    updateActive((sample) => ({
      ...createSample(sample.number, sample.mode),
      id: sample.id,
      number: sample.number,
    }));
    notify('Bu alan sıfırlandı');
  }

  function resetAll() {
    const initial = createInitialState();
    clearSavedState();
    setState(initial);
    notify('Tüm alanlar sıfırlandı');
  }

  async function copyActive(moveNext = false) {
    await copyText(generateSampleReport(activeSample));
    const copiedAt = new Date().toISOString();
    setState((current) => {
      const samples = current.samples.map((sample) => sample.id === activeSample.id ? { ...sample, copiedAt } : sample);
      const next = moveNext ? samples[activeIndex + 1] : undefined;
      return { ...current, samples, activeSampleId: next?.id ?? current.activeSampleId };
    });
    notify(moveNext && state.samples[activeIndex + 1] ? 'Kopyalandı, sonraki alana geçildi' : 'Rapor panoya kopyalandı');
  }

  async function copyAll() {
    await copyText(generateAllReports(state));
    notify('Tüm raporlar panoya kopyalandı');
  }

  async function copyStains() {
    await copyText(generateStainText(state.samples.length, state.stainCountOverride));
    notify('Ek boya metni kopyalandı');
  }

  function exportBackup() {
    downloadText(`tiiab-yedek-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json');
    notify('Yedek indirildi');
  }

  async function importBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as AppState;
      if (parsed.version !== 1 || !Array.isArray(parsed.samples) || !parsed.samples.length) throw new Error('Geçersiz');
      setState(parsed);
      notify('Yedek geri yüklendi');
    } catch {
      notify('Yedek dosyası okunamadı');
    }
  }

  const stainCount = state.stainCountOverride ?? automaticStainCount(state.samples.length);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Yerel kayıtlı · düz yazı çıktı</p>
          <h1>TİİAB / LAP Raporlama</h1>
        </div>
        <div className="storage-status" title="Her tıklamada tarayıcıya otomatik kaydedilir.">
          <span className="storage-dot" />
          Tarayıcıya kaydedildi · {Number.isNaN(lastSavedAt.getTime()) ? 'şimdi' : lastSavedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar__head">
            <div>
              <span className="sidebar__label">İİAB alanları</span>
              <strong>{state.samples.length} alan</strong>
            </div>
            <button className="icon-button" type="button" onClick={() => addSample()} aria-label="Yeni alan ekle">＋</button>
          </div>

          <div className="sample-list">
            {state.samples.map((sample) => (
              <button
                type="button"
                key={sample.id}
                className={`sample-item ${sample.id === activeSample.id ? 'is-active' : ''}`}
                onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}
              >
                <span className="sample-number">{sample.number}</span>
                <span className="sample-text">
                  <strong>{getTemplate(sample.mode).shortTitle}</strong>
                  <small>{sample.location || getTemplate(sample.mode).defaultLocation}</small>
                </span>
                <span className={`sample-state ${sample.copiedAt ? 'is-done' : ''}`}>{sample.copiedAt ? '✓' : '•'}</span>
              </button>
            ))}
          </div>

          <button className="secondary full" type="button" onClick={() => addSample()}>Yeni alan ekle</button>
          <div className="sidebar-actions">
            <button className="ghost" type="button" onClick={duplicateSample}>Alanı çoğalt</button>
            <button className="ghost danger-text" type="button" onClick={() => deleteSample(activeSample.id)}>Alanı sil</button>
          </div>

          <div className="stain-card">
            <div className="stain-card__head">
              <span>Ek boya toplamı</span>
              <strong>{stainCount}</strong>
            </div>
            <p>1 alan: 3 · 2 alan: 6 · 3 alan: 9 · 4 ve üzeri: 10</p>
            <label>
              Manuel sayı
              <input
                type="number"
                min="0"
                value={state.stainCountOverride ?? ''}
                placeholder="Otomatik"
                onChange={(event) => setState((current) => ({
                  ...current,
                  stainCountOverride: event.target.value === '' ? null : Math.max(0, Number(event.target.value)),
                }))}
              />
            </label>
            <button className="secondary full" type="button" onClick={copyStains}>Ek boya metnini kopyala</button>
          </div>

          <div className="backup-actions">
            <button className="ghost" type="button" onClick={exportBackup}>Yedek indir</button>
            <button className="ghost" type="button" onClick={() => importRef.current?.click()}>Yedek yükle</button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importBackup(file);
                event.target.value = '';
              }}
            />
          </div>
        </aside>

        <section className="editor">
          <div className="editor-head">
            <div>
              <span className="editor-index">Alan {activeSample.number}</span>
              <h2>{template.title}</h2>
            </div>
            <div className="editor-head__actions">
              <button className="ghost" type="button" onClick={resetActiveSample}>Alanı sıfırla</button>
              <button className="ghost danger-text" type="button" onClick={resetAll}>Tümünü sıfırla</button>
            </div>
          </div>

          <div className="mode-tabs" role="tablist" aria-label="Rapor türü">
            {(Object.keys(templates) as ReportMode[]).map((mode) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeSample.mode === mode}
                className={activeSample.mode === mode ? 'is-active' : ''}
                key={mode}
                onClick={() => changeMode(mode)}
              >
                {templates[mode].shortTitle}
              </button>
            ))}
          </div>

          <label className="location-field">
            <span>Örnek yeri / başlık</span>
            <input
              value={activeSample.location}
              onChange={(event) => updateActive((sample) => ({ ...sample, location: event.target.value, copiedAt: undefined }))}
              placeholder={template.defaultLocation}
            />
          </label>

          <div className="hint-box">
            Kutuyu tıklayınca seçilir. Çok seçenekli kutularda her tıklama bir sonraki metne geçer; son metinden sonra kutu kapanır. Kırmızı tonlu kutular tümör ilişkili bulgulardır.
          </div>

          {template.sections.map((section) => (
            <section className="option-section" key={section.id}>
              <div className="option-section__title">
                <h3>{section.title}</h3>
                <span>{section.exclusive ? 'Tek seçim' : 'Çoklu seçim'}</span>
              </div>
              <div className="option-grid">
                {section.options.map((option) => (
                  <ToggleCard
                    key={option.id}
                    option={option}
                    activeIndex={activeSample.selections[option.id]}
                    onCycle={() => cycleOption(section.id, option.id, option.variants.length, Boolean(section.exclusive))}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="notes-grid">
            <label>
              <span>Tanıya eklenecek serbest metin</span>
              <textarea
                rows={3}
                value={activeSample.diagnosisNote}
                onChange={(event) => updateActive((sample) => ({ ...sample, diagnosisNote: event.target.value, copiedAt: undefined }))}
                placeholder="Gerekirse ek tanı veya yorum..."
              />
            </label>
            <label>
              <span>Mikroskopiye eklenecek serbest metin</span>
              <textarea
                rows={3}
                value={activeSample.microscopyNote}
                onChange={(event) => updateActive((sample) => ({ ...sample, microscopyNote: event.target.value, copiedAt: undefined }))}
                placeholder="Gerekirse ek mikroskopi notu..."
              />
            </label>
          </div>
        </section>

        <aside className="preview-panel">
          <div className="preview-head">
            <div>
              <span>Canlı rapor</span>
              <strong>{showAllPreview ? 'Tüm alanlar' : `Alan ${activeSample.number}`}</strong>
            </div>
            <div className="preview-switch">
              <button type="button" className={!showAllPreview ? 'is-active' : ''} onClick={() => setShowAllPreview(false)}>Bu alan</button>
              <button type="button" className={showAllPreview ? 'is-active' : ''} onClick={() => setShowAllPreview(true)}>Tümü</button>
            </div>
          </div>

          <pre className="report-output">{preview || 'Seçimler yapıldıkça rapor burada oluşur.'}</pre>

          <div className="copy-stack">
            <button className="primary" type="button" onClick={() => void copyActive(false)}>Bu alanı kopyala</button>
            <button
              className="secondary"
              type="button"
              disabled={!state.samples[activeIndex + 1]}
              onClick={() => void copyActive(true)}
            >
              Kopyala ve sonraki alana geç
            </button>
            <button className="secondary" type="button" onClick={() => void copyAll()}>Tüm raporu kopyala</button>
          </div>
        </aside>
      </main>

      {toast && <div className="toast" role="status" key={toast.id}>{toast.text}</div>}
    </div>
  );
}
