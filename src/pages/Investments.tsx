import React, { useState, FormEvent, useEffect } from 'react';
import Layout from '../components/Layout';
import { Briefcase, Target, TrendingUp, Plus, Check, Calendar, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { coingeckoService } from '../services/coingecko';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

interface Investment {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
  amount: number;
  type: string;
  investedAmount: number;
  currentPrice: number;
}

interface Goal {
  id: string;
  assetName: string;
  purchasePrice: number;
  targetPrice: number;
  deadline: string;
  achieved: boolean;
  percentageToTarget: number;
  investedAmount: number; // Novo campo
}

const Investments: React.FC = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [useCoingecko, setUseCoingecko] = useState(true);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    purchasePrice: '',
    amount: '',
    purchaseDate: '',
    investedAmount: '' // Novo campo
  });
  const [newGoal, setNewGoal] = useState({
    assetName: '',
    purchasePrice: '',
    targetPrice: '',
    deadline: '',
    investedAmount: ''
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Novo estado para armazenar os preços atuais
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  // Função para atualizar os preços atuais
  const updateCurrentPrices = async () => {
    const prices: Record<string, number> = {};
    for (const inv of investments) {
      try {
        const currentPrice = await coingeckoService.getAssetCurrentPrice(inv.name);
        if (currentPrice) {
          prices[inv.id] = currentPrice;
        }
      } catch (error) {
        console.error(`Erro ao atualizar preço de ${inv.name}:`, error);
      }
    }
    setCurrentPrices(prices);
  };

  // Atualiza os preços quando a lista de investimentos muda
  useEffect(() => {
    // Só atualiza os preços se houver investimentos e a integração com CoinGecko estiver ativa
    if (investments.length > 0 && useCoingecko) {
      updateCurrentPrices();
      // Atualiza os preços a cada 5 minutos
      const interval = setInterval(updateCurrentPrices, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [investments, useCoingecko]);

  const totalInvested = investments.reduce((acc, inv) => acc + inv.investedAmount, 0);
  const currentValue = investments.reduce((acc, inv) => {
    const currentPrice = currentPrices[inv.id] || inv.purchasePrice;
    return acc + (currentPrice * inv.amount);
  }, 0);
  const totalReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  const gainLossAmount = currentValue - totalInvested;

  // Função para determinar o status do investimento
  const getInvestmentStatus = (returnPercentage: number) => {
    if (returnPercentage > 100) {
      return { text: "🚀 Lucro violento, foi pra lua! 🌙", color: "text-yellow-400", bgColor: "bg-yellow-500/10" };
    } else if (returnPercentage > 0) {
      return { text: "📈 Você está no lucro", color: "text-green-400", bgColor: "bg-green-500/10" };
    } else if (returnPercentage === 0) {
      return { text: "⚖️ Você está no equilíbrio", color: "text-blue-400", bgColor: "bg-blue-500/10" };
    } else {
      return { text: "📉 Você está no prejuízo", color: "text-red-400", bgColor: "bg-red-500/10" };
    }
  };

  const investmentStatus = getInvestmentStatus(totalReturn);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    // Limita o número para 2 casas decimais
    const fixedValue = Number(value.toFixed(2));

    // Formata para dólar brasileiro
    const [integerPart, decimalPart] = fixedValue.toString().split('.');
    const formattedInteger = Number(integerPart).toLocaleString('pt-BR');

    if (decimalPart) {
      // Garante que sempre tenha 2 casas decimais
      const paddedDecimal = decimalPart.padEnd(2, '0').slice(0, 2);
      return `$${formattedInteger},${paddedDecimal}`;
    }
    return `$${formattedInteger},00`;
  };

  const formatNumberInput = (value: string) => {
    // Remove tudo exceto números e vírgula
    value = value.replace(/[^\d,]/g, '');

    // Substitui múltiplas vírgulas por uma única
    value = value.replace(/,+/g, ',');

    // Garante que só há uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts[1];
    }

    return value;
  };

  const parseNumberInput = (value: string) => {
    // Converte número em formato brasileiro para número JavaScript
    return Number(value.replace(',', '.'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'purchasePrice' || name === 'amount' || name === 'investedAmount') {
      setNewInvestment(prev => ({
        ...prev,
        [name]: formatNumberInput(value)
      }));
    } else {
      setNewInvestment(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInputChangeGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'purchasePrice' || name === 'targetPrice' || name === 'investedAmount') {
      setNewGoal(prev => ({
        ...prev,
        [name]: formatNumberInput(value)
      }));
    } else {
      setNewGoal(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitInvestment = async (e: FormEvent) => {
    e.preventDefault();

    let currentPrice = null;

    if (useCoingecko) {
      // Busca o preço atual do ativo apenas se o toggle estiver ativado
      currentPrice = await coingeckoService.getAssetCurrentPrice(newInvestment.name);

      if (!currentPrice) {
        alert('Não foi possível encontrar o preço atual deste ativo na CoinGecko. Desative a integração com CoinGecko ou verifique o nome e tente novamente.');
        return;
      }
    }

    // Calcular quantidade automaticamente: Valor Investido ÷ Preço de Compra
    const investedAmount = parseNumberInput(newInvestment.investedAmount);
    const purchasePrice = parseNumberInput(newInvestment.purchasePrice);
    const calculatedAmount = investedAmount / purchasePrice;

    const investment: Investment = {
      id: Date.now().toString(),
      name: newInvestment.name,
      purchasePrice: purchasePrice,
      purchaseDate: newInvestment.purchaseDate,
      amount: calculatedAmount, // Quantidade calculada automaticamente
      type: 'Cryptocurrency',
      investedAmount: investedAmount,
      currentPrice: currentPrice || purchasePrice // Usa o preço de compra se não houver preço atual
    };

    setInvestments(prev => [...prev, investment]);
    if (currentPrice) {
      setCurrentPrices(prev => ({ ...prev, [investment.id]: currentPrice }));
    }
    setSuccessMessage('Investimento registrado com sucesso');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    setNewInvestment({
      name: '',
      purchasePrice: '',
      amount: '',
      purchaseDate: '',
      investedAmount: ''
    });
  };

  const handleSubmitGoal = (e: FormEvent) => {
    e.preventDefault();

    const goal: Goal = {
      id: Date.now().toString(),
      assetName: newGoal.assetName,
      purchasePrice: parseNumberInput(newGoal.purchasePrice),
      targetPrice: parseNumberInput(newGoal.targetPrice),
      deadline: newGoal.deadline,
      achieved: false,
      percentageToTarget: ((parseNumberInput(newGoal.targetPrice) - parseNumberInput(newGoal.purchasePrice)) / parseNumberInput(newGoal.purchasePrice)) * 100,
      investedAmount: parseNumberInput(newGoal.investedAmount)
    };

    setGoals(prev => [...prev, goal]);
    setSuccessMessage('Meta registrada com sucesso');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    setNewGoal({
      assetName: '',
      purchasePrice: '',
      targetPrice: '',
      deadline: '',
      investedAmount: ''
    });
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    setSuccessMessage('Investimento excluído com sucesso');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <Layout activeItem="investments">
      <div className="container mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="h-6 w-6 text-neon-blue-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
            Meus Investimentos
          </h1>
        </div>

        {/* Painel de Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Briefcase className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-white font-medium">Total Investido</h3>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
            <p className="text-sm text-gray-400 mt-1">Capital inicial</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${investmentStatus.bgColor}`}>
                <TrendingUp className={`h-5 w-5 ${investmentStatus.color}`} />
              </div>
              <h3 className="text-white font-medium">Valor Atual</h3>
            </div>
            <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-400' : totalReturn === 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(currentValue)}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className={`text-sm ${investmentStatus.color} font-medium`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </p>
              <p className={`text-sm ${investmentStatus.color} font-medium`}>
                {gainLossAmount >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainLossAmount))}
              </p>
            </div>
            <div className={`mt-2 px-3 py-1.5 rounded-full text-xs font-medium ${investmentStatus.bgColor} ${investmentStatus.color} text-center`}>
              {investmentStatus.text}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium">Alvo de Meta</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(goals.reduce((acc, goal) => acc + goal.investedAmount, 0))}
            </p>
            <p className="text-sm text-purple-400 mt-1">
              +{goals.reduce((acc, goal) => acc + goal.percentageToTarget, 0).toFixed(2)}% potencial
            </p>
          </div>
        </div>

        {/* Seção de Registro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Formulário de Novo Investimento */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Registrar Novo Investimento</h2>
            <form className="space-y-4" onSubmit={handleSubmitInvestment}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-coingecko"
                    checked={useCoingecko}
                    onCheckedChange={setUseCoingecko}
                  />
                  <Label htmlFor="use-coingecko" className="text-sm font-medium text-gray-300">
                    Integração com CoinGecko
                  </Label>
                </div>
                <span className="text-xs text-gray-400">
                  {useCoingecko ? 'Buscar preço atual automaticamente' : 'Registrar apenas na tabela'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Ativo</label>
                <input
                  type="text"
                  name="name"
                  value={newInvestment.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                  placeholder="Ex: Bitcoin, Ethereum, etc"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preço de Compra</label>
                <input
                  type="text"
                  name="purchasePrice"
                  value={newInvestment.purchasePrice}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Preço unitário do ativo na data da compra</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Valor Investido</label>
                  <input
                    type="text"
                    name="investedAmount"
                    value={newInvestment.investedAmount}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Data da Compra</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="purchaseDate"
                      value={newInvestment.purchaseDate}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:appearance-none"
                      required
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-blue-400 to-neon-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:from-neon-blue-500 hover:to-neon-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar Investimento
              </button>
            </form>
          </div>

          {/* Formulário de Nova Meta */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Registrar Nova Meta</h2>
            <form className="space-y-4" onSubmit={handleSubmitGoal}>
              {/* Espaçamento invisível para simular o toggle do CoinGecko */}
              <div className="flex items-center justify-between mb-4" style={{ visibility: 'hidden' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-5"></div>
                  <div className="text-sm font-medium text-gray-300">
                    Espaço para alinhamento
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  Espaço para alinhamento
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Ativo</label>
                <input
                  type="text"
                  name="assetName"
                  value={newGoal.assetName}
                  onChange={handleInputChangeGoal}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                  placeholder="Ex: Bitcoin, Ethereum, etc"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preço de Compra</label>
                  <input
                    type="text"
                    name="purchasePrice"
                    value={newGoal.purchasePrice}
                    onChange={handleInputChangeGoal}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preço Alvo</label>
                  <input
                    type="text"
                    name="targetPrice"
                    value={newGoal.targetPrice}
                    onChange={handleInputChangeGoal}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Valor Investido</label>
                  <input
                    type="text"
                    name="investedAmount"
                    value={newGoal.investedAmount}
                    onChange={handleInputChangeGoal}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Data Limite</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="deadline"
                      value={newGoal.deadline}
                      onChange={handleInputChangeGoal}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue-400 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:appearance-none"
                      required
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {/* Pequeno espaçamento para alinhar perfeitamente com o botão do formulário de investimento */}
              <div className="mt-[56px]"></div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:from-purple-500 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                Registrar Meta
              </button>
            </form>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {showSuccessMessage && (
          <div className="fixed bottom-4 right-4 bg-black/90 text-green-400 px-4 py-2 rounded-lg shadow-xl border border-green-400/20 text-sm flex items-center gap-2 z-50">
            <Check className="w-4 h-4" />
            {successMessage || 'Excluído com sucesso'}
          </div>
        )}

        {/* Tabelas */}
        <div className="space-y-6">
          {/* Tabela de Investimentos */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neon-blue-500/10">
                  <Briefcase className="h-4 w-4 text-neon-blue-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Investimentos Registrados</h2>
              </div>
              <span className="text-xs text-gray-400">{investments.length} ativos</span>
            </div>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-600/30 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-600/50 [&::-webkit-scrollbar-corner]:bg-transparent">
              <div className="min-w-[750px]">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="bg-indigo-600/20 backdrop-blur-sm">
                    <tr className="border-b border-indigo-500/30">
                      <th className="text-left py-4 px-4 font-semibold text-indigo-200 w-[18%]">Ativo</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Valor Investido</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Data</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Preço Compra</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[14%]">Quantidade</th>
                      <th className="text-center py-4 px-4 font-semibold text-indigo-200 w-[10%]">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          Nenhum registro encontrado
                        </td>
                      </tr>
                    ) : (
                      investments.map(inv => (
                        <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-medium">{inv.name}</td>
                          <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(inv.investedAmount)}</td>
                          <td className="text-right py-4 px-4 text-gray-300">
                            <div className="flex items-center justify-end gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {formatDate(inv.purchaseDate)}
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(inv.purchasePrice)}</td>
                          <td className="text-right py-4 px-4 text-white">{inv.amount.toString().replace('.', ',')}</td>
                          <td className="text-center py-4 px-4">
                            <button
                              onClick={() => handleDeleteInvestment(inv.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tabela de Resultado Atual */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Resultado Atual</h2>
              </div>
              <span className="text-xs text-gray-400">{investments.length} ativos</span>
            </div>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-600/30 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-600/50 [&::-webkit-scrollbar-corner]:bg-transparent">
              <div className="min-w-[900px]">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="bg-indigo-600/20 backdrop-blur-sm">
                    <tr className="border-b border-indigo-500/30">
                      <th className="text-left py-4 px-4 font-semibold text-indigo-200 w-[16%]">Ativo</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Total Investido</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Preço de Compra</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Valor Atual</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[18%]">Ganho/Perda ($)</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[18%]">Ganho/Perda (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          Nenhum registro encontrado
                        </td>
                      </tr>
                    ) : (
                      investments.map(inv => {
                        const currentPrice = currentPrices[inv.id] || inv.purchasePrice;
                        const totalInvested = inv.investedAmount;
                        // Calcular o valor atual baseado na quantidade e preço atual
                        const currentValue = currentPrice * inv.amount;
                        const gainLossAmount = currentValue - totalInvested;
                        const gainLossPercentage = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
                        const isPositive = gainLossAmount >= 0;

                        return (
                          <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-white font-medium">{inv.name}</td>
                            <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(totalInvested)}</td>
                            <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(inv.purchasePrice)}</td>
                            <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(currentValue)}</td>
                            <td className="text-right py-4 px-4">
                              <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )}
                                <span className="font-medium">
                                  {formatCurrency(Math.abs(gainLossAmount))}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )}
                                <span className="font-medium">
                                  {isPositive ? '+' : '-'}{Math.abs(gainLossPercentage).toFixed(2)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tabela de Metas */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Metas Registradas</h2>
              </div>
              <span className="text-xs text-gray-400">{goals.length} metas</span>
            </div>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-600/30 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-600/50 [&::-webkit-scrollbar-corner]:bg-transparent">
              <div className="min-w-[850px]">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="bg-indigo-600/20 backdrop-blur-sm">
                    <tr className="border-b border-indigo-500/30">
                      <th className="text-left py-4 px-4 font-semibold text-indigo-200 w-[18%]">Ativo</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Valor Investido</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Preço Compra</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[16%]">Preço Alvo</th>
                      <th className="text-right py-4 px-4 font-semibold text-indigo-200 w-[14%]">Potencial</th>
                      <th className="text-center py-4 px-4 font-semibold text-indigo-200 w-[12%]">Status</th>
                      <th className="text-center py-4 px-4 font-semibold text-indigo-200 w-[8%]">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          Nenhum registro encontrado
                        </td>
                      </tr>
                    ) : (
                      goals.map(goal => {
                        const potentialReturn = ((goal.targetPrice - goal.purchasePrice) / goal.purchasePrice) * 100;
                        return (
                          <tr key={goal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-white font-medium">{goal.assetName}</td>
                            <td className="text-right py-4 px-4 text-white font-medium">{formatCurrency(goal.investedAmount)}</td>
                            <td className="text-right py-4 px-4 text-white">{formatCurrency(goal.purchasePrice)}</td>
                            <td className="text-right py-4 px-4 text-white">{formatCurrency(goal.targetPrice)}</td>
                            <td className="text-right py-4 px-4 text-green-400 font-medium">+{potentialReturn.toFixed(2)}%</td>
                            <td className="text-center py-4 px-4">
                              {goal.achieved ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                  <Check className="w-3 h-3 mr-1" />
                                  Alcançada
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  Em progresso
                                </span>
                              )}
                            </td>
                            <td className="text-center py-4 px-4">
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Investments; 