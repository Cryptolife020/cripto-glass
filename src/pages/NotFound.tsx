import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Track 404 errors silently
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      data-oid="csovsba"
    >
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
      <div className="text-center relative z-10" data-oid="8eq5xc4">
        <div className="glass-card p-10 rounded-2xl">
          <h1 className="text-5xl font-bold mb-4 text-white" data-oid="6atwcos">
            404
          </h1>
          <p className="text-xl text-gray-300 mb-6" data-oid="mzdfd4a">
            Página não encontrada
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-neon-blue-400 to-neon-blue-600 text-white rounded-lg hover:brightness-110 transition-all"
            data-oid="m_yzm.p"
          >
            Voltar para o Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
