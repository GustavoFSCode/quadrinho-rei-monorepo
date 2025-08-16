/**
 * Formata uma data para o fuso horário de São Paulo - Brasil
 * @param dateString - String da data em formato ISO
 * @returns Data formatada no padrão brasileiro (dd/mm/aaaa)
 */
export const formatDateToBrazil = (dateString: string): string => {
  try {
    console.log('=== formatDateToBrazil DEBUG ===');
    console.log('Input dateString:', dateString);
    
    // Verificar se é apenas uma data (YYYY-MM-DD) sem horário
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    console.log('Is date only (no time):', isDateOnly);
    
    let date: Date;
    
    if (isDateOnly) {
      // Para datas sem horário, criar diretamente no timezone local para evitar conversão UTC
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month é 0-indexed
      console.log('Date created locally (no UTC conversion):', date);
    } else {
      // Para datas com horário, usar o construtor normal
      date = new Date(dateString);
      console.log('Date object (with time):', date);
    }
    
    console.log('Date toISOString():', date.toISOString());
    
    // Verificar se é uma data válida
    if (isNaN(date.getTime())) {
      console.log('Data inválida!');
      return 'Data inválida';
    }
    
    // Para datas apenas (sem hora), usar formatação local simples
    let formatted: string;
    if (isDateOnly) {
      // Formatação local direta, sem conversão de timezone
      formatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      // Para datas com hora, usar timezone de São Paulo
      formatted = date.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    console.log('Formatted result:', formatted);
    
    // Comparação com hoje
    const today = new Date();
    const todayInBrazil = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    console.log('Today (local format):', todayInBrazil);
    console.log('=======================');
    
    return formatted;
  } catch (error) {
    console.error('Erro ao formatar data:', dateString, error);
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
    // Se a data não inclui informação de fuso horário, assumir UTC
    let date = new Date(dateString);
    
    // Se a string não tem 'Z' nem offset, adicionar 'Z' para tratar como UTC
    if (!/Z$|[+-]\d{2}:\d{2}$/.test(dateString)) {
      date = new Date(dateString + 'Z');
    }
    
    // Criar um objeto Intl.DateTimeFormat para São Paulo
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Erro ao formatar data e hora:', dateString, error);
    return 'Data inválida';
  }
};

