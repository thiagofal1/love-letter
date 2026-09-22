import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { LoveLetterData } from '../types/letter';
import { DEFAULT_LOVE_LETTER } from '../types/letter';
import { parseSpotifyUri } from '../spotify';
import { applyTheme } from '../lib/themes';

function useLiveCounter(startDateStr: string) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = new Date(startDateStr);
    const origin = isNaN(start.getTime()) ? new Date() : start;

    function tick() {
      const diff = Math.max(0, Date.now() - origin.getTime());
      setElapsed({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    }

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [startDateStr]);

  return elapsed;
}

function RevealSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`section-reveal ${className}`}>{children}</div>;
}

function CounterBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="counter-digit text-5xl md:text-7xl font-light leading-none text-primary">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs tracking-[0.25em] uppercase font-mono text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function buildSpotifyEmbedUrl(playlistUrl?: string): string | null {
  const uri = parseSpotifyUri(playlistUrl);
  if (!uri) return null;
  return `https://open.spotify.com/embed/${uri.replace('spotify:', '').replace(':', '/')}`;
}

const CLASSIC_RED_EMOJIS = ['💝', '❤️🩹', '💌', '💕', '❤️🩹', '💝', '✨'];

function FloatingEmojis() {
  const [items, setItems] = useState<Array<{ id: number; emoji: string; left: string; delay: string; duration: string; size: string }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      emoji: CLASSIC_RED_EMOJIS[Math.floor(Math.random() * CLASSIC_RED_EMOJIS.length)],
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 20}s`,
      duration: `${15 + Math.random() * 15}s`,
      size: `${1.5 + Math.random() * 1.5}rem`
    }));
    setItems(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute -bottom-20 animate-floating-emoji"
          style={{
            left: item.left,
            fontSize: item.size,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}

interface LoveLetterViewerProps {
  data?: LoveLetterData;
}

export function LoveLetterViewer({ data = DEFAULT_LOVE_LETTER }: LoveLetterViewerProps) {
  const letter = { ...DEFAULT_LOVE_LETTER, ...data };
  const counter = useLiveCounter(letter.relationship_start_date);
  const [activeMemory, setActiveMemory] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const photos = letter.photos || [];

  useEffect(() => {
    applyTheme(letter.theme_id || 'warm-gold');
  }, [letter.theme_id]);

  useEffect(() => {
    if (activePhoto === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActivePhoto(null);
      if (event.key === 'ArrowLeft') setActivePhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
      if (event.key === 'ArrowRight') setActivePhoto((current) => current === null ? null : (current + 1) % photos.length);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhoto, photos.length]);

  const marqueeText = Array(6).fill(letter.marquee_text || 'EU TE AMO · ').join('');
  const spotifyEmbedUrl = buildSpotifyEmbedUrl(letter.spotify_playlist_url);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="grain-overlay" />
      {letter.theme_id === 'classic-red' && <FloatingEmojis />}

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(201,160,122,0.08) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 vignette" />

        <div className="absolute top-8 left-0 right-0 flex justify-center animate-fade-in delay-100">
          <span className="text-xs tracking-[0.3em] uppercase font-mono text-muted-foreground">
            Para {letter.partner_name} — com amor por {letter.author_name}
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-4xl">
          <p className="text-sm tracking-[0.25em] uppercase animate-fade-in delay-200 font-mono text-muted-foreground">
            Uma carta de amor viva
          </p>

          <h1
            className="animate-fade-in-up delay-300 leading-none font-display italic"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            <span className="gradient-text">{letter.hero_title}</span>
          </h1>

          {letter.hero_subtitle && (
            <h2
              className="animate-fade-in-up delay-500 font-display"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.01em' }}
            >
              {letter.hero_subtitle}
            </h2>
          )}

          {letter.hero_description && (
            <p className="max-w-md text-base leading-relaxed animate-fade-in delay-700 text-secondary-foreground italic">
              {letter.hero_description}
            </p>
          )}

          <div className="animate-fade-in delay-1200 animate-float mt-4">
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" style={{ opacity: 0.4 }}>
              <rect x="1" y="1" width="22" height="38" rx="11" stroke="#c9a07a" strokeWidth="1.5" />
              <rect x="10.5" y="8" width="3" height="8" rx="1.5" fill="#c9a07a" />
            </svg>
          </div>
        </div>
      </section>

      {/* Contador */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,160,122,0.04) 50%, transparent)' }}
        />
        <RevealSection className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs tracking-[0.3em] uppercase font-mono text-muted-foreground">Juntos há</span>
              <span
                className="leading-none font-display text-primary"
                style={{ fontSize: 'clamp(5rem, 20vw, 14rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {counter.days}
              </span>
              <span className="text-sm tracking-[0.2em] uppercase font-mono text-muted-foreground">dias</span>
            </div>

            <div className="flex gap-4 md:gap-16 items-start px-6 md:px-8 py-6 rounded-sm border border-border bg-card/60">
              <CounterBlock value={counter.hours} label="horas" />
              <span className="text-border text-5xl font-display self-start mt-1">:</span>
              <CounterBlock value={counter.minutes} label="minutos" />
              <span className="text-border text-5xl font-display self-start mt-1">:</span>
              <CounterBlock value={counter.seconds} label="segundos" />
            </div>

            <p className="text-base text-center max-w-sm text-muted-foreground italic">
              Cada segundo conta. Este aqui, inclusive.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Marquee */}
      <div className="py-5 overflow-hidden relative border-y border-border bg-card">
        <div className="marquee-track inline-block">
          <span className="font-display italic text-primary tracking-[0.1em]" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontWeight: 300 }}>
            {marqueeText}
          </span>
        </div>
      </div>

      {/* Spotify */}
      {spotifyEmbedUrl && (
        <section className="py-16 px-6 max-w-2xl mx-auto">
          <RevealSection>
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                src={spotifyEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </RevealSection>
        </section>
      )}

      {/* Galeria */}
      {photos.length > 0 && (
        <section className="py-24 px-6 overflow-hidden">
          <RevealSection className="max-w-6xl mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase mb-12 text-center font-mono text-muted-foreground">
              Nossos momentos favoritos
            </p>
            <div className="photo-carousel pb-4">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  className="photo-card group relative aspect-[4/5] shrink-0 overflow-hidden rounded-sm border border-border bg-card text-left focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <img src={photo} alt={`Momento ${index + 1} de ${letter.author_name} e ${letter.partner_name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 to-transparent px-4 pb-4 pt-12 font-mono text-[0.65rem] tracking-[0.2em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    VER FOTO {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs font-mono tracking-widest text-muted-foreground">DESLIZE PARA REVIVER</p>
          </RevealSection>
        </section>
      )}

      {/* Declarações */}
      {letter.declarations && letter.declarations.length > 0 && (
        <section className="py-24 px-6">
          <RevealSection className="max-w-3xl mx-auto flex flex-col gap-0">
            <p className="text-xs tracking-[0.3em] uppercase mb-16 text-center font-mono text-muted-foreground">
              Coisas que sinto e nunca canso de dizer
            </p>

            {letter.declarations.map((text, i) => (
              <div key={i} className="py-6 md:py-8 group cursor-default border-b border-border transition-[padding-left] duration-400">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-[0.65rem] text-border group-hover:text-primary transition-colors min-w-[2ch]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="font-display italic text-secondary-foreground group-hover:text-foreground transition-colors"
                    style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.01em' }}
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </RevealSection>
        </section>
      )}

      {/* Timeline de Memórias */}
      {letter.memories && letter.memories.length > 0 && (
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-background pointer-events-none" />
          <RevealSection className="max-w-2xl mx-auto relative z-10">
            <p className="text-xs tracking-[0.3em] uppercase mb-20 text-center font-mono text-muted-foreground">
              Momentos que guardarei para sempre
            </p>

            <div className="relative">
              <div className="absolute w-px timeline-line" style={{ left: '19px', top: '8px', bottom: '8px' }} />

              <div className="flex flex-col">
                {letter.memories.map((memory, i) => (
                  <div
                    key={i}
                    className="relative flex gap-8 pb-12 cursor-pointer group"
                    onClick={() => setActiveMemory(activeMemory === i ? null : i)}
                  >
                    <div
                      className="relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 transition-all duration-300"
                      style={{
                        background: activeMemory === i ? 'var(--color-primary)' : 'var(--color-card)',
                        border: `1px solid ${activeMemory === i ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: activeMemory === i ? 'var(--color-background)' : 'var(--color-primary)' }} />
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 flex-1">
                      <span className="font-mono text-[0.65rem] text-muted-foreground tracking-[0.15em] uppercase">
                        {memory.date}
                      </span>
                      <h3
                        className="font-display italic transition-colors duration-300"
                        style={{ fontSize: '1.35rem', fontWeight: 400, color: activeMemory === i ? 'var(--color-primary)' : 'var(--color-foreground)' }}
                      >
                        {memory.label}
                      </h3>
                      <div
                        className="overflow-hidden transition-[max-height] duration-500 ease-out"
                        style={{ maxHeight: activeMemory === i ? '120px' : '0px' }}
                      >
                        <p className="mt-2 text-sm leading-relaxed text-secondary-foreground italic">
                          {memory.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </section>
      )}

      {/* Encerramento */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,160,122,0.07) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 vignette" />

        <RevealSection className="relative z-10 max-w-2xl flex flex-col items-center gap-8">
          <span className="text-xs tracking-[0.3em] uppercase font-mono text-muted-foreground">
            No fim e no começo
          </span>

          {letter.closing_quote && (
            <blockquote
              className="font-display italic text-foreground"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 300, lineHeight: 1.25, letterSpacing: '-0.02em' }}
              dangerouslySetInnerHTML={{ __html: letter.closing_quote.replace('\n', '<br />') }}
            />
          )}

          <div className="w-12 h-px mx-auto bg-primary opacity-50" />

          {letter.closing_message && (
            <p className="text-base leading-relaxed max-w-md text-secondary-foreground italic">
              {letter.closing_message}
            </p>
          )}

          <p className="font-display text-primary mt-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '0.02em', animation: 'pulse-glow 4s ease-in-out infinite' }}>
            EU TE AMO.
          </p>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center flex flex-col items-center gap-2 border-t border-border">
        <span className="text-xs tracking-[0.2em] uppercase font-mono" style={{ color: '#3a322a' }}>
          {letter.footer_text || 'feito com amor'}
        </span>
        {!letter.is_premium && (
          <a href="/" className="text-[10px] tracking-widest uppercase font-mono text-primary opacity-50 hover:opacity-100 hover:underline transition-opacity">
            Criado com Love Letter
          </a>
        )}
      </footer>

      {activePhoto !== null && photos[activePhoto] && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Foto ${activePhoto + 1} da galeria`} onClick={() => setActivePhoto(null)}>
          <button type="button" onClick={() => setActivePhoto(null)} aria-label="Fechar galeria" className="absolute right-5 top-5 z-10 rounded-full border border-border p-2 text-foreground hover:border-primary hover:text-primary"><X className="h-5 w-5" /></button>
          {photos.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto - 1 + photos.length) % photos.length); }} aria-label="Foto anterior" className="absolute left-3 md:left-8 rounded-full border border-border bg-card/80 p-2 text-foreground hover:border-primary hover:text-primary"><ChevronLeft className="h-6 w-6" /></button>}
          <img src={photos[activePhoto]} alt={`Momento ${activePhoto + 1} de ${letter.author_name} e ${letter.partner_name}`} className="max-h-[88vh] max-w-[calc(100vw-5rem)] rounded-sm object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          {photos.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto + 1) % photos.length); }} aria-label="Próxima foto" className="absolute right-3 md:right-8 rounded-full border border-border bg-card/80 p-2 text-foreground hover:border-primary hover:text-primary"><ChevronRight className="h-6 w-6" /></button>}
          <span className="absolute bottom-5 font-mono text-xs tracking-[0.2em] text-muted-foreground">{String(activePhoto + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
}
