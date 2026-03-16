/**
 * Demo Components Index
 * Export all interactive product tour components
 */

// Product Tour
export { 
  ProductTour, 
  TourTrigger, 
  DemoPreviewCard,
  defaultTourSteps 
} from './ProductTour';

export type { 
  ProductTourProps, 
  TourStep, 
  TourTooltipProps,
  TourTriggerProps,
  DemoPreviewCardProps
} from './ProductTour';

// Simulated Dashboard
export { 
  SimulatedDashboard,
  DemoSuccessScreen 
} from './SimulatedDashboard';

export type { 
  SimulatedDashboardProps,
  MockMenuItem,
  MockQRCodes
} from './SimulatedDashboard';

// Demo Modal
export { 
  DemoModal, 
  DemoSection, 
  ExitIntentModal,
  DemoCTAButton 
} from './DemoModal';

export type { 
  DemoModalProps,
  DemoSectionProps 
} from './DemoModal';
