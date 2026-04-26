import Chart from "chart.js/auto";
import { fetchCoin, fetchHistory } from "./api.js";
import {
  saveFavorite,
  loadFavorites,
  removeFavorite,
  convertToINR,
} from "./utils.js";

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
        renderChart(coin, data);
      } catch {
        results.innerHTML = `<p class="error">Coin not found</p>`;
      }
    }
  });

  // Favorites click + remove
  favList.addEventListener("click", async (e) => {
    const coin = e.target.dataset.id;

    if (e.target.classList.contains("remove-btn")) {
      removeFavorite(coin);
      renderFavorites();
      return;
    }

    if (e.target.tagName === "LI") {
      try {
        const data = await fetchCoin(coin);
        renderResult(data, results);
        renderChart(coin, data);
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// Format helper
function formatNumber(num) {
  return num.toLocaleString("en-IN");
}

// Render result
function renderResult(data, results) {
  const usd = data.market_data.current_price.usd;
  const inr = convertToINR(usd);

  results.innerHTML = `
    <div class="card">
      <img src="${data.image.small}" alt="${data.name}">
      <h2>${data.name} (${data.symbol.toUpperCase()})</h2>

      <p>Price: $${formatNumber(usd)}</p>
      <p>INR: ₹${formatNumber(inr)}</p>

      <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>

      <button id="favBtn">Add to Favorites</button>
    </div>
  `;

  document.getElementById("favBtn").addEventListener("click", () => {
    const favs = loadFavorites();

    if (!favs.includes(data.id)) {
      saveFavorite(data.id);
      renderFavorites();
    }
  });
}

// Render chart
async function renderChart(coin, data) {
  try {
    const history = await fetchHistory(coin);
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (chart) chart.destroy();

    const isPositive = data.market_data.price_change_percentage_24h > 0;

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: history.prices.map((p) => new Date(p[0]).toLocaleDateString()),
        datasets: [
          {
            label: `${coin} Price`,
            data: history.prices.map((p) => p[1]),
            borderColor: isPositive ? "green" : "red",
            fill: false,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
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
