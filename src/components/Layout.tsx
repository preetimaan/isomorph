import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="brand">
          <p className="eyebrow">Concept-first skill transfer</p>
          <h1>Isomorph</h1>
          <p className="subtitle">Map tools to responsibilities, not syntax.</p>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
