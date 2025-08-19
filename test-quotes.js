// Teste simples para verificar as frases do dia
const { dailyQuotes, getDailyQuoteByDate, getDailyQuoteText } = require('./src/data/dailyQuotes.ts');

console.log('=== TESTE DAS FRASES DO DIA ===\n');

console.log('Total de frases disponíveis:', dailyQuotes.length);
console.log('\n--- Primeiras 5 frases ---');
for (let i = 0; i < Math.min(5, dailyQuotes.length); i++) {
  const quote = dailyQuotes[i];
  console.log(`${i + 1}. "${quote.quote}"`);
  console.log(`   Livro: ${quote.book} - ${quote.author}\n`);
}

console.log('--- Frase do dia (baseada na data atual) ---');
const todayQuote = getDailyQuoteByDate();
console.log(`"${todayQuote.quote}"`);
console.log(`Livro: ${todayQuote.book} - ${todayQuote.author}\n`);

console.log('--- Apenas o texto da frase ---');
console.log(`"${getDailyQuoteText()}"`);

console.log('\n=== TESTE CONCLUÍDO ===');
