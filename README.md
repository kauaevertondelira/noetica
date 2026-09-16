# Noética

Escola introdutória de programação com IA. A identidade original — preto, dourado, símbolo geométrico, vídeo e animações — foi preservada. O site agora oferece uma jornada de estudo utilizável sem cadastro.

## Executar

Requisito: **Node.js 22.12 ou superior**. Abra um terminal nesta pasta:

```sh
npm install
npm run dev
```

Abra **http://127.0.0.1:5173**. No Windows, também é possível executar `./INICIAR.ps1` no PowerShell. Esse atalho encontra o Node disponível no computador e usa as dependências já instaladas.

O projeto tem `pnpm-lock.yaml`. Para uma instalação reproduzível com pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Não abra o `index.html` por `file://`: módulos, navegação e assets precisam de um servidor HTTP. A aplicação usa URLs a partir da raiz do domínio.

## O que funciona no acesso livre

- **3 trilhas, 12 aulas escritas**: fundamentos; IA como parceira de código; primeiro projeto.
- Exemplos, desafios, questionários com explicação e conclusão de aulas.
- Laboratório de HTML/CSS/JavaScript em um iframe isolado.
- Anotações por aula, código de prática e caderno geral com salvamento automático.
- Progresso e XP calculados a partir dos dados, sem percentuais fictícios ou bonificação repetida por clique.
- Projetos: criar, editar, mudar de etapa, adicionar links e excluir.
- **6 conceitos de projeto** com briefings, busca, filtros e favoritos.
- **6 prompts** para planejar, construir, revisar e aprender, com filtros e cópia.
- Guia de dúvidas pesquisável.
- Exportação e importação de uma cópia JSON do progresso.
- Menu móvel, foco de teclado, diálogos acessíveis e preferência por menos movimento.

Não há geração de código por IA dentro da aplicação. O aluno pode copiar os prompts para o assistente que preferir. As aulas não exigem uma assinatura externa. O laboratório não instala pacotes, não acessa a rede e não recebe acesso ao armazenamento da aplicação.

## Contas e comunidade: Firebase

A configuração pública original do projeto **noetica-ia** foi preservada em `public/assets/js/firebase-config.js`. É possível substituí-la por variáveis `VITE_FIREBASE_*` copiando `.env.example` para `.env.local`. `VITE_FIREBASE_ENABLED=false` desativa contas nesse ambiente.

O código inclui:

- cadastro e acesso por e-mail/senha;
- acesso Google e recuperação de senha;
- sincronização do progresso por conta, com cópia local e indicação de falhas;
- perguntas, respostas e exclusão da própria pergunta na comunidade;
- regras de acesso em `firestore.rules`.

**Para operar esses recursos com pessoas reais**, o responsável pelo projeto Firebase precisa:

1. Habilitar Email/Password e Google em Authentication → Sign-in method.
2. Autorizar os domínios usados, incluindo os endereços locais necessários para teste, em Authentication → Settings → Authorized domains.
3. Criar/habilitar o banco Cloud Firestore.
4. Revisar e publicar `firestore.rules` no projeto correto.
5. Testar cadastro, login Google, recuperação de senha e isolamento de dados com duas contas próprias no domínio de destino.

Essas alterações remotas **não foram aplicadas** durante a revisão da pasta. Os testes de conta usam um serviço simulado; não validam credenciais, domínio autorizado, entrega de e-mail, regras implantadas ou quotas do projeto real. Nenhuma conta ou postagem de teste foi criada no Firebase de produção.

### Dados e limites operacionais

