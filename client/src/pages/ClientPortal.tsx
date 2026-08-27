import { ArrowLeft, Check, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function ClientPortal() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const status = trpc.clientPortal.status.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const proposal = trpc.clientPortal.proposal.useQuery(undefined, { enabled: isAuthenticated && Boolean(status.data?.isConsented), retry: false });
  const consent = trpc.clientPortal.consent.useMutation({
    onSuccess: () => { utils.clientPortal.status.invalidate(); utils.clientPortal.proposal.invalidate(); },
  });

  return <div className="client-portal-shell">
    <header className="client-portal-header"><Link href="/" className="studio-back"><ArrowLeft size={17} /> Fashion Stylist AI</Link><span>PORTAL DE CLIENTA</span></header>
    <main className="client-portal-main">
      {loading ? <PortalState icon={<Loader2 className="spin-muted" />} title="Preparando tu acceso" text="Comprobamos una invitación asociada a tu cuenta." /> : !isAuthenticated ? <PortalState icon={<LockKeyhole />} title="Tu propuesta, en privado" text="Inicia sesión con el correo que Natalia invitó. Este portal no muestra el Studio profesional ni datos de otras personas." action={<button className="portal-primary" onClick={startLogin}>Iniciar sesión</button>} /> : status.isLoading ? <PortalState icon={<Loader2 className="spin-muted" />} title="Comprobando invitación" text="Un momento, por favor." /> : !status.data?.hasAccess ? <PortalState icon={<LockKeyhole />} title="Aún no hay una propuesta para esta cuenta" text="Natalia debe aprobar tu acceso con el mismo correo de esta sesión. No tienes acceso a su mesa de trabajo, armario ni decisiones internas." /> : !status.data.isConsented ? <section className="portal-consent" aria-labelledby="portal-consent-title"><span className="portal-mark"><Sparkles size={18} /></span><span className="eyebrow">LECTURA PERSONAL Y LIMITADA</span><h1 id="portal-consent-title">La propuesta llega<br /><em>cuando Natalia la aprueba.</em></h1><p>Al activar esta vista, autorizas que Fashion Stylist AI te muestre únicamente los looks que Natalia haya aprobado para ti. No puedes ver clientas, prendas privadas, decisiones internas ni propuestas de otra persona.</p><button className="portal-primary" onClick={() => consent.mutate()} disabled={consent.isPending}>{consent.isPending ? <Loader2 className="spin-muted" size={16} /> : <Check size={16} />} Activar mi propuesta</button></section> : proposal.isLoading ? <PortalState icon={<Loader2 className="spin-muted" />} title="Preparando tu propuesta" text="Cargamos solo los looks que Natalia decidió compartir contigo." /> : <section className="portal-proposal" aria-labelledby="portal-title"><div className="portal-cover"><span className="eyebrow">SELECCIÓN DE ESTILISMO</span><h1 id="portal-title">Para<br /><em>{proposal.data?.client?.displayName ?? "ti"}.</em></h1><p>Una lectura preparada por Natalia. Puedes revisarla con calma; los ajustes siguen bajo su criterio profesional.</p></div>{proposal.data?.looks.length ? <div className="portal-look-grid">{proposal.data.looks.map((look, index) => <article className="portal-look" key={look.id}><span>LOOK 0{index + 1}</span><h2>{look.name}</h2>{look.occasion && <p className="portal-occasion">{look.occasion}</p>}<div><strong>Componentes</strong>{look.components.length ? look.components.map((component) => <p className="portal-component" key={component.id}>{component.name}<small>{[component.itemType, component.color].filter(Boolean).join(" · ")}</small></p>) : <p className="portal-muted">Natalia completará los componentes antes de presentar este look.</p>}</div><div><strong>Por qué funciona</strong><p>{look.explanation ?? "Natalia añadirá la explicación profesional antes de presentar este look."}</p></div>{look.adjustment && <div><strong>Ajuste de Natalia</strong><p>{look.adjustment}</p></div>}</article>)}</div> : <PortalState icon={<Sparkles />} title="Natalia aún está preparando tu selección" text="Cuando apruebe uno o más looks para ti, aparecerán aquí. No se comparte nada automáticamente." />}</section>}</main>
  </div>;
}

function PortalState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <section className="portal-state" aria-live="polite"><span className="portal-mark">{icon}</span><h1>{title}</h1><p>{text}</p>{action}</section>;
}
