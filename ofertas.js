/* ══════════════════════════════════════════════════════
   LM SABOR CASEIRO — ofertas.js
   Painel TV 1920×1080
   Chips coloridos = sabores principais (até 5)
   Badges = TODOS os sabores disponíveis
══════════════════════════════════════════════════════ */

const API_URL      = 'https://script.google.com/macros/s/AKfycby9IwMwWkVEy3zWyjoyZ8jk5Guat3-Q4aU8aG19h_Eb-FwVYOvIAcESyasFiEXLa8DM/exec';
const INTERVALO_MS = 13000;   // duração de cada slide em ms
const DINDIN_VALOR = 3;       // R$ por dindin
const DESTAQUE_INTERVALO_MS = 8000;  // intervalo para alternar destaques (8 segundos)

/* ── MAPA DE IMAGENS ─────────────────────────────────
   Chave = nome exato do item ou categoria
─────────────────────────────────────────────────────── */
const IMAGENS = {
  'Baião Cremoso':      'assets/baiao-cremoso.webp',
  'Baião Tradicional':  'assets/baiao-tradicional.webp',
  'Arroz de Camarão':   'assets/arroz-camarao.webp',
  'Arroz Branco':       'assets/arroz-branco.webp',
  'Camarão ao Alho':    'assets/camarao.webp',
  'Vatapá de Camarão':  'assets/vatapa-camarao.webp',
  'Caranguejo':         'assets/caranguejo.webp',
  'Sopa Caseira':       'assets/sopa.webp',
  'Espetinhos':         'assets/espetinhos.webp',
  'Mousse':             'assets/mousses.webp',
  'Mousses':            'assets/mousses.webp',
  'Cone Trufado':       'assets/cones-trufados.webp',
  'Cones Trufados':     'assets/cones-trufados.webp',
  'Trufa':              'assets/trufas.webp',
  'Trufas':             'assets/trufas.webp',
  'Delícia de Abacaxi': 'assets/delicia-abacaxi.webp',
  'Dindin':             'assets/dindin-gourmet.webp',
  'Dindins Gourmet':    'assets/dindin-gourmet.webp',
  'Suco Natural':       'assets/sucos.webp',
  'Canja':              'assets/canja.webp',
  'Sopa de Carne':      'assets/sopa-de-carne.webp',
  'Pratinho':           'assets/pratinho.webp',
  'Batata Frita':       'assets/batata.webp',
 'Macaxeira Frita':     'assets/macaxeira.webp',
   
};

function getImagem(nome) {
  if (IMAGENS[nome]) return IMAGENS[nome];
  const nomeLow = (nome || '').toLowerCase();
  for (const [k, v] of Object.entries(IMAGENS)) {
    if (nomeLow.includes(k.toLowerCase()) || k.toLowerCase().includes(nomeLow))
      return v;
  }
  return null;
}

/* ── ESTADO ─────────────────────────────────────────── */
let slides = [];
let idx    = 0;
let timer  = null;
let destaqueTimer = null;
let destaqueMode = 'pratos'; // 'pratos' ou 'espetinhos'
let ultimosDados = null;
let espetinhoPage = 0;       // página atual dos espetinhos (para alternar)
const ESPETINHOS_POR_PAGINA = 8;  // mostrar 8 espetinhos por vez

