import type { ReactNode } from 'react';
import type { View } from '../../types';
import { cx } from '../../utils/cx';
import { BarChartIcon, FileTextIcon, FlaskIcon, TrendingUpIcon } from '../ui/icons';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { view: View; label: string; icon: ReactNode }[] = [
  { view: 'analysis', label: 'Análise', icon: <BarChartIcon /> },
  { view: 'statistics', label: 'Estatísticas', icon: <TrendingUpIcon /> },
  { view: 'tests', label: 'Testes de API', icon: <FlaskIcon /> },
  { view: 'docs', label: 'Documentação OpenAPI', icon: <FileTextIcon /> },
];

interface SidebarProps {
  current: View;
  onChange: (view: View) => void;
}

/** Menu lateral com a marca do HelpFlow e os três módulos. */
export function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo do HelpFlow" />
        <div className={styles.brandText}>
          <span className={styles.name}>HelpFlow</span>
          <span className={styles.tagline}>Painel de desenvolvimento</span>
        </div>
      </div>

      <nav aria-label="Módulos" className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            type="button"
            aria-current={item.view === current ? 'page' : undefined}
            className={cx(styles.item, item.view === current && styles.active)}
            onClick={() => onChange(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
