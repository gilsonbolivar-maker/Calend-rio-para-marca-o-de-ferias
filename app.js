/* ————————————————————————————————————————————————————————————
   Escala de Férias do Grupo A — três períodos por colega, quadro do
   mês com as folgas da escala de turnos, coincidências e mapa do ano.
   ———————————————————————————————————————————————————————————— */
'use strict';

(() => {

const CHAVE_DADOS = 'escala-ferias:grupos';
const CHAVE_ANO = 'escala-ferias:ano';
const CHAVE_TEMA = 'escala-ferias:tema';
const CHAVE_GRUPO = 'escala-ferias:grupo';

/* Nomes que o app trazia prontos no começo. Ficam aqui só para reconhecer uma
   tabela que ninguém tocou e trocá-la pelas células em branco. */
const SEMENTE_ANTIGA = [
  'Alvaro Lima', 'Amauri Bernardes', 'Bruno Enzo', 'Celia Fernandes', 'Erlan Coutinho',
  'Etelvino Loureço', 'Fernanda Lima', 'Gilson Bolivar', 'Heleno Brito', 'Hemerson',
  'Karla Neves', 'Marivaldo Brito', 'Tiago Fraga'
];

const CELULAS = 3;        // células em branco que cada turno traz prontas

const DIAS_CLT = 30;      // teto de dias de férias por período aquisitivo
const PERIODOS = 3;       // cada colega escolhe até três períodos
const LIMITE = 2;         // no máximo duas pessoas de férias na mesma data
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_INTEIRO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                       'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const SEMANA_INTEIRO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/* Escala de turnos da INB: ciclo de 35 dias, uma coluna por equipe, tirada
   do app Escala de Turnos. 'F' é folga; 0, 8 e 16 são as horas em que o turno
   começa. O dia de índice 0 é 02/08/2026, e o ciclo se repete. Cada equipe tem
   14 folgas e 21 dias de trabalho no ciclo; três equipes trabalham por dia. */
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
const GRUPOS = Object.keys(ESCALA);

const $ = id => document.getElementById(id);

const el = {
  estado: $('estado'),
  ano: $('ano'),
  grupos: $('grupos'),
  grupoTitulo: $('grupo-titulo'),
  grupoLegenda: $('grupo-legenda'),
  supervisor: $('supervisor'),
  anoTitulo: $('ano-titulo'),
  lista: $('lista'),
  novoColega: $('btn-colega'),
  novoColegaTopo: $('btn-colega-topo'),
  ordenar: $('btn-ordenar'),
  limpar: $('btn-limpar'),
  tema: $('btn-tema'),
  info: $('btn-info'),
  diaJanela: $('dia-janela'),
  diaTitulo: $('dia-titulo'),
  diaTurno: $('dia-turno'),
  diaLimite: $('dia-limite'),
  diaGente: $('dia-gente'),
  fecharDia: $('btn-fechar-dia'),
  confirmar: $('confirmar'),
  confirmarTitulo: $('confirmar-titulo'),
  confirmarTexto: $('confirmar-texto'),
  btnConfirmar: $('btn-confirmar'),
  btnCancelar: $('btn-cancelar'),
  sobre: $('sobre'),
  fecharSobre: $('btn-fechar-sobre'),
  pdf: $('btn-pdf'),
  csv: $('btn-csv'),
  salvar: $('btn-salvar'),
  abrir: $('btn-abrir'),
  arquivo: $('arquivo'),
  excessos: $('excessos'),
  listaExcessos: $('lista-excessos'),
  coincidencias: $('coincidencias'),
  listaCoincidencias: $('lista-coincidencias'),
  meses: $('meses'),
  faixas: $('faixas'),
  anoVazio: $('ano-vazio'),
  toast: $('toast'),
  modeloPessoa: $('modelo-pessoa'),
  modeloPeriodo: $('modelo-periodo')
};

/* ————————————————— armazenamento ————————————————— */

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (e) {
    return padrao;
  }
}

function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* modo privado */ }
}

let temporizadorGravacao = 0;
function agendarGravacao() {
  clearTimeout(temporizadorGravacao);
  temporizadorGravacao = setTimeout(gravarTudo, 400);
}

/* ————————————————— datas ————————————————— */

const DIA = 86400000;

/* Meio-dia evita que fuso horário empurre a data para o dia anterior. */
function data(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? null : d;
}

function diasEntre(inicioIso, fimIso) {
  const a = data(inicioIso), b = data(fimIso);
  if (!a || !b) return 0;
  return Math.round((b - a) / DIA) + 1;
}

function paraIso(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function dataBr(iso) {
  const d = data(iso);
  if (!d) return '';
  return d.toLocaleDateString('pt-BR');
}

function curta(iso) {
  const d = data(iso);
  if (!d) return '';
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}

function diaDoAno(d) {
  return Math.round((d - new Date(d.getFullYear(), 0, 1)) / DIA);
}

function diasDoAno(ano) {
  return diaDoAno(new Date(ano, 11, 31)) + 1;
}

function plural(n, um, muitos) {
  return n + ' ' + (Math.abs(n) === 1 ? um : muitos);
}

/* Diferença em dias inteiros, sem depender de hora nem de fuso. */
function distancia(a, b) {
  return Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
                     Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DIA);
}

/* ————————————————— feriados ————————————————— */

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

/* Domingo de Páscoa pelo algoritmo gregoriano — dele saem Carnaval,
   Sexta-feira Santa e Corpus Christi. */
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

/* ————————————————— escala de turnos ————————————————— */

function turnoDoDia(d, qual) {
  const escala = ESCALA[qual || grupo];
  const volta = escala.length;
  return escala[((distancia(ESCALA_BASE, d) % volta) + volta) % volta];
}

function ehFolga(d) {
  return turnoDoDia(d) === 'F';
}

function comoTurno(d) {
  const turno = turnoDoDia(d);
  return turno === 'F' ? 'Folga do Grupo ' + grupo : 'Turno das ' + turno.padStart(2, '0') + 'h';
}

/* ————————————————— estado ————————————————— */

