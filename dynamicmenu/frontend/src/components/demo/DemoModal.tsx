/**
 * Demo Modal Component
 * Full-screen modal/overlay for the interactive product tour
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Maximize2, Minimize2, Play, MousePointer,
  ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ProductTour, 
  type TourStep, 
  defaultTourSteps,
  DemoPreviewCard,
  TourTrigger 
} from './ProductTour';
import { SimulatedDashboard, DemoSuccessScreen } from './SimulatedDashboard';

// ============================================
// Types
// ============================================

export interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  steps?: TourStep[];
  className?: string;
}

export interface DemoSectionProps {
  onOpenDemo: () => void;
  className?: string;
}

// ============================================
// Demo Modal Component
// ============================================

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  steps = defaultTourSteps,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tourMode, setTourMode] = useState<'guided' | 'explore'>('guided');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback to CSS fullscreen
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleStepChange = (index: number, step: TourStep) => {
    setCurrentStepIndex(index);
    
    // Log for analytics
    console.log(`[Demo] Step ${index + 1}: ${step.id}`);
  };

  const handleComplete = () => {
    setShowSuccess(true);
    if (onComplete) {
      onComplete();
    }
    
    // Analytics
    console.log('[Demo] Tour completed');
  };

  const handleClose = () => {
    setShowSuccess(false);
    setCurrentStepIndex(0);
    setTourMode('guided');
    onClose();
  };

  const handleGetStarted = () => {
    // Navigate to registration
    window.location.href = '/register';
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        isFullscreen ? "bg-gray-900" : "bg-black/50 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Product Demo"
    >
      {/* Modal Container */}
      <div 
        className={cn(
          "bg-gray-50 flex flex-col transition-all duration-300",
          isFullscreen 
            ? "fixed inset-0 rounded-none" 
            : "w-[95vw] h-[90vh] max-w-7xl rounded-2xl shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Interactive Demo</h2>
              <p className="text-xs text-gray-500">
                {tourMode === 'guided' ? 'Guided Tour' : 'Explore Freely'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 mr-4">
              <button
                onClick={() => setTourMode('guided')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
                  tourMode === 'guided' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Play className="w-3.5 h-3.5" />
                Guided
              </button>
              <button
                onClick={() => setTourMode('explore')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
                  tourMode === 'explore' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <MousePointer className="w-3.5 h-3.5" />
                Explore
              </button>
            </div>

            {/* Progress - Desktop */}
            <div className="hidden md:flex items-center gap-1 mr-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => tourMode === 'explore' && setCurrentStepIndex(index)}
                  disabled={tourMode === 'guided'}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStepIndex 
                      ? "bg-orange-500 w-4" 
                      : index < currentStepIndex 
                        ? "bg-orange-300" 
                        : "bg-gray-300",
                    tourMode === 'explore' && "hover:bg-orange-400 cursor-pointer"
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows - Mobile */}
            <div className="flex items-center gap-1 md:hidden mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentStepIndex + 1}/{steps.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hidden sm:flex h-8 w-8"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              aria-label="Close demo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {showSuccess ? (
            <DemoSuccessScreen 
              onClose={handleClose}
              onGetStarted={handleGetStarted}
            />
          ) : (
            <div className="h-full p-4 md:p-6">
              <SimulatedDashboard 
                activeStep={currentStep?.id}
                className="h-full"
              />
            </div>
          )}

          {/* Product Tour Overlay */}
          {!showSuccess && (
            <ProductTour
              steps={steps}
              isOpen={true}
              onClose={handleClose}
              onComplete={handleComplete}
              onStepChange={handleStepChange}
              mode={tourMode}
              onModeChange={setTourMode}
            />
          )}
        </div>

        {/* Footer */}
        {!showSuccess && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs">←</kbd>
                <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs">→</kbd>
                <span>Navigate</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="bg-gray-100 px-2 py-0.5 rounded text-xs">ESC</kbd>
                <span>Close</span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500"
              >
                Skip Demo
              </Button>
              {currentStepIndex === steps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Finish
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNextStep}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Demo Section for Landing Page
// ============================================

export const DemoSection: React.FC<DemoSectionProps> = ({ onOpenDemo, className }) => {
  return (
    <section id="demo" className={cn("py-24 bg-gray-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Interactive Demo
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See DynamicMenu in Action
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Take a guided tour through our dashboard and see how easy it is to 
              create and manage your digital menu. No signup required.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Interactive dashboard walkthrough',
                'See real-time updates in action',
                'Explore QR code generation',
                'View analytics and insights',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <TourTrigger onClick={onOpenDemo} size="lg">
                Start Interactive Demo
              </TourTrigger>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open('/demo-menu', '_blank')}
              >
                View Sample Menu
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:pl-8">
            <DemoPreviewCard onClick={onOpenDemo} />
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// Exit Intent Modal
// ============================================

export const ExitIntentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}> = ({ isOpen, onClose, onStartDemo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-orange-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Want to see a demo before you go?
          </h3>
          
          <p className="text-gray-600 mb-6">
            Take a quick 2-minute interactive tour and see how DynamicMenu 
            can transform your restaurant's menu experience.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white w-full"
              onClick={() => {
                onStartDemo();
                onClose();
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Free Demo
            </Button>
            <Button 
              variant="ghost"
              onClick={onClose}
              className="text-gray-500"
            >
              No thanks, I'll sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Demo CTA Button (for use throughout the page)
// ============================================

export const DemoCTAButton: React.FC<{
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  showIcon?: boolean;
  children?: React.ReactNode;
}> = ({ 
  onClick, 
  variant = 'primary', 
  showIcon = true,
  children 
}) => {
  if (variant === 'text') {
    return (
      <button
        onClick={onClick}
        className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1 hover:underline"
      >
        {showIcon && <Play className="w-4 h-4" />}
        {children || 'See how it works'}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <Button
        variant="outline"
        onClick={onClick}
        className="border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        {showIcon && <Play className="w-4 h-4 mr-2" />}
        {children || 'Try Interactive Demo'}
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      className="bg-orange-500 hover:bg-orange-600 text-white"
    >
      {showIcon && <Play className="w-4 h-4 mr-2" />}
      {children || 'Start Demo'}
    </Button>
  );
};

export default DemoModal;
