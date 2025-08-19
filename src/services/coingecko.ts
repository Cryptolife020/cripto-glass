import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinPrice {
  id: string;
  current_price: number;
}

export const coingeckoService = {
  // Busca o ID da moeda pelo nome/símbolo
  searchCoin: async (query: string): Promise<string | null> => {
    try {
      const response = await axios.get(`${COINGECKO_API}/search`, {
        params: { query }
      });
      
      if (response.data.coins.length > 0) {
        return response.data.coins[0].id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar moeda:', error);
      return null;
    }
  },

  // Busca o preço atual da moeda pelo ID
  getCurrentPrice: async (coinId: string): Promise<number | null> => {
    try {
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        }
      });

      if (response.data[coinId]) {
        return response.data[coinId].usd;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Função auxiliar que combina a busca do ID e do preço
  getAssetCurrentPrice: async (assetName: string): Promise<number | null> => {
    const coinId = await coingeckoService.searchCoin(assetName);
    if (coinId) {
      return await coingeckoService.getCurrentPrice(coinId);
    }
    return null;
  }
}; 