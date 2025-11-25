import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BuilderTopBar } from '../components/BuilderTopBar';
import { QuestionTypePalette } from '../components/QuestionTypePalette';
import { QuestionCanvas } from '../components/QuestionCanvas';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { IntroPropertiesPanel } from '../components/IntroPropertiesPanel';
import { EndPropertiesPanel } from '../components/EndPropertiesPanel';
import { LogicModal } from '../components/LogicModal';
import { useQuestions } from '../hooks/useQuestions';
import { formsApi } from '@/features/forms/api/formsApi';
import { QuestionType } from '@/shared/constants/questionTypes';
import { QuestionLogic } from '../types/logic';
import { IntroSettings, EndSettings, defaultIntroSettings, defaultEndSettings } from '../types/screenSettings';
import { debounce } from '@/shared/utils/debounce';
import { getDefaultSettings } from '../types/questionSettings';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useIsMobile } from '@/hooks/use-mobile';
import { useForms } from '@/features/forms/hooks/useForms';

export const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const isMobile = useIsMobile();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tempQuestions, setTempQuestions] = useState<any[]>([]);
  const [logicModalOpen, setLogicModalOpen] = useState(false);
  const [logicEditingQuestionId, setLogicEditingQuestionId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [localIntroSettings, setLocalIntroSettings] = useState<IntroSettings>(defaultIntroSettings);
  const [localEndSettings, setLocalEndSettings] = useState<EndSettings>(defaultEndSettings);

  const { updateForm } = useForms();

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  const {
    questions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  } = useQuestions(formId!);

  // Sync intro settings when form data changes
  useEffect(() => {
    if (form?.intro_settings && Object.keys(form.intro_settings).length > 0) {
      setLocalIntroSettings(form.intro_settings as IntroSettings);
    } else {
      setLocalIntroSettings(defaultIntroSettings);
    }
  }, [form?.intro_settings]);

  // Sync end settings when form data changes
  useEffect(() => {
    if (form?.end_settings && Object.keys(form.end_settings).length > 0) {
      setLocalEndSettings(form.end_settings as EndSettings);
    } else {
      setLocalEndSettings(defaultEndSettings);
    }
  }, [form?.end_settings]);

  // Derive selectedQuestion from tempQuestions for instant UI updates
  const selectedQuestion = useMemo(
    () => {
      if (!selectedItemId || selectedItemId === 'intro' || selectedItemId === 'end') {
        return null;
      }
      return tempQuestions.find((q) => q.id === selectedItemId) ?? null;
    },
    [tempQuestions, selectedItemId]
  );

  // Sync tempQuestions with questions from React Query
  useEffect(() => {
    setTempQuestions((prev) => {
      const createSignature = (arr: any[]) =>
        arr.map((q) => `${q.id}|${q.label}|${JSON.stringify(q.settings)}`).join('||');

      const prevSig = createSignature(prev);
      const newSig = createSignature(questions);

      return prevSig === newSig ? prev : questions;
    });
  }, [questions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddQuestion = async (type: string, position?: number) => {
    // Check for single-instance validation for respondent_name
    if (type === 'respondent_name') {
      const existingNameQuestion = questions.find((q) => q.type === 'respondent_name');
      if (existingNameQuestion) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: 'Only one Respondent Name field allowed',
          description: 'Use Short Text for additional name fields.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const questionType = type as QuestionType;
      const targetPosition = position !== undefined ? position : questions.length;

      if (position !== undefined && position < questions.length) {
        const updates = questions
          .filter((q) => q.position >= position)
          .map((q) => ({
            id: q.id,
            position: q.position + 1,
          }));
        if (updates.length > 0) {
          await reorderQuestions(updates);
        }
      }

      const newQuestion = await createQuestion({
        type: questionType,
        label: questionType === 'respondent_name' 
          ? 'What is your name?' 
          : `New ${type.replace('_', ' ')} question`,
        position: targetPosition,
        settings: getDefaultSettings(questionType),
      });

      if (!isMobile) {
        setSelectedItemId(newQuestion.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save for question label
  const debouncedUpdate = useMemo(
    () =>
      debounce((id: string, label: string) => {
        setIsSaving(true);
        updateQuestion(
          { id, data: { label } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [updateQuestion]
  );

  // Debounced save for question settings
  const debouncedSettingsUpdate = useMemo(
    () =>
      debounce((id: string, settings: Record<string, any>) => {
        setIsSaving(true);
        updateQuestion(
          { id, data: { settings } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [updateQuestion]
  );

  // Debounced save for intro settings
  const debouncedIntroUpdate = useMemo(
    () =>
      debounce((settings: IntroSettings) => {
        if (!formId) return;
        setIsSaving(true);
        updateForm(
          { id: formId, data: { intro_settings: settings } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [formId, updateForm]
  );

  // Debounced save for end settings
  const debouncedEndUpdate = useMemo(
    () =>
      debounce((settings: EndSettings) => {
        if (!formId) return;
        setIsSaving(true);
        updateForm(
          { id: formId, data: { end_settings: settings } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [formId, updateForm]
  );

  const handleUpdateLabel = useCallback(
    (label: string) => {
      if (!selectedItemId || selectedItemId === 'intro' || selectedItemId === 'end') return;

      setTempQuestions((prev) =>
        prev.map((q) => (q.id === selectedItemId ? { ...q, label } : q))
      );

      debouncedUpdate(selectedItemId, label);
    },
    [selectedItemId, debouncedUpdate]
  );

  const handleUpdateSettings = useCallback(
    (settings: Record<string, any>) => {
      if (!selectedItemId || selectedItemId === 'intro' || selectedItemId === 'end') return;

      setTempQuestions((prev) =>
        prev.map((q) => (q.id === selectedItemId ? { ...q, settings } : q))
      );

      debouncedSettingsUpdate(selectedItemId, settings);
    },
    [selectedItemId, debouncedSettingsUpdate]
  );

  const handleUpdateIntroSettings = useCallback(
    (settings: IntroSettings) => {
      setLocalIntroSettings(settings);
      debouncedIntroUpdate(settings);
    },
    [debouncedIntroUpdate]
  );

  const handleUpdateEndSettings = useCallback(
    (settings: EndSettings) => {
      setLocalEndSettings(settings);
      debouncedEndUpdate(settings);
    },
    [debouncedEndUpdate]
  );

  const handleDeleteQuestion = async (id: string) => {
    if (logicEditingQuestionId === id) {
      setLogicModalOpen(false);
      setLogicEditingQuestionId(null);
    }

    if (selectedItemId === id) {
      const index = questions.findIndex((q) => q.id === id);
      const nextQuestion = questions[index + 1] || questions[index - 1];
      setSelectedItemId(nextQuestion?.id || null);
    }
    
    setIsSaving(true);
    try {
      await deleteQuestion(id);
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleOpenLogic = (questionId: string) => {
    setLogicEditingQuestionId(questionId);
    setLogicModalOpen(true);
  };

  const handleSaveLogic = async (logic: QuestionLogic) => {
    if (!logicEditingQuestionId) return;

    setTempQuestions((prev) =>
      prev.map((q) => (q.id === logicEditingQuestionId ? { ...q, logic } : q))
    );

    setIsSaving(true);
    updateQuestion(
      { id: logicEditingQuestionId, data: { logic } },
      {
        onSettled: () => {
          setTimeout(() => setIsSaving(false), 300);
        },
      }
    );
  };

  const handleReorderQuestions = (reorderedQuestions: typeof questions) => {
    const updates = reorderedQuestions.map((q, index) => ({
      id: q.id,
      position: index,
    }));
    reorderQuestions(updates);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (!active.id.toString().startsWith('palette-')) {
      if (active.id !== over.id) {
        setTempQuestions((items) => {
          const oldIndex = items.findIndex((q) => q.id === active.id);
          const newIndex = items.findIndex((q) => q.id === over.id);

          if (oldIndex === -1 || newIndex === -1) return items;

          const newItems = [...items];
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);
          
          return newItems.map((q, idx) => ({ ...q, position: idx }));
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      setTempQuestions(questions);
      return;
    }

    if (active.id.toString().startsWith('palette-')) {
      const questionType = active.data.current?.type;
      if (!questionType) return;

      let position = 0;

      if (over.id === 'empty-canvas') {
        position = 0;
      } else if (over.id === 'drop-after-intro') {
        position = 0;
      } else if (over.id.toString().startsWith('drop-after-')) {
        const arrayIndex = parseInt(over.id.toString().replace('drop-after-', ''));
        const questionAtIndex = tempQuestions[arrayIndex];
        if (questionAtIndex) {
          position = questionAtIndex.position + 1;
        } else {
          position = tempQuestions.length;
        }
      } else {
        const targetQuestion = questions.find((q) => q.id === over.id);
        if (targetQuestion) {
          const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
          const targetIndex = sortedQuestions.findIndex((q) => q.id === targetQuestion.id);
          position = targetIndex + 1;
        } else {
          position = questions.length;
        }
      }

      await handleAddQuestion(questionType, position);
    } else {
      const originalIds = questions.map((q) => q.id).join('|');
      const newIds = tempQuestions.map((q) => q.id).join('|');

      if (originalIds !== newIds) {
        handleReorderQuestions(tempQuestions);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setTempQuestions(questions);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <BuilderTopBar
        form={form || null}
        isSaving={isSaving}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 flex overflow-hidden relative">
          {/* Desktop Palette */}
          <div className="hidden md:block h-full">
            <QuestionTypePalette onSelectType={handleAddQuestion} />
          </div>

          <QuestionCanvas
            formTitle={form?.title || 'Untitled Form'}
            introSettings={localIntroSettings}
            endSettings={localEndSettings}
            questions={tempQuestions}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onDeleteQuestion={handleDeleteQuestion}
            onReorderQuestions={handleReorderQuestions}
            onOpenLogic={handleOpenLogic}
            activeId={activeId}
          />

          {/* Desktop Properties Panel */}
          <div className="hidden md:block h-full">
            {selectedItemId === 'intro' ? (
              <div className="w-80 border-l border-border/50 glass-panel h-full overflow-y-auto p-6">
                <IntroPropertiesPanel
                  formTitle={form?.title || 'Untitled Form'}
                  settings={localIntroSettings}
                  onUpdate={handleUpdateIntroSettings}
                  language={(form?.language as any) || 'en'}
                  onLanguageChange={(language) => {
                    if (!formId) return;
                    updateForm({ id: formId, data: { language } });
                  }}
                />
              </div>
            ) : selectedItemId === 'end' ? (
              <div className="w-80 border-l border-border/50 glass-panel h-full overflow-y-auto p-6">
                <EndPropertiesPanel
                  settings={localEndSettings}
                  onUpdate={handleUpdateEndSettings}
                />
              </div>
            ) : selectedQuestion ? (
              <PropertiesPanel
                question={selectedQuestion}
                onUpdateLabel={handleUpdateLabel}
                onUpdateSettings={handleUpdateSettings}
                onDelete={() => setDeleteConfirmationId(selectedQuestion.id)}
                onOpenLogic={() => handleOpenLogic(selectedQuestion.id)}
                className="w-80 border-l border-border/50 glass-panel h-full"
              />
            ) : (
              <div className="w-80 border-l border-border/50 glass-panel h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center text-center max-w-xs">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary h-8 w-8"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Select to Edit</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click on intro, end, or any question to edit properties
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Palette Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetTitle className="sr-only">Question Types</SheetTitle>
              <SheetDescription className="sr-only">
                Select a question type to add to the form
              </SheetDescription>
              <QuestionTypePalette
                onSelectType={(type) => {
                  handleAddQuestion(type);
                }}
                className="w-full border-none h-full"
              />
            </SheetContent>
          </Sheet>

          {/* Mobile Properties Sheet */}
          <Sheet open={!!selectedItemId && isMobile} onOpenChange={(open) => !open && setSelectedItemId(null)}>
            <SheetContent side="bottom" className="h-[100dvh] w-full p-0 bg-background z-[100] flex flex-col border-none">
              <SheetTitle className="sr-only">Properties</SheetTitle>
              <SheetDescription className="sr-only">
                Edit properties
              </SheetDescription>

              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                {selectedItemId && selectedItemId !== 'intro' && selectedItemId !== 'end' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -ml-2"
                    onClick={() => selectedItemId && setDeleteConfirmationId(selectedItemId)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
                {(selectedItemId === 'intro' || selectedItemId === 'end') && <div className="w-10" />}
                <h3 className="font-semibold text-lg">
                  {selectedItemId === 'intro' ? 'Intro Screen' : selectedItemId === 'end' ? 'End Screen' : 'Edit Question'}
                </h3>
                <Button onClick={() => setSelectedItemId(null)}>
                  Done
                </Button>
              </div>

              {selectedItemId === 'intro' ? (
                <div className="flex-1 overflow-y-auto bg-background p-4 pb-20">
                  <IntroPropertiesPanel
                    formTitle={form?.title || 'Untitled Form'}
                    settings={localIntroSettings}
                    onUpdate={handleUpdateIntroSettings}
                    language={(form?.language as any) || 'en'}
                    onLanguageChange={(language) => {
                      if (!formId) return;
                      updateForm({ id: formId, data: { language } });
                    }}
                  />
                </div>
              ) : selectedItemId === 'end' ? (
                <div className="flex-1 overflow-y-auto bg-background p-4 pb-20">
                  <EndPropertiesPanel
                    settings={localEndSettings}
                    onUpdate={handleUpdateEndSettings}
                  />
                </div>
              ) : selectedQuestion ? (
                <PropertiesPanel
                  question={selectedQuestion}
                  onUpdateLabel={handleUpdateLabel}
                  onUpdateSettings={handleUpdateSettings}
                  onDelete={() => setDeleteConfirmationId(selectedQuestion.id)}
                  onOpenLogic={() => handleOpenLogic(selectedQuestion.id)}
                  showDelete={false}
                  className="w-full flex-1 overflow-y-auto bg-background p-4 pb-20"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading...
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </DndContext>

      {/* Logic Modal */}
      {(() => {
        const logicQuestion = questions.find((q) => q.id === logicEditingQuestionId);
        return logicQuestion ? (
          <LogicModal
            open={logicModalOpen}
            onOpenChange={setLogicModalOpen}
            question={logicQuestion}
            allQuestions={questions}
            onSave={handleSaveLogic}
          />
        ) : null;
      })()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmationId}
        onOpenChange={(open) => !open && setDeleteConfirmationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmationId) {
                  handleDeleteQuestion(deleteConfirmationId);
                  setDeleteConfirmationId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