- Acesso livre: chave `noetica:v2:guest` em localStorage.
- Conta: chave local `noetica:v2:<uid>` e documento `users/<uid>.study` no Firestore.
- Os espaços de visitante e conta são separados. Exportar/importar transfere o estudo de forma explícita.
- Alterações locais pendentes ficam marcadas para uma nova tentativa de sincronização. Uma falha de escrita não é mostrada como sucesso.
- Sincronização usa leituras e escritas pontuais, sem atualização colaborativa em tempo real. Edições simultâneas em dispositivos diferentes seguem a última gravação; exporte uma cópia antes de combinar alterações.
- O cliente calcula XP para motivação pessoal. XP não é credencial de segurança, pagamento ou classificação competitiva.
- Projetos ficam privados no espaço do aluno; a galeria contém conceitos editoriais, claramente identificados como ideias para construir.
- O fórum mostra até 30 perguntas recentes e até 100 respostas por conversa. A exclusão da pergunta oculta o acesso às respostas; a remoção física de subcoleções exige uma rotina administrativa no backend.
- O conteúdo antigo não é apagado do Firestore. As aulas antigas de demonstração não são importadas como progresso da nova formação.
- Para uma comunidade aberta em escala, o operador precisará definir moderação, retenção/exclusão de contas, limites de uso e proteção contra abuso no serviço. Esta entrega não inclui um painel administrativo ou sistema de pagamento.

## Produção

```sh
npm run build
npm run preview
```

A prévia fica em **http://127.0.0.1:4173**. Publique o conteúdo de `dist/` em um servidor estático na raiz do domínio, mantendo `public/pages/*.html`, `assets/` e `IMG/`.

`firebase.json` contém uma configuração opcional de Firebase Hosting e o caminho das regras. Não há publicação automática. Use a CLI do Firebase autenticada na conta responsável apenas quando for disponibilizar o serviço e confirmar o projeto de destino.

As dependências GSAP e Swup e as fontes Inter são empacotadas localmente. O Firebase é carregado sob demanda. Firestore Lite é suficiente para as leituras e escritas pontuais; o armazenamento local e a recuperação de falhas ficam a cargo da aplicação.

## Manutenção

| Arquivo | Responsabilidade |
| --- | --- |
| `scripts/pages.mjs` | Fonte dos HTMLs, navegação, rodapé e página inicial. `npm run pages` regenera as páginas; a build também executa esse passo. |
| `public/assets/js/content.js` | Trilhas, aulas, verificações, prompts, briefings e perguntas do guia. Preserve os IDs para manter o progresso. |
| `public/assets/js/main.js` | Ciclo de navegação Swup, montagem/desmontagem e animações GSAP. |
| `public/assets/js/store.js` | Estado, validação de importações, isolamento e cálculo de progresso. |
| `public/assets/js/classroom.js` | Leitura, prática, notas e conclusão de aulas. |
| `public/assets/js/dashboard.js` | Caderno, projetos e backup do progresso. |
| `public/assets/js/auth.js` | Contas e sincronização. |
| `public/assets/js/community.js` | Guia público e conversas autenticadas. |
| `public/assets/css/style.css` | Identidade visual e layouts responsivos. |
| `firestore.rules` | Permissões impostas pelo banco. |

Uma cópia dos arquivos originais foi preservada em `.local/original/`. Os assets originais permanecem em `IMG/`. Essa cópia local não entra na build nem no versionamento.

## Testes

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

No Windows, é possível usar o Edge já instalado:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

- Testes de dados: conteúdo, conclusão, XP, importações, URLs, armazenamento e isolamento por usuário.
- Testes de navegador: navegação Swup, rotas diretas, todas as aulas, laboratório, projetos, filtros, clipboard, notas, backup, formulários, telas pequenas e animações.
- Testes de contas: serviço Firebase simulado exclusivamente no navegador de teste, incluindo falhas e recuperação. Arquivos de teste não entram na build.
- Capturas para inspeção: `.local/screenshots/`.

### Referências técnicas consultadas

- [Ciclo de vida de scripts no Swup](https://swup.js.org/getting-started/reloading-javascript/)
- [Limpeza de animações com gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context()/)
- [Condições nas regras do Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firestore Lite](https://firebase.google.com/docs/firestore/solutions/firestore-lite)
