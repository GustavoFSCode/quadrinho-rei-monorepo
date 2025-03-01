export const maskCEP = (cep: string) => {
  cep = cep.replace(/\D/g, '');

  cep = cep.substring(0, 8);
  const match = cep.match(/^(\d{1,5})(\d{0,3})$/);
  if (match) {
    cep = `${match[1]}${match[2] ? '-' : ''}${match[2]}`;
    return cep;
  }
  return cep;
};

export const maskPhone = (value: string) => {
  if (!value) return '';

  const onlyDigits = value.startsWith('55')
    ? value?.replace(/\D/g, '').substring(2, 13)
    : value?.replace(/\D/g, '').substring(0, 11);

  if (onlyDigits.length <= 10) {
    return onlyDigits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return onlyDigits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export const maskCPFOrCNPJ = (value: string) => {
  if (!value) return '';

  const onlyDigits = value?.replace(/\D/g, '').substring(0, 14);
  const { length } = onlyDigits;

  if (length <= 11) {
    return onlyDigits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3}).(\d{3})(\d)/, '$1.$2.$3')
      .replace(/.(\d{3})(\d)/, '.$1-$2');
  }
  return onlyDigits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const maskCNPJ = (value: string) => {
  if (!value) return '';

  const onlyDigits = value?.replace(/\D/g, '').substring(0, 14);

  return onlyDigits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const maskAbbreviation = (value: string) => {
  const maskedValue = value.slice(0, 4);

  return maskedValue;
};
export const maskDate = (value: string) => {
  if (!value) return '';

  const onlyDigits = value?.replace(/\D/g, '').substring(0, 8);

  return onlyDigits
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
};

export const maskCreditCard = (value: string) => {
  // Remove todos os caracteres não numéricos e limita a 16 dígitos
  const onlyDigits = value.replace(/\D/g, '').substring(0, 16);
  // Divide os dígitos em grupos de 4
  const groups = onlyDigits.match(/.{1,4}/g);
  return groups ? groups.join('.') : onlyDigits;
};

export const getCardFlag = (cardNumber: string) => {
  // Remove caracteres não numéricos
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return '';
  // Pega o último dígito
  const lastDigit = digits.charAt(digits.length - 1);
  const num = parseInt(lastDigit, 10);
  if (num >= 0 && num <= 3) {
    return 'Elo';
  } else if (num >= 4 && num <= 7) {
    return 'Visa';
  } else if (num >= 8 && num <= 9) {
    return 'Mastercard';
  }
  return '';
};

export const unformatCPF_CNPJ = (value: string | undefined) => {
  if (value === undefined) {
    return value;
  }

  if (value.length > 14) {
    return value
      .replace('.', '')
      .replace('.', '')
      .replace('/', '')
      .replace('-', '');
  }
  return value?.replace('.', '').replace('.', '').replace('-', '');
};
export const maskOnlyNumbers = (value: string) => {
  const maskedValue = value;
  // if (value !== undefined) {
  //   maskedValue = value?.replace(/^(\d+)/, '$1');
  // }
  return maskedValue;
};
export const currencyMask = (value: string) => {
  const valueFormatted = unformatCurrency(value);

  const masked = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(valueFormatted);
  return masked;
};
export const unformatCurrency = (value: string | undefined) => {
  if (value !== undefined) {
    const valueFormatted = value
      ?.replace(',', '')
      ?.replace('.', '')
      ?.replace(/\D/g, '');

    return Number(valueFormatted) / 100;
  }
  return 0;
};

// formated to dd/mm/yyyy
export const dateMask = (value: string | undefined) => {
  if (value !== undefined) {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      const formatedDate = date.toISOString().slice(0, 10);
      const day = formatedDate.slice(8, 10);
      const month = formatedDate.slice(5, 7);
      const year = formatedDate.slice(0, 4);
      return `${day}/${month}/${year}`;
    }
    return value;
  }
};

export const percentMask = (value: number | string | undefined) => {
  if (value !== undefined) {
    let newValue = value;

    if (typeof value === 'string') {
      newValue = value?.toString()?.replace(/\D{1,3}/, '');

      if (
        newValue?.length === 3 &&
        (Number(newValue) < 0 || Number(newValue) > 100)
      ) {
        return `${newValue?.slice(0, 2)}`;
      }
    }
    return `${newValue}`;
  }
  return '';
};

export const unmaskPercent = (value: string | undefined) => {
  if (value !== undefined) {
    const newValue = Number(value?.replace(/\D{1,3}/, ''));
    if (newValue > 0 && newValue <= 100) {
      return newValue;
    }
  }
};

export const onlyDigits = (value: string | undefined) => {
  if (value !== undefined) {
    return value?.replace(/\D+/, '');
  }
  return '';
};
