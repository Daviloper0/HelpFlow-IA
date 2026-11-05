# Definição do Visual do Dashboard
## Testes de API
O dashboard deve possuir um módulo para testar as rotas da API, com um botão de criar manualmente um novo teste, e também de rodar todos os testes de API. Além disso, esse módulo deve ter um mecanismo de pesquisa, para filtrar os testes já adicionados, além disso, todo teste deve ter:
1. um nome que mostre o que o teste deve testar
2. um identificador que mostra qual tipo de requisição HTTP aquele teste deve testar
3. uma descrição que explique o que o teste faz
4. um botão para rodar o teste individualmente 
5. Um botão para editar o teste, que deve abrir uma janela de edição que está definida mais abaixo
6. um botão para excluir o teste

Na janela de edição do teste, devem existir as seguintes seções
1. Campos para editar: nome, identificador e descrição
2. Campos para editar a requisição: rota, objeto que é mandado por HTTP
3. Campos para editar o resultado esperado: HTTP, valor e também categoria do teste (sucesso, validação ou erro esperado)

## Análise
Além do módulo de testes, deve ter um módulo do tipo overview, com nome de análise. Esse módulo deve ser possível de acessar à partir de um menu lateral, assim como o módulo de testar APIs. No módulo de análise, deve possuir uma mensagem com resumo do sistema.

Na tela de visão geral, deve existir:
1. Um card com quantidade de testes cadastrados
2. Quando foi a última execução
3. Quantos foram aprovados
4. Quantos foram reprovados

Abaixo disso, deve existir um resumo dos testes que falharam na última execução, com as seguintes informações:
1. Nome do Teste
2. método HTTP
3. rota
4. mensagem resumida do erro. 
5. Ao selecionar o teste, o desenvolvedor consegue saber os detalhes, e também ir até a tela de testes.

Além disso, deve existir um módulo com a situação da documentação OpenAPI:
1. Mostrar se existe
2. Quando foi atualizada
3. Status de validação
4. Local do arquivo

Tanto a barra lateral quanto o fundo dos módulos deve ir, no mínimo, até o final da tela, independentemente do tamanho, e atualmente isso não está acontecendo na análise
Para todo ponto que não está claro, deve-se duvidar, e confirmar. Não assuma nada.

## Documentação OpenAPI
O módulo documentação OpenAPI deve ter todas as rotas criadas até o momento. 

Deve existir um título, para ocupar um pouco de espaço, e do lado oposto, deve ter um botão para adicionar novas rotas

Cada Card de informação deve ter um modo resumido e um modo ampliado, organizados na seguinte forma

Card Resumido e ampliado:
1. Tipo de requisição HTTP (get, put, patch, etc)
2. Rota da requisição
3. Título da rota

Card Ampliado:
1. Mantém as informações mostradas anteriormente, mas abre mais opções para baixo
2. Deve possuir um exemplo de como fazer uma requisição para aquela rota
3. Um exemplo do que é esperado que retorne, inclusive possíveis erros

Todos os botões de ações, incluindo os botões do menu lateral, devem ter um efeito de hover, que muda levemente a cor.

Ao entrar no módulo da documentação OpenAPI, já aparece uma das rotas expandidas, quando na verdade todas deveriam estar no modo resumido. Além disso, reverta a ideia de não esconder outras rotas quando clicar

No quadrado ao lado esquerdo do título HelpFlow, coloque essa logo no lugar.