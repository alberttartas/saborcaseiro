/* ── SLIDE DE FOTOS DA COPA ── */
#copa-fotos-slide {
  flex: 1 1 auto;
  min-height: 120px;
  position: relative;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid rgba(255,215,0,0.15);
  background: rgba(0,0,0,0.30);
}

#cfs-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.cfs-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 1;
}

.cfs-img.ativo {
  opacity: 1;
  z-index: 2;
}

/* Fallback para imagens que não carregam */
.cfs-img-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 1;
}

.cfs-img-fallback.ativo {
  opacity: 1;
  z-index: 2;
}

#copa-fotos-slide::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 50%);
  pointer-events: none;
  z-index: 3;
}

#cfs-label {
  position: absolute;
  left: 0.7rem;
  bottom: 0.4rem;
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.85);
  z-index: 4;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
}

#cfs-dots {
  position: absolute;
  right: 0.6rem;
  bottom: 0.5rem;
  display: flex;
  gap: 0.25rem;
  z-index: 4;
}

.cfs-dot {
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.30);
  transition: all 0.3s;
  cursor: pointer;
}

.cfs-dot.ativo {
  background: #FFD700;
  width: 0.8rem;
  border-radius: 2px;
}

.cfs-dot:hover {
  background: rgba(255,215,0,0.5);
  transform: scale(1.2);
}