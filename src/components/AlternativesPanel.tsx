import { Link } from "react-router-dom";
import { useGraph } from "@/context/useGraph";
import { getAlternatives, getAlternativeEdgeNotes, getNode } from "@/graph";
import { NodeLink } from "./NodeLink";

interface AlternativesPanelProps {
  technologyId: string;
}

export function AlternativesPanel({ technologyId }: AlternativesPanelProps) {
  const { graph } = useGraph();
  const technology = getNode(graph, technologyId);
  const alternatives = getAlternatives(graph, technologyId);

  if (!technology || !alternatives.length) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Alternatives</h2>
      <div className="alternatives-grid">
        {alternatives.map((alternative) => {
          const notes = getAlternativeEdgeNotes(
            graph,
            technologyId,
            alternative.id,
          );

          return (
            <article key={alternative.id} className="alternative-card">
              <NodeLink node={alternative} />
              {alternative.description ? (
                <p className="browse-description">{alternative.description}</p>
              ) : null}
              {notes ? <p className="edge-note">{notes}</p> : null}
              {alternative.notes ? (
                <p className="edge-note">{alternative.notes}</p>
              ) : null}
              <Link
                to={`/compare?left=${technologyId}&right=${alternative.id}`}
                className="text-link"
              >
                Compare with {technology.name}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
