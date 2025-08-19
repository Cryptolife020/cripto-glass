/**
 * Frases inspiradoras e motivadoras de livros clássicos sobre sucesso, estratégia e riqueza
 * Estas frases serão exibidas aleatoriamente como "frase do dia"
 */

export interface BookQuote {
  quote: string;
  book: string;
  author: string;
}

export const dailyQuotes: BookQuote[] = [
  // O Príncipe - Maquiavel
  {
    quote: "A fortuna favorece os audazes e abandona os covardes.",
    book: "O Príncipe",
    author: "Nicolau Maquiavel"
  },
  {
    quote: "É melhor ser temido do que amado, se não pudermos ser ambos.",
    book: "O Príncipe", 
    author: "Nicolau Maquiavel"
  },
  {
    quote: "Quem negligencia o que se faz pelo que se deveria fazer, caminha para a ruína.",
    book: "O Príncipe",
    author: "Nicolau Maquiavel"
  },

  // A Arte da Guerra - Sun Tzu
  {
    quote: "Quem vence a si mesmo é mais forte que quem conquista cidades.",
    book: "A Arte da Guerra",
    author: "Sun Tzu"
  },
  {
    quote: "Toda guerra é baseada no engano.",
    book: "A Arte da Guerra",
    author: "Sun Tzu"
  },
  {
    quote: "Se conheces o inimigo e te conheces, não temas o resultado de cem batalhas.",
    book: "A Arte da Guerra",
    author: "Sun Tzu"
  },
  {
    quote: "A suprema excelência é quebrar a resistência do inimigo sem lutar.",
    book: "A Arte da Guerra",
    author: "Sun Tzu"
  },

  // Pai Rico Pai Pobre - Robert Kiyosaki
  {
    quote: "Os ricos compram ativos. Os pobres compram passivos.",
    book: "Pai Rico Pai Pobre",
    author: "Robert Kiyosaki"
  },
  {
    quote: "Não trabalhe pelo dinheiro, faça o dinheiro trabalhar para você.",
    book: "Pai Rico Pai Pobre",
    author: "Robert Kiyosaki"
  },
  {
    quote: "O maior risco é não correr nenhum risco.",
    book: "Pai Rico Pai Pobre",
    author: "Robert Kiyosaki"
  },
  {
    quote: "A educação financeira é mais valiosa que o dinheiro.",
    book: "Pai Rico Pai Pobre",
    author: "Robert Kiyosaki"
  },

  // O Investidor Inteligente - Benjamin Graham
  {
    quote: "O maior inimigo do investidor é provavelmente ele mesmo.",
    book: "O Investidor Inteligente",
    author: "Benjamin Graham"
  },
  {
    quote: "Seja temeroso quando outros são gananciosos e ganancioso quando outros são temerosos.",
    book: "O Investidor Inteligente",
    author: "Benjamin Graham"
  },
  {
    quote: "O investimento bem-sucedido é sobre gerenciar riscos, não evitá-los.",
    book: "O Investidor Inteligente",
    author: "Benjamin Graham"
  },

  // Como Fazer Amigos e Influenciar Pessoas - Dale Carnegie
  {
    quote: "O sucesso é conseguir o que você quer. A felicidade é querer o que você consegue.",
    book: "Como Fazer Amigos e Influenciar Pessoas",
    author: "Dale Carnegie"
  },
  {
    quote: "Você pode fazer mais amigos em dois meses se interessando pelos outros.",
    book: "Como Fazer Amigos e Influenciar Pessoas",
    author: "Dale Carnegie"
  },
  {
    quote: "A crítica é inútil porque coloca a pessoa na defensiva.",
    book: "Como Fazer Amigos e Influenciar Pessoas",
    author: "Dale Carnegie"
  },

  // Pense e Enriqueça - Napoleon Hill
  {
    quote: "Tudo o que a mente pode conceber e acreditar, ela pode realizar.",
    book: "Pense e Enriqueça",
    author: "Napoleon Hill"
  },
  {
    quote: "A persistência é o caminho do êxito.",
    book: "Pense e Enriqueça",
    author: "Napoleon Hill"
  },
  {
    quote: "O fracasso é apenas uma oportunidade para recomeçar com mais inteligência.",
    book: "Pense e Enriqueça",
    author: "Napoleon Hill"
  },
  {
    quote: "Toda adversidade carrega consigo a semente de um benefício equivalente.",
    book: "Pense e Enriqueça",
    author: "Napoleon Hill"
  },

  // Outras frases clássicas de sucesso
  {
    quote: "Toda vitória começa com a decisão de tentar.",
    book: "Diversos",
    author: "Provérbio"
  },
  {
    quote: "Não espere por oportunidades extraordinárias. Agarre ocasiões comuns e as torne grandes.",
    book: "Diversos",
    author: "Orison Swett Marden"
  },
  {
    quote: "A diferença entre o possível e o impossível está na determinação da pessoa.",
    book: "Diversos",
    author: "Tommy Lasorda"
  },
  {
    quote: "O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.",
    book: "Diversos",
    author: "Winston Churchill"
  },
  {
    quote: "A disciplina é a ponte entre objetivos e conquistas.",
    book: "Diversos",
    author: "Jim Rohn"
  },
  {
    quote: "Você não pode mudar o vento, mas pode ajustar as velas.",
    book: "Diversos",
    author: "Provérbio"
  },
  {
    quote: "O tempo é mais valioso que o dinheiro. Você pode conseguir mais dinheiro, mas não pode conseguir mais tempo.",
    book: "Diversos",
    author: "Jim Rohn"
  },
  {
    quote: "A única maneira de fazer um excelente trabalho é amar o que você faz.",
    book: "Diversos",
    author: "Steve Jobs"
  },
  {
    quote: "Não é o mais forte que sobrevive, mas o que melhor se adapta às mudanças.",
    book: "Diversos",
    author: "Charles Darwin"
  },
  {
    quote: "O conhecimento é poder, mas o conhecimento aplicado é supremo.",
    book: "Diversos",
    author: "Provérbio"
  }
];

/**
 * Função para obter uma frase aleatória do dia
 */
export const getRandomDailyQuote = (): BookQuote => {
  const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
  return dailyQuotes[randomIndex];
};

/**
 * Função para obter uma frase baseada na data (sempre a mesma frase para o mesmo dia)
 */
export const getDailyQuoteByDate = (date?: Date): BookQuote => {
  // Usar horário de Brasília para garantir consistência
  const targetDate = date || new Date();
  const brazilTime = new Date(targetDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

  // Calcular dia do ano de forma mais precisa
  const startOfYear = new Date(brazilTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((brazilTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  console.log(`📅 Frase do dia - Data: ${brazilTime.toDateString()}, Dia do ano: ${dayOfYear}`);

  const index = (dayOfYear - 1) % dailyQuotes.length; // -1 porque array começa em 0
  return dailyQuotes[index];
};

/**
 * Função para obter apenas o texto da frase (para compatibilidade com o código existente)
 */
export const getDailyQuoteText = (date?: Date): string => {
  const quote = getDailyQuoteByDate(date);
  return quote.quote;
};
