import { useState } from 'react';
import { Users, Palette, Settings } from 'lucide-react';
import { AppSidebar } from '@/shared/ui/AppSidebar';
import { SettingsLayout, SettingsTab } from '@/shared/ui/SettingsLayout';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { MembersTab, BrandingTab, GeneralTab } from '../components/settings';

const TABS: SettingsTab[] = [
  { id: 'members', label: 'Members', icon: Users },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'general', label: 'General', icon: Settings },
];

export const WorkspaceSettingsPage = () => {
  const { activeWorkspace } = useWorkspaceContext();
  const [activeTab, setActiveTab] = useState('members');

  if (!activeWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dots flex">
      <AppSidebar />

      <div className="flex-1 ml-0 md:ml-16 flex flex-col pb-20 md:pb-0">
        <SettingsLayout
          title={activeWorkspace.name}
          subtitle="Workspace Settings"
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'members' && <MembersTab />}
          {activeTab === 'branding' && <BrandingTab />}
          {activeTab === 'general' && <GeneralTab />}
        </SettingsLayout>
      </div>
    </div>
  );
};
