import React from 'react';
import { CryptoSidebar } from './CryptoSidebar';
import { NotificationsPanel } from './NotificationsPanel';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarWallstretWidget } from './BarWallstretWidget';

interface LayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  hideButtons?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeItem = "futures", hideButtons = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
  };
  
  const handleItemClick = (item: string) => {
    // Navegar para a página correspondente ao item clicado
    if (item === "dashboard") {
      navigate('/');
    } else if (item === "tracker") {
      navigate('/tracker');
    } else if (item === "daytrade") {
      navigate('/daytrade');
    } else if (item === "futures") {
      navigate('/futures');
    } else if (item === "investments") {
      navigate('/investments');
    } else if (item === "converter") {
      navigate('/converter');
    } else {
      navigate('/');
    }
  };

  // Show BarWallstretWidget only on dashboard page
  const showBarWallstret = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden">
      {/* Background image - mesma da tela de login */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/image/image-login.jpg')`,
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="flex flex-1 pt-0 mt-0">
        <CryptoSidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          hideHamburger={hideButtons}
        />

        {/* Notifications - Absolute position top right */}
        {!hideButtons && (
        <div className="absolute top-2 right-4 z-50 flex items-center gap-3">
          <NotificationsPanel />
          <button
            onClick={handleLogout}
            className="px-3 lg:px-4 py-2 glass-card rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 group flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span className="text-sm text-gray-400 group-hover:text-red-400 transition-colors hidden sm:inline">
              Sair
            </span>
          </button>
        </div>
        )}

        <main className="flex-1 p-3 sm:p-4 lg:p-8 lg:ml-0 ml-0 max-w-full overflow-x-hidden relative z-10 mt-0 pt-16 lg:pt-0">
          {/* BarWallstret Widget - only show on dashboard */}
          {showBarWallstret && (
            <div className="w-full mb-4">
              <BarWallstretWidget />
            </div>
          )}

          <div className="relative z-20">
            {children}
          </div>
        </main>
      </div>

      {/* Spacer before footer */}
      <div className="h-24 lg:h-32"></div>

      {/* Professional Footer - Full width outside of main content */}
      <div className="w-full bg-black py-5 relative z-10 mt-auto">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0">
              <p className="text-white text-sm font-medium">
                © 2025 CryptoGlass | <span className="text-gray-400">Anteriormente RocketBlue</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">
                Evoluindo desde 2024 para oferecer a melhor experiência em trading de criptomoedas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;