function construirSlides(dados) {

  // Filtra apenas pratos com categoria "Prato" (não inclui espetinhos)
  const pratosDisp = (dados.cardapio || [])
    .filter(p => p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato');
  
  const sobremesas = (dados.sobremesas || []).filter(s => s.nome && s.quantidade > 0);
  const sucos      = (dados.sucos      || []).filter(s => s.nome && s.quantidade > 0);
  const dindins    = (dados.dindins    || []).filter(d => d.nome && d.quantidade > 0);

  /* Pratos */
  const slidesPratos = pratosDisp.map(p => ({
    tipo:      'prato',
    nome:      p.nome,
    categoria: p.categoria || 'Prato do Dia',
    descricao: 'Feito com ingredientes frescos · Sabor caseiro de verdade.',
    saboresPrincipais: null,
    saboresTodos:      null,
    preco:     null,
    tags:      [{ texto: '✓ Disponível', destaque: true }, { texto: 'Feito na Hora' }],
    imagem:    getImagem(p.nome),
  }));

  /* Sobremesas por categoria */
  const catsSob = {};
  sobremesas.forEach(s => {
    const cat = s.categoria || 'Sobremesa';
    if (!catsSob[cat]) catsSob[cat] = [];
    catsSob[cat].push(s);
  });

  const slidesSob = Object.entries(catsSob).map(([cat, itens]) => ({
    tipo:      'sobremesa',
    nome:      cat,
    categoria: 'Doces & Sobremesas',
    descricao: null,
    saboresPrincipais: itens.slice(0, 5).map(s => s.nome),
    saboresTodos:      itens.map(s => s.nome),
    preco:     itens[0] && itens[0].valor ? Number(itens[0].valor) : null,
    tags:      [{ texto: '🍮 Artesanal', destaque: true }, { texto: itens.length + ' Sabores' }],
    imagem:    getImagem(cat),
  }));

  /* Sucos por categoria */
  const catsSuco = {};
  sucos.forEach(s => {
    const cat = s.categoria || 'Sucos';
    if (!catsSuco[cat]) catsSuco[cat] = [];
    catsSuco[cat].push(s);
  });

  const slidesSuco = Object.entries(catsSuco).map(([cat, itens]) => ({
    tipo:      'suco',
    nome:      cat,
    categoria: 'Sucos Naturais',
    descricao: null,
    saboresPrincipais: itens.slice(0, 5).map(s => s.nome),
    saboresTodos:      itens.map(s => s.nome),
    preco:     itens[0] && itens[0].valor ? Number(itens[0].valor) : null,
    tags:      [{ texto: '🥤 Natural', destaque: true }, { texto: itens.length + ' Sabores' }],
    imagem:    getImagem('Suco Natural'),
  }));

  /* Dindins - valor vindo da planilha */
  const valorDindin = dindins.length > 0 && dindins[0].valor ? Number(dindins[0].valor) : 3;

  const slideDindins = dindins.length ? [{
    tipo:      'dindin',
    nome:      'Dindins Gourmet',
    categoria: 'Gelados Artesanais',
    descricao: null,
    saboresPrincipais: dindins.slice(0, 5).map(d => d.nome),
    saboresTodos:      dindins.map(d => d.nome),
    preco:     valorDindin,
    tags:      [{ texto: '🧊 Gelados', destaque: true }, { texto: dindins.length + ' Sabores' }, { texto: `R$ ${valorDindin.toFixed(2).replace('.',',')} un.` }],
    imagem:    getImagem('Dindin'),
  }] : [];

  /* Intercalar: prato → não-prato → prato → não-prato */
  const naoProtos = [...slidesSob, ...slidesSuco, ...slideDindins];
  const resultado = [];
  const maxLen    = Math.max(slidesPratos.length, naoProtos.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < slidesPratos.length) resultado.push(slidesPratos[i]);
    if (i < naoProtos.length)    resultado.push(naoProtos[i]);
  }

  if (!resultado.length) {
    resultado.push({
      tipo:'prato', nome:'LM Sabor Caseiro', categoria:'Cardápio',
      descricao:'Cardápio sendo preparado. Volte em breve!',
      saboresPrincipais:null, saboresTodos:null, preco:null,
      tags:[{ texto:'Comida Caseira', destaque:true }], imagem:null,
    });
  }

  return resultado;
}

