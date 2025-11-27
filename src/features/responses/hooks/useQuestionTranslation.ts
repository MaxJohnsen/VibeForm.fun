import { translations, SupportedLanguage } from '@/shared/constants/translations';

export const useQuestionTranslation = (formLanguage: SupportedLanguage = 'en') => {
  return translations[formLanguage].questions;
};
