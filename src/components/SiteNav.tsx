import { Link } from "react-router-dom";

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Main">
      <Link to="/" className="site-nav-link">
        Home
      </Link>
      <Link to="/graph" className="site-nav-link">
        Graph
      </Link>
      <Link to="/compare" className="site-nav-link">
        Compare
      </Link>
      <Link to="/relationships" className="site-nav-link">
        Relationships
      </Link>
    </nav>
  );
}
