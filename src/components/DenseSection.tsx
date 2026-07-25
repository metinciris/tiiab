import { useState } from 'react';
import { ToggleCard } from './ToggleCard';
import type { ReportSection, Sample } from '../types';

type Props = {
  section: ReportSection;
  sample: Sample;
  tone: 'thyroid' | 'other';
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onNoteChange: (sectionId: string, value: string) => void;
};

export function DenseSection({ section, sample, tone, onCycle, onNoteChange }: Props) {
  const [noteOpen, setNoteOpen] = useState(Boolean(sample.sectionNotes?.[section.id]));
  const note = sample.sectionNotes?.[section.id] ?? '';

  return (
    <section className={`dense-section dense-section--${tone} ${section.exclusive ? 'is-diagnosis' : ''}`}>
      <div className="dense-section__label">
        <h3>{section.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
          <span>{section.exclusive ? 'Tek seçim' : 'Çoklu seçim'}</span>
          <button
            type="button"
            onClick={() => setNoteOpen((open) => !open)}
            style={{
              border: note ? '1px solid #138a5b' : '1px solid #cfd7e2',
              background: note ? '#d9f4e7' : '#fff',
              color: note ? '#0b5f3e' : '#52627a',
              borderRadius: 6,
              padding: '2px 5px',
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {noteOpen ? 'Kapat' : 'Elle yaz'}
          </button>
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="dense-option-grid">
          {section.options.map((option) => (
            <ToggleCard
              key={option.id}
              option={option}
              activeIndex={sample.selections[option.id]}
              onCycle={() => onCycle(section.id, option.id, option.variants.length, Boolean(section.exclusive))}
            />
          ))}
        </div>
        {noteOpen && (
          <input
            value={note}
            autoFocus
            placeholder={`${section.title} için serbest metin`}
            onChange={(event) => onNoteChange(section.id, event.target.value)}
            style={{
              width: '100%',
              marginTop: 5,
              border: '1px solid #8fa2b8',
              borderRadius: 7,
              padding: '6px 8px',
              fontSize: 12,
              background: '#fffdf5',
            }}
          />
        )}
      </div>
    </section>
  );
}