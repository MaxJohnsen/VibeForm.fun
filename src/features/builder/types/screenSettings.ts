export interface IntroSettings {
  title?: string;
  description?: string;
  buttonText?: string;
  showQuestionCount?: boolean;
  showEstimatedTime?: boolean;
}

export interface EndSettings {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonAction?: 'close' | 'redirect' | 'restart';
  redirectUrl?: string;
}

export const defaultIntroSettings: IntroSettings = {
  buttonText: 'Start',
  showQuestionCount: true,
  showEstimatedTime: true,
};

export const defaultEndSettings: EndSettings = {
  title: 'Thank you!',
  buttonText: 'Close',
  buttonAction: 'close',
};
