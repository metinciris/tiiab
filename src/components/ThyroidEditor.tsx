import { DenseSection } from './DenseSection';
import { EditorNotes } from './EditorNotes';
import { OptionalMicroscopySection } from './OptionalMicroscopySection';
import type { ReportTemplate, Sample } from '../types';

type Props = {
  sample: Sample;
  template: ReportTemplate;
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onChange: (patch: Partial<Sample>) => void;
};

export function ThyroidEditor({ sample, template, onCycle, onChange }: Props) {
  const [diagnosis, ...allMicroscopy] = template.sections;
  const extraSection = allMicroscopy.find((section) => section.id.endsWith('-extra'));
  const microscopy = allMicroscopy.filter((section) => !section.id.endsWith('-extra'));
  const isCustomLocation = sample.location !== 'Tiroid';
  const onNoteChange = (sectionId: string, value: string) => onChange({
    sectionNotes: { ...sample.sectionNotes, [sectionId]: value },
    copiedAt: undefined,
  });

  return (
    <div className="mode-editor thyroid-editor">
      <div className="mode-intro mode-intro--thyroid">
        <div>
          <span>TİİAB</span>
          <strong>Bethesda tanısı ve tiroid morfolojisi</strong>
        </div>
        <div className="specimen-buttons">
          <button type="button" className={!isCustomLocation ? 'is-active' : ''} onClick={() => onChange({ location: 'Tiroid', copiedAt: undefined })}>Tiroid</button>
        </div>
        <label className={`custom-location ${isCustomLocation ? 'is-active' : ''}`}>
          <span>Diğer yer</span>
          <input
            value={isCustomLocation ? sample.location : ''}
            placeholder="Örn. sağ lob üst pol"
            onFocus={() => { if (!isCustomLocation) onChange({ location: '', copiedAt: undefined }); }}
            onChange={(event) => onChange({ location: event.target.value, copiedAt: undefined })}
          />
        </label>
      </div>

      <DenseSection section={diagnosis} sample={sample} tone="thyroid" onCycle={onCycle} onNoteChange={onNoteChange} />

      <div className="dense-form" aria-label="Tiroid mikroskopi seçenekleri">
        {microscopy.map((section) => (
          <DenseSection key={section.id} section={section} sample={sample} tone="thyroid" onCycle={onCycle} onNoteChange={onNoteChange} />
        ))}
      </div>

      {extraSection && (
        <OptionalMicroscopySection
          section={extraSection}
          sample={sample}
          tone="thyroid"
          onCycle={onCycle}
          onNoteChange={onNoteChange}
        />
      )}

      <EditorNotes sample={sample} onChange={onChange} />
    </div>
  );
}
