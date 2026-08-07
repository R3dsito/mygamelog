import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";

import { App } from "@/views";

// Sin esto dayjs formatea en inglés ("4 Aug 2026") en una app en español.
dayjs.locale("es");

import "@/styles/index.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
