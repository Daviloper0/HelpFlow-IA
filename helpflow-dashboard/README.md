# HelpFlow – Painel de desenvolvimento

Painel em React + TypeScript (Vite) para testar as rotas da API do HelpFlow, acompanhar o
resultado dos testes e consultar a documentação OpenAPI.

## Como rodar

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run build      # checa os tipos e gera a versão de produção em dist/
```

Requer Node 18 ou mais novo.

## Módulos

| Módulo | O que faz |
| --- | --- |
| **Análise** | Resumo do sistema, indicadores (cadastrados, última execução, aprovados, reprovados), lista dos testes que falharam com janela de detalhes e a situação do arquivo OpenAPI. |
| **Testes de API** | Lista com busca, criação, edição, exclusão, execução individual e "Rodar todos". |
| **Documentação OpenAPI** | Cards de rotas (resumido e ampliado) com exemplo de requisição em curl, resposta de sucesso e erros possíveis. Permite adicionar rotas novas. |

## Estrutura

```
src/
├── App.tsx                 # módulo aberto + dados compartilhados entre módulos
├── components/
│   ├── Sidebar/            # menu lateral
│   └── ui/                 # peças reutilizáveis: Button, Modal, Field, Badges, CodeBlock...
├── modules/
│   ├── analysis/           # tela de Análise
│   ├── tests/              # tela de Testes de API
│   └── docs/               # tela de Documentação OpenAPI
├── hooks/                  # useTests, useDocRoutes, useOpenApiStatus
├── services/
│   ├── api.ts              # camada de API (ponto de ligação com o backend)
│   └── mockData.ts         # dados de exemplo
├── utils/                  # funções puras: validação, JSON, tempo, curl, resumo...
├── constants/http.ts       # métodos, cores, categorias, URL base
├── types/index.ts          # tipos compartilhados
└── styles/global.css       # variáveis de design (cores, fontes)
```

Cada componente tem um arquivo `.module.css` ao lado (CSS Modules). As cores e fontes vêm das
variáveis de `styles/global.css`.

## Ligando ao backend

Todas as chamadas passam por `src/services/api.ts`. Hoje cada função trabalha sobre dados de
exemplo em memória. Para usar o backend em Haskell, troque o corpo de cada função por um
`fetch` (o endereço base fica em `API_BASE_URL`, em `src/constants/http.ts`). As assinaturas
não mudam, então hooks e telas continuam iguais.

O que cada função precisa entregar:

- `listTests`, `createTest`, `updateTest`, `deleteTest`: CRUD dos testes.
- `runTest(test)`: dispara a requisição do teste e devolve `{ actualStatus, at }`.
- `listDocRoutes`, `createDocRoute`: rotas da documentação.
- `getOpenApiStatus`: se o arquivo existe, caminho, data de atualização e resultado da validação.

## Pontos de atenção

- **Comparação do resultado:** hoje um teste passa quando o status recebido é igual ao esperado
  (`utils/testStatus.ts`). A comparação do corpo da resposta com o "valor esperado" precisa ser
  feita pelo backend ao executar o teste. Se for assim, inclua o resultado no retorno de `runTest`.
- **Dados de exemplo:** os testes, rotas e o status do OpenAPI em `services/mockData.ts` são
  inventados. Troque pelos reais.
- **Servidor de exemplo no curl:** `http://localhost:8080` (em `constants/http.ts`).
