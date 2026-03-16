/**
 * QR Preview Modal Component
 * 
 * Full-size QR preview with context previews (table tent, poster, window sticker)
 * and download/print options.
 */

import { useState, useCallback } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Package,
  FileImage,
  LayoutTemplate,
  Store,
  Square,
  ExternalLink,
  ChevronDown,
  FileArchive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QRCode, QRCodeDownloadUrls } from '@/types';
import { QRCodeSize } from '@/types';
import {
  downloadQRImage,
  getAllQRCodeSizes,
  getQRCodeDimensions,
  downloadQRCodeZip,
} from '@/services/qr.service';

interface QRPreviewModalProps {
  qrCode: QRCode | null;
  downloadUrls: QRCodeDownloadUrls | null;
  isOpen: boolean;
  onClose: () => void;
}

type PreviewContext = 'raw' | 'table-tent' | 'poster' | 'sticker';

const contextLabels: Record<PreviewContext, { label: string; icon: typeof Square; description: string }> = {
  raw: { label: 'QR Code', icon: Square, description: 'Clean QR code image' },
  'table-tent': { label: 'Table Tent', icon: LayoutTemplate, description: 'Folded card for tables' },
  poster: { label: 'Poster', icon: FileImage, description: 'A4/Letter size poster' },
  sticker: { label: 'Window Sticker', icon: Store, description: 'For windows or doors' },
};

export function QRPreviewModal({
  qrCode,
  downloadUrls,
  isOpen,
  onClose,
}: QRPreviewModalProps) {
  const [activeContext, setActiveContext] = useState<PreviewContext>('raw');
  const [selectedSize, setSelectedSize] = useState<QRCodeSize>(QRCodeSize.MEDIUM);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sizeOptions = getAllQRCodeSizes();
  const currentDimensions = getQRCodeDimensions(selectedSize);

  const handleCopyLink = useCallback(() => {
    if (qrCode?.redirectUrl) {
      navigator.clipboard.writeText(qrCode.redirectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [qrCode?.redirectUrl]);

  const handleDownload = useCallback(
    (size: QRCodeSize, format: 'png' | 'svg') => {
      if (!downloadUrls) return;

      const sizeKey = size.toLowerCase() as keyof QRCodeDownloadUrls;
      const urls = downloadUrls[sizeKey];
      const url = format === 'png' ? urls.png : urls.svg;

      if (url) {
        const filename = `${qrCode?.name || 'qr-code'}-${size.toLowerCase()}.${format}`;
        downloadQRImage(url, filename);
      }
    },
    [downloadUrls, qrCode?.name]
  );

  const handleDownloadZip = useCallback(async () => {
    if (!qrCode?.id) return;

    setIsDownloading(true);
    try {
      const blob = await downloadQRCodeZip(qrCode.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.name || 'qr-code'}-all-sizes.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [qrCode?.id, qrCode?.name]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const getPreviewImage = () => {
    if (!downloadUrls) return null;
    // Use medium size for preview
    return downloadUrls.medium.png;
  };

  const renderContextPreview = () => {
    const imageUrl = getPreviewImage();
    if (!imageUrl) return null;

    switch (activeContext) {
      case 'table-tent':
        return (
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
            <div className="text-center mb-4">
              <h4 className="font-bold text-gray-900">Scan for Menu</h4>
              <p className="text-sm text-gray-500">Point your camera at the code</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-100">
              <img
                src={imageUrl}
                alt="QR Code"
                className="w-full aspect-square object-contain"
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Powered by DynamicMenu
            </p>
          </div>
        );

      case 'poster':
        return (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Scan to Order
              </h3>
              <p className="text-gray-600">
                Enjoy contactless ordering with our digital menu
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-4 border-dashed border-gray-200">
              <img
                src={imageUrl}
                alt="QR Code"
                className="w-full aspect-square object-contain"
              />
            </div>
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-gray-500">
                1. Open your camera app
              </p>
              <p className="text-sm text-gray-500">
                2. Point at the QR code
              </p>
              <p className="text-sm text-gray-500">
                3. Tap the notification to view menu
              </p>
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              Powered by DynamicMenu
            </p>
          </div>
        );

      case 'sticker':
        return (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 max-w-xs mx-auto">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">We are Digital!</p>
                  <p className="text-xs text-gray-500">Scan for menu</p>
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border-2 border-gray-100">
                <img
                  src={imageUrl}
                  alt="QR Code"
                  className="w-full aspect-square object-contain"
                />
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                Powered by DynamicMenu
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <img
              src={imageUrl}
              alt="QR Code"
              className="w-full max-w-xs mx-auto object-contain"
            />
          </div>
        );
    }
  };

  if (!qrCode) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>QR Code Preview - {qrCode.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Left: Preview */}
          <div className="space-y-4">
            <Tabs
              value={activeContext}
              onValueChange={(v) => setActiveContext(v as PreviewContext)}
            >
              <TabsList className="grid grid-cols-4 w-full">
                {(Object.keys(contextLabels) as PreviewContext[]).map((context) => {
                  const { icon: Icon, label } = contextLabels[context];
                  return (
                    <TabsTrigger key={context} value={context} className="text-xs">
                      <Icon className="w-3 h-3 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {(Object.keys(contextLabels) as PreviewContext[]).map((context) => (
                <TabsContent key={context} value={context} className="mt-4">
                  <div className="bg-gray-100 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
                    {renderContextPreview()}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    {contextLabels[context].description}
                  </p>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Right: Actions */}
          <div className="space-y-6">
            {/* QR Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">QR Code Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{qrCode.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{qrCode.type}</span>
                </div>
                {qrCode.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Table:</span>
                    <span className="font-medium">#{qrCode.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Scans:</span>
                  <span className="font-medium">{qrCode.scanCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Download Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedSize === size.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p
                      className={`font-medium text-sm ${
                        selectedSize === size.value
                          ? 'text-orange-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {size.label}
                    </p>
                    <p className="text-xs text-gray-500">{size.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Actions</Label>

              {/* Download Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleDownload(selectedSize, 'png')}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Download PNG ({currentDimensions.width}px)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownload(selectedSize, 'svg')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Download SVG (Vector)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownloadZip}>
                    <Package className="w-4 h-4 mr-2" />
                    Download All Sizes (ZIP)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Print Button */}
              <Button variant="outline" className="w-full" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>

              {/* Copy Link */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Menu Link
                  </>
                )}
              </Button>
            </div>

            {/* Download Info */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <h5 className="font-medium text-blue-900 mb-1">Size Guide</h5>
              <ul className="text-blue-700 space-y-1">
                <li>• Small (256px): Email signatures, social media</li>
                <li>• Medium (512px): Websites, digital displays</li>
                <li>• Large (1024px): Posters, flyers</li>
                <li>• XL (2048px): Billboards, large prints</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Label component for the modal
function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
}

export default QRPreviewModal;
