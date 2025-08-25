import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import GlobalBackButton from "./components/ui/GlobalBackButton.jsx"; // 👈 import your button
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <GlobalBackButton /> {/* 👈 always rendered */}
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  </StrictMode>
);
