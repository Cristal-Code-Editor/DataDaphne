import "@fontsource-variable/inter";
import "./i18n";
import "./styles/tokens.css";
import "./styles/base.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { Tooltip } from "radix-ui";

import { App } from "./ui/App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Tooltip.Provider delayDuration={240}>
      <App />
    </Tooltip.Provider>
  </React.StrictMode>
);
