# Tabela para marcação de férias

Marcação de férias das cinco equipes de turno. **Cada turno tem a sua tabela**, com
**três períodos por colega**, um espaço de observações para cada um e, embaixo de
cada período, o **quadro do mês escolhido** — em verde os dias de férias, com
contorno azul as folgas **daquela equipe** na escala de turnos.

Página estática em HTML, CSS e JavaScript puros — sem build, sem dependências,
sem servidor. Depois da primeira visita ela abre offline.

## Como usar

Comece escolhendo o **turno** nos botões **A B C D E**, no alto da página. Cada um
tem a sua lista de colegas, as suas férias e as suas folgas; trocar de turno troca a
tabela inteira, e nada se mistura. Todos começam com **três células em branco**, e
**＋ Adicionar colega** — no alto da tabela e no fim da lista — cria quantas mais
precisar. **Limpar tabela**, ao lado, apaga tudo do turno aberto e devolve as células
em branco; os outros turnos não são tocados, e o aviso deixa **Desfazer** por alguns
segundos.

1. Cada colega tem **três períodos** — 1º, 2º e 3º. Marque **início** e **fim**
   nos que precisar; quem tira as férias de uma vez usa só o primeiro.
2. Ao preencher só o início, o fim vem sugerido com 30 dias. Os botões
   **10 dias**, **15 dias** e **30 dias** logo abaixo contam a partir do início
   marcado e acertam o fim num toque; o botão da duração em uso fica aceso. Para
   qualquer outra quantidade, é só escrever a data de fim na mão.
3. O **✕** ao lado do período limpa aquelas datas (a linha continua ali).
4. Use o campo de **observações** para o que precisar ficar registrado — troca de
   plantão, emenda com feriado, preferência de mês.

As células vêm em branco, esperando os nomes. Para **escrever ou trocar um nome**, toque no lápis
**✎** ao lado dele (ou clique direto no nome) e escreva por cima. **＋ Adicionar
colega** — o botão largo no alto da tabela, e também no fim da lista — cria uma célula
nova, já com os três períodos, o campo de observações e tudo o mais; a tela rola até
ela com o cursor no nome. O **✕** ao lado do nome remove a célula: em
branco ela sai num toque, com o aviso **Desfazer** por alguns segundos; com nome,
data ou observação, o app pergunta antes. Depois de mexer nos
nomes, **Ordenar A–Z** põe a lista de volta em ordem — acentos e maiúsculas não
atrapalham, e quem ainda está sem nome fica no fim.

## O quadro do mês

Assim que um período tem data, aparece embaixo dele o calendário do mês escolhido
(dois calendários, quando as férias viram o mês ou o ano). No alto do quadro fica o
período escrito por extenso, sempre em **dd/mm/aaaa**, e no calendário:

- **Verde**: os dias de férias, do primeiro ao último do período.
- **Vermelho claro**: dias que **um colega já marcou** — serve para escolher sabendo
  o que está tomado.
- **Vermelho forte**: **duas pessoas** na mesma data — o limite do grupo.
- **Vermelho escuro riscado**: **mais de duas pessoas** na mesma data. Não é aceito:
  o período fica com aviso de erro e a data entra na lista *Acima do limite*.
- **Passando o mouse ou o dedo** por um dia marcado, um balão discreto mostra na hora
  o nome de quem já escolheu aquela data.
- **Tocando no dia**, abre a janela com os nomes, o período de cada um, o turno do dia
  e o feriado, se houver.
- **Contorno azul**: as **folgas do Grupo A** naquele mês, pela escala de turnos.
- **Ponto amarelo**: **feriado** — o nome aparece ao passar o dedo ou o mouse em cima.
- **Tracejado**: o dia de hoje.
- Embaixo, quantos dias do período já cairiam em folga, quantos feriados caem dentro
  dele e quantos dias outro colega já tinha marcado.

Os feriados são os nacionais: os de data fixa (1º de janeiro, Tiradentes, Dia do
Trabalho, Independência, Nossa Senhora Aparecida, Finados, Proclamação da República,
Consciência Negra e Natal) e os que andam com a Páscoa — Sexta-feira Santa, e ainda
Carnaval e Corpus Christi, marcados como ponto facultativo. A Páscoa é calculada pelo
app, então vale para qualquer ano. Feriado municipal ou estadual não entra: se houver
algum que conte para o grupo, o lugar dele é o campo de observações.

## Tema claro e tema escuro

O botão **Tema claro** / **Tema escuro** troca entre fundo branco e fundo preto, e a
escolha fica guardada no aparelho. Na primeira visita o app segue o tema do sistema.
A impressão sai sempre em fundo branco, seja qual for o tema da tela.

## Datas em dd/mm/aaaa

