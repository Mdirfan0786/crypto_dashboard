export function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");

  if (!btn) return;

  // saved theme load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    // save theme
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // icon change
    btn.textContent = isDark ? "☀️" : "🌙";
  });
}
