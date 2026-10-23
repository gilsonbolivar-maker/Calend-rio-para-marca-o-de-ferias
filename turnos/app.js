/* ————————————————————————————————————————————————————————————
   Escala de Turnos — dias de trabalho e folga das equipes A a E,
   mês a mês, a partir do ciclo de 35 dias.
   ———————————————————————————————————————————————————————————— */
'use strict';

(() => {

const VERSAO = '1.4.0';          /* mesma etiqueta do endereço dos arquivos e do cache */
const VERSAO_DATA = '23/10/2026';

const CHAVE_TURNO = 'escala-turnos:meu';
const CHAVE_TEMA = 'escala-turnos:tema';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
               'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const SEMANA_INTEIRO = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
                        'quinta-feira', 'sexta-feira', 'sábado'];

/* Escala de turnos da INB: ciclo de 35 dias, uma coluna por equipe. 'F' é folga;
   0, 8 e 16 são as horas em que o turno começa. O índice 0 é 02/08/2026. */
const ESCALA = {
  A: [
    '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16', '16', 'F', '0', '0', '0', 'F', 'F',
    'F', '8', '8', '8', '16', '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16', '16'
  ],
  B: [
    '0', '0', 'F', 'F', 'F', '8', '8', '8', '16', '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8',
    '8', '16', '16', '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16', '16', 'F', '0'
  ],
  C: [
    '8', '16', '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16', '16', '16', 'F', '0', '0',
    'F', 'F', 'F', 'F', '8', '8', '16', '16', 'F', '0', '0', '0', 'F', 'F', 'F', '8', '8'
  ],
  D: [
    'F', 'F', 'F', '8', '8', '16', '16', '16', 'F', '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16',
    '16', 'F', '0', '0', '0', 'F', 'F', 'F', '8', '8', '8', '16', '16', 'F', '0', '0', 'F'
  ],
  E: [
    'F', '8', '8', '16', '16', 'F', '0', '0', '0', 'F', 'F', 'F', '8', '8', '8', '16', '16', 'F',
    '0', '0', 'F', 'F', 'F', 'F', '8', '8', '16', '16', '16', 'F', '0', '0', 'F', 'F', 'F'
  ]
};

const ESCALA_BASE = new Date(2026, 7, 2);
const TURNOS = Object.keys(ESCALA);

/* ————————————————— feriados nacionais ————————————————— */

const FERIADOS_FIXOS = [
  [0, 1, 'Confraternização Universal'],
  [3, 21, 'Tiradentes'],
  [4, 1, 'Dia do Trabalho'],
  [8, 7, 'Independência'],
  [9, 12, 'Nossa Senhora Aparecida'],
  [10, 2, 'Finados'],
  [10, 15, 'Proclamação da República'],
  [10, 20, 'Consciência Negra'],
  [11, 25, 'Natal']
];

function pascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const total = h + l - 7 * m + 114;
  return new Date(ano, Math.floor(total / 31) - 1, (total % 31) + 1);
}

const feriadosGuardados = new Map();

function feriadosDoAno(ano) {
  if (feriadosGuardados.has(ano)) return feriadosGuardados.get(ano);

  const lista = new Map();
  const marcar = (d, nome) => lista.set(d.getMonth() + '-' + d.getDate(), nome);
  FERIADOS_FIXOS.forEach(([mes, dia, nome]) => marcar(new Date(ano, mes, dia), nome));

  const domingo = pascoa(ano);
  const movel = (dias, nome) => {
    const d = new Date(domingo);
    d.setDate(d.getDate() + dias);
    marcar(d, nome);
  };
  movel(-47, 'Carnaval (ponto facultativo)');
  movel(-2, 'Sexta-feira Santa');
  movel(60, 'Corpus Christi (ponto facultativo)');

  feriadosGuardados.set(ano, lista);
  return lista;
}

function feriadoDe(d) {
  return feriadosDoAno(d.getFullYear()).get(d.getMonth() + '-' + d.getDate()) || '';
}

/* ————————————————— datas e escala ————————————————— */

const DIA = 86400000;
const $ = id => document.getElementById(id);

