/**
 * Seed script: imports the HelpFlow test suite into the dashboard.
 *
 * Mirrors the test cases from helpflow-backend/test/Tests/RegisterUserSpec.hs
 * and LoginSpec.hs, translated into HTTP API tests the dashboard can execute.
 *
 * Run with: npx tsx scripts/seed-tests.ts
 * Requires the dashboard backend to be running on http://localhost:3001.
 */

const BASE = 'http://localhost:3001';

interface TestInput {
  name: string;
  method: string;
  description: string;
  route: string;
  requestBody: string;
  expectedStatus: number;
  expectedBody: string;
  category: 'success' | 'validation' | 'expected-error';
}

const j = (v: unknown) => JSON.stringify(v, null, 2);

// Credentials used by setupTestUser in the Haskell test suite.
const TEST_USER = {
  registerName: 'Usuario Teste',
  registerEmail: 'emailbomba@email.com',
  registerPassword: 'OutraSenha123@!',
};

const TESTS: TestInput[] = [
  // ── POST /register ──────────────────────────────────────────────────────────
  // Source: helpflow-backend/test/Tests/RegisterUserSpec.hs

  {
    name: 'Registrar usuário válido',
    method: 'POST',
    route: '/register',
    description:
      'Cria um novo usuário com nome, email e senha válidos. ' +
      'Atenção: este teste só passa na primeira execução — na segunda o email já estará cadastrado.',
    requestBody: j({
      registerName: 'Novo Usuario',
      registerEmail: 'novousuario@email.com',
      registerPassword: 'SenhaSuperSegura123@!',
    }),
    expectedStatus: 200,
    expectedBody: j({ responseMessage: 'Usuário registrado com sucesso' }),
    category: 'success',
  },
  {
    name: 'Rejeitar email duplicado',
    method: 'POST',
    route: '/register',
    description:
      'Tenta registrar com um email já cadastrado (emailbomba@email.com). ' +
      'Espera 409 com código email_already_exists.',
    requestBody: j({
      registerName: 'OutroUsuario',
      registerEmail: TEST_USER.registerEmail,
      registerPassword: TEST_USER.registerPassword,
    }),
    expectedStatus: 409,
    expectedBody: '',
    category: 'expected-error',
  },
  {
    name: 'Rejeitar email vazio no registro',
    method: 'POST',
    route: '/register',
    description: 'Campo registerEmail vazio deve ser recusado com 400.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: '', registerPassword: 'SenhaSuperSegura123@' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email começando com @ no registro',
    method: 'POST',
    route: '/register',
    description: 'Email que começa com @ é inválido.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: '@arrobanocomeco@gmail.com', registerPassword: 'SenhaSuperSegura123@' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email começando com . no registro',
    method: 'POST',
    route: '/register',
    description: 'Email que começa com ponto é inválido.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: '.haskelltemsintaxeestranhja@haskell.org', registerPassword: 'SenhaSuperSegura123@' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email com múltiplos @ no registro',
    method: 'POST',
    route: '/register',
    description: 'Email com mais de um @ é inválido.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'naoqueromaisprogramar@@gmail.com', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email terminando com @ no registro',
    method: 'POST',
    route: '/register',
    description: 'Email que termina com @ é inválido.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'porquequeeufuiinventardefazerisso@gmail.com@', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email terminando com . no registro',
    method: 'POST',
    route: '/register',
    description: 'Email que termina com ponto é inválido.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'desenvolvimentoguiadoatipos@ufabc.edu.br.', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar nome vazio no registro',
    method: 'POST',
    route: '/register',
    description: 'Campo registerName vazio deve ser recusado com 400.',
    requestBody: j({ registerName: '', registerEmail: 'novoemail@email.com', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar nome com número no registro',
    method: 'POST',
    route: '/register',
    description: 'Nome com dígito numérico é inválido.',
    requestBody: j({ registerName: 'Haskell da Silva G0mes', registerEmail: 'novoemail@email.com', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar nome com símbolo no registro',
    method: 'POST',
    route: '/register',
    description: 'Nome com caractere especial (ex.: $) é inválido.',
    requestBody: j({ registerName: 'Desenvolvimento Guiado a Tipos$', registerEmail: 'novoemail@email.com', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar nome muito longo no registro',
    method: 'POST',
    route: '/register',
    description: 'Nome acima de 100 caracteres deve ser recusado.',
    requestBody: j({
      registerName: 'Adolph Blaine Charles David Earl Frederick Gerald Hubert Irvin John Kenneth Lloyd Martin Nero Oliver Paul Quincy Randolph Sherman Thomas Uncas Victor William Xerxes Yancy Zeus',
      registerEmail: 'novoemail@email.com',
      registerPassword: 'SenhaSuperSegura123@!',
    }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar nome muito curto no registro',
    method: 'POST',
    route: '/register',
    description: 'Nome com menos de 3 caracteres deve ser recusado.',
    requestBody: j({ registerName: 'hs', registerEmail: 'novoemail@email.com', registerPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha vazia no registro',
    method: 'POST',
    route: '/register',
    description: 'Campo registerPassword vazio deve ser recusado com 400.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: '' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha muito curta no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha com menos de 8 caracteres deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'S$m39@' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha muito longa no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha acima de 64 caracteres deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'H632qnf6IH1tR8mjIM6QYJ4738dK20X800B4Yor3Lc54X4pI6QsIo6E2pv1gy8771' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha com espaços no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha contendo espaços deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 's e n h a' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha sem letra maiúscula no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha sem pelo menos uma letra maiúscula deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'haskelldificil' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha sem letra minúscula no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha sem pelo menos uma letra minúscula deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'SENHAESTRANHA' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha sem caractere especial no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha sem caractere especial deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'As3SenhasAnterioresCairiamNisso' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha sem número no registro',
    method: 'POST',
    route: '/register',
    description: 'Senha sem dígito numérico deve ser recusada.',
    requestBody: j({ registerName: 'UsuarioBomba', registerEmail: 'novoemail@email.com', registerPassword: 'S$nhaSemNumeros' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },

  // ── POST /login ─────────────────────────────────────────────────────────────
  // Source: helpflow-backend/test/Tests/LoginSpec.hs
  // Depends on the test user (emailbomba@email.com / OutraSenha123@!) existing.

  {
    name: 'Login válido',
    method: 'POST',
    route: '/login',
    description: 'Login com email e senha corretos deve retornar 200.',
    requestBody: j({ loginEmail: TEST_USER.registerEmail, loginPassword: TEST_USER.registerPassword }),
    expectedStatus: 200,
    expectedBody: j({ loginMessage: 'Login realizado com sucesso' }),
    category: 'success',
  },
  {
    name: 'Rejeitar email vazio no login',
    method: 'POST',
    route: '/login',
    description: 'Campo loginEmail vazio deve ser recusado com 400.',
    requestBody: j({ loginEmail: '', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email começando com @ no login',
    method: 'POST',
    route: '/login',
    description: 'Email que começa com @ é inválido.',
    requestBody: j({ loginEmail: '@emailbomba.com', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email começando com . no login',
    method: 'POST',
    route: '/login',
    description: 'Email que começa com ponto é inválido.',
    requestBody: j({ loginEmail: '.emailbomba@email.com', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email com múltiplos @ no login',
    method: 'POST',
    route: '/login',
    description: 'Email com mais de um @ é inválido.',
    requestBody: j({ loginEmail: 'email@@bomba@email.com', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email terminando com @ no login',
    method: 'POST',
    route: '/login',
    description: 'Email que termina com @ é inválido.',
    requestBody: j({ loginEmail: 'emailbomba@email.com@', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar email terminando com . no login',
    method: 'POST',
    route: '/login',
    description: 'Email que termina com ponto é inválido.',
    requestBody: j({ loginEmail: 'emailbomba@email.com.', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha vazia no login',
    method: 'POST',
    route: '/login',
    description: 'Campo loginPassword vazio deve ser recusado com 400.',
    requestBody: j({ loginEmail: TEST_USER.registerEmail, loginPassword: '' }),
    expectedStatus: 400,
    expectedBody: '',
    category: 'validation',
  },
  {
    name: 'Rejeitar senha incorreta no login',
    method: 'POST',
    route: '/login',
    description: 'Senha errada para um email válido deve retornar 401 — sem revelar qual campo falhou.',
    requestBody: j({ loginEmail: TEST_USER.registerEmail, loginPassword: 'SenhaErrada123@!' }),
    expectedStatus: 401,
    expectedBody: '',
    category: 'expected-error',
  },
  {
    name: 'Rejeitar email não cadastrado no login',
    method: 'POST',
    route: '/login',
    description: 'Email que não existe na base deve retornar 401.',
    requestBody: j({ loginEmail: 'outro@email.com', loginPassword: 'SenhaSuperSegura123@!' }),
    expectedStatus: 401,
    expectedBody: '',
    category: 'expected-error',
  },
];

async function main() {
  console.log(`Seeding ${TESTS.length} tests into ${BASE}...\n`);

  let created = 0;
  let failed = 0;

  for (const test of TESTS) {
    const res = await fetch(`${BASE}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test),
    });

    if (res.ok) {
      const data = await res.json() as { id: number };
      console.log(`  ✓ [${data.id}] ${test.name}`);
      created++;
    } else {
      const body = await res.text();
      console.error(`  ✗ ${test.name} — HTTP ${res.status}: ${body}`);
      failed++;
    }
  }

  console.log(`\nDone. ${created} created, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
