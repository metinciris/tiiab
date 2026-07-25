import { DenseSection } from './DenseSection';
import { EditorNotes } from './EditorNotes';
import type { ReportTemplate, Sample } from '../types';

const standardLocations = ['Tiroid loju', 'Paratiroid', 'Lenf nodu'];

type Props = {
  sample: Sample;
  template: ReportTemplate;
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onChange: (patch: Partial<Sample>) => void;
};

export function OtherEditor({ sample, template, onCycle, onChange }: Props) {
  const [diagnosis, ...microscopy] = template.sections;
  const isCustomLocation = !standardLocations.includes(sample.location);

  return (
    <div className="mode-editor other-editor">
      <div className="other-specimen-bar">
        <div className="other-specimen-bar__label">
          <span>Diğer</span>
          <strong>Örnek türü</strong>
        </div>
        <div className="specimen-buttons">
          {standardLocations.map((location) => (
            <button
              type="button"
              key={location}
              className={sample.location === location ? 'is-active' : ''}
              onClick={() => onChange({ location, copiedAt: undefined })}
            >
              {location === 'Lenf nodu' ? 'LAP / Lenf nodu' : location}
            </button>
          ))}
        </div>
        <label className={`custom-location ${isCustomLocation ? 'is-active' : ''}`}>
          <span>Diğer yer</span>
          <input
            value={isCustomLocation ? sample.location : ''}
            placeholder="Serbest örnek yeri"
            onFocus={() => {
              if (!isCustomLocation) onChange({ location: '', copiedAt: undefined });
            }}
            onChange={(event) => onChange({ location: event.target.value, copiedAt: undefined })}
          />
        </label>
      </div>

      <DenseSection section={diagnosis} sample={sample} tone="other" onCycle={onCycle} />

      <div className="dense-form" aria-label="Diğer sitoloji mikroskopi seçenekleri">
        {microscopy.map((section) => (
          <DenseSection key={section.id} section={section} sample={sample} tone="other" onCycle={onCycle} />
        ))}
      </div>

      <EditorNotes sample={sample} onChange={onChange} />
    </div>
  );
}
