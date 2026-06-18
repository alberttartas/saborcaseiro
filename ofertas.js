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
  // MAPA DE IMAGENS
  // ============================================================
  var IMAGENS = {
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
    var nomeLow = nome.toLowerCase();
    for (var chave in IMAGENS) {
      if (IMAGENS.hasOwnProperty(chave)) {
        if (nomeLow.indexOf(chave.toLowerCase()) !== -1 || chave.toLowerCase().indexOf(nomeLow) !== -1) {
          return IMAGENS[chave];
        }
      }
    }
    return null;
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
  // COPA DO MUNDO 2026 - DADOS DO BACKEND
  // ============================================================
  var copaDados = {
    grupo: [],
    jogos: [],
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

  var copaTabAtual = 'jogo';
  var copaAutoTimer = null;
  var COPA_TABS = ['jogo', 'grupo', 'jogos', 'fotos'];

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
  // Pega o valor do prato (coluna D da planilha)
  var precoPrato = prato.valor ? Number(prato.valor) : null;
  
  slidesPratos.push({
    tipo: 'prato',
    nome: prato.nome,
    categoria: prato.categoria || 'Prato do Dia',
    descricao: 'Feito com ingredientes frescos · Sabor caseiro de verdade.',
    saboresPrincipais: null,
    saboresTodos: null,
    preco: precoPrato,  // ← ADICIONA O PREÇO
    tags: [{ texto: '✓ Disponível', destaque: true }, { texto: 'Feito na Hora' }],
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
          tags: [{ texto: '🍮 Artesanal', destaque: true }, { texto: itens.length + ' Sabores' }],
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
          tags: [{ texto: '🥤 Natural', destaque: true }, { texto: itensSuco.length + ' Sabores' }],
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
        tags: [{ texto: '🧊 Gelados', destaque: true }, { texto: dindins.length + ' Sabores' }, { texto: 'R$ ' + valorDindin.toFixed(2).replace('.', ',') + ' un.' }],
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
    if (!dots) return;

    var dotEls = dots.querySelectorAll('.dot');
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
  var cat = document.getElementById('cat-texto');
  var tags = document.getElementById('dish-tags');
  var prox = document.getElementById('prox-nome');
  var num = document.getElementById('slide-num');

  if (cat) cat.textContent = s.categoria || '';
  if (nome) nome.textContent = s.nome || '—';

  if (desc) {
    // Se tiver sabores principais (sobremesas, sucos, dindins)
    if (s.saboresPrincipais && s.saboresPrincipais.length && s.tipo !== 'prato') {
      var precoHTML = '';
      if (s.preco) {
        precoHTML = '<div class="preco-destaque">R$ ' + Number(s.preco).toFixed(2).replace('.', ',') + ' <span>/ un.</span></div>';
      }
      var chipsHTML = '<div class="sabores-principais">';
      for (var i = 0; i < s.saboresPrincipais.length; i++) {
        chipsHTML += '<span class="chip-principal cor-' + (i % 5) + '">' + s.saboresPrincipais[i] + '</span>';
      }
      chipsHTML += '</div>';
      desc.innerHTML = chipsHTML + precoHTML;
    } 
    // Se for prato, mostra descrição + preço
    else {
      var descTexto = s.descricao || '';
      var precoHTML = '';
      if (s.preco) {
        precoHTML = '<div class="preco-destaque">R$ ' + Number(s.preco).toFixed(2).replace('.', ',') + '</div>';
      }
      desc.innerHTML = descTexto + precoHTML;
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

    pratos = pratos.slice(0, 6);

    if (pratos.length > 0) {
      html += '<div class="dest-grupo">';
      html += '<div class="dest-grupo-titulo">🍽️ Pratos</div>';
      for (var j = 0; j < pratos.length; j++) {
        var p = pratos[j];
        html += '<div class="dest-item">';
        html += '<div class="dest-dot" style="background:#F59B3C;"></div>';
        html += '<div class="dest-nome">' + p.nome + '</div>';
        html += '<div class="dest-cat">' + (p.categoria || '') + '</div>';
        html += '</div>';
      }
      html += '</div>';
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
      var espetinhosExibir = espetinhos.slice(0, 6);
      html += '<div class="dest-grupo">';
      html += '<div class="dest-grupo-titulo">🍢 Espetinhos</div>';
      for (var l = 0; l < espetinhosExibir.length; l++) {
        var e = espetinhosExibir[l];
        html += '<div class="dest-item">';
        html += '<div class="dest-dot" style="background:#34D399;"></div>';
        html += '<div class="dest-nome">' + e.nome + '</div>';
        html += '<div class="dest-cat">Espetinho</div>';
        html += '</div>';
      }
      html += '</div>';
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
  // COPA DO MUNDO 2026 - BACKEND
  // ============================================================
  
  function getProximoJogo() {
    if (!copaDados.jogos || copaDados.jogos.length === 0) return null;

    var agora = new Date();
    var jogosFuturos = [];
    for (var i = 0; i < copaDados.jogos.length; i++) {
      var jogo = copaDados.jogos[i];
      if (jogo.status === 'TIMED' || jogo.status === 'SCHEDULED' || jogo.status === 'IN_PLAY' || jogo.status === 'PAUSED') {
        jogosFuturos.push(jogo);
      } else if (jogo.dataHora && jogo.dataHora > agora) {
        jogosFuturos.push(jogo);
      }
    }

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

  function copaRenderJogo() {
    var proximoJogo = getProximoJogo();
    var placarStatus = document.getElementById('placar-status');
    var placarData = document.getElementById('placar-data');
    var golBraEl = document.getElementById('gol-bra');
    var golMarEl = document.getElementById('gol-mar');
    var jogoLiveBadge = document.getElementById('jogo-live-badge');
    var advNomeEl = document.querySelector('.placar-time:last-child .placar-nome');
    var advBandeiraEl = document.querySelector('.placar-time:last-child .placar-bandeira');

    if (!proximoJogo) {
      if (placarStatus) placarStatus.textContent = 'Aguardando dados';
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
    if (advBandeiraEl) advBandeiraEl.textContent = '🏳️';

    var golBra = (proximoJogo.golBra !== null && proximoJogo.golBra !== undefined) ? proximoJogo.golBra : '—';
    var golAdv = (proximoJogo.golAdv !== null && proximoJogo.golAdv !== undefined) ? proximoJogo.golAdv : '—';
    
    if (proximoJogo.status === 'SCHEDULED' || proximoJogo.status === 'TIMED') {
      golBra = '—';
      golAdv = '—';
    }
    
    if (golBraEl) golBraEl.textContent = golBra;
    if (golMarEl) golMarEl.textContent = golAdv;

    var statusTexto = '';
    var showBadge = false;
    if (proximoJogo.status === 'IN_PLAY') { statusTexto = 'AO VIVO'; showBadge = true; }
    else if (proximoJogo.status === 'PAUSED') { statusTexto = 'INTERVALO'; showBadge = true; }
    else if (proximoJogo.status === 'FINISHED') { statusTexto = 'FIM DE JOGO'; showBadge = false; }
    else if (proximoJogo.status === 'SCHEDULED' || proximoJogo.status === 'TIMED') { statusTexto = 'PRÓXIMO JOGO'; showBadge = false; }
    else { statusTexto = 'PRÓXIMO JOGO'; showBadge = false; }

    if (placarStatus) placarStatus.textContent = statusTexto;
    if (jogoLiveBadge) jogoLiveBadge.style.display = showBadge ? 'inline-flex' : 'none';
    if (placarData && proximoJogo.dataHora) {
      placarData.textContent = formatarDataJogo(proximoJogo.dataHora);
    }
  }

  // ============================================================
  // ABA GRUPO - APENAS 4 COLUNAS (apenas Brasil, Marrocos, Escócia, Haiti)
  // ============================================================
  function copaRenderGrupo() {
    var tbody = document.getElementById('grupo-tbody');
    if (!tbody) return;

    if (!copaDados.grupo || copaDados.grupo.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">Carregando classificação...</td></tr>';
      return;
    }

    // Filtra apenas Brasil, Marrocos, Escócia, Haiti
    var nomesPermitidos = ['Brasil', 'Marrocos', 'Escócia', 'Haiti'];
    var timesFiltrados = copaDados.grupo.filter(function(time) {
      return nomesPermitidos.indexOf(time.nome) !== -1;
    });

    if (timesFiltrados.length === 0) {
      timesFiltrados = copaDados.grupo;
    }

    var sorted = timesFiltrados.slice().sort(function(a, b) {
      if (b.p !== a.p) return b.p - a.p;
      var sgA = (a.gp || 0) - (a.gc || 0);
      var sgB = (b.gp || 0) - (b.gc || 0);
      return sgB - sgA;
    });

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var rowClass = (s.nome === 'Brasil') ? 'brasil-row' : '';
      html += '<tr class="' + rowClass + '">';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td>' + s.nome + '</td>';
      html += '<td>' + (s.j || 0) + '</td>';
      html += '<td><strong>' + (s.p || 0) + '</strong></td>';
      html += '</tr>';
    }
    tbody.innerHTML = html;
  }

  function copaRenderJogos() {
    var container = document.getElementById('jogos-lista');
    if (!container) return;

    if (!copaDados.jogos || copaDados.jogos.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:20px">Carregando jogos...</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < copaDados.jogos.length; i++) {
      var jogo = copaDados.jogos[i];
      var isFinished = jogo.status === 'FINISHED';
      var isLive = jogo.status === 'IN_PLAY' || jogo.status === 'PAUSED';
      var statusText = isLive ? 'AO VIVO' : (isFinished ? 'FINALIZADO' : 'AGENDADO');
      var statusColor = isLive ? '#f59b3c' : (isFinished ? '#4ade80' : 'rgba(255,255,255,0.5)');
      
      var dataFormatada = '';
      if (jogo.dataHora) {
        dataFormatada = jogo.dataHora.toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
      } else if (jogo.data) {
        dataFormatada = jogo.data;
      }
      
      var placar = '—';
      if (isFinished && jogo.golBra !== null && jogo.golBra !== undefined) {
        placar = jogo.golBra + '-' + jogo.golAdv;
      }

      html += '<div class="jogo-item" style="background:rgba(255,255,255,0.03);border-radius:0.5rem;padding:0.5rem;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div style="font-size:0.55rem;color:rgba(255,255,255,0.5);min-width:100px;">' + dataFormatada + '</div>';
      html += '<div style="flex:1;text-align:center;font-weight:600;font-size:0.55rem;">' + jogo.casa + ' vs ' + jogo.fora + '</div>';
      html += '<div style="min-width:70px;text-align:right;">';
      html += '<div style="font-weight:700;font-size:0.55rem;">' + placar + '</div>';
      html += '<div style="font-size:0.4rem;color:' + statusColor + ';">' + statusText + '</div>';
      html += '</div></div>';
    }
    container.innerHTML = html;
  }

  function copaRenderFotos() {
    var grid = document.getElementById('fotos-grid');
    var cap = document.getElementById('fotos-caption');
    if (!grid) return;

    var COR_POS = {
      GOL: '#f59b3c', ZAG: '#60a5fa', LAT: '#60a5fa',
      VOL: '#4ade80', MEI: '#4ade80', ATA: '#f472b6',
    };

    var html = '';
    for (var i = 0; i < copaDados.convocados.length; i++) {
      var j = copaDados.convocados[i];
      var cor = COR_POS[j.pos] || '#ffffff';
      html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:0.4rem;padding:0.3rem 0.4rem;display:flex;align-items:center;gap:0.3rem;">';
      html += '<span style="font-size:0.55rem;font-weight:900;color:#FFD700;min-width:1rem;text-align:center;">' + j.num + '</span>';
      html += '<div><div style="font-size:0.5rem;font-weight:700;color:rgba(255,255,255,0.85);line-height:1.2">' + j.nome + '</div>';
      html += '<div style="font-size:0.38rem;font-weight:700;color:' + cor + ';letter-spacing:1px">' + j.pos + '</div></div></div>';
    }
    grid.innerHTML = html;

    if (cap) cap.textContent = 'Convocados — Copa do Mundo 2026';
  }

  function copaMudarAba(tab) {
    copaTabAtual = tab;

    var tabs = document.querySelectorAll('.copa-tab');
    for (var i = 0; i < tabs.length; i++) {
      var btn = tabs[i];
      if (btn.dataset.tab === tab) {
        btn.classList.add('ativo');
      } else {
        btn.classList.remove('ativo');
      }
    }

    var panels = document.querySelectorAll('.copa-panel');
    for (var j = 0; j < panels.length; j++) {
      var panel = panels[j];
      if (panel.id === 'tab-' + tab) {
        panel.classList.add('ativo');
      } else {
        panel.classList.remove('ativo');
      }
    }

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
    var tabs = document.querySelectorAll('.copa-tab');
    for (var i = 0; i < tabs.length; i++) {
      var btn = tabs[i];
      btn.addEventListener('click', function() {
        if (copaAutoTimer) clearInterval(copaAutoTimer);
        copaMudarAba(this.dataset.tab);
        setTimeout(copaIniciarRotacao, 20000);
      });
    }

    copaMudarAba('jogo');
    copaIniciarRotacao();
  }

  // ============================================================
  // CARREGAR DADOS DO BACKEND
  // ============================================================
  
  function carregarDadosCopa() {
    console.log('Carregando dados da Copa via backend...');
    
    // Busca classificação - USANDO SEU BACKEND
    fetch('/api/copa')
      .then(function(res) {
        if (!res.ok) {
          console.warn('Erro ao buscar classificação:', res.status);
          return null;
        }
        return res.json();
      })
      .then(function(data) {
        console.log('Classificação recebida do backend');
        if (data && data.standings) {
          var grupo = [];
          // Procura o grupo do Brasil
          for (var i = 0; i < data.standings.length; i++) {
            var standing = data.standings[i];
            // Verifica se é o grupo C ou se contém Brasil
            var temBrasil = false;
            if (standing.table) {
              for (var t = 0; t < standing.table.length; t++) {
                if (standing.table[t].team.name === 'Brazil') {
                  temBrasil = true;
                  break;
                }
              }
            }
            
            if (temBrasil || (standing.group && standing.group.indexOf('C') !== -1)) {
              for (var j = 0; j < standing.table.length; j++) {
                var team = standing.table[j];
                var nome = team.team.name;
                if (nome === 'Brazil') nome = 'Brasil';
                else if (nome === 'Morocco') nome = 'Marrocos';
                else if (nome === 'Scotland') nome = 'Escócia';
                else if (nome === 'Haiti') nome = 'Haiti';
                grupo.push({
                  id: team.team.id,
                  nome: nome,
                  j: team.playedGames || 0,
                  v: team.won || 0,
                  e: team.draw || 0,
                  d: team.lost || 0,
                  gp: team.goalsFor || 0,
                  gc: team.goalsAgainst || 0,
                  p: team.points || 0
                });
              }
              break;
            }
          }
          if (grupo.length > 0) {
            copaDados.grupo = grupo;
            copaRenderGrupo();
            copaRenderJogo();
            console.log('Grupo atualizado:', grupo);
          }
        }
      })
      .catch(function(err) {
        console.warn('Erro ao buscar classificação:', err);
      });

    // Busca jogos - USANDO SEU BACKEND
    fetch('/api/copa-matches')
      .then(function(res) {
        if (!res.ok) {
          console.warn('Erro ao buscar jogos:', res.status);
          return null;
        }
        return res.json();
      })
      .then(function(data) {
        console.log('Jogos recebidos do backend');
        if (data && data.matches) {
          var jogos = [];
          for (var i = 0; i < data.matches.length; i++) {
            var m = data.matches[i];
            
            // Verifica se é jogo do Brasil (ID 764)
            var braCasa = m.homeTeam && m.homeTeam.id === 764;
            var braFora = m.awayTeam && m.awayTeam.id === 764;
            var isBrasil = braCasa || braFora;
            
            if (!isBrasil) continue; // Pula jogos que não são do Brasil
            
            var dt = new Date(m.utcDate);
            var dtBR = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
            
            var adversario = braCasa ? m.awayTeam : m.homeTeam;
            var nomeAdv = adversario ? adversario.name : 'Desconhecido';
            if (nomeAdv === 'Morocco') nomeAdv = 'Marrocos';
            else if (nomeAdv === 'Scotland') nomeAdv = 'Escócia';
            else if (nomeAdv === 'Haiti') nomeAdv = 'Haiti';
            
            var golBra = null;
            var golAdv = null;
            if (m.score && m.score.fullTime) {
              if (braCasa) {
                golBra = m.score.fullTime.home;
                golAdv = m.score.fullTime.away;
              } else if (braFora) {
                golBra = m.score.fullTime.away;
                golAdv = m.score.fullTime.home;
              }
            }
            
            jogos.push({
              data: dtBR.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
              hora: dtBR.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              dataHora: dtBR,
              casa: braCasa ? 'Brasil' : nomeAdv,
              fora: braCasa ? nomeAdv : 'Brasil',
              local: m.venue || 'Estádio do Maracanã',
              status: m.status || 'SCHEDULED',
              golBra: golBra,
              golAdv: golAdv
            });
          }
          jogos.sort(function(a, b) { return a.dataHora - b.dataHora; });
          if (jogos.length > 0) {
            copaDados.jogos = jogos;
            copaRenderJogos();
            copaRenderJogo();
            console.log('Jogos atualizados:', jogos.length);
          }
        }
      })
      .catch(function(err) {
        console.warn('Erro ao buscar jogos:', err);
      });
  }

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
    copaIniciar();
    carregarDados();
    carregarDadosCopa();
    
    setInterval(carregarDadosCopa, 5 * 60 * 1000);
  });

})();
