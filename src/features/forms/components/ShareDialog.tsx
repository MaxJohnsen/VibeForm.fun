import { useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';

interface ShareDialogProps {
  formId: string;
  formTitle: string;
  formStatus: 'draft' | 'active' | 'archived';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareDialog = ({ formId, formTitle, formStatus, open, onOpenChange }: ShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${ROUTES.getRespondentRoute(formId)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Form link has been copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${formTitle.replace(/\s+/g, '-')}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: 'QR code downloaded',
        description: 'The QR code has been saved to your device',
      });
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Share this form with respondents using the link or QR code
          </DialogDescription>
        </DialogHeader>

        {formStatus !== 'active' ? (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertDescription className="text-orange-800">
              <div className="font-semibold mb-1">Form is {formStatus}</div>
              <p className="text-sm">You need to activate this form before you can share it with respondents. Change the status to "Active" to enable sharing.</p>
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg text-sm break-all">
                {shareUrl}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(shareUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex justify-center p-6 bg-muted rounded-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={shareUrl}
                size={200}
                level="H"
                className="bg-white p-4 rounded-lg"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
