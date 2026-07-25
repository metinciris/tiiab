import type { Sample } from '../types';

type Props = {
  sample: Sample;
  onChange: (patch: Partial<Sample>) => void;
};

export function EditorNotes({ sample, onChange }: Props) {
  const hasText = Boolean(sample.diagnosisNote.trim() || sample.microscopyNote.trim());

  return (
    <details className="notes-disclosure" open={hasText || undefined}>
      <summary>Serbest tanı / mikroskopi notu</summary>
      <div className="notes-grid">
        <label>
          <span>Tanı serbest metni</span>
          <textarea
            rows={2}
            value={sample.diagnosisNote}
            onChange={(event) => onChange({ diagnosisNote: event.target.value, copiedAt: undefined })}
            placeholder="Gerekirse ek tanı veya yorum..."
          />
        </label>
        <label>
          <span>Mikroskopi serbest metni</span>
          <textarea
            rows={2}
            value={sample.microscopyNote}
            onChange={(event) => onChange({ microscopyNote: event.target.value, copiedAt: undefined })}
            placeholder="Gerekirse ek mikroskopi notu..."
          />
        </label>
      </div>
    </details>
  );
}
