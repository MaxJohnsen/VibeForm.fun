import { useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';

interface ShareDialogProps {
  formId: string;
  formTitle: string;
  formStatus: 'draft' | 'active' | 'archived';
  formSlug?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareDialog = ({ 
  formId, 
  formTitle, 
  formStatus,
  formSlug,
  open,
  onOpenChange
}: ShareDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = formSlug 
    ? `${window.location.origin}/f/${formSlug}`
    : `${window.location.origin}${ROUTES.getRespondentRoute(formId)}`;
  const idBasedUrl = `${window.location.origin}${ROUTES.getRespondentRoute(formId)}`;

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
    const svg = document.getElementById('qr-code-svg-download');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const size = 2048;
      canvas.width = size;
      canvas.height = size;
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        const padding = size * 0.08;
        const qrSize = size - padding * 2;
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
      }
      
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${formTitle.replace(/\s+/g, '-')}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: 'QR code downloaded',
        description: 'High-resolution QR code (2048×2048) saved',
      });
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {formStatus !== 'active' ? (
            <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <div className="font-semibold mb-1 text-xs">Form is {formStatus}</div>
                <p className="text-xs">Activate this form to enable sharing.</p>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Link Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {formSlug ? 'Custom Link' : 'Form Link'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-md text-xs break-all font-mono">
                    {shareUrl}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-8 w-8 shrink-0"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                {formSlug && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    <span className="font-medium">ID-based link:</span> {idBasedUrl}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              {/* QR Code Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">QR Code</label>
                <div className="flex justify-center p-4 bg-muted rounded-md">
                  <QRCodeSVG
                    id="qr-code-svg-popover"
                    value={shareUrl}
                    size={140}
                    level="H"
                    className="bg-white p-2 rounded"
                  />
                </div>
                <div className="sr-only">
                  <QRCodeSVG
                    id="qr-code-svg-download"
                    value={shareUrl}
                    size={2048}
                    level="H"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={handleDownloadQR}
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
