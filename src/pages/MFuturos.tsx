import React from 'react';
import MFuturosLeverageCalculator from '../components/MFuturosLeverageCalculator';
import Layout from '../components/Layout';
import { PieChart } from 'lucide-react';

const MFuturos: React.FC = () => {
  return (
    <Layout activeItem="futures">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="h-6 w-6 text-neon-blue-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">Calculadora M-Futuros</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full">
            <MFuturosLeverageCalculator />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MFuturos; 