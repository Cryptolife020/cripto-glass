import React, { useEffect, useRef, memo } from 'react';

const CryptoScreenerWidget = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "defaultColumn": "overview",
        "screener_type": "crypto_mkt",
        "displayCurrency": "USD",
        "colorTheme": "dark",
        "isTransparent": true,
        "locale": "br",
        "width": "100%",
        "height": "100%"
      }`;

    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container h-[600px]" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://br.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Monitore todos os mercados no TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(CryptoScreenerWidget); 