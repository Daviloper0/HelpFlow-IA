# Sobre o HelpFlow Dashboard

## O que é o HelpFlow Dashboard
O HelpFlow Dashboard é uma ferramenta de análise e teste de API feita especificamente para o [HelpFlow](https://github.com/Daviloper0/helpflow). No sistema, é possível testar, verificar o motivo que alguns testes falharam, verificar estatísticas sobre o histórico de testes, assim como gerar documentação OpenAPI baseado nos testes (EXPLICAR O MOTIVO DISSO). Ele foi feito para ser compatível com o [HelpFlow](https://github.com/Daviloper0/helpflow), mas pode ser que eu aumente o escopo no futuro

## Por que era necessário um dashboard para o HelpFlow?
Contextualizando, o [HelpFlow](https://github.com/Daviloper0/helpflow) é um backend de um sistema de gerenciamento de tickets feito em Haskell, como projeto final de uma disciplina da faculdade. O projeto tinha sido feito com um prazo de desenvolvimento curto, pois o quadrimestre na UFABC é muito mais curto que um semestre tradicional, e além disso, não tinha conhecimento algum de haskell antes de entrar na disciplina, o que agravou ainda mais o desenvolvimento.

Por conta desses detalhes, o HelpFlow, apesar dos tipos garantirem mudanças apenas para estados válidos, e existir alguns testes para verificar o comportamento das funções internas do backend, eu não tinha nenhum programa que testava a API de forma automática e gerava um relatório para isso. Os testes de API eram feitos com o Insomnia, mas não era uma suíte automatizada. Além disso, outra coisa que não tinha conseguido fazer para o HelpFlow era um banco de dados separado para testes. E que ainda não está feito, mas pretendo adicionar.

Resumindo: Sem testes, o HelpFlow, mesmo com os tipos garantindo algumas coisas, ainda estava frágil.

Essas são as razões porque um dashboard era necessário, mas não explicam o porquê de eu fazer.

Eu nunca tinha reparado isso antes, mas mesmo com grande interesse por inteligência artificial (no geral), eu nunca tinha parado para usar de verdade uma das vertentes de IA que mais avançaram nos últimos 5 anos, que são as LLMs, junto com os harness. Eu via muitas pessoas criando sites e aplicativos inteiros utilizando IA, e aquilo aguçava a minha curiosidade, mas, para mim, nunca tinha feito sentido testar algo sem ter a base técnica por trás, e então, continuei estudando assuntos de programação, no geral.

Em um processo seletivo de uma grande empresa, eu passei para etapa que eu deveria mostrar o meu melhor projeto com IA, mas eu não tinha nada que usasse IA intensivamente, e então decidi fazer algo que nunca tinha feito antes, que é "vibecodar" um projeto inteiro com IA, e nada melhor do que resolver um problema que eu tive em outro projeto, que já conheço.

# Como a primeira parte do dashboard foi feita?

Como eu não tinha assinatura de nenhuma IA, a ideia inicial era basicamente usar a versão online do Claude para gerar o esboço inicial do dashboard, e depois baixar o resultado e ir fazendo sem agente nenhum, por não ser possível. Mas depois de começar, eu peguei o gosto e assinei o claude code.

O prompt inicial, com as especificações que deveriam ter no dashboard, estão no .prompts/dashboard-vspec.md
Depois, o backend do dashboard foi desenvolvido como no .prompts/dashboard-bspec.md

# Como o desenvolvimento prosseguiu até chegar na transição para o SDD?
Em geral, o desenvolvimento prosseguiu incrementalmente, literalmente vibecodando. Se tinha erro, eu mandava pra IA corrigir, e se não tinha, adicionava novas features. Existe um log dos meus prompts em .prompts/backend ou .prompts/frontend, mas também estou deixando de maneira mais compacta nessas mesmas pastas, para que fique de fácil compreensão, o que foi feito até agora, e quais erros deram. Talvez depois até adicione algum visual que explique melhor. Ao lado de cada feature, adicionei um [n], onde n é a ordem na qual aquilo aconteceu, tanto no log completo, quanto no resumido, mas separado entre backend e frontend. Alguns prompts eram tanto para o frontend quanto para o backend, mas eu separei. Se por algum motivo você queira ver isso, só olhar o histórico de commits até o "Tentativa de prompt automático". Também é necessário deixar claro, que apesar de algumas mudanças terem sido no visual (e por isso o prompt em frontend), também foram feitas alterações no código do backend, às vezes para dar uma informação adicional que não existia antes.

# O que vem na transição para o SDD?
Não é exatamente SDD porque já estou no meio do projeto, e em todas fontes que eu vi, primeiro deveria ter feito as especificações, para depois escrever código. Mas ainda acho que as mudanças valem a pena.


# Como rodar:
Necessário Desktop Development with C++, disponível pelo Visual Studio Installer, e o Node JS
Dentro de helpflow-dashboard, rodar:
* npm run dev (rodar frontend)
e depois: cd server
e por fim: npm run dev novamente
