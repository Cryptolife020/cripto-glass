import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DaytradeService } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Home,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  currentCycle: number;
  totalCycles: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: number;
  totalProfit: number;
  totalLoss: number;
  netResult: number;
  currentBox1: number;
  currentBox2: number;
  initialInvestment: number;
  totalGrowth: number;
  avgDailyReturn: number;
  bestCycle: number;
  worstCycle: number;
  completedCycles: any[];
  currentOperations: any[];
  recentOperations: any[];
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'cycles' | 'analytics'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do ciclo atual
      const currentCycle = await DaytradeService.loadCurrentCycle();
      const setup = await DaytradeService.loadSetup();
      const allStats = await DaytradeService.loadStatistics();
      const currentOperations = currentCycle ? await DaytradeService.loadOperations(currentCycle.current_cycle) : [];
      
      // Carregar operações recentes de todos os ciclos
      const recentOperations = [];
      for (let i = Math.max(1, (currentCycle?.current_cycle || 1) - 2); i <= (currentCycle?.current_cycle || 1); i++) {
        const cycleOps = await DaytradeService.loadOperations(i);
        recentOperations.push(...cycleOps.map(op => ({ ...op, cycle: i })));
      }
      recentOperations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Calcular estatísticas agregadas
      const totalOperations = allStats.reduce((sum, stat) => sum + stat.total_operations, 0);
      const successfulOperations = allStats.reduce((sum, stat) => sum + stat.successful_operations, 0);
      const failedOperations = allStats.reduce((sum, stat) => sum + stat.failed_operations, 0);
      const totalProfit = allStats.reduce((sum, stat) => sum + stat.total_profit, 0);
      const totalLoss = allStats.reduce((sum, stat) => sum + stat.total_loss, 0);
      const netResult = totalProfit - Math.abs(totalLoss);
      
      const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;
      
      // Encontrar melhor e pior ciclo
      const bestCycle = allStats.length > 0 ? allStats.reduce((best, current) => 
        current.net_result > best.net_result ? current : best
      ).cycle_number : 0;
      
      const worstCycle = allStats.length > 0 ? allStats.reduce((worst, current) => 
        current.net_result < worst.net_result ? current : worst
      ).cycle_number : 0;
      
      // Calcular crescimento total
      const initialInvestment = setup?.box1_initial_fixed || 0;
      const currentTotal = (setup?.box1_value || 0) + (setup?.box2_value || 0);
      const totalGrowth = initialInvestment > 0 ? ((currentTotal - initialInvestment) / initialInvestment) * 100 : 0;
      
      // Calcular retorno médio diário
      const avgDailyReturn = totalOperations > 0 ? netResult / totalOperations : 0;

      setStats({
        currentCycle: currentCycle?.current_cycle || 1,
        totalCycles: allStats.length,
        totalOperations,
        successfulOperations,
        failedOperations,
        successRate,
        totalProfit,
        totalLoss,
        netResult,
        currentBox1: setup?.box1_value || 0,
        currentBox2: setup?.box2_value || 0,
        initialInvestment,
        totalGrowth,
        avgDailyReturn,
        bestCycle,
        worstCycle,
        completedCycles: currentCycle?.completed_cycles_history || [],
        currentOperations,
        recentOperations: recentOperations.slice(0, 10)
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Carregando Dashboard</h2>
          <p className="text-blue-200">Analisando seus dados de trading...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center max-w-md">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Dados Insuficientes</h2>
          <p className="text-gray-300 mb-6">Inicie algumas operações para ver as métricas do dashboard.</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/daytrade')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar ao DayTrade
            </button>
            <button
              onClick={loadDashboardData}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/daytrade')}
                className="text-white hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                  Dashboard DayTrade
                </h1>
                <p className="text-blue-200 text-sm sm:text-base">Análise Profissional de Performance</p>
              </div>
            </div>
            <button 
              onClick={loadDashboardData}
              className="text-white hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-1">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'cycles', label: 'Ciclos', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Resultado Líquido</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.netResult)}</p>
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {formatPercentage(stats.totalGrowth)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                    <p className="text-blue-400 text-sm">{stats.successfulOperations}/{stats.totalOperations} operações</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Ciclo Atual</p>
                    <p className="text-2xl font-bold text-white">{stats.currentCycle}</p>
                    <p className="text-purple-400 text-sm">{stats.currentOperations.length} operações</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">Retorno Médio/Dia</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.avgDailyReturn)}</p>
                    <p className="text-orange-400 text-sm">Por operação</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Operações Recentes */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Operações Recentes
              </h3>
              {stats.recentOperations.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOperations.map((op) => (
                    <div key={op.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          op.operation_type === 'profit' ? 'bg-green-400' :
                          op.operation_type === 'loss' ? 'bg-red-400' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-white font-medium">Ciclo {op.cycle} - Dia {op.day_number}</p>
                          <p className="text-gray-400 text-sm">{formatDate(op.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">Meta: {formatCurrency(op.goal_value)}</p>
                        {op.operation_value && (
                          <p className={`font-medium ${
                            op.operation_type === 'profit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(op.operation_value)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma operação registrada</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Gráfico de Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Distribuição de Resultados
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Operações Lucrativas</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${stats.totalOperations > 0 ? (stats.successfulOperations / stats.totalOperations) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-medium w-8">{stats.successfulOperations}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Operações com Perda</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${stats.totalOperations > 0 ? (stats.failedOperations / stats.totalOperations) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-red-400 font-medium w-8">{stats.failedOperations}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Balanço Financeiro
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total de Lucros</span>
                    <span className="text-green-400 font-bold">{formatCurrency(stats.totalProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total de Perdas</span>
                    <span className="text-red-400 font-bold">{formatCurrency(Math.abs(stats.totalLoss))}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Resultado Líquido</span>
                      <span className={`font-bold text-lg ${stats.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(stats.netResult)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas Avançadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Melhor Ciclo</h4>
                <p className="text-2xl font-bold text-yellow-400">#{stats.bestCycle}</p>
                <p className="text-gray-400 text-sm">Maior retorno</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Pior Ciclo</h4>
                <p className="text-2xl font-bold text-red-400">#{stats.worstCycle}</p>
                <p className="text-gray-400 text-sm">Maior perda</p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
                <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Crescimento Total</h4>
                <p className="text-2xl font-bold text-purple-400">{formatPercentage(stats.totalGrowth)}</p>
                <p className="text-gray-400 text-sm">Desde o início</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Status dos Caixas Atuais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">Caixa 1 (Principal)</h4>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.currentBox1)}</p>
                  <p className="text-blue-400 text-sm">Valor atual</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2">Caixa 2 (Reserva)</h4>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.currentBox2)}</p>
                  <p className="text-purple-400 text-sm">Stop Loss</p>
                </div>
              </div>
            </div>

            {/* Histórico de Ciclos */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Histórico de Ciclos Completados</h3>
              {stats.completedCycles.length > 0 ? (
                <div className="space-y-3">
                  {stats.completedCycles.map((cycle, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Ciclo #{index + 1}</span>
                        <span className="text-gray-400 text-sm">30 dias completados</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-300">
                        Valor final: {formatCurrency(cycle[cycle.length - 1] || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum ciclo completado ainda</p>
                  <p className="text-gray-500 text-sm">Complete seu primeiro ciclo de 30 dias para ver o histórico</p>
                </div>
              )}
            </div>

            {/* Operações do Ciclo Atual */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Operações do Ciclo Atual</h3>
              {stats.currentOperations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.currentOperations.map((op) => (
                    <div key={op.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Dia {op.day_number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          op.operation_type === 'profit' ? 'bg-green-500/20 text-green-400' :
                          op.operation_type === 'loss' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {op.operation_type === 'profit' ? 'Lucro' :
                           op.operation_type === 'loss' ? 'Perda' : 'Pendente'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <p>Meta: {formatCurrency(op.goal_value)}</p>
                        {op.operation_value && (
                          <p>Resultado: {formatCurrency(op.operation_value)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma operação registrada</p>
                  <p className="text-gray-500 text-sm">Inicie suas operações para acompanhar o progresso</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Análise de Tendências */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Performance por Ciclo */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Performance por Ciclo
                </h3>
                {stats.completedCycles.length > 0 ? (
                  <div className="space-y-4">
                    {stats.completedCycles.map((cycle, index) => {
                      const cycleValue = cycle[cycle.length - 1] || 0;
                      const initialValue = stats.initialInvestment;
                      const growth = initialValue > 0 ? ((cycleValue - initialValue) / initialValue) * 100 : 0;

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium">Ciclo {index + 1}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{formatCurrency(cycleValue)}</p>
                            <p className={`text-sm ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPercentage(growth)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhum ciclo completado</p>
                    <p className="text-gray-500 text-sm">Complete ciclos para ver a análise de tendências</p>
                  </div>
                )}
              </div>

              {/* Distribuição de Operações */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Distribuição de Operações
                </h3>
                {stats.totalOperations > 0 ? (
                  <div className="space-y-6">
                    {/* Gráfico de Pizza Visual */}
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Círculo de fundo */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                        />
                        {/* Arco de sucessos */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="8"
                          strokeDasharray={`${(stats.successfulOperations / stats.totalOperations) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                        {/* Arco de perdas */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="8"
                          strokeDasharray={`${(stats.failedOperations / stats.totalOperations) * 251.2} 251.2`}
                          strokeDashoffset={`-${(stats.successfulOperations / stats.totalOperations) * 251.2}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Percentual central */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(0)}%</p>
                          <p className="text-gray-400 text-sm">Sucesso</p>
                        </div>
                      </div>
                    </div>

                    {/* Legenda */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300">Operações Lucrativas</span>
                        </div>
                        <span className="text-green-400 font-medium">{stats.successfulOperations}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-300">Operações com Perda</span>
                        </div>
                        <span className="text-red-400 font-medium">{stats.failedOperations}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhuma operação registrada</p>
                    <p className="text-gray-500 text-sm">Realize operações para ver a distribuição</p>
                  </div>
                )}
              </div>
            </div>

            {/* Análise de Tendências Detalhada */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Análise de Tendências
              </h3>

              {stats.recentOperations.length > 0 ? (
                <div className="space-y-6">
                  {/* Timeline de Operações Recentes */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Timeline de Performance</h4>
                    <div className="space-y-3">
                      {stats.recentOperations.slice(0, 8).map((op, index) => (
                        <div key={op.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              op.operation_type === 'profit' ? 'bg-green-400' :
                              op.operation_type === 'loss' ? 'bg-red-400' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-gray-300 text-sm">
                              {formatDate(op.created_at)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className="text-white font-medium">
                              Ciclo {op.cycle} - Dia {op.day_number}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-300 text-sm">Meta: {formatCurrency(op.goal_value)}</p>
                            {op.operation_value && (
                              <p className={`font-medium ${
                                op.operation_type === 'profit' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(op.operation_value)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Métricas de Tendência */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {stats.recentOperations.filter(op => op.operation_type === 'profit').length}
                      </div>
                      <div className="text-gray-400 text-sm">Lucros Recentes</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-400 mb-1">
                        {stats.recentOperations.filter(op => op.operation_type === 'loss').length}
                      </div>
                      <div className="text-gray-400 text-sm">Perdas Recentes</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {stats.recentOperations.length > 0 ?
                          ((stats.recentOperations.filter(op => op.operation_type === 'profit').length / stats.recentOperations.length) * 100).toFixed(0) : 0}%
                      </div>
                      <div className="text-gray-400 text-sm">Taxa Recente</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma operação para análise</p>
                  <p className="text-gray-500 text-sm">Realize algumas operações para ver as tendências</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
