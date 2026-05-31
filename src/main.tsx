import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GraphProvider } from "./context/GraphProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GraphProvider>
        <App />
      </GraphProvider>
    </BrowserRouter>
  </StrictMode>,
);
