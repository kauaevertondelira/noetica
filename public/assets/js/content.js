// Conteúdo editorial da Noética. IDs são estáveis para preservar o progresso.
export const courses = [
  { id: 'fundamentos', number: '01', title: 'Comece pelo essencial.', short: 'Fundamentos da programação', category: 'Iniciante', description: 'Entenda o que acontece por trás de uma interface. Dê seus primeiros passos com HTML, CSS, JavaScript e IA.', output: 'Uma página interativa feita por você', icon: 'code', lessons: ['mentalidade', 'html', 'css', 'javascript'] },
  { id: 'ia', number: '02', title: 'Converse. Construa. Entenda.', short: 'IA como parceira de código', category: 'Iniciante', description: 'Transforme uma ideia em instruções claras. Aprenda a revisar, depurar e melhorar o código que a IA entrega.', output: 'Um briefing e um fluxo de revisão', icon: 'spark', lessons: ['briefing', 'prompts', 'debug', 'acessibilidade'] },
  { id: 'projeto', number: '03', title: 'Tire sua ideia do papel.', short: 'Seu primeiro projeto', category: 'Prática guiada', description: 'Conecte as peças: dados, versionamento, segurança e publicação. Crie algo pequeno que resolva um problema real.', output: 'Um projeto pronto para apresentar', icon: 'rocket', lessons: ['dados', 'git', 'seguranca', 'publicacao'] },
];

