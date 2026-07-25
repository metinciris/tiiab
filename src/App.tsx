import { useEffect, useMemo, useRef, useState } from 'react';
import { OtherEditor } from './components/OtherEditor';
import { ThyroidEditor } from './components/ThyroidEditor';
import { getTemplate } from './data/reportTemplates';
import { automaticStainCount, generateAllReports, generateSampleReport, generateSampleReportBody, generateStainText } from './lib/report';
import { clearSavedState, createId, createInitialState, createSample, loadState, saveState } from './lib/storage';
import type { AppState, ReportMode, Sample } from './types';
import './styles.css';

type Toast = { id: number; text: string } | null;

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function renumber(samples: Sample[]) {
  return samples.map((sample, index) => ({ ...sample, number: index + 1 }));
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<Toast>(null);
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date(state.updatedAt));
  const previewRef = useRef<HTMLDivElement>(null);
  const previewItems = useRef<Record<string, HTMLDivElement | null>>({});

  const activeSample = state.samples.find((sample) => sample.id === state.activeSampleId) ?? state.samples[0];
  const template = getTemplate(activeSample.mode);
  const activeIndex = state.samples.findIndex((sample) => sample.id === activeSample.id);
  const stainCount = state.stainCountOverride ?? automaticStainCount(state.samples.length);
  const fullReport = useMemo(() => generateAllReports(state), [state]);
  const stainText = useMemo(() => generateStainText(state.samples.length, state.stainCountOverride), [state.samples.length, state.stainCountOverride]);

  useEffect(() => {
    const now = new Date();
    saveState({ ...state, updatedAt: now.toISOString() });
    setLastSavedAt(now);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const container = previewRef.current;
    const item = previewItems.current[activeSample.id];
    if (!container || !item) return;
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeSample.id]);

  const notify = (text: string) => setToast({ id: Date.now(), text });

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
      const next = { ...sample.selections };
      const current = next[optionId];
      if (exclusive) {
        getTemplate(sample.mode).sections.find((section) => section.id === sectionId)?.options.forEach((option) => delete next[option.id]);
      }
      if (current === undefined) next[optionId] = 0;
      else if (current + 1 < variantCount) next[optionId] = current + 1;
      else delete next[optionId];
      return { ...sample, selections: next, copiedAt: undefined };
    });
  }

  function addSample(mode: ReportMode) {
    setState((current) => {
      const sample = createSample(current.samples.length + 1, mode);
      return { ...current, samples: [...current.samples, sample], activeSampleId: sample.id };
    });
    notify(mode === 'tiiab' ? 'TİİAB raporu eklendi' : 'Diğer raporu eklendi');
  }

  function duplicateSample() {
    const copy: Sample = { ...activeSample, id: createId(), number: state.samples.length + 1, copiedAt: undefined };
    setState((current) => ({ ...current, samples: [...current.samples, copy], activeSampleId: copy.id }));
    notify('Rapor çoğaltıldı');
  }

  function deleteSample() {
    if (state.samples.length === 1) return resetActive();
    setState((current) => {
      const index = current.samples.findIndex((sample) => sample.id === activeSample.id);
      const samples = renumber(current.samples.filter((sample) => sample.id !== activeSample.id));
      return { ...current, samples, activeSampleId: samples[Math.min(index, samples.length - 1)].id };
    });
    notify('Rapor silindi');
  }

  function resetActive() {
    updateActive((sample) => ({ ...createSample(sample.number, sample.mode), id: sample.id, number: sample.number }));
    notify('Rapor sıfırlandı');
  }

  function resetAll() {
    clearSavedState();
    setState(createInitialState());
    notify('Tümü sıfırlandı');
  }

  async function copyActive(moveNext = false) {
    await copyText(generateSampleReport(activeSample, state.samples.length, state.stainCountOverride));
    setState((current) => {
      const samples = current.samples.map((sample) => sample.id === activeSample.id ? { ...sample, copiedAt: new Date().toISOString() } : sample);
      const next = moveNext ? samples[activeIndex + 1] : undefined;
      return { ...current, samples, activeSampleId: next?.id ?? current.activeSampleId };
    });
    notify(moveNext && state.samples[activeIndex + 1] ? 'Kopyalandı, sonraki rapora geçildi' : 'Rapor kopyalandı');
  }

  async function copyAll() {
    await copyText(fullReport);
    notify('Tüm rapor kopyalandı');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Yerel kayıtlı · düz yazı çıktı</p><h1>Sitoloji Raporlama <small>v1.3.1</small></h1></div>
        <div className="storage-status"><span />Kaydedildi · {lastSavedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
      </header>

      <main className="workspace">
        <aside className="left-panel">
          <div className="sample-head"><b>Raporlar</b><span>{state.samples.length} alan</span></div>
          <div className="sample-list">
            {state.samples.map((sample) => (
              <button key={sample.id} type="button" className={`sample-item sample-item--${sample.mode} ${sample.id === activeSample.id ? 'is-active' : ''}`} onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}>
                <strong>{sample.number}</strong><span><b>{sample.mode === 'tiiab' ? 'TİİAB' : 'Diğer'}</b><small>{sample.location}</small></span><i>{sample.copiedAt ? '✓' : '•'}</i>
              </button>
            ))}
          </div>

          <div className="add-mode-bar">
            <button type="button" className="add-tiiab" onClick={() => addSample('tiiab')}>＋ TİİAB</button>
            <button type="button" className="add-other" onClick={() => addSample('lap')}>Diğer ＋</button>
          </div>

          <div className="mini-actions"><button onClick={duplicateSample}>Çoğalt</button><button onClick={deleteSample}>Sil</button></div>

          <section className="editor-card">
            <div className="editor-head"><div><span>Rapor {activeSample.number}</span><h2>{activeSample.mode === 'tiiab' ? 'TİİAB' : 'Diğer'}</h2></div><div><button onClick={resetActive}>Sıfırla</button><button onClick={resetAll}>Tümünü sıfırla</button></div></div>
            {activeSample.mode === 'tiiab'
              ? <ThyroidEditor sample={activeSample} template={template} onCycle={cycleOption} onChange={updateActivePatch} />
              : <OtherEditor sample={activeSample} template={template} onCycle={cycleOption} onChange={updateActivePatch} />}
          </section>
        </aside>

        <aside className="preview-panel">
          <div className="preview-head"><div><span>Canlı rapor</span><strong>Tümü</strong></div><button onClick={() => void copyAll()}>Tümünü kopyala</button></div>
          <div className="preview-scroll" ref={previewRef}>
            {state.samples.map((sample) => (
              <div key={sample.id} ref={(node) => { previewItems.current[sample.id] = node; }} className={`preview-report preview-report--${sample.mode} ${sample.id === activeSample.id ? 'is-active' : ''}`} onClick={() => setState((current) => ({ ...current, activeSampleId: sample.id }))}>
                <pre>{generateSampleReportBody(sample)}</pre>
              </div>
            ))}
            <div className="stain-preview"><b>EK BOYALAR</b><p>{stainText}</p></div>
          </div>
          <div className="copy-actions"><button className="primary" onClick={() => void copyActive(false)}>Bu raporu kopyala</button><button disabled={!state.samples[activeIndex + 1]} onClick={() => void copyActive(true)}>Kopyala ve sonraki</button></div>
          <label className="stain-control">Ek boya: <b>{stainCount}</b><input type="number" min="0" value={state.stainCountOverride ?? ''} placeholder="Otomatik" onChange={(event) => setState((current) => ({ ...current, stainCountOverride: event.target.value === '' ? null : Math.max(0, Number(event.target.value)) }))} /></label>
        </aside>
      </main>
      {toast && <div className="toast">{toast.text}</div>}
    </div>
  );
}
