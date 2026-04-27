const API_URL = import.meta.env.VITE_API_URL;

// Single coin
export async function fetchCoin(coin = "bitcoin") {
  try {
    const res = await fetch(`${API_URL}/coins/${coin}`);

    if (!res.ok) throw new Error("Coin not found");

    return await res.json();
  } catch (err) {
    console.error("FetchCoin Error:", err.message);
    throw err;
  }
}

// Multiple coins
export async function fetchCoins(page = 1, perPage = 20) {
  try {
    const res = await fetch(
      `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`,
    );

    if (!res.ok) throw new Error("Failed to fetch coins");

    return await res.json();
  } catch (err) {
    console.error("FetchCoins Error:", err.message);
    throw err;
  }
}

// Chart history
export async function fetchHistory(coin = "bitcoin", days = 7) {
  try {
    const res = await fetch(
      `${API_URL}/coins/${coin}/market_chart?vs_currency=usd&days=${days}`,
    );

    if (!res.ok) throw new Error("History fetch failed");

    return await res.json();
  } catch (err) {
    console.error("FetchHistory Error:", err.message);
    throw err;
  }
}
