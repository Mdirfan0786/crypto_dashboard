export const loadComponent = async (id, file) => {
  const res = await fetch(`/components/${file}`);
  const html = await res.text();

  document.getElementById(id).innerHTML = html;
};

export async function loadPage(page) {
  const res = await fetch(`/pages/${page}.html`);
  const html = await res.text();

  document.querySelector("main").innerHTML = html;
}
