/** Mensagem de erro se o texto não for JSON válido. Texto vazio é aceito (devolve ''). */
export function jsonError(text: string): string {
  if (!text.trim()) return '';
  try {
    JSON.parse(text);
    return '';
  } catch {
    return 'JSON inválido. Verifique aspas, vírgulas e chaves.';
  }
}

/** JSON indentado para exibição. Se não for JSON válido, devolve o texto como está. */
export function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

/** JSON em uma única linha, para caber no comando curl. */
export function compactJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text.trim();
  }
}
