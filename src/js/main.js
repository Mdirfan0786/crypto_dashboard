import { loadComponent } from "./loader.js";

import "./dashboard.js";
import "./api.js";

async function init() {
  await loadComponent("header", "header.html");
  await loadComponent("footer", "footer.html");
}

init();
