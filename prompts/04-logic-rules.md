# Logic Rules

Prompts used to implement logic rules for the form.

## Initial Prompt
> Okay, now—on to a very complex task. Like in Typeform, we want to implement rules to control the flow of questions. The rules should be extremely user-friendly and intuitive. A typical rule set would be: "If the value is X / greater than Y / not B → Go to question X." Every question should have a default rule: "If not, go to the next question."
>
> My suggestion is that you can open a rules modal for each question to edit its rules. All rules should have a clear visual representation or indication on the canvas—perhaps arrows? For example, an arrow from card 1 to card 3 on the right side.
>
> I want you to review best practices and replicate how this is handled in major applications.

## Fixes
- **Implementation Phase 1 & 2**: Implement the conditional logic plan starting with Phase 1 (database schema) and Phase 2 (core components).
- **Visual Arrows**: Add SVG arrow overlays on the canvas to visually show logic flow connections between question cards (Phase 3).
- **Missing Arrows**: I'm not seeing any visual arrows, indicators connecting cards as of now?
- **Still Missing Arrows**: Still not seeing any arrows at all - do a proper review.
- **Rethink Approach**: This is not working very good. Think about a completely different approach to visualize the rules / connected questions on the canvas. Remember, best practices.
- **Inline Indicators**: Implement the enhanced inline card indicators plan - remove SVG arrows and add logic summaries directly on cards with interactive highlighting.
- **Refinement**: Okay, I like the approach. Make it more compact / Remove the "logic rules" header. Make the area collapsible and expandable. Remove the interactivity as it is not needed.
- **Badge Collision**: Perfect. However, the "number of rules" badge at the top left is currently colliding with the question number badge. I suggest removing it entirely, but making the "X rules" header purple to stand out, along with the small symbol.
- **Multiple Select Logic**: How should we handle rules for multiple select options when several selections are allowed? Should we disable the rules for these cases entirely? What do you suggest?
- **Runtime Error**: For the code present, I get the error below. Please think step-by-step in order to resolve it. `Uncaught TypeError: Cannot read properties of undefined (reading 'logic')`
- **Ignore Error**: Let's ignore that for now. Small problem, when doing changes in the properties, the changes are saved, but the canvas are not rerendered properly anymore (or at least the updates are not visible as they should before refresh).
- **Rerender Issue**: It's still not properly showing the changes on the card (before forcing page refresh). Also fix this one: `Warning: Maximum update depth exceeded...`
- **Update Depth**: Good, still getting this however, that should be fixed: `Warning: Maximum update depth exceeded...`
- **Final Fixes**: Perfect, everything is fixed now except more of this one: `Warning: Maximum update depth exceeded...`
- **Immediate Display**: Two things: When adding rules, they are not immediately displayed on the canvas; a page refresh is required for them to appear. Also, display the default action for each card, especially if it is not simply "skip to next."
- **Simplify Logic Display**: It looks like this now, which I feel is a bit hard to understand. Could we simplify it so it’s extremely intuitive and easy for the user to see what happens? Maybe something like “Skips to Q4” or similar. Perhaps we should always indicate what the next question will be, and if we override the custom action, it simply shows that question instead. If we have rules, they are displayed as usual.
- **Skips to End**: Implement the plan; however, it should say "Skips to end" instead (we will add an end screen later).
- **Unified Row**: We are on the right track. For all cards, I want everything in one row, displaying both the text and symbol. If there are rules, it should say, for example: If greater than "5" -> Q2; otherwise -> Q3. If it’s just the default next question, it should simply say -> Q2 (if we are on Q1). If it’s a default override, it should say -> Skips to Q4.
- **Duplicate Arrows**: Okay, now we have two arrows - also, in the default case (no logic), it should show the -> Q(next question number).
- **Position Fix**: When opening the logic modal, the actual question numbers is not the correct one. Make sure you fetch the actual position.
