/** Junta nomes de classe, ignorando valores vazios. Ex.: cx(styles.card, ativo && styles.ativo). */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
