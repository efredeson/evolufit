# EvoluFit — Migração experimental para Vercel

## Situação
- Projeto GitHub: `efredeson/evolufit`
- Branch de teste: `feature/vercel-preview`
- Site atual no GitHub Pages: `https://efredeson.github.io/evolufit/` — manter inalterado.
- A Vercel não está conectada nesta etapa. Nenhum deploy foi presumido.

## Conectar / importar
1. Entrar em https://vercel.com/new com a conta GitHub.
2. Importar o repositório `efredeson/evolufit`.
3. Root Directory: `./` (raiz do repositório), NÃO `android-native/` nem `beta/`.
4. Framework Preset: **Other**.
5. Build Command: **vazio**; Output Directory: **vazio / raiz (`.`)**.
6. Fazer a primeira publicação. Isso cria um projeto da Vercel, mas **não remove o GitHub Pages**.
7. Com o Git conectado, use o PR da branch `feature/vercel-preview` para obter uma URL de Preview. Se precisar, crie uma nova implantação dessa branch diretamente pela Vercel.
8. Conferir os endereços criados na Vercel; não adivinhar slug.

## Páginas esperadas
- `/`: EvoluFit Web principal (localStorage do domínio Vercel).
- `/beta/`: contas e sincronização Supabase.
- `/organizar/`: protótipo isolado; só dados de teste.
- `/sw.js`, `/beta/sw.js`, `/organizar/sw.js`: caches independentes e caminhos dinâmicos.

## Login Supabase: checklist de segurança
1. Projeto Supabase EvoluFit: `qovpsvjfeermpjtjwscb`; NÃO usar projeto GABS RIFAS.
2. Antes de testar registro, confirmação de e-mail ou recuperação de senha em /beta/, em Supabase Authentication → URL Configuration adicionar a URL exata do novo deployment `https://<endereco-real>.vercel.app/beta/` ao **Additional Redirect URLs**.
3. Para muitos previews, se apropriado, usar padrão oficial de wildcard restrito à conta Vercel, não `https://**` indiscriminadamente.
4. **Não alterar o Site URL atual** antes da aprovação final e de verificar que o login funciona no domínio novo.
5. `beta/config.js` contém a chave pública; NUNCA inserir `service_role` ou senha no frontend ou no GitHub.
6. O modo beta aponta para o **mesmo Supabase** do site atual. Os registros em nuvem serão os mesmos da conta, salvo migração explícita futura.

## Avisos sobre dados
- `localStorage` é separado por origem. Dados locais do GitHub Pages NÃO surgem automaticamente na Vercel.
- O login beta com Supabase pode sincronizar dados da mesma conta, após a liberação das URLs de retorno.
- Fotos da prévia `/organizar/` não têm conexão com registros reais.
- Manter o domínio antigo até validação de todas as telas, dados e login.

## Aprovação
A branch/PR é apenas para teste. **Não mesclar no main e não desligar o GitHub Pages sem aprovação.**
