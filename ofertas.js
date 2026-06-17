/* ══════════════════════════════════════════════════════
   LM SABOR CASEIRO — ofertas.js (VERSÃO CORRIGIDA)
══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const API_URL = 'https://script.google.com/macros/s/AKfycby9IwMwWkVEy3zWyjoyZ8jk5Guat3-Q4aU8aG19h_Eb-FwVYOvIAcESyasFiEXLa8DM/exec';
  const INTERVALO_MS = 13000;
  const DESTAQUE_INTERVALO_MS = 8000;

  // Mapa de imagens
  const IMAGENS = {
    'Baião Cremoso': 'assets/baiao-cremoso.webp',
    'Baião Tradicional': 'assets/baiao-tradicional.webp',
    'Arroz de Camarão': 'assets/arroz-camarao.webp',
    'Arroz Branco': 'assets/arroz-branco.webp',
    'Camarão ao Alho': 'assets/camarao.webp',
    'Vatapá de Camarão': 'assets/vatapa-camarao.webp',
    'Caranguejo': 'assets/caranguejo.webp',
    'Sopa Caseira': 'assets/sopa.webp',
    'Espetinhos': 'assets/espetinhos.webp',
    'Mousse': 'assets/mousses.webp',
    'Mousses': 'assets/mousses.webp',
    'Cone Trufado': 'assets/cones-trufados.webp',
    'Cones Trufados': 'assets/cones-trufados.webp',
    'Trufa': 'assets/trufas.webp',
    'Trufas': 'assets/trufas.webp',
    'Delícia de Abacaxi': 'assets/delicia-abacaxi.webp',
    'Dindin': 'assets/dindin-gourmet.webp',
    'Dindins Gourmet': 'assets/dindin-gourmet.webp',
    'Suco Natural': 'assets/sucos.webp',
  };

  function getImagem(nome) {
    if (!nome) return null;
    if (IMAGENS[nome]) return IMAGENS[nome];
    const nomeLow = nome.toLowerCase();
    for (const [k, v] of Object.entries(IMAGENS)) {
      if (nomeLow.includes(k.toLowerCase()) || k.toLowerCase().includes(nomeLow)) {
        return v;
      }
    }
    return null;
  }

  // Estados
  let slides = [];
  let idx = 0;
  let timer = null;
  let destaqueTimer = null;
  let destaqueMode = 'pratos';
  let ultimosDados = null;
  let espetinhoPage = 0;
  const ESPETINHOS_POR_PAGINA = 8;

  // DADOS ESTÁTICOS PARA TESTE
  const DADOS_ESTATICOS = {
    cardapio: [
      { nome: 'Baião Cremoso', categoria: 'Prato', disponivel: true },
      { nome: 'Arroz de Camarão', categoria: 'Prato', disponivel: true },
      { nome: 'Caranguejo', categoria: 'Prato', disponivel: true },
      { nome: 'Espetinhos', categoria: 'Espetinho', disponivel: true },
      { nome: 'Sopa Caseira', categoria: 'Prato', disponivel: true },
    ],
    sobremesas: [
      { nome: 'Mousse de Maracujá', categoria: 'Mousse', quantidade: 10, valor: 8.50 },
      { nome: 'Mousse de Chocolate', categoria: 'Mousse', quantidade: 8, valor: 8.50 },
      { nome: 'Cone Trufado', categoria: 'Cones Trufados', quantidade: 6, valor: 7.00 },
      { nome: 'Delícia de Abacaxi', categoria: 'Delícia de Abacaxi', quantidade: 5, valor: 9.00 },
    ],
    sucos: [
      { nome: 'Laranja', categoria: 'Sucos', quantidade: 20, valor: 5.00 },
      { nome: 'Limão', categoria: 'Sucos', quantidade: 15, valor: 5.00 },
      { nome: 'Abacaxi', categoria: 'Sucos', quantidade: 12, valor: 6.00 },
    ],
    dindins: [
      { nome: 'Chocolate', quantidade: 20, valor: 6.00 },
      { nome: 'Morango', quantidade: 15, valor: 6.00 },
      { nome: 'Coco', quantidade: 10, valor: 6.00 },
    ]
  };

  /* ══════════════════════════════════════════════════════
     COPA DO MUNDO 2026 — DADOS ESTÁTICOS
  ══════════════════════════════════════════════════════ */
  const COPA_DADOS = {
    grupo: [
      { id: 764, nome: 'Brasil', j: 3, v: 2, e: 1, d: 0, gp: 7, gc: 2, p: 7 },
      { id: 815, nome: 'Marrocos', j: 3, v: 1, e: 1, d: 1, gp: 3, gc: 4, p: 4 },
      { id: 8873, nome: 'Escócia', j: 3, v: 1, e: 0, d: 2, gp: 2, gc: 5, p: 3 },
      { id: 836, nome: 'Haiti', j: 3, v: 0, e: 2, d: 1, gp: 2, gc: 3, p: 2 }
    ],
    jogos: [
      { data: '14 Jun', hora: '16:00', dataHora: new Date(2026, 5, 14, 16, 0), casa: 'Brasil', fora: 'Marrocos', local: 'Estádio do Maracanã', status: 'FINISHED', golBra: 3, golAdv: 1 },
      { data: '18 Jun', hora: '16:00', dataHora: new Date(2026, 5, 18, 16, 0), casa: 'Brasil', fora: 'Escócia', local: 'Estádio do Maracanã', status: 'FINISHED', golBra: 2, golAdv: 0 },
      { data: '22 Jun', hora: '16:00', dataHora: new Date(2026, 5, 22, 16, 0), casa: 'Brasil', fora: 'Haiti', local: 'Estádio do Maracanã', status: 'SCHEDULED', golBra: null, golAdv: null }
    ],
    convocados: [
      { nome: 'Alisson', num: 1, pos: 'GOL' },
      { nome: 'Ederson', num: 12, pos: 'GOL' },
      { nome: 'Marquinhos', num: 4, pos: 'ZAG' },
      { nome: 'Bremer', num: 3, pos: 'ZAG' },
      { nome: 'Casemiro', num: 5, pos: 'VOL' },
      { nome: 'Bruno G.', num: 8, pos: 'VOL' },
      { nome: 'Paquetá', num: 10, pos: 'MEI' },
      { nome: 'Neymar', num: 10, pos: 'MEI' },
      { nome: 'Vini Jr.', num: 7, pos: 'ATA' },
      { nome: 'Raphinha', num: 11, pos: 'ATA' },
      { nome: 'Rodrygo', num: 11, pos: 'ATA' },
      { nome: 'Endrick', num: 9, pos: 'ATA' },
    ],
  };

  let copaTabAtual = 'jogo';
  let copaAutoTimer = null;
  const COPA_TABS = ['jogo', 'grupo', 'jogos', 'fotos'];

  /* ── CONSTRUIR SLIDES ──────────────────────────────── */
  function construirSlides(dados) {
    const pratosDisp = (dados.cardapio || [])
      .filter(p => p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato');
    
    const sobremesas = (dados.sobremesas || []).filter(s => s.nome && s.quantidade > 0);
    const sucos = (dados.sucos || []).filter(s => s.nome && s.quantidade > 0);
    const dindins = (dados.dindins || []).filter(d => d.nome && d.quantidade > 0);

    const slidesPratos = pratosDisp.map(p => ({
      tipo: 'prato',
      nome: p.nome,
      categoria: p.categoria || 'Prato do Dia',
      descricao: 'Feito com ingredientes frescos · Sabor caseiro de verdade.',
      saboresPrincipais: null,
      saboresTodos: null,
      preco: null,
      tags: [{ texto: '✓ Disponível', destaque: true }, { texto: 'Feito na Hora' }],
      imagem: getImagem(p.nome),
    }));

    const catsSob = {};
    sobremesas.forEach(s => {
      const cat = s.categoria || 'Sobremesa';
      if (!catsSob[cat]) catsSob[cat] = [];
      catsSob[cat].push(s);
    });

    const slidesSob = Object.entries(catsSob).map(([cat, itens]) => ({
      tipo: 'sobremesa',
      nome: cat,
      categoria: 'Doces & Sobremesas',
      descricao: null,
      saboresPrincipais: itens.slice(0, 5).map(s => s.nome),
      saboresTodos: itens.map(s => s.nome),
      preco: itens[0] && itens[0].valor ? Number(itens[0].valor) : null,
      tags: [{ texto: '🍮 Artesanal', destaque: true }, { texto: itens.length + ' Sabores' }],
      imagem: getImagem(cat),
    }));

    const catsSuco = {};
    sucos.forEach(s => {
      const cat = s.categoria || 'Sucos';
      if (!catsSuco[cat]) catsSuco[cat] = [];
      catsSuco[cat].push(s);
    });

    const slidesSuco = Object.entries(catsSuco).map(([cat, itens]) => ({
      tipo: 'suco',
      nome: cat,
      categoria: 'Sucos Naturais',
      descricao: null,
      saboresPrincipais: itens.slice(0, 5).map(s => s.nome),
      saboresTodos: itens.map(s => s.nome),
      preco: itens[0] && itens[0].valor ? Number(itens[0].valor) : null,
      tags: [{ texto: '🥤 Natural', destaque: true }, { texto: itens.length + ' Sabores' }],
      imagem: getImagem('Suco Natural'),
    }));

    const valorDindin = dindins.length > 0 && dindins[0].valor ? Number(dindins[0].valor) : 6;

    const slideDindins = dindins.length ? [{
      tipo: 'dindin',
      nome: 'Dindins Gourmet',
      categoria: 'Gelados Artesanais',
      descricao: null,
      saboresPrincipais: dindins.slice(0, 5).map(d => d.nome),
      saboresTodos: dindins.map(d => d.nome),
      preco: valorDindin,
      tags: [{ texto: '🧊 Gelados', destaque: true }, { texto: dindins.length + ' Sabores' }, { texto: 'R$ ' + valorDindin.toFixed(2).replace('.', ',') + ' un.' }],
      imagem: getImagem('Dindin'),
    }] : [];

    const naoProtos = slidesSob.concat(slidesSuco).concat(slideDindins);
    const resultado = [];
    const maxLen = Math.max(slidesPratos.length, naoProtos.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < slidesPratos.length) resultado.push(slidesPratos[i]);
      if (i < naoProtos.length) resultado.push(naoProtos[i]);
    }

    if (!resultado.length) {
      resultado.push({
        tipo: 'prato',
        nome: 'LM Sabor Caseiro',
        categoria: 'Cardápio',
        descricao: 'Cardápio sendo preparado. Volte em breve!',
        saboresPrincipais: null,
        saboresTodos: null,
        preco: null,
        tags: [{ texto: 'Comida Caseira', destaque: true }],
        imagem: null,
      });
    }

    return resultado;
  }

  /* ── RENDERIZAR SLIDES ──────────────────────────────── */
  function renderizarSlidesDom() {
    var container = document.getElementById('slide-container');
    if (!container) return;
    
    container.querySelectorAll('.slide-img, .slide-badges').forEach(function(el) { el.remove(); });

    slides.forEach(function(s, i) {
      var img = document.createElement('img');
      img.className = 'slide-img' + (i === 0 ? ' ativo' : '');
      img.src = s.imagem || '';
      img.alt = s.nome || 'Prato';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      
      img.onerror = function() {
        this.style.display = 'none';
      };
      
      container.insertBefore(img, document.getElementById('slide-num'));

      if (s.saboresTodos && s.saboresTodos.length && s.tipo !== 'prato') {
        var bdiv = document.createElement('div');
        bdiv.className = 'slide-badges' + (i === 0 ? ' ativo' : '');
        bdiv.innerHTML = s.saboresTodos.map(function(sb) { return '<span class="badge">' + sb + '</span>'; }).join('');
        container.insertBefore(bdiv, document.getElementById('slide-num'));
      }
    });

    var dotsContainer = document.getElementById('progress-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map(function(_, i) {
        return '<div class="dot' + (i === 0 ? ' ativo' : '') + '"></div>';
      }).join('');
    }
  }

  /* ── CONTROLE DE SLIDES ────────────────────────────── */
  function offsetDomIdx(targetIdx) {
    var o = 0;
    for (var i = 0; i < targetIdx; i++) {
      o++;
      if (slides[i].saboresTodos && slides[i].saboresTodos.length && slides[i].tipo !== 'prato') o++;
    }
    return o;
  }

  function setAtivo(on) {
    var container = document.getElementById('slide-container');
    if (!container) return;
    
    var allEls = container.querySelectorAll('.slide-img, .slide-badges');
    var dots = document.getElementById('progress-dots');
    if (!dots) return;
    
    var dotEls = dots.querySelectorAll('.dot');
    var domStart = offsetDomIdx(idx);
    var hasBadges = (slides[idx] && slides[idx].saboresTodos && slides[idx].saboresTodos.length && slides[idx].tipo !== 'prato');
    var domCount = hasBadges ? 2 : 1;

    for (var j = domStart; j < domStart + domCount; j++) {
      if (allEls[j]) allEls[j].classList.toggle('ativo', on);
    }
    if (dotEls[idx]) dotEls[idx].classList.toggle('ativo', on);
    
    ['nome', 'dish-desc', 'dish-categoria', 'separador', 'dish-tags'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('ativo', on);
    });
  }

  function preencherTexto() {
    if (!slides.length || idx >= slides.length) return;
    
    var s = slides[idx];
    var nome = document.getElementById('nome');
    var desc = document.getElementById('dish-desc');
    var cat = document.getElementById('cat-texto');
    var tags = document.getElementById('dish-tags');
    var prox = document.getElementById('prox-nome');
    var num = document.getElementById('slide-num');

    if (cat) cat.textContent = s.categoria || '';
    if (nome) nome.textContent = s.nome || '—';

    if (desc) {
      if (s.saboresPrincipais && s.saboresPrincipais.length && s.tipo !== 'prato') {
        var precoHTML = s.preco ? '<div class="preco-grande">R$ ' + Number(s.preco).toFixed(2).replace('.', ',') + '<span>/ un.</span></div>' : '';
        desc.innerHTML = '<div class="sabores-principais">' + s.saboresPrincipais.map(function(sb, i) {
          return '<span class="chip-principal cor-' + (i % 5) + '">' + sb + '</span>';
        }).join('') + '</div>' + precoHTML;
      } else {
        desc.textContent = s.descricao || '';
      }
    }

    if (tags) {
      tags.innerHTML = (s.tags || []).map(function(t) {
        return '<span class="tag' + (t.destaque ? ' tag-destaque' : '') + '">' + t.texto + '</span>';
      }).join('');
    }

    if (prox && slides.length > 0) {
      prox.textContent = slides[(idx + 1) % slides.length].nome;
    }
    if (num) {
      num.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    }
  }

  function trocarSlide() {
    if (!slides.length) return;
    
    setAtivo(false);
    idx = (idx + 1) % slides.length;
    preencherTexto();
    setTimeout(function() { setAtivo(true); }, 80);
    resetTimer();
  }

  function resetTimer() {
    var fill = document.getElementById('timer-fill');
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(1)';
    fill.offsetHeight;
    fill.style.transition = 'transform ' + (INTERVALO_MS / 1000) + 's linear';
    fill.style.transform = 'scaleX(0)';
  }

  /* ── PAINEL DIREITO — DESTAQUES ────────────────────── */
  function getSaboresEspetinhos(dados) {
    var espetinhos = (dados.cardapio || []).filter(function(item) {
      return item.disponivel && item.categoria && item.categoria.toLowerCase() === 'espetinho';
    });
    return espetinhos.length > 0 ? espetinhos.map(function(e) { return e.nome; }) : null;
  }

  function renderizarPratos(dados) {
    var ordemPersonalizada = ['Baião Cremoso', 'Arroz de Camarão', 'Caranguejo'];
    var pratos = (dados.cardapio || [])
      .filter(function(p) { return p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato'; })
      .sort(function(a, b) {
        var idxA = ordemPersonalizada.indexOf(a.nome);
        var idxB = ordemPersonalizada.indexOf(b.nome);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
      .slice(0, 8);
    
    var lista = document.getElementById('dest-lista');
    if (!lista) return false;
    if (!pratos.length) return false;
    
    lista.innerHTML = pratos.map(function(p) {
      return '<div class="dest-item"><div class="dest-dot"></div><div class="dest-nome">' + p.nome + '</div><div class="dest-cat">' + (p.categoria || '') + '</div></div>';
    }).join('');
    return true;
  }

  function renderizarEspetinhos(dados) {
    var sabores = getSaboresEspetinhos(dados);
    var lista = document.getElementById('dest-lista');
    if (!lista) return false;
    if (!sabores || sabores.length === 0) return false;
    
    var totalPages = Math.ceil(sabores.length / ESPETINHOS_POR_PAGINA);
    if (espetinhoPage >= totalPages) espetinhoPage = 0;
    
    var start = espetinhoPage * ESPETINHOS_POR_PAGINA;
    var saboresExibir = sabores.slice(start, start + ESPETINHOS_POR_PAGINA);
    
    lista.innerHTML = saboresExibir.map(function(sabor) {
      return '<div class="dest-item"><div class="dest-dot" style="background: #F59B3C;"></div><div class="dest-nome">' + sabor + '</div><div class="dest-cat">Espetinho</div></div>';
    }).join('');
    
    if (totalPages > 1) {
      var pageIndicator = document.createElement('div');
      pageIndicator.className = 'dest-item';
      pageIndicator.style.cssText = 'justify-content: center; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06);';
      var dotsHTML = '';
      for (var i = 0; i < totalPages; i++) {
        dotsHTML += '<div style="width: 6px; height: 6px; border-radius: 50%; background: ' + (i === espetinhoPage ? '#F59B3C' : 'rgba(255,255,255,0.2)') + ';"></div>';
      }
      pageIndicator.innerHTML = '<div style="display: flex; gap: 6px; align-items: center; justify-content: center; width: 100%;">' + dotsHTML + '<span style="font-size: 9px; color: rgba(255,255,255,0.25); margin-left: 8px;">' + (espetinhoPage + 1) + '/' + totalPages + '</span></div>';
      lista.appendChild(pageIndicator);
    }
    
    espetinhoPage = (espetinhoPage + 1) % totalPages;
    return true;
  }

  function alternarDestaques() {
    if (!ultimosDados) return;
    
    if (destaqueMode === 'pratos') {
      var temEspetinhos = renderizarEspetinhos(ultimosDados);
      if (temEspetinhos) destaqueMode = 'espetinhos';
    } else {
      var temPratos = renderizarPratos(ultimosDados);
      if (temPratos) {
        destaqueMode = 'pratos';
      } else {
        renderizarEspetinhos(ultimosDados);
        destaqueMode = 'espetinhos';
      }
    }
  }

  function renderizarDestaques(dados) {
    ultimosDados = dados;
    espetinhoPage = 0;
    
    if (destaqueTimer) {
      clearInterval(destaqueTimer);
      destaqueTimer = null;
    }
    
    var temPratos = renderizarPratos(dados);
    if (!temPratos) {
      var temEspetinhos = renderizarEspetinhos(dados);
      if (!temEspetinhos) {
        var lista = document.getElementById('dest-lista');
        if (lista) {
          lista.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,0.22);padding:6px 0">Cardápio sendo atualizado...</div>';
        }
        return;
      }
      destaqueMode = 'espetinhos';
    } else {
      destaqueMode = 'pratos';
    }
    
    destaqueTimer = setInterval(alternarDestaques, DESTAQUE_INTERVALO_MS);
  }

  /* ── RELÓGIO ─────────────────────────────────────────── */
  function atualizarHora() {
    var agora = new Date();
    var hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
    
    var clockEl = document.getElementById('clock');
    var dateEl = document.getElementById('date');
    if (clockEl) clockEl.innerText = hora;
    if (dateEl) dateEl.innerText = data.toUpperCase().replace(/\./g, '');
  }

  setInterval(atualizarHora, 1000);
  atualizarHora();

  /* ── COPA DO MUNDO 2026 ────────────────────────────── */
  function getProximoJogo() {
    if (!COPA_DADOS.jogos || COPA_DADOS.jogos.length === 0) return null;
    
    var agora = new Date();
    var jogosFuturos = COPA_DADOS.jogos.filter(function(jogo) {
      if (jogo.status === 'TIMED') return true;
      if (jogo.status === 'SCHEDULED') return true;
      if (jogo.status === 'IN_PLAY') return true;
      if (jogo.status === 'PAUSED') return true;
      if (jogo.dataHora && jogo.dataHora > agora) return true;
      return false;
    });
    
    if (jogosFuturos.length === 0) return null;
    jogosFuturos.sort(function(a, b) { return a.dataHora - b.dataHora; });
    return jogosFuturos[0];
  }

  function formatarDataJogo(dataObj) {
    if (!dataObj || isNaN(dataObj.getTime())) return '';
    var diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var diaSemana = diasSemana[dataObj.getDay()];
    var dia = dataObj.getDate();
    var mes = meses[dataObj.getMonth()];
    var hora = String(dataObj.getHours()).padStart(2, '0');
    var minuto = String(dataObj.getMinutes()).padStart(2, '0');
    return diaSemana + ', ' + dia + ' de ' + mes + ' às ' + hora + ':' + minuto;
  }

  function getBandeira(pais) {
    var bandeiras = {
      'Brasil': '🇧🇷',
      'Marrocos': '🇲🇦',
      'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Haiti': '🇭🇹'
    };
    return bandeiras[pais] || '🏳️';
  }

  function copaRenderJogo() {
    var proximoJogo = getProximoJogo();
    var placarStatus = document.getElementById('placar-status');
    var placarLocal = document.getElementById('placar-local');
    var placarData = document.getElementById('placar-data');
    var golBraEl = document.getElementById('gol-bra');
    var golMarEl = document.getElementById('gol-mar');
    var jogoLiveBadge = document.getElementById('jogo-live-badge');
    var advNomeEl = document.querySelector('.placar-time:last-child .placar-nome');
    var advBandeiraEl = document.querySelector('.placar-time:last-child .placar-bandeira');
    
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
    
    var advNome = proximoJogo.casa === 'Brasil' ? proximoJogo.fora : proximoJogo.casa;
    if (advNomeEl) advNomeEl.textContent = advNome;
    if (advBandeiraEl) advBandeiraEl.textContent = getBandeira(advNome);
    
    var golBra = (proximoJogo.golBra !== null && proximoJogo.golBra !== undefined) ? proximoJogo.golBra : '—';
    var golAdv = (proximoJogo.golAdv !== null && proximoJogo.golAdv !== undefined) ? proximoJogo.golAdv : '—';
    if (golBraEl) golBraEl.textContent = golBra;
    if (golMarEl) golMarEl.textContent = golAdv;
    
    var statusTexto = '';
    var showBadge = false;
    if (proximoJogo.status === 'IN_PLAY') { statusTexto = 'AO VIVO'; showBadge = true; }
    else if (proximoJogo.status === 'PAUSED') { statusTexto = 'INTERVALO'; showBadge = true; }
    else if (proximoJogo.status === 'FINISHED') { statusTexto = 'FIM DE JOGO'; showBadge = false; }
    else { statusTexto = 'PRÓXIMO JOGO'; showBadge = false; }
    
    if (placarStatus) placarStatus.textContent = statusTexto;
    if (jogoLiveBadge) jogoLiveBadge.style.display = showBadge ? 'inline-flex' : 'none';
    if (placarLocal) placarLocal.textContent = proximoJogo.local || 'Estádio do Maracanã';
    if (placarData && proximoJogo.dataHora) {
      placarData.textContent = formatarDataJogo(proximoJogo.dataHora);
    }
  }

  function copaRenderGrupo() {
    var tbody = document.getElementById('grupo-tbody');
    if (!tbody) return;
    
    if (!COPA_DADOS.grupo.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">Carregando classificação...</td></tr>';
      return;
    }
    
    var sorted = COPA_DADOS.grupo.slice().sort(function(a, b) {
      return (b.p - a.p) || ((b.gp - b.gc) - (a.gp - a.gc));
    });
    
    tbody.innerHTML = sorted.map(function(s, i) {
      return '<tr class="' + (s.nome === 'Brasil' ? 'brasil-row' : '') + '"><td>' + (i + 1) + '</td><td>' + s.nome + '</td><td>' + s.j + '</td><td>' + s.v + '</td><td>' + s.e + '</td><td>' + s.d + '</td><td>' + (s.gp - s.gc) + '</td><td><strong>' + s.p + '</strong></td></tr>';
    }).join('');
  }

  function copaRenderJogos() {
    var container = document.getElementById('jogos-lista');
    if (!container) return;
    
    if (!COPA_DADOS.jogos.length) {
      container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px">Carregando jogos...</div>';
      return;
    }
    
    container.innerHTML = COPA_DADOS.jogos.map(function(jogo) {
      var isFinished = jogo.status === 'FINISHED';
      var isLive = jogo.status === 'IN_PLAY' || jogo.status === 'PAUSED';
      var statusText = isLive ? '🔴 AO VIVO' : (isFinished ? '✓ FINALIZADO' : '📅 AGENDADO');
      var statusColor = isLive ? '#f59b3c' : (isFinished ? '#4ade80' : 'rgba(255,255,255,0.5)');
      var dataFormatada = jogo.dataHora ? jogo.dataHora.toLocaleDateString('pt-BR', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : jogo.data;
      
      return '<div class="jogo-item" style="background:rgba(255,255,255,0.03);border-radius:0.5rem;padding:0.5rem;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;"><div style="font-size:0.55rem;color:rgba(255,255,255,0.5);min-width:100px;">' + dataFormatada + '</div><div style="flex:1;text-align:center;font-weight:600;font-size:0.55rem;">' + jogo.casa + ' vs ' + jogo.fora + '</div><div style="min-width:70px;text-align:right;"><div style="font-weight:700;font-size:0.55rem;">' + ((jogo.golBra !== null && jogo.golBra !== undefined) ? jogo.golBra + '-' + jogo.golAdv : '—') + '</div><div style="font-size:0.4rem;color:' + statusColor + ';">' + statusText + '</div></div></div>';
    }).join('');
  }

  function copaRenderFotos() {
    var grid = document.getElementById('fotos-grid');
    var cap = document.getElementById('fotos-caption');
    if (!grid) return;

    var COR_POS = {
      GOL: '#f59b3c', ZAG: '#60a5fa', LAT: '#60a5fa',
      VOL: '#4ade80', MEI: '#4ade80', ATA: '#f472b6',
    };

    grid.innerHTML = COPA_DADOS.convocados.map(function(j) {
      return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:0.4rem;padding:0.3rem 0.4rem;display:flex;align-items:center;gap:0.3rem;"><span style="font-size:0.55rem;font-weight:900;color:#FFD700;min-width:1rem;text-align:center;">' + j.num + '</span><div><div style="font-size:0.5rem;font-weight:700;color:rgba(255,255,255,0.85);line-height:1.2">' + j.nome + '</div><div style="font-size:0.38rem;font-weight:700;color:' + (COR_POS[j.pos] || '#fff') + ';letter-spacing:1px">' + j.pos + '</div></div></div>';
    }).join('');

    if (cap) cap.textContent = 'Convocados — Copa do Mundo 2026';
  }

  function copaMudarAba(tab) {
    copaTabAtual = tab;
    
    document.querySelectorAll('.copa-tab').forEach(function(btn) {
      btn.classList.toggle('ativo', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.copa-panel').forEach(function(panel) {
      panel.classList.toggle('ativo', panel.id === 'tab-' + tab);
    });
    
    if (tab === 'jogo') copaRenderJogo();
    if (tab === 'grupo') copaRenderGrupo();
    if (tab === 'jogos') copaRenderJogos();
    if (tab === 'fotos') copaRenderFotos();
  }

  function copaIniciarRotacao() {
    if (copaAutoTimer) clearInterval(copaAutoTimer);
    copaAutoTimer = setInterval(function() {
      var curIndex = COPA_TABS.indexOf(copaTabAtual);
      var nextIndex = (curIndex + 1) % COPA_TABS.length;
      copaMudarAba(COPA_TABS[nextIndex]);
    }, 10000);
  }

  function copaIniciar() {
    document.querySelectorAll('.copa-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (copaAutoTimer) clearInterval(copaAutoTimer);
        copaMudarAba(btn.dataset.tab);
        setTimeout(copaIniciarRotacao, 20000);
      });
    });
    
    copaMudarAba('jogo');
    copaIniciarRotacao();
  }

  /* ── CARREGAR DADOS PRINCIPAIS ────────────────────── */
  function carregarDados() {
    try {
      // Tenta carregar da API
      fetch(API_URL + '?action=getDados')
        .then(function(res) {
          if (res.ok) return res.json();
          throw new Error('API não respondeu');
        })
        .then(function(data) {
          slides = construirSlides(data);
          idx = 0;
          renderizarSlidesDom();
          preencherTexto();
          setTimeout(function() { setAtivo(true); }, 80);
          renderizarDestaques(data);
          resetTimer();

          var loader = document.getElementById('loader-overlay');
          if (loader) loader.classList.add('oculto');

          if (timer) clearInterval(timer);
          timer = setInterval(trocarSlide, INTERVALO_MS);
        })
        .catch(function(e) {
          console.log('Usando dados estáticos (fallback)');
          usarDadosEstaticos();
        });
    } catch (e) {
      console.log('Erro ao carregar dados, usando fallback');
      usarDadosEstaticos();
    }
  }

  function usarDadosEstaticos() {
    slides = construirSlides(DADOS_ESTATICOS);
    idx = 0;
    renderizarSlidesDom();
    preencherTexto();
    setTimeout(function() { setAtivo(true); }, 80);
    renderizarDestaques(DADOS_ESTATICOS);
    resetTimer();

    var loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('oculto');

    if (timer) clearInterval(timer);
    timer = setInterval(trocarSlide, INTERVALO_MS);
  }

  /* ── INIT ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    copaIniciar();
    carregarDados();
  });

})();
