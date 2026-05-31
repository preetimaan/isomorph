import type { GraphNode } from "@/graph";

interface NodeMetaProps {
  node: GraphNode;
}

export function NodeMeta({ node }: NodeMetaProps) {
  return (
    <div className="node-meta">
      <div className="node-meta-header">
        <span className="node-type">{node.type}</span>
        {node.maturity ? (
          <span className={`maturity maturity-${node.maturity}`}>
            {node.maturity}
          </span>
        ) : null}
      </div>
      <h2>{node.name}</h2>
      <p className="node-id">{node.id}</p>
      {node.description ? (
        <p className="node-description">{node.description}</p>
      ) : null}
      {node.tags?.length ? (
        <ul className="tag-list">
          {node.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
      {node.notes ? (
        <div className="note-block">
          <h3>Notes</h3>
          <p>{node.notes}</p>
        </div>
      ) : null}
      {node.sources?.length ? (
        <div className="note-block">
          <h3>Sources</h3>
          <ul className="source-list">
            {node.sources.map((source) => (
              <li key={source}>
                <a href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
