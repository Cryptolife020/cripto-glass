
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Settings,
  Maximize2,
  LineChart,
  CandlestickChart,
  BarChart3,
} from "lucide-react";

interface TradingChartHeaderProps {
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  chartMode: "area" | "candles";
  setChartMode: (mode: "area" | "candles") => void;
  logarithmicScale: boolean;
  setLogarithmicScale: (scale: boolean) => void;
  coinData: any;
  tradingPairs: string[];
}

export const TradingChartHeader = ({
  selectedPair,
  setSelectedPair,
  chartMode,
  setChartMode,
  logarithmicScale,
  setLogarithmicScale,
  coinData,
  tradingPairs,
}: TradingChartHeaderProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price || 0);
  };

  return (
    <div className="space-y-4">
      {/* Pair Selection and Price - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {coinData?.image && (
              <img
                src={coinData.image}
                alt={coinData.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-transparent text-white font-semibold text-lg focus:outline-none cursor-pointer"
            >
              {tradingPairs.map((pair) => (
                <option
                  key={pair}
                  value={pair}
                  className="bg-crypto-dark-200 text-white"
                >
                  {pair}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Controls - Mobile Optimized */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Chart Mode Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartMode("area")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 sm:gap-2 ${
                chartMode === "area"
                  ? "bg-neon-blue-400 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LineChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Linha</span>
            </button>
            <button
              onClick={() => setChartMode("candles")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 sm:gap-2 ${
                chartMode === "candles"
                  ? "bg-neon-blue-400 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CandlestickChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Velas</span>
            </button>
          </div>

          {/* Scale Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setLogarithmicScale(!logarithmicScale)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 sm:gap-2 ${
                logarithmicScale
                  ? "bg-yellow-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Log</span>
            </button>
          </div>

          <div className="flex gap-1 sm:gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Info - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="text-xl sm:text-2xl font-bold text-white">
          {formatPrice(coinData?.current_price || 0)}
        </span>
        <div
          className={`flex items-center gap-1 ${
            (coinData?.price_change_percentage_24h || 0) >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {(coinData?.price_change_percentage_24h || 0) >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm">
            {(coinData?.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
            {coinData?.price_change_percentage_24h?.toFixed(2) || "0.00"}%
          </span>
        </div>
      </div>
    </div>
  );
};
