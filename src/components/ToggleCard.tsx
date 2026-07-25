import type { ReportOption } from '../types';

type Props = {
  option: ReportOption;
  activeIndex: number | undefined;
  onCycle: () => void;
};

export function ToggleCard({ option, activeIndex, onCycle }: Props) {
  const active = activeIndex !== undefined;
  const text = active ? option.variants[activeIndex] : option.label;
  const hasVariants = option.variants.length > 1;

  return (
    <button
      type="button"
      className={`toggle-card ${active ? 'is-active' : ''} ${option.tumorRelated ? 'is-tumor' : ''}`}
      onClick={onCycle}
      title={hasVariants ? 'Tekrar tıklayınca sonraki seçenek açılır; son seçenekten sonra pasif olur.' : undefined}
      aria-pressed={active}
    >
      <span className="toggle-card__text">{text}</span>
      <span className="toggle-card__meta" aria-hidden="true">
        {active && <span className="selected-mark">✓</span>}
        {hasVariants ? `${active ? activeIndex + 1 : 0}/${option.variants.length}` : (active ? 'Seçili' : '')}
      </span>
    </button>
  );
}
