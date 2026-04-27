const API_URL = import.meta.env.VITE_API_URL;

// single coin
export async function fetchCoin(coin = "bitcoin") {
  const res = await fetch(`${API_URL}/coins/${coin}`);
  if (!res.ok) throw new Error("Coin not found");
  return res.json();
}

// all coins
export async function fetchCoins() {
  const res = await fetch(
    `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1`,
  );
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

// chart
export async function fetchHistory(coin = "bitcoin") {
  const res = await fetch(
    `${API_URL}/coins/${coin}/market_chart?vs_currency=usd&days=7`,
  );
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
