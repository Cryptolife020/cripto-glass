
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { useCoinGeckoData } from "@/hooks/useCoinGeckoData";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
  description?: string;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  isLoading,
}: StatCardProps) => {
  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[rgba(18,18,18,255)] rounded-2xl shadow-2xl border border-white/20 hover:bg-[rgba(18,18,18,255)] transition-all duration-300 group min-w-0 hover:shadow-3xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[rgba(30,30,100,0.3)] rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neon-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium truncate">
              {title}
            </h3>
            {description && (
              <p className="text-gray-500 text-xs mt-1 hidden sm:block truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${changeType === "up"
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
            }`}
        >
          {changeType === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="text-xs font-medium whitespace-nowrap">
            {change}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-neon-blue-400 transition-colors truncate">
          {isLoading ? (
            <span className="animate-pulse bg-gray-600 rounded h-6 w-20 block"></span>
          ) : (
            value
          )}
        </p>
        {description && (
          <p className="text-gray-500 text-xs sm:hidden truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const DashboardCards = () => {
  const { data, isLoading, error, btcDominanceChange, volumeChange } = useCoinGeckoData();

  // Formatação brasileira consistente com DayTradeSystem
  const formatarValor = (valor: number) => {
    return (valor < 0 ? '-' : '') + '$' + new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(valor));
  };

  const formatCurrency = (value: number) => {
    return '$' + new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/[^\d.,]/g, '');
  };

  const formatVolume = (value: number) => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2).replace('.', ',')}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2).replace('.', ',')}B`;
    } else {
      return formatCurrency(value);
    }
  };

  // Valores padrão em caso de erro ou carregamento
  const btcDominance = data?.market_cap_percentage.btc || 52.8;
  const marketCap = data?.total_market_cap.usd || 1850000000000;
  const volume24h = data?.total_volume.usd || 85000000000;

  // Obter as mudanças percentuais reais da API
  const btcDominanceChangeValue = btcDominanceChange || 0;
  const marketCapChange = data?.market_cap_change_percentage_24h_usd || 0;
  // Usar dados de mudança de volume do hook ou valor padrão
  const volumeChangeValue = volumeChange || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full max-w-full overflow-hidden">
      <StatCard
        title="Dominância do BTC"
        value={`${btcDominance.toFixed(1)}%`}
        change={`${btcDominanceChangeValue >= 0 ? '+' : ''}${btcDominanceChangeValue.toFixed(2)}%`}
        changeType={btcDominanceChangeValue >= 0 ? "up" : "down"}
        icon={Activity}
        description="Participação no mercado total"
        isLoading={isLoading}
      />

      <StatCard
        title="Market Cap Total"
        value={formatVolume(marketCap)}
        change={`${marketCapChange >= 0 ? '+' : ''}${marketCapChange.toFixed(2)}%`}
        changeType={marketCapChange >= 0 ? "up" : "down"}
        icon={DollarSign}
        description="Capitalização de mercado"
        isLoading={isLoading}
      />

      <StatCard
        title="Volume 24h"
        value={formatVolume(volume24h)}
        change={`${volumeChangeValue >= 0 ? '+' : ''}${volumeChangeValue.toFixed(2)}%`}
        changeType={volumeChangeValue >= 0 ? "up" : "down"}
        icon={TrendingUp}
        description="Volume de negociação"
        isLoading={isLoading}
      />
    </div>
  );
};
