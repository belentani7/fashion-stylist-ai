"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent, type CSSProperties } from "react";
import {
  STORAGE_KEY, STORAGE_EVENT, STORAGE_UNAVAILABLE,
  addItem, updateItem, addOutfit, removeItem, removeOutfit, wearOutfit,
  totalInvestment, costPerWear, inspectLocalWardrobe,
  validateWardrobe, suggestOutfit,
  type WardrobeState, type Category, type Season, type Occasion,
} from "@/lib/wardrobe";

const COLORS = {
  Negro: "#25222a", Blanco: "#d8d8d8", Rojo: "#aa2540", Rosa: "#a65377",
  Azul: "#365475", Verde: "#416854", Beige: "#b6a18a", Gris: "#6b6e73",
  Morado: "#74507e", Marrón: "#645044", Dorado: "#af8a45", Plateado: "#88919e",
} as const;
const CATEGORY_LABEL: Record<Category, string> = {
  top: "Parte superior", bottom: "Parte inferior", dress: "Vestido / pieza completa",
  outerwear: "Abrigo / capa", shoes: "Calzado", accessory: "Accesorio",
};
const SEASON_LABEL: Record<Season, string> = { all: "Todo el año", warm: "Templado / cálido", cold: "Frío" };
const OCCASION_LABEL: Record<Occasion, string> = { daily: "Día a día", work: "Trabajo", event: "Evento", travel: "Viaje" };
type Color = keyof typeof COLORS;
type ItemDraft = { name: string; category: Category; color: Color; season: Season; price: string; notes: string };
const EMPTY_DRAFT: ItemDraft = { name: "", category: "top", color: "Negro", season: "all", price: "", notes: "" };

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(STORAGE_EVENT, notify);
  };
}
function snapshot(): string | null | typeof STORAGE_UNAVAILABLE {
  try { return localStorage.getItem(STORAGE_KEY); }
  catch { return STORAGE_UNAVAILABLE; }
}
function euro(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}
function downloaded(contents: string, filename: string, mime = "application/json;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function NataliaHome() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const load = useMemo(() => inspectLocalWardrobe(raw), [raw]);
  const wardrobe = load.state;
  const [item, setItem] = useState<ItemDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [lookName, setLookName] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("daily");
  const [season, setSeason] = useState<Season>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const listed = wardrobe.items.filter(x => filter === "all" || x.category === filter);
  const unused = wardrobe.items.filter(x => x.wears === 0).length;

  function persist(next: WardrobeState, confirmation: string, allowConfirmedRestore = false) {
    if (load.status === "invalid" && !allowConfirmedRestore) {
      setMessage("Guardado detenido: hay datos locales dañados. Descarga el original o restaura una copia válida.");
      return false;
    }
    if (load.status === "unavailable") {
      setStorageError(true);
      setMessage("No se puede leer el almacenamiento local. No se ha sobrescrito ningún dato.");
      return false;
    }
    try {
      // A second tab may have changed the wardrobe since this component rendered.
      // Refuse stale writes instead of overwriting those changes.
      if (localStorage.getItem(STORAGE_KEY) !== raw) {
        setMessage("El armario ha cambiado en otra pestaña. Revisa los datos antes de guardar de nuevo.");
        return false;
      }
      const valid = validateWardrobe(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      window.dispatchEvent(new Event(STORAGE_EVENT));
      setStorageError(false); setMessage(confirmation);
      return true;
    } catch {
      setStorageError(true);
      setMessage("Este navegador no ha permitido guardar los datos. Puedes comprobar el espacio y sus permisos.");
      return false;
    }
  }

  function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = item.name.trim();
    const price = Number(item.price || "0");
    if (name.length < 2 || !Number.isFinite(price) || price < 0 || price > 1_000_000) {
      setMessage("Revisa el nombre y el importe: deben ser válidos.");
      return;
    }
    const drafted = {
      id: editingId ?? crypto.randomUUID(), name, category: item.category,
      color: item.color, season: item.season, price,
      notes: item.notes.trim(), wears: 0, addedAt: new Date().toISOString(),
    };
    try {
      const result = editingId ? updateItem(wardrobe, drafted) : addItem(wardrobe, drafted);
      if (persist(result, editingId ? "Cambios guardados sin perder el historial de usos." : "Pieza añadida al armario privado.")) {
        setItem(EMPTY_DRAFT);
        setEditingId(null);
      }
    } catch {
      setMessage("No se pudo guardar la prenda. Revisa sus datos e inténtalo de nuevo.");
    }
  }

  function editItem(piece: WardrobeState["items"][number]) {
    setEditingId(piece.id);
    setItem({ name: piece.name, category: piece.category, color: piece.color as Color,
      season: piece.season, price: String(piece.price), notes: piece.notes });
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    document.getElementById("wardrobe-heading")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    document.getElementById("name")?.focus({ preventScroll: true });
  }

  function cancelEdit() {
    setEditingId(null);
    setItem(EMPTY_DRAFT);
    setMessage("Edición cancelada. No se modificó el armario.");
  }

  function dropItem(id: string, name: string) {
    if (!window.confirm(`¿Eliminar «${name}»? Se quitará también de los conjuntos donde aparezca.`)) return;
    if (persist(removeItem(wardrobe, id), "Pieza eliminada.")) {
      setSelected(previous => previous.filter(x => x !== id));
      if (editingId === id) cancelEdit();
    }
  }

  function toggleSelected(id: string) {
    setSelected(previous => previous.includes(id)
      ? previous.filter(x => x !== id) : [...previous, id].slice(0, 10));
  }

  function createLook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = lookName.trim();
    const itemIds = selected.filter(id => wardrobe.items.some(item => item.id === id));
    if (name.length < 2 || !itemIds.length) {
      setMessage("Da un nombre al conjunto y selecciona al menos una prenda.");
      return;
    }
    const result = addOutfit(wardrobe, {
      id: crypto.randomUUID(), name, occasion, itemIds, addedAt: new Date().toISOString(),
    });
    if (persist(result, "Conjunto guardado. Puedes registrar sus usos y calcular coste por uso.")) {
      setLookName(""); setSelected([]);
    }
  }

  function proposeLook() {
    const result = suggestOutfit(wardrobe, occasion, season);
    setSelected(result);
    setMessage(result.length
      ? "Selección local basada en categorías, temporada y prendas poco usadas. Revísala antes de guardar."
      : "Para una propuesta básica añade un vestido, o una prenda superior y otra inferior. Puedes combinar libremente.");
  }

  async function restore(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("Archivo demasiado grande");
      const parsed = JSON.parse(await file.text()) as unknown;
      const valid = validateWardrobe(parsed);
      if (!window.confirm("¿Sustituir todo el armario y los conjuntos locales por esta copia JSON? Exporta antes los datos que quieras conservar.")) return;
      if (persist(valid, "Copia restaurada y comprobada.", true)) {
        setSelected([]);
        setEditingId(null);
        setItem(EMPTY_DRAFT);
      }
    } catch {
      setMessage("La copia JSON es inválida o tiene una versión incompatible. No se modificó el armario.");
    }
  }

  return (
    <div>
      <a className="sr-only" href="#wardrobe">Saltar al armario</a>
      <div className="shell">
        <header className="nav">
          <a href="#" className="logo" aria-label="Natalia, volver al inicio">NATALIA</a>
          <nav className="navlinks" aria-label="Navegación principal">
            <a href="#wardrobe">Armario</a>
            <a href="#looks">Looks</a>
            <a href="#privacy">Privacidad</a>
            <a href="#wardrobe">Abrir estudio ↗</a>
          </nav>
        </header>
        {load.status === "invalid" && (
          <div className="notice" role="alert">
            <strong>Datos locales dañados: guardado bloqueado.</strong> No se ha borrado el original.
            Descarga su contenido antes de restaurar una copia JSON válida.
            {typeof raw === "string" && <button className="small-action" type="button"
              onClick={() => downloaded(raw, "natalia-datos-originales.txt", "text/plain;charset=utf-8")}>
              Descargar datos originales
            </button>}
          </div>
        )}
        {load.status === "unavailable" && (
          <p className="notice" role="alert">El navegador no permite leer el armario local. No se guardarán cambios hasta recuperar el acceso.</p>
        )}
        <main>
          <section className="hero" aria-labelledby="hero-heading">
            <div>
              <p className="eyebrow">NATALIA / PERSONAL STYLE STUDIO · 2026</p>
              <h1 id="hero-heading">Vístete como <em>tú decides.</em></h1>
              <p className="lede">Tu armario es una colección de posibilidades. Organiza tus prendas, crea looks, redescubre lo que ya tienes y toma decisiones de compra con más perspectiva. Sin medir cuerpos, sin juicios, sin etiquetas sobre quién deberías ser.</p>
              <div className="actions"><a className="btn primary" href="#wardrobe">Comenzar mi armario →</a><a className="btn" href="#looks">Crear un conjunto ↓</a></div>
              <p className="micro">Tu información permanece en este navegador. Sin fotos corporales, cuentas, pagos ni seguimiento.</p>
            </div>
            <div className="art" aria-label="Ilustración editorial abstracta del monograma Natalia y anillos luminosos">
              <div className="art-word" aria-hidden="true">N.</div>
              <div className="art-note">SELF-EXPRESSION / EVERY BODY / EVERY DAY</div>
            </div>
          </section>
          <section className="stats" aria-label="Estadísticas reales del armario">
            <div className="stat"><div className="value">{wardrobe.items.length}</div><div className="name">Piezas guardadas</div></div>
            <div className="stat"><div className="value">{wardrobe.outfits.length}</div><div className="name">Conjuntos creados</div></div>
            <div className="stat"><div className="value">{unused}</div><div className="name">Prendas sin uso registrado</div></div>
            <div className="stat"><div className="value">{euro(totalInvestment(wardrobe))}</div><div className="name">Inversión registrada</div></div>
          </section>
          <section className="section" id="wardrobe" aria-labelledby="wardrobe-heading">
            <div className="heading"><div><p className="eyebrow">01 / TU UNIVERSO</p><h2 id="wardrobe-heading">Armario, no algoritmo.</h2></div><p>Construye un inventario sin subir fotografías ni aceptar recomendaciones sobre tu cuerpo. Toda la información procede de lo que decides registrar.</p></div>
            <div className="workspace">
              <form className="panel" onSubmit={createItem}>
                <h3>{editingId ? "Editar una pieza" : "Añadir una pieza"}</h3><p>{editingId ? "Actualiza su descripción sin borrar las veces que la has usado." : "Cada prenda tiene historia. Empieza con lo que realmente llevas."}</p>
                <div className="field"><label htmlFor="name">Nombre de la prenda</label><input id="name" required minLength={2} maxLength={90} placeholder="Ej. Chaqueta negra vintage" value={item.name} onChange={e => setItem({ ...item, name: e.target.value })}/></div>
                <div className="field-grid">
                  <div className="field"><label htmlFor="category">Categoría</label><select id="category" value={item.category} onChange={e => setItem({...item,category:e.target.value as Category})}>{Object.entries(CATEGORY_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></div>
                  <div className="field"><label htmlFor="color">Color principal</label><select id="color" value={item.color} onChange={e => setItem({...item,color:e.target.value as Color})}>{Object.keys(COLORS).map(color=><option key={color}>{color}</option>)}</select></div>
                </div>
                <div className="field-grid">
                  <div className="field"><label htmlFor="season">Temporada</label><select id="season" value={item.season} onChange={e=>setItem({...item,season:e.target.value as Season})}>{Object.entries(SEASON_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></div>
                  <div className="field"><label htmlFor="price">Precio de compra (€)</label><input id="price" type="number" min="0" max="1000000" step="0.01" value={item.price} placeholder="0,00" onChange={e=>setItem({...item,price:e.target.value})}/></div>
                </div>
                <div className="field"><label htmlFor="notes">Una nota (opcional)</label><textarea id="notes" maxLength={360} value={item.notes} onChange={e=>setItem({...item,notes:e.target.value})} placeholder="Por qué te gusta, con qué te hace sentir bien…"/></div>
                <div className="actions"><button className="btn primary" type="submit">{editingId ? "Guardar cambios ✓" : "Guardar prenda +"}</button>{editingId && <button className="btn" type="button" onClick={cancelEdit}>Cancelar edición</button>}</div>
              </form>
              <div className="panel">
                <div className="heading" style={{marginBottom:18}}><div><h3>Tu colección</h3><p>Tu estilo no requiere un tamaño ni una forma prescrita.</p></div>
                  <label className="field" style={{margin:0}} htmlFor="filter"><span className="micro">Filtrar</span><select id="filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todas las categorías</option>{Object.entries(CATEGORY_LABEL).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
                </div>
                {listed.length ? (
                  <div className="catalog">{listed.map(piece=>(
                    <article className="garment" key={piece.id}>
                      <div className="swatch" style={{"--swatch":COLORS[piece.color as Color]||"#88657e"} as CSSProperties}><span>{CATEGORY_LABEL[piece.category]}</span></div>
                      <h4>{piece.name}</h4>
                      <p className="meta">{piece.color} · {SEASON_LABEL[piece.season]}<br/>{piece.wears} usos · {euro(piece.price)} invertidos</p>
                      {piece.notes && <p className="meta">{piece.notes}</p>}
                      <div className="garment-foot"><span className="meta">{costPerWear(piece) === null ? "Coste/uso pendiente" : euro(costPerWear(piece)!)+"/uso"}</span><div><button className="small-action" type="button" onClick={()=>editItem(piece)} aria-label={`Editar ${piece.name}`}>Editar</button><button className="small-action" type="button" onClick={()=>dropItem(piece.id,piece.name)} aria-label={`Eliminar ${piece.name}`}>Eliminar</button></div></div>
                    </article>
                  ))}</div>
                ) : <div className="empty">{wardrobe.items.length ? "No hay prendas de esta categoría." : "Tu armario comienza vacío. Añade una pieza real y empieza a construir tu historia de estilo."}</div>}
              </div>
            </div>
          </section>
          <section className="section" id="looks" aria-labelledby="looks-heading">
            <div className="heading"><div><p className="eyebrow">02 / LOOK ATELIER</p><h2 id="looks-heading">Una idea. Mil maneras.</h2></div><p>Crea combinaciones con tus propias prendas. Las propuestas automáticas son reglas locales por categoría, ocasión y temporada; no hay modelos de IA conectados.</p></div>
            <div className="look-maker">
              <form className="panel" onSubmit={createLook}>
                <h3>Diseña un look</h3>
                <div className="field"><label htmlFor="lookName">Nombre del conjunto</label><input id="lookName" placeholder="Ej. Mi look de viernes" maxLength={90} required value={lookName} onChange={e=>setLookName(e.target.value)}/></div>
                <div className="field-grid">
                  <div className="field"><label htmlFor="occasion">Ocasión</label><select id="occasion" value={occasion} onChange={e=>setOccasion(e.target.value as Occasion)}>{Object.entries(OCCASION_LABEL).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></div>
                  <div className="field"><label htmlFor="lookSeason">Temperatura</label><select id="lookSeason" value={season} onChange={e=>setSeason(e.target.value as Season)}>{Object.entries(SEASON_LABEL).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select></div>
                </div>
                <div className="field"><label>Elige las piezas (máximo 10)</label>
                  <div className="picker">{wardrobe.items.map(piece=>(
                    <label key={piece.id} className="check"><input type="checkbox" checked={selected.includes(piece.id)} onChange={()=>toggleSelected(piece.id)} disabled={!selected.includes(piece.id)&&selected.length>=10}/><span>{piece.name}<br/><small>{piece.color} · {CATEGORY_LABEL[piece.category]}</small></span></label>
                  ))}</div>
                </div>
                {!wardrobe.items.length && <p>Primero añade prendas al armario para combinarlas.</p>}
                <div className="actions"><button className="btn primary" type="submit" disabled={!selected.length}>Guardar look +</button><button className="btn" type="button" disabled={!wardrobe.items.length} onClick={proposeLook}>Sugerir combinación</button></div>
              </form>
              <div className="panel">
                <h3>Tu archivo de looks</h3><p>Puedes marcar cuándo utilizas un conjunto. Natalia actualizará el coste por uso de las piezas incluidas.</p>
                <div className="look-list">
                  {wardrobe.outfits.length ? wardrobe.outfits.map(look=>(
                    <article className="look" key={look.id}><div><span className="eyebrow">{OCCASION_LABEL[look.occasion]}</span><h4>{look.name}</h4><small>{look.itemIds.map(id=>wardrobe.items.find(x=>x.id===id)?.name).filter(Boolean).join(" · ")}</small></div>
                      <div className="look-actions"><button className="btn primary" type="button" onClick={()=>persist(wearOutfit(wardrobe,look.id),"Uso del conjunto registrado.")}>+ 1 uso</button>
                        <button className="small-action" type="button" onClick={()=>{if(confirm(`¿Eliminar el conjunto «${look.name}»?`))persist(removeOutfit(wardrobe,look.id),"Conjunto eliminado.");}}>Eliminar</button></div></article>
                  )) : <div className="empty">Aún no hay conjuntos guardados. Tu primera combinación puede partir de algo que ya te encanta.</div>}
                </div>
              </div>
            </div>
          </section>
          <section className="section privacy" id="privacy" aria-labelledby="privacy-heading">
            <div><p className="eyebrow">03 / PRIVACY BY DESIGN</p><h2 id="privacy-heading">Tu armario.<br/>Tus reglas.</h2><p>No necesitas medir tu cuerpo, fotografiarte ni revelar emociones para usar este estudio. El inventario y el historial de uso viven en este navegador; sin cookies de seguimiento, cuentas, compras o API externas. Los datos locales pueden perderse al borrar el almacenamiento: conserva una copia JSON cuando quieras.</p></div>
            <div className="panel"><h3>Tu información te pertenece.</h3><p>Exporta o restaura todas tus prendas y conjuntos mediante un archivo JSON validado. El importador solicita confirmación antes de sustituir los datos. Ningún fichero se sube a un servidor.</p>
              <div className="actions"><button className="btn primary" type="button" disabled={load.status === "invalid" || load.status === "unavailable"} onClick={()=>downloaded(JSON.stringify(wardrobe,null,2),"natalia-mi-armario.json")}>Exportar mi armario ↓</button>
                <label className="btn file-label">Restaurar copia JSON<input type="file" accept=".json,application/json" onChange={e=>{void restore(e.target.files?.[0]);e.target.value="";}}/></label></div>
              <p className="micro">El archivo exportado contiene los datos que tú hayas escrito; guárdalo en un lugar privado. Esta aplicación no certifica sostenibilidad ni estima tu salud, cuerpo o estado psicológico.</p>
            </div>
          </section>
        </main>
        {message && <div className="notice" role="status" aria-live="polite">{message}</div>}
        {storageError && <p className="notice" role="alert">El guardado local está deshabilitado. No se ha confirmado ningún cambio.</p>}
        <footer className="footer"><span>© 2026 NATALIA / PERSONAL STYLE STUDIO · BELENTANI</span><span>Autenticidad antes que tendencias · Privacidad antes que métricas · Tu estilo, tus decisiones.</span></footer>
      </div>
    </div>
  );
}
