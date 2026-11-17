# EvoluFit v0.2 — Contas e sincronização (PREPARAÇÃO)

> **Não está ativo no site público.** O recurso vive na branch `feature/contas-supabase` até que exista um projeto Supabase separado, validado.

## Situação do banco (17/11/2026)
- ✅ Novo projeto **EvoluFit** criado na região `sa-east-1`, ID `qovpsvjfeermpjtjwscb`.
- ✅ Migração `evolufit_init_private_user_data` aplicada com sucesso.
- ✅ Tabelas `ef_user_state` e `ef_photos` com RLS, permissões restritas e oito políticas de propriedade.
- ✅ Bucket `evolufit-photos` privado, aceita JPG/PNG/WebP até 8 MB.
- ✅ Chave **publicável** configurada em `config.js` apenas na branch de desenvolvimento.
- ✅ Supabase Security Advisor sem alertas no momento da verificação.
- ⏳ Configurar **Authentication → URL Configuration**: Site URL e Redirect URL `https://efredeson.github.io/evolufit/`.
- ⏳ Testar login, confirmação, recuperação de senha, gravação/leitura e isolamento com duas contas antes de mesclar esta branch.
- ⛔ **Não mesclar na main antes dos testes de autenticação e isolamento.** A main continua na versão v0.1.

## Projetos separados
NÃO reutilize o projeto `GABS-RIFAS`. Criar um projeto Supabase próprio chamado `EvoluFit`, na organização e no plano escolhidos pelo proprietário.

## Ativação do Supabase
1. Criar projeto Supabase exclusivo para EvoluFit.
2. Na área **SQL Editor** do novo projeto, aplicar o conteúdo de `supabase/schema.sql` e verificar as políticas RLS.
3. Em **Authentication → URL Configuration**, definir Site URL `https://efredeson.github.io/evolufit/` e incluir essa URL em Redirect URLs. O cadastro por e-mail pode exigir confirmação por e-mail.
4. Copiar o **Project URL** e uma chave pública do tipo **sb_publishable_...** para `config.js`. **NUNCA** inserir chave secreta ou service_role no JavaScript público.
5. Verificar que as tabelas estão na API de dados e que a role `authenticated` consegue acessá-las, mas a role `anon` NÃO.
6. Testar cadastro, confirmação por e-mail, login, sair da conta, recuperação de senha, gravação/leitura de treinos, caminhadas, refeições, medidas e upload de fotos.
7. Testar com DUAS contas diferentes: confirmar que nenhuma pode ler, atualizar ou excluir registros e imagens da outra, inclusive URLs diretas de Storage.
8. Verificar o Security Advisor do Supabase. Só então mesclar a branch em `main` e testar publicação.

## Como esta implementação funciona
- `cloud.js`: autenticação, sincronização de um JSON de dados por usuário em `ef_user_state`, armazenamento de fotos em `ef_photos` + bucket privado `evolufit-photos`.
- `config.js`: vazio por padrão. Sem configuração, o app mantém o comportamento local do protótipo v0.1.
- `cloud.css`: tela de login responsiva no estilo branco e verde.
- `app.js`: adapta registros e fotos ao usuário conectado sem alterar a lógica de treino/caminhada.
- Os dados locais preexistentes NÃO são enviados automaticamente à nuvem para evitar misturar informações de usuários do mesmo navegador.
- A sincronização de registros é do tipo **última gravação vence**. Evite modificar em dois dispositivos ao mesmo tempo. Fotos são sincronizadas separadamente.
- A tela de galeria limita a listagem às 25 fotos recentes nesta etapa. Ainda faltam paginação e migração opcional do histórico local.
- O relógio/alarme ainda funciona apenas com a página aberta. O app NÃO rastreia localização/GPS.
- Os dados de fotos e saúde são sensíveis. Não armazenar em repositório público; o código pode ser público, os dados nunca.

## Testes mínimos antes de publicar
- [ ] Usuário sem login não vê informações da conta anterior.
- [ ] Duas contas possuem históricos totalmente separados.
- [ ] Ao registrar uma caminhada e abrir outro navegador, a caminhada aparece.
- [ ] Fotos de uma conta não aparecem para outra.
- [ ] A opção apagar registros mantém as fotos, conforme texto exibido.
- [ ] Sair da conta exige sincronização concluída ou avisa sobre erro.
- [ ] Recuperação de senha redireciona ao site correto.
- [ ] Celular e desktop mantêm o layout e acessibilidade.
- [ ] Contas confirmam e-mail e usam HTTPS em produção.

O projeto GABS-RIFAS não foi modificado.
