
interface TradingChartStatsProps {
  coinData: any;
}

export const TradingChartStats = ({ coinData }: TradingChartStatsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num?.toFixed(2) || "0.00"}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-400">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
        <span className="font-medium">Volume:</span>
        <span>{formatNumber(coinData?.total_volume || 0)}</span>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
        <span className="font-medium">24h Change:</span>
        <span className={`${
          (coinData?.price_change_percentage_24h || 0) >= 0 
            ? "text-green-400" 
            : "text-red-400"
        }`}>
          {(coinData?.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
          {coinData?.price_change_percentage_24h?.toFixed(2) || "0.00"}%
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
        <span className="font-medium">Market Cap:</span>
        <span>{formatNumber(coinData?.market_cap || 0)}</span>
      </div>
    </div>
  );
};
