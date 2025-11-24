# Extending Question Types

Prompts used to add more question types to the builder.

## Initial Prompt
> Let's implement the remaining question types:
> *   Multiple Choice
> *   Yes/No
> *   Rating (1–10)
> *   Email (with email validation)
> *   Phone (with phone validation)
> *   Date
>
> Conduct a thorough review of the requirements. Ensure that everything follows best UX/UI practices and is highly user-friendly.

## Fixes
- **Error Handling**: I get the following error based on the question_type constraint.
- **Preview Accuracy**: The question cards and previews do not perfectly match the various properties we enter for each type. Go through each question type and its properties, and ensure that the question card renders all required elements and follows best practices.
- **Preview Implementation**: Implement the plan to make QuestionCard previews accurately reflect all configured settings for each question type.
- **Visual Polish**: Some small fixes I would like to have done:
    *   The long text icon is very hard to see. Please replace it and make it more visible.
    *   The hover background for the question types is too purple and reduces the contrast.
    *   The selected question should be highlighted with a clear and attractive border.
    *   The Yes/No type preview buttons are too large.
- **Icon & Selection**: The long text icon is still very muted and hard to see, while the other icons are perfect—please do one more review here. Also, the selected question (i.e., the one whose properties are shown) still has no visual indicator that it is selected, such as a beautiful border.
- **Selection Border**: Very good. However, the issue with the selected question is not the styling—the border doesn't apply at all. Please conduct a proper review here.
- **Border Refinement**: That fixed it. Now reduce the border size again; it is way too thick.
- **Drag to Add**: To add new questions, I want users to be able to drag and drop them onto the canvas instead. Make the process intuitive and extremely easy to understand. There should also be helper text available somewhere.
- **Drag Issues**: So, the shadow when dragging is not working (we are not seeing anything) - also the drop zones between the questions are not properly spaced (too little top spacing). Also when dropping a place, it is not set in the correct order (for example, if dropping in between 4 and 5, its get on the second spot etc).
- **Ordering Bug**: You fixed most of the problems, however, when dragging in a new question, it always get at the second position, no matter how far down we drop it.
- **Drop Zone Polish**: Now, reduce the height of the drop zone a bit, and also, remove "click to add" functionality.
