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
  questions: {
    optional: string;
    required: string;
    pickDate: string;
    noPastDates: string;
    noFutureDates: string;
    availableFrom: string;
    until: string;
    enterPhoneNumber: string;
    validPhoneNumber: string;
    validEmail: string;
    other: string;
    pleaseSpecify: string;
    ctrlEnterSubmit: string;
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
    questions: {
      optional: 'Optional',
      required: 'Required',
      pickDate: 'Pick a date',
      noPastDates: 'Past dates are disabled',
      noFutureDates: 'Future dates are disabled',
      availableFrom: 'Available from',
      until: 'until',
      enterPhoneNumber: 'Enter your phone number',
      validPhoneNumber: 'Please enter a valid phone number',
      validEmail: 'Please enter a valid email address',
      other: 'Other',
      pleaseSpecify: 'Please specify...',
      ctrlEnterSubmit: 'Press Ctrl + Enter to submit',
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
    questions: {
      optional: 'Opcional',
      required: 'Obligatorio',
      pickDate: 'Selecciona una fecha',
      noPastDates: 'Las fechas pasadas están deshabilitadas',
      noFutureDates: 'Las fechas futuras están deshabilitadas',
      availableFrom: 'Disponible desde',
      until: 'hasta',
      enterPhoneNumber: 'Ingresa tu número de teléfono',
      validPhoneNumber: 'Por favor ingresa un número de teléfono válido',
      validEmail: 'Por favor ingresa una dirección de correo válida',
      other: 'Otro',
      pleaseSpecify: 'Por favor especifica...',
      ctrlEnterSubmit: 'Presiona Ctrl + Enter para enviar',
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
    questions: {
      optional: 'Optionnel',
      required: 'Obligatoire',
      pickDate: 'Choisir une date',
      noPastDates: 'Les dates passées sont désactivées',
      noFutureDates: 'Les dates futures sont désactivées',
      availableFrom: 'Disponible à partir du',
      until: 'jusqu\'au',
      enterPhoneNumber: 'Entrez votre numéro de téléphone',
      validPhoneNumber: 'Veuillez entrer un numéro de téléphone valide',
      validEmail: 'Veuillez entrer une adresse e-mail valide',
      other: 'Autre',
      pleaseSpecify: 'Veuillez préciser...',
      ctrlEnterSubmit: 'Appuyez sur Ctrl + Entrée pour soumettre',
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
    questions: {
      optional: 'Optional',
      required: 'Erforderlich',
      pickDate: 'Datum auswählen',
      noPastDates: 'Vergangene Daten sind deaktiviert',
      noFutureDates: 'Zukünftige Daten sind deaktiviert',
      availableFrom: 'Verfügbar ab',
      until: 'bis',
      enterPhoneNumber: 'Telefonnummer eingeben',
      validPhoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein',
      validEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      other: 'Andere',
      pleaseSpecify: 'Bitte angeben...',
      ctrlEnterSubmit: 'Drücken Sie Strg + Enter zum Absenden',
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
    questions: {
      optional: 'Opcional',
      required: 'Obrigatório',
      pickDate: 'Escolha uma data',
      noPastDates: 'Datas passadas estão desabilitadas',
      noFutureDates: 'Datas futuras estão desabilitadas',
      availableFrom: 'Disponível a partir de',
      until: 'até',
      enterPhoneNumber: 'Digite seu número de telefone',
      validPhoneNumber: 'Por favor, insira um número de telefone válido',
      validEmail: 'Por favor, insira um endereço de e-mail válido',
      other: 'Outro',
      pleaseSpecify: 'Por favor especifique...',
      ctrlEnterSubmit: 'Pressione Ctrl + Enter para enviar',
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
    questions: {
      optional: 'Optioneel',
      required: 'Verplicht',
      pickDate: 'Kies een datum',
      noPastDates: 'Verleden datums zijn uitgeschakeld',
      noFutureDates: 'Toekomstige datums zijn uitgeschakeld',
      availableFrom: 'Beschikbaar vanaf',
      until: 'tot',
      enterPhoneNumber: 'Voer uw telefoonnummer in',
      validPhoneNumber: 'Voer een geldig telefoonnummer in',
      validEmail: 'Voer een geldig e-mailadres in',
      other: 'Andere',
      pleaseSpecify: 'Specificeer alstublieft...',
      ctrlEnterSubmit: 'Druk op Ctrl + Enter om te verzenden',
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
    questions: {
      optional: 'Facoltativo',
      required: 'Obbligatorio',
      pickDate: 'Scegli una data',
      noPastDates: 'Le date passate sono disabilitate',
      noFutureDates: 'Le date future sono disabilitate',
      availableFrom: 'Disponibile da',
      until: 'fino a',
      enterPhoneNumber: 'Inserisci il tuo numero di telefono',
      validPhoneNumber: 'Inserisci un numero di telefono valido',
      validEmail: 'Inserisci un indirizzo email valido',
      other: 'Altro',
      pleaseSpecify: 'Specifica per favore...',
      ctrlEnterSubmit: 'Premi Ctrl + Invio per inviare',
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
    questions: {
      optional: 'Valfritt',
      required: 'Obligatorisk',
      pickDate: 'Välj ett datum',
      noPastDates: 'Tidigare datum är inaktiverade',
      noFutureDates: 'Framtida datum är inaktiverade',
      availableFrom: 'Tillgänglig från',
      until: 'till',
      enterPhoneNumber: 'Ange ditt telefonnummer',
      validPhoneNumber: 'Ange ett giltigt telefonnummer',
      validEmail: 'Ange en giltig e-postadress',
      other: 'Annat',
      pleaseSpecify: 'Vänligen specificera...',
      ctrlEnterSubmit: 'Tryck på Ctrl + Enter för att skicka',
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
    questions: {
      optional: 'Valgfritt',
      required: 'Påkrevd',
      pickDate: 'Velg en dato',
      noPastDates: 'Tidligere datoer er deaktivert',
      noFutureDates: 'Fremtidige datoer er deaktivert',
      availableFrom: 'Tilgjengelig fra',
      until: 'til',
      enterPhoneNumber: 'Skriv inn telefonnummeret ditt',
      validPhoneNumber: 'Vennligst oppgi et gyldig telefonnummer',
      validEmail: 'Vennligst oppgi en gyldig e-postadresse',
      other: 'Annet',
      pleaseSpecify: 'Vennligst spesifiser...',
      ctrlEnterSubmit: 'Trykk Ctrl + Enter for å sende inn',
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
    questions: {
      optional: 'Valgfri',
      required: 'Påkrævet',
      pickDate: 'Vælg en dato',
      noPastDates: 'Tidligere datoer er deaktiveret',
      noFutureDates: 'Fremtidige datoer er deaktiveret',
      availableFrom: 'Tilgængelig fra',
      until: 'indtil',
      enterPhoneNumber: 'Indtast dit telefonnummer',
      validPhoneNumber: 'Indtast venligst et gyldigt telefonnummer',
      validEmail: 'Indtast venligst en gyldig e-mailadresse',
      other: 'Andet',
      pleaseSpecify: 'Angiv venligst...',
      ctrlEnterSubmit: 'Tryk Ctrl + Enter for at indsende',
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
    questions: {
      optional: 'Valinnainen',
      required: 'Pakollinen',
      pickDate: 'Valitse päivämäärä',
      noPastDates: 'Menneet päivämäärät on poistettu käytöstä',
      noFutureDates: 'Tulevat päivämäärät on poistettu käytöstä',
      availableFrom: 'Saatavilla alkaen',
      until: 'asti',
      enterPhoneNumber: 'Syötä puhelinnumerosi',
      validPhoneNumber: 'Ole hyvä ja syötä kelvollinen puhelinnumero',
      validEmail: 'Ole hyvä ja syötä kelvollinen sähköpostiosoite',
      other: 'Muu',
      pleaseSpecify: 'Ole hyvä ja täsmennä...',
      ctrlEnterSubmit: 'Paina Ctrl + Enter lähettääksesi',
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
    questions: {
      optional: 'Opcjonalne',
      required: 'Wymagane',
      pickDate: 'Wybierz datę',
      noPastDates: 'Daty z przeszłości są wyłączone',
      noFutureDates: 'Przyszłe daty są wyłączone',
      availableFrom: 'Dostępne od',
      until: 'do',
      enterPhoneNumber: 'Wprowadź swój numer telefonu',
      validPhoneNumber: 'Proszę wprowadzić prawidłowy numer telefonu',
      validEmail: 'Proszę wprowadzić prawidłowy adres e-mail',
      other: 'Inne',
      pleaseSpecify: 'Proszę sprecyzować...',
      ctrlEnterSubmit: 'Naciśnij Ctrl + Enter, aby wysłać',
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
    questions: {
      optional: 'Необязательно',
      required: 'Обязательно',
      pickDate: 'Выберите дату',
      noPastDates: 'Прошлые даты отключены',
      noFutureDates: 'Будущие даты отключены',
      availableFrom: 'Доступно с',
      until: 'до',
      enterPhoneNumber: 'Введите номер телефона',
      validPhoneNumber: 'Пожалуйста, введите действительный номер телефона',
      validEmail: 'Пожалуйста, введите действительный адрес электронной почты',
      other: 'Другое',
      pleaseSpecify: 'Пожалуйста, уточните...',
      ctrlEnterSubmit: 'Нажмите Ctrl + Enter для отправки',
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
    questions: {
      optional: '任意',
      required: '必須',
      pickDate: '日付を選択',
      noPastDates: '過去の日付は無効です',
      noFutureDates: '未来の日付は無効です',
      availableFrom: '利用可能期間',
      until: 'から',
      enterPhoneNumber: '電話番号を入力してください',
      validPhoneNumber: '有効な電話番号を入力してください',
      validEmail: '有効なメールアドレスを入力してください',
      other: 'その他',
      pleaseSpecify: '詳細を入力してください...',
      ctrlEnterSubmit: 'Ctrl + Enterキーを押して送信',
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
    questions: {
      optional: '可选',
      required: '必填',
      pickDate: '选择日期',
      noPastDates: '过去的日期已禁用',
      noFutureDates: '未来的日期已禁用',
      availableFrom: '可用时间',
      until: '至',
      enterPhoneNumber: '输入您的电话号码',
      validPhoneNumber: '请输入有效的电话号码',
      validEmail: '请输入有效的电子邮件地址',
      other: '其他',
      pleaseSpecify: '请说明...',
      ctrlEnterSubmit: '按 Ctrl + Enter 提交',
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
    questions: {
      optional: 'اختياري',
      required: 'مطلوب',
      pickDate: 'اختر تاريخاً',
      noPastDates: 'التواريخ السابقة معطلة',
      noFutureDates: 'التواريخ المستقبلية معطلة',
      availableFrom: 'متاح من',
      until: 'حتى',
      enterPhoneNumber: 'أدخل رقم هاتفك',
      validPhoneNumber: 'يرجى إدخال رقم هاتف صالح',
      validEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      other: 'آخر',
      pleaseSpecify: 'يرجى التحديد...',
      ctrlEnterSubmit: 'اضغط Ctrl + Enter للإرسال',
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
    questions: {
      optional: 'İsteğe bağlı',
      required: 'Gerekli',
      pickDate: 'Bir tarih seçin',
      noPastDates: 'Geçmiş tarihler devre dışı',
      noFutureDates: 'Gelecek tarihler devre dışı',
      availableFrom: 'Kullanılabilir tarih',
      until: 'ile',
      enterPhoneNumber: 'Telefon numaranızı girin',
      validPhoneNumber: 'Lütfen geçerli bir telefon numarası girin',
      validEmail: 'Lütfen geçerli bir e-posta adresi girin',
      other: 'Diğer',
      pleaseSpecify: 'Lütfen belirtin...',
      ctrlEnterSubmit: 'Göndermek için Ctrl + Enter tuşlarına basın',
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
    questions: {
      optional: '선택사항',
      required: '필수',
      pickDate: '날짜 선택',
      noPastDates: '과거 날짜가 비활성화되었습니다',
      noFutureDates: '미래 날짜가 비활성화되었습니다',
      availableFrom: '사용 가능 기간',
      until: '부터',
      enterPhoneNumber: '전화번호를 입력하세요',
      validPhoneNumber: '유효한 전화번호를 입력해 주세요',
      validEmail: '유효한 이메일 주소를 입력해 주세요',
      other: '기타',
      pleaseSpecify: '입력해 주세요...',
      ctrlEnterSubmit: 'Ctrl + Enter를 눌러 제출',
    },
  },
};