const el = {
  hojeData: $('hoje-data'),
  hojeTurnos: $('hoje-turnos'),
  hojeProximos: $('hoje-proximos'),
  grupos: $('grupos'),
  mesNome: $('mes-nome'),
  anterior: $('btn-anterior'),
  proximo: $('btn-proximo'),
  irHoje: $('btn-hoje'),
  quadro: $('quadro'),
  tema: $('btn-tema'),
  instalar: $('btn-instalar'),
  ajudaInstalar: $('ajuda-instalar'),
  passosAndroid: $('passos-android'),
  passosIos: $('passos-ios'),
  fecharInstalar: $('btn-fechar-instalar'),
  info: $('btn-info'),
  sobre: $('sobre'),
  fecharSobre: $('btn-fechar-sobre'),
  toast: $('toast'),
  escolher: $('btn-escolher'),
  seletor: $('seletor'),
  anoValor: $('ano-valor'),
  anoMenos: $('ano-menos'),
  anoMais: $('ano-mais'),
  mesesGrade: $('meses-grade'),
  fecharSeletor: $('btn-fechar-seletor'),
  versao: $('versao'),
  versaoRodape: $('versao-rodape')
};

function mostrarVersao() {
  const texto = 'Versão ' + VERSAO + ' · ' + VERSAO_DATA;
  if (el.versao) el.versao.textContent = texto;
  if (el.versaoRodape) el.versaoRodape.textContent = 'v' + VERSAO;
}

/* Diferença em dias inteiros, sem depender de hora nem de fuso. */
function distancia(a, b) {
  return Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
                     Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DIA);
}

function turnoDe(d, equipe) {
  const escala = ESCALA[equipe];
  const volta = escala.length;
  return escala[((distancia(ESCALA_BASE, d) % volta) + volta) % volta];
}

const ehFolga = (d, equipe) => turnoDe(d, equipe) === 'F';
const comoHora = turno => turno.padStart(2, '0') + 'h';

function dataBr(d) {
  return String(d.getDate()).padStart(2, '0') + '/' +
         String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

function curta(d) {
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}

function plural(n, um, muitos) {
  return n + ' ' + (Math.abs(n) === 1 ? um : muitos);
}

function ler(chave, padrao) {
  try { return localStorage.getItem(chave) || padrao; } catch (e) { return padrao; }
}

function gravar(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) { /* modo privado */ }
}

/* ————————————————— estado ————————————————— */

const hoje = new Date();
let meuTurno = TURNOS.includes(ler(CHAVE_TURNO, '')) ? ler(CHAVE_TURNO, '') : '';
let mes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

/* ————————————————— painel de hoje ————————————————— */

function mostrarHoje() {
  const feriado = feriadoDe(hoje);
  el.hojeData.textContent = SEMANA_INTEIRO[hoje.getDay()] + ', ' + dataBr(hoje) +
    (feriado ? ' · ' + feriado : '');

  el.hojeTurnos.textContent = '';
  TURNOS.forEach(equipe => {
    const turno = turnoDe(hoje, equipe);
    const ficha = document.createElement('span');
    ficha.className = 'ficha' + (turno === 'F' ? '' : ' trabalha t' + turno) +
      (equipe === meuTurno ? ' meu' : '');
    ficha.innerHTML = '<b>' + equipe + '</b><i>' + (turno === 'F' ? 'folga' : comoHora(turno)) + '</i>';
    ficha.title = 'Turno ' + equipe + (turno === 'F' ? ' — folga hoje' : ' — entra às ' + comoHora(turno));
    el.hojeTurnos.append(ficha);
  });

  if (!meuTurno) {
    el.hojeProximos.hidden = true;
    return;
  }

  /* Os próximos dias de trabalho de quem escolheu um turno. */
  const proximos = [];
  const passo = new Date(hoje);
  while (proximos.length < 4) {
    passo.setDate(passo.getDate() + 1);
    if (!ehFolga(passo, meuTurno)) proximos.push(new Date(passo));
  }
  const folgasSeguidas = distancia(hoje, proximos[0]) - 1;

  el.hojeProximos.hidden = false;
  el.hojeProximos.innerHTML = 'Turno ' + meuTurno + ' · ' +
    (ehFolga(hoje, meuTurno)
      ? 'hoje é folga' + (folgasSeguidas ? ' — e ainda ' + plural(folgasSeguidas, 'dia', 'dias') + ' pela frente' : '')
      : 'hoje entra às <b>' + comoHora(turnoDe(hoje, meuTurno)) + '</b>') +
    '. Próximos: ' + proximos.map(d => '<b>' + curta(d) + '</b> ' + comoHora(turnoDe(d, meuTurno))).join(' · ');
}

