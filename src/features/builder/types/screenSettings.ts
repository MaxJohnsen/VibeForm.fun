export interface IntroSettings {
  title?: string;
  description?: string; // HTML content from rich text editor
  buttonText?: string;
  showQuestionCount?: boolean;
  showEstimatedTime?: boolean;
}

export interface EndSettings {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonAction?: 'redirect' | 'restart';
  redirectUrl?: string;
}

export const defaultIntroSettings: IntroSettings = {
  buttonText: 'Start',
  showQuestionCount: true,
  showEstimatedTime: true,
};

export const defaultEndSettings: EndSettings = {
  title: 'Thank you!',
  buttonAction: 'restart',
};
