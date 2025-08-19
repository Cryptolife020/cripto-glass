import React from 'react';
import Layout from '../components/Layout';
import CryptoScreenerWidget from '../components/CryptoScreenerWidget';
import { TrendingUp } from 'lucide-react';

const CoinTracker: React.FC = () => {
  return (
    <Layout activeItem="tracker">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-neon-blue-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
            Rastreador de Moedas
          </h1>
        </div>
        
        <div className="bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/10 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-2">
              Mercado de Criptomoedas em Tempo Real
            </h2>
            <p className="text-gray-400 text-sm">
              Acompanhe os preços, volumes e variações das principais criptomoedas do mercado
            </p>
          </div>
          
          <div className="w-full h-[600px] rounded-lg overflow-hidden bg-transparent">
            <CryptoScreenerWidget />
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Dados em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Mercado global</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Análise técnica integrada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoinTracker;