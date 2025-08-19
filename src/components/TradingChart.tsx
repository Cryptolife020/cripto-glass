import { useState } from "react";
import { TradingViewWidget } from "./TradingViewWidget";
import { TradingChartHeader } from "./trading/TradingChartHeader";
import { TradingChartStats } from "./trading/TradingChartStats";
import { useCoinData } from "@/hooks/useCoinData";

export const TradingChart = () => {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [chartMode, setChartMode] = useState<"area" | "candles">("area");
  const [logarithmicScale, setLogarithmicScale] = useState(false);

  const tradingPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT"];

  // Map trading pairs to CoinGecko IDs
  const getCoinId = (pair: string) => {
    const coinMap: { [key: string]: string } = {
      "BTC/USDT": "bitcoin",
      "ETH/USDT": "ethereum",
      "BNB/USDT": "binancecoin",
      "ADA/USDT": "cardano",
    };
    return coinMap[pair] || "bitcoin";
  };

  const { data: coinData, isLoading } = useCoinData(getCoinId(selectedPair));

  const getTradingViewSymbol = (pair: string) => {
    const symbolMap: { [key: string]: string } = {
      "BTC/USDT": "BINANCE:BTCUSDT",
      "ETH/USDT": "BINANCE:ETHUSDT",
      "BNB/USDT": "BINANCE:BNBUSDT",
      "ADA/USDT": "BINANCE:ADAUSDT",
    };
    return symbolMap[pair] || "BINANCE:BTCUSDT";
  };

  if (isLoading) {
    return (
      <div className="bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6">
        <div className="flex items-center justify-center h-60 sm:h-80">
          <div className="text-white">Carregando dados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/20">
      <div className="p-4 sm:p-6">
        <TradingChartHeader
          selectedPair={selectedPair}
          setSelectedPair={setSelectedPair}
          chartMode={chartMode}
          setChartMode={setChartMode}
          logarithmicScale={logarithmicScale}
          setLogarithmicScale={setLogarithmicScale}
          coinData={coinData}
          tradingPairs={tradingPairs}
        />

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-4">
            Análise de Mercado
          </h2>
        </div>
      </div>

      <div className="-mx-px mb-4">
        <TradingViewWidget
          symbol={getTradingViewSymbol(selectedPair)}
          theme="dark"
          chartType={chartMode}
          allowFullscreen={true}
          logarithmicScale={logarithmicScale}
        />
      </div>

      <div className="p-4 sm:p-6">
        <TradingChartStats coinData={coinData} />
      </div>
    </div>
  );
};
