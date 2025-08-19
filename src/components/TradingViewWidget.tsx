import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "light" | "dark";
  chartType?: "area" | "candles";
  allowFullscreen?: boolean;
  logarithmicScale?: boolean;
}

export const TradingViewWidget = ({
  symbol = "BINANCE:BTCUSDT",
  theme = "dark",
  chartType = "area",
  allowFullscreen = true,
  logarithmicScale = false,
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "America/Sao_Paulo",
      theme: theme,
      style: chartType === "area" ? "3" : "1", // 3 for Area, 1 for Candles
      locale: "pt_BR",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_volume: true,
      studies: [],
      show_popup_button: allowFullscreen,
      popup_width: "1000",
      popup_height: "650",
      container_id: "tradingview_widget",
      hide_side_toolbar: true,
      withdateranges: true,
      hide_top_toolbar: false,
      save_drawings: false,
      toolbarbg:
        theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.8)",
      scale: logarithmicScale ? 1 : 0, // 1 for logarithmic, 0 for linear
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, theme, chartType, allowFullscreen, logarithmicScale]);

  return (
    <div className="tradingview-widget-container h-[500px] w-full">
      <div
        ref={containerRef}
        className="tradingview-widget h-full w-full"
        id="tradingview_widget"
      />
    </div>
  );
};
