# Dashboard & Simple Form Builder

Prompts used to create the main dashboard and the initial form builder with 2 question types.

## Initial Prompt
> Build the next feature set: Forms Home, Create New Form, and the Form Builder with Short Text and Long Text question types only.
> Keep all implementation consistent with the existing architecture and visual language.
>
> **SCOPE FOR THIS ROUND**
> Implement the following screens and functionality:
>
> **1. Forms Home (/home)**
> *   List all forms of the authenticated user.
> *   Each form as a glass-style card showing: Form title, Last updated, Action: “Open Builder” → `/builder/:formId`.
> *   A “Create New Form” button that routes to `/forms/new`.
> *   Basic search bar (UI only, no real filtering required).
>
> **2. Create New Form (/forms/new)**
> *   Simple page/panel asking only for Form Name.
> *   On submit: Create the form, Redirect directly to `/builder/:formId`.
>
> **3. Form Builder (/builder/:formId)**
> Implement the core builder shell with basic question support:
> *   **Layout**: Left: question type palette, Center: canvas with list of questions, Right: properties panel, Top bar with form title, save status, preview/share placeholders.
> *   **Question Types (only these two)**: Short Text, Long Text.
> *   **Functionality**: Add new question (via palette), Edit question label in properties panel, Reorder questions (simple drag/drop or equivalent), Persist questions + order, Update form name via top bar, Load existing form + questions on entry.
>
> I attached some reference images.

## Fixes
- **Home Page Layout**: The Home page is not equal to our reference image - please fix it.
- **Remove Stats**: Drop the stats, I don't want them.
- **Navbar**: Also, in the navbar, we only have the home screen for now. However, add a traditional bottom button for account setting, signout etc.
- **Search & Filter**: Also, make sure the search filter and sort works.
- **Logo**: Add a cool logo/symbol at the top of the navbar.
- **Performance**: On the form builder, when changing the question text - things are very choppy. I think the save functionality is triggering at every change. Please review this and use best practices auto save.
- **Drag & Drop**: The drag and drop functionality doesn't work.
- **Drag Improvements**: It works, but is a bit wonky. When dragging, it follows really slow. Please improve, review and do best practices.
- **Live Reordering**: Could we change the order numbers live while we drag?
- **Optimistic Drop**: Finally, when dropping, the card flows back a very short time, before going to its new place in the order. Could we do a more optimistic approach so that we don't get this toggle vibe?
- **Drop Issue**: Now the order doesn't change at all after dropping?
- **Persistence**: Nice, now the UI is good, however, when refreshing the page, the old ordering is back - seems like its not sent to the server?
- **Persistence II**: It's still not persistent on page reload.
- **Cleanup**: Okay it worked, remove all console logs.
- **Card Layout**: Please improve upon the layout of the card, more like the reference image: Find a nice spot for the drag icon.
- **Compactness**: Now its way too large. Make it more compact, and less spacing. Also the delete button doesn't work anymore.
- **Ordering Symbol**: Better reduce the size of the ordering symbol a lot.
- **Delete Button**: The delete button still doesn't do anything when pressed.
- **Delete Confirmation**: It works now, but should have a small confirmation prompt.
- **Home Page Card**: Okay, on the home page I want to improve the form card a bit. Remove the top left icon, and make sure the form name and status is on the same row. Also the updated x minutes ago and number of responses are a bit too big and wraps, reduce the size. Also make the width of the card a bit wider.
- **Column Layout**: No, let's do the 3 column layout still.
- **Typography**: Bold the survey title, and add some more spacing under the title. Now finally, for the top navbar logo, use another color than purple as it is overused.
- **Delete Form**: Now, on the home page (and the ... buttons) add a delete button under that dropdown, with a confirmation.
