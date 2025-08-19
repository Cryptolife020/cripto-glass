
import { useState, useEffect } from 'react';
import { dailyQuoteService } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyQuoteByDate, BookQuote } from '@/data/dailyQuotes';

interface DailyQuote {
  quote: string;
  book: string;
  author: string;
  date: string;
  formattedDate: string;
}

const STORAGE_KEY = 'daily_quote';

export const useDailyQuote = () => {
  const [quote, setQuote] = useState<string>('');
  const [book, setBook] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasNewQuote, setHasNewQuote] = useState(false);
  const { user } = useAuth();

  const getTodayDateBrazil = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    // Usar formato YYYY-MM-DD para consistência
    const year = brazilTime.getFullYear();
    const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
    const day = String(brazilTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedDateBrazil = () => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    return brazilTime.toLocaleDateString('pt-BR');
  };

  const getLocalDailyQuote = (): BookQuote => {
    // Obter frase baseada na data atual (sempre a mesma frase para o mesmo dia)
    const today = new Date();
    return getDailyQuoteByDate(today);
  };

  const generateDailyQuote = async () => {
    setLoading(true);
    setError('');

    try {
      // Obter frase local baseada na data
      const localQuote = getLocalDailyQuote();

      // Salvar no banco de dados para este usuário
      if (user) {
        const savedQuote = await dailyQuoteService.saveTodaysQuote(user.id, localQuote.quote);
        if (savedQuote) {
          console.log('💾 Nova frase salva no banco:', localQuote.quote.substring(0, 50) + '...');
          setHasNewQuote(true); // Nova frase disponível
        }
      } else {
        // Se não há usuário logado, ainda assim marcar como nova frase
        setHasNewQuote(true);
      }

      const dailyQuote: DailyQuote = {
        quote: localQuote.quote,
        book: localQuote.book,
        author: localQuote.author,
        date: getTodayDateBrazil(),
        formattedDate: getFormattedDateBrazil()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyQuote));
      setQuote(localQuote.quote);
      setBook(localQuote.book);
      setAuthor(localQuote.author);
      setFormattedDate(dailyQuote.formattedDate);
    } catch (err) {
      console.error('Erro ao carregar frase:', err);
      setError('Erro ao carregar frase do dia');

      // Fallback para uma frase padrão
      const fallbackQuote = 'A fortuna favorece os audazes e abandona os covardes.';
      setQuote(fallbackQuote);
      setBook('O Príncipe');
      setAuthor('Nicolau Maquiavel');
      setFormattedDate(getFormattedDateBrazil());
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateQuote = async (forceUpdate = false) => {
    if (!user) return;

    const today = getTodayDateBrazil();
    console.log(`🔍 Verificando frase para data: ${today}, forceUpdate: ${forceUpdate}`);

    try {
      // Verificar se já existe frase para hoje no banco para este usuário
      const todaysQuote = await dailyQuoteService.getTodaysQuote(user.id);

      if (todaysQuote && !forceUpdate) {
        console.log('📝 Frase encontrada no banco:', todaysQuote.quote.substring(0, 50) + '...');

        // Frase já existe no banco para hoje para este usuário
        setQuote(todaysQuote.quote);
        // Como o banco só armazena a quote, vamos buscar a frase local para obter book e author
        const localQuote = getLocalDailyQuote();
        setBook(localQuote.book);
        setAuthor(localQuote.author);
        setFormattedDate(getFormattedDateBrazil());

        // Verificar se o usuário já visualizou
        const hasViewed = await dailyQuoteService.hasUserViewedTodaysQuote(user.id);
        setHasNewQuote(!hasViewed);
        console.log(`👁️ Usuário já visualizou: ${hasViewed}, hasNewQuote: ${!hasViewed}`);

        // Salvar no localStorage como cache
        const dailyQuote: DailyQuote = {
          quote: todaysQuote.quote,
          book: localQuote.book,
          author: localQuote.author,
          date: today,
          formattedDate: getFormattedDateBrazil()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyQuote));
        return;
      }

      // Não existe frase para hoje para este usuário OU forceUpdate = true, gerar nova
      console.log('🆕 Gerando nova frase do dia...');
      await generateDailyQuote();
    } catch (error) {
      console.error('❌ Erro ao verificar frase do dia:', error);
      // Fallback para localStorage se banco falhar
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored && !forceUpdate) {
        const dailyQuote: DailyQuote = JSON.parse(stored);

        if (dailyQuote.date === today) {
          setQuote(dailyQuote.quote);
          setBook(dailyQuote.book || '');
          setAuthor(dailyQuote.author || '');
          setFormattedDate(dailyQuote.formattedDate || getFormattedDateBrazil());
          setHasNewQuote(true); // Assumir que é nova se não conseguir verificar no banco
          return;
        }
      }

      // Gerar nova frase como último recurso
      console.log('🆕 Gerando nova frase (fallback)...');
      await generateDailyQuote();
    }
  };

  useEffect(() => {
    checkAndUpdateQuote();

    // Função para determinar intervalo de verificação baseado na hora
    const getCheckInterval = () => {
      const now = new Date();
      const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const hour = brazilTime.getHours();
      const minute = brazilTime.getMinutes();

      // Entre 23:50 e 00:10, verificar a cada 10 segundos
      if ((hour === 23 && minute >= 50) || (hour === 0 && minute <= 10)) {
        return 10000; // 10 segundos
      }
      // Entre 23:00 e 01:00, verificar a cada 30 segundos
      else if (hour === 23 || hour === 0) {
        return 30000; // 30 segundos
      }
      // Resto do dia, verificar a cada 5 minutos
      else {
        return 300000; // 5 minutos
      }
    };

    // Verificar periodicamente se a data mudou
    const scheduleNextCheck = () => {
      const interval = getCheckInterval();
      console.log(`⏰ Próxima verificação de frase em ${interval/1000} segundos`);

      setTimeout(() => {
        const today = getTodayDateBrazil();
        const stored = localStorage.getItem(STORAGE_KEY);

        console.log(`🔍 Verificando frase do dia - Data atual: ${today}`);

        if (stored) {
          const dailyQuote: DailyQuote = JSON.parse(stored);
          console.log(`📝 Frase armazenada - Data: ${dailyQuote.date}`);

          // Se a data armazenada é diferente da data atual, atualizar a frase
          if (dailyQuote.date !== today) {
            console.log('🔄 Data mudou! Atualizando frase do dia...');
            checkAndUpdateQuote(true); // Force update quando a data muda
          }
        } else {
          console.log('📝 Nenhuma frase armazenada, verificando...');
          checkAndUpdateQuote();
        }

        // Agendar próxima verificação
        scheduleNextCheck();
      }, interval);
    };

    // Iniciar verificações
    scheduleNextCheck();

    // Não há cleanup necessário pois usamos setTimeout recursivo
    return () => {};
  }, []);

  const markAsViewed = async () => {
    if (!user) return;

    try {
      const todaysQuote = await dailyQuoteService.getTodaysQuote(user.id);
      if (todaysQuote) {
        const success = await dailyQuoteService.markQuoteAsViewed(user.id, todaysQuote.id);
        if (success) {
          setHasNewQuote(false); // Remove a notificação
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Função para verificar e atualizar a frase do dia quando o modal é aberto
  const checkQuoteOnModalOpen = async () => {
    const today = getTodayDateBrazil();
    const stored = localStorage.getItem(STORAGE_KEY);

    console.log('🔍 Verificando frase ao abrir modal...');

    if (stored) {
      const dailyQuote: DailyQuote = JSON.parse(stored);
      console.log(`📅 Data armazenada: ${dailyQuote.date}, Data atual: ${today}`);

      // Se a data armazenada é diferente da data atual, atualizar a frase
      if (dailyQuote.date !== today) {
        console.log('🔄 Data mudou! Forçando atualização da frase...');
        await checkAndUpdateQuote(true); // Force update
      }
    } else {
      // Se não há frase armazenada, verificar e possivelmente gerar uma nova
      console.log('📝 Nenhuma frase armazenada, gerando nova...');
      await checkAndUpdateQuote();
    }
  };

  return {
    quote,
    book,
    author,
    formattedDate,
    loading,
    error,
    hasNewQuote,
    refreshQuote: generateDailyQuote,
    markAsViewed,
    checkQuoteOnModalOpen
  };
};
