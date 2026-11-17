# EvoluFit 🐱💚 — Protótipo Web v0.1

Aplicativo de **treinos em casa, caminhadas, alimentação e acompanhamento da evolução**, com interface branca e verde para computadores e celulares.

## Testar o aplicativo
Depois de ativar GitHub Pages em **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**, visite:

**https://efredeson.github.io/evolufit/**

## Recursos
- Painel de hábitos e hidratação
- Treinos domésticos de intensidades diferentes e registro de conclusão
- Caminhadas registradas manualmente
- Horários de refeições, check-in e lembretes quando a página estiver aberta
- Peso, altura, cálculo informativo de IMC e histórico
- Galeria de fotos locais no IndexedDB
- Cronômetro/temporizador
- Perfil e exportação JSON dos registros

## Estado de desenvolvimento e privacidade
Esta é uma **versão demonstrativa**, sem cadastro, servidor ou sincronização. Os registros ficam no navegador (localStorage) e as fotos no armazenamento local do próprio dispositivo (IndexedDB). Limpar os dados do navegador ou mudar de dispositivo pode apagar o histórico. A exportação JSON não inclui as fotos.

As notificações não funcionam de forma confiável com o app fechado. Caminhadas e distâncias são cadastradas manualmente, sem GPS. O IMC é apenas informativo, não um diagnóstico. Os treinos são sugestões gerais, sem prescrição individual.

O site é público, mas os dados locais **não são enviados ao repositório do GitHub**.

## Tecnologia
HTML, CSS, JavaScript, PWA e GitHub Pages, sem dependências externas.

## Desenvolvimento futuro
Login e sincronização de dados; armazenamento remoto privado com controle de acesso; fotos com backup seguro; recursos avançados de treinos; notificações agendadas; caminhada com GPS opcional.

**Licença de uso e identidade visual:** marca e materiais do projeto EvoluFit, sujeitos à autorização do proprietário.
