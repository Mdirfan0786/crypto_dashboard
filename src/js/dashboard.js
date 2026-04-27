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

async function init() {
  const search = document.getElementById("search");
  const results = document.getElementById("results");
  const favList = document.getElementById("favList");

  renderFavorites();
  await renderCoins();

  // default bitcoin
  setTimeout(() => {
    loadDefaultCoin(results);
  }, 1000);

  // SEARCH
  search.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const coin = search.value.trim().toLowerCase();
      if (!coin) return;

      showLoader();
      results.innerHTML = "";

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

  // FAVORITES CLICK
  favList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-btn")) {
      removeFavorite(e.target.dataset.id);
      renderFavorites();
      return;
    }

    const chip = e.target.closest(".fav-chip");

    if (chip) {
      const coinId = chip.dataset.id;

      try {
        const data = await fetchCoin(coinId);
        renderResult(data, results);
        renderChart(coinId, data);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// DEFAULT COIN
async function loadDefaultCoin(results) {
  try {
    showLoader();

    const data = await fetchCoin("bitcoin");
    renderResult(data, results);
    renderChart("bitcoin", data);
  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

// FORMAT
function formatNumber(num) {
  return Number(num).toLocaleString("en-IN");
}

// RESULT UI
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

// CHART
async function renderChart(coin, data) {
  const history = await fetchHistory(coin);
  const ctx = document.getElementById("priceChart").getContext("2d");

  if (chart) chart.destroy();

  const isPositive = data.market_data.price_change_percentage_24h > 0;

  // gradient effect
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  if (isPositive) {
    gradient.addColorStop(0, "rgba(34,197,94,0.4)");
    gradient.addColorStop(1, "rgba(34,197,94,0)");
  } else {
    gradient.addColorStop(0, "rgba(239,68,68,0.4)");
    gradient.addColorStop(1, "rgba(239,68,68,0)");
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.prices.map((p) => new Date(p[0]).toLocaleDateString()),
      datasets: [
        {
          data: history.prices.map((p) => p[1]),
          borderColor: isPositive ? "#22c55e" : "#ef4444",
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "#334155",
          borderWidth: 1,
          titleColor: "#fff",
          bodyColor: "#cbd5f5",
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    },
  });
}

// top gainer/loser
function renderTicker(coins) {
  const track = document.getElementById("tickerTrack");
  if (!track) return;

  track.innerHTML = coins
    .slice(0, 10)
    .map((coin) => {
      const change = coin.price_change_percentage_24h ?? 0;

      return `
        <div class="ticker-item">
          <span class="symbol">${coin.symbol.toUpperCase()}</span>
          <span>$${coin.current_price.toLocaleString()}</span>
          <span class="${change > 0 ? "green" : "red"}">
            ${change > 0 ? "▲" : "▼"} ${change.toFixed(2)}%
          </span>
        </div>
      `;
    })
    .join("");
}

// COINS GRID
async function renderCoins() {
  const grid = document.getElementById("coinsGrid");
  if (!grid) return;

  showLoader();
  grid.innerHTML = "";

  try {
    if (allCoins.length === 0) {
      allCoins = await fetchCoins();
    }

    renderTicker(allCoins);

    grid.innerHTML = allCoins
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

        // FAVORITE
        if (favBtn) {
          const coinId = favBtn.dataset.id;

          let favs = loadFavorites();

          if (favs.includes(coinId)) {
            removeFavorite(coinId);
          } else {
            saveFavorite(coinId);
          }

          favs = loadFavorites();

          renderFavorites();

          const icon = favBtn.querySelector("i");

          if (favs.includes(coinId)) {
            favBtn.classList.add("active");
            icon.className = "fa-solid fa-star";
          } else {
            favBtn.classList.remove("active");
            icon.className = "fa-regular fa-star";
          }

          return;
        }

        // CARD CLICK
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

// FAVORITES UI
function renderFavorites() {
  const favList = document.getElementById("favList");
  const favs = loadFavorites();

  if (!favs.length) {
    favList.innerHTML = "<p>No favorites yet</p>";
    return;
  }

  favList.innerHTML = favs
    .map(
      (f) => `
      <div class="fav-chip" data-id="${f}">
        <span>${f.toUpperCase()}</span>
        <button class="remove-btn" data-id="${f}">×</button>
      </div>
    `,
    )
    .join("");
}
