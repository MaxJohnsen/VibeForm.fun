# Real-time Analytics

Prompts used to implement real-time analytics and question performance.

## Initial Prompt
> Let's move on to the next phase. I want you to implement a real-time dashboard for tracking the submissions and statistics of the survey. I have attached a reference photo showing some of the design and functionality I want. This is just for reference, and you don't need to follow it exactly. Here are some suggestions:
>
> *   I want to live-track individual responses as shown in the photo. However, since we don't have the names, just create a persona for each «session_id». Show the time ago and which question they are on / their status. The rating shown in the photo doesn't make sense, as there could be none or several of that type.
> *   I also want a list of questions showing the performance for each. For rankings, an average is perfect; for yes/no, a percentage is good; for free text, we just need the number of responses, etc. Fill in the blanks here for all question types.
>
> We don't need any device breakdown.

## Fixes
- **Missing Data**: I'm not seeing any of my existing (or new) responses in my dashboard. Please check that the implementation is finished and bug-free.
- **Real-time Updates**: I'm not seeing the recent responses update in real time (without refreshing). Also, it always says (answered 0/X questions), even though the user has actually answered more. Additionally, the question performance shows nothing—just the questions.
- **Performance Visualization**: So, let’s improve the question performance, as not everything here makes sense. First, remove the visual bar. The visual component should only display the correct representation based on the question type. For example, for score-type questions, it should show the average; for text questions, just the number of responses, etc. As we discussed, fill in the blanks here as needed. Additionally, the percentage should display the "Drop-off rate." You can use the total number of responses, since not all respondents answer every question (we have logic rules, right?). You need to check all responses that include an answer to that question and determine how many of these have that question as their last answered. Do a thorough review here and consider possible improvements.
- **Cleanup**: You may remove the "5 respondents reached this question • 1 dropped off here" section. Also, for the ratings, remember that the scale is defined by the user when building the question. You can always use stars for visualization, but it should display the total possible score. For surveys in progress, instead of showing "Answered 3 of 5 questions," display "Currently at question X." We don't need to show completion timing for surveys in progress. For completed surveys, instead of "Completed all 5 questions," use "Completed X questions." The reason is that, due to logic rules, a completed survey may contain a different number of questions.
- **Interactivity**: Okay, everything works now. However, nothing interactive happens on the dashboard page. I still need to manually refresh to see changes.
- **Refresh Issue**: I unfortunately still need to manually refresh the page. Can you check if the frontend is set up correctly?
- **Still Not Updating**: It’s still not updating....
- **Page Protection**: Okay, make sure the new page protection covers all sensitive pages.
- **Status & Sharing**: Now, to fully finalize this, you need to implement the ability to activate, deactivate, and archive a form, as well as a share menu with a link and QR code.
- **Share Logic**: Okay, a couple more things: 1. The share button should be on the far right. The draft/active/archived statuses should have distinct text colors to indicate their status. If you press share while in draft or archived mode, it shouldn't show a link or QR code—just a warning.
- **Status UX**: The current solution is neither intuitive nor effective. It simply displays "Draft" alongside other buttons, making it unclear to users what will happen before they press the button. Drastically improve the UX/UI by following best practices.
- **Improve Plan**: Implement the plan to improve status menu UX/UI.
- **Hover Contrast**: Perfect, but the hover effects ruin some of the contrast—please improve this. see attached example.
- **Question Numbers**: The question numbers in the question performance are incorrect (they start at Q0, which is not correct).
- **Share Dropdown**: Could we display the share menu as a small dropdown or tooltip beneath the button, instead of using a modal? Also, please show both the link and QR code in the same view.
- **Mock Data**: On the card, the number of responses appears to be mock data—please use the actual data.
