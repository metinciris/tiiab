import { DenseSection } from './DenseSection';
import { EditorNotes } from './EditorNotes';
import { OptionalMicroscopySection } from './OptionalMicroscopySection';
import type { ReportTemplate, Sample } from '../types';

type Props = {
  sample: Sample;
  template: ReportTemplate;
  specimenOpen: boolean;
  onSpecimenOpenChange: (open: boolean) => void;
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onChange: (patch: Partial<Sample>) => void;
};

export function ThyroidEditor({
  sample,
  template,
  specimenOpen,
  onSpecimenOpenChange,
  onCycle,
  onChange,
}: Props) {
  const [diagnosis, ...allMicroscopy] = template.sections;
  const extraSection = allMicroscopy.find((section) => section.id.endsWith('-extra'));
  const microscopy = allMicroscopy.filter((section) => !section.id.endsWith('-extra'));
  const isCustomLocation = sample.location !== 'Tiroid';
  const locationLabel = sample.location.trim() || 'Tiroid';
  const onNoteChange = (sectionId: string, value: string) => onChange({
    sectionNotes: { ...sample.sectionNotes, [sectionId]: value },
    copiedAt: undefined,
  });

  return (
    <div className="mode-editor thyroid-editor">
      <details
        className="specimen-disclosure specimen-disclosure--thyroid"
        open={specimenOpen}
        onToggle={(event) => onSpecimenOpenChange(event.currentTarget.open)}
      >
        <summary><span>Alınma şekli</span><strong>{locationLabel}</strong></summary>
        <div className="specimen-disclosure__body">
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
      </details>

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
