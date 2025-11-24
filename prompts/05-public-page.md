# Public Page & Edge Functions

Prompts used to create the public response page and the edge functions for handling submissions.

## Initial Prompt
> So, we should now begin working on the functionality that allows users to fetch and answer surveys. The main complexity here is that completely anonymous individuals should be able to answer the forms. However, we don’t want to make the tables public, nor do we want the client to handle the logic for evaluating rules.
>
> Therefore, I think this should be solved with several edge functions that guide users through the forms, evaluate the next question based on their answers, and somehow generate or assign a temporary session ID to persist and identify an anonymous user as they respond. The solution should also account for situations where a user goes back and changes their answers (which may open up new flows)—here, you could simplify things by deleting answers when going back, but I’m not sure.
>
> The solution should be robust, but not too complicated. Start by suggesting the flow and functions, but don’t return any code yet.

## Fixes
- **Frontend Implementation**: With these Edge functions, we are ready to move on to the next phase of the application: developing an entirely new public front end for answering forms. Please conduct a thorough review of everything that needs to be done, making full use of the Edge functions you have just created. Additionally, ensure that all question types and their various properties are properly handled, evaluated, and rendered. I have attached a reference image illustrating the desired design language for the new public-facing pages, but keep in mind that Typeform should serve as a major source of inspiration.
- **Preview Link**: Now, the preview button should open this part of the application in a new tab.
- **Session Issues**: Okay, I just tried it out. Some parts worked, but not all. I got stuck at question 3 and couldn’t continue. It also seems like I was able to answer the same question twice, resulting in two rows in the database. Additionally, things were pretty sluggish. Please save the returned session ID in local storage and reuse it so that the session persists after a page refresh—use best practices for this. Please do a thorough review and make sure everything is properly implemented.
- **Database Constraint**: Okay, for 1. Database Constraint Violation (Blocking Back Navigation) - I think you are overcomplicating. The answer here is of course, that you should not be able to have several records for the same question session at all - just update the one you have on resubmit?
- **Submission Bug**: So I'm testing, and is at question 3/4 trying to submit a single line input answer, however nothing happens when pressing next? It worked on the first question.
- **Enter Key**: Continue (however, I have to say, it sounds weird as it doesn't work for Enter, nor was this a problem earlier in the form (with the score question)).
- **Back Navigation Error**: Navigate back doesn't work, and I'm getting the following error: "Failed to fetch answers: ... column answers.is_current does not exist". Also, please verify that the logic is correct. Keep in mind that there might not be any posted answers yet for the question we're navigating back from.
- **Back Logic**: I don’t like the back logic. I think the logic should be: send the current question ID—if a response exists, delete it; if not, just go back to the previous question. Also, we have no way of knowing what the last answered question is. Does it make sense to order by "answered at" in descending order? I'm open for suggestion, do a review.
- **Logic & Reset**: Okay, three more things: First, when a question has only a default action that is non-standard (i.e., skips to another question) and no other rules, this is not respected—it still proceeds to the next question in order. Additionally, make sure inputs are cleared after submission. Currently, the input is retained between two single-text questions, for example. Finally, when entering an existing question—either when starting an existing form or going back—the previous answer should be prefilled. I don't think this is returned at all from the edge functions.
- **404 Error**: When I encounter a text input question, I now get: `Failed to load resource: the server responded with a status of 404...`
- **Input Reset**: Make sure the input is properly reset when going back. Currently, my answer for the previous question was saved and then submitted for the wrong question when I pressed "Next" again. Remember, when going back, ONLY the existing answer for that specific question should be shown and saved as the state. Do a proper review.
- **Disabled Button**: Perfect. However, when going back, the Next button is disabled, so I have to make a change to proceed.
- **Score Button**: Now, this worked for inputs. However, for the score, I still need to manually force a change to proceed (the button is enabled, but nothing happens when I press it). Please do a thorough review for all types.
- **Alignment**: This looks a little weird when the question is left-aligned but the stars are centered. Any suggestions? Maybe center-align the question for types that are also center-aligned, such as rating, while keeping the rest left-aligned?
- **Long Text Bug**: Submission of long text questions doesn't work—nothing happens when pressing Next, even though it is enabled.
- **Phone/Date Bug**: Same with the phone number (also check the date).
- **Branding**: Now, on the form reply page, remember that the application is called "VibeForm" and use the same icon as in the navbar.
- **Yes/No Logic**: I am having trouble with the rules for "Yes"/"No" questions not evaluating properly. Can you make it so that, for these types, we only have "equals true/false" and not "not equals true/false" or any free text?