export const lessons = [
  {
    id: 'mentalidade', title: 'Você pensa. A IA ajuda a construir.', minutes: 10,
    intro: 'Programar é transformar uma intenção em passos que o computador consegue executar. A IA acelera a escrita, mas a intenção e a revisão continuam sendo suas.',
    sections: [
      ['O que é vibe coding?', 'É construir software conversando com uma IA e experimentando as respostas. Para aprender de verdade, vá além de aceitar o resultado: leia o código, altere uma parte e explique o efeito. Não é preciso decorar tudo para começar.'],
      ['Pense em entrada, processo e saída', 'Em uma lista de tarefas, a entrada é o texto digitado. O processo valida esse texto e o adiciona a uma lista. A saída é a tarefa aparecendo na tela. Dividir um problema assim ajuda você a pedir mudanças pequenas e verificáveis.'],
      ['Um ciclo que ensina', 'Descreva uma mudança → peça uma explicação → execute → teste → ajuste. Se uma resposta parecer confusa, peça um exemplo menor. A IA pode inventar funções ou produzir código que funciona apenas em um caso; testar faz parte do trabalho.'],
    ],
    code: 'Entrada: título de uma tarefa\nRegra: rejeitar títulos vazios\nProcesso: adicionar a tarefa à lista\nSaída: mostrar a tarefa e limpar o campo',
    challenge: 'Escolha algo simples, como um contador ou uma lista de compras. Descreva a entrada, uma regra e a saída esperada em suas anotações.',
    prompt: 'Quero aprender criando uma lista de tarefas. Explique entrada, processo e saída com um exemplo simples. Não gere uma aplicação inteira. Faça uma pergunta para verificar se eu entendi.',
    quiz: { question: 'A IA entregou um código que parece funcionar. Qual é o próximo passo?', options: ['Publicar imediatamente', 'Ler, testar casos diferentes e entender o resultado', 'Pedir uma versão maior sem testar'], answer: 1, explanation: 'A aparência de funcionamento não garante correção. Ler e testar ajudam você a reconhecer limites e aprender com a solução.' },
    resource: ['Primeiros passos na Web · MDN', 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Getting_started'],
  },
  {
    id: 'html', title: 'HTML: dê significado à página.', minutes: 15,
    intro: 'HTML organiza o conteúdo. Antes das cores e das animações, uma boa interface começa com uma estrutura que faça sentido.',
    sections: [
      ['Elementos são peças com significado', 'Um h1 apresenta o título principal; p contém um parágrafo; a leva a outro endereço; button executa uma ação. Usar a peça certa facilita a leitura do código e o acesso por teclado e leitores de tela.'],
      ['Conteúdo e atributos', 'Em <a href="https://example.com">Visitar</a>, href é o atributo que define o destino, e Visitar é o texto do link. Atributos complementam um elemento. Um input deve ter um label associado pelo mesmo id.'],
      ['Estruture antes de decorar', 'Use header para a abertura, nav para navegação, main para o conteúdo principal e footer para o rodapé. Mantenha uma hierarquia de títulos: h1, depois h2 para seções e h3 para subseções.'],
    ],
    code: '<main>\n  <h1>Meu primeiro projeto</h1>\n  <p>Uma ideia pequena, um começo real.</p>\n  <a href="#sobre">Conheça a ideia</a>\n  <section id="sobre">\n    <h2>Por que eu estou criando isso?</h2>\n    <p>Para ajudar pessoas a organizar seus estudos.</p>\n  </section>\n</main>',
    challenge: 'No laboratório abaixo, troque o título e a descrição. Acrescente uma seção com três coisas que seu projeto vai fazer usando uma lista ul com itens li.',
    prompt: 'Revise este HTML para uma pessoa iniciante. Verifique a hierarquia de títulos e o uso de links e botões. Explique cada correção, sem adicionar bibliotecas. Código: [cole aqui].',
    quiz: { question: 'Qual elemento é adequado para uma ação como “Salvar anotação”?', options: ['div com texto', 'a sem destino', 'button'], answer: 2, explanation: 'button representa uma ação e já funciona com teclado. Um link a é usado para navegar para um destino.' },
    resource: ['HTML · MDN', 'https://developer.mozilla.org/pt-BR/docs/Web/HTML'],
  },
  {
    id: 'css', title: 'CSS: forma, espaço e intenção.', minutes: 15,
    intro: 'CSS define como a estrutura aparece. Comece com poucos valores consistentes e um layout que se adapte ao espaço disponível.',
    sections: [
      ['Seletores e propriedades', 'Uma regra CSS escolhe elementos e define propriedades. Em .cartao { padding: 24px; }, o seletor .cartao encontra elementos com essa classe. padding cria espaço dentro da caixa; margin cria espaço fora dela.'],
      ['Uma tela não tem tamanho fixo', 'Use max-width para limitar linhas muito compridas, width: 100% para ocupar o espaço disponível e unidades relativas quando fizer sentido. Um layout em grid pode reorganizar colunas sem depender de larguras rígidas.'],
      ['Estados também fazem parte do desenho', 'Um botão precisa ter foco visível para quem usa teclado. Texto deve ser legível sobre o fundo. Teste a tela estreita e o zoom do navegador: conteúdo cortado é um problema de uso, mesmo que a tela maior esteja bonita.'],
    ],
    code: '<style>\n  * { box-sizing: border-box; }\n  .cartao { max-width: 480px; padding: 24px; border: 1px solid #f6b205; border-radius: 16px; }\n  h1 { color: #f6b205; }\n  button { padding: 12px 20px; cursor: pointer; }\n  button:focus-visible { outline: 3px solid #f6b205; outline-offset: 4px; }\n</style>\n<article class="cartao">\n  <h1>Pequenos passos.</h1>\n  <p>Grandes possibilidades.</p>\n  <button>Experimentar</button>\n</article>',
    challenge: 'Mude o espaçamento e a cor do título. Adicione um segundo cartão. Use display: grid e gap no elemento que contém os dois.',
    prompt: 'Ajude a tornar este layout responsivo. Preserve as cores e a identidade. Explique box-sizing, max-width e grid com mudanças pequenas. Verifique foco de teclado. Código: [cole aqui].',
    quiz: { question: 'Qual propriedade cria espaço dentro da borda de um elemento?', options: ['padding', 'margin', 'color'], answer: 0, explanation: 'padding é o espaço interno. margin separa o elemento dos seus vizinhos.' },
    resource: ['CSS · MDN', 'https://developer.mozilla.org/pt-BR/docs/Web/CSS'],
  },
  {
    id: 'javascript', title: 'JavaScript: da tela à interação.', minutes: 20,
    intro: 'JavaScript permite reagir a eventos, tomar decisões e atualizar a página. Vamos começar com um contador, sem instalar nenhuma biblioteca.',
    sections: [
      ['Dados que mudam', 'Uma variável guarda um valor. Use let quando você for atribuir um novo valor e const quando não for reatribuir a variável. No contador, let total = 0 representa o estado inicial.'],
      ['Eventos conectam intenção e resposta', 'addEventListener escuta um evento, como click. A função passada ao evento só roda quando ele acontece. Uma condição if permite decidir, por exemplo, se há texto suficiente para salvar uma tarefa.'],
      ['Atualize o conteúdo com segurança', 'querySelector encontra um elemento da página. textContent altera seu texto. Ao mostrar uma entrada do usuário, prefira textContent a innerHTML: assim, um texto que contém tags não é interpretado como código HTML.'],
    ],
    code: '<h1>Contador de ideias</h1>\n<p>Ideias: <strong id="total">0</strong></p>\n<button id="adicionar">Mais uma ideia</button>\n<script>\n  let total = 0;\n  document.querySelector("#adicionar").addEventListener("click", () => {\n    total += 1;\n    document.querySelector("#total").textContent = total;\n  });\n</script>',
    challenge: 'Execute o contador. Depois adicione um botão “Recomeçar” que muda total para zero e atualiza a tela. Teste adicionar, recomeçar e adicionar de novo.',
    prompt: 'Sou iniciante. Explique o estado, o evento e a atualização da tela neste contador. Depois me dê uma pista para criar um botão de reset, sem entregar a solução imediatamente. Código: [cole aqui].',
    quiz: { question: 'Para exibir com segurança o texto digitado por uma pessoa, use:', options: ['eval', 'innerHTML', 'textContent'], answer: 2, explanation: 'textContent trata a entrada como texto. eval executa código e innerHTML interpreta marcação.' },
    resource: ['JavaScript · MDN', 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide'],
  },
  {
    id: 'briefing', title: 'Uma boa ideia precisa de limites.', minutes: 12,
    intro: 'Um briefing é uma descrição curta do problema, de quem usa o produto e de como reconhecer que ele funciona. Ele dá direção à conversa com a IA.',
    sections: [
      ['Comece pela pessoa', 'Em vez de “quero um aplicativo moderno”, escreva “quero ajudar uma pessoa que estuda sozinha a planejar três tarefas do dia”. Um problema específico facilita escolher o que construir primeiro.'],
      ['Defina uma primeira entrega pequena', 'Um produto inicial pode ter apenas criar, concluir e remover uma tarefa. Login, pagamento e chat podem esperar. Quanto menor a mudança, mais fácil entender o código e verificar o resultado.'],
      ['Escreva critérios verificáveis', '“Ser intuitivo” é vago. “Ao salvar um título vazio, mostrar uma mensagem e manter a lista igual” descreve um teste. Inclua pelo menos um caso de sucesso, um erro e um uso em celular.'],
    ],
    code: 'Problema: esqueço minhas prioridades de estudo.\nPessoa: estudante iniciante.\nEntrega: criar, concluir e excluir uma tarefa.\nFora do escopo: contas e pagamentos.\nAceite: título vazio não é salvo; lista persiste ao recarregar.\nTeste: usar a página só com teclado e em 360 px.',
    challenge: 'Escreva um briefing do seu projeto nas anotações. Reduza a primeira versão a três ações e acrescente três critérios de aceite.',
    prompt: 'Atue como parceiro de planejamento. Minha ideia é [ideia]. Faça até três perguntas sobre público e problema. Depois proponha uma primeira versão com até três funções, limites claros e critérios de aceite testáveis.',
    quiz: { question: 'Qual é um critério de aceite verificável?', options: ['A interface deve ser incrível', 'Um título vazio mostra erro e não cria uma tarefa', 'O aplicativo deve ter tudo'], answer: 1, explanation: 'O segundo critério descreve entrada, comportamento esperado e um resultado observável.' },
    resource: ['Planejando um site · MDN', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/What_will_your_website_look_like'],
  },
  {
    id: 'prompts', title: 'Peça uma mudança por vez.', minutes: 15,
    intro: 'Um bom prompt contém contexto, objetivo, limites e uma forma de testar. Você não precisa de palavras mágicas: precisa de clareza.',
    sections: [
      ['Dê contexto suficiente', 'Informe a linguagem, o arquivo relevante, o comportamento atual e o esperado. Compartilhe apenas o trecho necessário e remova senhas, chaves privadas e dados pessoais antes de enviar.'],
      ['Divida o trabalho', 'Peça primeiro um plano curto, depois uma alteração pequena. Execute essa alteração antes de pedir a próxima. Se o resultado mudar coisas que você não solicitou, recupere a versão anterior e reduza o escopo.'],
      ['Peça explicações úteis', 'Solicite que a IA explique por que a mudança funciona e quais casos precisam de teste. Se aparecer uma função desconhecida, confira sua existência na documentação oficial da versão instalada.'],
    ],
    code: 'Contexto: página HTML com uma lista em JavaScript.\nObjetivo: impedir tarefas com título vazio.\nLimites: preserve o layout e não instale bibliotecas.\nEntrega: altere só a validação e explique o motivo.\nTeste: vazio, espaços, título válido e envio por Enter.',
    challenge: 'Abra a biblioteca de prompts, escolha “Uma mudança pequena” e adapte os quatro campos ao seu projeto. Compare a resposta da IA com os limites que você escreveu.',
    prompt: 'Contexto: [tecnologia e trecho]. Objetivo: [uma mudança]. Limites: [o que preservar]. Primeiro explique seu plano. Depois mostre a menor alteração possível e como testá-la com entrada válida e inválida.',
    quiz: { question: 'O que ajuda a revisar uma resposta da IA?', options: ['Solicitar muitas funcionalidades de uma só vez', 'Omitir a tecnologia utilizada', 'Pedir uma alteração pequena e critérios de teste'], answer: 2, explanation: 'Uma mudança pequena torna mais claro o que foi alterado e como verificar se a intenção foi atendida.' },
    resource: ['Aprender desenvolvimento Web · MDN', 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development'],
  },
  {
    id: 'debug', title: 'Aprenda a conversar com um erro.', minutes: 15,
    intro: 'Depurar é investigar. Uma mensagem de erro é uma pista; o objetivo é descobrir uma causa e testar uma correção de cada vez.',
    sections: [
      ['Reproduza antes de alterar', 'Anote os passos exatos, o resultado esperado e o que aconteceu. Abra as ferramentas do navegador e leia a primeira mensagem relevante do Console. O painel Network ajuda a identificar arquivos ou requisições que falharam.'],
      ['Formule uma hipótese', 'Se querySelector retorna null, talvez o seletor esteja errado ou o elemento ainda não exista. Confira o HTML e o momento em que o script executa. Evite instalar bibliotecas ou reescrever tudo para resolver um erro pequeno.'],
      ['Teste o conserto e o entorno', 'Depois de corrigir, repita o cenário original e outro que já funcionava. Registre o que causou o problema e a evidência de que foi resolvido. Esse registro se torna um material de aprendizagem.'],
    ],
    code: 'Esperado: clicar em Salvar cria uma tarefa.\nObservado: nada acontece.\nConsole: Cannot read properties of null.\nHipótese: #salvar não corresponde ao id do botão.\nTeste: comparar HTML e seletor; repetir o clique.\nRegressão: verificar envio pelo teclado.',
    challenge: 'No laboratório, troque de propósito o id do botão sem alterar o seletor. Observe o comportamento. Depois alinhe os dois e teste novamente.',
    prompt: 'Ajude a investigar este erro sem reescrever o projeto. Passos: [passos]. Esperado: [resultado]. Observado: [resultado]. Mensagem: [erro sem segredos]. Código: [trecho]. Proponha uma hipótese e um teste por vez.',
    quiz: { question: 'Qual é o primeiro passo para investigar um bug?', options: ['Reproduzir e registrar o comportamento', 'Trocar todas as bibliotecas', 'Esconder a mensagem de erro'], answer: 0, explanation: 'Conseguir reproduzir o problema permite verificar se uma mudança realmente resolveu a causa.' },
    resource: ['Depurando JavaScript · Chrome', 'https://developer.chrome.com/docs/devtools/javascript'],
  },
  {
    id: 'acessibilidade', title: 'Uma interface que inclui.', minutes: 15,
    intro: 'Acessibilidade faz parte da qualidade. Uma página deve continuar utilizável com teclado, zoom, tela pequena e preferência por menos movimento.',
    sections: [
      ['Navegue sem mouse', 'Use Tab para percorrer controles, Enter para ativar links e Enter ou Espaço para botões. O foco deve ser visível e seguir a ordem do conteúdo. Um modal precisa fechar com Escape e devolver o foco ao controle que o abriu.'],
      ['Dê nomes claros', 'Associe labels a campos. Descreva imagens informativas com alt; deixe alt vazio quando forem apenas decorativas. Uma mensagem de erro deve explicar o que corrigir, sem depender somente de cor.'],
      ['Respeite diferentes formas de leitura', 'Teste zoom e largura de celular. Para animações, respeite prefers-reduced-motion e ofereça pausa para movimento contínuo. Use ferramentas automáticas como apoio, junto de verificações manuais.'],
    ],
    code: '<form>\n  <label for="ideia">Sua ideia</label>\n  <input id="ideia" name="ideia" required>\n  <button type="submit">Salvar ideia</button>\n</form>\n<style>\n  :focus-visible { outline: 3px solid #f6b205; outline-offset: 4px; }\n  @media (prefers-reduced-motion: reduce) {\n    * { scroll-behavior: auto; }\n  }\n</style>',
    challenge: 'Percorra seu projeto só com teclado. Anote um controle sem nome ou um ponto em que o foco desaparece. Corrija e refaça o percurso.',
    prompt: 'Revise este HTML para acessibilidade. Avalie semântica, labels, foco, teclado e mensagens de erro. Separe problemas observáveis de itens que exigem teste manual. Código: [cole aqui].',
    quiz: { question: 'Como comunicar um erro em um campo?', options: ['Só pintando a borda de vermelho', 'Com uma mensagem clara associada ao campo', 'Desativando toda a página'], answer: 1, explanation: 'A mensagem precisa ser compreensível e associada ao campo. A cor pode reforçar, mas não deve ser a única indicação.' },
    resource: ['Fundamentos de acessibilidade · W3C', 'https://www.w3.org/WAI/fundamentals/accessibility-intro/'],
  },
  {
    id: 'dados', title: 'O que acontece quando você recarrega?', minutes: 18,
    intro: 'Variáveis desaparecem quando a página é recarregada. Persistir é salvar os dados para recuperá-los depois.',
    sections: [
      ['Objetos descrevem coisas', 'Uma tarefa pode ser um objeto com id, title e completed. Uma lista de tarefas é um array desses objetos. Dê a cada item um identificador estável: títulos podem se repetir.'],
      ['O navegador pode guardar dados', 'localStorage guarda textos no navegador e na origem atual. JSON.stringify converte um objeto em texto; JSON.parse faz o caminho inverso. Leitura e escrita podem falhar: trate erros e valide o formato recuperado.'],
      ['Local e compartilhado são diferentes', 'Dados locais ficam nesse navegador. Para acessar em outros dispositivos ou compartilhar com outras pessoas, você precisa de um serviço com autenticação e regras de acesso. Nunca trate localStorage como um cofre para segredos.'],
    ],
    code: 'const tarefa = { id: "tarefa-1", title: "Estudar HTML", completed: false };\ntry {\n  localStorage.setItem("minha-tarefa", JSON.stringify(tarefa));\n  const salva = JSON.parse(localStorage.getItem("minha-tarefa"));\n  console.log(salva.title);\n} catch (erro) {\n  console.error("Não foi possível usar o armazenamento.", erro);\n}',
    challenge: 'No seu projeto, salve uma tarefa no navegador e recarregue. Teste também quando não existe nada salvo. Este exercício deve ser feito no seu projeto: o laboratório isolado não tem acesso ao armazenamento da Noética.',
    prompt: 'Ajude a persistir esta lista em localStorage. Valide o formato lido e trate indisponibilidade ou JSON inválido. Não armazene segredos. Explique a diferença entre salvar neste navegador e salvar em um servidor.',
    quiz: { question: 'Uma tarefa salva em localStorage aparece automaticamente em outro dispositivo?', options: ['Sim, sempre', 'Somente se o título for igual', 'Não; é necessário um serviço de sincronização'], answer: 2, explanation: 'localStorage pertence ao navegador e à origem. Sincronização entre dispositivos exige um serviço adicional.' },
    resource: ['Web Storage · MDN', 'https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Storage_API'],
  },
  {
    id: 'git', title: 'Salve o caminho, não só o resultado.', minutes: 15,
    intro: 'Git registra versões do projeto. Assim você consegue entender mudanças, experimentar e recuperar uma versão anterior.',
    sections: [
      ['Uma mudança, um registro', 'Um commit é um registro de alterações com uma mensagem. Antes de criar um, leia o diff: ele mostra o que entrou e saiu. Uma mensagem como “Valida títulos vazios” é mais útil que “Atualizações”.'],
      ['O fluxo básico', 'git status mostra arquivos alterados; git diff mostra as mudanças; git add seleciona o que entrará no registro; git commit cria o registro local. Um repositório remoto é uma cópia hospedada: o commit local não publica sozinho.'],
      ['Cuide do que entra no histórico', 'Use .gitignore para arquivos locais, dependências e segredos. Isso não remove um segredo já registrado. Se uma chave privada vazou, revogue e substitua a chave; apagar a linha atual não basta.'],
    ],
    code: 'git status\ngit diff\ngit add index.html\ngit commit -m "Adiciona estrutura da página inicial"\ngit log --oneline',
    challenge: 'Em um repositório de estudo, altere apenas o título da página, confira o diff e faça um commit com uma mensagem que descreva essa alteração.',
    prompt: 'Explique este git diff para uma pessoa iniciante. Aponte mudanças fora do objetivo e possíveis segredos antes do commit. Não execute comandos destrutivos. Diff: [cole aqui, sem credenciais].',
    quiz: { question: 'O que git diff ajuda você a fazer?', options: ['Examinar alterações antes de registrá-las', 'Publicar um site automaticamente', 'Criar uma conta em um serviço'], answer: 0, explanation: 'O diff mostra as diferenças no código. É uma oportunidade de revisar alterações antes de criar um commit.' },
    resource: ['Livro Pro Git', 'https://git-scm.com/book/pt-br/v2'],
  },
  {
    id: 'seguranca', title: 'Quem pode ver e mudar seus dados?', minutes: 18,
    intro: 'Autenticação identifica uma pessoa. Autorização determina o que ela pode fazer. Um produto com contas precisa das duas.',
    sections: [
      ['Esconder um botão não protege dados', 'Qualquer pessoa pode inspecionar e modificar o código enviado ao navegador. Permissões precisam ser verificadas no servidor ou nas regras do banco. Um usuário deve conseguir acessar apenas os dados que as regras permitem.'],
      ['Valide na fronteira', 'Limite tamanhos, tipos e campos aceitos. Um link deve usar um protocolo permitido, como https. Trate textos recebidos como dados e não como HTML. Validação na interface melhora o uso, mas não substitui validação no serviço.'],
      ['Segredos ficam no servidor', 'Chaves privadas de serviços de IA não devem ser incluídas em JavaScript público. Use uma rota de servidor autenticada, com limites de uso. Antes de publicar, teste com duas contas: uma não deve ler nem alterar dados privados da outra.'],
    ],
    code: 'Regra do produto: cada pessoa edita suas próprias notas.\nTeste 1: visitante tenta ler uma nota privada → negar.\nTeste 2: conta A lê sua nota → permitir.\nTeste 3: conta B tenta editar nota de A → negar.\nTeste 4: link com protocolo inesperado → rejeitar.',
    challenge: 'Liste quais dados do seu projeto são públicos e quais são privados. Escreva três testes de acesso. Se ainda não há servidor, mantenha os dados locais e não prometa compartilhamento.',
    prompt: 'Revise o modelo de acesso deste projeto: [descrição]. Liste dados públicos e privados, regras necessárias no servidor e testes com visitante e duas contas. Não considere botões escondidos como proteção.',
    quiz: { question: 'Onde uma permissão sobre dados privados deve ser garantida?', options: ['Somente no CSS', 'No servidor ou nas regras do banco', 'No texto de um botão'], answer: 1, explanation: 'O navegador está sob controle do usuário. O serviço que guarda os dados precisa impor as permissões.' },
    resource: ['Regras de segurança · Firebase', 'https://firebase.google.com/docs/firestore/security/get-started?hl=pt-br'],
  },
  {
    id: 'publicacao', title: 'Seu projeto pronto para o mundo.', minutes: 20,
    intro: 'Publicar é disponibilizar uma versão para outras pessoas. Um link funcionando é só o começo: verifique o percurso completo de quem vai usar.',
    sections: [
      ['Prepare a entrega', 'Rode a build quando o projeto usar um empacotador. Teste a versão gerada, os links e as rotas abertas diretamente. Um projeto que funciona só no servidor de desenvolvimento ainda precisa de ajustes.'],
      ['Teste cenários reais', 'Use celular, teclado, conexão lenta e uma entrada inválida. Recarregue uma rota interna. Confirme o que acontece quando um serviço falha e quando o armazenamento não está disponível. Verifique HTTPS e os domínios permitidos para autenticação.'],
      ['Conte o que você aprendeu', 'No portfólio, explique o problema, as decisões, o que você construiu com ajuda de IA e como testou. Inclua limites conhecidos. Um projeto pequeno bem explicado mostra mais entendimento que uma lista de tecnologias sem contexto.'],
    ],
    code: 'Antes de compartilhar:\n[ ] Fluxo principal funciona do início ao fim\n[ ] Links e rotas diretas funcionam\n[ ] Celular e teclado foram testados\n[ ] Nenhum segredo está nos arquivos públicos\n[ ] Erros têm mensagens úteis\n[ ] README explica instalação, uso e limites',
    challenge: 'Complete um projeto do workspace, registre como testou e adicione o link da demonstração. Use a descrição para explicar uma decisão e uma dificuldade que resolveu.',
    prompt: 'Ajude a revisar a entrega deste projeto: [descrição e ambiente]. Monte uma lista curta de testes de navegação, dados, teclado, celular e falhas. Não declare que está pronto sem evidências dos testes.',
    quiz: { question: 'Antes de compartilhar uma aplicação, você deve:', options: ['Testar a versão de produção e as rotas diretas', 'Verificar só a página inicial', 'Remover todas as mensagens de erro'], answer: 0, explanation: 'A versão publicada pode se comportar de forma diferente do desenvolvimento. Rotas e fluxos completos precisam ser verificados.' },
    resource: ['Publicando um site · MDN', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website'],
  },
];

export const prompts = [
  { id: 'planejar', category: 'Planejamento', title: 'Da ideia ao primeiro passo', description: 'Defina problema, público e uma primeira entrega possível.', text: lessons[4].prompt },
  { id: 'mudanca', category: 'Construção', title: 'Uma mudança pequena', description: 'Dê contexto e preserve o que já funciona.', text: lessons[5].prompt },
  { id: 'interface', category: 'Construção', title: 'Uma interface que se adapta', description: 'Trabalhe estrutura, responsividade e foco.', text: lessons[2].prompt },
  { id: 'investigar', category: 'Revisão', title: 'Investigue antes de corrigir', description: 'Transforme um erro em uma hipótese verificável.', text: lessons[6].prompt },
  { id: 'revisar', category: 'Revisão', title: 'Inclua mais pessoas', description: 'Revise acessibilidade com critérios claros.', text: lessons[7].prompt },
  { id: 'entender', category: 'Aprendizado', title: 'Entenda o código gerado', description: 'Peça uma explicação, um exemplo e um desafio.', text: 'Explique este código para uma pessoa iniciante: [trecho sem segredos]. Descreva entradas, estado, decisões e saídas. Mostre um exemplo de execução, aponte um limite e proponha um pequeno exercício. Não reescreva tudo.' },
];

export const inspirations = [
  { id: 'orbit', title: 'Orbit', subtitle: 'Sua rotina, um passo de cada vez.', category: 'Produtividade', level: 'Iniciante', style: 'orbit', description: 'Um planejador de estudos com tarefas por dia e estados de conclusão.', requirements: ['Criar e concluir tarefas', 'Filtrar tarefas pendentes', 'Salvar no navegador'], learning: 'Eventos, arrays e persistência local', lesson: 'javascript' },
  { id: 'folio', title: 'Forma', subtitle: 'Um espaço para o que você cria.', category: 'Portfólio', level: 'Iniciante', style: 'folio', description: 'Um portfólio pessoal que explica seus projetos, processo e aprendizados.', requirements: ['Apresentar três projetos', 'Criar navegação por seções', 'Adaptar a tela ao celular'], learning: 'HTML semântico, CSS e responsividade', lesson: 'html' },
  { id: 'focus', title: 'Intervalo', subtitle: 'Menos distração. Mais presença.', category: 'Produtividade', level: 'Prática guiada', style: 'focus', description: 'Um temporizador de foco com pausa, reinício e duração ajustável.', requirements: ['Iniciar e pausar uma sessão', 'Reiniciar o contador', 'Avisar quando o tempo terminar'], learning: 'Estado, temporizadores e acessibilidade', lesson: 'javascript' },
  { id: 'notes', title: 'Fragmento', subtitle: 'Ideias merecem um lugar.', category: 'Ferramentas', level: 'Iniciante', style: 'notes', description: 'Um caderno de notas com busca, edição e etiquetas simples.', requirements: ['Criar e editar notas', 'Buscar pelo conteúdo', 'Exportar uma cópia das notas'], learning: 'Formulários, filtros e dados locais', lesson: 'dados' },
  { id: 'link', title: 'Acervo', subtitle: 'Boas referências, sempre por perto.', category: 'Ferramentas', level: 'Iniciante', style: 'link', description: 'Uma biblioteca de links para organizar o que você encontra enquanto aprende.', requirements: ['Salvar links HTTPS', 'Organizar por categoria', 'Buscar por título'], learning: 'Validação, objetos e filtros', lesson: 'seguranca' },
  { id: 'landing', title: 'Raiz', subtitle: 'Uma boa história começa aqui.', category: 'Portfólio', level: 'Iniciante', style: 'landing', description: 'Uma página de apresentação para um pequeno negócio fictício.', requirements: ['Apresentar a proposta do negócio', 'Criar uma seção de serviços', 'Oferecer contato com link válido'], learning: 'Hierarquia visual, conteúdo e publicação', lesson: 'publicacao' },
];

export const faqs = [
  { title: 'Preciso saber programar para começar?', category: 'Primeiros passos', content: 'Não. Comece pela trilha de fundamentos. Leia a aula, altere o exemplo e tente explicar o que mudou. Você pode praticar HTML, CSS e JavaScript no laboratório da sala de aula.' },
  { title: 'Preciso pagar por uma ferramenta de IA?', category: 'Ferramentas', content: 'As aulas e os exercícios da Noética não exigem uma assinatura de IA. Os prompts podem ser adaptados ao assistente que você já usa. Recursos, limites e preços dependem de cada serviço; consulte o próprio fornecedor.' },
  { title: 'Meu progresso fica salvo onde?', category: 'Primeiros passos', content: 'No acesso livre, neste navegador. Use Exportar progresso no workspace para guardar uma cópia. Ao entrar em uma conta, o progresso dessa conta usa um espaço separado e pode ser sincronizado com o Firebase. Limpar os dados do navegador apaga a cópia local.' },
  { title: 'A IA gerou código com erro. Como investigar?', category: 'Código e bugs', content: 'Registre o esperado, o observado e os passos para reproduzir. Leia o Console do navegador. Use o prompt “Investigue antes de corrigir” e teste uma hipótese por vez. Remova senhas e dados pessoais dos trechos compartilhados.' },
  { title: 'Como transformar uma inspiração em projeto?', category: 'Projetos', content: 'Abra um briefing na galeria e escolha “Criar no meu workspace”. Você receberá uma lista de critérios para implementar. Salve notas, acompanhe o estado e adicione uma demonstração quando estiver pronta.' },
  { title: 'O laboratório executa qualquer aplicação?', category: 'Ferramentas', content: 'O laboratório executa HTML, CSS e JavaScript simples em uma área isolada. Ele não instala pacotes, não acessa a internet e não tem acesso às suas notas. Para Node.js, banco de dados e ferramentas de build, use seu ambiente de desenvolvimento.' },
];

export const lessonById = id => lessons.find(lesson => lesson.id === id);
export const courseForLesson = id => courses.find(course => course.lessons.includes(id));
export const courseMinutes = course => course.lessons.reduce((sum, id) => sum + lessonById(id).minutes, 0);
