/* Atelier refractado en formato producto: un estudio personal para intención, armario y conversación. */
import { FormEvent, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowUpRight, BookOpen, Check, ChevronRight, CirclePlus, Eye, Layers3, Loader2, LockKeyhole, LogIn, MessageCircle, Palette, Plus, ShieldCheck, Shirt, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import type { Message } from "@/components/AIChatBox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const archetypes = ["La visionaria", "El arquitecto", "La musa", "La exploradora"];
const energyOptions = ["Presencia serena", "Contraste decidido", "Ritmo expresivo", "Claridad esencial"];
const paletteOptions = ["Neutros refractados", "Celadón e hielo", "Tierra mineral", "Óxido y tinta"];
const AIChatBox = lazy(() => import("@/components/AIChatBox").then((module) => ({ default: module.AIChatBox })));

const starterMessages: Message[] = [
  { role: "assistant", content: "Estoy lista para componer contigo. Cuéntame la ocasión, la energía que quieres proyectar o la prenda desde la que quieres partir." },
];

export default function WardrobeStudio() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [profileMode, setProfileMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [form, setForm] = useState({ archetype: archetypes[0], energy: energyOptions[0], palette: paletteOptions[0], notes: "" });
  const [garment, setGarment] = useState({ name: "", itemType: "", primaryColor: "", material: "", season: "", tags: "" });
  const [fieldErrors, setFieldErrors] = useState({ notes: "", garmentName: "", garmentType: "" });

  const profileQuery = trpc.style.profile.useQuery(undefined, { enabled: isAuthenticated });
  const wardrobeQuery = trpc.wardrobe.list.useQuery(undefined, { enabled: isAuthenticated });
  const privacyQuery = trpc.privacy.status.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        archetype: profileQuery.data.archetype ?? archetypes[0],
        energy: profileQuery.data.energy ?? energyOptions[0],
        palette: profileQuery.data.palette ?? paletteOptions[0],
        notes: profileQuery.data.notes ?? "",
      });
    }
  }, [profileQuery.data]);

  const saveProfile = trpc.style.saveProfile.useMutation({
    onSuccess: () => {
      utils.style.profile.invalidate();
      setProfileMode(false);
      toast.success("Tu lectura de estilo está guardada.");
    },
    onError: (error) => toast.error(error.message),
  });

  const addGarment = trpc.wardrobe.add.useMutation({
    onSuccess: () => {
      utils.wardrobe.list.invalidate();
      setGarment({ name: "", itemType: "", primaryColor: "", material: "", season: "", tags: "" });
      setAddMode(false);
      toast.success("La prenda ya forma parte de tu armario.");
    },
    onError: (error) => toast.error(error.message),
  });

  const chat = trpc.stylist.reply.useMutation({
    onSuccess: (data) => setMessages((current) => [...current, { role: "assistant", content: data.reply }]),
    onError: (error) => toast.error(error.message),
  });

  const grantPrivacy = trpc.privacy.grant.useMutation({
    onSuccess: () => {
      utils.privacy.status.invalidate();
      toast.success("La personalización está activada.");
    },
    onError: (error) => toast.error(error.message),
  });

  const revokePrivacy = trpc.privacy.revoke.useMutation({
    onSuccess: () => {
      utils.privacy.status.invalidate();
      toast("La personalización está pausada.", { description: "No se guardarán nuevas señales ni se enviarán nuevas consultas al estilista." });
    },
    onError: (error) => toast.error(error.message),
  });

  const greeting = useMemo(() => user?.name?.split(" ")[0] ?? "", [user?.name]);

  function requireSession() {
    if (isAuthenticated) return true;
    toast("Tu estudio personal necesita una sesión", { description: "Inicia sesión para guardar perfil, prendas y recomendaciones." });
    startLogin();
    return false;
  }

  function requireConsent() {
    if (!requireSession()) return false;
    if (privacyQuery.data?.isActive) return true;
    toast("Primero confirma cómo se usarán tus datos", { description: "El control está visible en la parte superior de tu Studio." });
    return false;
  }

  function handleProfile(event: FormEvent) {
    event.preventDefault();
    if (!requireConsent()) return;
    if (form.notes.trim().length > 500) {
      setFieldErrors((current) => ({ ...current, notes: "La nota puede tener un máximo de 500 caracteres." }));
      return;
    }
    setFieldErrors((current) => ({ ...current, notes: "" }));
    saveProfile.mutate(form);
  }

  function handleGarment(event: FormEvent) {
    event.preventDefault();
    if (!requireConsent()) return;
    const garmentName = garment.name.trim();
    const garmentType = garment.itemType.trim();
    const nextErrors = {
      notes: fieldErrors.notes,
      garmentName: garmentName.length >= 2 ? "" : "Indica un nombre de al menos 2 caracteres.",
      garmentType: garmentType.length >= 2 ? "" : "Indica un tipo de prenda de al menos 2 caracteres.",
    };
    setFieldErrors(nextErrors);
    if (nextErrors.garmentName || nextErrors.garmentType) return;
    addGarment.mutate({ ...garment, name: garmentName, itemType: garmentType });
  }

  function handleChat(content: string) {
    if (!requireConsent()) return;
    if (content.trim().length > 2200) {
      toast.error("Mantén cada consulta por debajo de 2.200 caracteres.");
      return;
    }
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    chat.mutate({ messages: next.map(({ role, content: messageContent }) => ({ role: role === "assistant" ? "assistant" as const : "user" as const, content: messageContent })) });
  }

  return (
    <div className="studio-shell">
      <div className="studio-grain" aria-hidden="true" />
      <header className="studio-topbar">
        <Link href="/" className="studio-back"><ArrowLeft size={17} /> Volver al manifiesto</Link>
        <button className="studio-brand" onClick={() => setLocation("/")}><span className="studio-symbol"><img src="/manus-storage/fashion-stylist-mark_524798e5.png" alt="" /></span><span>FASHION STYLIST <i>AI</i></span></button>
        {loading ? <Loader2 className="spin-muted" size={17} /> : isAuthenticated ? <span className="studio-user"><span>{greeting.slice(0, 1).toUpperCase()}</span>{greeting || "Tu espacio"}</span> : <button className="login-action" onClick={startLogin}><LogIn size={15} /> Iniciar sesión</button>}
      </header>

      <main className="studio-main">
        <section className="studio-hero">
          <div>
            <span className="eyebrow studio-eyebrow"><span className="pulse-dot" /> ESTUDIO PERSONAL</span>
            <h1>Una decisión.<br /><em>Una presencia.</em></h1>
            <p>Tu espacio para traducir intención en una propuesta de estilo que tenga unidad, dirección y sentido.</p>
          </div>
          <div className="studio-signal glass-panel"><span className="eyebrow">SEÑAL DEL DÍA</span><strong>{profileQuery.data?.energy ?? "Tu lectura comienza aquí"}</strong><span>{profileQuery.data?.palette ?? "Define tu energía y paleta"}</span></div>
        </section>

        {isAuthenticated && !privacyQuery.isLoading && !privacyQuery.data?.isActive && (
          <section className="privacy-notice" aria-labelledby="privacy-title">
            <div className="privacy-icon"><ShieldCheck size={19} /></div>
            <div className="privacy-copy"><span className="eyebrow">CONTROL DE DATOS</span><h2 id="privacy-title">Tú decides cuándo empieza la personalización.</h2><p>Al activarla, guardaremos tu perfil y tu catálogo, y enviaremos únicamente tus consultas de estilo al asistente para generar recomendaciones. No hay análisis fotográfico, sincronización móvil ni procesos automáticos activos en esta versión.</p></div>
            <button className="privacy-accept" onClick={() => grantPrivacy.mutate()} disabled={grantPrivacy.isPending}>{grantPrivacy.isPending ? <Loader2 size={16} className="spin-muted" /> : <Check size={16} />} Aceptar y personalizar</button>
          </section>
        )}

        <section className="studio-grid">
          <article className="studio-card profile-card">
            <div className="card-label"><div><Palette size={16} /><span className="eyebrow">01 / PERFIL DE ESTILO</span></div><button onClick={() => { if (requireSession()) setProfileMode((current) => !current); }}>{profileMode ? "Cerrar" : "Editar"}</button></div>
            {profileMode ? (
              <form className="profile-form" onSubmit={handleProfile}>
                <label>Arquetipo<select value={form.archetype} onChange={(event) => setForm({ ...form, archetype: event.target.value })}>{archetypes.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Energía<select value={form.energy} onChange={(event) => setForm({ ...form, energy: event.target.value })}>{energyOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Paleta<select value={form.palette} onChange={(event) => setForm({ ...form, palette: event.target.value })}>{paletteOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="wide-label">Nota personal<Textarea aria-invalid={Boolean(fieldErrors.notes)} aria-describedby={fieldErrors.notes ? "profile-notes-error" : undefined} value={form.notes} onChange={(event) => { setForm({ ...form, notes: event.target.value }); setFieldErrors((current) => ({ ...current, notes: "" })); }} placeholder="Ej.: prefiero líneas amplias, trabajo híbrido, quiero reutilizar más." maxLength={500} /></label>
                {fieldErrors.notes && <p className="field-error wide-label" id="profile-notes-error" role="alert">{fieldErrors.notes}</p>}
                <button className="studio-primary" disabled={saveProfile.isPending}>{saveProfile.isPending ? <Loader2 size={16} className="spin-muted" /> : <Check size={16} />} Guardar lectura</button>
              </form>
            ) : (
              <div className="profile-display">
                <div className="profile-orb"><span /></div>
                <div><strong>{profileQuery.data?.archetype ?? "Aún por definir"}</strong><p>{profileQuery.data ? `${profileQuery.data.energy} · ${profileQuery.data.palette}` : "Define tres señales para dar contexto a las recomendaciones."}</p></div>
                <button className="circle-action" onClick={() => { if (requireSession()) setProfileMode(true); }} aria-label="Editar perfil"><ChevronRight size={18} /></button>
              </div>
            )}
          </article>

          <article className="studio-card wardrobe-card">
            <div className="card-label"><div><Shirt size={16} /><span className="eyebrow">02 / MI ARMARIO</span></div><button onClick={() => { if (requireSession()) setAddMode((current) => !current); }}><CirclePlus size={16} /> Añadir</button></div>
            {addMode && <form className="garment-form" onSubmit={handleGarment}>
              <div><Input required aria-invalid={Boolean(fieldErrors.garmentName)} aria-describedby={fieldErrors.garmentName ? "garment-name-error" : undefined} value={garment.name} onChange={(event) => { setGarment({ ...garment, name: event.target.value }); setFieldErrors((current) => ({ ...current, garmentName: "" })); }} placeholder="Nombre de la prenda" />{fieldErrors.garmentName && <p className="field-error" id="garment-name-error" role="alert">{fieldErrors.garmentName}</p>}</div>
              <div><Input required aria-invalid={Boolean(fieldErrors.garmentType)} aria-describedby={fieldErrors.garmentType ? "garment-type-error" : undefined} value={garment.itemType} onChange={(event) => { setGarment({ ...garment, itemType: event.target.value }); setFieldErrors((current) => ({ ...current, garmentType: "" })); }} placeholder="Tipo: blazer, pantalón…" />{fieldErrors.garmentType && <p className="field-error" id="garment-type-error" role="alert">{fieldErrors.garmentType}</p>}</div>
              <Input value={garment.primaryColor} onChange={(event) => setGarment({ ...garment, primaryColor: event.target.value })} placeholder="Color principal" />
              <Input value={garment.material} onChange={(event) => setGarment({ ...garment, material: event.target.value })} placeholder="Material" />
              <Input value={garment.season} onChange={(event) => setGarment({ ...garment, season: event.target.value })} placeholder="Temporada" />
              <button className="studio-primary" disabled={addGarment.isPending}>{addGarment.isPending ? <Loader2 size={16} className="spin-muted" /> : <Plus size={16} />} Guardar prenda</button>
            </form>}
            {!addMode && <div className="wardrobe-list">
              {wardrobeQuery.isLoading ? <Loader2 className="spin-muted" size={18} /> : wardrobeQuery.data?.length ? wardrobeQuery.data.slice(0, 4).map((item) => <div className="garment-row" key={item.id}><span className="garment-icon"><Layers3 size={15} /></span><div><strong>{item.name}</strong><p>{[item.itemType, item.primaryColor, item.material].filter(Boolean).join(" · ")}</p></div><ArrowUpRight size={14} /></div>) : <div className="wardrobe-empty"><BookOpen size={22} /><p>Tu catálogo todavía está vacío. Empieza por una pieza que ya te represente.</p><button onClick={() => { if (requireSession()) setAddMode(true); }}>Registrar la primera prenda <ArrowUpRight size={14} /></button></div>}
            </div>}
          </article>
        </section>

        <section className="conversation-section">
          <div className="conversation-intro"><span className="eyebrow studio-eyebrow">03 / CONVERSACIÓN</span><h2>Háblame de<br /><em>tu próximo contexto.</em></h2><p>Una recomendación útil parte de lo que tienes, de lo que viene y de cómo quieres habitarlo.</p><div className="conversation-pills"><span><WandSparkles size={14} /> Gestalt aplicada</span><span><Sparkles size={14} /> Arquetipos</span><span><MessageCircle size={14} /> Sin fórmulas vacías</span></div></div>
          <div className="stylist-chat"><Suspense fallback={<div className="chat-loading"><Loader2 className="spin-muted" size={20} /> Preparando tu espacio de conversación…</div>}><AIChatBox messages={messages} onSendMessage={handleChat} isLoading={chat.isPending} height="510px" placeholder="Ej.: Tengo una cena informal y quiero verme serena, no rígida…" emptyStateMessage="Dime para qué quieres vestirte." suggestedPrompts={["Tengo una reunión importante y quiero sentirme firme.", "Ayúdame a elegir una silueta para una cena informal.", "¿Cómo puedo crear más unidad en un look con negro y celadón?"]} /></Suspense></div>
        </section>

        <section className="studio-footer-cta"><div><span className="eyebrow">SIGUIENTE CAPA</span><h2>Fotografía tus prendas.<br /><em>Deja que el armario aprenda.</em></h2></div><div><p>El modelo de datos ya admite referencias seguras a imágenes. La captura y análisis visual se incorporan como el siguiente flujo nativo, sin falsear resultados.</p><button className="studio-outline" onClick={() => toast("Captura visual", { description: "El módulo de análisis fotográfico se habilitará al completar su flujo seguro de carga." })}>Ver hoja de ruta <ArrowUpRight size={17} /></button></div></section>
        {isAuthenticated && privacyQuery.data?.isActive && <section className="privacy-summary" aria-label="Resumen de privacidad"><div><LockKeyhole size={17} /><span><strong>Personalización activa.</strong> Puedes pausarla en cualquier momento; al hacerlo, bloqueamos nuevas señales, prendas y consultas al estilista.</span></div><button onClick={() => revokePrivacy.mutate()} disabled={revokePrivacy.isPending}>{revokePrivacy.isPending ? <Loader2 size={15} className="spin-muted" /> : <Eye size={15} />} Pausar personalización</button></section>}
      </main>
    </div>
  );
}
