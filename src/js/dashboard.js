import Chart from "chart.js/auto";
import { fetchCoin, fetchHistory } from "./api.js";
import { saveFavorite, loadFavorites, removeFavorite } from "./utils.js";

let chart;

document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  const search = document.getElementById("search");
  const results = document.getElementById("results");
  const favList = document.getElementById("favList");

  renderFavorites();

  // Search
  search.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const coin = search.value.trim().toLowerCase();
      if (!coin) return;

      results.innerHTML = `<div class="spinner"></div>`;

      try {
        const data = await fetchCoin(coin);
        renderResult(data, results);
        renderChart(coin);
      } catch {
        results.innerHTML = `<p class="error">Coin not found</p>`;
      }
    }
  });

  // Favorites click + remove
  favList.addEventListener("click", async (e) => {
    const coin = e.target.dataset.id;

    // remove
    if (e.target.classList.contains("remove-btn")) {
      removeFavorite(coin);
      renderFavorites();
      return;
    }

    // load coin on click
    if (e.target.tagName === "LI") {
      try {
        const data = await fetchCoin(coin);
        renderResult(data, results);
        renderChart(coin);
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// Render result
function renderResult(data, results) {
  results.innerHTML = `
    <div class="card">
      <img src="${data.image.small}" alt="${data.name}">
      <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
      <p>Price: $${data.market_data.current_price.usd}</p>
      <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>
      <button id="favBtn">Add to Favorites</button>
    </div>
  `;

  document.getElementById("favBtn").addEventListener("click", () => {
    saveFavorite(data.id);
    renderFavorites();
  });
}

// Render chart
async function renderChart(coin) {
  try {
    const history = await fetchHistory(coin);
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: history.prices.map((p) => new Date(p[0]).toLocaleDateString()),
        datasets: [
          {
            label: `${coin} Price`,
            data: history.prices.map((p) => p[1]),
            borderColor: "#007BFF",
            fill: false,
          },
        ],
      },
    });
  } catch (err) {
    console.error("Chart Error:", err);
  }
}

// Render favorites
function renderFavorites() {
  const favList = document.getElementById("favList");
  const favs = loadFavorites();

  if (!favs.length) {
    favList.innerHTML = "<li>No favorites yet</li>";
    return;
  }

  favList.innerHTML = favs
    .map(
      (f) => `
        <li data-id="${f}">
          ${f}
          <button class="remove-btn" data-id="${f}">x</button>
        </li>
      `,
    )
    .join("");
}
