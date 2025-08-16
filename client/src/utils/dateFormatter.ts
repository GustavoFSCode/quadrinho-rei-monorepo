/**
 * Formata uma data para o fuso horário de São Paulo - Brasil
 * @param dateString - String da data em formato ISO
 * @returns Data formatada no padrão brasileiro (dd/mm/aaaa)
 */
export const formatDateToBrazil = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Converter para o fuso horário de São Paulo (UTC-3)
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * Formata uma data e hora para o fuso horário de São Paulo - Brasil
 * @param dateString - String da data em formato ISO
 * @returns Data e hora formatadas no padrão brasileiro
 */
export const formatDateTimeToBrazil = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return 'Data inválida';
  }
};