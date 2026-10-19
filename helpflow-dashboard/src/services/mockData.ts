import type { ApiTest, DocRoute, OpenApiStatus } from '../types';

// Dados de exemplo. Enquanto o backend não está ligado, a camada de API (api.ts)
// serve estes dados. Troque pelas rotas e testes reais do HelpFlow.

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const now = Date.now();

const json = (value: unknown) => JSON.stringify(value, null, 2);

const exampleTicket = {
  id: 1,
  titulo: 'Impressora sem toner',
  descricao: 'A impressora do 2º andar não imprime',
  prioridade: 'media',
  status: 'aberto',
};

export const seedTests: ApiTest[] = [
  {
    id: 1,
    name: 'Criar chamado com dados válidos',
    method: 'POST',
    description: 'Envia um chamado completo e espera 201 com o chamado criado e status inicial aberto.',
    route: '/api/tickets',
    requestBody: json({ titulo: 'Impressora sem toner', descricao: 'A impressora do 2º andar não imprime', prioridade: 'media' }),
    expectedStatus: 201,
    expectedBody: json({ id: 1, status: 'aberto' }),
    category: 'success',
    lastRun: { actualStatus: 201, at: now - 42 * MINUTE, passed: true, failureMessage: '' },
  },
  {
    id: 2,
    name: 'Rejeitar chamado sem título',
    method: 'POST',
    description: 'Campo obrigatório ausente deve ser recusado antes de chegar ao banco.',
    route: '/api/tickets',
    requestBody: json({ descricao: 'Sem título' }),
    expectedStatus: 400,
    expectedBody: json({ erro: 'campo titulo é obrigatório' }),
    category: 'validation',
    lastRun: { actualStatus: 400, at: now - 42 * MINUTE, passed: true, failureMessage: '' },
  },
  {
    id: 3,
    name: 'Listar chamados abertos',
    method: 'GET',
    description: 'Filtra a listagem pelo status aberto e confere o formato da lista retornada.',
    route: '/api/tickets?status=aberto',
    requestBody: '',
    expectedStatus: 200,
    expectedBody: json({ total: 1 }),
    category: 'success',
    lastRun: { actualStatus: 200, at: now - 42 * MINUTE, passed: true, failureMessage: '' },
  },
  {
    id: 4,
    name: 'Buscar chamado inexistente',
    method: 'GET',
    description: 'Um identificador que não existe deve responder 404 com mensagem clara.',
    route: '/api/tickets/9999',
    requestBody: '',
    expectedStatus: 404,
    expectedBody: json({ erro: 'chamado não encontrado' }),
    category: 'expected-error',
  },
  {
    id: 5,
    name: 'Atualizar prioridade do chamado',
    method: 'PATCH',
    description: 'Altera somente a prioridade e mantém os demais campos intactos.',
    route: '/api/tickets/1',
    requestBody: json({ prioridade: 'alta' }),
    expectedStatus: 200,
    expectedBody: json({ prioridade: 'alta' }),
    category: 'success',
  },
  {
    id: 6,
    name: 'Rejeitar prioridade fora do tipo',
    method: 'PATCH',
    description: 'Um valor que não existe no tipo Prioridade deve ser recusado com 422, não com erro interno.',
    route: '/api/tickets/1',
    requestBody: json({ prioridade: 'urgentissima' }),
    expectedStatus: 422,
    expectedBody: json({ erro: 'prioridade inválida' }),
    category: 'validation',
    lastRun: { actualStatus: 500, at: now - 42 * MINUTE, passed: false, failureMessage: 'Status: esperado 422, recebido 500' },
  },
  {
    id: 7,
    name: 'Substituir chamado completo',
    method: 'PUT',
    description: 'Reenvia todos os campos do chamado e espera a versão atualizada.',
    route: '/api/tickets/1',
    requestBody: json({ titulo: 'Impressora sem toner (resolvido)', descricao: 'Toner trocado', prioridade: 'baixa' }),
    expectedStatus: 200,
    expectedBody: json({ titulo: 'Impressora sem toner (resolvido)' }),
    category: 'success',
  },
  {
    id: 8,
    name: 'Login com senha incorreta',
    method: 'POST',
    description: 'Credenciais inválidas devem responder 401 sem revelar qual campo falhou.',
    route: '/api/auth/login',
    requestBody: json({ email: 'ana@exemplo.com', senha: 'errada' }),
    expectedStatus: 401,
    expectedBody: json({ erro: 'credenciais inválidas' }),
    category: 'expected-error',
  },
  {
    id: 9,
    name: 'Excluir chamado',
    method: 'DELETE',
    description: 'Remove o chamado e espera 204 sem corpo na resposta.',
    route: '/api/tickets/1',
    requestBody: '',
    expectedStatus: 204,
    expectedBody: '',
    category: 'success',
  },
];

