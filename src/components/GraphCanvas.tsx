import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { nodeRoute } from "@/graph";
import type { GraphNode, GraphSubgraph, NodeType } from "@/graph";
import type { ForceGraphMethods } from "react-force-graph-2d";

const NODE_COLORS: Record<NodeType, string> = {
  responsibility: "#8ab4f8",
  technology: "#81c995",
  ecosystem: "#c58af9",
};

interface ForceNode extends GraphNode {
  x?: number;
  y?: number;
}

interface ForceLink {
  source: string | ForceNode;
  target: string | ForceNode;
  type: string;
}

interface GraphCanvasProps {
  subgraph: GraphSubgraph;
  height?: number;
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setWidth(element.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export function GraphCanvas({ subgraph, height = 420 }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const navigate = useNavigate();
  const graphRef = useRef<ForceGraphMethods | undefined>();

  const graphData = useMemo(
    () => ({
      nodes: subgraph.nodes.map((node) => ({ ...node })),
      links: subgraph.edges.map((edge) => ({
        source: edge.from,
        target: edge.to,
        type: edge.type,
      })),
    }),
    [subgraph],
  );

  useEffect(() => {
    // Give the force engine some breathing room as the graph grows.
    // react-force-graph uses d3-force under the hood; charge + collide keeps nodes readable.
    const instance = graphRef.current;
    if (!instance) {
      return;
    }

    const chargeForce = instance.d3Force("charge");
    if (chargeForce && typeof chargeForce.strength === "function") {
      chargeForce.strength(-120);
    }
  }, [subgraph.nodes.length]);

  if (!graphData.nodes.length) {
    return <p className="empty-state">No nodes to display.</p>;
  }

  return (
    <div
      ref={containerRef}
      className="graph-canvas"
      style={{ height: `${height}px` }}
    >
      <ForceGraph2D
        ref={(instance) => {
          graphRef.current = instance ?? undefined;
        }}
        width={width}
        height={height}
        graphData={graphData}
        nodeLabel="name"
        nodeRelSize={6}
        nodeColor={(node) =>
          NODE_COLORS[(node as ForceNode).type] ?? "#9aa0a6"
        }
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const forceNode = node as ForceNode;
          if (typeof forceNode.x !== "number" || typeof forceNode.y !== "number") {
            return;
          }

          const label = forceNode.name;
          const fontSize = Math.max(4, Math.min(12, 12 / globalScale));
          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#e8eaed";
          ctx.fillText(label, forceNode.x, forceNode.y + 10);
        }}
        linkColor={() => "#3c4257"}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link, ctx, globalScale) => {
          const forceLink = link as ForceLink;
          const start = forceLink.source as ForceNode;
          const end = forceLink.target as ForceNode;
          if (
            typeof start.x !== "number" ||
            typeof start.y !== "number" ||
            typeof end.x !== "number" ||
            typeof end.y !== "number"
          ) {
            return;
          }

          const label = forceLink.type.replaceAll("_", " ");
          const middleX = (start.x + end.x) / 2;
          const middleY = (start.y + end.y) / 2;
          const fontSize = Math.max(3, Math.min(10, 10 / globalScale));

          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = "#9aa0a6";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, middleX, middleY);
        }}
        onNodeClick={(node) => {
          navigate(nodeRoute(node as GraphNode));
        }}
      />
      <ul className="graph-legend" aria-label="Node type legend">
        <li>
          <span className="legend-swatch responsibility" />
          responsibility
        </li>
        <li>
          <span className="legend-swatch technology" />
          technology
        </li>
        <li>
          <span className="legend-swatch ecosystem" />
          ecosystem
        </li>
      </ul>
    </div>
  );
}