/* ————————————————— quadro do mês ————————————————— */

/* Em tela estreita o mês vira uma lista vertical: um dia por linha, cinco
   colunas de equipe. Em tela larga, uma linha por equipe e um dia por coluna. */
const estreito = matchMedia('(max-width: 620px)');

function diasDoMes() {
  const dias = [];
  const passo = new Date(mes.getFullYear(), mes.getMonth(), 1);
  while (passo.getMonth() === mes.getMonth()) {
    dias.push(new Date(passo));
    passo.setDate(passo.getDate() + 1);
  }
  return dias;
}

function montarQuadro() {
  el.mesNome.textContent = MESES[mes.getMonth()] + ' de ' + mes.getFullYear();
  el.quadro.textContent = '';
  el.quadro.classList.toggle('vertical', estreito.matches);
  if (estreito.matches) montarLista();
  else montarGrade();
}

/* ——— lista vertical, para o celular ——— */
function montarLista() {
  const cabecalho = document.createElement('div');
  cabecalho.className = 'cabeca-dias';
  cabecalho.append(document.createElement('span'));
  TURNOS.forEach(equipe => {
    const letra = document.createElement('i');
    letra.textContent = equipe;
    if (equipe === meuTurno) letra.className = 'meu';
    cabecalho.append(letra);
  });
  el.quadro.append(cabecalho);

  diasDoMes().forEach(d => {
    const feriado = feriadoDe(d);
    const linha = document.createElement('div');
    linha.className = 'dia-linha' + (distancia(hoje, d) === 0 ? ' hoje' : '') +
      (d.getDay() === 0 || d.getDay() === 6 ? ' fds' : '') + (feriado ? ' feriado' : '');

    const rotulo = document.createElement('span');
    rotulo.className = 'dia-rotulo';
    rotulo.innerHTML = '<b>' + d.getDate() + '</b> <i>' + SEMANA_INTEIRO[d.getDay()].slice(0, 3) + '</i>' +
      (feriado ? '<u>' + feriado.replace(' (ponto facultativo)', '') + '</u>' : '');
    if (feriado) rotulo.title = feriado;
    linha.append(rotulo);

    TURNOS.forEach(equipe => {
      const turno = turnoDe(d, equipe);
      const cel = document.createElement('span');
      cel.className = 'cel' + (turno === 'F' ? '' : ' t' + turno) +
        (equipe === meuTurno ? ' meu' : '');
      cel.textContent = turno === 'F' ? '' : turno.padStart(2, '0') + 'h';
      cel.title = dataBr(d) + ' · Turno ' + equipe + ' · ' +
        (turno === 'F' ? 'folga' : 'entra às ' + comoHora(turno));
      linha.append(cel);
    });

    el.quadro.append(linha);
  });
}

