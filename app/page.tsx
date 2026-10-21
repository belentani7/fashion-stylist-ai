"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Color, Category, Climate, Expression, Occasion, Season,
  formatColor, costPerWear, parseWardrobe,
  type WardrobeItem, type Look,
} from "@/lib/styling";

const KEY = "natalia:wardrobe:v1";
const CHANGED = "natalia:wardrobe-changed";

const categories = [
  ["top", "Parte superior"], ["bottom", "Parte inferior"], ["dress", "Vestido o pieza única"],
  ["outerwear", "Abrigo o capa"], ["footwear", "Calzado"], ["accessory", "Accesorio"],
] as const;
const colors = [
  ["black", "Negro"], ["white", "Blanco"], ["cream", "Crema"], ["grey", "Gris"],
  ["navy", "Azul marino"], ["denim", "Denim"], ["brown", "Marrón"], ["red", "Rojo"],
  ["pink", "Rosa"], ["blue", "Azul"], ["green", "Verde"], ["yellow", "Amarillo"],
  ["purple", "Morado"],
] as const;
const paints: Record<WardrobeItem["color"], string> = {
  black: "#202127", white: "#fff", cream: "#eee2cc", grey: "#969ba3",
  navy: "#252e56", denim: "#5a80af", brown: "#79513f", red: "#ae4653",
  pink: "#eab0c4", blue: "#3d7eb4", green: "#56836a", yellow: "#e4c879", purple: "#805eaa",
};

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(CHANGED, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(CHANGED, notify);
  };
}
function snapshot() {
  try { return window.localStorage.getItem(KEY) ?? "[]"; }
  catch { return "[]"; }
}
function write(items: WardrobeItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGED));
    return true;
  } catch { return false; }
}
function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "");
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function NataliaHome() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const items = useMemo(() => parseWardrobe(raw), [raw]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<WardrobeItem["category"]>("top");
  const [color, setColor] = useState<WardrobeItem["color"]>("black");
  const [season, setSeason] = useState<WardrobeItem["season"]>("all");
  const [cost, setCost] = useState("");
  const [occasion, setOccasion] = useState<"everyday" | "work" | "evening" | "celebration">("everyday");
  const [expression, setExpression] = useState<"calm" | "bold" | "minimal">("calm");
  const [climate, setClimate] = useState<"warm" | "mild" | "cool">("mild");
  const [looks, setLooks] = useState<Look[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const persist = (updated: WardrobeItem[]) => {
    if (!write(updated)) {
      setError("El navegador no permite guardar este armario. Puedes exportar una copia cuando lo hayas creado.");
      return false;
    }
    setLooks([]);
    setMissing([]);
    setError("");
    return true;
  };

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = name.trim();
    if (clean.length < 2 || clean.length > 60) {
      setError("La prenda necesita un nombre de entre 2 y 60 caracteres.");
      return;
    }
    if (items.length >= 80) {
      setError("Este armario local admite hasta 80 prendas.");
      return;
    }
    const parsedCost = cost.trim() === "" ? null : Number(cost);
    if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0 || parsedCost > 50000)) {
      setError("Escribe un coste válido no negativo o déjalo vacío.");
      return;
    }
    const next: WardrobeItem = {
      id: newId(), name: clean, category, color, season,
      cost: parsedCost, wears: 0,
    };
    if (persist([...items, next])) {
      setName("");
      setCost("");
      setNotice("Prenda añadida a tu armario.");
    }
  };

  const generate = async () => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, occasion, expression, climate }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== "object" ||
          !Array.isArray((data as { looks?: unknown }).looks) ||
          !Array.isArray((data as { missing?: unknown }).missing)) {
        throw new Error("No se pudo crear una propuesta. Comprueba que la aplicación esté conectada a su propio servidor.");
      }
      const result = data as { looks: Look[]; missing: string[] };
      setLooks(result.looks);
      setMissing(result.missing);
      setNotice(result.looks.length
        ? "Propuestas creadas con tus propias prendas, sin compras obligatorias."
        : "Todavía faltan algunas categorías para preparar conjuntos completos.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear una propuesta.");
    } finally {
      setBusy(false);
    }
  };

  const markWorn = (look: Look) => {
    const ids = new Set(look.itemIds);
    const updated = items.map(item => ids.has(item.id)
      ? { ...item, wears: Math.min(100000, item.wears + 1) }
      : item);
    if (persist(updated)) setNotice("Uso registrado. Se han actualizado los costes por uso de las prendas.");
  };

  const restore = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      if (file.size > 45000) throw new Error("La copia excede el tamaño permitido.");
      const rawFile = await file.text();
      const parsed = parseWardrobe(rawFile);
      const original: unknown = JSON.parse(rawFile);
      if (!Array.isArray(original) || parsed.length !== original.length)
        throw new Error("Esta copia no contiene un armario válido.");
      if (!window.confirm("¿Sustituir el armario actual por el del archivo? Se perderán las modificaciones no exportadas.")) return;
      if (persist(parsed)) setNotice("Copia local restaurada.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo importar el archivo.");
    }
  };

  return (
    <main id="inicio">
      <a className="skip-link" href="#armario">Ir al armario</a>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Natalia Studio — inicio">
          <span className="brand-mark" aria-hidden="true">N.</span>
          <span>NATALIA <small>STUDIO / 2026</small></span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#filosofia">Filosofía</a>
          <a href="#armario">Mi armario</a>
          <a href="#looks">Crear conjuntos</a>
          <a href="#privacidad">Privacidad</a>
        </nav>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">PERSONAL STYLE / WARDROBE INTELLIGENCE</p>
          <h1 id="hero-title">La mejor prenda es <em>la que te hace sentir tú.</em></h1>
          <p className="lead">Un estudio personal para descubrir nuevas combinaciones con la ropa que ya tienes. Sin juicios, sin comparaciones, sin compras forzadas.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#armario">Abrir mi armario <span aria-hidden="true">↗</span></a>
            <a className="button button-secondary" href="#filosofia">Conocer Natalia ↓</a>
          </div>
          <p className="hero-caption">Primera versión funcional · Criterio transparente · Sin análisis de cuerpo ni fotografías</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="art-frame">
            <span className="art-series">NATALIA · THE WARDROBE STUDY</span>
            <span className="art-big">N</span>
            <div className="art-stripe"/>
            <p>NOT A BODY STANDARD.<br/>A PERSONAL LANGUAGE.</p>
          </div>
          <span className="art-float">01 / YOUR STYLE</span>
        </div>
      </section>

      <section id="filosofia" className="philosophy">
        <div className="wrap philosophy-inner">
          <div><p className="eyebrow">01 / MANIFIESTO</p><h2>Vestir no debería ser una prueba que superar.</h2></div>
          <div className="philosophy-copy">
            <p>La talla no determina el estilo. Tu armario es una colección de posibilidades, no una lista de errores. Aquí tú decides qué piezas te representan, qué quieres repetir y qué guardar para otro día.</p>
            <p>Las sugerencias se forman a partir de categorías, colores y ocasiones. No se infiere tu género, aspecto físico, edad, personalidad ni estado emocional.</p>
          </div>
        </div>
      </section>

      <section id="armario" className="wrap wardrobe-section" aria-labelledby="wardrobe-title">
        <div className="section-head">
          <p className="eyebrow">02 / ARCHIVO PERSONAL</p>
          <h2 id="wardrobe-title">Tu armario, de verdad.</h2>
          <p>Registra únicamente las prendas que ya tienes. Los datos se guardan en tu navegador y puedes llevártelos o borrarlos.</p>
        </div>
        <div className="workspace-grid">
          <form onSubmit={add} className="editor-panel">
            <p className="panel-overline">AGREGAR UNA PRENDA</p>
            <label htmlFor="item-name">Cómo la llamas</label>
            <input id="item-name" value={name} onChange={e => setName(e.target.value)} maxLength={60} minLength={2} placeholder="Camisa blanca de lino" required/>
            <div className="field-grid">
              <div><label htmlFor="item-category">Categoría</label>
                <select id="item-category" value={category} onChange={e => setCategory(Category.parse(e.target.value))}>
                  {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></div>
              <div><label htmlFor="item-color">Color</label>
                <select id="item-color" value={color} onChange={e => setColor(Color.parse(e.target.value))}>
                  {colors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></div>
              <div><label htmlFor="item-season">Temporada</label>
                <select id="item-season" value={season} onChange={e => setSeason(Season.parse(e.target.value))}>
                  <option value="all">Todo el año</option><option value="warm">Calor</option><option value="cool">Frío</option>
                </select></div>
              <div><label htmlFor="item-cost">Coste (€) · opcional</label>
                <input id="item-cost" value={cost} onChange={e => setCost(e.target.value)} placeholder="0,00" inputMode="decimal" type="number" min={0} max={50000} step="0.01"/></div>
            </div>
            <button className="button button-primary form-submit" type="submit">Añadir al armario +</button>
            <p className="small-note">No necesitamos subir fotos ni datos sobre tu cuerpo.</p>
          </form>
          <div className="inventory-panel" aria-label="Mis prendas">
            <div className="inventory-title"><h3>Prendas registradas</h3><span>{items.length} / 80</span></div>
            {items.length === 0 ? (
              <div className="empty-state"><strong>Tu colección empieza contigo.</strong><p>Añade una parte superior, una inferior y un calzado; o un vestido y un calzado. No inventamos prendas ni catálogos.</p></div>
            ) : (
              <ul className="inventory-list">
                {items.map(item => {
                  const cpw = costPerWear(item);
                  return (
                    <li key={item.id} className="inventory-row">
                      <span className="color-dot" style={{ backgroundColor: paints[item.color] }} aria-hidden="true"/>
                      <div className="inventory-details"><strong>{item.name}</strong>
                        <span>{categories.find(x => x[0] === item.category)?.[1]} · {formatColor(item.color)} · {item.wears} usos</span>
                        <small>{item.cost == null ? "Sin coste registrado" : cpw == null ? "Coste por uso pendiente" : cpw.toLocaleString("es-ES", {style:"currency",currency:"EUR"}) + " / uso"}</small>
                      </div>
                      <button aria-label={"Eliminar " + item.name} className="row-delete" type="button" onClick={() => {
                        if (confirm("¿Eliminar esta prenda de tu armario?")) persist(items.filter(x => x.id !== item.id));
                      }}>×</button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="inventory-actions">
              <button className="text-button" type="button" onClick={() => download("natalia-armario.json", JSON.stringify(items, null, 2))}>Exportar JSON ↓</button>
              <label className="text-button upload-label">Importar copia
                <input type="file" accept=".json,application/json" onChange={e => {
                  void restore(e.target.files?.[0]); e.target.value = "";
                }}/>
              </label>
              <button className="text-button danger" type="button" onClick={() => {
                if (confirm("¿Borrar todas las prendas locales? Esta acción no puede deshacerse.")) persist([]);
              }}>Borrar armario</button>
            </div>
          </div>
        </div>
      </section>

      <section id="looks" className="looks-section" aria-labelledby="looks-title">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">03 / COMPOSICIÓN</p>
            <h2 id="looks-title">Construye posibilidades, no reglas.</h2>
            <p>Selecciona la ocasión y cómo te apetece expresarte. El motor devuelve hasta tres combinaciones con tus prendas reales, sin recomendar compras.</p>
          </div>
          <div className="look-controls">
            <div><label htmlFor="occasion">Ocasión</label>
              <select id="occasion" value={occasion} onChange={e => setOccasion(Occasion.parse(e.target.value))}>
                <option value="everyday">Día a día</option><option value="work">Trabajo</option>
                <option value="evening">Noche</option><option value="celebration">Celebración</option>
              </select></div>
            <div><label htmlFor="expression">Expresión</label>
              <select id="expression" value={expression} onChange={e => setExpression(Expression.parse(e.target.value))}>
                <option value="calm">Serena</option><option value="bold">Expresiva</option><option value="minimal">Minimal</option>
              </select></div>
            <div><label htmlFor="climate">Condiciones</label>
              <select id="climate" value={climate} onChange={e => setClimate(Climate.parse(e.target.value))}>
                <option value="mild">Templado</option><option value="warm">Calor</option><option value="cool">Frío</option>
              </select></div>
            <button type="button" className="button button-primary" onClick={() => void generate()} disabled={busy}>
              {busy ? "Componiendo…" : "Proponer conjuntos ↗"}
            </button>
          </div>
          <div aria-live="polite" className="message-stack">
            {notice && <p className="status-note">{notice}</p>}
            {error && <p className="error-note" role="alert">{error}</p>}
          </div>
          {missing.length > 0 && <p className="missing-note">Para completar un conjunto según el armario actual falta: {missing.join(", ")}.</p>}
          <div className="looks-grid">
            {looks.map(look => (
              <article className="look-card" key={look.id}>
                <span className="eyebrow">LOOK / {look.id.slice(-1)}</span>
                <h3>{look.title}</h3>
                <p>{look.reason}</p>
                <div className="look-chips">
                  {look.itemIds.map(id => {
                    const item = items.find(x => x.id === id);
                    if (!item) return null;
                    return <span key={id}><i style={{backgroundColor:paints[item.color]}} aria-hidden="true"/>{item.name}</span>;
                  })}
                </div>
                <p className="look-note">{look.notes.join(" ")}</p>
                <button className="button button-secondary" type="button" onClick={() => markWorn(look)}>Hoy lo he usado +</button>
              </article>
            ))}
          </div>
          {!looks.length && !busy && <div className="look-placeholder">Tu próximo conjunto puede estar ya en tu armario. Registra prendas y pulsa «Proponer conjuntos».</div>}
        </div>
      </section>

      <section id="privacidad" className="wrap trust-section">
        <div><p className="eyebrow">04 / PRINCIPIOS</p><h2>La confianza también se diseña.</h2></div>
        <div><p>Las prendas permanecen en <strong>localStorage</strong> de tu navegador. Cuando pides combinaciones, solo se transmiten al servidor los nombres, categorías, colores y preferencias necesarios para responder; no se guardan allí. No hay seguimiento, pagos, análisis visual, certificaciones ni afiliados activos.</p>
          <p>Esta primera versión ofrece curación determinista, <strong>no un modelo de IA generativa conectado</strong>. La fotografía, el reconocimiento de voz, la comunidad y las cuentas son integraciones futuras y no se presentan como funciones operativas.</p>
          <p>Puedes exportar y borrar tus datos sin iniciar sesión. Usa nombres de prendas genéricos, no información personal sensible.</p>
        </div>
      </section>
      <footer className="footer wrap"><span>NATALIA STUDIO / BELENTANI · 2026</span><span>Wear what you have. Become who you are.</span></footer>
    </main>
  );
}
