/**
 * Product Tour Component
 * Interactive step-by-step guided tour with spotlight effect and tooltips
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, CheckCircle2, 
  Play, MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  showControls?: boolean;
}

export interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
  mode?: 'guided' | 'explore';
  onModeChange?: (mode: 'guided' | 'explore') => void;
  className?: string;
}

export interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
  position: { top: number; left: number };
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

// ============================================
// Default Tour Steps for DynamicMenu
// ============================================

export const defaultTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DynamicMenu',
    description: 'Let\'s take a quick tour of how you can create and manage beautiful QR menus for your restaurant. This will only take a couple of minutes.',
    targetSelector: '[data-tour="welcome"]',
    position: 'center',
    showControls: true,
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard Overview',
    description: 'This is your command center. View real-time stats like menu views, QR scans, and popular items at a glance. Quick actions help you get things done faster.',
    targetSelector: '[data-tour="dashboard-stats"]',
    position: 'bottom',
    showControls: true,
  },
  {
    id: 'menu-builder',
    title: 'Menu Builder',
    description: 'Organize your menu with drag-and-drop categories. Add items with images, descriptions, and prices. Toggle availability instantly when items sell out.',
    targetSelector: '[data-tour="menu-builder"]',
    position: 'right',
    showControls: true,
  },
  {
    id: 'qr-codes',
    title: 'QR Code Generator',
    description: 'Generate unlimited QR codes for tables, rooms, or takeout with one click. Download in PNG, SVG, or PDF formats. Customers scan and see your menu instantly.',
    targetSelector: '[data-tour="qr-codes"]',
    position: 'left',
    showControls: true,
  },
  {
    id: 'realtime',
    title: 'Real-time Updates',
    description: 'Toggle item availability in real-time. When an item sells out, simply turn it off - the change reflects immediately on all QR codes without reprinting.',
    targetSelector: '[data-tour="realtime-toggle"]',
    position: 'top',
    showControls: true,
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Track menu views, popular items, peak hours, and customer behavior. Make data-driven decisions to optimize your menu and increase sales.',
    targetSelector: '[data-tour="analytics"]',
    position: 'top',
    showControls: true,
  },
];

// ============================================
// Tour Tooltip Component
// ============================================

const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
  position,
  arrowPosition,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const getArrowClasses = () => {
    switch (arrowPosition) {
      case 'top':
        return '-top-2 left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white';
      case 'bottom':
        return '-bottom-2 left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white';
      case 'left':
        return '-left-2 top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white';
      case 'right':
        return '-right-2 top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white';
      default:
        return '';
    }
  };

  return (
    <div
      className="fixed z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ 
        top: position.top, 
        left: position.left,
        maxWidth: '380px',
        width: 'calc(100vw - 2rem)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour step ${currentStep + 1}: ${step.title}`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 relative">
        {/* Arrow */}
        <div 
          className={cn(
            "absolute w-0 h-0 border-8",
            getArrowClasses()
          )}
        />
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                // Allow clicking dots to jump to step
                if (index < currentStep) {
                  for (let i = currentStep; i > index; i--) onPrevious();
                } else if (index > currentStep) {
                  for (let i = currentStep; i < index; i++) onNext();
                }
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "bg-orange-500 w-6" 
                  : index < currentStep 
                    ? "bg-orange-300" 
                    : "bg-gray-200 hover:bg-gray-300"
              )}
              aria-label={`Go to step ${index + 1}`}
              aria-current={index === currentStep ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Step Counter */}
        <div className="text-center text-xs text-gray-400 mb-3">
          Step {currentStep + 1} of {totalSteps}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Action Hint */}
        {step.action && (
          <div className="flex items-center justify-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-4">
            <MousePointer className="w-3 h-3" />
            <span>{step.action}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </Button>
          
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
            )}
            
            {isLastStep ? (
              <Button
                size="sm"
                onClick={onFinish}
                className="bg-green-600 hover:bg-green-700 text-white gap-1 transition-transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onNext}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-1 transition-transform hover:scale-[1.02]"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Main Product Tour Component
// ============================================

export const ProductTour: React.FC<ProductTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  onStepChange,
  mode = 'guided',
  onModeChange,
  className,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const currentStep = steps[currentStepIndex];

  // Calculate tooltip and spotlight positions
  const calculatePositions = useCallback(() => {
    if (!currentStep) return;

    const { targetSelector, position = 'bottom' } = currentStep;
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement || position === 'center') {
      // Center the tooltip on screen
      const tooltipWidth = 380;
      const tooltipHeight = 300;
      setTooltipPosition({
        top: window.innerHeight / 2 - tooltipHeight / 2,
        left: window.innerWidth / 2 - tooltipWidth / 2,
      });
      setArrowPosition('bottom');
      setSpotlightRect(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 380;
    const tooltipHeight = 280;
    const padding = 16;
    const spotlightPadding = 8;

    // Set spotlight rect with padding
    setSpotlightRect({
      top: rect.top - spotlightPadding,
      left: rect.left - spotlightPadding,
      width: rect.width + spotlightPadding * 2,
      height: rect.height + spotlightPadding * 2,
      bottom: rect.bottom + spotlightPadding,
      right: rect.right + spotlightPadding,
      x: rect.x - spotlightPadding,
      y: rect.y - spotlightPadding,
      toJSON: () => {},
    });

    // Calculate tooltip position based on specified position
    let top = 0;
    let left = 0;
    let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = 'bottom';
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = 'top';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        arrow = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        arrow = 'left';
        break;
    }

    // Boundary checks
    const margin = 16;
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));

    setTooltipPosition({ top, left });
    setArrowPosition(arrow);
  }, [currentStep]);

  // Recalculate positions on step change, resize, and scroll
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow DOM to settle
    const timeoutId = setTimeout(calculatePositions, 100);

    const handleResize = () => calculatePositions();
    const handleScroll = () => calculatePositions();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    // Observe target element for size changes
    if (currentStep) {
      const targetElement = document.querySelector(currentStep.targetSelector);
      if (targetElement && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(calculatePositions);
        resizeObserverRef.current.observe(targetElement);
      }
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      resizeObserverRef.current?.disconnect();
    };
  }, [isOpen, currentStep, calculatePositions]);

  // Notify parent of step changes
  useEffect(() => {
    if (isOpen && onStepChange && currentStep) {
      onStepChange(currentStepIndex, currentStep);
    }
  }, [currentStepIndex, isOpen, currentStep, onStepChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePrevious();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  // Analytics tracking - log tour completion
  const logAnalytics = useCallback((event: string, data?: Record<string, unknown>) => {
    // In a real app, this would send to your analytics service
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, data);
    }
    console.log(`[Tour Analytics] ${event}`, data);
  }, []);

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevious = () => {
    if (isTransitioning || currentStepIndex === 0) return;
    
    setIsTransitioning(true);
    setCurrentStepIndex(prev => prev - 1);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSkip = () => {
    logAnalytics('tour_skipped', { 
      step_index: currentStepIndex, 
      step_id: currentStep?.id,
      total_steps: steps.length 
    });
    onClose();
  };

  const handleFinish = () => {
    setCompleted(true);
    logAnalytics('tour_completed', { 
      total_steps: steps.length,
      mode 
    });
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const handleClose = () => {
    logAnalytics('tour_closed', { 
      step_index: currentStepIndex, 
      step_id: currentStep?.id,
      completed 
    });
    onClose();
  };

  // Reset state when tour opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setCompleted(false);
      logAnalytics('tour_started', { total_steps: steps.length });
    }
  }, [isOpen, steps.length, logAnalytics]);

  if (!isOpen || !currentStep) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("fixed inset-0 z-[90]", className)}
      aria-live="polite"
    >
      {/* Dark Overlay with Spotlight Cutout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top section */}
        <div 
          className="absolute left-0 right-0 bg-black/70 transition-all duration-300"
          style={{ 
            top: 0, 
            height: spotlightRect ? spotlightRect.top : '100%',
            opacity: mode === 'explore' ? 0 : 1,
          }}
        />
        
        {/* Middle section with cutout */}
        {spotlightRect && (
          <>
            <div 
              className="absolute bg-black/70 transition-all duration-300"
              style={{ 
                top: spotlightRect.top, 
                left: 0, 
                width: spotlightRect.left,
                height: spotlightRect.height,
                opacity: mode === 'explore' ? 0 : 1,
              }}
            />
            <div 
              className="absolute bg-black/70 transition-all duration-300"
              style={{ 
                top: spotlightRect.top, 
                left: spotlightRect.right, 
                right: 0,
                height: spotlightRect.height,
                opacity: mode === 'explore' ? 0 : 1,
              }}
            />
          </>
        )}
        
        {/* Bottom section */}
        <div 
          className="absolute left-0 right-0 bg-black/70 transition-all duration-300"
          style={{ 
            top: spotlightRect ? spotlightRect.bottom : 0, 
            bottom: 0,
            opacity: mode === 'explore' ? 0 : 1,
          }}
        />

        {/* Spotlight Border */}
        {spotlightRect && mode === 'guided' && (
          <div
            className="absolute border-2 border-orange-500 rounded-lg pointer-events-none animate-pulse"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
        )}
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-[110] flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 flex gap-1 shadow-lg">
          <button
            onClick={() => onModeChange?.('guided')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              mode === 'guided' 
                ? "bg-orange-500 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Play className="w-4 h-4 inline mr-1" />
            Guided
          </button>
          <button
            onClick={() => onModeChange?.('explore')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              mode === 'explore' 
                ? "bg-orange-500 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <MousePointer className="w-4 h-4 inline mr-1" />
            Explore
          </button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
          aria-label="Close tour"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 left-4 z-[110] hidden md:flex items-center gap-3 text-white/80 text-sm">
        <div className="flex items-center gap-1">
          <kbd className="bg-white/20 px-2 py-1 rounded text-xs">←</kbd>
          <kbd className="bg-white/20 px-2 py-1 rounded text-xs">→</kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="bg-white/20 px-2 py-1 rounded text-xs">ESC</kbd>
          <span>Close</span>
        </div>
      </div>

      {/* Tour Tooltip */}
      <TourTooltip
        step={currentStep}
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onFinish={handleFinish}
        position={tooltipPosition}
        arrowPosition={arrowPosition}
      />
    </div>
  );
};

