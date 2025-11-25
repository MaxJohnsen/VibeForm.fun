import { translations, SupportedLanguage } from '@/shared/constants/translations';

export const useTranslation = (language: SupportedLanguage = 'en') => {
  return translations[language] || translations.en;
};
