import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CustomSlider } from './ui/custom-slider';
import { cn } from '@/lib/utils';

const MFuturosLeverageCalculator: React.FC = () => {
  // Estados para gerenciar os valores dos inputs
  const [leverage, setLeverage] = useState(1);
  const [investmentPercentage, setInvestmentPercentage] = useState(100);
  const [investment, setInvestment] = useState('');
  const [mode, setMode] = useState('isolado');
  const [expectedProfit, setExpectedProfit] = useState('');
  const [isFixedProfitMode, setIsFixedProfitMode] = useState(false);

  // Estados para resultados
  const [leveragedInvestment, setLeveragedInvestment] = useState('$0,00');
  const [liquidation, setLiquidation] = useState('0,00%');
  const [roi, setRoi] = useState('0%');
  const [roe, setRoe] = useState('0%');
  const [profitDisplay, setProfitDisplay] = useState('$0,00');

  // Função para formatação brasileira de moeda
  const formatarMoedaBrasileira = (valor: number): string => {
    return '$' + new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(valor));
  };

  // CORREÇÃO: Funções de cálculo otimizadas para atualização instantânea
  const calculateResults = () => {
    // Converte valores vazios para 0
    const safeInvestment = investment === '' ? 0 : parseFloat(investment);
    const safeExpectedProfit = expectedProfit === '' ? 0 : parseFloat(expectedProfit);

    const usedInvestment = safeInvestment * (investmentPercentage / 100);
    const totalLeveraged = usedInvestment * leverage;
    const liquidationValue = mode === 'cruzado'
      ? calculateLiquidationCrossed(leverage, investmentPercentage)
      : calculateLiquidationIsolated(leverage);

    // Atualização instantânea dos valores calculados
    setLeveragedInvestment(formatarMoedaBrasileira(totalLeveraged));
    setLiquidation(`${liquidationValue.replace('.', ',')}%`);
    updateRisk(parseFloat(liquidationValue));

    const profit = isFixedProfitMode
      ? safeExpectedProfit
      : totalLeveraged * (safeExpectedProfit / 100);

    setProfitDisplay(formatarMoedaBrasileira(profit));

    const roiValue = totalLeveraged > 0 ? (profit / totalLeveraged) * 100 : 0;
    const roeValue = usedInvestment > 0 ? (profit / usedInvestment) * 100 : 0;

    setRoi(`${roiValue.toFixed(2).replace('.', ',')}%`);
    setRoe(`${roeValue.toFixed(2).replace('.', ',')}%`);
  };

  const calculateLiquidationCrossed = (leverage: number, percentage: number) => {
    return percentage === 100
      ? (100 / leverage).toFixed(2)
      : (100 / leverage * (100 / percentage)).toFixed(2);
  };

  const calculateLiquidationIsolated = (leverage: number) => {
    return (100 / leverage).toFixed(2);
  };

  // Referências para elementos do DOM
  const needleRef = useRef<HTMLDivElement>(null);
  const riskTextRef = useRef<HTMLSpanElement>(null);

  // Função otimizada para atualizar o indicador de risco
  const updateRisk = (value: number) => {
    // Usar as referências em vez de document.getElementById
    const needle = needleRef.current;
    const riskText = riskTextRef.current;

    if (needle && riskText) {
      // Calcular o ângulo da agulha baseado no valor
      const angle = Math.max(Math.min((value / 100) * 180 - 90, 90), -90);
      needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

      // Atualizar o texto e cor baseado no nível de risco
      let riskLevel = 'Moderado';
      let riskColor = 'rgba(255, 180, 0, 1)';

      if (value <= 10) {
        riskLevel = 'Risco Extremo';
        riskColor = 'rgba(139, 0, 0, 1)';
      } else if (value <= 30) {
        riskLevel = 'Alto Risco';
        riskColor = 'rgba(255, 0, 0, 1)';
      } else if (value <= 60) {
        riskLevel = 'Risco Moderado';
        riskColor = 'rgba(255, 180, 0, 1)';
      } else if (value <= 90) {
        riskLevel = 'Baixo Risco';
        riskColor = 'rgba(0, 128, 0, 1)';
      } else {
        riskLevel = 'Muito Seguro';
        riskColor = 'rgba(0, 100, 0, 1)';
      }

      riskText.textContent = riskLevel;
      riskText.style.background = riskColor;
      riskText.style.color = 'white';
    }
  };

  // Referências para o gráfico e o canvas
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inicializar o gráfico apenas uma vez
  useEffect(() => {
    if (canvasRef.current && !chartRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [10, 20, 30, 30, 10],
              backgroundColor: [
                '#8B0000',   // Vermelho escuro
                '#FF0000',   // Vermelho
                '#FFFF00',   // Amarelo
                '#00ff00',   // Verde
                '#006400'    // Verde escuro
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: '50%',
            animation: false,
            plugins: { legend: { display: false } }
          }
        });
      }
    }

    // Limpeza ao desmontar o componente
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  // Calcular valores na primeira renderização
  useEffect(() => {
    calculateResults();
  }, []);

  // CORREÇÃO: Atualização instantânea sem debounce para resposta imediata
  useEffect(() => {
    calculateResults();
  }, [leverage, investmentPercentage, investment, mode, expectedProfit, isFixedProfitMode]);

  // Estilo de resultado comum para melhorar a performance
  const resultCardStyle = "p-2 bg-[rgba(18,18,18,255)] border border-white/10 rounded-lg";

  return (
    <Card className="w-full border border-white/10 bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coluna da Esquerda - Configurações */}
          <div className="space-y-4">
            {/* Alavancagem */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="leverage" className="text-white text-sm">Alavancagem (até 200x):</Label>
                <span className="text-indigo-400 font-bold">{leverage}x</span>
              </div>
              <div className="w-full">
                <CustomSlider
                  id="leverage"
                  min={1}
                  max={200}
                  step={1}
                  value={[leverage]}
                  onValueChange={(value) => setLeverage(value[0])}
                  className="w-full focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Modo */}
            <div className="space-y-2">
              <Label className="text-white">Modo</Label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setMode('isolado')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg transition-all duration-200 ease-in-out",
                    mode === 'isolado'
                      ? "bg-neon-blue-400 text-white shadow-md"
                      : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  Isolado
                </button>
                <button
                  type="button"
                  onClick={() => setMode('cruzado')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg transition-all duration-200 ease-in-out",
                    mode === 'cruzado'
                      ? "bg-neon-blue-400 text-white shadow-md"
                      : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  Cruzado
                </button>
              </div>
            </div>

            {/* Investimento */}
            <div className="space-y-2">
              <Label htmlFor="investment" className="text-white">Investimento ($)</Label>
              <Input
                id="investment"
                type="text"
                inputMode="numeric"
                placeholder="Digite aqui seu investimento"
                value={investment}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permite apenas números e ponto decimal
                  if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                    setInvestment(value);
                  }
                }}
                className="placeholder:text-gray-500 bg-white/5 border-white/10 text-white focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 focus-visible:outline-none transition-colors"
              />
            </div>

            {/* Porcentagem do Investimento */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="investmentPercentage" className="text-white text-sm">% do Investimento (1-100%):</Label>
                <span className="text-indigo-400 font-bold">{investmentPercentage}%</span>
              </div>
              <div className="w-full">
                <CustomSlider
                  id="investmentPercentage"
                  min={1}
                  max={100}
                  step={1}
                  value={[investmentPercentage]}
                  onValueChange={(value) => setInvestmentPercentage(value[0])}
                  className="w-full focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Modo de Lucro */}
            <div className="space-y-2">
              <Label className="text-white">Modo de Lucro</Label>
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsFixedProfitMode(false)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg transition-all duration-200 ease-in-out",
                    !isFixedProfitMode
                      ? "bg-neon-blue-400 text-white shadow-md"
                      : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setIsFixedProfitMode(true)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg transition-all duration-200 ease-in-out",
                    isFixedProfitMode
                      ? "bg-neon-blue-400 text-white shadow-md"
                      : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  $
                </button>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Digite o valor de lucro previsto"
                value={expectedProfit}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permite apenas números, ponto decimal e sinal negativo
                  if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                    setExpectedProfit(value);
                  }
                }}
                className="placeholder:text-gray-500 bg-white/5 border-white/10 text-white focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 focus-visible:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Coluna da Direita - Resultados */}
          <div className="space-y-4">
            {/* Resultados - Seção Unificada */}
            <div className={`${resultCardStyle} p-4`}>
              <h3 className="text-white text-lg font-semibold mb-3 border-b border-white/10 pb-2">Resumo da Operação</h3>

              {/* Investimento e Uso */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Investimento Total</div>
                  <div className="text-white text-lg font-medium">
                    {investment !== '' ? formatarMoedaBrasileira(parseFloat(investment)) : '$0,00'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Valor Utilizado ({investmentPercentage}%)</div>
                  <div className="text-white text-lg font-medium">
                    {investment !== '' ? formatarMoedaBrasileira(parseFloat(investment) * investmentPercentage / 100) : '$0,00'}
                  </div>
                </div>
              </div>

              {/* Alavancagem e Liquidação */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Valor Alavancado</div>
                  <div className="text-neon-blue-400 text-lg font-semibold">{leveragedInvestment}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Ponto de Liquidação</div>
                  <div className="text-red-400 text-lg font-semibold">{liquidation}</div>
                </div>
              </div>

              {/* ROI e ROE */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">ROI (Retorno sobre Investido)</div>
                  <div className="text-green-400 text-lg font-semibold">{roi}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">ROE (Retorno sobre Capital)</div>
                  <div className="text-green-400 text-lg font-semibold">{roe}</div>
                </div>
              </div>

              {/* Lucro Estimado - Destacado */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Lucro Estimado</span>
                  <div className="text-xl font-bold text-green-400">{profitDisplay}</div>
                </div>
              </div>
            </div>

            {/* Indicador de Risco */}
            <div className="bg-[rgba(18,18,18,255)] p-3 rounded-lg mt-0">
              <h2 className="text-white text-center mb-2">Indicador de Risco Operacional</h2>
              <div className="flex justify-center items-center">
                <div className="gauge-container relative w-[280px] h-[100px]">
                  <canvas ref={canvasRef}></canvas>
                  <div ref={needleRef} className="needle absolute top-[20%] left-1/2 w-[6px] h-[80px] bg-black transform -translate-x-1/2 origin-bottom transition-all duration-500 rounded-[4px] border-2 border-white">
                    <div className="absolute bottom-[-10px] left-1/2 w-[16px] h-[16px] bg-black rounded-full border-2 border-white transform -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
              <p className="risk-label text-white text-sm text-center mt-4">
                Nível de Risco: <span ref={riskTextRef} className="px-2 py-1 rounded-md">Moderado</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFuturosLeverageCalculator;