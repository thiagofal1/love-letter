import React, { useState, useEffect, useRef } from 'react';
import type { LoveLetterData } from '../types/letter';
import { DEFAULT_LOVE_LETTER } from '../types/letter';
import { parseSpotifyUri } from '../spotify';

interface LoveLetterViewerProps {
  data?: LoveLetterData;
  isPreview?: boolean;
}

function useLiveCounter(startDateStr: string) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date(startDateStr);
    const validDate = isNaN(startDate.getTime()) ? new Date('2024-05-03T00:00:00') : startDate;

    const update = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - validDate.getTime());

      setElapsed({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  return elapsed;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('visible');
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`section-reveal visible ${className}`}>
      {children}
    </div>
  );
}

function CounterBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="counter-digit text-5xl md:text-7xl font-light leading-none"
        style={{ color: '#c9a07a' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span
        className="text-xs tracking-[0.25em] uppercase"
        style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
      >
        {label}
      </span>
    </div>
  );
}

export const LoveLetterViewer: React.FC<LoveLetterViewerProps> = ({
  data = DEFAULT_LOVE_LETTER
}) => {
  const letter = { ...DEFAULT_LOVE_LETTER, ...data };
  const counter = useLiveCounter(letter.relationship_start_date);
  const [activeMemory, setActiveMemory] = useState<number | null>(null);

  const marqueeText = Array(6).fill(letter.marquee_text || 'EU TE AMO · ').join('');
  const spotifyUri = letter.spotify_playlist_url ? parseSpotifyUri(letter.spotify_playlist_url) : null;
  const spotifyEmbedUrl = spotifyUri
    ? `https://open.spotify.com/embed/${spotifyUri.replace('spotify:', '').replace(':', '/')}`
    : null;

  return (
    <div className="relative min-h-screen" style={{ background: '#0d0a08', color: '#f0ebe3' }}>
      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(201,160,122,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 vignette" />

        <div className="absolute top-8 left-0 right-0 flex justify-center animate-fade-in delay-100">
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
          >
            Para {letter.partner_name} — com amor por {letter.author_name}
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-4xl">
          <p
            className="text-sm tracking-[0.25em] uppercase animate-fade-in delay-200"
            style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
          >
            Uma carta de amor viva
          </p>

          <h1
            className="animate-fade-in-up delay-300 leading-none"
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(3.5rem, 12vw, 9rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
            }}
          >
            <span className="gradient-text">{letter.hero_title}</span>
          </h1>

          {letter.hero_subtitle && (
            <h2
              className="animate-fade-in-up delay-500"
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                fontWeight: 300,
                color: '#f0ebe3',
                letterSpacing: '-0.01em',
              }}
            >
              {letter.hero_subtitle}
            </h2>
          )}

          {letter.hero_description && (
            <p
              className="max-w-md text-base leading-relaxed animate-fade-in delay-700"
              style={{ color: '#b8aa98', fontStyle: 'italic' }}
            >
              {letter.hero_description}
            </p>
          )}

          {/* Scroll cue */}
          <div className="animate-fade-in delay-1200 animate-float mt-4">
            <svg width="24" height="40" viewBox="0 0 24 40" fill="none" style={{ opacity: 0.4 }}>
              <rect x="1" y="1" width="22" height="38" rx="11" stroke="#c9a07a" strokeWidth="1.5" />
              <rect x="10.5" y="8" width="3" height="8" rx="1.5" fill="#c9a07a" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── LIVE COUNTER ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,160,122,0.04) 50%, transparent)' }}
        />
        <RevealSection className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <span
                className="text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
              >
                Juntos há
              </span>
              <span
                className="leading-none"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 'clamp(5rem, 20vw, 14rem)',
                  fontWeight: 700,
                  color: '#c9a07a',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {counter.days}
              </span>
              <span
                className="text-sm tracking-[0.2em] uppercase"
                style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
              >
                dias
              </span>
            </div>

            {/* Hours / Minutes / Seconds */}
            <div
              className="flex gap-4 md:gap-16 items-start px-6 md:px-8 py-6 rounded-sm"
              style={{ border: '1px solid #2a2318', background: 'rgba(22,18,14,0.6)' }}
            >
              <CounterBlock value={counter.hours} label="horas" />
              <div style={{ color: '#2a2318', fontSize: '3rem', fontFamily: 'Fraunces, serif', alignSelf: 'flex-start', marginTop: '0.25rem' }}>:</div>
              <CounterBlock value={counter.minutes} label="minutos" />
              <div style={{ color: '#2a2318', fontSize: '3rem', fontFamily: 'Fraunces, serif', alignSelf: 'flex-start', marginTop: '0.25rem' }}>:</div>
              <CounterBlock value={counter.seconds} label="segundos" />
            </div>

            <p
              className="text-base text-center max-w-sm"
              style={{ color: '#7a6e62', fontStyle: 'italic' }}
            >
              Cada segundo conta. Este aqui, inclusive.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ─── MARQUEE STRIP ─── */}
      <div
        className="py-5 overflow-hidden relative"
        style={{ borderTop: '1px solid #2a2318', borderBottom: '1px solid #2a2318', background: '#16120e' }}
      >
        <div className="marquee-track inline-block">
          <span
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#c9a07a',
              letterSpacing: '0.1em',
            }}
          >
            {marqueeText}
          </span>
        </div>
      </div>

      {/* ─── SPOTIFY PLAYER (Se fornecido) ─── */}
      {spotifyEmbedUrl && (
        <section className="py-16 px-6 max-w-2xl mx-auto">
          <RevealSection>
            <div className="rounded-lg overflow-hidden border border-[#2a2318]">
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

      {/* ─── DECLARATIONS ─── */}
      {letter.declarations && letter.declarations.length > 0 && (
        <section className="py-24 px-6">
          <RevealSection className="max-w-3xl mx-auto flex flex-col gap-0">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-16 text-center"
              style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
            >
              Coisas que sinto e nunca canso de dizer
            </p>
            {letter.declarations.map((text, i) => (
              <div
                key={i}
                className="py-6 md:py-8 group cursor-default"
                style={{
                  borderBottom: '1px solid #2a2318',
                  transition: 'padding-left 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <div className="flex items-center gap-6">
                  <span
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '0.65rem',
                      color: '#2a2318',
                      minWidth: '2ch',
                      transition: 'color 0.3s',
                    }}
                    className="group-hover:[color:#c9a07a]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 'clamp(1.4rem, 4vw, 2.5rem)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: '#b8aa98',
                      transition: 'color 0.4s, letter-spacing 0.4s',
                      letterSpacing: '-0.01em',
                    }}
                    className="group-hover:[color:#f0ebe3]"
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </RevealSection>
        </section>
      )}

      {/* ─── MEMORIES TIMELINE ─── */}
      {letter.memories && letter.memories.length > 0 && (
        <section className="py-24 px-6" style={{ background: '#0f0c09' }}>
          <RevealSection className="max-w-2xl mx-auto">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-20 text-center"
              style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
            >
              Momentos que guardarei para sempre
            </p>

            <div className="relative">
              <div
                className="absolute left-5 top-2 bottom-2 w-px timeline-line"
                style={{ left: '19px' }}
              />

              <div className="flex flex-col gap-0">
                {letter.memories.map((memory, i) => (
                  <div
                    key={i}
                    className="relative flex gap-8 pb-12 cursor-pointer group"
                    onClick={() => setActiveMemory(activeMemory === i ? null : i)}
                  >
                    <div
                      className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1"
                      style={{
                        background: activeMemory === i ? '#c9a07a' : '#16120e',
                        border: `1px solid ${activeMemory === i ? '#c9a07a' : '#2a2318'}`,
                        transition: 'all 0.3s',
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: activeMemory === i ? '#0d0a08' : '#c9a07a' }}
                      />
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 flex-1">
                      <span
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: '0.65rem',
                          color: '#7a6e62',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {memory.date}
                      </span>
                      <h3
                        style={{
                          fontFamily: 'Fraunces, serif',
                          fontSize: '1.35rem',
                          fontWeight: 400,
                          fontStyle: 'italic',
                          color: activeMemory === i ? '#c9a07a' : '#f0ebe3',
                          transition: 'color 0.3s',
                        }}
                      >
                        {memory.label}
                      </h3>
                      <div
                        style={{
                          maxHeight: activeMemory === i ? '120px' : '0px',
                          overflow: 'hidden',
                          transition: 'max-height 0.5s cubic-bezier(0.22,1,0.36,1)',
                        }}
                      >
                        <p
                          className="mt-2 text-sm leading-relaxed"
                          style={{ color: '#b8aa98', fontStyle: 'italic' }}
                        >
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

      {/* ─── CLOSING ─── */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,160,122,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 vignette" />

        <RevealSection className="relative z-10 max-w-2xl flex flex-col items-center gap-8">
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ fontFamily: 'DM Mono, monospace', color: '#7a6e62' }}
          >
            No fim e no começo
          </span>

          {letter.closing_quote && (
            <blockquote
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.25,
                color: '#f0ebe3',
                letterSpacing: '-0.02em',
              }}
              dangerouslySetInnerHTML={{ __html: letter.closing_quote.replace('\n', '<br />') }}
            />
          )}

          <div
            className="w-12 h-px mx-auto"
            style={{ background: '#c9a07a', opacity: 0.5 }}
          />

          {letter.closing_message && (
            <p className="text-base leading-relaxed max-w-md" style={{ color: '#b8aa98', fontStyle: 'italic' }}>
              {letter.closing_message}
            </p>
          )}

          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#c9a07a',
              letterSpacing: '0.02em',
              marginTop: '1rem',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }}
          >
            EU TE AMO.
          </p>
        </RevealSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-8 px-6 text-center flex flex-col items-center gap-2"
        style={{ borderTop: '1px solid #2a2318' }}
      >
        <span
          className="text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: 'DM Mono, monospace', color: '#3a322a' }}
        >
          {letter.footer_text || 'feito com amor · thigasfal.dev'}
        </span>
        {!letter.is_premium && (
          <a
            href="/"
            className="text-[10px] tracking-widest uppercase hover:underline opacity-50 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'DM Mono, monospace', color: '#c9a07a' }}
          >
            Criado com Love Letter SaaS
          </a>
        )}
      </footer>
    </div>
  );
};
