/**
 * QR Designer Component
 * 
 * Interactive QR code design tool with color picker, frame styles,
 * and real-time preview updates.
 */

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Upload, Palette, Square, Circle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { QRDesignOptions } from '@/types';
import { QRFrameStyle } from '@/types';

interface QRDesignerProps {
  initialOptions?: QRDesignOptions;
  restaurantName: string;
  restaurantLogo?: string;
  onChange: (options: QRDesignOptions) => void;
  previewText?: string;
}

const colorPresets = [
  '#000000', // Black
  '#1F2937', // Gray 800
  '#DC2626', // Red
  '#EA580C', // Orange
  '#D97706', // Amber
  '#16A34A', // Green
  '#0891B2', // Cyan
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#DB2777', // Pink
];

const frameStyleOptions = [
  { value: QRFrameStyle.NONE, label: 'None', icon: Square, description: 'Clean, no frame' },
  { value: QRFrameStyle.ROUNDED, label: 'Rounded', icon: Circle, description: 'Soft rounded corners' },
  { value: QRFrameStyle.FANCY, label: 'Fancy', icon: Sparkles, description: 'Decorative double border' },
];

export function QRDesigner({
  initialOptions,
  restaurantName,
  restaurantLogo,
  onChange,
  previewText = 'https://dynamicmenu.app/demo',
}: QRDesignerProps) {
  const [options, setOptions] = useState<QRDesignOptions>(
    initialOptions || {
      color: '#000000',
      frameStyle: QRFrameStyle.NONE,
    }
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(restaurantLogo);

  // Generate preview
  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      const QRCode = await import('qrcode');
      const url = await QRCode.toDataURL(previewText, {
        width: 280,
        margin: 2,
        color: {
          dark: options.color,
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [options.color, previewText]);

  // Regenerate preview when options change
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  // Notify parent of changes
  useEffect(() => {
    onChange(options);
  }, [options, onChange]);

  const handleColorChange = (color: string) => {
    setOptions((prev) => ({ ...prev, color }));
  };

  const handleFrameStyleChange = (style: QRFrameStyle) => {
    setOptions((prev) => ({ ...prev, frameStyle: style }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setOptions((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setOptions({
      color: '#000000',
      frameStyle: QRFrameStyle.NONE,
    });
    setLogoPreview(restaurantLogo);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[320px]">
          <div className="relative">
            {/* QR Code Preview */}
            <div
              className={`bg-white p-4 shadow-lg ${
                options.frameStyle === QRFrameStyle.ROUNDED
                  ? 'rounded-2xl'
                  : options.frameStyle === QRFrameStyle.FANCY
                  ? 'rounded-2xl border-4 border-double'
                  : 'rounded-lg'
              }`}
              style={
                options.frameStyle === QRFrameStyle.FANCY
                  ? { borderColor: options.color }
                  : {}
              }
            >
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="QR Code Preview"
                    className="w-48 h-48 object-contain"
                    style={{ opacity: isGenerating ? 0.5 : 1 }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 animate-pulse rounded" />
                )}

                {/* Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-gray-100">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <span
                        className="text-xl font-bold"
                        style={{ color: options.color }}
                      >
                        {restaurantName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Watermark */}
              <p className="text-center text-xs text-gray-400 mt-3">
                Powered by DynamicMenu
              </p>
            </div>

            {/* Regenerate button */}
            <button
              onClick={generatePreview}
              disabled={isGenerating}
              className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  isGenerating ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Size indicators */}
        <div className="flex justify-center gap-2 text-xs text-gray-500">
          <span>Small: 256px</span>
          <span>•</span>
          <span>Medium: 512px</span>
          <span>•</span>
          <span>Large: 1024px</span>
          <span>•</span>
          <span>XL: 2048px</span>
        </div>
      </div>

      {/* Design Controls */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Design Options</h3>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            QR Code Color
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  options.color === color
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={options.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600 font-mono">
              {options.color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Frame Style */}
        <div className="space-y-3">
          <Label>Frame Style</Label>
          <div className="grid grid-cols-3 gap-3">
            {frameStyleOptions.map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.value}
                  onClick={() => handleFrameStyleChange(style.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    options.frameStyle === style.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${
                      options.frameStyle === style.value
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    }`}
                  />
                  <p
                    className={`font-medium text-sm ${
                      options.frameStyle === style.value
                        ? 'text-orange-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {style.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Center Logo (Optional)
          </Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-12 h-12 object-contain rounded"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {restaurantName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <Label
                htmlFor="logo-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image, 512x512px or larger
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRDesigner;
