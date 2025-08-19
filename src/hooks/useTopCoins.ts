import { useQuery } from '@tanstack/react-query';
import { mockTopCoins } from '@/data/mockCryptoData';

interface TopCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

const fetchTopCoins = async (): Promise<TopCoin[]> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=false&price_change_percentage=24h'
    );

    if (!response.ok) {
      return mockTopCoins;
    }

    return response.json();
  } catch (error) {
    return mockTopCoins;
  }
};

export const useTopCoins = () => {
  return useQuery({
    queryKey: ['topCoins'],
    queryFn: fetchTopCoins,
    refetchInterval: 300000, // Atualiza a cada 5 minutos (reduzido de 30s)
    staleTime: 240000, // Considera os dados válidos por 4 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};