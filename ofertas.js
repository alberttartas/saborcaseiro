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
   CLIMA — Open-Meteo (Fortaleza)
══════════════════════════════════════════════════════ */
const WMO_ICONE = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const WMO_DESC = {
  0: 'Céu limpo', 1: 'Levemente nublado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina c/ geada',
  51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa forte',
  61: 'Chuva leve', 63: 'Chuva moderada', 65: 'Chuva forte',
  80: 'Pancadas leves', 81: 'Pancadas moder.', 82: 'Pancadas fortes',
  95: 'Tempestade', 96: 'Tempestade c/ granizo', 99: 'Tempestade forte'
};

async function buscarClima() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=-3.7172&longitude=-38.5433' +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
      '&timezone=America%2FFortaleza&wind_speed_unit=kmh'
    );
    const data = await res.json();
    const c = data.current;
    const code = c.weather_code;

    document.getElementById('weather-temp').innerHTML = Math.round(c.temperature_2m) + '<sup>°C</sup>';
    document.getElementById('weather-icone').textContent = WMO_ICONE[code] || '🌡️';
    document.getElementById('weather-cond').textContent = WMO_DESC[code] || 'Tempo variável';
    document.getElementById('w-hum').textContent = c.relative_humidity_2m + '%';
    document.getElementById('w-feel').textContent = Math.round(c.apparent_temperature) + '°';
    document.getElementById('w-wind').textContent = Math.round(c.wind_speed_10m) + ' km/h';
    document.getElementById('weather-atualizando').textContent = 'ao vivo';
  } catch (_) {
    document.getElementById('weather-cond').textContent = 'Indisponível';
    document.getElementById('weather-atualizando').textContent = 'sem conexão';
  }
}

buscarClima();
setInterval(buscarClima, 10 * 60 * 1000);

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
