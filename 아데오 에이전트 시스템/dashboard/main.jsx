import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdeoDashboard from "./adeo-dashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdeoDashboard />
  </StrictMode>
);
