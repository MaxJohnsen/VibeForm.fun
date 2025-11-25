import { RespondentNameQuestion } from './questions/RespondentNameQuestion';
import { ShortTextQuestion } from './questions/ShortTextQuestion';
import { LongTextQuestion } from './questions/LongTextQuestion';
import { MultipleChoiceQuestion } from './questions/MultipleChoiceQuestion';
import { YesNoQuestion } from './questions/YesNoQuestion';
import { RatingQuestion } from './questions/RatingQuestion';
import { EmailQuestion } from './questions/EmailQuestion';
import { PhoneQuestion } from './questions/PhoneQuestion';
import { DateQuestion } from './questions/DateQuestion';

interface QuestionRendererProps {
  question: any;
  onSubmit: (value: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const QuestionRenderer = ({
  question,
  onSubmit,
  onValidationChange,
}: QuestionRendererProps) => {
  const commonProps = {
    label: question.label,
    settings: question.settings || {},
    onSubmit,
    onValidationChange,
    initialValue: question.currentAnswer,
  };

  switch (question.type) {
    case 'respondent_name':
      return <RespondentNameQuestion {...commonProps} />;
    
    case 'short_text':
      return <ShortTextQuestion {...commonProps} />;
    
    case 'long_text':
      return <LongTextQuestion {...commonProps} />;
    
    case 'multiple_choice':
      return <MultipleChoiceQuestion {...commonProps} />;
    
    case 'yes_no':
      return <YesNoQuestion {...commonProps} />;
    
    case 'rating':
      return <RatingQuestion {...commonProps} />;
    
    case 'email':
      return <EmailQuestion {...commonProps} />;
    
    case 'phone':
      return <PhoneQuestion {...commonProps} />;
    
    case 'date':
      return <DateQuestion {...commonProps} />;
    
    default:
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Unsupported question type: {question.type}
          </p>
        </div>
      );
  }
};
