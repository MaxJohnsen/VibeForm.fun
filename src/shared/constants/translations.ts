export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'nl' | 'it' | 'sv' 
  | 'no' | 'da' | 'fi' | 'pl' | 'ru' | 'ja' | 'zh' | 'ar' | 'tr' | 'ko';

export interface TranslationStrings {
  welcome: {
    takesAbout: string;
    minutes: string;
    questions: string;
  };
  navigation: {
    previous: string;
    next: string;
    submit: string;
    enterToContinue: string;
  };
  completion: {
    defaultTitle: string;
    defaultMessage: string;
    close: string;
  };
  loading: {
    starting: string;
    submitting: string;
  };
}

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  nl: 'Nederlands',
  it: 'Italiano',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  pl: 'Polski',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
  tr: 'Türkçe',
  ko: '한국어',
};

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    welcome: {
      takesAbout: 'Takes about',
      minutes: 'minutes',
      questions: 'questions',
    },
    navigation: {
      previous: 'Previous',
      next: 'Next',
      submit: 'Submit',
      enterToContinue: 'Press Enter to continue',
    },
    completion: {
      defaultTitle: 'Thank you!',
      defaultMessage: 'Your response has been submitted successfully.',
      close: 'Close',
    },
    loading: {
      starting: 'Starting form...',
      submitting: 'Submitting...',
    },
  },
  es: {
    welcome: {
      takesAbout: 'Toma aproximadamente',
      minutes: 'minutos',
      questions: 'preguntas',
    },
    navigation: {
      previous: 'Anterior',
      next: 'Siguiente',
      submit: 'Enviar',
      enterToContinue: 'Presiona Enter para continuar',
    },
    completion: {
      defaultTitle: '¡Gracias!',
      defaultMessage: 'Tu respuesta ha sido enviada exitosamente.',
      close: 'Cerrar',
    },
    loading: {
      starting: 'Iniciando formulario...',
      submitting: 'Enviando...',
    },
  },
  fr: {
    welcome: {
      takesAbout: 'Prend environ',
      minutes: 'minutes',
      questions: 'questions',
    },
    navigation: {
      previous: 'Précédent',
      next: 'Suivant',
      submit: 'Soumettre',
      enterToContinue: 'Appuyez sur Entrée pour continuer',
    },
    completion: {
      defaultTitle: 'Merci!',
      defaultMessage: 'Votre réponse a été soumise avec succès.',
      close: 'Fermer',
    },
    loading: {
      starting: 'Démarrage du formulaire...',
      submitting: 'Soumission...',
    },
  },
  de: {
    welcome: {
      takesAbout: 'Dauert etwa',
      minutes: 'Minuten',
      questions: 'Fragen',
    },
    navigation: {
      previous: 'Zurück',
      next: 'Weiter',
      submit: 'Absenden',
      enterToContinue: 'Drücken Sie Enter, um fortzufahren',
    },
    completion: {
      defaultTitle: 'Vielen Dank!',
      defaultMessage: 'Ihre Antwort wurde erfolgreich übermittelt.',
      close: 'Schließen',
    },
    loading: {
      starting: 'Formular wird gestartet...',
      submitting: 'Wird gesendet...',
    },
  },
  pt: {
    welcome: {
      takesAbout: 'Leva cerca de',
      minutes: 'minutos',
      questions: 'perguntas',
    },
    navigation: {
      previous: 'Anterior',
      next: 'Próximo',
      submit: 'Enviar',
      enterToContinue: 'Pressione Enter para continuar',
    },
    completion: {
      defaultTitle: 'Obrigado!',
      defaultMessage: 'Sua resposta foi enviada com sucesso.',
      close: 'Fechar',
    },
    loading: {
      starting: 'Iniciando formulário...',
      submitting: 'Enviando...',
    },
  },
  nl: {
    welcome: {
      takesAbout: 'Duurt ongeveer',
      minutes: 'minuten',
      questions: 'vragen',
    },
    navigation: {
      previous: 'Vorige',
      next: 'Volgende',
      submit: 'Verzenden',
      enterToContinue: 'Druk op Enter om door te gaan',
    },
    completion: {
      defaultTitle: 'Bedankt!',
      defaultMessage: 'Uw antwoord is succesvol verzonden.',
      close: 'Sluiten',
    },
    loading: {
      starting: 'Formulier starten...',
      submitting: 'Verzenden...',
    },
  },
  it: {
    welcome: {
      takesAbout: 'Richiede circa',
      minutes: 'minuti',
      questions: 'domande',
    },
    navigation: {
      previous: 'Precedente',
      next: 'Avanti',
      submit: 'Invia',
      enterToContinue: 'Premi Invio per continuare',
    },
    completion: {
      defaultTitle: 'Grazie!',
      defaultMessage: 'La tua risposta è stata inviata con successo.',
      close: 'Chiudi',
    },
    loading: {
      starting: 'Avvio del modulo...',
      submitting: 'Invio in corso...',
    },
  },
  sv: {
    welcome: {
      takesAbout: 'Tar cirka',
      minutes: 'minuter',
      questions: 'frågor',
    },
    navigation: {
      previous: 'Föregående',
      next: 'Nästa',
      submit: 'Skicka',
      enterToContinue: 'Tryck på Enter för att fortsätta',
    },
    completion: {
      defaultTitle: 'Tack!',
      defaultMessage: 'Ditt svar har skickats in.',
      close: 'Stäng',
    },
    loading: {
      starting: 'Startar formulär...',
      submitting: 'Skickar...',
    },
  },
  no: {
    welcome: {
      takesAbout: 'Tar omtrent',
      minutes: 'minutter',
      questions: 'spørsmål',
    },
    navigation: {
      previous: 'Forrige',
      next: 'Neste',
      submit: 'Send inn',
      enterToContinue: 'Trykk Enter for å fortsette',
    },
    completion: {
      defaultTitle: 'Takk!',
      defaultMessage: 'Ditt svar har blitt sendt inn.',
      close: 'Lukk',
    },
    loading: {
      starting: 'Starter skjema...',
      submitting: 'Sender...',
    },
  },
  da: {
    welcome: {
      takesAbout: 'Tager cirka',
      minutes: 'minutter',
      questions: 'spørgsmål',
    },
    navigation: {
      previous: 'Forrige',
      next: 'Næste',
      submit: 'Indsend',
      enterToContinue: 'Tryk Enter for at fortsætte',
    },
    completion: {
      defaultTitle: 'Tak!',
      defaultMessage: 'Dit svar er blevet indsendt.',
      close: 'Luk',
    },
    loading: {
      starting: 'Starter formular...',
      submitting: 'Indsender...',
    },
  },
  fi: {
    welcome: {
      takesAbout: 'Kestää noin',
      minutes: 'minuuttia',
      questions: 'kysymystä',
    },
    navigation: {
      previous: 'Edellinen',
      next: 'Seuraava',
      submit: 'Lähetä',
      enterToContinue: 'Paina Enter jatkaaksesi',
    },
    completion: {
      defaultTitle: 'Kiitos!',
      defaultMessage: 'Vastauksesi on lähetetty onnistuneesti.',
      close: 'Sulje',
    },
    loading: {
      starting: 'Aloitetaan lomaketta...',
      submitting: 'Lähetetään...',
    },
  },
  pl: {
    welcome: {
      takesAbout: 'Zajmuje około',
      minutes: 'minut',
      questions: 'pytań',
    },
    navigation: {
      previous: 'Poprzedni',
      next: 'Następny',
      submit: 'Wyślij',
      enterToContinue: 'Naciśnij Enter, aby kontynuować',
    },
    completion: {
      defaultTitle: 'Dziękujemy!',
      defaultMessage: 'Twoja odpowiedź została wysłana pomyślnie.',
      close: 'Zamknij',
    },
    loading: {
      starting: 'Rozpoczynanie formularza...',
      submitting: 'Wysyłanie...',
    },
  },
  ru: {
    welcome: {
      takesAbout: 'Займет примерно',
      minutes: 'минут',
      questions: 'вопросов',
    },
    navigation: {
      previous: 'Назад',
      next: 'Далее',
      submit: 'Отправить',
      enterToContinue: 'Нажмите Enter, чтобы продолжить',
    },
    completion: {
      defaultTitle: 'Спасибо!',
      defaultMessage: 'Ваш ответ успешно отправлен.',
      close: 'Закрыть',
    },
    loading: {
      starting: 'Загрузка формы...',
      submitting: 'Отправка...',
    },
  },
  ja: {
    welcome: {
      takesAbout: '約',
      minutes: '分かかります',
      questions: '件の質問',
    },
    navigation: {
      previous: '前へ',
      next: '次へ',
      submit: '送信',
      enterToContinue: 'Enterキーを押して続行',
    },
    completion: {
      defaultTitle: 'ありがとうございます！',
      defaultMessage: '回答が正常に送信されました。',
      close: '閉じる',
    },
    loading: {
      starting: 'フォームを開始中...',
      submitting: '送信中...',
    },
  },
  zh: {
    welcome: {
      takesAbout: '大约需要',
      minutes: '分钟',
      questions: '个问题',
    },
    navigation: {
      previous: '上一步',
      next: '下一步',
      submit: '提交',
      enterToContinue: '按Enter键继续',
    },
    completion: {
      defaultTitle: '谢谢！',
      defaultMessage: '您的回复已成功提交。',
      close: '关闭',
    },
    loading: {
      starting: '正在启动表单...',
      submitting: '正在提交...',
    },
  },
  ar: {
    welcome: {
      takesAbout: 'يستغرق حوالي',
      minutes: 'دقائق',
      questions: 'أسئلة',
    },
    navigation: {
      previous: 'السابق',
      next: 'التالي',
      submit: 'إرسال',
      enterToContinue: 'اضغط Enter للمتابعة',
    },
    completion: {
      defaultTitle: 'شكراً لك!',
      defaultMessage: 'تم إرسال ردك بنجاح.',
      close: 'إغلاق',
    },
    loading: {
      starting: 'بدء النموذج...',
      submitting: 'جارٍ الإرسال...',
    },
  },
  tr: {
    welcome: {
      takesAbout: 'Yaklaşık',
      minutes: 'dakika sürer',
      questions: 'soru',
    },
    navigation: {
      previous: 'Önceki',
      next: 'Sonraki',
      submit: 'Gönder',
      enterToContinue: 'Devam etmek için Enter tuşuna basın',
    },
    completion: {
      defaultTitle: 'Teşekkürler!',
      defaultMessage: 'Yanıtınız başarıyla gönderildi.',
      close: 'Kapat',
    },
    loading: {
      starting: 'Form başlatılıyor...',
      submitting: 'Gönderiliyor...',
    },
  },
  ko: {
    welcome: {
      takesAbout: '약',
      minutes: '분 소요',
      questions: '개의 질문',
    },
    navigation: {
      previous: '이전',
      next: '다음',
      submit: '제출',
      enterToContinue: 'Enter를 눌러 계속하세요',
    },
    completion: {
      defaultTitle: '감사합니다!',
      defaultMessage: '응답이 성공적으로 제출되었습니다.',
      close: '닫기',
    },
    loading: {
      starting: '양식 시작 중...',
      submitting: '제출 중...',
    },
  },
};
