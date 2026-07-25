import { DenseSection } from './DenseSection';
import { EditorNotes } from './EditorNotes';
import type { ReportTemplate, Sample } from '../types';

type Props = {
  sample: Sample;
  template: ReportTemplate;
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
  onChange: (patch: Partial<Sample>) => void;
};

export function ThyroidEditor({ sample, template, onCycle, onChange }: Props) {
  const [diagnosis, ...microscopy] = template.sections;

  return (
    <div className="mode-editor thyroid-editor">
      <div className="mode-intro mode-intro--thyroid">
        <div>
          <span>TİİAB</span>
          <strong>Bethesda tanısı ve tiroid morfolojisi</strong>
        </div>
        <div className="fixed-location">Örnek yeri: <b>Tiroid</b></div>
      </div>

      <DenseSection section={diagnosis} sample={sample} tone="thyroid" onCycle={onCycle} />

      <div className="dense-form" aria-label="Tiroid mikroskopi seçenekleri">
        {microscopy.map((section) => (
          <DenseSection key={section.id} section={section} sample={sample} tone="thyroid" onCycle={onCycle} />
        ))}
      </div>

      <EditorNotes sample={sample} onChange={onChange} />
    </div>
  );
}
