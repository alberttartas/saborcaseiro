/* ══════════════════════════════════════════════════════
   LM SABOR CASEIRO — ofertas.js
   Painel TV 1920×1080
   Chips coloridos = sabores principais (até 5)
   Badges = TODOS os sabores disponíveis
══════════════════════════════════════════════════════ */

const API_URL      = 'https://script.google.com/macros/s/AKfycby9IwMwWkVEy3zWyjoyZ8jk5Guat3-Q4aU8aG19h_Eb-FwVYOvIAcESyasFiEXLa8DM/exec';
const INTERVALO_MS = 13000;   // duração de cada slide em ms
const DINDIN_VALOR = 6;       // R$ por dindin
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
 'Caldo de Mocoto':     'assets/mocoto.webp',
   
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
   COPA DO MUNDO 2026 — Código Corrigido
══════════════════════════════════════════════════════ */

const COPA = {
  grupo: [],
  jogos: [],
  convocados: [
    { nome: 'Alisson', num: 1, pos: 'GOL' },
    { nome: 'Marquinhos', num: 4, pos: 'ZAG' },
    { nome: 'Casemiro', num: 5, pos: 'VOL' },
    { nome: 'Vini Jr.', num: 7, pos: 'ATA' },
    { nome: 'Neymar', num: 10, pos: 'MEI' },
    { nome: 'Raphinha', num: 11, pos: 'ATA' },
    { nome: 'Endrick', num: 9, pos: 'ATA' },
    { nome: 'Bruno G.', num: 8, pos: 'VOL' },
    { nome: 'Paquetá', num: 10, pos: 'MEI' },
    { nome: 'Rodrygo', num: 11, pos: 'ATA' },
    { nome: 'Bremer', num: 3, pos: 'ZAG' },
    { nome: 'Ederson', num: 12, pos: 'GOL' },
  ],
};

let copaTabAtual = 'jogo';
let copaAutoTimer = null;
const COPA_TABS = ['jogo', 'grupo', 'jogos', 'fotos'];

// Função para obter o próximo jogo do Brasil
// Função para obter o próximo jogo do Brasil
function getProximoJogo() {
  if (!COPA.jogos || COPA.jogos.length === 0) {
    console.log('Nenhum jogo carregado ainda');
    return null;
  }
  
  const agora = new Date();
  console.log('Data atual:', agora);
  
  // Filtra jogos que ainda não aconteceram (status TIMED, SCHEDULED, IN_PLAY, PAUSED)
  const jogosFuturos = COPA.jogos.filter(jogo => {
    // Inclui jogos com status TIMED (agendados)
    if (jogo.status === 'TIMED') return true;
    if (jogo.status === 'SCHEDULED') return true;
    if (jogo.status === 'IN_PLAY') return true;
    if (jogo.status === 'PAUSED') return true;
    
    // Se tem data e é no futuro, inclui (fallback)
    if (jogo.dataHora && jogo.dataHora > agora) return true;
    
    return false;
  });
  
  console.log('Jogos futuros encontrados:', jogosFuturos.length);
  
  if (jogosFuturos.length === 0) {
    console.log('Nenhum jogo futuro encontrado');
    return null;
  }
  
  // Ordena por data (do mais próximo para o mais distante)
  jogosFuturos.sort((a, b) => a.dataHora - b.dataHora);
  const proximo = jogosFuturos[0];
  
  console.log('PRÓXIMO JOGO:', proximo.casa, 'vs', proximo.fora, 'em', proximo.dataHora);
  
  return proximo;
}

// Função para formatar a data do jogo
function formatarDataJogo(dataObj) {
  if (!dataObj || isNaN(dataObj.getTime())) return '';
  
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const diaSemana = diasSemana[dataObj.getDay()];
  const dia = dataObj.getDate();
  const mes = meses[dataObj.getMonth()];
  const hora = String(dataObj.getHours()).padStart(2, '0');
  const minuto = String(dataObj.getMinutes()).padStart(2, '0');
  
  return `${diaSemana}, ${dia} de ${mes} às ${hora}:${minuto}`;
}

