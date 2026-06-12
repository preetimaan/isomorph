import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GraphProvider } from "./context/GraphProvider";
import { KnownTechnologiesProvider } from "./context/KnownTechnologiesProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GraphProvider>
        <KnownTechnologiesProvider>
          <App />
        </KnownTechnologiesProvider>
      </GraphProvider>
    </BrowserRouter>
  </StrictMode>,
);