Tudo que o app escreve — quadro do mês, coincidências, CSV e papel — sai em
dd/mm/aaaa. O seletor de data em si é o do navegador, e ele desenha no formato do
**idioma do aparelho**: em português já aparece dd/mm/aaaa. Se o navegador estiver em
outro idioma, o app percebe e escreve a data em dd/mm/aaaa logo abaixo do campo.

A escala vem do app **Escala de Turnos** (INB): um ciclo de 35 dias que se repete,
com o dia 02/08/2026 como referência, uma coluna por equipe — `F` é folga; `0`, `8`
e `16` são as horas em que o turno começa. Cada equipe tem 14 folgas e 21 dias de
trabalho no ciclo, e três equipes trabalham por dia. Fica em `ESCALA`, no topo do
`app.js`; mudou a escala, muda ali.

## O que a tabela mostra sozinha

- **Dias de cada período** e o **total de cada colega**. Passando de 30 dias, o
  total fica vermelho — é o teto de um período aquisitivo na CLT.
- **Acima do limite**: o grupo aceita no máximo **duas pessoas de férias na mesma
  data**. Passando disso, o app avisa na hora da marcação, marca o período com erro,
  risca os dias no quadro e lista as datas com quem está nelas. A marcação não é
  apagada — quem resolve é o grupo —, mas fica impossível não ver.
- **Quem coincide com quem**: as duplas que ficam fora ao mesmo tempo, com as datas
  e quantos dias se cruzam. Dentro do limite, é só informação.
- **Mapa do ano**: uma barra por período, de jan a dez, com os meses em faixas
  alternadas, o total de dias ao lado de cada nome, o número de dias dentro da barra
  e a linha verde do dia de hoje. Barra escura riscada é período que passa por data
  acima do limite. Em tela estreita, o mapa desliza para o lado.

O aviso de 30 dias, o do limite de duas pessoas e o de coincidência são conferências
de bom senso, não validação jurídica: quem fecha a escala é o RH.

## Guardar e passar adiante

Tudo é gravado sozinho **no navegador deste aparelho** (`localStorage`) — ninguém
mais enxerga a sua tabela, e limpar os dados do site apaga tudo.

Como não há servidor, a tabela viaja em arquivo:

- **Salvar PDF** abre a janela de impressão: escolha *Salvar como PDF* no destino
  (ou a impressora, para sair em papel). No papel as datas viram texto, os quadros
  saem coloridos e os períodos em branco viram linhas para preencher à mão.
  Um site não consegue gerar o PDF sozinho sem carregar uma biblioteca; quem monta
  o arquivo é o próprio navegador, por essa janela.
- **Salvar arquivo** baixa um `.json` com **as cinco tabelas de uma vez**. Mande para
  quem precisa; quem recebe abre em **Abrir arquivo** (isso substitui o que estiver
  guardado). Arquivo do app antigo, de uma tabela só, também abre — vai para o turno
  aberto no momento.
- **Baixar CSV** gera uma planilha **do turno aberto** (`;` e datas em dd/mm/aaaa, do
  jeito que o Excel em português abre direto).

## Instalar no celular

No Android, abra no Chrome e use **Instalar app** no menu do navegador. No iPhone
e no iPad, abra **no Safari** e use **Compartilhar → Adicionar à Tela de Início**.
Instalado, abre em tela cheia e funciona sem internet.

## Publicar

Todo push na `main` publica o repositório no GitHub Pages, pelo workflow em
`.github/workflows/pages.yml`. A primeira execução liga o Pages sozinha — não é
preciso configurar nada em Settings.

- No ar: <https://gilsonbolivar-maker.github.io/Calend-rio-para-marca-o-de-ferias/>

Todos os caminhos são relativos, então o app também funciona em qualquer subpasta
ou aberto de outro servidor.

Para testar na máquina:

```sh
python3 -m http.server 8080
```

E abra `http://localhost:8080`.

## Estrutura

```
index.html            tabela, coincidências, mapa do ano e os modelos de linha
app.css               estilos (temas claro e escuro, celular e impressão)
app.js                escala das cinco equipes, feriados, contas, quadros, CSV e arquivo
sw.js                 service worker: abre sem rede
manifest.webmanifest  dados de instalação do PWA
icones/               ícones 180, 192, 512 e maskable
.github/workflows/    publicação no GitHub Pages
```

Nada aqui é gerado por ferramenta: os arquivos do repositório são exatamente os
que o navegador recebe.

## Créditos

Desenvolvido por **Gilson Bolivar**. O crédito aparece no botão **ⓘ**, no alto da
página, e no pé da tabela impressa.

A escala de turnos usada para marcar as folgas do Grupo A vem do app Escala de
Turnos (INB).
