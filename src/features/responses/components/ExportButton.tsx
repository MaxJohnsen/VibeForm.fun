import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { analyticsApi } from '../api/analyticsApi';
import { toast } from '@/hooks/use-toast';

interface ExportButtonProps {
  formId: string;
  formTitle: string;
}

export const ExportButton = ({ formId, formTitle }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const csvContent = await analyticsApi.exportToCSV(formId);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Your responses have been downloaded as CSV.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your responses.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="h-8 md:h-9 px-2 md:px-4"
    >
      <Download className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
    </Button>
  );
};