/**
 * Status que o "servidor de mentira" devolve por id de teste. Quem não está aqui
 * responde exatamente o status esperado. O teste 6 simula um erro interno (500).
 */
export const mockServerStatus = new Map<number, number>([[6, 500]]);

export const seedDocRoutes: DocRoute[] = [
  {
    id: 1,
    method: 'POST',
    route: '/api/tickets',
    title: 'Criar chamado',
    requestBody: json({ titulo: 'Impressora sem toner', descricao: 'A impressora do 2º andar não imprime', prioridade: 'media' }),
    successStatus: 201,
    successBody: json(exampleTicket),
    errors: [
      { status: 400, body: json({ erro: 'campo titulo é obrigatório' }) },
      { status: 422, body: json({ erro: 'prioridade inválida' }) },
    ],
  },
  {
    id: 2,
    method: 'GET',
    route: '/api/tickets',
    title: 'Listar chamados',
    requestBody: '',
    successStatus: 200,
    successBody: json({ itens: [exampleTicket], total: 1 }),
    errors: [{ status: 400, body: json({ erro: 'status inválido' }) }],
  },
  {
    id: 3,
    method: 'GET',
    route: '/api/tickets/{id}',
    title: 'Buscar chamado por id',
    requestBody: '',
    successStatus: 200,
    successBody: json(exampleTicket),
    errors: [{ status: 404, body: json({ erro: 'chamado não encontrado' }) }],
  },
  {
    id: 4,
    method: 'PUT',
    route: '/api/tickets/{id}',
    title: 'Substituir chamado',
    requestBody: json({ titulo: 'Impressora sem toner (resolvido)', descricao: 'Toner trocado', prioridade: 'baixa' }),
    successStatus: 200,
    successBody: json({ ...exampleTicket, titulo: 'Impressora sem toner (resolvido)', descricao: 'Toner trocado', prioridade: 'baixa' }),
    errors: [
      { status: 400, body: json({ erro: 'campo titulo é obrigatório' }) },
      { status: 404, body: json({ erro: 'chamado não encontrado' }) },
    ],
  },
  {
    id: 5,
    method: 'PATCH',
    route: '/api/tickets/{id}',
    title: 'Atualizar campos do chamado',
    requestBody: json({ prioridade: 'alta' }),
    successStatus: 200,
    successBody: json({ id: 1, prioridade: 'alta' }),
    errors: [
      { status: 404, body: json({ erro: 'chamado não encontrado' }) },
      { status: 422, body: json({ erro: 'prioridade inválida' }) },
    ],
  },
  {
    id: 6,
    method: 'DELETE',
    route: '/api/tickets/{id}',
    title: 'Excluir chamado',
    requestBody: '',
    successStatus: 204,
    successBody: '',
    errors: [{ status: 404, body: json({ erro: 'chamado não encontrado' }) }],
  },
  {
    id: 7,
    method: 'POST',
    route: '/api/auth/login',
    title: 'Autenticar usuário',
    requestBody: json({ email: 'ana@exemplo.com', senha: 'senha-de-exemplo' }),
    successStatus: 200,
    successBody: json({ token: 'eyJhbGciOi...' }),
    errors: [{ status: 401, body: json({ erro: 'credenciais inválidas' }) }],
  },
];

export const seedOpenApiStatus: OpenApiStatus = {
  exists: true,
  path: 'docs/openapi.yaml',
  updatedAt: now - 3 * DAY,
  validation: 'warnings',
  note: '2 avisos de validação encontrados.',
};
