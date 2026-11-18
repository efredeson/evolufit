# EvoluFit — Guia de treinos em casa, por nível (2026)

## Objetivo do projeto

Oferecer exercícios acessíveis em ambientes domésticos, sem academia ou aparelhos, com foco em constância, força funcional, caminhada/cardio de baixo impacto, mobilidade e segurança. Os nove programas são **exemplos educativos para adultos**, não prescrições individualizadas. Um adulto pode permanecer no mesmo nível pelo tempo necessário.

## Referências técnicas e limites da evidência

1. **OMS (diretrizes de atividade física)**: adultos em geral se beneficiam de 150–300 minutos de atividade aeróbica moderada por semana, ou 75–150 minutos vigorosa, além de fortalecimento dos principais grupos musculares ao menos duas vezes por semana; começar aos poucos também traz benefícios. Fonte: https://www.who.int/initiatives/behealthy/physical-activity
2. **ACSM 2026**: exercício resistido com peso corporal, elásticos ou rotinas domésticas pode melhorar força e função física. Não é preciso uma academia ou técnica avançada para ter resultados; aumentar volume/intensidade depende da capacidade e da evolução de cada pessoa. Fonte: https://acsm.org/resistance-training-guidelines-update-2026/ e publicação: https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
3. **CDC**: no exercício aeróbico de intensidade moderada, o teste da conversa é uma referência prática: em geral, consegue-se falar, mas não cantar. Fonte: https://www.cdc.gov/physical-activity-basics/measuring/index.html

**Separação importante:** as fontes acima apoiam os princípios gerais, mas não validam um treino específico do EvoluFit nem estabelecem o tempo exato de cada sessão. Durações, séries, intervalos e adaptação semanal foram desenhados como exemplos conservadores para o aplicativo, com o usuário podendo reduzir quando necessário.

## Os três níveis

| Nível | Para quem | Objetivo | Frequência orientativa |
|---|---|---|---|
| Iniciante | Quem começa, retorna após pausa ou quer movimentos básicos | Aprender execução, tolerância e consistência | Força em 2–3 dias não consecutivos; cardio/mobilidade leves em outros dias |
| Intermediário | Quem já executa movimentos básicos confortavelmente | Aumentar força funcional, estabilidade e condicionamento | Aproximadamente 3 dias de força/semana, alternando grupos/dias |
| Avançado | Quem domina técnica e se recupera bem | Maior volume, variações unilaterais e resistência | 3–4 sessões/semana, com recuperação entre treinos intensos |

O nível é **escolhido pela pessoa**, sem promoção automática por pontuação. Uma recomendação de intensidade **não substitui avaliação de saúde**. As três categorias representam grau de desafio, não idade ou valor pessoal.

## Programas e exercícios

**Iniciante**

- `Primeiros passos: corpo todo` (~22 min): marcha, sentar/levantar, flexão na parede, panturrilhas, passos laterais, alongamento.
- `Cardio leve sem pular` (~20 min): marcha, passos laterais, sentar/levantar, elevações de braços, desaceleração.
- `Mobilidade e postura` (~16 min): ombros, quadril, equilíbrio com apoio, sentar/levantar e alongamento.

**Intermediário**

- `Força funcional em casa` (~32 min): agachamento, flexão inclinada, ponte de glúteos, panturrilhas, prancha com joelhos apoiados.
- `Circuito de energia sem saltos` (~28 min): marcha rápida, passos laterais acelerados, agachamento, flexão na parede.
- `Core, equilíbrio e controle` (~25 min): apoio próximo à parede, ponte de glúteos, prancha adaptada e passos laterais.

**Avançado**

- `Força progressiva sem academia` (~42 min): agachamento com pausa, flexão no chão ou inclinada, passada reversa, ponte de glúteos, prancha.
- `Condicionamento forte sem salto` (~36 min): marcha intensa, deslocamento lateral, agachamento cadenciado, flexão inclinada e prancha.
- `Estabilidade e domínio corporal` (~33 min): passada reversa lenta, ponte unilateral adaptada, prancha com toque de ombro e equilíbrio perto da parede.

Cada plano guarda em `workout-library.js` uma prescrição por exercício, pausa sugerida (quando aplicável), orientação técnica, variação mais leve e progressão gradual, além de indicação de uma imagem coerente com o movimento.

## Exemplo de quatro semanas (não obrigatório)

- **Semana 1:** conheça os movimentos e reduza as séries/duração caso necessário; priorize técnica e tolerância.
- **Semana 2:** mantenha a rotina e os intervalos, sem perseguir fadiga total.
- **Semana 3:** se estiver confortável, acrescente **somente uma variável** (1–2 repetições ou 5–10 segundos em um exercício), não tudo simultaneamente.
- **Semana 4:** reavalie sua técnica, recuperação e conforto; mantenha o nível se ainda estiver desafiador.

Progredir não requer alcançar a exaustão nem fazer o nível avançado. A duração mostrada no cartão é uma **estimativa da sessão**; o histórico é registrado pelo **cronômetro ativo**, sem inventar tempo de atividade.

## Princípios de segurança da interface

- Mantenha cadeira e parede firmes, espaço livre e calçado adequado; não use superfícies instáveis para apoiar peso do corpo.
- Aqueça antes de exercícios mais difíceis e desacelere após a parte principal.
- Durante o movimento, **respire normalmente e não prenda o ar**; não force amplitude ou dor.
- Para intensidade aeróbica moderada, o teste da conversa pode ajudar, mas a percepção individual varia.
- Interrompa em caso de dor no peito, tontura, desmaio, mal-estar importante ou falta de ar incomum; procure assistência apropriada.
- Pessoas com doenças crônicas, gravidez, limitações de mobilidade, lesões ou longo período de inatividade devem ajustar o treino com orientação profissional antes de intensificá-lo.

## Integração técnica

A biblioteca injeta planos no array `PLANS` já existente, preservando os identificadores históricos de `inicio`, `corpo`, `mob` e `energia` e mantendo os registros locais/Supabase intocados. A página de Treinos e a Home leem o nível salvo separadamente no `localStorage` com a chave `evolufit-workout-level-v1`. A seleção é independente por navegador/domínio; sincronização desta preferência entre dispositivos não está implementada. O treino guiado apresenta séries, exercícios, orientações e descanso opcional em tempo real.