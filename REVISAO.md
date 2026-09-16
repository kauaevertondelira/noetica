# Revisão da Noética

## Resultado

Versão local funcional, com identidade visual preservada, 3 trilhas e 12 aulas. GSAP e Swup continuam sendo usados. Os arquivos para produção estão em `dist/`; a execução e a configuração estão no `README.md`.

## Problemas corrigidos

- Importações duplicadas que impediam a execução do painel.
- Telas com estruturas incompatíveis com o contêiner de navegação Swup.
- Eventos e animações sem ciclo de montagem e limpeza por página.
- Botões sem destino, ações sem implementação e scripts incorretos na sala de aula.
- Vídeo de demonstração sem relação com o ensino e aulas com URLs de exemplo.
- Percentuais fixos e estatísticas sem relação com o progresso.
- Interpolação de conteúdo recebido sem proteção contra HTML e links perigosos.
- Falta de estados de vazio, erro, indisponibilidade e recuperação.
- Layouts largos demais no celular e controles sem suporte adequado a teclado.
- Dependência de serviços remotos para iniciar qualquer estudo.
- Ausência de comandos de instalação, build e testes.

## Funcionalidades entregues

Leitura, desafios, quizzes, laboratório isolado, notas, progresso, XP, retomada da próxima aula, projetos editáveis, busca e filtros, favoritos, cópia de prompts, backup e importação. Contas e fórum possuem implementação Firebase e regras de acesso para implantação pelo responsável pelo serviço.

## Verificação executada

- **12 testes de dados aprovados.**
- **15 cenários de navegador aprovados**, executados no Edge em modo automatizado sobre a build de produção.
- **4 cenários de GitHub Pages aprovados**, em servidor estático montado em `/noetica-pages-check/`, com erro 404 para caminhos fora da subpasta.
- Cobertura das 12 aulas, rotas diretas, navegação Swup, voltar no histórico, persistência, laboratório, projetos, filtros, clipboard e backup.
- Verificação de ausência de rolagem horizontal em 360, 390 e 768 pixels nas telas principais.
- Inspeção visual da página inicial em desktop e celular, galeria e sala de aula.
- Testes de conta com serviço simulado: separação visitante/conta, falhas de autenticação, falhas de leitura/escrita e recuperação.
- Build final aprovada, sem alertas de tamanho de bundle. Arquivos Firebase carregados apenas quando necessários.
- Instalação conferida com o lockfile em modo offline.

## Publicação no GitHub Pages

- Workflow `.github/workflows/static.yml` com instalação reproduzível, testes de dados, build Vite e publicação de `dist/` em pushes para `main` ou `master` e execução manual.
- Caminho de publicação consultado nas configurações do Pages, atendendo sites de repositório, `usuario.github.io` e domínio próprio.
- Links, fontes, imagens, vídeo e navegação Swup funcionando na subpasta do repositório. Corrigidos também o destaque da trilha na sala de aula e o foco do atalho de acessibilidade.
- `.nojekyll` incluído na build. As páginas-fonte mantêm a base local após uma compilação para subpasta.
- Reexecutados os 12 testes de dados, 15 cenários gerais de navegador e 4 cenários de publicação: **31 aprovados**. Build final gerada em `dist/`.
- README atualizado com ativação de Actions, envio da pasta oculta `.github`, acompanhamento do deploy e registro do link no perfil.

A mensagem enviada pelo usuário indica que Actions precisa ser habilitado no GitHub. O código local não altera essa configuração. Sem um repositório remoto vinculado, a publicação externa e suas permissões não foram executadas ou verificadas.

## Limite da validação

Nenhuma configuração remota, conta de produção, postagem ou hospedagem foi alterada. Login real, envio de e-mail, OAuth, regras do Firestore implantadas e sincronização entre dispositivos dependem do projeto Firebase existente e não foram validados em produção. A configuração necessária está documentada no README.

O laboratório executa exemplos locais; não é um serviço de inferência de IA. Os prompts são usados pelo aluno na ferramenta de sua escolha.

## Preservação

Os assets originais permanecem em `IMG/`. Uma cópia dos arquivos anteriores à substituição foi guardada em `.local/original/`.
