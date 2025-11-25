import { useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';

interface SharePopoverProps {
  formId: string;
  formTitle: string;
  formStatus: 'draft' | 'active' | 'archived';
  children: React.ReactNode;
}

export const SharePopover = ({ formId, formTitle, formStatus, children }: SharePopoverProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
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
    // Use the high-resolution QR code for download
    const svg = document.getElementById('qr-code-svg-download');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas to high resolution (2048x2048)
      const size = 2048;
      canvas.width = size;
      canvas.height = size;
      
      // Add white background for better QR code scanning
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Add padding (8% on each side)
        const padding = size * 0.08;
        const qrSize = size - padding * 2;
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
      }
      
      // Export as high-quality PNG
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-background border-border z-50" 
        align="end"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside if it's on the trigger
          const target = e.target as HTMLElement;
          if (target.closest('[role="menuitem"]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-1">Share Form</h3>
            <p className="text-xs text-muted-foreground">
              Share this form with respondents
            </p>
          </div>

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
                <label className="text-xs font-medium text-muted-foreground">Form Link</label>
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
                {/* Hidden High-Res QR Code for download */}
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
      </PopoverContent>
    </Popover>
  );
};