function getBandeira(pais) {
  const bandeiras = {
    'Brasil': '🇧🇷',
    'Marrocos': '🇲🇦',
    'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Haiti': '🇭🇹'
  };
  return bandeiras[pais] || '🏳️';
}

/* ── Render: Próximo Jogo ─────────────────── */
function copaRenderJogo() {
  const proximoJogo = getProximoJogo();
  
  // Elementos do DOM
  const placarStatus = document.getElementById('placar-status');
  const placarLocal = document.getElementById('placar-local');
  const placarData = document.getElementById('placar-data');
  const golBraEl = document.getElementById('gol-bra');
  const golMarEl = document.getElementById('gol-mar');
  const jogoLiveBadge = document.getElementById('jogo-live-badge');
  const advNomeEl = document.querySelector('.placar-time:last-child .placar-nome');
  const advBandeiraEl = document.querySelector('.placar-time:last-child .placar-bandeira');
  
  if (!proximoJogo) {
    if (placarStatus) placarStatus.textContent = 'Aguardando dados';
    if (placarLocal) placarLocal.textContent = 'Carregando...';
    if (placarData) placarData.textContent = '';
    if (golBraEl) golBraEl.textContent = '—';
    if (golMarEl) golMarEl.textContent = '—';
    if (jogoLiveBadge) jogoLiveBadge.style.display = 'none';
    if (advNomeEl) advNomeEl.textContent = 'A definir';
    if (advBandeiraEl) advBandeiraEl.textContent = '🏳️';
    return;
  }
  
  // Atualiza adversário
  const advNome = proximoJogo.casa === 'Brasil' ? proximoJogo.fora : proximoJogo.casa;
  if (advNomeEl) advNomeEl.textContent = advNome;
  if (advBandeiraEl) advBandeiraEl.textContent = getBandeira(advNome);
  
  // Atualiza placar
  const golBra = (proximoJogo.golBra !== null && proximoJogo.golBra !== undefined) ? proximoJogo.golBra : '—';
  const golAdv = (proximoJogo.golAdv !== null && proximoJogo.golAdv !== undefined) ? proximoJogo.golAdv : '—';
  
  if (golBraEl) golBraEl.textContent = golBra;
  if (golMarEl) golMarEl.textContent = golAdv;
  
  // Atualiza status
  let statusTexto = '';
  let showBadge = false;
  
  if (proximoJogo.status === 'IN_PLAY') {
    statusTexto = 'AO VIVO';
    showBadge = true;
  } else if (proximoJogo.status === 'PAUSED') {
    statusTexto = 'INTERVALO';
    showBadge = true;
  } else if (proximoJogo.status === 'FINISHED') {
    statusTexto = 'FIM DE JOGO';
    showBadge = false;
  } else {
    statusTexto = 'PRÓXIMO JOGO';
    showBadge = false;
  }
  
  if (placarStatus) placarStatus.textContent = statusTexto;
  if (jogoLiveBadge) jogoLiveBadge.style.display = showBadge ? 'inline-flex' : 'none';
  
  // Atualiza local
  if (placarLocal) placarLocal.textContent = proximoJogo.local || 'Estádio do Maracanã';
  
  // Atualiza data
  if (placarData && proximoJogo.dataHora) {
    placarData.textContent = formatarDataJogo(proximoJogo.dataHora);
  }
}

