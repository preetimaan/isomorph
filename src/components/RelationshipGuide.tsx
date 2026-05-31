import { Link } from "react-router-dom";
import {
  RELATIONSHIP_DEFINITIONS,
  type RelationshipDefinition,
} from "@/content/relationships";

export function RelationshipGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className="panel">
      <h2>Relationship types</h2>
      {!compact ? (
        <p className="browse-description">
          Edges connect nodes with specific meaning. Symmetric relationships
          work both ways; directed ones follow the arrow.
        </p>
      ) : null}

      <div className="relationship-guide">
        {RELATIONSHIP_DEFINITIONS.map((definition) => (
          <RelationshipGuideItem
            key={definition.type}
            definition={definition}
            compact={compact}
          />
        ))}
      </div>

      {compact ? (
        <Link to="/relationships" className="text-link">
          Full relationship guide
        </Link>
      ) : null}
    </section>
  );
}

function RelationshipGuideItem({
  definition,
  compact,
}: {
  definition: RelationshipDefinition;
  compact: boolean;
}) {
  return (
    <article className="relationship-guide-item">
      <div className="relationship-guide-header">
        <h3>{definition.type.replaceAll("_", " ")}</h3>
        <span
          className={`relationship-badge relationship-badge-${definition.direction}`}
        >
          {definition.direction}
        </span>
      </div>
      <p>{definition.summary}</p>
      <p className="edge-note">Example: {definition.example}</p>
      {!compact && definition.contrast ? (
        <p className="edge-note">{definition.contrast}</p>
      ) : null}
    </article>
  );
}