/* ══════════════════════════════════════════════════════
   RENDERIZAR SLIDES NO DOM
══════════════════════════════════════════════════════ */
function renderizarSlidesDom() {
  const container = document.getElementById('slide-container');
  container.querySelectorAll('.slide-img, .slide-badges').forEach(e => e.remove());

  slides.forEach((s, i) => {

    /* Imagem */
    const img    = document.createElement('img');
    img.className = 'slide-img' + (i === 0 ? ' ativo' : '');
    img.src       = s.imagem || '';
    if (!s.imagem) img.style.display = 'none';
    img.onerror   = () => { img.style.display = 'none'; };
    container.insertBefore(img, document.getElementById('slide-num'));

    /* Badges — TODOS os sabores (apenas para não-pratos) */
    if (s.saboresTodos && s.saboresTodos.length && s.tipo !== 'prato') {
      const bdiv    = document.createElement('div');
      bdiv.className = 'slide-badges' + (i === 0 ? ' ativo' : '');
      bdiv.innerHTML = s.saboresTodos
        .map(sb => `<span class="badge">${sb}</span>`)
        .join('');
      container.insertBefore(bdiv, document.getElementById('slide-num'));
    }
  });

  /* Progress dots */
  document.getElementById('progress-dots').innerHTML =
    slides.map((_, i) => `<div class="dot${i === 0 ? ' ativo' : ''}"></div>`).join('');
}

/* ══════════════════════════════════════════════════════
   CONTROLE DE SLIDES
══════════════════════════════════════════════════════ */
const ANIM_ELS = () => [
  document.getElementById('nome'),
  document.getElementById('dish-desc'),
  document.getElementById('dish-categoria'),
  document.getElementById('separador'),
  document.getElementById('dish-tags'),
];

function offsetDomIdx(targetIdx) {
  let o = 0;
  for (let i = 0; i < targetIdx; i++) {
    o++; // img
    if (slides[i].saboresTodos && slides[i].saboresTodos.length && slides[i].tipo !== 'prato') o++; // badges
  }
  return o;
}

function setAtivo(on) {
  const container = document.getElementById('slide-container');
  const allEls    = container.querySelectorAll('.slide-img, .slide-badges');
  const dots      = document.getElementById('progress-dots').querySelectorAll('.dot');
  const domStart  = offsetDomIdx(idx);
  const hasBadges = (slides[idx].saboresTodos && slides[idx].saboresTodos.length && slides[idx].tipo !== 'prato');
  const domCount  = hasBadges ? 2 : 1;

  for (let j = domStart; j < domStart + domCount; j++) {
    if (allEls[j]) allEls[j].classList.toggle('ativo', on);
  }
  if (dots[idx]) dots[idx].classList.toggle('ativo', on);
  ANIM_ELS().forEach(e => { if (e) e.classList.toggle('ativo', on); });
}

