import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  BarChart3,
  Zap,
  ArrowLeftRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  hideHamburger?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "futures", label: "M-Futuros", icon: Zap },
  { id: "daytrade", label: "Sistema DayTrade", icon: BarChart3 },
  { id: "investments", label: "Meus Investimentos", icon: Briefcase },
  { id: "tracker", label: "Rastreador de Moedas", icon: TrendingUp },
  { id: "converter", label: "Conversor de Moedas", icon: ArrowLeftRight },
];

export const CryptoSidebar = ({ activeItem, onItemClick, hideHamburger = false }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile when sidebar is closed */}
      {!isMobileOpen && !hideHamburger && (
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden absolute top-4 left-4 z-50 p-3 glass-card rounded-xl"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar - Always visible on desktop, mobile controlled */}
      <div
        className={`
        w-64 flex-shrink-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-all duration-300 ease-in-out
        fixed lg:static top-0 left-0 h-screen z-[70] pt-0
      `}
      >
        <div className="h-full glass-card neon-border m-4 p-6 flex flex-col overflow-y-auto scrollbar-hide relative">
          {/* Close button - Mobile only - Top right corner above title */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden absolute top-1 right-1 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/Bitcoin.svg"
                alt="Bitcoin Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
                CryptoGlass
              </h1>
              <p className="text-xs text-gray-400">Professional Trading</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onItemClick(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`sidebar-item group ${isActive ? "active" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-neon-blue-400" : "text-gray-400 group-hover:text-white"} transition-colors`}
                  />

                  <span
                    className={`font-medium text-base leading-tight ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"} transition-colors`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto pt-3 border-t border-white/10">
            {/* Pro Account section moved to bottom */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">
                    Pro Account
                  </p>
                  <p className="text-[10px] bg-gradient-to-r from-neon-blue-400 to-blue-300 bg-clip-text text-transparent font-medium leading-tight">Premium Features</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                <div className="bg-gradient-to-r from-neon-blue-400 to-neon-blue-600 h-1 rounded-full w-4/5"></div>
              </div>
              <p className="text-[10px] text-gray-400">
                API Calls: 8,420/10,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
