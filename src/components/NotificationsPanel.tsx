
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDailyQuote } from "@/hooks/useDailyQuote";

export const NotificationsPanel = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { quote, book, author, formattedDate, loading, hasNewQuote, markAsViewed, checkQuoteOnModalOpen } = useDailyQuote();

  useEffect(() => {
    // Definir contagem baseada na nova frase
    setUnreadCount(hasNewQuote ? 1 : 0);
  }, [hasNewQuote]);

  const handleModalOpen = () => {
    // Verificar se a data mudou e atualizar a frase se necessário
    checkQuoteOnModalOpen();
    
    // Marcar como visualizada quando o modal abrir
    if (hasNewQuote) {
      markAsViewed();
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && handleModalOpen()}>
      <DialogTrigger asChild>
        <div className="px-3 lg:px-4 py-2 glass-card rounded-xl relative cursor-pointer hover:bg-neon-blue-400/10 transition-all duration-300 group">
          <button className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-300 group-hover:text-neon-blue-400 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="!bg-transparent glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
            Frase do Dia
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue-400"></div>
              </div>
            ) : (
              <>
                <blockquote className="text-gray-200 text-lg leading-relaxed italic border-l-4 border-neon-blue-400 pl-6 py-3 mb-4">
                  <span>"{quote}"</span>
                </blockquote>
                
                <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-medium">Livro:</span>
                      <span className="text-neon-blue-300 font-semibold">{book}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-neon-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300 font-medium">Autor:</span>
                    <span className="text-neon-blue-300 font-semibold">{author}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Bell className="w-4 h-4" />
              <span>frase de hoje</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
