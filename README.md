# EvoluFit 🐱💚 — Aplicativo Web

Aplicativo responsivo/PWA de treinos em casa, caminhadas, alimentação e evolução, com identidade AMOLED preta e verde neon.

## Acessos

- **Versão Web principal (Vercel):** https://evolufit-lake.vercel.app/
- **Beta com contas e sincronização Supabase:** https://evolufit-lake.vercel.app/beta/
- **Prévia de organização:** https://evolufit-lake.vercel.app/organizar/
- **Endereço anterior (preservado para backup):** https://efredeson.github.io/evolufit/

## Como transferir registros locais do endereço antigo

Os dados em `localStorage` e as fotos do IndexedDB são isolados por domínio. Para migrar sem perdê-los:

1. No endereço antigo do GitHub Pages, abra **Perfil → Privacidade & dados → Exportar registros** ou **Transferência de dados → Exportar meus registros**. Isso baixa um JSON local.
2. No endereço novo da Vercel, abra **Perfil → Transferência de dados → Importar histórico JSON**. Selecione o arquivo e confirme o resumo; a importação substitui os dados locais apenas do novo endereço.
3. O JSON não contém fotos. Abra a **galeria do endereço antigo**, salve cada foto pelo botão **Salvar foto**, e no site novo use **Fotos → Adicionar foto** para cadastrá-la de novo.
4. **Não limpe o armazenamento antigo nem apague o backup** antes de conferir que o histórico e as fotos foram transferidos.

Os backups são processados diretamente no navegador e não enviados à Vercel nem ao GitHub.

## Conta e dados sincronizados

A versão `/beta/` utiliza o projeto Supabase existente do EvoluFit, com contas e registros individuais. A migração de hospedagem **não faz uma cópia do banco de dados**: ambos os domínios se conectam ao mesmo projeto. Nunca publicar a chave `service_role` no frontend.

**Configuração necessária no painel Supabase:** Authentication → URL Configuration. Defina `Site URL` como `https://evolufit-lake.vercel.app/beta/` (quando concluir a mudança de endereço) e autorize em `Redirect URLs` os endereços exatos `https://evolufit-lake.vercel.app/beta/` e `https://efredeson.github.io/evolufit/beta/` (o segundo mantém o retorno do legado). Confirmar os links de e-mail e recuperação depois dessa alteração. Isto exige acesso administrativo ao painel Supabase; não se modifica via deploy do GitHub.

## Funcionalidades

- Central de missões, treinos guiados e atividades domésticas
- Caminhadas manuais e histórico
- Refeições, horários e acompanhamento da água
- Evolução de peso e conquistas baseadas em registros
- Fotos privadas no dispositivo (principal) ou associadas à conta (Beta)
- Relógio, cronômetro, lembretes (com a página aberta)
- Exportação e importação segura de registros JSON na versão principal

## Estrutura técnica

HTML, CSS, JavaScript e PWA estática com deploy automático a partir de `main` via GitHub → Vercel. O GitHub Pages permanece disponível temporariamente para resgate de históricos, sem redirecionamento automático. `/android-native/` é projeto separado e não precisa ser publicado pela Vercel.

## Segurança e limitações

- O modo principal não usa login e **não** sincroniza automaticamente entre dispositivos/domínios.
- Registros de caminhada são manuais, sem GPS.
- Notificações do site dependem da página estar ativa; não há push confiável com o aplicativo fechado.
- Fotos guardadas localmente podem ser perdidas se o navegador limpar os dados.
- Exercícios são sugestões gerais; parar em caso de dor, tontura ou falta de ar incomum.

**Licença:** identidade visual EvoluFit reservada ao seu proprietário.
