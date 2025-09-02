import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';

const isBackEndError = (err: any): err is AxiosError<{ message: string }> => {
  if (err.response.data) {
    return true;
  }
  return false;
};

const isStrapiError = (
  err: any,
): err is AxiosError<{
  error: {
    message: string;
  };
}> => {
  if (err.response.data.error) {
    return true;
  }
  return false;
};

const notifyError = (message: string) =>
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
  });

const notifySuccess = (message: string) =>
  toast.success(message, {
    position: 'top-right',
    autoClose: 5000,
  });

const errorTranslations: Record<string, string> = {
  'Invalid identifier or password': 'E-mail ou senha inválidos',
  'Too many requests, please try again later.':
    'Muitas requisições, por favor tente novamente mais tarde',
  'The provided current password is invalid': 'Senha antiga incorreta',
  'Username already taken': 'E-mail já esta sendo utilizado',
  'Your account has been blocked by an administrator': 'Sua conta foi bloqueada por um administrador',
};

export const getErrorMessage = (err: any): string => {
  if (axios.isAxiosError(err)) {
    if (isStrapiError(err)) {
      return err.response?.data.error.message as string;
    }

    if (isBackEndError(err)) {
      return err.response?.data.message as string;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return err?.message || '';
};

const handleError = (err: any) => {
  const message = getErrorMessage(err);

  return notifyError(errorTranslations[message] || message);
};

export const handleSuccess = (message: string) => {
  return notifySuccess(message);
};

export default handleError;
