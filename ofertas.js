/* ══════════════════════════════════════════════════════
   LM SABOR CASEIRO — ofertas.js (BACKEND)
   Dados via API do backend | Slide tamanho fixo
══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================
  var API_URL = 'https://script.google.com/macros/s/AKfycby9IwMwWkVEy3zWyjoyZ8jk5Guat3-Q4aU8aG19h_Eb-FwVYOvIAcESyasFiEXLa8DM/exec';
  var INTERVALO_MS = 13000;
  var DESTAQUE_INTERVALO_MS = 8000;
  var ESPETINHOS_POR_PAGINA = 8;

  // ============================================================
// MAPA DE IMAGENS - CORRIGIDO
// ============================================================
var IMAGENS = {
  // PRATOS
  'Baião Cremoso': 'assets/baiao-cremoso.webp',
  'Baião Tradicional': 'assets/baiao-tradicional.webp',
  'Arroz de Camarão': 'assets/arroz-camarao.webp',
  'Arroz Branco': 'assets/arroz-branco.webp',
  'Camarão ao Alho': 'assets/camarao.webp',
  'Camarão Alho e Oleo': 'assets/camarao.webp',     // ← USANDO camarao.webp
  'Vatapá de Camarão': 'assets/vatapa-camarao.webp',
  'Caranguejo': 'assets/caranguejo.webp',
  'Sopa Caseira': 'assets/sopa.webp',
  'Sopa de Carne': 'assets/sopa-de-carne.webp',
  'Canja': 'assets/canja.webp',
  'Batata Frita': 'assets/batata.webp',
  'Macaxeira Frita': 'assets/macaxeira.webp',
  
  // ESPETINHOS
  'Espetinhos': 'assets/espetinhos.webp',
  'Bolinhas': 'assets/espetinhos.webp',             // ← USANDO espetinhos.webp
  
  // SOBREMESAS
  'Mousse': 'assets/mousses.webp',
  'Mousses': 'assets/mousses.webp',
  'Cone Trufado': 'assets/cones-trufados.webp',
  'Cones Trufados': 'assets/cones-trufados.webp',
  'Trufa': 'assets/trufas.webp',
  'Trufas': 'assets/trufas.webp',
  'Delícia de Abacaxi': 'assets/delicia-abacaxi.webp',
  
  // GELADOS
  'Dindin': 'assets/dindin-gourmet.webp',
  'Dindins Gourmet': 'assets/dindin-gourmet.webp',
  
  // BEBIDAS
  'Suco Natural': 'assets/sucos.webp',
  'Sucos': 'assets/sucos.webp',
};

  function getImagem(nome) {
  if (!nome) return null;
  
  // 1. Verifica se tem imagem exata
  if (IMAGENS[nome]) return IMAGENS[nome];
  
  // 2. Busca por correspondência parcial
  var nomeLow = nome.toLowerCase();
  for (var chave in IMAGENS) {
    if (IMAGENS.hasOwnProperty(chave)) {
      var chaveLow = chave.toLowerCase();
      if (nomeLow.indexOf(chaveLow) !== -1 || chaveLow.indexOf(nomeLow) !== -1) {
        return IMAGENS[chave];
      }
    }
  }
  
  // 3. Tenta encontrar por palavras-chave
  var palavrasChave = {
    'baiao': 'assets/baiao-cremoso.webp',
    'arroz': 'assets/arroz-branco.webp',
    'camarao': 'assets/camarao.webp',
    'caranguejo': 'assets/caranguejo.webp',
    'sopa': 'assets/sopa.webp',
    'canja': 'assets/canja.webp',
    'batata': 'assets/batata.webp',
    'macaxeira': 'assets/macaxeira.webp',
    'espetinho': 'assets/espetinhos.webp',
    'bolinha': 'assets/espetinhos.webp',
    'mousse': 'assets/mousses.webp',
    'trufa': 'assets/trufas.webp',
    'cone': 'assets/cones-trufados.webp',
    'dindin': 'assets/dindin-gourmet.webp',
    'suco': 'assets/sucos.webp',
    'pratinho': 'assets/pratinho.webp',
    'vatapa': 'assets/vatapa-camarao.webp',
    'delicia': 'assets/delicia-abacaxi.webp',
    'alho': 'assets/camarao.webp',        // ← Para Camarão Alho
    'oleo': 'assets/camarao.webp'         // ← Para Camarão Oleo
  };
  
  for (var palavra in palavrasChave) {
    if (palavrasChave.hasOwnProperty(palavra)) {
      if (nomeLow.indexOf(palavra) !== -1) {
        return palavrasChave[palavra];
      }
    }
  }
  
  // 4. FALLBACK: SVG com o nome do prato
  var nomeLimpo = nome.replace(/[^a-zA-Z0-9 ]/g, '');
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%231a1a1a"/%3E%3Crect x="20" y="20" width="360" height="360" rx="10" fill="none" stroke="%23F59B3C" stroke-width="2"/%3E%3Ctext x="200" y="180" font-family="Arial" font-size="40" fill="%23F59B3C" text-anchor="middle"%3E🍽️%3C/text%3E%3Ctext x="200" y="240" font-family="Arial" font-size="18" fill="%23ffffff" text-anchor="middle"%3E' + encodeURIComponent(nomeLimpo) + '%3C/text%3E%3C/svg%3E';
}

  // ============================================================
  // ESTADOS
  // ============================================================
  var slides = [];
  var idx = 0;
  var timer = null;
  var destaqueTimer = null;
  var destaqueMode = 'pratos';
  var ultimosDados = null;
  var espetinhoPage = 0;

  // ============================================================
  // CONSTRUIR SLIDES
  // ============================================================
  function construirSlides(dados) {
    var pratosDisp = [];
    var cardapio = dados.cardapio || [];
    for (var i = 0; i < cardapio.length; i++) {
      var p = cardapio[i];
      if (p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato') {
        pratosDisp.push(p);
      }
    }

    var sobremesas = [];
    var sobremesasData = dados.sobremesas || [];
    for (var s = 0; s < sobremesasData.length; s++) {
      var sob = sobremesasData[s];
      if (sob.nome && sob.quantidade > 0) {
        sobremesas.push(sob);
      }
    }

    var sucos = [];
    var sucosData = dados.sucos || [];
    for (var su = 0; su < sucosData.length; su++) {
      var suc = sucosData[su];
      if (suc.nome && suc.quantidade > 0) {
        sucos.push(suc);
      }
    }

    var dindins = [];
    var dindinsData = dados.dindins || [];
    for (var d = 0; d < dindinsData.length; d++) {
      var din = dindinsData[d];
      if (din.nome && din.quantidade > 0) {
        dindins.push(din);
      }
    }

    var slidesPratos = [];
for (var j = 0; j < pratosDisp.length; j++) {
  var prato = pratosDisp[j];
  // Pega o valor da planilha (coluna D)
  var precoPrato = prato.valor ? Number(prato.valor) : null;
  
  slidesPratos.push({
    tipo: 'prato',
    nome: prato.nome,
    categoria: prato.categoria || 'Prato do Dia',
    descricao: 'Feito com ingredientes frescos · Sabor caseiro de verdade.',
    saboresPrincipais: null,
    saboresTodos: null,
    preco: precoPrato,  // ← ADICIONADO
    tags: [{ texto: 'Disponível', destaque: true }, { texto: 'Feito na Hora' }],
    imagem: getImagem(prato.nome),
  });
}

    var catsSob = {};
    for (var k = 0; k < sobremesas.length; k++) {
      var item = sobremesas[k];
      var cat = item.categoria || 'Sobremesa';
      if (!catsSob[cat]) catsSob[cat] = [];
      catsSob[cat].push(item);
    }

    var slidesSob = [];
    for (var catNome in catsSob) {
      if (catsSob.hasOwnProperty(catNome)) {
        var itens = catsSob[catNome];
        var saboresPrincipais = [];
        var saboresTodos = [];
        for (var a = 0; a < itens.length && a < 5; a++) {
          saboresPrincipais.push(itens[a].nome);
        }
        for (var b = 0; b < itens.length; b++) {
          saboresTodos.push(itens[b].nome);
        }
        var preco = itens[0] && itens[0].valor ? Number(itens[0].valor) : null;
        slidesSob.push({
          tipo: 'sobremesa',
          nome: catNome,
          categoria: 'Doces & Sobremesas',
          descricao: null,
          saboresPrincipais: saboresPrincipais,
          saboresTodos: saboresTodos,
          preco: preco,
          tags: [{ texto: 'Artesanal', destaque: true }, { texto: itens.length + ' Sabores' }],
          imagem: getImagem(catNome),
        });
      }
    }

    var catsSuco = {};
    for (var m = 0; m < sucos.length; m++) {
      var itemSuco = sucos[m];
      var catSuco = itemSuco.categoria || 'Sucos';
      if (!catsSuco[catSuco]) catsSuco[catSuco] = [];
      catsSuco[catSuco].push(itemSuco);
    }

    var slidesSuco = [];
    for (var catSucoNome in catsSuco) {
      if (catsSuco.hasOwnProperty(catSucoNome)) {
        var itensSuco = catsSuco[catSucoNome];
        var saboresPrincipaisSuco = [];
        var saboresTodosSuco = [];
        for (var c = 0; c < itensSuco.length && c < 5; c++) {
          saboresPrincipaisSuco.push(itensSuco[c].nome);
        }
        for (var e = 0; e < itensSuco.length; e++) {
          saboresTodosSuco.push(itensSuco[e].nome);
        }
        var precoSuco = itensSuco[0] && itensSuco[0].valor ? Number(itensSuco[0].valor) : null;
        slidesSuco.push({
          tipo: 'suco',
          nome: catSucoNome,
          categoria: 'Sucos Naturais',
          descricao: null,
          saboresPrincipais: saboresPrincipaisSuco,
          saboresTodos: saboresTodosSuco,
          preco: precoSuco,
          tags: [{ texto: 'Natural', destaque: true }, { texto: itensSuco.length + ' Sabores' }],
          imagem: getImagem('Suco Natural'),
        });
      }
    }

    var valorDindin = 6;
    if (dindins.length > 0 && dindins[0].valor) {
      valorDindin = Number(dindins[0].valor);
    }

    var slideDindins = [];
    if (dindins.length > 0) {
      var saboresPrincipaisDindin = [];
      var saboresTodosDindin = [];
      for (var f = 0; f < dindins.length && f < 5; f++) {
        saboresPrincipaisDindin.push(dindins[f].nome);
      }
      for (var g = 0; g < dindins.length; g++) {
        saboresTodosDindin.push(dindins[g].nome);
      }
      slideDindins.push({
        tipo: 'dindin',
        nome: 'Dindins Gourmet',
        categoria: 'Gelados Artesanais',
        descricao: null,
        saboresPrincipais: saboresPrincipaisDindin,
        saboresTodos: saboresTodosDindin,
        preco: valorDindin,
        tags: [{ texto: 'Gelados', destaque: true }, { texto: dindins.length + ' Sabores' }, { texto: 'R$ ' + valorDindin.toFixed(2).replace('.', ',') + ' un.' }],
        imagem: getImagem('Dindin'),
      });
    }

    var naoProtos = slidesSob.concat(slidesSuco).concat(slideDindins);
    var resultado = [];
    var maxLen = Math.max(slidesPratos.length, naoProtos.length);

    for (var h = 0; h < maxLen; h++) {
      if (h < slidesPratos.length) resultado.push(slidesPratos[h]);
      if (h < naoProtos.length) resultado.push(naoProtos[h]);
    }

    if (resultado.length === 0) {
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

  // ============================================================
  // RENDERIZAR SLIDES
  // ============================================================
  function renderizarSlidesDom() {
    var container = document.getElementById('slide-container');
    if (!container) return;

    var oldSlides = container.querySelectorAll('.slide-img, .slide-badges');
    for (var i = 0; i < oldSlides.length; i++) {
      oldSlides[i].remove();
    }

    for (var j = 0; j < slides.length; j++) {
      var s = slides[j];

      var img = document.createElement('img');
      img.className = 'slide-img' + (j === 0 ? ' ativo' : '');
      img.src = s.imagem || '';
      img.alt = s.nome || 'Prato';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';

      img.onerror = function() {
        this.style.display = 'none';
      };

      var slideNum = document.getElementById('slide-num');
      container.insertBefore(img, slideNum);

      if (s.saboresTodos && s.saboresTodos.length && s.tipo !== 'prato') {
        var bdiv = document.createElement('div');
        bdiv.className = 'slide-badges' + (j === 0 ? ' ativo' : '');
        var badgesHTML = '';
        for (var b = 0; b < s.saboresTodos.length; b++) {
          badgesHTML += '<span class="badge">' + s.saboresTodos[b] + '</span>';
        }
        bdiv.innerHTML = badgesHTML;
        container.insertBefore(bdiv, slideNum);
      }
    }

    var dotsContainer = document.getElementById('progress-dots');
    if (dotsContainer) {
      var dotsHTML = '';
      for (var d = 0; d < slides.length; d++) {
        dotsHTML += '<div class="dot' + (d === 0 ? ' ativo' : '') + '"></div>';
      }
      dotsContainer.innerHTML = dotsHTML;
    }
  }

  // ============================================================
  // CONTROLE DE SLIDES
  // ============================================================
  function offsetDomIdx(targetIdx) {
    var o = 0;
    for (var i = 0; i < targetIdx; i++) {
      o++;
      if (slides[i].saboresTodos && slides[i].saboresTodos.length && slides[i].tipo !== 'prato') {
        o++;
      }
    }
    return o;
  }

  function setAtivo(on) {
    var container = document.getElementById('slide-container');
    if (!container) return;

    var allEls = container.querySelectorAll('.slide-img, .slide-badges');
    var dots = document.getElementById('progress-dots');
    var dotEls = dots ? dots.querySelectorAll('.dot') : [];
    var domStart = offsetDomIdx(idx);
    var hasBadges = (slides[idx] && slides[idx].saboresTodos && slides[idx].saboresTodos.length && slides[idx].tipo !== 'prato');
    var domCount = hasBadges ? 2 : 1;

    for (var j = domStart; j < domStart + domCount; j++) {
      if (allEls[j]) {
        if (on) {
          allEls[j].classList.add('ativo');
        } else {
          allEls[j].classList.remove('ativo');
        }
      }
    }
    if (dotEls[idx]) {
      if (on) {
        dotEls[idx].classList.add('ativo');
      } else {
        dotEls[idx].classList.remove('ativo');
      }
    }

    var elementosTexto = ['nome', 'dish-desc', 'dish-categoria', 'separador', 'dish-tags'];
    for (var e = 0; e < elementosTexto.length; e++) {
      var el = document.getElementById(elementosTexto[e]);
      if (el) {
        if (on) {
          el.classList.add('ativo');
        } else {
          el.classList.remove('ativo');
        }
      }
    }
  }

  function preencherTexto() {
  if (!slides.length || idx >= slides.length) return;

  var s = slides[idx];
  var nome = document.getElementById('nome');
  var desc = document.getElementById('dish-desc');
  var preco = document.getElementById('dish-preco');
  var cat = document.getElementById('cat-texto');
  var tags = document.getElementById('dish-tags');
  var prox = document.getElementById('prox-nome');
  var num = document.getElementById('slide-num');

  if (cat) cat.textContent = s.categoria || '';
  if (nome) nome.textContent = s.nome || '—';

  if (desc) {
    // Se tiver sabores principais (sobremesas, sucos, dindins)
    if (s.saboresPrincipais && s.saboresPrincipais.length && s.tipo !== 'prato') {
      var chipsHTML = '<div class="sabores-principais">';
      for (var i = 0; i < s.saboresPrincipais.length; i++) {
        chipsHTML += '<span class="chip-principal cor-' + (i % 5) + '">' + s.saboresPrincipais[i] + '</span>';
      }
      chipsHTML += '</div>';
      desc.innerHTML = chipsHTML;
    }
    // Se for prato, mostra apenas a descrição
    else {
      desc.innerHTML = s.descricao || '';
    }
  }

  if (preco) {
    if (s.preco) {
      var sufixo = (s.saboresPrincipais && s.saboresPrincipais.length && s.tipo !== 'prato') ? ' <span>/ un.</span>' : '';
      preco.innerHTML = '<div class="preco-destaque">R$ ' + Number(s.preco).toFixed(2).replace('.', ',') + sufixo + '</div>';
    } else {
      preco.innerHTML = '';
    }
  }

  if (tags) {
    var tagsHTML = '';
    for (var t = 0; t < s.tags.length; t++) {
      var tag = s.tags[t];
      tagsHTML += '<span class="tag' + (tag.destaque ? ' tag-destaque' : '') + '">' + tag.texto + '</span>';
    }
    tags.innerHTML = tagsHTML;
  }

  if (prox && slides.length > 0) {
    prox.textContent = slides[(idx + 1) % slides.length].nome;
  }
  if (num) {
    var numStr = String(idx + 1).padStart(2, '0');
    var totalStr = String(slides.length).padStart(2, '0');
    num.textContent = numStr + ' / ' + totalStr;
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

  // ============================================================
  // PAINEL CENTRAL — DESTAQUES (PRATOS + ESPETINHOS FIXOS)
  // ============================================================

  function renderizarDestaques(dados) {
  var lista = document.getElementById('dest-lista');
  if (!lista) return;

  var html = '';
  var cardapio = dados.cardapio || [];

  // --- 1. PRATOS (em cima) ---
  var pratos = [];
  var ordemPersonalizada = ['Baião Cremoso', 'Arroz de Camarão', 'Caranguejo'];
  
  for (var i = 0; i < cardapio.length; i++) {
    var p = cardapio[i];
    if (p.disponivel && p.categoria && p.categoria.toLowerCase() === 'prato') {
      pratos.push(p);
    }
  }

  pratos.sort(function(a, b) {
    var idxA = ordemPersonalizada.indexOf(a.nome);
    var idxB = ordemPersonalizada.indexOf(b.nome);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  pratos = pratos.slice(0, 8);

  if (pratos.length > 0) {
    html += '<div class="dest-grupo">';
    html += '<div class="dest-grupo-titulo">Pratos</div>';
    html += '<div class="dest-grid">';
    for (var j = 0; j < pratos.length; j++) {
      var p = pratos[j];
      html += '<div class="dest-item">';
      html += '<div class="dest-dot" style="background:#F59B3C;"></div>';
      html += '<div class="dest-nome">' + p.nome + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  // --- 2. ESPETINHOS (em baixo) ---
  var espetinhos = [];
  for (var k = 0; k < cardapio.length; k++) {
    var item = cardapio[k];
    if (item.disponivel && item.categoria && item.categoria.toLowerCase() === 'espetinho') {
      espetinhos.push(item);
    }
  }

  if (espetinhos.length > 0) {
    var espetinhosExibir = espetinhos.slice(0, 8);
    html += '<div class="dest-grupo">';
    html += '<div class="dest-grupo-titulo">Espetinhos</div>';
    html += '<div class="dest-grid">';
    for (var l = 0; l < espetinhosExibir.length; l++) {
      var e = espetinhosExibir[l];
      html += '<div class="dest-item">';
      html += '<div class="dest-dot" style="background:#34D399;"></div>';
      html += '<div class="dest-nome">' + e.nome + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  // Fallback
  if (html === '') {
    html = '<div style="font-size:12px;color:rgba(255,255,255,0.22);padding:6px 0">Cardápio sendo atualizado...</div>';
  }

  lista.innerHTML = html;
}

  // ============================================================
  // RELÓGIO
  // ============================================================
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

  // ============================================================
  // CARREGAR DADOS DO CARDÁPIO
  // ============================================================
  function carregarDados() {
    try {
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
          console.warn('Erro ao carregar dados do cardápio:', e);
          setTimeout(carregarDados, 30000);
        });
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
      setTimeout(carregarDados, 30000);
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
  });

})();
