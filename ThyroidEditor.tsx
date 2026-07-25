import { useEffect, useMemo, useRef, useState } from 'react';
import { OtherEditor } from './components/OtherEditor';
import { ThyroidEditor } from './components/ThyroidEditor';
import { getTemplate } from './data/reportTemplates';
import { automaticStainCount, generateAllReports, generateSampleReport, sampleHasContent } from './lib/report';
import { clearSavedState, createId, createInitialState, createSample, loadState, saveState } from './lib/storage';
import type { AppState, ReportMode, Sample } from './types';
import './styles.css';

type Toast = { id: number; text: string } | null;

const pageModes: Array<{ mode: ReportMode; label: string }> = [
  { mode: 'tiiab', label: 'Tiroid' },
  { mode: 'lap', label: 'Diğer' },
];

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
  const stainCount = state.stainCountOverride ?? automaticStainCount(state.samples.length);

  const preview = useMemo(
    () => showAllPreview
      ? generateAllReports(state)
      : generateSampleReport(activeSample, state.samples.length, state.stainCountOverride),
    [activeSample, showAllPreview, state],
  );

  useEffect(() => {
    const savedAt = new Date();
    saveState({ ...state, updatedAt: savedAt.toISOString() });
    setLastSavedAt(savedAt);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 1700);
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

  function updateActivePatch(patch: Partial<Sample>) {
    updateActive((sample) => ({ ...sample, ...patch }));
  }

  function changeMode(mode: ReportMode) {
    if (mode === activeSample.mode) return;
    updateActive((sample) => ({
      ...sample,
      mode,
      location: getTemplate(mode).defaultLocation,
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
    notify('Alan çoğaltıldı');
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
    await copyText(generateSampleReport(activeSample, state.samples.length, state.stainCountOverride));
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
    notify('Tüm rapor panoya kopyalandı');
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">Yerel kayıtlı · düz yazı çıktı</p>
          <h1>Sitoloji Raporlama</h1>
        </div>
        <div className="storage-status" title="Her tıklamada tarayıcıya otomatik kaydedilir.">
          <span className="storage-dot" />
          Kaydedildi · {Number.isNaN(lastSavedAt.getTime()) ? 'şimdi' : lastSavedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar__head">
            <div>
              <span className="sidebar__label">Rapor alanları</span>
              <strong>{state.samples.length} alan</strong>
            </div>
            <button className="icon-button" type="button" onClick={() => addSample()} aria-label="Yeni alan ekle">＋</button>
          </div>

          <div className="sample-list">
            {state.samples.map((sample) => {
              const sampleTemplate = getTemplate(sample.mode);
              return (
                <button
                  type="button"
                  key={sample.id}
                  className={`sample-item ${sample.id === activeSample.id ? 'is-active' : ''}`}
                  onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}
                >
                  <span className="sample-number">{sample.number}</span>
                  <span className="sample-text">
                    <strong>{sampleTemplate.shortTitle}</strong>
                    <small>{sample.location || sampleTemplate.defaultLocation}</small>
                  </span>
                  <span className={`sample-state ${sample.copiedAt ? 'is-done' : ''}`}>{sample.copiedAt ? '✓' : '•'}</span>
                </button>
              );
            })}
          </div>

          <button className="secondary full compact-button" type="button" onClick={() => addSample()}>Yeni alan</button>
          <div className="sidebar-actions">
            <button className="ghost" type="button" onClick={duplicateSample}>Çoğalt</button>
            <button className="ghost danger-text" type="button" onClick={() => deleteSample(activeSample.id)}>Sil</button>
          </div>

          <div className="stain-card">
            <div className="stain-card__head">
              <span>Ek boya</span>
              <strong>{stainCount}</strong>
            </div>
            <small>Rapora otomatik eklenir</small>
            <label>
              Manuel
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

          <div className="page-tabs" role="tablist" aria-label="Raporlama sayfası">
            {pageModes.map(({ mode, label }) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeSample.mode === mode}
                className={activeSample.mode === mode ? 'is-active' : ''}
                key={mode}
                onClick={() => changeMode(mode)}
              >
                <strong>{label}</strong>
              </button>
            ))}
          </div>

          <div className="click-hint">
            Tıkla: seç · tekrar tıkla: sonraki metin · son metinden sonra kapat. Seçili bulgular yeşil, tümör ilişkili seçili bulgular kırmızıdır.
          </div>

          {activeSample.mode === 'tiiab' ? (
            <ThyroidEditor
              sample={activeSample}
              template={template}
              onCycle={cycleOption}
              onChange={updateActivePatch}
            />
          ) : (
            <OtherEditor
              sample={activeSample}
              template={template}
              onCycle={cycleOption}
              onChange={updateActivePatch}
            />
          )}
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

          <pre className="report-output">{preview}</pre>

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
