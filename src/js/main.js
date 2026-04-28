import { loadComponent, loadPage } from "./loader.js";
import { setupThemeToggle } from "./theme.js";

import "./dashboard.js";
import "./api.js";

async function init() {
  await loadComponent("header", "header.html");
  await loadComponent("footer", "footer.html");

  setupThemeToggle();
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-page]");
  if (!link) return;

  e.preventDefault();

  const page = link.dataset.page;

  if (page === "home") {
    location.reload();
  } else {
    loadPage(page);
  }
});

init();