function preencherTexto() {
  const s    = slides[idx];
  const nome = document.getElementById('nome');
  const desc = document.getElementById('dish-desc');
  const cat  = document.getElementById('cat-texto');
  const tags = document.getElementById('dish-tags');
  const prox = document.getElementById('prox-nome');
  const num  = document.getElementById('slide-num');

  cat.textContent  = s.categoria;
  nome.textContent = s.nome;

  /* Descrição: chips coloridos (sabores principais) para sobremesas/sucos/dindins */
  if (s.saboresPrincipais && s.saboresPrincipais.length && s.tipo !== 'prato') {
    const precoHTML = s.preco
      ? `<div class="preco-grande">R$ ${Number(s.preco).toFixed(2).replace('.', ',')}<span>/ un.</span></div>`
      : '';
    desc.innerHTML = `
      <div class="sabores-principais">
        ${s.saboresPrincipais.map((sb, i) =>
          `<span class="chip-principal cor-${i % 5}">${sb}</span>`
        ).join('')}
      </div>
      ${precoHTML}`;
  } else {
    desc.textContent = s.descricao || '';
  }

  tags.innerHTML = (s.tags || [])
    .map(t => `<span class="tag${t.destaque ? ' tag-destaque' : ''}">${t.texto}</span>`)
    .join('');

  prox.textContent = slides[(idx + 1) % slides.length].nome;
  num.textContent  = `${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}

function trocarSlide() {
  setAtivo(false);
  ANIM_ELS().forEach(e => { if (e) e.classList.remove('ativo'); });

  idx = (idx + 1) % slides.length;

  preencherTexto();
  setTimeout(() => setAtivo(true), 80);
  resetTimer();
}

function resetTimer() {
  const fill = document.getElementById('timer-fill');
  fill.style.transition = 'none';
  fill.style.transform  = 'scaleX(1)';
  fill.offsetHeight; // reflow
  fill.style.transition = `transform ${INTERVALO_MS / 1000}s linear`;
  fill.style.transform  = 'scaleX(0)';
}

/* ══════════════════════════════════════════════════════
   PAINEL DIREITO — "No cardápio hoje" (Alterna entre pratos e espetinhos)
══════════════════════════════════════════════════════ */

// Função para extrair sabores de espetinhos da aba cardapio (categoria "Espetinho")
function getSaboresEspetinhos(dados) {
  const espetinhos = (dados.cardapio || []).filter(item => 
    item.disponivel && 
    item.categoria && 
    item.categoria.toLowerCase() === 'espetinho'
  );
  
  if (espetinhos.length > 0) {
    return espetinhos.map(e => e.nome);
  }
  
  return null;
}

// Renderiza a lista de pratos (categoria "Prato") - até 8 itens
function renderizarPratos(dados) {
  const ordemPersonalizada = ['Baião Cremoso', 'Arroz de Camarão', 'Caranguejo'];
  const pratos = (dados.cardapio || [])
    .filter(p => p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato')
    .sort((a, b) => {
      const idxA = ordemPersonalizada.indexOf(a.nome);
      const idxB = ordemPersonalizada.indexOf(b.nome);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    })
    .slice(0, 8);  // Mostra até 8 pratos
  
  const lista = document.getElementById('dest-lista');
  
  if (!pratos.length) {
    return false;
  }
  
  lista.innerHTML = pratos.map(p => `
    <div class="dest-item">
      <div class="dest-dot"></div>
      <div class="dest-nome">${p.nome}</div>
      <div class="dest-cat">${p.categoria || ''}</div>
    </div>`).join('');
  
  return true;
}

// Renderiza os sabores de espetinhos (alternando páginas)
function renderizarEspetinhos(dados) {
  const sabores = getSaboresEspetinhos(dados);
  const lista = document.getElementById('dest-lista');
  
  if (!sabores || sabores.length === 0) {
    return false;
  }
  
  // Calcula total de páginas
  const totalPages = Math.ceil(sabores.length / ESPETINHOS_POR_PAGINA);
  
  // Garante que a página está dentro dos limites
  if (espetinhoPage >= totalPages) {
    espetinhoPage = 0;
  }
  
  // Pega os sabores da página atual
  const start = espetinhoPage * ESPETINHOS_POR_PAGINA;
  const saboresExibir = sabores.slice(start, start + ESPETINHOS_POR_PAGINA);
  
  // Gera o HTML
  lista.innerHTML = saboresExibir.map(sabor => `
    <div class="dest-item">
      <div class="dest-dot" style="background: #F59B3C;"></div>
      <div class="dest-nome">${sabor}</div>
      <div class="dest-cat">Espetinho</div>
    </div>`).join('');
  
  // Adiciona indicador de página se houver mais de uma página
  if (totalPages > 1) {
    const pageIndicator = document.createElement('div');
    pageIndicator.className = 'dest-item';
    pageIndicator.style.cssText = 'justify-content: center; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06);';
    pageIndicator.innerHTML = `
      <div style="display: flex; gap: 6px; align-items: center; justify-content: center; width: 100%;">
        ${Array(totalPages).fill(0).map((_, i) => `
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${i === espetinhoPage ? '#F59B3C' : 'rgba(255,255,255,0.2)'}; transition: all 0.3s;"></div>
        `).join('')}
        <span style="font-size: 9px; color: rgba(255,255,255,0.25); margin-left: 8px;">${espetinhoPage + 1}/${totalPages}</span>
      </div>
    `;
    lista.appendChild(pageIndicator);
  }
  
  // Avança para a próxima página para a próxima exibição
  espetinhoPage = (espetinhoPage + 1) % totalPages;
  
  return true;
}

// Alterna entre pratos e espetinhos
function alternarDestaques() {
  if (!ultimosDados) return;
  
  if (destaqueMode === 'pratos') {
    // Tenta mostrar espetinhos
    const temEspetinhos = renderizarEspetinhos(ultimosDados);
    if (temEspetinhos) {
      destaqueMode = 'espetinhos';
    }
    // Se não tem espetinhos, continua mostrando pratos
  } else {
    // Volta para pratos
    const temPratos = renderizarPratos(ultimosDados);
    if (temPratos) {
      destaqueMode = 'pratos';
    } else {
      // Se não tem pratos, tenta espetinhos novamente
      renderizarEspetinhos(ultimosDados);
      destaqueMode = 'espetinhos';
    }
  }
}

// Função principal de renderizar destaques (inicia o ciclo)
function renderizarDestaques(dados) {
  ultimosDados = dados;
  
  // Reseta a página de espetinhos
  espetinhoPage = 0;
  
  // Para o timer anterior se existir
  if (destaqueTimer) {
    clearInterval(destaqueTimer);
  }
  
  // Decide o que mostrar primeiro
  const temPratos = renderizarPratos(dados);
  
  if (!temPratos) {
    // Se não tem pratos, tenta mostrar espetinhos
    const temEspetinhos = renderizarEspetinhos(dados);
    if (temEspetinhos) {
      destaqueMode = 'espetinhos';
    } else {
      // Fallback: mensagem padrão
      const lista = document.getElementById('dest-lista');
      lista.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,0.22);padding:6px 0">Cardápio sendo atualizado...</div>';
      return;
    }
  } else {
    destaqueMode = 'pratos';
  }
  
  // Inicia o timer para alternar a cada DESTAQUE_INTERVALO_MS
  destaqueTimer = setInterval(alternarDestaques, DESTAQUE_INTERVALO_MS);
}

/* ══════════════════════════════════════════════════════
   RELÓGIO
══════════════════════════════════════════════════════ */
function atualizarHora() {
  const agora = new Date();

  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });

  document.getElementById('clock').innerText = hora;
  document.getElementById('date').innerText = data.toUpperCase().replace(/\./g, '');
}

setInterval(atualizarHora, 1000);
atualizarHora();

/* ══════════════════════════════════════════════════════
   COPA DO MUNDO 2026 — Widget
══════════════════════════════════════════════════════ */

const COPA = {
  grupo: [
    { nome: 'Brasil',   band: '🇧🇷', j:0, v:0, e:0, d:0, gp:0, gc:0, p:0 },
    { nome: 'Marrocos', band: '🇲🇦', j:0, v:0, e:0, d:0, gp:0, gc:0, p:0 },
    { nome: 'Escócia',  band: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', j:0, v:0, e:0, d:0, gp:0, gc:0, p:0 },
    { nome: 'Haiti',    band: '🇭🇹', j:0, v:0, e:0, d:0, gp:0, gc:0, p:0 },
  ],
  jogos: [
    { data:'13 Jun', hora:'19:00', casa:'Brasil',   fora:'Marrocos', local:'MetLife · NY',    rodada:1, hoje:true  },
    { data:'19 Jun', hora:'21:30', casa:'Brasil',   fora:'Haiti',    local:'Lincoln · Fila.', rodada:2, hoje:false },
    { data:'24 Jun', hora:'19:00', casa:'Escócia',  fora:'Brasil',   local:'Hard Rock · MIA', rodada:3, hoje:false },
  ],
  convocados: ['Vini Jr.','Raphinha','Endrick','Neymar','Rodrygo','Paquetá','Casemiro','Bruno G.','Marquinhos','Alisson'],
  fotos: [
    { emoji:'⚽', caption:'Vinicius Jr. em treino' },
    { emoji:'🟡', caption:'Camisa Canarinho 2026' },
    { emoji:'🏟️', caption:'MetLife Stadium, NY' },
    { emoji:'🙌', caption:'Torcida Brasileira' },
  ],
};

let copaTabAtual = 'jogo';
let copaAutoTimer = null;
const COPA_TABS = ['jogo','grupo','jogos','fotos'];

function copaRenderGrupo() {
  const tbody = document.getElementById('grupo-tbody');
  if (!tbody) return;
  // Ordena por pontos → saldo de gols
  const sorted = [...COPA.grupo].sort((a,b) => (b.p - a.p) || ((b.gp-b.gc)-(a.gp-a.gc)));
  tbody.innerHTML = sorted.map((s,i) => `
    <tr class="${s.nome==='Brasil'?'brasil-row':''}">
      <td><span class="pos-num">${i+1}</span> ${s.band} ${s.nome}</td>
      <td>${s.j}</td>
      <td><strong>${s.p}</strong></td>
      <td>${s.gp-s.gc >= 0 ? '+':''}${s.gp-s.gc}</td>
    </tr>`).join('');
}

function copaRenderJogos() {
  const lista = document.getElementById('jogos-lista');
  if (!lista) return;
  lista.innerHTML = COPA.jogos.map(j => `
    <div class="jogo-card${j.hoje?' jogo-card-hoje':''}">
      <div class="jogo-card-data">${j.data}<br>${j.hora}</div>
      <div class="jogo-card-times">🇧🇷 ${j.casa} <span style="color:rgba(255,255,255,0.3)">×</span> ${j.fora}</div>
      <div class="jogo-card-local">${j.local}</div>
    </div>`).join('');
}

function copaRenderFotos() {
  const grid = document.getElementById('fotos-grid');
  const cap  = document.getElementById('fotos-caption');
  if (!grid) return;
  grid.innerHTML = COPA.fotos.map(f => `
    <div class="foto-slot">${f.emoji}</div>`).join('');
  cap.textContent = '📸 Seleção Brasileira — Copa do Mundo 2026';
}

async function copaRenderJogo() {
  const jogo = COPA.jogos.find(j => j.hoje);
  if (!jogo) return;

  const agora    = new Date();
  const horaJogo = new Date();
  horaJogo.setHours(19, 0, 0, 0);
  const aoVivo = agora >= horaJogo && agora < new Date(horaJogo.getTime() + 120*60000);
  const antes  = agora < horaJogo;

  // Escalação chips (sempre)
  const esc = document.getElementById('esc-nomes');
  if (esc) esc.innerHTML = COPA.convocados
    .map(n => `<span class="esc-chip">${n}</span>`).join('');

  // Tenta buscar placar real
  try {
    const res  = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=IN_PLAY,FINISHED,SCHEDULED', {
      headers: { 'X-Auth-Token': 'SEU_TOKEN_AQUI' }
    });
    const data = await res.json();

    // Procura o jogo Brasil x Marrocos
    const partida = (data.matches || []).find(m =>
      (m.homeTeam.name.includes('Brazil') || m.awayTeam.name.includes('Brazil')) &&
      (m.homeTeam.name.includes('Morocco') || m.awayTeam.name.includes('Morocco'))
    );

    if (partida) {
      const braCasa = partida.homeTeam.name.includes('Brazil');
      const golBra  = braCasa ? partida.score.fullTime.home : partida.score.fullTime.away;
      const golMar  = braCasa ? partida.score.fullTime.away : partida.score.fullTime.home;
      const status  = partida.status; // SCHEDULED, IN_PLAY, FINISHED

      document.getElementById('gol-bra').textContent = golBra ?? '–';
      document.getElementById('gol-mar').textContent = golMar ?? '–';

      const statusTexto = status === 'IN_PLAY' ? 'AO VIVO'
                        : status === 'FINISHED' ? 'FIM'
                        : jogo.hora;

      document.getElementById('placar-status').textContent = statusTexto;
      document.getElementById('jogo-live-badge').style.display = status === 'IN_PLAY' ? 'inline' : 'none';
      return;
    }
  } catch (_) {
    // API indisponível — cai no fallback abaixo
  }

  // Fallback sem API
  document.getElementById('gol-bra').textContent = '–';
  document.getElementById('gol-mar').textContent = '–';
  document.getElementById('placar-status').textContent = antes ? jogo.hora : (aoVivo ? 'AO VIVO' : 'FIM');
  document.getElementById('jogo-live-badge').style.display = aoVivo ? 'inline' : 'none';
}

 
function copaMudarAba(tab) {
  copaTabAtual = tab;
  document.querySelectorAll('.copa-tab').forEach(b => {
    b.classList.toggle('ativo', b.dataset.tab === tab);
  });
  document.querySelectorAll('.copa-panel').forEach(p => {
    p.classList.toggle('ativo', p.id === 'tab-' + tab);
  });
  if (tab === 'jogo')   copaRenderJogo();
  if (tab === 'grupo')  copaRenderGrupo();
  if (tab === 'jogos')  copaRenderJogos();
  if (tab === 'fotos')  copaRenderFotos();
}

function copaIniciar() {
  // Bind manual nos botões
  document.querySelectorAll('.copa-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(copaAutoTimer);
      copaMudarAba(btn.dataset.tab);
      // retoma rotação após 20s de inatividade
      setTimeout(copaIniciarRotacao, 20000);
    });
  });
  copaRenderJogo();
  copaRenderGrupo();
  copaRenderJogos();
  copaRenderFotos();
  copaIniciarRotacao();
}

function copaIniciarRotacao() {
  clearInterval(copaAutoTimer);
  copaAutoTimer = setInterval(() => {
    const cur = COPA_TABS.indexOf(copaTabAtual);
    copaMudarAba(COPA_TABS[(cur + 1) % COPA_TABS.length]);
  }, 10000); // rotaciona a cada 10s
}

// Inicializa quando o DOM estiver pronto
window.addEventListener('load', copaIniciar);

/* ══════════════════════════════════════════════════════
   CARREGAR DADOS DO APPS SCRIPT
══════════════════════════════════════════════════════ */
async function carregarDados() {
  try {
    const res = await fetch(API_URL + '?action=getDados');
    const data = await res.json();

    slides = construirSlides(data);
    idx = 0;

    renderizarSlidesDom();
    preencherTexto();
    setTimeout(() => setAtivo(true), 80);
    renderizarDestaques(data);
    resetTimer();

    document.getElementById('loader-overlay').classList.add('oculto');

    if (timer) clearInterval(timer);
    timer = setInterval(trocarSlide, INTERVALO_MS);

  } catch (e) {
    console.error('Erro ao carregar dados:', e);
    document.getElementById('loader-overlay').innerHTML = `
      <div style="text-align:center">
        <div style="font-size:48px;margin-bottom:16px">⚠️</div>
        <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;
          color:rgba(255,255,255,0.35)">Sem conexão com a planilha</div>
      </div>`;
  }
}

/* Atualizar a cada 5 min sem reiniciar o slide atual */
setInterval(async () => {
  try {
    const res = await fetch(API_URL + '?action=getDados');
    const data = await res.json();
    const novos = construirSlides(data);
    if (JSON.stringify(novos) !== JSON.stringify(slides)) {
      const cur = idx;
      slides = novos;
      idx = Math.min(cur, slides.length - 1);
      renderizarSlidesDom();
      preencherTexto();
      setAtivo(true);
      renderizarDestaques(data);
    }
  } catch (_) { }
}, 5 * 60 * 1000);
// Forçar reflow ao redimensionar a tela
window.addEventListener('resize', () => {
  setTimeout(() => {
    setAtivo(true);
  }, 100);
});

// Detectar orientação da TV (paisagem)
window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

/* ── INIT ────────────────────────────────────────────── */
carregarDados();