function novoId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function periodosVazios() {
  return Array.from({ length: PERIODOS }, () => ({ inicio: '', fim: '' }));
}

function pessoaVazia(nome) {
  return { id: novoId(), nome: nome || '', periodos: periodosVazios(), obs: '' };
}

/* Todo mundo tem os três períodos disponíveis; tabelas antigas ganham os que faltam. */
function completar(periodos) {
  const lista = periodos.slice();
  while (lista.length < PERIODOS) lista.push({ inicio: '', fim: '' });
  return lista;
}

function grupoInicial() {
  return Array.from({ length: CELULAS }, () => pessoaVazia(''));
}

/* Tabela que ainda está do jeito que veio: os nomes de fábrica e nada marcado. */
function intocada(lista) {
  if (!Array.isArray(lista) || lista.length !== SEMENTE_ANTIGA.length) return false;
  return lista.every((p, i) =>
    (p.nome || '').trim() === SEMENTE_ANTIGA[i] &&
    !(p.obs || '').trim() &&
    (p.periodos || []).every(f => !f.inicio && !f.fim));
}

function saneado(bruto) {
  if (!Array.isArray(bruto)) return null;
  const limpo = bruto.map(p => ({
    id: typeof p.id === 'string' ? p.id : novoId(),
    nome: typeof p.nome === 'string' ? p.nome.slice(0, 60) : '',
    obs: typeof p.obs === 'string' ? p.obs : '',
    periodos: completar(Array.isArray(p.periodos)
      ? p.periodos.map(f => ({
          inicio: typeof f.inicio === 'string' ? f.inicio : '',
          fim: typeof f.fim === 'string' ? f.fim : ''
        }))
      : [])
  }));
  return limpo.length ? limpo : null;
}

/* Cada equipe tem a sua tabela. A do Grupo A já vem com os nomes; as outras
   começam em branco, prontas para receber gente. */
function tabelasVazias() {
  const tudo = {};
  GRUPOS.forEach(g => { tudo[g] = grupoInicial(); });
  return tudo;
}

function lerSupervisores() {
  const guardado = ler(CHAVE_DADOS, null);
  const nomes = {};
  GRUPOS.forEach(g => {
    const nome = guardado && guardado.supervisores && guardado.supervisores[g];
    nomes[g] = typeof nome === 'string' ? nome.slice(0, 60) : '';
  });
  return nomes;
}

function lerTabelas() {
  const guardado = ler(CHAVE_DADOS, null);
  const tudo = tabelasVazias();

  if (guardado && guardado.grupos) {
    GRUPOS.forEach(g => {
      const limpo = saneado(guardado.grupos[g]);
      /* A lista de nomes que ninguém chegou a usar dá lugar às células em branco. */
      if (limpo && !intocada(limpo)) tudo[g] = limpo;
    });
  }
  return tudo;
}

let tabelas = lerTabelas();
let supervisores = lerSupervisores();
let grupo = GRUPOS.includes(ler(CHAVE_GRUPO, '')) ? ler(CHAVE_GRUPO, '') : 'A';
let pessoas = tabelas[grupo];
let ano = Number(ler(CHAVE_ANO, 0)) || new Date().getFullYear();

function definirPessoas(lista) {
  pessoas = lista;
  tabelas[grupo] = lista;
}

function gravarTudo() {
  gravar(CHAVE_DADOS, { versao: 2, grupos: tabelas, supervisores: supervisores });
}

el.supervisor.addEventListener('input', () => {
  supervisores[grupo] = el.supervisor.value;
  agendarGravacao();
});

/* ————————————————— montagem da tabela ————————————————— */

function acharPessoa(id) {
  return pessoas.find(p => p.id === id);
}

function montarPeriodo(pessoa, periodo, indice) {
  const li = el.modeloPeriodo.content.firstElementChild.cloneNode(true);
  const inicio = li.querySelector('.inicio');
  const fim = li.querySelector('.fim');

  li.dataset.pessoa = pessoa.id;
  li.dataset.indice = String(indice);
  li.querySelector('.ordem').textContent = (indice + 1) + 'º';
  li.querySelector('.de span').textContent = (indice + 1) + 'º início';
  li.querySelector('.ate span').textContent = 'fim';
  inicio.value = periodo.inicio || '';
  fim.value = periodo.fim || '';

  /* Avisa assim que a escolha estoura o limite do grupo. */
  const conferirLimite = () => {
    if (!periodo.inicio || !periodo.fim) return;
    const fim = data(periodo.fim);
    for (let d = data(periodo.inicio); d && d <= fim; d.setDate(d.getDate() + 1)) {
      const gente = ocupacaoAtual.get(paraIso(d)) || [];
      if (new Set(gente.map(g => g.pessoa)).size > LIMITE) {
        avisar('Já há ' + LIMITE + ' pessoas em ' + curta(paraIso(d)) + ' — mais de ' + LIMITE + ' não é aceito.');
        return;
      }
    }
  };

  inicio.addEventListener('input', () => {
    periodo.inicio = inicio.value;
    /* Fim em branco (ou antes do início) acompanha o início: 30 dias é o
       pedido mais comum, mas quem quiser menos é só trocar. */
    if (periodo.inicio && (!periodo.fim || data(periodo.fim) < data(periodo.inicio))) {
      const sugestao = new Date(data(periodo.inicio).getTime() + (DIAS_CLT - 1) * DIA);
      periodo.fim = paraIso(sugestao);
      fim.value = periodo.fim;
    }
    aoMudar();
    conferirLimite();
  });
  fim.addEventListener('input', () => { periodo.fim = fim.value; aoMudar(); conferirLimite(); });

  /* Atalhos de 10, 15 e 30 dias: contam a partir do início marcado. */
  li.querySelectorAll('.duracao button').forEach(botao => {
    botao.addEventListener('click', () => {
      if (!periodo.inicio) {
        inicio.focus();
        avisar('Marque primeiro o início do período.');
        return;
      }
      const dias = Number(botao.dataset.dias);
      periodo.fim = paraIso(new Date(data(periodo.inicio).getTime() + (dias - 1) * DIA));
      fim.value = periodo.fim;
      aoMudar();
      conferirLimite();
    });
  });

  /* Os três períodos ficam sempre na tela: limpar esvazia, não remove a linha. */
  li.querySelector('.periodo-limpar').addEventListener('click', () => {
    periodo.inicio = '';
    periodo.fim = '';
    inicio.value = '';
    fim.value = '';
    aoMudar();
  });

  return li;
}

