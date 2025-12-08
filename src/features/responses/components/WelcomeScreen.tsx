import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { IntroSettings } from "@/features/builder/types/screenSettings";
import { useTranslation } from "../hooks/useTranslation";
import { SupportedLanguage, translations } from "@/shared/constants/translations";
import { TURNSTILE_SITE_KEY, isTurnstileConfigured } from "@/shared/constants/turnstile";

interface WelcomeScreenProps {
  formTitle: string;
  introSettings?: IntroSettings;
  totalQuestions: number;
  onStart: (turnstileToken?: string) => void;
  language?: string;
  isReturningUser?: boolean;
  isStarting?: boolean;
  turnstileEnabled?: boolean;
}

export const WelcomeScreen = ({
  formTitle,
  introSettings,
  totalQuestions,
  onStart,
  language = "en",
  isReturningUser = false,
  isStarting = false,
  turnstileEnabled = false,
}: WelcomeScreenProps) => {
  const t = useTranslation(language as SupportedLanguage);
  const displayTitle = introSettings?.title || formTitle;
  const displayDescription = introSettings?.description;
  const showQuestionCount = introSettings?.showQuestionCount ?? true;
  const showEstimatedTime = introSettings?.showEstimatedTime ?? true;

  // Only require Turnstile if: frontend has site key, backend has secret, and not a returning user
  const requiresTurnstile = isTurnstileConfigured() && turnstileEnabled && !isReturningUser;

  const [verificationStarted, setVerificationStarted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Button text: translated "Continue" for returning users, custom or translated "Start" for new users
  const buttonText = isReturningUser ? t.welcome.continue : introSettings?.buttonText || t.welcome.start;

  const handleStart = () => {
    if (!requiresTurnstile) {
      // Returning user or Turnstile not configured - proceed immediately
      onStart(undefined);
      return;
    }

    if (!verificationStarted) {
      // First click - start verification
      setVerificationStarted(true);
      setIsTokenLoading(true);
      return;
    }

    if (turnstileToken) {
      // Already verified - proceed
      onStart(turnstileToken);
    } else if (turnstileError) {
      // Reset and retry on error
      turnstileRef.current?.reset();
      setTurnstileError(false);
      setIsTokenLoading(true);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError(false);
    setIsTokenLoading(false);
    // Auto-proceed after successful verification
    onStart(token);
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setTurnstileError(true);
    setIsTokenLoading(false);
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
    setIsTokenLoading(true);
    turnstileRef.current?.reset();
  };

  // Disable when: parent is starting session OR verification is in progress
  const isButtonDisabled = isStarting || (requiresTurnstile && verificationStarted && isTokenLoading && !turnstileError);

  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 text-center animate-fade-in">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">{displayTitle}</h1>
          {displayDescription && (
            <div
              className="text-lg sm:text-xl prose-intro max-w-xl mx-auto px-4"
              dangerouslySetInnerHTML={{ __html: displayDescription }}
            />
          )}
        </div>

        {(showEstimatedTime || showQuestionCount) && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {showEstimatedTime && (
              <>
                <span>
                  {t.welcome.takesAbout} {Math.ceil(totalQuestions * 0.25)} {t.welcome.minutes}
                </span>
                {showQuestionCount && <span>•</span>}
              </>
            )}
            {showQuestionCount && (
              <span>
                {totalQuestions} {t.welcome.questions}
              </span>
            )}
          </div>
        )}

        <Button
          onClick={handleStart}
          size="lg"
          disabled={isButtonDisabled}
          className="px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-lg gap-2 min-h-[48px] active:scale-95 hover-elevate transition-all"
        >
        {isStarting ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>{t.loading.starting}</span>
            </>
          ) : requiresTurnstile && verificationStarted && isTokenLoading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span>{t.welcome.verifying}</span>
            </>
          ) : requiresTurnstile && turnstileError ? (
            <span>{t.welcome.retryVerification}</span>
          ) : (
            <>
              {buttonText}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </>
          )}
        </Button>

        {/* Turnstile widget - rendered AFTER button, only when verification started */}
        {requiresTurnstile && verificationStarted && (
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              options={{
                appearance: "interaction-only",
                size: "flexible",
                theme: "light",
              }}
              onSuccess={handleTurnstileSuccess}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
            />
          </div>
        )}
      </div>
    </div>
  );
};
