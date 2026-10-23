# Escala de Turnos — A a E

Dias de trabalho e de folga das cinco equipes, mês a mês, com a hora em que cada
turno começa. Três equipes trabalham por dia e duas folgam.

Página estática em HTML, CSS e JavaScript puros — sem build, sem dependências,
sem servidor. Depois da primeira visita ela abre offline.

## O que a tela mostra

- **Hoje**, no alto: a data e os cinco turnos de uma olhada — quem entra às 00h, 08h
  ou 16h e quem está de folga.
- **Meu turno**: escolha o seu nos botões **A B C D E**. A linha dele ganha destaque
  no quadro e aparece a conta do que vem pela frente — *"hoje é folga. Próximos:
  24/10 00h · 25/10 00h…"*. Tocar de novo no mesmo botão desmarca.
- **Quadro do mês**: uma linha por equipe, uma coluna por dia, com o número da hora
  dentro do quadrado. Vazio é folga. O dia de hoje fica contornado em **vermelho** e os
  **feriados** em **verde** — o nome aparece ao tocar ou passar o mouse.
- Ao lado de cada equipe, quantos dias de trabalho ela tem naquele mês.

No **celular o quadro fica em pé**: uma linha por dia, com as cinco equipes lado a
lado — sem precisar arrastar para o lado. Em tela larga ele vira deitado, uma linha
por equipe e um dia por coluna, e abre já centralizado no dia de hoje. Girar o
aparelho troca o desenho sozinho.

Para mudar de mês: as setas **‹ ›**, o botão **Hoje**, as setas do teclado ou um
arraste para o lado. Tocando no **nome do mês** abre o seletor, com os doze meses e
as setas de ano — dá para ir a qualquer mês, de qualquer ano, para frente ou para
trás. Não há limite: a escala é calculada pelo ciclo, não uma tabela guardada, e o
cálculo vale igual em 1990 ou em 2090.

## A escala

Ciclo de **35 dias** que se repete, uma coluna por equipe, contado a partir de
02/08/2026 — o mesmo do app Escala de Turnos (INB). Cada equipe tem 21 dias de
trabalho e 14 de folga por ciclo. `F` é folga; `0`, `8` e `16` são as horas em que o
turno começa. Fica em `ESCALA`, no topo do `app.js`; mudou a escala, muda ali.

Os feriados nacionais são calculados pelo próprio app, inclusive os que andam com a
Páscoa, então valem para qualquer ano.

## Instalar no celular

No Android, abra no Chrome e use **Instalar app** no menu do navegador. No iPhone e
no iPad, abra **no Safari** e use **Compartilhar → Adicionar à Tela de Início**.
Instalado, abre em tela cheia e funciona sem internet.

## Estrutura

```
index.html            painel de hoje, seletor de turno e quadro do mês
app.css               estilos (temas claro e escuro, celular e impressão)
app.js                escala, feriados e desenho do quadro
sw.js                 service worker: abre sem rede
manifest.webmanifest  dados de instalação do PWA
icones/               ícones 180, 192, 512 e maskable
```

## Versão

A versão aparece no rodapé da página e na janela do **ⓘ** — hoje **1.3.0**. O mesmo
número vai no endereço do CSS e do JavaScript (`app.js?v=1.3.0`) e no nome do cache do
service worker, então cada versão nova chega inteira ao aparelho, sem sobra da
anterior. Ao mexer no app, suba o número nos três lugares: `VERSAO` no `app.js`,
`VERSAO` no `sw.js` e o `?v=` no `index.html`.
