import { loadComponent } from "./loader.js";
import { setupThemeToggle } from "./theme.js";

import "./dashboard.js";
import "./api.js";

async function init() {
  await loadComponent("header", "header.html");
  await loadComponent("footer", "footer.html");

  setupThemeToggle();
}

init();
