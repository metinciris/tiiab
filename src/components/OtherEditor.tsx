import { DenseSection } from './DenseSection';
import { EditorNotes } from './EditorNotes';
import { OptionalMicroscopySection } from './OptionalMicroscopySection';
import type { ReportSection, ReportTemplate, Sample } from '../types';

const standardLocations = ['Lenf nodu', 'Tiroid loju', 'Paratiroid'];

const diagnosisPriorityByLocation: Record<string, string[]> = {
  'Lenf nodu': [
    'LAP-2-LN-CONTENT',
    'LAP-2-E2',
    'LAP-2-I2',
    'LAP-2-M2',
    'LAP-2-Q2',
    'LAP-2-S2',
    'LAP-2-O2',
  ],
  'Tiroid loju': [
    'LAP-2-I2',
    'LAP-2-M2',
    'LAP-2-Q2',
    'LAP-2-S2',
    'LAP-2-E2',
    'LAP-2-O2',
    'LAP-2-LN-CONTENT',
  ],
  Paratiroid: [
    'LAP-2-I2',
    'LAP-2-E2',
    'LAP-2-M2',
    'LAP-2-Q2',
    'LAP-2-S2',
    'LAP-2-O2',
    'LAP-2-LN-CONTENT',
  ],
};

function prioritizeDiagnosis(section: ReportSection, location: string): ReportSection {
  const priority = diagnosisPriorityByLocation[location];
  if (!priority) return section;

  const rank = new Map(priority.map((id, index) => [id, index]));
  return {
    ...section,
    options: [...section.options].sort((a, b) => (
      (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    )),
  };
}

type Props = {
  sample: Sample;
  template: ReportTemplate;
  specimenOpen: boolean;
  onSpecimenOpenChange: (open: boolean) => void;
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onChange: (patch: Partial<Sample>) => void;
};

export function OtherEditor({
  sample,
  template,
  specimenOpen,
  onSpecimenOpenChange,
  onCycle,
  onChange,
}: Props) {
  const [diagnosis, ...allMicroscopy] = template.sections;
  const prioritizedDiagnosis = prioritizeDiagnosis(diagnosis, sample.location);
  const extraSection = allMicroscopy.find((section) => section.id.endsWith('-extra'));
  const microscopy = allMicroscopy.filter((section) => !section.id.endsWith('-extra'));
  const isCustomLocation = !standardLocations.includes(sample.location);
  const locationLabel = sample.location.trim() || template.defaultLocation;
  const onNoteChange = (sectionId: string, value: string) => onChange({
    sectionNotes: { ...sample.sectionNotes, [sectionId]: value },
    copiedAt: undefined,
  });

  return (
    <div className="mode-editor other-editor">
      <details
        className="specimen-disclosure specimen-disclosure--other"
        open={specimenOpen}
        onToggle={(event) => onSpecimenOpenChange(event.currentTarget.open)}
      >
        <summary><span>Alınma şekli</span><strong>{locationLabel}</strong></summary>
        <div className="specimen-disclosure__body">
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
              onFocus={() => { if (!isCustomLocation) onChange({ location: '', copiedAt: undefined }); }}
              onChange={(event) => onChange({ location: event.target.value, copiedAt: undefined })}
            />
          </label>
        </div>
      </details>

      <DenseSection section={prioritizedDiagnosis} sample={sample} tone="other" onCycle={onCycle} onNoteChange={onNoteChange} />

      <div className="dense-form" aria-label="Diğer sitoloji mikroskopi seçenekleri">
        {microscopy.map((section) => (
          <DenseSection key={section.id} section={section} sample={sample} tone="other" onCycle={onCycle} onNoteChange={onNoteChange} />
        ))}
      </div>

      {extraSection && (
        <OptionalMicroscopySection
          section={extraSection}
          sample={sample}
          tone="other"
          onCycle={onCycle}
          onNoteChange={onNoteChange}
        />
      )}

      <EditorNotes sample={sample} onChange={onChange} />
    </div>
  );
}