/* ── Render: Tabela do Grupo ─────────────────── */
function copaRenderGrupo() {
  const tbody = document.getElementById('grupo-tbody');
  if (!tbody) return;
  
  if (!COPA.grupo.length) {
    tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
    return;
  }
  
  // Filtra apenas os times do grupo do Brasil (IDs: 764, 815, 8873, 836)
  const timesGrupo = COPA.grupo.filter(time => 
    time.id === 764 || time.id === 815 || time.id === 8873 || time.id === 836
  );
  
  // Ordena por pontos
  const sorted = [...timesGrupo].sort((a, b) => (b.p - a.p) || ((b.gp - b.gc) - (a.gp - a.gc)));
  
  tbody.innerHTML = sorted.map((s, i) => `
    <tr class="${s.nome === 'Brasil' ? 'brasil-row' : ''}">
      <td><span class="pos-num">${i + 1}</span> ${s.nome}</td>
      <td>${s.j}</td>
      <td><strong>${s.p}</strong></td>
      <td>${(s.gp - s.gc) >= 0 ? '+' : ''}${s.gp - s.gc}</td>
    </tr>`).join('');
}

/* ── Render: Lista de Jogos ─────────────────── */
function copaRenderJogos() {
  const container = document.getElementById('jogos-lista');
  if (!container) return;
  
  if (!COPA.jogos.length) {
    container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px">Carregando jogos...</div>';
    return;
  }
  
  container.innerHTML = COPA.jogos.map(jogo => {
    // Corrigido para incluir TIMED como agendado
    const isFinished = jogo.status === 'FINISHED';
    const isLive = jogo.status === 'IN_PLAY' || jogo.status === 'PAUSED';
    const isScheduled = jogo.status === 'TIMED' || jogo.status === 'SCHEDULED';
    const statusText = isLive ? '🔴 AO VIVO' : (isFinished ? '✓ FINALIZADO' : '📅 AGENDADO');
    const statusColor = isLive ? '#f59b3c' : (isFinished ? '#4ade80' : 'rgba(255,255,255,0.5)');
    
    // Formata a data de forma legível
    const dataFormatada = jogo.dataHora ? jogo.dataHora.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : jogo.data;
    
    return `
      <div class="jogo-item" style="background: rgba(255,255,255,0.03); border-radius: 0.5rem; padding: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.5); min-width: 100px;">
          ${dataFormatada}
        </div>
        <div style="flex: 1; text-align: center; font-weight: 600; font-size: 0.55rem;">
          ${jogo.casa} vs ${jogo.fora}
        </div>
        <div style="min-width: 70px; text-align: right;">
          <div style="font-weight: 700; font-size: 0.55rem;">
            ${(jogo.golBra !== null && jogo.golBra !== undefined) ? `${jogo.golBra}-${jogo.golAdv}` : '—'}
          </div>
          <div style="font-size: 0.4rem; color: ${statusColor};">${statusText}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Render: Fotos/Convocação ─────────────────── */
function copaRenderFotos() {
  const grid = document.getElementById('fotos-grid');
  const cap = document.getElementById('fotos-caption');
  if (!grid) return;

  const COR_POS = {
    GOL: '#f59b3c', ZAG: '#60a5fa', LAT: '#60a5fa',
    VOL: '#4ade80', MEI: '#4ade80', ATA: '#f472b6',
  };

  grid.innerHTML = COPA.convocados.map(j => `
    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.4rem; padding: 0.3rem 0.4rem; display: flex; align-items: center; gap: 0.3rem;">
      <span style="font-size: 0.55rem; font-weight: 900; color: #FFD700; min-width: 1rem; text-align: center;">${j.num}</span>
      <div>
        <div style="font-size:0.5rem; font-weight:700; color:rgba(255,255,255,0.85); line-height:1.2">${j.nome}</div>
        <div style="font-size:0.38rem; font-weight:700; color:${COR_POS[j.pos]}; letter-spacing:1px">${j.pos}</div>
      </div>
    </div>`).join('');

  if (cap) cap.textContent = 'Convocados — Copa do Mundo 2026';
}

/* ── Carregar Dados da API via PROXY ─────────────────── */
async function copaCarregarDados() {
  console.log('Carregando dados da Copa via proxy...');
  
  try {
    // Busca classificação via proxy
    const standingsRes = await fetch('/api/copa');
    
    if (!standingsRes.ok) {
      console.error('Erro no proxy /api/copa:', standingsRes.status);
      carregarDadosEstaticos();
      return;
    }
    
    const standingsData = await standingsRes.json();
    console.log('Classificação recebida via proxy');
    
    // Encontra o Brasil e seu grupo
    let brasilId = null;
    let timesGrupo = [];
    
    if (standingsData.standings) {
      // Procura em todos os grupos
      for (const standing of standingsData.standings) {
        const brasilTeam = standing.table?.find(t => t.team.name === 'Brazil');
        if (brasilTeam) {
          brasilId = brasilTeam.team.id;
          console.log('Brasil encontrado! ID:', brasilId);
          
          // Pega os times do mesmo grupo (todos na mesma tabela)
          timesGrupo = standing.table.map(item => ({
            id: item.team.id,
            nome: item.team.name === 'Brazil' ? 'Brasil' :
                  item.team.name === 'Morocco' ? 'Marrocos' :
                  item.team.name === 'Scotland' ? 'Escócia' :
                  item.team.name === 'Haiti' ? 'Haiti' : item.team.name,
            j: item.playedGames,
            v: item.won,
            e: item.draw,
            d: item.lost,
            gp: item.goalsFor,
            gc: item.goalsAgainst,
            p: item.points,
          }));
          break;
        }
      }
      
      COPA.grupo = timesGrupo;
      console.log('Times do grupo do Brasil:', COPA.grupo.length);
      COPA.grupo.forEach(t => console.log(`  ${t.nome}: ${t.p} pontos`));
    }
    
    // Busca jogos do Brasil via proxy
    const matchesRes = await fetch('/api/copa-matches');
    
    if (!matchesRes.ok) {
      console.error('Erro no proxy /api/copa-matches:', matchesRes.status);
      carregarDadosEstaticos();
      copaMudarAba(copaTabAtual);
      return;
    }
    
    const matchesData = await matchesRes.json();
    console.log('Jogos recebidos via proxy');
    
    if (matchesData.matches && matchesData.matches.length > 0) {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      COPA.jogos = matchesData.matches
        .filter(m => m.stage === 'GROUP_STAGE')
        .map(m => {
          const dt = new Date(m.utcDate);
          const dtBR = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
          const braCasa = m.homeTeam.id === 764; // ID do Brasil
          const adversario = braCasa ? m.awayTeam : m.homeTeam;
          
          let advNome = adversario.name;
          if (advNome === 'Morocco') advNome = 'Marrocos';
          if (advNome === 'Scotland') advNome = 'Escócia';
          if (advNome === 'Haiti') advNome = 'Haiti';
          
          // Determina o placar
          let golBra = null;
          let golAdv = null;
          
          if (m.score && m.score.fullTime) {
            if (braCasa) {
              golBra = m.score.fullTime.home;
              golAdv = m.score.fullTime.away;
            } else {
              golBra = m.score.fullTime.away;
              golAdv = m.score.fullTime.home;
            }
          }
          
          return {
            data: `${dtBR.getDate()} ${meses[dtBR.getMonth()]}`,
            hora: `${String(dtBR.getHours()).padStart(2, '0')}:${String(dtBR.getMinutes()).padStart(2, '0')}`,
            dataHora: dtBR,
            casa: braCasa ? 'Brasil' : advNome,
            fora: braCasa ? advNome : 'Brasil',
            local: m.venue || 'Estádio do Maracanã',
            status: m.status,
            golBra: golBra,
            golAdv: golAdv,
          };
        });
      
      // Ordena jogos por data
      COPA.jogos.sort((a, b) => a.dataHora - b.dataHora);
      console.log(`Jogos do Brasil carregados: ${COPA.jogos.length}`);
      COPA.jogos.forEach(j => {
        console.log(`  ${j.data} ${j.hora}: ${j.casa} vs ${j.fora} (${j.status})`);
      });
    } else {
      console.log('Nenhum jogo encontrado para o Brasil');
      carregarDadosEstaticos();
    }
    
  } catch (error) {
    console.error('Erro ao carregar dados da Copa:', error);
    carregarDadosEstaticos();
  }
  
  // Atualiza a interface
  copaMudarAba(copaTabAtual);
}

// Função de fallback com dados estáticos
function carregarDadosEstaticos() {
  console.log('Usando dados estáticos (fallback)');
  
  // Dados estáticos dos jogos do Brasil na Copa 2026
  COPA.jogos = [
    {
      data: '14 Jun',
      hora: '16:00',
      dataHora: new Date(2026, 5, 14, 16, 0),
      casa: 'Brasil',
      fora: 'Marrocos',
      local: 'Estádio do Maracanã - Rio de Janeiro/RJ',
      status: 'SCHEDULED',
      golBra: null,
      golAdv: null
    },
    {
      data: '18 Jun',
      hora: '16:00',
      dataHora: new Date(2026, 5, 18, 16, 0),
      casa: 'Brasil',
      fora: 'Escócia',
      local: 'Estádio do Maracanã - Rio de Janeiro/RJ',
      status: 'SCHEDULED',
      golBra: null,
      golAdv: null
    },
    {
      data: '22 Jun',
      hora: '16:00',
      dataHora: new Date(2026, 5, 22, 16, 0),
      casa: 'Brasil',
      fora: 'Haiti',
      local: 'Estádio do Maracanã - Rio de Janeiro/RJ',
      status: 'SCHEDULED',
      golBra: null,
      golAdv: null
    }
  ];
  
  COPA.grupo = [
    { id: 764, nome: 'Brasil', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, p: 0 },
    { id: 815, nome: 'Marrocos', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, p: 0 },
    { id: 8873, nome: 'Escócia', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, p: 0 },
    { id: 836, nome: 'Haiti', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, p: 0 }
  ];
}

/* ── Mudar Aba ─────────────────── */
function copaMudarAba(tab) {
  copaTabAtual = tab;
  
  document.querySelectorAll('.copa-tab').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.tab === tab);
  });
  
  document.querySelectorAll('.copa-panel').forEach(panel => {
    panel.classList.toggle('ativo', panel.id === `tab-${tab}`);
  });
  
  // Renderiza o conteúdo da aba
  if (tab === 'jogo') copaRenderJogo();
  if (tab === 'grupo') copaRenderGrupo();
  if (tab === 'jogos') copaRenderJogos();
  if (tab === 'fotos') copaRenderFotos();
}

/* ── Iniciar Rotação Automática ─────────────────── */
function copaIniciarRotacao() {
  if (copaAutoTimer) clearInterval(copaAutoTimer);
  copaAutoTimer = setInterval(() => {
    const curIndex = COPA_TABS.indexOf(copaTabAtual);
    const nextIndex = (curIndex + 1) % COPA_TABS.length;
    copaMudarAba(COPA_TABS[nextIndex]);
  }, 10000);
}

/* ── Inicializar Copa ─────────────────── */
function copaIniciar() {
  // Configurar eventos das abas
  document.querySelectorAll('.copa-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (copaAutoTimer) clearInterval(copaAutoTimer);
      copaMudarAba(btn.dataset.tab);
      setTimeout(copaIniciarRotacao, 20000);
    });
  });
  
  // Carregar dados
  copaCarregarDados();
  
  // Atualizar a cada 60 segundos
  setInterval(copaCarregarDados, 60000);
  
  // Iniciar rotação
  copaIniciarRotacao();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', copaIniciar);
} else {
  copaIniciar();
}

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

    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('oculto');

    if (timer) clearInterval(timer);
    timer = setInterval(trocarSlide, INTERVALO_MS);

  } catch (e) {
    console.error('Erro ao carregar dados:', e);
    const loader = document.getElementById('loader-overlay');
    if (loader) {
      loader.innerHTML = `
        <div style="text-align:center">
          <div style="font-size:48px;margin-bottom:16px">⚠️</div>
          <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;
            color:rgba(255,255,255,0.35)">Sem conexão com a planilha</div>
        </div>`;
    }
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
