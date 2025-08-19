import React, { useEffect, useRef } from 'react';

export const BarWallstretWidget = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500 Index"
          },
          {
            "proName": "FX_IDC:EURUSD",
            "title": "EUR/USD"
          },
          {
            "proName": "BITSTAMP:BTCUSD",
            "title": "Bitcoin"
          },
          {
            "proName": "BITSTAMP:ETHUSD",
            "title": "Ethereum"
          },
          {
            "proName": "FX_IDC:BRLUSD",
            "title": "BRL/USD"
          },
          {
            "proName": "CRYPTOCAP:BTC.D",
            "title": "BTC.D"
          }
        ],
        "colorTheme": "dark",
        "locale": "br",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showChart": true,
        "displayMode": "adaptive"
      }`;
    container.current.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-[140px] sm:h-[80px]" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
};