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
        <div className="section-label-actions">
          <span>{section.exclusive ? 'Tek seçim' : 'Çoklu seçim'}</span>
          <button type="button" className={`inline-note-toggle ${note ? 'has-note' : ''}`} onClick={() => setNoteOpen((open) => !open)}>
            {noteOpen ? 'Kapat' : 'Elle yaz'}
          </button>
        </div>
      </div>
      <div className="dense-section__content">
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
            className="inline-note-input"
            value={note}
            autoFocus
            placeholder={`${section.title} için serbest metin`}
            onChange={(event) => onNoteChange(section.id, event.target.value)}
          />
        )}
      </div>
    </section>
  );
}