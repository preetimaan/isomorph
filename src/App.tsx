import { Route, Routes, useParams } from "react-router-dom";
import { ComparePage } from "@/pages/ComparePage";
import { GraphExplorerPage } from "@/pages/GraphExplorerPage";
import { HomePage } from "@/pages/HomePage";
import { NodeDetailPage } from "@/pages/NodeDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RelationshipsPage } from "@/pages/RelationshipsPage";

function TypedNodeRoute({
  nodeType,
}: {
  nodeType: "responsibility" | "technology" | "ecosystem";
}) {
  const { id } = useParams();
  if (!id) {
    return <NotFoundPage />;
  }
  return <NodeDetailPage nodeType={nodeType} id={id} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/graph" element={<GraphExplorerPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/relationships" element={<RelationshipsPage />} />
      <Route
        path="/responsibility/:id"
        element={<TypedNodeRoute nodeType="responsibility" />}
      />
      <Route
        path="/technology/:id"
        element={<TypedNodeRoute nodeType="technology" />}
      />
      <Route
        path="/ecosystem/:id"
        element={<TypedNodeRoute nodeType="ecosystem" />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
