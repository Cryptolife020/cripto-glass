// Mock data para usar como fallback quando a API falhar
export const mockTopCoins = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 67420.50,
    market_cap: 1334567890123,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.45,
    total_volume: 28456789012
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3245.67,
    market_cap: 390123456789,
    market_cap_rank: 2,
    price_change_percentage_24h: -1.23,
    total_volume: 15234567890
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    current_price: 1.00,
    market_cap: 125678901234,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.02,
    total_volume: 45678901234
  }
];

export const mockBitcoinData = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  current_price: 67420.50,
  market_cap: 1334567890123,
  market_cap_rank: 1,
  price_change_percentage_24h: 2.45,
  total_volume: 28456789012,
  sparkline_in_7d: {
    price: [
      65000, 65500, 66000, 66500, 67000, 67200, 67420,
      67100, 67300, 67500, 67200, 67000, 67300, 67420
    ]
  }
};

export const mockGlobalData = {
  data: {
    active_cryptocurrencies: 2456,
    upcoming_icos: 0,
    ongoing_icos: 49,
    ended_icos: 3738,
    markets: 1045,
    total_market_cap: {
      usd: 2567890123456
    },
    total_volume: {
      usd: 89012345678
    },
    market_cap_percentage: {
      btc: 52.1,
      eth: 15.2
    },
    market_cap_change_percentage_24h_usd: 1.85,
    market_cap_change_24h: 47890123456,
    volume_change_percentage_24h: 3.2,
    updated_at: Date.now()
  }
};

export const mockBtcDominance = {
  market_cap_percentage: {
    btc: 52.1
  },
  market_cap_change_percentage_24h_usd: 1.85
};

export const mockVolumeChange = {
  total_volume: {
    usd: 89012345678
  },
  market_cap_change_percentage_24h_usd: 1.85
};
