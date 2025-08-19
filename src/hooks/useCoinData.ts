
import { useQuery } from '@tanstack/react-query';
import { mockBitcoinData } from '@/data/mockCryptoData';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface CoinGeckoResponse {
  data: CoinData[];
}

const fetchCoinData = async (coinId: string): Promise<CoinData> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h`
    );

    if (!response.ok) {
      return mockBitcoinData;
    }

    const data: CoinData[] = await response.json();
    return data[0];
  } catch (error) {
    return mockBitcoinData;
  }
};

export const useCoinData = (coinId: string) => {
  return useQuery({
    queryKey: ['coinData', coinId],
    queryFn: () => fetchCoinData(coinId),
    refetchInterval: 300000, // Atualiza a cada 5 minutos (reduzido de 30s)
    staleTime: 240000, // Considera os dados válidos por 4 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
