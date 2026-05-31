import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";

export function NotFoundPage() {
  return (
    <Layout>
      <section className="panel">
        <h2>Not found</h2>
        <p className="empty-state">
          That node does not exist in the graph.
        </p>
        <Link to="/" className="text-link">
          Back to home
        </Link>
      </section>
    </Layout>
  );
}