// ============================================
// Tour Trigger Button Component
// ============================================

export interface TourTriggerProps {
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  onClick,
  variant = 'default',
  size = 'md',
  className,
  children,
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-all hover:scale-[1.02]";
  
  const variantClasses = {
    default: "bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25",
    outline: "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl",
    ghost: "text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg",
    inline: "text-orange-600 hover:underline",
  };

  const sizeClasses = {
    sm: "text-sm px-4 py-2",
    md: "text-base",
    lg: "text-lg px-8 py-4",
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, variantClasses.inline, className)}
      >
        <Play className="w-4 h-4" />
        {children || 'Start Interactive Demo'}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Play className="w-4 h-4" />
      {children || 'Try Interactive Demo'}
    </button>
  );
};

// ============================================
// Demo Preview Card Component
// ============================================

export interface DemoPreviewCardProps {
  onClick: () => void;
  className?: string;
}

export const DemoPreviewCard: React.FC<DemoPreviewCardProps> = ({
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-orange-300",
        "hover:shadow-xl transition-all duration-300 text-left w-full",
        className
      )}
    >
      {/* Preview Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
            {/* Mock Dashboard Preview */}
            <div className="h-full bg-white rounded-lg shadow-sm p-3 space-y-2">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 bg-gray-50 rounded" />
                <div className="h-16 bg-gray-50 rounded" />
              </div>
              <div className="h-20 bg-gray-50 rounded" />
            </div>
          </div>
        </div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
            <Play className="w-6 h-6 text-orange-500 ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
        Interactive Product Tour
      </h3>
      <p className="text-sm text-gray-600">
        See how DynamicMenu works with our guided walkthrough
      </p>

      {/* CTA */}
      <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
        Start Demo
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default ProductTour;
