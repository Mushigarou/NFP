import { AxiosError } from 'axios';
import { Ban, CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// Function that uses translations - to be used within React components
export const useTranslatedUtils = () => {
  const t = useTranslations('Fetching');

  const translatedLogError = (e: AxiosError | unknown, customErrorKey?: string) => {
    if (e instanceof AxiosError) {
      const errors = e.response?.data;
      const errorStatus = e.response?.status;

      if (errorStatus === 422) {
        const validationErrors = errors.detail;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((error) => {
            const fieldName = error.loc?.slice(-1)[0] || 'field';
            toast(`Validation Error: ${fieldName}`, {
              description: error.msg,
              // style: toastError,
            });
          });
          return;
        }
      }

      if (errors) {
        Object.entries(errors).map(([title, error]) => {
          if (Array.isArray(error)) {
            error.map((err) => {
              toast(title, {
                description: err,
                // style: toastError,
              });
            });
          } else {
            Object.entries(errors).map(([, err]) => {
              toast('Error', {
                description: err as string,
                // style: toastError,
              });
            });
          }
        });
      }
    } else {
      toast('Error', {
        description: customErrorKey ? t(customErrorKey) : t('unknownError'),
        // style: toastError,
      });
    }
  };

  const translatedLogSuccess = (message: string) => {
    toast('Success', {
      description: `✔️ ${message}`,
    });
  };

  const translatedLogSimpleError = (message: string) => {
    toast('Error', {
      description: `🚫 ${message}`,
      // style: toastError,
    });
  };

  return {
    logError: translatedLogError,
    logSuccess: translatedLogSuccess,
    logErrorMessage: translatedLogSimpleError,
  };
};
