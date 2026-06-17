// copa-slide.js — Slide automático de fotos da Copa do Mundo 2026

(function() {
  'use strict';

  const INTERVALO_MS = 5000;
  const TRANSICAO_MS = 1000;

  let slides = [];
  let dots = [];
  let indiceAtual = 0;
  let intervalo = null;
  let transicaoAtiva = false;

  function init() {
    const track = document.getElementById('cfs-track');
    if (!track) return;

    // Captura todos os slides (pode ser img ou div)
    slides = Array.from(track.children);
    
    const dotsContainer = document.getElementById('cfs-dots');
    if (dotsContainer) {
      dots = Array.from(dotsContainer.querySelectorAll('.cfs-dot'));
    }

    if (slides.length === 0) return;

    // Esconde todos exceto o primeiro
    slides.forEach((slide, i) => {
      if (i === 0) {
        slide.classList.add('ativo');
      } else {
        slide.classList.remove('ativo');
      }
    });

    atualizarDots(0);
    iniciarSlide();

    const container = document.getElementById('copa-fotos-slide');
    if (container) {
      container.addEventListener('mouseenter', pausarSlide);
      container.addEventListener('mouseleave', retomarSlide);
    }

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        pausarSlide();
      } else {
        retomarSlide();
      }
    });
  }

  function proximaImagem() {
    if (transicaoAtiva || slides.length === 0) return;
    
    transicaoAtiva = true;
    const proximo = (indiceAtual + 1) % slides.length;

    slides[indiceAtual].classList.remove('ativo');
    slides[proximo].classList.add('ativo');

    atualizarDots(proximo);
    indiceAtual = proximo;

    setTimeout(() => {
      transicaoAtiva = false;
    }, TRANSICAO_MS);
  }

  function irParaImagem(indice) {
    if (indice === indiceAtual || transicaoAtiva || slides.length === 0) return;
    if (indice < 0 || indice >= slides.length) return;

    transicaoAtiva = true;
    slides[indiceAtual].classList.remove('ativo');
    slides[indice].classList.add('ativo');
    atualizarDots(indice);
    indiceAtual = indice;

    setTimeout(() => {
      transicaoAtiva = false;
    }, TRANSICAO_MS);
  }

  function atualizarDots(indice) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('ativo', i === indice);
    });
  }

  function iniciarSlide() {
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
    intervalo = setInterval(proximaImagem, INTERVALO_MS);
  }

  function pausarSlide() {
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  }

  function retomarSlide() {
    if (!intervalo) {
      iniciarSlide();
    }
  }

  function reiniciarSlide() {
    pausarSlide();
    indiceAtual = 0;
    slides.forEach((slide, i) => {
      slide.classList.toggle('ativo', i === 0);
    });
    atualizarDots(0);
    iniciarSlide();
  }

  // Exporta para uso externo
  window.copaSlide = {
    iniciar: iniciarSlide,
    pausar: pausarSlide,
    retomar: retomarSlide,
    reiniciar: reiniciarSlide,
    proximo: proximaImagem,
    irPara: irParaImagem
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
