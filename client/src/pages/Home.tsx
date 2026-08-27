/* Atelier refractado: editorial asimétrico, cristal matérico y luz celadón de refracción. */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Compass,
  Layers3,
  Menu,
  MoveUpRight,
  Sparkles,
  Stars,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const archetypes = [
  {
    name: "La visionaria",
    code: "01",
    tone: "El futuro, sin explicación.",
    signal: "Contraste · 68%",
    className: "visionary",
  },
  {
    name: "El arquitecto",
    code: "02",
    tone: "Forma, propósito, precisión.",
    signal: "Estructura · 82%",
    className: "architect",
  },
  {
    name: "La musa",
    code: "03",
    tone: "Una huella que permanece.",
    signal: "Ritmo · 74%",
    className: "muse",
  },
  {
    name: "La exploradora",
    code: "04",
    tone: "La curiosidad abre la silueta.",
    signal: "Textura · 61%",
    className: "explorer",
  },
];

const styleLenses = [
  ["Gestalt", "La lectura empieza por la silueta completa, no por una prenda aislada."],
  ["Armonía", "Color, proporción y textura se ordenan para que el ojo descanse."],
  ["Contexto", "La ocasión no limita: dirige la energía que quieres proyectar."],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const page = useRef<HTMLDivElement>(null);
  const [activeArchetype, setActiveArchetype] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from(".nav-entry", { y: -14, opacity: 0, duration: 0.72 })
        .from(".hero-kicker", { y: 14, opacity: 0, duration: 0.55 }, "-=0.3")
        .from(".hero-line", { y: 42, opacity: 0, duration: 0.82, stagger: 0.09 }, "-=0.32")
        .from(".hero-copy", { y: 18, opacity: 0, duration: 0.56 }, "-=0.38")
        .from(".hero-cta", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.3")
        .from(".hero-stage", { y: 24, opacity: 0, scale: 0.975, duration: 0.95 }, "-=0.72")
        .from(".orbit-chip", { y: 15, opacity: 0, scale: 0.96, duration: 0.45, stagger: 0.08 }, "-=0.52");

      gsap.to(".orbital-sheen", { xPercent: 20, yPercent: -8, duration: 6.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-float", { y: -10, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, page);

    return () => context.revert();
  }, []);

  function selectArchetype(index: number) {
    setActiveArchetype(index);
    toast(`${archetypes[index].name} activado`, {
      description: "La lectura de estilo se ha actualizado en esta demostración.",
    });
  }

  function showConceptToast() {
    toast("Espacio de composición", {
      description: "La experiencia de recomendación se conectaría aquí en la versión de producto.",
    });
  }

  return (
    <div ref={page} className="site-shell">
      <div className="site-noise" aria-hidden="true" />
      <header className="site-header nav-entry">
        <button className="brand" onClick={() => scrollToSection("inicio")} aria-label="Ir al inicio">
          <span className="brand-mark">
            <img src="/manus-storage/fashion-stylist-mark_524798e5.png" alt="" />
          </span>
          <span className="brand-name">FASHION<br />STYLIST <i>AI</i></span>
        </button>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <button onClick={() => scrollToSection("metodo")}>El método</button>
          <button onClick={() => scrollToSection("nichos")}>Perspectivas</button>
          <button onClick={() => scrollToSection("arquetipos")}>Arquetipos</button>
        </nav>
        <button className="nav-utility" onClick={showConceptToast}>
          Entrar <ArrowUpRight size={15} strokeWidth={1.7} />
        </button>
        <button className="menu-trigger" onClick={() => setIsMenuOpen((current) => !current)} aria-label="Abrir menú">
          <Menu size={20} />
        </button>
      </header>

      {isMenuOpen && (
        <div className="mobile-menu glass-panel">
          <button onClick={() => scrollToSection("metodo")}>El método</button>
          <button onClick={() => scrollToSection("nichos")}>Perspectivas</button>
          <button onClick={() => scrollToSection("arquetipos")}>Arquetipos</button>
        </div>
      )}

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-copy-block">
            <div className="hero-kicker eyebrow"><span className="pulse-dot" /> IA PARA LA IDENTIDAD VESTIMENTARIA</div>
            <h1 className="hero-title">
              <span className="hero-line">La intuición</span>
              <span className="hero-line serif-italic">vestida</span>
              <span className="hero-line">de método.</span>
            </h1>
            <p className="hero-copy">Descubre la lógica estética que existe detrás de lo que eliges. Fashion Stylist AI observa proporción, ritmo y energía para convertir tu intención en presencia.</p>
            <div className="hero-actions">
              <button className="primary-action hero-cta" onClick={() => setLocation("/studio")}>
                <span>Componer mi próximo look</span><ArrowDownRight size={18} />
              </button>
              <button className="text-action hero-cta" onClick={() => scrollToSection("metodo")}>Cómo interpreta el estilo <ChevronRight size={16} /></button>
            </div>
            <div className="hero-proof hero-cta">
              <div className="proof-avatars"><span>G</span><span>A</span><span>M</span></div>
              <p>Una forma más clara de<br /><strong>sentirte tú.</strong></p>
            </div>
          </div>

          <div className="hero-stage">
            <div className="stage-backdrop">
              <img src="/manus-storage/fashion-stylist-hero-glass_c6af5f5c.png" alt="Escultura editorial de cristal y seda" />
            </div>
            <div className="stage-prism orbital-sheen" />
            <div className="stage-grid" aria-hidden="true" />
            <div className="style-sequence glass-panel hero-float">
              <div className="sequence-top"><span className="eyebrow">LECTURA ACTIVA</span><CircleDot size={15} /></div>
              <div className="sequence-words"><span>Forma</span><i>·</i><span>Ritmo</span><i>·</i><span>Intención</span></div>
              <div className="sequence-track"><span /><span /><span /><span /><span /></div>
            </div>
            <div className="orbit-chip chip-gestalt"><Layers3 size={14} /> Unidad visual</div>
            <div className="orbit-chip chip-archetype"><Sparkles size={14} /> Arquetipo 03</div>
            <div className="orbit-chip chip-harmony"><Stars size={14} /> Armonía tonal</div>
            <div className="stage-caption"><span>ESTUDIO 01</span><span>—</span><span>RESONANCIA</span></div>
          </div>
        </section>

        <section className="method-section" id="metodo">
          <div className="method-intro">
            <span className="eyebrow section-label">01 / LA LECTURA</span>
            <h2>No pregunta <em>qué está de moda.</em><br />Pregunta qué debe sentirse <em>íntegro.</em></h2>
          </div>
          <div className="method-lenses">
            {styleLenses.map(([title, description], index) => (
              <article className="lens-card" key={title}>
                <div className="lens-number">0{index + 1}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="lens-line" />
              </article>
            ))}
          </div>
          <div className="gestalt-note glass-panel">
            <div className="note-symbol"><MoveUpRight size={22} /></div>
            <p>La Gestalt no es una regla: es la diferencia entre <strong>llevar piezas</strong> y <strong>proyectar una idea.</strong></p>
            <span className="note-index">Φ / 01</span>
          </div>
        </section>

        <section className="perspectives-section" id="nichos">
          <div className="section-heading">
            <div><span className="eyebrow section-label">02 / LOS NICHOS</span><h2>Una lectura para<br /><em>cada contexto.</em></h2></div>
            <p>El estilo no se reduce a una estética. Cambia según el entorno, tu repertorio y la historia que quieres abrir.</p>
          </div>
          <div className="perspective-layout">
            <article className="perspective-feature thick-glass-card">
              <div className="feature-visual"><img src="/manus-storage/fashion-stylist-look-celadon_f0a9179f.png" alt="Look editorial dentro de una cápsula de cristal" /></div>
              <div className="feature-content">
                <span className="eyebrow">CÓDIGO / 001</span>
                <h3>Vestir<br /><em>presencia.</em></h3>
                <p>Para el día a día que pide una decisión precisa: detalle suficiente para sostener tu energía, espacio suficiente para que aparezcas tú.</p>
                <button onClick={showConceptToast}>Explorar enfoque <ArrowUpRight size={16} /></button>
              </div>
            </article>
            <div className="perspective-stack">
              <article className="mini-perspective glass-panel">
                <div><Compass size={20} /><span className="eyebrow">DIRECCIÓN</span></div>
                <h3>Viaje y transición</h3>
                <p>Capas que se adaptan sin perder lectura.</p>
              </article>
              <article className="mini-perspective glass-panel">
                <div><WandSparkles size={20} /><span className="eyebrow">SINGULARIDAD</span></div>
                <h3>Evento y ceremonia</h3>
                <p>Un gesto memorable, sin disfraz.</p>
              </article>
              <div className="material-study"><img src="/manus-storage/fashion-stylist-detail-metal_775a2081.png" alt="Estudio de cristal, metal y luz celadón" /><span>ESTUDIO MATERIAL / 04</span></div>
            </div>
          </div>
        </section>

        <section className="archetypes-section" id="arquetipos">
          <div className="archetype-head">
            <div><span className="eyebrow section-label">03 / ARQUETIPOS</span><h2>Elige la energía<br />que hoy <em>conduce.</em></h2></div>
            <div className="archetype-description"><span className="eyebrow">SEÑAL ACTIVA</span><p>Los arquetipos no te encierran. Son una lente para decidir qué rasgo dejar al frente.</p></div>
          </div>
          <div className="archetype-grid">
            {archetypes.map((archetype, index) => (
              <button className={`archetype-card ${archetype.className} ${activeArchetype === index ? "is-active" : ""}`} key={archetype.name} onClick={() => selectArchetype(index)}>
                <span className="archetype-code">{archetype.code}</span>
                <span className="archetype-orb" />
                <span className="archetype-name">{archetype.name}</span>
                <span className="archetype-tone">{archetype.tone}</span>
                <span className="archetype-signal"><Check size={12} /> {archetype.signal}</span>
              </button>
            ))}
          </div>
          <div className="selected-archetype glass-panel">
            <span className="eyebrow">LECTURA SELECCIONADA</span>
            <strong>{archetypes[activeArchetype].name}</strong>
            <p>{archetypes[activeArchetype].tone} Tu próxima recomendación puede tomar este pulso como punto de partida.</p>
            <button className="small-round" onClick={showConceptToast} aria-label="Continuar con arquetipo seleccionado"><ArrowUpRight size={18} /></button>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-glow" aria-hidden="true" />
          <span className="eyebrow">UNA DECISIÓN, MÁS CLARA</span>
          <h2>Tu estilo ya existe.<br /><em>Vamos a volverlo visible.</em></h2>
          <button className="primary-action light-action" onClick={() => setLocation("/studio")}>Empezar mi lectura <ArrowDownRight size={18} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand footer-brand"><span className="brand-mark"><img src="/manus-storage/fashion-stylist-mark_524798e5.png" alt="" /></span><span className="brand-name">FASHION STYLIST <i>AI</i></span></div>
        <p>Una forma sensible de llegar a una decisión concreta.</p>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
