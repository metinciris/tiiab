import { useEffect, useMemo, useRef, useState } from 'react';
import { OtherEditor } from './components/OtherEditor';
import { ThyroidEditor } from './components/ThyroidEditor';
import { getTemplate } from './data/reportTemplates';
import { automaticStainCount, generateAllReports, generateSampleReportBody, generateStainText } from './lib/report';
import { clearSavedState, createInitialState, createSample, loadState, saveState } from './lib/storage';
import type { AppState, ReportMode, Sample, SelectionState } from './types';
import './styles.css';

type Toast = { id: number; text: string } | null;

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

function isSampleComplete(sample: Sample): boolean {
  const microscopySections = getTemplate(sample.mode).sections.filter((section) => (
    !section.exclusive && section.title.toLocaleLowerCase('tr-TR') !== 'hücre bloğu'
  ));
  return microscopySections.length > 0 && microscopySections.every((section) => (
    section.options.some((option) => sample.selections[option.id] !== undefined)
    || Boolean(sample.sectionNotes?.[section.id]?.trim())
  ));
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
  'LAP-3-M3': 1,
  'LAP-4-E4': 0,
  'LAP-5-E5': 0,
  'LAP-6-E6': 0,
  'LAP-7-E7': 0,
};

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<Toast>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeSample = state.samples.find((sample) => sample.id === state.activeSampleId) ?? state.samples[0];
  const template = getTemplate(activeSample.mode);
  const stainCount = state.stainCountOverride ?? automaticStainCount(state.samples.length);
  const stainText = useMemo(
    () => generateStainText(state.samples.length, state.stainCountOverride),
    [state.samples.length, state.stainCountOverride],
  );

  useEffect(() => {
    saveState({ ...state, updatedAt: new Date().toISOString() });
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 1700);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const container = previewScrollRef.current;
    const item = previewItemRefs.current[activeSample.id];
    if (!container || !item) return;
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetTop = container.scrollTop + (itemRect.top - containerRect.top) - 24;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }, [activeSample.id, state.samples.length]);

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

  function cycleOption(sectionId: string, optionId: string, variantCount: number, exclusive: boolean) {
    updateActive((sample) => {
      const current = sample.selections[optionId];
      const nextSelections = { ...sample.selections };
      if (exclusive) {
        const section = getTemplate(sample.mode).sections.find((item) => item.id === sectionId);
        section?.options.forEach((option) => delete nextSelections[option.id]);
      }
      if (current === undefined) nextSelections[optionId] = 0;
      else if (current + 1 < variantCount) nextSelections[optionId] = current + 1;
      else delete nextSelections[optionId];
      return { ...sample, selections: nextSelections, copiedAt: undefined };
    });
  }

  function addSample(mode: ReportMode) {
    setState((current) => {
      const sample = createSample(current.samples.length + 1, mode);
      return { ...current, samples: [...current.samples, sample], activeSampleId: sample.id };
    });
    notify(mode === 'tiiab' ? 'TİİAB alanı eklendi' : 'LAP alanı eklendi');
  }

  function deleteSample(id: string) {
    if (state.samples.length === 1) {
      resetAllReports();
      return;
    }
    setState((current) => {
      const index = current.samples.findIndex((sample) => sample.id === id);
      const remaining = reNumber(current.samples.filter((sample) => sample.id !== id));
      const next = remaining[Math.min(index, remaining.length - 1)];
      return { ...current, samples: remaining, activeSampleId: next.id };
    });
    notify('Rapor silindi');
  }

  function resetAllReports() {
    const initial = createInitialState();
    clearSavedState();
    setState(initial);
    previewScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify('Tüm raporlar sıfırlandı');
  }

  function applyNdsPreset() {
    updateActive((sample) => ({
      ...sample,
      selections: sample.mode === 'tiiab' ? { ...TIIAB_NDS } : { ...OTHER_NDS },
      sectionNotes: {},
      diagnosisNote: '',
      microscopyNote: '',
      copiedAt: undefined,
    }));
    notify(activeSample.mode === 'tiiab' ? 'TİİAB NDS seçildi' : 'Diğer NDS seçildi');
  }

  async function copyAll() {
    await copyText(generateAllReports(state));
    notify('Tüm rapor kopyalandı');
  }

  return (
    <div className="app-shell">
      <main className="workspace">
        <nav className="report-toolbar" aria-label="Rapor alanları">
          <button
            type="button"
            onClick={resetAllReports}
            style={{ border: '1px solid #8f1724', background: '#b42333', color: '#fff', borderRadius: 8, padding: '10px 12px', fontWeight: 850, whiteSpace: 'nowrap' }}
          >
            Raporu sıfırla
          </button>

          <div className="add-mode-bar" aria-label="Yeni rapor ekle">
            <button type="button" className="add-mode-bar__tiiab" onClick={() => addSample('tiiab')}>＋ TİİAB</button>
            <button type="button" className="add-mode-bar__other" onClick={() => addSample('lap')}>＋ Diğer</button>
          </div>

          <div className="sample-list">
            {state.samples.map((sample) => {
              const complete = isSampleComplete(sample);
              return (
                <button
                  type="button"
                  key={sample.id}
                  className={`sample-item sample-item--${sample.mode} ${sample.id === activeSample.id ? 'is-active' : ''}`}
                  onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}
                  title={complete ? 'Mikroskopi satırları tamamlandı' : 'Mikroskopi satırlarında eksik seçim var'}
                >
                  <strong>{sample.number}</strong>
                  <span>{sample.mode === 'tiiab' ? 'TİİAB' : 'Diğer'}</span>
                  {complete && <i>✓</i>}
                </button>
              );
            })}
          </div>

          <div className="toolbar-tail">
            <label className="stain-control">Ek boya <b>{stainCount}</b><input type="number" min="0" value={state.stainCountOverride ?? ''} placeholder="Oto" onChange={(event) => setState((current) => ({ ...current, stainCountOverride: event.target.value === '' ? null : Math.max(0, Number(event.target.value)) }))} /></label>
            <button type="button" className="delete-button" onClick={() => deleteSample(activeSample.id)}>Sil</button>
          </div>
        </nav>

        <section className="editor">
          <div className="editor-head">
            <div><span>Rapor {activeSample.number}</span><h2>{activeSample.mode === 'tiiab' ? 'TİİAB' : 'Diğer'}</h2></div>
            <div className="editor-head__actions">
              <button type="button" className="nds-button" onClick={applyNdsPreset}>NDS</button>
            </div>
          </div>
          {activeSample.mode === 'tiiab'
            ? <ThyroidEditor sample={activeSample} template={template} onCycle={cycleOption} onChange={updateActivePatch} />
            : <OtherEditor sample={activeSample} template={template} onCycle={cycleOption} onChange={updateActivePatch} />}
        </section>

        <aside className="preview-panel">
          <div className="preview-head"><div><span>Canlı rapor</span><strong>Tümü</strong></div></div>
          <div className="report-output--all" ref={previewScrollRef}>
            {state.samples.map((sample) => (
              <div
                key={sample.id}
                ref={(element) => { previewItemRefs.current[sample.id] = element; }}
                className={`preview-report preview-report--${sample.mode} ${sample.id === activeSample.id ? 'is-active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}
              >
                <pre>{generateSampleReportBody(sample)}</pre>
              </div>
            ))}
            <div className="preview-stains"><pre>{`EK BOYALAR\n${stainText}`}</pre></div>
          </div>
          <div className="copy-stack">
            <button className="primary" type="button" onClick={() => void copyAll()}>Tümünü kopyala</button>
          </div>
        </aside>
      </main>
      {toast && <div className="toast" role="status" key={toast.id}>{toast.text}</div>}
    </div>
  );
}
