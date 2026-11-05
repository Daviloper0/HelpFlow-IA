/** Minúsculas e sem acentos, para a busca ignorar maiúsculas e acentuação. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
