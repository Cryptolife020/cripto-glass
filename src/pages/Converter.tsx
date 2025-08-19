import React, { useState } from 'react';
import Layout from '../components/Layout';
import { ArrowLeftRight, Calculator, TrendingUp } from 'lucide-react';

const Converter: React.FC = () => {
  const [fromAmount, setFromAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('67420.50');

  const cryptoCurrencies = [
    { code: 'BTC', name: 'Bitcoin', price: 67420.50 },
    { code: 'ETH', name: 'Ethereum', price: 3245.67 },
    { code: 'BNB', name: 'Binance Coin', price: 645.23 },
    { code: 'ADA', name: 'Cardano', price: 0.52 },
    { code: 'SOL', name: 'Solana', price: 198.45 },
    { code: 'DOT', name: 'Polkadot', price: 7.89 },
  ];

  const fiatCurrencies = [
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  ];

  const handleConvert = () => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount)) return;

    // Simulação de conversão (em produção, usar API real)
    let convertedValue = amount;
    
    if (fromCurrency === 'BTC' && toCurrency === 'USD') {
      convertedValue = amount * 67420.50;
    } else if (fromCurrency === 'ETH' && toCurrency === 'USD') {
      convertedValue = amount * 3245.67;
    } else if (fromCurrency === 'USD' && toCurrency === 'BTC') {
      convertedValue = amount / 67420.50;
    }
    
    setResult(convertedValue.toFixed(8));
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    handleConvert();
  };

  return (
    <Layout activeItem="converter">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="h-6 w-6 text-neon-blue-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
            Conversor de Moedas
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversor Principal */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-neon-blue-400" />
              <h2 className="text-lg font-semibold text-white">Conversão Instantânea</h2>
            </div>

            <div className="space-y-4">
              {/* De */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">De</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                    placeholder="Quantidade"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                  >
                    <optgroup label="Criptomoedas">
                      {cryptoCurrencies.map((crypto) => (
                        <option key={crypto.code} value={crypto.code} className="bg-gray-800">
                          {crypto.code} - {crypto.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Moedas Fiduciárias">
                      {fiatCurrencies.map((fiat) => (
                        <option key={fiat.code} value={fiat.code} className="bg-gray-800">
                          {fiat.code} - {fiat.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Botão de Troca */}
              <div className="flex justify-center">
                <button
                  onClick={swapCurrencies}
                  className="p-2 bg-neon-blue-500/20 hover:bg-neon-blue-500/30 rounded-full transition-colors"
                >
                  <ArrowLeftRight className="h-5 w-5 text-neon-blue-400" />
                </button>
              </div>

              {/* Para */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Para</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={result}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white bg-gray-800/50"
                  />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                  >
                    <optgroup label="Criptomoedas">
                      {cryptoCurrencies.map((crypto) => (
                        <option key={crypto.code} value={crypto.code} className="bg-gray-800">
                          {crypto.code} - {crypto.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Moedas Fiduciárias">
                      {fiatCurrencies.map((fiat) => (
                        <option key={fiat.code} value={fiat.code} className="bg-gray-800">
                          {fiat.code} - {fiat.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <button
                onClick={handleConvert}
                className="w-full py-3 bg-gradient-to-r from-neon-blue-500 to-neon-blue-600 hover:from-neon-blue-600 hover:to-neon-blue-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Converter
              </button>
            </div>
          </div>

          {/* Tabela de Cotações */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Cotações Atuais</h2>
            </div>

            <div className="space-y-3">
              {cryptoCurrencies.map((crypto) => (
                <div key={crypto.code} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{crypto.code}</div>
                    <div className="text-sm text-gray-400">{crypto.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-green-400">+2.45%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 glass-card p-4 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              💡 <strong>Dica:</strong> Os preços são atualizados em tempo real. Use este conversor para calcular rapidamente o valor de suas criptomoedas.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Converter;
