// Type definitions for question-specific settings

export interface RespondentNameSettings {
  required: boolean;
  placeholder?: string;
}

export interface MultipleChoiceSettings {
  options: { id: string; text: string; position: number }[];
  allowMultiple: boolean;
  allowOther: boolean;
  required: boolean;
  randomize?: boolean;
}

export interface YesNoSettings {
  yesLabel: string;
  noLabel: string;
  buttonStyle: 'pills' | 'boxes' | 'toggle';
  required: boolean;
}

export interface RatingSettings {
  scaleType: 'stars' | 'numbers' | 'emoji';
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  required: boolean;
}

export interface EmailSettings {
  required: boolean;
  placeholder?: string;
  allowedDomains?: string[];
}

export interface PhoneSettings {
  required: boolean;
  countryCode: string;
  format: 'US' | 'INTERNATIONAL';
  placeholder?: string;
}

export interface DateSettings {
  required: boolean;
  format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  minDate?: string;
  maxDate?: string;
  disablePast: boolean;
  disableFuture: boolean;
}

export interface ShortTextSettings {
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface LongTextSettings {
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

export type QuestionSettings =
  | RespondentNameSettings
  | MultipleChoiceSettings
  | YesNoSettings
  | RatingSettings
  | EmailSettings
  | PhoneSettings
  | DateSettings
  | ShortTextSettings
  | LongTextSettings
  | Record<string, any>;

// Default settings for each question type
export const getDefaultSettings = (type: string): QuestionSettings => {
  switch (type) {
    case 'respondent_name':
      return {
        required: true,
        placeholder: 'Enter your name...',
      } as RespondentNameSettings;

    case 'multiple_choice':
      return {
        options: [
          { id: '1', text: 'Option 1', position: 0 },
          { id: '2', text: 'Option 2', position: 1 },
          { id: '3', text: 'Option 3', position: 2 },
        ],
        allowMultiple: false,
        allowOther: false,
        required: true,
        randomize: false,
      } as MultipleChoiceSettings;

    case 'yes_no':
      return {
        yesLabel: 'Yes',
        noLabel: 'No',
        buttonStyle: 'pills',
        required: true,
      } as YesNoSettings;

    case 'rating':
      return {
        scaleType: 'stars',
        min: 1,
        max: 10,
        required: true,
      } as RatingSettings;

    case 'email':
      return {
        required: true,
        placeholder: 'email@example.com',
      } as EmailSettings;

    case 'phone':
      return {
        required: true,
        countryCode: 'US',
        format: 'US',
        placeholder: '(555) 123-4567',
      } as PhoneSettings;

    case 'date':
      return {
        required: true,
        format: 'MM/DD/YYYY',
        disablePast: false,
        disableFuture: false,
      } as DateSettings;

    case 'short_text':
      return {
        required: true,
        placeholder: 'Type your answer here...',
      } as ShortTextSettings;

    case 'long_text':
      return {
        required: true,
        placeholder: 'Type your answer here...',
      } as LongTextSettings;

    default:
      return {};
  }
};
