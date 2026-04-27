export function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const savedTheme = localStorage.getItem("theme");

  // initial theme
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  updateIcon();

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateIcon();
  });

  // helper function
  function updateIcon() {
    const isDark = document.body.classList.contains("dark");

    btn.innerHTML = isDark
      ? `<i class="fa-regular fa-sun"></i> <span>Light</span>`
      : `<i class="fa-solid fa-moon"></i> <span>Dark</span>`;
  }
}
