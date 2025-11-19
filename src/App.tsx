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
import { ProtectedRoute } from "./shared/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.RESPONDENT} element={<RespondentPage />} />
          
          {/* Protected Routes */}
          <Route 
            path={ROUTES.HOME} 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.FORMS_HOME} 
            element={
              <ProtectedRoute>
                <FormsHomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.CREATE_FORM} 
            element={
              <ProtectedRoute>
                <CreateFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.BUILDER} 
            element={
              <ProtectedRoute>
                <FormBuilderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTES.RESPONSES_DASHBOARD} 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