function montarPessoa(pessoa) {
  const artigo = el.modeloPessoa.content.firstElementChild.cloneNode(true);
  const nome = artigo.querySelector('.nome');
  const obs = artigo.querySelector('.obs');
  const periodos = artigo.querySelector('.periodos');

  artigo.dataset.pessoa = pessoa.id;
  nome.value = pessoa.nome;
  obs.value = pessoa.obs;

  pessoa.periodos.forEach((periodo, i) => periodos.append(montarPeriodo(pessoa, periodo, i)));

  nome.addEventListener('input', () => { pessoa.nome = nome.value; aoMudar(); });
  obs.addEventListener('input', () => {
    pessoa.obs = obs.value;
    esticar(obs);
    agendarGravacao();
  });

  artigo.querySelector('.nome-editar').addEventListener('click', () => {
    nome.focus();
    nome.select();
  });

  artigo.querySelector('.pessoa-remover').addEventListener('click', () => {
    const vazia = !pessoa.nome.trim() && !pessoa.obs.trim() &&
      pessoa.periodos.every(f => !f.inicio && !f.fim);

    const remover = () => {
      const posicao = pessoas.indexOf(pessoa);
      definirPessoas(pessoas.filter(p => p !== pessoa));
      if (!pessoas.length) definirPessoas([pessoaVazia('')]);
      montarLista();
      aoMudar();

      avisar('Célula removida.', () => {
        const lista = pessoas.slice();
        lista.splice(Math.min(posicao, lista.length), 0, pessoa);
        definirPessoas(lista);
        montarLista();
        aoMudar();
      });
    };

    /* Célula em branco sai na hora; com nome, data ou observação, pergunta. */
    if (vazia) remover();
    else perguntar('Remover célula',
      'Remover ' + (pessoa.nome.trim() || 'esta célula') +
      ' da tabela? As férias e as observações vão junto.', 'Remover', remover);
  });

  return artigo;
}

function montarLista() {
  el.lista.textContent = '';
  pessoas.forEach(pessoa => el.lista.append(montarPessoa(pessoa)));
  el.lista.querySelectorAll('.obs').forEach(esticar);
  atualizar();
}

/* O campo de observações cresce conforme o texto, sem barra de rolagem. */
function esticar(campo) {
  campo.style.height = 'auto';
  campo.style.height = Math.max(campo.scrollHeight, 38) + 'px';
}

/* ————————————————— cálculos ————————————————— */

/* Todos os períodos com data completa e coerente, já com os dias contados. */
function periodosValidos() {
  const lista = [];
  pessoas.forEach(pessoa => {
    pessoa.periodos.forEach((periodo, indice) => {
      if (!periodo.inicio || !periodo.fim) return;
      const dias = diasEntre(periodo.inicio, periodo.fim);
      if (dias < 1) return;
      lista.push({
        pessoa: pessoa,
        indice: indice,
        inicio: periodo.inicio,
        fim: periodo.fim,
        dias: dias,
        chave: pessoa.id + ':' + indice
      });
    });
  });
  return lista;
}

/* Dois períodos coincidem quando um começa antes de o outro acabar. */
function acharCoincidencias(lista) {
  const pares = [];
  const marcados = new Set();

  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i], b = lista[j];
      if (a.pessoa === b.pessoa) continue;
      if (a.inicio > b.fim || b.inicio > a.fim) continue;

      const inicio = a.inicio > b.inicio ? a.inicio : b.inicio;
      const fim = a.fim < b.fim ? a.fim : b.fim;
      pares.push({ a: a, b: b, inicio: inicio, fim: fim, dias: diasEntre(inicio, fim) });
      marcados.add(a.chave);
      marcados.add(b.chave);
    }
  }
  pares.sort((x, y) => x.inicio.localeCompare(y.inicio));
  return { pares: pares, marcados: marcados };
}

/* Para cada dia marcado, quem o marcou — é o que pinta de vermelho, no quadro
   de um colega, os dias que outro já pediu. */
let ocupacaoAtual = new Map();

