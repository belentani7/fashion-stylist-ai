import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Check, Circle, Loader2, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ClientProposal() {
  const { clientId } = useParams<{ clientId: string }>();
  const numericClientId = Number(clientId);
  const clients = trpc.clients.list.useQuery();
  const presentation = trpc.outfits.presentation.useQuery(numericClientId, { enabled: Number.isInteger(numericClientId) && numericClientId > 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const client = clients.data?.find((item) => item.id === numericClientId);
  const selectedLooks = useMemo(() => presentation.data?.filter((item) => selectedIds.includes(item.id)) ?? [], [presentation.data, selectedIds]);

  function toggleLook(id: number) { setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); }

  if (!Number.isInteger(numericClientId) || numericClientId <= 0) return <div className="proposal-page"><p>La clienta solicitada no es válida.</p></div>;

  return <div className="proposal-page">
    <header className="proposal-header"><Link href="/studio" className="studio-back"><ArrowLeft size={17} /> Volver a la mesa</Link><div className="proposal-wordmark">FASHION STYLIST <i>AI</i></div><button className="proposal-print-button" disabled={!selectedLooks.length} onClick={() => window.print()}><Printer size={15} /> Imprimir selección</button></header>
    <main className="proposal-document">
      <section className="proposal-cover"><span className="eyebrow">PROPUESTA DE ESTILISMO</span><h1>Selección para<br /><em>{client?.displayName ?? "tu clienta"}.</em></h1><p>Una lectura de looks preparada para revisión de Natalia. Selecciona los looks que quieres incluir antes de imprimir; nada se comparte automáticamente.</p></section>
      {presentation.isLoading ? <div className="proposal-loading"><Loader2 className="spin-muted" size={22} /> Preparando propuesta…</div> : presentation.data?.length ? <section className="proposal-look-grid">{presentation.data.map((look, index) => <article key={look.id} className={`proposal-look ${selectedIds.includes(look.id) ? "is-selected" : ""}`}><button className="look-select" onClick={() => toggleLook(look.id)} aria-pressed={selectedIds.includes(look.id)}>{selectedIds.includes(look.id) ? <Check size={15} /> : <Circle size={15} />} {selectedIds.includes(look.id) ? "Incluido" : "Incluir"}</button><span className="eyebrow">LOOK 0{index + 1}</span><h2>{look.name}</h2><p className="look-occasion">{look.occasion ?? "Ocasión por definir"}</p><div className="look-components"><strong>Componentes</strong>{look.components.length ? look.components.map((component) => <div key={component.id}>{component.imageUrl ? <img src={component.imageUrl} alt={`Prenda: ${component.name}`} /> : <span className="component-marker" />}<p><b>{component.name}</b><small>{[component.itemType, component.color].filter(Boolean).join(" · ")}</small></p></div>) : <p>Este look aún no tiene prendas verificables.</p>}</div><div className="look-rationale"><strong>Por qué funciona</strong><p>{look.explanation ?? "Natalia añadirá la explicación antes de presentar este look."}</p></div>{look.adjustment && <div className="look-rationale"><strong>Ajuste de estilista</strong><p>{look.adjustment}</p></div>}</article>)}</section> : <section className="proposal-no-looks"><h2>La propuesta empieza en la mesa de composición.</h2><p>Guarda al menos un look con prendas y explicación profesional para incluirlo aquí.</p></section>}
      <footer className="proposal-document-footer"><span>FASHION STYLIST AI</span><p>Propuesta preparada para revisión profesional.</p></footer>
    </main>
  </div>;
}
