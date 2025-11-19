import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage, SignupPage } from "./features/auth";
import { FormsHomePage, CreateFormPage } from "./features/forms";
import { FormBuilderPage } from "./features/builder";
import { RespondentPage } from "./features/responses";
import { DashboardPage } from "./features/responses/pages/DashboardPage";
import { ROUTES } from "./shared/constants/routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME} element={<Index />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.FORMS_HOME} element={<FormsHomePage />} />
          <Route path={ROUTES.CREATE_FORM} element={<CreateFormPage />} />
          <Route path={ROUTES.BUILDER} element={<FormBuilderPage />} />
          <Route path={ROUTES.RESPONDENT} element={<RespondentPage />} />
          <Route path={ROUTES.RESPONSES_DASHBOARD} element={<DashboardPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
