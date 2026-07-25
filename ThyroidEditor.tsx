import { ToggleCard } from './ToggleCard';
import type { ReportSection, Sample } from '../types';

type Props = {
  section: ReportSection;
  sample: Sample;
  tone: 'thyroid' | 'other';
  onCycle: (sectionId: string, optionId: string, variantCount: number, exclusive: boolean) => void;
};

export function DenseSection({ section, sample, tone, onCycle }: Props) {
  return (
    <section className={`dense-section dense-section--${tone} ${section.exclusive ? 'is-diagnosis' : ''}`}>
      <div className="dense-section__label">
        <h3>{section.title}</h3>
        <span>{section.exclusive ? 'Tek seçim' : 'Çoklu seçim'}</span>
      </div>
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
    </section>
  );
}
