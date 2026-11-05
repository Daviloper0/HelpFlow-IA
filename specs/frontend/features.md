# O que está nesse arquivo?
Nesse arquivo estão as features, resumidas, que foram adicionadas ao longo do tempo mas que estão FORA DO SPEC ORIGINAL

# Features

1. [Análise] Janela de análise dos testes que falharam
    * Resposta recebida, além do valor esperado e request realizado [1]
    * Prompt para ajudar na resolução de testes falhados [2]
    * Fechar janela quando clicar fora [3]

2. [Análise] Testes que falharam e que passaram na última execução 
    * Botão de copiar os testes [4], [9]

3. [Estatísticas] Criação do módulo de estatística
    * Tabela com todos os testes [12], chamada Histórico [22] com opção de ocultar alguns testes [12] [96]

4. [Estatísticas] Criação dos gráficos de estatísticas
    * KPIs que indicam os principais dados [Quantos testes já foram rodados, quantos falharam, quantos passaram, duração média, teste mais lento, seta de tendência] [26], [27], [32]
    * Gráfico de porcentagem de testes que estão passando [29], [85]
    * Janelas de contexto nos KPIs [73]
    * Distribuição da duração de testes [75], que inclusive fez uma mudança MUITO importante para o helpflow. Principalmente com a habilidade de ver todos os testes que estão levando um certo tempo [88], [89, substituido pelo bucket], 

5. [Documentação OpenAPI] Criação da documentação OpenAPI à partir de testes
    * Rotas geradas à partir de testes, mas só à partir de um botão que tem um prompt que o usuário cola no harness [58]
    * Mesmo que a IA gere automaticamente, é possível editar, excluir e adicionar testes [65]