/* ——— grade larga, para telas maiores ——— */
function montarGrade() {
  const dias = diasDoMes();
  const colunas = 'repeat(' + dias.length + ', 1fr)';

  const cabecalho = document.createElement('div');
  cabecalho.className = 'cabecalho';
  cabecalho.style.gridTemplateColumns = colunas;
  dias.forEach(d => {
    const feriado = feriadoDe(d);
    const cab = document.createElement('div');
    cab.className = 'cab' + (d.getDay() === 0 || d.getDay() === 6 ? ' fds' : '') +
      (distancia(hoje, d) === 0 ? ' hoje' : '') + (feriado ? ' feriado' : '');
    cab.innerHTML = '<i>' + SEMANA[d.getDay()] + '</i><b>' + d.getDate() + '</b>';
    if (feriado) cab.title = feriado;
    cabecalho.append(cab);
  });
  el.quadro.append(cabecalho);

  TURNOS.forEach(equipe => {
    const linha = document.createElement('div');
    linha.className = 'linha' + (equipe === meuTurno ? ' meu' : '');

    const trabalho = dias.filter(d => !ehFolga(d, equipe)).length;
    const nome = document.createElement('span');
    nome.className = 'equipe';
    nome.innerHTML = 'Turno ' + equipe + '<i>' + plural(trabalho, 'dia', 'dias') + '</i>';

    const faixa = document.createElement('div');
    faixa.className = 'faixa';
    faixa.style.gridTemplateColumns = colunas;

    dias.forEach(d => {
      const turno = turnoDe(d, equipe);
      const feriado = feriadoDe(d);
      const cel = document.createElement('div');
      cel.className = 'cel' + (turno === 'F' ? '' : ' t' + turno) +
        (distancia(hoje, d) === 0 ? ' hoje' : '') + (feriado ? ' feriado' : '');
      cel.textContent = turno === 'F' ? '' : turno.padStart(2, '0');
      cel.title = dataBr(d) + ' · Turno ' + equipe + ' · ' +
        (turno === 'F' ? 'folga' : 'entra às ' + comoHora(turno)) +
        (feriado ? ' · ' + feriado : '');
      faixa.append(cel);
    });

    linha.append(nome, faixa);
    el.quadro.append(linha);
  });

  centralizarHoje(dias);
}

/* Quando o mês não cabe inteiro, abre já mostrando o dia de hoje. */
function centralizarHoje(dias) {
  const rolagem = el.quadro.parentElement;
  const dentro = dias.some(d => distancia(hoje, d) === 0);
  if (!dentro) {
    rolagem.scrollLeft = 0;
    return;
  }
  requestAnimationFrame(() => {
    const alvo = el.quadro.querySelector('.cel.hoje');
    if (!alvo || rolagem.scrollWidth <= rolagem.clientWidth) return;
    rolagem.scrollLeft = alvo.offsetLeft - rolagem.clientWidth / 2 + alvo.offsetWidth / 2;
  });
}

/* ————————————————— comandos ————————————————— */

function montarTurnos() {
  el.grupos.textContent = '';
  TURNOS.forEach(equipe => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = equipe;
    botao.title = 'Turno ' + equipe;
    botao.className = equipe === meuTurno ? 'ativo' : '';
    botao.setAttribute('aria-pressed', String(equipe === meuTurno));
    botao.addEventListener('click', () => {
      meuTurno = meuTurno === equipe ? '' : equipe;   /* tocar de novo desmarca */
      gravar(CHAVE_TURNO, meuTurno);
      montarTurnos();
      mostrarHoje();
      montarQuadro();
    });
    el.grupos.append(botao);
  });
}

function andarMes(passos) {
  mes = new Date(mes.getFullYear(), mes.getMonth() + passos, 1);
  montarQuadro();
}

/* Escolher mês e ano direto: o ciclo é calculado, então qualquer data serve —
   para trás ou para frente, sem limite. */
let anoEscolhido = 0;

function desenharSeletor() {
  el.anoValor.textContent = anoEscolhido;
  el.mesesGrade.textContent = '';
  MESES.forEach((nome, i) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = nome.slice(0, 3);
    botao.title = nome + ' de ' + anoEscolhido;
    botao.className =
      (anoEscolhido === mes.getFullYear() && i === mes.getMonth() ? 'aberto' : '') +
      (anoEscolhido === hoje.getFullYear() && i === hoje.getMonth() ? ' atual' : '');
    botao.addEventListener('click', () => {
      mes = new Date(anoEscolhido, i, 1);
      fechar(el.seletor);
      montarQuadro();
    });
    el.mesesGrade.append(botao);
  });
}

el.escolher.addEventListener('click', () => {
  anoEscolhido = mes.getFullYear();
  desenharSeletor();
  abrir(el.seletor);
});

el.anoMenos.addEventListener('click', () => { anoEscolhido--; desenharSeletor(); });
el.anoMais.addEventListener('click', () => { anoEscolhido++; desenharSeletor(); });
el.fecharSeletor.addEventListener('click', () => fechar(el.seletor));
el.seletor.addEventListener('click', ev => { if (ev.target === el.seletor) fechar(el.seletor); });

