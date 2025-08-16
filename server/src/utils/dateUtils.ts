/**
 * Cria uma nova data no fuso horário de São Paulo - Brasil
 * @returns Date object representando a data/hora atual em São Paulo
 */
export const getBrazilDate = (): Date => {
  // Obter a data atual
  const now = new Date();
  
  // Converter para o fuso horário de São Paulo usando Intl.DateTimeFormat
  const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  return brazilTime;
};

/**
 * Converte uma string de data para o fuso horário brasileiro
 * @param dateString - String da data
 * @returns Date object no fuso horário brasileiro
 */
export const parseBrazilDate = (dateString: string): Date => {
  const date = new Date(dateString);
  const brazilOffset = -3; // UTC-3
  return new Date(date.getTime() + (brazilOffset * 60 * 60 * 1000));
};