function mapaDeOcupacao(lista) {
  const mapa = new Map();
  lista.forEach(f => {
    const fim = data(f.fim);
    for (let d = data(f.inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const chave = paraIso(d);
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push({ pessoa: f.pessoa, inicio: f.inicio, fim: f.fim });
    }
  });
  return mapa;
}

/* Datas com gente demais, agrupadas em faixas de dias seguidos. */
function acharExcessos(ocupacao) {
  const dias = [...ocupacao.entries()]
    .map(([iso, gente]) => ({ iso: iso, nomes: [...new Set(gente.map(g => nomeDe(g.pessoa)))] }))
    .filter(d => d.nomes.length > LIMITE)
    .sort((a, b) => a.iso.localeCompare(b.iso));

  const faixas = [];
  dias.forEach(d => {
    const ultima = faixas[faixas.length - 1];
    if (ultima && ultima.nomes.join('|') === d.nomes.join('|') &&
        distancia(data(ultima.fim), data(d.iso)) === 1) {
      ultima.fim = d.iso;
    } else {
      faixas.push({ inicio: d.iso, fim: d.iso, nomes: d.nomes });
    }
  });
  return faixas;
}

/* Períodos que passam por alguma data acima do limite. */
function periodosNoExcesso(lista, ocupacao) {
  const chaves = new Set();
  lista.forEach(f => {
    const fim = data(f.fim);
    for (let d = data(f.inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const gente = ocupacao.get(paraIso(d)) || [];
      if (new Set(gente.map(g => g.pessoa)).size > LIMITE) {
        chaves.add(f.chave);
        return;
      }
    }
  });
  return chaves;
}

function atualizar() {
  const lista = periodosValidos();
  const { pares, marcados } = acharCoincidencias(lista);
  const ocupacao = mapaDeOcupacao(lista);
  ocupacaoAtual = ocupacao;
  const excessos = acharExcessos(ocupacao);
  const noExcesso = periodosNoExcesso(lista, ocupacao);
  /* Muda quando qualquer pessoa mexe nas datas: obriga a redesenhar os quadros. */
  const impressao = lista.map(f => f.pessoa.id + f.inicio + f.fim).join('|');

  /* dias de cada período e erros de preenchimento */
  el.lista.querySelectorAll('.periodo').forEach(li => {
    const pessoa = acharPessoa(li.dataset.pessoa);
    if (!pessoa) return;
    const periodo = pessoa.periodos[Number(li.dataset.indice)];
    if (!periodo) return;

    const campoDias = li.querySelector('.dias');
    const erro = li.querySelector('.erro');
    const dias = diasEntre(periodo.inicio, periodo.fim);
    const invalido = Boolean(periodo.inicio && periodo.fim && dias < 1);

    campoDias.textContent = periodo.inicio && periodo.fim && !invalido ? plural(dias, 'dia', 'dias') : '—';
    li.querySelector('.de .valor').textContent = dataBr(periodo.inicio);
    li.querySelector('.ate .valor').textContent = dataBr(periodo.fim);
    desenharQuadro(li, periodo, invalido, pessoa, ocupacao, impressao);
    campoDias.classList.toggle('contado', Boolean(dias > 0 && !invalido));
    li.classList.toggle('invalido', invalido);
    li.classList.toggle('coincide', marcados.has(pessoa.id + ':' + Number(li.dataset.indice)));
    const acima = noExcesso.has(pessoa.id + ':' + Number(li.dataset.indice));
    li.classList.toggle('acima', acima);
    erro.hidden = !invalido && !acima;
    if (invalido) erro.textContent = 'O fim está antes do início.';
    else if (acima) erro.textContent = 'Este período passa por datas com mais de ' +
      LIMITE + ' pessoas — o limite não é aceito.';

    li.querySelectorAll('.duracao button').forEach(botao => {
      botao.classList.toggle('ativo', !invalido && dias === Number(botao.dataset.dias));
    });
  });

  /* total de cada colega */
  el.lista.querySelectorAll('.pessoa').forEach(artigo => {
    const pessoa = acharPessoa(artigo.dataset.pessoa);
    if (!pessoa) return;
    const total = lista.filter(f => f.pessoa === pessoa).reduce((soma, f) => soma + f.dias, 0);
    const campo = artigo.querySelector('.total');
    campo.innerHTML = '<b>' + total + '</b> ' + (total === 1 ? 'dia' : 'dias');
    campo.classList.toggle('demais', total > DIAS_CLT);
    campo.classList.toggle('zero', total === 0);
    if (total > DIAS_CLT) campo.title = 'Acima dos ' + DIAS_CLT + ' dias de um período aquisitivo.';
    else campo.removeAttribute('title');
    artigo.classList.toggle('marcada', total > 0);
  });

  mostrarCoincidencias(pares, excessos);
  desenharAno(lista, noExcesso);
  mostrarEstado(lista);
}

function aoMudar() {
  atualizar();
  agendarGravacao();
}

function mostrarEstado(lista) {
  const comFerias = new Set(lista.map(f => f.pessoa.id)).size;
  const total = lista.reduce((soma, f) => soma + f.dias, 0);
  const partes = [plural(pessoas.length, 'colega', 'colegas')];
  if (comFerias) {
    partes.push(comFerias + ' com férias marcadas', plural(total, 'dia', 'dias'));
  } else {
    partes.push('nenhum pedido marcado');
  }
  el.estado.textContent = partes.join(' · ');
}

function mostrarCoincidencias(pares, excessos) {
  el.listaExcessos.textContent = '';
  el.excessos.hidden = !excessos.length;

  excessos.forEach(faixa => {
    const li = document.createElement('li');
    const quando = faixa.inicio === faixa.fim
      ? curta(faixa.inicio)
      : curta(faixa.inicio) + ' a ' + curta(faixa.fim);
    li.innerHTML = '<b>' + quando + '</b> <span>— ' + plural(faixa.nomes.length, 'pessoa', 'pessoas') +
      ' na mesma data: ' + escapar(faixa.nomes.join(', ')) + '</span>';
    el.listaExcessos.append(li);
  });

  el.listaCoincidencias.textContent = '';
  el.coincidencias.hidden = !pares.length;

  pares.forEach(par => {
    const li = document.createElement('li');
    li.innerHTML = '<b>' + escapar(nomeDe(par.a.pessoa)) + '</b> e <b>' + escapar(nomeDe(par.b.pessoa)) + '</b> ' +
      '<span>— ' + curta(par.inicio) + ' a ' + curta(par.fim) + ', ' + plural(par.dias, 'dia', 'dias') + ' juntos</span>';
    el.listaCoincidencias.append(li);
  });
}

function nomeDe(pessoa) {
  return pessoa.nome.trim() || 'Sem nome';
}

function escapar(texto) {
  return texto.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ————————————————— quadro do mês escolhido ————————————————— */

/* Um quadro por mês que o período atravessa: verde do primeiro ao último dia
   de férias, contorno nas folgas do Grupo A. Só é redesenhado quando as datas
   do período mudam. */
function desenharQuadro(li, periodo, invalido, pessoa, ocupacao, impressao) {
  const quadro = li.querySelector('.quadro');
  const assinatura = (periodo.inicio || '') + '|' + (periodo.fim || '') + '|' + invalido + '|' + impressao;
  if (quadro.dataset.assinatura === assinatura) return;
  quadro.dataset.assinatura = assinatura;
  quadro.textContent = '';

  const inicio = data(periodo.inicio);
  if (!inicio || invalido) {
    quadro.hidden = true;
    return;
  }
  const fim = data(periodo.fim) || inicio;
  quadro.hidden = false;

  let folgas = 0;
  let feriados = 0;
  let ocupados = 0;
  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    if (ehFolga(d)) folgas++;
    if (feriadoDe(d)) feriados++;
    if ((ocupacao.get(paraIso(d)) || []).some(g => g.pessoa !== pessoa)) ocupados++;
  }

  const titulo = document.createElement('p');
  titulo.className = 'quadro-titulo';
  titulo.innerHTML = (Number(li.dataset.indice) + 1) + 'º período · <b>' +
    dataBr(periodo.inicio) + ' a ' + dataBr(periodo.fim || periodo.inicio) + '</b> · ' +
    plural(diasEntre(periodo.inicio, periodo.fim || periodo.inicio), 'dia', 'dias');
  quadro.append(titulo);

  const meses = [];
  const passo = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  while (passo <= fim && meses.length < 4) {
    meses.push(new Date(passo));
    passo.setMonth(passo.getMonth() + 1);
  }
  meses.forEach(mes => quadro.append(montarMes(mes, inicio, fim, pessoa, ocupacao)));

  const nota = document.createElement('p');
  nota.className = 'quadro-nota';
  nota.textContent = (folgas
    ? plural(folgas, 'dia', 'dias') + ' do período já ' + (folgas === 1 ? 'seria' : 'seriam') + ' folga do Grupo A'
    : 'nenhuma folga do Grupo A cai no período') +
    ' · ' + (feriados ? plural(feriados, 'feriado', 'feriados') + ' dentro do período' : 'nenhum feriado no período') +
    (ocupados ? ' · ' + plural(ocupados, 'dia', 'dias') + ' que outro colega já marcou' : '') + '.';
  quadro.append(nota);
}

function montarMes(mes, inicio, fim, pessoa, ocupacao) {
  const bloco = document.createElement('div');
  bloco.className = 'mes';

  const titulo = document.createElement('p');
  titulo.className = 'mes-nome';
  titulo.textContent = MESES_INTEIRO[mes.getMonth()] + ' de ' + mes.getFullYear();
  bloco.append(titulo);

  const grade = document.createElement('div');
  grade.className = 'grade-mes';

  SEMANA.forEach((letra, i) => {
    const cabeca = document.createElement('i');
    cabeca.textContent = letra;
    cabeca.title = SEMANA_INTEIRO[i];
    grade.append(cabeca);
  });

  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const ultimo = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  for (let i = 0; i < primeiro.getDay(); i++) {
    const vazio = document.createElement('span');
    vazio.className = 'dia fora';
    grade.append(vazio);
  }

  const hoje = new Date();
  for (let n = 1; n <= ultimo; n++) {
    const d = new Date(mes.getFullYear(), mes.getMonth(), n);
    const celula = document.createElement('span');
    const ferias = distancia(inicio, d) >= 0 && distancia(d, fim) >= 0;
    const folga = ehFolga(d);
    const feriado = feriadoDe(d);
    const iso = paraIso(d);
    const gente = ocupacao.get(iso) || [];
    const quantos = new Set(gente.map(g => g.pessoa)).size;
    const varios = quantos > 1;
    const outros = gente.filter(g => g.pessoa !== pessoa).map(g => nomeDe(g.pessoa));

    celula.className = 'dia' + (ferias ? ' ferias' : '') + (folga ? ' folga' : '') +
      (feriado ? ' feriado' : '') + (outros.length && !varios ? ' ocupado' : '') +
      (varios ? ' varios' : '') + (quantos > LIMITE ? ' excesso' : '') +
      (distancia(hoje, d) === 0 ? ' hoje' : '');
    celula.textContent = String(n);
    celula.title = dataBr(iso) + ' · ' + comoTurno(d) +
      (feriado ? ' · ' + feriado : '') +
      (quantos ? ' · ' + (varios ? quantos + ' pessoas nesta data' : 'marcado por ' + nomeDe(gente[0].pessoa)) : '') +
      (quantos > LIMITE ? ' — acima do limite de ' + LIMITE : '');

    /* Dia com gente marcada abre a janela com os nomes. */
    if (quantos) {
      celula.dataset.dia = iso;
      celula.classList.add('clicavel');
      celula.setAttribute('role', 'button');
      celula.setAttribute('tabindex', '0');
      celula.removeAttribute('title');   /* quem informa é o balão, sem espera */
    }
    grade.append(celula);
  }

  bloco.append(grade);
  return bloco;
}

/* ————————————————— mapa do ano ————————————————— */

function montarMeses() {
  el.meses.textContent = '';
  const total = diasDoAno(ano);
  MESES.forEach((mes, i) => {
    const dias = new Date(ano, i + 1, 0).getDate();
    const marca = document.createElement('i');
    marca.textContent = mes;
    marca.style.flex = String(dias / total);
    el.meses.append(marca);
  });
}

function grade() {
  const div = document.createElement('div');
  div.className = 'grade';
  const total = diasDoAno(ano);
  for (let i = 0; i < 12; i++) {
    const parte = document.createElement('i');
    parte.style.flex = String(new Date(ano, i + 1, 0).getDate() / total);
    div.append(parte);
  }
  return div;
}

/* 'marcados' são os períodos que passam por alguma data acima do limite. */
function desenharAno(lista, marcados) {
  montarMeses();
  el.faixas.textContent = '';

  const total = diasDoAno(ano);
  const doAno = lista.filter(f => data(f.inicio).getFullYear() <= ano && data(f.fim).getFullYear() >= ano);
  const comFerias = pessoas.filter(p => doAno.some(f => f.pessoa === p));

  el.anoVazio.hidden = comFerias.length > 0;
  el.anoTitulo.textContent = ano;
  if (!comFerias.length) return;

  comFerias.forEach(pessoa => {
    const faixa = document.createElement('div');
    faixa.className = 'faixa';

    const totalDias = doAno.filter(f => f.pessoa === pessoa).reduce((soma, f) => soma + f.dias, 0);
    const quem = document.createElement('span');
    quem.className = 'quem';
    quem.innerHTML = escapar(nomeDe(pessoa)) + ' <i>' + totalDias + 'd</i>';
    quem.title = nomeDe(pessoa) + ' — ' + plural(totalDias, 'dia', 'dias') + ' no ano';

    const trilho = document.createElement('div');
    trilho.className = 'trilho';
    trilho.append(grade());

    doAno.filter(f => f.pessoa === pessoa).forEach(f => {
      /* recorta o período no ano mostrado */
      const inicio = data(f.inicio) < new Date(ano, 0, 1) ? new Date(ano, 0, 1) : data(f.inicio);
      const fim = data(f.fim) > new Date(ano, 11, 31) ? new Date(ano, 11, 31) : data(f.fim);
      const de = diaDoAno(inicio);
      const dias = diaDoAno(fim) - de + 1;

      const barra = document.createElement('span');
      barra.className = 'barra' + (marcados.has(f.chave) ? ' excesso' : '');
      barra.style.left = (de / total * 100) + '%';
      barra.style.width = (dias / total * 100) + '%';
      /* Só o número cabe dentro da barra; as datas ficam na dica e na janela. */
      barra.textContent = dias >= 6 ? dias + 'd' : '';
      barra.title = dataBr(f.inicio) + ' a ' + dataBr(f.fim) + ' · ' + plural(f.dias, 'dia', 'dias');
      trilho.append(barra);
    });

    if (new Date().getFullYear() === ano) {
      const hoje = document.createElement('span');
      hoje.className = 'hoje';
      hoje.style.left = (diaDoAno(new Date()) / total * 100) + '%';
      hoje.title = 'Hoje';
      trilho.append(hoje);
    }

    faixa.append(quem, trilho);
    el.faixas.append(faixa);
  });
}

/* ————————————————— exportar e importar ————————————————— */

function baixar(nome, texto, tipo) {
  const blob = new Blob([texto], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Ponto e vírgula e BOM: é assim que o Excel em português abre certo. */
function comoCsv() {
  const linhas = [['Grupo', 'Colega', 'Período', 'Início', 'Fim', 'Dias', 'Observações']];
  pessoas.forEach(pessoa => {
    const marcados = pessoa.periodos.filter(f => f.inicio && f.fim && diasEntre(f.inicio, f.fim) > 0);
    if (!marcados.length) {
      linhas.push([grupo, pessoa.nome, '', '', '', '', pessoa.obs]);
      return;
    }
    marcados.forEach((f, i) => {
      linhas.push([
        grupo,
        pessoa.nome,
        String(i + 1),
        dataBr(f.inicio),
        dataBr(f.fim),
        String(diasEntre(f.inicio, f.fim)),
        i === 0 ? pessoa.obs : ''
      ]);
    });
  });

  const campo = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return '﻿' + linhas.map(l => l.map(campo).join(';')).join('\r\n');
}

el.csv.addEventListener('click', () => {
  baixar('ferias-grupo-' + grupo + '-' + ano + '.csv', comoCsv(), 'text/csv;charset=utf-8');
  avisar('Planilha baixada.');
});

el.salvar.addEventListener('click', () => {
  const dados = { app: 'escala-de-ferias', versao: 2, ano: ano, grupo: grupo,
                  grupos: tabelas, supervisores: supervisores };
  baixar('escala-de-ferias-' + ano + '.json', JSON.stringify(dados, null, 2), 'application/json');
  avisar('Arquivo salvo. Envie para quem precisa da tabela.');
});

el.abrir.addEventListener('click', () => el.arquivo.click());

el.arquivo.addEventListener('change', async () => {
  const arquivo = el.arquivo.files && el.arquivo.files[0];
  el.arquivo.value = '';
  if (!arquivo) return;

  try {
    const dados = JSON.parse(await arquivo.text());

    /* Arquivo novo traz as cinco equipes; o antigo, só uma tabela. */
    const tudo = dados && dados.grupos ? {} : null;
    if (tudo) {
      GRUPOS.forEach(g => {
        const limpo = saneado(dados.grupos[g]);
        tudo[g] = limpo || grupoInicial();
      });
    }
    const soUma = tudo ? null : saneado(dados && dados.pessoas);
    if (!tudo && !soUma) throw new Error('formato');

    perguntar('Abrir arquivo',
      tudo
        ? 'Substituir as tabelas das cinco equipes pelas do arquivo? O que está guardado agora se perde.'
        : 'Substituir a tabela do Grupo ' + grupo + ' pela do arquivo? O que está guardado agora se perde.',
      'Substituir',
      () => {
        if (tudo) tabelas = tudo;
        else definirPessoas(soUma);
        pessoas = tabelas[grupo];

        if (dados.supervisores) {
          GRUPOS.forEach(g => {
            const nome = dados.supervisores[g];
            if (typeof nome === 'string') supervisores[g] = nome.slice(0, 60);
          });
          el.supervisor.value = supervisores[grupo] || '';
        }

        if (dados.ano) trocarAno(Number(dados.ano));
        montarLista();
        gravarTudo();
        avisar(tudo ? 'Escala do arquivo carregada.' : 'Tabela do Grupo ' + grupo + ' carregada.');
      });
  } catch (e) {
    avisar('Não deu para ler esse arquivo.');
  }
});

/* Não há como um site salvar PDF sozinho: o caminho é a janela de impressão,
   onde “Salvar como PDF” é um dos destinos. */
el.pdf.addEventListener('click', () => {
  avisar('Na janela que abrir, escolha “Salvar como PDF” no destino.');
  setTimeout(() => window.print(), 700);
});

/* ————————————————— comandos gerais ————————————————— */

/* Ordem alfabética ignorando acentos e maiúsculas; quem ainda está sem nome
   vai para o fim da lista. */
function ordenarPorNome() {
  pessoas.sort((a, b) => {
    const x = a.nome.trim();
    const y = b.nome.trim();
    if (!x || !y) return (x ? 0 : 1) - (y ? 0 : 1);
    return x.localeCompare(y, 'pt-BR', { sensitivity: 'base' });
  });
}

el.ordenar.addEventListener('click', () => {
  ordenarPorNome();
  montarLista();
  gravarTudo();
  avisar('Lista em ordem alfabética.');
});

/* Célula nova, já com os três períodos em branco. */
function acrescentarColega() {
  pessoas.push(pessoaVazia(''));
  montarLista();
  agendarGravacao();

  const cartao = el.lista.lastElementChild;
  const nome = cartao.querySelector('.nome');
  cartao.scrollIntoView({ block: 'center', behavior: 'smooth' });
  nome.focus();
  avisar('Colega novo — escreva o nome. Os três períodos já estão prontos.');
}

/* Zera a tabela do turno aberto: volta às células em branco. */
el.limpar.addEventListener('click', () => {
  const anterior = pessoas.slice();
  perguntar('Limpar a tabela do Grupo ' + grupo,
    'Apagar os nomes, as férias e as observações deste turno e voltar às ' +
    CELULAS + ' células em branco? Os outros turnos não são tocados.',
    'Limpar',
    () => {
      definirPessoas(grupoInicial());
      montarLista();
      aoMudar();
      avisar('Tabela do Grupo ' + grupo + ' limpa.', () => {
        definirPessoas(anterior);
        montarLista();
        aoMudar();
      });
    });
});

el.novoColega.addEventListener('click', acrescentarColega);
el.novoColegaTopo.addEventListener('click', acrescentarColega);

/* ————————————————— equipes ————————————————— */

function montarGrupos() {
  el.grupos.textContent = '';
  GRUPOS.forEach(g => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = g;
    botao.title = 'Turno ' + g;
    botao.className = g === grupo ? 'ativo' : '';
    botao.setAttribute('aria-pressed', String(g === grupo));
    botao.addEventListener('click', () => trocarGrupo(g));
    el.grupos.append(botao);
  });
}

function nomearGrupo() {
  el.grupoTitulo.textContent = 'Grupo\u00A0' + grupo;
  el.grupoLegenda.textContent = grupo;
  el.supervisor.value = supervisores[grupo] || '';
  document.title = 'Tabela para marcação de férias — Grupo ' + grupo;
}

function trocarGrupo(novo) {
  if (novo === grupo) return;
  clearTimeout(temporizadorGravacao);
  gravarTudo();

  grupo = novo;
  pessoas = tabelas[grupo];
  gravar(CHAVE_GRUPO, grupo);

  montarGrupos();
  nomearGrupo();
  montarLista();
  avisar('Turno ' + grupo + ' — folgas e tabela deste grupo.');
}

function montarAnos() {
  const atual = new Date().getFullYear();
  const anos = new Set([atual - 1, atual, atual + 1, atual + 2, ano]);
  el.ano.textContent = '';
  [...anos].sort().forEach(a => {
    const opcao = document.createElement('option');
    opcao.value = String(a);
    opcao.textContent = String(a);
    opcao.selected = a === ano;
    el.ano.append(opcao);
  });
}

function trocarAno(novo) {
  ano = novo;
  gravar(CHAVE_ANO, ano);
  montarAnos();
}

el.ano.addEventListener('change', () => {
  trocarAno(Number(el.ano.value));
  atualizar();
});

/* ————————————————— janela do dia ————————————————— */

function abrirJanela(janela) {
  if (janela.showModal) janela.showModal();
  else janela.setAttribute('open', '');
}

function fecharJanela(janela) {
  if (janela.close) janela.close();
  else janela.removeAttribute('open');
}

/* Mostra quem escolheu aquela data, com o período de cada um. */
function mostrarDia(iso) {
  const gente = ocupacaoAtual.get(iso) || [];
  if (!gente.length) return;

  const d = data(iso);
  el.diaTitulo.textContent = SEMANA_INTEIRO[d.getDay()] + ', ' + dataBr(iso);

  const feriado = feriadoDe(d);
  el.diaTurno.textContent = comoTurno(d) + (feriado ? ' · ' + feriado : '');

  const quantos = new Set(gente.map(g => g.pessoa)).size;
  el.diaLimite.hidden = quantos <= LIMITE;
  el.diaLimite.textContent = quantos + ' pessoas nesta data — o limite é ' + LIMITE + '.';

  const vistos = new Set();
  el.diaGente.textContent = '';
  gente.forEach(g => {
    if (vistos.has(g.pessoa)) return;
    vistos.add(g.pessoa);
    const li = document.createElement('li');
    if (gente.length === 1) li.className = 'so-um';
    li.innerHTML = '<b>' + escapar(nomeDe(g.pessoa)) + '</b>' +
      '<span>' + dataBr(g.inicio) + ' a ' + dataBr(g.fim) + ' · ' +
      plural(diasEntre(g.inicio, g.fim), 'dia', 'dias') + '</span>';
    el.diaGente.append(li);
  });

  abrirJanela(el.diaJanela);
}

/* ————————————————— balão com o nome ————————————————— */

/* Um balão discreto com quem marcou a data, seguindo o mouse ou o dedo.
   O toque no dia continua abrindo a janela com os detalhes. */
const dica = document.createElement('div');
dica.className = 'dica';
dica.hidden = true;
document.body.append(dica);

let sumirDica = 0;

function nomesDoDia(iso) {
  const nomes = [...new Set((ocupacaoAtual.get(iso) || []).map(g => nomeDe(g.pessoa)))];
  if (nomes.length > 3) return nomes.slice(0, 2).join(' · ') + ' e mais ' + (nomes.length - 2);
  return nomes.join(' · ');
}

function esconderDica() {
  clearTimeout(sumirDica);
  dica.hidden = true;
}

function mostrarDica(celula) {
  const iso = celula && celula.dataset.dia;
  if (!iso) return esconderDica();

  clearTimeout(sumirDica);
  dica.textContent = curta(iso) + ' · ' + nomesDoDia(iso);
  dica.hidden = false;

  const alvo = celula.getBoundingClientRect();
  const largura = dica.offsetWidth;
  const altura = dica.offsetHeight;
  const x = Math.max(8, Math.min(alvo.left + alvo.width / 2 - largura / 2,
                                 document.documentElement.clientWidth - largura - 8));
  const acima = alvo.top - altura - 8;
  dica.style.left = x + 'px';
  dica.style.top = (acima < 8 ? alvo.bottom + 8 : acima) + 'px';
}

function diaSob(x, y) {
  const alvo = document.elementFromPoint(x, y);
  return alvo && alvo.closest ? alvo.closest('.dia.clicavel') : null;
}

el.lista.addEventListener('mouseover', ev => mostrarDica(ev.target.closest('.dia.clicavel')));
el.lista.addEventListener('mouseleave', esconderDica);

/* No celular o balão acompanha o dedo enquanto ele desliza pelo quadro. */
el.lista.addEventListener('touchstart', ev => {
  const toque = ev.touches[0];
  if (toque) mostrarDica(diaSob(toque.clientX, toque.clientY));
}, { passive: true });

el.lista.addEventListener('touchmove', ev => {
  const toque = ev.touches[0];
  if (toque) mostrarDica(diaSob(toque.clientX, toque.clientY));
}, { passive: true });

el.lista.addEventListener('touchend', () => {
  clearTimeout(sumirDica);
  sumirDica = setTimeout(esconderDica, 1600);
}, { passive: true });

window.addEventListener('scroll', esconderDica, { passive: true });
window.addEventListener('resize', esconderDica);

/* Um só ouvinte para todos os quadros. */
el.lista.addEventListener('click', ev => {
  const celula = ev.target.closest('.dia.clicavel');
  if (celula) {
    esconderDica();
    mostrarDia(celula.dataset.dia);
  }
});

el.lista.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  const celula = ev.target.closest && ev.target.closest('.dia.clicavel');
  if (!celula) return;
  ev.preventDefault();
  mostrarDia(celula.dataset.dia);
});

el.fecharDia.addEventListener('click', () => fecharJanela(el.diaJanela));
el.diaJanela.addEventListener('click', ev => {
  if (ev.target === el.diaJanela) fecharJanela(el.diaJanela);
});

/* ————————————————— confirmação ————————————————— */

/* O confirm() do navegador é frágil no celular: o primeiro toque costuma só
   fechar o teclado, e o Chrome deixa a pessoa bloquear novos diálogos. Esta
   janela é do próprio app. */
let aoConfirmar = null;

function perguntar(titulo, texto, rotulo, acao) {
  el.confirmarTitulo.textContent = titulo;
  el.confirmarTexto.textContent = texto;
  el.btnConfirmar.textContent = rotulo;
  aoConfirmar = acao;
  abrirJanela(el.confirmar);
}

function encerrarPergunta(confirmou) {
  const acao = aoConfirmar;
  aoConfirmar = null;
  fecharJanela(el.confirmar);
  if (confirmou && acao) acao();
}

el.btnConfirmar.addEventListener('click', () => encerrarPergunta(true));
el.btnCancelar.addEventListener('click', () => encerrarPergunta(false));
el.confirmar.addEventListener('click', ev => {
  if (ev.target === el.confirmar) encerrarPergunta(false);
});
el.confirmar.addEventListener('close', () => { aoConfirmar = null; });

/* ————————————————— janela "sobre" ————————————————— */

el.info.addEventListener('click', () => {
  if (el.sobre.showModal) el.sobre.showModal();
  else el.sobre.setAttribute('open', '');   /* navegador antigo, sem <dialog> */
});

el.fecharSobre.addEventListener('click', () => {
  if (el.sobre.close) el.sobre.close();
  else el.sobre.removeAttribute('open');
});

/* Tocar fora da caixa também fecha. */
el.sobre.addEventListener('click', ev => {
  if (ev.target === el.sobre) el.sobre.close();
});

/* ————————————————— tema claro e escuro ————————————————— */

function temaAtual() {
  return document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro';
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  el.tema.textContent = tema === 'claro' ? 'Tema escuro' : 'Tema claro';
  el.tema.setAttribute('aria-pressed', String(tema === 'claro'));
  const cor = document.querySelector('meta[name="theme-color"]');
  if (cor) cor.setAttribute('content', tema === 'claro' ? '#f4f7fb' : '#0b1220');
}

el.tema.addEventListener('click', () => {
  const novo = temaAtual() === 'claro' ? 'escuro' : 'claro';
  aplicarTema(novo);
  try { localStorage.setItem(CHAVE_TEMA, novo); } catch (e) { /* modo privado */ }
});

/* O seletor de data desenha no formato do idioma do navegador. Quando esse
   formato não começa pelo dia, o app escreve a data em dd/mm/aaaa embaixo
   do campo — o pedido é ver sempre dd/mm/aaaa. */
function comecaPeloDia() {
  try {
    const partes = new Intl.DateTimeFormat(navigator.language || 'pt-BR',
      { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date());
    const ordem = partes.filter(p => p.type !== 'literal').map(p => p.type);
    return ordem[0] === 'day';
  } catch (e) {
    return true;
  }
}

let temporizadorAviso = 0;

function esconderAviso() {
  clearTimeout(temporizadorAviso);
  el.toast.hidden = true;
}

function avisar(texto, desfazer) {
  el.toast.textContent = texto;

  if (desfazer) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'desfazer';
    botao.textContent = 'Desfazer';
    botao.addEventListener('click', () => {
      esconderAviso();
      desfazer();
    });
    el.toast.append(botao);
  }

  el.toast.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(esconderAviso, desfazer ? 7000 : 2600);
}

/* Fechar a página sem perder o que acabou de ser digitado. */
window.addEventListener('pagehide', () => {
  clearTimeout(temporizadorGravacao);
  gravarTudo();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* http:// local */ });
  });
}

/* ————————————————— arranque ————————————————— */

aplicarTema(temaAtual());
montarGrupos();
nomearGrupo();
document.documentElement.classList.toggle('datas-visiveis', !comecaPeloDia());
montarAnos();
montarLista();

})();
