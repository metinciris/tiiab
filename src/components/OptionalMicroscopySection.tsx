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

export function OptionalMicroscopySection({ section, sample, tone, onCycle, onNoteChange }: Props) {
  const selectedCount = section.options.filter((option) => sample.selections[option.id] !== undefined).length;
  const note = sample.sectionNotes?.[section.id] ?? '';
  const [open, setOpen] = useState(selectedCount > 0 || Boolean(note));
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <details
      className={`optional-microscopy optional-microscopy--${tone}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      style={{ marginTop: 6, border: '1px dashed #b8c4d2', borderRadius: 8, background: '#f8fafc' }}
    >
      <summary style={{ cursor: 'pointer', padding: '7px 9px', fontSize: 12, fontWeight: 800, color: '#33445c' }}>
        Ek mikroskopik bulgular{selectedCount > 0 ? ` (${selectedCount})` : ''}
      </summary>
      <div style={{ padding: '0 8px 8px' }}>
        <div className="dense-option-grid">
          {section.options.map((option) => (
            <ToggleCard
              key={option.id}
              option={option}
              activeIndex={sample.selections[option.id]}
              onCycle={() => onCycle(section.id, option.id, option.variants.length, false)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setNoteOpen((value) => !value)}
          style={{ marginTop: 6, border: note ? '1px solid #138a5b' : '1px solid #cfd7e2', background: note ? '#d9f4e7' : '#fff', color: note ? '#0b5f3e' : '#52627a', borderRadius: 6, padding: '3px 7px', fontSize: 10, fontWeight: 700 }}
        >
          {noteOpen ? 'Elle yazmayı kapat' : 'Elle yaz'}
        </button>
        {noteOpen && (
          <input
            value={note}
            autoFocus
            placeholder="Ek mikroskopik bulgu"
            onChange={(event) => onNoteChange(section.id, event.target.value)}
            style={{ width: '100%', marginTop: 5, border: '1px solid #8fa2b8', borderRadius: 7, padding: '6px 8px', fontSize: 12, background: '#fffdf5' }}
          />
        )}
      </div>
    </details>
  );
}
