import { cx } from '../../utils/cx';
import styles from './ChoiceGroup.module.css';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  /** Bolinha colorida antes do texto (usada nas categorias). */
  dot?: string;
  /** Cores do botão quando selecionado (usadas nos métodos HTTP). */
  color?: { bg: string; fg: string };
  mono?: boolean;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Grupo de botões em que só um fica selecionado (método HTTP, categoria). */
export function ChoiceGroup<T extends string>({ legend, options, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          const selectedStyle =
            selected && option.color
              ? { backgroundColor: option.color.bg, borderColor: option.color.fg, color: option.color.fg }
              : undefined;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cx(styles.option, option.mono && styles.mono, selected && !option.color && styles.selected)}
              style={selectedStyle}
            >
              {option.dot && <span className={styles.dot} style={{ backgroundColor: option.dot }} />}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
