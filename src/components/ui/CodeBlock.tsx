import { cx } from '../../utils/cx';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  children: string;
  /** "dark" para exemplos de código; "light" para dados dentro de janelas. */
  tone?: 'dark' | 'light';
  /** Quebra linhas longas em vez de criar rolagem horizontal. */
  wrap?: boolean;
}

export function CodeBlock({ children, tone = 'dark', wrap = false }: CodeBlockProps) {
  return <pre className={cx(styles.code, styles[tone], wrap && styles.wrap)}>{children}</pre>;
}
