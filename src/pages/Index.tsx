import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { DashboardCards } from "@/components/DashboardCards";
import { TradingChart } from "@/components/TradingChart";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { SpinningCoin } from "@/components/SpinningCoin";
import { DayTradeSystem } from "@/components/DayTradeSystem";
import { useAuth } from "@/contexts/AuthContext";
import { useTopCoins } from "@/hooks/useTopCoins";
import { TrendingUp, Target, LogOut } from "lucide-react";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { data: topCoins, isLoading: isLoadingTopCoins } = useTopCoins();
  const [isFluxogramaModalOpen, setIsFluxogramaModalOpen] = useState(false);
  
  // Salvar a página atual no localStorage quando ela mudar
  useEffect(() => {
    localStorage.setItem('lastVisitedPage', location.pathname);
  }, [location.pathname]);

  const getActiveItem = () => {
    if (location.pathname === '/daytrade') return 'daytrade';
    if (location.pathname === '/futures') return 'futures';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  // Render the DayTradeSystem component when the activeItem is "daytrade"
  if (activeItem === "daytrade") {
    return (
      <Layout activeItem="daytrade" hideButtons={isFluxogramaModalOpen}>
        <div className="relative z-20">
          <DayTradeSystem onFluxogramaModalOpenChange={setIsFluxogramaModalOpen} />
        </div>
      </Layout>
    );
  }

  // Esta condição não é mais necessária pois o MFuturos agora tem sua própria rota

  return (
    <Layout activeItem={activeItem}>
      <div className="flex-grow">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mt-4">
              Olá {user?.name}, bem-vindo {isAdmin ? 'administrador' : 'usuário'}!
            </h1>
            <p className="text-gray-400 text-sm lg:text-base">
              Aqui está um resumo do seu portfólio.
            </p>
          </div>

          {/* Cards de resumo */}
          <div className="flex flex-col sm:flex-row lg:grid lg:grid-cols-3 items-start gap-2 sm:gap-3 lg:gap-4 w-full overflow-x-auto lg:overflow-x-visible mb-6">
            {/* Card 1 - Meta de Lucro */}
            <div className="px-3 lg:px-4 py-3 bg-[rgba(18,18,18,255)] rounded-xl shadow-2xl border border-white/20 h-20 sm:h-24 flex items-center justify-between w-full sm:min-w-0 sm:flex-shrink-0 lg:flex-shrink">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="text-xs lg:text-sm text-gray-400 whitespace-nowrap">
                    Meta de Lucro
                  </span>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-yellow-400">
                    $30,000.00
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 mb-1">83% atingido</span>
                <div className="w-16 bg-gray-600/30 rounded-full h-1">
                  <div
                    className="bg-yellow-400 h-1 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '83%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card 2 - Saldo Atual */}
            <div className="px-3 lg:px-4 py-3 bg-[rgba(18,18,18,255)] rounded-xl shadow-2xl border border-white/20 h-20 sm:h-24 flex items-center justify-between w-full sm:min-w-0 sm:flex-shrink-0 lg:flex-shrink">
              <div className="flex items-center gap-3">
                <SpinningCoin />
                <div className="flex flex-col">
                  <span className="text-xs lg:text-sm text-gray-400 whitespace-nowrap">
                    Saldo Atual
                  </span>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-green-400">
                    $24,847.52
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-green-400">+2.4%</span>
                <span className="text-xs text-gray-400">hoje</span>
              </div>
            </div>

            {/* Card 3 - DayTrade */}
            <div className="px-3 lg:px-4 py-3 bg-[rgba(18,18,18,255)] rounded-xl shadow-2xl border border-white/20 h-20 sm:h-24 flex items-center justify-between w-full sm:min-w-0 sm:lg:min-w-[220px] sm:flex-shrink-0 lg:flex-shrink">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-neon-blue-400" />
                <div className="flex flex-col">
                  <span className="text-xs lg:text-sm text-gray-400 whitespace-nowrap">
                    DayTrade
                  </span>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-neon-blue-400">
                    $3,247.18
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-neon-blue-400">+5.2%</span>
                <span className="text-xs text-gray-400">hoje</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mb-6 lg:mb-8">
          <DashboardCards />
        </div>

        {/* Trading Chart */}
        <div className="mb-6 lg:mb-8">
          <TradingChart />
        </div>

        {/* Additional Content for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/20 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Últimas Transações
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neon-blue-400/20 rounded-full flex items-center justify-center">
                      <span className="text-neon-blue-400 text-xs font-bold">
                        B
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Compra BTC
                      </p>
                      <p className="text-gray-400 text-xs">
                        {i} horas atrás
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-medium">
                      +$1,250.00
                    </p>
                    <p className="text-gray-400 text-xs">
                      0.027 BTC
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/20 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Top Moedas
            </h3>
            <div className="space-y-3">
              {isLoadingTopCoins ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : (
                topCoins?.map((coin) => (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const span = img.nextElementSibling as HTMLSpanElement;
                            img.style.display = 'none';
                            if (span) span.style.display = 'flex';
                          }}
                        />
                        <span className="text-neon-blue-400 text-xs font-bold hidden">
                          {coin.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {coin.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs ${coin.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                          }`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                )) || []
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
