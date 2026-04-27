export function saveFavorite(coin) {
  const favs = loadFavorites();
  if (!favs.includes(coin)) favs.push(coin);
  localStorage.setItem("favorites", JSON.stringify(favs));
}

export function loadFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function removeFavorite(coin) {
  const favs = loadFavorites().filter((f) => f !== coin);
  localStorage.setItem("favorites", JSON.stringify(favs));
}

// convert
export const USD_TO_INR = 83;

export function convertToINR(usd) {
  return (usd * USD_TO_INR).toFixed(2);
}

export function showLoader() {
  const el = document.getElementById("loader");
  if (el) el.classList.remove("hidden");
}

export function hideLoader() {
  const el = document.getElementById("loader");
  if (el) el.classList.add("hidden");
}

// compact numbers
export function formatCompact(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  return num;
}
