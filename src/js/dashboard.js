import Chart from "chart.js/auto";
import { fetchCoin, fetchHistory, fetchCoins } from "./api.js";
import {
  saveFavorite,
  loadFavorites,
  removeFavorite,
  convertToINR,
  formatCompact,
  showLoader,
  hideLoader,
} from "./utils.js";

let chart;
let allCoins = [];

document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  const search = document.getElementById("search");
  const results = document.getElementById("results");
  const favList = document.getElementById("favList");

  renderFavorites();
  renderCoins();

  search.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const coin = search.value.trim().toLowerCase();
      if (!coin) return;

      showLoader();
      results.innerHTML = "";

      results.innerHTML = `<div class="spinner"></div>`;

      try {
        const data = await fetchCoin(coin);
        renderResult(data, results);
        renderChart(coin, data);
      } catch {
        results.innerHTML = `<p class="error">Coin not found</p>`;
      } finally {
        hideLoader();
      }
    }
  });

  favList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-btn")) {
      removeFavorite(e.target.dataset.id);
      renderFavorites();
      return;
    }

    const li = e.target.closest("li");
    if (li) {
      const data = await fetchCoin(li.dataset.id);
      renderResult(data, results);
      renderChart(li.dataset.id, data);
    }
  });
}

function formatNumber(num) {
  return Number(num).toLocaleString("en-IN");
}

function renderResult(data, results) {
  const usd = data.market_data.current_price.usd;
  const inr = convertToINR(usd);

  results.innerHTML = `
    <div class="card">
      <img src="${data.image.small}">
      <h2>${data.name} (${data.symbol.toUpperCase()})</h2>

      <p>Price: $${formatNumber(usd)}</p>
      <p>INR: ₹${formatNumber(inr)}</p>

      <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>

      <button id="favBtn">Add to Favorites</button>
    </div>
  `;

  document.getElementById("favBtn").onclick = () => {
    const favs = loadFavorites();
    if (!favs.includes(data.id)) {
      saveFavorite(data.id);
      renderFavorites();
    }
  };
}

async function renderChart(coin, data) {
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
          data: history.prices.map((p) => p[1]),
          borderColor: isPositive ? "green" : "red",
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
    },
  });
}

async function renderCoins() {
  const grid = document.getElementById("coinsGrid");
  if (!grid) return;

  showLoader();
  grid.innerHTML = "";

  try {
    if (allCoins.length === 0) {
      allCoins = await fetchCoins();
    }

    const coins = allCoins;

    grid.innerHTML = coins
      .map((coin) => {
        const change = coin.price_change_percentage_24h ?? 0;
        const favs = loadFavorites();
        const isFav = favs.includes(coin.id);

        return `
        <div class="coin-card" data-id="${coin.id}">
          
          <div class="card-header">
            <div class="coin-info">
              <img src="${coin.image}">
              <div>
                <h3>${coin.name}</h3>
                <span>${coin.symbol.toUpperCase()}</span>
              </div>
            </div>

            <button class="fav-btn ${isFav ? "active" : ""}" data-id="${coin.id}">
              <i class="${
                isFav ? "fa-solid fa-star" : "fa-regular fa-star"
              }"></i>
            </button>
          </div>

          <h2 class="price">$${formatNumber(coin.current_price)}</h2>

          <div class="change ${change > 0 ? "green" : "red"}">
            ${change > 0 ? "▲" : "▼"} ${change.toFixed(2)}%
          </div>

          <div class="divider"></div>

          <div class="card-footer">
            <div>
              <span>MKT CAP</span>
              <p>$${formatCompact(coin.market_cap)}</p>
            </div>

            <div>
              <span>VOLUME</span>
              <p>$${formatCompact(coin.total_volume)}</p>
            </div>

            <div>
              <span>RANK</span>
              <p>#${coin.market_cap_rank}</p>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    if (!grid.dataset.listener) {
      grid.dataset.listener = "true";

      grid.addEventListener("click", async (e) => {
        const favBtn = e.target.closest(".fav-btn");

        if (favBtn) {
          const coinId = favBtn.dataset.id;
          const favs = loadFavorites();

          if (favs.includes(coinId)) {
            removeFavorite(coinId);
          } else {
            saveFavorite(coinId);
          }

          renderFavorites();
          renderCoins();
          return;
        }

        const card = e.target.closest(".coin-card");
        if (card) {
          const data = await fetchCoin(card.dataset.id);
          const results = document.getElementById("results");

          renderResult(data, results);
          renderChart(card.dataset.id, data);

          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  } catch (err) {
    console.error(err);
    grid.innerHTML = "Failed to load coins";
  } finally {
    hideLoader();
  }
}

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
