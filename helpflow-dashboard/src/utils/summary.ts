import type { OpenApiStatus, OpenApiValidation, StatusCounts } from '../types';

export type SummaryTone = 'bad' | 'info' | 'good';

export interface Summary {
  text: string;
  tone: SummaryTone;
}

const OPENAPI_SENTENCES: Record<OpenApiValidation, string> = {
  valid: 'A documentação OpenAPI está válida.',
  warnings: 'A documentação OpenAPI tem avisos de validação.',
  invalid: 'A documentação OpenAPI está inválida.',
  unvalidated: 'A documentação OpenAPI ainda não foi validada.',
};

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/** Gera a mensagem de resumo do sistema a partir dos números atuais. */
export function buildSummary(counts: StatusCounts, openApi: OpenApiStatus | null): Summary {
  let text: string;

  if (counts.total === 0) {
    text = 'Nenhum teste cadastrado ainda.';
  } else {
    text = `${counts.pass} de ${counts.total} ${plural(counts.total, 'teste aprovado.', 'testes aprovados.')}`;
    if (counts.fail > 0) {
      text += ` ${counts.fail} ${plural(counts.fail, 'falha pede atenção.', 'falhas pedem atenção.')}`;
    }
    if (counts.idle > 0) {
      text += ` ${counts.idle} ${plural(counts.idle, 'teste ainda não foi executado.', 'testes ainda não foram executados.')}`;
    }
    if (counts.fail === 0 && counts.idle === 0) {
      text += ' Nenhuma falha na última execução.';
    }
  }

  if (openApi) {
    text += ' ' + (openApi.exists ? OPENAPI_SENTENCES[openApi.validation] : 'A documentação OpenAPI não foi encontrada.');
  }

  let tone: SummaryTone = 'good';
  if (counts.fail > 0) tone = 'bad';
  else if (counts.idle > 0 || counts.total === 0) tone = 'info';

  return { text, tone };
}
