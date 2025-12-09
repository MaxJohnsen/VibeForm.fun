// API
export { workspacesApi } from './api/workspacesApi';
export type { Workspace, WorkspaceMember, WorkspaceWithRole, CreateWorkspaceData } from './api/workspacesApi';

// Hooks
export { useWorkspaces } from './hooks/useWorkspaces';

// Context
export { WorkspaceProvider, useWorkspaceContext } from './context/WorkspaceContext';

// Components
export { WorkspaceSwitcher } from './components/WorkspaceSwitcher';
export { CreateWorkspaceForm } from './components/CreateWorkspaceForm';
export { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';

// Pages
export { OnboardingPage } from './pages/OnboardingPage';
