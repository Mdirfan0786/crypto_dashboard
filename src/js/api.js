const API_URL = import.meta.env.VITE_API_URL;

console.log(API_URL);

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

export async function fetchHistory(coin = "bitcoin") {
  try {
    const res = await fetch(
      `${API_URL}/coins/${coin}/market_chart?vs_currency=usd&days=7`,
    );

    if (!res.ok) throw new Error("History fetch failed");

    return await res.json();
  } catch (err) {
    console.error("FetchHistory Error:", err.message);
    throw err;
  }
}
