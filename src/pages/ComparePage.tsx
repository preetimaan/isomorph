import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NodeLink } from "@/components/NodeLink";
import { NodeMeta } from "@/components/NodeMeta";
import { useGraph } from "@/context/useGraph";
import {
  compareTechnologies,
  getAlternativeEdgeNotes,
  getAlternatives,
  getNodesByType,
  type GraphNode,
} from "@/graph";

export function ComparePage() {
  const { graph } = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const technologies = getNodesByType(graph, "technology");

  const leftId = searchParams.get("left") ?? "";
  const rightId = searchParams.get("right") ?? "";

  const comparison = useMemo(() => {
    if (!leftId || !rightId || leftId === rightId) {
      return null;
    }
    return compareTechnologies(graph, leftId, rightId);
  }, [graph, leftId, rightId]);

  const alternativeNotes =
    leftId && rightId
      ? getAlternativeEdgeNotes(graph, leftId, rightId)
      : undefined;
  const leftAlternatives = useMemo(
    () => (leftId ? getAlternatives(graph, leftId) : []),
    [graph, leftId],
  );
  const rightAlternatives = useMemo(
    () => (rightId ? getAlternatives(graph, rightId) : []),
    [graph, rightId],
  );
  const sharedAlternativeIds = useMemo(() => {
    const leftIds = new Set(leftAlternatives.map((node) => node.id));
    return rightAlternatives
      .filter((node) => leftIds.has(node.id))
      .map((node) => node.id);
  }, [leftAlternatives, rightAlternatives]);

  function updateParam(key: "left" | "right", value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  return (
    <Layout>
      <section className="panel">
        <h2>Compare technologies</h2>
        <p className="browse-description">
          See shared responsibilities and where two tools diverge.
        </p>

        <div className="compare-selectors">
          <label>
            <span>Technology A</span>
            <select
              value={leftId}
              onChange={(event) => updateParam("left", event.target.value)}
            >
              <option value="">Select technology</option>
              {technologies.map((technology) => (
                <option key={technology.id} value={technology.id}>
                  {technology.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Technology B</span>
            <select
              value={rightId}
              onChange={(event) => updateParam("right", event.target.value)}
            >
              <option value="">Select technology</option>
              {technologies.map((technology) => (
                <option key={technology.id} value={technology.id}>
                  {technology.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {leftId && rightId && leftId === rightId ? (
        <section className="panel">
          <p className="empty-state">Choose two different technologies.</p>
        </section>
      ) : null}

      {comparison ? (
        <>
          <section className="panel">
            <h2>Technologies</h2>
            <div className="compare-columns">
              <div className="compare-column">
                <NodeMeta
                  node={comparison.left}
                  showMaturity={false}
                  showNotes={false}
                  showSources={false}
                />
                <div className="compare-actions">
                  <Link
                    to={`/technology/${comparison.left.id}`}
                    className="text-link"
                  >
                    Open full detail
                  </Link>
                </div>
                <div className="note-block">
                  <h3>Notes</h3>
                  {comparison.left.notes ? (
                    <p>{comparison.left.notes}</p>
                  ) : (
                    <p className="empty-state">No notes yet.</p>
                  )}
                </div>
              </div>
              <div className="compare-column">
                <NodeMeta
                  node={comparison.right}
                  showMaturity={false}
                  showNotes={false}
                  showSources={false}
                />
                <div className="compare-actions">
                  <Link
                    to={`/technology/${comparison.right.id}`}
                    className="text-link"
                  >
                    Open full detail
                  </Link>
                </div>
                <div className="note-block">
                  <h3>Notes</h3>
                  {comparison.right.notes ? (
                    <p>{comparison.right.notes}</p>
                  ) : (
                    <p className="empty-state">No notes yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Relationship between A and B</h2>
            {comparison.areAlternatives ? (
              <p className="ok">
                These two technologies are marked as alternatives.
              </p>
            ) : (
              <p className="empty-state">
                Not directly linked as alternatives.
              </p>
            )}
            {alternativeNotes ? (
              <p className="edge-note">
                Rationale: {alternativeNotes}
              </p>
            ) : null}
          </section>

          <section className="panel">
            <h2>Alternatives (neighborhood)</h2>
            <p className="browse-description">
              Alternatives of each technology. Shared alternatives are highlighted.
            </p>
            <div className="compare-columns">
              <div className="compare-column">
                <h3>Alternatives of {comparison.left.name}</h3>
                <ComparisonList
                  nodes={leftAlternatives}
                  emptyMessage="No alternatives recorded."
                  highlightIds={new Set(sharedAlternativeIds)}
                />
              </div>
              <div className="compare-column">
                <h3>Alternatives of {comparison.right.name}</h3>
                <ComparisonList
                  nodes={rightAlternatives}
                  emptyMessage="No alternatives recorded."
                  highlightIds={new Set(sharedAlternativeIds)}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Shared responsibilities</h2>
            <ComparisonList
              nodes={comparison.sharedResponsibilities}
              emptyMessage="No shared responsibilities."
            />
          </section>

          <section className="panel">
            <h2>Difference</h2>
            <div className="compare-columns">
              <div className="compare-column">
                <h3>Only {comparison.left.name}</h3>
                <ComparisonList
                  nodes={comparison.leftOnlyResponsibilities}
                  emptyMessage="No unique responsibilities."
                />
              </div>
              <div className="compare-column">
                <h3>Only {comparison.right.name}</h3>
                <ComparisonList
                  nodes={comparison.rightOnlyResponsibilities}
                  emptyMessage="No unique responsibilities."
                />
              </div>
            </div>
          </section>
        </>
      ) : leftId && rightId ? (
        <section className="panel">
          <p className="empty-state">
            Could not compare the selected technologies.
          </p>
        </section>
      ) : (
        <section className="panel">
          <p className="empty-state">
            Select two technologies to compare, or open a compare link from an
            alternative card.
          </p>
        </section>
      )}
    </Layout>
  );
}

function ComparisonList({
  nodes,
  emptyMessage,
  highlightIds,
}: {
  nodes: GraphNode[];
  emptyMessage: string;
  highlightIds?: Set<string>;
}) {
  if (!nodes.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="relationship-list">
      {nodes.map((node) => (
        <li key={node.id} className={highlightIds?.has(node.id) ? "highlight" : undefined}>
          <NodeLink node={node} />
          {node.description ? (
            <p className="browse-description">{node.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