el.anterior.addEventListener('click', () => andarMes(-1));
el.proximo.addEventListener('click', () => andarMes(1));
el.irHoje.addEventListener('click', () => {
  mes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  montarQuadro();
});

/* Arrastar para o lado troca de mês, como numa agenda. */
let toqueX = 0;
el.quadro.addEventListener('touchstart', ev => { toqueX = ev.touches[0].clientX; }, { passive: true });
el.quadro.addEventListener('touchend', ev => {
  const andou = ev.changedTouches[0].clientX - toqueX;
  if (Math.abs(andou) > 90 && el.quadro.parentElement.scrollWidth <= el.quadro.parentElement.clientWidth + 2) {
    andarMes(andou < 0 ? 1 : -1);
  }
}, { passive: true });

/* Girar o celular ou mudar a janela troca o desenho. */
estreito.addEventListener('change', montarQuadro);

document.addEventListener('keydown', ev => {
  if (ev.key === 'ArrowLeft') andarMes(-1);
  if (ev.key === 'ArrowRight') andarMes(1);
});

/* ————————————————— tema e janela ————————————————— */

function temaAtual() {
  return document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro';
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  el.tema.textContent = tema === 'claro' ? '☾' : '☀';
  el.tema.title = tema === 'claro' ? 'Tema escuro' : 'Tema claro';
  const cor = document.querySelector('meta[name="theme-color"]');
  if (cor) cor.setAttribute('content', tema === 'claro' ? '#eef1f6' : '#0b1220');
}

el.tema.addEventListener('click', () => {
  const novo = temaAtual() === 'claro' ? 'escuro' : 'claro';
  aplicarTema(novo);
  gravar(CHAVE_TEMA, novo);
});

const abrir = janela => janela.showModal ? janela.showModal() : janela.setAttribute('open', '');
const fechar = janela => janela.close ? janela.close() : janela.removeAttribute('open');

el.info.addEventListener('click', () => abrir(el.sobre));
el.fecharSobre.addEventListener('click', () => fechar(el.sobre));
el.sobre.addEventListener('click', ev => { if (ev.target === el.sobre) fechar(el.sobre); });

/* ————————————————— aviso rápido ————————————————— */

let temporizadorAviso = 0;

function avisar(texto) {
  el.toast.textContent = texto;
  el.toast.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { el.toast.hidden = true; }, 3200);
}

/* ————————————————— instalar no aparelho ————————————————— */

/* O iPhone não dispara o convite de instalação: lá o caminho é o menu
   Compartilhar do Safari. Por isso o botão é nosso e sempre aparece —
   com o convite do navegador quando existe, com o passo a passo quando não. */
const noIphone = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function jaInstalado() {
  return matchMedia('(display-mode: standalone)').matches ||
         matchMedia('(display-mode: fullscreen)').matches ||
         navigator.standalone === true;
}

let convite = null;

window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();
  convite = ev;
  el.instalar.hidden = jaInstalado();
});

window.addEventListener('appinstalled', () => {
  convite = null;
  el.instalar.hidden = true;
  avisar('App instalado. Abra pelo ícone na tela inicial.');
});

el.instalar.addEventListener('click', async () => {
  if (convite) {
    convite.prompt();
    const escolha = await convite.userChoice;
    convite = null;
    if (escolha && escolha.outcome === 'accepted') el.instalar.hidden = true;
    return;
  }
  /* Sem convite do navegador: o caminho do aparelho em uso vem primeiro,
     logo abaixo do título. */
  if (noIphone) el.passosAndroid.before(el.passosIos);
  abrir(el.ajudaInstalar);
});

el.fecharInstalar.addEventListener('click', () => fechar(el.ajudaInstalar));
el.ajudaInstalar.addEventListener('click', ev => {
  if (ev.target === el.ajudaInstalar) fechar(el.ajudaInstalar);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* http:// local */ });
  });
}

/* ————————————————— arranque ————————————————— */

aplicarTema(temaAtual());
mostrarVersao();
el.instalar.hidden = jaInstalado();
montarTurnos();
mostrarHoje();
montarQuadro();

})();
