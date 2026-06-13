import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NodeLink } from "@/components/NodeLink";
import { SearchBar } from "@/components/SearchBar";
import { useGraph } from "@/context/useGraph";
import { useKnownTechnologies } from "@/context/useKnownTechnologies";
import {
  buildTechnologyMatrix,
  getEcosystemMatrixCoverage,
  getNodesByType,
  groupMatrixRowsByEcosystem,
  type GraphNode,
  type TechnologyMatrixRow,
} from "@/graph";

type KnownFilter = "all" | "known" | "unknown";

function filterRows(
  rows: TechnologyMatrixRow[],
  knownFilter: KnownFilter,
  isKnown: (technologyId: string) => boolean,
): TechnologyMatrixRow[] {
  return rows.filter((row) => {
    if (knownFilter === "known") {
      return isKnown(row.technology.id);
    }
    if (knownFilter === "unknown") {
      return !isKnown(row.technology.id);
    }
    return true;
  });
}

function MatrixRow({
  row,
  responsibilities,
  unfulfilledResponsibilityIds,
  firstGapResponsibilityId,
  showEcosystemColumn,
  isKnown,
}: {
  row: TechnologyMatrixRow;
  responsibilities: GraphNode[];
  unfulfilledResponsibilityIds: Set<string>;
  firstGapResponsibilityId?: string;
  showEcosystemColumn: boolean;
  isKnown: (technologyId: string) => boolean;
}) {
  return (
    <tr
      className={
        isKnown(row.technology.id) ? "matrix-row-known" : "matrix-row-unknown"
      }
    >
      <th scope="row" className="matrix-sticky-col">
        <NodeLink node={row.technology} />
      </th>
      {showEcosystemColumn ? (
        <td className="matrix-ecosystems">
          {row.ecosystems.length ? (
            row.ecosystems.map((ecosystem) => (
              <Link
                key={ecosystem.id}
                to={`/?ecosystem=${ecosystem.id}`}
                className="matrix-ecosystem-link"
              >
                {ecosystem.name}
              </Link>
            ))
          ) : (
            <span className="matrix-empty">—</span>
          )}
        </td>
      ) : null}
      {responsibilities.map((responsibility) => {
        const isUnfulfilled = unfulfilledResponsibilityIds.has(responsibility.id);
        const isFulfilled = row.responsibilityIds.has(responsibility.id);

        return (
          <td
            key={responsibility.id}
            className={[
              "matrix-cell",
              isUnfulfilled ? "matrix-cell-gap" : "",
              responsibility.id === firstGapResponsibilityId
                ? "matrix-col-gap-boundary"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isFulfilled ? (
              <Link
                to={`/technology/${row.technology.id}`}
                className="matrix-check"
                title={`${row.technology.name} fulfills ${responsibility.name}`}
                aria-label={`${row.technology.name} fulfills ${responsibility.name}`}
              >
                ✓
              </Link>
            ) : (
              <span className="matrix-empty" aria-hidden="true">
                ·
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export function HomePage() {
  const { graph, validation } = useGraph();
  const { isKnown } = useKnownTechnologies();
  const [searchParams, setSearchParams] = useSearchParams();
  const [knownFilter, setKnownFilter] = useState<KnownFilter>("all");

  const ecosystemFilter = searchParams.get("ecosystem") ?? "all";
  const matrix = useMemo(() => buildTechnologyMatrix(graph), [graph]);
  const ecosystems = getNodesByType(graph, "ecosystem");

  const ecosystemCoverage = useMemo(() => {
    if (ecosystemFilter === "all") {
      return null;
    }
    return getEcosystemMatrixCoverage(graph, ecosystemFilter);
  }, [ecosystemFilter, graph]);

  const filteredRows = useMemo(() => {
    const baseRows =
      ecosystemCoverage?.rows ??
      matrix.rows.filter(
        (row) =>
          ecosystemFilter === "all" ||
          row.ecosystems.some((ecosystem) => ecosystem.id === ecosystemFilter),
      );

    return filterRows(baseRows, knownFilter, isKnown);
  }, [ecosystemCoverage, ecosystemFilter, isKnown, knownFilter, matrix.rows]);

  const groupedRows = useMemo(() => {
    if (ecosystemFilter !== "all") {
      return null;
    }
    return groupMatrixRowsByEcosystem(
      graph,
      filterRows(matrix.rows, knownFilter, isKnown),
    );
  }, [ecosystemFilter, graph, isKnown, knownFilter, matrix.rows]);

  const unfulfilledResponsibilityIds = useMemo(() => {
    if (ecosystemCoverage) {
      return new Set(
        ecosystemCoverage.unfulfilledResponsibilities.map(
          (responsibility) => responsibility.id,
        ),
      );
    }
    return new Set<string>();
  }, [ecosystemCoverage]);

  const displayResponsibilities = useMemo(() => {
    if (!ecosystemCoverage) {
      return matrix.responsibilities;
    }

    const fulfilled = matrix.responsibilities.filter(
      (responsibility) => !unfulfilledResponsibilityIds.has(responsibility.id),
    );
    const unfulfilled = matrix.responsibilities.filter((responsibility) =>
      unfulfilledResponsibilityIds.has(responsibility.id),
    );

    return [...fulfilled, ...unfulfilled];
  }, [
    ecosystemCoverage,
    matrix.responsibilities,
    unfulfilledResponsibilityIds,
  ]);

  const firstGapResponsibilityId = useMemo(() => {
    return displayResponsibilities.find((responsibility) =>
      unfulfilledResponsibilityIds.has(responsibility.id),
    )?.id;
  }, [displayResponsibilities, unfulfilledResponsibilityIds]);

  const knownCount = matrix.rows.filter((row) => isKnown(row.technology.id)).length;
  const showEcosystemColumn = ecosystemFilter === "all";
  const columnCount =
    displayResponsibilities.length + (showEcosystemColumn ? 2 : 1);

  function setEcosystemFilter(value: string) {
    if (value === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ ecosystem: value });
  }

  return (
    <Layout>
      <SearchBar graph={graph} />

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>
              {ecosystemCoverage
                ? `${ecosystemCoverage.ecosystem.name} matrix`
                : "Technology matrix"}
            </h2>
            <p className="browse-description">
              {ecosystemCoverage
                ? "Coverage for one ecosystem — gap columns highlight responsibilities no technology fulfills yet."
                : "Technologies grouped by ecosystem. Known status from data/personal/technologies.yaml."}
            </p>
          </div>
          <p className={validation.ok ? "ok" : "error"}>
            {validation.ok ? "Validation passed" : "Validation failed"}
          </p>
        </div>

        <div className="matrix-toolbar">
          <div className="filter-row" role="group" aria-label="Filter by known status">
            <span className="filter-label">Known</span>
            {(
              [
                ["all", "All"],
                ["known", "Known"],
                ["unknown", "Unknown"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`filter-chip ${knownFilter === value ? "filter-chip-active" : ""}`}
                aria-pressed={knownFilter === value}
                onClick={() => setKnownFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="matrix-select">
            <span className="filter-label">Ecosystem</span>
            <select
              value={ecosystemFilter}
              onChange={(event) => setEcosystemFilter(event.target.value)}
            >
              <option value="all">All ecosystems (grouped)</option>
              {ecosystems.map((ecosystem) => (
                <option key={ecosystem.id} value={ecosystem.id}>
                  {ecosystem.name} only
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="known-summary">
          {knownCount} of {matrix.rows.length} technologies known
          {filteredRows.length !== matrix.rows.length
            ? ` · showing ${filteredRows.length}`
            : ""}
        </p>

        {ecosystemCoverage ? (
          <div className="ecosystem-gaps">
            <h3>Unfulfilled responsibilities</h3>
            {ecosystemCoverage.unfulfilledResponsibilities.length ? (
              <ul className="gap-list">
                {ecosystemCoverage.unfulfilledResponsibilities.map(
                  (responsibility) => (
                    <li key={responsibility.id}>
                      <Link
                        to={`/responsibility/${responsibility.id}`}
                        className="gap-link"
                      >
                        {responsibility.name}
                      </Link>
                      <Link
                        to={`/graph?responsibility=${responsibility.id}`}
                        className="text-link gap-graph-link"
                      >
                        graph
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="browse-description">
                Every responsibility has at least one technology in this ecosystem.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section className="panel matrix-panel">
        {filteredRows.length || groupedRows?.length ? (
          <div className="matrix-scroll">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th scope="col" className="matrix-sticky-col">
                    Technology
                  </th>
                  {showEcosystemColumn ? <th scope="col">Ecosystem</th> : null}
                  {displayResponsibilities.map((responsibility) => {
                    const isGap = unfulfilledResponsibilityIds.has(
                      responsibility.id,
                    );

                    return (
                      <th
                        key={responsibility.id}
                        scope="col"
                        className={[
                          "matrix-col-responsibility",
                          isGap ? "matrix-col-gap" : "",
                          responsibility.id === firstGapResponsibilityId
                            ? "matrix-col-gap-boundary"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <Link
                          to={`/graph?responsibility=${responsibility.id}`}
                          className="matrix-header-link"
                          title={`Graph for ${responsibility.name}`}
                        >
                          {responsibility.name}
                        </Link>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {ecosystemFilter === "all" && groupedRows ? (
                groupedRows.map((group) => (
                  <tbody key={group.ecosystem?.id ?? "unassigned"}>
                    <tr className="matrix-group-header">
                      <th
                        scope="rowgroup"
                        colSpan={columnCount}
                        className="matrix-sticky-col"
                      >
                        <Link
                          to={
                            group.ecosystem
                              ? `/?ecosystem=${group.ecosystem.id}`
                              : "/"
                          }
                          className="matrix-group-link"
                        >
                          {group.ecosystem?.name ?? "Unassigned"}
                        </Link>
                        <span className="matrix-group-count">
                          {group.rows.length} technologies
                        </span>
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <MatrixRow
                        key={`${group.ecosystem?.id ?? "unassigned"}-${row.technology.id}`}
                        row={row}
                        responsibilities={matrix.responsibilities}
                        unfulfilledResponsibilityIds={unfulfilledResponsibilityIds}
                        showEcosystemColumn={showEcosystemColumn}
                        isKnown={isKnown}
                      />
                    ))}
                  </tbody>
                ))
              ) : (
                <tbody>
                  {filteredRows.map((row) => (
                    <MatrixRow
                      key={row.technology.id}
                      row={row}
                      responsibilities={displayResponsibilities}
                      unfulfilledResponsibilityIds={unfulfilledResponsibilityIds}
                      firstGapResponsibilityId={firstGapResponsibilityId}
                      showEcosystemColumn={showEcosystemColumn}
                      isKnown={isKnown}
                    />
                  ))}
                </tbody>
              )}
            </table>
          </div>
        ) : (
          <p className="empty-state">No technologies match these filters.</p>
        )}
      </section>
    </Layout>
  );
}
